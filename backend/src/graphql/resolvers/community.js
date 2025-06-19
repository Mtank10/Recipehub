import { prisma } from "../../config/db.js";
import { GraphQLError } from "graphql";

export const communityResolvers = {
  Query: {
    getCommunityData: async () => {
      const stats = await getCommunityStats();
      const trendingRecipes = await getTrendingRecipes(5);
      const topChefs = await getTopChefs(10);
      const recentActivity = await getRecentActivity(20);
      
      return {
        stats,
        trendingRecipes,
        topChefs,
        recentActivity
      };
    },

    getTrendingRecipes: async (_, { limit = 10 }) => {
      return await getTrendingRecipes(limit);
    },

    getTopChefs: async (_, { limit = 10 }) => {
      return await getTopChefs(limit);
    },

    getRecentActivity: async (_, { limit = 20 }) => {
      return await getRecentActivity(limit);
    }
  }
};

async function getCommunityStats() {
  const totalUsers = await prisma.user.count();
  const totalRecipes = await prisma.recipe.count();
  const totalLikes = await prisma.recipeLike.count();
  const totalComments = await prisma.comment.count();
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const activeUsers = await prisma.user.count({
    where: {
      updatedAt: {
        gte: oneWeekAgo
      }
    }
  });
  
  const newUsersThisWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: oneWeekAgo
      }
    }
  });
  
  const recipesThisWeek = await prisma.recipe.count({
    where: {
      createdAt: {
        gte: oneWeekAgo
      }
    }
  });
  
  return {
    totalUsers,
    totalRecipes,
    totalLikes,
    totalComments,
    activeUsers,
    newUsersThisWeek,
    recipesThisWeek
  };
}

async function getTrendingRecipes(limit) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recipes = await prisma.recipe.findMany({
    include: {
      author: true,
      likes: {
        include: {
          user: true
        }
      },
      comments: {
        include: {
          user: true
        }
      },
      recipeViews: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit * 3 // Get more to calculate trending score
  });
  
  // Calculate trending score based on recent activity
  const trendingRecipes = recipes.map(recipe => {
    const recentLikes = recipe.likes.filter(like => 
      new Date(like.createdAt) >= oneWeekAgo
    ).length;
    
    const recentComments = recipe.comments.filter(comment => 
      new Date(comment.createdAt) >= oneWeekAgo
    ).length;
    
    const recentViews = recipe.recipeViews.filter(view => 
      new Date(view.viewedAt) >= oneWeekAgo
    ).length;
    
    const trendingScore = (recentLikes * 3) + (recentComments * 2) + (recentViews * 1);
    
    return {
      ...recipe,
      trendingScore,
      views: recipe.recipeViews
    };
  });
  
  return trendingRecipes
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
}

async function getTopChefs(limit) {
  const users = await prisma.user.findMany({
    include: {
      recipes: {
        include: {
          likes: true,
          ratings: true
        }
      },
      followers: true
    }
  });
  
  const topChefs = users.map(user => {
    const recipesCount = user.recipes.length;
    const followersCount = user.followers.length;
    const totalLikes = user.recipes.reduce((sum, recipe) => sum + recipe.likes.length, 0);
    
    const allRatings = user.recipes.flatMap(recipe => recipe.ratings);
    const avgRating = allRatings.length > 0 
      ? allRatings.reduce((sum, rating) => sum + rating.rating, 0) / allRatings.length 
      : 0;
    
    let badge = 'Home Cook';
    if (recipesCount >= 50 && avgRating >= 4.5) badge = 'Master Chef';
    else if (recipesCount >= 20 && avgRating >= 4.0) badge = 'Expert Chef';
    else if (recipesCount >= 10) badge = 'Experienced Cook';
    
    return {
      ...user,
      recipesCount,
      followersCount,
      totalLikes,
      avgRating,
      badge
    };
  });
  
  return topChefs
    .sort((a, b) => {
      const scoreA = (a.recipesCount * 2) + (a.followersCount * 3) + (a.totalLikes * 1) + (a.avgRating * 10);
      const scoreB = (b.recipesCount * 2) + (b.followersCount * 3) + (b.totalLikes * 1) + (b.avgRating * 10);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

async function getRecentActivity(limit) {
  const activities = [];
  
  // Recent recipes
  const recentRecipes = await prisma.recipe.findMany({
    include: {
      author: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  recentRecipes.forEach(recipe => {
    activities.push({
      id: `recipe_${recipe.id}`,
      type: 'RECIPE_CREATED',
      user: recipe.author,
      recipe,
      targetUser: null,
      content: `Created a new recipe: ${recipe.title}`,
      timestamp: recipe.createdAt
    });
  });
  
  // Recent likes
  const recentLikes = await prisma.recipeLike.findMany({
    include: {
      user: true,
      recipe: {
        include: {
          author: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  recentLikes.forEach(like => {
    activities.push({
      id: `like_${like.id}`,
      type: 'RECIPE_LIKED',
      user: like.user,
      recipe: like.recipe,
      targetUser: like.recipe.author,
      content: `Liked ${like.recipe.title}`,
      timestamp: like.createdAt
    });
  });
  
  // Recent comments
  const recentComments = await prisma.comment.findMany({
    include: {
      user: true,
      recipe: {
        include: {
          author: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  recentComments.forEach(comment => {
    activities.push({
      id: `comment_${comment.id}`,
      type: 'RECIPE_COMMENTED',
      user: comment.user,
      recipe: comment.recipe,
      targetUser: comment.recipe.author,
      content: `Commented on ${comment.recipe.title}`,
      timestamp: comment.createdAt
    });
  });
  
  // Recent follows
  const recentFollows = await prisma.userFollow.findMany({
    include: {
      follower: true,
      following: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  recentFollows.forEach(follow => {
    activities.push({
      id: `follow_${follow.id}`,
      type: 'USER_FOLLOWED',
      user: follow.follower,
      recipe: null,
      targetUser: follow.following,
      content: `Started following ${follow.following.name}`,
      timestamp: follow.createdAt
    });
  });
  
  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}
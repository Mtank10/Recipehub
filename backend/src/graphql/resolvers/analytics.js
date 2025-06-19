import { prisma } from "../../config/db.js";
import { GraphQLError } from "graphql";

export const analyticsResolvers = {
  Query: {
    getDetailedAnalytics: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const userId = context.user.id;
      
      // Get basic analytics
      const userAnalytics = await prisma.userAnalytics.findUnique({
        where: { userId }
      });
      
      if (!userAnalytics) {
        throw new GraphQLError("Analytics not found");
      }
      
      // Calculate weekly and monthly growth
      const weeklyGrowth = await calculateWeeklyGrowth(userId);
      const monthlyGrowth = await calculateMonthlyGrowth(userId);
      
      // Get top recipes
      const topRecipes = await prisma.recipe.findMany({
        where: { authorId: userId },
        include: {
          likes: true,
          comments: true,
          ratings: true,
          recipeViews: true,
          author: true,
          ingredients: true
        },
        orderBy: {
          likes: {
            _count: 'desc'
          }
        },
        take: 5
      });
      
      // Calculate engagement rate
      const totalInteractions = userAnalytics.totalRecipeViews + 
                               userAnalytics.recipesLiked + 
                               await prisma.comment.count({
                                 where: {
                                   recipe: { authorId: userId }
                                 }
                               });
      
      const engagementRate = userAnalytics.totalRecipeViews > 0 
        ? (totalInteractions / userAnalytics.totalRecipeViews) * 100 
        : 0;
      
      const totalComments = await prisma.comment.count({
        where: {
          recipe: { authorId: userId }
        }
      });
      
      const totalRatingsReceived = await prisma.rating.count({
        where: {
          recipe: { authorId: userId }
        }
      });
      
      return {
        ...userAnalytics,
        weeklyGrowth,
        monthlyGrowth,
        topRecipes,
        engagementRate,
        totalComments,
        totalRatingsReceived
      };
    },

    getRecipeAnalytics: async (_, { recipeId }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: {
          likes: true,
          comments: true,
          ratings: true,
          recipeViews: true
        }
      });
      
      if (!recipe || recipe.authorId !== context.user.id) {
        throw new GraphQLError("Recipe not found or unauthorized");
      }
      
      const views = recipe.recipeViews.length;
      const likes = recipe.likes.length;
      const comments = recipe.comments.length;
      const avgRating = recipe.ratings.length > 0 
        ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length 
        : 0;
      
      const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
      
      // Get daily stats for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const viewsByDay = await getDailyStats(recipeId, 'views', thirtyDaysAgo);
      const likesByDay = await getDailyStats(recipeId, 'likes', thirtyDaysAgo);
      
      return {
        id: `analytics_${recipeId}`,
        recipeId,
        views,
        likes,
        comments,
        shares: 0, // Implement sharing feature later
        avgRating,
        engagementRate,
        viewsByDay,
        likesByDay
      };
    },

    getAnalyticsOverview: async (_, { period }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const userId = context.user.id;
      let startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      const totalViews = await prisma.recipeView.count({
        where: {
          recipe: { authorId: userId },
          viewedAt: { gte: startDate }
        }
      });
      
      const totalLikes = await prisma.recipeLike.count({
        where: {
          recipe: { authorId: userId },
          createdAt: { gte: startDate }
        }
      });
      
      const totalComments = await prisma.comment.count({
        where: {
          recipe: { authorId: userId },
          createdAt: { gte: startDate }
        }
      });
      
      const totalFollowers = await prisma.userFollow.count({
        where: { followingId: userId }
      });
      
      // Calculate growth rate (simplified)
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setTime(previousPeriodStart.getTime() - (Date.now() - startDate.getTime()));
      
      const previousViews = await prisma.recipeView.count({
        where: {
          recipe: { authorId: userId },
          viewedAt: { gte: previousPeriodStart, lt: startDate }
        }
      });
      
      const growthRate = previousViews > 0 ? ((totalViews - previousViews) / previousViews) * 100 : 0;
      
      // Get top performing recipe
      const topPerformingRecipe = await prisma.recipe.findFirst({
        where: { 
          authorId: userId,
          createdAt: { gte: startDate }
        },
        include: {
          likes: true,
          recipeViews: true,
          author: true,
          ingredients: true
        },
        orderBy: {
          likes: {
            _count: 'desc'
          }
        }
      });
      
      // Generate chart data
      const chartData = await generateChartData(userId, startDate);
      
      return {
        totalViews,
        totalLikes,
        totalComments,
        totalFollowers,
        growthRate,
        topPerformingRecipe,
        chartData
      };
    }
  }
};

async function calculateWeeklyGrowth(userId) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recipesCreated = await prisma.recipe.count({
    where: {
      authorId: userId,
      createdAt: { gte: oneWeekAgo }
    }
  });
  
  const newFollowers = await prisma.userFollow.count({
    where: {
      followingId: userId,
      createdAt: { gte: oneWeekAgo }
    }
  });
  
  const totalViews = await prisma.recipeView.count({
    where: {
      recipe: { authorId: userId },
      viewedAt: { gte: oneWeekAgo }
    }
  });
  
  const totalLikes = await prisma.recipeLike.count({
    where: {
      recipe: { authorId: userId },
      createdAt: { gte: oneWeekAgo }
    }
  });
  
  const totalComments = await prisma.comment.count({
    where: {
      recipe: { authorId: userId },
      createdAt: { gte: oneWeekAgo }
    }
  });
  
  return {
    recipesCreated,
    newFollowers,
    totalViews,
    totalLikes,
    totalComments
  };
}

async function calculateMonthlyGrowth(userId) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const recipesCreated = await prisma.recipe.count({
    where: {
      authorId: userId,
      createdAt: { gte: oneMonthAgo }
    }
  });
  
  const newFollowers = await prisma.userFollow.count({
    where: {
      followingId: userId,
      createdAt: { gte: oneMonthAgo }
    }
  });
  
  const totalViews = await prisma.recipeView.count({
    where: {
      recipe: { authorId: userId },
      viewedAt: { gte: oneMonthAgo }
    }
  });
  
  const totalLikes = await prisma.recipeLike.count({
    where: {
      recipe: { authorId: userId },
      createdAt: { gte: oneMonthAgo }
    }
  });
  
  const totalComments = await prisma.comment.count({
    where: {
      recipe: { authorId: userId },
      createdAt: { gte: oneMonthAgo }
    }
  });
  
  return {
    recipesCreated,
    newFollowers,
    totalViews,
    totalLikes,
    totalComments
  };
}

async function getDailyStats(recipeId, type, startDate) {
  const stats = [];
  const currentDate = new Date(startDate);
  const endDate = new Date();
  
  while (currentDate <= endDate) {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    let count = 0;
    
    if (type === 'views') {
      count = await prisma.recipeView.count({
        where: {
          recipeId,
          viewedAt: {
            gte: currentDate,
            lt: nextDay
          }
        }
      });
    } else if (type === 'likes') {
      count = await prisma.recipeLike.count({
        where: {
          recipeId,
          createdAt: {
            gte: currentDate,
            lt: nextDay
          }
        }
      });
    }
    
    stats.push({
      date: currentDate.toISOString().split('T')[0],
      count
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return stats;
}

async function generateChartData(userId, startDate) {
  const chartData = [];
  const currentDate = new Date(startDate);
  const endDate = new Date();
  
  while (currentDate <= endDate) {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const views = await prisma.recipeView.count({
      where: {
        recipe: { authorId: userId },
        viewedAt: {
          gte: currentDate,
          lt: nextDay
        }
      }
    });
    
    const likes = await prisma.recipeLike.count({
      where: {
        recipe: { authorId: userId },
        createdAt: {
          gte: currentDate,
          lt: nextDay
        }
      }
    });
    
    const comments = await prisma.comment.count({
      where: {
        recipe: { authorId: userId },
        createdAt: {
          gte: currentDate,
          lt: nextDay
        }
      }
    });
    
    chartData.push({
      date: currentDate.toISOString().split('T')[0],
      views,
      likes,
      comments
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return chartData;
}
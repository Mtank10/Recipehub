import { prisma } from "../../config/db.js";
import { GraphQLError } from "graphql";

export const dashboardResolvers = {
  Query: {
    getDashboardSummary: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const userId = context.user.id;
      
      // Get user analytics
      let userAnalytics = await prisma.userAnalytics.findUnique({
        where: { userId }
      });
      
      if (!userAnalytics) {
        userAnalytics = await prisma.userAnalytics.create({
          data: { userId }
        });
      }
      
      // Get recent activity (last 10 activities)
      const recentActivity = await getRecentActivity(userId);
      
      // Get weekly stats
      const weeklyStats = await getWeeklyStats(userId);
      
      // Get popular recipes from user
      const popularRecipes = await prisma.recipe.findMany({
        where: { authorId: userId },
        include: {
          author: true,
          likes: true,
          ratings: true,
          ingredients: true
        },
        orderBy: {
          likes: {
            _count: 'desc'
          }
        },
        take: 5
      });
      
      // Get upcoming meals
      const upcomingMeals = await prisma.mealPlanItem.findMany({
        where: {
          mealPlan: {
            userId,
            isActive: true
          }
        },
        include: {
          recipe: {
            include: {
              author: true,
              ingredients: true
            }
          }
        },
        orderBy: {
          dayOfWeek: 'asc'
        },
        take: 7
      });
      
      return {
        userAnalytics,
        recentActivity,
        weeklyStats,
        popularRecipes,
        upcomingMeals
      };
    },

    getUserAnalytics: async (_, { userId }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const targetUserId = userId || context.user.id;
      
      let analytics = await prisma.userAnalytics.findUnique({
        where: { userId: targetUserId }
      });
      
      if (!analytics) {
        analytics = await prisma.userAnalytics.create({
          data: { userId: targetUserId }
        });
      }
      
      return analytics;
    },

    getPlatformAnalytics: async (_, { startDate, endDate }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.platformAnalytics.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        orderBy: {
          date: 'asc'
        }
      });
    },

    getMealPlans: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.mealPlan.findMany({
        where: { userId: context.user.id },
        include: {
          items: {
            include: {
              recipe: {
                include: {
                  author: true,
                  ingredients: true
                }
              }
            }
          }
        },
        orderBy: {
          weekStartDate: 'desc'
        }
      });
    },

    getMealPlan: async (_, { id }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              recipe: {
                include: {
                  author: true,
                  ingredients: true
                }
              }
            }
          }
        }
      });
      
      if (!mealPlan || mealPlan.userId !== context.user.id) {
        throw new GraphQLError("Meal plan not found");
      }
      
      return mealPlan;
    },

    getMealPlanForWeek: async (_, { weekStartDate }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.mealPlan.findFirst({
        where: {
          userId: context.user.id,
          weekStartDate: new Date(weekStartDate)
        },
        include: {
          items: {
            include: {
              recipe: {
                include: {
                  author: true,
                  ingredients: true
                }
              }
            }
          }
        }
      });
    },

    getShoppingLists: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.shoppingList.findMany({
        where: { userId: context.user.id },
        include: {
          items: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    },

    getShoppingList: async (_, { id }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const shoppingList = await prisma.shoppingList.findUnique({
        where: { id },
        include: {
          items: true
        }
      });
      
      if (!shoppingList || shoppingList.userId !== context.user.id) {
        throw new GraphQLError("Shopping list not found");
      }
      
      return shoppingList;
    },

    generateShoppingListFromMealPlan: async (_, { mealPlanId }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: mealPlanId },
        include: {
          items: {
            include: {
              recipe: {
                include: {
                  ingredients: true
                }
              }
            }
          }
        }
      });
      
      if (!mealPlan || mealPlan.userId !== context.user.id) {
        throw new GraphQLError("Meal plan not found");
      }
      
      // Create shopping list
      const shoppingList = await prisma.shoppingList.create({
        data: {
          userId: context.user.id,
          mealPlanId,
          name: `Shopping List for ${mealPlan.name}`
        }
      });
      
      // Aggregate ingredients
      const ingredientMap = new Map();
      
      mealPlan.items.forEach(item => {
        item.recipe.ingredients.forEach(ingredient => {
          const key = ingredient.name.toLowerCase();
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key);
            existing.quantity += ` + ${ingredient.quantity}`;
          } else {
            ingredientMap.set(key, {
              name: ingredient.name,
              quantity: ingredient.quantity,
              category: categorizeIngredient(ingredient.name)
            });
          }
        });
      });
      
      // Create shopping list items
      const items = await Promise.all(
        Array.from(ingredientMap.values()).map(ingredient =>
          prisma.shoppingListItem.create({
            data: {
              shoppingListId: shoppingList.id,
              ingredientName: ingredient.name,
              quantity: ingredient.quantity,
              category: ingredient.category
            }
          })
        )
      );
      
      return {
        ...shoppingList,
        items
      };
    },

    getUserPreferences: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      let preferences = await prisma.userPreferences.findUnique({
        where: { userId: context.user.id }
      });
      
      if (!preferences) {
        preferences = await prisma.userPreferences.create({
          data: { userId: context.user.id }
        });
      }
      
      return preferences;
    },

    getRecommendedRecipes: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: context.user.id }
      });
      
      const where = {};
      
      if (preferences) {
        if (preferences.maxCookingTime) {
          where.cookingTime = { lte: preferences.maxCookingTime };
        }
        
        if (preferences.favoriteCuisines.length > 0) {
          where.OR = preferences.favoriteCuisines.map(cuisine => ({
            tags: { has: cuisine }
          }));
        }
      }
      
      return await prisma.recipe.findMany({
        where,
        include: {
          author: true,
          ingredients: true,
          likes: true,
          ratings: true
        },
        orderBy: {
          likes: {
            _count: 'desc'
          }
        },
        take: 10
      });
    }
  },

  Mutation: {
    trackRecipeView: async (_, { recipeId }, context) => {
      await prisma.recipeView.create({
        data: {
          recipeId,
          userId: context.user?.id,
          ipAddress: context.req?.ip,
          userAgent: context.req?.get('User-Agent')
        }
      });
      
      return true;
    },

    updateUserAnalytics: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const userId = context.user.id;
      
      // Calculate analytics
      const recipesCreated = await prisma.recipe.count({
        where: { authorId: userId }
      });
      
      const recipesLiked = await prisma.recipeLike.count({
        where: { userId }
      });
      
      const recipesBookmarked = await prisma.bookmark.count({
        where: { userId }
      });
      
      const followersCount = await prisma.userFollow.count({
        where: { followingId: userId }
      });
      
      const followingCount = await prisma.userFollow.count({
        where: { followerId: userId }
      });
      
      const totalRecipeViews = await prisma.recipeView.count({
        where: {
          recipe: { authorId: userId }
        }
      });
      
      const ratings = await prisma.rating.findMany({
        where: {
          recipe: { authorId: userId }
        }
      });
      
      const avgRecipeRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;
      
      return await prisma.userAnalytics.upsert({
        where: { userId },
        update: {
          recipesCreated,
          recipesLiked,
          recipesBookmarked,
          followersCount,
          followingCount,
          totalRecipeViews,
          avgRecipeRating,
          lastActive: new Date(),
          updatedAt: new Date()
        },
        create: {
          userId,
          recipesCreated,
          recipesLiked,
          recipesBookmarked,
          followersCount,
          followingCount,
          totalRecipeViews,
          avgRecipeRating
        }
      });
    },

    createMealPlan: async (_, { input }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.mealPlan.create({
        data: {
          ...input,
          userId: context.user.id,
          weekStartDate: new Date(input.weekStartDate)
        },
        include: {
          items: {
            include: {
              recipe: {
                include: {
                  author: true,
                  ingredients: true
                }
              }
            }
          }
        }
      });
    },

    addMealPlanItem: async (_, { mealPlanId, input }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: mealPlanId }
      });
      
      if (!mealPlan || mealPlan.userId !== context.user.id) {
        throw new GraphQLError("Meal plan not found");
      }
      
      return await prisma.mealPlanItem.create({
        data: {
          ...input,
          mealPlanId
        },
        include: {
          recipe: {
            include: {
              author: true,
              ingredients: true
            }
          }
        }
      });
    },

    createShoppingList: async (_, { input }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.shoppingList.create({
        data: {
          ...input,
          userId: context.user.id
        },
        include: {
          items: true
        }
      });
    },

    addShoppingListItem: async (_, { shoppingListId, input }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const shoppingList = await prisma.shoppingList.findUnique({
        where: { id: shoppingListId }
      });
      
      if (!shoppingList || shoppingList.userId !== context.user.id) {
        throw new GraphQLError("Shopping list not found");
      }
      
      return await prisma.shoppingListItem.create({
        data: {
          ...input,
          shoppingListId
        }
      });
    },

    updateShoppingListItem: async (_, { id, isPurchased, notes }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const item = await prisma.shoppingListItem.findUnique({
        where: { id },
        include: {
          shoppingList: true
        }
      });
      
      if (!item || item.shoppingList.userId !== context.user.id) {
        throw new GraphQLError("Shopping list item not found");
      }
      
      return await prisma.shoppingListItem.update({
        where: { id },
        data: {
          ...(isPurchased !== undefined && { isPurchased }),
          ...(notes !== undefined && { notes })
        }
      });
    },

    updateUserPreferences: async (_, { input }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.userPreferences.upsert({
        where: { userId: context.user.id },
        update: {
          ...input,
          updatedAt: new Date()
        },
        create: {
          ...input,
          userId: context.user.id
        }
      });
    }
  }
};

// Helper functions
async function getRecentActivity(userId) {
  const activities = [];
  
  // Recent recipes
  const recentRecipes = await prisma.recipe.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  recentRecipes.forEach(recipe => {
    activities.push({
      id: recipe.id,
      type: 'recipe_created',
      description: `Created recipe: ${recipe.title}`,
      timestamp: recipe.createdAt,
      relatedId: recipe.id
    });
  });
  
  // Recent likes received
  const recentLikes = await prisma.recipeLike.findMany({
    where: {
      recipe: { authorId: userId }
    },
    include: {
      user: true,
      recipe: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  recentLikes.forEach(like => {
    activities.push({
      id: like.id,
      type: 'like_received',
      description: `${like.user.name} liked your recipe: ${like.recipe.title}`,
      timestamp: like.createdAt,
      relatedId: like.recipe.id
    });
  });
  
  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
}

async function getWeeklyStats(userId) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recipesCreated = await prisma.recipe.count({
    where: {
      authorId: userId,
      createdAt: { gte: oneWeekAgo }
    }
  });
  
  const recipesViewed = await prisma.recipeView.count({
    where: {
      recipe: { authorId: userId },
      viewedAt: { gte: oneWeekAgo }
    }
  });
  
  const likesReceived = await prisma.recipeLike.count({
    where: {
      recipe: { authorId: userId },
      createdAt: { gte: oneWeekAgo }
    }
  });
  
  const commentsReceived = await prisma.comment.count({
    where: {
      recipe: { authorId: userId },
      createdAt: { gte: oneWeekAgo }
    }
  });
  
  const newFollowers = await prisma.userFollow.count({
    where: {
      followingId: userId,
      createdAt: { gte: oneWeekAgo }
    }
  });
  
  return {
    recipesCreated,
    recipesViewed,
    likesReceived,
    commentsReceived,
    newFollowers
  };
}

function categorizeIngredient(ingredientName) {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('meat') || name.includes('chicken') || name.includes('beef') || name.includes('pork')) {
    return 'meat';
  }
  if (name.includes('vegetable') || name.includes('carrot') || name.includes('onion') || name.includes('tomato')) {
    return 'vegetables';
  }
  if (name.includes('fruit') || name.includes('apple') || name.includes('banana') || name.includes('orange')) {
    return 'fruits';
  }
  if (name.includes('dairy') || name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) {
    return 'dairy';
  }
  if (name.includes('grain') || name.includes('rice') || name.includes('bread') || name.includes('pasta')) {
    return 'grains';
  }
  
  return 'other';
}
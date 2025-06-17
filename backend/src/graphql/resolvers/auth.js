import  jwt from "jsonwebtoken";
import { prisma } from "../../config/db.js";
import dotenv from "dotenv";
import { GraphQLError } from "graphql";
import cloudinary from "../../services/cloudinary.js";
import {PubSub} from "graphql-subscriptions";

const pubsub = new PubSub()

dotenv.config();

export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const authResolvers = {
  Query: {
    getCurrentUser: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
        
      return await prisma.user.findUnique({
        where: { id: context.user.id },
        include: {
          followers: {
            include: {
              follower: true
            }
          },
          following: {
            include: {
              following: true
            }
          },
          recipes: true,
          likedRecipes: {
            include: {
              recipe: true
            }
          }
        }
      });
    },
    getUserProfile: async (_, { id }) => {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          followers: {
            include: {
              follower: true
            }
          },
          following: {
            include: {
              following: true
            }
          },
          recipes: {
            include: {
              likes: true,
              ratings: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
    },
    
    
    protectedData: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      return "Protected Data";
    },
    recipe: async (_, { id }) => {
      const recipe = await prisma.recipe.findUnique({
       where: { id },
       include: { 
         author: true, 
         ingredients: true, 
         comments: {
           include: {
             user: true
           },
           orderBy: {
             createdAt: 'desc'
           }
         }, 
         likes: {
           include: {
             user: true
           }
         },
         bookmark: true, 
         ratings: {
           include: {
             user: true
           }
         }
       },
     });

     if (recipe) {
       // Count views
       const viewsCount = await prisma.recipeView.count({
         where: { recipeId: id }
       });
       recipe.viewsCount = viewsCount;
     }

     return recipe;
   },
   categories: async ()=>{
    const categories = await prisma.recipe.findMany({
      select:{
        category:true,
      },
      distinct:["category"],
    });
    console.log(categories)
    return categories.map((cat)=>cat.category);
  },
  recipes: async (_, { page = 1, limit = 10, category }) => {
    const offset = (page - 1) * limit;
    const where = category ? { category } : {};
    
    const recipes = await prisma.recipe.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        author: true,
        ingredients: true,
        comments: {
          include: {
            user: true
          }
        },
        likes: { 
          include: { 
            user: true 
          } 
        },
        ratings: {
          include: {
            user: true,
            recipe: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add view counts to recipes
    const recipesWithViews = await Promise.all(
      recipes.map(async (recipe) => {
        const viewsCount = await prisma.recipeView.count({
          where: { recipeId: recipe.id }
        });
        return { ...recipe, viewsCount };
      })
    );
  
    const total = await prisma.recipe.count({ where });
    return {
      recipes: recipesWithViews,
      totalPages: Math.ceil(total / limit),
    };
  },
    
  
  getComments: async (_, { recipeId }) => {
    return await prisma.comment.findMany({
      where: { recipeId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  },
  recipeRating: async (_, { id }) => {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: { 
        ratings: {
          include: {
            user: true
          }
        } 
      },
    });
    return recipe;
  },
  getBookmarkedRecipes: async (_, __, context) => {
    if (!context.user) throw new GraphQLError("Unauthorized");
    
    return await prisma.bookmark.findMany({
      where: { userId: context.user.id },
      include: {
        recipe: {
          include: {
            author: true,
            likes: {
              include: {
                user: true
              }
            },
            ratings: true
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },
  
  },
  Mutation: {
    googleLogin: async (_, { providerId, name, email, avatar }) => {
      let user = await prisma.user.findUnique({ where: { providerId } });

      if (!user) {
        user = await prisma.user.create({
          data: { name, email, avatar, provider: "GOOGLE", providerId },
        });
      }

      const token = generateToken(user);
      return { user, token };
    },
    logout: async (_, __, { req }) => {
      try {
        if (req.session) {
          req.session.destroy((err) => {
            if (err) throw new GraphQLError("Error logging out");
          });
        }
        return true;
      } catch (error) {
        throw new GraphQLError("Error logging out");
      }
    },
    createRecipe: async (_, args, context) => {
      if (!context.user) throw new GraphQLError('Not authenticated');
      
      const recipe = await prisma.recipe.create({
        data: {
          ...args,
          author: { connect: { id: context.user.id } },
          ingredients: { create: args.ingredients }
        },
        include: {
          author: true,
          ingredients: true,
          likes: true,
          ratings: true
        }
      });

      // Update user analytics
      await updateUserAnalytics(context.user.id);

      return recipe;
    },
    deleteRecipe: async (_, { id }, context) => {
      if (!context.user) throw new GraphQLError('Not authenticated');
      
      // Check if user owns the recipe
      const recipe = await prisma.recipe.findUnique({
        where: { id },
        select: { authorId: true }
      });
      
      if (!recipe) throw new GraphQLError('Recipe not found');
      if (recipe.authorId !== context.user.id) throw new GraphQLError('Not authorized to delete this recipe');
      
      // Delete related records first
      await prisma.ingredient.deleteMany({ where: { recipeId: id } });
      await prisma.comment.deleteMany({ where: { recipeId: id } });
      await prisma.recipeLike.deleteMany({ where: { recipeId: id } });
      await prisma.rating.deleteMany({ where: { recipeId: id } });
      await prisma.bookmark.deleteMany({ where: { recipeId: id } });
      await prisma.recipeView.deleteMany({ where: { recipeId: id } });
      
      // Delete the recipe
      await prisma.recipe.delete({ where: { id } });

      // Update user analytics
      await updateUserAnalytics(context.user.id);
      
      return true;
    },
     followUser: async (_, {  targetUserId },context) => {
      if (!context.user || !targetUserId) {
        throw new GraphQLError("Both userId and targetUserId are required.");
      }
    
      try {
        // Ensure the user isn't already following the target user
        const existingFollow = await prisma.userFollow.findUnique({
          where: {
            followerId_followingId: { followerId: context.user.id, followingId: targetUserId }
          }
        });
        
        if (existingFollow) {
          throw new GraphQLError("You are already following this user.");
        }
    
        // Create a new follow entry
        const newFollow = await prisma.userFollow.create({
          data: {
            followerId: context.user.id,
            followingId: targetUserId
          },
          include: {
            follower: true,
            following: true
          }
        });

        // Update analytics for both users
        await updateUserAnalytics(context.user.id);
        await updateUserAnalytics(targetUserId);
    
        return {
          id: newFollow.id,
          follower: newFollow.follower,
          following: newFollow.following,
          createdAt: newFollow.createdAt.toISOString()
        };
      } catch (error) {
        console.error("Error in followUser:", error);
        throw new GraphQLError("Failed to follow the user.");
      }
    },
     unfollowUser : async (_, {  targetUserId }, context) => {
      if (!context.user || !targetUserId) {
        throw new GraphQLError("Both userId and targetUserId are required.");
      }

      try {
        const existingFollow = await prisma.userFollow.findUnique({
          where: {
            followerId_followingId: { followerId: context.user.id, followingId: targetUserId }
          },
          include: {
            follower: true,
            following: true
          }
        });

        if (!existingFollow) {
          throw new GraphQLError("You are not following this user.");
        }

        await prisma.userFollow.delete({
          where: {
            followerId_followingId: { followerId: context.user.id, followingId: targetUserId }
          }
        });

        // Update analytics for both users
        await updateUserAnalytics(context.user.id);
        await updateUserAnalytics(targetUserId);
    
        return {
          id: existingFollow.id,
          follower: existingFollow.follower,
          following: existingFollow.following,
          createdAt: existingFollow.createdAt.toISOString()
        };
      } catch (error) {
        console.error("Error in unfollowUser:", error);
        throw new GraphQLError("Failed to unfollow the user.");
      }
    },
    addComment: async (_, { recipeId, content }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");

      const comment = await prisma.comment.create({ 
        data: { 
          recipeId, 
          content, 
          userId: context.user.id 
        },
        include: {
          user: true
        }
      });

      pubsub.publish("COMMENT_ADDED",{commentAdded:comment})

      return comment;
      
    },
    rateRecipe: async (_, { recipeId, rating }, context) => {
      if (!context.user) throw new GraphQLError("Not authenticated");
      
      const result = await prisma.rating.upsert({
        where: {
          userId_recipeId: {
            userId: context.user.id,
            recipeId: recipeId
          }
        },
        update: { rating },
        create: {
          rating,
          user: { connect: { id: context.user.id } },
          recipe: { connect: { id: recipeId } }
        },
        include: {
          user: true,
          recipe: true
        }
      });

      // Update analytics for recipe author
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        select: { authorId: true }
      });
      if (recipe) {
        await updateUserAnalytics(recipe.authorId);
      }

      return result;
    },
    likeRecipe: async (_, { recipeId }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const existingLike = await prisma.recipeLike.findFirst({
        where: {
          userId: context.user.id,
          recipeId
        }
      });

      if (existingLike) {
        throw new GraphQLError("Already liked");
      }

      const like = await prisma.recipeLike.create({
        data: {
          user: { connect: { id: context.user.id } },
          recipe: { connect: { id: recipeId } }
        },
        include: { 
          recipe: {
            include: {
              likes: {
                include: {
                  user: true
                }
              },
              author: true,
              ingredients: true,
              ratings: true
            }
          },
          user: true
        }
      });

      // Update analytics for both users
      await updateUserAnalytics(context.user.id);
      if (like.recipe.author) {
        await updateUserAnalytics(like.recipe.author.id);
      }

      return like;
    },

    unlikeRecipe: async (_, { recipeId }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");

      const like = await prisma.recipeLike.findFirst({
        where: {
          userId: context.user.id,
          recipeId
        },
        include: {
          user: true
        }
      });

      if (!like) {
        throw new GraphQLError("Not liked");
      }

      await prisma.recipeLike.delete({
        where: { id: like.id }
      });
      
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: { 
          likes: {
            include: {
              user: true
            }
          },
          author: true,
          ingredients: true,
          ratings: true
        }
      });

      // Update analytics for both users
      await updateUserAnalytics(context.user.id);
      if (recipe.author) {
        await updateUserAnalytics(recipe.author.id);
      }
      
      return { 
        id: like.id,
        user: like.user,
        recipe: recipe 
      };
    },

    bookmarkRecipe: async (_, { recipeId }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const bookmark = await prisma.bookmark.upsert({
        where: {
          userId_recipeId: {
            userId: context.user.id,
            recipeId
          }
        },
        create: {
          user: { connect: { id: context.user.id } },
          recipe: { connect: { id: recipeId } }
        },
        update: {},
        include: {
          recipe: {
            include: {
              author: true,
              likes: true,
              ratings: true
            }
          }
        }
      });

      // Update user analytics
      await updateUserAnalytics(context.user.id);

      return bookmark;
    },

    removeBookmark: async (_, { recipeId }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");

      const bookmark = await prisma.bookmark.delete({
        where: {
          userId_recipeId: {
            userId: context.user.id,
            recipeId
          }
        },
        include: {
          recipe: {
            include: {
              author: true,
              likes: true,
              ratings: true
            }
          }
        }
      });

      // Update user analytics
      await updateUserAnalytics(context.user.id);

      return bookmark;
    },
    
  },
  Subscription:{
    commentAdded:{
      subscribe:(_ ,{recipeId})=>pubsub.asyncIterableIterator(["COMMENT_ADDED"])
  },
  
 },
 
 // Add resolvers for nested fields
 User: {
   followers: async (parent) => {
     const follows = await prisma.userFollow.findMany({
       where: { followingId: parent.id },
       include: { follower: true }
     });
     return follows.map(follow => follow.follower);
   },
   following: async (parent) => {
     const follows = await prisma.userFollow.findMany({
       where: { followerId: parent.id },
       include: { following: true }
     });
     return follows.map(follow => follow.following);
   },
   analytics: async (parent) => {
     return await prisma.userAnalytics.findUnique({
       where: { userId: parent.id }
     });
   },
   preferences: async (parent) => {
     return await prisma.userPreferences.findUnique({
       where: { userId: parent.id }
     });
   },
   mealPlans: async (parent) => {
     return await prisma.mealPlan.findMany({
       where: { userId: parent.id },
       include: {
         items: {
           include: {
             recipe: true
           }
         }
       }
     });
   },
   shoppingLists: async (parent) => {
     return await prisma.shoppingList.findMany({
       where: { userId: parent.id },
       include: {
         items: true
       }
     });
   }
 },

 Recipe: {
   views: async (parent) => {
     return await prisma.recipeView.findMany({
       where: { recipeId: parent.id }
     });
   },
   viewsCount: async (parent) => {
     return await prisma.recipeView.count({
       where: { recipeId: parent.id }
     });
   }
 }
};

// Helper function to update user analytics
async function updateUserAnalytics(userId) {
  try {
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
    
    await prisma.userAnalytics.upsert({
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
  } catch (error) {
    console.error('Error updating user analytics:', error);
  }
}
import { prisma } from "../../config/db.js";
import { GraphQLError } from "graphql";

export const mealPlannerResolvers = {
  Query: {
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
          },
          shoppingLists: true
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
          },
          shoppingLists: {
            include: {
              items: true
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
    }
  },

  Mutation: {
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

    removeMealPlanItem: async (_, { id }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const item = await prisma.mealPlanItem.findUnique({
        where: { id },
        include: {
          mealPlan: true
        }
      });
      
      if (!item || item.mealPlan.userId !== context.user.id) {
        throw new GraphQLError("Meal plan item not found");
      }
      
      await prisma.mealPlanItem.delete({
        where: { id }
      });
      
      return true;
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

    markShoppingListCompleted: async (_, { id }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const shoppingList = await prisma.shoppingList.findUnique({
        where: { id }
      });
      
      if (!shoppingList || shoppingList.userId !== context.user.id) {
        throw new GraphQLError("Shopping list not found");
      }
      
      return await prisma.shoppingList.update({
        where: { id },
        data: { isCompleted: true },
        include: {
          items: true
        }
      });
    }
  }
};

function categorizeIngredient(ingredientName) {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('meat') || name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish')) {
    return 'meat';
  }
  if (name.includes('vegetable') || name.includes('carrot') || name.includes('onion') || name.includes('tomato') || name.includes('potato')) {
    return 'vegetables';
  }
  if (name.includes('fruit') || name.includes('apple') || name.includes('banana') || name.includes('orange')) {
    return 'fruits';
  }
  if (name.includes('dairy') || name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('paneer')) {
    return 'dairy';
  }
  if (name.includes('grain') || name.includes('rice') || name.includes('bread') || name.includes('pasta') || name.includes('flour')) {
    return 'grains';
  }
  if (name.includes('spice') || name.includes('salt') || name.includes('pepper') || name.includes('cumin') || name.includes('turmeric')) {
    return 'spices';
  }
  
  return 'other';
}
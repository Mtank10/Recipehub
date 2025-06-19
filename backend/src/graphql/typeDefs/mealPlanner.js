import { gql } from 'graphql-tag';

export const mealPlannerTypeDefs = gql`
  type MealPlan {
    id: ID!
    userId: String!
    name: String!
    weekStartDate: String!
    isActive: Boolean!
    items: [MealPlanItem!]!
    shoppingLists: [ShoppingList!]!
    createdAt: String!
    updatedAt: String!
  }

  type MealPlanItem {
    id: ID!
    mealPlanId: String!
    recipe: Recipe!
    dayOfWeek: Int!
    mealType: MealType!
    servings: Int!
    notes: String
    createdAt: String!
  }

  type ShoppingList {
    id: ID!
    userId: String!
    mealPlanId: String
    name: String!
    isCompleted: Boolean!
    items: [ShoppingListItem!]!
    createdAt: String!
    updatedAt: String!
  }

  type ShoppingListItem {
    id: ID!
    shoppingListId: String!
    ingredientName: String!
    quantity: String!
    unit: String
    category: String!
    isPurchased: Boolean!
    notes: String
    createdAt: String!
  }

  enum MealType {
    breakfast
    lunch
    dinner
    snack
  }

  input MealPlanInput {
    name: String!
    weekStartDate: String!
  }

  input MealPlanItemInput {
    recipeId: String!
    dayOfWeek: Int!
    mealType: MealType!
    servings: Int!
    notes: String
  }

  input ShoppingListInput {
    name: String!
    mealPlanId: String
  }

  input ShoppingListItemInput {
    ingredientName: String!
    quantity: String!
    unit: String
    category: String!
    notes: String
  }

  extend type Query {
    getMealPlans: [MealPlan!]!
    getMealPlan(id: ID!): MealPlan
    getMealPlanForWeek(weekStartDate: String!): MealPlan
    getShoppingLists: [ShoppingList!]!
    getShoppingList(id: ID!): ShoppingList
    generateShoppingListFromMealPlan(mealPlanId: ID!): ShoppingList!
  }

  extend type Mutation {
    createMealPlan(input: MealPlanInput!): MealPlan!
    updateMealPlan(id: ID!, input: MealPlanInput!): MealPlan!
    deleteMealPlan(id: ID!): Boolean!
    addMealPlanItem(mealPlanId: ID!, input: MealPlanItemInput!): MealPlanItem!
    updateMealPlanItem(id: ID!, input: MealPlanItemInput!): MealPlanItem!
    removeMealPlanItem(id: ID!): Boolean!
    createShoppingList(input: ShoppingListInput!): ShoppingList!
    updateShoppingList(id: ID!, input: ShoppingListInput!): ShoppingList!
    deleteShoppingList(id: ID!): Boolean!
    addShoppingListItem(shoppingListId: ID!, input: ShoppingListItemInput!): ShoppingListItem!
    updateShoppingListItem(id: ID!, isPurchased: Boolean, notes: String): ShoppingListItem!
    removeShoppingListItem(id: ID!): Boolean!
    markShoppingListCompleted(id: ID!): ShoppingList!
  }
`;
import { gql } from 'graphql-tag';

export const dashboardTypeDefs = gql`
  # Analytics Types
  type UserAnalytics {
    id: ID!
    userId: String!
    recipesCreated: Int!
    recipesLiked: Int!
    recipesBookmarked: Int!
    followersCount: Int!
    followingCount: Int!
    totalRecipeViews: Int!
    avgRecipeRating: Float!
    lastActive: String!
    createdAt: String!
    updatedAt: String!
  }

  type RecipeView {
    id: ID!
    recipeId: String!
    userId: String
    ipAddress: String
    userAgent: String
    viewedAt: String!
  }

  type PlatformAnalytics {
    id: ID!
    date: String!
    totalUsers: Int!
    newUsers: Int!
    activeUsers: Int!
    totalRecipes: Int!
    newRecipes: Int!
    totalViews: Int!
    totalLikes: Int!
    totalComments: Int!
  }


  # Content Moderation Types
  type ContentReport {
    id: ID!
    reporterId: String!
    reporter: User!
    contentType: String!
    contentId: String!
    reason: String!
    description: String
    status: String!
    moderatorId: String
    moderator: User
    moderatorNotes: String
    createdAt: String!
    updatedAt: String!
  }

  # User Preferences Types
  type UserPreferences {
    id: ID!
    userId: String!
    dietaryRestrictions: [String!]!
    favoriteCuisines: [String!]!
    cookingSkillLevel: String!
    preferredMealTypes: [String!]!
    maxCookingTime: Int!
    notificationsEnabled: Boolean!
    emailNotifications: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  # Dashboard Summary Types
  type DashboardSummary {
    userAnalytics: UserAnalytics
    recentActivity: [RecentActivity!]!
    weeklyStats: WeeklyStats!
    popularRecipes: [Recipe!]!
    # upcomingMeals: [MealPlanItem!]!
  }

  type RecentActivity {
    id: ID!
    type: String!
    description: String!
    timestamp: String!
    relatedId: String
  }

  type WeeklyStats {
    recipesCreated: Int!
    recipesViewed: Int!
    likesReceived: Int!
    commentsReceived: Int!
    newFollowers: Int!
  }

  # # Input Types
  # input MealPlanInput {
  #   name: String!
  #   weekStartDate: String!
  # }

  # input MealPlanItemInput {
  #   recipeId: String!
  #   dayOfWeek: Int!
  #   mealType: String!
  #   servings: Int!
  #   notes: String
  # }

  # input ShoppingListInput {
  #   name: String!
  #   mealPlanId: String
  # }

  # input ShoppingListItemInput {
  #   ingredientName: String!
  #   quantity: String!
  #   unit: String
  #   category: String!
  #   notes: String
  # }

  input ContentReportInput {
    contentType: String!
    contentId: String!
    reason: String!
    description: String
  }

  input UserPreferencesInput {
    dietaryRestrictions: [String!]
    favoriteCuisines: [String!]
    cookingSkillLevel: String
    preferredMealTypes: [String!]
    maxCookingTime: Int
    notificationsEnabled: Boolean
    emailNotifications: Boolean
  }

  # Queries
  extend type Query {
    # Dashboard
    getDashboardSummary: DashboardSummary!
    getUserAnalytics(userId: String): UserAnalytics
    getPlatformAnalytics(startDate: String!, endDate: String!): [PlatformAnalytics!]!
    
    # # Meal Planning
    # getMealPlans: [MealPlan!]!
    # getMealPlan(id: ID!): MealPlan
    # getMealPlanForWeek(weekStartDate: String!): MealPlan
    
    # # Shopping Lists
    # getShoppingLists: [ShoppingList!]!
    # getShoppingList(id: ID!): ShoppingList
    # generateShoppingListFromMealPlan(mealPlanId: ID!): ShoppingList!
    
    # Content Moderation
    getContentReports(status: String): [ContentReport!]!
    getMyReports: [ContentReport!]!
    
    # User Preferences
    getUserPreferences: UserPreferences
    getRecommendedRecipes: [Recipe!]!
  }

  # Mutations
  extend type Mutation {
    # Analytics
    trackRecipeView(recipeId: ID!): Boolean!
    updateUserAnalytics: UserAnalytics!
    
    # # Meal Planning
    # createMealPlan(input: MealPlanInput!): MealPlan!
    # updateMealPlan(id: ID!, input: MealPlanInput!): MealPlan!
    # deleteMealPlan(id: ID!): Boolean!
    # addMealPlanItem(mealPlanId: ID!, input: MealPlanItemInput!): MealPlanItem!
    # updateMealPlanItem(id: ID!, input: MealPlanItemInput!): MealPlanItem!
    # removeMealPlanItem(id: ID!): Boolean!
    
    # # Shopping Lists
    # createShoppingList(input: ShoppingListInput!): ShoppingList!
    # updateShoppingList(id: ID!, input: ShoppingListInput!): ShoppingList!
    # deleteShoppingList(id: ID!): Boolean!
    # addShoppingListItem(shoppingListId: ID!, input: ShoppingListItemInput!): ShoppingListItem!
    # updateShoppingListItem(id: ID!, isPurchased: Boolean, notes: String): ShoppingListItem!
    # removeShoppingListItem(id: ID!): Boolean!
    # markShoppingListCompleted(id: ID!): ShoppingList!
    
    # Content Moderation
    reportContent(input: ContentReportInput!): ContentReport!
    updateContentReport(id: ID!, status: String!, moderatorNotes: String): ContentReport!
    
    # User Preferences
    updateUserPreferences(input: UserPreferencesInput!): UserPreferences!
  }
`; 
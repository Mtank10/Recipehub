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
     
    # Content Moderation
    reportContent(input: ContentReportInput!): ContentReport!
    updateContentReport(id: ID!, status: String!, moderatorNotes: String): ContentReport!
    
    # User Preferences
    updateUserPreferences(input: UserPreferencesInput!): UserPreferences!
  }
`; 
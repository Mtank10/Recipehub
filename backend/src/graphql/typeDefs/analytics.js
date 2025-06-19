import { gql } from 'graphql-tag';

export const analyticsTypeDefs = gql`
  type DetailedAnalytics {
    id: ID!
    userId: String!
    recipesCreated: Int!
    recipesLiked: Int!
    recipesBookmarked: Int!
    followersCount: Int!
    followingCount: Int!
    totalRecipeViews: Int!
    avgRecipeRating: Float!
    totalComments: Int!
    totalRatingsReceived: Int!
    weeklyGrowth: WeeklyGrowth!
    monthlyGrowth: MonthlyGrowth!
    topRecipes: [Recipe!]!
    engagementRate: Float!
    lastActive: String!
  }

  type WeeklyGrowth {
    recipesCreated: Int!
    newFollowers: Int!
    totalViews: Int!
    totalLikes: Int!
    totalComments: Int!
  }

  type MonthlyGrowth {
    recipesCreated: Int!
    newFollowers: Int!
    totalViews: Int!
    totalLikes: Int!
    totalComments: Int!
  }

  type RecipeAnalytics {
    id: ID!
    recipeId: String!
    views: Int!
    likes: Int!
    comments: Int!
    shares: Int!
    avgRating: Float!
    engagementRate: Float!
    viewsByDay: [DayStats!]!
    likesByDay: [DayStats!]!
  }

  type DayStats {
    date: String!
    count: Int!
  }

  extend type Query {
    getDetailedAnalytics: DetailedAnalytics!
    getRecipeAnalytics(recipeId: ID!): RecipeAnalytics!
    getAnalyticsOverview(period: String!): AnalyticsOverview!
  }

  type AnalyticsOverview {
    totalViews: Int!
    totalLikes: Int!
    totalComments: Int!
    totalFollowers: Int!
    growthRate: Float!
    topPerformingRecipe: Recipe
    chartData: [ChartData!]!
  }

  type ChartData {
    date: String!
    views: Int!
    likes: Int!
    comments: Int!
  }
`;
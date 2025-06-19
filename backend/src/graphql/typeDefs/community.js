import { gql } from 'graphql-tag';

export const communityTypeDefs = gql`
  type CommunityStats {
    totalUsers: Int!
    totalRecipes: Int!
    totalLikes: Int!
    totalComments: Int!
    activeUsers: Int!
    newUsersThisWeek: Int!
    recipesThisWeek: Int!
  }

  type TrendingRecipe {
    id: ID!
    title: String!
    image: String!
    author: User!
    likes: [RecipeLike!]!
    views: [RecipeView!]!
    comments: [Comment!]!
    trendingScore: Float!
    createdAt: String!
  }

  type TopChef {
    id: ID!
    name: String!
    avatar: String
    recipesCount: Int!
    followersCount: Int!
    totalLikes: Int!
    avgRating: Float!
    badge: String!
  }

  type RecentActivity {
    id: ID!
    type: ActivityType!
    user: User!
    recipe: Recipe
    targetUser: User
    content: String
    timestamp: String!
  }

  enum ActivityType {
    RECIPE_CREATED
    RECIPE_LIKED
    RECIPE_COMMENTED
    USER_FOLLOWED
    RECIPE_RATED
  }

  type CommunityData {
    stats: CommunityStats!
    trendingRecipes: [TrendingRecipe!]!
    topChefs: [TopChef!]!
    recentActivity: [RecentActivity!]!
  }

  extend type Query {
    getCommunityData: CommunityData!
    getTrendingRecipes(limit: Int): [TrendingRecipe!]!
    getTopChefs(limit: Int): [TopChef!]!
    getRecentActivity(limit: Int): [RecentActivity!]!
  }
`;
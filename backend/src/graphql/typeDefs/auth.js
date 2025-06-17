import {gql} from 'graphql-tag';

export const authTypeDefs = gql`
    type User {
        id: ID!
        name: String!
        email: String!
        avatar: String
        provider: String!
        providerId: String!
        followers: [User]
        following: [User]
        likedRecipes: [RecipeLike]
        recipes: [Recipe]
        comments: [Comment]
        createdAt: String!
        updatedAt: String!
        bookmarks: [Recipe!]!
        ratings:[Rating]
    }
    
    type Recipe {
    id: ID!
    title:String!
    description:String!
    image:String!
    tags:[String]!
    cookingTime:Int!
    steps:[String]!
    ingredients:[Ingredient]!
    author:User!
    likes: [RecipeLike!]!
    likesCount:Int!
    category:String!
    comments:[Comment]!
    createdAt:String!
    updatedAt:String!
    bookmarks: [Bookmark!]!
    ratings:[Rating]! 
  } 
  type RecipeList {
  recipes: [Recipe]!
  totalPages: Int!
}

  type Bookmark {
  id: ID!
  user: User!
  recipe: Recipe!
  createdAt:String!
} 
  type Ingredient {
    id: ID!
    name:String!
    quantity:String!
  }

  type UserFollow {
    id: ID!
    follower: User!
    following: User!
    createdAt: String!
  }

  type RecipeLike {
    id:ID!
    user:User!
    recipe:Recipe!
    createdAt:String!
  }
  type Comment {
    id:ID!
    content:String!
    user:User!
    recipe:Recipe!
    createdAt:String!
    updatedAt:String!
  }
  type Rating {
    id:ID!
    rating:Int!
    user:User!
    recipe:Recipe!
  }
  type Mutation {
    createRecipe(title: String!, description: String!, image: String, tags: [String]!, cookingTime: Int!, steps: [String]!, category: String!, ingredients: [IngredientInput]!): Recipe!
    deleteRecipe(id: ID!): Boolean!
    likeRecipe(recipeId: ID!): RecipeLike!
    unlikeRecipe(recipeId: ID!): RecipeLike!
    followUser(targetUserId:ID!):UserFollow!
    unfollowUser(targetUserId:ID!):UserFollow!
    addComment(recipeId: ID!, content: String!): Comment!
    rateRecipe(recipeId:ID!,rating:Int!):Rating!
    bookmarkRecipe(recipeId: ID!): Bookmark!
    removeBookmark(recipeId: ID!): Bookmark!
  }

  input IngredientInput {
    name:String!
    quantity:String!
  }


    type AuthPayload {
        user: User!
        token: String!
    }
    type Query {
        protectedData:String
        recipes(page: Int!, limit: Int!,category:String): RecipeList!
        recipe(id: ID!): Recipe
        getCurrentUser: User!
        getUserProfile(id: ID!): User
        getComments(recipeId: ID!): [Comment!]!
        categories:[String!]!
        recipeRating(id: ID!): Recipe
        getBookmarkedRecipes: [Bookmark!]!

    }
    type Mutation {
        googleLogin(providerId: String!, name: String!, email: String!, avatar: String): AuthPayload!
        logout: Boolean!
    }
    type Subscription {
      commentAdded(recipeId:ID!):Comment!
    }
`;
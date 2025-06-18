import { gql } from 'graphql-tag';

export const culturalTypeDefs = gql`
  # Enums
  enum Religion {
    HINDU
    MUSLIM
    CHRISTIAN
    SIKH
    BUDDHIST
    JAIN
    JEWISH
    OTHER
    NONE
  }

  enum DietType {
    VEGETARIAN
    NON_VEGETARIAN
    VEGAN
    JAIN_VEGETARIAN
    HALAL
    KOSHER
    EGGETARIAN
  }

  enum CuisineType {
    NORTH_INDIAN
    SOUTH_INDIAN
    GUJARATI
    PUNJABI
    BENGALI
    MAHARASHTRIAN
    RAJASTHANI
    KERALA
    TAMIL
    ANDHRA
    KASHMIRI
    ASSAMESE
    CHINESE
    ITALIAN
    MEXICAN
    THAI
    JAPANESE
    CONTINENTAL
    MIDDLE_EASTERN
    MEDITERRANEAN
  }

  enum SpiceLevel {
    MILD
    MEDIUM
    SPICY
    VERY_SPICY
  }

  # Types
  type CulturalPreference {
    id: ID!
    userId: String!
    religion: Religion
    dietTypes: [DietType!]!
    preferredCuisines: [CuisineType!]!
    spiceLevel: SpiceLevel!
    avoidIngredients: [String!]!
    preferredIngredients: [String!]!
    culturalRestrictions: [String!]!
    festivalPreferences: [String!]!
    regionalPreferences: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type RecipeCulturalTag {
    id: ID!
    recipeId: String!
    cuisineType: CuisineType!
    dietTypes: [DietType!]!
    spiceLevel: SpiceLevel!
    religion: [Religion!]!
    region: String
    festival: String
    culturalSignificance: String
    createdAt: String!
  }

  type Location {
    id: ID!
    userId: String!
    latitude: Float
    longitude: Float
    country: String!
    state: String
    city: String
    pincode: String
    address: String
    isDefault: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type CulturalRecipeFilter {
    recipes: [Recipe!]!
    totalPages: Int!
    currentPage: Int!
    totalRecipes: Int!
  }

  type OnboardingData {
    countries: [Country!]!
    religions: [Religion!]!
    cuisineTypes: [CuisineType!]!
    dietTypes: [DietType!]!
    spiceLevels: [SpiceLevel!]!
  }

  type Country {
    code: String!
    name: String!
    states: [State!]!
  }

  type State {
    code: String!
    name: String!
    cities: [String!]!
  }

  # Input Types
  input CulturalPreferenceInput {
    religion: Religion
    dietTypes: [DietType!]!
    preferredCuisines: [CuisineType!]!
    spiceLevel: SpiceLevel
    avoidIngredients: [String!]
    preferredIngredients: [String!]
    culturalRestrictions: [String!]
    festivalPreferences: [String!]
    regionalPreferences: [String!]
  }

  input LocationInput {
    latitude: Float
    longitude: Float
    country: String!
    state: String
    city: String
    pincode: String
    address: String
    isDefault: Boolean
  }

  input RecipeCulturalTagInput {
    cuisineType: CuisineType!
    dietTypes: [DietType!]!
    spiceLevel: SpiceLevel
    religion: [Religion!]
    region: String
    festival: String
    culturalSignificance: String
  }

  input CulturalRecipeFilterInput {
    religion: Religion
    dietTypes: [DietType!]
    cuisineTypes: [CuisineType!]
    spiceLevel: SpiceLevel
    region: String
    festival: String
    avoidIngredients: [String!]
    page: Int
    limit: Int
  }

  input PhoneLoginInput {
    phone: String!
    otp: String!
    name: String
  }

  # Extend existing types
  extend type User {
    phone: String
    isOnboardingComplete: Boolean!
    country: String
    state: String
    city: String
    culturalPreference: CulturalPreference
    locations: [Location!]!
  }

  extend type Recipe {
    culturalTag: RecipeCulturalTag
  }

  # Queries
  extend type Query {
    getCulturalPreference: CulturalPreference
    getOnboardingData: OnboardingData!
    getCulturalRecipes(filter: CulturalRecipeFilterInput): CulturalRecipeFilter!
    getRecipesByCuisine(cuisineType: CuisineType!, page: Int, limit: Int): CulturalRecipeFilter!
    getRecipesByDiet(dietType: DietType!, page: Int, limit: Int): CulturalRecipeFilter!
    getRecipesByRegion(region: String!, page: Int, limit: Int): CulturalRecipeFilter!
    getFestivalRecipes(festival: String!, page: Int, limit: Int): CulturalRecipeFilter!
    getRecommendedCulturalRecipes: [Recipe!]!
    getUserLocations: [Location!]!
    searchRecipesByIngredients(ingredients: [String!]!, avoid: [String!]): [Recipe!]!
  }

  # Mutations
  extend type Mutation {
    # Phone authentication
    sendOTP(phone: String!): Boolean!
    verifyOTP(phone: String!, otp: String!): AuthPayload!
    
    # Onboarding
    completeOnboarding(
      culturalPreference: CulturalPreferenceInput!
      location: LocationInput!
    ): User!
    
    # Cultural preferences
    updateCulturalPreference(input: CulturalPreferenceInput!): CulturalPreference!
    
    # Location management
    addLocation(input: LocationInput!): Location!
    updateLocation(id: ID!, input: LocationInput!): Location!
    deleteLocation(id: ID!): Boolean!
    setDefaultLocation(id: ID!): Location!
    
    # Recipe cultural tagging
    addRecipeCulturalTag(recipeId: ID!, input: RecipeCulturalTagInput!): RecipeCulturalTag!
    updateRecipeCulturalTag(recipeId: ID!, input: RecipeCulturalTagInput!): RecipeCulturalTag!
    
    # Auto-detect location
    detectLocationFromIP: Location
  }
`;
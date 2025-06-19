import { prisma } from "../../config/db.js";
import { GraphQLError } from "graphql";
import { sendOTP, verifyOTP } from "../../services/twilioSms.js";
import { generateToken } from "../resolvers/auth.js";
// Mock data for countries and states (in production, use a proper API)
const COUNTRIES_DATA = {
  IN: {
    name: "India",
    states: {
      "AN": { name: "Andaman and Nicobar Islands", cities: ["Port Blair"] },
      "AP": { name: "Andhra Pradesh", cities: ["Hyderabad", "Visakhapatnam", "Vijayawada", "Guntur"] },
      "AR": { name: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun"] },
      "AS": { name: "Assam", cities: ["Guwahati", "Silchar", "Dibrugarh"] },
      "BR": { name: "Bihar", cities: ["Patna", "Gaya", "Bhagalpur"] },
      "CH": { name: "Chandigarh", cities: ["Chandigarh"] },
      "CT": { name: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Korba"] },
      "DN": { name: "Dadra and Nagar Haveli", cities: ["Silvassa"] },
      "DD": { name: "Daman and Diu", cities: ["Daman", "Diu"] },
      "DL": { name: "Delhi", cities: ["New Delhi", "Delhi"] },
      "GA": { name: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama"] },
      "GJ": { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
      "HR": { name: "Haryana", cities: ["Gurugram", "Faridabad", "Panipat"] },
      "HP": { name: "Himachal Pradesh", cities: ["Shimla", "Dharamshala", "Manali"] },
      "JK": { name: "Jammu and Kashmir", cities: ["Srinagar", "Jammu"] },
      "JH": { name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad"] },
      "KA": { name: "Karnataka", cities: ["Bangalore", "Mysore", "Hubli", "Mangalore"] },
      "KL": { name: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode"] },
      "LD": { name: "Lakshadweep", cities: ["Kavaratti"] },
      "MP": { name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior"] },
      "MH": { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik"] },
      "MN": { name: "Manipur", cities: ["Imphal"] },
      "ML": { name: "Meghalaya", cities: ["Shillong"] },
      "MZ": { name: "Mizoram", cities: ["Aizawl"] },
      "NL": { name: "Nagaland", cities: ["Kohima", "Dimapur"] },
      "OR": { name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela"] },
      "PY": { name: "Puducherry", cities: ["Puducherry", "Karaikal"] },
      "PB": { name: "Punjab", cities: ["Chandigarh", "Ludhiana", "Amritsar"] },
      "RJ": { name: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota"] },
      "SK": { name: "Sikkim", cities: ["Gangtok"] },
      "TN": { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai"] },
      "TG": { name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad"] },
      "TR": { name: "Tripura", cities: ["Agartala"] },
      "UP": { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Agra", "Varanasi"] },
      "UT": { name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Rishikesh"] },
      "WB": { name: "West Bengal", cities: ["Kolkata", "Howrah", "Durgapur"] }
    }
  },
  US: {
    name: "United States",
    states: {
      "CA": { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego"] },
      "NY": { name: "New York", cities: ["New York City", "Buffalo", "Albany"] },
      "TX": { name: "Texas", cities: ["Houston", "Dallas", "Austin"] }
    }
  }
};

// Cultural ingredient mappings
const CULTURAL_INGREDIENTS = {
  HINDU: {
    avoid: ["beef", "pork"],
    preferred: ["ghee", "paneer", "dal", "rice", "wheat"]
  },
  MUSLIM: {
    avoid: ["pork", "alcohol"],
    preferred: ["halal meat", "dates", "rice", "spices"]
  },
  JAIN: {
    avoid: ["onion", "garlic", "potato", "carrot", "radish", "beetroot"],
    preferred: ["jaggery", "dry fruits", "milk products"]
  },
  SIKH: {
    avoid: ["halal meat"],
    preferred: ["wheat", "dairy", "vegetables"]
  }
};

export const culturalResolvers = {
  Query: {
    getCulturalPreference: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.culturalPreference.findUnique({
        where: { userId: context.user.id }
      });
    },

    getOnboardingData: async () => {
      const countries = Object.entries(COUNTRIES_DATA).map(([code, data]) => ({
        code,
        name: data.name,
        states: Object.entries(data.states).map(([stateCode, stateData]) => ({
          code: stateCode,
          name: stateData.name,
          cities: stateData.cities
        }))
      }));

      return {
        countries,
        religions: Object.values(prisma.religion || ['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'BUDDHIST', 'JAIN', 'JEWISH', 'OTHER', 'NONE']),
        cuisineTypes: Object.values(prisma.cuisineType || ['NORTH_INDIAN', 'SOUTH_INDIAN', 'GUJARATI', 'PUNJABI', 'BENGALI']),
        dietTypes: Object.values(prisma.dietType || ['VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'JAIN_VEGETARIAN', 'HALAL', 'KOSHER']),
        spiceLevels: Object.values(prisma.spiceLevel || ['MILD', 'MEDIUM', 'SPICY', 'VERY_SPICY'])
      };
    },

    getCulturalRecipes: async (_, { filter = {} }) => {
      const {
        religion,
        dietTypes = [],
        cuisineTypes = [],
        spiceLevel,
        region,
        festival,
        avoidIngredients = [],
        page = 1,
        limit = 10
      } = filter;

      const offset = (page - 1) * limit;
      
      // Build where clause for cultural filtering
      const where = {
        AND: []
      };

      // Filter by cultural tags
      if (religion || dietTypes.length > 0 || cuisineTypes.length > 0 || spiceLevel || region || festival) {
        where.AND.push({
          culturalTag: {
            AND: [
              religion ? { religion: { has: religion } } : {},
              dietTypes.length > 0 ? { dietTypes: { hasSome: dietTypes } } : {},
              cuisineTypes.length > 0 ? { cuisineType: { in: cuisineTypes } } : {},
              spiceLevel ? { spiceLevel } : {},
              region ? { region: { contains: region, mode: 'insensitive' } } : {},
              festival ? { festival: { contains: festival, mode: 'insensitive' } } : {}
            ].filter(condition => Object.keys(condition).length > 0)
          }
        });
      }

      // Filter by avoided ingredients
      if (avoidIngredients.length > 0) {
        where.AND.push({
          ingredients: {
            none: {
              name: {
                in: avoidIngredients,
                mode: 'insensitive'
              }
            }
          }
        });
      }

      const recipes = await prisma.recipe.findMany({
        where: where.AND.length > 0 ? where : {},
        include: {
          author: true,
          ingredients: true,
          likes: true,
          ratings: true,
          culturalTag: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const totalRecipes = await prisma.recipe.count({
        where: where.AND.length > 0 ? where : {}
      });

      return {
        recipes,
        totalPages: Math.ceil(totalRecipes / limit),
        currentPage: page,
        totalRecipes
      };
    },

    getRecipesByCuisine: async (_, { cuisineType, page = 1, limit = 10 }) => {
      const offset = (page - 1) * limit;
      
      const recipes = await prisma.recipe.findMany({
        where: {
          culturalTag: {
            cuisineType
          }
        },
        include: {
          author: true,
          ingredients: true,
          likes: true,
          ratings: true,
          culturalTag: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const totalRecipes = await prisma.recipe.count({
        where: {
          culturalTag: {
            cuisineType
          }
        }
      });

      return {
        recipes,
        totalPages: Math.ceil(totalRecipes / limit),
        currentPage: page,
        totalRecipes
      };
    },

    getRecipesByDiet: async (_, { dietType, page = 1, limit = 10 }) => {
      const offset = (page - 1) * limit;
      
      const recipes = await prisma.recipe.findMany({
        where: {
          culturalTag: {
            dietTypes: {
              has: dietType
            }
          }
        },
        include: {
          author: true,
          ingredients: true,
          likes: true,
          ratings: true,
          culturalTag: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const totalRecipes = await prisma.recipe.count({
        where: {
          culturalTag: {
            dietTypes: {
              has: dietType
            }
          }
        }
      });

      return {
        recipes,
        totalPages: Math.ceil(totalRecipes / limit),
        currentPage: page,
        totalRecipes
      };
    },

    getRecommendedCulturalRecipes: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const userPreference = await prisma.culturalPreference.findUnique({
        where: { userId: context.user.id }
      });

      if (!userPreference) {
        // Return popular recipes if no preferences set
        return await prisma.recipe.findMany({
          include: {
            author: true,
            ingredients: true,
            likes: true,
            ratings: true,
            culturalTag: true
          },
          orderBy: {
            likes: {
              _count: 'desc'
            }
          },
          take: 10
        });
      }

      // Build recommendation query based on user preferences
      const where = {
        AND: []
      };

      if (userPreference.preferredCuisines.length > 0) {
        where.AND.push({
          culturalTag: {
            cuisineType: {
              in: userPreference.preferredCuisines
            }
          }
        });
      }

      if (userPreference.dietTypes.length > 0) {
        where.AND.push({
          culturalTag: {
            dietTypes: {
              hasSome: userPreference.dietTypes
            }
          }
        });
      }

      if (userPreference.religion) {
        where.AND.push({
          culturalTag: {
            religion: {
              has: userPreference.religion
            }
          }
        });
      }

      // Avoid ingredients user doesn't want
      if (userPreference.avoidIngredients.length > 0) {
        where.AND.push({
          ingredients: {
            none: {
              name: {
                in: userPreference.avoidIngredients,
                mode: 'insensitive'
              }
            }
          }
        });
      }

      return await prisma.recipe.findMany({
        where: where.AND.length > 0 ? where : {},
        include: {
          author: true,
          ingredients: true,
          likes: true,
          ratings: true,
          culturalTag: true
        },
        orderBy: [
          { likes: { _count: 'desc' } },
          { createdAt: 'desc' }
        ],
        take: 10
      });
    },

    getUserLocations: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.location.findMany({
        where: { userId: context.user.id },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    },

    searchRecipesByIngredients: async (_, { ingredients, avoid = [] }) => {
      const where = {
        AND: [
          {
            ingredients: {
              some: {
                name: {
                  in: ingredients,
                  mode: 'insensitive'
                }
              }
            }
          }
        ]
      };

      if (avoid.length > 0) {
        where.AND.push({
          ingredients: {
            none: {
              name: {
                in: avoid,
                mode: 'insensitive'
              }
            }
          }
        });
      }

      return await prisma.recipe.findMany({
        where,
        include: {
          author: true,
          ingredients: true,
          likes: true,
          ratings: true,
          culturalTag: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
    }
  },

  Mutation: {
   sendOTP: async (_, { phone }) => {
    return await sendOTP(phone);
  },

  verifyOTP: async (_, { phone, otp }, { prisma }) => {
    const isValid = verifyOTP(phone, otp);
    if (!isValid) {
      throw new GraphQLError('Invalid or expired OTP');
    }

    let user = await prisma.user.findFirst({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: `User_${phone.slice(-4)}`,
          email: `${phone}@temp.com`,
          provider: 'GOOGLE',
          providerId: phone,
          isOnboardingComplete: false,
        },
      });
    }

    const token = generateToken(user);
    return { user, token };
},

    completeOnboarding: async (_, { culturalPreference, location }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");

      // Create cultural preference
      await prisma.culturalPreference.upsert({
        where: { userId: context.user.id },
        update: culturalPreference,
        create: {
          ...culturalPreference,
          userId: context.user.id
        }
      });

      // Create location
      await prisma.location.create({
        data: {
          ...location,
          userId: context.user.id,
          isDefault: true
        }
      });

      // Update user onboarding status and location info
      const updatedUser = await prisma.user.update({
        where: { id: context.user.id },
        data: {
          isOnboardingComplete: true,
          country: location.country,
          state: location.state,
          city: location.city
        },
        include: {
          culturalPreference: true,
          locations: true
        }
      });

      return updatedUser;
    },

    updateCulturalPreference: async (_, { input }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");

      return await prisma.culturalPreference.upsert({
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
    },

    addLocation: async (_, { input }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");

      // If this is set as default, update other locations
      if (input.isDefault) {
        await prisma.location.updateMany({
          where: { userId: context.user.id },
          data: { isDefault: false }
        });
      }

      return await prisma.location.create({
        data: {
          ...input,
          userId: context.user.id
        }
      });
    },

    addRecipeCulturalTag: async (_, { recipeId, input }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");

      // Check if user owns the recipe
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        select: { authorId: true }
      });

      if (!recipe || recipe.authorId !== context.user.id) {
        throw new GraphQLError("Not authorized to tag this recipe");
      }

      return await prisma.recipeCulturalTag.upsert({
        where: { recipeId },
        update: input,
        create: {
          ...input,
          recipeId
        }
      });
    },

    detectLocationFromIP: async (_, __, context) => {
      // In production, use IP geolocation service
      const mockLocation = {
        country: "IN",
        state: "MH",
        city: "Mumbai",
        latitude: 19.0760,
        longitude: 72.8777
      };

      if (context.user) {
        return await prisma.location.create({
          data: {
            ...mockLocation,
            userId: context.user.id,
            isDefault: false
          }
        });
      }

      return mockLocation;
    }
  }
};


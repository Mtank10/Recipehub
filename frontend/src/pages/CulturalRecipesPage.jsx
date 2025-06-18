import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FaGlobe, 
  FaLeaf, 
  FaFire, 
  FaHeart, 
  FaClock, 
  FaFilter,
  FaSearch,
  FaTimes
} from 'react-icons/fa';

const GET_CULTURAL_RECIPES = gql`
  query GetCulturalRecipes($filter: CulturalRecipeFilterInput) {
    getCulturalRecipes(filter: $filter) {
      recipes {
        id
        title
        description
        image
        cookingTime
        category
        author {
          id
          name
          avatar
        }
        likes {
          id
        }
        ratings {
          rating
        }
        culturalTag {
          cuisineType
          dietTypes
          spiceLevel
          religion
          region
          festival
        }
      }
      totalPages
      currentPage
      totalRecipes
    }
  }
`;

const GET_USER_CULTURAL_PREFERENCE = gql`
  query GetCulturalPreference {
    getCulturalPreference {
      religion
      dietTypes
      preferredCuisines
      spiceLevel
      avoidIngredients
    }
  }
`;

const GET_RECOMMENDED_CULTURAL_RECIPES = gql`
  query GetRecommendedCulturalRecipes {
    getRecommendedCulturalRecipes {
      id
      title
      description
      image
      cookingTime
      category
      author {
        id
        name
        avatar
      }
      likes {
        id
      }
      ratings {
        rating
      }
      culturalTag {
        cuisineType
        dietTypes
        spiceLevel
        religion
        region
        festival
      }
    }
  }
`;

const CulturalRecipesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    religion: searchParams.get('religion') || '',
    dietTypes: searchParams.get('dietTypes')?.split(',').filter(Boolean) || [],
    cuisineTypes: searchParams.get('cuisineTypes')?.split(',').filter(Boolean) || [],
    spiceLevel: searchParams.get('spiceLevel') || '',
    region: searchParams.get('region') || '',
    festival: searchParams.get('festival') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  });

  const { data: recipesData, loading, refetch } = useQuery(GET_CULTURAL_RECIPES, {
    variables: { filter: filters },
    fetchPolicy: 'cache-and-network'
  });

  const { data: userPreferences } = useQuery(GET_USER_CULTURAL_PREFERENCE, {
    fetchPolicy: 'cache-and-network'
  });

  const { data: recommendedData } = useQuery(GET_RECOMMENDED_CULTURAL_RECIPES, {
    fetchPolicy: 'cache-and-network'
  });

  const cuisineTypes = [
    'NORTH_INDIAN', 'SOUTH_INDIAN', 'GUJARATI', 'PUNJABI', 'BENGALI',
    'MAHARASHTRIAN', 'RAJASTHANI', 'KERALA', 'TAMIL', 'ANDHRA',
    'CHINESE', 'ITALIAN', 'MEXICAN', 'THAI', 'JAPANESE'
  ];

  const dietTypes = [
    'VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'JAIN_VEGETARIAN', 
    'HALAL', 'KOSHER', 'EGGETARIAN'
  ];

  const religions = [
    'HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'BUDDHIST', 
    'JAIN', 'JEWISH', 'OTHER', 'NONE'
  ];

  const spiceLevels = ['MILD', 'MEDIUM', 'SPICY', 'VERY_SPICY'];

  const festivals = [
    'Diwali', 'Eid', 'Christmas', 'Holi', 'Dussehra', 'Karva Chauth',
    'Navratri', 'Ganesh Chaturthi', 'Onam', 'Pongal', 'Baisakhi'
  ];

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        params.set(key, Array.isArray(value) ? value.join(',') : value.toString());
      }
    });
    setSearchParams(params);
    refetch();
  }, [filters, setSearchParams, refetch]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value],
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      religion: '',
      dietTypes: [],
      cuisineTypes: [],
      spiceLevel: '',
      region: '',
      festival: '',
      page: 1,
      limit: 12
    });
  };

  const applyUserPreferences = () => {
    if (userPreferences?.getCulturalPreference) {
      const prefs = userPreferences.getCulturalPreference;
      setFilters(prev => ({
        ...prev,
        religion: prefs.religion || '',
        dietTypes: prefs.dietTypes || [],
        cuisineTypes: prefs.preferredCuisines || [],
        spiceLevel: prefs.spiceLevel || '',
        page: 1
      }));
    }
  };

  const getCuisineEmoji = (cuisine) => {
    const emojiMap = {
      'NORTH_INDIAN': '🇮🇳', 'SOUTH_INDIAN': '🇮🇳', 'GUJARATI': '🇮🇳',
      'PUNJABI': '🇮🇳', 'BENGALI': '🇮🇳', 'MAHARASHTRIAN': '🇮🇳',
      'CHINESE': '🇨🇳', 'ITALIAN': '🇮🇹', 'MEXICAN': '🇲🇽',
      'THAI': '🇹🇭', 'JAPANESE': '🇯🇵'
    };
    return emojiMap[cuisine] || '🍽️';
  };

  const getSpiceEmoji = (level) => {
    const emojiMap = {
      'MILD': '😊', 'MEDIUM': '😋', 'SPICY': '🌶️', 'VERY_SPICY': '🔥'
    };
    return emojiMap[level] || '🌶️';
  };

  const recipes = recipesData?.getCulturalRecipes?.recipes || [];
  const recommendedRecipes = recommendedData?.getRecommendedCulturalRecipes || [];
  const totalPages = recipesData?.getCulturalRecipes?.totalPages || 1;
  const totalRecipes = recipesData?.getCulturalRecipes?.totalRecipes || 0;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, var(--warm-yellow) 0%, var(--accent-orange) 100%)' }}>
              <FaGlobe className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--primary-green)' }}>
              Cultural Recipes
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover authentic recipes from different cultures, regions, and traditions
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="bg-white rounded-2xl card-shadow p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2"
              >
                <FaFilter />
                Filters
                {(filters.religion || filters.dietTypes.length > 0 || filters.cuisineTypes.length > 0) && (
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {[filters.religion, ...filters.dietTypes, ...filters.cuisineTypes].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              {userPreferences?.getCulturalPreference && (
                <button
                  onClick={applyUserPreferences}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaHeart />
                  My Preferences
                </button>
              )}
              
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-red-500 flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:border-red-300 transition-colors"
              >
                <FaTimes />
                Clear All
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {totalRecipes} recipes found
            </div>
          </div>
        </motion.div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            className="bg-white rounded-2xl card-shadow p-6 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Cuisine Types */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                  Cuisine Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cuisineTypes.map(cuisine => (
                    <button
                      key={cuisine}
                      onClick={() => toggleArrayFilter('cuisineTypes', cuisine)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        filters.cuisineTypes.includes(cuisine)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      {getCuisineEmoji(cuisine)} {cuisine.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet Types */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                  Dietary Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dietTypes.map(diet => (
                    <button
                      key={diet}
                      onClick={() => toggleArrayFilter('dietTypes', diet)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        filters.dietTypes.includes(diet)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      {diet === 'VEGETARIAN' && '🥬'}
                      {diet === 'NON_VEGETARIAN' && '🍖'}
                      {diet === 'VEGAN' && '🌱'}
                      {diet === 'JAIN_VEGETARIAN' && '🙏'}
                      {diet === 'HALAL' && '🥩'}
                      {diet === 'KOSHER' && '✡️'}
                      {diet === 'EGGETARIAN' && '🥚'}
                      {' '}{diet.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Religion */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                  Religious Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {religions.map(religion => (
                    <button
                      key={religion}
                      onClick={() => updateFilter('religion', filters.religion === religion ? '' : religion)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        filters.religion === religion
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                      }`}
                    >
                      {religion === 'HINDU' && '🕉️'}
                      {religion === 'MUSLIM' && '☪️'}
                      {religion === 'CHRISTIAN' && '✝️'}
                      {religion === 'SIKH' && '☬'}
                      {religion === 'BUDDHIST' && '☸️'}
                      {religion === 'JAIN' && '🤲'}
                      {religion === 'JEWISH' && '✡️'}
                      {(religion === 'OTHER' || religion === 'NONE') && '🤝'}
                      {' '}{religion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spice Level */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                  Spice Level
                </h3>
                <div className="flex flex-wrap gap-2">
                  {spiceLevels.map(level => (
                    <button
                      key={level}
                      onClick={() => updateFilter('spiceLevel', filters.spiceLevel === level ? '' : level)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        filters.spiceLevel === level
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                      }`}
                    >
                      {getSpiceEmoji(level)} {level.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Festival */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                  Festival Recipes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {festivals.map(festival => (
                    <button
                      key={festival}
                      onClick={() => updateFilter('festival', filters.festival === festival ? '' : festival)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        filters.festival === festival
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                      }`}
                    >
                      🎉 {festival}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommended Recipes */}
        {recommendedRecipes.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl card-shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--primary-green)' }}>
                <FaHeart className="text-red-500" />
                Recommended for You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedRecipes.slice(0, 4).map((recipe, index) => (
                  <RecipeCard key={recipe.id} recipe={recipe} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recipe Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="recipe-card">
                  <div className="skeleton h-48 w-full rounded-t-2xl"></div>
                  <div className="p-6">
                    <div className="skeleton h-6 w-3/4 mb-3"></div>
                    <div className="skeleton h-4 w-1/2 mb-4"></div>
                    <div className="skeleton h-10 w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {recipes.map((recipe, index) => (
                  <RecipeCard key={recipe.id} recipe={recipe} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => updateFilter('page', Math.max(filters.page - 1, 1))}
                    disabled={filters.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => updateFilter('page', pageNum)}
                          className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                            filters.page === pageNum 
                              ? 'bg-green-600 text-white shadow-lg' 
                              : 'bg-white text-green-600 border-2 border-green-200 hover:border-green-400'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => updateFilter('page', Math.min(filters.page + 1, totalPages))}
                    disabled={filters.page === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl card-shadow p-12 max-w-md mx-auto">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--dark-text)' }}>
                  No recipes found
                </h3>
                <p className="text-gray-600 mb-8">
                  Try adjusting your filters or explore different cuisines
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Recipe Card Component
const RecipeCard = ({ recipe, index }) => {
  const avgRating = recipe.ratings.length > 0
    ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length
    : 0;

  return (
    <motion.div
      className="recipe-card hover-lift group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Cultural Tags */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {recipe.culturalTag?.cuisineType && (
              <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold" 
                    style={{ color: 'var(--primary-green)' }}>
                {recipe.culturalTag.cuisineType.replace('_', ' ')}
              </span>
            )}
            {recipe.culturalTag?.spiceLevel && (
              <span className="bg-red-500/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-white">
                {recipe.culturalTag.spiceLevel === 'MILD' && '😊'}
                {recipe.culturalTag.spiceLevel === 'MEDIUM' && '😋'}
                {recipe.culturalTag.spiceLevel === 'SPICY' && '🌶️'}
                {recipe.culturalTag.spiceLevel === 'VERY_SPICY' && '🔥'}
              </span>
            )}
          </div>

          {/* Diet Type Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-1">
            {recipe.culturalTag?.dietTypes?.map(diet => (
              <span key={diet} className="bg-green-500/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-white">
                {diet === 'VEGETARIAN' && '🥬'}
                {diet === 'NON_VEGETARIAN' && '🍖'}
                {diet === 'VEGAN' && '🌱'}
                {diet === 'JAIN_VEGETARIAN' && '🙏'}
                {diet === 'HALAL' && '🥩'}
                {diet === 'KOSHER' && '✡️'}
                {diet === 'EGGETARIAN' && '🥚'}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-green-700 transition-colors duration-300" 
              style={{ color: 'var(--dark-text)' }}>
            {recipe.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {recipe.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaClock className="text-sm" style={{ color: 'var(--sage-green)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--dark-text)' }}>
                {recipe.cookingTime} mins
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FaHeart className="text-sm" style={{ color: 'var(--accent-orange)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--dark-text)' }}>
                {recipe.likes?.length || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img
                src={recipe.author.avatar || 'https://via.placeholder.com/32'}
                alt={recipe.author.name}
                className="w-6 h-6 rounded-full border-2 border-green-200"
              />
              <span className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                {recipe.author.name}
              </span>
            </div>

            {avgRating > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--sage-green)' }}>
                  {avgRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Cultural Info */}
          {recipe.culturalTag?.festival && (
            <div className="mb-4">
              <span className="text-xs px-2 py-1 rounded-full" 
                    style={{ background: 'var(--cream)', color: 'var(--primary-green)' }}>
                🎉 {recipe.culturalTag.festival}
              </span>
            </div>
          )}

          <button className="btn-secondary w-full group-hover:scale-105 transition-transform duration-300">
            View Recipe
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

export default CulturalRecipesPage;
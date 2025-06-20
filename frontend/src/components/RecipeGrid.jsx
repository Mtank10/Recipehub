import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useQuery, gql } from "@apollo/client";
import { FaHeart, FaClock, FaUser, FaEye } from "react-icons/fa";

const GET_RECIPES = gql`
  query GetRecipes($page: Int!, $limit: Int!, $category: String) {
    recipes(page: $page, limit: $limit, category: $category) {
      recipes {
        id
        title
        description
        image
        cookingTime
        category
        ratings {
          rating
        }
        author {
          id
          name
          avatar
        }
        likes {
          id
          user {
            id
            name
          }
        }
      }
      totalPages
    }
  }
`;

const RecipeGrid = ({ selectedCategory, searchQuery, recipes: passedRecipes }) => {
  const [page, setPage] = useState(1);
  const [allRecipes, setAllRecipes] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { loading, error, data, fetchMore } = useQuery(GET_RECIPES, {
    variables: { page: 1, limit: 12, category: selectedCategory },
    fetchPolicy: "cache-and-network",
    skip: !!passedRecipes,
    onCompleted: (data) => {
      if (data?.recipes?.recipes) {
        setAllRecipes(data.recipes.recipes);
        setHasMore(data.recipes.totalPages > 1);
        setPage(1);
      }
    }
  });

  const recipes = passedRecipes || allRecipes;
  const safeSearchQuery = searchQuery?.toString().toLowerCase() || '';
  
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(safeSearchQuery.toLowerCase())
  );

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      >= document.documentElement.offsetHeight - 1000 &&
      hasMore &&
      !isLoadingMore &&
      !passedRecipes
    ) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, passedRecipes]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const { data: newData } = await fetchMore({
        variables: {
          page: page + 1,
          limit: 12,
          category: selectedCategory
        }
      });

      if (newData?.recipes?.recipes) {
        setAllRecipes(prev => [...prev, ...newData.recipes.recipes]);
        setPage(prev => prev + 1);
        setHasMore(page + 1 < newData.recipes.totalPages);
      }
    } catch (error) {
      console.error('Error loading more recipes:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!passedRecipes) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, passedRecipes]);

  // Reset when category changes
  useEffect(() => {
    if (!passedRecipes) {
      setPage(1);
      setAllRecipes([]);
      setHasMore(true);
    }
  }, [selectedCategory, passedRecipes]);

  if (error) return <p className="text-red-500 text-center text-sm">Error: {error.message}</p>;
  
  return (
    <div className="flex flex-col items-center w-full px-2 md:px-4">
      {/* Recipe Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {!passedRecipes && loading && page === 1 ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="recipe-card h-64 w-full"
            >
              <div className="skeleton h-32 w-full rounded-t-xl"></div>
              <div className="p-3">
                <div className="skeleton h-4 w-3/4 mb-2 rounded"></div>
                <div className="skeleton h-3 w-1/2 mb-3 rounded"></div>
                <div className="skeleton h-6 w-full rounded-full"></div>
              </div>
            </div>
          ))
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              className="recipe-card hover-lift cursor-pointer group compact-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link to={`/recipe/${recipe.id}`} className="block">
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <FaEye className="text-xs" style={{ color: 'var(--primary-green)' }} />
                  </div>
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--primary-green)' }}>
                      {recipe.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="text-sm font-bold mb-1 line-clamp-2 group-hover:text-green-700 transition-colors duration-300" 
                      style={{ color: 'var(--dark-text)' }}>
                    {recipe.title}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <FaClock className="text-xs" style={{ color: 'var(--sage-green)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--dark-text)' }}>
                        {recipe.cookingTime}m
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <FaHeart className="text-xs" style={{ color: 'var(--accent-orange)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--dark-text)' }}>
                        {recipe.likes?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <img
                        src={recipe.author.avatar || 'https://via.placeholder.com/20'}
                        alt={recipe.author.name}
                        className="w-4 h-4 rounded-full border border-green-200"
                      />
                      <span className="text-xs font-medium" style={{ color: 'var(--sage-green)' }}>
                        {recipe.author.name}
                      </span>
                    </div>

                    {recipe.ratings.length > 0 ? (
                      <StarRating
                        rating={
                          recipe.ratings.reduce((sum, r) => sum + r.rating, 0) /
                          recipe.ratings.length
                        }
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No ratings</span>
                    )}
                  </div>

                  <button className="btn-secondary w-full group-hover:scale-105 transition-transform duration-300 text-xs">
                    View Recipe
                  </button>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-lg font-semibold mb-1" style={{ color: 'var(--dark-text)' }}>
              No recipes found
            </p>
            <p className="text-gray-600 text-sm">
              Try adjusting your search or browse different categories
            </p>
          </div>
        )}
      </motion.div>

      {/* Infinite Scroll Loading */}
      {isLoadingMore && !passedRecipes && (
        <div className="infinite-scroll-loading">
          <div className="spinner"></div>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && !passedRecipes && filteredRecipes.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">You've reached the end of the recipes!</p>
        </div>
      )}
    </div>
  );
};

export default RecipeGrid;

// Enhanced StarRating component
export const StarRating = ({ rating }) => {
  const roundedRating = Math.round(rating * 2) / 2;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={`text-sm star-rating transition-all duration-200 ${
              starValue <= roundedRating 
                ? 'opacity-100 scale-110' 
                : starValue - 0.5 <= roundedRating 
                  ? 'opacity-75' 
                  : 'opacity-30'
            }`}
          >
            ★
          </span>
        );
      })}
      <span className="text-xs font-semibold ml-1" style={{ color: 'var(--sage-green)' }}>
        ({rating.toFixed(1)})
      </span>
    </div>
  );
};
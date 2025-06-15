import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
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

  const { loading, error, data } = useQuery(GET_RECIPES, {
    variables: { page, limit: 9, category: selectedCategory },
    fetchPolicy: "cache-and-network",
    skip: !!passedRecipes
  });

  const recipes = passedRecipes || data?.recipes.recipes || [];
  const totalPages = data?.recipes.totalPages || 1;
  const safeSearchQuery = searchQuery?.toString().toLowerCase() || '';
  
  if (error) return <p className="text-red-500 text-center">Error: {error.message}</p>;
  
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(safeSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center w-full px-4 md:px-8">
      {/* Recipe Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {!passedRecipes && loading ? (
          Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="recipe-card h-80 w-full"
            >
              <div className="skeleton h-48 w-full rounded-t-2xl"></div>
              <div className="p-6">
                <div className="skeleton h-6 w-3/4 mb-3 rounded"></div>
                <div className="skeleton h-4 w-1/2 mb-4 rounded"></div>
                <div className="skeleton h-10 w-full rounded-full"></div>
              </div>
            </div>
          ))
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              className="recipe-card hover-lift cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link to={`/recipe/${recipe.id}`} className="block">
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-48 md:h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <FaEye className="text-sm" style={{ color: 'var(--primary-green)' }} />
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--primary-green)' }}>
                      {recipe.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2 group-hover:text-green-700 transition-colors duration-300" 
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

                    {recipe.ratings.length > 0 ? (
                      <StarRating
                        rating={
                          recipe.ratings.reduce((sum, r) => sum + r.rating, 0) /
                          recipe.ratings.length
                        }
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No ratings yet</span>
                    )}
                  </div>

                  <button className="btn-secondary w-full group-hover:scale-105 transition-transform duration-300">
                    View Recipe
                  </button>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
              No recipes found
            </p>
            <p className="text-gray-600">
              Try adjusting your search or browse different categories
            </p>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {!passedRecipes && !loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                    page === pageNum 
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
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeGrid;

// Enhanced StarRating component
export const StarRating = ({ rating }) => {
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={`text-lg star-rating transition-all duration-200 ${
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
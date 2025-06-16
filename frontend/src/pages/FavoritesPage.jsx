import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaHeart, FaClock, FaSearch, FaBookmark, FaEye } from "react-icons/fa";

const GET_BOOKMARKED_RECIPES = gql`
  query GetBookmarkedRecipes {
    getBookmarkedRecipes {
      id
      createdAt
      recipe {
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
          user {
            id
            name
          }
        }
        ratings {
          rating
        }
      }
    }
  }
`;

const FavoritesPage = () => {
  const { data, loading, error } = useQuery(GET_BOOKMARKED_RECIPES);
  const [searchQuery, setSearchQuery] = useState('');

  const bookmarks = data?.getBookmarkedRecipes || [];
  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="skeleton h-12 w-64 mx-auto mb-4"></div>
            <div className="skeleton h-6 w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="bg-white rounded-3xl card-shadow p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold mb-2 text-red-600">Error Loading Favorites</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, var(--accent-orange) 0%, var(--warm-yellow) 100%)' }}>
              <FaBookmark className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--primary-green)' }}>
              Saved Recipes
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your collection of favorite recipes, saved for easy access
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="search-container">
            <div className="flex items-center px-4">
              <FaSearch className="text-xl mr-3" style={{ color: 'var(--sage-green)' }} />
              <input
                type="text"
                placeholder="Search your saved recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-lg placeholder:text-gray-400 font-medium py-4"
                style={{ color: 'var(--dark-text)' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="bg-white rounded-2xl card-shadow p-6 mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--accent-orange)' }}>
                {bookmarks.length}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                Saved Recipes
              </div>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--primary-green)' }}>
                {filteredBookmarks.length}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                Showing
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recipe Grid */}
        {filteredBookmarks.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {filteredBookmarks.map((bookmark, index) => {
              const recipe = bookmark.recipe;
              const avgRating = recipe.ratings.length > 0
                ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length
                : 0;

              return (
                <motion.div
                  key={bookmark.id}
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
                      
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <FaEye className="text-sm" style={{ color: 'var(--primary-green)' }} />
                      </div>
                      
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-xs font-semibold" style={{ color: 'var(--primary-green)' }}>
                          {recipe.category}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 bg-red-500/90 backdrop-blur-sm rounded-full p-2">
                        <FaBookmark className="text-white text-sm" />
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

                      <div className="text-xs text-gray-500 mb-4">
                        Saved on {new Date(parseInt(bookmark.createdAt)).toLocaleDateString()}
                      </div>

                      <button className="btn-secondary w-full group-hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2">
                        <FaEye />
                        View Recipe
                      </button>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white rounded-3xl card-shadow p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6">📖</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--dark-text)' }}>
                {searchQuery ? 'No matching recipes' : 'No saved recipes yet'}
              </h3>
              <p className="text-gray-600 mb-8">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start bookmarking recipes you love to see them here!'
                }
              </p>
              {!searchQuery && (
                <Link to="/" className="btn-primary">
                  Discover Recipes
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
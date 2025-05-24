import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { FaHeart } from "react-icons/fa";

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

const RecipeGrid = ({ selectedCategory, searchQuery ,recipes:passedRecipes }) => {
  const [page, setPage] = useState(1);
  // const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // **Debounce search to optimize API calls**
  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setDebouncedSearch(searchQuery);
  //   }, 300); // Delay updates for better performance

  //   return () => clearTimeout(handler);
  // }, [searchQuery]);

  const { loading, error, data } = useQuery(GET_RECIPES, {
    variables: { page, limit: 9, category: selectedCategory },
    fetchPolicy: "cache-and-network", // Optimized fetching strategy
    skip: !!passedRecipes
  });
  // Use passed recipes if available, otherwise use fetched data
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
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {!passedRecipes && loading ? (
      Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-200 animate-pulse h-60 w-full rounded-lg"
        ></div>
      ))
    ) : filteredRecipes.length > 0 ? (
      filteredRecipes.map((recipe, index) => (
        <motion.div
          key={recipe.id}
          className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Link to={`/recipe/${recipe.id}`} className="block">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-40 md:h-48 object-cover"
              loading="lazy"
            />
            <div className="p-4">
              <h3 className="text-base md:text-lg font-bold truncate">{recipe.title}</h3>
              <p className="text-sm text-gray-600">{recipe.cookingTime} mins</p>

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">
                  <FaHeart className="inline mr-1" />
                  {recipe.likes?.length || 0}
                </span>

                {recipe.ratings.length > 0 ? (
                  <StarRating
                    rating={
                      recipe.ratings.reduce((sum, r) => sum + r.rating, 0) /
                      recipe.ratings.length
                    }
                  />
                ) : (
                  <span className="text-gray-500 text-sm">No ratings yet</span>
                )}
              </div>

              <button className="mt-3 bg-gray-200 hover:bg-gray-300 text-black text-sm md:text-base px-3 py-2 rounded-md w-full">
                View Recipe
              </button>
            </div>
          </Link>
        </motion.div>
      ))
    ) : (
      <p className="text-gray-500 text-center col-span-full">No recipes found.</p>
    )}
  </motion.div>

  {/* Pagination */}
  {!passedRecipes && !loading && totalPages > 1 && (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
      <button
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-lg font-semibold">Page {page}</span>
      <button
        onClick={() => setPage((prev) => Math.min(prev + 1, data.recipes.totalPages))}
        disabled={page === data.recipes.totalPages}
        className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )}
</div>

  );
};

export default RecipeGrid;

// Add StarRating component
export const StarRating = ({ rating }) => {
  const roundedRating = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={`text-lg ${
            index < roundedRating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      ))}
      <span className="text-sm text-gray-600">({rating.toFixed(1)})</span>
    </div>
  );
};
import { useQuery, gql } from "@apollo/client";
import { motion } from "framer-motion";

const GET_CATEGORIES = gql`
  query GetCategories {
    categories
  }
`;

const categoryIcons = {
  "Main Course": "🍽️",
  "Appetizer": "🥗",
  "Dessert": "🍰",
  "Breakfast": "🥞",
  "Lunch": "🥪",
  "Dinner": "🍖",
  "Snack": "🍿",
  "Beverage": "🥤",
  "Vegetarian": "🥬",
  "Vegan": "🌱"
};

const RecipeCategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
  const { loading, error, data } = useQuery(GET_CATEGORIES);
  
  if (loading) return (
    <div className="flex gap-3 mb-6 px-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton h-10 w-24 rounded-full"></div>
      ))}
    </div>
  );
  
  if (error) return <p className="text-red-500 text-center">Error loading categories</p>;

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <div className="flex gap-3 sm:gap-4 mb-8 px-2 sm:px-4 pb-2">
        {data.categories.map((category, index) => (
          <motion.button
            key={category}
            className={`category-pill flex items-center gap-2 ${
              selectedCategory === category ? 'active' : ''
            }`}
            onClick={() => setSelectedCategory(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <span className="text-lg">
              {categoryIcons[category] || "🍴"}
            </span>
            <span className="font-semibold text-sm sm:text-base">
              {category}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default RecipeCategoryFilter;
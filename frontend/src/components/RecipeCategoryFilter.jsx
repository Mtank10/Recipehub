import { useQuery,gql } from "@apollo/client";
import { motion } from "framer-motion";


const GET_CATEGORIES = gql`
  query GetCategories {
    categories
  }
`;




const RecipeCategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
  const { loading, error, data } = useQuery(GET_CATEGORIES);
  if (loading) return <p>Loading categories...</p>;
  if (error) return <p>Error loading categories</p>;

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
  <div className="flex gap-3 sm:gap-4 mb-6 px-2 sm:px-4">
    {data.categories.map((category, index) => (
      <motion.button
        key={category}
        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition ${
          selectedCategory === category
            ? "bg-black text-white"
            : "bg-white text-gray-700 border border-gray-300"
        }`}
        onClick={() => setSelectedCategory(category)}
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        {category}
      </motion.button>
    ))}
  </div>
</div>

  );
};

export default RecipeCategoryFilter;

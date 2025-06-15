import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import RecipeGrid from "../components/RecipeGrid";
import MiniRecipeSidebar from "../components/MiniRecipeSidebar";
import RecipeCategoryFilter from "../components/RecipeCategoryFilter";
import { FaUtensils, FaHeart, FaClock, FaUsers } from "react-icons/fa";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("Main Course");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const stats = [
    { icon: FaUtensils, label: "Recipes", value: "1000+", color: "var(--primary-green)" },
    { icon: FaUsers, label: "Chefs", value: "500+", color: "var(--accent-orange)" },
    { icon: FaHeart, label: "Favorites", value: "10K+", color: "var(--warm-yellow)" },
    { icon: FaClock, label: "Minutes Saved", value: "50K+", color: "var(--sage-green)" }
  ];

  return (
    <motion.div
      className="min-h-screen gradient-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="flex-1 p-4 sm:p-6 lg:p-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-green-700 via-green-600 to-green-500 bg-clip-text text-transparent">
              Cook with Passion
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover amazing recipes, learn new cooking techniques, and share your culinary creations with our vibrant community
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="flex justify-center mb-8">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white rounded-2xl p-6 card-shadow hover-lift text-center"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <stat.icon 
                  className="text-3xl mx-auto mb-3" 
                  style={{ color: stat.color }}
                />
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--dark-text)' }}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <RecipeCategoryFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Recipe Grid */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <RecipeGrid selectedCategory={selectedCategory} searchQuery={searchQuery} />
          </motion.div>

          {/* Sidebar - Only visible on large screens */}
          <motion.div
            className="hidden lg:block w-full lg:w-[320px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <MiniRecipeSidebar />
          </motion.div>
        </div>

        {/* Call to Action Section */}
        <motion.div
          className="text-center mt-16 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="bg-white rounded-3xl p-8 card-shadow max-w-2xl mx-auto">
            <div className="text-4xl mb-4">👨‍🍳</div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
              Ready to Share Your Recipe?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of home cooks sharing their favorite recipes
            </p>
            <button className="btn-primary text-lg px-8 py-3">
              Start Cooking Today
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
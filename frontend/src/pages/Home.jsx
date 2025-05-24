import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import RecipeGrid from "../components/RecipeGrid";
import MiniRecipeSidebar from "../components/MiniRecipeSidebar";
import RecipeCategoryFilter from "../components/RecipeCategoryFilter";
import logo from "../assets/logo.png";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("Pasta");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  return (
    <motion.div
      className="flex flex-col min-h-screen text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="flex-1 p-4 sm:p-6 lg:p-10">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <SearchBar onSearch={setSearchQuery} />
          <div className="flex flex-col items-center gap-2">
            <img src={logo} alt="RecipeHub Logo" className="w-14 rounded-[15px] shadow-lg" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center px-4 sm:px-0 mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Learn, Cook, & Eat Your Food
          </h2>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <RecipeCategoryFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
          />
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Recipe Grid */}
          <div className="flex-1">
            <RecipeGrid selectedCategory={selectedCategory} searchQuery={searchQuery} />
          </div>

          {/* Sidebar - Only visible on medium screens and up */}
          <div className="hidden lg:block w-full lg:w-[300px]">
            <MiniRecipeSidebar />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;

import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import RecipeGrid from "../components/RecipeGrid";
import MiniRecipeSidebar from "../components/MiniRecipeSidebar";
import RecipeCategoryFilter from "../components/RecipeCategoryFilter";
import logo from "../assets/logo.png"; // Add your logo image


const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("Pasta");
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized category change to prevent unnecessary re-renders
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  return (
    <motion.div
      className="flex flex-col items-start justify-center min-h-screen text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="flex-1 p-5">
        {/* Search Bar */}
        <div className="flex flex-row justify-between h-auto">
        <SearchBar onSearch={setSearchQuery} />
        <div className="flex flex-col items-center gap-2 p-2 ">
        <img src={logo} alt="RecipeHub Logo" className="w-14 rounded-[15px] shadow-lg" />
        
       </div>
        </div>
        <div className="flex items-center p-4 text-[40px]">
          <h2 className="text-gray-800 font-bold">Learn,Cook, & Eat Your Food</h2>
        </div>
        {/* Category Filter (Triggers Recipe Update Only) */}
        <RecipeCategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
        />

        {/* Main Content */}
        <div className="flex gap-6">
          <div className="flex-1">
            {/* Only RecipeGrid should update when category changes */}
            <RecipeGrid selectedCategory={selectedCategory} searchQuery={searchQuery} />
          </div>

          {/* Mini Sidebar stays unchanged */}
          <MiniRecipeSidebar />
        </div>
      </div>
    </motion.div>
  );
};

export default Home;

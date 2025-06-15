import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaClock, FaFire, FaTrendingUp } from "react-icons/fa";

const quickRecipes = [
  { 
    id: 1,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
    title: "Quick Pasta Salad",
    time: 15,
    difficulty: "Easy"
  },
  { 
    id: 2,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
    title: "Avocado Toast",
    time: 5,
    difficulty: "Easy"
  },
  { 
    id: 3,
    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400",
    title: "Smoothie Bowl",
    time: 10,
    difficulty: "Easy"
  },
  { 
    id: 4,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
    title: "Caesar Salad",
    time: 12,
    difficulty: "Medium"
  }
];

const trendingTips = [
  "🔥 Air fryer recipes are trending!",
  "🌱 Plant-based proteins are popular",
  "⚡ 15-minute meals save time",
  "🥗 Meal prep is key to success"
];

const MiniRecipeSidebar = () => {
  return (
    <div className="space-y-6">
      {/* Quick Recipes Section */}
      <motion.div
        className="bg-white rounded-2xl p-6 card-shadow"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" 
               style={{ background: 'linear-gradient(135deg, var(--accent-orange) 0%, var(--warm-yellow) 100%)' }}>
            <FaClock className="text-white text-lg" />
          </div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
            Quick Recipes
          </h3>
        </div>
        
        <div className="space-y-4">
          {quickRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300 hover-lift group"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-16 h-16 object-cover rounded-xl border-2 border-green-100 group-hover:border-green-300 transition-colors duration-300"
                />
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {recipe.time}m
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1 group-hover:text-green-700 transition-colors duration-300" 
                    style={{ color: 'var(--dark-text)' }}>
                  {recipe.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full" 
                        style={{ 
                          background: 'var(--cream)', 
                          color: 'var(--sage-green)',
                          fontWeight: '500'
                        }}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.button
          className="btn-secondary w-full mt-6"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View All Quick Recipes
        </motion.button>
      </motion.div>

      {/* Trending Tips Section */}
      <motion.div
        className="bg-white rounded-2xl p-6 card-shadow"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" 
               style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' }}>
            <FaTrendingUp className="text-white text-lg" />
          </div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
            Trending Now
          </h3>
        </div>
        
        <div className="space-y-3">
          {trendingTips.map((tip, index) => (
            <motion.div
              key={index}
              className="p-3 rounded-xl transition-all duration-300 hover:bg-gray-50 cursor-pointer"
              style={{ background: 'var(--cream)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--dark-text)' }}>
                {tip}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recipe of the Day */}
      <motion.div
        className="bg-white rounded-2xl p-6 card-shadow"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" 
               style={{ background: 'linear-gradient(135deg, var(--warm-yellow) 0%, var(--accent-orange) 100%)' }}>
            <FaFire className="text-white text-lg" />
          </div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
            Recipe of the Day
          </h3>
        </div>
        
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400"
            alt="Featured Recipe"
            className="w-full h-32 object-cover rounded-xl mb-4"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-xs font-bold" style={{ color: 'var(--accent-orange)' }}>
              Featured
            </span>
          </div>
        </div>
        
        <h4 className="font-bold mb-2" style={{ color: 'var(--dark-text)' }}>
          Mediterranean Bowl
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Fresh, healthy, and packed with flavor
        </p>
        
        <motion.button
          className="btn-primary w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Try This Recipe
        </motion.button>
      </motion.div>
    </div>
  );
};

export default MiniRecipeSidebar;
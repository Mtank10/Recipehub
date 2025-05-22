import { useQuery } from "@tanstack/react-query";
// import { fetchMiniRecipes } from "../api/miniRecipes";
import { motion } from "framer-motion";

const recipes= [
    { 
       id:1,
       image:"photo",
       title:"title1"
    },
    { 
        id:2,
        image:"photo",
        title:"title1"
     },
     { 
        id:3,
        image:"photo",
        title:"title1"
     },
]

const MiniRecipeSidebar = () => {
//   const { data: recipes, isLoading } = useQuery({
//     queryKey: ["miniRecipes"],
//     queryFn: fetchMiniRecipes,
//   });

//   if (isLoading) return <p>Loading mini recipes...</p>;

  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-4 w-80"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-bold mb-3">Quick Recipes</h3>
      <div className="flex flex-col gap-4">
        {recipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            className="flex items-center gap-3 p-2 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-14 h-14 object-cover rounded-md"
            />
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{recipe.title}</h4>
              <p className="text-xs text-gray-600">{recipe.time} mins</p>
            </div>
            <motion.button
              className="bg-primary text-white px-3 py-1 text-xs rounded-md"
              whileHover={{ scale: 1.1 }}
            >
              Get Recipe
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MiniRecipeSidebar;

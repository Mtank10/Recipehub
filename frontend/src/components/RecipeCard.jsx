import { motion } from "framer-motion"

const RecipeCard = ({recipe})=>{
    return (
      <motion.div
      className="bg-white shadow-md p-4 rounded-lg"
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{duration:1}}
      >
      <img
       src={recipe.image} 
       alt={recipe.title}
       className="w-full h-40 object-cover rounded-md"
      />
      <h3 className="text-lg font-semibold mt-2">{recipe.title}</h3>
      <p className="text-gray-500 text-sm">{recipe.time} mins</p>
      <button className="bg-primary text-white px-4 py-2 rounded-md mt-2 w-full">
        View Recipe
      </button>
      </motion.div>
    )
};

export default RecipeCard

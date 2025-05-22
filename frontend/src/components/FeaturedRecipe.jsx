import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
// import { fetchFeaturedRecipe } from "../api/featuredRecipe";
import { FaClock, FaUsers } from "react-icons/fa";

const FeaturedRecipe = () => {
//   const { data: recipe, isLoading } = useQuery({
//     queryKey: ["featuredRecipe"],
//     queryFn: fetchFeaturedRecipe,
//   });

//   if (isLoading) return <p>Loading featured recipe...</p>;

  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6 flex gap-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Recipe Image */}
      <motion.img
        src="image"
        alt="image"
        className="w-48 h-48 object-cover rounded-lg"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Recipe Details */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold">title</h2>
        <p className="text-gray-600 my-2">description</p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-gray-700 my-3">
          <div className="flex items-center gap-2">
            <FaUsers className="text-primary" />
            <span> servings</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-primary" />
            <span>timing</span>
          </div>
        </div>

        {/* Call-to-Action */}
        <motion.button
          className="bg-primary text-white px-5 py-2 rounded-md mt-3"
          whileHover={{ scale: 1.1 }}
        >
          Get The Offer
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FeaturedRecipe;

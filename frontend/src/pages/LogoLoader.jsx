import { motion } from "framer-motion";

const LogoLoader = ({ onFinish }) => {
  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-white z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 1.5 }} // Delay before fading out
      onAnimationComplete={onFinish} // Calls onFinish when animation is done
    >
      <motion.img
        src="../assets/logo.png" // Replace with your actual logo path
        alt="RecipeHub Logo"
        className="w-28 h-28"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.h1
        className="text-3xl font-bold mt-4 text-[#FFA400]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        RecipeHub
      </motion.h1>
    </motion.div>
  );
};

export default LogoLoader;

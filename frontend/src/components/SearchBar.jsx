import { useState, useEffect } from "react";
import { debounce } from "lodash";
import { motion } from "framer-motion";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce function to delay API calls
  const debouncedSearch = debounce((query) => {
    onSearch(query);
  }, 500);

  useEffect(() => {
    debouncedSearch(searchTerm || '');
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  return (
    <motion.div
      className="w-full sm:w-[300px] md:w-[400px] h-12 flex items-center bg-gray-100 shadow-md rounded-lg px-3 py-2 mb-5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <input
        type="text"
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-500"
      />
    </motion.div>
  );
};

export default SearchBar;

import { useState, useEffect } from "react";
import { debounce } from "lodash";
import { motion } from "framer-motion";


const SearchBar= ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce function to delay API calls
  const debouncedSearch = debounce((query) => {
    onSearch(query);
  }, 500);

  // Handle input changes
  useEffect(() => {
    debouncedSearch(searchTerm || '');
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  return (
    <motion.div
      className="w-[400px] h-12 flex items-center bg-gray-100 shadow-md rounded-lg p-3 mb-5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <input
        type="text"
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-1 outline-none text-gray-700"
      />
    </motion.div>
  );
};

export default SearchBar;

import { useState, useEffect } from "react";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <motion.div
      className={`search-container w-full max-w-[350px] md:max-w-[450px] h-12 md:h-14 flex items-center transition-all duration-300 ${
        isFocused ? 'scale-105' : ''
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center w-full px-3 md:px-4">
        <FaSearch 
          className="text-lg md:text-xl mr-2 md:mr-3 transition-colors duration-300" 
          style={{ color: isFocused ? 'var(--sage-green)' : 'var(--light-green)' }}
        />
        <input
          type="text"
          placeholder="Search delicious recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent outline-none text-sm md:text-lg placeholder:text-gray-400 font-medium py-3 md:py-4"
          style={{ color: 'var(--dark-text)' }}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <FaTimes 
              className="text-xs md:text-sm" 
              style={{ color: 'var(--sage-green)' }}
            />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default SearchBar;
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, X } from 'lucide-react';
import { weatherApi } from '../services/weatherApi';
import { debounce } from '../utils/weatherUtils';

const SearchBar = ({ onSearch, loading, searchHistory, onClearHistory, onDeleteHistoryItem, historyCap = 5 }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery) => {
    if (searchQuery.length >= 2) {
      try {
        const results = await weatherApi.searchCities(searchQuery);
        setSuggestions(results.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowHistory(false);
    
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSearch(query.trim());
      setShowSuggestions(false);
      setShowHistory(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const displayName = suggestion.displayName || suggestion.name;
    setQuery(displayName);
    
    // Use coordinates if available for better accuracy, otherwise use city name
    if (suggestion.coordinates && suggestion.coordinates.lat && suggestion.coordinates.lon) {
      onSearch(suggestion.coordinates); // Pass coordinates object
    } else {
      onSearch(suggestion.name); // Fallback to simple city name
    }
    
    setShowSuggestions(false);
    setShowHistory(false);
    inputRef.current?.blur();
  };

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    const cityName = `${historyItem.city}, ${historyItem.country}`;
    setQuery(cityName);
    onSearch(cityName);
    setShowHistory(false);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const items = showHistory ? searchHistory : suggestions;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        if (showHistory) {
          handleHistoryClick(items[selectedIndex]);
        } else {
          handleSuggestionClick(items[selectedIndex]);
        }
      } else {
        handleSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowHistory(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (!query.trim() && searchHistory.length > 0) {
      setShowHistory(true);
    } else if (query.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle clear button
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setShowHistory(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowHistory(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto" ref={suggestionsRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="Search for a city..."
            disabled={loading}
            className="w-full px-4 py-3 pl-12 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/30 dark:border-gray-600/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 disabled:opacity-50"
          />
          
          {/* Search Icon */}
          <Search 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
          
          {/* Clear Button */}
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </motion.button>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || !query.trim()}
          className="mt-3 w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Searching...
            </div>
          ) : (
            'Get Weather'
          )}
        </motion.button>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {(showSuggestions || showHistory) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/30 dark:border-gray-600/30 rounded-2xl shadow-xl max-h-64 overflow-y-auto z-50"
          >
            {showHistory && searchHistory.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                  Recent Searches
                </div>
                {searchHistory.slice(0, historyCap).map((item, index) => (
                  <motion.button
                    key={`history-${index}`}
                    type="button"
                    onClick={() => handleHistoryClick(item)}
                    className={`w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between ${
                      selectedIndex === index ? 'bg-blue-100 dark:bg-gray-600' : ''
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center">
                      <Clock size={16} className="text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.city}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.country}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDeleteHistoryItem?.(item); }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </motion.button>
                ))}
                <div className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onClearHistory?.()}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="p-2">
                {!showHistory && (
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                    Suggestions
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={`suggestion-${index}`}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                      selectedIndex === index ? 'bg-blue-100 dark:bg-gray-600' : ''
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {suggestion.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {suggestion.displayName}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {showSuggestions && suggestions.length === 0 && query.length >= 2 && (
              <div className="p-4 text-center text-gray-500">
                No cities found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;

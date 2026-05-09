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
  const wrapRef = useRef(null);

  const debouncedSearch = useRef(
    debounce(async (q) => {
      if (q.length >= 2) {
        try {
          const r = await weatherApi.searchCities(q);
          setSuggestions(r.suggestions || []);
          setShowSuggestions(true);
        } catch { setSuggestions([]); }
      } else { setSuggestions([]); setShowSuggestions(false); }
    }, 300)
  ).current;

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    setSelectedIndex(-1);
    setShowHistory(false);
    if (v.trim()) { debouncedSearch(v); } else { setSuggestions([]); setShowSuggestions(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSearch(query.trim());
      setShowSuggestions(false);
      setShowHistory(false);
      inputRef.current?.blur();
    }
  };

  const pickSuggestion = (s) => {
    setQuery(s.displayName || s.name);
    s.coordinates?.lat && s.coordinates?.lon ? onSearch(s.coordinates) : onSearch(s.name);
    setShowSuggestions(false);
    setShowHistory(false);
    inputRef.current?.blur();
  };

  const pickHistory = (h) => {
    const c = `${h.city}, ${h.country}`;
    setQuery(c);
    onSearch(c);
    setShowHistory(false);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    const items = showHistory ? searchHistory : suggestions;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => p < items.length-1 ? p+1 : p); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => p > 0 ? p-1 : -1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        showHistory ? pickHistory(items[selectedIndex]) : pickSuggestion(items[selectedIndex]);
      } else handleSubmit(e);
    }
    else if (e.key === 'Escape') { setShowSuggestions(false); setShowHistory(false); setSelectedIndex(-1); inputRef.current?.blur(); }
  };

  const handleFocus = () => {
    if (!query.trim() && searchHistory.length > 0) setShowHistory(true);
    else if (query.trim() && suggestions.length > 0) setShowSuggestions(true);
  };

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setShowSuggestions(false); setShowHistory(false); setSelectedIndex(-1); }};
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showDropdown = showSuggestions || showHistory;

  return (
    <div className="relative" ref={wrapRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search cities..."
          disabled={loading}
          className="input-field pl-10 pr-9 py-2 text-sm"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); setShowHistory(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          ><X size={14} /></button>
        )}
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-white/[0.08] rounded-xl shadow-card overflow-hidden z-50"
          >
            {showHistory && searchHistory.length > 0 && (
              <div className="p-1.5">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Recent</span>
                  <button onClick={onClearHistory} className="text-[10px] text-brand-blue hover:underline">Clear</button>
                </div>
                {searchHistory.slice(0, historyCap).map((item, i) => (
                  <button key={i} onClick={() => pickHistory(item)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg transition-colors ${selectedIndex === i ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'}`}
                  >
                    <Clock size={12} className="text-slate-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{item.city}</p>
                      <p className="text-[10px] text-slate-500">{item.country}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteHistoryItem?.(item); }} className="text-slate-600 hover:text-slate-400 shrink-0"><X size={12} /></button>
                  </button>
                ))}
              </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="p-1.5">
                {!showHistory && <p className="px-3 py-1.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Suggestions</p>}
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => pickSuggestion(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedIndex === i ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'}`}
                  >
                    <p className="text-xs font-medium text-white">{s.name}</p>
                    <p className="text-[10px] text-slate-500">{s.displayName}</p>
                  </button>
                ))}
              </div>
            )}

            {showSuggestions && suggestions.length === 0 && query.length >= 2 && (
              <p className="p-4 text-center text-xs text-slate-500">No cities found</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;

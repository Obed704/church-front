import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play,
  Calendar,
  BookOpen,
  Target,
  Clock,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_WEEKS_ENDPOINT = `${API_BASE_URL}/api/weeks`;

export default function WeekThemeSlideshow() {
  const [weeks, setWeeks] = useState([]);
  const [filteredWeeks, setFilteredWeeks] = useState([]);
  const [index, setIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  
  const timerRef = useRef(null);
  const slideDuration = 5000; // 5 seconds per slide

  // Fetch weeks from API
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_WEEKS_ENDPOINT);
        setWeeks(response.data);
        setFilteredWeeks(response.data);
      } catch (err) {
        console.error("Error fetching weeks:", err);
        setError("Failed to load weeks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeeks();
  }, []);

  // Filter weeks based on search term and active filter
  useEffect(() => {
    let results = weeks;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(week => 
        week.name.toLowerCase().includes(term) ||
        week.weekNo.toString().includes(term) ||
        week.theme.toLowerCase().includes(term) ||
        week.purpose.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (activeFilter !== "all") {
      results = results.filter(week => {
        const weekNum = parseInt(week.weekNo);
        switch(activeFilter) {
          case "current": return weekNum === 1;
          case "upcoming": return weekNum > 1 && weekNum <= 4;
          case "future": return weekNum > 4;
          default: return true;
        }
      });
    }
    
    setFilteredWeeks(results);
    setIndex(0); // Reset to first slide when filters change
  }, [searchTerm, weeks, activeFilter]);

  // Slideshow logic
  useEffect(() => {
    if (!filteredWeeks.length || !isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      setIndex(prev => (prev + 1) % filteredWeeks.length);
    }, slideDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, filteredWeeks, isPlaying]);

  const handlePrevious = useCallback(() => {
    setIndex(prev => (prev - 1 + filteredWeeks.length) % filteredWeeks.length);
  }, [filteredWeeks.length]);

  const handleNext = useCallback(() => {
    setIndex(prev => (prev + 1) % filteredWeeks.length);
  }, [filteredWeeks.length]);

  const handleDotClick = useCallback((i) => {
    setIndex(i);
  }, []);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setIsPlaying(false); // Pause slideshow when filtering
  };

  // Animation variants
  const slideVariants = {
    enter: { opacity: 0, x: 100 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weeks...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!weeks.length) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Weeks Available</h3>
          <p className="text-gray-600">Check back later for weekly themes.</p>
        </div>
      </section>
    );
  }

  const currentWeek = filteredWeeks[index];

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Weekly Spiritual Journey
          </h1>
          <p className="text-gray-600">Explore weekly themes, verses, and plans</p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by week number, name, theme, or purpose..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsPlaying(false);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {[
                { id: "all", label: "All Weeks", icon: <Calendar className="w-4 h-4" /> },
                { id: "current", label: "Current", icon: <Clock className="w-4 h-4" /> },
                { id: "upcoming", label: "Upcoming", icon: <Play className="w-4 h-4" /> },
                { id: "future", label: "Future", icon: <Target className="w-4 h-4" /> },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition ${
                    activeFilter === filter.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>{filteredWeeks.length} week{filteredWeeks.length !== 1 ? 's' : ''} found</span>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-700 transition"
              >
                Clear search
              </button>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative">
          {/* Slideshow Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Play</span>
                  </>
                )}
              </button>
              
              <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg">
                Auto-advance: {isPlaying ? "On" : "Off"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={filteredWeeks.length <= 1}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                disabled={filteredWeeks.length <= 1}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Week Card */}
          {currentWeek ? (
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWeek.weekNo}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden"
                >
                  {/* Week Badge */}
                  <div className="absolute top-6 right-6 z-10">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                          Current Week
                        </span>
                      )}
                      <span className="bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full">
                        Week {currentWeek.weekNo}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 md:p-12 text-white">
                    {/* Week Header */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 text-gray-300 mb-2">
                        <Calendar className="w-5 h-5" />
                        <span>{currentWeek.date}</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-3">
                        {currentWeek.name}
                      </h2>
                      <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
                    </div>

                    {/* Theme Quote */}
                    <div className="mb-10 relative">
                      <div className="text-6xl text-white/20 absolute -top-4 -left-2">"</div>
                      <p className="text-2xl md:text-3xl italic pl-8 relative z-10">
                        {currentWeek.theme}
                      </p>
                      <div className="text-6xl text-white/20 absolute -bottom-8 right-2">"</div>
                    </div>

                    {/* Bible Verse */}
                    <div className="mb-10 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-l-4 border-blue-500 p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="w-6 h-6 text-blue-300" />
                        <h3 className="text-xl font-semibold">Bible Verse</h3>
                      </div>
                      <p className="text-gray-200 text-lg leading-relaxed">
                        {currentWeek.verse}
                      </p>
                    </div>

                    {/* Grid Layout for Purpose and Plans */}
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Purpose */}
                      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <Target className="w-6 h-6 text-green-300" />
                          <h3 className="text-xl font-semibold">Purpose of the Week</h3>
                        </div>
                        <p className="text-gray-200 leading-relaxed">
                          {currentWeek.purpose}
                        </p>
                      </div>

                      {/* Plans */}
                      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <Calendar className="w-6 h-6 text-amber-300" />
                          <h3 className="text-xl font-semibold">Plans for the Week</h3>
                        </div>
                        <ul className="space-y-3">
                          {currentWeek.plans.map((plan, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-start gap-3"
                            >
                              <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-200">{plan}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-10 pt-6 border-t border-white/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-300">
                          Slide {index + 1} of {filteredWeeks.length}
                        </span>
                        <span className="text-sm text-gray-300">
                          {Math.round((slideDuration * (filteredWeeks.length - index)) / 1000)}s remaining
                        </span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ width: "0%" }}
                          animate={{ width: isPlaying ? "100%" : "0%" }}
                          transition={{ duration: slideDuration / 1000, ease: "linear" }}
                          key={index}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots Indicator */}
              {filteredWeeks.length > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {filteredWeeks.map((week, i) => (
                    <button
                      key={i}
                      onClick={() => handleDotClick(i)}
                      className={`transition-all duration-300 ${
                        i === index 
                          ? "scale-125" 
                          : "opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`Go to week ${week.weekNo}`}
                    >
                      <div className="relative">
                        <div
                          className={`h-3 w-3 rounded-full transition-all duration-300 ${
                            i === index 
                              ? "bg-blue-500" 
                              : "bg-gray-400 hover:bg-gray-600"
                          }`}
                        />
                        {i === index && (
                          <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-700 font-medium whitespace-nowrap bg-white px-2 py-1 rounded-lg shadow-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            Week {week.weekNo}
                          </motion.div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No matching weeks found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("all");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-600"
        >
          <p>Use arrow keys ← → to navigate • Space to pause/play • Click dots to jump to specific week</p>
          <p className="mt-2">Total weeks available: {weeks.length}</p>
        </motion.div>
      </div>
    </section>
  );
}
import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Constants
const SLIDE_DURATION = 5000;
const FIRST_SLIDE_DURATION = 1500;

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/weeks`;

// Memoized Slide Content Component
const SlideContent = memo(({ week, isCurrentWeek }) => (
  <>
    {isCurrentWeek && (
      <span className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg animate-pulse z-10">
        Current Week
      </span>
    )}

    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
          Week {week.weekNo}
        </span>
        <span className="text-gray-300 text-sm">{week.date}</span>
      </div>
      <h3 className="text-3xl font-bold text-white mb-3">{week.name}</h3>
    </div>

    <div className="bg-gradient-to-r from-gray-800/70 to-gray-900/70 p-6 rounded-2xl mb-6 border border-gray-700">
      <p className="text-2xl text-gray-100 italic mb-3">"{week.theme}"</p>
      <div className="border-l-4 border-amber-400 pl-4">
        <p className="text-gray-100">
          <span className="font-semibold text-amber-300">Bible Verse:</span>{" "}
          {week.verse}
        </p>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-800/50 p-5 rounded-2xl">
        <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
          Purpose
        </h4>
        <p className="text-gray-300 leading-relaxed">{week.purpose}</p>
      </div>

      <div className="bg-gray-800/50 p-5 rounded-2xl">
        <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
          Weekly Plans
        </h4>
        <ul className="space-y-2">
          {week.plans.map((plan, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-300">
              <span className="text-amber-400 mt-1">•</span>
              <span>{plan}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </>
));

SlideContent.displayName = "SlideContent";

// Custom hook for slideshow logic
const useSlideshow = (items, isPaused) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef(null);

  const navigateSlide = useCallback((newIndex) => {
    setDirection(newIndex > index ? 1 : -1);
    setIndex(newIndex);
  }, [index]);

  const handlePrev = useCallback(() => {
    navigateSlide((index - 1 + items.length) % items.length);
  }, [index, items.length, navigateSlide]);

  const handleNext = useCallback(() => {
    navigateSlide((index + 1) % items.length);
  }, [index, items.length, navigateSlide]);

  // Auto-advance slideshow
  useEffect(() => {
    if (items.length === 0 || isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(
      () => handleNext(),
      index === 0 ? FIRST_SLIDE_DURATION : SLIDE_DURATION
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, items.length, isPaused, handleNext]);

  return { index, direction, handlePrev, handleNext, navigateSlide };
};

// Loading Skeleton Component
const SlideshowSkeleton = () => (
  <div className="relative w-full max-w-5xl">
    <div className="bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500 rounded-3xl p-8 shadow-lg animate-pulse">
      <div className="space-y-6">
        <div className="h-8 bg-gray-600 rounded w-1/3"></div>
        <div className="h-24 bg-gray-600 rounded"></div>
        <div className="h-32 bg-gray-600 rounded"></div>
        <div className="flex gap-4">
          <div className="flex-1 h-40 bg-gray-600 rounded"></div>
          <div className="flex-1 h-40 bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function WeekThemeSlideshow() {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const containerRef = useRef(null);

  // Fetch weeks with error handling
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINT);
        setWeeks(response.data);
      } catch (err) {
        console.error("Error fetching weeks:", err);
        setError("Unable to load weeks data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeks();
  }, []);

  const slideshow = useSlideshow(weeks, isPaused);
  const currentWeek = weeks[slideshow.index];

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
      position: "absolute",
      width: "100%",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      position: "relative",
    },
    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      scale: 0.95,
      position: "absolute",
      width: "100%",
    }),
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      switch (e.key) {
        case "ArrowLeft":
          slideshow.handlePrev();
          break;
        case "ArrowRight":
          slideshow.handleNext();
          break;
        case " ":
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideshow]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <section className="flex justify-center items-center py-10 px-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <SlideshowSkeleton />
      </section>
    );
  }

  if (weeks.length === 0) {
    return (
      <section className="flex justify-center items-center py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center text-gray-400">
          <p>No weeks available.</p>
          <button
            onClick={() => navigate("/weeks")}
            className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition"
          >
            Go to Weeks
          </button>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="flex justify-center items-center py-12 px-4 bg-gradient-to-b from-gray-600 to-gray-800 min-h-[600px]"
      tabIndex={0}
      aria-label="Weekly theme slideshow"
    >
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className="relative w-full max-w-5xl"
      >
        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full z-20">
            Paused
          </div>
        )}

        {/* Slideshow container */}
        <div className="relative overflow-hidden rounded-3xl">
          <AnimatePresence initial={false} custom={slideshow.direction} mode="popLayout">
            <motion.div
              key={currentWeek?.weekNo || slideshow.index}
              custom={slideshow.direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.5,
              }}
              className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-3xl p-8 shadow-2xl"
              aria-live="polite"
              aria-atomic="true"
            >
              <SlideContent 
                week={currentWeek} 
                isCurrentWeek={slideshow.index === 0} 
              />

              {/* Action buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={() => navigate("/weeks")}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Explore 
                </button>
                
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm">
                    Week {slideshow.index + 1} of {weeks.length}
                  </span>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
                    aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
                  >
                    {isPaused ? "▶" : "⏸"}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation arrows - enhanced */}
        <button
          onClick={slideshow.handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg z-10"
          aria-label="Previous slide"
        >
          <span className="text-2xl">‹</span>
        </button>
        <button
          onClick={slideshow.handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg z-10"
          aria-label="Next slide"
        >
          <span className="text-2xl">›</span>
        </button>

        {/* Progress indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
          {!isPaused && (
            <motion.div
              className="h-full bg-amber-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
              key={slideshow.index}
            />
          )}
        </div>

        {/* Enhanced dots indicator */}
        <div className="flex justify-center mt-8 space-x-3" role="tablist">
          {weeks.map((week, i) => (
            <button
              key={i}
              onClick={() => slideshow.navigateSlide(i)}
              className={`relative cursor-pointer transition-all duration-300 ${
                i === slideshow.index ? "scale-125" : "hover:scale-110"
              }`}
              aria-label={`Go to week ${week.weekNo}`}
              role="tab"
              aria-selected={i === slideshow.index}
            >
              <span
                className={`block h-3 w-3 rounded-full transition-all duration-300 ${
                  i === slideshow.index 
                    ? "bg-amber-500 ring-4 ring-amber-500/30" 
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
              ></span>
              {i === slideshow.index && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-amber-300 font-semibold whitespace-nowrap">
                  Week {week.weekNo}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
import React, { useState, useEffect } from "react";
import {
  FiPlay,
  FiX,
  FiMusic,
  FiHeart,
  FiClock,
  FiChevronRight,
  FiChevronLeft,
  FiFilter,
} from "react-icons/fi";
import {
  AiOutlineLoading3Quarters,
  AiOutlineSearch,
  AiOutlineYoutube,
} from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/songs`;

const getVideoId = (url) => {
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const formatDuration = (seconds) => {
  if (!seconds) return "N/A";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const GospelSongs = () => {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);

  // Custom styles
  const styles = {
    gradientBg: "bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900",
    cardBg:
      "bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl",
    accentGradient:
      "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500",
    primaryBtn:
      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
    categoryBtn: (isActive) =>
      isActive
        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-semibold"
        : "bg-gray-800/60 hover:bg-gray-800/80 text-gray-300",
  };

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINT);
        // Add mock duration and category for demonstration
        const enhancedVideos = res.data.map((video) => ({
          ...video,
          duration: Math.floor(Math.random() * 600) + 120, // 2-10 minutes
          category:
            video.category ||
            ["praise", "worship", "hymn", "modern"][
              Math.floor(Math.random() * 4)
            ],
          views: Math.floor(Math.random() * 1000000) + 1000,
        }));
        setVideos(enhancedVideos);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Extract unique categories
  const categories = [
    "all",
    ...new Set(videos.map((v) => v.category).filter(Boolean)),
  ];

  // Filter videos
  const filteredVideos = videos.filter((video) => {
    const name = video.name || "";
    const desc = video.description || "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedVideos = showAll
    ? filteredVideos
    : filteredVideos.slice(0, 12);

  // Navigation in modal
  const handleNext = () => {
    const currentIdx = videos.findIndex(
      (v) => getVideoId(v.link) === activeVideo
    );
    const nextIdx = (currentIdx + 1) % videos.length;
    setActiveVideo(getVideoId(videos[nextIdx].link));
  };

  const handlePrev = () => {
    const currentIdx = videos.findIndex(
      (v) => getVideoId(v.link) === activeVideo
    );
    const prevIdx = (currentIdx - 1 + videos.length) % videos.length;
    setActiveVideo(getVideoId(videos[prevIdx].link));
  };

  // Toggle favorite
  const toggleFavorite = (videoId, e) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  return (
    <section
      className={`py-20 px-4 md:px-8 lg:px-16 ${styles.gradientBg} relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-yellow-500/10 rounded-full">
            <FiMusic className="text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">
              WORSHIP COLLECTION
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Lift Your Voice
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience divine worship through our curated collection of gospel
            songs and hymns
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-auto">
              <div className="relative">
                <AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search songs, artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${styles.cardBg} pl-12 pr-4 py-3.5 w-full lg:w-80 rounded-2xl border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200`}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${styles.categoryBtn(
                    selectedCategory === category
                  )}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {videos.length}
                </div>
                <div className="text-xs text-gray-400">SONGS</div>
              </div>
              <div className="h-8 w-px bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {favorites.length}
                </div>
                <div className="text-xs text-gray-400">FAVORITES</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AiOutlineLoading3Quarters className="animate-spin text-5xl text-yellow-400 mb-4" />
            <p className="text-gray-400">Loading worship songs...</p>
          </div>
        ) : (
          <>
            {/* Videos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              <AnimatePresence>
                {displayedVideos.map((video, index) => {
                  const videoId = getVideoId(video.link);
                  if (!videoId) return null;

                  const isFavorite = favorites.includes(videoId);

                  return (
                    <motion.div
                      key={videoId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="group cursor-pointer"
                      onClick={() => setActiveVideo(videoId)}
                    >
                      <div
                        className={`${styles.cardBg} rounded-2xl overflow-hidden border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10`}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                            alt={video.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                            }}
                          />

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2 py-1 bg-yellow-500/90 text-gray-900 text-xs font-bold rounded">
                                  {video.category?.toUpperCase() || "WORSHIP"}
                                </span>
                                <button
                                  onClick={(e) => toggleFavorite(videoId, e)}
                                  className={`p-1.5 rounded-full ${
                                    isFavorite ? "bg-red-500" : "bg-black/60"
                                  } hover:bg-red-500 transition-colors`}
                                >
                                  <FiHeart
                                    className={
                                      isFavorite
                                        ? "text-white"
                                        : "text-gray-300"
                                    }
                                  />
                                </button>
                              </div>
                              <p className="text-white text-sm font-medium line-clamp-2">
                                {video.name}
                              </p>
                            </div>
                          </div>

                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                              <FiPlay className="text-3xl text-yellow-400" />
                            </div>
                          </div>

                          {/* Duration Badge */}
                          <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 text-white text-xs rounded-lg">
                            {formatDuration(video.duration)}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-1">
                            {video.name}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <AiOutlineYoutube />
                              <span>YouTube</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiClock className="text-xs" />
                              <span>{video.views.toLocaleString()} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* See More/Less Button */}
            {filteredVideos.length > 12 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-12"
              >
                <button
                  onClick={() => setShowAll(!showAll)}
                  className={`flex items-center gap-2 px-8 py-4 ${styles.primaryBtn} text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300`}
                >
                  <span>
                    {showAll
                      ? "Show Less"
                      : `Load More (${filteredVideos.length - 12}+)`}
                  </span>
                  {showAll ? <FiChevronLeft /> : <FiChevronRight />}
                </button>
              </motion.div>
            )}

            {/* No Results */}
            {filteredVideos.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-2xl mb-6">
                  <FiFilter className="text-3xl text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No songs found
                </h3>
                <p className="text-gray-400">
                  Try a different search term or category
                </p>
              </div>
            )}
          </>
        )}

        {/* Video Modal */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={() => setActiveVideo(null)}
            >
              {/* Navigation Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 lg:left-8 text-white text-4xl p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-200 hover:scale-110"
              >
                <FiChevronLeft />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 lg:right-8 text-white text-4xl p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-200 hover:scale-110"
              >
                <FiChevronRight />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 text-white text-3xl p-2 bg-black/30 hover:bg-red-500/30 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <FiX />
              </button>

              {/* Current Video Info */}
              <div className="absolute top-4 left-4 lg:left-8 text-white max-w-xl">
                {(() => {
                  const video = videos.find(
                    (v) => getVideoId(v.link) === activeVideo
                  );
                  return video ? (
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{video.name}</h3>
                      <p className="text-gray-300 text-sm">
                        {video.description}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Video Player */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1`}
                  title="Gospel Song"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  frameBorder="0"
                />

                {/* Gradient Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
              </motion.div>

              {/* Video List (Bottom) */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                  {videos.slice(0, 8).map((v) => {
                    const id = getVideoId(v.link);
                    return (
                      <div
                        key={id}
                        className={`flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden cursor-pointer border-2 ${
                          id === activeVideo
                            ? "border-yellow-400"
                            : "border-transparent"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveVideo(id);
                        }}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${id}/default.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          {/* <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-8">
              <FiMusic className="text-4xl text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Missing a Song?
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg">
                Suggest your favorite worship songs to be added to our
                collection
              </p>
              <button
                className={`px-8 py-3 ${styles.primaryBtn} text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300`}
              >
                Request a Song
              </button>
            </div>
          </div> */}
        </motion.div>
      </div>
    </section>
  );
};

export default GospelSongs;
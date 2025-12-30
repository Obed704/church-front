import React, { useState, useContext, useEffect } from "react";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaPray,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaUserCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/authContext.jsx";
import Confetti from "react-confetti";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const HOLIDAY_API = `${API_BASE_URL}/api/holiday`;

const HolidayConnect = () => {
  const { user, token } = useContext(AuthContext);

  const [settings, setSettings] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hovered, setHovered] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [activeTab, setActiveTab] = useState("join");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Fetch settings from admin
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${HOLIDAY_API}/settings`);
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch holiday settings", err);
      }
    };
    fetchSettings();
  }, []);

  // Fetch participant count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${HOLIDAY_API}/count`);
        const data = await res.json();
        setParticipants(data.count);
      } catch (err) {
        console.error("Failed to fetch participant count", err);
      }
    };
    fetchCount();
  }, []);

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, "");
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6)
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => setPhone(formatPhoneNumber(e.target.value));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Join holiday prayer
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to join holiday prayers.");
    if (!name.trim() || !phone.trim())
      return alert("Please fill in both fields!");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${HOLIDAY_API}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Failed to join");

      setShowSuccess(true);
      setParticipants((prev) => prev + 1);

      setTimeout(() => {
        setShowSuccess(false);
        setName("");
        setPhone("");
      }, 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settings) return null; // Loading fallback

  return (
    <section className="relative">
      {/* Success Modal */}
      {showSuccess && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              zIndex: 50,
            }}
          />
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-3xl shadow-2xl text-center max-w-md mx-4 pointer-events-auto"
            >
              <FaCheckCircle className="text-6xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                🎉 Successfully Joined!
              </h3>
              <p className="mb-4">{settings.successMessage || "Welcome to our holiday prayer community!"}</p>
            </motion.div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 relative z-10">
        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full mb-4">
              <FaCalendarAlt className="text-lg" />
              <span className="font-semibold">{settings.season}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
              {settings.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              {settings.description}
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:w-1/2"
            >
              {/* Info Cards */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                      <FaPray className="text-2xl" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {settings.spiritualTitle || "Spiritual Growth Together"}
                    </h2>
                  </div>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    {settings.spiritualDescription || "Strengthen your faith through collective prayer, reflection, and fellowship."}
                  </p>

                  {/* Participant Card */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold">
                          {settings.liveSessionText || "Live Session"}
                        </span>
                      </div>
                      <span className="text-amber-400 text-sm font-semibold">
                        {settings.startsIn || "Starts in 2 days"}
                      </span>
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold mb-2">
                        {participants.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <FaUsers />
                        <span>{settings.participantsLabel || "Participants Joined"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bible Verse */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-l-4 border-amber-500 p-5 rounded-2xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl text-amber-500/50">"</div>
                      <div>
                        <p className="text-lg md:text-xl italic text-amber-100 leading-relaxed mb-2">
                          "{settings.bibleVerse?.text}"
                        </p>
                        <p className="text-amber-300 font-semibold">
                          – {settings.bibleVerse?.reference}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-4 text-center md:text-left">
                  {settings.connectTitle || "Connect With Us"}
                </h3>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {settings.socialLinks?.map((social, index) => {
                    const Icon = social.icon || FaEnvelope;
                    return (
                      <motion.a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 ${social.color} text-white px-5 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg`}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseEnter={() => setHovered(index)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <Icon className="text-xl" />
                        <span className="font-medium">{social.label}</span>
                        {hovered === index && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm opacity-90"
                          >
                            {social.hoverText || "Click to connect"}
                          </motion.span>
                        )}
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:w-1/2"
            >
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-700/50 shadow-2xl">
                {user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-2xl"
                  >
                    <FaUserCircle className="text-3xl text-amber-400" />
                    <div>
                      <p className="font-semibold">
                        {settings.welcomeText?.replace("{name}", user.name) || `Welcome back, ${user.name || "Member"}!`}
                      </p>
                      <p className="text-sm text-gray-400">
                        {settings.readyText || "Ready to join the prayer session?"}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-gray-900/50 p-1 rounded-xl">
                  {settings.tabs?.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-3 rounded-lg transition-all duration-300 ${
                        activeTab === tab.key
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {settings.tabs?.map(
                    (tab) =>
                      activeTab === tab.key && (
                        <motion.div
                          key={tab.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          {tab.key === "join" && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Your Name
                                </label>
                                <input
                                  type="text"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  placeholder="Enter your full name"
                                  className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  WhatsApp Number
                                </label>
                                <div className="relative">
                                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-400">
                                    <FaWhatsapp className="text-green-500" />
                                    <span>+250</span>
                                  </div>
                                  <input
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder="XXX-XXX-XXXX"
                                    className="w-full pl-24 p-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                    required
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  {settings.whatsappNote || "We'll send confirmation and updates via WhatsApp"}
                                </p>
                              </div>
                              <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                                  user
                                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                    : "bg-gradient-to-r from-gray-700 to-gray-800 cursor-not-allowed"
                                }`}
                              >
                                {isSubmitting
                                  ? settings.processingText || "Processing..."
                                  : user
                                  ? settings.joinButtonText || "Join Holiday Prayer Session"
                                  : settings.loginRequiredText || "Please Log In to Join"}
                              </motion.button>
                            </form>
                          )}
                          {tab.key !== "join" && (
                            <div className="p-4 text-gray-300">
                              {tab.content || "Content coming soon."}
                            </div>
                          )}
                        </motion.div>
                      )
                  )}
                </AnimatePresence>

                {/* Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                  {settings.features?.map((feature, idx) => (
                    <div
                      key={idx}
                      className={`bg-gradient-to-br ${feature.color} text-white p-3 rounded-xl text-center text-sm font-semibold shadow-lg`}
                    >
                      {feature.label}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HolidayConnect;
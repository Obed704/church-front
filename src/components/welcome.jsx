// Welcome.jsx
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Welcome = () => {
  return (
    <section className="relative w-full h-screen flex items-center justify-center text-center text-white overflow-hidden">
      
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute w-full h-full object-cover"
      >
        <source
          src={`https://church-back-dm84.onrender.com/largeVideo/1767144504858-703349876.mp4`}
          type="video/mp4"
        />
        Your browser does not support HTML5 video.
      </video>

      {/* Gradient Overlay */}
      <div className="absolute w-full h-full bg-gradient-to-b from-black/70 via-black/40 to-black/70" />

      {/* Content */}
      <motion.div
        className="relative z-10 px-6 max-w-3xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
          Welcome to Groupe Protestant
        </h1>

        <p className="text-lg md:text-2xl mb-8 italic drop-shadow-md">
          "For I know the plans I have for you," declares the Lord, "plans to
          prosper you and not to harm you, plans to give you hope and a future."
          <br />
          <span className="font-semibold">Jeremiah 29:11</span>
        </p>

        <motion.a
          href="/home"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full text-lg shadow-lg transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Welcome to our family
        </motion.a>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Scroll Down
      </motion.div>
    </section>
  );
};

export default Welcome;

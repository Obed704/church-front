import React, { useRef, useState, useEffect } from "react";
import { FiVideo, FiVolume2, FiVolumeX } from "react-icons/fi";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/videos`;
const BG_VIDEO_URL = `${API_BASE_URL}/videos/bg-video.mp4`;

const LiveMeeting = () => {
  const liveRef = useRef(null);
  const [video, setVideo] = useState(null); // first DB video
  const [isLiveMuted, setIsLiveMuted] = useState(true);

  // Fetch videos from DB
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(API_ENDPOINT);
        const data = await res.json();
        if (data.length > 0) {
          setVideo({ ...data[0], ref: React.createRef(), muted: true });
        }
      } catch (err) {
        console.error("Error fetching video:", err);
      }
    };
    fetchVideo();
  }, []);

  // Play first video when loaded
  useEffect(() => {
    if (video?.ref.current && typeof video.ref.current.play === "function") {
      video.ref.current
        .play()
        .catch((err) => console.warn("Autoplay blocked:", err));
    }
  }, [video]);

  // Toggle mute for DB video
  const toggleMute = () => {
    if (video?.ref.current) {
      video.ref.current.muted = !video.ref.current.muted;
      setVideo((prev) => ({ ...prev, muted: video.ref.current.muted }));
    }
  };

  // Toggle mute for live video
  const toggleLiveMute = () => {
    if (liveRef.current) {
      liveRef.current.muted = !liveRef.current.muted;
      setIsLiveMuted(liveRef.current.muted);
    }
  };

  return (
    <div className="bg-gray-600 p-4 md:p-6">
      <h1 className="text-center text-3xl md:text-4xl font-bold text-blue-400 py-4 md:py-6">
        Be with us live
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* DB Video (first) */}
        {video && (
          <div className="w-full md:w-1/3">
            <div className="relative w-full h-[200px] md:h-[250px] rounded-xl overflow-hidden shadow-lg">
              <video
                ref={video.ref}
                className="w-full h-full object-cover bg-black"
                src={video.src}
                loop
                muted={video.muted}
              />
              <button
                onClick={toggleMute}
                className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white"
              >
                {video.muted ? <FiVolumeX /> : <FiVolume2 />}
              </button>
            </div>
            <p className="text-white mt-2 text-sm md:text-base">{video.description}</p>
          </div>
        )}

        {/* Live Video */}
        <div className="w-full md:w-2/3 relative h-[250px] md:h-[500px] rounded-xl overflow-hidden shadow-lg">
          <video
            ref={liveRef}
            className="w-full h-full object-cover"
            src={BG_VIDEO_URL}
            autoPlay
            loop
            muted={isLiveMuted}
          />
          <div className="absolute top-2 right-2 p-2">
            <button
              onClick={toggleLiveMute}
              className="flex items-center gap-1 text-yellow-300 border border-yellow-300 rounded px-2 py-1"
            >
              {isLiveMuted ? <FiVolumeX /> : <FiVolume2 />}
              {isLiveMuted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMeeting;
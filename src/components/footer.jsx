import {
  Facebook,Instagram,Youtube,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gray-800 text-gray-200 py-12 shadow-inner hover:cursor-pointer">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white text-6xl md:text-8xl font-bold opacity-10 select-none">
          Jesus is the King
        </span>
      </div>
                                                                                                                                
      <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-10">
        {/* Logo & About */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 hover:text-yellow-400 transition duration-300">
            Groupe Protestant
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed hover:text-gray-200 transition duration-300">
            A community of faith, hope, and love. Our mission is to serve God
            and people through worship, fellowship, and outreach.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-3 text-gray-400">
            {["home", "shorts", "videos", "events", "bible-study"].map(
              (link, idx) => (
                <li key={idx}>
                  <a
                    href={link}
                    className="relative inline-block px-3 py-1 rounded-md transition duration-300 text-gray-400 hover:text-yellow-400 
                             before:absolute before:inset-0 before:rounded-md before:border-2 before:border-transparent 
                             before:transition-all before:duration-300 hover:before:border-yellow-400 hover:before:shadow-[0_0_10px_#facc15]"
                  >
                    {link}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Contact */}
        <div className="hover:cursor-pointer">
          <h3 className="text-xl font-semibold text-white mb-4">Contact Us</h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex items-center gap-2 hover:text-yellow-400 transition">
              <MapPin
                size={18}
                className="hover:drop-shadow-[0_0_6px_#facc15]"
              />{" "}
              Kigali, Rwanda
            </li>
            <li className="flex items-center gap-2 hover:text-yellow-400 transition">
              <Phone
                size={18}
                className="hover:drop-shadow-[0_0_6px_#facc15]"
              />{" "}
              +250 788 123 456
            </li>
            <li className="flex items-center gap-2 hover:text-yellow-400 transition">
              <Mail size={18} className="hover:drop-shadow-[0_0_6px_#facc15]" />{" "}
              contact@groupeprotestant.org
            </li>
          </ul>

          {/* Social Media */}
          <div className="flex gap-5 mt-5">
            <a
              href="#"
              className="p-2 rounded-full bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 transition duration-300 transform hover:scale-110 shadow-md hover:shadow-yellow-400/50"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 transition duration-300 transform hover:scale-110 shadow-md hover:shadow-yellow-400/50"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 transition duration-300 transform hover:scale-110 shadow-md hover:shadow-yellow-400/50"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700 mt-10 pt-5 text-center text-gray-500 text-sm relative">
        © {new Date().getFullYear()} Groupe Protestant. All rights reserved.
      </div>
    </footer>
  );
}

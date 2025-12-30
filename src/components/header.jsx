import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../src/context/authContext.jsx";
import Logo from "../assets/img/logo.jpg";
import { FaVideo, FaBolt } from "react-icons/fa";
import {
  FiBook,
  FiUsers,
  FiMenu,
  FiX,
  FiHeadphones,
  FiCalendar,
  FiGift,
  FiChevronDown,
} from "react-icons/fi";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false); // NEW state

  // Lock body scroll ONLY for mobile menu
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileMenuOpen]);

  const megaMenus = [
    {
      title: "Services",
      columns: [
        {
          heading: "Worship & Prayer",
          links: [
            { name: "Sunday Service", icon: <FiBook />, to: "/sunday-service" },
            { name: "Daily Prayer", icon: <FiUsers />, to: "/daily-word" },
            { name: "Choir", icon: <FiHeadphones />, to: "/choir" },
            { name: "Upcoming Events", icon: <FiCalendar />, to: "/upcomingEvents" },
          ],
        },
        {
          heading: "Events",
          links: [
            { name: "Bible Study", icon: <FiBook />, to: "/bible-study" },
            { name: "Baptism Program", icon: <FiGift />, to: "/baptism" },
            { name: "Upcoming Events", icon: <FiCalendar />, to: "/upcomingEvents" },
            { name: "Week theme word", icon:<FiBook />, to: "/weeks" },
          ],
        },
        {
          heading: "Resources",
          links: [
            { name: "Shorts", icon: <FaBolt />, to: "/shorts" },
            { name: "Videos", icon: <FaVideo />, to: "/videos" },
          ],
        },
      ],
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-gray-400/80 backdrop-blur-md shadow-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="h-12 w-12 rounded-full" />
            <span className="font-extrabold text-2xl text-gray-900">
              Groupe Protestant
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/home" className="font-semibold hover:text-blue-500">
              Home
            </Link>

            {/* Mega Menu */}
            <div
              className="flex "
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button className="flex items-center gap-1 font-semibold hover:text-blue-500">
                Services <FiChevronDown />
              </button>

              {megaOpen && (
                <div className="absolute left-0 top-14 w-screen bg-white shadow-xl py-8">
                  <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 px-6">
                    {megaMenus[0].columns.map((col) => (
                      <div key={col.heading} className="bg-gray-50 p-6 rounded-lg shadow">
                        <h3 className="text-blue-700 font-bold mb-4">{col.heading}</h3>
                        <ul className="space-y-2">
                          {col.links.map((link) => (
                            <li key={link.name} className="flex gap-2">
                              <span className="text-blue-500">{link.icon}</span>
                              <Link to={link.to} className="hover:text-blue-500">
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 bg-blue-600 text-white rounded-full font-bold"
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 bg-white shadow rounded-lg w-48">
                    <p className="px-4 py-2 font-semibold">{user.fullName}</p>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="px-4 py-2 bg-gray-200 rounded">
                  Login
                </Link>
                <Link to="/signin" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Sign In
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 overflow-y-auto md:hidden">
          {megaMenus.map((menu) => (
            <div key={menu.title} className="mb-6">
              <p className="font-bold mb-2">{menu.title}</p>
              {menu.columns.map((col) => (
                <div key={col.heading} className="mb-3">
                  <p className="text-blue-600 font-semibold">{col.heading}</p>
                  <ul className="ml-4 space-y-1">
                    {col.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Spacer to prevent content being hidden behind fixed header */}
      <div className="h-24" />
    </>
  );
};

export default Header;

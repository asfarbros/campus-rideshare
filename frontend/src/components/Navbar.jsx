import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { signOut } = useClerk();
  const { user } = useUser();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Example state for notifications, defaults to true for demo purposes
  const [hasNewRequests, setHasNewRequests] = useState(true); 
  
  const dropdownRef = useRef(null);

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profilePic");
    try {
      await signOut();
    } catch (e) {
      console.log("Already signed out of Clerk");
    }
    setIsDropdownOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use Clerk's image URL or a stored local storage picture
  const getLocalStorageProfilePic = () => {
    try {
      const pic = localStorage.getItem("profilePic");
      if (pic && pic.startsWith("http")) return pic;
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj?.picture) return userObj.picture;
        if (userObj?.imageUrl) return userObj.imageUrl;
      }
    } catch(e) {}
    return null;
  };

  const profilePicUrl = user?.imageUrl || getLocalStorageProfilePic();

  const getInitials = () => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    return "U";
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Home", path: "/dashboard" },
    { name: "Create Ride", path: "/create" },
    { name: "Search", path: "/search" },
    { name: "Companions", path: "/hosteller" },
  ];

  return (
    <nav className="bg-indigo-600 text-white shadow-md relative z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <h1
              className="text-2xl font-extrabold cursor-pointer tracking-tight"
              onClick={() => navigate("/dashboard")}
            >
              Campus RideShare
            </h1>
          </div>

          {token ? (
            /* CHANGED HERE: Grouped Nav links and Icons into one Right-aligned flex container */
            <div className="flex items-center space-x-2">
              
              {/* Desktop Menu */}
              <div className="hidden md:flex space-x-2 items-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`font-medium transition-colors hover:text-indigo-200 ${
                      isActive(link.path) ? "text-white underline underline-offset-4" : "text-indigo-100"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Right Side Icons */}
              <div className="flex items-center space-x-2">
                {/* Notification Bell */}
                <button
                  onClick={() => navigate("/requests")}
                  className="relative p-2 rounded-full hover:bg-indigo-700 transition-colors focus:outline-none"
                  title="Notifications"
                >
                  <svg
                    className="w-6 h-6 text-indigo-100 hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    ></path>
                  </svg>
                  {hasNewRequests && (
                    <span className="absolute top-1 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-indigo-300 transition-all"
                  >
                    {profilePicUrl ? (
                      <img
                        className="h-9 w-9 rounded-full object-cover border border-indigo-400"
                        src={profilePicUrl}
                        alt="User profile"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-indigo-500 border border-indigo-400 flex items-center justify-center font-bold text-lg text-white">
                        {getInitials()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 ring-1 ring-black ring-opacity-5 origin-top-right transition duration-100 ease-out z-50">
                      <Link
                        to="/requests"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600 font-medium whitespace-nowrap"
                      >
                        Requests
                      </Link>
                      <Link
                        to="/my-rides"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600 font-medium whitespace-nowrap"
                      >
                        My Rides
                      </Link>
                      <Link
                        to="/my-posted-rides"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600 font-medium whitespace-nowrap"
                      >
                        Posted Rides
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600 font-medium whitespace-nowrap"
                      >
                        My Profile
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center ml-2">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-700 focus:outline-none"
                  >
                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div> /* CHANGED HERE: End of new wrapper div */
          ) : (
            <div className="flex items-center space-x-2">
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {token && isMobileMenuOpen && (
        <div className="md:hidden bg-indigo-700 border-t border-indigo-600">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-600 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
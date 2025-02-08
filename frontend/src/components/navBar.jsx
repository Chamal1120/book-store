import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality here (WIP)
    console.log("Searching for:", searchTerm);
    // Navigate to a search results page or filter books based on the search term
    // Example: navigate(`/search?query=${searchTerm}`);
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
        <span className="text-xl font-bold">BookStore</span>
      </div>

      {/* Search Bar */}
      <form className="flex items-center ml-auto mr-4" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search books..."
          className="w-64 px-4 py-2 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search books"
        />
        <button 
          type="submit" 
          className="ml-2 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
          aria-label="Search"
        >
          Search
        </button>
      </form>

      {/* Buttons or User Info */}
      <div className="flex space-x-4">
        {!user ? (
          // Show Register and Login buttons if not authenticated
          <>
            <button
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
              onClick={() => navigate('/register')}
              aria-label="Register"
            >
              Register
            </button>

            <button
              className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700"
              onClick={() => navigate('/login')}
              aria-label="Login"
            >
              Login
            </button>
            
          </>
        ) : (
          // Show the username and Logout button if authenticated
          <>
            <div className="flex items-center space-x-4 bg-gray-200 p-0.1 rounded-lg shadow-md"></div>
            <span className="text-lg font-semibold text-gray-800 ml-4">{user.username.toUpperCase()}</span>
            <button
              className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700"
              onClick={handleLogout}
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;


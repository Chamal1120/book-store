import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();  // Call logout function from AuthContext
      navigate('/logIn');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src="/src/assets/logo.svg" alt="Logo" className="w-8 h-8" />
        <span className="text-xl font-bold">BookStore</span>
      </div>

      {/* Search Bar */}
      <div className="flex items-center ml-auto mr-4">
        <input
          type="text"
          placeholder="Search books..."
          className="w-64 px-4 py-2 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buttons or User Info */}
      <div className="flex space-x-4">
        {!user ? (
          // Show Register and Login buttons if not authenticated
          <>
            <button
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
            <button 
              className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700"
              onClick={() => navigate('/logIn')}
            >
              Login
            </button>
          </>
        ) : (
          // Show the username and Logout button if authenticated
          <>
            <span className="text-lg">{user.username}</span>
            <button
              className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
              onClick={handleLogout}
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


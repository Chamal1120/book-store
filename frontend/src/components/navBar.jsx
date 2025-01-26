import React from 'react';

const NavBar = () => {
    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white">
            {/* Logo */}
            <div className="flex items-center space-x-2">
                <img src="/src/assets/react.svg" alt="Logo" className="w-8 h-8" />
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

            {/* Buttons */}
            <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700">Register</button>
                <button className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700">Login</button>
            </div>
        </nav>
    );
};

export default NavBar;

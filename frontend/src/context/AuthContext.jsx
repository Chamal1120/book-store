import React, { createContext, useState, useEffect } from 'react';

const apiUrl = "https://6cx8mmgsil.execute-api.us-east-1.amazonaws.com/prod/api/v1/";

// Create AuthContext
const AuthContext = createContext();

// AuthProvider component that will wrap the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check if the user is logged in on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${apiUrl}/me`, {
          credentials: 'include',
        });
        const result = await response.json();
        if (result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    fetch(`${apiUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the AuthContext
export const useAuth = () => {
  return React.useContext(AuthContext);
};

// Export default AuthContext
export default AuthContext;


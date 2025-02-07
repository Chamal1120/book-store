import React, { createContext, useState, useEffect } from 'react';

const apiUrl = "https://cbdt4kq7ji.execute-api.us-east-1.amazonaws.com/prod/api/v1";

// Create AuthContext
const AuthContext = createContext();

// AuthProvider component that will wrap the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if the user is logged in
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch(`${apiUrl}/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });
          const result = await response.json();
          console.log("Fetch user result:", result); // Debug log
          if (result.user) {
            setUser(result.user);
          } else {
            console.error("User not found or unauthorized");
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUser();
  }, [token]);

  // Login function
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken); // Store the token in local storage
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${apiUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    }
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


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitClicked, setSubmitClicked] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (submitClicked) {
      const loginUser = async () => {
        try {
          const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
          });

          const result = await response.json();
          if (result.user) {
            login(result.user);
            navigate('/');
          } else {
            console.error('Login failed:', result.message);
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setSubmitClicked(false);
        }
      };

      loginUser();
    }
  }, [submitClicked, username, password, navigate, login]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitClicked(true);
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-xl font-bold mb-6 text-center bg-blue-500 text-white py-2 rounded">
          Log In
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter Username"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-52 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition mx-auto block"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogIn;


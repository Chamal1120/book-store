import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/navBar';
import Footer from '../components/footer';

const NoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow container mx-auto py-6 text-center">
        <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
        <p className="text-lg text-gray-700 mt-2">The page you’re looking for does not exist.</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate('/')}
        >
          Go to Home Page
        </button>
      </main>
      <Footer />
    </div>
  );
};

export default NoPage;

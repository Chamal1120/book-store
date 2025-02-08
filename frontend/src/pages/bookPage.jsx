import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../components/navBar';
import Footer from '../components/footer';

const BookPage = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const { book } = location.state || {};

  // Redirect to the home page if the book is not found.
  if (!book) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow container mx-auto py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg shadow-lg">
          {/* Cover Image */}
          <div className="flex justify-center mt-20 h-full">
            <img
              src={book.cover_path}
              alt={book.title}
              className="w-full h-auto max-h-96 object-contain rounded-md"
            />
          </div>


          {/* Book Details */}
          <div className="flex flex-col justify-center mr-16">
            <h1 className="text-3xl font-bold">{book.title}</h1>

            {/* Author in a Card, displayed in a single row */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm mt-4">
              <div className="flex items-center">
                <p className="text-lg font-semibold text-gray-700 mr-2">Author:</p>
                <p className="text-base text-gray-600">{book.author}</p>
              </div>
            </div>

            {/* Description in a Card */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm mt-4">
              <p className="text-lg font-semibold text-gray-700">Description:</p>
              <p className="text-base text-gray-600 mt-2 text-justify">{book.description}</p>
            </div>

            <p className="text-2xl font-semibold text-green-600 mt-6">Price: {book.price}LKR</p>
            <button
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={() => alert('Added to cart!')}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookPage;

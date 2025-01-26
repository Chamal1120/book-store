import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/navBar';
import Footer from '../components/footer';
import books from '../assets/books.json'; 

const BookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the book using the id from the URL.
  const book = books.find((b) => b.id === parseInt(id));

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
          <div className="flex justify-center">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-auto max-h-96 object-contain rounded-md"
            />
          </div>

          {/* Book Details */}
          <div className="flex flex-col justify-center mr-16">
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-lg text-gray-700 mt-4">Author: <span className="font-medium">{book.author}</span></p>
            <p className="text-lg text-gray-700 mt-4">Description:</p>
            <p className="text-base text-gray-600 mt-2 text-justify">{book.description}</p>
            <p className="text-2xl font-semibold text-green-600 mt-6">Price: ${book.price}</p>
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

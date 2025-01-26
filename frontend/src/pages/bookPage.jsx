import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/navBar';
import Footer from '../components/footer';
import books from '../assets/books.json'; // Same JSON file as in Home.

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
        <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-lg">
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-80 object-cover rounded-md"
          />
          <h1 className="text-2xl font-bold mt-4">{book.title}</h1>
          <p className="text-lg text-gray-700 mt-2">Author: {book.author}</p>
          <p className="text-lg text-gray-700 mt-2">Description: {book.description}</p>
          <p className="text-lg font-semibold text-green-600 mt-2">Price: ${book.price}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => alert('Added to cart!')}
          >
            Add to Cart
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookPage;

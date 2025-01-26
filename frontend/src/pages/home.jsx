import React, { useState, useEffect } from 'react';
import HomeBookCard from '../components/homeBookCard';
import Navbar from '../components/navBar';
import Footer from '../components/footer';

import booksData from '../assets/books.json';

const Home = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Set the books data from the books.json file
    setBooks(booksData);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Featured Books</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {books.map((book) => (
            <HomeBookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;

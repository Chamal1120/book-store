import React from 'react';
import { useBooks } from '../context/BooksContext'; // Import the custom hook
import HomeBookCard from '../components/homeBookCard';
import Navbar from '../components/navBar';
import Footer from '../components/footer';

const Home = () => {
  const { books, loading, error } = useBooks();

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {loading && <p>Loading books...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {
              books.map((book) => (
                <HomeBookCard key={book.isbn} book={book} />
              ))
            }
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;


import React, { useState, useEffect } from 'react';
import HomeBookCard from '../components/homeBookCard';
import Navbar from '../components/navBar';
import Footer from '../components/footer';

const apiUrl = "https://1u4xu22uxa.execute-api.us-east-1.amazonaws.com/prod/api/v1";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${apiUrl}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching books: ${response.statusText}`);
        }

        const data = await response.json();
        setBooks(data.books || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {loading && <p>Loading books...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {books.map((book) => (
              <HomeBookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;

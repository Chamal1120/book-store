import React, { createContext, useContext, useState, useEffect } from 'react';

const apiUrl = "https://cbdt4kq7ji.execute-api.us-east-1.amazonaws.com/prod/api/";

const BooksContext = createContext();

export const useBooks = () => {
  return useContext(BooksContext);
};

export const BooksProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async (forceRefresh = false) => {
    setLoading(true);

    // Check if books are cached
    const cachedBooks = localStorage.getItem('books');
    const cacheTimestamp = localStorage.getItem('books_timestamp');
    const cacheExpiry = 60 * 60 * 1000; // 1 hour

    // If books are cached and cache is not expired, use the cached data
    if (!forceRefresh && cachedBooks && cacheTimestamp && Date.now() - cacheTimestamp < cacheExpiry) {
      setBooks(JSON.parse(cachedBooks));
      setLoading(false);
      return;
    }

    // Else fetch books from the API
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Error fetching books: ${response.statusText}`);
      }

      const data = await response.json();
      setBooks(data.books || []);
      localStorage.setItem('books', JSON.stringify(data.books || []));
      localStorage.setItem('books_timestamp', Date.now().toString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <BooksContext.Provider value={{ books, loading, error, refreshBooks: () => fetchBooks(true) }}>
      {children}
    </BooksContext.Provider>
  );
};

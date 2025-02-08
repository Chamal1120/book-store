import React, { createContext, useContext, useState, useEffect } from 'react';

const BooksContext = createContext();

export const useBooks = () => {
  return useContext(BooksContext);
};

export const BooksProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      const cachedBooks = localStorage.getItem('books');
      
      if (cachedBooks) {
        setBooks(JSON.parse(cachedBooks));
        setLoading(false);
      } else {
        try {
          const response = await fetch("https://cbdt4kq7ji.execute-api.us-east-1.amazonaws.com/prod/api/");
          
          if (!response.ok) {
            throw new Error(`Error fetching books: ${response.statusText}`);
          }

          const data = await response.json();
          setBooks(data.books || []);
          localStorage.setItem('books', JSON.stringify(data.books || []));
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBooks();
  }, []);

  return (
    <BooksContext.Provider value={{ books, loading, error }}>
      {children}
    </BooksContext.Provider>
  );
};


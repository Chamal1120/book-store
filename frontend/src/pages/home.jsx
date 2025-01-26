import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/navBar';
import Footer from '../components/footer';
import HomeBookCard from '../components/homeBookCard';
import books from '../assets/books.json';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow container mx-auto py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Link key={book.id} to={`/book/${book.id}`}>
              <HomeBookCard
                cover={book.cover}
                title={book.title}
                author={book.author}
                price={book.price}
              />
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;

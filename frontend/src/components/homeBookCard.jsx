import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeBookCard = ({ book }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  return (
    <div
      className="p-4 border rounded-lg shadow-md hover:shadow-lg cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={book.cover}
        alt={book.title}
        className="w-full h-48 object-cover rounded-md"
      />
      <h2 className="mt-2 text-lg font-semibold">{book.title}</h2>
      <p className="text-sm text-gray-600">by {book.author}</p>
      <p className="mt-1 font-bold text-blue-600">${book.price}</p>
    </div>
  );
};

export default HomeBookCard;

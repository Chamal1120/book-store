import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center py-4">
      <p>
        &copy; {new Date().getFullYear()} |{' '}
        <a
          href="https://github.com/SkyOpsCloud"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          SkyOpsCloud
        </a>
      </p>
    </footer>
  );
};

export default Footer;

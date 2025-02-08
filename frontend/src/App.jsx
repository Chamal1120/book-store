import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import BookPage from './pages/bookPage';
import Register from './pages/register.jsx';
import LogIn from './pages/LogIn.jsx';
import NoPage from './pages/noPage';
import { AuthProvider } from './context/AuthContext.jsx';
import { BooksProvider } from './context/BooksContext.jsx';

function App() {
  return (
    <BooksProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<BookPage />} />
            <Route path="/logIn" element={<LogIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NoPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </BooksProvider>
  );
}

export default App;

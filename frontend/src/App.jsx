import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import BookPage from './pages/bookPage';
import NoPage from './pages/noPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book/:id" element={<BookPage />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </Router>
  );
}

export default App;

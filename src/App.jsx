import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'
import Home from "./pages/Home";
import Users from "./pages/Users";
import Listings from "./pages/Listings";
import Register from "./pages/Register";
import UserDetails from "./pages/UserDetails";
import About from './pages/About';
import SagaNews from './pages/SagaNews';
import BookList from './pages/BookList';
import Search from './pages/Search';
import NovelDetailPage from './pages/NovelDetails';
import Header from './Header';
import "./App.css";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/sagaNews" element={<SagaNews />} />
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetails />} />
        <Route path="/trend" element={<Listings />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/bookList" element={<BookList />} />
        <Route path="/search" element={<Search />} />
        <Route path="/novel/:novelId" element={<NovelDetailPage />} />
        <Route path="/novel/:novelId/:novelTitle" element={<NovelDetailPage />} />
        <Route
          path="*"
          element={
            <Header>
              <h1>404 Not Found</h1>
              <p className="status-error">The page you are looking for does not exist.</p>
            </Header>
          }
        />
      </Routes>
    </Router>
  );
}


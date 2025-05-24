import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login'
import Home from "./pages/Home";
import Users from "./pages/Users";
import Listings from "./pages/Listings";
import Register from "./pages/Register";
import UserDetails from "./pages/UserDetails";



export default function App() {
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/users" element={<Users />} />
    <Route path="/users/:id" element={<UserDetails/>} />
    <Route path="/listings" element={<Listings />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    
  </Routes>


}


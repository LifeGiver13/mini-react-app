import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Footer from './Footer';
import './HeadOoter.css';
import "./Listings.css";
import './SagaNews.css';


export default function Header({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem("user");
        setIsLoggedIn(!!user);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("loggedIn");
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        navigate("/login");
        window.location.reload();  // Reload to reset state
    };
    return (
        <>
            <div id="wrapper">
                <div id="navbar">
                    <Link to='/'>
                        <img className="logo" src="/log.svg" alt="Scroll Saga" style={{ width: '190px' }} height="auto" />
                    </Link>
                    <input type="checkbox" id="menu-toggle" />
                    <label htmlFor="menu-toggle" className="hamburger">&#9776;</label>

                    <div className="nav-container">
                        <ul className="nav-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to='/about'>About</Link></li>
                            <li><Link to='/sagaNews'>Saga News</Link></li>
                            <li><Link to="/search">Search</Link></li>

                            {/* <li><Link to="/users">Users</Link></li> */}
                            <li><Link to="/trend">Trending</Link></li>
                            <li><Link to="/bookList">Book List</Link></li>

                            {!isLoggedIn ? (
                                <>
                                    <li><Link to="/register" className='btn'>Register</Link></li>
                                    <li><Link to="/login" className='btn'>Login</Link></li>
                                </>
                            ) : (
                                <li><button type='button' onClick={handleLogout} className="logout-btn">Logout</button></li>
                            )}
                        </ul>
                    </div>
                </div>

                <div id='content'  >

                    {children}
                </div>

                <div id="footer">
                    <Footer />
                </div>
            </div>
        </>
    );
}

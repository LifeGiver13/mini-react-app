import { Link } from 'react-router-dom';
import Footer from './Footer';
import './HeadOoter.css';

export default function Header({ children }) {
    return (
        <>
            <div id="wrapper">
                <div id="navbar">
                    <Link to='/'>
                        <img className="logo" src="/logo.svg" alt="Scroll Saga" style={{ width: '190px' }} height={"auto"} />
                    </Link>
                    <input type="checkbox" id="menu-toggle" />

                    <label htmlFor="menu-toggle" className="hamburger">&#9776;</label>


                    <div className="nav-container">
                        <ul className="nav-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/users">Users</Link></li>
                            <li><Link to="/listings">Listings</Link></li>
                            <li><Link to="/register">Register</Link></li>
                            <li><Link to="/login">Login</Link></li>
                        </ul>
                    </div>
                </div>

                <div id="content">
                    {children}
                </div>

                <div id="footer">
                    <Footer />
                </div>
            </div>
        </>
    );
}

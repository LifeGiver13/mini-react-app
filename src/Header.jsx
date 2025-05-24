import { Link } from 'react-router-dom';
import Footer from './Footer';
import './HeadOoter.css';



export default function Header({ props, children }) {
    return (
        <>
            <div id='wrapper'>
                <div id='navbar'>
                    <nav>

                        <ul className='list'>
                            <li>
                                <img src='logo.svg' alt='Scroll Saga' />
                            </li>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/users">Users</Link>
                            </li>                            
                            <li>
                                <Link to="/user/:id">User Details</Link>
                            </li>
                            <li>
                                <Link to="/listings">Listings</Link>
                            </li>

                            <li>
                                <Link to='/register'>Register</Link>
                            </li>
                            <li>
                                <Link to='/login'>Login</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div id='content'>
                    {children}
                </div>
                <div id='footer'>
                    <Footer />
                </div>
            </div>
        </>
    )
}


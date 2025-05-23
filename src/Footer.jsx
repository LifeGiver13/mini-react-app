import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <>
            <div id='navbar'>
                <nav>

                    <ul className='list'>
                        <li>
                            <Link to="#">Policies</Link>
                        </li>
                        <li>
                            <Link to="/users">Users</Link>
                        </li>
                        <li>
                            <Link to="/listings">Listings</Link>
                        </li>


                    </ul>
                </nav>
            </div>

        </>
    )
}


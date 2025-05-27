import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <>
            <div id='footbar'>
                <ul className='foot-links'>
                    <li>
                        <Link to="#">Policies | </Link>
                    </li>
                    <li>
                        <Link to="/users">Users | </Link>
                    </li>
                    <li>
                        <Link to="/listings">Listings | </Link>
                    </li>


                </ul>
            </div>


        </>
    )
}


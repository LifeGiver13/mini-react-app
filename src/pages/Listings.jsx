import Header from "../Header";
import { useEffect, useState } from "react";
import "../Listings.css"
import { useNavigate } from "react-router-dom";

export default function Listings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate()

    function handleRedirect() {
        window.location.href = "https://lifegiver13.pythonanywhere.com/";

    }

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await fetch("https://lifegiver13.pythonanywhere.com/api/novels", {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch listings');
                }

                const data = await response.json();
                setListings(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);


    return (
        <>
            <Header>
                <h1 >Listings</h1>
                <div className="container">
                    <p>Click on the button to Start Reading each of this Novels on the Official Website: <button onClick={handleRedirect} >Go To site</button> </p>

                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : listings.length === 0 ? (
                        <p>No listings found.</p>
                    ) : (
                        <ul className="list">
                            {listings.map((listing) => (
                                <li key={listing.id} id="myDIV">
                                    <div className="flex-cont">
                                        <img
                                            src={`https://lifegiver13.pythonanywhere.com/static/images/${listing.cover_image}`}
                                            alt={listing.novel_title}
                                        />
                                        <div>
                                            <h3>{listing.novel_title}</h3>
                                            <h4>Author: {listing.author}</h4>
                                            <p>{listing.description}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Header>



        </>
    );
}
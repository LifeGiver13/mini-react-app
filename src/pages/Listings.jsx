import Header from "../Header";
import { useEffect, useState } from "react";
import "../Listings.css"
// import { useNavigate } from "react-router-dom";

export default function Listings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // const navigate = setNavigate()

    // function handleRedirect() {
    //     onclick => useNavigate("https://lifegiver13.pythonanywhere.com/")

    // }

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
                <h1 className="text-2xl font-bold text-center my-4">Listings</h1>
                <div className="container">

                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : listings.length === 0 ? (
                        <p>No listings found.</p>
                    ) : (
                        <ul className="list">
                            <p>Click on the link below to start Reading each of this novels: <button type="redirect" >Go To site</button> </p>
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
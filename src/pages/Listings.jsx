import Header from "../Header";

import { useEffect, useState } from "react";
export default function Listings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
            <Header >
                <h1>Listings</h1>
                <div className="p-4">



                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : listings.length === 0 ? (
                        <p>No listings found.</p>
                    ) : ( 

                        <ul className="space-y-4">
                            {listings.map((listing) => (
                                <li key={listing.id} className="p-4 bg-white rounded shadow">


                                    <img src={listing.cover_image} alt={listing.novel_title} />
                                    <h2 className="text-xl font-bold">{listing.novel_title}</h2>
                                    <p className="text-gray-600">Author: {listing.author}</p>
                                    <p>{listing.description}</p>
                                    {/* Add other fields as needed */}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Header>
        </>
    );
}
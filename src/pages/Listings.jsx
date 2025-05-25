import Header from "../Header";
import { useEffect, useState } from "react";
import "../Listings.css";
import { useNavigate } from "react-router-dom";

export default function Listings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const isLoggedIn = localStorage.getItem("loggedIn") === "true"; // 🔒 check login status

    const handleRedirect = () => window.location.href = "https://lifegiver13.pythonanywhere.com/";

    useEffect(() => {
        if (!isLoggedIn) return;
        const fetchListings = async () => {
            try {
                const res = await fetch("https://lifegiver13.pythonanywhere.com/api/novels", {
                    method: "GET",
                    credentials: "include",
                });
                if (!res.ok) throw new Error('Failed to fetch listings');
                const data = await res.json();
                setListings(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [isLoggedIn]);

    return (
        <Header>
            {!isLoggedIn ? (
                <p className="p-4 text-red-500">You must be logged in to view listings.</p>
            ) : loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : listings.length === 0 ? (
                <p>No listings found.</p>
            ) : (
                <div className="container">
                    <p>
                        Click on the button to Start Reading each of these Novels on the Official Website:{" "}
                        <button onClick={handleRedirect}>Go To Site</button>
                    </p>
                    <ul className="list">
                        {listings.map((l) => (
                            <li key={l.id} id="myDIV">
                                <div className="flex-cont">
                                    <img
                                        src={`https://lifegiver13.pythonanywhere.com/static/images/${l.cover_image}`}
                                        alt={l.novel_title}
                                    />
                                    <div>
                                        <h3>{l.novel_title}</h3>
                                        <h4>Author: {l.author}</h4>
                                        <p>{l.description}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Header>
    );
}

import { useState } from "react";
import Header from "../Header";

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = async (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim() === "") {
            setResults([]);
            setError("");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch(`https://lifegiver13.pythonanywhere.com/api/search?query=${encodeURIComponent(value)}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch search results");
            const data = await res.json();
            setResults(data.results || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header>
                <h1>Search</h1>
                <div className="container" style={{
                    padding: '20px', backgroundImage: 'url(/man.png)', width: '100%',
                    color: 'black', fontFamily: 'Arial, sans-serif', fontWeight: 'bold'
                }}>
                    <p className="search">
                        Search:{" "}
                        <input
                            type="search"
                            value={query}
                            onChange={handleChange}
                            placeholder="Type to search novels..."
                        />
                    </p>
                    {loading && <p>Loading...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {results.length > 0 && (
                        <ul className="list">
                            {results.map((novel) => (
                                <li key={novel.id} className="saying-item">
                                    <img src={novel.cover_image} alt="Anime Character" style={{ maxWidth: '200px', borderRadius: '10px' }} />
                                    <h3>{novel.title}</h3> by <i>{novel.author}</i>
                                    < br />
                                    <span>{novel.description}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Header >
        </>
    );
}
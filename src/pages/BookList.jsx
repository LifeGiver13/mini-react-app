import { useEffect, useState } from "react";
import Header from "../Header";

export default function BookList() {
    const [novels, setNovels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // // Check login status and user ID in localStorage
        // const isLoggedIn = localStorage.getItem("loggedIn") === "true";
        // const userId = localStorage.getItem("userId");
        // if (!isLoggedIn || !userId) {
        //     window.location.href = "/login";
        //     return;
        // }

        const fetchBookList = async () => {
            try {
                const res = await fetch("https://lifegiver13.pythonanywhere.com/api/my_booklist", {
                    credentials: "include",
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || "Failed to fetch book list");
                }
                const data = await res.json();
                setNovels(data.novels || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBookList();
    }, []);

    return (
        <>
            <Header>
                <h1>Book List</h1>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {novels.length > 0 ? (
                    <ul>
                        {novels.map((novel) => (
                            <li key={novel.id}>
                                <strong>{novel.title}</strong> by {novel.author}
                            </li>
                        ))}
                    </ul>
                ) : !loading && <p>No books found.</p>}
            </Header>
        </>
    );
}
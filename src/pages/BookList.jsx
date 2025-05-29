import { useEffect, useState } from "react";
import Header from "../Header";
import { useNavigate } from "react-router-dom";

export default function BookList() {
    const [novels, setNovels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const isLoggedIn = localStorage.getItem("loggedIn") === "true"; // 🔒 check login statu


    useEffect(() => {
        const fetchBookList = async () => {
            const userId = localStorage.getItem("userId");

            if (!userId) {
                setError("User not logged in.");
                navigate('/login')

                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`https://lifegiver13.pythonanywhere.com/api/my_booklist?user_id=${userId}`, {
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
        <Header>
            <h1>Book List</h1>
            {!isLoggedIn ? (
                <p>You must be loggedIn to view your booklist</p>
            ) : loading ? (
                <p>Loading ...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                novels.length === 0 ? (
                    <p>No listings found.</p>
                ) : (

                    <ul className="list">
                        {novels.map((novel) => (
                            <div key={novel.novel_id} className="book-card" id="myDIV" >
                                <div className="flex-cont">
                                    <h2>{novel.novel_title}</h2>
                                    <img src={`https://lifegiver13.pythonanywhere.com/static/images/${novel.cover_image}`} />

                                    <p>by {novel.author}</p>
                                </div>
                            </div>
                        ))}
                    </ul>
                )
            )
            }


        </Header>
    );
}

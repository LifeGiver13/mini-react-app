import Header from "../Header";
import { useEffect, useState } from "react";
import '../SagaNews.css';

export default function SagaNews() {
    const [novels, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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
    }, []);

    return (
        <>
            <Header>
                <h1>Saga News</h1>
                <div>
                    <img style={{ width: '100%' }} src="/sagaNews.png" alt="Saga News" />
                    <p>
                        Welcome to Saga News, your go-to source for the latest updates and insights on the world of Saga. Stay informed with our comprehensive coverage of news, events, and developments in the Saga ecosystem.
                    </p>
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p style={{ color: "red" }}>{error}</p>
                    ) : (
                        <div className="release-table-wrapper">
                            <table className="release-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Author</th>
                                        <th>Date</th>
                                        <th>Summary</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {novels.map((novel) => (
                                        <tr key={novel.novel_id}>
                                            <td>{novel.novel_title}</td>
                                            <td>{novel.genre}</td>
                                            <td>{novel.author}</td>
                                            <td>{novel.publish_date}</td>
                                            <td>{novel.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Header>
        </>
    );
}
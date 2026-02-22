import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import {
  API_ENDPOINTS,
  buildApiUrl,
  getNovelAuthor,
  getNovelCover,
  getNovelId,
  getNovelSlug,
  getNovelTitle,
} from "../constants/api";

export default function BookList() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  const handleDetailsRedirect = (novelId, novelTitle) => {
    const novelSlug = getNovelSlug(novelTitle);
    navigate(`/novel/${novelId}/${encodeURIComponent(novelSlug)}`);
  };

  useEffect(() => {
    const fetchBookList = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User not logged in.");
        navigate("/login");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.myBooklist(userId)), {
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
  }, [navigate]);

  return (
    <Header>
      <h1>Book List</h1>
      {!isLoggedIn ? (
        <p>You must be logged in to view your book list.</p>
      ) : loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="status-error">{error}</p>
      ) : novels.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div className="container themed-panel bg-man">
          <ul className="list">
            {novels.map((novel) => {
              const novelId = getNovelId(novel);
              const novelTitle = getNovelTitle(novel);

              return (
                <li key={novelId ?? novelTitle} className="book-card" id="myDIV">
                  <div className="flex-cont">
                    <h2>{novelTitle}</h2>
                    <img src={getNovelCover(novel)} alt={novelTitle} loading="lazy" />
                    <p>by {getNovelAuthor(novel)}</p>
                    <button
                      className="logout-btn"
                      onClick={() => handleDetailsRedirect(novelId, novelTitle)}
                    >
                      Read Now!
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Header>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import {
  API_ENDPOINTS,
  buildApiUrl,
  getNovelAuthor,
  getNovelCover,
  getNovelDescription,
  getNovelId,
  getNovelSlug,
  getNovelTitle,
} from "../constants/api";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  const handleDetailsRedirect = (novelId, novelTitle) => {
    const novelSlug = getNovelSlug(novelTitle);
    navigate(`/novel/${novelId}/${encodeURIComponent(novelSlug)}`);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      setLoading(false);
      return;
    }

    const fetchListings = async () => {
      try {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.novels), {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await res.json();
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [isLoggedIn, navigate]);

  return (
    <Header>
      <h1>Trending</h1>
      {!isLoggedIn ? (
        <p className="status-error">You must be logged in to view listings.</p>
      ) : loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="status-error">{error}</p>
      ) : listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div className="container themed-panel bg-man">
          <p className="callout-text">Choose a novel and continue reading directly in this app.</p>
          <ul className="list">
            {listings.map((novel) => {
              const novelId = getNovelId(novel);
              const novelTitle = getNovelTitle(novel);

              return (
                <li key={novelId ?? novelTitle} id="myDIV">
                  <div className="flex-cont">
                    <img src={getNovelCover(novel)} alt={novelTitle} loading="lazy" />
                    <div>
                      <h3>{novelTitle}</h3>
                      <h4>Author: {getNovelAuthor(novel)}</h4>
                      <p>{getNovelDescription(novel)}</p>
                      <button
                        className="logout-btn"
                        onClick={() => handleDetailsRedirect(novelId, novelTitle)}
                      >
                        Read Now!
                      </button>
                    </div>
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

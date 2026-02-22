import { useState } from "react";
import { Link } from "react-router-dom";
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

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (event) => {
    const value = event.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setResults([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.search(value)), {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Header>
      <h1>Search</h1>
      <div className="container themed-panel bg-man">
        <p className="search">
          Search
          <input
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Type to search novels..."
            aria-label="Search novels"
          />
        </p>

        {loading && <p>Loading...</p>}
        {error && <p className="status-error">{error}</p>}

        {results.length > 0 && (
          <ul className="list">
            {results.map((novel) => (
              <li key={getNovelId(novel) ?? getNovelTitle(novel)} className="saying-item">
                <img src={getNovelCover(novel)} alt={getNovelTitle(novel)} loading="lazy" />
                <h3>{getNovelTitle(novel)}</h3>
                <p>by {getNovelAuthor(novel)}</p>
                <span>{getNovelDescription(novel)}</span>
                <Link
                  to={`/novel/${getNovelId(novel)}/${encodeURIComponent(
                    getNovelSlug(getNovelTitle(novel)),
                  )}`}
                  className="logout-btn compact-btn"
                >
                  Read Now
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Header>
  );
}

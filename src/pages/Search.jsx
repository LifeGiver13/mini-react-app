import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const parseResponseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedNovelIds, setSavedNovelIds] = useState(new Set());
  const [savingNovelIds, setSavingNovelIds] = useState(new Set());
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  useEffect(() => {
    const fetchSavedBooks = async () => {
      if (!isLoggedIn) {
        setSavedNovelIds(new Set());
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        return;
      }

      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.myBooklist(userId)), {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const ids = new Set(
          (payload?.novels || [])
            .map((novel) => Number(getNovelId(novel)))
            .filter((id) => !Number.isNaN(id)),
        );
        setSavedNovelIds(ids);
      } catch {
        // No blocking action for saved state bootstrap in search page.
      }
    };

    fetchSavedBooks();
  }, [isLoggedIn]);

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

  const handleToggleSave = async (novelId) => {
    if (!novelId) {
      return;
    }

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setSaveError("");
    setSaveSuccess("");

    const numericNovelId = Number(novelId);
    const isCurrentlySaved = savedNovelIds.has(numericNovelId);
    const endpoint = isCurrentlySaved
      ? API_ENDPOINTS.unsaveNovel(numericNovelId)
      : API_ENDPOINTS.saveNovel(numericNovelId);

    setSavingNovelIds((prev) => new Set(prev).add(numericNovelId));

    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const payload = await parseResponseJson(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update book list.");
      }

      setSavedNovelIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlySaved) {
          next.delete(numericNovelId);
        } else {
          next.add(numericNovelId);
        }
        return next;
      });

      setSaveSuccess(
        payload?.message || (isCurrentlySaved ? "Removed from book list." : "Saved to book list."),
      );
    } catch (toggleError) {
      setSaveError(toggleError.message || "Failed to update book list.");
    } finally {
      setSavingNovelIds((prev) => {
        const next = new Set(prev);
        next.delete(numericNovelId);
        return next;
      });
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
        {saveError && <p className="status-error">{saveError}</p>}
        {saveSuccess && <p className="status-success">{saveSuccess}</p>}

        {results.length > 0 && (
          <ul className="list">
            {results.map((novel) => {
              const novelId = getNovelId(novel);
              const novelTitle = getNovelTitle(novel);
              const isSaved = savedNovelIds.has(Number(novelId));
              const isSaving = savingNovelIds.has(Number(novelId));

              return (
                <li key={novelId ?? novelTitle} className="saying-item">
                  <img src={getNovelCover(novel)} alt={novelTitle} loading="lazy" />
                  <h3>{novelTitle}</h3>
                  <p>by {getNovelAuthor(novel)}</p>
                  <span>{getNovelDescription(novel)}</span>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="logout-btn compact-btn"
                      onClick={() => handleToggleSave(novelId)}
                      disabled={isSaving}
                    >
                      {isSaving ? "Working..." : isSaved ? "Unsave" : "Save"}
                    </button>
                    <Link
                      to={`/novel/${novelId}/${encodeURIComponent(getNovelSlug(novelTitle))}`}
                      className="logout-btn compact-btn"
                    >
                      Read Now
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Header>
  );
}

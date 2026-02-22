import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import {
  API_ENDPOINTS,
  buildApiUrl,
  buildRequestHeaders,
  getCurrentUserId,
  getNovelAuthor,
  getNovelCover,
  getNovelDescription,
  getNovelId,
  getNovelSlug,
  getNovelTitle,
  getUserFriendlyErrorMessage,
  normalizeAverageRating,
} from "../constants/api";

const parseResponseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const buildStars = (averageRating) => {
  const rounded = Math.round(normalizeAverageRating(averageRating, 3));
  return `${"\u2605".repeat(rounded)}${"\u2606".repeat(5 - rounded)}`;
};

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [statsByNovelId, setStatsByNovelId] = useState({});
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

  useEffect(() => {
    if (results.length === 0) {
      setStatsByNovelId({});
      return;
    }

    let cancelled = false;
    const ids = results
      .map((novel) => Number(getNovelId(novel)))
      .filter((id) => !Number.isNaN(id));

    Promise.all(
      ids.map(async (id) => {
        try {
          const response = await fetch(buildApiUrl(API_ENDPOINTS.novelStats(id)), {
            method: "GET",
            headers: buildRequestHeaders(
              { Accept: "application/json" },
              { includeUserId: true },
            ),
          });

          if (!response.ok) {
            return [id, null];
          }

          const payload = await parseResponseJson(response);
          return [id, payload];
        } catch {
          return [id, null];
        }
      }),
    ).then((entries) => {
      if (cancelled) {
        return;
      }

      setStatsByNovelId((prev) => {
        const next = { ...prev };
        entries.forEach(([id, payload]) => {
          if (payload) {
            next[id] = payload;
          }
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [results]);

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
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(
          err,
          "Unable to load search results. Please refresh and try again.",
        ),
      );
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
    const userId = getCurrentUserId();

    if (!userId) {
      setSaveError("Missing user id. Please log in again.");
      return;
    }

    setSavingNovelIds((prev) => new Set(prev).add(numericNovelId));

    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method: "POST",
        headers: buildRequestHeaders(
          { "Content-Type": "application/json", Accept: "application/json" },
          { includeUserId: true },
        ),
        body: JSON.stringify({}),
      });
      const payload = await parseResponseJson(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Authentication required. Please log in again to sync your book list.",
          );
        }
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
      setSaveError(
        getUserFriendlyErrorMessage(
          toggleError,
          "Unable to update your book list. Please refresh and try again.",
        ),
      );
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
              const stats = statsByNovelId[Number(novelId)] ?? null;
              const averageRating = normalizeAverageRating(stats?.average_rating, 3);
              const ratingCount = Number(stats?.ratings_count ?? 0);

              return (
                <li key={novelId ?? novelTitle} className="saying-item">
                  <img src={getNovelCover(novel)} alt={novelTitle} loading="lazy" />
                  <h3>{novelTitle}</h3>
                  <p>by {getNovelAuthor(novel)}</p>
                  <p className="rating-summary" aria-label={`Average rating ${averageRating} out of 5`}>
                    <span className="rating-stars">{buildStars(averageRating)}</span>
                    <span>{averageRating.toFixed(1)} / 5 ({ratingCount})</span>
                  </p>
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

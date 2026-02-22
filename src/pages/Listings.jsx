import { useEffect, useState } from "react";
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

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [statsByNovelId, setStatsByNovelId] = useState({});
  const [savedNovelIds, setSavedNovelIds] = useState(new Set());
  const [savingNovelIds, setSavingNovelIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
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
        const userId = localStorage.getItem("userId");
        const novelsRes = await fetch(buildApiUrl(API_ENDPOINTS.novels), {
          method: "GET",
        });

        if (!novelsRes.ok) {
          throw new Error("Failed to fetch listings");
        }

        const novelsData = await novelsRes.json();
        setListings(novelsData);
        setStatsByNovelId({});
        setLoading(false);

        const novelIds = (Array.isArray(novelsData) ? novelsData : [])
          .map((novel) => Number(getNovelId(novel)))
          .filter((id) => !Number.isNaN(id));

        Promise.all(
          novelIds.map(async (id) => {
            try {
              const statsRes = await fetch(buildApiUrl(API_ENDPOINTS.novelStats(id)), {
                method: "GET",
                headers: buildRequestHeaders(
                  { Accept: "application/json" },
                  { includeUserId: true },
                ),
              });

              if (!statsRes.ok) {
                return [id, null];
              }

              const statsPayload = await parseResponseJson(statsRes);
              return [id, statsPayload];
            } catch {
              return [id, null];
            }
          }),
        ).then((entries) => {
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

        if (!userId) {
          return;
        }

        fetch(buildApiUrl(API_ENDPOINTS.myBooklist(userId)), { method: "GET" })
          .then(async (savedRes) => {
            if (!savedRes.ok) {
              return;
            }
            const savedData = await savedRes.json();
            const savedIds = new Set(
              (savedData?.novels || [])
                .map((novel) => Number(getNovelId(novel)))
                .filter((id) => !Number.isNaN(id)),
            );
            setSavedNovelIds(savedIds);
          })
          .catch(() => {
            // Saved-state bootstrap should not block listings render.
          });
      } catch (err) {
        setError(
          getUserFriendlyErrorMessage(
            err,
            "Unable to load listings. Please refresh and try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [isLoggedIn, navigate]);

  const handleToggleSave = async (novelId) => {
    if (!novelId) {
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
          {saveError && <p className="status-error">{saveError}</p>}
          {saveSuccess && <p className="status-success">{saveSuccess}</p>}
          <ul className="list">
            {listings.map((novel) => {
              const novelId = getNovelId(novel);
              const novelTitle = getNovelTitle(novel);
              const isSaved = savedNovelIds.has(Number(novelId));
              const isSaving = savingNovelIds.has(Number(novelId));
              const stats = statsByNovelId[Number(novelId)] ?? null;
              const averageRating = normalizeAverageRating(stats?.average_rating, 3);
              const ratingCount = Number(stats?.ratings_count ?? 0);

              return (
                <li key={novelId ?? novelTitle} id="myDIV">
                  <div className="flex-cont">
                    <img src={getNovelCover(novel)} alt={novelTitle} loading="lazy" />
                    <div>
                      <h3>{novelTitle}</h3>
                      <h4>Author: {getNovelAuthor(novel)}</h4>
                      <p className="rating-summary" aria-label={`Average rating ${averageRating} out of 5`}>
                        <span className="rating-stars">{buildStars(averageRating)}</span>
                        <span>{averageRating.toFixed(1)} / 5 ({ratingCount})</span>
                      </p>
                      <p>{getNovelDescription(novel)}</p>
                      <div className="card-actions">
                        <button
                          type="button"
                          className="logout-btn compact-btn"
                          onClick={() => handleToggleSave(novelId)}
                          disabled={isSaving}
                        >
                          {isSaving ? "Working..." : isSaved ? "Unsave" : "Save"}
                        </button>
                        <button
                          className="logout-btn"
                          onClick={() => handleDetailsRedirect(novelId, novelTitle)}
                        >
                          Read Now!
                        </button>
                      </div>
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

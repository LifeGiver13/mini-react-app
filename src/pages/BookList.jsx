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

export default function BookList() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingNovelIds, setSavingNovelIds] = useState(new Set());
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  const handleDetailsRedirect = (novelId, novelTitle) => {
    const novelSlug = getNovelSlug(novelTitle);
    navigate(`/novel/${novelId}/${encodeURIComponent(novelSlug)}`);
  };

  const handleUnsave = async (novelId) => {
    if (!novelId) {
      return;
    }

    setSaveError("");
    setSaveSuccess("");
    const numericNovelId = Number(novelId);
    const userId = getCurrentUserId();
    if (!userId) {
      setSaveError("Missing user id. Please log in again.");
      return;
    }

    setSavingNovelIds((prev) => new Set(prev).add(numericNovelId));

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.unsaveNovel(numericNovelId)), {
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
        throw new Error(payload?.message || "Failed to remove from book list.");
      }

      setNovels((prev) => prev.filter((novel) => Number(getNovelId(novel)) !== numericNovelId));
      setSaveSuccess(payload?.message || "Removed from your book list.");
    } catch (unsaveError) {
      setSaveError(unsaveError.message || "Failed to remove from book list.");
    } finally {
      setSavingNovelIds((prev) => {
        const next = new Set(prev);
        next.delete(numericNovelId);
        return next;
      });
    }
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
          method: "GET",
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
          {saveError && <p className="status-error">{saveError}</p>}
          {saveSuccess && <p className="status-success">{saveSuccess}</p>}
          <ul className="list">
            {novels.map((novel) => {
              const novelId = getNovelId(novel);
              const novelTitle = getNovelTitle(novel);
              const isSaving = savingNovelIds.has(Number(novelId));

              return (
                <li key={novelId ?? novelTitle} className="book-card" id="myDIV">
                  <div className="flex-cont">
                    <h2>{novelTitle}</h2>
                    <img src={getNovelCover(novel)} alt={novelTitle} loading="lazy" />
                    <p>by {getNovelAuthor(novel)}</p>
                    <div className="card-actions">
                      <button
                        type="button"
                        className="logout-btn compact-btn"
                        onClick={() => handleUnsave(novelId)}
                        disabled={isSaving}
                      >
                        {isSaving ? "Working..." : "Unsave"}
                      </button>
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

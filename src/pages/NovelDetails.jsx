import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header";
import {
  API_ENDPOINTS,
  buildApiUrl,
  buildImageUrl,
  buildRequestHeaders,
  getCurrentUserId,
  getNovelAuthor,
  getNovelCover,
  getNovelDescription,
  getNovelId,
  getNovelSlug,
  getNovelTitle,
} from "../constants/api";

const splitChapterContent = (rawContent) => {
  const content = String(rawContent ?? "");
  const byLine = content
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (byLine.length > 1) {
    return byLine;
  }

  return content
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const tryParseJson = async (response) => {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
};

const formatReviewDate = (publishTime) => {
  if (!publishTime) {
    return "Unknown date";
  }

  const parsedDate = new Date(publishTime);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(publishTime);
  }

  return parsedDate.toLocaleString();
};

export default function NovelDetailPage() {
  const { novelId, novelTitle } = useParams();
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeRouteTitle, setActiveRouteTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [ratingValue, setRatingValue] = useState("5");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [error, setError] = useState("");
  const [chapterError, setChapterError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState("");

  const readNovelId = Number(novelId);

  const loadChapter = useCallback(
    async (chapterNumber, withLoadingState = true) => {
      if (chapterNumber === null || chapterNumber === undefined) {
        return;
      }

      if (withLoadingState) {
        setChapterLoading(true);
      }

      setChapterError("");
      try {
        const chapterRes = await fetch(
          buildApiUrl(API_ENDPOINTS.chapter(readNovelId, chapterNumber)),
          {
            method: "GET",
            headers: { Accept: "application/json" },
          },
        );

        const chapterData = await tryParseJson(chapterRes);
        if (!chapterRes.ok || !chapterData) {
          throw new Error("Failed to load chapter.");
        }

        setCurrentChapter(chapterData);
      } catch (loadError) {
        setChapterError(loadError.message || "Failed to load chapter.");
      } finally {
        if (withLoadingState) {
          setChapterLoading(false);
        }
      }
    },
    [readNovelId],
  );

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const trimmedComment = commentText.trim();
    const userId = getCurrentUserId();

    setCommentError("");
    setCommentSuccess("");

    if (!trimmedComment) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    if (!activeRouteTitle) {
      setCommentError("Unable to post comment right now. Refresh and try again.");
      return;
    }

    if (!userId) {
      setCommentError("Missing user id. Please log in again.");
      return;
    }

    setCommentLoading(true);
    try {
      const postResponse = await fetch(
        buildApiUrl(API_ENDPOINTS.novelDetails(readNovelId, activeRouteTitle)),
        {
          method: "POST",
          headers: buildRequestHeaders(
            { Accept: "application/json", "Content-Type": "application/json" },
            { includeUserId: true },
          ),
          body: JSON.stringify({ content: trimmedComment }),
        },
      );

      const postData = await tryParseJson(postResponse);
      if (!postResponse.ok) {
        throw new Error(postData?.message || "Failed to post comment. Please login first.");
      }

      setCommentText("");
      setCommentSuccess(postData?.message || "Comment posted.");

      const refreshResponse = await fetch(
        buildApiUrl(API_ENDPOINTS.novelDetails(readNovelId, activeRouteTitle)),
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
      );

      const refreshData = await tryParseJson(refreshResponse);
      if (refreshResponse.ok && refreshData) {
        setReviews(Array.isArray(refreshData.reviews) ? refreshData.reviews : []);
      }
    } catch (submitError) {
      setCommentError(submitError.message || "Failed to post comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleRatingSubmit = async (event) => {
    event.preventDefault();
    const userId = getCurrentUserId();

    setRatingError("");
    setRatingSuccess("");

    if (!userId) {
      setRatingError("Missing user id. Please log in again.");
      return;
    }

    const numericRating = Number(ratingValue);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      setRatingError("Please select a rating between 1 and 5.");
      return;
    }

    setRatingLoading(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.rateNovel(readNovelId)), {
        method: "POST",
        headers: buildRequestHeaders(
          { Accept: "application/json", "Content-Type": "application/json" },
          { includeUserId: true },
        ),
        body: JSON.stringify({ rating: numericRating }),
      });
      const payload = await tryParseJson(response);

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "Failed to submit rating.");
      }

      setRatingSuccess(payload?.message || "Rating submitted.");
    } catch (submitError) {
      setRatingError(submitError.message || "Failed to submit rating.");
    } finally {
      setRatingLoading(false);
    }
  };

  useEffect(() => {
    const fetchDetailsByTitle = async (titleCandidate) => {
      if (!titleCandidate) {
        return null;
      }

      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.novelDetails(readNovelId, titleCandidate)),
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
      );

      const responseData = await tryParseJson(response);
      if (!response.ok || !responseData) {
        return null;
      }

      return { data: responseData, matchedTitle: titleCandidate };
    };

    const fetchNovelDetails = async () => {
      if (!readNovelId || Number.isNaN(readNovelId)) {
        setError("Invalid novel id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setChapterError("");
      setCommentError("");
      setCommentSuccess("");
      setRatingError("");
      setRatingSuccess("");
      setCurrentChapter(null);

      try {
        let detailsData = null;
        let matchedRouteTitle = "";

        const primaryTitle = novelTitle ? decodeURIComponent(novelTitle) : "";
        const primaryResult = await fetchDetailsByTitle(primaryTitle);
        if (primaryResult) {
          detailsData = primaryResult.data;
          matchedRouteTitle = primaryResult.matchedTitle;
        } else {
          const novelsRes = await fetch(buildApiUrl(API_ENDPOINTS.novels), {
            method: "GET",
            headers: { Accept: "application/json" },
          });
          const novelsData = await tryParseJson(novelsRes);
          const selectedNovel = Array.isArray(novelsData)
            ? novelsData.find((item) => Number(getNovelId(item)) === readNovelId)
            : null;

          const fallbackCandidates = [];
          const selectedNovelTitle = selectedNovel ? getNovelTitle(selectedNovel) : "";
          if (selectedNovelTitle && selectedNovelTitle !== primaryTitle) {
            fallbackCandidates.push(selectedNovelTitle);
          }
          const selectedNovelSlug = getNovelSlug(selectedNovelTitle);
          if (
            selectedNovelSlug &&
            selectedNovelSlug !== primaryTitle &&
            !fallbackCandidates.includes(selectedNovelSlug)
          ) {
            fallbackCandidates.push(selectedNovelSlug);
          }

          for (const candidate of fallbackCandidates) {
            const fallbackResult = await fetchDetailsByTitle(candidate);
            if (fallbackResult) {
              detailsData = fallbackResult.data;
              matchedRouteTitle = fallbackResult.matchedTitle;
              break;
            }
          }
        }

        if (!detailsData) {
          throw new Error("Failed to fetch novel details.");
        }

        const chapterList = Array.isArray(detailsData.chapters)
          ? [...detailsData.chapters].sort(
              (a, b) => Number(a.chapter_number) - Number(b.chapter_number),
            )
          : [];

        setNovel(detailsData.novel ?? null);
        setChapters(chapterList);
        setReviews(Array.isArray(detailsData.reviews) ? detailsData.reviews : []);
        setActiveRouteTitle(matchedRouteTitle);

        const firstChapter = detailsData.first_chapter ?? chapterList[0] ?? null;
        if (firstChapter?.chapter_id !== undefined || firstChapter?.content) {
          setCurrentChapter(firstChapter);
        } else if (firstChapter?.chapter_number !== undefined) {
          await loadChapter(firstChapter.chapter_number, false);
        }
      } catch (fetchError) {
        setError(fetchError.message || "Failed to fetch novel details.");
      } finally {
        setLoading(false);
      }
    };

    fetchNovelDetails();
  }, [loadChapter, novelTitle, readNovelId]);

  const firstChapter = chapters[0] ?? null;
  const lastChapter = chapters[chapters.length - 1] ?? null;
  const currentChapterIndex = useMemo(
    () =>
      chapters.findIndex(
        (chapter) =>
          Number(chapter.chapter_number) === Number(currentChapter?.chapter_number),
      ),
    [chapters, currentChapter?.chapter_number],
  );
  const previousChapter =
    currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter =
    currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1
      ? chapters[currentChapterIndex + 1]
      : null;
  const currentChapterParagraphs = useMemo(
    () => splitChapterContent(currentChapter?.content),
    [currentChapter],
  );

  return (
    <Header>
      <h1>{novel ? getNovelTitle(novel) : "Novel Details"}</h1>
      <div className="container themed-panel bg-man">
        {loading ? (
          <p>Loading novel details...</p>
        ) : error ? (
          <p className="status-error">{error}</p>
        ) : (
          <div className="novel-detail-layout">
            <aside className="novel-detail-sidebar">
              <img
                src={getNovelCover(novel)}
                alt={getNovelTitle(novel)}
                className="novel-detail-cover"
                loading="lazy"
              />

              <div className="novel-meta">
                <p>
                  <strong>Author:</strong> {getNovelAuthor(novel)}
                </p>
                <p>
                  <strong>Genre:</strong> {novel?.genre || "General"}
                </p>
                <p>{getNovelDescription(novel)}</p>
              </div>

              <form className="rating-form" onSubmit={handleRatingSubmit}>
                <label htmlFor="novel-rating-select">Rate this novel</label>
                <div className="rating-row">
                  <select
                    id="novel-rating-select"
                    value={ratingValue}
                    onChange={(event) => setRatingValue(event.target.value)}
                    disabled={ratingLoading}
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Very Poor</option>
                  </select>
                  <button
                    type="submit"
                    className="logout-btn compact-btn"
                    disabled={ratingLoading}
                  >
                    {ratingLoading ? "Submitting..." : "Submit Rating"}
                  </button>
                </div>
                {ratingError && <p className="status-error">{ratingError}</p>}
                {ratingSuccess && <p className="status-success">{ratingSuccess}</p>}
              </form>

              <div className="chapter-controls">
                <button
                  type="button"
                  className="logout-btn compact-btn"
                  disabled={!firstChapter || chapterLoading}
                  onClick={() => loadChapter(firstChapter.chapter_number)}
                >
                  Read First
                </button>
                <button
                  type="button"
                  className="logout-btn compact-btn"
                  disabled={!lastChapter || chapterLoading}
                  onClick={() => loadChapter(lastChapter.chapter_number)}
                >
                  Read Last
                </button>
              </div>

              <div className="chapter-links">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.chapter_id ?? chapter.chapter_number}
                    type="button"
                    className={`chapter-link${
                      Number(currentChapter?.chapter_number) ===
                      Number(chapter.chapter_number)
                        ? " active"
                        : ""
                    }`}
                    onClick={() => loadChapter(chapter.chapter_number)}
                    disabled={chapterLoading}
                  >
                    {chapter.chapter_name || `Chapter ${chapter.chapter_number}`}
                  </button>
                ))}
              </div>
            </aside>

            <section className="chapter-reader">
              {chapterError ? (
                <p className="status-error">{chapterError}</p>
              ) : chapterLoading ? (
                <p>Loading chapter...</p>
              ) : !currentChapter ? (
                <p>No chapter selected.</p>
              ) : (
                <>
                  <h2>{currentChapter.chapter_name}</h2>
                  <div className="chapter-reader-content">
                    {currentChapterParagraphs.map((paragraph, index) => (
                      <p key={`${currentChapter.chapter_id}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                  <div className="chapter-bottom-nav">
                    <button
                      type="button"
                      className="logout-btn compact-btn"
                      disabled={!previousChapter || chapterLoading}
                      onClick={() => loadChapter(previousChapter.chapter_number)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="logout-btn compact-btn"
                      disabled={!nextChapter || chapterLoading}
                      onClick={() => loadChapter(nextChapter.chapter_number)}
                    >
                      Next
                    </button>
                  </div>

                  <div className="novel-comments">
                    <h3>Comments</h3>
                    {reviews.length === 0 ? (
                      <p>No comments yet. Be the first to add one.</p>
                    ) : (
                      <ul className="comment-list">
                        {reviews.map((review, index) => {
                          const rawPhoto = review?.profile_photo ?? "";
                          const profilePhoto = /^https?:\/\//i.test(rawPhoto)
                            ? rawPhoto
                            : buildImageUrl(rawPhoto);

                          return (
                            <li
                              key={review.review_id ?? `${review.username ?? "user"}-${index}`}
                              className="comment-item"
                            >
                              <div className="comment-header">
                                <img
                                  src={profilePhoto || "/vite.svg"}
                                  alt={`${review.username ?? "User"} profile`}
                                  className="comment-avatar"
                                  loading="lazy"
                                />
                                <div className="comment-meta">
                                  <span className="comment-username">
                                    {review.username ?? "Anonymous"}
                                  </span>
                                  <span className="comment-date">
                                    {formatReviewDate(review.publish_time)}
                                  </span>
                                </div>
                              </div>
                              <p className="comment-text">
                                {review.review_text ?? review.content ?? ""}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <form className="comment-form" onSubmit={handleCommentSubmit}>
                      <label htmlFor="novel-comment-input">Add a comment</label>
                      <textarea
                        id="novel-comment-input"
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                        placeholder="Write your comment..."
                        rows={4}
                        disabled={commentLoading}
                      />
                      <div className="comment-form-actions">
                        <button
                          type="submit"
                          className="logout-btn compact-btn"
                          disabled={commentLoading}
                        >
                          {commentLoading ? "Posting..." : "Post Comment"}
                        </button>
                        {commentError && <p className="status-error">{commentError}</p>}
                        {commentSuccess && <p className="status-success">{commentSuccess}</p>}
                      </div>
                    </form>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </Header>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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

export default function NovelDetailPage() {
  const { novelId, novelTitle } = useParams();
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [error, setError] = useState("");
  const [chapterError, setChapterError] = useState("");

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
            credentials: "include",
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

  useEffect(() => {
    const fetchNovelDetails = async () => {
      if (!readNovelId || Number.isNaN(readNovelId)) {
        setError("Invalid novel id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setChapterError("");

      try {
        const titleCandidates = [];
        if (novelTitle) {
          titleCandidates.push(decodeURIComponent(novelTitle));
        }

        const novelsRes = await fetch(buildApiUrl(API_ENDPOINTS.novels), {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        const novelsData = await tryParseJson(novelsRes);
        const selectedNovel = Array.isArray(novelsData)
          ? novelsData.find((item) => Number(getNovelId(item)) === readNovelId)
          : null;

        const selectedNovelTitle = selectedNovel ? getNovelTitle(selectedNovel) : "";
        if (selectedNovelTitle && !titleCandidates.includes(selectedNovelTitle)) {
          titleCandidates.push(selectedNovelTitle);
        }
        const selectedNovelSlug = getNovelSlug(selectedNovelTitle);
        if (selectedNovelSlug && !titleCandidates.includes(selectedNovelSlug)) {
          titleCandidates.push(selectedNovelSlug);
        }
        if (titleCandidates.length === 0) {
          titleCandidates.push("novel");
        }

        let detailsData = null;
        for (const candidate of titleCandidates) {
          const detailsRes = await fetch(
            buildApiUrl(API_ENDPOINTS.novelDetails(readNovelId, candidate)),
            {
              method: "GET",
              headers: { Accept: "application/json" },
              credentials: "include",
            },
          );

          const responseData = await tryParseJson(detailsRes);
          if (detailsRes.ok && responseData) {
            detailsData = responseData;
            break;
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

        const firstChapter = detailsData.first_chapter ?? chapterList[0] ?? null;
        if (firstChapter?.chapter_number !== undefined) {
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
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </Header>
  );
}

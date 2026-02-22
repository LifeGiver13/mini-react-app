import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Header";
import {
  API_ENDPOINTS,
  buildApiUrl,
  getNovelAuthor,
  getNovelDescription,
  getNovelId,
  getNovelSlug,
  getNovelTitle,
  getUserFriendlyErrorMessage,
} from "../constants/api";

const QUOTES_LIMIT = 3;
const ACCORDION_LIMIT = 6;

export default function Home() {
  const [sayings, setSayings] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quotesError, setQuotesError] = useState("");
  const [novels, setNovels] = useState([]);
  const [novelsLoading, setNovelsLoading] = useState(true);
  const [novelsError, setNovelsError] = useState("");

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch(
          `https://my-json-server.typicode.com/SanskritiGupta05/AniQuotes/quotes?_page=1&_limit=${QUOTES_LIMIT}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sayings");
        }

        const data = await response.json();
        setSayings(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        setQuotesError(
          getUserFriendlyErrorMessage(
            fetchError,
            "Unable to load quotes right now. Please refresh and try again.",
          ),
        );
      } finally {
        setQuotesLoading(false);
      }
    };

    const fetchNovels = async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.novels), {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch novels");
        }

        const data = await response.json();
        const novelList = Array.isArray(data) ? data.slice(0, ACCORDION_LIMIT) : [];
        setNovels(novelList);
      } catch (fetchError) {
        setNovelsError(
          getUserFriendlyErrorMessage(
            fetchError,
            "Unable to load novels right now. Please refresh and try again.",
          ),
        );
      } finally {
        setNovelsLoading(false);
      }
    };

    fetchQuotes();
    fetchNovels();
  }, []);

  return (
    <Header>
      <h1>Home</h1>
      <div className="container themed-panel bg-man">
        <div className="content-stack">
          <section className="home-novel-accordion">
            <h2>Novel Quick Browse</h2>
            {novelsLoading ? (
              <p>Loading novels...</p>
            ) : novelsError ? (
              <p className="status-error">{novelsError}</p>
            ) : novels.length === 0 ? (
              <p>No novels available right now.</p>
            ) : (
              <div className="novel-accordion-list">
                {novels.map((novel) => {
                  const novelId = getNovelId(novel);
                  const novelTitle = getNovelTitle(novel);
                  const novelSlug = getNovelSlug(novelTitle);

                  return (
                    <details key={novelId ?? novelTitle} className="novel-accordion-item">
                      <summary>
                        <span>{novelTitle}</span>
                        <span>{getNovelAuthor(novel)}</span>
                      </summary>
                      <div className="novel-accordion-body">
                        <p>{getNovelDescription(novel)}</p>
                        <div className="card-actions">
                          <Link
                            to={`/novel/${novelId}/${encodeURIComponent(novelSlug)}`}
                            className="logout-btn compact-btn"
                          >
                            Read Now
                          </Link>
                          <Link to="/trend" className="logout-btn compact-btn">
                            See Trending
                          </Link>
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </section>

          <p>
            Welcome to Scroll Saga, where every user is a storyteller and every profile is a scroll
            waiting to be unfurled.
          </p>
          <p>
            Explore the community, discover memorable characters, and follow narrative threads that
            grow with every release.
          </p>

          <div className="action-row">
            <Link to="/trend" className="logout-btn">
              Explore Trending
            </Link>
            <Link to="/sagaNews" className="logout-btn">
              Go to Saga News
            </Link>
          </div>

          <p>
            This mini app is created for educational purposes and presents fictional stories and
            profiles.
          </p>
        </div>

        <section className="home-quote-section">
          <h2>Inspirational Snippets</h2>
          <div className="action-row">
            <Link to="/quotes" className="logout-btn compact-btn">
              Open Quotes Section
            </Link>
          </div>
          {quotesLoading ? (
            <p>Loading...</p>
          ) : quotesError ? (
            <p className="status-error">{quotesError}</p>
          ) : sayings.length === 0 ? (
            <p>No sayings found.</p>
          ) : (
            <div className="quote-snippet-list">
              {sayings.map((saying, index) => (
                <article key={`${saying.animeName}-${index}`} className="quote-snippet">
                  <p className="quote-text">&quot;{saying.quote}&quot;</p>
                  <p className="quote-source">{saying.animeName}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Header>
  );
}

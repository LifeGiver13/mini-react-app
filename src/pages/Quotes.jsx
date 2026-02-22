import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Header";
import { getUserFriendlyErrorMessage } from "../constants/api";

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch(
          "https://my-json-server.typicode.com/SanskritiGupta05/AniQuotes/quotes",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch quotes");
        }

        const payload = await response.json();
        setQuotes(Array.isArray(payload) ? payload : []);
      } catch (fetchError) {
        setError(
          getUserFriendlyErrorMessage(
            fetchError,
            "Unable to load quotes right now. Please refresh and try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  return (
    <Header>
      <h1>Inspirational Quotes</h1>
      <div className="container themed-panel bg-man">
        <p className="callout-text">
          Browse quotes in one place and jump back to novels any time.
        </p>
        <div className="action-row">
          <Link to="/" className="logout-btn compact-btn">
            Back Home
          </Link>
          <Link to="/trend" className="logout-btn compact-btn">
            Go Trending
          </Link>
        </div>

        {loading ? (
          <p>Loading quotes...</p>
        ) : error ? (
          <p className="status-error">{error}</p>
        ) : quotes.length === 0 ? (
          <p>No quotes available right now.</p>
        ) : (
          <div className="quote-archive-grid">
            {quotes.map((quote, index) => (
              <article key={`${quote.animeName}-${index}`} className="quote-archive-card">
                {quote.image ? (
                  <img
                    src={quote.image}
                    alt={quote.animeName || "Quote"}
                    loading="lazy"
                    className="quote-archive-image"
                  />
                ) : null}
                <p className="quote-text">&quot;{quote.quote}&quot;</p>
                <p className="quote-source">{quote.animeName || "Unknown source"}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </Header>
  );
}

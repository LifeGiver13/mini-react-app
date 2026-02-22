import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Header";

export default function Home() {
  const [sayings, setSayings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSayings = async () => {
      try {
        const response = await fetch(
          "https://my-json-server.typicode.com/SanskritiGupta05/AniQuotes/quotes",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sayings");
        }

        const data = await response.json();
        setSayings(data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSayings();
  }, []);

  return (
    <Header>
      <h1>Home</h1>
      <div className="container themed-panel bg-man">
        <div className="content-stack">
          <p>
            Welcome to Scroll Saga, where every user is a storyteller and every profile is a scroll
            waiting to be unfurled.
          </p>
          <p>
            Explore the community, discover memorable characters, and follow narrative threads that
            grow with every release.
          </p>

          <div className="action-row">
            <Link to="/users" className="logout-btn">
              Explore Users
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

        <h2>Inspirational Quotes</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="status-error">{error}</p>
        ) : sayings.length === 0 ? (
          <p>No sayings found.</p>
        ) : (
          <ul className="list">
            {sayings.map((saying, index) => (
              <li key={`${saying.animeName}-${index}`} className="saying-item">
                <img src={saying.image} alt={saying.animeName} loading="lazy" />
                <h3>{saying.animeName}</h3>
                <p className="quote-text">&quot;{saying.quote}&quot;</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Header>
  );
}

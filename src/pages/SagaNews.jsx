import { useEffect, useState } from "react";
import Header from "../Header";
import {
  API_ENDPOINTS,
  buildApiUrl,
  getNovelDescription,
  getNovelTitle,
  getUserFriendlyErrorMessage,
} from "../constants/api";

export default function SagaNews() {
  const [novels, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.novels), {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await res.json();
        setListings(data);
      } catch (err) {
        setError(
          getUserFriendlyErrorMessage(
            err,
            "Unable to load saga updates right now. Please refresh and try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <Header>
      <h1>Saga News</h1>
      <div className="container themed-panel bg-man">
        <p>
          Welcome to Saga News, your source for new release highlights and activity around Scroll Saga novels.
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="status-error">{error}</p>
        ) : (
          <div className="release-table-wrapper">
            <table className="release-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {novels.map((novel) => (
                  <tr key={novel.novel_id}>
                    <td>{getNovelTitle(novel)}</td>
                    <td>{novel.genre || "General"}</td>
                    <td>{novel.author || "Unknown"}</td>
                    <td>{novel.publish_date || "TBA"}</td>
                    <td>{getNovelDescription(novel)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Header>
  );
}

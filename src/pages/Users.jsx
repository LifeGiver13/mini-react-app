import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Header";
import {
  API_ENDPOINTS,
  buildApiUrl,
  getProfilePhotoUrl,
  getUserFriendlyErrorMessage,
} from "../constants/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.users), {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        const storedUser = localStorage.getItem("user");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const currentUsername = currentUser?.username || localStorage.getItem("username");

        const filteredUsers = currentUsername
          ? data.filter((user) => user.username !== currentUsername)
          : data;

        setUsers(filteredUsers);
      } catch (fetchError) {
        setError(
          getUserFriendlyErrorMessage(
            fetchError,
            "Unable to load users right now. Please refresh and try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Header>
      <h1>Users</h1>
      <div className="container themed-panel bg-man">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="status-error">{error}</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="list">
            {users.map((user) => (
              <li key={user.user_id} id="myDIV">
                <div className="flex-cont">
                  <div>
                    <img
                      src={getProfilePhotoUrl(user.profile_photo) || "/vite.svg"}
                      alt={`${user.username} profile`}
                      className="profile-avatar"
                      loading="lazy"
                    />
                    <h3 className="user-name">{user.username}</h3>
                    <Link to="/trend" className="details-link">
                      View Trending
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Header>
  );
}

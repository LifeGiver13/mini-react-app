import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Header";
import { API_ENDPOINTS, buildApiUrl, buildImageUrl } from "../constants/api";

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
        setError(fetchError.message);
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
                      src={buildImageUrl(user.profile_photo)}
                      alt={`${user.username} profile`}
                      className="profile-avatar"
                      loading="lazy"
                    />
                    <h3 className="user-name">{user.username}</h3>
                    <Link to={`/users/${user.user_id}`} className="details-link">
                      View Details
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

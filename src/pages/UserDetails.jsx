import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import { API_ENDPOINTS, buildApiUrl, buildImageUrl } from "../constants/api";

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("loggedIn") !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.userDetails(id)), {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("User not found");
        }

        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return (
    <Header>
      <h1>User Details</h1>
      <div className="container themed-panel bg-man">
        {loading ? (
          <p>Loading...</p>
        ) : !user ? (
          <p className="status-error">User not found.</p>
        ) : (
          <div id="myDIV" className="details-card">
            <div className="flex-cont">
              <img
                src={buildImageUrl(user.profile_photo)}
                alt={`${user.username} profile`}
                loading="lazy"
              />
              <div>
                <h3>Username: {user.username}</h3>
                <p>Email: {user.email_address}</p>
                <p>Role: {user.role}</p>
                <h4>Bio</h4>
                <p>{user.user_bio || "None"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Header>
  );
}

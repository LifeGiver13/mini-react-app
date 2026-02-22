import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import {
  API_ENDPOINTS,
  buildApiUrl,
  buildImageUrl,
  buildRequestHeaders,
  getCurrentUserId,
} from "../constants/api";

const parseResponseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoSuccess, setPhotoSuccess] = useState("");
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const isOwnProfile = currentUserId && String(currentUserId) === String(id);

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

  const handlePhotoUpload = async (event) => {
    event.preventDefault();
    setPhotoError("");
    setPhotoSuccess("");

    if (!isOwnProfile) {
      setPhotoError("You can only update your own profile photo.");
      return;
    }

    if (!photoFile) {
      setPhotoError("Choose an image file first.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", String(currentUserId));
    formData.append("profile_photo", photoFile);

    setPhotoUploading(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.profilePhoto), {
        method: "POST",
        headers: buildRequestHeaders({}, { includeUserId: true }),
        body: formData,
      });
      const payload = await parseResponseJson(response);

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "Failed to upload profile photo.");
      }

      setPhotoSuccess(payload?.message || "Profile photo updated.");
      setPhotoFile(null);

      const userRes = await fetch(buildApiUrl(API_ENDPOINTS.userDetails(id)), {
        method: "GET",
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }
    } catch (uploadError) {
      setPhotoError(uploadError.message || "Failed to upload profile photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

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

                {isOwnProfile && (
                  <form className="photo-form" onSubmit={handlePhotoUpload}>
                    <label htmlFor="profile-photo-upload">Update profile photo</label>
                    <input
                      id="profile-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                      disabled={photoUploading}
                    />
                    <button
                      type="submit"
                      className="logout-btn compact-btn"
                      disabled={photoUploading}
                    >
                      {photoUploading ? "Uploading..." : "Upload Photo"}
                    </button>
                    {photoError && <p className="status-error">{photoError}</p>}
                    {photoSuccess && <p className="status-success">{photoSuccess}</p>}
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Header>
  );
}

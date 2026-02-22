import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import {
  API_ENDPOINTS,
  buildApiUrl,
  buildRequestHeaders,
  getCurrentUserId,
  getProfilePhotoUrl,
  getUserFriendlyErrorMessage,
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
  const [profileForm, setProfileForm] = useState({
    username: "",
    email_address: "",
    user_bio: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const navigate = useNavigate();

  const currentUserId = getCurrentUserId();
  const isOwnProfile = currentUserId && String(currentUserId) === String(id);

  const loadUser = useCallback(async () => {
    if (!id) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isOwnProfile) {
        response = await fetch(buildApiUrl(API_ENDPOINTS.profile), {
          method: "GET",
          headers: buildRequestHeaders(
            { Accept: "application/json" },
            { includeUserId: true },
          ),
        });
      } else {
        response = await fetch(buildApiUrl(API_ENDPOINTS.userDetails(id)), {
          method: "GET",
          headers: { Accept: "application/json" },
        });
      }

      if (!response.ok) {
        throw new Error("User not found");
      }

      const payload = await response.json();
      setUser(payload);
      setProfileForm({
        username: payload?.username ?? "",
        email_address: payload?.email_address ?? payload?.email ?? "",
        user_bio: payload?.user_bio ?? payload?.bio ?? "",
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id, isOwnProfile]);

  useEffect(() => {
    if (localStorage.getItem("loggedIn") !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!isOwnProfile) {
      setProfileError("You can only edit your own profile.");
      return;
    }

    const username = profileForm.username.trim();
    const email = profileForm.email_address.trim();
    const bio = profileForm.user_bio.trim();

    if (!username || !email) {
      setProfileError("Username and email are required.");
      return;
    }

    setProfileSaving(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.profile), {
        method: "PUT",
        headers: buildRequestHeaders(
          { Accept: "application/json", "Content-Type": "application/json" },
          { includeUserId: true },
        ),
        body: JSON.stringify({
          username,
          email_address: email,
          email,
          user_bio: bio,
          bio,
        }),
      });
      const payload = await parseResponseJson(response);

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "Failed to update profile.");
      }

      const updatedUser = payload?.user ?? payload ?? {};
      setUser((prev) => ({ ...(prev || {}), ...updatedUser }));
      setProfileForm({
        username: updatedUser?.username ?? username,
        email_address: updatedUser?.email_address ?? updatedUser?.email ?? email,
        user_bio: updatedUser?.user_bio ?? updatedUser?.bio ?? bio,
      });

      localStorage.setItem("username", updatedUser?.username ?? username);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsed,
              username: updatedUser?.username ?? username,
            }),
          );
        } catch {
          // Ignore malformed stored user.
        }
      }

      window.dispatchEvent(new Event("profileUpdated"));
      setProfileSuccess(payload?.message || "Profile updated successfully.");
    } catch (updateError) {
      setProfileError(
        getUserFriendlyErrorMessage(
          updateError,
          "Unable to update your profile. Please refresh and try again.",
        ),
      );
    } finally {
      setProfileSaving(false);
    }
  };

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
      await loadUser();
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (uploadError) {
      setPhotoError(
        getUserFriendlyErrorMessage(
          uploadError,
          "Unable to upload profile photo. Please refresh and try again.",
        ),
      );
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
                src={getProfilePhotoUrl(user.profile_photo) || "/vite.svg"}
                alt={`${user.username} profile`}
                loading="lazy"
              />
              <div>
                <h3>Username: {user.username}</h3>
                <p>Email: {user.email_address}</p>
                <p>Role: {user.role || "user"}</p>
                <h4>Bio</h4>
                <p>{user.user_bio || "None"}</p>

                {isOwnProfile && (
                  <>
                    <form className="profile-edit-form" onSubmit={handleProfileUpdate}>
                      <h4>Edit Profile</h4>
                      <label htmlFor="edit-username">Username</label>
                      <input
                        id="edit-username"
                        name="username"
                        value={profileForm.username}
                        onChange={handleProfileFieldChange}
                        disabled={profileSaving}
                      />

                      <label htmlFor="edit-email">Email</label>
                      <input
                        id="edit-email"
                        name="email_address"
                        type="email"
                        value={profileForm.email_address}
                        onChange={handleProfileFieldChange}
                        disabled={profileSaving}
                      />

                      <label htmlFor="edit-bio">Bio</label>
                      <textarea
                        id="edit-bio"
                        name="user_bio"
                        value={profileForm.user_bio}
                        onChange={handleProfileFieldChange}
                        disabled={profileSaving}
                        rows={4}
                      />

                      <button
                        type="submit"
                        className="logout-btn compact-btn"
                        disabled={profileSaving}
                      >
                        {profileSaving ? "Saving..." : "Save Profile"}
                      </button>
                      {profileError && <p className="status-error">{profileError}</p>}
                      {profileSuccess && <p className="status-success">{profileSuccess}</p>}
                    </form>

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
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Header>
  );
}

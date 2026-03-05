import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function Profile() {
  const [profile, setProfile] = useState(null);
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

  const userId = getCurrentUserId();
  const isLoggedIn = localStorage.getItem("loggedIn") === "true" && Boolean(userId);

  const loadProfile = useCallback(async () => {
    if (!isLoggedIn) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.profile), {
        method: "GET",
        headers: buildRequestHeaders(
          { Accept: "application/json" },
          { includeUserId: true },
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const payload = await response.json();
      setProfile(payload);
      setProfileForm({
        username: payload?.username ?? "",
        email_address: payload?.email_address ?? payload?.email ?? "",
        user_bio: payload?.user_bio ?? payload?.bio ?? "",
      });
      setProfileError("");
    } catch (fetchError) {
      setProfileError(
        getUserFriendlyErrorMessage(
          fetchError,
          "Unable to load your profile. Please refresh and try again.",
        ),
      );
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    loadProfile();
  }, [isLoggedIn, loadProfile, navigate]);

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!isLoggedIn) {
      setProfileError("Please login to update your profile.");
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
      setProfile((prev) => ({ ...(prev || {}), ...updatedUser }));
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

    if (!isLoggedIn) {
      setPhotoError("Please login to update your profile photo.");
      return;
    }

    if (!photoFile) {
      setPhotoError("Choose an image file first.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", String(userId));
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
      await loadProfile();
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
      <h1>My Profile</h1>
      <div className="container themed-panel bg-scroll">
        <div className="action-row">
          <Link to="/trend" className="logout-btn compact-btn">
            Back to Trending
          </Link>
          <Link to="/journey" className="logout-btn compact-btn">
            User Journey
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : profileError ? (
          <p className="status-error">{profileError}</p>
        ) : !profile ? (
          <p className="status-error">Profile not available.</p>
        ) : (
          <div id="myDIV" className="details-card">
            <div className="flex-cont">
              <img
                src={getProfilePhotoUrl(profile.profile_photo) || "/vite.svg"}
                alt={`${profile.username || "User"} profile`}
                loading="lazy"
              />
              <div>
                <h3>Username: {profile.username}</h3>
                <p>Email: {profile.email_address}</p>
                <h4>Bio</h4>
                <p>{profile.user_bio || "None"}</p>

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
              </div>
            </div>
          </div>
        )}
      </div>
    </Header>
  );
}


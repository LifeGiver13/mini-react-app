import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header";
import { API_ENDPOINTS, buildApiUrl } from "../constants/api";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    bio: "",
    profile_photo: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoto = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, profile_photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      if (!form.username || !form.email || !form.password || !form.confirm_password) {
        setError("All fields are required.");
        return;
      }

      if (form.password !== form.confirm_password) {
        setError("Passwords do not match.");
        return;
      }

      if (form.profile_photo && !form.profile_photo.startsWith("data:image/")) {
        setError("Invalid profile photo format. Please upload a valid image.");
        return;
      }

      const res = await fetch(buildApiUrl(API_ENDPOINTS.register), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(data.message || "Registration successful!");
      setForm({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        bio: "",
        profile_photo: null,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Header>
      <h1>Register</h1>
      <div className="container themed-panel bg-scroll">
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="form-card">
          <p>Fill in the form below to create an account.</p>

          {error && <p className="status-error">{error}</p>}
          {success && <p className="status-success">{success}</p>}

          <p>
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </p>
          <p>
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </p>
          <p>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </p>
          <p>
            <label htmlFor="register-confirm-password">Confirm Password</label>
            <input
              id="register-confirm-password"
              name="confirm_password"
              type="password"
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </p>
          <p>
            <label htmlFor="register-bio">Bio</label>
            <textarea
              id="register-bio"
              name="bio"
              placeholder="Your bio..."
              value={form.bio}
              onChange={handleChange}
            />
          </p>
          <p>
            <label htmlFor="profile_photo">Profile Photo</label>
            <input id="profile_photo" type="file" accept="image/*" onChange={handlePhoto} />
          </p>

          <button type="submit" disabled={loading} className="logout-btn">
            {loading ? "Registering..." : "Register"}
          </button>

          <p>
            <Link to="/login">Already have an account? Login</Link>
          </p>
        </form>
      </div>
    </Header>
  );
}

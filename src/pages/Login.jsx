import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header";
import { API_ENDPOINTS, buildApiUrl } from "../constants/api";

export default function Login() {
  const [form, setForm] = useState({ user_id: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!form.username || !form.password) {
      setError("Both fields are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.login), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setForm((prev) => ({ ...prev, user_id: data.user_id }));
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userId", data.user_id);
      localStorage.setItem("username", form.username);
      localStorage.setItem(
        "user",
        JSON.stringify({ user_id: data.user_id, username: form.username }),
      );

      setSuccess("Login successful!");

      setTimeout(() => {
        navigate("/trend");
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Header>
      <h1>Login</h1>
      <div className="container themed-panel bg-scroll">
        <form onSubmit={handleSubmit} className="form-card">
          <p>Fill in the form below to login.</p>
          <p>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>

          {error && <p className="status-error">{error}</p>}
          {success && <p className="status-success">{success}</p>}

          <p>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </p>

          <p>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </p>

          <button type="submit" className="logout-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </Header>
  );
}

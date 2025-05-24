import Header from "../Header";
import { useState } from "react";

export default function Register() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        bio: "",
        profile_photo: null,
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm((prev) => ({ ...prev, profile_photo: reader.result }));
            };
            reader.readAsDataURL(file); // Converts to base64
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {


            if (!form.username || !form.email || !form.password || !form.confirm_password) {
                throw new Error("All fields are required.");
            }
            if (form.password !== form.confirm_password) {
                throw new Error("Passwords do not match.");
            }
            if (form.profile_photo && !form.profile_photo.startsWith("data:image/")) {
                throw new Error("Invalid profile photo format. Please upload a valid image.");
            }
            const res = await fetch("https://lifegiver13.pythonanywhere.com/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }


            setSuccess(data.message);
            setForm({
                username: "",
                email: "",
                password: "",
                confirm_password: "",
                bio: "",
                profile_photo: null,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Header>
            <h1>Register</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data" >
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                <p>
                    <input
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </p>
                <p>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </p>
                <p>
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </p>
                <p>
                    <input
                        name="confirm_password"
                        type="password"
                        placeholder="Confirm Password"
                        value={form.confirm_password}
                        onChange={handleChange}
                        required
                    />
                </p>
                <p>
                    <textarea
                        name="bio"
                        placeholder="Your bio..."
                        value={form.bio}
                        onChange={handleChange}
                    ></textarea>
                </p>
                <p>
                    <label htmlFor="profile_photo">Profile Photo:</label><br />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhoto}

                    />
                </p>
                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
                <p>
                    <a href="/login">Already have an account? Login</a>
                </p>
            </form>
        </Header>
    );
}

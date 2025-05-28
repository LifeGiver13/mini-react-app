import Header from "../Header";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

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
        setSuccess('');
        setError('');
        setLoading(true);

        try {
            //  Client-side validation with returns
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

            //  API call
            const res = await fetch("https://lifegiver13.pythonanywhere.com/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                //  Error from API
                throw new Error(data.message || "Registration failed");
            }

            setSuccess(data.message);
            setForm({
                username: "",
                email: "",
                password: "",
                confirm_password: "",
                bio: "",
                profile_photo: "default.png",
            });

            //  Redirect after success
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            //  Catch block restored
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };




    return (
        <Header>

            <h1>Register</h1>

            <div className="container" style={{ padding: '20px', backgroundImage: 'url(/ScrollUser.png)', width: '100%', color: 'black', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>


                <form onSubmit={handleSubmit} encType="multipart/form-data" >

                    <p>Fill in the form below to Register.</p>

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
                    <button type="submit" disabled={loading} className="logout-btn">
                        {loading ? "Registering..." : "Register"}
                    </button>
                    <p>
                        <a href="/login">Already have an account? Login</a>
                    </p>
                </form>
            </div>
        </Header>
    );
}

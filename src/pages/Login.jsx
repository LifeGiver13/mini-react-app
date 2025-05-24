import Header from "../Header";
import { useState } from 'react';


export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!form.username || !form.password) {
            setError('Both fields are required.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("https://lifegiver13.pythonanywhere.com/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });


            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setSuccess('Login successful!');
            // TODO: Redirect or set user context
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header >
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <p>Fill in the form below to login.</p>
                    <p>
                        Don’t have an account? <a href="/register">Register</a>
                    </p>

                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {success && <p style={{ color: 'green' }}>{success}</p>}

                    <p>
                        <label htmlFor="username">Username:</label><br />
                        <input
                            id="username"
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                        />
                    </p>

                    <p>
                        <label htmlFor="password">Password:</label><br />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </p>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </Header>
        </>
    );
}

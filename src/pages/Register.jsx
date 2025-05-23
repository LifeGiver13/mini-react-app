import Header from "../Header";
import { useState, useEffect } from "react";

export default function Register() {
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
    }
    );

    return (
        <>
            <Header>
                <h1>Register</h1>
                <form>
                    <p>
                        <input type="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} placeholder="Name" />
                    </p>
                    <p>
                        <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="Email" />
                    </p>
                    <p>
                        <input type="password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} placeholder="Password" />

                    </p>
                    <button type="submit">Register</button>
                    <p>
                        <a href="/login">Already have an account? Login</a>
                    </p>

                </form>
            </Header>
        </>
    );

}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header";
import '../HeadOoter.css'; // styling for #myDIV and .flex-cont

export default function UserDetails() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchUser = async () => {
            try {
                const res = await fetch(`https://lifegiver13.pythonanywhere.com/api/users/${id}`, {
                    method: "GET",
                    credentials: "include"
                });

                if (!res.ok) throw new Error("User not found");

                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error("Error fetching user:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    return (
        <Header>
            <div className="container">
                {loading ? (
                    <p className="text-lg p-4 text-yellow-500">Loading...</p>
                ) : !user ? (
                    <p className="text-lg p-4 text-red-500">User not found.</p>
                ) : (
                    <div id="myDIV">
                        <div className="flex-cont">
                            <img
                                src={`https://lifegiver13.pythonanywhere.com/static/images/${user.profile_photo}`}
                                alt="Profile"
                            />
                            <div>
                                <h3>Username: {user.username}</h3>
                                <p>Email: {user.email_address}</p>
                                <p>Role: {user.role}</p>
                                <h4>Bio:</h4>
                                <p>{user.user_bio || "None"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Header>
    );
}

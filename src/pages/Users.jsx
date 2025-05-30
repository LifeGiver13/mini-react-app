import { useEffect, useState } from "react";
import Header from "../Header";
import { Link } from "react-router-dom";


export default function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("https://lifegiver13.pythonanywhere.com/api/users", {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Failed to fetch users");

                const data = await res.json();

                const currentUser = JSON.parse(localStorage.getItem("user"));

                // Filter out current user
                const filteredUsers = data.filter(user => user.username !== currentUser);

                setUsers(filteredUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);


    return (
        <Header>
            <h1 >Users</h1>
            <div className="container">
                {users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    <ul className="list">
                        {users.map((user) => (
                            <li key={user.user_id} id="myDIV">
                                <div className="flex-cont">
                                    <div>
                                        <img
                                            src={`https://lifegiver13.pythonanywhere.com/static/images/${user.profile_photo}`}
                                            alt="Profile"
                                            style={{ borderRadius: '50%', width: '20vh', height: '20vh', objectFit: 'cover' }}
                                        />

                                        <h3 style={{ color: 'green' }}>{user.username}</h3>
                                        <Link to={`/users/${user.user_id}`} style={{ color: '#f5deb3', textDecoration: 'underline' }}>
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Header>
    );
}

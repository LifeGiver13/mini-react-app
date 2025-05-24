import { useEffect, useState } from "react";
import Header from "../Header";
import { Link, useParams } from "react-router-dom";
import '../HeadOoter.css'

export default function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("https://lifegiver13.pythonanywhere.com/api/users", {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <Header>
            <h1>Users</h1>
            <div id="content">
                <div className="container">
                    {users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <ul className="list">
                            {users.map((user) => (
                                <li key={user.user_id} className="item">
                                    <h2>{user.username}</h2>
                                    <p>Email: {user.email_address}</p>
                                    <Link to={`/users/${user.user_id}`}>
                                        View Details
                                    </Link>
                                </li>
                            ))}
                        </ul>

                    )}</div>
            </div>
        </Header>
    );
}

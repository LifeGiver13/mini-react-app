import { useEffect, useState } from "react";
import Header from "../Header";
import { Link, useParams } from "react-router-dom"; 


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
            <div className="p-4">
                {users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    <ul className="space-y-4">
                        {users.map((user) => (
                            <li key={user.user_id} className="p-4 bg-white rounded shadow">
                                <h2 className="text-xl font-bold">{user.username}</h2>
                                <p>Email: {user.email_address}</p>

                                {/* Button to navigate to user details */}
                                <Link
                                    to={`/users/${user.user_id}`}
                                    className="text-blue-500 underline mt-2 inline-block"
                                >
                                    View Details
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Header>
    );
}

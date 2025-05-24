import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // if using route like /users/:id
import Header from "../Header";

export default function UserDetails() {
    const { id } = useParams(); // expects route like /users/:id
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Fetching user with ID:", id);
        if (!id) return;
        const fetchUser = async () => {
            try {
                const response = await fetch(`https://lifegiver13.pythonanywhere.com/api/users/${id}`, {
                    method: "GET",
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("User not found.");
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error("Error fetching user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) return <div className="p-4">Loading...</div>;
    if (!user) return <div className="p-4 text-red-500">User not found.</div>;

    return (
        <Header>
            <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-md">
                <div className="flex items-center space-x-4">
                    <img
                        src={`https://lifegiver13.pythonanywhere.com/static/images/${user.profile_photo}`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border"
                    />
                    <div>
                        <h2 className="text-2xl font-bold">{user.username}</h2>
                        <p className="text-gray-600">{user.email_address}</p>
                        <p className="text-sm text-blue-500">{user.role}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="font-semibold">Bio:</h3>
                    <p className="text-gray-700">{user.user_bio || "None"}</p>
                </div>
            </div>
        </Header>
    );
}

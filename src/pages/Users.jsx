import Header from "../Header";

export default function Users() {

    // This page is for veiwing registered users and their details.

    useEffect(() => {
        // Fetch users data from the API
        const fetchUsers = async () => {
            try {
                const response = await fetch("https://lifegiver13.pythonanywhere.com/users", {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                console.log(data); // Handle the fetched user data as needed
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);



    return (
        <>
            <Header>
                <h1>Users</h1>
                <p>This is where you’ll view registered users and their stories.</p>
            </Header>

        </>
    );
}
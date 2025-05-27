import Header from "../Header";
import { useState, useEffect } from "react";
export default function Home() {
    const [sayinggs, setSayings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSayings = async () => {
            try {
                const response = await fetch("/images/:category?count={int}&additionalTags={string}&blacklistedTags={string}&rating={string}"); // Replace with actual API endpoint
                if (!response.ok) throw new Error('Failed to fetch sayings');
                const data = await response.json();
                setSayings(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSayings();
    }, []);

    return (
        <Header>
            <div className="container" style={{ padding: '20px', backgroundImage: 'url(/ScrollUser.png)', width: '80%' }}>
                <h1> Home</h1>

                <p>
                    Welcome to Scroll Saga, where every user is a storyteller and every profile is a scroll waiting to be unfurled. Here, you can explore the rich tapestry of our community, discover unique characters, and embark on your own narrative journey.
                    <br />
                    Whether you're a seasoned adventurer or a curious newcomer, Scroll Saga invites you to delve into the stories of others and share your own. Join us in this epic saga of creativity and connection!
                </p>
                <p>
                    <strong>Ready to start your journey?</strong> Click on the button below to explore the Scroll Saga directory and meet our incredible users.
                </p>
                <button onClick={() => window.location.href = "/users"} className="explore-btn">
                    Explore Users
                </button>
                <p>
                    <strong>Or</strong> if you want to dive into the latest updates and news, check out our Saga News section.
                </p>
                <button onClick={() => window.location.href = "/sagaNews"} className="news-btn">
                    Go to Saga News
                </button>
                <p>
                    <strong>Join the adventure today!</strong> Your story is just a click away.
                </p>
                <p>
                    <strong>Note:</strong> This is a mini-app created for educational purposes. It showcases user profiles and stories in a fictional setting.
                </p>
                <p>
                    <strong>Disclaimer:</strong> This app is not affiliated with any real-world entities or individuals. All characters and stories are purely fictional.
                </p>
                <p>
                    <strong>Contact:</strong> For any inquiries or feedback, please reach out to us at <a href="mailto:" style={{ color: 'blue' }}>
                    </a>
                </p>
                <h2>Charater sayings</h2>


                <h2>Inspirational Quotes</h2>


                <ul>
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p style={{ color: "red" }}>{error}</p>
                    ) : sayinggs.length === 0 ? (
                        <p>No sayings found.</p>
                    ) : (
                        sayinggs.map((saying, index) => (
                            <li key={index} className="saying-item">
                                <blockquote>
                                    <p>{saying.image}</p>
                                    <footer>- {saying.anime}</footer>
                                </blockquote>
                            </li>
                        ))
                    )}
                </ul>



            </div>
        </Header>
    );
}

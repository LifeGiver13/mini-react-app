import Header from "../Header";
import { useState, useEffect } from "react";
export default function Home() {
    const [sayings, setSayings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSayings = async () => {
            try {
                const response = await fetch("https://my-json-server.typicode.com/SanskritiGupta05/AniQuotes/quotes"); // Replace with actual API endpoint
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
            <div className="container" style={{ padding: '20px', backgroundImage: 'url(/man.png)', width: '100%', color: 'black', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                <h1> Home</h1>

                <p>
                    Welcome to Scroll Saga, where every user is a storyteller and every profile is a scroll waiting to be unfurled. Here, you can explore the rich tapestry of our community, discover unique characters, and embark on your own narrative journey.
                    <br />
                    Whether you're a seasoned adventurer or a curious newcomer, Scroll Saga invites you to delve into the stories of others and share your own. Join us in this epic saga of creativity and connection!
                </p>
                <p>
                    <strong>Ready to start your journey?</strong> Click on the button below to explore the Scroll Saga directory and meet our incredible users.
                </p>
                <button onClick={() => window.location.href = "/users"} className="logout-btn">
                    Explore Users
                </button>
                <p>
                    <strong>Or</strong> if you want to dive into the latest updates and news, check out our Saga News section.
                </p>
                <button onClick={() => window.location.href = "/sagaNews"} className="logout-btn">
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
                </p><br />
                {/* <p>
                    <strong>Contact:</strong> For any inquiries or feedback, please reach out to us at <a href="mailto:" style={{ color: 'blue' }}>
                    </a>
                </p> */}

                <p>
                    <strong>Follow us on social media:</strong> Stay updated with the latest news and stories from Scroll Saga by following us on our social media channels.
                </p>


                <h2>Inspirational Quotes</h2>

                <ul className="list">
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p style={{ color: "red" }}>{error}</p>
                    ) : sayings.length === 0 ? (
                        <p>No sayings found.</p>
                    ) : (
                        sayings.map((saying, index) => (
                            <li key={index} className="saying-item" >
                                <img src={saying.image} alt="Anime Character" style={{ maxWidth: '200px', borderRadius: '10px' }} />
                                <p><strong><h3>Anime:{saying.animeName}</h3></strong> </p>
                                <p><strong><h4>Quote: "{saying.quote}"</h4></strong></p>
                            </li>
                        ))
                    )}
                </ul>



            </div>
        </Header>
    );
}

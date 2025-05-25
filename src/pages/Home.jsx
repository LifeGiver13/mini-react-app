import Header from "../Header";

export default function Home() {
    return (
        <Header>
            <div className="container">
                <h1> Home</h1>
                <div id="myDIV">
                    <div className="flex-cont">
                        <div>
                            <h3>🌌 Welcome to Scroll Saga</h3>
                            <p>
                                Dive into a world where stories unfold like ancient scrolls and legends live on through every user. This is the heart of the Scroll Saga directory — a place where adventurers, scribes, and dreamers come together to share their tales.
                            </p>
                            <p>
                                Here, you can:
                                <ul style={{ listStyleType: 'none', paddingLeft: '1rem' }}>
                                    <li>🔍 Browse through registered users and their legendary stories</li>
                                    <li>📜 Discover character bios, powers, and personal journeys</li>
                                    <li>🖊️ Create your own profile and contribute to the Scroll Saga universe</li>
                                </ul>
                            </p>
                            <p>
                                Every user is a chapter, every bio a hidden scroll. Ready to explore?
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Header>
    );
}

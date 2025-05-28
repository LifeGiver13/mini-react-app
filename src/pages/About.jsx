import Header from "../Header";

export default function About() {
    return (
        <>
            <Header>
                <div className="container" style={{
                    padding: '20px', backgroundImage: 'url(/man.png)', width: '100%',
                    color: 'black', fontFamily: 'Arial, sans-serif', fontWeight: 'bold'
                }}>
                    <h1>About</h1>
                    <p>
                        Welcome to Scroll Saga, a mini-app designed to showcase user profiles and stories in a fictional setting. Here, you can explore the rich tapestry of our community, discover unique characters, and embark on your own narrative journey.
                    </p>
                    <p>
                        Whether you're a seasoned adventurer or a curious newcomer, Scroll Saga invites you to delve into the stories of others and share your own. Join us in this epic saga of creativity and connection!
                    </p>
                    <p>
                        <strong>Ready to start your journey?</strong> Click on the button below to explore the Scroll Saga directory and meet our incredible users.
                    </p>
                    <button onClick={() => window.location.href = "/"} className="logout-btn">
                        Explore Ongoing Novels
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
                    </p>
                    <p>
                        <strong>Contact:</strong> For any inquiries or feedback, please reach out to us at <a href="mailto:" style={{ color: 'blue' }}>
                        </a></p>


                </div>
            </Header>
        </>

    );
}
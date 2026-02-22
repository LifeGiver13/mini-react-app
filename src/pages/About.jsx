import { Link } from "react-router-dom";
import Header from "../Header";

export default function About() {
  return (
    <Header>
      <h1>About</h1>
      <div className="container themed-panel bg-man">
        <div className="content-stack">
          <p>
            Scroll Saga is a storytelling mini app where readers and creators can discover profiles,
            novels, and updates in one place.
          </p>
          <p>
            The project focuses on clean navigation, discoverability, and learning through practical
            full-stack integration.
          </p>
          <p>
            All stories and characters shown here are fictional and provided for demonstration.
          </p>
          <div className="action-row">
            <Link to="/trend" className="logout-btn">
              Explore Novels
            </Link>
            <Link to="/sagaNews" className="logout-btn">
              View Saga News
            </Link>
          </div>
        </div>
      </div>
    </Header>
  );
}

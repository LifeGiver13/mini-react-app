import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div id="footbar">
      <ul className="foot-links">
        <li>
          <Link to="/about">Policies</Link>
        </li>
        <li>
          <Link to="/sagaNews">Saga News</Link>
        </li>
        <li>
          <Link to="/trend">Listings</Link>
        </li>
      </ul>
    </div>
  );
}

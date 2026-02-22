import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import {
  API_ENDPOINTS,
  buildApiUrl,
  buildRequestHeaders,
  getProfilePhotoUrl,
} from "./constants/api";
import "./HeadOoter.css";
import "./Listings.css";
import "./SagaNews.css";

const MAIN_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/sagaNews", label: "Saga News" },
  { to: "/search", label: "Search" },
  { to: "/trend", label: "Trending" },
  { to: "/bookList", label: "Book List" },
];

export default function Header({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncAuthState = () => {
      const loggedInFlag = localStorage.getItem("loggedIn") === "true";
      const user = localStorage.getItem("user");
      setIsLoggedIn(loggedInFlag || Boolean(user));
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    const loggedInFlag = localStorage.getItem("loggedIn") === "true";
    const user = localStorage.getItem("user");
    setIsLoggedIn(loggedInFlag || Boolean(user));
  }, [location.pathname]);

  useEffect(() => {
    const handleProfileUpdated = () => {
      setProfileRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("profileUpdated", handleProfileUpdated);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdated);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setProfile(null);
      return;
    }

    const userId = String(localStorage.getItem("userId") ?? "").trim();
    if (!userId) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.profile), {
          method: "GET",
          headers: buildRequestHeaders({ Accept: "application/json" }, { includeUserId: true }),
        });

        if (!response.ok) {
          throw new Error("Failed to load profile.");
        }

        const payload = await response.json();
        if (!cancelled) {
          setProfile(payload);
        }
      } catch {
        if (cancelled) {
          return;
        }

        setProfile((prev) => {
          if (prev) {
            return prev;
          }

          return {
            user_id: userId,
            username: localStorage.getItem("username") || "My Account",
            profile_photo: "",
          };
        });
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, profileRefreshKey]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setProfile(null);
    navigate("/login");
  };

  const profileName = String(
    profile?.username ?? localStorage.getItem("username") ?? "My Account",
  ).trim();
  const profilePhoto = getProfilePhotoUrl(profile?.profile_photo) || "/scroll_community.webp";

  return (
    <div id="wrapper">
      <header id="navbar">
        <Link to="/" className="brand-link">
          <img className="logo" src="/log.svg" alt="Scroll Saga" />
        </Link>

        <button
          type="button"
          className="hamburger"
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? "X" : "\u2630"}
        </button>

        <button
          type="button"
          className={`nav-overlay ${isMenuOpen ? "open" : ""}`}
          aria-hidden={!isMenuOpen}
          tabIndex={isMenuOpen ? 0 : -1}
          onClick={() => setIsMenuOpen(false)}
        />

        <div id="main-navigation" className={`nav-container ${isMenuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            {isLoggedIn && (
              <li className="mobile-profile-row">
                <Link to="/trend" className="mobile-profile-link">
                  <img
                    src={profilePhoto}
                    alt={`${profileName || "User"} profile`}
                    className="header-avatar"
                    loading="lazy"
                  />
                  <span>{profileName || "My Account"}</span>
                </Link>
              </li>
            )}

            {MAIN_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}

            {!isLoggedIn ? (
              <>
                <li>
                  <NavLink
                    to="/register"
                    className={({ isActive }) => `nav-link btn${isActive ? " active" : ""}`}
                  >
                    Register
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) => `nav-link btn${isActive ? " active" : ""}`}
                  >
                    Login
                  </NavLink>
                </li>
              </>
            ) : (
              <li>
                <button type="button" onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>

        {isLoggedIn && (
          <Link to="/trend" className="desktop-profile-link">
            <img
              src={profilePhoto}
              alt={`${profileName || "User"} profile`}
              className="header-avatar"
              loading="lazy"
            />
            <span>{profileName || "My Account"}</span>
          </Link>
        )}
      </header>

      <main id="content">{children}</main>

      <footer id="footer">
        <Footer />
      </footer>
    </div>
  );
}

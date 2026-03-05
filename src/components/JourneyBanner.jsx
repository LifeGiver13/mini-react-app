import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  dismissJourneyBanner,
  getJourneySteps,
  isBannerDismissed,
} from "../constants/journey";

const HIDE_ON_PATHS = new Set(["/journey", "/login", "/register"]);

export default function JourneyBanner() {
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener("journeyUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("journeyUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  const dismissed = isBannerDismissed();
  // `refreshKey` exists to force a re-render when localStorage-backed journey state changes.
  // This keeps the banner in sync without heavy polling.
  void refreshKey;
  const { completedCount, totalCount, nextStep } = getJourneySteps({ isLoggedIn });

  if (dismissed) {
    return null;
  }

  if (HIDE_ON_PATHS.has(location.pathname)) {
    return null;
  }

  if (completedCount >= totalCount || !nextStep) {
    return null;
  }

  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <section className="journey-banner" aria-label="User journey guidance">
      <div className="journey-banner-head">
        <div>
          <h2 className="journey-banner-title">Your Next Step</h2>
          <p className="journey-banner-subtitle">
            Progress: {completedCount}/{totalCount} ({progressPercent}%)
          </p>
        </div>
        <button
          type="button"
          className="journey-banner-dismiss"
          onClick={() => dismissJourneyBanner()}
          aria-label="Dismiss journey guidance"
        >
          Hide
        </button>
      </div>

      <div className="journey-banner-body">
        <div className="journey-banner-step">
          <p className="journey-banner-step-title">{nextStep.title}</p>
          <p className="journey-banner-step-desc">{nextStep.description}</p>
        </div>

        <div className="journey-banner-actions">
          <Link to={nextStep.to} className="logout-btn compact-btn">
            {nextStep.cta}
          </Link>
          {!isLoggedIn && (
            <Link to="/register" className="logout-btn compact-btn">
              Register
            </Link>
          )}
          <Link to="/journey" className="logout-btn compact-btn">
            Full Journey
          </Link>
        </div>
      </div>
    </section>
  );
}

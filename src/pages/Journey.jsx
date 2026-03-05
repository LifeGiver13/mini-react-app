import { Link } from "react-router-dom";
import Header from "../Header";
import { getJourneySteps } from "../constants/journey";

export default function Journey() {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  const { steps, completedCount, totalCount, nextStep } = getJourneySteps({ isLoggedIn });
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <Header>
      <h1>User Journey</h1>
      <div className="container themed-panel bg-man">
        <p className="callout-text">
          Follow the steps to get the best experience. Progress: {completedCount}/{totalCount} (
          {progressPercent}%).
        </p>
        {nextStep ? (
          <div className="action-row">
            <Link to={nextStep.to} className="logout-btn compact-btn">
              Next: {nextStep.cta}
            </Link>
            <Link to="/trend" className="logout-btn compact-btn">
              Trending
            </Link>
            <Link to="/profile" className="logout-btn compact-btn">
              My Profile
            </Link>
          </div>
        ) : null}

        <div className="journey-grid">
          {steps.map((step, index) => (
            <div key={`${step.title}-${index}`} className="journey-card" id="myDIV">
              <div className="journey-card-inner">
                <h3 className="journey-title">
                  {index + 1}. {step.title}
                </h3>
                <p className="journey-desc">{step.description}</p>
                <div className="card-actions">
                  <Link to={step.to} className="logout-btn compact-btn">
                    {step.cta}
                  </Link>
                  {step.done ? (
                    <span className="status-success journey-done">Done</span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Header>
  );
}

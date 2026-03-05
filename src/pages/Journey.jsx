import { Link } from "react-router-dom";
import Header from "../Header";

export default function Journey() {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  const steps = [
    {
      title: "Create an account",
      description: "Register your profile so you can save books, rate, and comment.",
      to: "/register",
      cta: "Register",
      done: isLoggedIn,
    },
    {
      title: "Login",
      description: "Login to unlock your book list, rating, comments, and profile tools.",
      to: "/login",
      cta: "Login",
      done: isLoggedIn,
    },
    {
      title: "Explore trending novels",
      description: "Browse the most viewed stories and pick your next read.",
      to: "/trend",
      cta: "Open Trending",
      done: false,
    },
    {
      title: "Save your favorites",
      description: "Tap Save to build your personal book list for quick access.",
      to: "/bookList",
      cta: "Open Book List",
      done: false,
    },
    {
      title: "Read chapters",
      description: "Use Read First/Last and chapter links to read inside the app.",
      to: "/trend",
      cta: "Start Reading",
      done: false,
    },
    {
      title: "Rate and comment",
      description: "Share feedback once per novel and join the conversation.",
      to: "/trend",
      cta: "Go to a Novel",
      done: false,
    },
    {
      title: "Update your profile",
      description: "Change your details and upload a profile photo.",
      to: "/profile",
      cta: "My Profile",
      done: false,
    },
    {
      title: "Get inspired",
      description: "Browse quotes and come back to novels when you’re ready.",
      to: "/quotes",
      cta: "Open Quotes",
      done: false,
    },
  ];

  return (
    <Header>
      <h1>User Journey</h1>
      <div className="container themed-panel bg-man">
        <p className="callout-text">
          A quick path to use Scroll Saga effectively. Follow the steps, then come back anytime.
        </p>

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


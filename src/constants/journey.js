const STORAGE_KEY = "scrollSaga:journey";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

export const JOURNEY_EVENTS = Object.freeze({
  VISIT_TRENDING: "VISIT_TRENDING",
  OPEN_NOVEL: "OPEN_NOVEL",
  READ_CHAPTER: "READ_CHAPTER",
  SAVE_NOVEL: "SAVE_NOVEL",
  RATE_NOVEL: "RATE_NOVEL",
  POST_COMMENT: "POST_COMMENT",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  UPLOAD_PROFILE_PHOTO: "UPLOAD_PROFILE_PHOTO",
  VISIT_QUOTES: "VISIT_QUOTES",
  VISIT_SAGA_NEWS: "VISIT_SAGA_NEWS",
});

const safeParseJson = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getNow = () => Date.now();

export const loadJourneyState = () => {
  if (typeof window === "undefined") {
    return { events: {}, dismissedAt: 0 };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParseJson(raw) : null;
  const events = parsed?.events && typeof parsed.events === "object" ? parsed.events : {};
  const dismissedAt = Number(parsed?.dismissedAt ?? 0);

  return {
    events,
    dismissedAt: Number.isFinite(dismissedAt) ? dismissedAt : 0,
  };
};

export const saveJourneyState = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const markJourneyEvent = (eventName) => {
  if (!eventName) {
    return;
  }

  const state = loadJourneyState();
  const next = {
    ...state,
    events: {
      ...state.events,
      [eventName]: getNow(),
    },
  };
  saveJourneyState(next);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("journeyUpdated"));
  }
};

export const dismissJourneyBanner = () => {
  const state = loadJourneyState();
  saveJourneyState({ ...state, dismissedAt: getNow() });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("journeyUpdated"));
  }
};

export const isBannerDismissed = () => {
  const state = loadJourneyState();
  if (!state.dismissedAt) {
    return false;
  }

  return getNow() - state.dismissedAt < DISMISS_TTL_MS;
};

export const getJourneySteps = ({ isLoggedIn } = {}) => {
  const { events } = loadJourneyState();
  const has = (key) => Boolean(events?.[key]);

  const steps = [
    {
      key: "AUTH",
      title: "Login",
      description: "Login to save, rate, comment, and manage your profile.",
      to: isLoggedIn ? "/trend" : "/login",
      cta: isLoggedIn ? "Continue" : "Login",
      done: Boolean(isLoggedIn),
    },
    {
      key: "TRENDING",
      title: "Explore trending",
      description: "Browse the most viewed novels and pick a story.",
      to: "/trend",
      cta: "Open Trending",
      done: has(JOURNEY_EVENTS.VISIT_TRENDING),
    },
    {
      key: "OPEN_NOVEL",
      title: "Open a novel",
      description: "Tap Read Now to open a novel details page.",
      to: "/trend",
      cta: "Choose a Novel",
      done: has(JOURNEY_EVENTS.OPEN_NOVEL),
    },
    {
      key: "READ_CHAPTER",
      title: "Read a chapter",
      description: "Use Read First/Last or pick a chapter link.",
      to: "/trend",
      cta: "Start Reading",
      done: has(JOURNEY_EVENTS.READ_CHAPTER),
    },
    {
      key: "SAVE",
      title: "Save a novel",
      description: "Save at least one novel to your Book List.",
      to: "/bookList",
      cta: "Open Book List",
      done: has(JOURNEY_EVENTS.SAVE_NOVEL),
    },
    {
      key: "RATE",
      title: "Rate a novel",
      description: "Leave a rating (one per novel).",
      to: "/trend",
      cta: "Rate a Novel",
      done: has(JOURNEY_EVENTS.RATE_NOVEL),
    },
    {
      key: "COMMENT",
      title: "Post a comment",
      description: "Share feedback in the comments section.",
      to: "/trend",
      cta: "Join the Discussion",
      done: has(JOURNEY_EVENTS.POST_COMMENT),
    },
    {
      key: "PROFILE",
      title: "Update your profile",
      description: "Add a bio or upload a profile photo.",
      to: "/profile",
      cta: "My Profile",
      done: has(JOURNEY_EVENTS.UPDATE_PROFILE) || has(JOURNEY_EVENTS.UPLOAD_PROFILE_PHOTO),
    },
    {
      key: "QUOTES",
      title: "Browse quotes",
      description: "Visit the quotes section for inspiration.",
      to: "/quotes",
      cta: "Open Quotes",
      done: has(JOURNEY_EVENTS.VISIT_QUOTES),
    },
  ];

  const completedCount = steps.filter((step) => step.done).length;
  const nextStep = steps.find((step) => !step.done) ?? null;

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    nextStep,
  };
};

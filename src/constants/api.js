const DEFAULT_API_BASE_URL = "https://lifegiver13.pythonanywhere.com";
const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (ENV_API_BASE_URL || DEFAULT_API_BASE_URL).replace(
  /\/+$/,
  "",
);

export const API_ENDPOINTS = {
  home: "/",
  novels: "/api/novels",
  search: (query) => `/api/search?query=${encodeURIComponent(query)}`,
  myBooklist: (userId) =>
    `/api/my_booklist?user_id=${encodeURIComponent(userId)}`,
  login: "/api/login",
  register: "/register",
  users: "/api/users",
  userDetails: (userId) => `/api/users/${encodeURIComponent(userId)}`,
  profile: "/api/profile",
  profilePhoto: "/api/profile/photo",
  saveNovel: (novelId) => `/api/save_novel/${encodeURIComponent(novelId)}`,
  unsaveNovel: (novelId) => `/api/unsave_novel/${encodeURIComponent(novelId)}`,
  chapter: (novelId, chapterNumber) =>
    `/chapter/${encodeURIComponent(novelId)}/${encodeURIComponent(
      chapterNumber,
    )}`,
  novelStats: (novelId) => `/api/novels/${encodeURIComponent(novelId)}/stats`,
  trackNovelView: (novelId) =>
    `/api/novels/${encodeURIComponent(novelId)}/view`,
  rateNovel: (novelId) => `/api/novels/${encodeURIComponent(novelId)}/rating`,
  novelReviews: (novelId) =>
    `/api/novels/${encodeURIComponent(novelId)}/reviews`,
  comments: "/comments",
  novelDetails: (novelId, novelTitle) =>
    `/novel/${encodeURIComponent(novelId)}/${encodeURIComponent(novelTitle)}`,
  image: (imageName) => `/static/images/${imageName}`,
};

export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export const getCurrentUserId = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return String(localStorage.getItem("userId") ?? "").trim();
};

export const buildRequestHeaders = (
  baseHeaders = {},
  { includeUserId = false } = {},
) => {
  const headers = { ...baseHeaders };

  if (includeUserId) {
    const userId = getCurrentUserId();
    if (userId) {
      headers["X-User-Id"] = userId;
    }
  }

  return headers;
};

export const buildImageUrl = (imageName) =>
  imageName ? buildApiUrl(API_ENDPOINTS.image(imageName)) : "";

export const getProfilePhotoUrl = (photoName) => {
  const value = String(photoName ?? "").trim();
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value) || /^data:image\//i.test(value)) {
    return value;
  }

  return buildImageUrl(value);
};

export const normalizeAverageRating = (rating, fallback = 3) => {
  const numeric = Number(rating);
  if (Number.isNaN(numeric) || numeric <= 0) {
    return fallback;
  }

  return Math.min(5, Math.max(1, numeric));
};

export const getUserFriendlyErrorMessage = (
  error,
  fallback = "Something went wrong. Please refresh and try again.",
) => {
  const rawMessage = String(error?.message ?? error ?? "").trim();
  if (!rawMessage) {
    return fallback;
  }

  const normalized = rawMessage.toLowerCase();
  const hasNetworkIssue =
    normalized.includes("failed to fetch") ||
    normalized.includes("networkerror") ||
    normalized.includes("network request failed") ||
    normalized.includes("load failed") ||
    normalized.includes("timeout");

  if (hasNetworkIssue) {
    return "Connection issue detected. Please check your internet and refresh.";
  }

  return rawMessage;
};

export const getNovelId = (novel) => novel?.novel_id ?? novel?.id ?? null;

export const getNovelTitle = (novel) =>
  novel?.novel_title ?? novel?.title ?? "Untitled";

export const getNovelDescription = (novel) =>
  novel?.description ?? novel?.summary ?? "";

export const getNovelAuthor = (novel) => novel?.author ?? "Unknown author";

export const getNovelSlug = (novelTitle = "") =>
  String(novelTitle).trim().toLowerCase().replace(/\s+/g, "-");

export const getNovelCover = (novel) => {
  const coverImage = novel?.cover_image ?? novel?.image ?? "";
  if (!coverImage) {
    return "";
  }

  if (/^https?:\/\//i.test(coverImage)) {
    return coverImage;
  }

  return buildImageUrl(coverImage);
};

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) {
      return;
    }
    const trimmed = String(value).trim();
    if (trimmed) {
      query.set(key, trimmed);
    }
  });
  const encoded = query.toString();
  return encoded ? `?${encoded}` : "";
}

function getAuthHeaders() {
  const token = localStorage.getItem("jobboard_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const authHeaders = getAuthHeaders();
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: options.body instanceof FormData ? { ...(options.headers || {}), ...authHeaders } : {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    // fetch only rejects here on network failures (backend down, CORS, offline).
    throw new ApiError(
      "Unable to connect to the server. Please make sure the backend is running.",
      0
    );
  }

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw normalizeApiError(
      payload,
      response.status,
      "The request could not be completed."
    );
  }

  return payload;
}

function readDetail(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }
  if (typeof payload.detail === "string") {
    return payload.detail;
  }
  return "";
}

function normalizeApiError(payload, status, fallbackMessage) {
  const detail = readDetail(payload);

  if (status === 401) {
    try {
      localStorage.removeItem("jobboard_token");
      localStorage.removeItem("jobboard_user");
    } catch {
      // Ignore persistence failures in restricted environments.
    }
    return new ApiError(detail || "Your session expired. Please sign in again.", 401);
  }
  if (status === 400) {
    return new ApiError(detail || "The request was invalid.", 400);
  }
  if (status === 404) {
    return new ApiError(detail || "The requested record was not found.", 404);
  }
  if (status >= 500) {
    return new ApiError(
      detail || "The server could not complete this request. Please try again.",
      status
    );
  }
  return new ApiError(detail || fallbackMessage, status);
}

export function getJobs(filters = {}) {
  return request(`/api/jobs${buildQuery(filters)}`);
}

export function getJob(id) {
  return request(`/api/jobs/${id}`);
}

export function createJob(job) {
  return request("/api/jobs", {
    method: "POST",
    body: JSON.stringify(job),
  });
}

export function updateJob(id, job) {
  return request(`/api/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(job),
  });
}

export function archiveJob(id) {
  return request(`/api/jobs/${id}`, {
    method: "DELETE",
  });
}

export function getCandidates() { return request("/api/candidates"); }
export function getApplications(filters = {}) { return request(`/api/applications${buildQuery(filters)}`); }
export function getNotifications() { return request("/api/notifications"); }
export function getAnalytics() { return request("/api/analytics"); }
export function generateAiSuggestions(prompt) {
  return request("/api/ai/generate", { method: "POST", body: JSON.stringify({ prompt, action: "generate", use_fallback: true }) });
}

export function requestAi(prompt, action) {
  return request("/api/ai/generate", { method: "POST", body: JSON.stringify({ prompt, action, use_fallback: true }) });
}
export function getInterviews() { return request("/api/interviews"); }
export function scheduleInterview(interview) { return request("/api/interviews", { method: "POST", body: JSON.stringify(interview) }); }
export function updateApplication(id, payload) { return request(`/api/applications/${id}`, { method: "PATCH", body: JSON.stringify(payload) }); }
export function getMatch(candidateId, jobId) { return request(`/api/matching/${candidateId}/${jobId}`); }
export function analyseResume(file) {
  const form = new FormData();
  form.append("file", file);
  return request("/api/resumes/analyse", { method: "POST", headers: {}, body: form });
}
export function duplicateJob(id) { return request(`/api/jobs/${id}/duplicate`, { method: "POST" }); }
export function restoreJob(id) { return request(`/api/jobs/${id}/restore`, { method: "POST" }); }
export function closeJob(id) { return request(`/api/jobs/${id}/close`, { method: "POST" }); }
export function reopenJob(id) { return request(`/api/jobs/${id}/reopen`, { method: "POST" }); }
export function signup(payload) { return request("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }); }
export function login(payload) { return request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }); }
export function getMe(token = localStorage.getItem("jobboard_token")) {
  return request("/api/auth/me", token ? { headers: { Authorization: `Bearer ${token}` } } : {});
}
export function logout(token = localStorage.getItem("jobboard_token")) {
  return request("/api/auth/logout", token ? { method: "POST", headers: { Authorization: `Bearer ${token}` } } : { method: "POST" });
}

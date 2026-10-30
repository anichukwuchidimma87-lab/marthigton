const configuredApiUrl =
  typeof process !== "undefined" && typeof process.env.API_URL === "string"
    ? process.env.API_URL.trim()
    : "";
const localHostname =
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE_URL =
  (configuredApiUrl || (localHostname ? "http://localhost:5000/api" : "")).replace(/\/+$/, "");

export async function apiRequest(path, { token, ...options } = {}) {
  if (!API_BASE_URL) {
    throw new Error("API_URL is not configured for this Vercel deployment. Add the Render API URL ending in /api and redeploy.");
  }
  const headers = new Headers(options.headers || {});
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || `Request failed (${response.status}).`);
  }
  return result;
}

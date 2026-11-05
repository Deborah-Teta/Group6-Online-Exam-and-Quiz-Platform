const AUTH_URL = "/api/auth";

async function postAuth(path, payload) {
  let response;

  try {
    response = await fetch(`${AUTH_URL}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Could not reach the server. Check that the backend is running and try again.",
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Authentication failed.");
  }

  return data;
}

export function register({ fullName, email, password, role }) {
  return postAuth("register", { fullName, email, password, role });
}

export function login({ email, password }) {
  return postAuth("login", { email, password });
}
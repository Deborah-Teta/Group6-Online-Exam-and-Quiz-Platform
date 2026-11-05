const AUTH_URL = "/api/auth";
const VALID_ROLES = new Set(["student", "teacher", "admin"]);

function getUserFromToken(token, email) {
  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) return null;

  try {
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = new TextDecoder().decode(
      Uint8Array.from(atob(paddedBase64), (character) =>
        character.charCodeAt(0),
      ),
    );
    const claims = JSON.parse(payload);

    if (
      !VALID_ROLES.has(claims.role) ||
      typeof claims.userId !== "string" ||
      typeof claims.name !== "string"
    ) {
      return null;
    }

    return {
      id: claims.userId,
      fullName: claims.name,
      email,
      role: claims.role,
    };
  } catch {
    return null;
  }
}

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

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Please try again.");
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "Authentication failed.");
  }

  return data;
}

export function register({ fullName, email, password, role }) {
  return postAuth("register", { fullName, email, password, role });
}

export function login({ email, password }) {
  return postAuth("login", { email, password }).then((data) => {
    if (data.user || !data.token) return data;

    const user = getUserFromToken(data.token, email);
    return user ? { ...data, user } : data;
  });
}
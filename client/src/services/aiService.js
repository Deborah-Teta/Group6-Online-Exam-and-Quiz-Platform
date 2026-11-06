const API_BASE = "/api/ai";

async function aiRequest(path, { method = "GET", body } = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Could not reach the AI service. Check that the backend is running.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from AI service.");
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || "The AI request failed.");
  }

  return data;
}

export async function generateAIDrafts(params) {
  return aiRequest("/generate", {
    method: "POST",
    body: params,
  });
}

export async function getAllAIDrafts({ reviewStatus = "pending", topic = "", page = 1, limit = 20 } = {}) {
  const query = new URLSearchParams();
  if (reviewStatus && reviewStatus !== "all") query.set("reviewStatus", reviewStatus);
  if (topic) query.set("topic", topic);
  query.set("page", String(page));
  query.set("limit", String(limit));
  return aiRequest(`/drafts?${query.toString()}`);
}

export async function getAIDraftsByGeneration(generationId) {
  return aiRequest(`/drafts/${generationId}`);
}

export async function updateAIDraft(draftId, draftData) {
  return aiRequest(`/drafts/${draftId}`, {
    method: "PATCH",
    body: draftData,
  });
}

export async function approveAIDraft(draftId) {
  return aiRequest(`/drafts/${draftId}/approve`, {
    method: "POST",
  });
}

export async function rejectAIDraft(draftId) {
  return aiRequest(`/drafts/${draftId}/reject`, {
    method: "POST",
  });
}

export async function deleteAIDraft(draftId) {
  return aiRequest(`/drafts/${draftId}`, {
    method: "DELETE",
  });
}

export async function getAIGenerations({ page = 1, limit = 10 } = {}) {
  return aiRequest(`/generations?page=${page}&limit=${limit}`);
}

export async function getAIGenerationById(generationId) {
  return aiRequest(`/generations/${generationId}`);
}


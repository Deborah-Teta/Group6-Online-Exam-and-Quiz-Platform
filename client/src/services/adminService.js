const API_BASE = "/api/admin";

async function adminRequest(path, { method = "GET", body, signal } = {}) {
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
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw new Error("The admin request timed out. Please try again.", {
        cause: error,
      });
    }
    throw new Error(
      "Could not reach the server. Check that it is running and try again.",
      { cause: error },
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Please try again.");
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "The admin request could not be completed.");
  }

  return data;
}

export const adminService = {
  checkHealth() {
    return adminRequest("/stats", {
      signal: AbortSignal.timeout(5000),
    }).then(() => true);
  },

  async getStats() {
    const data = await adminRequest("/stats");
    return { data: data.stats };
  },

  async getPendingTeachers() {
    const data = await adminRequest("/teachers/pending");
    return { data: data.teachers };
  },

  async approveTeacher(teacherId) {
    await adminRequest(`/teachers/${encodeURIComponent(teacherId)}/approve`, {
      method: "PATCH",
    });
    return { success: true };
  },

  async rejectTeacher(teacherId, reason) {
    await adminRequest(`/teachers/${encodeURIComponent(teacherId)}/reject`, {
      method: "PATCH",
      body: { reason },
    });
    return { success: true };
  },

  async getUsers({ role = "all", status = "all", search = "" } = {}) {
    const params = new URLSearchParams();
    if (role !== "all") params.set("role", role);
    if (status !== "all") params.set("status", status);
    if (search) params.set("search", search);
    const suffix = params.size ? `?${params}` : "";
    const data = await adminRequest(`/users${suffix}`);
    return { data: data.users };
  },

  async blockUser(userId, reason) {
    await adminRequest(`/users/${encodeURIComponent(userId)}/block`, {
      method: "PATCH",
      body: { reason },
    });
    return { success: true };
  },

  async unblockUser(userId) {
    await adminRequest(`/users/${encodeURIComponent(userId)}/unblock`, {
      method: "PATCH",
    });
    return { success: true };
  },

  async getClasses() {
    const data = await adminRequest("/classes");
    return { data: data.classes };
  },

  async getAuditLogs() {
    const data = await adminRequest("/audit-logs");
    return { data: data.logs };
  },
};

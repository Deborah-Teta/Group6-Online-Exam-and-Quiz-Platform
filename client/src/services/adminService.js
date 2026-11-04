// Admin API service with auto-fallback to mock data for instant offline preview & testing

const API_BASE = 'http://localhost:5000/api/admin';

// In-memory demo store
let mockStats = {
  totalTeachers: 14,
  pendingTeachers: 3,
  approvedTeachers: 11,
  totalStudents: 148,
  blockedUsers: 2,
  examsThisWeek: 9,
  aiGenerations: 42,
  totalClasses: 8,
};

let mockPendingTeachers = [
  {
    _id: "t_pending_01",
    fullName: "Dr. Sarah Jenkins",
    email: "sarah.jenkins@university.edu",
    role: "teacher",
    approvalStatus: "pending",
    isBlocked: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    department: "Computer Science",
    institution: "State University"
  },
  {
    _id: "t_pending_02",
    fullName: "Prof. Michael Chang",
    email: "mchang@tech-institute.org",
    role: "teacher",
    approvalStatus: "pending",
    isBlocked: false,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    department: "Data Engineering",
    institution: "Tech Institute"
  },
  {
    _id: "t_pending_03",
    fullName: "Elena Rostova",
    email: "elena.rostova@academy.io",
    role: "teacher",
    approvalStatus: "pending",
    isBlocked: false,
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
    department: "Mathematics",
    institution: "St. John Academy"
  }
];

let mockUsers = [
  ...mockPendingTeachers,
  {
    _id: "t_approved_01",
    fullName: "Dr. Robert Vance",
    email: "rvance@edu.org",
    role: "teacher",
    approvalStatus: "approved",
    isBlocked: false,
    createdAt: "2026-10-15T10:00:00.000Z"
  },
  {
    _id: "t_approved_02",
    fullName: "Amanda Rollins",
    email: "a.rollins@school.org",
    role: "teacher",
    approvalStatus: "approved",
    isBlocked: false,
    createdAt: "2026-10-20T14:30:00.000Z"
  },
  {
    _id: "s_01",
    fullName: "Kevin Ndayisaba",
    email: "kevin.ndayisaba@student.edu",
    role: "student",
    approvalStatus: "approved",
    isBlocked: false,
    createdAt: "2026-10-28T09:15:00.000Z"
  },
  {
    _id: "s_02",
    fullName: "Aline Uwase",
    email: "aline.uwase@student.edu",
    role: "student",
    approvalStatus: "approved",
    isBlocked: false,
    createdAt: "2026-10-29T11:40:00.000Z"
  },
  {
    _id: "s_03",
    fullName: "Eric Mugisha",
    email: "eric.mugisha@student.edu",
    role: "student",
    approvalStatus: "approved",
    isBlocked: true,
    blockedReason: "Suspicious activity detected: 3 simultaneous exam sessions with mismatched IP coordinates.",
    createdAt: "2026-10-22T08:00:00.000Z"
  },
  {
    _id: "t_blocked_01",
    fullName: "Marcus Finch",
    email: "m.finch@private-tutor.net",
    role: "teacher",
    approvalStatus: "approved",
    isBlocked: true,
    blockedReason: "Violated terms of service by leaking unreleased question bank.",
    createdAt: "2026-09-10T12:00:00.000Z"
  },
  {
    _id: "admin_01",
    fullName: "Blaise (Admin)",
    email: "admin@examplatform.edu",
    role: "admin",
    approvalStatus: "approved",
    isBlocked: false,
    createdAt: "2026-10-01T00:00:00.000Z"
  }
];

let mockClasses = [
  {
    _id: "c_01",
    name: "CS101: Introduction to Algorithms",
    description: "Foundational data structures, sorting algorithms, and complexity analysis.",
    classCode: "ALG-4821",
    teacherId: { fullName: "Dr. Robert Vance", email: "rvance@edu.org" },
    isActive: true,
    studentCount: 38,
    createdAt: "2026-10-25T14:00:00.000Z"
  },
  {
    _id: "c_02",
    name: "DB302: Advanced Database Systems",
    description: "Relational modeling, indexing strategies, normalization, and ACID properties.",
    classCode: "DAT-9104",
    teacherId: { fullName: "Amanda Rollins", email: "a.rollins@school.org" },
    isActive: true,
    studentCount: 29,
    createdAt: "2026-10-26T09:30:00.000Z"
  },
  {
    _id: "c_03",
    name: "NET201: Computer Networking & Security",
    description: "TCP/IP protocol stack, routing protocols, firewalls, and encryption basics.",
    classCode: "NET-3350",
    teacherId: { fullName: "Dr. Robert Vance", email: "rvance@edu.org" },
    isActive: true,
    studentCount: 42,
    createdAt: "2026-10-27T11:20:00.000Z"
  },
  {
    _id: "c_04",
    name: "AI405: Generative Models in Education",
    description: "Applied LLM prompts, verification pipelines, and exam question generation.",
    classCode: "AI-7720",
    teacherId: { fullName: "Amanda Rollins", email: "a.rollins@school.org" },
    isActive: true,
    studentCount: 35,
    createdAt: "2026-10-30T16:45:00.000Z"
  }
];

let mockAuditLogs = [
  {
    _id: "log_01",
    action: "approve_teacher",
    adminId: { fullName: "Blaise (Admin)", email: "admin@examplatform.edu" },
    targetUserId: { fullName: "Amanda Rollins", email: "a.rollins@school.org", role: "teacher" },
    reason: "Teacher account approved by administrator",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    _id: "log_02",
    action: "block_user",
    adminId: { fullName: "Blaise (Admin)", email: "admin@examplatform.edu" },
    targetUserId: { fullName: "Eric Mugisha", email: "eric.mugisha@student.edu", role: "student" },
    reason: "Suspicious activity detected: 3 simultaneous exam sessions with mismatched IP coordinates.",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    _id: "log_03",
    action: "approve_teacher",
    adminId: { fullName: "Blaise (Admin)", email: "admin@examplatform.edu" },
    targetUserId: { fullName: "Dr. Robert Vance", email: "rvance@edu.org", role: "teacher" },
    reason: "Credentials and university faculty affiliation verified",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || 'demo_admin_token';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const adminService = {
  // Check if live backend is online
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(1500)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // 1. Get Platform Stats
  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        return { source: 'live', data: data.stats };
      }
    } catch (e) {
      // fallback
    }
    return { source: 'mock', data: { ...mockStats } };
  },

  // 2. Get Pending Teachers
  async getPendingTeachers() {
    try {
      const res = await fetch(`${API_BASE}/teachers/pending`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        return { source: 'live', data: data.teachers };
      }
    } catch (e) {
      // fallback
    }
    return { source: 'mock', data: [...mockPendingTeachers] };
  },

  // 3. Approve Teacher
  async approveTeacher(teacherId) {
    try {
      const res = await fetch(`${API_BASE}/teachers/${teacherId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return { success: true };
      }
    } catch (e) {
      // fallback
    }

    // Mock update
    const teacher = mockUsers.find(u => u._id === teacherId);
    if (teacher) {
      teacher.approvalStatus = 'approved';
      mockPendingTeachers = mockPendingTeachers.filter(t => t._id !== teacherId);
      mockStats.pendingTeachers = Math.max(0, mockStats.pendingTeachers - 1);
      mockStats.approvedTeachers += 1;

      mockAuditLogs.unshift({
        _id: 'log_' + Date.now(),
        action: 'approve_teacher',
        adminId: { fullName: "Blaise (Admin)", email: "admin@examplatform.edu" },
        targetUserId: { fullName: teacher.fullName, email: teacher.email, role: teacher.role },
        reason: "Teacher account approved by administrator",
        createdAt: new Date().toISOString()
      });
    }
    return { success: true, source: 'mock' };
  },

  // 4. Reject Teacher
  async rejectTeacher(teacherId, reason) {
    try {
      const res = await fetch(`${API_BASE}/teachers/${teacherId}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return { success: true };
      }
    } catch (e) {
      // fallback
    }

    // Mock update
    const teacher = mockUsers.find(u => u._id === teacherId);
    if (teacher) {
      teacher.approvalStatus = 'rejected';
      teacher.blockedReason = reason || 'Rejected application';
      mockPendingTeachers = mockPendingTeachers.filter(t => t._id !== teacherId);
      mockStats.pendingTeachers = Math.max(0, mockStats.pendingTeachers - 1);

      mockAuditLogs.unshift({
        _id: 'log_' + Date.now(),
        action: 'reject_teacher',
        adminId: { fullName: "Blaise (Admin)", email: "admin@examplatform.edu" },
        targetUserId: { fullName: teacher.fullName, email: teacher.email, role: teacher.role },
        reason: reason || "Teacher registration application rejected",
        createdAt: new Date().toISOString()
      });
    }
    return { success: true, source: 'mock' };
  },

  // 5. Get All Users
  async getUsers({ role = 'all', status = 'all', search = '' } = {}) {
    try {
      const params = new URLSearchParams();
      if (role !== 'all') params.append('role', role);
      if (status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/users?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        return { source: 'live', data: data.users };
      }
    } catch (e) {
      // fallback
    }

    let list = [...mockUsers];
    if (role !== 'all') {
      list = list.filter(u => u.role === role);
    }
    if (status !== 'all') {
      if (status === 'blocked') {
        list = list.filter(u => u.isBlocked);
      } else {
        list = list.filter(u => u.approvalStatus === status && !u.isBlocked);
      }
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return { source: 'mock', data: list };
  },

  // 6. Block User Account
  async blockUser(userId, reason) {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/block`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return { success: true };
      }
    } catch (e) {
      // fallback
    }

    const user = mockUsers.find(u => u._id === userId);
    if (user) {
      user.isBlocked = true;
      user.blockedReason = reason;
      mockStats.blockedUsers += 1;

      mockAuditLogs.unshift({
        _id: 'log_' + Date.now(),
        action: 'block_user',
        adminId: { fullName: "Blaise (Admin)", email: "admin@examplatform.edu" },
        targetUserId: { fullName: user.fullName, email: user.email, role: user.role },
        reason: reason,
        createdAt: new Date().toISOString()
      });
    }
    return { success: true, source: 'mock' };
  },

  // 7. Unblock User Account
  async unblockUser(userId) {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/unblock`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return { success: true };
      }
    } catch (e) {
      // fallback
    }

    const user = mockUsers.find(u => u._id === userId);
    if (user) {
      user.isBlocked = false;
      user.blockedReason = "";
      mockStats.blockedUsers = Math.max(0, mockStats.blockedUsers - 1);

      mockAuditLogs.unshift({
        _id: 'log_' + Date.now(),
        action: 'unblock_user',
        adminId: { fullName: "Blaise (Admin)", email: "admin@examplatform.edu" },
        targetUserId: { fullName: user.fullName, email: user.email, role: user.role },
        reason: "Account unblocked by administrator",
        createdAt: new Date().toISOString()
      });
    }
    return { success: true, source: 'mock' };
  },

  // 8. Get Classes
  async getClasses() {
    try {
      const res = await fetch(`${API_BASE}/classes`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        return { source: 'live', data: data.classes };
      }
    } catch (e) {
      // fallback
    }
    return { source: 'mock', data: [...mockClasses] };
  },

  // 9. Get Audit Logs
  async getAuditLogs() {
    try {
      const res = await fetch(`${API_BASE}/audit-logs`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        return { source: 'live', data: data.logs };
      }
    } catch (e) {
      // fallback
    }
    return { source: 'mock', data: [...mockAuditLogs] };
  }
};


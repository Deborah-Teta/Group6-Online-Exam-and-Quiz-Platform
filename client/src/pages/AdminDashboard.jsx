import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  ClipboardList,
  Sparkles,
  Shield,
  Search,
  Check,
  X,
  Ban,
  Copy,
  AlertTriangle,
  RotateCw,
  ArrowLeft
} from 'lucide-react';
import Sidebar from '../layouts/Sidebar';
import Navbar from '../layouts/Navbar';
import StatCard from '../components/common/statuscard';
import Modal from '../components/common/Modal';
import { AdminProfileTab } from '../components/admin/AdminProfileTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/useAuth';

export const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Determine active view from URL path
  const getTabFromPath = (path) => {
    if (path.includes('/admin/profile')) return 'profile';
    if (path.includes('/admin/settings')) return 'settings';
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/classes')) return 'classes';
    if (path.includes('/admin/audit') || path.includes('/admin/statistics')) return 'audit';
    if (path.includes('/admin/approvals')) return 'pending';
    return 'pending'; // default overview / approvals
  };

  const activeTab = getTabFromPath(location.pathname);
  const isDedicatedPage = activeTab === 'profile' || activeTab === 'settings';

  const handleSelectTab = (tabId) => {
    switch (tabId) {
      case 'profile':
        navigate('/admin/profile');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'classes':
        navigate('/admin/classes');
        break;
      case 'audit':
        navigate('/admin/audit');
        break;
      case 'pending':
      default:
        navigate('/admin/approvals');
        break;
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLiveServer, setIsLiveServer] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Data states
  const [stats, setStats] = useState({});
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Modal & search states
  const [blockingUser, setBlockingUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockError, setBlockError] = useState('');
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [classSearch, setClassSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('all');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [statsRes, pendingRes, usersRes, classesRes, logsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingTeachers(),
        adminService.getUsers(),
        adminService.getClasses(),
        adminService.getAuditLogs()
      ]);

      setStats(statsRes.data || {});
      setPendingTeachers(pendingRes.data || []);
      setUsers(usersRes.data || []);
      setClasses(classesRes.data || []);
      setAuditLogs(logsRes.data || []);
      setIsLiveServer(true);
    } catch (err) {
      setIsLiveServer(false);
      setLoadError(err.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    Promise.all([
      adminService.getStats(),
      adminService.getPendingTeachers(),
      adminService.getUsers(),
      adminService.getClasses(),
      adminService.getAuditLogs()
    ])
      .then(([statsRes, pendingRes, usersRes, classesRes, logsRes]) => {
        if (!isCurrent) return;
        setStats(statsRes.data || {});
        setPendingTeachers(pendingRes.data || []);
        setUsers(usersRes.data || []);
        setClasses(classesRes.data || []);
        setAuditLogs(logsRes.data || []);
        setIsLiveServer(true);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setIsLiveServer(false);
        setLoadError(err.message || 'Failed to load administrator data.');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  // Action Handlers
  const handleApproveTeacher = async (teacherId) => {
    try {
      await adminService.approveTeacher(teacherId);
      showToast('Teacher approved successfully! Faculty account activated.');
      await loadData();
    } catch (err) {
      setLoadError(err.message || 'Failed to approve teacher.');
    }
  };

  const handleRejectTeacher = async (teacherId) => {
    const reason = window.prompt(
      'Enter justification for rejecting this faculty applicant:',
      'Unverified educational domain or missing institutional credentials.'
    );
    if (reason !== null) {
      try {
        await adminService.rejectTeacher(teacherId, reason);
        showToast('Teacher registration rejected.');
        await loadData();
      } catch (err) {
        setLoadError(err.message || 'Failed to reject teacher.');
      }
    }
  };

  const handleConfirmBlock = async (e) => {
    e.preventDefault();
    if (!blockReason.trim()) {
      setBlockError('Please provide a specific justification reason for blocking this account.');
      return;
    }

    try {
      setIsSubmittingBlock(true);
      setBlockError('');
      await adminService.blockUser(blockingUser._id, blockReason.trim());
      showToast('User account has been blocked.');
      setBlockingUser(null);
      setBlockReason('');
      await loadData();
    } catch (err) {
      setBlockError(err.message || 'Failed to block account.');
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  const handleUnblockUser = async (userId) => {
    if (window.confirm('Restore this account and reinstate platform privileges?')) {
      try {
        await adminService.unblockUser(userId);
        showToast('User account successfully unblocked.');
        await loadData();
      } catch (err) {
        setLoadError(err.message || 'Failed to unblock user.');
      }
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered lists
  const filteredTeachers = pendingTeachers.filter((t) => {
    const q = teacherSearch.toLowerCase();
    return (
      t.fullName?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchSearch =
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    let matchStatus = true;
    if (userStatusFilter === 'blocked') matchStatus = !!u.isBlocked;
    else if (userStatusFilter === 'pending') matchStatus = u.approvalStatus === 'pending' && !u.isBlocked;
    else if (userStatusFilter === 'approved') matchStatus = u.approvalStatus === 'approved' && !u.isBlocked;
    else if (userStatusFilter === 'rejected') matchStatus = u.approvalStatus === 'rejected' && !u.isBlocked;
    return matchSearch && matchRole && matchStatus;
  });

  const filteredClasses = classes.filter((c) => {
    const q = classSearch.toLowerCase();
    const teacherName = typeof c.teacherId === 'object' ? c.teacherId?.fullName : '';
    return (
      c.name?.toLowerCase().includes(q) ||
      c.classCode?.toLowerCase().includes(q) ||
      teacherName?.toLowerCase().includes(q)
    );
  });

  const filteredLogs = auditLogs.filter((l) => {
    return auditFilter === 'all' || l.action === auditFilter;
  });

  const managementTabs = [
    { id: 'pending', label: 'Teacher Approvals', icon: Users, count: pendingTeachers.length },
    { id: 'users', label: 'Manage Users', icon: Users, count: users.length },
    { id: 'classes', label: 'Manage Classes', icon: GraduationCap, count: classes.length },
    { id: 'audit', label: 'Audit Trail', icon: Shield, count: auditLogs.length },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* 1. ExamFlow Shared Sidebar */}
      <Sidebar
        role="admin"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. ExamFlow Shared Navbar */}
      <Navbar
        user={{
          name: user?.name || user?.fullName || "Administrator",
          role: "admin",
          email: user?.email || "",
        }}
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={() => {
          if (window.confirm("Exit administrator session?")) {
            signOut();
            navigate("/login", { replace: true });
          }
        }}
      />

      {/* 3. Main Dashboard Workspace Content */}
      <main className="pt-24 px-4 pb-16 flex flex-col gap-6 sm:px-6 md:ml-64 md:px-8">
        
        {/* ========================================================= */}
        {/* VIEW A: DEDICATED PROFILE PAGE (Clean, without statcards) */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#5149B8] hover:text-[#413B9A] transition cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back to Dashboard Overview</span>
              </button>
            </div>
            <AdminProfileTab onShowToast={showToast} />
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW B: DEDICATED SETTINGS PAGE (Clean, without statcards) */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#5149B8] hover:text-[#413B9A] transition cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back to Dashboard Overview</span>
              </button>
            </div>
            <AdminSettingsTab onShowToast={showToast} onDataReset={loadData} />
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW C: MAIN MANAGEMENT DASHBOARD (With statcards & queue) */}
        {/* ========================================================= */}
        {!isDedicatedPage && (
          <>
            {/* Top Status Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md rounded-2xl px-6 py-3 border border-slate-200/60 shadow-xs">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${isLiveServer ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-700">
                  {isLiveServer ? 'Live platform data' : 'Backend unavailable'}
                </span>
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#5149B8] hover:text-[#413B9A] transition cursor-pointer"
              >
                <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Refreshing...' : 'Refresh Records'}</span>
              </button>
            </div>

            {loadError && (
              <div
                role="alert"
                className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <span>{loadError}</span>
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="shrink-0 font-semibold underline disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            )}

            {/* 4 Key StatCards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                icon={<GraduationCap size={28} className="text-[#5149B8]" />}
                title="Total Teachers"
                value={stats.totalTeachers ?? 0}
                subtext={stats.pendingTeachers > 0 ? `${stats.pendingTeachers} pending approval` : 'All verified'}
              />

              <StatCard
                icon={<Users size={28} className="text-[#5149B8]" />}
                title="Enrolled Students"
                value={stats.totalStudents ?? 0}
                subtext={`${stats.blockedUsers ?? 0} blocked accounts`}
              />

              <StatCard
                icon={<ClipboardList size={28} className="text-[#5149B8]" />}
                title="Exams This Week"
                value={stats.examsThisWeek ?? 0}
                subtext={`${stats.totalClasses ?? 0} active classes`}
              />

              <StatCard
                icon={<Sparkles size={28} className="text-[#5149B8]" />}
                title="AI Generations"
                value={stats.aiGenerations ?? 0}
                subtext="Questions drafted via AI"
              />
            </div>

            {/* Action Notice Banner (if any pending teachers) */}
            {pendingTeachers.length > 0 && activeTab !== 'pending' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-sm font-semibold text-amber-900">
                    Action Required: {pendingTeachers.length} educator account{pendingTeachers.length > 1 ? 's are' : ' is'} waiting for administrative approval.
                  </p>
                </div>
                <button
                  onClick={() => handleSelectTab('pending')}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Review Applications &rarr;
                </button>
              </div>
            )}

            {/* Main Data Container (ExamFlow Card Style) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
              {/* Management Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
                {managementTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer
                        ${
                          isActive
                            ? 'bg-[#5149B8] text-white shadow-md'
                            : 'bg-[#FFFFFF] text-[#5149B8] hover:bg-[#dbe7f9]'
                        }
                      `}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`
                            px-2 py-0.5 rounded-full text-[10px] font-black
                            ${isActive ? 'bg-white/20 text-white' : 'bg-white text-[#5149B8] shadow-xs'}
                          `}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: TEACHER APPROVALS */}
              {activeTab === 'pending' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Faculty Approval Queue</h3>
                      <p className="text-xs text-slate-500">Teachers cannot build classes or schedule exams until approved.</p>
                    </div>

                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search applicants..."
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#5149B8] w-64 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {filteredTeachers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-[#FFFFFF] text-[#5149B8] flex items-center justify-center mb-3">
                        <Check size={28} />
                      </div>
                      <p className="font-bold text-slate-700">
                        {loading ? 'Loading teacher applications...' : 'No Pending Faculty Approvals'}
                      </p>
                      {!loading && <p className="text-xs mt-1">There are no pending teacher applications to review.</p>}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                            <th className="py-3 px-4">Applicant</th>
                            <th className="py-3 px-4">Department / Domain</th>
                            <th className="py-3 px-4">Date Applied</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Administrative Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredTeachers.map((t) => (
                            <tr key={t._id} className="hover:bg-slate-50/60 transition">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-[#FFFFFF] text-[#5149B8] font-bold flex items-center justify-center text-xs shrink-0">
                                    {t.fullName ? t.fullName.charAt(0).toUpperCase() : 'T'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm">{t.fullName}</div>
                                    <div className="text-slate-500 text-xs">{t.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-semibold text-slate-800">{t.department || 'General Faculty'}</div>
                                <div className="text-slate-400 text-[11px]">{t.institution || 'Verified Domain'}</div>
                              </td>
                              <td className="py-4 px-4 text-slate-500">
                                {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent'}
                              </td>
                              <td className="py-4 px-4">
                                <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold text-[11px]">
                                  Pending Review
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleApproveTeacher(t._id)}
                                    className="flex items-center gap-1.5 bg-[#5149B8] hover:bg-[#413B9A] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
                                  >
                                    <Check size={14} />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectTeacher(t._id)}
                                    className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer"
                                  >
                                    <X size={14} />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MANAGE ALL USERS */}
              {activeTab === 'users' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">User Directory & Permissions</h3>
                      <p className="text-xs text-slate-500">Inspect accounts, filter roles, and enforce security suspensions.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#5149B8] w-52 bg-slate-50/50"
                        />
                      </div>

                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 outline-none focus:border-[#5149B8] cursor-pointer"
                      >
                        <option value="all">All Roles</option>
                        <option value="teacher">Teachers</option>
                        <option value="student">Students</option>
                        <option value="admin">Administrators</option>
                      </select>

                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 outline-none focus:border-[#5149B8] cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="approved">Approved & Active</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="blocked">Blocked / Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Account Status</th>
                          <th className="py-3 px-4">Registered</th>
                          <th className="py-3 px-4 text-right">Access Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((u) => {
                          const isBlocked = !!u.isBlocked;
                          const isPending = u.role === 'teacher' && u.approvalStatus === 'pending';
                          const isRejected = u.role === 'teacher' && u.approvalStatus === 'rejected';

                          return (
                            <tr key={u._id} className="hover:bg-slate-50/60 transition">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                                      isBlocked
                                        ? 'bg-red-100 text-red-700'
                                        : u.role === 'admin'
                                        ? 'bg-slate-200 text-slate-800'
                                        : 'bg-[#FFFFFF] text-[#5149B8]'
                                    }`}
                                  >
                                    {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                      <span>{u.fullName}</span>
                                      {u.role === 'admin' && (
                                        <span className="text-[10px] font-bold text-[#5149B8] bg-blue-50 px-1.5 py-0.5 rounded-sm">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-slate-500 text-xs">{u.email}</div>
                                    {isBlocked && u.blockedReason && (
                                      <div className="text-red-500 text-[11px] italic mt-0.5">
                                        Reason: "{u.blockedReason}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="inline-block bg-[#FFFFFF] text-[#5149B8] font-bold text-[11px] px-3 py-0.5 rounded-full capitalize">
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {isBlocked ? (
                                  <span className="inline-block bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-bold text-[11px]">
                                    Blocked Account
                                  </span>
                                ) : isPending ? (
                                  <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold text-[11px]">
                                    Pending Review
                                  </span>
                                ) : isRejected ? (
                                  <span className="inline-block bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-bold text-[11px]">
                                    Rejected
                                  </span>
                                ) : (
                                  <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold text-[11px]">
                                    Active & Verified
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-slate-500">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-right">
                                {isBlocked ? (
                                  <button
                                    onClick={() => handleUnblockUser(u._id)}
                                    className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer"
                                  >
                                    <Check size={14} />
                                    <span>Unblock</span>
                                  </button>
                                ) : u.role === 'admin' ? (
                                  <span className="text-xs text-slate-400 italic">Protected</span>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    {isPending && (
                                      <button
                                        onClick={() => handleApproveTeacher(u._id)}
                                        className="inline-flex items-center gap-1 bg-[#5149B8] text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs hover:bg-[#413B9A] transition cursor-pointer"
                                      >
                                        <Check size={13} />
                                        <span>Approve</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setBlockingUser(u);
                                        setBlockReason('');
                                        setBlockError('');
                                      }}
                                      className="inline-flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer"
                                    >
                                      <Ban size={13} />
                                      <span>Block</span>
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: MANAGE CLASSES */}
              {activeTab === 'classes' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Classrooms & Courses</h3>
                      <p className="text-xs text-slate-500">Supervise created classrooms, assigned instructors, and student join codes.</p>
                    </div>

                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search classes..."
                        value={classSearch}
                        onChange={(e) => setClassSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#5149B8] w-64 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4">Course Name</th>
                          <th className="py-3 px-4">Instructor</th>
                          <th className="py-3 px-4">Student Join Code</th>
                          <th className="py-3 px-4">Enrolled Students</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredClasses.map((c) => {
                          const teacher = typeof c.teacherId === 'object' ? c.teacherId : null;
                          return (
                            <tr key={c._id} className="hover:bg-slate-50/60 transition">
                              <td className="py-4 px-4">
                                <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                                {c.description && (
                                  <div className="text-slate-500 text-xs max-w-sm mt-0.5">{c.description}</div>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-[#FFFFFF] text-[#5149B8] font-bold flex items-center justify-center text-xs shrink-0">
                                    {teacher?.fullName ? teacher.fullName.charAt(0).toUpperCase() : 'T'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800">{teacher?.fullName || 'Instructor unavailable'}</div>
                                    {teacher?.email && <div className="text-slate-400 text-[11px]">{teacher.email}</div>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <button
                                  onClick={() => handleCopyCode(c.classCode)}
                                  className="inline-flex items-center gap-1.5 font-mono font-bold bg-[#FFFFFF] text-[#5149B8] hover:bg-[#dbe7f9] px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                                  title="Click to copy join code"
                                >
                                  <span>{c.classCode}</span>
                                  {copiedCode === c.classCode ? (
                                    <Check size={12} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={12} className="opacity-70" />
                                  )}
                                </button>
                              </td>
                              <td className="py-4 px-4 font-bold text-slate-700">
                                {c.studentCount ?? 0} students
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-block border px-3 py-1 rounded-full font-bold text-[11px] ${c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {c.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT TRAIL */}
              {activeTab === 'audit' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Security Audit Trail</h3>
                      <p className="text-xs text-slate-500">Immutable chronological record of administrator enforcement actions.</p>
                    </div>

                    <select
                      value={auditFilter}
                      onChange={(e) => setAuditFilter(e.target.value)}
                      className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 outline-none focus:border-[#5149B8] cursor-pointer"
                    >
                      <option value="all">All Actions</option>
                      <option value="approve_teacher">Teacher Approvals</option>
                      <option value="reject_teacher">Teacher Rejections</option>
                      <option value="block_user">Account Blocks</option>
                      <option value="unblock_user">Account Unblocks</option>
                    </select>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4">Administrator</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">Target User</th>
                          <th className="py-3 px-4">Justification Reason</th>
                          <th className="py-3 px-4">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLogs.map((log) => {
                          const admin = typeof log.adminId === 'object' ? log.adminId : null;
                          const target = typeof log.targetUserId === 'object' ? log.targetUserId : null;

                          return (
                            <tr key={log._id} className="hover:bg-slate-50/60 transition">
                              <td className="py-4 px-4 font-bold text-slate-900">
                                {admin?.fullName || 'Blaise (Admin)'}
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`inline-block px-3 py-1 rounded-full font-bold text-[11px] ${
                                    log.action === 'block_user'
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {log.action.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-bold text-slate-800">{target?.fullName || 'User Account'}</div>
                                <div className="text-slate-400 text-[11px]">{target?.email}</div>
                              </td>
                              <td className="py-4 px-4 text-slate-700 max-w-sm">
                                {log.reason || 'Administrative action'}
                              </td>
                              <td className="py-4 px-4 text-slate-400">
                                {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 7. Block User Modal */}
      <Modal
        isOpen={!!blockingUser}
        onClose={() => setBlockingUser(null)}
        title="Block User Account"
        size="md"
      >
        {blockingUser && (
          <form onSubmit={handleConfirmBlock} className="flex flex-col gap-4">
            <div className="bg-[#FFFFFF] p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900">{blockingUser.fullName}</p>
                <p className="text-xs text-slate-500">{blockingUser.email}</p>
              </div>
              <span className="bg-white text-[#5149B8] font-bold text-xs px-3 py-1 rounded-full capitalize">
                {blockingUser.role}
              </span>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-700">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> Blocking this account terminates active exam sessions and immediately suspends all portal access.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Reason for Enforcement <span className="text-red-500">*</span>
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => {
                  setBlockReason(e.target.value);
                  if (blockError) setBlockError('');
                }}
                rows={3}
                placeholder="E.g., Repeated academic integrity violation during timed midterm exam..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                autoFocus
              />
              {blockError && <p className="text-xs text-red-600 font-medium">{blockError}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBlockingUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingBlock}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                {isSubmittingBlock ? 'Enforcing...' : 'Confirm & Block Account'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#5149B8] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 z-50 animate-bounce">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

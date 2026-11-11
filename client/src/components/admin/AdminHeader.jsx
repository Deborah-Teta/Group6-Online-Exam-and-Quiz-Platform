import { RefreshIcon, BellIcon } from './Icons';

export const AdminHeader = ({
  activeTab,
  isLiveServer,
  onRefresh,
  loading,
  pendingCount = 0,
  onOpenPending
}) => {
  const getTabDetails = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: 'Administrative Control Center',
          desc: 'Monitor platform health, approval queues, active exams, and AI utilization.'
        };
      case 'pending':
        return {
          title: 'Pending Faculty Approvals',
          desc: 'Review and verify credentials before granting faculty privileges.'
        };
      case 'users':
        return {
          title: 'User Management & Access Control',
          desc: 'Manage roles, inspect student & faculty profiles, and enforce policy restrictions.'
        };
      case 'classes':
        return {
          title: 'Classroom & Course Directory',
          desc: 'Review active classrooms, teacher assignments, and student enrollment codes.'
        };
      case 'audit':
        return {
          title: 'System Audit & Enforcement Log',
          desc: 'Immutable tracking of teacher approvals, rejections, and account block actions.'
        };
      default:
        return { title: 'Admin Workspace', desc: 'Online Exam & Quiz Platform' };
    }
  };

  const details = getTabDetails();

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <h1>{details.title}</h1>
        <p>{details.desc}</p>
      </div>

      <div className="topbar-right">
        {/* Backend Connectivity Status */}
        <div className={`status-badge ${isLiveServer ? 'online' : 'preview'}`}>
          <span className="badge-dot"></span>
          <span>{isLiveServer ? 'Backend API Live (Port 5000)' : 'Interactive Preview Mode'}</span>
        </div>

        {/* Quick Pending Notification Button */}
        {pendingCount > 0 && (
          <button
            className="btn-header-action btn-header-alert"
            onClick={onOpenPending}
            title={`${pendingCount} pending teacher approvals`}
          >
            <BellIcon size={14} />
            <span>{pendingCount} Pending</span>
          </button>
        )}

        {/* Reload Button */}
        <button
          className="btn-header-action"
          onClick={onRefresh}
          disabled={loading}
          title="Reload data from server"
        >
          <RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
};

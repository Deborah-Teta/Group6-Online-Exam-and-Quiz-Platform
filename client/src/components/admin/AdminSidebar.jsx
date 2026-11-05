import React from 'react';
import {
  DashboardIcon,
  UserCheckIcon,
  UsersIcon,
  ClassesIcon,
  AuditIcon,
  ShieldIcon,
  LogOutIcon
} from './Icons';

export const AdminSidebar = ({ activeTab, onSelectTab, pendingCount = 0 }) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: DashboardIcon },
    {
      id: 'pending',
      label: 'Pending Approvals',
      icon: UserCheckIcon,
      badge: pendingCount > 0 ? pendingCount : null
    },
    { id: 'users', label: 'User Directory', icon: UsersIcon },
    { id: 'classes', label: 'Classes & Courses', icon: ClassesIcon },
    { id: 'audit', label: 'Audit & Activity Log', icon: AuditIcon },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <ShieldIcon size={20} />
        </div>
        <div className="brand-text">
          <h2>EduExam</h2>
          <span>Admin Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Management</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <div className="nav-btn-inner">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge && <span className="nav-counter-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="sidebar-profile">
        <div className="profile-card">
          <div className="profile-avatar">AD</div>
          <div className="profile-meta">
            <span className="profile-name">Blaise (Lead Admin)</span>
            <span className="profile-email">admin@examplatform.edu</span>
          </div>
        </div>
        <button
          className="btn-signout"
          onClick={() => {
            if (window.confirm("Do you want to refresh the admin session?")) {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/login';
            }
          }}
        >
          <LogOutIcon size={14} />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
};

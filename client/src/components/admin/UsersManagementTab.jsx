import React, { useState } from 'react';
import { UsersIcon, SearchIcon, BanIcon, CheckIcon } from './Icons';

export const UsersManagementTab = ({
  users,
  onOpenBlockModal,
  onUnblockUser,
  onApproveTeacher,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter((user) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      user.fullName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q);

    const matchRole = roleFilter === 'all' || user.role === roleFilter;

    let matchStatus = true;
    if (statusFilter === 'blocked') {
      matchStatus = !!user.isBlocked;
    } else if (statusFilter === 'pending') {
      matchStatus = user.approvalStatus === 'pending' && !user.isBlocked;
    } else if (statusFilter === 'approved') {
      matchStatus = user.approvalStatus === 'approved' && !user.isBlocked;
    }

    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div>
      {/* Table Toolbar */}
      <div className="table-toolbar">
        <div className="toolbar-title">
          <h3>User Directory & Access Control ({users.length})</h3>
          <p>Search, filter roles, inspect account statuses, and enforce security policies.</p>
        </div>

        <div className="toolbar-controls">
          <div className="search-field">
            <SearchIcon size={15} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="approved">Active & Approved</option>
            <option value="pending">Pending Approval</option>
            <option value="blocked">Blocked / Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="table-empty">
          <div className="table-empty-icon">
            <UsersIcon size={24} />
          </div>
          <h4>No Users Found</h4>
          <p>Try modifying your search criteria or reset your filters.</p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Security Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isBlocked = !!u.isBlocked;
                const isPendingTeacher = u.role === 'teacher' && u.approvalStatus === 'pending';

                const formattedDate = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'N/A';

                return (
                  <tr key={u._id}>
                    <td>
                      <div className="user-info-flex">
                        <div
                          className="avatar-sm"
                          style={{
                            backgroundColor: isBlocked
                              ? '#fee2e2'
                              : u.role === 'admin'
                              ? '#f1f5f9'
                              : u.role === 'teacher'
                              ? '#ede9fe'
                              : '#e0f2fe',
                            color: isBlocked
                              ? '#dc2626'
                              : u.role === 'admin'
                              ? '#0f172a'
                              : u.role === 'teacher'
                              ? '#6d28d9'
                              : '#0284c7'
                          }}
                        >
                          {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="name-strong">
                            {u.fullName}
                            {u.role === 'admin' && (
                              <span style={{ marginLeft: '6px', fontSize: '11px', color: '#6366f1', fontWeight: 700 }}>
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="email-subtle">{u.email}</div>
                          {isBlocked && u.blockedReason && (
                            <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '3px', fontStyle: 'italic' }}>
                              Reason: "{u.blockedReason}"
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pill-badge pill-role-${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {isBlocked ? (
                        <span className="pill-badge pill-status-blocked">
                          Blocked Account
                        </span>
                      ) : isPendingTeacher ? (
                        <span className="pill-badge pill-status-pending">
                          Pending Approval
                        </span>
                      ) : (
                        <span className="pill-badge pill-status-approved">
                          Active & Approved
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: '#64748b' }}>{formattedDate}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {isBlocked ? (
                          <button
                            className="btn-row-action btn-row-unblock"
                            onClick={() => onUnblockUser(u._id)}
                            title="Restore access to account"
                          >
                            <CheckIcon size={13} />
                            <span>Unblock</span>
                          </button>
                        ) : u.role === 'admin' ? (
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Protected
                          </span>
                        ) : (
                          <>
                            {isPendingTeacher && (
                              <button
                                className="btn-row-action btn-row-approve"
                                onClick={() => onApproveTeacher(u._id)}
                                title="Approve faculty credentials"
                              >
                                <CheckIcon size={13} />
                                <span>Approve</span>
                              </button>
                            )}
                            <button
                              className="btn-row-action btn-row-block"
                              onClick={() => onOpenBlockModal(u)}
                              title="Block user account with a reason"
                            >
                              <BanIcon size={13} />
                              <span>Block</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AuditIcon, SearchIcon, CheckIcon, CloseIcon, BanIcon, ShieldIcon } from './Icons';

export const AuditLogsTab = ({ logs, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const adminName = typeof log.adminId === 'object' ? log.adminId?.fullName : '';
    const targetName = typeof log.targetUserId === 'object' ? log.targetUserId?.fullName : '';
    const reason = log.reason || '';

    const matchesSearch =
      adminName?.toLowerCase().includes(q) ||
      targetName?.toLowerCase().includes(q) ||
      reason.toLowerCase().includes(q);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action) => {
    switch (action) {
      case 'approve_teacher':
        return (
          <span className="pill-badge pill-status-approved">
            <CheckIcon size={12} />
            <span>Approved Teacher</span>
          </span>
        );
      case 'reject_teacher':
        return (
          <span className="pill-badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
            <CloseIcon size={12} />
            <span>Rejected Teacher</span>
          </span>
        );
      case 'block_user':
        return (
          <span className="pill-badge pill-status-blocked">
            <BanIcon size={12} />
            <span>Blocked Account</span>
          </span>
        );
      case 'unblock_user':
        return (
          <span className="pill-badge pill-status-approved">
            <ShieldIcon size={12} />
            <span>Unblocked Account</span>
          </span>
        );
      default:
        return <span className="pill-badge">{action}</span>;
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="toolbar-title">
          <h3>Administrative Audit Trail ({logs.length})</h3>
          <p>Chronological security log of administrative actions, credential verifications, and policy blocks.</p>
        </div>

        <div className="toolbar-controls">
          <div className="search-field">
            <SearchIcon size={15} />
            <input
              type="text"
              placeholder="Search user, admin, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All Enforcement Actions</option>
            <option value="approve_teacher">Teacher Approvals</option>
            <option value="reject_teacher">Teacher Rejections</option>
            <option value="block_user">Account Blocks</option>
            <option value="unblock_user">Account Unblocks</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      {filtered.length === 0 ? (
        <div className="table-empty">
          <div className="table-empty-icon">
            <AuditIcon size={24} />
          </div>
          <h4>No Audit Logs Found</h4>
          <p>No logged administrative operations match your search criteria.</p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Enforcement Action</th>
                <th>Target Account</th>
                <th>Justification / Reason</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const admin = typeof log.adminId === 'object' ? log.adminId : null;
                const target = typeof log.targetUserId === 'object' ? log.targetUserId : null;
                const formattedDate = log.createdAt
                  ? new Date(log.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Recent';

                return (
                  <tr key={log._id}>
                    <td>
                      <div className="user-info-flex">
                        <div className="avatar-sm" style={{ background: '#f1f5f9', color: '#1e293b' }}>
                          {admin?.fullName ? admin.fullName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div className="name-strong">{admin?.fullName || 'Lead Administrator'}</div>
                          <div className="email-subtle">{admin?.email || 'admin@examplatform.edu'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>
                      {target ? (
                        <div>
                          <div className="name-strong">{target.fullName}</div>
                          <div className="email-subtle">
                            {target.email} ({target.role || 'user'})
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <div style={{ maxWidth: '380px', fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>
                        {log.reason || 'No specific rationale provided'}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#64748b' }}>{formattedDate}</span>
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

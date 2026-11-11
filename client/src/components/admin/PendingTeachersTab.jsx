import { useState } from 'react';
import { UserCheckIcon, CheckIcon, CloseIcon, SearchIcon } from './Icons';

export const PendingTeachersTab = ({
  teachers,
  onApprove,
  onReject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const filtered = teachers.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.fullName?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q)
    );
  });

  const handleApprove = async (teacherId) => {
    try {
      setProcessingId(teacherId);
      await onApprove(teacherId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (teacher) => {
    const reason = window.prompt(
      `Enter a rejection rationale for ${teacher.fullName}:`,
      "Unverified faculty domain or missing institutional credentials."
    );
    if (reason !== null) {
      try {
        setProcessingId(teacher._id);
        await onReject(teacher._id, reason);
      } finally {
        setProcessingId(null);
      }
    }
  };

  return (
    <div>
      {/* Table Toolbar */}
      <div className="table-toolbar">
        <div className="toolbar-title">
          <h3>Faculty Verification Queue ({teachers.length})</h3>
          <p>Educators must be approved by an administrator before creating classes or publishing exams.</p>
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
        </div>
      </div>

      {/* Table Body */}
      {filtered.length === 0 ? (
        <div className="table-empty">
          <div className="table-empty-icon">
            <UserCheckIcon size={24} />
          </div>
          <h4>No Pending Approvals</h4>
          <p>
            {searchTerm
              ? "No faculty applications match your search query."
              : "All educator registration applications have been verified."}
          </p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant / Educator</th>
                <th>Affiliation / Department</th>
                <th>Applied On</th>
                <th>Verification Status</th>
                <th style={{ textAlign: 'right' }}>Administrative Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const isWorking = processingId === t._id;
                const formattedDate = t.createdAt
                  ? new Date(t.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Recent';

                return (
                  <tr key={t._id}>
                    <td>
                      <div className="user-info-flex">
                        <div className="avatar-sm">
                          {t.fullName ? t.fullName.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <div>
                          <div className="name-strong">{t.fullName}</div>
                          <div className="email-subtle">{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#334155' }}>
                        {t.department || 'General Faculty'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {t.institution || 'Verified Education Domain'}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#475569' }}>{formattedDate}</span>
                    </td>
                    <td>
                      <span className="pill-badge pill-status-pending">
                        Pending Review
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn-row-action btn-row-approve"
                          onClick={() => handleApprove(t._id)}
                          disabled={isWorking}
                        >
                          <CheckIcon size={13} />
                          <span>{isWorking ? 'Processing...' : 'Approve'}</span>
                        </button>
                        <button
                          className="btn-row-action btn-row-reject"
                          onClick={() => handleReject(t)}
                          disabled={isWorking}
                        >
                          <CloseIcon size={13} />
                          <span>Reject</span>
                        </button>
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

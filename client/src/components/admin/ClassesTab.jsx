import React, { useState } from 'react';
import { ClassesIcon, SearchIcon, CopyIcon, CheckIcon } from './Icons';

export const ClassesTab = ({ classes, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const filtered = classes.filter((c) => {
    const q = searchTerm.toLowerCase();
    const teacherName = typeof c.teacherId === 'object' ? c.teacherId?.fullName : '';
    return (
      c.name?.toLowerCase().includes(q) ||
      c.classCode?.toLowerCase().includes(q) ||
      teacherName?.toLowerCase().includes(q)
    );
  });

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="toolbar-title">
          <h3>Active Classroom Directory ({classes.length})</h3>
          <p>Supervise created classrooms, assigned instructors, and student join codes.</p>
        </div>

        <div className="toolbar-controls">
          <div className="search-field">
            <SearchIcon size={15} />
            <input
              type="text"
              placeholder="Search classes or codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Classes Table */}
      {filtered.length === 0 ? (
        <div className="table-empty">
          <div className="table-empty-icon">
            <ClassesIcon size={24} />
          </div>
          <h4>No Classes Found</h4>
          <p>No classroom groups match your search query.</p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course / Classroom Name</th>
                <th>Instructor / Teacher</th>
                <th>Student Join Code</th>
                <th>Enrolled Students</th>
                <th>Created Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const teacher = typeof c.teacherId === 'object' ? c.teacherId : null;
                const formattedDate = c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'N/A';

                return (
                  <tr key={c._id}>
                    <td>
                      <div className="name-strong">{c.name}</div>
                      {c.description && (
                        <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '340px', marginTop: '2px' }}>
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="user-info-flex">
                        <div className="avatar-sm" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                          {teacher?.fullName ? teacher.fullName.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <div>
                          <div className="name-strong">{teacher?.fullName || 'Assigned Faculty'}</div>
                          <div className="email-subtle">{teacher?.email || 'faculty@edu.org'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        className="code-box"
                        onClick={() => handleCopyCode(c.classCode)}
                        title="Click to copy join code"
                      >
                        {copiedCode === c.classCode ? (
                          <>
                            <CheckIcon size={12} style={{ color: '#10b981' }} />
                            <span style={{ color: '#10b981' }}>Copied!</span>
                          </>
                        ) : (
                          <>
                            <span>{c.classCode}</span>
                            <CopyIcon size={11} style={{ opacity: 0.6 }} />
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#334155' }}>
                        {c.studentCount ?? 0} students
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#64748b' }}>{formattedDate}</span>
                    </td>
                    <td>
                      <span className="pill-badge pill-status-approved">
                        Active
                      </span>
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

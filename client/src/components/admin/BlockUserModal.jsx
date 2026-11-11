import { useState } from 'react';
import { BanIcon, CloseIcon, AlertTriangleIcon } from './Icons';

export const BlockUserModal = ({ user, isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a specific justification reason for blocking this account.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onConfirm(user._id, reason.trim());
      setReason('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to block user account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-top">
          <div className="modal-title-flex">
            <BanIcon size={18} style={{ color: '#ef4444' }} />
            <h3>Block User Account</h3>
          </div>
          <button className="btn-modal-close" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-content-area">
            {/* User Details Box */}
            <div className="modal-user-preview">
              <div className="user-info-flex">
                <div className="avatar-sm">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="name-strong">{user.fullName}</div>
                  <div className="email-subtle">{user.email}</div>
                </div>
              </div>
              <span className={`pill-badge pill-role-${user.role}`}>
                {user.role}
              </span>
            </div>

            {/* Warning Message */}
            <div className="modal-callout-danger">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertTriangleIcon size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Immediate Action:</strong> Blocking will terminate active exam sessions, invalidate credentials, and record this event in the system audit log.
                </span>
              </div>
            </div>

            {/* Reason Textarea */}
            <div>
              <label className="field-label" htmlFor="block-reason">
                Reason for Enforcement <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="block-reason"
                className="field-textarea"
                placeholder="E.g., Suspected academic dishonesty during midterm exam, leaked question bank, multiple simultaneous session logins..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                rows={3}
                autoFocus
              />
              {error && (
                <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500, marginTop: '4px', display: 'block' }}>
                  {error}
                </span>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-bottom-actions">
            <button
              type="button"
              className="btn-cancel-flat"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-danger-solid"
              disabled={submitting}
            >
              <BanIcon size={14} />
              <span>{submitting ? 'Enforcing...' : 'Confirm & Block Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

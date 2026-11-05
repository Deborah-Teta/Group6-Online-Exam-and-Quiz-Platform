import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Key,
  Laptop,
  Check,
  Clock,
  LogOut,
  Save
} from 'lucide-react';

export const AdminProfileTab = ({ onShowToast }) => {
  const [profileData, setProfileData] = useState({
    fullName: 'Blaise Niyonshuti',
    email: 'admin@examplatform.edu',
    title: 'Lead Deployment & System Administrator',
    joinedDate: 'Oct 29, 2026'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      onShowToast?.('Profile updated successfully!');
    }, 600);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      setPasswordError('Please provide your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError('');
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onShowToast?.('Password updated successfully!');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Profile Banner */}
      <div className="bg-gradient-to-r from-[#5149B8] to-[#1e3a8a] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white text-[#5149B8] font-black text-2xl flex items-center justify-center shadow-lg border-4 border-white/20">
            BN
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black">{profileData.fullName}</h2>
              <span className="bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                Admin
              </span>
            </div>
            <p className="text-white/80 text-sm mt-1">{profileData.email}</p>
            <p className="text-white/60 text-xs mt-0.5">{profileData.title} &bullet; Member since {profileData.joinedDate}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3">
          <Shield className="text-emerald-300" size={24} />
          <div>
            <p className="text-xs font-bold text-white">Full Privileges Active</p>
            <p className="text-[11px] text-white/70">Master Approval & Access Enforcement</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Personal Information Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <User className="text-[#5149B8]" size={20} />
            <h3 className="font-bold text-base text-slate-900">Personal Information</h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#5149B8] focus:ring-2 focus:ring-blue-50 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Administrative Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#5149B8] focus:ring-2 focus:ring-blue-50 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Role Responsibility
              </label>
              <input
                type="text"
                disabled
                value="Auth, Classes, and Admin Dashboard Lead (Group 6)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 bg-[#5149B8] hover:bg-[#413B9A] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Save size={15} />
                <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 3. Security & Password Update */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Key className="text-[#5149B8]" size={20} />
            <h3 className="font-bold text-base text-slate-900">Security Credentials</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#5149B8] focus:ring-2 focus:ring-blue-50 text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#5149B8] focus:ring-2 focus:ring-blue-50 text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#5149B8] focus:ring-2 focus:ring-blue-50 text-slate-900"
              />
            </div>

            {passwordError && (
              <p className="text-xs text-red-600 font-medium">{passwordError}</p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="inline-flex items-center gap-2 bg-[#5149B8] hover:bg-[#413B9A] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Check size={15} />
                <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. Active Sessions Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Laptop className="text-[#5149B8]" size={20} />
            <h3 className="font-bold text-base text-slate-900">Active Admin Sessions</h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            1 Active Device
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF]/50 border border-blue-100">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white text-[#5149B8] flex items-center justify-center shadow-xs">
              <Laptop size={20} />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">Current Session (Chrome on Windows)</p>
              <p className="text-[11px] text-slate-500">IP: 127.0.0.1 &bullet; Online Now &bullet; JWT Token Valid</p>
            </div>
          </div>

          <button
            onClick={() => onShowToast?.('All other sessions signed out.')}
            className="text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 bg-white px-3.5 py-1.5 rounded-xl transition cursor-pointer"
          >
            Revoke Other Sessions
          </button>
        </div>
      </div>
    </div>
  );
};


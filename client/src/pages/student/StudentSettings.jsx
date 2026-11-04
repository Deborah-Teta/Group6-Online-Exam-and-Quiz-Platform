import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, GraduationCap, Key, Save, User } from "lucide-react";
import ActionButton from "../../components/common/ActionButton";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

const MIN_PASSWORD_LENGTH = 6;

const emptyPasswordForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

function SettingsCard({ icon: Icon, title, children }) {
  return (
    <Card className="flex flex-col gap-5 p-6 sm:p-7">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <Icon className="text-[#0B609D]" size={20} />
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

function StudentSettings() {
  const { student, updateStudent } = useOutletContext();
  const [fullName, setFullName] = useState(student.name);
  const [nameError, setNameError] = useState("");
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) return undefined;

    const timer = setTimeout(() => setToastMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleNameChange = (event) => {
    setFullName(event.target.value);
    setNameError("");
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setNameError("Enter your full name.");
      return;
    }

    updateStudent({ name: trimmedName, initials: getInitials(trimmedName) });
    setFullName(trimmedName);
    setToastMessage("Profile updated successfully!");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordErrors((current) => ({ ...current, [name]: "" }));
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = "Enter your current password.";
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      errors.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    } else if (newPassword === currentPassword) {
      errors.newPassword = "Choose a different password from your current one.";
    }

    if (confirmPassword !== newPassword) {
      errors.confirmPassword = "The passwords don't match.";
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length === 0) {
      setPasswordForm(emptyPasswordForm);
      setToastMessage("Password updated successfully!");
    }
  };

  return (
    <>
      {/* Account summary */}
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-[#0B609D] to-[#1e3a8a] p-6 text-white shadow-sm sm:p-8">
        <div className="flex min-w-0 items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white text-2xl font-black text-[#0B609D] shadow-lg">
            {student.initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-black">{student.name}</h2>
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                {student.role}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/80">{student.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
          <GraduationCap className="text-emerald-300" size={24} />
          <div>
            <p className="text-xs font-bold text-white">{student.school}</p>
            <p className="text-[11px] text-white/70">Academic year {student.academicYear}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Personal information */}
        <SettingsCard icon={User} title="Personal Information">
          <form noValidate onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              name="fullName"
              value={fullName}
              onChange={handleNameChange}
              required
              error={nameError}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={student.email}
              disabled
              helperText="Ask your school if your email address needs to change."
            />
            <Input label="Role" name="role" value={student.role} disabled />

            <div className="flex justify-end pt-2">
              <ActionButton
                type="submit"
                label="Save changes"
                icon={<Save size={15} />}
                disabled={fullName.trim() === student.name}
              />
            </div>
          </form>
        </SettingsCard>

        {/* Password */}
        <SettingsCard icon={Key} title="Change Password">
          <form noValidate onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <Input
              label="Current password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
              error={passwordErrors.currentPassword}
            />
            <Input
              label="New password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
              error={passwordErrors.newPassword}
              helperText={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
            />
            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
              error={passwordErrors.confirmPassword}
            />

            <div className="flex justify-end pt-2">
              <ActionButton type="submit" label="Update password" icon={<Check size={15} />} />
            </div>
          </form>
        </SettingsCard>
      </div>

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0B609D] px-5 py-3 text-xs font-bold text-white shadow-xl"
        >
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

export default StudentSettings;

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, GraduationCap, Key, Save, User } from "lucide-react";
import ActionButton from "../../components/common/ActionButton";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import { changeStudentPassword } from "../../services/studentService";

const MIN_PASSWORD_LENGTH = 8;

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
        <Icon className="text-[#5149B8]" size={20} />
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

    updateStudent({ name: trimmedName, initials: getInitials(trimmedName) })
      .then(() => {
        setFullName(trimmedName);
        setToastMessage("Profile updated successfully!");
      })
      .catch((error) => setNameError(error.message || "Could not update your profile."));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordErrors((current) => ({ ...current, [name]: "" }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = "Enter your current password.";
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH || !/\d/.test(newPassword)) {
      errors.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters and include a number.`;
    } else if (newPassword === currentPassword) {
      errors.newPassword = "Choose a different password from your current one.";
    }

    if (confirmPassword !== newPassword) {
      errors.confirmPassword = "The passwords don't match.";
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        await changeStudentPassword(currentPassword, newPassword);
        setPasswordForm(emptyPasswordForm);
        setToastMessage("Password updated successfully!");
      } catch (error) {
        setPasswordErrors((current) => ({
          ...current,
          currentPassword: error.message || "Could not update your password.",
        }));
      }
    }
  };

  return (
    <>
      {/* Account summary */}
      <Card className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-7">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#5149B8] text-xl font-bold text-white">
            {student.initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
              <span className="rounded-full bg-[#FFFFFF] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#5149B8]">
                {student.role}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{student.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-[#FFFFFF] px-4 py-3">
          <GraduationCap className="shrink-0 text-[#5149B8]" size={24} />
          <p className="text-xs font-semibold capitalize text-slate-700">
            {student.role} account
          </p>
        </div>
      </Card>

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
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#5149B8] px-5 py-3 text-xs font-bold text-white shadow-xl"
        >
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

export default StudentSettings;

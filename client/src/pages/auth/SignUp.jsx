import { useState } from "react";
import { ArrowRight, Eye, EyeOff, GraduationCap, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { register } from "../../services/authService";

function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!/(?=.*\d).{8,}/.test(password)) {
      setError("Use at least 8 characters and include at least one number.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });

      const notice =
        role === "teacher"
          ? "Your account was created. A platform administrator must approve your teacher account before you can sign in."
          : "Your account was created. You can now sign in.";

      navigate("/login", { replace: true, state: { notice } });
    } catch (submitError) {
      setError(submitError.message || "Could not create your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout sidePosition="right">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0B609D]">
        A fresh start
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Make room for learning.
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Create your account. Find your people.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Full name
          <input
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Your full name"
            className="w-full rounded-lg border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-900 outline-none focus:border-[#0B609D] focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Email address
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@school.edu"
            className="w-full rounded-lg border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-900 outline-none focus:border-[#0B609D] focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Password
          <span className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-3 pr-11 text-sm font-normal text-slate-900 outline-none focus:border-[#0B609D] focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
          <span className="font-normal text-slate-500">
            Use at least 8 characters, including a number.
          </span>
        </label>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-slate-700">
            I’m joining as...
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: "teacher",
                title: "Teacher",
                description: "Lead your classes",
                Icon: GraduationCap,
              },
              {
                value: "student",
                title: "Student",
                description: "Join your classes",
                Icon: Users,
              },
            ].map(({ value, title, description, Icon }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                  role === value
                    ? "border-[#0B609D] bg-[#EEF3FD]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                  className="sr-only"
                />
                <Icon size={20} className="shrink-0 text-[#0B609D]" />
                <span>
                  <span className="block text-xs font-semibold text-slate-800">
                    {title}
                  </span>
                  <span className="mt-1 block text-[10px] text-slate-500">
                    {description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {role === "teacher" && (
          <p className="text-[11px] leading-5 text-slate-500">
            Teacher accounts require administrator approval before you can sign in.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B609D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#084877] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight size={16} />
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-[10px] leading-5 text-slate-500">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>

      <p className="mt-4 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#0B609D] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default SignUp;
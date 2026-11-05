import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { login } from "../../services/authService";

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notice = location.state?.notice;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });

      if (!result.token || !result.user?.role) {
        throw new Error("The server response is missing account information.");
      }

      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", result.token);
      storage.setItem("examflow.user", JSON.stringify(result.user));

      const destinationByRole = {
        student: "/student/dashboard",
        teacher: "/teacher/dashboard",
        admin: "/admin",
      };

      navigate(destinationByRole[result.user.role] || "/login", {
        replace: true,
      });
    } catch (submitError) {
      setError(submitError.message || "Could not sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout sidePosition="left">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0B609D]">
        Your classroom, connected
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Welcome back.
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Good to see you. Sign in to your ExamFlow account.
      </p>

      {notice && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Email address
          <span className="relative">
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@school.edu"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-3 pr-10 text-sm font-normal text-slate-900 outline-none focus:border-[#0B609D] focus:ring-4 focus:ring-blue-100"
            />
            <Mail
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Password
          <span className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
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
        </label>

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="accent-[#0B609D]"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-[#0B609D] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B609D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#084877] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight size={16} />
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        New to ExamFlow?{" "}
        <Link to="/signup" className="font-semibold text-[#0B609D] hover:underline">
          Create an account
        </Link>
      </p>

      <p className="mt-6 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
        One secure account for teachers and students.
      </p>
    </AuthLayout>
  );
}

export default SignIn;
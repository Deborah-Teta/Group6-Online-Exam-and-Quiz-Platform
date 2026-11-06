import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import AuthLayout from "../../layouts/AuthLayout";
import { roleHomePaths } from "../../context/roleHomePaths";
import { useAuth } from "../../context/useAuth";
import { login } from "../../services/authService";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const notice = location.state?.notice;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  async function onSubmit(values) {
    try {
      const result = await login({
        email: values.email,
        password: values.password,
      });

      signIn(result, values.remember);

      const intendedPath = location.state?.from?.pathname;
      const rolePrefix = `/${result.user.role}/`;
      const canReturnToIntendedPath =
        typeof intendedPath === "string" &&
        (intendedPath.startsWith(rolePrefix) ||
          (result.user.role === "admin" && intendedPath.startsWith("/admin")));

      navigate(
        canReturnToIntendedPath
          ? intendedPath
          : roleHomePaths[result.user.role],
        { replace: true },
      );
    } catch (submitError) {
      setError("root.server", {
        type: "server",
        message: submitError.message || "Could not sign in. Please try again.",
      });
    }
  }

  return (
    <AuthLayout sidePosition="left">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5149B8]">
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

      {errors.root?.server && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {errors.root.server.message}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Email address
          <span className="relative">
            <input
              type="email"
              autoComplete="email"
              placeholder="you@school.edu"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-3 pr-10 text-sm font-normal text-slate-900 outline-none focus:border-[#5149B8] focus:ring-4 focus:ring-blue-100"
            />
            <Mail
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </span>
          {errors.email && (
            <span className="text-xs font-normal text-red-600">
              {errors.email.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Password
          <span className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-3 pr-11 text-sm font-normal text-slate-900 outline-none focus:border-[#5149B8] focus:ring-4 focus:ring-blue-100"
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
          {errors.password && (
            <span className="text-xs font-normal text-red-600">
              {errors.password.message}
            </span>
          )}
        </label>

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              {...register("remember")}
              className="accent-[#5149B8]"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-[#5149B8] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5149B8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#413B9A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight size={16} />
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        New to ExamFlow?{" "}
        <Link to="/signup" className="font-semibold text-[#5149B8] hover:underline">
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

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, GraduationCap, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import AuthLayout from "../../layouts/AuthLayout";
import { register as registerUser } from "../../services/authService";

const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Name must be 100 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/\d/, "Include at least one number."),
  role: z.enum(["teacher", "student"]),
});

function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "teacher",
    },
  });
  const role = useWatch({ control, name: "role" });

  async function onSubmit(values) {
    try {
      await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      const notice =
        values.role === "teacher"
          ? "Your account was created. A platform administrator must approve your teacher account before you can sign in."
          : "Your account was created. You can now sign in.";

      navigate("/login", { replace: true, state: { notice } });
    } catch (submitError) {
      setError("root.server", {
        type: "server",
        message: submitError.message || "Could not create your account.",
      });
    }
  }

  return (
    <AuthLayout sidePosition="right">
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Make room for learning.
      </h2>

      {errors.root?.server && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {errors.root.server.message}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Full name
          <input
            type="text"
            autoComplete="name"
            maxLength={100}
            placeholder="Your full name"
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
            className="w-full rounded-lg border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-900 outline-none focus:border-[#5149B8] focus:ring-4 focus:ring-blue-100"
          />
          {errors.fullName && (
            <span className="text-xs font-normal text-red-600">
              {errors.fullName.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Email address
          <input
            type="email"
            autoComplete="email"
            placeholder="you@school.edu"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
            className="w-full rounded-lg border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-900 outline-none focus:border-[#5149B8] focus:ring-4 focus:ring-blue-100"
          />
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
              autoComplete="new-password"
              placeholder="At least 8 characters"
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
          {errors.password ? (
            <span className="text-xs font-normal text-red-600">
              {errors.password.message}
            </span>
          ) : (
            <span className="font-normal text-slate-500">
              Use at least 8 characters, including a number.
            </span>
          )}
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
                    ? "border-[#5149B8] bg-[#FFFFFF]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  {...register("role")}
                  className="sr-only"
                />
                <Icon size={20} className="shrink-0 text-[#5149B8]" />
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
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#5149B8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#413B9A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight size={16} />
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#5149B8] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default SignUp;

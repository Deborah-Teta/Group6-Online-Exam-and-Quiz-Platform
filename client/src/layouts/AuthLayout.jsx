import { BookOpenCheck, CircleHelp } from "lucide-react";
import { Link } from "react-router-dom";


function AuthLayout({ children, sidePosition = "left" }) {
  const panelFirst = sidePosition === "left";

  return (
    <div className="grid min-h-screen bg-white md:grid-cols-2">
      <aside
        className={`flex min-h-[270px] flex-col justify-between bg-[#343777] px-6 py-6 text-white sm:px-10 sm:py-8 md:min-h-screen md:px-12 ${
          panelFirst ? "md:order-1" : "md:order-2"
        }`}
      >
        <Link to="/" className="flex w-fit items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0B609D]">
            <BookOpenCheck size={19} />
          </span>
          ExamFlow
        </Link>

        <div className="my-8 max-w-lg">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100">
            Room to grow
          </p>
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Great learning starts with connection.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-blue-100">
            Bring your classes together in one calm space. Create assessments,
            learn, and see progress clearly.
          </p>

          <div className="mt-8 h-44 overflow-hidden rounded-3xl border border-white/15 bg-white/10 sm:h-56">
            <img
                src="/images/authImage.jpg.jpeg"
                alt="An open book representing learning"
                className="h-full w-full object-cover"
            />
</div>
        </div>

        <div className="flex justify-between gap-4 text-[10px] text-blue-100">
          <span>Made for the way you teach.</span>
          <span>Learn. Together.</span>
        </div>
      </aside>

      <main
        className={`flex min-h-[70vh] flex-col px-5 py-6 sm:px-10 md:min-h-screen md:px-12 ${
          panelFirst ? "md:order-2" : "md:order-1"
        }`}
      >
        <div className="flex justify-end">
          <a
            href="mailto:support@examflow.edu"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0B609D]"
          >
            <CircleHelp size={14} />
            Need a hand?
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <footer className="flex justify-between gap-4 text-[10px] text-slate-400">
          <span>© {new Date().getFullYear()} ExamFlow</span>
          <span>Learn. Assess. Improve.</span>
        </footer>
      </main>
    </div>
  );
}

export default AuthLayout;
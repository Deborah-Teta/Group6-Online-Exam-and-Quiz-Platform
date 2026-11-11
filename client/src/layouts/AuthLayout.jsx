import { BookOpenCheck, CircleHelp } from "lucide-react";
import { Link } from "react-router-dom";


function AuthLayout({ children, sidePosition = "left" }) {
  const panelFirst = sidePosition === "left";

  return (
    <div className="grid min-h-screen bg-white md:grid-cols-2">
      <aside
        className={`relative flex min-h-[270px] flex-col justify-between overflow-hidden bg-[#5149B8] px-6 py-6 text-white sm:px-10 sm:py-8 md:min-h-screen md:px-12 ${
          panelFirst ? "md:order-1" : "md:order-2"
        }`}
      >
        <img
          src="/images/authImage.jpg.jpeg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#5149B8]/85 via-[#5149B8]/65 to-[#413B9A]/75"
        />

        <Link
          to="/"
          className="relative z-10 flex w-fit items-center gap-2 text-lg font-bold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#5149B8]">
            <BookOpenCheck size={19} />
          </span>
          ExamFlow
        </Link>

        <div className="relative z-10 my-8 max-w-lg">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
            Room to grow
          </p>
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Great learning starts with connection.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
            Bring your classes together in one calm space. Create assessments,
            learn, and see progress clearly.
          </p>
        </div>

        <div className="relative z-10 flex justify-between gap-4 text-[10px] text-white/80">
          <span>Made for the way you teach.</span>
          <span>Learn. Together.</span>
        </div>
      </aside>

      <main
        className={`flex min-h-[70vh] flex-col px-5 py-6 sm:px-10 md:min-h-screen md:px-12 ${
          panelFirst ? "md:order-2" : "md:order-1"
        }`}
      >
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
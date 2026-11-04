function Footer() {
  return (
    <footer className="fixed h-20 px-16 bottom-0 left-0 right-0 z-40 rounded-2xl pr-16 md:left-28 md:pr-6 py-1 md:py-2 flex items-center justify-between bg-[#EEF3FD]">

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-center text-xs text-slate-500 sm:text-left">
          © {new Date().getFullYear()} ExamFlow. All rights reserved.
        </p>

        <div className="flex items-center gap-5">

          <a
            href="/help"
            className="text-xs text-slate-500 transition hover:text-blue-700"
          >
            Help Center
          </a>

          <a
            href="/privacy"
            className="text-xs text-slate-500 transition hover:text-blue-700"
          >
            Privacy Policy
          </a>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">
        Learn. Assess. Improve.
      </p>

    </footer>
  );
}

export default Footer;
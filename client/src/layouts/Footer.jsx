function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-between border-t border-slate-200 bg-white px-4 py-2 sm:px-8 md:left-64">

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
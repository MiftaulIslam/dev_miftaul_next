"use client";

import Link from "next/link";
import { ArrowLeft, Download, Printer } from "lucide-react";

export default function ResumeToolbar() {
  return (
    <div
      data-resume-toolbar
      className="sticky top-0 z-30 border-b border-slate-300/70 bg-slate-200/95 px-4 py-3 backdrop-blur print:hidden"
    >
      <div className="mx-auto flex w-full max-w-[920px] items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-slate-400/70 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-400/70 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>

          <a
            href="/api/resume/pdf?download=1"
            className="inline-flex items-center gap-2 rounded-md border border-blue-700 bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-600"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}


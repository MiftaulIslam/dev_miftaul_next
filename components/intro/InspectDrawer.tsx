"use client";

import type React from "react";

interface InspectDrawerProps {
  drawerRef: React.RefObject<HTMLDivElement | null>;
  setLineRef: (idx: number, el: HTMLDivElement | null) => void;
  scanBeamRef: React.RefObject<HTMLDivElement | null>;
  statusRef: React.RefObject<HTMLSpanElement | null>;
  progressRef: React.RefObject<HTMLSpanElement | null>;
  progressFillRef: React.RefObject<HTMLDivElement | null>;
  brokenClassRef: React.RefObject<HTMLSpanElement | null>;
  corruptedClassRef: React.RefObject<HTMLSpanElement | null>;
  subClassRef: React.RefObject<HTMLSpanElement | null>;
}

export default function InspectDrawer({
  drawerRef,
  setLineRef,
  scanBeamRef,
  statusRef,
  progressRef,
  progressFillRef,
  brokenClassRef,
  corruptedClassRef,
  subClassRef,
}: InspectDrawerProps) {
  return (
    <div
      ref={drawerRef}
      className="absolute inset-x-5 bottom-5 z-20 rounded-xl border border-white/12 bg-[#0a0f1a]/94 backdrop-blur-md md:inset-x-8 md:bottom-7"
      style={{ boxShadow: "0 18px 40px rgba(2, 8, 23, 0.55)" }}
    >
      <div
        ref={scanBeamRef}
        className="pointer-events-none absolute inset-x-0 top-9 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-0"
      />
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 md:px-4">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em]">
          <span className="rounded bg-white/8 px-2 py-1 text-slate-200">Elements</span>
          <span className="text-slate-500">Console</span>
          <span className="text-slate-500">Sources</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span ref={statusRef} className="text-blue-300/90">
            Inspecting &lt;h1.hero-title&gt;...
          </span>
          <span className="text-slate-500">|</span>
          <span ref={progressRef} className="text-sky-300/90">
            12%
          </span>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2 md:px-4 md:pb-4">
        <div className="space-y-1.5 font-mono text-[11px] leading-5 text-slate-300 md:text-xs">
          <div
            ref={(el) => {
              setLineRef(0, el);
            }}
            className="opacity-0"
          >
            <span className="text-blue-300">&lt;header</span> <span className="text-slate-400">class=</span>
            <span className="text-emerald-300">&quot;hero&quot;</span>
            <span className="text-blue-300">&gt;</span>
          </div>

          <div
            ref={(el) => {
              setLineRef(1, el);
            }}
            className="opacity-0 pl-4"
          >
            <span className="text-blue-300">&lt;div</span> <span className="text-slate-400">class=</span>
            <span className="text-emerald-300">&quot;hero-bg grid loaded&quot;</span>
            <span className="text-blue-300">&gt;&lt;/div&gt;</span>
          </div>

          <div
            ref={(el) => {
              setLineRef(2, el);
            }}
            className="opacity-0 pl-4"
          >
            <span className="text-blue-300">&lt;h1</span> <span className="text-slate-400">class=</span>
            <span className="text-emerald-300">
              &quot;hero-title
              <span ref={brokenClassRef} className="inline-block text-rose-300">
                {" "}broken
              </span>
              <span ref={corruptedClassRef} className="inline-block text-rose-300">
                {" "}corrupted
              </span>
              &quot;
            </span>
            <span className="text-blue-300">
              &gt;Miftaul Islam Shuvro&lt;/h1&gt;
            </span>
          </div>

          <div
            ref={(el) => {
              setLineRef(3, el);
            }}
            className="opacity-0 pl-4"
          >
            <span className="text-blue-300">&lt;p</span> <span className="text-slate-400">class=</span>
            <span className="text-emerald-300">
              &quot;hero-sub <span ref={subClassRef} className="text-sky-300/90">loading</span>&quot;
            </span>
            <span className="text-blue-300">&gt;Full Stack Developer&lt;/p&gt;</span>
          </div>

          <div
            ref={(el) => {
              setLineRef(4, el);
            }}
            className="opacity-0"
          >
            <span className="text-blue-300">&lt;/header&gt;</span>
          </div>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div
            ref={progressFillRef}
            className="h-full w-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}

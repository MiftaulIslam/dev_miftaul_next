"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

const STATUS_LABELS = [
  "Initializing interface...",
  "Loading motion system...",
  "Inspecting hero title...",
  "Booting portfolio...",
];

const NAME_CHARS = "Miftaul Islam Shuvro".split("");
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

interface IntroLoaderProps {
  onComplete: () => void;
}

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);
  const hudTopRef = useRef<HTMLDivElement>(null);
  const hudBotRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const glitchRefA = useRef<HTMLDivElement>(null);
  const glitchRefB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Unmount trigger
        onComplete();
      },
    });

    // ── 0: Start state ──
    gsap.set(overlayRef.current, { opacity: 1 });
    gsap.set(scanlineRef.current, { opacity: 0 });
    gsap.set(hudTopRef.current, { y: -20, opacity: 0 });
    gsap.set(hudBotRef.current, { y: 20, opacity: 0 });
    gsap.set(statusRef.current, { opacity: 0 });
    gsap.set(subtitleRef.current, { y: 10, opacity: 0 });
    charRefs.current.forEach((ch) => {
      if (ch) gsap.set(ch, { y: 40, opacity: 0 });
    });

    // ── 1: Scanlines appear ──
    tl.to(scanlineRef.current, { opacity: 1, duration: 0.3 }, 0.2);

    // ── 2: HUD elements slide in ──
    tl.to(hudTopRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.35);
    tl.to(hudBotRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.45);

    // ── 3: Name chars appear with stagger (SplitText-style) ──
    charRefs.current.forEach((ch, i) => {
      if (!ch) return;
      tl.to(
        ch,
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: "power3.out",
        },
        0.55 + i * 0.035
      );
    });

    // ── 4: Scramble pass — briefly corrupt each char then resolve ──
    const scrambleStart = 0.55 + NAME_CHARS.length * 0.035 + 0.1;
    charRefs.current.forEach((ch, i) => {
      if (!ch) return;
      const original = NAME_CHARS[i];
      const scrambleDuration = 0.5;
      const iterations = 6;

      tl.call(
        () => {
          let count = 0;
          const interval = setInterval(() => {
            if (!ch) return;
            if (count < iterations) {
              ch.textContent = original === " " ? "\u00A0" : randomChar();
              count++;
            } else {
              ch.textContent = original === " " ? "\u00A0" : original;
              clearInterval(interval);
            }
          }, scrambleDuration * 1000 / iterations);
        },
        [],
        scrambleStart + i * 0.04
      );
    });

    const afterScramble = scrambleStart + NAME_CHARS.length * 0.04 + 0.6;

    // ── 5: Glitch burst ──
    tl.to(
      glitchRefA.current,
      { x: 4, skewX: 3, opacity: 0.6, duration: 0.06, repeat: 5, yoyo: true, ease: "none" },
      afterScramble
    );
    tl.to(
      glitchRefB.current,
      { x: -4, skewX: -2, opacity: 0.5, duration: 0.06, repeat: 5, yoyo: true, ease: "none" },
      afterScramble
    );

    // ── 6: Name stabilizes — glitch layers zero out ──
    tl.to(
      [glitchRefA.current, glitchRefB.current],
      { x: 0, skewX: 0, opacity: 0, duration: 0.2 },
      afterScramble + 0.45
    );

    // ── 7: Subtitle + status appear ──
    tl.to(subtitleRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, afterScramble + 0.5);
    tl.call(
      () => {
        if (!statusRef.current) return;
        let si = 0;
        gsap.to(statusRef.current, { opacity: 1, duration: 0.2 });
        const update = () => {
          if (!statusRef.current) return;
          statusRef.current.textContent = STATUS_LABELS[si % STATUS_LABELS.length];
          si++;
        };
        update();
        const iv = setInterval(update, 350);
        setTimeout(() => clearInterval(iv), 1200);
      },
      [],
      afterScramble + 0.55
    );

    // ── 8: Hold for a moment ──
    const holdAt = afterScramble + 1.4;

    // ── 9: Wipe exit — clip-path upward reveal ──
    tl.to(
      overlayRef.current,
      {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.8,
        ease: "power4.inOut",
      },
      holdAt
    );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
      style={{
        background: "#080c14",
        clipPath: "inset(0 0 0% 0)",
      }}
    >
      {/* Scanlines */}
      <div ref={scanlineRef} className="scanlines absolute inset-0 pointer-events-none z-0" />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Grid lines */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* HUD: top bar */}
      <div
        ref={hudTopRef}
        className="absolute top-6 left-0 right-0 px-8 flex items-center justify-between pointer-events-none"
      >
        <span className="text-[10px] font-mono text-blue-400/60 tracking-widest uppercase">
          portfolio.init
        </span>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400/80 animate-pulse" />
          <span className="text-[10px] font-mono text-subtle">sys.ready</span>
        </div>
      </div>

      {/* HUD: corner brackets */}
      <div className="absolute top-12 left-8 w-8 h-8 border-l-2 border-t-2 border-blue-500/30 pointer-events-none" />
      <div className="absolute top-12 right-8 w-8 h-8 border-r-2 border-t-2 border-blue-500/30 pointer-events-none" />
      <div className="absolute bottom-12 left-8 w-8 h-8 border-l-2 border-b-2 border-blue-500/30 pointer-events-none" />
      <div className="absolute bottom-12 right-8 w-8 h-8 border-r-2 border-b-2 border-blue-500/30 pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-4 select-none">
        {/* Name with char spans + glitch layers */}
        <div className="relative">
          {/* Glitch layer A (red channel offset) */}
          <div
            ref={glitchRefA}
            className="absolute inset-0 flex pointer-events-none opacity-0"
            aria-hidden="true"
            style={{ color: "#ff4444", mixBlendMode: "screen" }}
          >
            {"Miftaul Islam Shuvro".split("").map((ch, i) => (
              <span
                key={`ga-${i}`}
                className="text-5xl md:text-7xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display, sans-serif)" }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </div>

          {/* Glitch layer B (cyan channel offset) */}
          <div
            ref={glitchRefB}
            className="absolute inset-0 flex pointer-events-none opacity-0"
            aria-hidden="true"
            style={{ color: "#00e5ff", mixBlendMode: "screen" }}
          >
            {"Miftaul Islam Shuvro".split("").map((ch, i) => (
              <span
                key={`gb-${i}`}
                className="text-5xl md:text-7xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display, sans-serif)" }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </div>

          {/* Real name */}
          <div ref={nameRef} className="flex overflow-hidden">
            {NAME_CHARS.map((ch, i) => (
              <span
                key={i}
                ref={(el) => { charRefs.current[i] = el; }}
                className="text-5xl md:text-7xl font-bold text-white tracking-tight"
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  display: "inline-block",
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className="flex items-center gap-3 opacity-0">
          <div className="h-px w-8 bg-blue-500/40" />
          <span className="text-sm font-medium text-blue-400 tracking-widest uppercase font-mono">
            Full Stack Developer
          </span>
          <div className="h-px w-8 bg-blue-500/40" />
        </div>

        {/* Status */}
        <div
          ref={statusRef}
          className="mt-2 text-xs font-mono text-subtle tracking-wider opacity-0 h-4"
        />
      </div>

      {/* HUD: bottom bar */}
      <div
        ref={hudBotRef}
        className="absolute bottom-6 left-0 right-0 px-8 flex items-center justify-between pointer-events-none"
      >
        <span className="text-[10px] font-mono text-subtle">
          v1.0.0 · miftaul.dev
        </span>
        <span className="text-[10px] font-mono text-subtle">
          2026 · Dhaka, BD
        </span>
      </div>

      {/* Loading bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
          style={{ animation: "loading-bar 3.5s ease-out forwards" }}
        />
      </div>

      <style>{`
        @keyframes loading-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}

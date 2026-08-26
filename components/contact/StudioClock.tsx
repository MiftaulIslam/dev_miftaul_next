"use client";

import { useEffect, useRef, useState } from "react";

import {
  STUDIO_UTC_OFFSET_HOURS,
  WORK_HOURS,
  formatStudioClock,
  formatHoursAhead,
  studioReading,
  withinWorkingHours,
} from "@/lib/contact/studio";

const pad = (n: number) => String(n).padStart(2, "0");

function workingHoursLabel(): string {
  return `Sun–Thu · ${pad(WORK_HOURS.start)}:00–${pad(WORK_HOURS.end)}:00 GMT+${STUDIO_UTC_OFFSET_HOURS}`;
}

interface StudioClockProps {
  /** Server-rendered reading so there is no empty dash before hydration. */
  initialTime: string;
  initialAtDesk: boolean;
}

/**
 * Owns the one-second boundary. The clock string and the at-desk boolean are
 * derived from the same reading so the instrument cannot contradict itself.
 * The clock is deliberately NOT in a live region — a time announcing itself
 * every second makes a screen reader unusable.
 */
export default function StudioClock({ initialTime, initialAtDesk }: StudioClockProps) {
  const [time, setTime] = useState(initialTime);
  const [atDesk, setAtDesk] = useState(initialAtDesk);
  // Timezone facts are viewer-specific; they join the same once-a-second
  // write below so the server never guesses them and there is one writer.
  const [ahead, setAhead] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let visible = true;
    let raf = 0;
    let lastSecond = -1;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      },
      { rootMargin: "80px" },
    );
    io.observe(root);

    const tick = () => {
      raf = 0;
      if (!visible) return;
      const reading = studioReading();
      if (reading.seconds !== lastSecond) {
        lastSecond = reading.seconds;
        setTime(formatStudioClock(reading));
        setAtDesk(withinWorkingHours(reading));
        setAhead(formatHoursAhead());
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Cell 1 — the largest number on the page */}
      <div ref={rootRef} className="min-w-0">
        <p className="font-mono text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-console-key">
          Studio clock
        </p>
        <p
          suppressHydrationWarning
          className="mt-3 font-mono text-[2.25rem] font-medium leading-none tracking-tight tabular-nums text-console-ink"
        >
          {time}
        </p>
        <p className="mt-2.5 font-mono text-[11px] tracking-wide text-console-caption">
          GMT+{STUDIO_UTC_OFFSET_HOURS}
          {ahead ? ` · ${ahead}` : ""}
        </p>
      </div>

      {/* Cell 2 — presence, recomputed on the same second boundary */}
      <div>
        <p className="font-mono text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-console-key">
          Working hours
        </p>
        <div className="mt-4 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-2 rounded-full transition-colors duration-[220ms]"
            style={{
              backgroundColor: atDesk
                ? "var(--console-accent)"
                : "var(--console-key)",
              transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
          <span suppressHydrationWarning className="text-[0.9375rem] leading-snug text-console-ink">
            {atDesk ? "At the desk now" : "Outside hours"}
          </span>
        </div>
        <p className="mt-2.5 font-mono text-[11px] tracking-wide text-console-caption">
          {workingHoursLabel()}
        </p>
      </div>
    </>
  );
}

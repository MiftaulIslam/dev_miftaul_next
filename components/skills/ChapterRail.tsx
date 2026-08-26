"use client";

import { type RefObject } from "react";

export default function ChapterRail({
  labels,
  activeIndex,
  onJump,
  progressRef,
  timecodeRef,
}: {
  labels: string[];
  activeIndex: number;
  onJump: (index: number) => void;
  progressRef: RefObject<HTMLSpanElement | null>;
  timecodeRef: RefObject<HTMLSpanElement | null>;
}) {
  const total = labels.length;

  return (
    <div className="reel-rail-ui">
      <span className="reel-progress" aria-hidden="true">
        <span className="reel-progress-fill" ref={progressRef} />
      </span>
      <div className="reel-rail-row">
        <span className="reel-timecode" ref={timecodeRef}>
          01 / {String(total).padStart(2, "0")}
        </span>
        <div className="reel-ticks" role="group" aria-label="Chapter rail">
          {labels.map((label, i) => (
            <button
              key={label}
              type="button"
              className={i === activeIndex ? "reel-tick is-active" : "reel-tick"}
              aria-current={i === activeIndex ? "true" : undefined}
              aria-label={`Scene ${String(i + 1).padStart(2, "0")}, ${label}`}
              onClick={() => onJump(i)}
            >
              <span className="reel-tick-dot" aria-hidden="true" />
              <span className="reel-tick-label">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

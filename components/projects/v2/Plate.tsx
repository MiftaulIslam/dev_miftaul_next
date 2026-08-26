"use client";

import { useEffect, useRef } from "react";
import type { ReelProject } from "@/types/projects";

/**
 * One plate: the real product capture, framed by drawn plate furniture.
 *
 * WHAT IS DRAWN AND WHAT IS PHOTOGRAPHED
 * The image is a genuine capture of the running product — `project.plate.src`,
 * named honestly by `project.plate.caption` in the figure caption. The canvas on
 * top of it draws only *furniture*: registration brackets, sprocket marks, a
 * measured baseline, and a crosshair. None of it encodes data. It exists so a
 * capture reads as a plate in a reel rather than as a stray screenshot, and so
 * the accent hue has somewhere to live inside the frame.
 *
 * The furniture is deliberately not a diagram. A generated node graph laid over
 * a screenshot would look like information and carry none, which is worse than
 * drawing nothing. If a project ever ships without a capture, `src` is null and
 * the furniture stands alone over the ground colour.
 *
 * PAINTING
 * This canvas is drawn once per size/theme/accent change and never again — there
 * is no rAF loop and nothing repaints while the reel is idle or off-screen. All
 * plate movement (handoff, parallax) is transform-only on the wrapper.
 */

/** Deterministic PRNG so a given project's furniture is identical every render. */
function seededRandom(seed: string): () => number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash |= 0;
    hash = (hash + 0x6d2b79f5) | 0;
    let t = Math.imul(hash ^ (hash >>> 15), 1 | hash);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PlateProps {
  project: ReelProject;
  index: number;
  total: number;
  /** Paused plates skip the draw entirely — the back layer is never visible. */
  active: boolean;
}

export default function Plate({ project, index, total, active }: PlateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !active) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;

    const draw = () => {
      frame = 0;
      const { width, height } = wrap.getBoundingClientRect();
      if (width < 2 || height < 2) return;

      // Backing store capped at 2, and at 1.75 below 768px per the perf budget.
      const cap = width < 768 ? 1.75 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const rand = seededRandom(project.id);
      const accent = project.accent;
      const inset = Math.max(18, Math.min(width, height) * 0.035);

      context.lineCap = "square";

      /* Corner registration brackets — 4 paths. */
      const arm = Math.max(14, Math.min(width, height) * 0.045);
      context.strokeStyle = accent;
      context.globalAlpha = 0.85;
      context.lineWidth = 1.5;
      const corners: Array<[number, number, number, number]> = [
        [inset, inset, 1, 1],
        [width - inset, inset, -1, 1],
        [inset, height - inset, 1, -1],
        [width - inset, height - inset, -1, -1],
      ];
      for (const [x, y, sx, sy] of corners) {
        context.beginPath();
        context.moveTo(x + sx * arm, y);
        context.lineTo(x, y);
        context.lineTo(x, y + sy * arm);
        context.stroke();
      }

      /* Sprocket marks down both edges — this is a reel, so it has perforations.
         Count is fixed, not random, so the rhythm reads as mechanical. */
      const sprockets = 9;
      const sprocketW = 5;
      const sprocketH = Math.max(9, height * 0.022);
      context.globalAlpha = 0.3;
      context.fillStyle = accent;
      for (let i = 0; i < sprockets; i += 1) {
        const y = ((i + 0.5) / sprockets) * (height - inset * 2) + inset;
        context.fillRect(inset * 0.42, y - sprocketH / 2, sprocketW, sprocketH);
        context.fillRect(width - inset * 0.42 - sprocketW, y - sprocketH / 2, sprocketW, sprocketH);
      }

      /* Measured baseline along the bottom inset, ticking every 1/24 of the
         frame with a longer mark on the eighths. */
      const baseY = height - inset;
      const ticks = 24;
      context.globalAlpha = 0.26;
      context.strokeStyle = accent;
      context.lineWidth = 1;
      context.beginPath();
      for (let i = 0; i <= ticks; i += 1) {
        const x = inset + (i / ticks) * (width - inset * 2);
        const long = i % 8 === 0;
        context.moveTo(x, baseY);
        context.lineTo(x, baseY - (long ? 11 : 5));
      }
      context.stroke();

      /* Crosshair at a seeded position in the upper band, kept out of the
         reading corner (bottom-left) so it never sits behind prose. */
      const cx = width * (0.52 + rand() * 0.3);
      const cy = height * (0.16 + rand() * 0.22);
      const reach = Math.max(20, Math.min(width, height) * 0.06);
      context.globalAlpha = 0.5;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(cx - reach, cy);
      context.lineTo(cx - 5, cy);
      context.moveTo(cx + 5, cy);
      context.lineTo(cx + reach, cy);
      context.moveTo(cx, cy - reach);
      context.lineTo(cx, cy - 5);
      context.moveTo(cx, cy + 5);
      context.lineTo(cx, cy + reach);
      context.stroke();
      context.beginPath();
      context.arc(cx, cy, 3.5, 0, Math.PI * 2);
      context.stroke();

      /* Frame number, bottom-right of the plate box, mono and tabular. */
      context.globalAlpha = 0.6;
      context.fillStyle = accent;
      context.font = `500 ${Math.max(10, Math.min(13, width * 0.009))}px "JetBrains Mono", ui-monospace, monospace`;
      context.textAlign = "right";
      context.textBaseline = "alphabetic";
      context.fillText(
        `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`,
        width - inset,
        baseY - 18,
      );

      context.globalAlpha = 1;
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(draw);
    };

    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(wrap);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [project.id, project.accent, index, total, active]);

  return (
    <div ref={wrapRef} className="wreel-plate-inner">
      {project.plate.src ? (
        // Intentionally a plain <img>: the plate is a full-bleed background
        // element inside a transform-animated layer, and next/image's wrapper
        // adds a layout box that fights the handoff. Sizing is pure CSS.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="wreel-plate-img"
          src={project.plate.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          style={{ objectPosition: project.plate.focus ?? "50% 50%" }}
        />
      ) : null}
      <canvas ref={canvasRef} className="wreel-plate-canvas" aria-hidden="true" />
    </div>
  );
}

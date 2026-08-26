"use client";

import { useEffect, useRef } from "react";

import {
  REPLY_OUTER_HOURS,
  REPLY_TARGET_HOURS,
} from "@/lib/contact/studio";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Constant-rate progress across a scale — easing a ruler would lie about it. */
const SCAN_PER_SECOND = 0.085;

interface Palette {
  key: string;
  hairline: string;
  accent: string;
  accentSoft: string;
  scanLine: string;
  scanHead: string;
  mono: string;
}

function readPalette(canvas: HTMLCanvasElement): Palette {
  const css = getComputedStyle(canvas);
  return {
    key: css.getPropertyValue("--console-key").trim() || "#8a8c96",
    hairline: css.getPropertyValue("--console-hairline").trim() || "rgba(255,255,255,.08)",
    accent: css.getPropertyValue("--console-accent").trim() || "#5ba8ff",
    accentSoft: css.getPropertyValue("--console-accent-soft").trim() || "rgba(91,168,255,.16)",
    scanLine: css.getPropertyValue("--console-scan-line").trim() || "rgba(255,255,255,.5)",
    scanHead: css.getPropertyValue("--console-scan-head").trim() || "#ffffff",
    mono: `${css.fontFamily}, monospace`,
  };
}

/**
 * The reply-window meter: a 72-hour ruler with the commitment drawn as a band.
 * One canvas, about twenty ops per repaint, repainting only when the scan
 * moves half a pixel or the surface under it changes. Not clickable — there
 * is nothing behind it to open.
 */
export default function ReplyMeter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let palette = readPalette(canvas);
    let visible = true;
    let raf = 0;
    let lastTs = 0;
    let progress = 0;
    let lastHeadX = -1;
    let disposed = false;

    const draw = () => {
      if (disposed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
      if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const mobile = h < 60;
      const padX = 2;
      const innerW = w - padX * 2;
      const x = (hours: number) => padX + (hours / REPLY_OUTER_HOURS) * innerW;
      const baselineY = h - (mobile ? 15 : 21);
      const trackTop = mobile ? 5 : 7;
      const bandH = mobile ? 7 : 10;
      const targetX = x(REPLY_TARGET_HOURS);

      // Band: the size of the commitment, filled at 12% light / 16% dark.
      ctx.fillStyle = palette.accentSoft;
      ctx.fillRect(x(0), baselineY - bandH, targetX - x(0), bandH);

      // Its right edge, drawn hard — that number is what matters.
      ctx.fillStyle = palette.accent;
      ctx.fillRect(Math.round(targetX) - 0.5, baselineY - bandH - 3, 1, bandH + 4);

      // Axis.
      ctx.strokeStyle = palette.hairline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, Math.round(baselineY) + 0.5);
      ctx.lineTo(w - padX, Math.round(baselineY) + 0.5);
      ctx.stroke();

      // Ticks: majors every 24h everywhere, minors every 6h off mobile.
      ctx.beginPath();
      for (let hrs = 0; hrs <= REPLY_OUTER_HOURS; hrs += 6) {
        const major = hrs % 24 === 0;
        if (!major && mobile) continue;
        const len = major ? (mobile ? 4 : 6) : 3;
        const tx = Math.round(x(hrs)) + 0.5;
        ctx.moveTo(tx, Math.round(baselineY) + 2);
        ctx.lineTo(tx, Math.round(baselineY) + 2 + len);
      }
      ctx.stroke();

      // Labels, nine pixels — acceptable for an axis tick and nowhere else.
      ctx.fillStyle = palette.key;
      ctx.font = `500 9px ${palette.mono}`;
      ctx.textBaseline = "alphabetic";
      const labelY = h - 4;
      const labels = mobile
        ? [0, REPLY_OUTER_HOURS]
        : [0, 24, 48, REPLY_OUTER_HOURS];
      for (const hrs of labels) {
        const lx = x(hrs);
        ctx.textAlign =
          hrs === 0 ? "left" : hrs === REPLY_OUTER_HOURS ? "right" : "center";
        ctx.fillText(`${hrs}h`, lx, labelY);
      }

      // Scan: one 1px line plus one 3px head. White is energy across this area.
      const headX = padX + progress * innerW;
      ctx.fillStyle = palette.scanLine;
      ctx.fillRect(headX - 0.5, trackTop, 1, Math.round(baselineY) - trackTop);
      ctx.fillStyle = palette.scanHead;
      ctx.fillRect(headX - 1.5, baselineY - bandH - 1, 3, bandH + 2);

      lastHeadX = headX;
    };

    const tick = (ts: number) => {
      raf = 0;
      if (disposed || !visible) return;
      if (!lastTs) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.25);
      lastTs = ts;
      progress = (progress + SCAN_PER_SECOND * dt) % 1;

      const innerW = Math.max(1, canvas.getBoundingClientRect().width - 4);
      const headX = 2 + progress * innerW;
      if (Math.abs(headX - lastHeadX) >= 0.5) draw();
      raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!raf && visible && !reduced) {
        lastTs = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    // Park at the outer bound when motion is reduced — the reading that matters.
    if (reduced) {
      progress = 1;
      draw();
    } else {
      draw();
      startLoop();
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          draw();
          startLoop();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "80px" },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);

    // Re-read tokens when the theme class flips so both themes stay exact.
    const themeObserver = new MutationObserver(() => {
      palette = readPalette(canvas);
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      disposed = true;
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block h-[44px] w-full min-[768px]:h-[76px] min-[1100px]:h-[88px]"
    />
  );
}

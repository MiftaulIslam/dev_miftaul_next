import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const DefaultCursorSVG = ({ size = 25, color = "currentColor", className }: { size?: number; color?: string; className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size * 2}
      height={size * 2.16}
      viewBox="0 0 50 54"
      fill="none"
      className={cn("pointer-events-none drop-shadow-md", className)}
    >
      <g filter="url(#filter0_d_91_7928)">
        <path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill={color}
        />
        <path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke="currentColor"
          strokeWidth={1.5}
        />
      </g>
    </svg>
  );
};

export interface SmoothCursorProps {
  cursor?: React.ReactNode;
  className?: string;
  size?: number;
  color?: string;
  hideOnLeave?: boolean;
  trailLength?: number;
  showTrail?: boolean;
  rotateOnMove?: boolean;
  scaleOnClick?: boolean;
  glowEffect?: boolean;
  magneticDistance?: number;
  magneticElements?: string;
  onCursorMove?: (pos: { x: number; y: number }) => void;
  onCursorEnter?: () => void;
  onCursorLeave?: () => void;
  disabled?: boolean;
}

/** How often, at most, the magnetic targets are re-measured while the pointer moves. */
const MAGNET_REMEASURE_MS = 150;

/**
 * A smoothed custom cursor with rotation, click squash, optional trail and
 * magnetic pull towards small interactive targets.
 *
 * Rewritten off framer-motion onto GSAP (already on the page), and off layout:
 * - the cursor moves by transform, where it used to animate `left`/`top` and
 *   force a layout on every frame the pointer moved;
 * - magnetic targets are measured at most every 150ms, where every pointer
 *   frame used to query every link and button on the page and read each one's
 *   rect;
 * - nothing here sets React state per pointer frame — hiding over interactive
 *   elements and the trail are direct style writes.
 */
export function SmoothCursor({
  cursor,
  className,
  size = 22,
  color = "currentColor",
  hideOnLeave = true,
  trailLength = 5,
  showTrail = false,
  rotateOnMove = true,
  scaleOnClick = true,
  glowEffect = false,
  magneticDistance = 50,
  magneticElements = "a, button, [role='button'], input, textarea, select, .cursor-pointer, [data-magnetic]",
  onCursorMove,
  onCursorEnter,
  onCursorLeave,
  disabled = false,
}: SmoothCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = cursorRef.current;
    if (disabled || !el) return;

    // Only activate custom cursor on fine pointer devices (desktops)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // The springs this replaces: position ~critically damped, rotation
    // overdamped (slower), the click squash quick, the entrance a small pop.
    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
    const toX = gsap.quickTo(el, "x", { duration: 0.25, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3.out" });
    const toRotation = gsap.quickTo(el, "rotation", { duration: 0.5, ease: "power3.out" });
    const toScale = gsap.quickTo(el, "scale", { duration: 0.15, ease: "power2.out" });
    const popIn = () =>
      gsap.fromTo(el, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(1.4)" });

    const trailDots = showTrail ? trailRefs.current.filter((dot): dot is HTMLDivElement => Boolean(dot)) : [];
    const trail: { x: number; y: number }[] = [];

    let started = false;
    let hidden = false;
    let lastPos = { x: 0, y: 0 };
    let lastTime = performance.now();
    let previousAngle = 0;
    let rotation = 0;

    let magnets: { x: number; y: number }[] = [];
    let measuredAt = -Infinity;
    const nearestMagnet = (x: number, y: number, now: number) => {
      if (now - measuredAt > MAGNET_REMEASURE_MS) {
        magnets = Array.from(document.querySelectorAll(magneticElements), (node) => {
          const rect = node.getBoundingClientRect();
          return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        });
        measuredAt = now;
      }
      for (const magnet of magnets) {
        const distance = Math.hypot(x - magnet.x, y - magnet.y);
        if (distance < magneticDistance) return { ...magnet, distance };
      }
      return null;
    };

    // Over a link or button the native pointer takes over and the custom
    // cursor steps aside, popping back in when the pointer leaves it.
    const setHidden = (next: boolean) => {
      if (next === hidden) return;
      hidden = next;
      document.body.style.cursor = next ? "pointer" : "none";
      if (next) gsap.set(el, { autoAlpha: 0 });
      else popIn();
      for (const dot of trailDots) dot.style.visibility = next ? "hidden" : "visible";
    };

    const onMouseMove = (event: MouseEvent) => {
      const now = performance.now();
      let pos = { x: event.clientX, y: event.clientY };

      if (!started) {
        // First move: appear where the pointer is, not glide in from 0,0.
        started = true;
        gsap.set(el, { x: pos.x, y: pos.y });
        popIn();
      }

      const target = event.target as Element | null;
      setHidden(Boolean(target?.closest(magneticElements)));

      const magnet = nearestMagnet(pos.x, pos.y, now);
      if (magnet) {
        const strength = 1 - magnet.distance / magneticDistance;
        pos = {
          x: pos.x + (magnet.x - pos.x) * strength * 0.35,
          y: pos.y + (magnet.y - pos.y) * strength * 0.35,
        };
      }

      const dt = now - lastTime;
      const vx = dt > 0 ? (pos.x - lastPos.x) / dt : 0;
      const vy = dt > 0 ? (pos.y - lastPos.y) / dt : 0;
      lastTime = now;
      lastPos = pos;

      toX(pos.x);
      toY(pos.y);
      onCursorMove?.(pos);

      if (rotateOnMove && Math.hypot(vx, vy) > 0.1) {
        const angle = Math.atan2(vy, vx) * (180 / Math.PI) + 90;
        let diff = angle - previousAngle;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        rotation += diff;
        previousAngle = angle;
        toRotation(rotation);
      }

      if (trailDots.length && !hidden) {
        trail.unshift(pos);
        trail.length = Math.min(trail.length, trailDots.length);
        trail.forEach((point, i) => {
          trailDots[i].style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) scale(${((trailDots.length - i) / trailDots.length) * 0.7})`;
          trailDots[i].style.visibility = "visible";
        });
      }
    };

    const onMouseEnter = () => {
      if (started && !hidden) gsap.set(el, { autoAlpha: 1 });
      onCursorEnter?.();
    };
    const onMouseLeave = () => {
      if (hideOnLeave) gsap.set(el, { autoAlpha: 0 });
      document.body.style.cursor = "auto";
      onCursorLeave?.();
    };
    const onMouseDown = () => scaleOnClick && toScale(0.75);
    const onMouseUp = () => scaleOnClick && toScale(1);

    document.body.style.cursor = "none";
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "auto";
      gsap.killTweensOf(el);
    };
  }, [
    disabled,
    showTrail,
    trailLength,
    rotateOnMove,
    scaleOnClick,
    hideOnLeave,
    magneticDistance,
    magneticElements,
    onCursorMove,
    onCursorEnter,
    onCursorLeave,
  ]);

  if (disabled) return null;

  return (
    <>
      {showTrail &&
        Array.from({ length: trailLength }, (_, index) => (
          <div
            key={index}
            ref={(node) => {
              trailRefs.current[index] = node;
            }}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 9998 - index,
              opacity: ((trailLength - index) / trailLength) * 0.4,
              // Shown on the first pointer move, not parked at 0,0 until then.
              visibility: "hidden",
            }}
            className="pointer-events-none hidden h-2.5 w-2.5 rounded-full bg-primary md:block"
          />
        ))}

      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 9999,
          willChange: "transform",
          filter: glowEffect ? "drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))" : "none",
        }}
        className={cn("pointer-events-none hidden select-none text-primary md:block", className)}
      >
        {cursor || <DefaultCursorSVG size={size} color={color} />}
      </div>
    </>
  );
}

export default SmoothCursor;

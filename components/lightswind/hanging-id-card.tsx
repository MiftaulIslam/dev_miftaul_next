"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Physics constants ────────────────────────────────────────────────────────
const SPRING_K = 0;          // Real pendulum relies on gravity
const DAMPING  = 0.92;       // Air resistance for smooth natural swing
const GRAVITY  = 3000;       // Gravity scalar for snappy momentum
const MASS     = 1;

/* Adapted for this app ------------------------------------------------------
 * A flick's angular velocity was previously unbounded, so a fast drag could
 * spin the card through full rotations; the accumulated angle then fought the
 * ±1.4 rad drag clamp and the card felt stuck on the next grab. Velocity is
 * now capped at the energy that just reaches MAX_ANGLE, and the free swing is
 * clamped as a backstop.
 *
 * The lanyard is also elastic: pulling away from the pin stretches the ribbon
 * along a rubber-band curve, and it springs back on release.
 * ------------------------------------------------------------------------- */
const MAX_ANGLE        = 1.45;  // rad — hard wall for the swing
const MAX_FLICK_VEL    = 5.4;   // rad/s — ½v² = (G/L)(1-cos MAX_ANGLE)
const MAX_STRETCH      = 78;    // px the tape can extend
const STRETCH_RESIST   = 150;   // higher = stiffer rubber band
const STRETCH_STIFFNESS = 240;  // snap-back spring
const STRETCH_DAMPING  = 17;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface CardPhysicsState {
  angle:   number;  // radians from vertical
  vel:     number;  // angular velocity  rad/s
  stretch: number;  // px the tape is extended
  stretchVel: number;
}

export interface HangingIdCardProps {
  children?: React.ReactNode;
  ropeLength?: number;
  ropeColor?: string;
  className?: string;
  name?: string;
  role?: string;
  badgeId?: string;
  accentColor?: string;
  /** Adapted for this app: the upstream card is a fixed `w-52`. */
  cardWidth?: string;
}

// ─── SVG Black Lanyard Rope & Metal Lock Clip ──────────────────────────────────
const Lanyard = ({
  length,
  color,
  stretch = 0,
}: { length: number; color: string; stretch?: number }) => {
  const clampY = length;
  // The ribbon scales from its top edge; the hardware just rides down with it.
  const strapScale = (clampY + 4 + stretch) / (clampY + 4);
  const ringY = length + 10;
  const hookY = length + 18;

  return (
    <svg
      width="44"
      height={length + 38}
      viewBox={`0 0 44 ${length + 38}`}
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <defs>
        {/* Metal clamp & ring gradient */}
        <linearGradient id="metalDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#71717a" />
          <stop offset="35%" stopColor="#27272a" />
          <stop offset="70%" stopColor="#52525b" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>

        {/* Hook gradient */}
        <linearGradient id="hookDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#52525b" />
          <stop offset="40%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#3f3f46" />
        </linearGradient>

        {/* Ribbon fabric texture shading */}
        <linearGradient id="strapHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="25%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="75%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <g transform={`scale(1, ${strapScale})`}>
      {/* Main Lanyard Ribbon Strap */}
      <rect
        x="12"
        y="0"
        width="20"
        height={clampY + 4}
        rx="2"
        fill={color || "#18181b"}
      />
      {/* Strap fabric depth shading */}
      <rect
        x="12"
        y="0"
        width="20"
        height={clampY + 4}
        rx="2"
        fill="url(#strapHighlight)"
      />

      {/* Strap side stitch lines */}
      <line
        x1="13.5"
        y1="0"
        x2="13.5"
        y2={clampY + 4}
        stroke="#ffffff"
        strokeOpacity="0.15"
        strokeWidth="0.75"
        strokeDasharray="3 2"
      />
      <line
        x1="30.5"
        y1="0"
        x2="30.5"
        y2={clampY + 4}
        stroke="#ffffff"
        strokeOpacity="0.15"
        strokeWidth="0.75"
        strokeDasharray="3 2"
      />

      </g>

      <g transform={`translate(0, ${stretch})`}>
      {/* Metallic Ribbon Crimp Clamp (Base of Strap) */}
      <rect
        x="10"
        y={clampY}
        width="24"
        height="10"
        rx="2.5"
        fill="url(#metalDark)"
        stroke="#18181b"
        strokeWidth="0.8"
      />
      {/* Metallic Screws/Rivets on Clamp */}
      <circle cx="13.5" cy={clampY + 5} r="1.3" fill="#a1a1aa" />
      <circle cx="30.5" cy={clampY + 5} r="1.3" fill="#a1a1aa" />

      {/* Swivel Ring Loop */}
      <path
        d={`M 15 ${clampY + 9} C 15 ${ringY + 6}, 29 ${ringY + 6}, 29 ${clampY + 9}`}
        fill="none"
        stroke="url(#metalDark)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Swivel Joint */}
      <rect
        x="19"
        y={ringY + 2}
        width="6"
        height="6"
        rx="1"
        fill="url(#metalDark)"
      />

      {/* Metal Snap Hook / Lock Clip */}
      <path
        d={`M 20 ${ringY + 7} 
           L 20 ${hookY + 6} 
           C 20 ${hookY + 15}, 24 ${hookY + 15}, 24 ${hookY + 6} 
           L 24 ${ringY + 7}`}
        fill="none"
        stroke="url(#hookDark)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      
      {/* Spring Clip Latch Lever */}
      <line
        x1="20.5"
        y1={hookY + 1}
        x2="20.5"
        y2={hookY + 10}
        stroke="#d4d4d8"
        strokeWidth="1.2"
      />
      </g>
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const HangingIdCard = ({
  children,
  ropeLength  = 140,
  ropeColor   = "#18181b",
  className,
  name        = "John Doe",
  role        = "Product Designer",
  badgeId     = "ID-84920",
  accentColor = "#2563eb",
  cardWidth   = "w-52",
}: HangingIdCardProps) => {
  const physRef      = useRef<CardPhysicsState>({ angle: 0, vel: 0, stretch: 0, stretchVel: 0 });
  const pinRef       = useRef<HTMLDivElement>(null);
  const pivotRef     = useRef({ x: 0, y: 0 });
  const grabDistRef  = useRef(0);
  const angleOffsetRef = useRef(0);
  const rafRef       = useRef<number | null>(null);
  const prevTimeRef  = useRef<number | null>(null);
  const prevAngleRef = useRef<number>(0);
  const isDraggingRef= useRef(false);

  const [angle, setAngle] = useState(0);
  const [stretch, setStretch] = useState(0);
  const [, setIsDragState] = useState(false);

  // Recursive rAF goes through this ref rather than `tick` naming itself.
  const tickRef = useRef<((now: number) => void) | null>(null);
  const schedule = useCallback(() => {
    rafRef.current = requestAnimationFrame((now) => tickRef.current?.(now));
  }, []);

  // ── Physics loop ────────────────────────────────────────────────────────────
  const tick = useCallback((now: number) => {
    if (prevTimeRef.current === null) { prevTimeRef.current = now; }
    const dt = Math.min((now - prevTimeRef.current) / 1000, 0.05); // cap at 50ms
    prevTimeRef.current = now;

    const s = physRef.current;
    if (!isDraggingRef.current) {
      // Realistic pendulum: L is approximate center of mass
      const L = ropeLength + 100; 
      const torque =
        -(GRAVITY / L)    * Math.sin(s.angle) -
        (DAMPING  / MASS) * s.vel             -
        (SPRING_K / MASS) * s.angle;

      s.vel   += torque * dt;
      s.angle += s.vel  * dt;

      // Backstop: never let the swing climb over the top.
      if (s.angle > MAX_ANGLE)  { s.angle = MAX_ANGLE;  s.vel = Math.min(s.vel, 0); }
      if (s.angle < -MAX_ANGLE) { s.angle = -MAX_ANGLE; s.vel = Math.max(s.vel, 0); }

      // Elastic tape springs back to its rest length.
      const stretchAcc = -STRETCH_STIFFNESS * s.stretch - STRETCH_DAMPING * s.stretchVel;
      s.stretchVel += stretchAcc * dt;
      s.stretch    += s.stretchVel * dt;

      setAngle(s.angle);
      setStretch(s.stretch);

      const moving =
        Math.abs(s.angle) > 0.001 || Math.abs(s.vel) > 0.001 ||
        Math.abs(s.stretch) > 0.05 || Math.abs(s.stretchVel) > 0.05;

      if (moving) {
        schedule();
      } else {
        // settled perfectly at bottom
        s.angle = 0; s.vel = 0; s.stretch = 0; s.stretchVel = 0;
        setAngle(0);
        setStretch(0);
        rafRef.current = null;
      }
    } else {
      // Track velocity while dragging so we can "flick" it
      if (dt > 0) {
        s.vel = clamp((s.angle - prevAngleRef.current) / dt, -MAX_FLICK_VEL, MAX_FLICK_VEL);
      }
      prevAngleRef.current = s.angle;
      schedule();
    }
  }, [ropeLength, schedule]);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const startPhysics = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = null;
    schedule();
  }, [schedule]);

  // ── Pointer events ──────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    setIsDragState(true);

    // Pivot = the anchor pin, which never rotates, so it stays a stable origin.
    const pin = pinRef.current?.getBoundingClientRect();
    pivotRef.current = pin
      ? { x: pin.left + pin.width / 2, y: pin.bottom }
      : { x: e.clientX, y: e.clientY };

    const dx = e.clientX - pivotRef.current.x;
    const dy = e.clientY - pivotRef.current.y;
    grabDistRef.current = Math.hypot(dx, dy);
    // Keep the grabbed point under the cursor instead of snapping to it.
    // Sign note: CSS rotate(t) maps a point (0, r) below the pivot to
    // x' = -sin(t)*r, so a POSITIVE angle swings the card's bottom LEFT.
    // The pointer's bearing atan2(dx, dy) is positive to the RIGHT, hence the
    // negation below — without it the card mirrors the drag.
    angleOffsetRef.current = physRef.current.angle + Math.atan2(dx, Math.max(dy, 1));

    prevAngleRef.current = physRef.current.angle;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = null;
    schedule();
  }, [schedule]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const s = physRef.current;

    const dx = e.clientX - pivotRef.current.x;
    const dy = e.clientY - pivotRef.current.y;

    // Absolute angle about the pivot — cannot drift or accumulate.
    const raw = angleOffsetRef.current - Math.atan2(dx, Math.max(dy, 1));
    s.angle = clamp(raw, -MAX_ANGLE, MAX_ANGLE);

    // Pull past the grab distance stretches the tape, with rubber-band falloff.
    const pull = Math.hypot(dx, dy) - grabDistRef.current;
    s.stretch = pull > 0 ? (MAX_STRETCH * pull) / (pull + STRETCH_RESIST) : 0;
    s.stretchVel = 0;

    setAngle(s.angle);
    setStretch(s.stretch);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    isDraggingRef.current = false;
    setIsDragState(false);
  }, []);

  // ── Click impulse (tap) ─────────────────────────────────────────────────────
  const onCardClick = useCallback(() => {
    if (Math.abs(physRef.current.vel) < 0.1 && Math.abs(physRef.current.angle) < 0.05) {
      physRef.current.vel = 4.0; // Give it a satisfying push
      startPhysics();
    }
  }, [startPhysics]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const cardRotateDeg = angle * (180 / Math.PI);

  return (
    <div
      className={cn("flex flex-col items-center select-none", className)}
      style={{ touchAction: "pan-y" }}
    >
      {/* Ceiling anchor pin */}
      <div
        ref={pinRef}
        className="w-3.5 h-3.5 rounded-full shadow-md z-10 relative bg-muted border border-hairline-strong"
      />

      {/* The Pendulum Assembly (Rope + Lock Clip + Card) */}
      <div 
        className="flex flex-col items-center cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onCardClick}
        style={{
          transform: `rotate(${cardRotateDeg}deg)`,
          transformOrigin: "top center",
          willChange: "transform",
          marginTop: "-6px"
        }}
      >
        {/* Lanyard Rope with Lock Clip */}
        <div style={{ pointerEvents: "none" }}>
          <Lanyard length={ropeLength} color={ropeColor} stretch={stretch} />
        </div>

        {/* ID Card */}
        <div
          className={cn("relative rounded-[1.75rem] overflow-hidden shadow-2xl border border-hairline bg-card pointer-events-none mt-[-16px]", cardWidth)}
          style={{ transform: `translateY(${stretch}px)`, willChange: "transform" }}
        >
          {/* Punched Slot Hole for Lanyard Clip */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="w-9 h-2.5 rounded-full bg-black/70 dark:bg-black/90 border border-white/30 shadow-inner flex items-center justify-center">
              <div className="w-7 h-1 rounded-full bg-zinc-950 opacity-90" />
            </div>
          </div>

          {children ?? (
            <div className="flex flex-col h-full">
              {/* Card Header Banner */}
              <div
                className="px-4 pt-3 pb-4 flex flex-col items-center gap-2 relative"
                style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #1e1b4b 100%)` }}
              >
                {/* Security Chip Icon */}
                <div className="absolute top-2.5 left-3 w-6 h-5 rounded bg-amber-400/90 border border-amber-500/80 shadow-sm flex items-center justify-center">
                  <div className="w-4 h-3 border border-amber-700/40 rounded-[1px] grid grid-cols-2 gap-[1px] p-[1px]">
                    <div className="bg-amber-600/40" />
                    <div className="bg-amber-600/40" />
                    <div className="bg-amber-600/40" />
                    <div className="bg-amber-600/40" />
                  </div>
                </div>

                {/* User Profile Avatar (No Lightswind Logo) */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md mt-1 border border-white/30 shadow-md">
                  <svg className="w-8 h-8 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>

              {/* Card Body */}
              <div className="bg-white dark:bg-zinc-900 px-4 py-4 flex flex-col items-center gap-1.5 flex-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-white text-center leading-tight">
                  {name}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {role}
                </p>

                <div className="my-1.5 w-full border-t border-zinc-100 dark:border-zinc-800" />

                {/* Barcode */}
                <div className="flex gap-[2px] items-end h-6 px-1">
                  {Array.from({ length: 26 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-zinc-800 dark:bg-zinc-200 rounded-[1px]"
                      style={{
                        width: i % 3 === 0 ? "3px" : "1.5px",
                        height: `${50 + Math.sin(i * 1.3) * 35}%`,
                      }}
                    />
                  ))}
                </div>

                <p
                  className="text-[10px] font-mono font-bold tracking-widest mt-0.5"
                  style={{ color: accentColor }}
                >
                  {badgeId}
                </p>

                {/* Status badge */}
                <div
                  className="mt-1 px-3 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-widest"
                  style={{ background: accentColor }}
                >
                  ACTIVE
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drag hint */}
      <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 select-none pointer-events-none">
        Drag or click the card
      </p>
    </div>
  );
};

export default HangingIdCard;


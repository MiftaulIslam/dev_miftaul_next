"use client";

import { useEffect, useId, useRef } from "react";

import type { PointerField } from "@/lib/usePointerField";

/**
 * Geometry of the pointer light. Every value is a multiple of the 64px grid
 * cell so the brightened grid stays registered with the base grid underneath.
 */
const SPOT = 768; // window diameter
const FIELD = 6144; // brightened grid extent
const FIELD_OFFSET = -2304; // inner offset inside the window

interface HeroAmbienceProps {
  pointer: PointerField;
}

/**
 * Layered hero backdrop: dot field, hairline grid, two slow halos, and a
 * pointer-reactive light.
 *
 * The dot field is adapted from the reference project's `lightswind/dot-pattern`
 * (a `useId`-keyed SVG `<pattern>` under a radial mask), retuned to this app's
 * theme tokens so it reads correctly in both themes.
 *
 * The pointer light is two counter-translated layers: an outer window moves
 * with the pointer while the grid inside it moves by exactly the opposite
 * amount, so that grid stays pinned to the section while the lit window slides
 * across it. Both are pure transforms, so the effect stays on the compositor.
 */
export default function HeroAmbience({ pointer }: HeroAmbienceProps) {
  const dotId = useId();
  const lightRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Written straight to the nodes from the pointer field: no React render per
  // pointer frame, and only transform/opacity change.
  useEffect(() => {
    if (!pointer.active) return;
    return pointer.subscribe(({ x, y, presence }) => {
      const move = `translate3d(${x}px, ${y}px, 0)`;
      for (const node of [lightRef.current, windowRef.current]) {
        if (!node) continue;
        node.style.transform = move;
        node.style.opacity = String(presence);
      }
      if (gridRef.current) gridRef.current.style.transform = `translate3d(${-x}px, ${-y}px, 0)`;
    });
  }, [pointer]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Base hairline grid */}
      <div
        className="bg-grid absolute inset-0"
        style={{
          maskImage: "radial-gradient(ellipse 85% 70% at 50% 45%, #000 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 70% at 50% 45%, #000 40%, transparent 100%)",
        }}
      />

      {/* Dot field */}
      <svg
        className="absolute inset-0 h-full w-full fill-foreground/[0.16]"
        style={{
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 90%)",
        }}
      >
        <defs>
          <pattern id={dotId} width={28} height={28} patternUnits="userSpaceOnUse">
            <circle cx={1} cy={1} r={1} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${dotId})`} />
      </svg>

      {/* Ambient halos — slow, low-frequency drift */}
      <div
        className="animate-drift absolute -left-24 top-[8%] h-[30rem] w-[30rem] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--hero-halo) 0%, transparent 68%)" }}
      />
      {/* The drift comes from `.animate-drift`, not an inline `animation`, so the
          reduced-motion rule in globals.css can stop it; only its timing is
          inline (inline longhands override the class, `!important` still wins). */}
      <div
        className="animate-drift absolute -right-16 bottom-[6%] h-[24rem] w-[24rem] rounded-full blur-[110px]"
        style={{
          background: "radial-gradient(circle, var(--hero-halo-alt) 0%, transparent 68%)",
          animationDuration: "19s",
          animationDirection: "reverse",
        }}
      />

      {pointer.active && (
        <>
          {/* Pointer light */}
          <div
            ref={lightRef}
            className="absolute rounded-full blur-[90px] will-change-transform"
            style={{
              width: SPOT,
              height: SPOT,
              left: -SPOT / 2,
              top: -SPOT / 2,
              opacity: 0,
              background: "radial-gradient(circle, var(--hero-spot) 0%, transparent 62%)",
            }}
          />

          {/* Grid brightened inside the moving window */}
          <div
            ref={windowRef}
            className="absolute overflow-hidden rounded-full will-change-transform"
            style={{
              width: SPOT,
              height: SPOT,
              left: -SPOT / 2,
              top: -SPOT / 2,
              opacity: 0,
              maskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
              WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
            }}
          >
            <div
              ref={gridRef}
              className="bg-grid absolute opacity-90"
              style={{
                width: FIELD,
                height: FIELD,
                left: FIELD_OFFSET,
                top: FIELD_OFFSET,
              }}
            />
          </div>
        </>
      )}

      {/* Bottom fade into the next section */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
    </div>
  );
}

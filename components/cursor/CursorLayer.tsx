"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { useCursorSettings } from "@/lib/cursor";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Both are pointer-only decoration and never render on the server, so they are
// loaded on demand — visitors who pick "System" never download either bundle
// (sparkle in particular pulls in GSAP).
const SmoothCursor = dynamic(
  () => import("@/components/lightswind/smooth-cursor").then((m) => m.SmoothCursor),
  { ssr: false }
);
const SparkleCursor = dynamic(
  () => import("@/components/lightswind/sparkle-cursor").then((m) => m.SparkleCursor),
  { ssr: false }
);
const ParticleOrbitCursor = dynamic(
  () => import("@/components/lightswind/particle-orbit-cursor"),
  { ssr: false }
);
const FireworkCursor = dynamic(
  () => import("@/components/lightswind/firework-cursor").then((m) => m.FireworkCursor),
  { ssr: false }
);

/**
 * Renders whichever cursor the visitor selected, with their saved options.
 *
 * Gated on a fine pointer: on touch there is no cursor to replace, and the
 * smooth cursor sets `body { cursor: none }`, which would hide nothing while
 * still costing a listener on every move.
 */
export default function CursorLayer() {
  const { settings } = useCursorSettings();
  const reduced = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);

  // The orbit component takes its hue range as a tuple. A fresh array each
  // render would restart its animation loop on every unrelated re-render.
  const { hueStart, hueEnd } = settings.orbit;
  const colorRange = useMemo<[number, number]>(
    () => [hueStart, hueEnd],
    [hueStart, hueEnd]
  );

  // Same reasoning for the firework's accent palette.
  const { accentA, accentB } = settings.firework;
  const fireworkColors = useMemo(() => [accentA, accentB], [accentA, accentB]);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (!finePointer || reduced || settings.kind === "none") return null;

  if (settings.kind === "firework") {
    const firework = settings.firework;
    return (
      <FireworkCursor
        density={firework.density}
        size={firework.size}
        lifetime={firework.lifetime}
        bloomStrength={firework.bloomStrength}
        color={firework.color}
        colors={fireworkColors}
        // The component is built to fill whatever frame it sits in, and ships
        // with a "HOVER AROUND" demo label. As a site-wide cursor it needs the
        // whole viewport and no label.
        label={false}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 55,
        }}
      />
    );
  }

  if (settings.kind === "orbit") {
    const orbit = settings.orbit;
    return (
      <ParticleOrbitCursor
        disabled={!orbit.enabled}
        particleCount={orbit.particleCount}
        radius={orbit.radius}
        particleSpeed={orbit.particleSpeed}
        particleSize={orbit.particleSize}
        intensity={orbit.intensity}
        fadeOpacity={orbit.fadeOpacity}
        radiusScale={orbit.radiusScale}
        colorRange={colorRange}
        followMouse={orbit.followMouse}
        autoColors={orbit.autoColors}
      />
    );
  }

  if (settings.kind === "sparkle") {
    return (
      <SparkleCursor
        distance={settings.sparkle.distance}
        glow={settings.sparkle.glow}
      />
    );
  }

  return (
    <SmoothCursor
      size={settings.smooth.size}
      rotateOnMove={settings.smooth.rotateOnMove}
      scaleOnClick={settings.smooth.scaleOnClick}
      glowEffect={settings.smooth.glowEffect}
      showTrail={settings.smooth.showTrail}
      trailLength={settings.smooth.trailLength}
      magneticDistance={settings.smooth.magneticDistance}
    />
  );
}

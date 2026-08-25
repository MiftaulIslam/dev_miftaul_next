"use client";

import { useSyncExternalStore } from "react";

export type CursorKind = "smooth" | "sparkle" | "orbit" | "firework" | "none";

export interface SmoothCursorConfig {
  size: number;
  rotateOnMove: boolean;
  scaleOnClick: boolean;
  glowEffect: boolean;
  showTrail: boolean;
  trailLength: number;
  magneticDistance: number;
}

export interface SparkleCursorConfig {
  /** Pixels of travel between sparkles — lower is denser. */
  distance: number;
  glow: boolean;
}

export interface OrbitCursorConfig {
  // Basic
  particleCount: number;
  radius: number;
  particleSpeed: number;
  particleSize: number;
  // Appearance
  intensity: number;
  fadeOpacity: number;
  radiusScale: number;
  hueStart: number;
  hueEnd: number;
  // Behavior
  enabled: boolean;
  followMouse: boolean;
  autoColors: boolean;
}

export interface FireworkCursorConfig {
  /** ×1000 particles. Past ~100k the field reads as fog, not a trail. */
  density: number;
  size: number;
  /** Feeds the library's decay curve — higher lives longer. */
  lifetime: number;
  bloomStrength: number;
  color: string;
  accentA: string;
  accentB: string;
}

export interface CursorSettings {
  kind: CursorKind;
  smooth: SmoothCursorConfig;
  sparkle: SparkleCursorConfig;
  orbit: OrbitCursorConfig;
  firework: FireworkCursorConfig;
}

export const CURSOR_OPTIONS: { value: CursorKind; label: string }[] = [
  { value: "smooth", label: "Smooth" },
  { value: "sparkle", label: "Sparkle" },
  { value: "orbit", label: "Orbit" },
  { value: "firework", label: "Firework" },
  { value: "none", label: "System" },
];

export const CURSOR_STORAGE_KEY = "portfolio-cursor";

/** Mirrors the component defaults in `components/lightswind/*-cursor.tsx`. */
const DEFAULTS: CursorSettings = {
  kind: "smooth",
  smooth: {
    size: 22,
    rotateOnMove: true,
    scaleOnClick: true,
    glowEffect: false,
    showTrail: false,
    trailLength: 5,
    magneticDistance: 50,
  },
  sparkle: {
    distance: 50,
    glow: true,
  },
  orbit: {
    particleCount: 25,
    radius: 70,
    particleSpeed: 0.025,
    particleSize: 3,
    intensity: 1,
    fadeOpacity: 0.05,
    radiusScale: 1.5,
    hueStart: 0,
    hueEnd: 360,
    enabled: true,
    followMouse: true,
    autoColors: true,
  },
  firework: {
    density: 60,
    size: 1,
    lifetime: 2,
    bloomStrength: 50,
    color: "#ff0033",
    accentA: "#00ff88",
    accentB: "#3366ff",
  },
};

/**
 * Named starting points for the orbit cursor. Each is a full config, so
 * applying one is a single write rather than a dozen slider nudges.
 */
export const ORBIT_PRESETS: {
  id: string;
  label: string;
  description: string;
  config: OrbitCursorConfig;
}[] = [
  {
    id: "default",
    label: "Default",
    description: "Balanced rainbow",
    config: DEFAULTS.orbit,
  },
  {
    id: "energetic",
    label: "Energetic",
    description: "Fast warm colors",
    config: {
      ...DEFAULTS.orbit,
      particleCount: 40,
      radius: 90,
      particleSpeed: 0.06,
      particleSize: 4,
      intensity: 1.4,
      fadeOpacity: 0.08,
      radiusScale: 2,
      hueStart: 0,
      hueEnd: 60,
    },
  },
  {
    id: "subtle",
    label: "Subtle",
    description: "Calm and minimal",
    config: {
      ...DEFAULTS.orbit,
      particleCount: 12,
      radius: 50,
      particleSpeed: 0.015,
      particleSize: 2,
      intensity: 0.6,
      fadeOpacity: 0.03,
      radiusScale: 1.2,
      hueStart: 200,
      hueEnd: 260,
      autoColors: false,
    },
  },
  {
    id: "cosmic",
    label: "Cosmic",
    description: "Space-like effect",
    config: {
      ...DEFAULTS.orbit,
      particleCount: 60,
      radius: 120,
      particleSpeed: 0.02,
      particleSize: 2,
      intensity: 1.1,
      fadeOpacity: 0.04,
      radiusScale: 2.5,
      hueStart: 240,
      hueEnd: 320,
    },
  },
];

/**
 * Module-level cache. `useSyncExternalStore` needs `getSnapshot` to be
 * referentially stable between changes, so the settings object is read from
 * storage once and then replaced wholesale on every update.
 */
let current: CursorSettings | null = null;

function read(): CursorSettings {
  if (current !== null) return current;
  try {
    const stored = localStorage.getItem(CURSOR_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as Partial<CursorSettings>) : null;
    // Merge per-group so a stored blob written by an older build (missing a
    // field added later) still yields a complete settings object.
    current = parsed
      ? {
          kind: parsed.kind ?? DEFAULTS.kind,
          smooth: { ...DEFAULTS.smooth, ...parsed.smooth },
          sparkle: { ...DEFAULTS.sparkle, ...parsed.sparkle },
          orbit: { ...DEFAULTS.orbit, ...parsed.orbit },
          firework: { ...DEFAULTS.firework, ...parsed.firework },
        }
      : DEFAULTS;
  } catch {
    current = DEFAULTS;
  }
  return current;
}

function getServerSnapshot(): CursorSettings {
  return DEFAULTS;
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function commit(next: CursorSettings) {
  current = next;
  try {
    localStorage.setItem(CURSOR_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode) — the choice still holds this session.
  }
  listeners.forEach((listener) => listener());
}

export function setCursorKind(kind: CursorKind) {
  const settings = read();
  if (settings.kind === kind) return;
  commit({ ...settings, kind });
}

export function setSmoothConfig(patch: Partial<SmoothCursorConfig>) {
  const settings = read();
  commit({ ...settings, smooth: { ...settings.smooth, ...patch } });
}

export function setSparkleConfig(patch: Partial<SparkleCursorConfig>) {
  const settings = read();
  commit({ ...settings, sparkle: { ...settings.sparkle, ...patch } });
}

export function setOrbitConfig(patch: Partial<OrbitCursorConfig>) {
  const settings = read();
  commit({ ...settings, orbit: { ...settings.orbit, ...patch } });
}

export function setFireworkConfig(patch: Partial<FireworkCursorConfig>) {
  const settings = read();
  commit({ ...settings, firework: { ...settings.firework, ...patch } });
}

/** Restores one cursor's options without touching which cursor is selected. */
export function resetCursorConfig(kind: Exclude<CursorKind, "none">) {
  const settings = read();
  commit({ ...settings, [kind]: DEFAULTS[kind] });
}

export function useCursorSettings() {
  const settings = useSyncExternalStore(subscribe, read, getServerSnapshot);
  // The setters are module-level and already stable — no memoisation needed.
  return {
    settings,
    setKind: setCursorKind,
    setSmooth: setSmoothConfig,
    setSparkle: setSparkleConfig,
    setOrbit: setOrbitConfig,
    setFirework: setFireworkConfig,
    reset: resetCursorConfig,
  };
}

"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

import { useReducedMotion } from "@/lib/useReducedMotion";

export interface PointerField {
  /** Pointer position in element-local px, spring-smoothed. */
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** Offset from element centre, normalised to roughly -0.5..0.5, spring-smoothed. */
  normX: MotionValue<number>;
  normY: MotionValue<number>;
  /** 0 while the pointer is away, 1 while it is over the element. */
  presence: MotionValue<number>;
  /** False on touch/coarse-pointer devices and under reduced motion. */
  active: boolean;
}

const SPRING = { stiffness: 140, damping: 22, mass: 0.55, restDelta: 0.001 };
const PRESENCE_SPRING = { stiffness: 120, damping: 26, mass: 0.5 };

const FINE_POINTER = "(pointer: fine)";

function subscribeFinePointer(onChange: () => void) {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getFinePointer = () => window.matchMedia(FINE_POINTER).matches;
/** Assume no fine pointer on the server so the effects render nothing extra. */
const getFinePointerOnServer = () => false;

/**
 * Tracks the pointer over `ref` and publishes it as motion values.
 *
 * Adapted from the reference project's `lightswind/smooth-cursor`, which pairs
 * framer-motion springs with an rAF-throttled `mousemove` listener. The same
 * two ideas are kept — spring interpolation for the lag, rAF coalescing so a
 * burst of pointer events costs one write per frame — but the output stays in
 * motion values, so consumers animate on the compositor and React never
 * re-renders while the pointer moves.
 *
 * Gated on `(pointer: fine)`: touch devices get `active: false` and consumers
 * fall back to their static presentation.
 */
export function usePointerField(ref: RefObject<HTMLElement | null>): PointerField {
  const reduced = useReducedMotion();
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointer,
    getFinePointerOnServer,
  );
  const active = finePointer && !reduced;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawNormX = useMotionValue(0);
  const rawNormY = useMotionValue(0);
  const rawPresence = useMotionValue(0);

  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);
  const normX = useSpring(rawNormX, SPRING);
  const normY = useSpring(rawNormY, SPRING);
  const presence = useSpring(rawPresence, PRESENCE_SPRING);

  const frameRef = useRef(0);
  const pendingRef = useRef<{ clientX: number; clientY: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !active) return;

    // Cached so pointermove never reads layout (which would thrash on scroll).
    let rect = element.getBoundingClientRect();
    const measure = () => {
      rect = element.getBoundingClientRect();
    };

    const flush = () => {
      frameRef.current = 0;
      const pending = pendingRef.current;
      if (!pending) return;

      const localX = pending.clientX - rect.left;
      const localY = pending.clientY - rect.top;

      rawX.set(localX);
      rawY.set(localY);
      rawNormX.set(rect.width ? localX / rect.width - 0.5 : 0);
      rawNormY.set(rect.height ? localY / rect.height - 0.5 : 0);
      rawPresence.set(1);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pendingRef.current = { clientX: event.clientX, clientY: event.clientY };
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(flush);
    };

    const onPointerLeave = () => {
      rawPresence.set(0);
      rawNormX.set(0);
      rawNormY.set(0);
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    element.addEventListener("pointerleave", onPointerLeave);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      element.removeEventListener("pointerleave", onPointerLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      pendingRef.current = null;
    };
  }, [ref, active, rawX, rawY, rawNormX, rawNormY, rawPresence]);

  return { x, y, normX, normY, presence, active };
}

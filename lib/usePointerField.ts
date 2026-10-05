"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore, type RefObject } from "react";
import gsap from "gsap";

import { useReducedMotion } from "@/lib/useReducedMotion";

/** The smoothed pointer, in the tracked element's own space. */
export interface PointerState {
  /** Pointer position in element-local px. */
  x: number;
  y: number;
  /** Offset from element centre, normalised to roughly -0.5..0.5. */
  normX: number;
  normY: number;
  /** 0 while the pointer is away, 1 while it is over the element. */
  presence: number;
}

export interface PointerField {
  /** False on touch/coarse-pointer devices and under reduced motion. */
  active: boolean;
  /**
   * Calls `listener` with the smoothed state on every frame it changes (and
   * once immediately), returning the unsubscribe. Consumers write styles
   * straight to their nodes, so pointer movement never re-renders React.
   */
  subscribe: (listener: (state: PointerState) => void) => () => void;
}

/**
 * The follow curve. The springs this replaced were overdamped — they settled
 * in about half a second with no overshoot — and power3.out over the same
 * span reads the same, without shipping a spring engine.
 */
const FOLLOW = { duration: 0.55, ease: "power3.out" };
const PRESENCE = { duration: 0.6, ease: "power2.out" };

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
 * Tracks the pointer over `ref` and publishes it, smoothed, to subscribers.
 *
 * Two ideas carried over from the reference `lightswind/smooth-cursor`:
 * interpolation for the lag, and rAF coalescing so a burst of pointer events
 * costs one write per frame. The smoothing runs on GSAP (already on the page)
 * rather than framer-motion springs, and everything is published from one
 * ticker callback, so all consumers update together once per frame.
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

  const stateRef = useRef<PointerState>({ x: 0, y: 0, normX: 0, normY: 0, presence: 0 });
  const listenersRef = useRef(new Set<(state: PointerState) => void>());

  useEffect(() => {
    const element = ref.current;
    if (!element || !active) return;

    const state = stateRef.current;
    const listeners = listenersRef.current;

    // One publish per tick, after GSAP has advanced every channel.
    let dirty = false;
    const markDirty = () => {
      dirty = true;
    };
    const publish = () => {
      if (!dirty) return;
      dirty = false;
      listeners.forEach((listener) => listener(state));
    };
    gsap.ticker.add(publish);

    const toX = gsap.quickTo(state, "x", { ...FOLLOW, onUpdate: markDirty });
    const toY = gsap.quickTo(state, "y", { ...FOLLOW, onUpdate: markDirty });
    const toNormX = gsap.quickTo(state, "normX", { ...FOLLOW, onUpdate: markDirty });
    const toNormY = gsap.quickTo(state, "normY", { ...FOLLOW, onUpdate: markDirty });
    const toPresence = gsap.quickTo(state, "presence", { ...PRESENCE, onUpdate: markDirty });

    // Measured lazily: scrolling only marks the rect stale, and it is re-read
    // on the next pointer frame. The old listener read layout on every scroll
    // event, i.e. once per frame for the whole time the page scrolled.
    let rect = element.getBoundingClientRect();
    let stale = false;
    const markStale = () => {
      stale = true;
    };

    let frame = 0;
    let pending: { clientX: number; clientY: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      if (stale) {
        rect = element.getBoundingClientRect();
        stale = false;
      }

      const localX = pending.clientX - rect.left;
      const localY = pending.clientY - rect.top;

      toX(localX);
      toY(localY);
      toNormX(rect.width ? localX / rect.width - 0.5 : 0);
      toNormY(rect.height ? localY / rect.height - 0.5 : 0);
      toPresence(1);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pending = { clientX: event.clientX, clientY: event.clientY };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const onPointerLeave = () => {
      toPresence(0);
      toNormX(0);
      toNormY(0);
    };

    const resizeObserver = new ResizeObserver(markStale);
    resizeObserver.observe(element);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", markStale, { passive: true });
    window.addEventListener("resize", markStale);
    element.addEventListener("pointerleave", onPointerLeave);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", markStale);
      window.removeEventListener("resize", markStale);
      element.removeEventListener("pointerleave", onPointerLeave);
      if (frame) cancelAnimationFrame(frame);
      gsap.ticker.remove(publish);
      gsap.killTweensOf(state);
    };
  }, [ref, active]);

  return useMemo(
    () => ({
      active,
      subscribe: (listener: (state: PointerState) => void) => {
        listenersRef.current.add(listener);
        listener(stateRef.current);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
    }),
    [active],
  );
}

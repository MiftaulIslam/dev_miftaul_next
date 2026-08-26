"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface ReelProgressOptions {
  railRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLElement | null>;
  viewportRef: RefObject<HTMLElement | null>;
  total: number;
  reduced: boolean;
  enabled: boolean;
  onProgress: (self: ScrollTrigger) => void;
}

export interface ReelProgressHandle {
  jump: (index: number) => void;
  refresh: () => void;
}

/**
 * One ScrollTrigger for the whole reel: a single x-tween on the track,
 * scrub-linked to the over-tall rail. Progress and the derived scene index
 * leave via the onProgress callback — never via state.
 */
export function useReelProgress(opts: ReelProgressOptions): void {
  const { railRef, trackRef, viewportRef, total, reduced, enabled, onProgress } = opts;

  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!enabled || !rail || !track || !viewport || total < 2) return;

    const tween = gsap.to(track, {
      x: () => -(track.scrollWidth - viewport.clientWidth),
      ease: "none",
      scrollTrigger: {
        trigger: rail,
        start: "top top",
        end: "bottom bottom",
        scrub: reduced ? true : 0.85,
        invalidateOnRefresh: true,
        onUpdate: onProgress,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(track, { clearProps: "x" });
    };
    // onProgress is stable via a ref at the call site; total/enabled/reduced drive re-creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [railRef, trackRef, viewportRef, total, reduced, enabled]);
}

/** Scroll the window so scene `index` centres in the reel. */
export function jumpToScene(
  railRef: RefObject<HTMLElement | null>,
  total: number,
  index: number,
  reduced: boolean
): void {
  const rail = railRef.current;
  if (!rail) return;
  const st = ScrollTrigger.getAll().find((t) => t.trigger === rail);
  const max = Math.max(1, total - 1);
  const frac = index / max;
  const y = st ? st.start + frac * (st.end - st.start) : rail.offsetTop + frac * (rail.offsetHeight - window.innerHeight);

  // Through the smoother when one is running. With `normalizeScroll` the
  // smoother owns the scroll position, and a native smooth-scroll fights it:
  // the two ease the same value on different clocks, so the jump either lands
  // short or snaps back.
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(y, !reduced);
  } else {
    window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  }
}

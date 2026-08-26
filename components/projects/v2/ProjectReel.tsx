"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import CaseSheet from "@/components/projects/v2/CaseSheet";
import ReelPlates from "@/components/projects/v2/ReelPlates";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { ReelProject } from "@/types/projects";

gsap.registerPlugin(ScrollTrigger);

/**
 * The reel.
 *
 * Owns two pieces of state — the current index and whether the case sheet is
 * open — and nothing else. Everything that changes per frame (drag origin,
 * current dx, pointer velocity, the last-step timestamp, which plate layer is
 * front) lives in a ref, because a continuous value in useState re-renders the
 * whole tree at 60fps and collapses on a mid-range phone.
 *
 * SCROLL MODEL
 * The original concept was a route-level viewport takeover with the wheel
 * repurposed as a stepper. Here the reel is a section in a scrolling page, so it
 * cannot swallow the wheel forever — the reader has to be able to leave. Instead
 * an over-tall rail (`total × 100vh`) pins the stage and ScrollTrigger snaps to
 * one stop per project. Wheel, drag, arrows, index rows and the two steppers all
 * resolve to the same scroll position, so there is never a moment where two
 * inputs disagree about which way you just moved, and the page continues past
 * the last project with nothing hijacked.
 *
 * `snapTo` clamps to ±1 step from wherever the gesture started, which is what
 * makes one trackpad flick advance exactly one project even under
 * ScrollSmoother's momentum. A programmatic jump instead points that origin at
 * its own destination for the length of the scroll (`jumpUntilRef`), so an index
 * row can still move 01 → 05 in one go without the clamp dragging it back.
 */

const MOVE_THRESHOLD_FINE = 6;
const MOVE_THRESHOLD_COARSE = 9;
const DRAG_FOLLOW = 0.42;
const RELEASE_DISTANCE = 0.22;
const RELEASE_VELOCITY = 620;
const SPRING_BACK_MS = 420;
const REEL_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface ProjectReelProps {
  projects: ReelProject[];
  /** Opens on this project with the case sheet already up (/work/[slug]). */
  initialSlug?: string;
  /** /work/[slug] owns the URL itself; the section syncs via replaceState. */
  syncUrl?: boolean;
}

export default function ProjectReel({ projects, initialSlug, syncUrl = false }: ProjectReelProps) {
  const total = projects.length;
  const reduced = useReducedMotion();

  const initialIndex = useMemo(() => {
    if (!initialSlug) return 0;
    const found = projects.findIndex((project) => project.id === initialSlug);
    return found < 0 ? 0 : found;
  }, [initialSlug, projects]);

  // Index and step direction move together in one state object. Direction was a
  // ref, but a ref read during render is not reactive — under concurrent
  // rendering the plate could hand off using the previous step's sign. Deriving
  // it inside the same updater that sets the index makes the pair impossible to
  // desync, and costs nothing: it changes once per step, not once per frame.
  const [view, setView] = useState<{ index: number; direction: 1 | -1 }>({
    index: initialIndex,
    direction: 1,
  });
  const index = view.index;
  const [caseOpen, setCaseOpen] = useState(Boolean(initialSlug));

  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragLayerRef = useRef<HTMLDivElement>(null);
  const caseButtonRef = useRef<HTMLButtonElement>(null);

  const indexRef = useRef(initialIndex);
  const stRef = useRef<ScrollTrigger | null>(null);
  /**
   * The index the snap clamp measures from. For a reader-driven scroll it is
   * where the gesture began; for a programmatic jump it is the destination.
   * Never a nullable "pending" flag — a flag that has to be cleared by a
   * callback can wedge if that callback does not fire, and a wedged flag pins
   * the whole reel to one project.
   */
  const gestureStartRef = useRef(initialIndex);
  /** While `now` is under this, a jump is in flight and owns the snap target. */
  const jumpUntilRef = useRef(0);

  const dragRef = useRef({
    id: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    dx: 0,
    active: false,
    decided: false,
  });

  const project = projects[clamp(index, 0, total - 1)];

  /** Single writer for the index. Direction is derived here, never stored twice. */
  const applyIndex = useCallback(
    (next: number) => {
      const clamped = clamp(next, 0, total - 1);
      if (indexRef.current === clamped) return;
      const direction: 1 | -1 = clamped > indexRef.current ? 1 : -1;
      indexRef.current = clamped;
      setView({ index: clamped, direction });
    },
    [total],
  );

  /* ── Pinned rail + snap ─────────────────────────────────────────────────── */
  useEffect(() => {
    const rail = railRef.current;
    const stage = stageRef.current;
    if (!rail || !stage || total < 2) return;

    const step = 1 / (total - 1);

    const trigger = ScrollTrigger.create({
      trigger: rail,
      start: "top top",
      end: "bottom bottom",
      pin: stage,
      pinSpacing: false,
      invalidateOnRefresh: true,
      // No snap under reduced motion: nothing should move on its own. The index
      // still resolves discretely from progress, so the frames stay composed.
      snap: reduced
        ? undefined
        : {
            snapTo: (value) => {
              const from = gestureStartRef.current;
              // A jump in flight owns its destination outright, so an index row
              // can move 01 → 05 in one move instead of being clamped to ±1.
              if (performance.now() < jumpUntilRef.current) {
                return clamp(from, 0, total - 1) * step;
              }
              // Otherwise land within one step of where this gesture began.
              // Without the clamp, one hard trackpad flick rides ScrollSmoother's
              // momentum straight past two or three projects.
              const nearest = Math.round(value / step);
              return clamp(nearest, from - 1, from + 1) * step;
            },
            duration: { min: 0.18, max: 0.52 },
            delay: 0.02,
            ease: "power2.inOut",
          },
      onUpdate: (self) => applyIndex(Math.round(self.progress * (total - 1))),
    });
    stRef.current = trigger;

    const onScrollStart = () => {
      // A programmatic jump sets its own origin; the scroll it triggers must not
      // immediately overwrite it with the index it is leaving.
      if (performance.now() < jumpUntilRef.current) return;
      gestureStartRef.current = indexRef.current;
    };
    ScrollTrigger.addEventListener("scrollStart", onScrollStart);

    return () => {
      ScrollTrigger.removeEventListener("scrollStart", onScrollStart);
      trigger.kill();
      stRef.current = null;
    };
  }, [applyIndex, reduced, total]);

  /** Scrolls the page so `target` becomes the current step. */
  const goTo = useCallback(
    (target: number) => {
      const next = clamp(target, 0, total - 1);
      if (next === indexRef.current) return;

      const trigger = stRef.current;
      if (!trigger) {
        applyIndex(next);
        return;
      }

      // Point the snap clamp at the destination and hold it there for the length
      // of the scroll. Because this is a deadline rather than a flag, an
      // interrupted jump degrades to "the clamp is centred on the destination",
      // which is harmless — it can never wedge the reel.
      gestureStartRef.current = next;
      jumpUntilRef.current = performance.now() + (reduced ? 240 : 1600);

      // A snap tween from the reader's last wheel flick may still be animating
      // the scroll position. Two tweens on the same property fight, and which
      // one wins is a race — so the previous one is killed before this jump
      // starts. Without this, a stepper pressed just after a flick lands back
      // on the project the flick was already heading to.
      // getTween's return shape varies across GSAP builds, so this is duck-typed
      // rather than assumed — an exception here would abort the jump entirely.
      const snapTween = trigger.getTween?.(true) as { kill?: () => void } | undefined;
      if (typeof snapTween?.kill === "function") snapTween.kill();

      const y = trigger.start + (next / (total - 1)) * (trigger.end - trigger.start);
      const smoother = ScrollSmoother.get();
      if (smoother) {
        // Hard-set the scroll position rather than tweening to it. ScrollSmoother
        // already eases its content toward the native position, so this still
        // reads as a smooth move — and unlike a tween it cannot be silently
        // cancelled by the momentum left over from the reader's last wheel
        // flick, which is what made a stepper pressed right after a flick do
        // nothing at all.
        smoother.scrollTop(y);
      } else {
        window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
      }
    },
    [applyIndex, reduced, total],
  );

  const stepBy = useCallback((delta: number) => goTo(indexRef.current + delta), [goTo]);

  /* ── Drag ───────────────────────────────────────────────────────────────── */
  const setDragOffset = useCallback((dx: number, animate: boolean) => {
    const node = dragLayerRef.current;
    if (!node) return;
    node.style.transition = animate ? `transform ${SPRING_BACK_MS}ms ${REEL_EASE}` : "none";
    node.style.transform = `translate3d(${dx.toFixed(2)}px, 0, 0)`;
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    // The gesture belongs to the plate only. Without this, a press anywhere in
    // the stage — an index row, a stepper, the prose — is treated as a plate
    // click and opens the case sheet on release, so choosing a project from the
    // rail also threw the write-up over the top of it.
    const target = event.target as HTMLElement | null;
    if (!target?.closest(".wreel-plates")) {
      dragRef.current.id = -1;
      return;
    }

    const drag = dragRef.current;
    drag.id = event.pointerId;
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.lastX = event.clientX;
    drag.lastT = event.timeStamp;
    drag.velocity = 0;
    drag.dx = 0;
    drag.active = false;
    drag.decided = false;
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (drag.id !== event.pointerId) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const threshold = event.pointerType === "mouse" ? MOVE_THRESHOLD_FINE : MOVE_THRESHOLD_COARSE;

      if (!drag.decided) {
        if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
        drag.decided = true;
        // A mostly-vertical gesture belongs to the page, not the reel. Bailing
        // here is what keeps the section scrollable on touch.
        if (Math.abs(dy) > Math.abs(dx)) {
          drag.id = -1;
          return;
        }
        drag.active = true;
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      }

      if (!drag.active) return;

      const dt = event.timeStamp - drag.lastT;
      if (dt > 0) drag.velocity = ((event.clientX - drag.lastX) / dt) * 1000;
      drag.lastX = event.clientX;
      drag.lastT = event.timeStamp;
      drag.dx = dx;

      if (!reduced) setDragOffset(dx * DRAG_FOLLOW, false);
    },
    [reduced, setDragOffset],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (drag.id !== event.pointerId) return;
      const wasActive = drag.active;
      const { dx, velocity } = drag;

      if ((event.currentTarget as HTMLElement).hasPointerCapture?.(event.pointerId)) {
        (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
      }
      drag.id = -1;
      drag.active = false;

      // Below the movement threshold this was a click, not a drag.
      if (!wasActive) {
        if (!drag.decided) setCaseOpen(true);
        return;
      }

      setDragOffset(0, !reduced);

      const far = Math.abs(dx) > window.innerWidth * RELEASE_DISTANCE;
      const fast = Math.abs(velocity) > RELEASE_VELOCITY;
      if (far || fast) stepBy(dx < 0 ? 1 : -1);
    },
    [reduced, setDragOffset, stepBy],
  );

  const onPointerCancel = useCallback(() => {
    const drag = dragRef.current;
    drag.id = -1;
    drag.active = false;
    setDragOffset(0, !reduced);
  }, [reduced, setDragOffset]);

  /* ── Keyboard ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (caseOpen) return;
      const target = event.target as HTMLElement | null;
      // Let real controls keep their own Enter/Space semantics.
      const onControl = target?.closest("a, button, [role='button']");

      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          stepBy(1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          stepBy(-1);
          break;
        case "Home":
          event.preventDefault();
          goTo(0);
          break;
        case "End":
          event.preventDefault();
          goTo(total - 1);
          break;
        case "Enter":
        case " ":
          if (onControl) return;
          event.preventDefault();
          setCaseOpen(true);
          break;
        default:
      }
    };

    stage.addEventListener("keydown", onKeyDown);
    return () => stage.removeEventListener("keydown", onKeyDown);
  }, [caseOpen, goTo, stepBy, total]);

  /* ── URL sync ───────────────────────────────────────────────────────────── */
  /**
   * The hash follows the reader, and only the reader.
   *
   * Writing it whenever `project.id` changed stamped `#project-<first>` onto the
   * homepage the instant the section mounted — before anyone had scrolled to it
   * or even seen it. That is wrong on its own (the URL claimed a position the
   * reader was nowhere near), and it broke the next load outright: the browser
   * scrolls to the fragment, so opening `/` dropped you straight into the reel.
   *
   * Guarding on "have we run before" is not enough, because the id can change
   * without the reader touching anything — the section renders the static list
   * first and swaps in the API's list a moment later, and in development
   * StrictMode replays the effect once more on top of that. The reel's *index*
   * is the honest signal: it only moves through the pinned rail, the steppers or
   * the index rows, all of which require the section to be on screen. So the
   * hash stays unwritten until the index actually moves, and tracks the project
   * from then on.
   */
  const readerMovedRef = useRef(false);
  const syncedIndexRef = useRef(index);
  useEffect(() => {
    if (!syncUrl || typeof window === "undefined") return;
    if (!readerMovedRef.current) {
      if (index === syncedIndexRef.current) return;
      readerMovedRef.current = true;
    }
    syncedIndexRef.current = index;

    const url = new URL(window.location.href);
    url.hash = `project-${project.id}`;
    window.history.replaceState(null, "", url);
  }, [index, project.id, syncUrl]);

  /* ── Nav wiring ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const onJump = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id && id !== "projects") return;
      setCaseOpen(false);
    };
    const onSettled = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id && id !== "projects") return;
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener("nav-section-jump", onJump as EventListener);
    window.addEventListener("nav-section-settled", onSettled as EventListener);
    return () => {
      window.removeEventListener("nav-section-jump", onJump as EventListener);
      window.removeEventListener("nav-section-settled", onSettled as EventListener);
    };
  }, []);

  if (!total || !project) return null;

  const atStart = index === 0;
  const atEnd = index === total - 1;

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="wreel"
      style={{ "--c-accent": project.accent, "--wreel-count": total } as CSSProperties}
      aria-label="Selected work"
    >
      <div className="wreel-rail" ref={railRef}>
        <div
          className="wreel-stage"
          ref={stageRef}
          tabIndex={-1}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <ReelPlates
            project={project}
            index={index}
            total={total}
            direction={view.direction}
            dragRef={dragLayerRef}
          />

          <div className="wreel-scrim" aria-hidden="true" />

          {/* The plate is decorative; this line is what a screen reader hears. */}
          <p className="wreel-sr" aria-live="polite">
            {`Project ${index + 1} of ${total}. ${project.name}, ${project.discipline}, ${project.year}.`}
          </p>

          <div className="wreel-body">
            {/* Keyed on the project so the rise and stagger replay each step. */}
            <div className="wreel-body-inner" key={project.id}>
              <p className="wreel-meta">
                <span>{project.role}</span>
                <span aria-hidden="true">·</span>
                <span>{project.discipline}</span>
                <span aria-hidden="true">·</span>
                <span>{project.year}</span>
              </p>

              <h2 className="wreel-name">
                <span className="wreel-name-line">
                  <span className="wreel-name-rise">{project.name}</span>
                </span>
              </h2>

              <p className="wreel-problem">{project.problem}</p>
              <p className="wreel-outcome">{project.outcome}</p>

              <ul className="wreel-tech">
                {project.tech.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </div>

            <div className="wreel-actions">
              <button
                ref={caseButtonRef}
                type="button"
                className="wreel-case-btn"
                onClick={() => setCaseOpen(true)}
              >
                Case notes
                <ArrowUpRight aria-hidden="true" />
              </button>

              <div className="wreel-steppers">
                {/*
                  aria-disabled rather than the disabled attribute: a disabled
                  button leaves the tab order, so reaching the first or last
                  project would silently move the reader's focus somewhere else.
                  These stay focusable and announce their state; `stepBy` clamps,
                  so the click is inert either way.
                */}
                <button
                  type="button"
                  className="wreel-step"
                  onClick={() => stepBy(-1)}
                  aria-disabled={atStart}
                  data-disabled={atStart}
                >
                  <ArrowLeft aria-hidden="true" />
                  <span className="wreel-sr">Previous project</span>
                </button>
                <button
                  type="button"
                  className="wreel-step"
                  onClick={() => stepBy(1)}
                  aria-disabled={atEnd}
                  data-disabled={atEnd}
                >
                  <ArrowRight aria-hidden="true" />
                  <span className="wreel-sr">Next project</span>
                </button>
                <p className="wreel-counter" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className="wreel-counter-sep">/</span>
                  <span>{String(total).padStart(2, "0")}</span>
                </p>
              </div>

              <Link className="wreel-more" href="/work" data-at-end={atEnd}>
                See all work
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/*
            One list of projects at every breakpoint. Below 768px it becomes
            visually hidden rather than display:none, so the six positions stay
            reachable by Tab on touch — the WCAG 2.2 single-pointer alternative
            to the drag gesture — without ever creating a second set of tab stops.
          */}
          <nav className="wreel-index" aria-label="Projects">
            <ol>
              {projects.map((entry, i) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className="wreel-index-row"
                    data-active={i === index}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => goTo(i)}
                  >
                    <span className="wreel-index-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="wreel-index-rule" aria-hidden="true" />
                    <span className="wreel-index-label">{entry.name}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          {/* A <p>, not a <figcaption>: the plate layers and this caption are
              siblings inside the stage (the mobile composition reorders them),
              and a figcaption outside a figure is invalid. */}
          <p className="wreel-fig">
            <span className="wreel-fig-num">Fig. {String(index + 1).padStart(2, "0")}</span>
            <span className="wreel-fig-text">{project.plate.caption}</span>
          </p>

          <CaseSheet
            project={project}
            open={caseOpen}
            onClose={() => setCaseOpen(false)}
            returnFocusRef={caseButtonRef}
          />
        </div>
      </div>
    </section>
  );
}

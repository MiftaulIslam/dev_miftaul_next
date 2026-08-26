"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import type { Experience as ExperienceRecord } from "@/components/experience-data";
import type { Role, Timeline } from "@/types/experience";
import { buildTimeline, concurrencySentence, sharedLabel } from "@/lib/experience/roles";
import { clamp01, damp, dur, label } from "@/lib/experience/timeline";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * The Overlap chart.
 *
 * STATE
 * `selectedRoleId` is the only value in useState, and it changes on intent —
 * a click, a key, a nav jump. (`timeline` changes once, if the API answers with
 * something other than the static set.) Everything continuous lives in a ref:
 * the scroll fraction, the override fraction, the rendered fraction, the last
 * narrated month, the last value written to each bar. A 0..1 value in useState
 * is sixty React renders a second and will collapse a mid-range phone.
 *
 * ONE SCALAR
 * There is exactly one "now" in this chart and scroll owns it. The stage is
 * pinned, so scrolling walks time forward while the page stays put and the bars
 * grow to meet it: the chart draws itself once, in the order the career
 * happened, and the pin releases as it completes. Scrolling back rewinds it.
 *
 * The pointer deliberately does NOT move this value. An earlier version let it
 * scrub, which meant the only way to see the last role was to drag the cursor
 * to the far right of the plot — the reveal became a thing you had to go and
 * find. Hover now does what hover should do and nothing more: it lights the
 * lane under the cursor. Clicking a lane still moves the marker to that role,
 * because that is intent, not a reveal. Arrow keys still scrub, because a
 * keyboard reader needs a way in that the scroll pin cannot give them.
 *
 * WHAT IS AND IS NOT SCROLL-DRIVEN
 * The bars are. The grid, the year rules and the concurrency bands are not:
 * they are written once at mount and never move, because a chart whose
 * reference marks move is a chart you cannot read.
 */

/** About 60ms to 63% of the way there. Weight without lag. */
const LAMBDA = 16;
/** Below this, a rewrite would not change a pixel. */
const EPSILON = 0.0015;
const MOBILE = 768;
/**
 * Where in the pin the last bar finishes arriving.
 *
 * The remaining 16% is a hold: the chart is complete and the reader gets a beat
 * to actually read it before the pin releases and the page moves on. Without
 * the hold, the final month and the release happen on the same scroll tick and
 * the composition is gone before it has been seen.
 */
const REVEAL_END = 0.84;

interface OverlapChartProps {
  /** Built at module scope so the served markup is complete without JS. */
  initial: Timeline;
}

export default function OverlapChart({ initial }: OverlapChartProps) {
  const reduced = useReducedMotion();
  const [timeline, setTimeline] = useState<Timeline>(initial);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  /**
   * The lane under the cursor (or under keyboard focus).
   *
   * State rather than a ref because it changes on intent, not per frame: a few
   * times a second as the pointer crosses lanes, never sixty. It drives the
   * popover and fills the detail panel as a preview; a click promotes that
   * preview into `selectedRoleId`, which outranks it and stays put.
   */
  const [previewRoleId, setPreviewRoleId] = useState<string | null>(null);

  const { roles, months, years, bands, domainStart, domainEnd } = timeline;

  const railRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const laneRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const monthNodeRef = useRef<HTMLSpanElement>(null);
  const rolesNodeRef = useRef<HTMLSpanElement>(null);
  const countNodeRef = useRef<HTMLSpanElement>(null);

  /* Continuous values. None of these may become state. */
  const scrollRef = useRef(0);
  const overrideRef = useRef<number | null>(null);
  const renderRef = useRef(0);
  const lastMonthRef = useRef(-1);
  const lastGrowRef = useRef<number[]>([]);
  const verticalRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0 });

  /* The latch outranks the hover. Once a role is pinned, moving the pointer
     across other lanes must not swap the panel out from under the reader —
     that is the entire promise of clicking. */
  const activeRoleId = selectedRoleId ?? previewRoleId;
  const activeRole = useMemo(
    () => roles.find((role) => role.id === activeRoleId) ?? null,
    [roles, activeRoleId]
  );
  const pinned = selectedRoleId !== null;

  const thesis = useMemo(() => concurrencySentence(timeline), [timeline]);

  /* ── Live data ──────────────────────────────────────────────────────────
     One fetch, one setState. The static set is already on screen, so a slow or
     absent API costs the reader nothing but freshness. */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/public/experience", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as ExperienceRecord[];
        if (!mounted || !Array.isArray(data) || !data.length) return;

        const next = buildTimeline(data);
        if (!next.roles.length) return;
        setTimeline(next);
        requestAnimationFrame(() => ScrollTrigger.refresh());
      } catch {
        // keep the static timeline
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  /* ── Geometry ───────────────────────────────────────────────────────────
     One ResizeObserver on the plot box drives both the orientation flip and the
     marker re-measure. No window resize listener, and no JavaScript at all in
     the bar geometry: those are percentages, so a resize costs nothing. */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const measure = () => {
      const rect = grid.getBoundingClientRect();
      sizeRef.current = { width: rect.width, height: rect.height };
      verticalRef.current = window.innerWidth < MOBILE;
      // Force the next frame to rewrite every bar in the new orientation.
      lastGrowRef.current = [];
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [roles.length]);

  /* ── Scroll driver ──────────────────────────────────────────────────────
     The stage is pinned for the surplus height of the rail, so the reader is
     held here while the roles arrive one after another, and the page continues
     the moment the chart is complete. Scroll is the only thing that reveals
     anything — the reader never has to find a bar with the cursor.

     `pinSpacing: false` because the rail already owns the space; letting
     ScrollTrigger add its own would double it and leave a blank screen below.
     Under reduced motion nothing arrives, so nothing is pinned either. */
  useEffect(() => {
    const rail = railRef.current;
    const stage = stageRef.current;
    if (!rail || !stage) return;

    const trigger = ScrollTrigger.create({
      trigger: rail,
      start: "top top",
      end: "bottom bottom",
      pin: reduced ? false : stage,
      pinSpacing: false,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // The pin runs a little past the end of the reveal. Rescaling here
        // rather than in the tick keeps the tick reading one plain 0..1 value.
        const next = clamp01(self.progress / REVEAL_END);

        // Scrolling reclaims the scalar from a key press or a lane click, so
        // the reader can always scroll time forward — but only when the
        // position genuinely moved. onUpdate also fires on refresh(), and a
        // refresh comes from the live-data fetch, from nav settle and from
        // every window resize, each of which would otherwise yank the marker
        // off the role the reader just clicked.
        if (Math.abs(next - scrollRef.current) > 1e-4) {
          overrideRef.current = null;
        }
        scrollRef.current = next;
      },
    });

    return () => trigger.kill();
  }, [roles.length, reduced]);

  /* ── The frame ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const chart = chartRef.current;
    const marker = markerRef.current;
    if (!chart || !roles.length) return;

    chart.classList.add("js");

    /** Text is rewritten only when the rounded month changes, not every frame. */
    const narrate = (month: number) => {
      if (month === lastMonthRef.current) return;
      lastMonthRef.current = month;

      const live: string[] = [];
      roles.forEach((role, index) => {
        const inside = month >= role.span.start && month <= role.span.end;
        const lane = laneRefs.current[index];
        lane?.classList.toggle("is-live", inside);
        if (inside) live.push(role.company);
      });

      if (monthNodeRef.current) monthNodeRef.current.textContent = label(month);
      if (rolesNodeRef.current) {
        rolesNodeRef.current.textContent = live.length ? live.join(" + ") : "Between roles";
      }
      if (countNodeRef.current) {
        countNodeRef.current.textContent = `${live.length} live`;
      }
    };

    /** Reduced motion: full-length bars on mount, and the marker jumps. */
    if (reduced) {
      roles.forEach((role, index) => {
        const lane = laneRefs.current[index];
        if (!lane) return;
        const fill = lane.querySelector<HTMLElement>(".xp-fill");
        if (fill) fill.style.transform = "none";
        lane.classList.add("is-begun");
      });
    }

    let last = -1;

    const tick = (_time: number, deltaMs: number) => {
      const target = overrideRef.current ?? scrollRef.current;
      const dt = Math.min(deltaMs, 64) / 1000;

      renderRef.current = reduced
        ? target
        : damp(renderRef.current, target, LAMBDA, dt);

      const f = clamp01(renderRef.current);
      if (Math.abs(f - last) < 0.00005 && lastGrowRef.current.length) return;
      last = f;

      const { width, height } = sizeRef.current;
      const vertical = verticalRef.current;

      // Write 1: the marker. Straight onto the element, never as a custom
      // property on the parent — that would restyle every bar in the subtree
      // to move one rule.
      if (marker) {
        marker.style.transform = vertical
          ? `translate3d(0, ${f * height}px, 0)`
          : `translate3d(${f * width}px, 0, 0)`;
      }

      // Writes 2..n: the bars, but only the ones whose length actually moved.
      // At any instant that is at most the one or two bars the marker is
      // currently inside, so this is a two-write frame in the steady state.
      for (let index = 0; index < roles.length; index += 1) {
        const role = roles[index];
        const lane = laneRefs.current[index];
        if (!lane) continue;

        const grow = clamp01((f - role.f0) / Math.max(role.f1 - role.f0, 1e-6));
        const previous = lastGrowRef.current[index];
        if (previous !== undefined && Math.abs(grow - previous) < EPSILON) continue;
        lastGrowRef.current[index] = grow;

        if (!reduced) {
          const fill = lane.querySelector<HTMLElement>(".xp-fill");
          if (fill) {
            fill.style.transform = vertical ? `scaleY(${grow})` : `scaleX(${grow})`;
          }
          lane.classList.toggle("is-begun", grow > 0);
        }
      }

      narrate(
        Math.min(domainEnd, domainStart + Math.min(months - 1, Math.floor(f * months)))
      );
    };

    /* Off-screen the chart has nothing to say, so it leaves the shared ticker
       entirely rather than damping a value nobody is looking at. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) gsap.ticker.add(tick);
        else gsap.ticker.remove(tick);
      },
      { threshold: 0 }
    );
    observer.observe(chart);

    return () => {
      observer.disconnect();
      gsap.ticker.remove(tick);
      chart.classList.remove("js");
    };
  }, [roles, months, domainStart, domainEnd, reduced]);

  /* ── Preview ────────────────────────────────────────────────────────────
     Delegated from the lane container so there is one listener rather than one
     per role. Focus counts as hover, so a keyboard reader tabbing through the
     lanes gets the same popover and the same panel a pointer would. */
  const handlePreviewOver = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const lane = (event.target as HTMLElement).closest<HTMLElement>(".xp-lane");
    setPreviewRoleId(lane?.dataset.role ?? null);
  }, []);

  const handlePreviewFocus = useCallback((event: ReactFocusEvent<HTMLDivElement>) => {
    const lane = (event.target as HTMLElement).closest<HTMLElement>(".xp-lane");
    setPreviewRoleId(lane?.dataset.role ?? null);
  }, []);

  const clearPreview = useCallback(() => setPreviewRoleId(null), []);

  /* ── Keyboard ───────────────────────────────────────────────────────────
     Complete parity with the pointer, which is what satisfies WCAG 2.2's
     dragging-movements rule without bolting on a separate affordance. */
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const step = (event.shiftKey ? 12 : 1) / months;
      const base = overrideRef.current ?? renderRef.current;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          overrideRef.current = clamp01(base - step);
          break;
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          overrideRef.current = clamp01(base + step);
          break;
        case "Home":
          event.preventDefault();
          overrideRef.current = 0;
          break;
        case "End":
          event.preventDefault();
          overrideRef.current = 1;
          break;
        case "Escape":
          if (selectedRoleId) {
            event.preventDefault();
            setSelectedRoleId(null);
          }
          break;
        default:
          break;
      }
    },
    [months, selectedRoleId]
  );

  /* ── Select ─────────────────────────────────────────────────────────────
     Opening a role also moves the marker to the middle of it, so the readout
     and the panel can never be describing two different moments. */
  const handleSelect = useCallback(
    (role: Role) => {
      // Deliberately not folded into a setState updater: moving the marker is a
      // side effect, and React calls updaters twice under StrictMode.
      if (selectedRoleId === role.id) {
        setSelectedRoleId(null);
        return;
      }
      overrideRef.current = clamp01((role.f0 + role.f1) / 2);
      setSelectedRoleId(role.id);
    },
    [selectedRoleId]
  );

  /* ── Nav wiring ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const jump = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id && id !== "experience") return;
      setSelectedRoleId(null);
      overrideRef.current = null;
    };
    const settled = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id && id !== "experience") return;
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    window.addEventListener("nav-section-jump", jump as EventListener);
    window.addEventListener("nav-section-settled", settled as EventListener);
    return () => {
      window.removeEventListener("nav-section-jump", jump as EventListener);
      window.removeEventListener("nav-section-settled", settled as EventListener);
    };
  }, []);

  if (!roles.length) return null;

  return (
    <div
      ref={railRef}
      className="xp-rail"
      data-reduced={reduced || undefined}
      style={{ "--xp-count": roles.length } as CSSProperties}
    >
      <div ref={stageRef} className="xp-stage">
        <header className="xp-head">
          <div>
            <p className="xp-eyebrow">Career</p>
            {/* States the thesis, not the data. The count below it is derived,
                so a heading that named a number would go stale the moment the
                dashboard gained a role. */}
            <h2 className="xp-title">Every role on one axis</h2>
          </div>
          <p className="xp-thesis">{thesis}</p>
        </header>

        <div
          ref={chartRef}
          className="xp-chart"
          onKeyDown={handleKeyDown}
          role="group"
          aria-label="Career timeline. Arrow keys scrub the marker; Home and End jump to the first month and to today."
        >
          <div className="xp-years" aria-hidden="true">
            {years.map((mark) => (
              <span
                key={mark.year}
                className="xp-year"
                style={{ "--f": mark.f } as CSSProperties}
              >
                {mark.year}
              </span>
            ))}
          </div>

          <div
            className="xp-plot">
            {/* Static layer: reference marks only, written once. */}
            <div ref={gridRef} className="xp-grid" aria-hidden="true">
              {bands.map((band) => (
                <span
                  key={`band-${band.start}`}
                  className="xp-band"
                  style={{ "--f0": band.f0, "--f1": band.f1 } as CSSProperties}
                />
              ))}
              {years
                .filter((mark) => mark.f > 0)
                .map((mark) => (
                  <span
                    key={`rule-${mark.year}`}
                    className="xp-rule"
                    style={{ "--f": mark.f } as CSSProperties}
                  />
                ))}
            </div>

            <div
              className="xp-lanes"
              onPointerOver={handlePreviewOver}
              onPointerLeave={clearPreview}
              onFocus={handlePreviewFocus}
              onBlur={clearPreview}
            >
              {roles.map((role, index) => (
                <button
                  key={role.id}
                  ref={(node) => {
                    laneRefs.current[index] = node;
                  }}
                  type="button"
                  className="xp-lane"
                  data-role={role.id}
                  aria-pressed={selectedRoleId === role.id}
                  aria-label={`${role.company}, ${role.title}, ${label(role.span.start)} to ${
                    role.span.ongoing ? "present" : label(role.span.end)
                  }, ${dur(role.span.start, role.span.end)}`}
                  onClick={() => handleSelect(role)}
                  style={
                    {
                      "--f0": role.f0,
                      "--f1": role.f1,
                      "--lane": index,
                      "--track": role.track,
                    } as CSSProperties
                  }
                >
                  <span className="xp-label">
                    <span className="xp-label-main">
                      <span className="xp-company">{role.company}</span>
                      <span className="xp-role">
                        {role.title}
                        {/* Mobile only. On the rotated axis the bar's own top
                            edge already states the start date against the year
                            rail, so the date line below is redundant there and
                            the duration has to move somewhere. */}
                        <span className="xp-role-dur">
                          {" · "}
                          {dur(role.span.start, role.span.end)}
                        </span>
                      </span>
                      <span className="xp-dates">
                        {label(role.span.start)} — {role.span.ongoing ? "Present" : label(role.span.end)}
                      </span>
                    </span>
                    <span className="xp-duration">{dur(role.span.start, role.span.end)}</span>
                  </span>
                  <span className="xp-track">
                    <span className="xp-fill" />
                    {/* Hidden from assistive tech on purpose: every fact in here
                        also appears in the detail panel below, which is reachable
                        without a pointer. A hover-only announcement would just be
                        the same role read twice. */}
                    <span className="xp-pop" aria-hidden="true">
                      <span className="xp-pop-key">
                        {role.type} · {role.rung}
                      </span>
                      <span className="xp-pop-fact">
                        <span>{sharedLabel(role)}</span>
                        {role.sharedMonths > 0 && (
                          <span className="xp-pop-months">{role.sharedMonths} mo</span>
                        )}
                      </span>
                      <span className="xp-pop-meta">{role.location}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div ref={markerRef} className="xp-marker" aria-hidden="true" />
          </div>
        </div>

        <div className="xp-foot">
          <p className="xp-readout" role="status" aria-live="polite">
            <span ref={monthNodeRef} className="xp-readout-month">
              {label(domainEnd)}
            </span>
            <span ref={rolesNodeRef} className="xp-readout-roles" />
            <span ref={countNodeRef} className="xp-readout-count" />
          </p>

          {activeRole ? (
            <RolePanel
              role={activeRole}
              pinned={pinned}
              onClose={() => setSelectedRoleId(null)}
            />
          ) : (
            <p className="xp-hint">Hover a bar to preview it · click to keep it open</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The dashboard stores emphasis inside description prose as `**double**` and
 * `***triple***` asterisks.
 *
 * Both collapse to one treatment here. Two levels of emphasis inside a
 * three-line list is more precision than the reader can use, and this section
 * is allowed exactly one hue — so emphasis is a step up the ink ramp rather
 * than a second colour with a glow behind it.
 */
function withEmphasis(text: string): ReactNode[] {
  // Built per call: a shared /g/ regex carries `lastIndex` between calls and
  // would silently skip the first match of every second string.
  const pattern = /\*\*\*([\s\S]+?)\*\*\*|\*\*([\s\S]+?)\*\*/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null = pattern.exec(text);

  while (match !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <strong key={match.index} className="xp-em">
        {match[1] ?? match[2]}
      </strong>
    );
    last = pattern.lastIndex;
    match = pattern.exec(text);
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * The panel answers what a bar cannot: what the job actually was, the things
 * that shipped, and the rung. Shipped items carry the month they shipped in
 * tabular mono, which makes the panel a second, finer timeline inside the
 * first one — where the record carries a date to print.
 */
function RolePanel({
  role,
  pinned,
  onClose,
}: {
  role: Role;
  /** False while this is only a hover preview; true once a click latched it. */
  pinned: boolean;
  onClose: () => void;
}) {
  return (
    <div className="xp-panel" data-pinned={pinned || undefined}>
      {/* A preview cannot be closed — moving the pointer already closes it — so
          the corner carries the instruction instead of a dead control. */}
      {pinned ? (
        <button type="button" className="xp-panel-close" onClick={onClose}>
          Pinned · Close
        </button>
      ) : (
        <span className="xp-panel-close" aria-hidden="true">
          Click to pin
        </span>
      )}

      <div>
        <div className="xp-panel-head">
          <span className="xp-panel-company">{role.company}</span>
          <span className="xp-panel-shared">
            {role.sharedWith.length
              ? `Overlapped ${role.sharedWith.join(" + ")} · ${role.sharedMonths} mo`
              : "No overlap"}
          </span>
        </div>
        <p className="xp-panel-summary">{withEmphasis(role.summary)}</p>
      </div>

      <div>
        <span className="xp-panel-key">Shipped</span>
        <ul className="xp-shipped">
          {role.milestones.slice(0, 3).map((milestone) => (
            <li key={milestone.text}>
              <span className="xp-shipped-month" data-undated={milestone.month === null}>
                {milestone.month === null ? "——" : label(milestone.month)}
              </span>
              <span>{withEmphasis(milestone.text)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <span className="xp-panel-key">Stack</span>
        <div className="xp-tech">
          {role.tech.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
        <div className="xp-meta" style={{ marginTop: "0.75rem" }}>
          <span>{role.location}</span>
          <span>
            {role.type} · {role.rung}
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Shared state for the site's navigation chrome.
 *
 * The navbar owns the scroll listener and the section spy; the dock needs the
 * same facts. Publishing them here means one listener and one set of triggers
 * for the page rather than a duplicate set per consumer — and the two can never
 * disagree about which section is active.
 */
export interface NavShellState {
  /** The navbar has parked itself off-screen (scrolling down, past the fold). */
  hidden: boolean;
  /** Past the point where the navbar tightens into its compact pill. */
  scrolled: boolean;
  activeSection: string;
  /**
   * Bumped by the page whenever it swaps the mounted section tree (v1 ↔ v2).
   *
   * The section spy binds to real DOM nodes. When the page remounts a different
   * set of sections the old nodes are detached, and a spy still pointing at them
   * measures garbage — which is exactly how the active state used to freeze
   * after a version switch. Treating the swap as an explicit, observable event
   * is what lets the spy rebind instead of silently going stale.
   */
  sectionsRevision: number;
}

let state: NavShellState = {
  hidden: false,
  scrolled: false,
  activeSection: "hero",
  sectionsRevision: 0,
};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): NavShellState {
  return state;
}

function commit(patch: Partial<NavShellState>) {
  // Bail on no-op writes: this is fed from a gsap ticker running every frame.
  const changed = (Object.keys(patch) as (keyof NavShellState)[]).some(
    (key) => state[key] !== patch[key]
  );
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function setNavShell(patch: Partial<NavShellState>) {
  commit(patch);
}

export function useNavShell() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Announces that the page has (re)mounted its section tree.
 *
 * Called by the page, consumed by the section spy. See `sectionsRevision`.
 */
export function markSectionsMounted() {
  commit({ sectionsRevision: state.sectionsRevision + 1 });
}

/**
 * Whether the bottom dock is on screen.
 *
 * Lives here rather than inside the dock because other fixed-position chrome
 * (the settings dial) has to move out of its way — and a second copy of this
 * rule would drift out of sync the moment either half changed.
 */
export function useDockVisible() {
  const { hidden, scrolled } = useNavShell();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [introActive, setIntroActive] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // The intro animation owns the screen until it releases the body class.
  useEffect(() => {
    const body = document.body;
    const sync = () => setIntroActive(body.classList.contains("intro-active"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // On desktop the dock takes over exactly when the navbar parks itself, so
  // there is never a moment with no navigation and never two navs at once. On
  // mobile the navbar collapses to a hamburger, so the dock earns its place as
  // soon as the page has scrolled at all.
  const visible =
    pathname === "/" && !introActive && (hidden || (isMobile && scrolled));

  return { visible, isMobile };
}

/**
 * Where down the viewport a section has to reach before it counts as "the one
 * being read". Slightly above centre, because a reader's attention sits above
 * the middle of the screen rather than on it.
 */
const READING_LINE = "45%";

/**
 * Publishes the section currently under the reading line.
 *
 * WHY SCROLLTRIGGER AND NOT IntersectionObserver
 * The page scrolls under GSAP ScrollSmoother, which does not move the document
 * — it leaves the native scrollbar alone and puts a `transform` on
 * `#smooth-content` instead. IntersectionObserver reports against the real
 * viewport and the compositor's idea of where things are, so under a
 * transformed, eased container its callbacks arrive late, out of order, or (for
 * the tall pinned rails) not at all. The result was an active state that simply
 * never moved. ScrollTrigger measures against the same scroll model that is
 * actually driving the page, so it cannot disagree with it.
 *
 * HOW THE WINDOWS TILE
 * One trigger per section, active from "my top crossed the reading line" until
 * "my bottom crossed it" — which is the same instant the next section's top
 * crosses it. So the windows tile the whole page and exactly one is live at a
 * time. The two ends are special-cased: the first section starts at scroll 0
 * (its top never travels *down* to the reading line), and the last one runs to
 * `max` (a short closing section can never push its own top that far up).
 *
 * The tall pinned sections need no special handling: `#skills` and `#projects`
 * are each an over-tall rail with a pinned stage inside, so the section's own
 * box spans the entire pinned scroll distance and stays active throughout,
 * rather than flickering as the stage inside it is pinned and released.
 */
export function useActiveSectionSpy(sectionIds: readonly string[], enabled: boolean) {
  const { sectionsRevision } = useNavShell();
  // A fresh array literal every render would re-create every trigger every
  // render; the joined key changes only when the ids themselves do.
  const idKey = sectionIds.join("|");

  useEffect(() => {
    if (!enabled) return;
    const ids = idKey.split("|").filter(Boolean);
    if (ids.length === 0) return;

    // Which windows currently contain the reading line. A set rather than a
    // single value because during a refresh two neighbours can briefly report
    // themselves active, and "whichever fired last wins" is a coin toss.
    const live = new Set<string>();
    const publish = () => {
      // Deepest live section wins: on a boundary the reader has just moved into
      // the later one, and at the very bottom `contact`'s run-to-max window
      // should beat anything still lingering above it.
      for (let i = ids.length - 1; i >= 0; i -= 1) {
        if (live.has(ids[i])) {
          commit({ activeSection: ids[i] });
          return;
        }
      }
      // Nothing live (mid-refresh): keep the last known section rather than
      // blanking the nav for a frame.
    };

    const triggers = ids
      .map((id, i) => {
        const el = document.getElementById(id);
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el,
          start: i === 0 ? 0 : `top ${READING_LINE}`,
          end: i === ids.length - 1 ? "max" : `bottom ${READING_LINE}`,
          onToggle: (self) => {
            if (self.isActive) live.add(id);
            else live.delete(id);
            publish();
          },
        });
      })
      .filter((trigger): trigger is ScrollTrigger => trigger !== null);

    // Seed from the state the triggers were born in. ScrollTrigger only calls
    // onToggle on a *change*, so a spy created while the reader is already
    // halfway down the page would otherwise say nothing until the next
    // boundary — which on a long section is a very long silence.
    triggers.forEach((trigger, i) => {
      if (trigger.isActive) live.add(ids[i]);
    });
    publish();

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [enabled, idKey, sectionsRevision]);
}

/** Scrolls to a section, honouring ScrollSmoother when it is running. */
export function scrollToSection(href: string) {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (!el) return;

  const headerOffset = id === "hero" ? 0 : 84;
  window.dispatchEvent(new CustomEvent("nav-section-jump", { detail: { id } }));

  const smoother = ScrollSmoother.get();
  if (smoother) {
    const baseY =
      typeof smoother.offset === "function"
        ? smoother.offset(el, "top top")
        : el.getBoundingClientRect().top + smoother.scrollTop();
    smoother.scrollTo(Math.max(0, baseY - headerOffset), true);
  } else {
    const y = Math.max(
      0,
      el.getBoundingClientRect().top + window.scrollY - headerOffset
    );
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  commit({ activeSection: id });
  window.setTimeout(() => {
    ScrollTrigger.refresh();
    window.dispatchEvent(
      new CustomEvent("nav-section-settled", { detail: { id } })
    );
  }, 420);
}

/**
 * Jumps the page to the top without a glide, and puts the nav back on `hero`.
 *
 * Used when the mounted section tree is replaced. The browser preserves
 * `scrollY` across the swap, but the two versions are wildly different heights
 * — v2 adds several viewport-heights of pinned rail — so the old position means
 * nothing in the new document: it either lands the reader deep inside a section
 * they never scrolled to, or gets clamped to the new maximum and dumps them at
 * the very bottom.
 *
 * Goes through the smoother rather than `window.scrollTo`, because with
 * `normalizeScroll` the smoother owns the scroll position; setting it natively
 * leaves the smoother's eased content transform behind and the page visibly
 * glides back to where it was.
 */
export function resetScrollTop() {
  const smoother = ScrollSmoother.get();
  if (smoother) {
    // `false` = no easing. The reader is looking at a different page now;
    // animating the gap between two unrelated documents means nothing.
    smoother.scrollTo(0, false);
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  commit({ activeSection: "hero" });
}

/** Re-exported so consumers do not each need the gsap import. */
export { gsap };

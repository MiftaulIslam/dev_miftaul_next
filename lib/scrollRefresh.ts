import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The one way to ask for a ScrollTrigger re-measure.
 *
 * `ScrollTrigger.refresh()` reads layout for every trigger on the page — about
 * a hundred forced layouts on the homepage. Sections used to call it directly,
 * each for its own reasons (a fetch landed, a nav jump settled, a timer
 * guessing that images had loaded), so one page load ran five or six full
 * refreshes back to back and a nav jump ran three. Every request now lands
 * here and requests made close together collapse into a single refresh on the
 * next frame.
 */
let timer: ReturnType<typeof setTimeout> | undefined;
let frame = 0;

export function requestScrollRefresh(delay = 0) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = undefined;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      ScrollTrigger.refresh();
    });
  }, delay);
}

/**
 * Re-measures when the scrolling content actually changes height — a fetch
 * swapping in more projects, fonts swapping in, a section mounting late —
 * instead of on guesses. The height a refresh itself leaves behind (pin
 * spacers) is recorded and ignored, so a refresh never schedules another.
 */
export function watchContentHeight(content: HTMLElement) {
  let settled = content.offsetHeight;
  const onRefresh = () => {
    settled = content.offsetHeight;
  };
  ScrollTrigger.addEventListener("refresh", onRefresh);

  const observer = new ResizeObserver(([entry]) => {
    const height = Math.round(entry.borderBoxSize?.[0]?.blockSize ?? content.offsetHeight);
    if (Math.abs(height - settled) < 2) return;
    settled = height;
    // A burst of changes (several fetches landing) waits for quiet first.
    requestScrollRefresh(150);
  });
  observer.observe(content);

  return () => {
    observer.disconnect();
    ScrollTrigger.removeEventListener("refresh", onRefresh);
  };
}

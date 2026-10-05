"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  PencilLine,
  FileText,
  Menu,
  X,
  Home,
  User,
  Wrench,
  FolderGit2,
  Briefcase,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import { NAV_LINKS } from "@/lib/data";
import V2Button from "@/components/ui/v2/V2Button";
import {
  scrollToSection,
  setNavShell,
  useActiveSectionSpy,
  useNavShell,
} from "@/lib/navShell";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { LimelightNav } from "@/components/ui/limelight-nav";

gsap.registerPlugin(ScrollTrigger);

/** Past this scroll depth the shell tightens into its compact pill. */
const COMPACT_AT = 20;
/** Past this depth, scrolling down parks the shell off-screen. */
const AUTOHIDE_AT = 160;

/**
 * The anchor ids the spy watches, in page order.
 *
 * Derived from NAV_LINKS rather than written out again so the nav and the spy
 * can never drift, and hoisted to module scope because the order is what makes
 * the spy's windows tile — see `useActiveSectionSpy`.
 */
/** Drawer icons, keyed by NAV_LINKS href. */
const NAV_ICONS: Record<string, LucideIcon> = {
  "#hero": Home,
  "#about": User,
  "#skills": Wrench,
  "#projects": FolderGit2,
  "#experience": Briefcase,
  "#contact": Mail,
};

const SECTION_IDS = NAV_LINKS.map((link) => link.href.replace("#", ""));

export default function V2Navbar() {
  const pathname = usePathname();
  const [introActive, setIntroActive] = useState(true);
  // Published to the shared store so the bottom dock reads the same facts
  // instead of running a second scroll listener and section observer.
  const { scrolled, hidden, activeSection } = useNavShell();
  const setScrolled = (value: boolean) => setNavShell({ scrolled: value });
  const setHidden = (value: boolean) => setNavShell({ hidden: value });
  // "closing" keeps the drawer mounted while its exit animation plays.
  const [drawer, setDrawer] = useState<"closed" | "open" | "closing">("closed");
  const mobileOpen = drawer === "open";
  const setMobileOpen = (open: boolean) =>
    setDrawer((current) => (open ? "open" : current === "closed" ? "closed" : "closing"));
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: number;
    startY: number;
    lastY: number;
    lastT: number;
    velocity: number;
    active: boolean;
  } | null>(null);
  const isPortfolioRoute = pathname === "/";

  // The spy lives in the shared store, not here: it rebinds itself whenever the
  // page swaps its section tree, so it survives a version change that this
  // component never hears about.
  useActiveSectionSpy(SECTION_IDS, !introActive && isPortfolioRoute);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    const sync = () => setIntroActive(body.classList.contains("intro-active"));
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Compact-on-scroll, plus reveal-on-scroll-up (adapted from the reference header).
  useEffect(() => {
    if (introActive || !isPortfolioRoute) return;

    let lastY = 0;
    const update = () => {
      const smoother = ScrollSmoother.get();
      const y = smoother ? smoother.scrollTop() : window.scrollY;

      setScrolled(y > COMPACT_AT);
      // Ignore sub-pixel jitter so the shell does not flicker.
      if (Math.abs(y - lastY) > 4) {
        setHidden(y > lastY && y > AUTOHIDE_AT);
        lastY = y;
      }
    };

    update();
    lastY = ScrollSmoother.get()?.scrollTop() ?? window.scrollY;
    // The ticker is only needed to follow the smoother's eased position after
    // the scroll events stop. With native scrolling (touch, reduced motion) the
    // scroll event says everything, and a ticker callback would only keep the
    // main thread waking every frame for nothing.
    const smoothed = Boolean(ScrollSmoother.get());
    if (smoothed) gsap.ticker.add(update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      if (smoothed) gsap.ticker.remove(update);
      window.removeEventListener("scroll", update);
    };
  }, [introActive, isPortfolioRoute]);

  if (
    introActive ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/resume")
  )
    return null;

  const parked = hidden && !mobileOpen;

  const scrollTo = (href: string) => {
    scrollToSection(href);
    setMobileOpen(false);
  };

  /* Drag the drawer down to dismiss it: pulled with 0.6 elasticity, closed past
     100px or a 500px/s flick, otherwise it springs back. A 6px threshold keeps
     taps on the links working. */
  const onSheetPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = {
      id: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      lastT: event.timeStamp,
      velocity: 0,
      active: false,
    };
  };

  const onSheetPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const sheet = sheetRef.current;
    if (!drag || !sheet || event.pointerId !== drag.id) return;
    const dy = event.clientY - drag.startY;
    if (!drag.active) {
      if (Math.abs(dy) < 6) return;
      drag.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const dt = event.timeStamp - drag.lastT;
    if (dt > 0) drag.velocity = ((event.clientY - drag.lastY) / dt) * 1000;
    drag.lastY = event.clientY;
    drag.lastT = event.timeStamp;
    sheet.style.transition = "none";
    sheet.style.transform = `translateY(${Math.max(0, dy) * 0.6}px)`;
  };

  const onSheetPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const sheet = sheetRef.current;
    dragRef.current = null;
    if (!drag?.active || !sheet) return;
    const dy = event.clientY - drag.startY;
    if (dy > 100 || drag.velocity > 500) {
      // The exit keyframe animates on from wherever the drag left the sheet.
      setMobileOpen(false);
      return;
    }
    sheet.style.transition = "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
    sheet.style.transform = "";
  };

  return (
    <>
      {/* Slides in on mount and parks off-screen on scroll down — CSS
          (`.nav-shell` in globals.css). The shell can never be parked while the
          drawer is open. */}
      <header
        data-app-navbar="true"
        className={`nav-shell pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center lg:px-5 ${
          parked ? "is-parked" : ""
        }`}
      >
        <div
          // Below lg: an edge-to-edge app bar with only a bottom border.
          // From lg: the floating rounded pill that compacts on scroll.
          className={`pointer-events-auto flex h-14 w-full items-center justify-between gap-3 border-b border-hairline px-4 transition-[max-width,height,padding,background-color,border-color,box-shadow] duration-500 ease-out lg:rounded-2xl lg:border ${
            scrolled
              ? "bg-nav-surface backdrop-blur-sm lg:mt-2 lg:max-w-[72rem] lg:px-6 lg:shadow-xl lg:shadow-black/20 lg:backdrop-blur-xl"
              : "bg-nav-surface/60 backdrop-blur-md lg:mt-4 lg:h-[4.25rem] lg:max-w-[84rem] lg:px-7 lg:shadow-lg lg:shadow-black/10"
          }`}
        >
          {/* Logo */}
          <button
            onClick={() => scrollTo("#hero")}
            aria-label="Back to top"
            className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-hairline bg-tint-soft transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-[0_0_18px_var(--accent-glow)]">
              <Image
                src="/miftaul.svg"
                alt="Miftaul Islam Shuvro"
                width={22}
                height={22}
                className="h-[22px] w-[22px] transition-transform duration-300 group-hover:scale-110"
              />
            </span>
            {/* Hidden lg–xl: the full nav needs that width */}
            <span className="hidden flex-col text-left sm:flex lg:hidden xl:flex">
              <span className="text-sm font-semibold leading-none tracking-tight text-foreground transition-colors group-hover:text-primary">
                Miftaul Islam
              </span>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Full Stack Developer
              </span>
            </span>
          </button>

          {/* Desktop Nav — tubelight beam tracks the section in view */}
          <LimelightNav
            className="hidden h-full items-center gap-0.5 lg:flex"
            activeIndex={Math.max(
              0,
              NAV_LINKS.findIndex(
                (link) => link.href.replace("#", "") === activeSection
              )
            )}
            items={NAV_LINKS.map((link) => ({
              id: link.href,
              label: link.label,
              onClick: () => scrollTo(link.href),
            }))}
          />

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="size-control p-0" />

            <button
              onClick={() => scrollTo("#contact")}
              aria-label="Go to contact"
              className="grid size-control place-items-center rounded-full border border-hairline text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              <Mail className="h-5 w-5" />
            </button>

            <V2Button
              href="/resume"
              icon={<FileText />}
              iconSide="start"
              className="hidden gap-1.5 rounded-lg px-4 text-sm lg:inline-flex"
            >
              Resume
            </V2Button>
            <button
              onClick={() => scrollTo("#contact")}
              className="hidden items-center gap-1.5 h-control rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-[background-color,scale] duration-200 hover:scale-[1.03] hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:flex"
            >
              <PencilLine className="h-4 w-4" />
              Hire Me
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="grid size-control place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-tint-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer — enter/exit keyframes in globals.css (`.nav-drawer*`);
          stays mounted through "closing" so the exit can play. */}
      {drawer !== "closed" && (
          <>
            <div
              data-state={drawer}
              className="nav-drawer-backdrop fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <div
              ref={sheetRef}
              data-state={drawer}
              className="nav-drawer fixed inset-x-0 bottom-0 z-40 flex max-h-[85svh] touch-pan-x flex-col overflow-y-auto rounded-t-3xl border-x border-t border-hairline bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget && drawer === "closing") setDrawer("closed");
              }}
              onPointerDown={onSheetPointerDown}
              onPointerMove={onSheetPointerMove}
              onPointerUp={onSheetPointerUp}
              onPointerCancel={onSheetPointerUp}
            >
              <div aria-hidden className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-hairline-strong" />
              <nav className="flex flex-col gap-1 px-6 pb-4 pt-4">
                {NAV_LINKS.map((link, i) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  const Icon = NAV_ICONS[link.href];
                  return (
                    <button
                      key={link.href}
                      onClick={() => scrollTo(link.href)}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className={`nav-drawer-link flex items-center gap-3 rounded-xl px-4 py-3 text-left text-base transition-colors ${
                        isActive
                          ? "border border-hairline bg-tint-strong text-foreground"
                          : "text-muted-foreground hover:bg-tint-soft hover:text-foreground"
                      }`}
                    >
                      {Icon && (
                        <Icon
                          aria-hidden
                          className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                        />
                      )}
                      {link.label}
                    </button>
                  );
                })}
              </nav>
              <div className="flex flex-col gap-3 px-6 pb-8">
                <V2Button
                  href="/resume"
                  onClick={() => setMobileOpen(false)}
                  icon={<FileText />}
                  iconSide="start"
                  className="w-full text-sm"
                >
                  Resume
                </V2Button>
                <button
                  onClick={() => {
                    scrollTo("#contact");
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 h-control rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <PencilLine className="h-4 w-4" />
                  Hire Me
                </button>
              </div>
            </div>
          </>
      )}
    </>
  );
}

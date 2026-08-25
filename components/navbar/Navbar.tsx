"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PencilLine, FileText, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import { NAV_LINKS } from "@/lib/data";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { LimelightNav } from "@/components/ui/limelight-nav";

gsap.registerPlugin(ScrollTrigger);

/** Past this scroll depth the shell tightens into its compact pill. */
const COMPACT_AT = 20;
/** Past this depth, scrolling down parks the shell off-screen. */
const AUTOHIDE_AT = 160;

export default function Navbar() {
  const pathname = usePathname();
  const [introActive, setIntroActive] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isPortfolioRoute = pathname === "/";

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
    gsap.ticker.add(update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener("scroll", update);
    };
  }, [introActive, isPortfolioRoute]);

  // Active section via IntersectionObserver
  useEffect(() => {
    if (introActive || !isPortfolioRoute) return;
    const sectionIds = NAV_LINKS.map((l) => l.href.replace("#", ""));

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [introActive, isPortfolioRoute]);

  if (
    introActive ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/resume")
  )
    return null;

  const parked = hidden && !mobileOpen;

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    const headerOffset = id === "hero" ? 0 : 84;

    if (el) {
      window.dispatchEvent(
        new CustomEvent("nav-section-jump", { detail: { id } }),
      );
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
          el.getBoundingClientRect().top + window.scrollY - headerOffset,
        );
        window.scrollTo({ top: y, behavior: "smooth" });
      }

      setActiveSection(id);
      window.setTimeout(() => {
        ScrollTrigger.refresh();
        window.dispatchEvent(
          new CustomEvent("nav-section-settled", { detail: { id } }),
        );
      }, 420);
    }

    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        data-app-navbar="true"
        initial={{ y: -90, opacity: 0 }}
        // The shell can never be parked off-screen while the drawer is open.
        animate={{ y: parked ? -110 : 0, opacity: parked ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.7 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-3 sm:px-5"
      >
        <div
          className={`pointer-events-auto flex w-full items-center justify-between gap-3 rounded-2xl border transition-[max-width,height,padding,background-color,border-color,box-shadow] duration-500 ease-out ${
            scrolled
              ? "mt-2 h-14 max-w-[72rem] border-hairline bg-nav-surface px-4 shadow-xl shadow-black/20 backdrop-blur-xl md:px-6"
              : "mt-4 h-16 max-w-[84rem] border-hairline bg-nav-surface/60 px-4 shadow-lg shadow-black/10 backdrop-blur-md md:h-[4.25rem] md:px-7"
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
            <span className="hidden flex-col text-left sm:flex">
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
            className="hidden h-full items-center gap-0.5 md:flex"
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
            <ThemeToggle />

            <Link
              href="/resume"
              className="hidden items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-hairline-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
            >
              <FileText className="h-4 w-4" />
              Resume
            </Link>
            <motion.button
              onClick={() => scrollTo("#contact")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:flex"
            >
              <PencilLine className="h-4 w-4" />
              Hire Me
            </motion.button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-tint-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 right-0 top-20 z-40 flex w-72 flex-col rounded-l-3xl border-y border-l border-hairline bg-card/95 backdrop-blur-xl md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <nav className="flex flex-1 flex-col gap-2 px-6 py-8">
                {NAV_LINKS.map((link, i) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <motion.button
                      key={link.href}
                      onClick={() => scrollTo(link.href)}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className={`rounded-xl px-4 py-3 text-left text-base transition-colors ${
                        isActive
                          ? "border border-hairline bg-tint-strong text-foreground"
                          : "text-muted-foreground hover:bg-tint-soft hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </motion.button>
                  );
                })}
              </nav>
              <div className="flex flex-col gap-3 px-6 pb-8">
                <Link
                  href="/resume"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-hairline py-2.5 text-sm text-muted-foreground transition-colors hover:border-hairline-strong hover:text-foreground"
                >
                  <FileText className="h-4 w-4" />
                  Resume
                </Link>
                <button
                  onClick={() => {
                    scrollTo("#contact");
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <PencilLine className="h-4 w-4" />
                  Hire Me
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

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

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const pathname = usePathname();
  const [introActive, setIntroActive] = useState(true);
  const [scrolled, setScrolled] = useState(false);
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

  // Scroll state - keep navbar visible; shrink + glass after scroll
  useEffect(() => {
    if (introActive || !isPortfolioRoute) return;
    const update = () => {
      const smoother = ScrollSmoother.get();
      const y = smoother ? smoother.scrollTop() : window.scrollY;
      setScrolled(y > 20);
    };
    update();
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
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 right-0 z-[70] pointer-events-none"
      >
        <div
          className={`pointer-events-auto mx-auto mt-0 md:mt-2 px-5 md:px-8 flex items-center justify-between transition-all duration-300 ${
            scrolled
              ? "max-w-[76rem] h-14 rounded-2xl glass border border-white/10 shadow-xl shadow-black/35"
              : "max-w-[88rem] h-16 md:h-20 rounded-none bg-transparent border border-transparent"
          }`}
        >
          {/* Logo */}
          <button
            onClick={() => scrollTo("#hero")}
            className="flex items-center gap-2 group"
          >
            <Image
              src="/miftaul.svg"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`relative px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-white/8 border border-white/10"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/resume"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Resume
            </Link>
            <motion.button
              onClick={() => scrollTo("#contact")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
            >
              <PencilLine className="w-4 h-4" />
              Hire Me
            </motion.button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-16 right-0 bottom-0 z-40 w-72 bg-card border-l border-white/10 md:hidden flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <nav className="flex-1 px-6 py-8 flex flex-col gap-2">
                {NAV_LINKS.map((link, i) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <motion.button
                      key={link.href}
                      onClick={() => scrollTo(link.href)}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className={`text-left px-4 py-3 rounded-xl text-base transition-colors ${
                        isActive
                          ? "text-white bg-white/8 border border-white/10"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </motion.button>
                  );
                })}
              </nav>
              <div className="px-6 pb-8 flex flex-col gap-3">
                <Link
                  href="/resume"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-muted-foreground border border-white/10 rounded-xl hover:text-white hover:border-white/20 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Resume
                </Link>
                <button
                  onClick={() => {
                    scrollTo("#contact");
                    setMobileOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors"
                >
                  <PencilLine className="w-4 h-4" />
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

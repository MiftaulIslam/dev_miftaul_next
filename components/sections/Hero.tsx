"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, ArrowDown, ExternalLink } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";
import { SOCIAL_LINKS } from "@/lib/data";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const ROLES = ["Full Stack Developer", "Software Engineer", "Solution Architect"];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  mail: Mail,
};

interface HeroProps {
  portraitSlotRef: React.RefObject<HTMLDivElement | null>;
}

export default function Hero({ portraitSlotRef }: HeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const contentLeftRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const [roleIndex, setRoleIndex] = useState(0);

  // Role cycling animation with GSAP
  useEffect(() => {
    if (reduced) return;
    const cycle = () => {
      const el = roleRef.current;
      if (!el) return;
      gsap.to(el, {
        y: -20, opacity: 0, duration: 0.35, ease: "power2.in",
        onComplete: () => {
          setRoleIndex((prev) => (prev + 1) % ROLES.length);
          gsap.fromTo(el,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
          );
        },
      });
    };
    const id = setInterval(cycle, 2800);
    return () => clearInterval(id);
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced || !headingRef.current) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Heading lines reveal
      const lines = headingRef.current.querySelectorAll(".hero-line");
      tl.fromTo(
        lines,
        { y: 70, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.9, stagger: 0.12 }
      );

      // Greeting tag
      tl.fromTo(
        ".hero-greeting",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.6"
      );

      // Summary
      tl.fromTo(
        ".hero-summary",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.3"
      );

      // CTA buttons
      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.1 },
          "-=0.25"
        );
      }

      // Social icons
      if (socialsRef.current) {
        tl.fromTo(
          socialsRef.current.children,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
          "-=0.2"
        );
      }

      // Right card float in
      if (cardRef.current) {
        tl.fromTo(
          cardRef.current,
          // Keep slot geometry stable for shared-element measurements on hard refresh.
          { scale: 0.96, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
          0.3
        );
      }

      // Scroll-out + layered parallax
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        gsap.to(sectionRef.current, {
          scale: 0.955,
          opacity: 0.04,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        if (bgLayerRef.current) {
          gsap.to(bgLayerRef.current, {
            y: 130,
            x: 24,
            scale: 1.12,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }

        if (contentLeftRef.current) {
          gsap.to(contentLeftRef.current, {
            y: -120,
            x: -30,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }

        if (cardRef.current) {
          gsap.to(cardRef.current, {
            y: 95,
            x: 42,
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.to(sectionRef.current, {
          opacity: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        if (contentLeftRef.current) {
          gsap.to(contentLeftRef.current, {
            y: -56,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-transparent"
    >
      {/* Background glow blobs */}
      <div ref={bgLayerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        <Image
          src="/hero-bg-2.png"
          alt="Hero background"
          fill
          priority
          className="object-cover opacity-20"
        />
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-drift"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{
            background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            animation: "drift 16s ease-in-out infinite reverse",
          }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 w-full pt-20 pb-16 grid md:grid-cols-2 gap-12 lg:gap-20 items-center min-h-screen">

        {/* ── Left: Text content ── */}
        <div ref={contentLeftRef} className="flex flex-col gap-6">
          {/* Greeting tag */}
          <div className="hero-greeting opacity-0 inline-flex items-center gap-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
            <span className="text-xs font-mono text-muted-foreground bg-white/5 border border-white/10 px-3 py-1 rounded-full tracking-wider">
              &lt;available for work /&gt;
            </span>
          </div>

          {/* Heading */}
          <div ref={headingRef} className="flex flex-col gap-1 overflow-hidden">
            <h1 className="hero-line opacity-0 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              Miftaul
            </h1>
            <h1 className="hero-line opacity-0 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              <span className="text-blue-400">Islam</span> Shuvro
            </h1>
          </div>

          {/* Animated role */}
          <div className="h-7 overflow-hidden">
            <span
              ref={roleRef}
              className="block text-lg md:text-xl font-medium text-muted-foreground"
            >
              {ROLES[roleIndex]}
            </span>
          </div>

          {/* Summary */}
          <p className="hero-summary opacity-0 text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed">
            I build high-performance full stack applications — from elegant React interfaces
            to scalable Node.js / NestJS backends. 3+ years shipping production-ready products
            for global clients.
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-wrap gap-3">
            <button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="opacity-0 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              View Projects
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={scrollToAbout}
              className="opacity-0 flex items-center gap-2 px-6 py-3 text-white border border-white/15 hover:border-white/30 rounded-xl transition-all duration-200 hover:-translate-y-0.5 backdrop-blur"
            >
              About Me
            </button>
          </div>

          {/* Social links */}
          <div ref={socialsRef} className="flex items-center gap-3 pt-1">
            {SOCIAL_LINKS.map((s) => {
              const Icon = iconMap[s.icon];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="opacity-0 w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-200"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                </a>
              );
            })}
            <div className="h-px flex-1 max-w-16 bg-linear-to-r from-white/10 to-transparent" />
          </div>
        </div>

        {/* ── Right: Visual card composition ── */}
        <div ref={cardRef} className="opacity-0 relative hidden md:flex items-center justify-center">
          {/* Outer glow ring */}
          <div
            className="absolute w-72 h-72 rounded-full opacity-20 blur-2xl"
            style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
          />

          {/* Animated rotating ring */}
          <div className="hero-orbit-frame relative w-64 h-64 md:w-80 md:h-80">
            <div className="hero-orbit-ring absolute inset-0 rounded-full border border-blue-500/20 animate-spin-slow" />
            <div
              className="hero-orbit-ring absolute inset-2 rounded-full border border-blue-500/10"
              style={{ animation: "spin-slow 20s linear infinite reverse" }}
            />

            {/* Portrait card */}
            <div
              ref={portraitSlotRef}
              className="portrait-hero absolute inset-4 rounded-2xl glass border border-blue-500/20 pointer-events-none"
              aria-hidden
            >
              <div className="hero-static-portrait absolute inset-0">
                <Image
                  src="/ariyan_2.jpg"
                  alt="Miftaul Islam Shuvro portrait in hero card"
                  fill
                  sizes="(max-width: 768px) 240px, 320px"
                  className="object-cover object-[62%_35%] rounded-2xl"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-background/55 via-transparent to-background/10 rounded-2xl" />
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="hero-floating-chip absolute -top-4 -right-4 md:right-0 glass border border-white/10 rounded-xl px-3 py-2 animate-float" style={{ animationDelay: "0.5s" }}>
            <p className="text-[10px] text-muted-foreground font-mono">experience</p>
            <p className="text-white font-bold text-sm">3+ Years</p>
          </div>
          <div className="hero-floating-chip absolute -bottom-4 -left-4 md:left-0 glass border border-white/10 rounded-xl px-3 py-2 animate-float" style={{ animationDelay: "1.2s" }}>
            <p className="text-[10px] text-muted-foreground font-mono">projects</p>
            <p className="text-white font-bold text-sm">7+ Shipped</p>
          </div>
          <div className="hero-floating-chip absolute top-1/2 -right-8 md:-right-4 glass border border-green-500/20 rounded-xl px-3 py-2 animate-float" style={{ animationDelay: "0.9s" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-green-400 font-semibold text-xs">Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-white transition-colors group"
      >
        <span className="text-xs font-mono tracking-widest uppercase">scroll</span>
        <div className="w-px h-8 bg-linear-to-b from-muted-foreground to-transparent group-hover:from-white transition-colors" />
        <ArrowDown className="w-3 h-3 animate-bounce" />
      </button>
    </section>
  );
}

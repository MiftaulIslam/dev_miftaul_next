"use client";

import { useRef, useEffect, useState, type ComponentType } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Globe, Mail } from "lucide-react";

import { GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";
import ScrollHighlightText from "@/components/ui/ScrollHighlightText";
import HeroAmbience from "@/components/hero/HeroAmbience";
import DeveloperIdCard from "@/components/hero/DeveloperIdCard";
import type { PortfolioSettings } from "@/lib/dashboard/types";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { usePointerField } from "@/lib/usePointerField";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_ROLES = ["Full Stack Developer", "Software Engineer", "Solution Architect"];

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  mail: Mail,
  link: Globe,
};

interface HeroProps {
  profile: PortfolioSettings;
}

function splitName(fullName: string) {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return { firstName: "Miftaul", highlighted: "Islam", remainder: "Shuvro" };
  }

  return {
    firstName: tokens[0],
    highlighted: tokens[1] ?? "Islam",
    remainder: tokens.slice(2).join(" "),
  };
}

export default function V2Hero({ profile }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const contentLeftRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const pointer = usePointerField(sectionRef);
  const [roleIndex, setRoleIndex] = useState(0);

  const roles = profile.designations.length ? profile.designations : DEFAULT_ROLES;
  const socialLinks = profile.socials.length
    ? profile.socials
    : [{ iconName: "mail", link: `mailto:${profile.email}` }];
  const nameParts = splitName(profile.name);
  const safeRole = roles[roleIndex % roles.length];

  useEffect(() => {
    if (reduced) return;

    const cycle = () => {
      const el = roleRef.current;
      if (!el) return;
      gsap.to(el, {
        y: -20,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          setRoleIndex((prev) => (prev + 1) % roles.length);
          gsap.fromTo(
            el,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
          );
        },
      });
    };

    const id = setInterval(cycle, 2800);
    return () => clearInterval(id);
  }, [reduced, roles]);

  useGSAP(
    () => {
      /*
        The figure resolves in the first third of the scroll, not across the
        whole hero. The section itself scrubs opacity 1 -> 0.04 over one
        viewport, and the figure inherits that — so a reveal spread over the
        full window would be fading out before it ever finished arriving.
        Landing it by ~34% means it is fully present while the hero is still
        legible, then leaves with the hero as one piece.

        Scrubbed, so `ease: "none"`: any curve on a scroll-linked tween reads
        as lag between the wheel and the pixels. Transform and opacity only —
        the blur in `.hero-figure` is static, so the layer rasterises once and
        every frame after that is compositor work.
      */
      if (figureRef.current) {
        if (reduced) {
          // Gentler, not absent: it simply starts where it would have arrived.
          gsap.set(figureRef.current, { opacity: 0.44, yPercent: 0, scale: 1 });
        } else {
          gsap.fromTo(
            figureRef.current,
            { opacity: 0, yPercent: 12, scale: 1.05 },
            {
              // Peaks at 0.66, not 1. At full strength the baked blue rim
              // reads as a highlight competing with the copy; this keeps it as
              // the ambience it is meant to be.
              opacity: 0.66,
              yPercent: 0,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                // Resolved in px through a function rather than "+=34%": a
                // percentage offset here collapses to +=0, which pins progress
                // at 1 and leaves the figure fully visible before the reader
                // has scrolled at all. invalidateOnRefresh re-measures on resize.
                end: () => `+=${Math.round(window.innerHeight * 0.34)}`,
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      }

      // Everything below is the intro timeline, which is skipped wholesale under
      // reduced motion. The figure above must therefore be handled before this
      // return, or its reduced-motion branch is unreachable.
      if (reduced || !headingRef.current) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      const lines = headingRef.current.querySelectorAll(".hero-line");
      tl.fromTo(
        lines,
        { y: 70, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.9, stagger: 0.12 },
      );

      tl.fromTo(
        ".hero-greeting",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.6",
      );

      tl.fromTo(
        ".hero-summary",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.3",
      );

      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.1 },
          "-=0.25",
        );
      }

      if (socialsRef.current) {
        tl.fromTo(
          socialsRef.current.children,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
          "-=0.2",
        );
      }

      // The badge drops in on its lanyard rather than fading up.
      if (cardRef.current) {
        tl.fromTo(
          cardRef.current,
          { y: -46, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "power3.out",
          },
          0.35,
        );
      }

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
            x: 26,
            scale: 1.05,
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
    // `reduced` resolves in a rAF after mount, i.e. after this layout effect has
    // already run, so without it in the deps every `if (reduced)` branch in here
    // is dead code.
    //
    // revertOnUpdate is required alongside it: useGSAP re-runs on a dependency
    // change but does NOT revert by default, so the ScrollTrigger built on the
    // first (reduced === false) pass would stay alive and keep overwriting the
    // static values the reduced branch sets.
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  );

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative isolate flex min-h-svh w-full min-w-0 items-center overflow-x-clip bg-transparent"
    >
      <div ref={bgLayerRef} className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Existing banner art, kept as ambient texture only: heavily blurred and
            dimmed so it reads as depth rather than a legible screenshot, and
            hidden on the light surface where it reads as grime. */}
        <div
          className="absolute -inset-8 hidden opacity-[0.09] blur-2xl saturate-150 dark:block"
          aria-hidden
        >
          <Image
            src={profile.bannerImage || "/hero-bg-2.webp"}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <HeroAmbience pointer={pointer} />
      </div>

      {/*
        The portrait, bottom-centre, behind everything the reader is here to
        read. Absent at rest and brought in by the scroll.

        Dark theme only, by request and by nature: the source is a dark frame
        lit by a blue rim, so on a light ground it would be a grey box. Desktop
        only too — below 768px the hero stacks into a column and the ID card
        owns the bottom, so the figure would sit behind it contributing nothing
        and muddying the card. Both gates live in CSS (`.hero-figure`).

        The near-black corners (measured 1,5,23) are dissolved by the mask in
        `.hero-figure` rather than by `mix-blend-mode: screen` — the section is
        `isolate` over a transparent backdrop, so a blend mode would have
        nothing to blend against and would leave the rectangle visible.
      */}
      <div
        ref={figureRef}
        aria-hidden
        className="hero-figure pointer-events-none absolute left-1/2 -translate-x-1/2 opacity-0"
        // Width is inline rather than a `w-[min(...)]` arbitrary class: Tailwind
        // has to scan and generate those at build time, and a miss silently
        // collapses this to zero width with no error anywhere.
        style={{
          width: "min(36rem, 84vw)",
          // Lifted off the bottom edge so the figure sits in the frame rather
          // than sliding out of it — bottom: 0 buried the shoulders below the
          // fold and left only the head reading.
          bottom: "clamp(1.5rem, 7vh, 5rem)",
          aspectRatio: "1088 / 1445",
        }}
      >
        <Image
          src="/cyber-me.png"
          alt=""
          fill
          sizes="(max-width: 768px) 80vw, 32rem"
          className="object-contain object-bottom"
          priority={false}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full min-w-0 max-w-[88rem] grid-cols-1 items-center gap-12 px-5 pb-16 pt-24 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20 lg:pb-16 lg:pt-24">
        <div ref={contentLeftRef} className="flex min-w-0 flex-col gap-6">
          <div className="hero-greeting inline-flex w-fit items-center gap-2 opacity-0">
            <span className="h-2 w-2 animate-pulse-glow rounded-full bg-emerald-400" />
            <span className="rounded-full border border-hairline bg-tint-soft px-3 py-1 font-mono text-xs tracking-wider text-muted-foreground">
              &lt;available for work /&gt;
            </span>
          </div>

          <div ref={headingRef} className="flex flex-col gap-1 overflow-hidden">
            <h1 className="hero-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground opacity-0 sm:text-6xl lg:text-7xl">
              {nameParts.firstName}
            </h1>
            <h1 className="hero-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground opacity-0 sm:text-6xl lg:text-7xl">
              <span className="text-primary">{nameParts.highlighted}</span> {nameParts.remainder}
            </h1>
          </div>

          <div className="h-7 overflow-hidden">
            <span
              ref={roleRef}
              className="block text-lg font-medium text-muted-foreground md:text-xl"
            >
              {safeRole}
            </span>
          </div>

          <ScrollHighlightText
            as="p"
            text={profile.shortSummary}
            className="hero-summary max-w-lg text-base leading-relaxed text-muted-foreground opacity-0 md:text-lg"
            triggerStart="top 82%"
          />

          <div ref={ctaRef} className="flex flex-wrap gap-3">
            <button
              onClick={() => scrollToId("projects")}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground opacity-0 shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {/* Sheen sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/25 transition-[left] duration-700 ease-out group-hover:left-[150%] motion-reduce:hidden"
              />
              <span className="relative">View Projects</span>
              <ArrowUpRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <button
              onClick={() => scrollToId("about")}
              className="glass flex items-center gap-2 rounded-xl px-6 py-3 text-foreground opacity-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              About Me
            </button>
          </div>

          <div ref={socialsRef} className="flex items-center gap-3 pt-1">
            {socialLinks.map((social, index) => {
              const key = social.iconName.toLowerCase();
              const Icon = iconMap[key] ?? iconMap.link;
              return (
                <a
                  key={`${social.iconName}-${social.link}-${index}`}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.iconName}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline text-muted-foreground opacity-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
            <div className="h-px max-w-16 flex-1 bg-linear-to-r from-hairline-strong to-transparent" />
          </div>
        </div>

        <div
          ref={cardRef}
          className="relative flex min-w-0 items-center justify-center opacity-0 lg:justify-end"
        >
          {/* Restrained halo behind the badge */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, var(--hero-halo) 0%, transparent 70%)" }}
          />
          <DeveloperIdCard profile={profile} pointer={pointer} className="relative" />
        </div>
      </div>

      <button
        onClick={() => scrollToId("about")}
        aria-label="Scroll to about section"
        className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:flex"
      >
        <span className="font-mono text-xs uppercase tracking-widest">scroll</span>
        <div className="h-8 w-px bg-linear-to-b from-muted-foreground to-transparent transition-colors group-hover:from-foreground" />
        <ArrowDown className="h-3 w-3 animate-bounce" />
      </button>
    </section>
  );
}

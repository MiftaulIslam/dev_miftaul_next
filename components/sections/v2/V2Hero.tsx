"use client";

import { useRef, useEffect, useState, type ComponentType, type CSSProperties } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Globe, Mail } from "lucide-react";

import { GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";
import V2ScrollHighlightText from "@/components/ui/v2/V2ScrollHighlightText";
import HeroAmbience from "@/components/hero/HeroAmbience";
import DeveloperIdCard from "@/components/hero/DeveloperIdCard";
import type { PortfolioSettings } from "@/lib/dashboard/types";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { usePointerField } from "@/lib/usePointerField";
import V2Button from "@/components/ui/v2/V2Button";

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

/** Socials rise in one after another, 80ms apart, after the CTAs. */
function socialEntrance(index: number): CSSProperties {
  return {
    "--hero-delay": `${1.32 + index * 0.08}s`,
    "--hero-dur": "0.4s",
    "--hero-rise": "15px",
  } as CSSProperties;
}

/**
 * The cycling designation under the name.
 *
 * Its own component so each tick re-renders one span instead of the whole hero
 * (ID card, ambience, CTAs). It also stops while off screen: the interval, its
 * tweens and its renders used to keep running for the rest of the visit.
 */
function RoleTicker({ roles, reduced }: { roles: string[]; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el) return;

    const cycle = () => {
      gsap.to(el, {
        y: -20,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          setIndex((prev) => (prev + 1) % roles.length);
          gsap.fromTo(
            el,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
          );
        },
      });
    };

    let id: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(id);
      id = entry.isIntersecting ? setInterval(cycle, 2800) : undefined;
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      clearInterval(id);
    };
  }, [reduced, roles]);

  return (
    <span ref={ref} className="block text-lg font-medium text-muted-foreground md:text-xl">
      {roles[index % roles.length]}
    </span>
  );
}

export default function V2Hero({ profile }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const contentLeftRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const pointer = usePointerField(sectionRef);

  // The hero's CSS loops (drifting halos, the status pulse, the scroll cue)
  // pause once it scrolls away: a running animation is restyled on every frame
  // the page renders, and during smooth scrolling that is every frame.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      section.toggleAttribute("data-offscreen", !entry.isIntersecting);
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const roles = profile.designations.length ? profile.designations : DEFAULT_ROLES;
  const socialLinks = profile.socials.length
    ? profile.socials
    : [{ iconName: "mail", link: `mailto:${profile.email}` }];
  const nameParts = splitName(profile.name);

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

      // The entrance (name, greeting, summary, CTAs, socials, badge) is CSS,
      // `.hero-in*` in globals.css, so it plays from the first paint of the
      // server HTML instead of waiting for hydration, and reduced motion simply
      // leaves everything visible. Only the scroll-linked parallax stays here.
      if (reduced) return;

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
          <div className="hero-greeting hero-in inline-flex w-fit items-center gap-2 [--hero-delay:0.42s]">
            <span className="h-2 w-2 animate-pulse-glow rounded-full bg-emerald-400" />
            <span className="rounded-full border border-hairline bg-tint-soft px-3 py-1 font-mono text-xs tracking-wider text-muted-foreground">
              &lt;available for work /&gt;
            </span>
          </div>

          <div className="overflow-hidden">
            {/* One h1 reading "Miftaul Islam Shuvro"; each line still animates on
                its own. The space between the spans keeps the extracted text
                from running the two lines together. */}
            <h1 className="flex flex-col gap-1">
              <span className="hero-line hero-in-line block text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                {nameParts.firstName}
              </span>{" "}
              <span className="hero-line hero-in-line block text-5xl font-bold leading-[1.05] tracking-tight text-foreground [--hero-delay:0.12s] sm:text-6xl lg:text-7xl">
                <span className="text-primary">{nameParts.highlighted}</span> {nameParts.remainder}
              </span>
            </h1>
          </div>

          <div className="h-7 overflow-hidden">
            <RoleTicker roles={roles} reduced={reduced} />
          </div>

          <V2ScrollHighlightText
            as="p"
            text={profile.shortSummary}
            className="hero-summary hero-in max-w-lg text-base leading-relaxed text-muted-foreground [--hero-delay:0.72s] md:text-lg"
            triggerStart="top 82%"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => scrollToId("projects")}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden h-control rounded-xl bg-primary px-6 font-medium sm:w-auto text-primary-foreground hero-in [--hero-delay:0.97s] [--hero-dur:0.45s] shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {/* Sheen sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/25 transition-[left] duration-700 ease-out group-hover:left-[150%] motion-reduce:hidden"
              />
              <span className="relative">View Projects</span>
              <ArrowUpRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <V2Button
              onClick={() => scrollToId("about")}
              className="w-full sm:w-auto hero-in [--hero-delay:1.07s] [--hero-dur:0.45s]"
              // Points where the click goes; nudges down on hover
              icon={<ArrowDown className="transition-transform duration-200 group-hover:translate-y-0.5" />}
            >
              About Me
            </V2Button>
          </div>

          <div className="flex items-center gap-3 pt-1">
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
                  style={socialEntrance(index)}
                  className="hero-in flex size-control items-center justify-center rounded-xl border border-hairline text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
            <div
              style={socialEntrance(socialLinks.length)}
              className="hero-in h-px max-w-16 flex-1 bg-linear-to-r from-hairline-strong to-transparent"
            />
          </div>
        </div>

        <div
          ref={cardRef}
          className="hero-in-card relative flex min-w-0 items-center justify-center lg:justify-end"
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
        <ArrowDown className="h-3 w-3 motion-safe:animate-bounce" />
      </button>
    </section>
  );
}

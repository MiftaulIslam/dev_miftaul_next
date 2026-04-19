"use client";

import { useRef, useEffect, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ExternalLink, Globe, Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";
import ScrollHighlightText from "@/components/ui/ScrollHighlightText";
import type { PortfolioSettings } from "@/lib/dashboard/types";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const HERO_SPLINE_SCENE =
  "https://prod.spline.design/BUcAtsyRRFQOgBGG/scene.splinecode";

const SplineScene = dynamic(() => import("@splinetool/react-spline").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-blue-500/5 ring-1 ring-inset ring-blue-500/10"
      aria-hidden
    />
  ),
});

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

export default function Hero({ profile }: HeroProps) {
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

      if (cardRef.current) {
        tl.fromTo(
          cardRef.current,
          { scale: 0.96, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
          0.3,
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
    { scope: sectionRef },
  );

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative isolate flex min-h-screen w-full min-w-0 items-center overflow-x-clip bg-transparent"
    >
      <div ref={bgLayerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        <Image
          src={profile.bannerImage || "/hero-bg-2.png"}
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
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full min-w-0 max-w-[88rem] grid-cols-1 items-center gap-12 px-5 pt-20 pb-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.22fr)] md:px-10 lg:gap-24">
        <div ref={contentLeftRef} className="flex min-w-0 flex-col gap-6">
          <div className="hero-greeting opacity-0 inline-flex items-center gap-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
            <span className="text-xs font-mono text-muted-foreground bg-white/5 border border-white/10 px-3 py-1 rounded-full tracking-wider">
              &lt;available for work /&gt;
            </span>
          </div>

          <div ref={headingRef} className="flex flex-col gap-1 overflow-hidden">
            <h1 className="hero-line opacity-0 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              {nameParts.firstName}
            </h1>
            <h1 className="hero-line opacity-0 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              <span className="text-blue-400">{nameParts.highlighted}</span> {nameParts.remainder}
            </h1>
          </div>

          <div className="h-7 overflow-hidden">
            <span ref={roleRef} className="block text-lg md:text-xl font-medium text-muted-foreground">
              {safeRole}
            </span>
          </div>

          <ScrollHighlightText
            as="p"
            text={profile.shortSummary}
            className="hero-summary opacity-0 text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed"
            triggerStart="top 82%"
          />

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
                  className="opacity-0 w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
            <div className="h-px flex-1 max-w-16 bg-linear-to-r from-white/10 to-transparent" />
          </div>
        </div>

        <div
          ref={cardRef}
          className="relative hidden min-w-0 items-center justify-center overflow-visible opacity-0 md:flex md:justify-end lg:pr-2"
        >
          <div
            className="absolute w-72 h-72 rounded-full opacity-20 blur-2xl"
            style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
          />

          <div className="hero-orbit-frame relative w-[19rem] h-[19rem] md:w-[24rem] md:h-[24rem] lg:w-[28rem] lg:h-[28rem] overflow-visible">
            <div
              className="absolute left-1/2 top-[55%] z-0 h-[145%] w-[145%] -translate-x-1/2 -translate-y-1/2 md:h-[150%] md:w-[150%]"
              role="img"
              aria-label="Interactive 3D robot scene"
            >
              <SplineScene scene={HERO_SPLINE_SCENE} className="size-full min-h-[20rem] md:min-h-[26rem]" />
            </div>

            <div className="hero-orbit-ring pointer-events-none absolute inset-0 z-10 rounded-full border border-blue-500/20 animate-spin-slow" />
            <div
              className="hero-orbit-ring pointer-events-none absolute inset-2 z-10 rounded-full border border-blue-500/10"
              style={{ animation: "spin-slow 20s linear infinite reverse" }}
            />
          </div>

          <div className="hero-floating-chip absolute -top-4 -right-4 z-20 md:right-0 glass border border-white/10 rounded-xl px-3 py-2 animate-float" style={{ animationDelay: "0.5s" }}>
            <p className="text-[10px] text-muted-foreground font-mono">experience</p>
            <p className="text-white font-bold text-sm">{profile.yearsOfExperience}+ Years</p>
          </div>
          <div className="hero-floating-chip absolute -bottom-4 -left-4 z-20 md:left-0 glass border border-white/10 rounded-xl px-3 py-2 animate-float" style={{ animationDelay: "1.2s" }}>
            <p className="text-[10px] text-muted-foreground font-mono">projects</p>
            <p className="text-white font-bold text-sm">{profile.totalProjects}+ Shipped</p>
          </div>
          <div className="hero-floating-chip absolute top-1/2 right-0 z-20 -translate-y-1/2 glass border border-green-500/20 rounded-xl px-3 py-2 animate-float" style={{ animationDelay: "0.9s" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-green-400 font-semibold text-xs">{profile.availability}</p>
            </div>
          </div>
        </div>
      </div>

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

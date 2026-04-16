"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Mail, CheckCircle2 } from "lucide-react";
import CountUp from "react-countup";
import { useInView } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { ABOUT, STATS } from "@/lib/data";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface AboutProps {
  portraitTargetRef: React.RefObject<HTMLDivElement | null>;
}

export default function About({ portraitTargetRef }: AboutProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const whiteHighlights = [
    "Miftaul Islam Shuvro",
    "3+ years",
    "Web Makers LTD",
    "clean architecture",
    "developer experience",
    "production-ready",
    "global clients",
  ];
  const accentHighlights = ["React/Next.js", "Node.js/NestJS/Golang", "enterprise SaaS"];

  const renderHighlightedText = (text: string): ReactNode[] => {
    const allHighlights = [...whiteHighlights, ...accentHighlights].sort((a, b) => b.length - a.length);
    const escaped = allHighlights.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (escaped.length === 0) return [text];

    const regex = new RegExp(`(${escaped.join("|")})`, "gi");
    return text.split(regex).map((chunk, idx) => {
      const lower = chunk.toLowerCase();
      const isWhite = whiteHighlights.some((w) => w.toLowerCase() === lower);
      const isAccent = accentHighlights.some((w) => w.toLowerCase() === lower);

      if (isWhite) {
        return (
          <span
            key={`${chunk}-${idx}`}
            className="about-hl about-hl-white font-semibold bg-linear-to-r from-white/18 to-white/6 bg-no-repeat [background-position:0_82%]"
            style={{ backgroundSize: "0% 100%" }}
          >
            {chunk}
          </span>
        );
      }
      if (isAccent) {
        return (
          <span
            key={`${chunk}-${idx}`}
            className="about-hl about-hl-accent font-medium bg-linear-to-r from-blue-400/24 to-blue-300/8 bg-no-repeat [background-position:0_82%]"
            style={{ backgroundSize: "0% 100%" }}
          >
            {chunk}
          </span>
        );
      }
      return <span key={`${chunk}-${idx}`}>{chunk}</span>;
    });
  };

  useGSAP(
    () => {
      if (reduced) return;

      const textEls = sectionRef.current?.querySelectorAll(".about-text-item");
      if (textEls) {
        gsap.fromTo(
          textEls,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 65%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      const infoCards = sectionRef.current?.querySelectorAll(".about-info-card");
      if (infoCards) {
        gsap.fromTo(
          infoCards,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 55%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (portraitTargetRef.current) {
        gsap.fromTo(
          portraitTargetRef.current,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: portraitTargetRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      const highlightedBlocks = sectionRef.current?.querySelectorAll(".about-highlight-block");
      if (highlightedBlocks) {
        highlightedBlocks.forEach((block) => {
          const accents = block.querySelectorAll(".about-hl-accent");
          const whites = block.querySelectorAll(".about-hl-white");

          gsap.fromTo(
            accents,
            {
              color: "#60738f",
              textShadow: "0 0 0 rgba(96,165,250,0)",
              backgroundSize: "0% 100%",
            },
            {
              color: "#93c5fd",
              textShadow: "0 0 14px rgba(96,165,250,0.35)",
              backgroundSize: "100% 100%",
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: block,
                start: "top 76%",
                toggleActions: "play none none reverse",
              },
            }
          );

          gsap.fromTo(
            whites,
            {
              color: "#8fa2ba",
              textShadow: "0 0 0 rgba(255,255,255,0)",
              backgroundSize: "0% 100%",
            },
            {
              color: "#f8fafc",
              textShadow: "0 0 12px rgba(148,163,184,0.25)",
              backgroundSize: "100% 100%",
              duration: 0.46,
              stagger: 0.07,
              ease: "power2.out",
              scrollTrigger: {
                trigger: block,
                start: "top 76%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      }
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section id="about" ref={sectionRef} className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div
        className="absolute top-1/2 right-0 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="about-text-item opacity-0">
          <SectionHeading
            eyebrow="About Me"
            title="The Developer Behind The Code"
            subtitle="A passionate engineer who loves building things that matter."
            align="left"
            titleGradient="linear-gradient(90deg, #bae6fd 0%, #60a5fa 36%, #2563eb 68%, #0f172a 100%)"
          />
        </div>

        <div className="mt-16 grid md:grid-cols-[1.1fr_1.4fr] gap-12 lg:gap-20 items-center">
          <div className="flex justify-center md:justify-start md:self-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-20 h-20 border-t-2 border-l-2 border-blue-400/60 rounded-tl-xl pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-2 border-r-2 border-blue-400/60 rounded-br-xl pointer-events-none" />

              <div
                ref={portraitTargetRef}
                className="portrait-about relative z-30 w-72 h-[28rem] rounded-2xl overflow-hidden border border-blue-400/15 bg-[#0a111d]"
                style={{ opacity: 0 }}
              >
                <div className="about-static-portrait absolute inset-0">
                  <Image
                    src="/ariyan.webp"
                    alt="Miftaul Islam Shuvro portrait in about card"
                    fill
                    sizes="(max-width: 768px) 300px, 420px"
                    className="object-cover object-top"
                    priority
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-[#080c14]/45 via-transparent to-[#080c14]/5 pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 z-50 pointer-events-none">
                  <p className="text-white! font-semibold text-sm">Miftaul Islam Shuvro</p>
                  <p className="text-white! text-xs">Software Engineer</p>
                </div>
              </div>

          
            </div>
          </div>

          <div className="flex flex-col gap-7">
            {ABOUT.bio.map((para, i) => (
              <p
                key={i}
                className="about-text-item about-highlight-block opacity-0 text-muted-foreground leading-relaxed text-base md:text-lg"
              >
                {renderHighlightedText(para)}
              </p>
            ))}

            <div className="about-info-card opacity-0 border-y border-white/10 py-4 md:py-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 md:gap-6 items-center">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-subtle uppercase tracking-[0.18em]">Location</p>
                  <p className="text-sm text-white/95 font-medium">{ABOUT.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 md:border-l md:border-white/10 md:pl-6">
                <Mail className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-subtle uppercase tracking-[0.18em]">Email</p>
                  <p className="text-sm text-white/95 font-medium break-all">{ABOUT.email}</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/25 bg-emerald-400/8 px-3.5 py-1.5 w-fit md:justify-self-end">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs md:text-sm text-emerald-300 font-semibold">{ABOUT.availability}</span>
              </div>
            </div>

            <div ref={statsRef} className="about-info-card opacity-0 grid grid-cols-1 sm:grid-cols-3 border-b border-white/10 pb-5 md:pb-6">
              {STATS.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`py-3 sm:py-0 text-left sm:text-center ${idx > 0 ? "sm:border-l sm:border-white/10" : ""}`}
                >
                  <div className="text-4xl sm:text-3xl font-bold text-white font-display leading-none">
                    {statsInView ? (
                      <CountUp end={stat.value} duration={2} suffix={stat.suffix} enableScrollSpy scrollSpyOnce />
                    ) : (
                      `0${stat.suffix}`
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 uppercase tracking-[0.15em]">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="about-text-item opacity-0">
              <p className="text-xs uppercase tracking-[0.2em] text-subtle mb-3">Currently Focused On</p>
              <div className="flex flex-wrap gap-2.5">
                {ABOUT.focusedOn.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm rounded-full border border-blue-300/20 text-blue-100/90 bg-linear-to-r from-blue-500/12 to-transparent"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-300/75" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

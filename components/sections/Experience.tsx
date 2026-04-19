"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MapPin, Calendar, Briefcase } from "lucide-react";
import ScrollHighlightText from "@/components/ui/ScrollHighlightText";
import { experiences as EXPERIENCES_FALLBACK } from "@/components/experience-data";
import type { Experience as ExperienceItem } from "@/components/experience-data";
import SectionHeading from "@/components/ui/SectionHeading";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>(EXPERIENCES_FALLBACK);

  useEffect(() => {
    let mounted = true;

    const loadExperience = async () => {
      try {
        const response = await fetch("/api/public/experience", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as ExperienceItem[];
        if (!mounted || !Array.isArray(data) || !data.length) return;

        setExperienceList(data);
        requestAnimationFrame(() => ScrollTrigger.refresh());
      } catch {
        // keep fallback list
      }
    };

    void loadExperience();
    return () => {
      mounted = false;
    };
  }, []);

  useGSAP(
    () => {
      if (reduced) return;

      if (lineRef.current && svgRef.current) {
        const length = 600;
        gsap.set(lineRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(lineRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 1,
          },
        });
      }

      const dots = sectionRef.current?.querySelectorAll(".timeline-dot");
      if (dots) {
        dots.forEach((dot) => {
          gsap.fromTo(
            dot,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out(2)",
              scrollTrigger: {
                trigger: dot,
                start: "top 75%",
                toggleActions: "play none none none",
              },
            },
          );
        });
      }

      const cards = sectionRef.current?.querySelectorAll(".exp-card");
      if (cards) {
        cards.forEach((card, i) => {
          const isLeft = i % 2 === 0;
          gsap.fromTo(
            card,
            { x: isLeft ? -60 : 60, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            },
          );
        });
      }

      const badges = sectionRef.current?.querySelectorAll(".exp-badge");
      if (badges) {
        gsap.fromTo(
          badges,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 50%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    },
    { scope: sectionRef, dependencies: [experienceList.length] },
  );

  if (!experienceList.length) return null;

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-transparent overflow-hidden"
    >
      <div
        className="absolute top-1/3 right-0 w-96 h-96 opacity-8 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <SectionHeading
          eyebrow="Career"
          title="Work Experience"
          subtitle="My professional journey and the impact I've made along the way."
          align="center"
        />

        <div className="mt-16 relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2">
            <svg
              ref={svgRef}
              width="2"
              height="100%"
              className="h-full"
              style={{ minHeight: `${experienceList.length * 260}px` }}
            >
              <line ref={lineRef} x1="1" y1="0" x2="1" y2="100%" stroke="url(#lineGrad)" strokeWidth="2" />
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="md:hidden absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-blue-500/20" />

          <div className="flex flex-col gap-12 md:gap-0">
            {experienceList.map((exp, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={exp.id}
                  className={`relative flex md:grid md:grid-cols-2 gap-0 md:gap-8 pl-12 md:pl-0 ${
                    isLeft ? "" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className="timeline-dot md:hidden absolute left-3.5 top-6 w-3 h-3 rounded-full border-2 border-primary bg-background z-10"
                    style={{ boxShadow: `0 0 12px ${exp.accent}60` }}
                  />

                  <div
                    className="timeline-dot hidden md:block absolute left-1/2 top-8 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10"
                    style={{
                      borderColor: exp.accent,
                      background: "var(--background)",
                      boxShadow: `0 0 16px ${exp.accent}60`,
                    }}
                  />

                  <div className={`exp-card w-full md:py-6 ${isLeft ? "md:col-start-1 md:pr-12" : "md:col-start-2 md:pl-12"}`}>
                    <div className="glass border border-white/8 rounded-2xl p-5 md:p-6 hover:border-white/15 transition-all duration-300 group">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-white text-lg leading-tight">{exp.title}</h3>
                          <p className="font-semibold text-sm mt-0.5" style={{ color: exp.accent }}>
                            {exp.company}
                          </p>
                        </div>
                        {exp.current && (
                          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {exp.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {exp.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {exp.location}
                        </span>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {exp.description.map((line, ai) => (
                          <li key={ai} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: exp.accent }} />
                            <ScrollHighlightText
                              as="span"
                              text={line}
                              className="inline leading-relaxed text-muted-foreground"
                              triggerStart="top 84%"
                            />
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-1.5">
                        {exp.tech.map((tech) => (
                          <span
                            key={tech}
                            className="exp-badge opacity-0 px-2 py-0.5 text-xs rounded border border-white/10 bg-white/[0.03] text-muted-foreground font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`hidden md:block ${isLeft ? "md:col-start-2" : "md:col-start-1"}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

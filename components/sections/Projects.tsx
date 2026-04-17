"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "@/components/ui/SocialIcons";
import SectionHeading from "@/components/ui/SectionHeading";
import { projects as PROJECT_LIST } from "@/components/project-data";
import type { Project } from "@/components/project-data";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

function ProjectCard({ project, isActive }: { project: Project; isActive: boolean }) {
  return (
    <div
      className={`relative w-full rounded-2xl border px-5 py-6 md:px-6 md:py-7 transition-all duration-300 ${isActive
        ? "border-blue-400/55 bg-blue-500/[0.05] shadow-[0_0_0_1px_rgba(59,130,246,0.14),0_14px_55px_rgba(2,8,30,0.3)]"
        : "border-white/10 bg-slate-950/35"
        }`}
    >
      {isActive && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] rounded-full"
          style={{
            background: "linear-gradient(90deg, #22d3ee 0%, #3b82f6 36%, #8b5cf6 68%, #ec4899 100%)",
          }}
        />
      )}

      <div className="mb-4 flex items-center gap-3">
        <span
          className="rounded border px-2 py-0.5 text-xs font-mono font-semibold"
          style={{
            color: project.accent,
            borderColor: `${project.accent}4d`,
            background: `${project.accent}1f`,
          }}
        >
          {String(project.id).padStart(2, "0")}
        </span>
        <span className="rounded border border-white/10 px-2 py-0.5 text-xs text-subtle">{project.role}</span>
      </div>

      <h3 className={`mb-1 text-3xl font-bold tracking-tight ${isActive ? "text-white" : "text-slate-200"}`}>{project.title}</h3>
      <p className="mb-4 text-sm font-medium" style={{ color: project.accent }}>
        {project.subtitle}
      </p>

      {Array.isArray(project.description) ? (
        <ul className="mb-5 max-w-xl list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:text-slate-500">
          {project.description.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-5 max-w-xl text-base leading-relaxed text-muted-foreground">{project.description}</p>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <span key={`${project.id}-${tech}`} className="rounded-lg border border-white/14 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-300">
            {tech}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-5">
        <a
          href={project.demo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: project.accent }}
        >
          Live Demo
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-white"
        >
          <GitHubIcon className="h-3.5 w-3.5" />
          Source
        </a>
      </div>
    </div>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightRailRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imageLayerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imageShellRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const reduced = useReducedMotion();
  const [captured, setCaptured] = useState(false);
  const activeProject = useMemo(
    () => PROJECT_LIST[Math.min(activeIdx, PROJECT_LIST.length - 1)],
    [activeIdx]
  );

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.fromTo(
        ".projects-heading",
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      if (reduced) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        const layers = imageLayerRefs.current.filter(Boolean) as HTMLDivElement[];
        const leftColumn = leftColumnRef.current;
        const rightRail = rightRailRef.current;

        if (!cards.length || !layers.length || !leftColumn || !rightRail) return;

        setActiveIdx(0);

        gsap.set(layers, {
          clipPath: "inset(0% 0% 0% 0% round 1.2rem)",
          willChange: "clip-path",
        });
        layers.forEach((layer, idx) => {
          gsap.set(layer, { zIndex: layers.length - idx });
        });

        gsap.set(cards, { opacity: 0.62, y: 24 });
        gsap.set(cards[0], { opacity: 1, y: 0 });

        const imageShell = imageShellRef.current;
        const secondCard = cards[1];

        if (!imageShell || !secondCard) return;

        gsap.set(imageShell, { y: 0 });

        ScrollTrigger.create({
          trigger: secondCard,
          start: "top center",
          endTrigger: leftColumn,
          end: "bottom bottom-=196",
          pin: rightRail,
          pinSpacing: false,
          invalidateOnRefresh: true,
          onEnter: () => gsap.to(imageShell, { y: 520, duration: 0.45, ease: "power2.out" }),
          onEnterBack: () => gsap.to(imageShell, { y: 520, duration: 0.45, ease: "power2.out" }),
          onLeaveBack: () => gsap.to(imageShell, { y: 0, duration: 0.3, ease: "power2.out" }),
        });
        cards.forEach((card, idx) => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 78%",
              end: "top 48%",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          ScrollTrigger.create({
            trigger: card,
            start: "top center+=24",
            end: "bottom center-=24",
            onEnter: () => setActiveIdx(idx),
            onEnterBack: () => setActiveIdx(idx),
          });
        });

        for (let i = 0; i < layers.length - 1; i += 1) {
          const topLayer = layers[i];
          const nextCard = cards[i + 1];

          gsap.to(topLayer, {
            clipPath: "inset(100% 0% 0% 0% round 1.2rem)",
            ease: "none",
            scrollTrigger: {
              trigger: nextCard,
              start: "top 76%",
              end: "top 42%",
              scrub: 0.9,
              invalidateOnRefresh: true,
            },
          });
        }
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section id="projects" ref={sectionRef} className="relative overflow-hidden bg-transparent py-24 lg:py-28">
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
      />

      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="projects-heading opacity-0">
          <SectionHeading
            eyebrow="Selected Work"
            title="Projects & Case Studies"
            subtitle="A curated selection of products I\'ve built - from real estate platforms to enterprise SaaS."
            align="left"
          />
        </div>

        <div className="mt-14 hidden lg:grid lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] lg:gap-12">
          <div ref={leftColumnRef} className="relative">
            {PROJECT_LIST.map((project, idx) => (
              <div
                key={project.id}
                ref={(node) => {
                  cardRefs.current[idx] = node;
                }}
                className="project-step flex min-h-[52vh] items-center"
              >
                <ProjectCard project={project} isActive={activeIdx === idx} />
              </div>
            ))}
          </div>

          <div className="relative">
            <div ref={rightRailRef} className="relative flex h-[calc(100vh-6.5rem)] items-start justify-center">
              <div
                ref={imageShellRef}
                className={`relative w-full max-w-[820px] transition-all duration-500 ${captured ? "translate-y-28" : "translate-y-0"
                  }`}
              >
                <div className="relative w-full max-w-[820px]">
                  <div
                    className="relative aspect-16/11 overflow-hidden rounded-[1.2rem] border border-white/20 bg-slate-950/65 shadow-[0_22px_70px_rgba(2,8,30,0.55)]"
                    style={{ boxShadow: `0 22px 70px ${activeProject.accent}2b` }}
                  >
                    <div className="absolute inset-0">
                      {PROJECT_LIST.map((project, idx) => (
                        <div
                          key={`${project.id}-${project.image}`}
                          ref={(node) => {
                            imageLayerRefs.current[idx] = node;
                          }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={project.image}
                            alt={`${project.title} showcase image`}
                            fill
                            sizes="(max-width: 1224px) 100vw, 48vw"
                            className="object-cover object-center"
                            priority={idx === 0}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />

                    <div className="absolute bottom-0 w-full left-0 right-0 bg-black/40 z-40 rounded-lg rounded-t-none py-2 px-4">
                      <h3 className="mt-1 text-lg font-semibold text-white">{activeProject.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-8 lg:hidden">
          {PROJECT_LIST.map((project) => (
            <article key={`mobile-${project.id}`} className="overflow-hidden rounded-2xl border border-white/12 bg-slate-950/40 p-5">
              <ProjectCard project={project} isActive />
              <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-xl border border-white/12">
                <Image
                  src={project.image}
                  alt={`${project.title} mobile preview`}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/55 to-transparent" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

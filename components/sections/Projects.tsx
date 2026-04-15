"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "@/components/ui/SocialIcons";
import { PROJECTS } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftPinRef = useRef<HTMLDivElement>(null);
  const previewRootRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !sectionRef.current) return;
      const entries = entryRefs.current.filter(Boolean) as HTMLDivElement[];

      gsap.fromTo(
        ".projects-heading",
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Pin left panel for the whole project narrative.
      if (leftPinRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top+=84",
          end: "bottom bottom-=120",
          pin: leftPinRef.current,
          pinSpacing: true,
          invalidateOnRefresh: true,
        });
      }

      // Right cards drive active project (GSAP, not IO).
      entries.forEach((entry, idx) => {
        ScrollTrigger.create({
          trigger: entry,
          start: "top center+=30",
          end: "bottom center",
          onEnter: () => setActiveIdx(idx),
          onEnterBack: () => setActiveIdx(idx),
        });

        gsap.fromTo(
          entry,
          { opacity: 0.45, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: entry,
              start: "top 86%",
              end: "top 52%",
              scrub: true,
            },
          }
        );
      });

      // Subtle scrubbed motion for left preview image depth.
      const previewImg = previewRootRef.current?.querySelector(".project-preview-image");
      if (previewImg) {
        gsap.fromTo(
          previewImg,
          { scale: 1, yPercent: 0 },
          {
            scale: 1.035,
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      if (!previewRootRef.current) return;
      const parts = previewRootRef.current.querySelectorAll(".preview-anim");
      gsap.fromTo(
        parts,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" }
      );
    },
    { scope: previewRootRef, dependencies: [activeIdx] }
  );

  const project = PROJECTS[activeIdx];

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative bg-transparent py-24 md:py-0 overflow-hidden"
    >
      {/* Background accent */}
      <div
        className="absolute top-1/2 left-0 w-96 h-96 opacity-8 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {/* Heading */}
        <div className="projects-heading opacity-0 pt-24 pb-12 md:pb-16">
          <SectionHeading
            eyebrow="Selected Work"
            title="Projects & Case Studies"
            subtitle="A curated selection of products I've built — from real estate platforms to enterprise SaaS."
            align="left"
          />
        </div>

        {/* ── Sticky layout ── */}
        <div className="md:grid md:grid-cols-[1fr_1.1fr] gap-16 md:min-h-screen">

          {/* ── Left sticky preview ── */}
          <div ref={leftPinRef} className="hidden md:block h-screen">
            <div className="h-full flex flex-col justify-start pt-8">
              <div ref={previewRootRef} className="flex flex-col gap-5">
                <div
                  className="preview-anim relative rounded-2xl overflow-hidden border h-[300px] lg:h-[360px] shadow-2xl"
                  style={{
                    borderColor: `${project.accent}30`,
                    boxShadow: `0 20px 80px ${project.accent}15`,
                  }}
                >
                  <Image
                    key={project.image}
                    src={project.image}
                    alt={`${project.title} preview`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="project-preview-image object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/65 via-background/20 to-transparent" />
                  <div className="preview-anim absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{project.subtitle}</p>
                    <h3 className="text-white font-semibold text-lg">{project.title}</h3>
                  </div>

                  <div
                    className="absolute top-0 right-0 w-32 h-32 blur-2xl opacity-30 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${project.accent}, transparent 70%)` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right scrollable list ── */}
          <div className="flex flex-col">
            {PROJECTS.map((proj, i) => (
              <div
                key={proj.id}
                ref={(el) => {
                  entryRefs.current[i] = el;
                }}
                className={`project-entry relative py-12 md:py-16 border-b last:border-0 transition-all duration-300 ${
                  i === activeIdx ? "border-blue-400/60 bg-blue-500/3 shadow-[0_0_0_1px_rgba(59,130,246,0.12),0_0_40px_rgba(59,130,246,0.08)] rounded-xl px-4 md:px-6" : "border-white/8"
                }`}
              >
                {i === activeIdx && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 bottom-0 h-[3px] rounded-full opacity-90"
                    style={{
                      background:
                        "linear-gradient(90deg, #22d3ee 0%, #3b82f6 35%, #8b5cf6 68%, #ec4899 100%)",
                    }}
                  />
                )}
                <div className="group cursor-default">
                  {/* Index + role */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded border"
                      style={{
                        color: proj.accent,
                        borderColor: `${proj.accent}40`,
                        background: i === activeIdx ? `${proj.accent}22` : `${proj.accent}10`,
                      }}
                    >
                      {String(proj.id).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-subtle border border-white/8 px-2 py-0.5 rounded">
                      {proj.role}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl md:text-3xl font-bold mb-2 group-hover:text-blue-100 transition-colors ${i === activeIdx ? "text-white" : "text-slate-200"}`}>
                    {proj.title}
                  </h3>
                  <p className="text-sm font-medium mb-4" style={{ color: proj.accent }}>
                    {proj.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-6 max-w-lg">
                    {proj.description}
                  </p>

                  {/* Stack chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {proj.stack.map((tech) => (
                      <span
                        key={tech}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border text-muted-foreground ${
                          i === activeIdx ? "border-white/20 bg-white/5" : "border-white/10 bg-white/3"
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex gap-4">
                    <a
                      href={proj.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-center gap-1.5 text-sm font-medium transition-colors"
                      style={{ color: proj.accent }}
                    >
                      Live Demo
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                    <a
                      href={proj.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      <GitHubIcon className="w-3.5 h-3.5" />
                      Source
                    </a>
                  </div>

                  {/* Mobile project card */}
                  <div
                    className="md:hidden mt-6 rounded-xl p-4 border"
                    style={{
                      borderColor: `${proj.accent}25`,
                      background: `${proj.accent}08`,
                    }}
                  >
                    <div className="relative h-36 w-full rounded-lg overflow-hidden border border-white/10 mb-3">
                      <Image
                        src={proj.image}
                        alt={`${proj.title} mobile preview`}
                        fill
                        sizes="100vw"
                        className="object-cover object-top"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{proj.tag}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

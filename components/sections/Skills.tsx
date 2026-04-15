"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { IconType } from "react-icons";
import { FaAws, FaDatabase } from "react-icons/fa6";
import {
  SiAngular,
  SiDocker,
  SiDotnet,
  SiExpress,
  SiGithubactions,
  SiGraphql,
  SiMongodb,
  SiMongoose,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import { LuCloud, LuNetwork } from "react-icons/lu";
import SectionHeading from "@/components/ui/SectionHeading";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type Tool = { name: string; color: string };
type Lane = { id: string; label: string; accent: string; tools: Tool[] };

const ICONS: Record<string, IconType> = {
  React: SiReact,
  "Next.js": SiNextdotjs,
  TypeScript: SiTypescript,
  "Tailwind CSS": SiTailwindcss,
  GSAP: LuNetwork,
  Angular: SiAngular,
  "Node.js": SiNodedotjs,
  "Express.js": SiExpress,
  NestJS: SiNestjs,
  GraphQL: SiGraphql,
  REST: LuNetwork,
  ".NET MVC": SiDotnet,
  PostgreSQL: SiPostgresql,
  MySQL: SiMysql,
  MSSQL: FaDatabase,
  MongoDB: SiMongodb,
  Prisma: SiPrisma,
  Mongoose: SiMongoose,
  AWS: FaAws,
  Docker: SiDocker,
  Vercel: SiVercel,
  "CI/CD": LuCloud,
  CloudWatch: LuCloud,
  "GitHub Actions": SiGithubactions,
};

const LANES: Lane[] = [
  {
    id: "frontend",
    label: "Frontend",
    accent: "#60a5fa",
    tools: [
      { name: "React", color: "#61dafb" },
      { name: "Next.js", color: "#e2e8f0" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "Tailwind CSS", color: "#38bdf8" },
      { name: "GSAP", color: "#8bc34a" },
      { name: "Angular", color: "#dd0031" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    accent: "#a78bfa",
    tools: [
      { name: "Node.js", color: "#8cc84b" },
      { name: "Express.js", color: "#d1d5db" },
      { name: "NestJS", color: "#e0234e" },
      { name: "GraphQL", color: "#e10098" },
      { name: "REST", color: "#3b82f6" },
      { name: ".NET MVC", color: "#8b5cf6" },
    ],
  },
  {
    id: "database",
    label: "Database",
    accent: "#34d399",
    tools: [
      { name: "PostgreSQL", color: "#336791" },
      { name: "MySQL", color: "#4479a1" },
      { name: "MSSQL", color: "#cc2927" },
      { name: "MongoDB", color: "#47a248" },
      { name: "Prisma", color: "#5a67d8" },
      { name: "Mongoose", color: "#b91c1c" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud / DevOps",
    accent: "#f59e0b",
    tools: [
      { name: "AWS", color: "#ff9900" },
      { name: "Docker", color: "#2496ed" },
      { name: "Vercel", color: "#e2e8f0" },
      { name: "CI/CD", color: "#60a5fa" },
      { name: "CloudWatch", color: "#f59e0b" },
      { name: "GitHub Actions", color: "#818cf8" },
    ],
  },
];

function ToolChip({ tool }: { tool: Tool }) {
  const Icon = ICONS[tool.name];

  return (
    <span
      className="skill-chip inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-slate-100/95 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.32)]"
      style={{
        borderColor: `${tool.color}35`,
        background: `linear-gradient(180deg, ${tool.color}20 0%, rgba(2,6,23,0.56) 100%)`,
      }}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full" style={{ background: `${tool.color}24` }}>
        {Icon ? <Icon className="h-3.5 w-3.5" style={{ color: tool.color }} /> : <span className="h-1.5 w-1.5 rounded-full" style={{ background: tool.color }} />}
      </span>
      {tool.name}
    </span>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [activeLane, setActiveLane] = useState(0);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.fromTo(
        ".skills-heading",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );

      if (reduced) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".skill-lane-card", sectionRef.current);

        cards.forEach((card, idx) => {
          const chips = card.querySelectorAll(".skill-chip");
          const glow = card.querySelector(".skill-lane-glow");
          const fromX = idx % 2 === 0 ? -180 : 180;
          const fromRotate = idx % 2 === 0 ? -5 : 5;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              end: "top 54%",
              scrub: 0.75,
              invalidateOnRefresh: true,
              onToggle: (self) => {
                if (self.isActive) setActiveLane(idx);
              },
            },
          });

          tl.fromTo(
            card,
            {
              x: fromX,
              y: 110,
              rotate: fromRotate,
              opacity: 0,
              filter: "blur(8px)",
            },
            {
              x: 0,
              y: 0,
              rotate: 0,
              opacity: 1,
              filter: "blur(0px)",
              ease: "power3.out",
            },
            0
          );

          tl.fromTo(
            chips,
            { y: 16, opacity: 0, scale: 0.94 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.28,
              stagger: 0.04,
              ease: "back.out(1.35)",
            },
            0.14
          );

          if (glow) {
            tl.fromTo(glow, { opacity: 0.16, scale: 0.88 }, { opacity: 0.36, scale: 1, duration: 0.4 }, 0);
          }
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.fromTo(
          ".skill-lane-card",
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section id="skills" ref={sectionRef} className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-56 pointer-events-none opacity-25"
        style={{ background: "radial-gradient(ellipse at top, rgba(59,130,246,0.42), transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="skills-heading opacity-0">
          <SectionHeading
            eyebrow="Tech Stack"
            title="Engineering Stack"
            subtitle="A premium vertical stack reveal of the technologies behind my production work."
            align="left"
          />
        </div>

        <div className="mt-12 flex flex-col gap-5 md:gap-6">
          {LANES.map((lane, idx) => (
            <article
              key={lane.id}
              className={`skill-lane-card relative rounded-2xl border p-4 md:p-5 overflow-hidden transition-all duration-300 ${
                idx === activeLane ? "border-white/20 bg-slate-900/65" : "border-white/10 bg-slate-950/45"
              }`}
            >
              <div
                className="skill-lane-glow pointer-events-none absolute -right-8 -bottom-10 h-36 w-36 rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${lane.accent}, transparent 70%)` }}
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
                <div className="flex items-center gap-3 md:w-56 md:shrink-0">
                 
                  <div>
                    <p className="text-sm md:text-base font-semibold" style={{ color: idx === activeLane ? "#f8fafc" : lane.accent }}>
                      {lane.label}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap gap-2.5">
                    {lane.tools.map((tool) => (
                      <ToolChip key={`${lane.id}-${tool.name}`} tool={tool} />
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

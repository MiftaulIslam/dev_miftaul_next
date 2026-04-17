"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHeading from "@/components/ui/SectionHeading";
import type { StackCategory } from "@/lib/dashboard/types";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type Tool = { name: string; color: string; iconName?: string };
type Lane = { id: string; label: string; accent: string; tools: Tool[] };

/** Name-based fallbacks under `/public/tech_icons/` */
const TECH_ICON_SRC: Record<string, string> = {
  React: "/tech_icons/React.svg",
  "Next.js": "/tech_icons/Next.js.svg",
  TypeScript: "/tech_icons/TypeScript.svg",
  "Tailwind CSS": "/tech_icons/Tailwind-CSS.svg",
  GSAP: "/tech_icons/JavaScript.svg",
  Angular: "/tech_icons/Angular.svg",
  "Node.js": "/tech_icons/Node.js.svg",
  "Express.js": "/tech_icons/Express.svg",
  NestJS: "/tech_icons/Nest.js.svg",
  GraphQL: "/tech_icons/GraphQL.svg",
  REST: "/tech_icons/OpenAPI.svg",
  ".NET MVC": "/tech_icons/.NET-core.svg",
  PostgreSQL: "/tech_icons/PostgresSQL.svg",
  MySQL: "/tech_icons/MySQL.svg",
  MSSQL: "/tech_icons/Microsoft-SQL-Server.svg",
  MongoDB: "/tech_icons/MongoDB.svg",
  Prisma: "/tech_icons/Sequelize.svg",
  Mongoose: "/tech_icons/Mongoose.js.svg",
  AWS: "/tech_icons/AWS.svg",
  Docker: "/tech_icons/Docker.svg",
  Vercel: "/tech_icons/Vercel.svg",
  "CI/CD": "/tech_icons/Jenkins.svg",
  CloudWatch: "/tech_icons/AWS.svg",
  "GitHub Actions": "/tech_icons/GitHub-Actions.svg",
};

const FALLBACK_LANES: Lane[] = [
  {
    id: "frontend",
    label: "Frontend",
    accent: "#60a5fa",
    tools: [
      { name: "React", color: "#61dafb", iconName: "React" },
      { name: "Next.js", color: "#e2e8f0", iconName: "Next.js" },
      { name: "TypeScript", color: "#3178c6", iconName: "TypeScript" },
      { name: "Tailwind CSS", color: "#38bdf8", iconName: "Tailwind-CSS" },
      { name: "GSAP", color: "#8bc34a", iconName: "JavaScript" },
      { name: "Angular", color: "#dd0031", iconName: "Angular" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    accent: "#a78bfa",
    tools: [
      { name: "Node.js", color: "#8cc84b", iconName: "Node.js" },
      { name: "Express.js", color: "#d1d5db", iconName: "Express" },
      { name: "NestJS", color: "#e0234e", iconName: "Nest.js" },
      { name: "GraphQL", color: "#e10098", iconName: "GraphQL" },
      { name: "REST", color: "#3b82f6", iconName: "OpenAPI" },
      { name: ".NET MVC", color: "#8b5cf6", iconName: "C#-(CSharp)" },
    ],
  },
  {
    id: "database",
    label: "Database",
    accent: "#34d399",
    tools: [
      { name: "PostgreSQL", color: "#336791", iconName: "PostgresSQL" },
      { name: "MySQL", color: "#4479a1", iconName: "MySQL" },
      { name: "MSSQL", color: "#cc2927", iconName: "Microsoft-SQL-Server" },
      { name: "MongoDB", color: "#47a248", iconName: "MongoDB" },
      { name: "Prisma", color: "#5a67d8", iconName: "Prisma" },
      { name: "Mongoose", color: "#b91c1c", iconName: "Mongoose.js" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud / DevOps",
    accent: "#f59e0b",
    tools: [
      { name: "AWS", color: "#ff9900", iconName: "AWS" },
      { name: "Docker", color: "#2496ed", iconName: "Docker" },
      { name: "Vercel", color: "#e2e8f0", iconName: "Vercel" },
      { name: "CI/CD", color: "#60a5fa", iconName: "Jenkins" },
      { name: "CloudWatch", color: "#f59e0b", iconName: "AWS" },
      { name: "GitHub Actions", color: "#818cf8", iconName: "GitHub-Actions" },
    ],
  },
];

function mapCategoryToLane(category: StackCategory): Lane {
  return {
    id: category.key || String(category.id),
    label: category.label,
    accent: category.accent,
    tools: category.tools.map((tool) => ({
      name: tool.name,
      color: tool.color,
      iconName: tool.iconName,
    })),
  };
}

function resolveIconSrc(tool: Tool) {
  if (tool.iconName) {
    if (tool.iconName.startsWith("/")) return tool.iconName;
    return `/tech_icons/${tool.iconName.endsWith(".svg") ? tool.iconName : `${tool.iconName}.svg`}`;
  }

  return TECH_ICON_SRC[tool.name] ?? null;
}

function ToolChip({ tool }: { tool: Tool }) {
  const src = resolveIconSrc(tool);

  return (
    <span
      className="skill-chip inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-slate-100/95 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.32)]"
      style={{
        borderColor: `${tool.color}35`,
        background: `linear-gradient(180deg, ${tool.color}20 0%, rgba(2,6,23,0.56) 100%)`,
      }}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full" style={{ background: `${tool.color}24` }}>
        {src ? (
          <Image src={src} alt="" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: tool.color }} />
        )}
      </span>
      {tool.name}
    </span>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [lanes, setLanes] = useState<Lane[]>(FALLBACK_LANES);
  const [activeLane, setActiveLane] = useState(0);
  const safeActiveLane = Math.min(activeLane, Math.max(lanes.length - 1, 0));

  useEffect(() => {
    let mounted = true;

    const loadSkills = async () => {
      try {
        const response = await fetch("/api/public/skills", { cache: "no-store" });
        if (!response.ok) return;
        const categories = (await response.json()) as StackCategory[];
        if (!mounted || !Array.isArray(categories) || !categories.length) return;

        const nextLanes = categories.map(mapCategoryToLane).filter((lane) => lane.tools.length > 0);
        if (nextLanes.length) {
          setLanes(nextLanes);
          setActiveLane(0);
          requestAnimationFrame(() => ScrollTrigger.refresh());
        }
      } catch {
        // keep fallback lanes
      }
    };

    void loadSkills();
    return () => {
      mounted = false;
    };
  }, []);

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
        },
      );

      if (reduced) return;

      const mm = gsap.matchMedia();
      const resetSkillsVisual = () => {
        const cards = gsap.utils.toArray<HTMLElement>(".skill-lane-card", sectionRef.current);
        gsap.set(cards, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", x: 0, clearProps: "visibility" });
        cards.forEach((card) => {
          gsap.set(card.querySelectorAll(".skill-chip"), { opacity: 1, y: 0, scale: 1 });
          gsap.set(card.querySelector(".skill-lane-glow"), { opacity: 0.24, scale: 1 });
        });
      };

      const runStackReveal = () => {
        const cards = gsap.utils.toArray<HTMLElement>(".skill-lane-card", sectionRef.current);
        if (!cards.length) return;

        gsap.set(cards, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", x: 0 });
        cards.forEach((card) => {
          const glow = card.querySelector(".skill-lane-glow");
          if (glow) gsap.set(glow, { opacity: 0.18, scale: 0.92 });
          gsap.set(card.querySelectorAll(".skill-chip"), { opacity: 0.72, y: 0, scale: 1 });
        });
        setActiveLane(0);

        cards.forEach((card, idx) => {
          const chips = card.querySelectorAll(".skill-chip");
          const glow = card.querySelector(".skill-lane-glow");
          ScrollTrigger.create({
            trigger: card,
            start: "top center+=40",
            end: "bottom center",
            onEnter: () => setActiveLane(idx),
            onEnterBack: () => setActiveLane(idx),
          });

          gsap.fromTo(
            card,
            { y: 42, opacity: 0.56, scale: 0.98 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 86%",
                end: "top 56%",
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            },
          );

          gsap.to(chips, {
            opacity: 1,
            duration: 0.22,
            stagger: 0.03,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          });

          if (glow) {
            gsap.to(glow, {
              opacity: 0.34,
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 78%",
                toggleActions: "play none none reverse",
              },
            });
          }
        });
      };

      mm.add("(min-width: 768px)", runStackReveal);
      mm.add("(max-width: 767px)", runStackReveal);

      const handleNavJump = (event: Event) => {
        const custom = event as CustomEvent<{ id?: string }>;
        if (custom.detail?.id !== "skills") return;
        setActiveLane(0);
        resetSkillsVisual();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      const handleNavSettled = (event: Event) => {
        const custom = event as CustomEvent<{ id?: string }>;
        if (custom.detail?.id !== "skills") return;
        setActiveLane(0);
        resetSkillsVisual();
        ScrollTrigger.refresh();
      };

      window.addEventListener("nav-section-jump", handleNavJump as EventListener);
      window.addEventListener("nav-section-settled", handleNavSettled as EventListener);

      return () => {
        window.removeEventListener("nav-section-jump", handleNavJump as EventListener);
        window.removeEventListener("nav-section-settled", handleNavSettled as EventListener);
        mm.revert();
      };
    },
    { scope: sectionRef, dependencies: [lanes.length] },
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
          {lanes.map((lane, idx) => (
            <article
              key={lane.id}
              className={`skill-lane-card relative rounded-2xl border p-4 md:p-5 overflow-hidden transition-all duration-300 ${
                idx === safeActiveLane ? "border-white/20 bg-slate-900/65" : "border-white/10 bg-slate-950/45"
              }`}
            >
              <div
                className="skill-lane-glow pointer-events-none absolute -right-8 -bottom-10 h-36 w-36 rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${lane.accent}, transparent 70%)` }}
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
                <div className="flex items-center gap-3 md:w-56 md:shrink-0">
                  <div>
                    <p className="text-sm md:text-base font-semibold" style={{ color: idx === safeActiveLane ? "#f8fafc" : lane.accent }}>
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

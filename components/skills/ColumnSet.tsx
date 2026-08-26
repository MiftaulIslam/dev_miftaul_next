"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/cn";
import type { SkillCategory } from "@/types/skills";
import type { StackCategory } from "@/lib/dashboard/types";
import { mapStackCategories } from "@/lib/skills-data";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const VERTICAL_QUERY = "(max-width: 767.98px)";

function monogram(name: string): string {
  const parts = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return initials.toUpperCase();
}

function cssVars(layer: string, k?: number, w?: number): CSSProperties {
  const vars: Record<string, string | number> = { "--layer": layer };
  if (k !== undefined) vars["--k"] = k;
  if (w !== undefined) vars["--w"] = w;
  return vars as CSSProperties;
}

export default function ColumnSet({ initialCategories }: { initialCategories: SkillCategory[] }) {
  const [categories, setCategories] = useState<SkillCategory[]>(initialCategories);
  const [openIndex, setOpenIndex] = useState(0);
  const [vertical, setVertical] = useState(false);

  const spineRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const total = categories.length;
  const safeOpen = Math.min(openIndex, Math.max(total - 1, 0));

  const tabIds = useMemo(() => categories.map((category) => `cols-tab-${category.id}`), [categories]);
  const owns = useMemo(() => tabIds.join(" "), [tabIds]);

  useEffect(() => {
    const mq = window.matchMedia(VERTICAL_QUERY);
    const sync = () => setVertical(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/public/skills", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as StackCategory[];
        if (!mounted || !Array.isArray(data) || !data.length) return;
        const mapped = mapStackCategories(data);
        if (!mounted || !mapped.length) return;
        setCategories(mapped);
        setOpenIndex((current) => Math.min(current, mapped.length - 1));
      } catch {
        // keep server-rendered categories
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const reset = (event: Event) => {
      const custom = event as CustomEvent<{ id?: string }>;
      if (custom.detail?.id && custom.detail.id !== "skills") return;
      setOpenIndex(0);
    };
    window.addEventListener("nav-section-jump", reset as EventListener);
    window.addEventListener("nav-section-settled", reset as EventListener);
    return () => {
      window.removeEventListener("nav-section-jump", reset as EventListener);
      window.removeEventListener("nav-section-settled", reset as EventListener);
    };
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("skills:planes-changed"));
    });
    return () => cancelAnimationFrame(raf);
  }, [total]);

  const selectStrip = (index: number) => {
    setOpenIndex(index);
    requestAnimationFrame(() => spineRefs.current[index]?.focus());
  };

  const handlePointerOver = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia(HOVER_QUERY).matches) return;
    const strip = (event.target as HTMLElement).closest<HTMLElement>("[data-col-index]");
    if (!strip) return;
    const index = Number(strip.dataset.colIndex);
    if (!Number.isInteger(index) || index === openIndex) return;
    setOpenIndex(index);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!(event.target as HTMLElement).closest("[role='tab']")) return;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (openIndex + 1) % total;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (openIndex - 1 + total) % total;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = total - 1;
    if (next === null) return;
    event.preventDefault();
    selectStrip(next);
  };

  return (
    <div
      role="tablist"
      aria-orientation={vertical ? "vertical" : "horizontal"}
      aria-label="Technology stack layers"
      aria-owns={owns}
      className="cols-set"
      onPointerOver={handlePointerOver}
      onKeyDown={handleKeyDown}
    >
      {categories.map((category, i) => {
        const open = i === safeOpen;
        return (
          <article
            key={category.id}
            data-col-index={i}
            className={cn("cols-strip", open && "is-open")}
            style={cssVars(category.accent)}
          >
            <button
              ref={(el) => {
                spineRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`cols-tab-${category.id}`}
              aria-selected={open}
              aria-controls={`cols-panel-${category.id}`}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpenIndex(i)}
              className="cols-spine"
            >
              <span className="cols-spine-index">{String(i + 1).padStart(2, "0")}</span>
              <span className="cols-spine-label">{category.label}</span>
              <span className="cols-spine-count">{category.skills.length}</span>
            </button>

            <div
              role="tabpanel"
              id={`cols-panel-${category.id}`}
              aria-labelledby={`cols-tab-${category.id}`}
              className="cols-body"
            >
              <div className="cols-parallax">
                <div className="cols-inner">
                  <p className="cols-kicker">{category.kicker}</p>
                  <h3 className="cols-title">{category.label}</h3>
                  <p className="cols-blurb">{category.blurb}</p>
                  <ul className="cols-rows">
                    {category.skills.map((skill, k) => (
                      <li key={skill.id} className="cols-row" style={cssVars(category.accent, k, skill.weight)}>
                        <span className="cols-row-icon">
                          {skill.iconSrc ? (
                            <Image src={skill.iconSrc} alt="" width={22} height={22} />
                          ) : (
                            <span className="cols-monogram" aria-hidden="true">
                              {monogram(skill.name)}
                            </span>
                          )}
                        </span>
                        <span className="cols-row-text">
                          <span className="cols-row-name">{skill.name}</span>
                          <span className="cols-row-role">{skill.role}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

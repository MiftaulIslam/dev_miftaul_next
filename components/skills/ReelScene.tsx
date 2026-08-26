import Image from "next/image";
import type { CSSProperties } from "react";
import type { SkillCategory } from "@/types/skills";

function monogram(name: string): string {
  const parts = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return initials.toUpperCase();
}

export default function ReelScene({
  category,
  index,
  total,
}: {
  category: SkillCategory;
  index: number;
  total: number;
}) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <section
      className="reel-scene"
      style={{ "--layer": category.accent } as CSSProperties}
      aria-label={`Scene ${num}, ${category.label}`}
      data-reel-scene
      data-scene-index={index}
    >
      <span className="reel-numeral" data-reel-numeral aria-hidden="true">
        {num}
      </span>

      <div className="reel-frame">
        <p className="reel-slate rv" style={{ "--d": "40ms" } as CSSProperties}>
          SC {num} / {String(total).padStart(2, "0")} — {category.layer}
        </p>
        <h3 className="reel-title rv" style={{ "--d": "90ms" } as CSSProperties}>
          {category.label}
        </h3>
        <p className="reel-kicker rv" style={{ "--d": "130ms" } as CSSProperties}>
          {category.kicker}
        </p>
        <p className="reel-blurb rv" style={{ "--d": "170ms" } as CSSProperties}>
          {category.blurb}
        </p>

        <ul className="reel-rows">
          {category.skills.map((skill, k) => (
            <li
              key={skill.id}
              className="reel-row rv"
              style={{ "--d": `${220 + k * 45}ms`, "--w": skill.weight } as CSSProperties}
            >
              <span className="reel-row-icon">
                {skill.iconSrc ? (
                  <Image src={skill.iconSrc} alt="" width={20} height={20} />
                ) : (
                  <span className="cols-monogram" aria-hidden="true">
                    {monogram(skill.name)}
                  </span>
                )}
              </span>
              <span className="reel-row-name">{skill.name}</span>
              <span className="reel-row-role">{skill.role}</span>
            </li>
          ))}
        </ul>
      </div>

      <span className="reel-rule" aria-hidden="true" />
    </section>
  );
}

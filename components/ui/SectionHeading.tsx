"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  accentColor?: string;
  titleGradient?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  accentColor = "#3b82f6",
  titleGradient = "linear-gradient(95deg, #dbeafe 0%, #7dd3fc 26%, #3b82f6 54%, #1d4ed8 76%, #0f172a 100%)",
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const words = title.split(" ");

  useGSAP(
    () => {
      if (!ref.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top 86%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(".sh-eyebrow", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power2.out" });
      tl.fromTo(
        ".sh-line-fill",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.5, ease: "power2.out" },
        0.06
      );
      tl.fromTo(
        ".sh-title-wrap",
        { clipPath: "inset(0 100% 0 0)", opacity: 0.35 },
        { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 0.62, ease: "power3.out" },
        0.1
      );
      tl.fromTo(
        ".sh-word",
        { y: 52, opacity: 0, filter: "blur(8px)", rotateX: -45 },
        { y: 0, opacity: 1, filter: "blur(0px)", rotateX: 0, duration: 0.58, stagger: 0.05, ease: "power3.out" },
        0.16
      );
      tl.to(
        ".sh-word",
        { x: (i) => (i % 2 === 0 ? 1.8 : -1.8), duration: 0.045, repeat: 3, yoyo: true, ease: "none" },
        0.34
      );
      tl.fromTo(".sh-subtitle", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.3);

      gsap.fromTo(
        ".sh-line-dot",
        { x: 0, opacity: 0.45 },
        {
          x: 84,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            end: "bottom 55%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.to(".sh-title", {
        filter: "drop-shadow(0 0 18px rgba(125,211,252,0.68)) drop-shadow(0 0 52px rgba(59,130,246,0.52))",
        repeat: -1,
        yoyo: true,
        duration: 1.9,
        ease: "sine.inOut",
      });
      gsap.to(".sh-title", {
        backgroundPositionX: "110%",
        repeat: -1,
        yoyo: true,
        duration: 3,
        ease: "sine.inOut",
      });

      gsap.to(ref.current, {
        yPercent: -14,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: ref }
  );

  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div ref={ref} className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow && (
        <div className="sh-eyebrow inline-flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: accentColor }}>
            {eyebrow}
          </span>
          <span className="relative h-px w-24 overflow-hidden rounded-full bg-white/10">
            <span className="sh-line-fill absolute inset-0" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
            <span
              className="sh-line-dot absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
              style={{
                background: accentColor,
                boxShadow: `0 0 14px ${accentColor}, 0 0 28px ${accentColor}`,
              }}
            />
          </span>
        </div>
      )}

      <div className="sh-title-wrap overflow-hidden">
        <h2
          className="sh-title text-4xl md:text-5xl font-bold tracking-tight leading-[1.06] bg-clip-text text-transparent"
          style={{
            backgroundImage: titleGradient,
            backgroundSize: "240% 100%",
            backgroundPosition: "0% 50%",
            filter: "drop-shadow(0 0 16px rgba(59,130,246,0.56))",
          }}
        >
          {words.map((word, idx) => (
            <span key={`${word}-${idx}`} className="sh-word inline-block mr-[0.28em] last:mr-0 will-change-transform">
              {word}
            </span>
          ))}
        </h2>
      </div>

      {subtitle && <p className="sh-subtitle text-base md:text-lg text-muted-foreground max-w-2xl">{subtitle}</p>}
    </div>
  );
}

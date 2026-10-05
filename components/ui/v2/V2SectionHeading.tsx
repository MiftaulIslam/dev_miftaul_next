"use client";

import { Fragment, useRef } from "react";
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

/**
 * v2: the gradient is clipped to each word rather than to the whole <h2>.
 *
 * In v1 the <h2> carried `background-clip: text` while every word was an
 * inline-block animated with transform/filter/opacity. Chrome promotes those
 * words to their own layers, and the parent's clipped background then paints
 * every glyph run at the heading's origin — the words pile up on top of each
 * other. Clipping per word keeps the background and its glyphs on one layer.
 * The default gradient also drops the near-black end stop, which made the
 * last word disappear on the dark background.
 */
export default function V2SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  accentColor = "#3b82f6",
  titleGradient = "linear-gradient(95deg, #e0f2fe 0%, #7dd3fc 40%, #60a5fa 70%, #3b82f6 100%)",
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
        duration: 0.9,
        ease: "power2.out",
      });

      const mm = gsap.matchMedia();
      // Decorative and endless, so never under reduced motion.
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        // The glow and shimmer loop forever, and an animated filter repaints the
        // heading every frame. Run them only while the heading is on screen;
        // off screen they used to cost ~360 style writes a second for nothing.
        const ambient = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            toggleActions: "play pause resume pause",
          },
        });
        // fromTo, not to: this now starts late, after the entrance tween above
        // has already reached the glow, so a recorded start would pulse from
        // the glow to itself. The from value is the resting filter in the JSX.
        ambient.fromTo(
          ".sh-title",
          { filter: "drop-shadow(0 0 16px rgba(59,130,246,0.56))" },
          {
            filter: "drop-shadow(0 0 18px rgba(125,211,252,0.68)) drop-shadow(0 0 52px rgba(59,130,246,0.52))",
            repeat: -1,
            yoyo: true,
            duration: 1.9,
            ease: "sine.inOut",
            immediateRender: false,
          },
          0
        );
        ambient.to(
          ".sh-word",
          {
            backgroundPositionX: "110%",
            repeat: -1,
            yoyo: true,
            duration: 3,
            ease: "sine.inOut",
          },
          0
        );
      });

      return () => mm.revert();
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
          className="sh-title sh-title-v2 text-4xl md:text-5xl font-bold tracking-tight leading-[1.12] pb-[0.08em]"
          style={{ filter: "drop-shadow(0 0 16px rgba(59,130,246,0.56))" }}
        >
          {/* A real space between words, not a margin: the extracted text must
              read "The Developer…", not "TheDeveloper…". */}
          {words.map((word, idx) => (
            <Fragment key={`${word}-${idx}`}>
              {idx > 0 && " "}
              <span
                className="sh-word inline-block bg-clip-text text-transparent"
                style={{
                  backgroundImage: titleGradient,
                  backgroundSize: "240% 100%",
                  backgroundPosition: "0% 50%",
                }}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </h2>
      </div>

      {subtitle && <p className="sh-subtitle text-base md:text-lg text-muted-foreground max-w-2xl">{subtitle}</p>}
    </div>
  );
}

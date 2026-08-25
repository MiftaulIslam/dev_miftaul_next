"use client";

import { useMemo, useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { useTheme } from "@/lib/theme";

gsap.registerPlugin(ScrollTrigger);

type Tone = "plain" | "white" | "blue";

interface Segment {
  tone: Tone;
  text: string;
}

interface ScrollHighlightTextProps {
  as?: ElementType;
  text: string;
  className?: string;
  triggerStart?: string;
}

function parseMarkedText(source: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  const push = (tone: Tone, text: string) => {
    if (!text) return;
    segments.push({ tone, text });
  };

  while (cursor < source.length) {
    if (source.startsWith("***", cursor)) {
      const close = source.indexOf("***", cursor + 3);
      if (close !== -1) {
        push("blue", source.slice(cursor + 3, close));
        cursor = close + 3;
        continue;
      }
    }

    if (source.startsWith("**", cursor)) {
      const close = source.indexOf("**", cursor + 2);
      if (close !== -1) {
        push("white", source.slice(cursor + 2, close));
        cursor = close + 2;
        continue;
      }
    }

    let next = source.length;
    const nextTriple = source.indexOf("***", cursor);
    const nextDouble = source.indexOf("**", cursor);
    if (nextTriple >= 0) next = Math.min(next, nextTriple);
    if (nextDouble >= 0) next = Math.min(next, nextDouble);
    if (next === cursor) next = cursor + 1;

    push("plain", source.slice(cursor, next));
    cursor = next;
  }

  return segments;
}

export default function ScrollHighlightText({
  as: Tag = "p",
  text,
  className,
  triggerStart = "top 78%",
}: ScrollHighlightTextProps) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // The tween bakes colours into inline styles, so it must re-run on theme change.
  const { theme } = useTheme();
  const segments = useMemo(() => parseMarkedText(text), [text]);

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return;

      const white = rootRef.current.querySelectorAll<HTMLElement>(".scroll-highlight-token-white");
      const blue = rootRef.current.querySelectorAll<HTMLElement>(".scroll-highlight-token-blue");

      if (!white.length && !blue.length) return;

      // The tween writes `color` inline, so CSS cannot re-theme it afterwards.
      // Read the endpoints from tokens instead; the dark values are unchanged.
      const tokens = getComputedStyle(document.documentElement);
      const token = (name: string, fallback: string) =>
        tokens.getPropertyValue(name).trim() || fallback;

      const commonTrigger = {
        trigger: rootRef.current,
        start: triggerStart,
        toggleActions: "play none none reverse",
      };

      if (white.length) {
        gsap.fromTo(
          white,
          {
            backgroundSize: "0% 100%",
            color: token("--sh-ink-from", "#9fb0c7"),
            textShadow: "0 0 0 rgba(255,255,255,0)",
          },
          {
            backgroundSize: "100% 100%",
            color: token("--sh-ink-to", "#f8fafc"),
            textShadow: `0 0 12px ${token("--sh-ink-shadow", "rgba(255,255,255,0.22)")}`,
            duration: 0.45,
            stagger: 0.07,
            ease: "power2.out",
            scrollTrigger: commonTrigger,
          },
        );
      }

      if (blue.length) {
        gsap.fromTo(
          blue,
          {
            backgroundSize: "0% 100%",
            color: token("--sh-blue-from", "#6f829d"),
            textShadow: "0 0 0 rgba(96,165,250,0)",
          },
          {
            backgroundSize: "100% 100%",
            color: token("--sh-blue-to", "#93c5fd"),
            textShadow: `0 0 14px ${token("--sh-blue-shadow", "rgba(96,165,250,0.35)")}`,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: commonTrigger,
          },
        );
      }
    },
    { scope: rootRef, dependencies: [segments, reduced, triggerStart, theme] },
  );

  const rendered: ReactNode[] = segments.map((segment, index) => {
    if (segment.tone === "plain") {
      return <span key={`plain-${index}`}>{segment.text}</span>;
    }

    const toneClass =
      segment.tone === "blue"
        ? "scroll-highlight-token scroll-highlight-token-blue"
        : "scroll-highlight-token scroll-highlight-token-white";
    const reducedStyle =
      reduced
        ? segment.tone === "blue"
          ? {
              backgroundSize: "100% 100%",
              color: "var(--sh-blue-to)",
              textShadow: "0 0 14px var(--sh-blue-shadow)",
            }
          : {
              backgroundSize: "100% 100%",
              color: "var(--sh-ink-to)",
              textShadow: "0 0 12px var(--sh-ink-shadow)",
            }
        : undefined;

    return (
      <span key={`${segment.tone}-${index}`} className={toneClass} style={reducedStyle}>
        {segment.text}
      </span>
    );
  });

  return (
    <Tag ref={rootRef} className={className}>
      {rendered}
    </Tag>
  );
}

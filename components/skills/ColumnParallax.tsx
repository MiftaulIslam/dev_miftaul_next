"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function ColumnParallax() {
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const section = document.getElementById("skills");
      if (!section || reduced) return;

      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      let planes: HTMLElement[] = [];
      let trigger: ScrollTrigger | undefined;

      const teardown = () => {
        trigger?.kill();
        trigger = undefined;
        planes.forEach((plane) => (plane.style.transform = ""));
        planes = [];
      };

      const build = () => {
        teardown();
        planes = gsap.utils.toArray<HTMLElement>(".cols-parallax", section);
        if (!planes.length) return;

        trigger = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate(self) {
            if (mq.matches) return;
            const travel = (self.progress - 0.5) * 2;
            for (let i = 0; i < planes.length; i++) {
              const offset = ((i % 3) - 1) * 26 + (i % 2 ? 8 : -8);
              planes[i].style.transform = `translate3d(0, ${(-offset * travel).toFixed(2)}px, 0)`;
            }
          },
        });
      };

      const sync = () => {
        if (mq.matches) teardown();
        else build();
      };

      const rebuild = () => {
        if (!mq.matches) build();
      };

      sync();
      mq.addEventListener("change", sync);
      window.addEventListener("skills:planes-changed", rebuild);

      return () => {
        mq.removeEventListener("change", sync);
        window.removeEventListener("skills:planes-changed", rebuild);
        teardown();
      };
    },
    { dependencies: [reduced] }
  );

  return null;
}

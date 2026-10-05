"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Mail, CheckCircle2 } from "lucide-react";
import V2SectionHeading from "@/components/ui/v2/V2SectionHeading";
import V2ScrollHighlightText from "@/components/ui/v2/V2ScrollHighlightText";
import type { PortfolioSettings } from "@/lib/dashboard/types";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface AboutProps {
  portraitTargetRef: React.RefObject<HTMLDivElement | null>;
  profile: PortfolioSettings;
}

export default function V2About({ portraitTargetRef, profile }: AboutProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const bioParagraphs = profile.detailedSummary
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const stats = [
    { value: profile.totalProjects, suffix: "+", label: "Projects Delivered" },
    { value: profile.yearsOfExperience, suffix: "+", label: "Years Experience" },
    { value: profile.happyClients, suffix: "+", label: "Happy Clients" },
  ];

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // The stat markup carries the real numbers, so the server HTML (what
      // crawlers read) and reduced motion show them as they are.
      const statEls = section.querySelectorAll<HTMLElement>("[data-stat-value]");

      // Writes into React's own text node rather than replacing it, so a later
      // render still updates the number it owns.
      const writeStat = (el: HTMLElement, text: string) => {
        if (el.firstChild) el.firstChild.nodeValue = text;
      };

      // Reduced motion: nothing slides or counts, but everything below starts
      // hidden for its entrance, so show it outright.
      if (reduced) {
        gsap.set(section.querySelectorAll(".about-text-item, .about-info-card"), { opacity: 1 });
        if (portraitTargetRef.current) gsap.set(portraitTargetRef.current, { opacity: 1 });
        statEls.forEach((el) => writeStat(el, `${el.dataset.statValue}${el.dataset.statSuffix ?? ""}`));
        return;
      }

      // Each stat counts up from zero the first time it is 100px into view, on
      // GSAP's ticker rather than a separate count-up library.
      statEls.forEach((el) => {
        const end = Number(el.dataset.statValue);
        const suffix = el.dataset.statSuffix ?? "";
        const counter = { value: 0 };
        writeStat(el, `0${suffix}`);
        gsap.to(counter, {
          value: end,
          duration: 2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top bottom-=100", once: true },
          onUpdate: () => writeStat(el, `${Math.round(counter.value)}${suffix}`),
          // Killed early (profile change, unmount): leave the real number.
          onInterrupt: () => writeStat(el, `${end}${suffix}`),
        });
      });

      const textEls = sectionRef.current?.querySelectorAll(".about-text-item");
      if (textEls) {
        gsap.fromTo(
          textEls,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 65%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      const infoCards = sectionRef.current?.querySelectorAll(".about-info-card");
      if (infoCards) {
        gsap.fromTo(
          infoCards,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 55%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      if (portraitTargetRef.current) {
        gsap.fromTo(
          portraitTargetRef.current,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: portraitTargetRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    },
    // revertOnUpdate: without it a profile change re-adds every tween and
    // ScrollTrigger on top of the old ones instead of replacing them. `reduced`
    // resolves a frame after mount, so it has to be a dependency too.
    { scope: sectionRef, dependencies: [profile, reduced], revertOnUpdate: true },
  );

  return (
    <section id="about" ref={sectionRef} className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div
        className="absolute top-1/2 right-0 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
      />

      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <div className="about-text-item opacity-0">
          <V2SectionHeading
            eyebrow="About Me"
            title="The Developer Behind The Code"
            subtitle="A passionate engineer who loves building things that matter."
            align="left"
            titleGradient="linear-gradient(90deg, #e0f2fe 0%, #bae6fd 30%, #60a5fa 65%, #3b82f6 100%)"
          />
        </div>

        <div className="mt-16 grid md:grid-cols-[1.1fr_1.4fr] gap-12 lg:gap-20 items-center">
          <div className="flex justify-center md:justify-start md:self-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-20 h-20 border-t-2 border-l-2 border-blue-400/60 rounded-tl-xl pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-2 border-r-2 border-blue-400/60 rounded-br-xl pointer-events-none" />

              <div
                ref={portraitTargetRef}
                className="portrait-about relative z-30 w-64 h-80 sm:w-72 sm:h-[28rem] rounded-2xl overflow-hidden border border-blue-400/15 bg-[#0a111d]"
                style={{ opacity: 0 }}
              >
                <div className="about-static-portrait absolute inset-0">
                  <Image
                    src={profile.subAvatar || "/ariyan.webp"}
                    alt="Miftaul Islam Shuvro portrait in about card"
                    fill
                    sizes="(max-width: 768px) 300px, 420px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-[#080c14]/45 via-transparent to-[#080c14]/5 pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 z-50 pointer-events-none">
                  <p className="text-white! font-semibold text-sm">{profile.name}</p>
                  <p className="text-white! text-xs">{profile.designations[0] ?? "Software Engineer"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-7">
            {bioParagraphs.map((paragraph, index) => (
              <V2ScrollHighlightText
                key={`${paragraph.slice(0, 18)}-${index}`}
                as="p"
                text={paragraph}
                className="about-text-item opacity-0 text-muted-foreground leading-relaxed text-base md:text-lg"
                triggerStart="top 76%"
              />
            ))}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/25 bg-emerald-400/8 px-3.5 py-1.5 w-fit md:justify-self-end">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs md:text-sm text-emerald-300 font-semibold">{profile.availability}</span>
            </div>
            <div className="about-info-card opacity-0 border-y border-white/10 py-4 md:py-5 grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 md:gap-6 items-center">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-subtle uppercase tracking-[0.18em]">Location</p>
                  <p className="text-sm text-white font-medium">{profile.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 md:border-l md:border-white/10 md:pl-6">
                <Mail className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-subtle uppercase tracking-[0.18em]">Email</p>
                  <p className="text-sm text-white/95 font-medium break-all">{profile.email}</p>
                </div>
              </div>

            </div>

            <div className="about-info-card opacity-0 grid grid-cols-3 border-b border-white/10 pb-5 md:pb-6">
              {stats.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`px-1 text-center ${idx > 0 ? "border-l border-white/10" : ""}`}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-white font-display leading-none">
                    <span data-stat-value={stat.value} data-stat-suffix={stat.suffix}>
                      {`${stat.value}${stat.suffix}`}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-2 uppercase tracking-[0.12em] sm:tracking-[0.15em]">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="about-text-item opacity-0">
              <p className="text-xs uppercase tracking-[0.2em] text-subtle mb-3">Currently Focused On</p>
              <div className="flex flex-wrap gap-2.5">
                {profile.currentlyFocusedOn.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-full border border-blue-600/20 max-md:grow max-md:justify-center text-blue-800 bg-linear-to-r from-blue-500/10 to-transparent dark:font-normal dark:border-blue-300/20 dark:text-blue-100/90 dark:from-blue-500/12"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600/80 dark:bg-blue-300/75" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

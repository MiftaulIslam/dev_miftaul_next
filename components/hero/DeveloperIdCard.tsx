"use client";

import Image from "next/image";
import { motion, useTransform, type MotionValue } from "framer-motion";

import { HangingIdCard } from "@/components/lightswind/hanging-id-card";
import type { PointerField } from "@/lib/usePointerField";
import type { PortfolioSettings } from "@/lib/dashboard/types";
import { cn } from "@/lib/cn";

/** Deterministic barcode — no Math.random, so SSR and client agree. */
const BARCODE = Array.from({ length: 34 }, (_, i) => ({
  width: i % 4 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
  height: 13 + Math.abs(Math.sin(i * 1.37)) * 11,
}));

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((token) => token[0]?.toUpperCase() ?? "")
      .join("") || "DEV"
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="block text-[8.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="line-clamp-2 block text-[11.5px] font-semibold leading-tight text-foreground">
        {value}
      </span>
    </div>
  );
}

interface DeveloperIdCardProps {
  profile: PortfolioSettings;
  pointer: PointerField;
  className?: string;
}

/**
 * The portfolio's identity badge: Lightswind's `HangingIdCard` (installed by
 * the lightswind CLI at components/lightswind/hanging-id-card.tsx — pendulum
 * physics intact, so it drags, flicks and taps) carrying this site's own
 * content, passed as `children` the way the reference hero does it.
 *
 * The only motion added on top is a specular sheen that follows the pointer.
 * Rotation belongs to the pendulum, so nothing here competes with the drag.
 */
export default function DeveloperIdCard({ profile, pointer, className }: DeveloperIdCardProps) {
  const role = profile.designations[0] ?? "Full Stack Developer";
  const focus = profile.currentlyFocusedOn[0] ?? "System Design";
  const badgeId =
    initialsOf(profile.name) + "-" + String(profile.yearsOfExperience).padStart(2, "0") + "-FS";

  const sheenX = useTransform(pointer.normX, [-0.5, 0.5], ["12%", "88%"]);
  const sheenY = useTransform(pointer.normY, [-0.5, 0.5], ["8%", "92%"]);
  const sheen = useTransform(
    [sheenX, sheenY] as [MotionValue<string>, MotionValue<string>],
    ([sx, sy]: string[]) =>
      "radial-gradient(circle 220px at " + sx + " " + sy + ", var(--card-sheen) 0%, transparent 62%)",
  );

  return (
    <HangingIdCard
      className={cn(className)}
      ropeLength={70}
      ropeColor="var(--primary)"
      cardWidth="w-[17.5rem] sm:w-[19rem]"
    >
      {/* Specular sheen tracking the pointer */}
      {pointer.active && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 mix-blend-soft-light"
          style={{ background: sheen, opacity: pointer.presence }}
        />
      )}

      {/* Header */}
      <div className="relative flex flex-col items-center gap-3 overflow-hidden border-b border-white/10 px-5 pb-5 pt-8">
        {/* Banner photo. Explicit dimensions rather than `fill`: inside this
            transformed subtree a `fill` image never resolves a srcset candidate. */}
        <Image
          src={profile.bannerImage || "/hero-bg-2.webp"}
          alt=""
          aria-hidden
          width={640}
          height={360}
          sizes="320px"
          className="absolute inset-0 h-full w-full object-cover brightness-[1.45] saturate-[1.25] contrast-[1.05]"
          priority
        />
        {/* Brand tint — the photo is near-black, so this keeps the badge on-palette. */}
        <div className="absolute inset-0 bg-primary/20" />
        {/* Scrim so the name and role stay legible over any part of the crop. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.16 0.03 260 / 0.3) 0%, transparent 30%, oklch(0.14 0.03 260 / 0.55) 72%, oklch(0.12 0.03 260 / 0.9) 100%)",
          }}
        />

        <div className="relative">
          <div className="relative h-[4.75rem] w-[4.75rem] overflow-hidden rounded-full border border-white/40 bg-white/10 shadow-lg">
            <Image
              src={profile.primaryAvatar || "/ariyan_2.jpg"}
              alt={profile.name}
              width={152}
              height={152}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow" />
        </div>

        <div className="relative text-center">
          <p className="ink-on-accent text-[15px] font-bold leading-tight tracking-tight">
            {profile.name}
          </p>
          <p className="ink-on-accent-soft mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.16em]">
            {role}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex flex-col gap-3 px-4 py-4">
        <div className="grid grid-cols-2 items-start gap-x-3 gap-y-2.5 rounded-2xl border border-hairline bg-tint-soft px-3 py-2.5">
          <Field label="Focus" value={focus} />
          <Field label="Location" value={profile.location} />
          <Field label="Experience" value={profile.yearsOfExperience + "+ Years"} />
          <Field label="Shipped" value={profile.totalProjects + "+ Projects"} />
        </div>

        <div className="flex h-8 items-end justify-center gap-[2px] rounded-lg border border-hairline bg-tint-soft px-3 py-2">
          {BARCODE.map((bar, i) => (
            <span
              key={i}
              className="rounded-[1px] bg-foreground/75"
              style={{ width: bar.width, height: bar.height }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary">
            {badgeId}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate">{profile.availability}</span>
          </span>
        </div>
      </div>
    </HangingIdCard>
  );
}

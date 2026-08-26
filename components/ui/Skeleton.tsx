import { cn } from "@/lib/cn";

/**
 * Loading placeholders.
 *
 * Deliberately skeletons rather than a spinner or an animated illustration.
 * A spinner says "something is happening" and nothing else; a skeleton says
 * what is about to arrive and roughly how much of it, which is why the page
 * does not jump when the real content lands. It also costs no dependency and
 * no network request, which matters most on exactly the slow connection where
 * a loading state is doing real work.
 *
 * The shimmer is a background-position animation on a gradient, which the
 * compositor handles without touching layout, and it disappears entirely under
 * `prefers-reduced-motion` (the block stays, so the shape still communicates).
 */

type SkeletonProps = {
  className?: string;
  /** Rounded to match whatever it stands in for. */
  radius?: "sm" | "md" | "lg" | "full";
};

const RADIUS: Record<NonNullable<SkeletonProps["radius"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({ className, radius = "md" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton-block", RADIUS[radius], className)}
    />
  );
}

/**
 * A run of text lines. The last line is short, because real paragraphs end
 * mid-measure and a stack of equal bars reads as a table rather than as prose.
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          radius="sm"
          className={cn("h-3.5", i === lines - 1 ? "w-[62%]" : "w-full")}
        />
      ))}
    </div>
  );
}

/**
 * The whole-page stand-in used while the server config settles.
 *
 * Stands in for the PAGE only. The navbar, dock and cursor layer live in
 * app/layout.tsx and are already on screen during this state, so drawing a
 * skeleton nav here would just hide a real one behind a fixed element. The
 * shape covers what is actually missing: the hero and the first content band.
 *
 * One polite live region tells a screen reader the page is loading; every
 * decorative block stays out of the accessibility tree.
 */
export function PageSkeleton() {
  return (
    <main className="portfolio-surface relative min-h-screen overflow-hidden">
      <span className="sr-only" role="status" aria-live="polite">
        Loading the page
      </span>

      {/* hero. pt clears the fixed navbar the layout already renders. */}
      <div className="mx-auto grid max-w-[88rem] gap-12 px-5 pt-28 md:grid-cols-[1.25fr_1fr] md:px-10 md:pt-36">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-4 w-40" radius="sm" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[clamp(2.5rem,7vw,4.5rem)] w-[92%]" radius="md" />
            <Skeleton className="h-[clamp(2.5rem,7vw,4.5rem)] w-[68%]" radius="md" />
          </div>
          <SkeletonText lines={2} className="mt-2 max-w-[38ch]" />
          <div className="mt-3 flex gap-3">
            <Skeleton className="h-11 w-36" radius="md" />
            <Skeleton className="h-11 w-32" radius="md" />
          </div>
        </div>
        <Skeleton className="hidden aspect-[4/5] w-full md:block" radius="lg" />
      </div>

      {/* first content band */}
      <div className="mx-auto mt-24 max-w-[88rem] px-5 md:px-10">
        <Skeleton className="h-4 w-28" radius="sm" />
        <Skeleton className="mt-4 h-8 w-64" radius="md" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" radius="lg" />
          ))}
        </div>
      </div>
    </main>
  );
}

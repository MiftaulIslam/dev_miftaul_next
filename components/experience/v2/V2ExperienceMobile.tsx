"use client";

import { useEffect, useState } from "react";

import { concurrencySentence, loadLiveTimeline } from "@/lib/experience/roles";
import { dur, label } from "@/lib/experience/timeline";
import type { Timeline } from "@/types/experience";

/**
 * Experience for small screens: a plain vertical timeline, newest first.
 *
 * The desktop overlap chart needs width to say anything — on a phone its bars
 * shrink to slivers and the scroll pin fights touch scrolling. Here each role
 * is a card on one rail, and concurrency is stated in words instead of drawn.
 * No pin, no scroll choreography; milestones fold away in a native <details>.
 */
export default function V2ExperienceMobile({ initial }: { initial: Timeline }) {
  const [timeline, setTimeline] = useState(initial);

  // Same refresh as the desktop chart: static set first, live data if it comes.
  useEffect(() => {
    let mounted = true;
    void loadLiveTimeline().then((next) => {
      if (mounted && next) setTimeline(next);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!timeline.roles.length) return null;

  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <header>
        <p className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Career
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-foreground">
          Every role, newest first
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {concurrencySentence(timeline)}
        </p>
      </header>

      <ol className="relative mt-10 border-l border-hairline pl-6">
        {timeline.roles.map((role) => (
          <li key={role.id} className="relative pb-8 last:pb-0">
            {/* Rail node; pulses for the role still running */}
            <span
              aria-hidden
              className={`absolute -left-[30.5px] top-1 size-3 rounded-full border-2 border-background ${
                role.current ? "bg-primary shadow-[0_0_12px_var(--accent-glow-strong)]" : "bg-hairline-strong"
              }`}
            />

            <p className="font-mono text-[0.6875rem] tracking-wide text-muted-foreground">
              {label(role.span.start)} – {role.span.ongoing ? "Present" : label(role.span.end)}
              <span className="text-foreground/60"> · {dur(role.span.start, role.span.end)}</span>
            </p>

            <article className="glass mt-2.5 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-snug text-foreground">
                    {role.company}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{role.title}</p>
                </div>
                {role.current && (
                  <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-wider text-primary">
                    Now
                  </span>
                )}
              </div>

              <p className="mt-1 font-mono text-[0.6875rem] text-muted-foreground">
                {role.type} · {role.location}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-foreground/85">{role.summary}</p>

              {role.sharedWith.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Ran alongside{" "}
                  <span className="text-foreground">{role.sharedWith.join(", ")}</span> for{" "}
                  {role.sharedMonths} months
                </p>
              )}

              {role.tech.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {role.tech.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-md border border-hairline bg-tint-soft px-2 py-1 font-mono text-[0.625rem] text-muted-foreground"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              )}

              {role.milestones.length > 0 && (
                <details className="group mt-4 border-t border-hairline pt-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground [&::-webkit-details-marker]:hidden">
                    What I shipped
                    <span aria-hidden className="transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <ul className="mt-3 space-y-2">
                    {role.milestones.map((milestone, index) => (
                      <li key={index} className="flex gap-2 text-sm leading-relaxed text-foreground/85">
                        <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                        <span>
                          {milestone.month !== null && (
                            <span className="font-mono text-xs text-muted-foreground">
                              {label(milestone.month)} ·{" "}
                            </span>
                          )}
                          {milestone.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}

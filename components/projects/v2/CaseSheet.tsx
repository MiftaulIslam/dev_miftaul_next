"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ArrowUpRight, X } from "lucide-react";
import { GitHubIcon } from "@/components/ui/SocialIcons";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { ReelProject } from "@/types/projects";

/**
 * The full write-up, as a right-hand shadcn Sheet.
 *
 * Radix portals it to <body>. It used to be rendered inside the pinned stage,
 * which lives in ScrollSmoother's transformed #smooth-content: a transformed
 * ancestor turns `fixed`/`absolute` into "relative to that ancestor", so the
 * drawer slid in as part of the section and read as shoving the content aside,
 * and it could never stack above the fixed navbar. From <body> it overlays the
 * whole page.
 *
 * Radix also supplies the scrim, focus trap, scroll lock, Escape, and focus
 * return (pointed at `returnFocusRef`, since the opener is not a Radix trigger).
 */

interface CaseSheetProps {
  project: ReelProject;
  open: boolean;
  onClose: () => void;
  /** Focused again on close — the control that opened the sheet. */
  returnFocusRef: React.RefObject<HTMLElement | null>;
}

export default function CaseSheet({ project, open, onClose, returnFocusRef }: CaseSheetProps) {
  /* Radix's scroll lock stops native scrolling, but on desktop ScrollSmoother
     takes wheel input at the window, beyond its reach. Paused, the smoother
     ignores the wheel while the sheet's own scroller still works. */
  useEffect(() => {
    if (!open) return;
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    return () => {
      smoother?.paused(false);
    };
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        showClose={false}
        className="wreel-case"
        style={{ ["--c-accent" as string]: project.accent }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus({ preventScroll: true });
        }}
      >
        <header className="wreel-case-head">
          <p className="wreel-case-meta">
            <span>{project.discipline}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
          </p>
          <SheetClose className="wreel-case-close">
            <X aria-hidden="true" />
            <span className="wreel-sr">Close case notes</span>
          </SheetClose>
        </header>

        <div className="wreel-case-scroll">
          <div className="wreel-case-content">
            <SheetTitle className="wreel-case-title">{project.name}</SheetTitle>
            <SheetDescription className="wreel-case-lede">{project.outcome}</SheetDescription>
            <div className="wreel-case-rule" aria-hidden="true" />

            <section className="wreel-case-block">
              <h4>The problem</h4>
              <p>{project.problem}</p>
            </section>

            {project.case.map((block) => (
              <section key={block.heading} className="wreel-case-block">
                <h4>{block.heading}</h4>
                {block.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </section>
            ))}

            <dl className="wreel-case-spec">
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{project.tech.join(", ")}</dd>
              </div>
              <div>
                <dt>Plate</dt>
                <dd>{project.plate.caption}</dd>
              </div>
            </dl>

            <div className="wreel-case-actions">
              <Link className="wreel-case-link is-primary" href={`/work/${project.id}`}>
                Read the full case
                <ArrowUpRight aria-hidden="true" />
              </Link>
              {project.links.live ? (
                <a
                  className="wreel-case-link"
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit {project.name}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ) : null}
              {project.links.source ? (
                <a
                  className="wreel-case-link"
                  href={project.links.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon className="h-3.5 w-3.5" />
                  Source
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

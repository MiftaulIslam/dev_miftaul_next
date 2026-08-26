"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Lenis from "lenis";
import gsap from "gsap";
import { ArrowUpRight, X } from "lucide-react";
import { GitHubIcon } from "@/components/ui/SocialIcons";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { ReelProject } from "@/types/projects";

/**
 * The full write-up, as a right-hand sheet.
 *
 * Mounted once for the life of the section and toggled with `data-open`, never
 * created per open — so the entrance is a transform on an element the compositor
 * already has, and the exit can actually play instead of being unmounted
 * mid-transition.
 *
 * This is the only scrolling region inside the reel, which is what makes it the
 * one honest place for Lenis: it smooths the sheet's own scroll while
 * `overscroll-behavior: contain` stops reaching the end from scrolling the
 * document underneath. The page-level smoother (GSAP ScrollSmoother, see
 * components/LenisProvider.tsx) is left alone.
 *
 * Non-modal by choice: it does not trap focus or freeze the page, because it is
 * supplementary reading rather than a task that needs protecting. Escape closes
 * it and focus returns to whatever opened it.
 */

interface CaseSheetProps {
  project: ReelProject;
  open: boolean;
  onClose: () => void;
  /** Focused again on close — the control that opened the sheet. */
  returnFocusRef: React.RefObject<HTMLElement | null>;
}

export default function CaseSheet({ project, open, onClose, returnFocusRef }: CaseSheetProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = useReducedMotion();

  /* Lenis drives the sheet's inner scroll, sharing GSAP's ticker so the page
     runs one rAF loop rather than two competing ones. */
  useEffect(() => {
    const wrapper = scrollRef.current;
    const content = contentRef.current;
    if (!wrapper || !content || reduced) return;

    const lenis = new Lenis({
      wrapper,
      content,
      lerp: 0.11,
      smoothWheel: true,
      // The document behind must never move; `contain` on the wrapper handles
      // the browser side, this handles Lenis's own propagation.
      overscroll: false,
    });
    lenisRef.current = lenis;

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  /* Reset to the top and hand focus to the close control on open; give focus
     back to the opener on close.

     `wasOpen` is what makes "on close" mean an actual close. The effect also
     runs on mount, where `open` is false and the else-branch used to fire
     anyway: it focused a button sitting deep inside the pinned reel, and the
     browser dutifully scrolled it into view — so simply mounting the v2
     homepage threw the reader from the hero into the middle of the projects
     section before they had touched anything. Nothing had opened the sheet, so
     there was nothing to return focus to. */
  const wasOpenRef = useRef(open);
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      lenisRef.current?.scrollTo(0, { immediate: true });
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      const raf = requestAnimationFrame(() => closeRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
    if (!wasOpenRef.current) return;
    wasOpenRef.current = false;
    returnFocusRef.current?.focus();
  }, [open, returnFocusRef]);

  /* Escape closes the sheet and is stopped here, so it never also reaches the
     reel's own key handler. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  return (
    <>
      <div
        className="wreel-case-scrim"
        data-open={open}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className="wreel-case"
        data-open={open}
        aria-label={`${project.name} — case notes`}
        // Closed content stays out of the tab order without unmounting it.
        inert={!open}
        style={{ ["--c-accent" as string]: project.accent }}
      >
        <header className="wreel-case-head">
          <p className="wreel-case-meta">
            <span>{project.discipline}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
          </p>
          <button ref={closeRef} type="button" className="wreel-case-close" onClick={onClose}>
            <X aria-hidden="true" />
            <span className="wreel-sr">Close case notes</span>
          </button>
        </header>

        <div className="wreel-case-scroll" ref={scrollRef}>
          <div ref={contentRef} className="wreel-case-content">
            <h3 className="wreel-case-title">{project.name}</h3>
            <p className="wreel-case-lede">{project.outcome}</p>
            <div className="wreel-case-rule" aria-hidden="true" />

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
      </aside>
    </>
  );
}

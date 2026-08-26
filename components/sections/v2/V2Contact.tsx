"use client";

import { useRef } from "react";

import ContactForm from "@/components/contact/ContactForm";
import StudioClock from "@/components/contact/StudioClock";
import ReplyMeter from "@/components/contact/ReplyMeter";
import {
  formatStudioClock,
  studioReading,
  withinWorkingHours,
} from "@/lib/contact/studio";
import type { PortfolioSettings } from "@/lib/dashboard/types";

interface ContactProps {
  profile: PortfolioSettings;
}

/**
 * Console (Concept 03): a precise instrument surface for availability,
 * timezone and reply window, paired with the shared form machine.
 * Two columns, 5fr instrument / 7fr form, vertically centred.
 * No entrance choreography — the scan is this section's only motion.
 */
export default function V2Contact({ profile }: ContactProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Server-rendered first reading so the clock never shows an empty dash.
  const initialReading = studioReading();
  const initialTime = formatStudioClock(initialReading);
  const initialAtDesk = withinWorkingHours(initialReading);

  const focusFormField = (id: string) => {
    document.getElementById(id)?.focus();
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32"
    >
      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <div className="grid grid-cols-1 items-center gap-14 min-[768px]:grid-cols-2 min-[768px]:gap-[5vw] min-[1100px]:grid-cols-[6fr_5fr]">
          {/* ── Instrument column ─────────────────────────────────────── */}
          <div>
            <p className="font-mono text-[0.5625rem] font-medium uppercase tracking-[0.28em] text-console-key">
              Contact
            </p>
            <h2 className="mt-4 font-display text-[clamp(1.875rem,3.2vw,2.75rem)] font-medium leading-[1.05] tracking-tight text-console-ink">
              Availability, read live.
            </h2>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-console-caption">
              The instrument on this page is computed from your own clock. The
              panel beside it sends straight to my inbox.
            </p>

            {/* Three readings, one hairline above, no borders between */}
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 border-t border-console-hairline pt-5 min-[900px]:grid-cols-3">
              <StudioClock initialTime={initialTime} initialAtDesk={initialAtDesk} />

              {/* Cell 3 — booking: a standing fact, not a control */}
              <div>
                <p className="font-mono text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-console-key">
                  Booking
                </p>
                <p className="mt-4 text-[0.9375rem] leading-snug text-console-ink">
                  {profile.availability}
                </p>
                <p className="mt-2.5 font-mono text-[11px] tracking-wide text-console-caption">
                  {profile.location}
                </p>
              </div>
            </div>

            {/* Reply window meter */}
            <figure className="mt-10">
              <p className="mb-3 font-mono text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-console-key">
                Hours since your message
              </p>
              <ReplyMeter />
              <figcaption className="mt-3 flex flex-col gap-1">
                <span className="text-[0.8125rem] leading-snug text-console-ink">
                  Replies land inside the band &mdash;{" "}
                  <span className="text-console-accent">
                    a target window, not a measured average
                  </span>
                  .
                </span>
                <span className="text-[10px] leading-snug text-console-caption">
                  Modelled from stated working hours; actual reply time depends
                  on scope. Outer bound 72h.
                </span>
              </figcaption>

              {/* The canvas is decorative; these words are the instrument's
                  accessibility tree. The buttons are the only click targets in
                  this column and they move focus into the form. */}
              <ul className="sr-only">
                <li>
                  <button type="button" onClick={() => focusFormField("contact-name")}>
                    Meter axis: hours elapsed since your message, from 0 to 72.
                    Jump to the name field.
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => focusFormField("contact-email")}>
                    Target band: the first 12 hours, where replies aim to land.
                    Jump to the email field.
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => focusFormField("contact-brief")}>
                    Outer bound: 72 hours, the hard limit of the commitment.
                    Jump to the brief field.
                  </button>
                </li>
              </ul>
            </figure>
          </div>

          {/* ── Form column ───────────────────────────────────────────── */}
          <div className="rounded-xl border border-console-hairline bg-console-panel p-[clamp(1.5rem,2.6vw,2.25rem)]">
            <ContactForm />
          </div>
        </div>

        <div className="mt-20 pt-8 text-center text-sm text-console-caption">
          <p>
            &copy; {new Date().getFullYear()} {profile.name}.
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef, useState, FormEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, CheckCircle2, Send } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";
import MagneticButton from "@/components/ui/MagneticButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { ABOUT, SOCIAL_LINKS } from "@/lib/data";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  mail: Mail,
};

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useGSAP(
    () => {
      if (reduced) return;

      // Left info cards stagger
      const infoCards = sectionRef.current?.querySelectorAll(".contact-info-item");
      if (infoCards) {
        gsap.fromTo(
          infoCards,
          { x: -40, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Form slide in
      const formEl = sectionRef.current?.querySelector(".contact-form");
      if (formEl) {
        gsap.fromTo(
          formEl,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.2,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send — integrate real email API here
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-subtle text-sm focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.06] transition-all duration-200";

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-transparent overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(59,130,246,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <SectionHeading
          eyebrow="Contact"
          title="Let's Build Something"
          subtitle="Have a project in mind or want to collaborate? I'd love to hear from you."
          align="center"
        />

        <div className="mt-16 grid md:grid-cols-2 gap-12 lg:gap-20">

          {/* ── Left: Info panel ── */}
          <div className="flex flex-col gap-6">
            <div className="contact-info-item opacity-0">
              <h3 className="text-xl font-bold text-white mb-2">
                Open to global opportunities
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Whether it&apos;s a full-time role, contract work, or an exciting project —
                I&apos;m always open to meaningful conversations. Remote-first and
                available internationally.
              </p>
            </div>

            {/* Contact details */}
            <div className="flex flex-col gap-3">
              <motion.a
                href={`mailto:${ABOUT.email}`}
                className="contact-info-item opacity-0 flex items-center gap-3 glass border border-white/8 rounded-xl px-4 py-3 hover:border-blue-500/30 transition-all duration-200 group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-subtle uppercase tracking-wider">Email</p>
                  <p className="text-sm text-white group-hover:text-blue-300 transition-colors">{ABOUT.email}</p>
                </div>
              </motion.a>

              <motion.div
                className="contact-info-item opacity-0 flex items-center gap-3 glass border border-white/8 rounded-xl px-4 py-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-subtle uppercase tracking-wider">Location</p>
                  <p className="text-sm text-white">{ABOUT.location}</p>
                </div>
              </motion.div>

              <motion.div
                className="contact-info-item opacity-0 flex items-center gap-3 glass border border-green-500/20 rounded-xl px-4 py-3"
                whileHover={{ scale: 1.01 }}
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <p className="text-sm text-green-400 font-semibold">{ABOUT.availability}</p>
              </motion.div>
            </div>

            {/* Social links */}
            <div className="contact-info-item opacity-0">
              <p className="text-xs uppercase tracking-widest text-subtle mb-3">Find me on</p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((s) => {
                  const Icon = socialIconMap[s.icon];
                  return (
                    <motion.a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors duration-200"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="contact-form opacity-0">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="glass border border-white/8 rounded-2xl p-6 md:p-8 flex flex-col gap-4"
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                        Name
                      </label>
                      <input
                        className={inputClass}
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                        Email
                      </label>
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                      Subject
                    </label>
                    <input
                      className={inputClass}
                      placeholder="Project collaboration, job opportunity..."
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                      Message
                    </label>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={5}
                      placeholder="Tell me about your project or opportunity..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                    />
                  </div>

                  <MagneticButton
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </MagneticButton>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass border border-green-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm">
                    Thanks for reaching out. I&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-subtle">
          <p>© {new Date().getFullYear()} Miftaul Islam Shuvro. Crafted with care.</p>
          <p className="flex items-center gap-2">
            Built with
            <span className="text-white font-medium">Next.js</span>·
            <span className="text-white font-medium">Tailwind</span>·
            <span className="text-white font-medium">GSAP</span>
          </p>
        </div>
      </div>
    </section>
  );
}

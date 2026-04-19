"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type ComponentType } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Mail, MapPin, CheckCircle2, Send } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";
import MagneticButton from "@/components/ui/MagneticButton";
import SectionHeading from "@/components/ui/SectionHeading";
import type { PortfolioSettings } from "@/lib/dashboard/types";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const socialIconMap: Record<string, ComponentType<{ className?: string }>> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  mail: Mail,
  link: Globe,
};

interface ContactProps {
  profile: PortfolioSettings;
}

export default function Contact({ profile }: ContactProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const reduced = useReducedMotion();

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const socialLinks = profile.socials.length
    ? profile.socials
    : [{ iconName: "mail", link: `mailto:${profile.email}` }];

  useGSAP(
    () => {
      if (reduced) return;

      const infoCards = sectionRef.current?.querySelectorAll(".contact-info-item");
      if (infoCards) {
        gsap.fromTo(
          infoCards,
          { x: -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      const formEl = sectionRef.current?.querySelector(".contact-form");
      if (formEl) {
        gsap.fromTo(
          formEl,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            delay: 0.2,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    },
    { scope: sectionRef },
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to send message.");
      }

      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      if (messageRef.current) {
        messageRef.current.style.height = "auto";
      }
    } catch {
      setSubmitted(false);
      setSubmitError("Could not send right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const autoResizeMessage = (nextValue: string) => {
    if (messageRef.current) {
      messageRef.current.style.height = "auto";
      messageRef.current.style.height = `${Math.max(messageRef.current.scrollHeight, 128)}px`;
    }
    setForm((prev) => ({ ...prev, message: nextValue }));
  };

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    autoResizeMessage(event.target.value);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-subtle text-sm focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.06] transition-all duration-200";

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-transparent overflow-hidden"
    >
      
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
          <div className="flex flex-col gap-6">
            <div className="contact-info-item opacity-0">
              <h3 className="text-xl font-bold text-white mb-2">Open to global opportunities</h3>
              <p className="text-muted-foreground leading-relaxed">
                Whether it is a full-time role, contract work, or an exciting project, I am always
                open to meaningful conversations. Remote-first and available internationally.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <motion.a
                href={`mailto:${profile.email}`}
                className="contact-info-item opacity-0 flex items-center gap-3 glass border border-white/8 rounded-xl px-4 py-3 hover:border-blue-500/30 transition-all duration-200 group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-subtle uppercase tracking-wider">Email</p>
                  <p className="text-sm text-white group-hover:text-blue-300 transition-colors">{profile.email}</p>
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
                  <p className="text-sm text-white">{profile.location}</p>
                </div>
              </motion.div>

              <motion.div
                className="contact-info-item opacity-0 flex items-center gap-3 glass border border-green-500/20 rounded-xl px-4 py-3"
                whileHover={{ scale: 1.01 }}
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <p className="text-sm text-green-400 font-semibold">{profile.availability}</p>
              </motion.div>
            </div>

            <div className="contact-info-item opacity-0">
              <p className="text-xs uppercase tracking-widest text-subtle mb-3">Find me on</p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const icon = social.iconName.toLowerCase();
                  const Icon = socialIconMap[icon] ?? socialIconMap.link;
                  return (
                    <motion.a
                      key={`${social.iconName}-${social.link}-${index}`}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.iconName}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors duration-200"
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>

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
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
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
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
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
                      onChange={(event) => setForm({ ...form, subject: event.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                      Message
                    </label>
                    <textarea
                      ref={messageRef}
                      className={`${inputClass} resize-none`}
                      rows={5}
                      placeholder="Tell me about your project or opportunity..."
                      value={form.message}
                      onChange={handleMessageChange}
                      style={{ overflowY: "hidden" }}
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
                  {submitError ? <p className="text-xs text-rose-300">{submitError}</p> : null}
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
                    Thanks for reaching out. I will get back to you within 24 hours.
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

        <div className="mt-24 pt-8 text-center text-sm text-subtle">
          <p>© {new Date().getFullYear()} {profile.name}. Crafted with care.</p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Download } from "lucide-react";
import { CV, SKILLS } from "@/lib/data";
import { experiences } from "@/components/experience-data";

interface CVDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CVDialog({ open, onClose }: CVDialogProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handlePrint = () => window.print();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-4 md:inset-8 z-[201] overflow-auto rounded-2xl bg-card border border-white/10 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Toolbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card/90 backdrop-blur border-b border-white/10 print:hidden">
              <span className="text-sm text-muted-foreground font-mono">resume.pdf</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-white/10 text-muted-foreground hover:text-white hover:border-blue-500/50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CV Content — this is what gets printed */}
            <div id="cv-print-root" className="p-8 md:p-12 max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8 pb-6 border-b border-white/10">
                <h1 className="text-4xl font-bold text-white mb-1">{CV.name}</h1>
                <p className="text-xl text-blue-400 font-medium mb-4">{CV.title}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{CV.email}</span>
                  <span>·</span>
                  <span>{CV.location}</span>
                  <span>·</span>
                  <span>{CV.github}</span>
                  <span>·</span>
                  <span>{CV.linkedin}</span>
                </div>
              </div>

              {/* Summary */}
              <section className="mb-8">
                <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Summary</h2>
                <p className="text-muted-foreground leading-relaxed">{CV.summary}</p>
              </section>

              {/* Experience */}
              <section className="mb-8">
                <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Experience</h2>
                <div className="space-y-6">
                  {experiences.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-white">{exp.title}</h3>
                          <p className="text-blue-400 text-sm">{exp.company}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{exp.duration}</p>
                          <p>{exp.type}</p>
                        </div>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {exp.description.map((line, i) => (
                          <li key={i} className="text-sm text-muted-foreground pl-3 border-l border-white/10">
                            {line}
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {exp.tech.map((t) => (
                          <span key={t} className="px-2 py-0.5 text-xs rounded bg-white/5 border border-white/10 text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Skills */}
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Technical Skills</h2>
                <div className="grid grid-cols-2 gap-4">
                  {SKILLS.map((cat) => (
                    <div key={cat.category}>
                      <h3 className="text-sm font-semibold text-white mb-2">{cat.category}</h3>
                      <p className="text-sm text-muted-foreground">{cat.items.map((i) => i.name).join(", ")}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

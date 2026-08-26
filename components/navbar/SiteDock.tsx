"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  FolderGit2,
  Home,
  Mail,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/data";
import { scrollToSection, useDockVisible, useNavShell } from "@/lib/navShell";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

/** Section id → icon. Keyed by id so reordering NAV_LINKS cannot desync it. */
const SECTION_ICONS: Record<string, LucideIcon> = {
  hero: Home,
  about: User,
  skills: Wrench,
  projects: FolderGit2,
  experience: Briefcase,
  contact: Mail,
};

/**
 * Bottom dock that takes over when the navbar is not on screen.
 *
 * On desktop it appears exactly when the navbar parks itself off-screen, so
 * there is never a moment with no navigation and never two navs at once. On
 * mobile the navbar collapses to a hamburger, so the dock earns its place as
 * soon as the page has scrolled at all.
 */
export default function SiteDock() {
  const { activeSection } = useNavShell();
  const { visible } = useDockVisible();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.7 }}
          // Below the settings panel (z-60) so the two never fight, and clear
          // of the iOS home indicator via the safe-area inset.
          className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <Dock>
            {NAV_LINKS.map((link) => {
              const id = link.href.replace("#", "");
              const Icon = SECTION_ICONS[id] ?? Home;
              return (
                <DockItem
                  key={link.href}
                  label={link.label}
                  active={activeSection === id}
                  onClick={() => scrollToSection(link.href)}
                >
                  <DockLabel>{link.label}</DockLabel>
                  <DockIcon>
                    <Icon className="h-full w-full" aria-hidden />
                  </DockIcon>
                </DockItem>
              );
            })}
          </Dock>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

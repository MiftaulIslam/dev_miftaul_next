"use client";

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
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/v2/V2Dock";

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
export default function V2SiteDock() {
  const { activeSection } = useNavShell();
  const { visible } = useDockVisible();

  return (
    // Always mounted; `.site-dock` (globals.css) slides it in and out, and
    // `visibility` keeps a hidden dock out of the tab order.
    // Below the settings panel (z-60) so the two never fight, and clear
    // of the iOS home indicator via the safe-area inset. Below md it is
    // an edge-to-edge tab bar: the wrapper owns the surface so it can
    // extend under the home indicator, and the dock panel goes bare. Its
    // surface is 95% opaque, so a light blur reads the same as a heavy one
    // and costs the GPU far less on every scroll frame.
    <div
      data-visible={visible}
      className="site-dock fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-hairline bg-nav-surface pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:border-0 md:bg-transparent md:pb-[max(0.75rem,env(safe-area-inset-bottom))] md:backdrop-blur-none"
    >
      <Dock className="max-md:w-full max-md:justify-around max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:shadow-none max-md:backdrop-blur-none">
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
    </div>
  );
}

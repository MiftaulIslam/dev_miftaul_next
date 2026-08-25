import type { ComponentType } from "react";

import { ThemeSection } from "./AppearanceSection";
import { CursorSection } from "./CursorSection";

/**
 * The panel's contents, in render order.
 *
 * This is the single place to touch when adding a setting: write a component
 * that renders a `<SettingsSection>` (see `AppearanceSection.tsx`), then add an
 * entry here. The panel shell knows nothing about what any section controls.
 *
 * Future entries might be motion ("Reduce animations"), density, accent colour,
 * or a language picker — each one is additive, no shell changes required.
 */
export interface SettingsEntry {
  id: string;
  Section: ComponentType;
}

export const SETTINGS_SECTIONS: SettingsEntry[] = [
  { id: "theme", Section: ThemeSection },
  { id: "cursor", Section: CursorSection },
];

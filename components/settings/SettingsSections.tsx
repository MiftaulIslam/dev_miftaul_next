"use client";

import { SETTINGS_SECTIONS } from "./sections";

/** Every settings section, in order. Its own chunk: loaded when the dial is first hovered or opened. */
export default function SettingsSections() {
  return (
    <>
      {SETTINGS_SECTIONS.map(({ id, Section }) => (
        <Section key={id} />
      ))}
    </>
  );
}

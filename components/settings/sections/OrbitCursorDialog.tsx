"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { ORBIT_PRESETS, useCursorSettings } from "@/lib/cursor";
import { cn } from "@/lib/utils";
import SettingsDialog from "../SettingsDialog";
import {
  SettingsGroupLabel,
  SettingsSlider,
  SettingsSwitch,
  SettingsTabs,
} from "../primitives";

type OrbitTab = "basic" | "appearance" | "behavior" | "presets";

const TABS: { value: OrbitTab; label: string }[] = [
  { value: "basic", label: "Basic" },
  { value: "appearance", label: "Appearance" },
  { value: "behavior", label: "Behavior" },
  { value: "presets", label: "Presets" },
];

export default function OrbitCursorDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { settings, setOrbit, reset } = useCursorSettings();
  const [tab, setTab] = useState<OrbitTab>("basic");
  const orbit = settings.orbit;

  return (
    <SettingsDialog open={open} title="Orbit cursor" onClose={onClose} size="wide">
      <SettingsTabs<OrbitTab>
        label="Orbit cursor settings"
        tabs={TABS}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-4">
        {tab === "basic" && (
          <>
            <SettingsSlider
              label="Particle count"
              value={orbit.particleCount}
              min={5}
              max={100}
              onChange={(particleCount) => setOrbit({ particleCount })}
            />
            <SettingsSlider
              label="Orbit radius"
              value={orbit.radius}
              min={20}
              max={200}
              step={5}
              suffix="px"
              onChange={(radius) => setOrbit({ radius })}
            />
            <SettingsSlider
              label="Particle speed"
              value={orbit.particleSpeed}
              min={0.005}
              max={0.1}
              step={0.005}
              onChange={(particleSpeed) => setOrbit({ particleSpeed })}
            />
            <SettingsSlider
              label="Particle size"
              value={orbit.particleSize}
              min={1}
              max={8}
              onChange={(particleSize) => setOrbit({ particleSize })}
            />
          </>
        )}

        {tab === "appearance" && (
          <>
            <SettingsSlider
              label="Intensity"
              value={orbit.intensity}
              min={0.1}
              max={2}
              step={0.1}
              onChange={(intensity) => setOrbit({ intensity })}
            />
            <SettingsSlider
              label="Fade opacity"
              value={orbit.fadeOpacity}
              min={0.01}
              max={0.2}
              step={0.005}
              onChange={(fadeOpacity) => setOrbit({ fadeOpacity })}
            />
            <SettingsSlider
              label="Radius scale (on click)"
              value={orbit.radiusScale}
              min={1}
              max={4}
              step={0.1}
              onChange={(radiusScale) => setOrbit({ radiusScale })}
            />

            <SettingsGroupLabel>Color range</SettingsGroupLabel>
            <SettingsSlider
              label="Hue start"
              value={orbit.hueStart}
              min={0}
              max={360}
              suffix="°"
              // Never let the start pass the end, or the range inverts and the
              // component generates hues outside the band the user picked.
              onChange={(hueStart) =>
                setOrbit({ hueStart: Math.min(hueStart, orbit.hueEnd) })
              }
            />
            <SettingsSlider
              label="Hue end"
              value={orbit.hueEnd}
              min={0}
              max={360}
              suffix="°"
              onChange={(hueEnd) =>
                setOrbit({ hueEnd: Math.max(hueEnd, orbit.hueStart) })
              }
            />
            <HuePreview start={orbit.hueStart} end={orbit.hueEnd} />
          </>
        )}

        {tab === "behavior" && (
          <div className="divide-y divide-foreground/10">
            <SettingsSwitch
              label="Enable effect"
              description="Turn the particle effect on or off."
              checked={orbit.enabled}
              onChange={(enabled) => setOrbit({ enabled })}
            />
            <SettingsSwitch
              label="Follow mouse"
              description="Particles follow cursor movement."
              checked={orbit.followMouse}
              onChange={(followMouse) => setOrbit({ followMouse })}
            />
            <SettingsSwitch
              label="Auto colors"
              description="Automatically change colors over time."
              checked={orbit.autoColors}
              onChange={(autoColors) => setOrbit({ autoColors })}
            />
          </div>
        )}

        {tab === "presets" && (
          <>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground/80">
              Quick configurations for different styles and moods.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ORBIT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setOrbit(preset.config)}
                  className={cn(
                    "rounded-xl border border-foreground/10 px-3 py-2.5 text-left transition-colors",
                    "hover:border-primary/40 hover:bg-foreground/5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <span className="block text-sm text-foreground">{preset.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => reset("orbit")}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5",
                "text-xs text-muted-foreground transition-colors",
                "hover:bg-foreground/5 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Reset all settings
            </button>
          </>
        )}
      </div>
    </SettingsDialog>
  );
}

/** Shows the actual hue band the particles will be drawn from. */
function HuePreview({ start, end }: { start: number; end: number }) {
  const stops = Array.from({ length: 9 }, (_, i) => {
    const hue = start + ((end - start) * i) / 8;
    return `hsl(${hue}, 70%, 60%)`;
  });
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs text-muted-foreground">Preview</p>
      <div
        aria-hidden
        className="h-6 rounded-lg border border-foreground/10"
        style={{ backgroundImage: `linear-gradient(to right, ${stops.join(", ")})` }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";

import {
  CURSOR_OPTIONS,
  useCursorSettings,
  type CursorKind,
} from "@/lib/cursor";
import { cn } from "@/lib/utils";
import SettingsDialog from "../SettingsDialog";
import OrbitCursorDialog from "./OrbitCursorDialog";
import {
  SettingsColor,
  SettingsGroupLabel,
  SettingsRail,
  SettingsSection,
  SettingsSlider,
  SettingsSwitch,
} from "../primitives";

/** Which cursors expose options — "System" is the browser's own, so it has none. */
type ConfigurableCursor = Exclude<CursorKind, "none">;

export function CursorSection() {
  const { settings, setKind, setSmooth, setSparkle, setFirework, reset } =
    useCursorSettings();
  const [configuring, setConfiguring] = useState<ConfigurableCursor | null>(null);

  return (
    <SettingsSection title="Cursor">
      <SettingsRail<CursorKind>
        label="Cursor style"
        value={settings.kind}
        onChange={setKind}
        options={CURSOR_OPTIONS}
        renderAction={(option) =>
          option.value === "none" ? null : (
            <button
              type="button"
              onClick={() => setConfiguring(option.value as ConfigurableCursor)}
              aria-label={`Configure ${option.label} cursor`}
              title={`Configure ${option.label} cursor`}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground",
                "transition-colors hover:bg-foreground/10 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <Settings2 className="h-4 w-4" aria-hidden />
            </button>
          )
        }
      />

      <SettingsDialog
        open={configuring === "smooth"}
        title="Smooth cursor"
        onClose={() => setConfiguring(null)}
        footer={<ResetButton onClick={() => reset("smooth")} />}
      >
        <SettingsSlider
          label="Size"
          value={settings.smooth.size}
          min={12}
          max={40}
          suffix="px"
          onChange={(size) => setSmooth({ size })}
        />
        <SettingsSlider
          label="Magnetic pull"
          value={settings.smooth.magneticDistance}
          min={0}
          max={140}
          step={5}
          suffix="px"
          onChange={(magneticDistance) => setSmooth({ magneticDistance })}
        />
        <div className="divide-y divide-foreground/10">
          <SettingsSwitch
            label="Rotate with movement"
            checked={settings.smooth.rotateOnMove}
            onChange={(rotateOnMove) => setSmooth({ rotateOnMove })}
          />
          <SettingsSwitch
            label="Shrink on click"
            checked={settings.smooth.scaleOnClick}
            onChange={(scaleOnClick) => setSmooth({ scaleOnClick })}
          />
          <SettingsSwitch
            label="Glow"
            checked={settings.smooth.glowEffect}
            onChange={(glowEffect) => setSmooth({ glowEffect })}
          />
          <SettingsSwitch
            label="Trail"
            checked={settings.smooth.showTrail}
            onChange={(showTrail) => setSmooth({ showTrail })}
          />
        </div>
        {/* Trail length is meaningless with the trail off, so it only appears
            once the trail is on rather than sitting there disabled. */}
        {settings.smooth.showTrail && (
          <SettingsSlider
            label="Trail length"
            value={settings.smooth.trailLength}
            min={2}
            max={12}
            onChange={(trailLength) => setSmooth({ trailLength })}
          />
        )}
      </SettingsDialog>

      <SettingsDialog
        open={configuring === "firework"}
        title="Firework cursor"
        onClose={() => setConfiguring(null)}
        footer={<ResetButton onClick={() => reset("firework")} />}
      >
        <SettingsSlider
          label="Density"
          value={settings.firework.density}
          min={10}
          max={100}
          step={5}
          suffix="k"
          onChange={(density) => setFirework({ density })}
        />
        <SettingsSlider
          label="Particle size"
          value={settings.firework.size}
          min={0.5}
          max={4}
          step={0.5}
          onChange={(size) => setFirework({ size })}
        />
        <SettingsSlider
          label="Lifetime"
          value={settings.firework.lifetime}
          min={0.5}
          max={10}
          step={0.5}
          onChange={(lifetime) => setFirework({ lifetime })}
        />
        <SettingsSlider
          label="Bloom"
          value={settings.firework.bloomStrength}
          min={0}
          max={100}
          step={5}
          onChange={(bloomStrength) => setFirework({ bloomStrength })}
        />

        <SettingsGroupLabel>Colors</SettingsGroupLabel>
        <div className="divide-y divide-foreground/10">
          <SettingsColor
            label="Core"
            value={settings.firework.color}
            onChange={(color) => setFirework({ color })}
          />
          <SettingsColor
            label="Accent 1"
            value={settings.firework.accentA}
            onChange={(accentA) => setFirework({ accentA })}
          />
          <SettingsColor
            label="Accent 2"
            value={settings.firework.accentB}
            onChange={(accentB) => setFirework({ accentB })}
          />
        </div>
      </SettingsDialog>

      <OrbitCursorDialog
        open={configuring === "orbit"}
        onClose={() => setConfiguring(null)}
      />

      <SettingsDialog
        open={configuring === "sparkle"}
        title="Sparkle cursor"
        onClose={() => setConfiguring(null)}
        footer={<ResetButton onClick={() => reset("sparkle")} />}
      >
        <SettingsSlider
          label="Spacing"
          value={settings.sparkle.distance}
          min={10}
          max={160}
          step={5}
          suffix="px"
          onChange={(distance) => setSparkle({ distance })}
        />
        <SettingsSwitch
          label="Glow"
          description="Soft halo that follows the pointer."
          checked={settings.sparkle.glow}
          onChange={(glow) => setSparkle({ glow })}
        />
      </SettingsDialog>
    </SettingsSection>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-2.5 py-1 text-xs text-muted-foreground transition-colors",
        "hover:bg-foreground/5 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      Reset to defaults
    </button>
  );
}

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Plate from "@/components/projects/v2/Plate";
import { usePointerField } from "@/lib/usePointerField";
import type { ReelProject } from "@/types/projects";

/**
 * The two swapping plate layers plus the parallax wrapper.
 *
 * Exactly two layers exist for the life of the section and they trade roles on
 * every step, so stepping never allocates a third canvas. The handoff itself is
 * a pair of CSS keyframe animations rather than a JS tween: because the two
 * layers always swap `is-front` / `is-back`, the `animation-name` changes on
 * each step, which restarts both animations with no key change, no remount and
 * no imperative timeline.
 *
 * Three nested transforms, one owner each — pointer parallax on the outer node,
 * drag offset on the middle one, handoff on the layers. Stacking them on one
 * element would make each writer clobber the others.
 */

/** normX/normY arrive as ±0.5, so these multipliers yield the ±14px / ±10px. */
const PARALLAX_X = 28;
const PARALLAX_Y = 20;

interface ReelPlatesProps {
  project: ReelProject;
  index: number;
  total: number;
  /** +1 stepping forward, -1 stepping back. Drives the sign of the handoff. */
  direction: 1 | -1;
  dragRef: React.RefObject<HTMLDivElement | null>;
}

type Layers = { slots: [ReelProject, ReelProject]; front: 0 | 1; forId: string };

export default function ReelPlates({ project, index, total, direction, dragRef }: ReelPlatesProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const pointer = usePointerField(parallaxRef);

  const [layers, setLayers] = useState<Layers>({
    slots: [project, project],
    front: 0,
    forId: project.id,
  });

  // Adjusted during render rather than in an effect. The swap is derived
  // entirely from which project is showing, so an effect would commit one paint
  // of the old layers first and then cascade a second render — visible as a
  // one-frame flash of the previous plate on every step. React re-runs this
  // component immediately without committing, so the swap lands in one paint.
  if (layers.forId !== project.id) {
    const back: 0 | 1 = layers.front === 0 ? 1 : 0;
    const slots: [ReelProject, ReelProject] = [...layers.slots] as [ReelProject, ReelProject];
    slots[back] = project;
    setLayers({ slots, front: back, forId: project.id });
  } else if (layers.slots[layers.front] !== project) {
    // Same project, fresher data: the section paints the shipped fallback list
    // first and swaps in the dashboard rows once fetched. The id matches, so no
    // handoff should play, but the front slot must take the new object or it
    // keeps showing the fallback's plate until the reader steps away and back.
    const slots: [ReelProject, ReelProject] = [...layers.slots] as [ReelProject, ReelProject];
    slots[layers.front] = project;
    setLayers({ ...layers, slots });
  }

  // Parallax is written straight to the node from the motion values; it never
  // touches state, so pointer movement costs no React render.
  useEffect(() => {
    const node = parallaxRef.current;
    if (!node || !pointer.active) return;

    const unsubscribe = pointer.subscribe(({ normX, normY }) => {
      const x = normX * PARALLAX_X;
      const y = normY * PARALLAX_Y;
      node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });

    return () => {
      unsubscribe();
      node.style.transform = "";
    };
  }, [pointer]);

  return (
    <div className="wreel-plates" ref={parallaxRef} aria-hidden="true">
      <div className="wreel-plates-drag" ref={dragRef}>
        {layers.slots.map((slot, slotIndex) => {
          const isFront = layers.front === slotIndex;
          return (
            <div
              key={slotIndex}
              className={`wreel-plate ${isFront ? "is-front" : "is-back"}`}
              style={{ "--dir": direction } as CSSProperties}
            >
              <Plate
                project={slot}
                index={isFront ? index : Math.max(0, index - direction)}
                total={total}
                active={isFront}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

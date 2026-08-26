/* ============================================================================
   PROMPT SPECS  -  the five section-level Skills concepts.
   ----------------------------------------------------------------------------
   These carry one requirement the page-level specs do not: a section must tell
   Claude to build BOTH the in-page section and the route its "See more" opens.
   ========================================================================== */
(function (SE) {
  'use strict';

  var S = SE.promptSpecs;

  /* Shared across all five: the section/route pairing and the rules that make
     a section a good citizen of a longer page. */
  var SECTION_CONTRACT = [
    'Build TWO surfaces, not one.',
    '1. `components/sections/Skills.tsx` - the in-page section, replacing the current one, keeping `id="skills"`.',
    '2. `app/skills/page.tsx` - the full-page view the section\'s "See more" control routes to. Use the App Router; give it real metadata and a back affordance to `/#skills`.',
    'Share the model between them: one data module, one set of primitives, one motion vocabulary. The page view is the section with room to breathe, not a second implementation.',
    'The section must be a good citizen of a longer page: it consumes scroll, it never traps the reader, it never hijacks the wheel away from the document, and scroll momentum survives passing through it.',
    'Total scroll cost of the section is stated below and must not be exceeded. A section that eats twelve screens is a tax on everything below it.'
  ];

  S.signal = {
    subtitle: 'The stack as an instrument trace, drawn by scroll',
    philosophy: [
      'One continuous line across the section. Every technology is a peak whose height is its depth of experience, every layer is a coloured run of the trace, and a playhead names what it crosses.',
      'The reader does not operate it. They scroll at their own pace and the pen draws; the section reveals itself as a by-product of them continuing to read the page.',
      'The instrument framing is the argument: a career rendered as a measured reading rather than as a list of logos.'
    ],
    hierarchy: [
      '1. The playhead and its readout - the one thing that moves under attention.',
      '2. The trace itself, stroked at 1.8px in the current layer hue.',
      '3. Peak dots and their drop-lines to the baseline, at 16% until attended.',
      '4. Layer gates: vertical hairlines with a 9px mono label, 9% before the pen reaches them and 34% after.',
      '5. The graticule at 5%. Present as instrument furniture, never as content.'
    ],
    structure: [
      'A `<section id="skills">` containing an over-tall rail with a `position: sticky` viewport of exactly one screen inside it. The height difference is the scroll distance.',
      'Inside the sticky viewport: a heading block, a full-width `<canvas>`, and a readout strip pinned under the canvas.',
      'A "See more" control that fades in once the trace passes 80% and routes to `/skills`.',
      'A visually-hidden focusable list mirroring every technology into the accessibility tree.'
    ],
    interaction: [
      'SCROLL: progress 0..1 maps to how much of the trace is drawn. Damp the drawn length toward the raw scrub value at lambda 7 - a raw scrub makes the pen stutter with the scrollbar; damping gives it mass.',
      'READOUT: the nearest peak to the pen updates a strip showing layer, name, role and years. It changes about 29 times across the section, so it is React state; the pen position is not.',
      'PAGE VIEW: the trace is fully drawn and held. The playhead follows the cursor X instead of scroll, the readout tracks it, and clicking a peak opens that technology.',
      'The peak envelope is a sum of gaussians: `y(x) = amp * SUM(weight_i * exp(-0.5 * ((x - x_i)/sigma)^2))` with `sigma = 0.42 / count`. Sample at 1.6px intervals and only sum peaks within 3.2 sigma of the sample.'
    ],
    choreography: [
      { n: 'The pen', d: 'Drawn length damped toward scroll progress at lambda 7 (about 140ms to 63%). This single constant is what separates "a chart that grows" from "a pen that draws".' },
      { n: 'Instrument noise', d: 'Add `(1 - min(1, envelope)) * (sin(x*520)*1.1 + sin(x*187)*0.7)` to the y value. Noise ONLY where the signal is quiet: a wobble on a peak reads as a rendering bug, a flat line without one reads as a chart.' },
      { n: 'Gate ignition', d: 'A layer gate goes from 9% to 34% stroke and its label from 24% to 90% the moment the pen passes it. Instant, not eased. A gate that fades in has not been crossed, it has been anticipated.' },
      { n: 'Readout', d: 'opacity 0 -> 1 over 260ms `cubic-bezier(0.23, 1, 0.32, 1)` on first data, then the text swaps with no transition. Animating text swaps at this rate would smear.' },
      { n: 'See more', d: 'opacity + translateY(10px -> 0), 420ms `cubic-bezier(0.23, 1, 0.32, 1)`, triggered at 80% progress. It arrives as the trace finishes, so it reads as a conclusion.' }
    ],
    scroll: [
      'Scroll cost: 2.8 viewport heights. That is the whole budget for this section.',
      'Use a `position: sticky` viewport inside an over-tall rail, NOT ScrollTrigger `pin: true`. Pinning injects a pin-spacer and rewrites layout; sticky achieves the same with no layout surgery and no pin-spacer bugs.',
      'Drive progress from a single ScrollTrigger with `scrub: 0.6` and `invalidateOnRefresh: true`. Lenis is already mounted site-wide: wire `lenis.on("scroll", ScrollTrigger.update)` once, do not create a second instance.',
      'Unsubscribe the render loop from the ticker when the section leaves the viewport.'
    ],
    hover: [
      'In the section, hover does nothing. The concept is scroll-driven and hover theatre would compete with the pen.',
      'In the page view, the cursor IS the playhead: pointer X maps to trace position, the nearest peak lights, and the readout follows. Hide the native cursor over the canvas and show a crosshair reticle.',
      'Gate everything behind `@media (hover: hover) and (pointer: fine)`.'
    ],
    click: [
      'Section: only the "See more" control is clickable. It routes to `/skills`.',
      'Page: clicking a peak selects that technology and opens a detail panel with role, specifics, years and related technologies.',
      'Keyboard: focusing an entry in the hidden list moves the playhead to that peak and updates the readout.'
    ],
    responsive: {
      desktop: 'Canvas padding 7% horizontally, amplitude 30% of height, ring sampling at 1.6px, full readout including the role column.',
      tablet: 'Identical. The heading block tightens and the readout drops its years column first.',
      mobile: 'Amplitude drops to 24% of height and padding to 5%. The role column is removed from the readout so layer, name and years still fit on one line. DPR caps at 1.75. The trace stays full width; do NOT rotate it or make it vertical, because the left-to-right reading is the whole metaphor.'
    },
    a11y: [
      'The canvas is `role="img"` with an `aria-label` summarising the reading in one sentence.',
      'Every technology is a real focusable `<button>` in a visually-hidden list, in order. Focus moves the playhead, so a keyboard user drives the same instrument.',
      'The readout is `aria-live="polite"` so each crossing is announced without stealing focus.',
      'Reduced motion: the trace renders fully drawn immediately, the pen damping is removed (scrub becomes 1:1), and the noise term is dropped. The reading is still complete and still scrubbable; only the drawing performance is gone.'
    ],
    perf: [
      'About 700 line segments per frame plus 29 dots. Comfortably 60fps.',
      'The gaussian sum must use a windowed loop (3.2 sigma), not all peaks per sample. Full summation is 29 x 700 = 20k exp() calls per frame and will show up on a mid-tier laptop.',
      'Stroke the trace as per-layer runs and flush each run once, rather than changing strokeStyle per segment.',
      'Cap DPR at 2 / 1.75. Never use ctx.filter or shadowBlur.',
      'One rAF for the page, shared with anything else animating on the site.'
    ],
    packages: [
      { p: 'gsap + ScrollTrigger (installed)', w: 'For the scrub only. The render loop must not be driven by GSAP.' },
      { p: '@gsap/react (installed)', w: '`useGSAP(() => {...}, { scope: ref })` so the context reverts on unmount.' },
      { p: 'no charting library', w: 'This is not a chart. Recharts or visx would fight every design decision here and ship 100kb to draw one polyline.' }
    ],
    architecture: [
      { f: 'components/sections/Skills.tsx', r: 'Server Component: heading, the hidden accessible list rendered from data, and the client leaf.' },
      { f: 'components/skills/SignalTrace.tsx', r: '"use client": canvas, envelope maths, render loop, scrub subscription.' },
      { f: 'components/skills/SignalReadout.tsx', r: 'Presentational, takes `Skill | null`. Shared with the page view.' },
      { f: 'app/skills/page.tsx', r: 'The full-page view: the same trace held still and driven by the pointer, plus a detail panel.' },
      { f: 'lib/skills/envelope.ts', r: 'Pure functions: `envelopeAt(x, peaks, sigma)`, `nearestPeak(x)`. Unit-testable, no DOM.' }
    ],
    state: [
      '`activeIndex` in `useState` - it changes about 29 times across the whole section.',
      'Drawn length, scroll progress, pointer X and the damping accumulator are ALL refs. A progress value in state re-renders the tree at 60fps.',
      'Guard `setActiveIndex` with an equality check so a scrub does not fire sixty updates a second.'
    ],
    typography: [
      'Readout name: display face 500 at `clamp(1.125rem, 2.2vw, 1.75rem)`, `-0.03em`.',
      'Layer label: mono 500 at 9px, `0.22em`, uppercase, in the layer hue.',
      'Gate labels drawn to canvas: mono 500 at 9px. Do not scale them with the trace; instrument labels are a fixed size.',
      'Years: tabular figures, so the readout does not shift as it changes.'
    ],
    color: [
      'The trace carries the current layer hue at 92% alpha. Everything else is neutral.',
      'Six hues, one per layer, at similar chroma so the trace reads as one instrument changing range rather than six unrelated colours.',
      'The playhead dot is pure white with a 14% white halo - the only pure white in the section, which is what makes it read as the live element.',
      'Light mode: raise the graticule from 5% to about 9% (hairlines vanish on white), darken each hue one step, and switch the playhead from white to the ink colour.'
    ],
    spacing: [
      'Canvas inset 7% horizontally so the trace never touches the frame.',
      'Baseline at 66% of canvas height, amplitude 30%: the trace sits low, which leaves the upper two thirds for the peaks to occupy and makes tall peaks feel earned.',
      'Readout separated by a single hairline and 0.875rem of padding. It is instrument furniture, not a card.'
    ],
    relationships: [
      'Peak height encodes depth of experience. It is the only place proficiency appears and it is never quantified.',
      'Horizontal position encodes order through the stack, so the trace reads left to right as a journey through the architecture.',
      'Colour runs encode layer membership without needing a legend.',
      'The gates are what turn a waveform into a structure: they say the signal has sections.'
    ],
    acceptance: [
      'Scrolling draws the trace smoothly with no stepping and no stutter tied to the scrollbar.',
      'The readout names each technology as the pen crosses it.',
      'The section costs 2.8 screens of scroll and no more, and the page continues normally after it.',
      'Tabbing through the hidden list moves the playhead.',
      'With reduced motion on, the trace is fully drawn and still readable and scrubbable.',
      '"See more" routes to /skills and back returns to the section, not the top of the page.'
    ]
  };

  S.columns = {
    subtitle: 'Six spines that take the room from each other',
    philosophy: [
      'At rest the section is six vertical strips and almost no content. Open one and it claims the width, its label swings from vertical to horizontal, and its technologies unfurl.',
      'The restraint is the point: a Skills section that shows everything at once is a wall. This one shows a shape, and gives you detail only where you ask.',
      'Because only one layer is ever open, the section holds a fixed height and never reflows the page beneath it.'
    ],
    hierarchy: [
      '1. The open strip: horizontal label at up to 2rem, kicker in the layer hue, blurb, then the technology rows.',
      '2. The five closed spines: index, vertical label at 0.28em tracking, count.',
      '3. Row detail inside the open strip, cascading in.',
      'Nothing outside the open strip competes. Closed strips are structure, not content.'
    ],
    structure: [
      '`<section id="skills">` with a heading block, then a flex row of six `<article>` strips inside a 1px-bordered container.',
      'Each strip: a `<button role="tab">` spine (fixed 3.5rem) plus a body that only has content when open.',
      'A "See more" control below the set routing to `/skills`.',
      'The set is `role="tablist"`; the strips are tabs.'
    ],
    interaction: [
      'HOVER (pointer: fine only) opens a strip. TAP opens it on touch. Left/Right arrows step between strips and move focus.',
      'Opening animates `flex-grow` from 1 to 5.2 over 520ms `cubic-bezier(0.23, 1, 0.32, 1)`.',
      'The vertical label fades to 0 over 300ms as the horizontal one appears; they are two elements, not one rotating element, because rotating type through 90 degrees mid-transition is illegible for the whole transition.',
      'Rows cascade in at `200ms + index * 48ms`.',
      'Exactly one strip is open at a time and one is always open, so the section never shows an empty state.'
    ],
    choreography: [
      { n: 'The open', d: '`flex-grow: 1 -> 5.2`, 520ms `cubic-bezier(0.23, 1, 0.32, 1)`. This deliberately breaks the transform-and-opacity rule: an accordion has no transform equivalent, because scaling a strip squashes its type and the counter-scale no longer matches its own metrics. Six elements relaying out once per intent, not per frame, is the correct trade and the same exemption a height-animated accordion gets.' },
      { n: 'Label swap', d: 'Vertical label opacity 1 -> 0 over 300ms; inner content 0 -> 1 over 340ms with a 120ms delay. The gap is deliberate: the old label must be gone before the new one arrives or they overlap in the same optical space.' },
      { n: 'Row cascade', d: 'opacity + translateY(8px -> 0), 420/480ms `cubic-bezier(0.23, 1, 0.32, 1)`, `transition-delay: calc(200ms + var(--k) * 48ms)`. Driven by a CSS custom property, not six tweens.' },
      { n: 'Parallax', d: 'Each strip\'s inner content translates by `((i % 3) - 1) * 26 + (i % 2 ? 8 : -8)` pixels across the section\'s pass through the viewport, scrubbed. Six planes at five different rates is the only reason this reads as depth rather than as a widget.' }
    ],
    scroll: [
      'Scroll cost: exactly one section height. No rail, no sticky, no pinning. This is the cheapest of the five in scroll budget and the easiest to place next to anything.',
      'The parallax is a single ScrollTrigger scrub over the section\'s own pass through the viewport, writing six transforms directly.',
      'Never animate the strips\' flex-grow from scroll. Layout on every scroll frame would be a disaster; the parallax touches transforms only.'
    ],
    hover: [
      'Hover opens, gated behind `@media (hover: hover) and (pointer: fine)`. On touch, hover is not simulated; tap is the input.',
      'Use one delegated `pointerover` on the set, not six listeners.',
      'A closed spine brightens its label from neutral-3 to neutral-2 only. Adding a second hover effect on top of "it opens" is noise.'
    ],
    click: [
      'Click opens on every input type, including where hover already did. That redundancy is deliberate: a touch user and a mouse user must not need different mental models.',
      'The spine is a real `<button>` with `aria-selected` and roving `tabindex`.',
      '"See more" routes to `/skills`, where all six strips render open side by side in a horizontal scroller with per-technology notes.'
    ],
    responsive: {
      desktop: 'Six strips horizontally, set height `clamp(22rem, 56vh, 34rem)`, open strip at flex-grow 5.2.',
      tablet: 'Same model. Spine width holds at 3.5rem; the blurb truncates before the rows do.',
      mobile: 'Below 860px the set rotates: `flex-direction: column`, strips become horizontal rows, the vertical label becomes horizontal, and the accordion opens downward. Set height becomes `max-height: 76vh` with the open row taking flex-grow 6. This is a different accordion, not a narrow one.'
    },
    a11y: [
      'Real `role="tablist"` / `role="tab"` with `aria-selected`, and roving tabindex so Tab enters the group once and arrows move within it.',
      'Content of closed strips stays in the DOM and is reachable; do not `display: none` it, or a screen reader loses five sixths of the section.',
      'Vertical text via `writing-mode` remains selectable and readable to assistive tech; it is a CSS rotation of layout, not an image.',
      'Reduced motion: `flex-grow` transitions to 120ms, the row cascade collapses to a single 120ms opacity change with no delay, and the parallax is not wired at all.'
    ],
    perf: [
      'The only per-frame work is six transform writes during the parallax scrub. Everything else is discrete.',
      'The `flex-grow` transition relayouts six elements once per intent. Measure it: it should be a single layout pass, not a per-frame one. If you see layout on every frame, something else is animating a layout property.',
      'Do not put `will-change` on the strips. They change layout, not compositing, and `will-change: transform` on a relayouting element is wasted memory.'
    ],
    packages: [
      { p: 'gsap + ScrollTrigger (installed)', w: 'Parallax scrub only. Everything else is CSS transitions.' },
      { p: 'no accordion library', w: 'This is six flex children and one state value. A headless accordion would add a controller for behaviour you already have.' }
    ],
    architecture: [
      { f: 'components/sections/Skills.tsx', r: 'Server Component rendering all six strips and their full content, so nothing is gated behind hydration.' },
      { f: 'components/skills/ColumnSet.tsx', r: '"use client": open state, delegated pointer handling, roving tabindex, arrow keys.' },
      { f: 'components/skills/ColumnParallax.tsx', r: '"use client": the ScrollTrigger scrub. Separate leaf so the tab logic is not re-rendered by scroll.' },
      { f: 'app/skills/page.tsx', r: 'All six open in a horizontal scroller, with per-technology notes.' }
    ],
    state: [
      '`openIndex` in `useState`. One number, changes on intent. This is the rare case where state is genuinely correct.',
      'Parallax offsets are written imperatively to refs; they never enter React.',
      'Do not lift `openIndex` to a URL or a store. It is transient view state and putting it in the URL makes the back button meaningless.'
    ],
    typography: [
      'Vertical spine label: mono 10px at `0.28em` tracking via `writing-mode: vertical-rl`. Wide tracking is doing structural work here - vertical type at normal tracking is genuinely hard to read.',
      'Open label: display 500 at `clamp(1.25rem, 2.4vw, 2rem)`, `-0.035em`, `white-space: nowrap` so it never wraps mid-transition.',
      'Rows: name at display 500 0.9375rem, role beneath at mono 8px uppercase, years at mono 11px in the layer hue.'
    ],
    color: [
      'Each strip carries a 7% top wash of its layer hue over the near-black ground, rising to full only on the kicker and the years column.',
      'The 2px gap between strips is the border colour showing through, which is why the container has a `background: var(--line)`. That is cheaper and more precise than six borders.',
      'Light mode: strips become near-white with the hue in the wash at about 5%, the container background becomes the light hairline, and the years column darkens one step.'
    ],
    spacing: [
      'Spine 3.5rem fixed. Narrow enough that five closed strips cost 17.5rem, which is what leaves room for the open one to be genuinely wide.',
      'Open strip padding `clamp(1rem, 2vw, 1.75rem)`. Rows at 0.5rem vertical with a single hairline between.',
      'Set height is fixed so the page below never reflows when a strip opens. This is the single most important spacing decision in the concept.'
    ],
    relationships: [
      'Width encodes attention: the open strip is the one you are asking about, and it is physically larger.',
      'The spine count tells you how much is inside before you open it, which is what makes choosing a strip an informed act rather than a guess.',
      'The layer hue is the only through-line between the closed spine and the open content, so the eye can follow which strip it opened.'
    ],
    acceptance: [
      'Moving across the strips opens each one cleanly with no flicker and no double-open.',
      'The page below the section never moves when a strip opens.',
      'Arrow keys move between strips and focus follows.',
      'On a phone the section is a vertical accordion, not six 60px slivers.',
      'With reduced motion on, opening is near-instant and every layer is still reachable.'
    ]
  };

  S.mask = {
    subtitle: 'The layer name cut out of its own contents',
    philosophy: [
      'One enormous word per layer, with that layer\'s technologies drifting inside the letterforms. Nothing is written on top of anything: the type is the window.',
      'Scroll rolls the word to the next layer and the field goes with it, so moving through the stack is a single continuous typographic motion.',
      'It is the loudest of the five and it knows it. It earns the volume by carrying real content inside the letterforms rather than decorating them.'
    ],
    hierarchy: [
      '1. The letterforms, filling 86% of width and up to 62% of height.',
      '2. The technology names inside them, at 32-80% alpha in the layer hue.',
      '3. The 1px outline at 22%, which is what keeps the shape readable where the field is sparse.',
      '4. The caption beneath: kicker in the layer hue at 10px, blurb at 14px neutral.'
    ],
    structure: [
      '`<section id="skills">` containing an over-tall rail with a one-screen `position: sticky` viewport.',
      'Inside: a full-bleed `<canvas>` and an absolutely positioned caption at the bottom left.',
      'A "See more" control top right, routing to `/skills`.',
      'A visually-hidden list of every technology, because none of the canvas text is in the accessibility tree.'
    ],
    interaction: [
      'SCROLL maps 0..1 to a continuous position across the six layers. Damp the shown position toward it at lambda 5.5.',
      'During a roll, the outgoing word travels up by 92% of canvas height and the incoming enters from the same distance below.',
      'The field drifts continuously: alternating row directions, speeds of 18 + (row % 4) * 11 px/s, and a pointer offset of up to 26px.',
      'PAGE VIEW: an index of all six layers sits below. Hovering or focusing a row drives the mask to that layer, so the word becomes a control rather than a slideshow.'
    ],
    choreography: [
      { n: 'The cut-out', d: 'Paint the letterforms first, then paint the field over them with `globalCompositeOperation = "source-atop"`, which only marks pixels that are already opaque. One pass, no offscreen buffer.' },
      { n: 'Why not destination-in', d: 'Two sequential `destination-in` passes intersect rather than union, so the outgoing and incoming words would erase each other and leave nothing. Drawing both words first, then compositing the field atop the union, is what makes a two-word roll possible at all. This is the single most important implementation note in the concept.' },
      { n: 'The roll', d: 'Position damped at lambda 5.5 (about 180ms to 63%). Slower than a UI transition on purpose: this is a camera move through a sequence, not a state change.' },
      { n: 'The outline', d: '1px stroke at 22% on both words, drawn after the composite. Without it the word disappears wherever the field happens to be sparse and the reader loses the shape they are reading.' },
      { n: 'Caption', d: 'Swaps at the rounded layer index with no transition on the text itself; the hue behind it cross-fades over 700ms. Text that cross-fades at this size smears.' }
    ],
    scroll: [
      'Scroll cost: 3.2 viewport heights. The most expensive of the five, justified by the fact that six full-frame words is the whole content.',
      'Sticky viewport inside an over-tall rail, scrubbed by one ScrollTrigger. Not `pin: true`.',
      'Unsubscribe the render loop when the section leaves the viewport - a drifting field nobody is looking at is pure battery cost.'
    ],
    hover: [
      'In the section: the field drifts toward the pointer by up to 26px on X. Nothing else responds, because the word is mid-transit and adding hover state to a moving target is frustrating.',
      'In the page view: the index rows are the hover surface and they drive the mask.',
      'Gate behind `@media (hover: hover) and (pointer: fine)`.'
    ],
    click: [
      'Section: only "See more" is clickable.',
      'Page: index rows are real buttons that drive the mask and are keyboard-focusable, so the page view is fully operable without a pointer.',
      'Do not make the canvas clickable. Hit-testing letterforms is unreliable and there is nothing underneath worth targeting.'
    ],
    responsive: {
      desktop: 'Word fills 86% of width and up to 62% of height. Field row height 5.5% of canvas height.',
      tablet: 'Identical; the caption blurb wraps to two lines.',
      mobile: 'Word fills 94% of width and up to 42% of height, because a short layer name at 62% height on a portrait screen overflows horizontally. The caption blurb is dropped and only the kicker remains. Pointer drift is off. Consider reducing to four layers per roll if the names are long.'
    },
    a11y: [
      'This is the highest-risk concept of the five for accessibility and it must be handled explicitly.',
      'None of the canvas text exists to assistive tech. The visually-hidden list is not optional; it is the only accessible copy of the content.',
      'The caption is `aria-live="polite"` so the current layer is announced as it changes.',
      'Contrast: the field inside the letterforms must reach 4.5:1 against the ground at its brightest rows. Verify it; a hue at 32% alpha inside a letterform frequently does not.',
      'Reduced motion: the field stops drifting entirely and the roll becomes a direct index change with no travel. Render one layer, held, and let scroll step between them. The words are still readable and the content is still complete.'
    ],
    perf: [
      'Text rendering is the cost here: roughly 20 rows x 8 words = 160 fillText calls plus two large fillText and two strokeText per frame.',
      'Cache `measureText` results per row height. Measuring every word every frame is the one thing that will drop this below 60fps.',
      'Font fitting (`measureText` at 100px, then scale) runs twice per frame. That is acceptable; running it per word is not.',
      'Cap DPR at 2 / 1.75. The composite pass is full-canvas, so DPR cost is quadratic here more than anywhere else.'
    ],
    packages: [
      { p: 'gsap + ScrollTrigger (installed)', w: 'The scrub only.' },
      { p: 'no SVG text masking', w: 'An SVG `<mask>` with animated text would need a full re-layout per frame and cannot composite a moving field as cheaply as `source-atop` on a canvas.' }
    ],
    architecture: [
      { f: 'components/sections/Skills.tsx', r: 'Server Component: heading, hidden accessible list, client leaf.' },
      { f: 'components/skills/MaskField.tsx', r: '"use client": canvas, field painting, composite, roll.' },
      { f: 'lib/skills/fitText.ts', r: 'Pure: `fitFontSize(ctx, text, targetW, targetH)` with the measure-at-100-and-scale trick.' },
      { f: 'app/skills/page.tsx', r: 'The mask plus the interactive layer index below it.' }
    ],
    state: [
      '`activeLayer` in `useState` - six changes across the section, drives the caption and the hue.',
      'Continuous position, damping accumulator, field time and pointer offset are all refs.',
      'The page view\'s hovered index is a ref too; only the caption text needs to reach React.'
    ],
    typography: [
      'The word: display face 700, fitted to width. This concept lives or dies on the typeface - use a geometric grotesque with closed apertures, because open letterforms leak the field and lose their shape.',
      'The field: mono 500 at 62% of row height. Monospace is doing real work here: even advance widths make the field read as texture rather than as words you are supposed to read.',
      'Caption kicker: mono 10px at 0.22em. Blurb: display 14px, 1.55 line-height, 48ch max.'
    ],
    color: [
      'One hue per layer, used for the entire field. The letterform outline stays neutral at 22%.',
      'The ground carries a 7% radial wash of the current hue, cross-faded over 700ms.',
      'Field alpha varies 32-80% per word so the interior has depth rather than reading as a flat fill.',
      'Light mode: this concept needs the most care. Invert to a light ground, drop field alpha to about 55% of the dark values, and raise the outline to 34% - a 22% outline is invisible on white.'
    ],
    spacing: [
      'Word at 86% of width leaves a 7% margin either side. Any tighter and the letterforms feel cropped; any looser and the word stops being architectural.',
      'Field row height 5.5% of canvas height gives roughly 18 rows, which is dense enough to fill a counter and sparse enough to read as individual words.',
      'Caption inset by the page gutter, bottom aligned, so it reads as a caption rather than as a second headline.'
    ],
    relationships: [
      'The word names the layer. Its contents are that layer\'s technologies. That single containment relationship is the entire concept and nothing else needs to encode category.',
      'The roll direction encodes sequence: layers arrive from below in stack order.',
      'Field density is incidental, not semantic. Do not map it to anything; nobody can read density as a value.'
    ],
    acceptance: [
      'The technology names are visibly inside the letterforms, not behind or beside them.',
      'Rolling between layers shows both words simultaneously mid-transition, each carrying its own field.',
      'The word is readable at every point in the roll, including when the field is sparse.',
      'On a phone the word fits without horizontal overflow for the longest layer name.',
      'With reduced motion on, the field is still and the section steps between layers cleanly.'
    ]
  };

  S.plates = {
    subtitle: 'Six plates that stack as you descend',
    philosophy: [
      'Each layer holds the frame while the next climbs over it. The one behind recedes and dims instead of leaving, so the stack accumulates as you read down it.',
      'The reader physically travels down through the architecture. By the last plate they have passed through five others and can feel that they are deep in something.',
      'It is the most conventional of the five in mechanism and the most cinematic in effect, which is a good trade for a section that has to sit next to other sections without argument.'
    ],
    hierarchy: [
      '1. The layer name at up to 4.5rem.',
      '2. The oversized numeral behind it at 22% of the layer hue.',
      '3. The technology index on the right: name, role, years, hairline-separated.',
      '4. The kicker in the layer hue and the blurb in neutral.',
      '5. The wash: two radial gradients in the layer hue, which is what makes each plate feel like a different room.'
    ],
    structure: [
      '`<section id="skills">` containing a stack of six `<section>` plates.',
      'Each plate: `position: sticky; top: 0; height: 100dvh`, an opaque background, a wash layer, a two-column grid of lead and index, and a scrim.',
      'The last plate carries the "See more" control routing to `/skills`.',
      'No rail, no wrapper viewport - the plates ARE the mechanism.'
    ],
    interaction: [
      'Scroll only. There is no hover state, no click target except "See more", and that is correct: a plate that responds to hover while it is being pushed off screen feels broken.',
      'Each plate scales from 1 to 0.93 and its scrim rises from 0 to 78% opacity, scrubbed by the NEXT plate\'s position, from `top bottom` to `top top`.',
      'That coupling is the whole concept. Driving the outgoing plate from its own position produces a sequence of fades; driving it from the incoming plate produces a stack.'
    ],
    choreography: [
      { n: 'The stack', d: 'For plate i (except the last): `scale: 1 -> 0.93` and `scrim opacity: 0 -> 0.78`, `ease: "none"`, `scrub: true`, `trigger: plates[i+1]`, `start: "top bottom"`, `end: "top top"`. Two separate tweens on two elements, both scrubbed by the same window.' },
      { n: 'Why sticky, not pin', d: '`position: sticky` holds each plate at the viewport top with zero layout surgery. ScrollTrigger `pin: true` would insert a pin-spacer per plate - six spacers - and is fragile inside a nested scroll container.' },
      { n: 'transform-origin', d: '`center 40%`, not centre. A plate scaling from its centre appears to sink; scaling from above centre appears to recede, which is the reading you want.' },
      { n: 'The scrim', d: 'A separate opaque child animating opacity, NOT opacity on the plate itself. Fading the whole plate would let the next plate show through its type, which looks like a rendering error.' },
      { n: 'Index rows', d: 'No entrance animation. The plate arrives whole. Six plates each staggering their own list is five too many identical entrances, and `impeccable`\'s floor calls that out specifically.' }
    ],
    scroll: [
      'Scroll cost: six viewport heights, one per plate. That is inherent to the mechanism and is the honest price of this concept. If that is too much for the page, this is the wrong concept, not a concept to shorten.',
      'Two ScrollTriggers per plate, ten total. Acceptable because each is a pure scrub with no callbacks.',
      '`invalidateOnRefresh: true` on all of them, and refresh after fonts load and on resize.',
      'Lenis is site-wide; wire it to ScrollTrigger once.'
    ],
    hover: [
      'Deliberately none on the plates.',
      'Index rows may shift their name from neutral to the layer hue over 180ms. Nothing moves.',
      '"See more" uses the standard button treatment.'
    ],
    click: [
      'Only "See more", on the last plate, routing to `/skills`.',
      'The page view is the same six layers as a continuous document with per-technology notes, plus a sticky left rail that tracks which layer is in view via IntersectionObserver.',
      'Do not make plates clickable. There is nowhere for a plate to go that scrolling does not already take you.'
    ],
    responsive: {
      desktop: 'Two-column grid, numeral up to 8rem, plate height 100dvh.',
      tablet: 'Same, with the gap tightening and the numeral dropping to about 6rem.',
      mobile: 'Below 900px the grid collapses to one column and the plate switches from `align-items: center` to `stretch`, with content vertically centred inside. The numeral drops to 3rem and sits above the name rather than behind it, because a 22%-opacity numeral behind type at phone width makes the name unreadable.'
    },
    a11y: [
      'Each plate is a real `<section>` with an `aria-label` naming its layer, so the stack is navigable by landmark.',
      'All content is in the DOM and readable without JS. The stacking is presentational.',
      'Sticky elements must not obscure keyboard focus (WCAG 2.2). Verify that tabbing to the "See more" control on the last plate scrolls it into view and does not leave it under a preceding plate.',
      'Reduced motion: drop the scale and scrim tweens entirely. `position: sticky` alone still produces a clean stacked read with no animation, which is a genuinely good degraded state rather than a compromise.'
    ],
    perf: [
      'Per frame during a transition: one transform and one opacity, on two elements. This is the cheapest of the five.',
      'Six full-viewport sticky elements each with two radial gradients is real paint cost on a low-end GPU. Keep the wash to two gradient stops each and do not add a third layer.',
      'Do not animate the wash. It is static per plate; only scale and scrim move.',
      '`will-change: transform` on the plates is justified here because they genuinely transform for the whole section. Remove it if you drop the scale under reduced motion.'
    ],
    packages: [
      { p: 'gsap + ScrollTrigger (installed)', w: 'The coupled scrub. This is exactly the canonical sticky-stack case.' },
      { p: '@gsap/react (installed)', w: '`useGSAP` with a scope so all ten triggers revert together on unmount.' },
      { p: 'no scroll library beyond Lenis', w: 'Already mounted. A second smooth-scroll layer would fight it.' }
    ],
    architecture: [
      { f: 'components/sections/Skills.tsx', r: 'Server Component rendering all six plates and their full content.' },
      { f: 'components/skills/PlateStack.tsx', r: '"use client": the ten scrubs, in one `useGSAP` scope.' },
      { f: 'components/skills/Plate.tsx', r: 'Presentational. Takes `category`, `index`, `isLast`.' },
      { f: 'app/skills/page.tsx', r: 'Non-sticky continuous document with notes and a sticky tracking rail.' }
    ],
    state: [
      'None during the section. Everything is scrubbed transforms; React does not re-render at all while scrolling. This is the correct target for a scroll-driven section.',
      'The page view keeps one `activeLayer` for the rail, driven by IntersectionObserver, not by scroll position.'
    ],
    typography: [
      'Layer name: display 500 at `clamp(2rem, 5.4vw, 4.5rem)`, `-0.045em`, `line-height: 0.92`.',
      'Numeral: display 700 at `clamp(3rem, 9vw, 8rem)`, `line-height: 0.78`, `-0.06em`, at 22% of the layer hue.',
      'Index rows: name at `clamp(1rem, 1.6vw, 1.25rem)` display 500; role beneath at mono 9px uppercase; years at mono 10px in the layer hue with tabular figures.'
    ],
    color: [
      'One hue per plate, in the numeral (22%), the kicker, the years column, and the two-gradient wash (16% and 8%).',
      'Plate background must be fully opaque and identical across all six, or the stack shows through and the illusion dies.',
      'The scrim is the ground colour, not black, so a dimmed plate still belongs to the page.',
      'Light mode: plates become the light ground, the wash drops to about 9%, the numeral rises to 30% (a 22% tint disappears on white), and the scrim becomes the light ground colour.'
    ],
    spacing: [
      'Two columns with `gap: clamp(1.5rem, 5vw, 5rem)`. The generous gap is what stops the index from reading as a sidebar.',
      'Plate padding `clamp(2rem, 6vh, 4rem)` vertical and the page gutter horizontal.',
      'Index rows at 0.6875rem vertical with a single hairline. No top border on the group.',
      'The numeral sits directly above the name with 0.5rem between them, close enough to read as one lockup.'
    ],
    relationships: [
      'Depth in the stack encodes progression through the architecture. The plate you are on is the layer you are in.',
      'The accumulating stack behind you is the point: it says these layers coexist, they did not replace each other.',
      'Scale and dimming encode recency, not importance. Keep them subtle enough that a receded plate still looks like a peer.'
    ],
    acceptance: [
      'Each plate visibly holds at the top of the viewport while the next climbs over it.',
      'The outgoing plate recedes and dims rather than scrolling away.',
      'No plate ever shows another plate through its own background.',
      'The section costs six screens and the page continues cleanly after the last plate.',
      'With reduced motion on, sticky alone still produces a clean stacked read.'
    ]
  };

  S.depth = {
    subtitle: 'Fly through the stack rather than around it',
    philosophy: [
      'The technologies are not arranged around the viewer, they are arranged in front of them. Scroll flies the camera forward through a corridor, and names resolve out of the far plane and pass you.',
      'Each layer is a gate you pass through, and crossing it regrades the frame. The architecture becomes something you travel along rather than something you look at.',
      'The spatial relationship is the differentiator: an orbit keeps you outside a system looking in, a corridor puts you inside it.'
    ],
    hierarchy: [
      '1. Whatever is at the focal plane - largest, brightest, with its role visible beneath it.',
      '2. Items approaching from the far plane, fading up from 0.',
      '3. Items sweeping past the camera, fading out before they smear across the lens.',
      '4. Gate frames: a rectangle plus a mono label in the layer hue at up to 50%.',
      '5. The HUD: current gate, a progress meter, and an in-frame count.'
    ],
    structure: [
      '`<section id="skills">` containing an over-tall rail with a one-screen `position: sticky` viewport.',
      'Inside: a full-bleed `<canvas>` and a HUD strip along the bottom.',
      '"See more" top right, routing to `/skills`.',
      'A visually-hidden focusable list of every technology; focusing one flies the camera to it.'
    ],
    interaction: [
      'SCROLL maps 0..1 to camera Z from 0 to `totalDepth - focal`. Damp the camera toward it at lambda 4.5.',
      'Projection: `s = focal / (z - camZ)`, screen position `centre + (worldXY + pointerOffset) * s * scale`, with `focal = 620` and item spacing 300 units.',
      'Items are seeded once with `SE.rng` and never reshuffle. A flythrough that regenerates its corridor on reload is a screensaver.',
      'POINTER steers: up to 60px on X and 40px on Y, applied before projection so nearer items parallax more, which is what sells the depth.',
      'PAGE VIEW: wheel and drag move the camera with momentum (`v *= 0.02^dt`), plus a layer index that flies to a gate.'
    ],
    choreography: [
      { n: 'Camera', d: 'Damped toward target at lambda 4.5 (about 220ms to 63%). Slower than a UI damp because this is a dolly, and a camera that snaps to the scrollbar reads as a jump cut.' },
      { n: 'Two-sided fade', d: '`alpha = far * near` where `far = clamp(1 - z/(focal*5.5), 0, 1)` and `near = clamp((z - 40)/(focal*0.55), 0, 1)`. The near term is the important one: without it, names smear across the lens at the last moment and the corridor reads as noise rather than as travel.' },
      { n: 'Type scale', d: '`fontSize = clamp(15 * s * scale, 7, 96)`. The upper clamp matters - an unclamped projection puts a 400px word across the frame for one frame as it passes.' },
      { n: 'Gates', d: 'A stroked rectangle at 420x300 world units, alpha `clamp(1 - z/(focal*6), 0, 1) * 0.5`, with the label at 1.7x that alpha. They arrive well before their contents, which is what gives the corridor a rhythm.' },
      { n: 'Grade', d: 'The ground wash cross-fades to the current gate\'s hue over 700ms as you pass through it.' }
    ],
    scroll: [
      'Scroll cost: 3.4 viewport heights. Expensive, and the corridor length is the reason; do not shorten the rail without also reducing item spacing or the flythrough becomes a lurch.',
      'Sticky viewport inside an over-tall rail with one scrubbed ScrollTrigger.',
      'Unsubscribe the render loop when off-screen.'
    ],
    hover: [
      'Pointer steers the camera; there is no per-item hover in the section, because hit-testing items that are moving toward the viewer at speed is frustrating for the user and expensive for you.',
      'Page view: the layer index is the hover surface.',
      'Gate the pointer steer behind `@media (hover: hover) and (pointer: fine)`.'
    ],
    click: [
      'Section: only "See more".',
      'Page: the layer index flies the camera to that gate; drag and wheel move it freely with momentum.',
      'Keyboard: focusing an entry in the hidden list flies the camera to that technology, so the corridor is fully navigable without a pointer.'
    ],
    responsive: {
      desktop: 'Item spacing 300 units, focal 620, three concentric spread rings at 140/270/400 units, full pointer steer.',
      tablet: 'Identical model with `scale = min(w, h) / 620` handling the fit.',
      mobile: 'Reduce to the inner two spread rings so names do not fly off the edges of a narrow frame, drop the role sub-label (it is unreadable at phone type sizes in motion), cap DPR at 1.75, and disable pointer steer. Keep the same corridor length; a shorter corridor on a phone means items arrive faster, which is worse, not better.'
    },
    a11y: [
      'None of the canvas text is in the accessibility tree. The visually-hidden list is the accessible content and it must carry name, layer and role.',
      'Focusing an entry flies the camera, so keyboard traversal is a real traversal of the corridor.',
      'The HUD gate label is `aria-live="polite"`.',
      'Motion sensitivity is the real risk here: a forward dolly is exactly the kind of vection that triggers it. Under reduced motion, do NOT fly. Render the corridor as a static depth-sorted composition, disable the camera damping and the pointer steer, and let scroll step discretely between gates. The content stays complete; the vection is gone.'
    ],
    perf: [
      'Per frame: up to 29 items and 6 gates, each one projection plus one or two fillText. Skip anything outside `[40, focal * 7]` before touching the text API.',
      'Painter\'s order by iterating the array backwards, since items are already sorted by Z at build time. No per-frame sort needed.',
      'Font string changes are the hidden cost: round the computed size to an integer so consecutive items at similar depths reuse the same font.',
      'Cap DPR at 2 / 1.75.'
    ],
    packages: [
      { p: 'gsap + ScrollTrigger (installed)', w: 'The scrub only.' },
      { p: 'no three.js', w: 'Every object is a text label. WebGL would mean rendering each name to a texture and billboarding it - more code, blurrier type, and 600kb, to draw the same 29 words. A hand-written perspective divide is about 10 lines.' }
    ],
    architecture: [
      { f: 'components/sections/Skills.tsx', r: 'Server Component: heading, hidden accessible list, client leaf.' },
      { f: 'components/skills/DepthCorridor.tsx', r: '"use client": canvas, projection, camera, render loop.' },
      { f: 'lib/skills/corridor.ts', r: 'Pure: seeded layout generation and `project(x, y, z, camZ, focal, scale)`. Unit-testable.' },
      { f: 'app/skills/page.tsx', r: 'Free-flight version with wheel, drag, momentum and the layer index.' }
    ],
    state: [
      '`activeGate` in `useState` - six changes across the section, drives the HUD label and the grade.',
      'Camera Z, target, velocity and pointer offset are all refs.',
      'The in-frame count in the HUD is computed during render and written imperatively to a DOM node, not through React. It changes every frame.'
    ],
    typography: [
      'Item names: display face, 500 when near and 400 when far, 7-96px. The weight change at s > 0.8 is a cheap and very effective depth cue.',
      'Role sub-labels: mono at 26% of the item size, 7-13px, uppercase, in the layer hue.',
      'Gate labels: mono 500, 8-22px. HUD: mono 10px at 0.18em uppercase.'
    ],
    color: [
      'Item names are always neutral ink; only roles and gates carry the layer hue. Coloured display text passing at speed is illegible and looks cheap.',
      'The ground carries an 8% radial wash of the current gate hue, cross-faded over 700ms.',
      'Alpha does all the depth work. Do not also desaturate far items; alpha plus scale is already two cues and a third reads as a filter.',
      'Light mode: invert the ground, keep names as dark ink, raise gate stroke alpha by about 1.5x, and reduce the wash to 5%.'
    ],
    spacing: [
      'Item spacing 300 world units at focal 620 means roughly two items in the comfortable read zone at any moment. Closer together and it becomes a stream you cannot read; further apart and the corridor feels empty.',
      'Three spread rings at 140, 270 and 400 units from the axis, with the Y spread at 62% of X to match a landscape frame.',
      'Gates at 420x300 units, positioned 55% of one spacing ahead of their first item so they announce rather than coincide.',
      'HUD inset by the page gutter, bottom aligned.'
    ],
    relationships: [
      'Z position encodes order through the stack. Passing a gate means you have entered that layer.',
      'Distance from the corridor axis is decorative composition, not data. Do not map it to anything.',
      'Type scale encodes proximity only. Proficiency is deliberately not encoded here; this concept is about architecture, and the Signal or Kinetic directions are the ones that carry depth of experience.'
    ],
    acceptance: [
      'Scrolling flies the camera forward smoothly, with names resolving from the far plane and fading before they smear past.',
      'The corridor is identical on every reload.',
      'Gate crossings visibly regrade the frame.',
      'Moving the cursor steers, with nearer names parallaxing more than far ones.',
      'Tabbing through the hidden list flies the camera to each technology.',
      'With reduced motion on, the corridor is a still composition and scroll steps between gates without vection.'
    ]
  };

})(window.SE = window.SE || {});

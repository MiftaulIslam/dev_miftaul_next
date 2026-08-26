/* ============================================================================
   PROMPT GENERATOR
   ----------------------------------------------------------------------------
   Output 2 of this project. Each concept carries a full implementation spec;
   the composer turns it into a single briefing that can be pasted into Claude
   inside THIS repository.

   The specs are deliberately opinionated about numbers - exact curves,
   durations, thresholds, damping constants. A prompt that says "smooth
   animation" produces smooth-ish animation. A prompt that says
   `cubic-bezier(0.23, 1, 0.32, 1)` over 220ms produces the thing you just
   looked at.
   ========================================================================== */
(function (SE) {
  'use strict';

  /* --------------------------------------------------------- repo context */
  /* Read from the real package.json of this portfolio. Pinning the versions
     stops the generated prompt from suggesting an API that does not exist in
     the installed major. */
  var REPO = {
    next: '16.2.3 (App Router)',
    react: '19.2.4',
    ts: '5.x',
    tailwind: 'v4 (CSS-first config via @theme inline in app/globals.css)',
    installed: [
      'gsap 3.15 + @gsap/react (useGSAP)',
      'lenis 1.3 (already wrapped in components/LenisProvider.tsx)',
      'framer-motion 12 (available; prefer GSAP for scroll choreography)',
      'three 0.181 (available; do NOT pull it in unless the concept spec says so)',
      'clsx + tailwind-merge (lib/cn.ts)',
      'lucide-react'
    ],
    conventions: [
      'Design tokens live as CSS custom properties in app/globals.css and are exposed to Tailwind through `@theme inline`. Add new tokens there; do not hardcode hex values in components.',
      'Theme is class-based: `.dark` on <html>, with `@custom-variant dark (&:where(.dark, .dark *))`. Any new surface must be legible in BOTH themes.',
      'Reduced motion: use the existing `useReducedMotion()` hook from lib/useReducedMotion.ts. Do not re-implement it.',
      'Skill data already has a live source: GET /api/public/skills returns `StackCategory[]` (see lib/dashboard/types.ts). Fetch it with a static fallback array so the section renders before/without the API.',
      'Technology logos already exist as SVGs in public/tech_icons/ (424 files). Resolve by name with an explicit map plus a typographic monogram fallback; never ship a broken <img>.',
      'The section replaces components/sections/Skills.tsx and must keep the `id="skills"` anchor, because Navbar/SiteDock scroll to it and dispatch `nav-section-jump` / `nav-section-settled` CustomEvents that the section should listen for and use to reset its own state.'
    ]
  };

  /* Shared data contract, extended per concept where needed. */
  var DATA_CONTRACT = [
    '```ts',
    '// types/skills.ts',
    'export type SkillId = string;',
    '',
    'export interface Skill {',
    '  id: SkillId;              // stable slug, used as React key and graph id',
    '  name: string;             // display name, e.g. "PostgreSQL"',
    '  weight: number;           // 0..1 proficiency. NEVER rendered as a bar or a percentage.',
    '                            // It drives visual weight only: radius, type scale, prominence.',
    '  years: number;            // years in production',
    '  role: string;             // one short noun phrase, e.g. "Primary store"',
    '  note: string;             // one sentence of specifics, e.g. "Query planning, partial indexes, CTEs"',
    '  iconSrc: string | null;   // "/tech_icons/PostgresSQL.svg" or null -> monogram fallback',
    '}',
    '',
    'export interface SkillCategory {',
    '  id: string;               // "persistence"',
    '  label: string;            // "Persistence"',
    '  kicker: string;           // "What survives a restart"',
    '  layer: string;            // "Data" - the position in a request path',
    '  accent: string;           // hex, the category signature hue',
    '  blurb: string;            // one or two sentences of point of view',
    '  skills: Skill[];',
    '}',
    '',
    'export type SkillRelation = [SkillId, SkillId, number]; // [from, to, strength 0..1]',
    '```',
    '',
    'Derive `skillsById`, `neighbours` (adjacency map) and a flat `skills` array once with `useMemo`. Every concept reads the derived structures, never re-walks the raw arrays inside render.',
    '',
    'Map the live API shape onto this: `StackCategory.tools[]` -> `Skill[]`, `StackCategory.accent` -> `accent`. Fields the API does not carry yet (`weight`, `years`, `role`, `note`) come from a local enrichment map keyed by tool name, so the section degrades to sensible defaults for unknown tools instead of crashing.'
  ];

  /* ======================================================================
     PER-CONCEPT SPECIFICATIONS
     ====================================================================== */
  var SPECS = {

    /* ------------------------------------------------------------ ORBIT */
    orbit: {
      subtitle: 'The stack as an orbital system with a centre of gravity',
      philosophy: [
        'A skills section usually answers "what does this person know". This one answers "what does this person\'s work orbit around". The developer is the core; each layer of the stack is an orbital ring; each technology is a body on that ring with real depth.',
        'Depth is the argument. A body nearer the viewer is literally more present in the work. Nothing is a card, nothing is a badge, and there is no percentage anywhere.',
        'The camera is the user. Cursor position steers it, so the composition is never the same twice, but it is always legible because the underlying geometry is fixed and deterministic.'
      ],
      hierarchy: [
        '1. The core wordmark and its halo - the gravitational centre, always at optical centre.',
        '2. Near-side bodies (projected scale > 1.0) - full opacity, larger radius, labels at full weight.',
        '3. Ring paths - 16% alpha hairlines in the ring category hue. Present, never competing.',
        '4. Far-side bodies - fade toward 28% alpha, smaller radius, labels drop to 8px and eventually vanish.',
        '5. Starfield - 6% to 22% alpha, single-pixel, purely to give the void a sense of scale.',
        'The selected body outranks everything: everything else drops to 26% (or 62% for same-ring siblings) while it stays at 100% and grows a dashed connector back to the core.'
      ],
      structure: [
        'Full-bleed section, `min-h-[100dvh]`, `id="skills"`, `relative overflow-hidden`.',
        'Layer 1: `<canvas>` absolutely filling the section. This is the entire visual.',
        'Layer 2 (top-left): section heading block - eyebrow, title, one-line lede. Pointer-events: none.',
        'Layer 3 (bottom-left): ring legend, one row per category with a coloured dot. Clicking a row isolates that ring.',
        'Layer 4 (top-right on >=768px, bottom sheet below): detail panel for the selected technology.',
        'Layer 5: a visually-hidden but focusable list of every skill as a real <button>, mirroring the canvas into the accessibility tree.'
      ],
      interaction: [
        'IDLE: rings rotate at per-ring speeds between 0.115 and 0.060 rad/s, alternating direction by ring index. Camera yaw drifts at +0.055 rad/s.',
        'POINTER PARALLAX: camera yaw += pointerX * 0.42 rad, pitch = -0.30 + pointerY * 0.24 rad. Pointer is damped with an exponential filter (lambda 4.5) BEFORE it reaches the camera, so the camera never snaps.',
        'HOVER: hit test in projected screen space against every body, radius 26px * projectedScale, nearest wins. The hovered body raises 26 world units out of its ring plane (damped, lambda 7) and grows a radial glow.',
        'SELECT (click / tap / keyboard focus): orbital time scale eases from 1.0 to 0.22 - time dilates while you read. The camera acquires the selected body and tracks it: target yaw = PI - atan2(bodyX, bodyZ), unwrapped to the short path, damped at lambda 1.7. Zoom eases 1.0 -> 1.10.',
        'DESELECT: Escape, clicking empty space, clicking the same body again, or the panel close button. Everything eases back; nothing snaps.'
      ],
      choreography: [
        { n: 'Entry', d: 'Global `reveal` value 0 -> 1 over 1.1s multiplies every alpha in the scene. Rings, bodies, starfield and core all resolve out of black together. No per-element stagger: this is a camera fading up, not a list appearing.' },
        { n: 'Hover lift', d: 'Exponential damp, lambda 7 (about 140ms to 63%). Two independent damped values per body - `lift` (world units) and `glow` (0..1) - so a fast mouse sweep leaves a trailing wake instead of a binary flicker.' },
        { n: 'Camera acquire', d: 'Damp lambda 1.7 on yaw, ~600ms perceptual. Deliberately slower than the hover: the hover is feedback, this is a camera move.' },
        { n: 'Time dilation', d: 'timeScale damp lambda 3 between 1.0 and 0.22. This is what makes selection feel like focus rather than like a tooltip.' },
        { n: 'Connector', d: 'Dashed line [2,4] from core to the attended body at 34% alpha. Drawn only for hover/selection - 29 permanent spokes would be a hairball.' }
      ],
      scroll: [
        'This concept does NOT hijack scroll. It is a self-contained spatial interaction and scroll-jacking it would fight the page.',
        'Use a single IntersectionObserver on the section: when it leaves the viewport, unsubscribe the render loop from the ticker entirely. An off-screen WebGL-less canvas should cost zero.',
        'On enter, run the 1.1s reveal once. Do not re-run it on every re-entry - a section that re-introduces itself every scroll pass is exhausting.'
      ],
      hover: [
        'Gate every hover behaviour behind `@media (hover: hover) and (pointer: fine)`. On touch, hover state is driven by tap instead.',
        'Hovered body: lift 26 units, glow 1, radius * 1.7, label switches to 500 weight and full alpha, ring stroke of its own category brightens while other rings drop to 40%.',
        'Cursor: the native cursor is hidden ONLY over the canvas (there is no text to select) and replaced by a 34px reticle that carries the hovered technology name as a label.',
        'Sibling bodies on the same ring stay at 62% while other rings drop to 26% - the ring reads as a group without needing an outline.'
      ],
      click: [
        'Click sets `selectedId`. Clicking the selected body again clears it. Clicking empty canvas clears it.',
        'The detail panel shows: category label in the ring hue, technology name, role, the specifics sentence, years in production, connection count, and up to six related technologies as chips.',
        'Panel motion: opacity + translateX(12px -> 0) over 220ms `cubic-bezier(0.23, 1, 0.32, 1)`. Below 720px it becomes a bottom sheet: translateY(100% -> 0) over 320ms `cubic-bezier(0.32, 0.72, 0, 1)`.',
        'Keyboard: focusing a button in the hidden list selects the corresponding body, so tabbing through the section flies the camera around the system.'
      ],
      responsive: {
        desktop: 'Full parallax, 150 starfield points, ring radii 96 + i*56, canvas fits to min(w,h) * 0.44.',
        tablet: 'Identical model. Fit factor unchanged; the legend moves to a single column.',
        mobile: 'Starfield drops to 60 points, DPR caps at 1.75, fit factor 0.40, ring path sampling drops from 72 to 44 segments. Pointer parallax is off (there is no hover); the camera keeps its idle drift so the system still feels alive. Legend becomes a horizontal wrap at the top. Detail panel becomes a bottom sheet.'
      },
      a11y: [
        'The canvas gets `role="img"` and an `aria-label` summarising the system in one sentence.',
        'Mirror every technology into a visually-hidden `<ul>` of real `<button>` elements, in reading order. `focus` selects, so keyboard users get the same experience the pointer gives. The container reveals itself on `:focus-within` so sighted keyboard users can see where they are.',
        'The detail panel is `aria-live="polite"` so a selection is announced without stealing focus.',
        'Escape always clears selection. Focus is never trapped.',
        'Under `prefers-reduced-motion: reduce`: no idle rotation, no parallax, no camera tracking. Render a single well-composed static frame and re-render only on selection change. The full information is still reachable; only the movement is gone.'
      ],
      perf: [
        'Target 60fps with ~29 bodies + 150 starfield points + 6 ring paths. Measured cost is dominated by text, so quantise label font sizes to whole pixels and clamp them to 8-15px.',
        'ONE requestAnimationFrame loop for the whole page. If the portfolio already animates elsewhere, subscribe to a shared ticker rather than starting a second loop.',
        'Cap devicePixelRatio at 2 (1.75 on mobile). A 3x retina canvas at full viewport is 9x the fill rate for no perceptible gain.',
        'Depth-sort bodies with a plain `Array.prototype.sort` on the precomputed z - 29 elements, negligible.',
        'Never use ctx.filter or shadowBlur. Glows are radial gradients, which composite far cheaper.',
        'Under reduced motion the loop must be fully idle, not merely slowed.'
      ],
      packages: [
        { p: 'none required', w: 'The projection is ~40 lines of trigonometry. Do NOT add three.js: every object here is a labelled point, and text in WebGL means canvas-texture billboards - more code, blurrier type, 600kb.' },
        { p: 'gsap (already installed)', w: 'Optional, only for the entry reveal and the detail panel transition. The render loop itself must not be driven by GSAP.' }
      ],
      architecture: [
        { f: 'components/sections/Skills.tsx', r: 'Server Component shell: heading, static markup, and the accessibility list rendered from data so it exists without JS.' },
        { f: 'components/skills/OrbitCanvas.tsx', r: '"use client" leaf. Owns the canvas, the projection, the render loop, and pointer handling. Receives `categories` as a prop; holds no application state beyond hover/selected ids.' },
        { f: 'components/skills/SkillDetailPanel.tsx', r: 'Presentational. Takes a `Skill | null`. Shared with any other concept that needs a detail surface.' },
        { f: 'lib/skills/projection.ts', r: 'Pure functions: `ringPoint()`, `project()`. Unit-testable, no DOM.' },
        { f: 'lib/skills/data.ts', r: 'Fetch + normalise + derive. Exports `useSkillGraph()`.' },
        { f: 'lib/useTicker.ts', r: 'The single shared rAF subscription for the whole site.' }
      ],
      state: [
        'Local `useState` for `selectedId` only - it changes rarely and drives React-rendered DOM (the panel).',
        'CRITICAL: `hoverId`, camera yaw/pitch/zoom, per-body lift and glow, and pointer position must live in `useRef`, NOT `useState`. They change every frame; putting them in state re-renders the tree at 60fps and collapses on mobile.',
        'The canvas render loop reads refs directly. React is only involved when `selectedId` changes.',
        'No global store. This section owns its own state entirely.'
      ],
      typography: [
        'Labels: monospace (JetBrains Mono or the existing --font-mono), 400 weight, 8-15px, drawn directly to canvas. Monospace because these are identifiers, and because tabular figures keep the years readout from shifting.',
        'Core wordmark: monospace 500, letter-spaced wide enough to read as an emblem rather than a word.',
        'Section heading: the existing display face at `clamp(2rem, 4vw, 3.5rem)`, weight 500, `letter-spacing: -0.04em`, `line-height: 0.9`.',
        'Detail panel name: display face 500 at 1.5rem, `-0.03em`. Role line: monospace 10px, `0.14em` tracking, uppercase.'
      ],
      color: [
        'Ground: near-black, never #000. Use the existing `--background` token in dark mode; in light mode invert to a very pale neutral and drop every alpha by roughly a third, because glows on white read as smudges.',
        'One hue per category, six total, spaced around the wheel at similar chroma so they read as one system: 196 (ice), 14 (vermillion), 268 (violet), 152 (emerald), 42 (amber), 330 (rose).',
        'Body fill uses its category hue at 28-100% alpha by depth. Labels are always neutral ink, never the category hue - coloured text at 9px is unreadable.',
        'The core halo is neutral. It is the one thing in the scene that belongs to no category.'
      ],
      spacing: [
        'The canvas is edge to edge. All chrome is inset by `clamp(1rem, 2.5vw, 2rem)`.',
        'Ring radii are arithmetic (96 + i*56), not geometric: equal spacing reads as a designed system, exponential spacing reads as an accident.',
        'Detail panel: `width: min(23rem, calc(100% - 2rem))`, 1.25rem padding, 2px radius to match the page shape system.',
        'Legend rows: 5px dot, 0.625rem gap, 0.3125rem vertical padding. Tight enough to read as one object.'
      ],
      relationships: [
        'Ring membership communicates category. Do not also colour-code labels or add category badges - one signal per relationship.',
        'Radial distance from the core communicates position in the stack, front-end innermost, intelligence outermost. This makes the ordering readable even before any label is.',
        'Body radius communicates `weight` (2.4 + weight * 3.6 world units). This is the only place proficiency appears, and it is never quantified.',
        'The dashed connector on hover is what turns a set of dots into a system: it says every technology is attached to the same centre.'
      ],
      acceptance: [
        'Moving the cursor across the section rotates the whole system smoothly with no visible stepping.',
        'Hovering a body raises it out of its ring and dims the rest without any flicker on a fast sweep.',
        'Selecting a body slows the system and the camera brings it round to face you.',
        'Tabbing into the section moves selection body to body and the camera follows.',
        'With reduced motion on, the section is a still composition that still selects and still reads.',
        'Chrome DevTools performance panel shows a single rAF and no long tasks while interacting.'
      ]
    },

    /* ------------------------------------------------------------- REEL */
    reel: {
      subtitle: 'The stack as a cut sequence, scrubbed by scroll',
      philosophy: [
        'Six layers presented as six scenes in an edit. Scrolling is not navigation here, it is the timeline: the reel pans laterally, each scene arrives, grades the frame in its own hue, states its case, and hands over.',
        'The order carries meaning. Scenes run in the order a request travels - Interface, Runtime, Contract, Persistence, Delivery, Intelligence - so scrubbing the section is scrubbing a system.',
        'Cinematic here means restraint, not effects. Letterbox bars, a colour grade, a slate, a chapter rail, and one continuous camera move. No wipes, no flares, no 3D.'
      ],
      hierarchy: [
        '1. The scene title at `clamp(2.5rem, 7vw, 6rem)` - the single loudest element in the frame.',
        '2. The oversized scene numeral behind it at 7% opacity in the scene hue, counter-parallaxed. Reads as depth, never as content.',
        '3. The slate line (SC 03 / 06 - API) in the scene hue at 10px, the only place the hue touches text.',
        '4. Kicker and blurb in descending neutral steps.',
        '5. The technology rows: name at 500, role in 10px mono uppercase, years in the scene hue. Separated by hairlines only.',
        '6. The chapter rail, pinned below the letterbox, always available and never loud.'
      ],
      structure: [
        'Section with `id="skills"`, `relative`, containing a scroll container.',
        'Track: `display:flex`, one `<section>` per category at `flex: 0 0 100%`.',
        'A sticky viewport of exactly one screen height holds the track; the rail behind it is `N x 100%` tall, and that height difference IS the scroll distance.',
        'Fixed overlays inside the section: letterbox bars (top and bottom), the grade layer, the chapter rail.',
        'Each scene: vertical stack of slate, title, kicker, blurb, and the technology rows, with a 1px accent gradient rule down the left edge.'
      ],
      interaction: [
        'The primary interaction is scroll. There is no drag, no click-to-advance except the chapter rail.',
        'Chapter rail: six labelled ticks. Clicking one scrolls the container to that scene with `behavior: "smooth"` (and `"auto"` under reduced motion).',
        'ArrowUp / ArrowDown move by whole scenes when the section has focus, because a sequence should be steppable from the keyboard.',
        'A timecode readout (03 / 06) and a 1px progress bar track position continuously.'
      ],
      choreography: [
        { n: 'The pan', d: 'One GSAP tween: `x: -(track.scrollWidth - viewport.clientWidth)`, `ease: "none"`, driven by a ScrollTrigger with `scrub: 0.85`. Scrub, not toggle: the reel must be attached to the scrollbar, and 0.85 gives it a small amount of weight without lag.' },
        { n: 'Scene cut', d: 'A scene becomes live when `Math.round(progress * (N-1))` equals its index. Live scenes release their contents on a CSS cascade: 40/90/130/170ms for the four header blocks, then `220ms + i*45ms` for each technology row. opacity + translateY(18px), 520-620ms, `cubic-bezier(0.23, 1, 0.32, 1)`.' },
        { n: 'Counter-parallax', d: 'Each scene numeral translates by `clamp(sceneOffset, -1.4, 1.4) * 26%` against the pan. Written as a direct transform on six elements per frame - never as a CSS variable on a parent, which would restyle the whole subtree.' },
        { n: 'Grade', d: 'Two radial gradients in the active scene hue, cross-faded over 700ms `cubic-bezier(0.23, 1, 0.32, 1)`. Slow on purpose: a grade that snaps reads as a bug.' },
        { n: 'Letterbox', d: 'On mount, both bars `scaleY: 0 -> 1` over 700ms `expo.out`, 60ms apart. transform-origin top and bottom respectively. This is the camera rolling; it happens once.' }
      ],
      scroll: [
        'Use `gsap.registerPlugin(ScrollTrigger)` and drive the pan with `scrub`. `invalidateOnRefresh: true` so the distance recomputes on resize.',
        'Sticky + scrub, NOT `pin: true`. Pinning inserts a pin-spacer and rewrites layout; a `position: sticky` viewport inside an over-tall rail achieves the identical effect with no layout surgery and no pin-spacer bugs when the section is inside another scroll container.',
        'Total scroll distance = viewportHeight * numberOfScenes. Six scenes = six screens of scroll for the whole section. Do not make it longer; a section that eats twelve screens is a tax.',
        'Re-run `ScrollTrigger.refresh()` on resize, after fonts load, and on the existing `nav-section-settled` event this repo already dispatches.',
        'Lenis is already mounted site-wide. Wire it once: `lenis.on("scroll", ScrollTrigger.update)` and drive `lenis.raf` from the shared ticker. Do not create a second Lenis instance for this section.'
      ],
      hover: [
        'Hover is deliberately minor here - the concept is driven by scroll, and adding hover theatre would compete with the edit.',
        'Technology rows: name shifts from neutral ink to the scene hue over 180ms `ease`. Nothing moves.',
        'Chapter ticks: dot opacity 0.4 -> 1, label neutral-3 -> neutral-2, 220ms. The active tick is already at full.',
        'Everything gated behind `@media (hover: hover) and (pointer: fine)`.'
      ],
      click: [
        'Chapter tick: computes `(i / (N-1)) * maxScroll` and scrolls there. In vertical mode it uses `scrollIntoView({ block: "start" })` instead.',
        'Technology row: optional. If you add a click, it should expand the row in place to reveal the specifics sentence - not open a modal, which would break the frame.',
        'No click target may sit under the letterbox bars.'
      ],
      responsive: {
        desktop: 'Lateral pan, scrub 0.85, scene padding `clamp(2.5rem, 6vh, 5rem) clamp(1.25rem, 7vw, 8rem)`, numeral up to 30rem.',
        tablet: 'Identical, with the numeral pulled to `34vw` and the row grid dropping the role column at the narrow end.',
        mobile: 'Below 768px the reel becomes a VERTICAL cut: `gsap.matchMedia()` reverts the horizontal ScrollTrigger entirely and the scenes stack at one viewport each with `scroll-snap-type: y proximity`. Scene activation switches to an IntersectionObserver at 0.55 threshold - discrete arrivals, no scrub, because a smeared scrub on a short vertical throw feels like lag. The role column is dropped; the numeral moves behind and drops to 6% opacity.'
      },
      a11y: [
        'Every scene is a real `<section>` with `aria-label="Scene 03, Contract"`, so the sequence is navigable by landmark.',
        'Content must be in the DOM and readable with JS disabled or before hydration; the reveal only removes an initial opacity, it never gates content behind an event.',
        'The chapter rail is a real button group with `aria-current` on the active tick.',
        'ArrowUp/ArrowDown step scenes. Focus is never trapped and the scroll container is keyboard scrollable.',
        'Under `prefers-reduced-motion: reduce`: scrub becomes `true` (1:1 with the scrollbar, no smoothing lag), reveals drop to a 120ms opacity fade with no translate, counter-parallax is skipped entirely, and chapter jumps use `behavior: "auto"`.',
        'Hiding the scrollbar is only acceptable because the progress bar and chapter rail replace the affordance. Keep both.'
      ],
      perf: [
        'One ScrollTrigger for the whole section. Do not create one per scene.',
        'Per frame: one transform on the track plus six transforms on the numerals. Nothing else moves.',
        'All reveals are CSS transitions with `transition-delay` from a `--i` custom property. Cheaper than six JS tweens and they interrupt correctly if the user scrolls back.',
        'Never animate `background-position` or `filter` for the grade - cross-fade two gradient layers with opacity.',
        '`content-visibility: auto` on off-screen scenes is tempting; do not use it here, because it breaks the horizontal track measurement.',
        'Measure with the Performance panel while scrubbing: the goal is zero layout and zero paint on the track, only composite.'
      ],
      packages: [
        { p: 'gsap + ScrollTrigger (installed)', w: 'The scrub-linked pan and `matchMedia` breakpoint reverting are exactly what this plugin is for. Register once at module scope.' },
        { p: '@gsap/react (installed)', w: 'Use `useGSAP(() => {...}, { scope: ref })` so contexts revert on unmount. Do not hand-roll `gsap.context`.' },
        { p: 'lenis (installed)', w: 'Already site-wide. Connect it to ScrollTrigger; do not instantiate a second one.' },
        { p: 'no three.js', w: 'Nothing in this concept is 3D. Adding WebGL for a grade would be a 600kb gradient.' }
      ],
      architecture: [
        { f: 'components/sections/Skills.tsx', r: 'Server Component. Renders every scene\'s markup so the content is server-rendered and crawlable.' },
        { f: 'components/skills/ReelChoreography.tsx', r: '"use client" leaf holding refs and the `useGSAP` block. Renders nothing itself - it wires behaviour to children passed through.' },
        { f: 'components/skills/ReelScene.tsx', r: 'Presentational scene. Receives `category`, `index`, `total`, `isLive`.' },
        { f: 'components/skills/ChapterRail.tsx', r: 'Client. Buttons plus the progress bar; takes `activeIndex` and `onJump`.' },
        { f: 'lib/skills/useReelProgress.ts', r: 'Encapsulates the ScrollTrigger and exposes `{ progress, activeIndex }` via a ref-based subscription, not state.' }
      ],
      state: [
        '`activeIndex` is the ONLY value allowed in React state - it changes about six times across the whole section and drives the grade and the rail.',
        'Scroll progress must never enter state. Read it inside the ScrollTrigger `onUpdate` and write transforms imperatively.',
        'Do not use `window.addEventListener("scroll")` anywhere. ScrollTrigger and IntersectionObserver only.',
        'Guard `setActiveIndex` with an equality check so a scrub does not fire sixty state updates a second.'
      ],
      typography: [
        'Scene title: display face 500, `clamp(2.5rem, 7vw, 6rem)`, `letter-spacing: -0.05em`, `line-height: 0.88`.',
        'Scene numeral: display face 700 at `clamp(10rem, 34vw, 30rem)`, `line-height: 0.72`, `-0.06em`. Big enough that it stops being a number and becomes a shape.',
        'Slate and role labels: mono 500 at 10px, `0.24em` / `0.14em` tracking, uppercase.',
        'Technology names: display 500 at `clamp(1rem, 1.5vw, 1.25rem)`, `-0.02em`.',
        'Years: mono with `font-variant-numeric: tabular-nums`, so the column does not shimmy as scenes change.'
      ],
      color: [
        'One hue per scene, applied to exactly four things: the left rule, the slate, the years column, and the two grade gradients. Everywhere else is neutral ink.',
        'The grade must stay under about 18% mixed into the ground. Past that it stops being a grade and becomes a background colour.',
        'Letterbox bars are the page ground colour, not black, so the section still sits on the page.',
        'In light mode: keep the same hues, cut the grade to about 8%, and invert the letterbox to the light ground. Do not invert the hues themselves.'
      ],
      spacing: [
        'Each scene is exactly one viewport. Content is vertically centred with `align-content: center`, not top-aligned - the frame is the composition.',
        'Left padding scales `clamp(1.25rem, 7vw, 8rem)`; the generous left margin is what makes it read as a frame rather than a slide.',
        'Rows: 0.625rem vertical padding, 1px hairline between, no top border on the group and no bottom border on the last row.',
        'The chapter rail sits above the bottom letterbox: `padding-bottom: calc(0.6875rem + barHeight)`.'
      ],
      relationships: [
        'Sequence communicates architecture: scene order is request order. Say so in the slate (Client, Application, API, Data, Platform, Intelligence).',
        'The grade ties every element in a scene to its layer without needing a badge on each row.',
        'The counter-parallax numeral is what separates foreground content from the frame; without it the pan reads flat.',
        'The progress bar plus timecode tells the viewer how much stack is left. That is the only "completeness" signal the section needs.'
      ],
      acceptance: [
        'One continuous scroll takes you through six scenes with no jump, stall, or half-slide at any point.',
        'Each scene\'s content cuts in as the scene arrives and is fully readable when the scene is centred.',
        'Resizing the window mid-section does not break the pan distance.',
        'On a phone the section is a vertical snap sequence, not a squeezed horizontal one.',
        'With reduced motion on, scrolling still moves through the scenes with no smoothing lag and no parallax.'
      ]
    },

    /* ---------------------------------------------------------- LATTICE */
    lattice: {
      subtitle: 'The stack as a wiring diagram with live traffic',
      philosophy: [
        'The claim is not "I know a long list of technologies", it is "these technologies are one system and I know where the wires go". Adjacency is the content; the nodes are almost incidental.',
        'Signals travel the wires so the graph reads as a system that is running, not a diagram of one that could.',
        'Hovering is an act of tracing. Everything not in the traced neighbourhood drops to 16% so the answer to "what touches this" is immediate and unambiguous.'
      ],
      hierarchy: [
        '1. The traced node - full alpha, ring, glow, label at 500.',
        '2. Its direct neighbours - full alpha, labels shown.',
        '3. The edges of the traced neighbourhood - 42-72% alpha in the source node hue, carrying pulses.',
        '4. Everything else - 16% nodes, 3.5% edges. Present as texture, not as information.',
        'With nothing traced the resting state inverts: all nodes at 90%, edges at 10-20%, and only the heavier nodes carry labels so the field stays readable.'
      ],
      structure: [
        'Full-bleed section, `id="skills"`, `min-h-[100dvh]`, `relative overflow-hidden`.',
        '`<canvas>` filling the section.',
        'Top-left: category legend, one row per layer with a short colour rule. Clicking isolates that cluster.',
        'Bottom-right: a live readout - node count, edge count, and the traced node degree.',
        'Right (or bottom sheet under 720px): the detail panel with the "connects to" chip list.',
        'A visually-hidden focusable list mirroring every node.'
      ],
      interaction: [
        'HOVER: nearest node within 26px wins. Its neighbourhood lights, everything else dims, and a pulse is emitted along every incident edge.',
        'CLICK: locks the trace so it survives moving the pointer away, and opens the detail panel. Clicking the locked node or empty space unlocks.',
        'LEGEND: clicking a layer isolates that cluster - non-members drop to 16%, cross-cluster edges to 18%. Toggle off by clicking again.',
        'AMBIENT: with nothing traced, one pulse fires on a random edge every 0.9-2.3 seconds. Rate-limited on purpose; a graph where every wire is always firing is a screensaver.',
        'Nodes drift on a slow sine (amplitude 3.2px, ~0.4Hz, per-node phase) and the whole field parallaxes 14px horizontally / 10px vertically with the pointer. The drift is what stops it looking like a static SVG.'
      ],
      choreography: [
        { n: 'Layout', d: 'Force-directed relaxation runs 420 iterations ONCE at mount with a seeded PRNG, then stops. Repulsion 5200/d^2 between all pairs, spring toward `116 - strength*34` on edges, a weak pull toward one of six hexagonal category anchors, a weak pull to origin, velocity damping 0.82, and a linear cooling factor. Then normalise to a unit box. Deterministic layout, identical every load.' },
        { n: 'Why not a live sim', d: 'A continuous simulation on 29 nodes never settles - it breathes, and breathing reads as instability rather than craft. Solve once, then animate only drift, parallax and highlight. About 40x cheaper and calmer.' },
        { n: 'Trace', d: 'Node glow damps at lambda 8 (~125ms). Edge and node alpha are computed per frame from the traced set - no transitions needed because the canvas redraws anyway.' },
        { n: 'Pulse', d: 'A 1.9px dot travelling an edge at `0.55 + strength*0.6` units/s, alpha `sin(t * PI)` so it fades in and out rather than popping at the endpoints. Pool capped at 30.' },
        { n: 'Entry', d: 'Global reveal 0 -> 1 over 0.9s multiplying every alpha. Edges and nodes resolve together.' }
      ],
      scroll: [
        'No scroll hijacking. This is a stationary interactive surface.',
        'IntersectionObserver: unsubscribe the render loop when the section leaves the viewport.',
        'The 420-iteration relaxation runs once on mount. If it ever needs to be larger than ~40 nodes, move it into a Web Worker or precompute the positions at build time and ship them as data.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'Hovered node: radius * 1.45, glow 1, ring stroke at 55%, label 500 weight.',
        'Neighbours keep full alpha and gain labels; non-neighbours drop to 16%.',
        'Incident edges brighten to `0.42 + strength*0.3` in the source hue and start carrying pulses.',
        'Native cursor is hidden over the canvas and replaced by a reticle carrying the node name.',
        'The readout updates its "traced" figure to the node degree - the number is genuinely informative, so it earns its place.'
      ],
      click: [
        'Click locks the trace. The detail panel shows category, name, role, specifics, years, degree, and up to six neighbours as chips.',
        'The chips are the real payload of this concept: they name the adjacency in words for anyone who cannot read the graph.',
        'Escape or the panel close button unlocks. Clicking a different node moves the lock.',
        'On touch, tap is the only input, so tap must both trace and lock in one action.'
      ],
      responsive: {
        desktop: 'Padding 96px, labels on nodes with weight > 0.78 at rest, full parallax and drift.',
        tablet: 'Padding unchanged; the legend collapses to a two-column wrap.',
        mobile: 'Padding 54px, DPR 1.75, labels at 9px, resting labels suppressed except for traced neighbourhoods so the field does not turn into a wall of text. Legend becomes horizontally wrapped chips at the top; the readout is hidden. Tap traces and locks; the detail panel is a bottom sheet. Pointer parallax off; drift stays.'
      },
      a11y: [
        'The relationship data must exist as text, not only as pixels. The hidden focusable list per node announces "PostgreSQL - Persistence, Primary store" and the panel lists its connections by name.',
        'Focus on a node button traces it, so keyboard traversal walks the graph.',
        'Detail panel `aria-live="polite"`.',
        'Legend buttons carry `aria-pressed`.',
        'Under `prefers-reduced-motion: reduce`: no drift, no parallax, no ambient pulses, no pulses on trace. Hover and focus still dim and highlight, instantly. The graph is fully usable; it simply holds still.'
      ],
      perf: [
        'Per frame: 29 node positions, ~46 edge strokes, up to 30 pulse dots, and a bounded number of labels. Comfortably 60fps.',
        'Skip any edge whose computed alpha is below 0.01 before touching the path API.',
        'Labels are the expensive part of a graph. Draw them only for the traced neighbourhood, or at rest only for nodes above the weight threshold.',
        'Cap the pulse pool at 30 and splice completed pulses in a reverse loop.',
        'The relaxation is O(n^2 * iterations) = about 170k operations at mount. Fine once; never in a frame.',
        'Cap DPR at 2 / 1.75.'
      ],
      packages: [
        { p: 'none required', w: 'The relaxation is about 45 lines. Do not add d3-force: it brings a scheduler and a tick loop you would immediately have to fight, for a layout you solve once.' },
        { p: 'no three.js', w: '29 dots and 46 lines is a 2D canvas problem.' }
      ],
      architecture: [
        { f: 'components/sections/Skills.tsx', r: 'Server shell: heading, hidden accessible graph description, legend markup.' },
        { f: 'components/skills/LatticeCanvas.tsx', r: '"use client" leaf: canvas, render loop, hit testing, pulse pool.' },
        { f: 'lib/skills/relax.ts', r: 'Pure force-relaxation function: `relax(nodes, links, anchors, iterations) -> normalised positions`. Deterministic, seeded, unit-testable.' },
        { f: 'lib/skills/graph.ts', r: 'Builds `edges` and `neighbours` from `SkillRelation[]`, skipping unknown ids silently so the relation list can be pruned freely.' },
        { f: 'components/skills/SkillDetailPanel.tsx', r: 'Shared with ORBIT.' }
      ],
      state: [
        '`lockedId` in `useState`. `hoverId`, `catFilter`, pulses, drift phases and parallax all in refs.',
        'Compute the layout in a `useMemo` keyed on the relation array so it never re-runs on re-render.',
        'The traced neighbourhood is derived, never stored: `neighbours[activeId]`.',
        'No global state.'
      ],
      typography: [
        'Node labels: mono 400 (500 when traced), 9-10px, drawn to canvas. Small and quiet - the graph is the picture, labels are annotation.',
        'Legend: mono 10px, `0.14em`, uppercase.',
        'Readout figures: mono 13px with tabular figures; their captions at 10px uppercase.',
        'Detail panel matches ORBIT exactly - the two concepts share the component, so they must share the type.'
      ],
      color: [
        'Nodes carry their category hue; edges are neutral grey until traced, then they adopt the source node hue.',
        'This is the rule that makes the trace legible: colour means "in the current trace", not "belongs to a category", once something is traced.',
        'Dimmed state is alpha, never desaturation. Desaturating a hue toward grey at low alpha produces mud.',
        'In light mode: raise edge alpha by roughly 1.5x (thin lines disappear on white), darken node hues one step, and switch dimmed alpha from 0.16 to about 0.22.'
      ],
      spacing: [
        'Layout padding 96px desktop / 54px mobile from the canvas edge, applied at fit time so the graph never touches the frame.',
        'Ideal edge length `116 - strength*34` px: stronger relationships pull tighter, which makes clusters emerge from the data rather than from a grouping rule.',
        'Category anchors on a hexagon at radius 260 x 210 (deliberately elliptical, because the viewport is).',
        'Legend and readout inset `clamp(1rem, 2.5vw, 2rem)`.'
      ],
      relationships: [
        'This concept IS the relationships. Its entire reason to exist is `SkillRelation[]`.',
        'Edge strength drives alpha and pulse frequency, never thickness. Varying stroke width at this scale reads as noise.',
        'Category anchors keep clusters spatially coherent so the layers are visible before anything is traced.',
        'Cross-cluster edges (Prisma to PostgreSQL, Next.js to Vercel, RAG to PostgreSQL) are the most valuable marks on the screen - they are the evidence of full-stack range. Make sure the relation data actually contains them.'
      ],
      acceptance: [
        'The layout is identical on every reload.',
        'Hovering any node instantly answers "what touches this" with no ambiguity.',
        'Pulses read as traffic, not as decoration, and stop when a trace is active elsewhere.',
        'The detail panel names every connection in words.',
        'With reduced motion on, nothing drifts and nothing pulses, but tracing still works.'
      ]
    },

    /* ---------------------------------------------------------- KINETIC */
    kinetic: {
      subtitle: 'Typography as the entire interface',
      philosophy: [
        'There are no containers in this concept. No cards, no chips, no panels at rest. The technology names, set enormous and outlined, are the layout.',
        'Depth comes from speed and scale rather than from shadow: six bands drift at different rates in alternating directions, and the eye reads the faster, larger bands as nearer.',
        'Proficiency is carried by type size. A technology with five years behind it is physically larger in the composition. That is the editorial way to say what a percentage bar says, without the survey.',
        'The whole field is elastic: input velocity shears it, hover displaces it, and selection promotes one word out of it. It should feel like a material, not a list.'
      ],
      hierarchy: [
        '1. Whatever the cursor is on. It fills from outline to solid and everything around it steps aside.',
        '2. Larger-weight words - up to 1.16x the base size, versus 0.66x at the low end.',
        '3. The bands themselves, read as texture at rest.',
        '4. The left rail (01 Interface ... 06 Intelligence) at 9px, 50% opacity, rising to full only for the band being hovered.',
        'In focus mode this collapses entirely: the promoted word owns the frame at up to 13rem and the bands drop to 6% opacity.'
      ],
      structure: [
        'Full-bleed, `id="skills"`, `min-h-[100dvh]`, `overflow: hidden`.',
        'Left rail: fixed vertical index of the six layers.',
        'Field: six `.row` elements, each with an inner track containing its category\'s technology names TWICE, so the wrap is seamless.',
        'Focus overlay: hidden until a word is promoted. Contains the promoted word plus a metadata block - category index, role and years, the specifics sentence, and the "wired to" list.',
        'No section heading competing with the type. If a heading is required, set it small and mono in a corner; the words are the headline.'
      ],
      interaction: [
        'DRIFT: each band translates at a base speed of 16-30 px/s, direction alternating by index. Position wraps at exactly half the track width, which is why the content is duplicated.',
        'SHEAR: wheel delta and drag distance feed a single impulse value. That damps into a velocity (lambda 9), the impulse itself decays (lambda 3.4), and the residual becomes a skewX clamped to +/-9deg, damped at lambda 6 and applied with alternating sign per band. Two decay rates is what gives the field weight.',
        'HOVER: the word fills, its band slows to 18% speed, and its neighbours displace by `sign(distance) * max(0, 1 - |distance|/4) * 26px` - a magnetic wave that falls off over four words.',
        'PROMOTE (click / Enter): a measured FLIP moves the word from where it actually sits to the centre of the frame.',
        'DEMOTE: Escape, the close button, or clicking the backdrop.'
      ],
      choreography: [
        { n: 'The FLIP', d: 'Read the clicked word\'s `getBoundingClientRect()`. Render the promoted copy at its final size and read ITS rect. Compute `scale = from.width / to.width` and the centre delta, then tween from `{ x: dx, y: dy, scale, opacity: 0.2 }` to identity over 820ms `expo.out`. This is the single most important motion in the concept: it is what proves the big word and the small word are the same object.' },
        { n: 'Field retreat', d: 'The six bands fade to 6% over 500ms `power2.out` with a 30ms stagger, starting with the promotion. They retreat; they do not disappear.' },
        { n: 'Metadata', d: 'Four blocks, opacity + translateY(14px), 500ms `expo.out`, 55ms stagger, 260ms delay so the word lands before the text arrives.' },
        { n: 'Neighbour displacement', d: 'A CSS transition of 420ms `cubic-bezier(0.23, 1, 0.32, 1)` on transform. Written once per hover change, never per frame.' },
        { n: 'Fill', d: '280ms on `color` and `-webkit-text-stroke-color` together, so the outline becomes a solid rather than a solid appearing behind an outline.' }
      ],
      scroll: [
        'This concept does not use page scroll at all - it consumes wheel input as velocity instead.',
        'That is a deliberate trade and it has a cost: a section that eats the wheel can trap the user. Mitigate it: only consume wheel while the pointer is inside the section, never `preventDefault` the event (keep the listener passive), and let the page continue to scroll normally. The wheel feeds the shear as a bonus, it does not replace scrolling.',
        'If you would rather not touch the wheel at all, drive the shear from `ScrollTrigger.getVelocity()` instead. Same look, zero interception.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`. On touch there is no hover, so tapping goes straight to promotion.',
        'Use ONE delegated `pointerover` listener on the field, not one per word. There are around sixty word elements.',
        'On hover change: clear the previous word\'s neighbour offsets before applying the new ones, or the offsets accumulate.',
        'The band slows rather than stopping. A band that halts dead under the cursor reads as broken.'
      ],
      click: [
        'Click or Enter/Space on a focused word promotes it. Words in the duplicate pass are `aria-hidden` and `tabindex="-1"` so the tab order visits each technology exactly once.',
        'Focus mode shows: `04 / Persistence`, `Primary store - 5 years in production`, the specifics sentence, and `Wired to PostgreSQL, Prisma, Redis, ...`.',
        'Escape, the close button, and a backdrop click all demote. Return focus to the word that was promoted.',
        'Do not navigate anywhere. Promotion is the detail view.'
      ],
      responsive: {
        desktop: 'Base type size `clamp(3rem, 11vw, 11rem)`, six bands, left rail visible, full shear and magnetic displacement.',
        tablet: 'Same model, rail hidden below 900px, band gap tightens.',
        mobile: 'Base drops to `clamp(2.25rem, 15vw, 5rem)`, which keeps three to four bands legible on screen. Drag replaces wheel as the velocity source. Neighbour displacement is disabled (no hover), tap promotes directly, and the focus overlay is full-screen with the word wrapping to two lines if needed. Do NOT simply scale the desktop type down; recompute the band count so the composition still fills the frame.'
      },
      a11y: [
        'This concept is the highest accessibility risk of the six, and it has to be handled explicitly rather than hoped over.',
        'Each first-pass word is a real focusable element with `role="button"` and an `aria-label` carrying name, layer and role. Duplicates are `aria-hidden="true"` with `tabindex="-1"`.',
        'Outlined text via `-webkit-text-stroke` has poor contrast by design. Provide an `@supports not` fallback to a solid low-alpha fill, keep the stroke at or above 34% alpha, and make the focused and hovered states fully solid ink. Never leave a keyboard user on an outline-only word.',
        'Moving text is a WCAG concern. Under `prefers-reduced-motion: reduce` the marquee STOPS and the field becomes a static wrapped composition - not a frozen off-centre crop. Duplicated words are hidden, the field becomes scrollable, and every word is readable in place.',
        'Provide a visible pause affordance if you keep the drift on by default, or start paused and drift only after a first interaction.',
        'The promoted state must move focus into the overlay and restore it on close.'
      ],
      perf: [
        'Per frame: exactly six transform writes, one per band track. Nothing else animates continuously.',
        'Around sixty word elements in the DOM. Keep them plain `<span>`s; do not wrap each in a motion component.',
        'Use `will-change: transform` on the six tracks only, never on the words.',
        'Neighbour displacement is a style write on up to eight elements per hover change, not per frame.',
        'Re-measure track widths on `document.fonts.ready` and on resize via ResizeObserver, or the wrap point will be wrong for the first second on a cold load.',
        '`-webkit-text-stroke` on very large type is cheap to paint but re-paints on colour change; that is fine at hover frequency and would not be at 60fps.'
      ],
      packages: [
        { p: 'gsap (installed)', w: 'Only for the FLIP promotion and the field retreat. If GSAP is unavailable the concept must degrade to a crossfade, not break.' },
        { p: 'no SplitText', w: 'Words, not characters. Per-character splitting here would multiply the DOM by six for no visual gain.' },
        { p: 'no marquee library', w: 'The drift is `x += speed * dt` with a modulo wrap. A library cannot make that velocity-reactive.' }
      ],
      architecture: [
        { f: 'components/sections/Skills.tsx', r: 'Server shell rendering all six bands and both passes, so the words are in the HTML.' },
        { f: 'components/skills/KineticField.tsx', r: '"use client" leaf: the drift loop, shear model, delegated hover, and promotion trigger.' },
        { f: 'components/skills/PromotedSkill.tsx', r: 'The focus overlay. Receives `skill` and `onClose`; owns focus management.' },
        { f: 'lib/skills/useFlip.ts', r: 'Small hook: `flipFrom(sourceEl, targetEl, options)`. Measures both rects and returns the tween. Reusable elsewhere in the portfolio.' },
        { f: 'lib/useTicker.ts', r: 'Shared rAF.' }
      ],
      state: [
        '`promotedId: string | null` in `useState` - the only state, and it changes rarely.',
        'Band offsets, velocity, impulse, shear and hovered element must all be refs. Putting a marquee offset in state renders React sixty times a second.',
        'Neighbour displacement is written directly to `element.style.transform`; it is view state, not application state.',
        'No context, no store.'
      ],
      typography: [
        'This concept lives or dies on the typeface. Use a geometric display sans with tight apertures - Space Grotesk (already in this repo) at 700, or a heavier display grotesque if you license one.',
        'Word size: `calc(base * (0.66 + weight * 0.5))` where base is `clamp(3rem, 11vw, 11rem)`.',
        '`letter-spacing: -0.055em`, `line-height: 0.94`. Display type needs negative tracking; the default spacing is drawn for body copy.',
        'Outline: `-webkit-text-stroke: 1px` at 34% ink. Filled state is solid ink. No gradient text.',
        'Metadata and rail: mono at 9-11px with wide tracking, which is the counterweight that keeps the huge type from looking like a poster with nothing to say.',
        'Do not mix in a serif for emphasis. If a word needs emphasis, use weight or fill in the same family.'
      ],
      color: [
        'This is the one concept with NO signature hue. It is pure monochrome: near-black ground, off-white ink, and the outline at 34%.',
        'That is the point of difference against the other five. Contrast is the colour.',
        'The only hue permitted is the category accent on the promoted word\'s category label and its focus ring - two small marks, and only in focus mode.',
        'In light mode: invert to a warm-neutral off-white ground with near-black ink; keep the stroke alpha at 34% of the ink, not of the ground.'
      ],
      spacing: [
        'Band gap `clamp(0.125rem, 0.6vh, 0.75rem)` - deliberately tight. Bands should nearly touch so the field reads as one mass.',
        'Word gap within a band `clamp(1.5rem, 4vw, 4rem)`.',
        'The field is vertically centred and full-bleed horizontally. No container, no max-width. Words must run off both edges - a marquee with visible ends is a list.',
        'Focus overlay padding `clamp(1.5rem, 5vw, 5rem)` with the word left-aligned, not centred: centred giant type reads as a splash screen.'
      ],
      relationships: [
        'Band membership communicates category. The rail names the band; nothing else needs a label.',
        'Type size communicates depth of experience.',
        'Drift speed communicates nothing semantically, and that is fine - it is the mechanism that creates the depth illusion. Do not be tempted to map speed to proficiency; nobody can read velocity as a value.',
        'The "wired to" line in focus mode is the only place relationships appear, and it should read as a sentence, not as chips.'
      ],
      acceptance: [
        'At rest the field drifts smoothly with no visible seam at the wrap point.',
        'A hard scroll or drag shears the whole field and it settles without wobble.',
        'Hovering a word fills it and pushes its neighbours aside; leaving restores them exactly.',
        'Clicking a word visibly grows it from where it was into the frame - you can see the same object move.',
        'Tab reaches every technology exactly once, and focused words are solid, not outlines.',
        'With reduced motion on, the field is a static readable composition and every word is still promotable.'
      ]
    },

    /* ------------------------------------------------------------- DECK */
    deck: {
      subtitle: 'A physical card stack with real momentum',
      philosophy: [
        'Cards are the most abused pattern in portfolio design, so this concept only earns them by making them physical. They have depth, mass, momentum, resistance at the ends, and a specular highlight that tracks the light source.',
        'The layer tabs deal a new hand. Opening a card expands the card itself rather than opening a panel beside it - the object you touched is the object that answers.',
        'Everything about the feel comes from one continuous position value. Because there is only one, a grab mid-flight simply takes over: the motion is interruptible by construction rather than by special-casing.'
      ],
      hierarchy: [
        '1. The front card - full opacity, accent border, sheen active, expandable.',
        '2. The next two behind - 74% and 48% opacity, receding 128px each in Z, rotated -7.5deg per step in Y.',
        '3. The layer tabs above, with the active tab underlined in the layer hue.',
        '4. The position counter below (03 - 05), mono and quiet.',
        'When expanded, the front card scales 1.06, the stack behind pushes back to 210px per step, and the card\'s hidden content block opens.'
      ],
      structure: [
        'Section `id="skills"`, `min-h-[100dvh]`, `grid-template-rows: auto 1fr auto`.',
        'Row 1: layer tabs, horizontally scrollable on narrow screens.',
        'Row 2: the 3D stage - `perspective: 1500px`, `perspective-origin: 50% 46%`, containing a `transform-style: preserve-3d` plane holding every card absolutely positioned and centred.',
        'Row 3: position counter.',
        'Each card: header (index and layer), artwork (the real SVG from public/tech_icons or a monogram), name, role, an expandable block with the specifics sentence and related chips, footer with years, and a sheen overlay.'
      ],
      interaction: [
        'DRAG: `pos = posAtGrab - (clientX - grabX) / 250`. 250px of travel per card.',
        'FLICK: velocity is sampled per pointermove as `-dxStep / 250 / dt`, clamped to +/-14 cards/second.',
        'RELEASE: friction `v *= 0.0025^dt`, then a spring to the nearest card - `acc = (target - pos) * 118 - v * 19`, integrated per frame. Settled threshold 0.0015 on both position and velocity, at which point the loop stops writing.',
        'RUBBER-BAND: past either end, `pos` is scaled by 0.34, so the deck still moves but pushes back. This is the entire reason the ends feel like ends.',
        'TILT: the plane rotates up to +/-7deg in Y and +/-5deg in X toward the cursor, damped at lambda 7. The front card also receives `--mx` / `--my` for the sheen.',
        'EXPAND: click the front card, but only if the pointer moved less than 6px since pointerdown - a flick must never also open a card.',
        'KEYBOARD: Left/Right step, Enter/Space expand, Escape collapse.'
      ],
      choreography: [
        { n: 'Deal', d: 'Switching layers: cards translate to `(0, 40px, -200px)` and fade out over 260ms, then the new hand is built and animates in on a CSS cascade using `--i`. Two beats, not one - a hand that swaps instantly reads as a filter, not as a deal.' },
        { n: 'Spring', d: 'k=118, damping=19, on a normalised card-index axis. Slightly under-damped so it settles with about one imperceptible overshoot. Do not add bounce; this is a stack of cards, not a toy.' },
        { n: 'Tilt', d: 'Exponential damp lambda 7 on both axes. Applied to the PLANE, not to each card, so the whole stack tilts as one object and the parallax between cards comes free from the perspective.' },
        { n: 'Sheen', d: 'A radial gradient at `28% 34%` sized, positioned by two CSS custom properties on the front card only. Opacity crossfades over 320ms when the front card changes.' },
        { n: 'Expand', d: 'grid-template-rows `0fr -> 1fr` over 380ms `cubic-bezier(0.23, 1, 0.32, 1)` for the hidden block. This is the one sanctioned use of an animated size in the whole design, because there is no transform equivalent for revealing flow content.' }
      ],
      scroll: [
        'The section does not hijack vertical scroll. It only consumes horizontal wheel/trackpad delta (`|deltaX| > |deltaY|`) as position velocity, which is what a trackpad user expects from a horizontal stack.',
        'Set `touch-action: pan-y` on the stage so vertical page scrolling still works from inside the deck on touch.',
        'IntersectionObserver to unsubscribe the physics loop when off-screen.'
      ],
      hover: [
        'Tilt and sheen are hover-driven and must be gated behind `@media (hover: hover) and (pointer: fine)`; on touch they are dead weight.',
        'Tabs: neutral-4 to neutral-2 over 220ms. The active tab is already at full ink with an accent underline.',
        'No lift-on-hover for the cards. They already have depth; adding a hover lift would compete with the drag.',
        'Cursor over the stage is `grab`, becoming `grabbing` while dragging.'
      ],
      click: [
        'Click on the front card toggles expansion. Clicks on back cards are ignored - reaching past the front card is not a gesture people have.',
        'Expanded, the card reveals the specifics sentence and up to five related technologies as small chips.',
        'Escape collapses. Switching layers collapses.',
        'The 6px movement threshold between pointerdown and click is essential. Without it every flick ends in an accidental expand.'
      ],
      responsive: {
        desktop: 'Card `min(21rem, 74vw) x min(27rem, 56vh)`, perspective 1500px, depth 128px per step, full tilt and sheen.',
        tablet: 'Identical; the tab row starts scrolling horizontally.',
        mobile: 'Drag already IS the native gesture, so this concept needs the least adaptation - which is a point in its favour. Reduce perspective depth, drop tilt and sheen entirely (no pointer), keep momentum and rubber-banding, and make the card `74vw` wide. `touch-action: pan-y` so vertical scroll still escapes. Tabs scroll horizontally with the active one scrolled into view on change.'
      },
      a11y: [
        'Every card is a real element with `tabindex="0"` when it is the front card and `-1` otherwise, plus `aria-hidden` on non-front cards so a screen reader reads one card at a time.',
        'Left/Right arrows step the deck; Enter/Space expands. Drag is never the only way to reach a card - this is the WCAG 2.2 "dragging movements" criterion and it is not optional.',
        'Tabs are a real `role="tablist"` with `aria-selected`.',
        'The position counter is the accessible "3 of 5" and should be in an `aria-live="polite"` region.',
        'Under `prefers-reduced-motion: reduce`: no momentum, no rubber-band, no tilt, no sheen. Arrow keys and drag both jump straight to the target card. The deal becomes an instant swap.'
      ],
      perf: [
        'Only cards within `|d| < 4.2` are rendered; the rest get `visibility: hidden` and are skipped entirely.',
        'Skip the style write if a card\'s offset changed by less than 0.0015 - during a settle this cuts most of the writes.',
        'When the deck is settled and not dragging, the physics loop returns immediately. A deck at rest must cost nothing.',
        'One transform on the plane plus up to nine on cards, per frame.',
        'Never put a CSS transition on the card transform. The physics loop owns it, and a transition would fight every frame. Transition only `opacity`.',
        'Card art is a real SVG `<img>` with `loading="lazy"` and an `onerror` removal so a missing icon degrades to the monogram instead of a broken image.'
      ],
      packages: [
        { p: 'none required', w: 'The physics is about fifteen lines. GSAP\'s InertiaPlugin is a paid Club plugin and is not needed.' },
        { p: 'no framer-motion drag', w: 'Its `drag` gives you the gesture but not the card-index snapping, the rubber band, or the shared position value that makes an interrupt work. Hand-rolled is smaller and better here.' }
      ],
      architecture: [
        { f: 'components/sections/Skills.tsx', r: 'Server shell: tabs and the full card markup for the first layer, so content is server-rendered.' },
        { f: 'components/skills/CardDeck.tsx', r: '"use client": the physics loop, pointer handling, and layout writes.' },
        { f: 'components/skills/SkillCard.tsx', r: 'Presentational, `forwardRef` so the deck can write transforms to it.' },
        { f: 'lib/skills/useDeckPhysics.ts', r: 'The spring, friction, rubber band and settle detection, isolated and testable.' },
        { f: 'lib/skills/iconFor.ts', r: 'Name to `/tech_icons/*.svg` map with a monogram fallback.' }
      ],
      state: [
        '`catIndex` and `expanded` in `useState` - both change on user intent, not per frame.',
        '`pos`, `posVel`, `target`, drag origin, tilt and per-card offsets are ALL refs. This is the concept where getting that wrong is most obviously fatal: a position value in state means a re-render per frame during a drag.',
        'Cards are rebuilt on `catIndex` change; keep the key stable per skill id.',
        'Do not lift deck position into a URL or a store. It is transient view state.'
      ],
      typography: [
        'Card name: display 500 at `clamp(1.375rem, 3vh, 1.875rem)`, `-0.035em`.',
        'Role: mono 10px, `0.14em`, uppercase, in the category hue - the one coloured text on the card.',
        'Header and footer: mono 9px, `0.18em`, neutral-4. Deliberately small; a card should have one loud element.',
        'Monogram fallback: display 700, outlined with `-webkit-text-stroke` in the category hue, so a missing logo becomes a design decision instead of a gap.',
        'Years use tabular figures.'
      ],
      color: [
        'One hue per layer, applied to: the card\'s corner gradient (12% mix), the front card border (40% mix), the role line, the monogram stroke, the active tab underline, and a 12% floor glow behind the stage.',
        'The card body is a two-stop near-black gradient (#14141a to #0c0c10). Cards must be darker than the ground behind their glow, or the stack loses its edges.',
        'Inner top highlight `inset 0 1px 0 rgba(255,255,255,0.07)` on every card. This one line does more for the "physical" reading than the shadow does.',
        'In light mode: cards become near-white with a `rgba(0,0,0,0.06)` border, the shadow tints toward the layer hue rather than pure black, and the sheen drops to about 6%.'
      ],
      spacing: [
        'Card padding 1.25rem, radius 2px to match the page shape system. Do not round these to 16px - sharp cards read as instruments, rounded cards read as an app.',
        'Lateral card offset 30px per step at rest, 46px expanded. Enough that you can see there is a stack; not so much that it becomes a carousel.',
        'Depth 128px per step at rest, 210px expanded.',
        'Tab row padding `clamp(0.75rem, 2vh, 1.25rem) clamp(1rem, 4vw, 2.5rem) 0`.'
      ],
      relationships: [
        'Layer membership is communicated by the tab you are in - the deck only ever holds one layer, so no per-card category badge is needed.',
        'Card order within a layer is the data order; keep the strongest technology first so the resting state is the best card.',
        'Related technologies appear only in the expanded state, as chips, and only up to five.',
        'Depth in the stack communicates nothing semantic. Do not map it to proficiency - people read stack position as sequence, not as rank.'
      ],
      acceptance: [
        'A flick travels several cards and settles on one, and grabbing mid-flight takes over smoothly.',
        'Pushing past the last card resists and springs back.',
        'A flick never accidentally opens a card.',
        'The stack tilts as one object toward the cursor, with the sheen tracking across the front card.',
        'Arrow keys reach every card without touching the mouse.',
        'With reduced motion on, everything still works and nothing has inertia.'
      ]
    },

    /* ----------------------------------------------------------- STRATA */
    strata: {
      subtitle: 'The stack drawn as a stack, with a request tracing through it',
      philosophy: [
        'The other five concepts present a set of technologies. This one presents an understanding of how they compose, which is the thing a senior engineer is actually hired for and the thing a grid of logos can never say.',
        'Six slabs in isometric space, in the order a request crosses them. Send a request and watch it descend the spine, fire each layer, and come back with a latency readout.',
        'The visual is a systems diagram that happens to be beautiful, not a beautiful thing with system labels on it. If a viewer walks away understanding the architecture, the section worked.'
      ],
      hierarchy: [
        '1. The travelling packet - the only pure white object in the scene, with a bloom.',
        '2. The firing slab - border and glow at full accent for 380ms as the packet crosses.',
        '3. The active slab and its side panel, which lists that layer\'s technologies with roles.',
        '4. Resting slabs at 34% accent border, 13% fill.',
        '5. The counter-rotated layer tags, quiet mono at 10px.',
        'The side panel is the readable half. The isometric stack is the picture; the panel is the text, and the two are never asked to do each other\'s job.'
      ],
      structure: [
        'Section `id="skills"`, `min-h-[100dvh]`, two columns: the isometric scene and a `minmax(17rem, 24rem)` side panel.',
        'Scene: `perspective: 1600px` holding a `transform-style: preserve-3d` stack rotated `rotateX(58deg) rotateZ(-40deg)`.',
        'Each layer: a slab (the plane), a chip field inside it (one small rectangle per technology, sized by weight), and a counter-rotated tag.',
        'A spine rod along the Z axis, and the packet as a child of the stack so it inherits the isometric transform for free.',
        'HUD bottom-left: the "Send a request" control plus the hop and latency readout.'
      ],
      interaction: [
        'HOVER a slab: it lifts 26px along Z out of the stack over 520ms `cubic-bezier(0.23, 1, 0.32, 1)`, and its chip field goes to full opacity.',
        'CLICK a slab: it becomes active and the side panel swaps to that layer, with its technology rows staggering in at 42ms intervals.',
        'SEND: the packet descends layer by layer. Per hop duration `0.34 + hopCost/190` seconds, with an ease-in-out within each hop so the packet accelerates out of a layer and decelerates into the next - that is what makes it read as travel between two places rather than a dot on a rail.',
        'At the bottom the direction reverses and the return trip runs at 35% of the outbound cost, because responses are cheaper than requests and the asymmetry is the realistic detail that sells it.',
        'IDLE: a trace fires automatically every 7.5 seconds so a passive viewer sees the mechanism without having to discover the button.',
        'ArrowUp / ArrowDown move the active layer.'
      ],
      choreography: [
        { n: 'Isometric', d: '`rotateX(58deg) rotateZ(-40deg)` on the stack; each layer at `translateZ(-index * 58px)`. Tags counter-rotate with `rotateZ(40deg) rotateX(-58deg)` applied after their translate, which cancels the parent rotation exactly and leaves the label facing the viewer while the slab stays in plane.' },
        { n: 'Packet', d: 'A single custom property `--pp` (0..1) drives `translateZ(calc(var(--pp) * var(--span) * -1))`. One property, one transform, and the mobile layout reuses the same value as a `top` percentage. Same model, two drawings.' },
        { n: 'Fire', d: 'On arrival a slab gets a class for 380ms: border to full accent, background mix to 48%, and a 44px accent glow. The transition IN is 90ms linear (a hit should be instant) and OUT is 380ms ease-out. Asymmetric on purpose.' },
        { n: 'Lift', d: '520ms `cubic-bezier(0.23, 1, 0.32, 1)` on translateZ only.' },
        { n: 'Panel', d: 'Rows animate in with a keyframe at `index * 42ms`. Uses `animation` rather than `transition` because the rows are replaced wholesale on layer change, so there is no from-value to transition from.' }
      ],
      scroll: [
        'No scroll hijacking. The section is stationary.',
        'On enter, run the first trace automatically once; that is the moment that teaches the interaction.',
        'IntersectionObserver: stop the idle trace timer when off-screen. An auto-firing animation nobody is looking at is pure battery cost.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'Use one delegated `pointerover` on the stack and compare `closest("[data-layer]")`; six listeners would be six too many.',
        'Hovering does not change the active layer - lift is a preview, click is a commitment. Conflating them makes the side panel flicker as the pointer crosses the stack.',
        'The cursor reticle carries the layer name.'
      ],
      click: [
        'Clicking a slab or its tag sets the active layer and repopulates the side panel: kicker, label, blurb, and every technology as a row with name, role and years.',
        'The tag is a real `<button>` with an `aria-label`, so the layer is reachable by keyboard without hit-testing a rotated plane.',
        '"Send a request" restarts the trace from the top at any point.',
        'No modal, no navigation. The panel is always present and always full.'
      ],
      responsive: {
        desktop: 'Full isometric, stack `min(46vh, 34vw, 30rem)`, 58px between layers, side panel on the right.',
        tablet: 'Same isometric with the stack scaled down; the side panel narrows to its 17rem minimum.',
        mobile: 'Below 900px the isometric is ABANDONED, not scaled: an iso stack in a 390px column is unreadable. The same model renders as a vertical trace - layers become horizontal bars on a rail, the spine becomes a vertical line at the left edge, and the packet descends it using the same `--pp` value as a `top` percentage. Tags un-rotate to plain labels. The side panel moves below at `max-height: 44vh`. Identical data, identical narration, different drawing.'
      },
      a11y: [
        'Layer tags are real buttons in DOM order; the stack is fully keyboard navigable without any hit-testing.',
        'The trace readout is `role="status" aria-live="polite"` so each hop is announced as text: "Application", "19 ms".',
        'The latency figures are a MODEL, not a measurement. Label them as such in the markup (a `title` or a small caption), because inventing precise-looking numbers a viewer might believe is a real integrity problem.',
        'The side panel is the accessible version of the diagram and must contain everything the diagram shows.',
        'Under `prefers-reduced-motion: reduce`: no automatic idle trace, no travel. "Send a request" becomes a step-through - each press advances one hop, flashes that layer, and updates the readout. The explanation survives; the motion does not.',
        'Isometric text is a contrast risk. Counter-rotate every label so it is rendered flat; never rely on the viewer reading a skewed glyph.'
      ],
      perf: [
        'Per frame: exactly one custom property write on the packet. Everything else is CSS transitions triggered by class changes.',
        'This is by far the cheapest of the six concepts, which is worth knowing when choosing.',
        '`transform-style: preserve-3d` creates a stacking context per layer; keep the tree shallow (stack > layer > slab/tag) so the compositor is not building dozens of 3D layers.',
        'Do not animate `box-shadow` continuously. It is fine on a 380ms class flip and expensive in a loop.',
        'Stop the idle timer off-screen and under reduced motion.'
      ],
      packages: [
        { p: 'none required', w: 'Pure CSS 3D and one custom property. No library involved anywhere in this concept.' },
        { p: 'no three.js', w: 'Six planes and a dot. WebGL would be a rounding error more capable and 600kb more expensive.' },
        { p: 'gsap (optional)', w: 'Only if you want the entry to choreograph the slabs in one at a time. The interaction itself needs nothing.' }
      ],
      architecture: [
        { f: 'components/sections/Skills.tsx', r: 'Server shell: the whole stack, all tags, and the side panel for the default layer render on the server.' },
        { f: 'components/skills/StrataStack.tsx', r: '"use client": hover delegation, active layer, and the trace state machine.' },
        { f: 'components/skills/LayerPanel.tsx', r: 'Presentational side panel.' },
        { f: 'lib/skills/useRequestTrace.ts', r: 'The state machine: hop index, direction, per-hop easing, accumulated latency, idle timer. Returns `{ progress, hop, ms, running, start() }`.' }
      ],
      state: [
        '`activeLayer` in `useState`.',
        'The trace (hop, direction, elapsed, accumulated ms) lives in a ref and writes the packet position directly. Only the readout text needs to reach React, and it changes about twelve times per trace, not sixty times a second.',
        'Slab firing is a class toggle with a `setTimeout` cleanup, not state.',
        'Clear every timeout on unmount.'
      ],
      typography: [
        'Layer tags: mono 500 at 10px, `0.16em`, uppercase. They are labels on a diagram and should look like it.',
        'Side panel layer name: display 500 at `clamp(1.75rem, 3vw, 2.5rem)`, `-0.04em`.',
        'Technology rows: name at display 500 0.9375rem; role beneath at mono 9px uppercase; years at the right in the layer hue with tabular figures.',
        'HUD readout: mono 10px uppercase, with the millisecond figure in the layer hue.',
        'Everything technical is mono, everything editorial is the display face. That split is the concept\'s whole type system.'
      ],
      color: [
        'One hue per layer, at 34% on the resting border, 13% in the fill, 26% when active, 48% when firing.',
        'The packet is pure white with a white bloom - the only pure white in the design, which is what makes it read as energy rather than as an object.',
        'The ground carries a single 9% radial wash in the active layer\'s hue, cross-faded over 600ms as the active layer changes.',
        'In light mode: slabs become white with the hue in the border and a soft hue-tinted shadow; the packet becomes the near-black ink colour, since a white packet on white is invisible.'
      ],
      spacing: [
        '58px between layers in Z. Close enough to read as one stack, far enough that the packet visibly travels.',
        'Chip field inset 14% of the slab with a 7% gap; chip width `11% + weight*9%` so density communicates the size of each layer.',
        'The stack is offset `translateZ(-span/2)` so the whole assembly is optically centred rather than hanging from its top layer.',
        'Side panel padding `clamp(1.25rem, 4vh, 2.5rem) clamp(1.25rem, 2.5vw, 2rem)`, rows at 0.5625rem vertical.'
      ],
      relationships: [
        'Vertical position IS the relationship: layer order is request order. This is the only concept where the layout itself encodes the architecture.',
        'The packet makes the ordering causal rather than merely sequential - you see that Data is reached through Application, not beside it.',
        'Chip density per slab communicates how much lives in each layer without listing anything.',
        'The side panel role column ("Runtime", "Cache and queue", "ORM") is where individual technologies get their relationship to their own layer. Do not skip it; it is the difference between a diagram and a list.'
      ],
      acceptance: [
        'A first-time viewer understands, without being told, that a request goes down through the layers and comes back.',
        'Hovering lifts a slab cleanly out of the stack with no z-fighting.',
        'Every layer tag is readable - flat, not skewed.',
        'On a phone the section is a vertical trace, not a squashed isometric.',
        'The latency numbers are labelled as a model, never presented as measurements.',
        'With reduced motion on, "Send a request" steps hop by hop and still explains the system.'
      ]
    }
  };

  /* ======================================================================
     COMPOSER
     ====================================================================== */
  function bullets(arr) { return arr.map(function (s) { return '- ' + s; }).join('\n'); }
  function numbered(arr) { return arr.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n'); }

  SE.buildPrompt = function (conceptId) {
    var c = (SE.get && SE.get(conceptId)) || (SE.concepts && SE.concepts[conceptId]);
    if (!c) return '';
    /* A concept may carry its own spec (area authors do) or use one of the
       built-in Skills specs keyed by id. */
    var s = c.spec || SPECS[conceptId];
    if (!s) return '';

    var L = [];

    L.push('# Build the "' + c.name.toUpperCase() + '" Skills section');
    L.push('');
    L.push('**Recreate this selected design as a production-ready Next.js / React component.**');
    L.push('');
    L.push('This is not a "something like this" brief. A concept explorer was built, six directions were ' +
           'compared side by side, and this one was chosen. Everything below describes that specific ' +
           'chosen design. Preserve its identity. Do not average it toward a generic portfolio skills ' +
           'section, do not substitute cards for its interaction model, and do not drop the parts that ' +
           'make it distinct because they are harder.');
    L.push('');
    L.push('---');
    L.push('');

    L.push('## 1. Design concept');
    L.push('');
    L.push('**Name:** ' + c.name + ' (Concept ' + SE.pad(c.num) + ' of 6)');
    L.push('**One line:** ' + s.subtitle);
    L.push('**Technical character:** ' + c.kind);
    L.push('**Signature hue:** `' + c.accent + '`');
    L.push('');

    L.push('## 2. Design philosophy');
    L.push('');
    L.push(bullets(s.philosophy));
    L.push('');

    L.push('## 3. Visual hierarchy');
    L.push('');
    L.push(bullets(s.hierarchy));
    L.push('');

    L.push('## 4. Section structure');
    L.push('');
    L.push(bullets(s.structure));
    L.push('');

    L.push('## 5. Exact interaction model');
    L.push('');
    L.push(bullets(s.interaction));
    L.push('');

    L.push('## 6. Skill data structure');
    L.push('');
    L.push(DATA_CONTRACT.join('\n'));
    L.push('');

    L.push('## 7. Animation choreography');
    L.push('');
    L.push('Every number below is deliberate. Use these values; do not round them to "nice" ones.');
    L.push('');
    s.choreography.forEach(function (step) {
      L.push('**' + step.n + '**  ');
      L.push(step.d);
      L.push('');
    });

    L.push('## 8. Scroll behaviour');
    L.push('');
    L.push(bullets(s.scroll));
    L.push('');

    L.push('## 9. Hover behaviour');
    L.push('');
    L.push(bullets(s.hover));
    L.push('');

    L.push('## 10. Click and select behaviour');
    L.push('');
    L.push(bullets(s.click));
    L.push('');

    L.push('## 11. Responsive behaviour');
    L.push('');
    L.push('**Desktop (>= 1100px):** ' + s.responsive.desktop);
    L.push('');
    L.push('**Tablet (768px - 1099px):** ' + s.responsive.tablet);
    L.push('');
    L.push('**Mobile (< 768px):** ' + s.responsive.mobile);
    L.push('');
    L.push('Adapt the composition, never just the scale. A shrunk desktop layout is the single clearest ' +
           'sign that the mobile case was an afterthought.');
    L.push('');

    L.push('## 12. Accessibility requirements');
    L.push('');
    L.push(bullets(s.a11y));
    L.push('');

    L.push('## 13. Performance requirements');
    L.push('');
    L.push(bullets(s.perf));
    L.push('');
    L.push('Global budget: 60fps sustained on a mid-tier laptop, no long tasks over 50ms while ' +
           'interacting, CLS under 0.1, and no continuous animation while the section is off-screen ' +
           'or while `prefers-reduced-motion` is set.');
    L.push('');

    L.push('## 14. Required packages');
    L.push('');
    s.packages.forEach(function (p) { L.push('- **' + p.p + '** - ' + p.w); });
    L.push('');
    L.push('Already installed in this repository, so do not re-install: ' + REPO.installed.join('; ') + '.');
    L.push('');
    L.push('Do not add a dependency that is not listed above. If you believe one is needed, say why ' +
           'first and wait.');
    L.push('');

    L.push('## 15. Component architecture');
    L.push('');
    s.architecture.forEach(function (a) { L.push('- `' + a.f + '` - ' + a.r); });
    L.push('');
    L.push('Keep Server Components as the default. Every piece of motion, pointer handling or ' +
           'measurement goes in an isolated `"use client"` leaf so the section\'s content still ' +
           'server-renders and stays crawlable.');
    L.push('');

    L.push('## 16. State management expectations');
    L.push('');
    L.push(bullets(s.state));
    L.push('');
    L.push('The rule underneath all of these: **anything that changes every frame belongs in a ref, ' +
           'not in state.** A continuous value in `useState` re-renders the tree at 60fps and will ' +
           'collapse on a mid-range phone.');
    L.push('');

    L.push('## 17. Typography direction');
    L.push('');
    L.push(bullets(s.typography));
    L.push('');

    L.push('## 18. Colour direction');
    L.push('');
    L.push(bullets(s.color));
    L.push('');
    L.push('Both themes are mandatory. This repository uses a class-based `.dark` on `<html>`; the ' +
           'section must be designed in both, not built in dark and inverted at the end.');
    L.push('');

    L.push('## 19. Spacing and layout guidance');
    L.push('');
    L.push(bullets(s.spacing));
    L.push('');

    L.push('## 20. How the visual relationships work');
    L.push('');
    L.push(bullets(s.relationships));
    L.push('');
    L.push('One signal per relationship. If category is already communicated by position, do not also ' +
           'colour-code the label and add a badge - redundant encoding is what makes a design look ' +
           'anxious.');
    L.push('');

    L.push('---');
    L.push('');
    L.push('## Repository context');
    L.push('');
    L.push('- Next.js ' + REPO.next + ', React ' + REPO.react + ', TypeScript ' + REPO.ts + ', Tailwind ' + REPO.tailwind + '.');
    L.push('');
    L.push(bullets(REPO.conventions));
    L.push('');
    L.push('Before writing code, read the relevant guide under `node_modules/next/dist/docs/` - this ' +
           'Next.js major has breaking changes from older conventions, and `AGENTS.md` in this repo ' +
           'requires it.');
    L.push('');

    L.push('## Definition of done');
    L.push('');
    L.push(numbered(s.acceptance));
    L.push('');
    L.push('Then verify: run the dev server, exercise the section at 1440px, 768px and 390px, toggle ' +
           'both themes, turn on `prefers-reduced-motion`, and tab through the whole section with the ' +
           'mouse untouched. Report what you actually observed, not what you expect.');
    L.push('');

    L.push('---');
    L.push('');
    L.push('_Generated by the Skills Design Explorer. Concept ' + SE.pad(c.num) + ' of 6: ' + c.name + '._');

    return L.join('\n');
  };

  SE.promptSpecs = SPECS;

})(window.SE = window.SE || {});

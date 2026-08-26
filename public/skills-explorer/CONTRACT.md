# Area author contract

You are authoring one **area** of the Portfolio Design Explorer. Several areas are
built in parallel, so the file boundary below is not a style preference — crossing it
corrupts someone else's work.

## Files you own

Exactly two, both of which you create:

```
public/skills-explorer/js/gallery/<area>.js        # all 10 concepts for your area
public/skills-explorer/styles/gallery-<area>.css   # all styles for your area
```

## Files you must NOT touch

`index.html`, `js/core.js`, `js/registry.js`, `js/shell.js`, `js/main.js`,
`js/previews.js`, `js/prompts.js`, `js/data.js`, `styles/base.css`,
`styles/shell.css`, `styles/concepts.css`, `styles/sections.css`, anything under
`js/concepts/`, `js/sections/`, or another area's `js/gallery/`.

The shell wires your file in and renders your gallery. Do not add script or link tags.

## What you deliver

**10 concepts**: 5 with `variant: 'page'` and 5 with `variant: 'section'`, numbered
`num: 1..5` within each variant.

- **page** — a full-viewport takeover. It owns the whole stage and may hide chrome.
- **section** — lives inside a scrolling page next to other sections. It must consume
  scroll rather than fight it, must not trap the reader, and must call
  `ctx.onSeeMore()` from a visible control so the reader can open the page-level view.

Each `section` concept should pair with a `page` concept of the same family where that
makes sense: the section is the teaser, the page is the full argument.

## Registration API

```js
SE.register({
  area: 'hero',              // your area id, exactly
  variant: 'section',        // 'page' | 'section'
  id: 'hero-section-aurora', // globally unique; prefix with area + variant
  num: 1,                    // 1..5 within area+variant
  name: 'Aurora',            // one or two words, no colon, no explainer
  kind: 'Canvas / drift',    // short technical character, shown on the card
  accent: '#4CC9F0',         // signature hue, scoped to this concept only
  tagline: 'One line of point of view',
  desc: 'Two sentences. What it is and why it earns its place.',
  interaction: 'One sentence naming the actual input model.',
  hint: 'Scroll to descend',        // shown in stage chrome, may contain &middot;
  screens: 2.6,                     // section only: rail length in viewports

  preview: function (ctx, w, h, t, heat) { /* canvas miniature, see below */ },
  spec: { /* prompt spec, see below */ },

  mount: function (root, ctx) {
    // root: an empty element you fill
    // ctx.mode      -> 'page' | 'section'
    // ctx.scroller  -> the scrolling element (section mode) or null
    // ctx.onSeeMore -> call to open this concept's page-level counterpart
    return { destroy: function () { /* remove EVERY listener, ticker, observer */ } };
  }
});
```

## Helpers available to you

Defined in `core.js`; use them instead of re-implementing:

| Helper | What it does |
|---|---|
| `SE.env` | `.reduced .fine .touch .mobile .tablet .dpr` |
| `SE.ticker.add(fn)` / `.remove(fn)` | **The page's only rAF loop.** `fn(dt, t)` in seconds. Never call `requestAnimationFrame` yourself. |
| `SE.math` | `clamp lerp map damp round`. `damp(cur, target, lambda, dt)` is frame-rate independent — use it, never a fixed per-frame lerp. |
| `SE.rng(seed)` | Seeded PRNG. Layouts must be identical on every reload. |
| `SE.canvas(el)` | DPR-correct canvas wrapper: `.ctx .w .h .clear() .observe(cb) .destroy()`. Draw in CSS pixels. |
| `SE.pointer` | `.x .y .nx .ny .dnx .dny .down` — `dnx/dny` are pre-damped for parallax. |
| `SE.scrollRail(scroller, screens)` | Over-tall rail + sticky one-screen viewport. Returns `{rail, sticky, destroy}`. |
| `SE.scrub(scroller, trigger, cb)` | 0..1 progress via ScrollTrigger, with a passive-listener fallback. Returns `{kill}`. |
| `SE.seeMore(label, fn)` | The standard section affordance. |
| `SE.srList(label, items, onSelect)` | Visually-hidden focusable mirror of a canvas. **Mandatory for any canvas concept.** |
| `SE.makeDetail()` | Shared detail panel. |
| `SE.hintStrip(html)` | Bottom-centre hint bar. |
| `SE.el / SE.$ / SE.$$ / SE.pad / SE.rgba / SE.hexToRgb` | DOM and colour utilities. |
| `SE.DATA` | Skill data. Use it for Skills; for other areas invent plausible content **inside your own file**. |
| `SE.stageAccent(hex)` | Retint stage chrome when your concept's active hue changes. |

`window.gsap`, `window.ScrollTrigger` and `window.Lenis` may be present. Guard every
use (`if (window.gsap)`) and degrade to a working, unanimated state if absent.

## Non-negotiables

1. **One rAF for the page.** Subscribe to `SE.ticker`. A concept that starts its own
   loop, or that keeps running after `destroy()`, is a defect.
2. **`destroy()` must fully clean up.** Every `window`/`document` listener, every
   ticker subscription, every observer, every timeout, every ScrollTrigger.
3. **Transform and opacity** for anything that runs per frame. `clip-path`, `mask`,
   `filter` and `box-shadow` are allowed on discrete state changes, not in a loop.
   Never animate `width/height/top/left/margin` per frame.
4. **`prefers-reduced-motion`** ships with the concept. Reduced means fewer and
   gentler, not broken: no idle loops, no parallax, no auto-play; the content stays
   fully reachable and the composition stays deliberately arranged.
5. **Hover gated** behind `@media (hover: hover) and (pointer: fine)`.
6. **Keyboard reachable.** Canvas concepts need `SE.srList`. Drag-only interactions
   need a keyboard equivalent (WCAG 2.2 dragging-movements).
7. **Mobile is a different composition, not a smaller one.** Below 768px, re-lay-out.
   Reduce particle counts and DPR. State the mobile plan in your spec.
8. **Scope your CSS.** Every selector must start from your own concept's root class,
   prefixed with the area (`.hero-aurora__…`). Never style a bare element or a shell
   class. Never use `!important` outside a reduced-motion override.
9. **Curves come from the set**, not from taste:
   `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`,
   `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`,
   `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. GSAP: `expo.out` / `expo.inOut`.
   UI feedback stays under 300ms; full-frame cinematic moments may run longer.
10. **No `window.addEventListener('scroll')`.** Use `SE.scrub`, ScrollTrigger, or
    IntersectionObserver.

## Design floor

- Dark ground, near-black, never `#000`. Use the shell tokens: `--void --surface --ink
  --ink-2 --ink-3 --line --line-2`. Your signature hue goes in `--c-accent`, scoped to
  your own root.
- One corner radius for the whole app: **2px**. Circles only for things that are dots.
- Type: `--font-display` (Space Grotesk) for editorial voice, `--font-mono`
  (JetBrains Mono) for indices, counts, years, measurements. Mono is for data, never
  for prose.
- **No eyebrows / kickers** above headings. The heading carries itself.
- No gradient text, no neon outer glow as decoration, no glassmorphism-by-default, no
  three identical cards as the structure of anything, no percentage bars, no emoji as
  icons, no `—` em-dash anywhere in visible copy.
- Fabricated numbers must be plausible and, where they imply measurement, labelled as
  a model.

## Prompt spec

Ship a `spec` object per concept. The composer renders it into the "Copy Next.js
prompt" output, so it must be concrete — exact curves, durations, thresholds — not
adjectives. Shape:

```js
spec: {
  subtitle: 'One line',
  philosophy:   ['...'],            // 2-4 bullets, the point of view
  hierarchy:    ['...'],            // ranked, what outranks what
  structure:    ['...'],            // DOM/layer structure
  interaction:  ['...'],            // the exact input model, with numbers
  choreography: [{ n: 'Name', d: 'Exact values: property, curve, duration, why' }],
  scroll:       ['...'],
  hover:        ['...'],
  click:        ['...'],
  responsive:   { desktop: '...', tablet: '...', mobile: '...' },
  a11y:         ['...'],
  perf:         ['...'],
  packages:     [{ p: 'gsap (installed)', w: 'why, or why NOT to add one' }],
  architecture: [{ f: 'components/…/X.tsx', r: 'role' }],
  state:        ['...'],            // what is state vs what must be a ref
  typography:   ['...'],
  color:        ['...'],
  spacing:      ['...'],
  relationships:['...'],            // what each visual signal encodes
  acceptance:   ['...']             // observable definition of done
}
```

Target repository for the generated prompts: Next.js 16.2.3 App Router, React 19.2.4,
TypeScript, Tailwind v4 (CSS-first `@theme inline` in `app/globals.css`), gsap 3.15 +
`@gsap/react`, lenis 1.3, framer-motion 12, three 0.181 available. Class-based `.dark`
theme. Section concepts must tell Claude to also build the "See more" route.

## Verify before you finish

Run `node --check` on your JS file. Then open
`http://localhost:8322/skills-explorer/index.html`, open every one of your 10
concepts, and confirm: it renders, it animates, `destroy()` leaves no loop running
(`SE.ticker.count()` returns to its baseline after closing), and the console is clean.
Report what you actually observed.

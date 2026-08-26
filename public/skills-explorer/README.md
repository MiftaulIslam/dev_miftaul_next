# Portfolio Design Explorer

A playground for choosing how your portfolio behaves. Every concept is live and
interactive, not a screenshot, and every one generates a detailed Next.js build
prompt for the concept you pick.

## Open it

The dev server already serves it, because it lives in `public/`:

```bash
npm run dev
```

Then go to `/skills-explorer/index.html`.

It also works by opening `index.html` straight off disk. Everything is classic
`<script>` tags with no build step and no ES modules, specifically so `file://`
works. GSAP, ScrollTrigger and Lenis come from a CDN; if they fail to load the
explorer still runs, with choreography degrading to instant state changes.

## The two outputs

**1. This explorer** decides the direction. It is throwaway. It is vanilla
HTML, CSS and JS and is not meant to ship.

**2. The prompt** builds the real thing. Every concept has a
**Copy Next.js prompt** button. It writes roughly 2,500 words to your clipboard
covering design philosophy, visual hierarchy, the exact interaction model,
animation choreography with real numbers, scroll and hover and click behaviour,
responsive plans per breakpoint, accessibility and performance budgets,
component architecture, state expectations, and typography, colour and spacing
direction.

Paste it into Claude **inside this repository**. The prompts already know the
stack (Next.js 16.2.3 App Router, React 19.2.4, Tailwind v4, gsap + `@gsap/react`,
lenis), the class-based `.dark` theme, the `/api/public/skills` data source, and
the `public/tech_icons/` logos.

Section concepts tell Claude to build **two** surfaces: the in-page section and
the route its "See more" opens.

## Two kinds of concept

**Full page** takes over the viewport. It is the deep view.

**In-page section** is shown inside a real scrolling page, with a deliberately
quiet neighbour above and below. That framing is the point: a section is judged
by how it *sits* between other content, whether it hands off cleanly, and
whether scroll momentum survives passing through it. A section evaluated on a
blank stage is a page concept wearing a different label.

Each section states its scroll cost. SIGNAL spends 2.8 viewport heights,
PLATES spends 6. That is a real budget you are spending on the rest of the page.

## Replacing the placeholder content

`js/data.js` is the only file you edit for the Skills area. Nothing in the
visual layer is hardcoded to these names or counts: add a seventh category or
drop a technology and all eleven Skills concepts re-lay-out.

Two things worth knowing:

**`weight` is never drawn as a percentage.** It drives visual weight only:
node radius in ORBIT and LATTICE, type scale in KINETIC, peak height in SIGNAL.
Proficiency expressed through composition reads as confidence; the same fact as
"React 92%" reads as a survey.

**`relations` is the one piece of domain knowledge only you have.** The defaults
describe how a modern full-stack app is usually wired. Replacing them with how
*your* systems are actually wired is what turns LATTICE from a pretty graph
into an argument about your engineering. Unknown ids are skipped silently, so
prune freely.

The other areas invent their own placeholder content inside their own
`js/gallery/<area>.js` file.

## Keyboard and reduced motion

Every canvas concept mirrors itself into a visually hidden, focusable list, so
the whole explorer is keyboard and screen-reader navigable rather than an
inaccessible pixel surface. Tab into a concept and focus drives the same
selection the pointer does.

`prefers-reduced-motion` ships with every concept and means *fewer and gentler*,
not broken: idle loops stop, parallax and auto-play stop, and the composition
stays deliberately arranged with all content reachable. DEPTH is the one to
check if you are motion sensitive, since a forward dolly is exactly the kind of
vection that triggers it; under reduced motion it stops flying entirely.

## Adding an area

Two files and one row in `SE.AREAS` (`js/registry.js`). See
[CONTRACT.md](CONTRACT.md) for the registration API, the shared helpers, and the
rules that keep concepts from colliding.

## Structure

```
index.html            the shell
js/core.js            env flags, the page's ONE rAF ticker, canvas + math helpers
js/registry.js        SE.register() - the only seam between shell and concepts
js/data.js            skill content            <- edit this
js/shell.js           hero, galleries, stage routing, page frame, clipboard
js/prompts.js         the prompt composer + Skills page specs
js/concepts/          Skills, full page   (orbit reel lattice kinetic deck strata)
js/sections/          Skills, in-page     (signal columns mask plates depth)
js/gallery/<area>.js  every other area
styles/               base, shell, concepts, sections, one per area
```

There is exactly one `requestAnimationFrame` loop in the whole application.
Every concept, every card preview and Lenis subscribe to it. Concepts unsubscribe
when they are destroyed and card previews unsubscribe when they scroll out of
view, dropping their canvas bitmaps to 1x1 so seventy previews do not hold
ninety megabytes of pixels nobody is looking at.

import type { ReelProject } from "@/types/projects";

/**
 * The reel's shipped copy — the floor under the database, and nothing more.
 *
 * `v2_projects` is the source of truth: the section, `/work` and
 * `/work/[slug]` all read it, and it is edited in the dashboard under
 * Projects (v2). This array is what the reel falls back to when that table is
 * unreachable or has never been seeded, because the reel is a pinned,
 * scroll-driven section — with zero projects it does not shrink, it leaves a
 * hole the page scrolls straight over.
 *
 * Editing this file changes only that fallback. To change what the site shows,
 * edit the dashboard. To reload a fresh database with this exact content, run
 * `npm run db:seed:projects` — `scripts/db/data/projects-v2.mjs` was generated
 * from this array, so the two agree.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * UNVERIFIED FIELD: `year`
 * The values below are inferred from the "3+ years" claim in `lib/data.ts` plus
 * the apparent stack progression (plain HTML/CSS first, AI-assisted platform
 * last). They are seeded as-is; correct them in the dashboard.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every `outcome` and `problem` is rewritten from the bullet copy in
 * `components/project-data.ts`. Where that copy carried a number (40% latency,
 * 35% page load) the number is kept verbatim; where it did not, none was added.
 */
const REEL_PROJECTS: ReelProject[] = [
  {
    id: "crebrains",
    name: "CreBrains",
    year: "2025",
    discipline: "Platform",
    role: "Full-stack",
    problem:
      "A commercial property deal ran across email, spreadsheets and four parties who never quite saw the same version of a document.",
    outcome:
      "Buyers, sellers, brokers and legal now work a single deal in one place, with tasks assigned automatically by closing phase and every rent roll diffed against its last version.",
    tech: ["React", "TypeScript", "Node.js", "AI/ML"],
    accent: "#3b82f6",
    plate: {
      src: "/crebrains_dashboard.png",
      caption: "Product capture — deal dashboard",
      focus: "50% 22%",
    },
    links: { live: "https://crebrains.com" },
    case: [
      {
        heading: "The deal, not the documents",
        body: [
          "Commercial real estate closings are a document problem wearing a workflow costume. The same lease gets emailed six times, annotated in three places, and nobody can say which copy the lawyer actually read.",
          "CreBrains models the deal itself — phases, parties, obligations — and hangs the documents off it, so a file is always attached to the step that needs it.",
        ],
      },
      {
        heading: "Role-aware from the first screen",
        body: [
          "Buyer, seller, broker and legal each see the same deal through a different set of permissions and a different task list. Moving a deal from due diligence into pre-closing reassigns work automatically rather than prompting somebody to remember.",
        ],
      },
      {
        heading: "Reading the paperwork",
        body: [
          "A document analyser summarises leases and reviews rent rolls for internal consistency, and a versioned diff view shows what moved between two P&L revisions instead of asking a human to compare columns.",
          "The LOI generator and the time-bound checklists were the parts that changed day-to-day behaviour fastest — they replaced a spreadsheet each.",
        ],
      },
    ],
  },
  {
    id: "heobz",
    name: "Heobz",
    year: "2024",
    discipline: "Storefront",
    role: "Full-stack",
    problem:
      "Fresh-food delivery in Vietnam charged every order its own courier, so two neighbours ordering an hour apart paid twice for one trip.",
    outcome:
      "Orders placed inside a shared radius now split a single delivery fee, and the storefront holds cart and checkout state through the whole buying flow.",
    tech: ["React", "Node.js", "Tailwind", "Redux"],
    accent: "#f59e0b",
    plate: {
      src: "/heobz_image.webp",
      caption: "Product capture — storefront",
    },
    links: { live: "https://heobz.com/" },
    case: [
      {
        heading: "Shipping is the product",
        body: [
          "For fresh food, the delivery fee is not a line item at the end — it is most of the reason a basket gets abandoned. Charging per-order for a courier who was already going to that street is the kind of waste the customer can feel.",
          "The shipping engine groups orders by radius and splits one delivery cost across them, which turned the fee from a penalty into something closer to a discount for ordering near your neighbours.",
        ],
      },
      {
        heading: "Fast enough to trust",
        body: [
          "The storefront is built for a market where a lot of buying happens on mid-range phones over patchy mobile data. Load time and a cart that never silently loses its contents mattered more here than anything visual.",
        ],
      },
    ],
  },
  {
    id: "hex-housing",
    name: "Hex Housing",
    year: "2023",
    discipline: "Search",
    role: "Full-stack",
    problem:
      "Tenants had to create an account before they could find out whether anything was listed near them at all.",
    outcome:
      "Rental search now runs straight from the browser's location with no sign-in, and latency came down 40%.",
    tech: ["Next.js", "Tailwind", "NextUI", "SWR"],
    accent: "#10b981",
    plate: {
      src: "/hexhousing_image.webp",
      caption: "Product capture — location search",
    },
    links: { live: "https://hex-housing.vercel.app/login" },
    case: [
      {
        heading: "Sign-in walls lose renters",
        body: [
          "The original flow asked for an account before it showed a single listing. That is a reasonable way to collect emails and a terrible way to answer the only question a renter has, which is whether this site knows about anything near them.",
          "Removing the gate meant the geolocation query had to be fast enough to justify itself on first paint, with no session to cache against.",
        ],
      },
      {
        heading: "Where the 40% came from",
        body: [
          "Most of it was query shape and payload: narrowing the geo lookup to a bounded box before the distance sort, and sending only the fields the result card actually renders.",
        ],
      },
    ],
  },
  {
    id: "vrfy",
    name: "VRFY",
    year: "2023",
    discipline: "Storefront",
    role: "Frontend",
    problem:
      "A sneaker storefront that was awkward to use on exactly the phones most of its buyers arrived on.",
    outcome:
      "A rebuilt responsive front end cut page load 35% and made the mobile buying path usable end to end.",
    tech: ["React", "Tailwind", "Redux"],
    accent: "#e11d48",
    plate: {
      src: "/verfy_image.webp",
      caption: "Product capture — product listing",
    },
    links: { live: "https://vrfy-react-poject.vercel.app/home" },
    case: [
      {
        heading: "Mobile was not a breakpoint",
        body: [
          "The desktop layout had been scaled down rather than recomposed, which is the usual reason a storefront tests fine and still converts badly on a phone. Product imagery, filters and the add-to-cart control were rebuilt for the small screen first.",
        ],
      },
    ],
  },
  {
    id: "ancient-origins",
    name: "Ancient Origins",
    year: "2022",
    discipline: "Landing page",
    role: "Frontend",
    problem:
      "A landing page that broke across browsers and collapsed below tablet width.",
    outcome:
      "A clean, fully responsive rebuild in plain HTML and CSS that the client's own team can maintain without a build step.",
    tech: ["HTML", "CSS", "Bootstrap"],
    accent: "#8b5cf6",
    plate: {
      src: "/image_Ancient_Origins.webp",
      caption: "Product capture — landing page",
    },
    links: { live: "https://mazharulislam4.github.io/Ancient_Origins/" },
    case: [
      {
        heading: "Deliberately no framework",
        body: [
          "The client had no front-end team and no appetite for a toolchain. Handing them a React app would have made the next small copy change somebody else's ticket, so the rebuild stayed in plain HTML and CSS they can open and edit.",
        ],
      },
    ],
  },
];


/** Static fallback for the reel section and the /work pages. */
export const FALLBACK_REEL_PROJECTS = REEL_PROJECTS;

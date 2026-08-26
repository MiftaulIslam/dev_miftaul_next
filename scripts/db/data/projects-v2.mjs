/**
 * The v2 projects reel, as authored copy.
 *
 * Generated once from `content/projects.ts` so the seed and the static
 * fallback could not drift apart on the way into the database. From here on the
 * database is the source of truth and the dashboard is where edits happen — this
 * file exists so a fresh database can be stood up with the same content the
 * frontend shipped with, not so it can be hand-edited instead.
 *
 * Every field the reel, the case sheet, /work and /work/[slug] read is present:
 * slug, name, year, discipline, role, problem, outcome, tech, accent, the plate
 * (source, caption, focus), both links, and the full case body.
 */

export const V2_PROJECTS = [
  {
    "slug": "crebrains",
    "name": "CreBrains",
    "year": "2025",
    "discipline": "Platform",
    "role": "Full-stack",
    "problem": "A commercial property deal ran across email, spreadsheets and four parties who never quite saw the same version of a document.",
    "outcome": "Buyers, sellers, brokers and legal now work a single deal in one place, with tasks assigned automatically by closing phase and every rent roll diffed against its last version.",
    "tech": [
      "React",
      "TypeScript",
      "Node.js",
      "AI/ML"
    ],
    "accent": "#3b82f6",
    "plate": {
      "src": "/crebrains_dashboard.png",
      "caption": "Product capture — deal dashboard",
      "focus": "50% 22%"
    },
    "links": {
      "live": "https://crebrains.com",
      "source": ""
    },
    "sortOrder": 0,
    "cases": [
      {
        "heading": "The deal, not the documents",
        "body": [
          "Commercial real estate closings are a document problem wearing a workflow costume. The same lease gets emailed six times, annotated in three places, and nobody can say which copy the lawyer actually read.",
          "CreBrains models the deal itself — phases, parties, obligations — and hangs the documents off it, so a file is always attached to the step that needs it."
        ],
        "sortOrder": 0
      },
      {
        "heading": "Role-aware from the first screen",
        "body": [
          "Buyer, seller, broker and legal each see the same deal through a different set of permissions and a different task list. Moving a deal from due diligence into pre-closing reassigns work automatically rather than prompting somebody to remember."
        ],
        "sortOrder": 1
      },
      {
        "heading": "Reading the paperwork",
        "body": [
          "A document analyser summarises leases and reviews rent rolls for internal consistency, and a versioned diff view shows what moved between two P&L revisions instead of asking a human to compare columns.",
          "The LOI generator and the time-bound checklists were the parts that changed day-to-day behaviour fastest — they replaced a spreadsheet each."
        ],
        "sortOrder": 2
      }
    ]
  },
  {
    "slug": "heobz",
    "name": "Heobz",
    "year": "2024",
    "discipline": "Storefront",
    "role": "Full-stack",
    "problem": "Fresh-food delivery in Vietnam charged every order its own courier, so two neighbours ordering an hour apart paid twice for one trip.",
    "outcome": "Orders placed inside a shared radius now split a single delivery fee, and the storefront holds cart and checkout state through the whole buying flow.",
    "tech": [
      "React",
      "Node.js",
      "Tailwind",
      "Redux"
    ],
    "accent": "#f59e0b",
    "plate": {
      "src": "/heobz_image.webp",
      "caption": "Product capture — storefront",
      "focus": ""
    },
    "links": {
      "live": "https://heobz.com/",
      "source": ""
    },
    "sortOrder": 1,
    "cases": [
      {
        "heading": "Shipping is the product",
        "body": [
          "For fresh food, the delivery fee is not a line item at the end — it is most of the reason a basket gets abandoned. Charging per-order for a courier who was already going to that street is the kind of waste the customer can feel.",
          "The shipping engine groups orders by radius and splits one delivery cost across them, which turned the fee from a penalty into something closer to a discount for ordering near your neighbours."
        ],
        "sortOrder": 0
      },
      {
        "heading": "Fast enough to trust",
        "body": [
          "The storefront is built for a market where a lot of buying happens on mid-range phones over patchy mobile data. Load time and a cart that never silently loses its contents mattered more here than anything visual."
        ],
        "sortOrder": 1
      }
    ]
  },
  {
    "slug": "hex-housing",
    "name": "Hex Housing",
    "year": "2023",
    "discipline": "Search",
    "role": "Full-stack",
    "problem": "Tenants had to create an account before they could find out whether anything was listed near them at all.",
    "outcome": "Rental search now runs straight from the browser's location with no sign-in, and latency came down 40%.",
    "tech": [
      "Next.js",
      "Tailwind",
      "NextUI",
      "SWR"
    ],
    "accent": "#10b981",
    "plate": {
      "src": "/hexhousing_image.webp",
      "caption": "Product capture — location search",
      "focus": ""
    },
    "links": {
      "live": "https://hex-housing.vercel.app/login",
      "source": ""
    },
    "sortOrder": 2,
    "cases": [
      {
        "heading": "Sign-in walls lose renters",
        "body": [
          "The original flow asked for an account before it showed a single listing. That is a reasonable way to collect emails and a terrible way to answer the only question a renter has, which is whether this site knows about anything near them.",
          "Removing the gate meant the geolocation query had to be fast enough to justify itself on first paint, with no session to cache against."
        ],
        "sortOrder": 0
      },
      {
        "heading": "Where the 40% came from",
        "body": [
          "Most of it was query shape and payload: narrowing the geo lookup to a bounded box before the distance sort, and sending only the fields the result card actually renders."
        ],
        "sortOrder": 1
      }
    ]
  },
  {
    "slug": "vrfy",
    "name": "VRFY",
    "year": "2023",
    "discipline": "Storefront",
    "role": "Frontend",
    "problem": "A sneaker storefront that was awkward to use on exactly the phones most of its buyers arrived on.",
    "outcome": "A rebuilt responsive front end cut page load 35% and made the mobile buying path usable end to end.",
    "tech": [
      "React",
      "Tailwind",
      "Redux"
    ],
    "accent": "#e11d48",
    "plate": {
      "src": "/verfy_image.webp",
      "caption": "Product capture — product listing",
      "focus": ""
    },
    "links": {
      "live": "https://vrfy-react-poject.vercel.app/home",
      "source": ""
    },
    "sortOrder": 3,
    "cases": [
      {
        "heading": "Mobile was not a breakpoint",
        "body": [
          "The desktop layout had been scaled down rather than recomposed, which is the usual reason a storefront tests fine and still converts badly on a phone. Product imagery, filters and the add-to-cart control were rebuilt for the small screen first."
        ],
        "sortOrder": 0
      }
    ]
  },
  {
    "slug": "ancient-origins",
    "name": "Ancient Origins",
    "year": "2022",
    "discipline": "Landing page",
    "role": "Frontend",
    "problem": "A landing page that broke across browsers and collapsed below tablet width.",
    "outcome": "A clean, fully responsive rebuild in plain HTML and CSS that the client's own team can maintain without a build step.",
    "tech": [
      "HTML",
      "CSS",
      "Bootstrap"
    ],
    "accent": "#8b5cf6",
    "plate": {
      "src": "/image_Ancient_Origins.webp",
      "caption": "Product capture — landing page",
      "focus": ""
    },
    "links": {
      "live": "https://mazharulislam4.github.io/Ancient_Origins/",
      "source": ""
    },
    "sortOrder": 4,
    "cases": [
      {
        "heading": "Deliberately no framework",
        "body": [
          "The client had no front-end team and no appetite for a toolchain. Handing them a React app would have made the next small copy change somebody else's ticket, so the rebuild stayed in plain HTML and CSS they can open and edit."
        ],
        "sortOrder": 0
      }
    ]
  }
];

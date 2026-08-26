/* ============================================================================
   AREA  -  ABOUT
   ----------------------------------------------------------------------------
   Ten directions for the section of a portfolio that usually goes limp: a
   paragraph beside a headshot. Five page-level takeovers, five sections that
   live inside a scrolling portfolio and hand off downward.

   ONE BIOGRAPHY, TEN READINGS
   ---------------------------
   Every concept reads from the single BIO object below. That is deliberate: if
   the copy lived inside each concept, the ten would drift into ten different
   people within a week of editing. The art direction is the variable; the
   person is the constant.

   NO PHOTOGRAPHS
   --------------
   There is no headshot anywhere in this file and no external image request of
   any kind. Where a portrait is needed it is generated: a signed-distance
   silhouette lit by a movable key light and printed as a halftone dot screen
   (see `figureField`). A procedural portrait is honest about being a drawing,
   costs zero bytes of network, resizes without artefacts, and can be lit by the
   pointer. A stock photo of somebody who is not Miftaul would be worse on every
   one of those axes.
   ========================================================================== */
(function (SE) {
  'use strict';

  var AREA = 'about';
  var TAU = Math.PI * 2;

  /* Five signature hues, one per family, shared by the page and the section
     that argue the same thing. The gallery cards then pair up visually and the
     "this section is the teaser for that page" relationship is legible before
     anything is opened. */
  var HUE = {
    interview: '#5FA8D3',   /* transcript  <-> split      */
    figure:    '#8E9AA6',   /* portrait    <-> resolve    */
    argument:  '#DCC7A1',   /* manifesto   <-> sentence   */
    principle: '#4FB6A3',   /* constellation <-> principles */
    ledger:    '#8DA750'    /* ledger      <-> editorial  */
  };

  /* ==========================================================================
     BIO  -  the single source of truth for all ten concepts.
     ========================================================================== */
  var BIO = {
    name: 'Miftaul Islam',
    role: 'Full-stack developer',
    thesis: 'I optimise for the second year.',

    standfirst:
      'Miftaul Islam builds web software end to end. Most of that work is maintenance: ' +
      'reading code somebody else wrote under a deadline, finding the one line that ' +
      'explains the bug, and leaving the file better lit than he found it.',

    /* Biography beats. Years are the mono material; the sentences are prose. */
    beats: [
      { yr: '2016', t: 'A school notice board',
        b: 'PHP on a shared box a teacher paid for by the year. It kept working for four years after I left. I still think that is the only metric that mattered.' },
      { yr: '2019', t: 'A pharmacy under a counter',
        b: 'First paid job: an inventory system running on a laptop on a UPS, on a street where the power went out twice a week. It taught me offline-first before I knew the phrase.' },
      { yr: '2020', t: 'Being the pager',
        b: 'Node and Postgres, and distributed systems learned the ordinary way: by being the person the alert woke up at 04:10 on a Sunday.' },
      { yr: '2022', t: 'Types on purpose',
        b: 'Moved to TypeScript for one reason. I wanted a second reviewer at 1am on the nights when there was not a first one.' },
      { yr: '2023', t: 'Eleven hours a day',
        b: 'Two years on a logistics console eight dispatchers lived inside. Nobody ever praised it. They stopped mentioning it, which is the better outcome.' },
      { yr: '2026', t: 'The render path',
        b: 'Next.js, Postgres, and a strong opinion about what runs where. Currently interested in the parts of a frontend that decide whether it works on a 3G train.' }
    ],

    /* Working principles. `q` holds three projections used by the constellation:
       each pair is [x, y] in 0..1 for one question the reader can ask the field. */
    principles: [
      { key: 'Boring first',
        line: 'The first version should be readable by whoever is on call at three in the morning, including me.',
        body: 'Clever can arrive in the second pass, if a second pass is ever needed. It usually is not. The version that gets understood in forty seconds is the version that gets fixed correctly.',
        cost: 'Slower to write. Much faster to explain.',
        q: [[0.30, 0.86], [0.18, 0.74], [0.24, 0.30]] },
      { key: 'Third caller',
        line: 'Two similar things are a coincidence. Three are a pattern. Abstracting at two produces a shape that fits neither.',
        body: 'The premature abstraction is harder to remove than the duplication it replaced, because by then two teams import it and one of them depends on the accident.',
        cost: 'Some duplication lives for a few weeks.',
        q: [[0.22, 0.62], [0.44, 0.58], [0.58, 0.52]] },
      { key: 'Types at the boundary',
        line: 'Everything crossing a network, a form or a file gets validated. Inside that line I trust the code I just wrote.',
        body: 'Belt and braces on every function is noise, and noise is how a real check gets skimmed. Put the rigour where the lies come in.',
        cost: 'You have to actually know where your boundaries are.',
        q: [[0.44, 0.70], [0.30, 0.86], [0.40, 0.44]] },
      { key: 'Reversible or scheduled',
        line: 'A migration you cannot reverse is a decision, not a deploy.',
        body: 'Anything that drops a column, rewrites a row or renames a queue gets a written way back before it gets written. If there is no way back it goes in the calendar with a name attached.',
        cost: 'Two migrations instead of one, most of the time.',
        q: [[0.72, 0.34], [0.80, 0.92], [0.86, 0.74]] },
      { key: 'Under a minute',
        line: 'Past sixty seconds people stop running the build locally and start finding out in CI.',
        body: 'The feedback loop is the tool. Everything else is preference. I have never regretted a day spent on test infrastructure and I have regretted most of the days spent on configuration.',
        cost: 'Real time that shows up in no demo.',
        q: [[0.66, 0.52], [0.62, 0.66], [0.66, 0.62]] },
      { key: 'Source before blog post',
        line: 'The blog post tells you what the author wanted the API to be. The source tells you what happens on Tuesday.',
        body: 'Half a day of reading the actual implementation has resolved more arguments for me than any amount of documentation, and it is the fastest way to stop being frightened of a dependency.',
        cost: 'Half a day, roughly once a month.',
        q: [[0.52, 0.24], [0.72, 0.40], [0.16, 0.66]] },
      { key: 'Delete in month three',
        line: 'Every project gets a pass where the only acceptable diff is negative.',
        body: 'Flags nobody flips, endpoints nobody calls, the config value that had one true setting all along. Scheduling it means it happens without anyone needing to be brave.',
        cost: 'A day of nerve. Everyone is scared of deleting things.',
        q: [[0.84, 0.44], [0.56, 0.30], [0.78, 0.28]] }
    ],

    /* Edges for the constellation: which principle leans on which. Hard coded,
       not generated, because a real dependency graph is an argument and a random
       one is decoration. */
    edges: [[0, 1], [0, 2], [1, 6], [2, 3], [3, 4], [4, 5], [5, 1], [6, 3]],

    /* The three questions the constellation can be asked. Each re-projects the
       same seven nodes onto a different pair of axes. */
    questions: [
      { q: 'What does it cost me now?',  x: ['costs nothing', 'costs real time'], y: ['comes up rarely', 'comes up daily'] },
      { q: 'When does it pay back?',     x: ['this week', 'next year'],           y: ['pays a little', 'pays a lot'] },
      { q: 'Who has to agree with me?',  x: ['just me', 'the whole team'],        y: ['easy to agree', 'hard to agree'] }
    ],

    refuses: [
      'A spinner where a skeleton would tell the truth about the layout.',
      'Infinite scroll on anything a person might need to find twice.',
      'A form that empties itself when validation fails.',
      'An authorisation check that only exists in the client.',
      'A dependency added for one function I could have written in nine lines.',
      'Motion on a keyboard shortcut. Used a hundred times a day, it should be instant.'
    ],

    optimises: [
      { k: 'Rollback speed', v: 'not deploy speed' },
      { k: 'Time to the second bug', v: 'not time to the first fix' },
      { k: 'p95 on the worst device in the building', v: 'not the average on mine' },
      { k: 'The reviewer’s Tuesday morning', v: 'not my Friday evening' }
    ],

    facts: [
      { k: 'Based', v: 'Dhaka' },
      { k: 'In production since', v: '2019' },
      { k: 'Stack today', v: 'TypeScript, Next.js, Postgres' },
      { k: 'Reply time', v: 'Same day, most days' }
    ],

    /* The interview. Timecodes are the mono material and the scrub axis. */
    runtime: '18:42',
    exchanges: [
      { tc: '00:00', at: 0,
        q: 'Start with what you actually do.',
        a: 'I write web software end to end. In practice that means most of a week is spent inside code somebody else wrote, and a smaller part of it writing new code somebody else will have to read.' },
      { tc: '01:47', at: 107,
        q: 'That sounds like a complaint.',
        a: 'It is not. It is the job. I stopped being surprised by it around year two, and once I stopped being surprised I got much better at it.' },
      { tc: '03:12', at: 192,
        q: 'What do you optimise for?',
        a: 'The second year. Anyone can make month one fast. The question is what the codebase costs in month fourteen, when the person who wrote it has gone and the person reading it has forty minutes before a meeting.' },
      { tc: '05:26', at: 326,
        q: 'Give me something you refuse to ship.',
        a: 'A form that empties itself when validation fails. It is a two-line fix and it is live on sites with real budgets. I take it personally.' },
      { tc: '07:40', at: 460,
        q: 'And something you were wrong about?',
        a: 'I spent about a year believing that if the types were strict enough the tests could be thin. Types tell you the shape is right. They will happily let you send a correctly typed refund to the wrong account.' },
      { tc: '09:55', at: 595,
        q: 'How do you actually work?',
        a: 'One long block in the morning, nothing scheduled before two. I write the interface before the implementation, because the signature is where the design review really happens. I read logs before dashboards.' },
      { tc: '12:18', at: 738,
        q: 'Why logs before dashboards?',
        a: 'A dashboard answers the questions somebody already thought to ask. The log has the answer to the question I have right now, which is usually one nobody predicted.' },
      { tc: '14:33', at: 873,
        q: 'What is the hardest part?',
        a: 'Deleting. Every project needs a pass where the only acceptable diff is negative, and everybody is scared of it, including me. I put it in month three so it is scheduled rather than an act of courage.' },
      { tc: '16:58', at: 1018,
        q: 'Last one. What are you looking for?',
        a: 'A team that reviews carefully and ships anyway. Those two are not in tension nearly as often as people believe.' }
    ],
    duration: 1122,

    /* The manifesto, as blocks so the scroll can light them one at a time. */
    manifesto: [
      { t: 'p', s: 'Anyone can make month one fast. Pick the framework with the best starter, wire the happy path, ship on a Friday. The demo works because the demo is the only path anybody has walked. Month one was never the hard part.' },
      { t: 'p', s: 'Month fourteen is the hard part. By then the person who wrote the module has gone, the assumption that made it simple has quietly stopped being true, and somebody has forty minutes to change one line without breaking eleven others.' },
      { t: 'p', s: 'Everything I decide in month one is a bet about that afternoon. Which means the standard I am actually holding the code to is not the one most of us say out loud.' },
      { t: 'turn', strike: 'Good code is code that is easy to write.',
                   fixed:  'Good code is code that is cheap to be wrong about.' },
      { t: 'p', s: 'Those two targets pull in opposite directions. Easy to write rewards cleverness, indirection, and whatever the ecosystem is excited about this quarter. Cheap to be wrong about rewards a small blast radius, reversible migrations, boring names, and a build fast enough that people actually run it.' },
      { t: 'p', s: 'So I ship the boring version first. I do not abstract before the third caller. I validate at the boundary and trust the code inside it. And I keep a file in every project listing the things I believed on day one that turned out to be false, which is reliably the most useful document in the repository.' },
      { t: 'end', s: 'None of that is a philosophy. It is what is left over after being paged enough times.' }
    ],

    /* One sentence, one clause at a time. Split on words at mount. */
    sentence:
      'I write the interface before the implementation, ship the boring version first, ' +
      'validate at the boundary and trust what is inside it, refuse to abstract before ' +
      'the third caller, and keep the build under sixty seconds, because everything ' +
      'else is preference and the feedback loop is the tool.',

    editorial: [
      'He works in TypeScript, Next.js and Postgres, and has spent six years mostly on internal software: inventory, logistics, the console eight people sit in front of for eleven hours and never mention. The absence of comment is the compliment.',
      'He ships the boring version first, validates at the boundary, and does not abstract before the third caller. He keeps a file in every repository listing the things he believed on day one that turned out to be false.'
    ],

    /* ---------------------------------------------------------------- ledger
       Self-logged time, twelve weeks, rounded to the quarter hour. `logged` is
       the recorded weekly mean; `guess` is what he wrote down as an estimate
       before the log started. Both columns are budgeted against the same 38.5h
       week on purpose, so the deltas have to cancel: the interesting number is
       not the total, it is which way each row moved. */
    week: 38.5,
    weeks: 12,
    ledger: [
      { k: 'Reading code that already exists', logged: 9.25, guess: 4.50,  shape: 0, vol: 1.4 },
      { k: 'Writing new code',                 logged: 7.75, guess: 16.00, shape: 1, vol: 1.8 },
      { k: 'Review, mine and other people’s', logged: 4.50, guess: 3.00, shape: 2, vol: 0.9 },
      { k: 'Reproducing the bug',              logged: 3.25, guess: 2.00,  shape: 3, vol: 1.2 },
      { k: 'Naming things, deleting things',   logged: 2.00, guess: 1.00,  shape: 0, vol: 0.6 },
      { k: 'Talking to whoever asked',         logged: 4.75, guess: 6.00,  shape: 1, vol: 1.1 },
      { k: 'Waiting on CI',                    logged: 2.25, guess: 1.50,  shape: 2, vol: 0.7 },
      { k: 'Writing it down so it survives me', logged: 2.50, guess: 1.50, shape: 3, vol: 0.8 },
      { k: 'The thing I did not plan for',     logged: 2.25, guess: 3.00,  shape: 0, vol: 1.6 }
    ],
    /* Four recorded weekly shapes, each summing to zero, assigned per row and
       scaled by that row's volatility. Stating the model beats inventing 108
       individual numbers and pretending they were measured. */
    shapes: [
      [ 0.3, -0.2,  0.6, -0.4,  0.1,  0.2, -0.7,  0.5, -0.1,  0.4, -0.5, -0.2],
      [-0.5,  0.4,  0.2,  0.7, -0.3, -0.6,  0.5,  0.1, -0.2,  0.3, -0.8,  0.2],
      [ 0.8, -0.6,  0.1,  0.3, -0.2,  0.9, -0.4, -0.5,  0.2, -0.3,  0.1, -0.4],
      [-0.2,  0.1, -0.4,  0.5,  0.6, -0.3,  0.2, -0.6,  0.4,  0.1, -0.5,  0.1]
    ]
  };

  /* Weekly series, derived once. Quarter-hour rounding matches how the log was
     actually kept. */
  BIO.ledger.forEach(function (row) {
    var shape = BIO.shapes[row.shape];
    row.series = shape.map(function (d) {
      return Math.max(0, Math.round((row.logged + d * row.vol) * 4) / 4);
    });
    row.delta = Math.round((row.logged - row.guess) * 100) / 100;
  });

  /* ==========================================================================
     SHARED MACHINERY
     ========================================================================== */

  /* Teardown bag. Every concept builds one and calls `all()` in destroy(). The
     alternative is ten hand-written destroy functions that each forget a
     different listener, which is exactly how a gallery of concepts ends up
     leaking a ticker subscription per open. */
  function bag() {
    var fns = [];
    return {
      on: function (target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        fns.push(function () { target.removeEventListener(type, fn, opts); });
      },
      tick: function (fn) {
        SE.ticker.add(fn);
        fns.push(function () { SE.ticker.remove(fn); });
      },
      timer: function (fn, ms) {
        var id = setTimeout(fn, ms);
        fns.push(function () { clearTimeout(id); });
        return id;
      },
      obs: function (o) { fns.push(function () { o.disconnect(); }); return o; },
      kill: function (o) { if (o) fns.push(function () { o.kill(); }); return o; },
      rail: function (r) { if (r) fns.push(function () { r.destroy(); }); return r; },
      cv: function (c) { fns.push(function () { c.destroy(); }); return c; },
      add: function (fn) { fns.push(fn); },
      all: function () { for (var i = fns.length - 1; i >= 0; i--) fns[i](); fns.length = 0; }
    };
  }

  /* A scroller of our own for page-mode concepts that need to scroll. The stage
     body clips, so a page concept cannot borrow the document scroll. */
  function pageScroller(root, cls) {
    var s = SE.el('div', cls + ' about-scroll');
    root.appendChild(s);
    return s;
  }

  /* Reveal-on-enter without a scroll listener. One observer per concept, items
     unobserved as they fire so nothing keeps firing after the first pass. */
  function revealer(scope, items, root, delayStep) {
    if (SE.env.reduced || typeof IntersectionObserver === 'undefined') {
      items.forEach(function (n) { n.classList.add('is-in'); });
      return null;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = items.indexOf(e.target);
        e.target.style.setProperty('--d', (Math.max(0, i % 6) * (delayStep || 60)) + 'ms');
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { root: root || null, threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (n) { io.observe(n); });
    return io;
  }

  /* -------------------------------------------------------- procedural face */
  /* A silhouette assembled from four ellipses joined with a polynomial smooth
     minimum, so head, jaw, neck and shoulders read as one body rather than four
     stuck-together shapes. The height field is the distance pushed through a
     square root, which gives a dome instead of a flat cut-out, and the normals
     come from finite differences of that field. Everything below is in a
     normalised 0..1 portrait box, so the same figure works at any size. */
  function sdEllipse(u, v, cu, cv, ru, rv) {
    var du = (u - cu) / ru, dv = (v - cv) / rv;
    return (Math.sqrt(du * du + dv * dv) - 1) * Math.min(ru, rv);
  }
  function smin(a, b, k) {
    var t = Math.max(0, Math.min(1, 0.5 + 0.5 * (b - a) / k));
    return b + (a - b) * t - k * t * (1 - t);
  }
  function figureSD(u, v) {
    /* Cranium, jaw, neck, shoulders. The four radii were tuned against the
       printed result rather than against a reference photograph: a neck
       narrower than 0.075 reads as a stem, and shoulders centred lower than
       1.005 leave a gap the smooth minimum cannot close. */
    var d = smin(sdEllipse(u, v, 0.500, 0.285, 0.156, 0.185),
                 sdEllipse(u, v, 0.502, 0.368, 0.121, 0.128), 0.045);
    d = smin(d, sdEllipse(u, v, 0.497, 0.494, 0.075, 0.094), 0.055);
    d = smin(d, sdEllipse(u, v, 0.500, 1.005, 0.395, 0.440), 0.072);
    return d;
  }

  /* Sample the figure onto a dot grid. Rows are offset by half a step so the
     screen reads as a printed halftone rather than a spreadsheet. Called on
     resize only; per frame we relight the cached normals, which is arithmetic
     rather than sampling. */
  function figureField(w, h, step, box) {
    var cols = Math.max(2, Math.ceil(w / step) + 1);
    var rows = Math.max(2, Math.ceil(h / step) + 1);
    var n = cols * rows;
    var hgt = new Float32Array(n);
    var i, j, k;

    /* Fit the 0..1 portrait box into the canvas without distorting the face.
       The caller may hand in its own box: the page concept wants a narrow
       central column with room for copy either side, and the section concept
       wants a wide plate. A single hardcoded fit cannot serve both. */
    var side = box ? box.side : Math.min(w * 0.46, h);
    var bx = box ? box.bx : (w - side) / 2;
    var by = box ? box.by : (h - side) * 0.40;

    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        var px = i * step + (j % 2 ? step * 0.5 : 0);
        var py = j * step;
        var u = (px - bx) / side, v = (py - by) / side;
        var d = figureSD(u, v);
        hgt[j * cols + i] = d < 0 ? Math.sqrt(Math.min(1, -d / 0.085)) : 0;
      }
    }

    var nx = new Float32Array(n), ny = new Float32Array(n), nz = new Float32Array(n);
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        k = j * cols + i;
        if (hgt[k] <= 0) { nz[k] = 0; continue; }
        var l = hgt[k - (i > 0 ? 1 : 0)];
        var r = hgt[k + (i < cols - 1 ? 1 : 0)];
        var t = hgt[k - (j > 0 ? cols : 0)];
        var b = hgt[k + (j < rows - 1 ? cols : 0)];
        var gx = (l - r) * 2.6, gy = (t - b) * 2.6, gz = 1;
        var m = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
        nx[k] = gx / m; ny[k] = gy / m; nz[k] = gz / m;
      }
    }

    return { cols: cols, rows: rows, step: step, hgt: hgt, nx: nx, ny: ny, nz: nz, side: side, bx: bx, by: by };
  }

  /* Light one cell. Separated so the page concept and the section concept light
     the same field identically and cannot drift apart. */
  function figureLum(f, k, lx, ly, lz) {
    if (f.nz[k] <= 0) return 0;
    var d = f.nx[k] * lx + f.ny[k] * ly + f.nz[k] * lz;
    if (d < 0) d = 0;
    return Math.min(1, 0.12 + d * 0.95);
  }

  /* Vertical falloff for one row of the field. The shoulder mass is broad
     enough that its interior distance saturates the height map, so its normals
     are almost all straight at the viewer and it prints as one flat slab. A key
     light placed above the subject does not illuminate a chest the way it
     illuminates a forehead, and this is that: light falls to 38% below the
     midpoint of the portrait box. Computed once per row, not per cell. */
  function figureFall(f, y) {
    var v = (y - f.by) / f.side;
    if (v <= 0.5) return 1;
    return 1 - 0.62 * Math.min(1, (v - 0.5) / 0.55);
  }

  /* --------------------------------------------------------------- previews */
  /* Precomputed once at load, never inside a preview frame: the miniatures run
     on every visible card at 60fps and must not allocate. */
  var PRE = {};

  PRE.wave = (function () {
    var r = SE.rng(90210), a = [], i;
    for (i = 0; i < 108; i++) {
      /* Speech, not noise: a slow envelope with grain on top, so the strip
         reads as a voice recording and not as a random walk. */
      a.push((0.30 + 0.70 * Math.abs(Math.sin(i * 0.19) * Math.sin(i * 0.061))) * (0.55 + r() * 0.45));
    }
    return a;
  })();

  PRE.face = (function () {
    /* A coarse silhouette sample for the card miniatures: 30-odd cells, fixed
       at load, so a portrait preview costs about the same as a bar chart. */
    var cells = [], cols = 9, rows = 12, i, j;
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        var u = (i + (j % 2 ? 0.5 : 0)) / (cols - 1);
        var v = j / (rows - 1);
        var d = figureSD(0.5 + (u - 0.5) * 0.92, v * 0.98);
        if (d < 0) cells.push({ u: u, v: v, h: Math.sqrt(Math.min(1, -d / 0.085)) });
      }
    }
    return cells;
  })();

  PRE.stars = (function () {
    var r = SE.rng(31337);
    return BIO.principles.map(function (p, i) {
      return { a: p.q[0], b: p.q[1], j: r() * TAU, i: i };
    });
  })();

  PRE.dust = (function () {
    var r = SE.rng(5150), a = [], i;
    for (i = 0; i < 34; i++) a.push({ x: r(), y: r(), pick: Math.floor(r() * PRE.face.length) });
    return a;
  })();


  /* Speech envelope for the transcript axis, sampled once per second of the
     recording. Built from three incommensurate sines plus a seeded grain so it
     reads as a voice and not as a sawtooth, and so it is byte-identical on
     every reload. */
  PRE.speech = (function () {
    var r = SE.rng(4711), a = [], i, n = BIO.duration;
    for (i = 0; i < n; i++) {
      var env = 0.34 + 0.46 * Math.abs(Math.sin(i * 0.031) * Math.sin(i * 0.0071 + 1.1));
      a.push(Math.min(1, env * (0.62 + r() * 0.52)));
    }
    return a;
  })();

  /* Bayer 4x4 ordered-dither matrix, normalised to 0..1. Ordered dithering is
     the right choice over error diffusion here: it is stateless, so a dot's
     threshold depends only on its coordinates and the field can be relit every
     frame without re-running a serial algorithm over the whole grid. */
  var BAYER = (function () {
    var m = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    return m.map(function (v) { return (v + 0.5) / 16; });
  })();
  function bayerAt(i, j) { return BAYER[(j & 3) * 4 + (i & 3)]; }

  /* ------------------------------------------------------------------ tint */
  /* One place that writes the concept hue onto the root, so ten concepts
     cannot drift into ten slightly different alpha ramps. */
  function tint(root, hex) {
    root.style.setProperty('--c-accent', hex);
    root.style.setProperty('--c-line', SE.rgba(hex, 0.42));
    root.style.setProperty('--c-mid', SE.rgba(hex, 0.24));
    root.style.setProperty('--c-soft', SE.rgba(hex, 0.12));
    root.style.setProperty('--c-wash', SE.rgba(hex, 0.05));
    if (SE.stageAccent) SE.stageAccent(hex);
  }

  /* A canvas has no accessibility tree, so every canvas concept in this file
     mirrors its contents through SE.srList. That helper speaks the Skills
     shape, so this adapts an arbitrary record into it once rather than in ten
     places. */
  function srItems(list, map) { return list.map(map); }

  /* ------------------------------------------------------- draw primitives */
  /* Shared by the ten card miniatures, which run on every visible card at
     60fps. Each stays inside a rough forty-operation budget per frame; these
     three exist so the budget is spent on the drawing and not on boilerplate. */
  function hair(ctx, x1, y1, x2, y2, stroke, width) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width || 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  function box(ctx, x, y, w, h, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  function dot(ctx, x, y, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  /* Word-level split for scroll-resolved and stagger-resolved copy. Words, not
     characters: a forty-word answer is forty nodes with a CSS transition
     delay, where the same effect per character is four hundred nodes and a
     visible layout cost on a phone. */
  function words(text, cls) {
    var parts = text.split(' ');
    var html = '';
    for (var i = 0; i < parts.length; i++) {
      /* The separator is a real space BETWEEN the spans, never a non-breaking
         space inside them. A word span with an nbsp glued to its tail cannot
         be broken after, and a paragraph built that way silently refuses to
         wrap and runs off the side of the stage. It also means selecting the
         text copies ordinary spaces. */
      html += '<span class="' + cls + '" style="--i:' + i + '">' + parts[i] + '</span>' +
              (i < parts.length - 1 ? ' ' : '');
    }
    return html;
  }

  /* Fixed-width timecode from seconds. Used on the transcript axis and index,
     where a column of times that jitters by a pixel destroys the instrument
     reading the whole concept is built on. */
  function tc(sec) {
    var s = Math.max(0, Math.round(sec));
    return SE.pad(Math.floor(s / 60)) + ':' + SE.pad(s % 60);
  }

  /* Hours to a quarter-hour string. The ledger was kept to the quarter hour,
     so printing 9.25 as "9h 15" is the honest rendering of the source. */
  function hm(hours) {
    var h = Math.floor(hours);
    var m = Math.round((hours - h) * 60);
    return h + 'h ' + SE.pad(m);
  }

  /* ==========================================================================
     PAGE 01  -  TRANSCRIPT
     --------------------------------------------------------------------------
     An eighteen minute interview you scrub rather than read. The recording is
     the spine: a speech envelope drawn across the bottom, nine exchange marks
     on it, a playhead you drag. Whatever the playhead is inside is the
     exchange that is resolved on the page; everything else is a timecode.

     WHY SCRUB AND NOT SCROLL
     ------------------------
     A scrolling transcript is a document. A scrubbed one is a recording, and
     the difference is that the reader is handling time instead of handling
     text. That single change is what makes an interview feel like it happened
     rather than like it was written, and it costs one damped scalar.

     WHY THE COPY RESOLVES PER WORD AND NOT PER CHARACTER
     ----------------------------------------------------
     Per character on a forty word answer is four hundred nodes, each with its
     own transition, restarted every time the playhead crosses a boundary. Per
     word is forty, it reads as speech arriving in phrases rather than as a
     terminal effect, and it survives a fast scrub without dropping a frame.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'about-page-transcript',
    num: 1,
    name: 'Transcript',
    kind: 'Canvas axis / scrubbed time',
    accent: HUE.interview,
    tagline: 'An interview you handle by the minute',
    desc: 'Nine exchanges laid on an eighteen minute axis you drag. The question and answer under the playhead ' +
          'resolve in phrases; everything else stays a timecode.',
    interaction: 'Drag the axis or press Left and Right to move through the recording. Up and Down jump a whole exchange, and every timecode in the index is a button.',
    hint: 'Drag the axis &middot; Arrows step &middot; Up / Down jump',

    /* Miniature: the envelope, the nine marks, one travelling playhead and two
       caption rules. Around forty operations a frame. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.07;
      var iw = w - padX * 2;
      var base = h * 0.72;
      var amp = h * 0.30;
      var head = (t * 0.085) % 1;
      var i, x, f, a;

      hair(ctx, padX, base + 0.5, w - padX, base + 0.5, 'rgba(236,236,239,0.10)');

      /* 32 columns is enough to read as a waveform and cheap enough to redraw
         on every visible card. Two passes, two fillStyle writes, and the two
         loops between them draw 32 rectangles in total rather than 64. */
      ctx.fillStyle = 'rgba(95,168,211,' + (0.16 + heat * 0.10).toFixed(3) + ')';
      for (i = 0; i < 32; i++) {
        f = i / 31;
        if (f <= head) continue;
        a = PRE.speech[Math.floor(f * (PRE.speech.length - 1))] * amp;
        ctx.fillRect(padX + f * iw, base - a * 0.5, 2, a * 0.5);
      }
      ctx.fillStyle = 'rgba(95,168,211,0.92)';
      for (i = 0; i < 32; i++) {
        f = i / 31;
        if (f > head) break;
        a = PRE.speech[Math.floor(f * (PRE.speech.length - 1))] * amp;
        ctx.fillRect(padX + f * iw, base - a, 2, a);
      }

      ctx.strokeStyle = 'rgba(236,236,239,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 0; i < BIO.exchanges.length; i++) {
        x = Math.round(padX + (BIO.exchanges[i].at / BIO.duration) * iw) + 0.5;
        ctx.moveTo(x, base + 3);
        ctx.lineTo(x, base + 7);
      }
      ctx.stroke();

      /* Two caption rules stand in for the question and the answer. */
      box(ctx, padX, h * 0.20, iw * 0.52, 2, 'rgba(236,236,239,0.62)');
      box(ctx, padX, h * 0.32, iw * (0.34 + heat * 0.30), 1, 'rgba(236,236,239,0.20)');
      box(ctx, padX, h * 0.40, iw * (0.62 + heat * 0.18), 1, 'rgba(236,236,239,0.20)');

      x = padX + head * iw;
      hair(ctx, x, h * 0.14, x, base + 8, 'rgba(255,255,255,0.72)');
      dot(ctx, x, base - PRE.speech[Math.floor(head * (PRE.speech.length - 1))] * amp, 2.2, '#fff');
    },

    mount: function (root) {
      var env = SE.env, M = SE.math;
      var b = bag();
      var X = BIO.exchanges;
      var N = X.length;

      root.classList.add('about', 'about-transcript');
      tint(root, HUE.interview);

      /* ------------------------------------------------------------- DOM */
      var wrap = SE.el('div', 'about-transcript__wrap');
      wrap.innerHTML =
        '<header class="about-transcript__head">' +
          '<h2 class="about__title">Eighteen minutes, on the record</h2>' +
          '<p class="about__lede">' + BIO.name + ' on what the job actually is. Move the playhead; ' +
            'the exchange under it resolves and the rest stay timecodes.</p>' +
          '<span class="about-transcript__runtime t-num">' + BIO.runtime + '</span>' +
        '</header>';

      var body = SE.el('div', 'about-transcript__body');

      var index = SE.el('nav', 'about-transcript__index');
      index.setAttribute('aria-label', 'Jump to an exchange');
      index.innerHTML = '<ol>' + X.map(function (x, i) {
        return '<li><button type="button" data-go="' + i + '" aria-label="' +
               x.tc + ', ' + x.q.replace(/"/g, '') + '">' +
               '<i class="t-num">' + x.tc + '</i><b>' + x.q + '</b></button></li>';
      }).join('') + '</ol>';
      body.appendChild(index);

      var pane = SE.el('article', 'about-transcript__pane');
      pane.setAttribute('aria-live', 'polite');
      pane.innerHTML =
        '<p class="about-transcript__cue t-num"><span data-cue></span><em data-pos></em></p>' +
        '<h3 class="about-transcript__q" data-q></h3>' +
        '<div class="about-transcript__a" data-a></div>';
      body.appendChild(pane);
      wrap.appendChild(body);

      /* The axis is a real slider, not a decorated canvas: the canvas paints,
         the wrapper carries role, value and the keys. */
      var axis = SE.el('div', 'about-transcript__axis');
      axis.setAttribute('role', 'slider');
      axis.setAttribute('tabindex', '0');
      axis.setAttribute('aria-label', 'Recording position');
      axis.setAttribute('aria-valuemin', '0');
      axis.setAttribute('aria-valuemax', String(BIO.duration));
      var wave = SE.el('canvas', 'about-transcript__wave');
      axis.appendChild(wave);
      var ghost = SE.el('span', 'about-transcript__ghost');
      ghost.setAttribute('aria-hidden', 'true');
      axis.appendChild(ghost);
      wrap.appendChild(axis);

      root.appendChild(wrap);
      root.appendChild(SE.hintStrip(
        '<span>Drag the axis</span><span>Left / Right steps 5s</span><span>Up / Down jumps an exchange</span>'
      ));

      root.appendChild(SE.srList('Transcript: an interview on an eighteen minute axis',
        srItems(X, function (x, i) {
          return { name: x.tc, categoryLabel: 'exchange ' + (i + 1) + ' of ' + N, role: x.q, note: x.a };
        }), function (s) {
          var i = X.map(function (x) { return x.tc; }).indexOf(s.name);
          if (i >= 0) seek(X[i].at + 1, true);
        }));

      /* ----------------------------------------------------------- state */
      var cv = b.cv(SE.canvas(wave));
      var cvx = cv.ctx;
      var target = 0;          /* seconds, what the input asked for */
      var time = 0;            /* seconds, damped, what is drawn */
      var active = -1;
      var dragging = false;

      var qEl = SE.$('[data-q]', pane);
      var aEl = SE.$('[data-a]', pane);
      var cueEl = SE.$('[data-cue]', pane);
      var posEl = SE.$('[data-pos]', pane);
      var buttons = SE.$$('button', index);

      function indexAt(sec) {
        var i = 0;
        for (var k = 0; k < N; k++) if (X[k].at <= sec) i = k;
        return i;
      }

      function seek(sec, snap) {
        target = M.clamp(sec, 0, BIO.duration);
        if (snap || env.reduced) time = target;
        if (env.reduced) { setActive(indexAt(time)); render(); }
        axis.setAttribute('aria-valuenow', String(Math.round(target)));
        axis.setAttribute('aria-valuetext', tc(target) + ', ' + X[indexAt(target)].q);
      }

      /* Swapping the exchange is a state change, so it runs on transitions
         rather than keyframes: a fast scrub retargets from wherever the words
         currently are instead of restarting each one from zero. */
      function setActive(i) {
        if (i === active) return;
        active = i;
        var x = X[i];
        cueEl.textContent = x.tc;
        posEl.textContent = SE.pad(i + 1) + ' / ' + SE.pad(N);
        qEl.innerHTML = words(x.q, 'about-transcript__w');
        aEl.innerHTML = words(x.a, 'about-transcript__w');
        pane.classList.remove('is-in');
        /* One forced reflow read, deliberately: it is the cheapest way to
           restart a transition and it happens nine times in the whole life of
           the concept, not once a frame. */
        void pane.offsetWidth;
        pane.classList.add('is-in');
        for (var k = 0; k < buttons.length; k++) {
          buttons[k].setAttribute('aria-current', k === i ? 'true' : 'false');
        }
        /* The index tracks the playhead. Nine rows do not fit a laptop stage,
           and an index that silently holds the wrong nine rows is worse than
           no index at all. `block: "nearest"` so an already-visible row never
           causes a pointless scroll. */
        if (buttons[i] && buttons[i].scrollIntoView) {
          buttons[i].scrollIntoView({
            block: 'nearest', inline: 'nearest',
            behavior: env.reduced ? 'auto' : 'smooth'
          });
        }
      }

      /* ----------------------------------------------------- interaction */
      function fromEvent(e) {
        var r = wave.getBoundingClientRect();
        return M.clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1) * BIO.duration;
      }

      b.on(axis, 'pointerdown', function (e) {
        dragging = true;
        if (axis.setPointerCapture) axis.setPointerCapture(e.pointerId);
        axis.classList.add('is-drag');
        seek(fromEvent(e));
        if (SE.cursor) SE.cursor.grab(true);
      });
      b.on(axis, 'pointermove', function (e) {
        if (dragging) { seek(fromEvent(e)); return; }
        if (!env.fine) return;
        var r = wave.getBoundingClientRect();
        var f = M.clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1);
        ghost.style.transform = 'translate3d(' + (f * r.width).toFixed(1) + 'px,0,0)';
        ghost.setAttribute('data-t', tc(f * BIO.duration));
      });
      b.on(axis, 'pointerenter', function () { if (env.fine) axis.classList.add('is-hover'); });
      b.on(axis, 'pointerleave', function () { axis.classList.remove('is-hover'); });
      b.on(axis, 'pointerup', function () {
        dragging = false;
        axis.classList.remove('is-drag');
        if (SE.cursor) SE.cursor.grab(false);
      });
      b.on(axis, 'pointercancel', function () { dragging = false; axis.classList.remove('is-drag'); });

      /* WCAG 2.2 dragging-movements: everything the drag can do, the keyboard
         can do, and the step sizes are chosen so a reader can land inside any
         exchange without counting. */
      b.on(axis, 'keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowLeft') { seek(target - 5); e.preventDefault(); }
        else if (k === 'ArrowRight') { seek(target + 5); e.preventDefault(); }
        else if (k === 'ArrowUp' || k === 'PageUp') { seek(X[Math.max(0, indexAt(target) - 1)].at + 1, true); e.preventDefault(); }
        else if (k === 'ArrowDown' || k === 'PageDown') { seek(X[Math.min(N - 1, indexAt(target) + 1)].at + 1, true); e.preventDefault(); }
        else if (k === 'Home') { seek(0, true); e.preventDefault(); }
        else if (k === 'End') { seek(BIO.duration, true); e.preventDefault(); }
      });

      buttons.forEach(function (btn) {
        b.on(btn, 'click', function () { seek(X[+btn.getAttribute('data-go')].at + 1, true); });
      });

      /* ------------------------------------------------------------ draw */
      var marks = X.map(function (x) { return x.at / BIO.duration; });

      function render() {
        cv.clear();
        var w = cv.w, h = cv.h;
        if (w < 8 || h < 8) return;

        var padX = env.mobile ? 10 : 22;
        var iw = w - padX * 2;
        var base = h - (env.mobile ? 12 : 20);
        var amp = base - (env.mobile ? 6 : 12);
        var f = time / BIO.duration;
        /* Fewer columns on a phone: the envelope still reads and the fill
           count drops by roughly a third. */
        var cols = Math.max(40, Math.floor(iw / (env.mobile ? 3.6 : 2.4)));
        var i, cf, a, x;

        cvx.fillStyle = 'rgba(236,236,239,0.13)';
        for (i = 0; i < cols; i++) {
          cf = i / (cols - 1);
          if (cf <= f) continue;
          a = PRE.speech[Math.floor(cf * (PRE.speech.length - 1))] * amp;
          cvx.fillRect(padX + cf * iw, base - a * 0.5, 1.2, a * 0.5);
        }
        cvx.fillStyle = SE.rgba(HUE.interview, 0.92);
        for (i = 0; i < cols; i++) {
          cf = i / (cols - 1);
          if (cf > f) break;
          a = PRE.speech[Math.floor(cf * (PRE.speech.length - 1))] * amp;
          cvx.fillRect(padX + cf * iw, base - a, 1.2, a);
        }

        cvx.strokeStyle = 'rgba(236,236,239,0.10)';
        cvx.lineWidth = 1;
        cvx.beginPath();
        cvx.moveTo(padX, Math.round(base) + 0.5);
        cvx.lineTo(w - padX, Math.round(base) + 0.5);
        cvx.stroke();

        cvx.font = '500 9px "JetBrains Mono", ui-monospace, monospace';
        cvx.textBaseline = 'top';
        for (i = 0; i < marks.length; i++) {
          x = Math.round(padX + marks[i] * iw) + 0.5;
          var lit = i === active;
          cvx.strokeStyle = lit ? SE.rgba(HUE.interview, 0.8) : 'rgba(236,236,239,0.18)';
          cvx.beginPath();
          cvx.moveTo(x, base + 1);
          cvx.lineTo(x, base + (lit ? 8 : 5));
          cvx.stroke();
          if (!env.mobile && (lit || i % 2 === 0)) {
            cvx.fillStyle = lit ? SE.rgba(HUE.interview, 0.95) : 'rgba(236,236,239,0.26)';
            cvx.textAlign = i === marks.length - 1 ? 'right' : 'left';
            cvx.fillText(X[i].tc, i === marks.length - 1 ? x - 2 : x + 3, base + 9);
          }
        }

        x = Math.round(padX + f * iw) + 0.5;
        cvx.strokeStyle = 'rgba(255,255,255,0.62)';
        cvx.beginPath();
        cvx.moveTo(x, 2);
        cvx.lineTo(x, base + 10);
        cvx.stroke();
        cvx.fillStyle = '#fff';
        cvx.fillRect(x - 3, 2, 6, 3);
      }

      cv.observe(render);

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        /* Damping gives the playhead mass, so a flicked drag arrives rather
           than teleports. Reduced motion sets time = target on seek, which
           makes the damp a no-op. */
        time = env.reduced ? target : M.damp(time, target, 9, dt);
        setActive(indexAt(time));
        render();
      }
      /* Reduced motion does not subscribe at all. The shared ticker stops
         when its subscriber list empties, so a function that merely returns
         on its first line still keeps a rAF alive for the whole session. */
      if (env.reduced) {
        seek(0, true);
        setActive(0);
        render();
      } else {
        b.tick(tick);
        seek(0, true);
        setActive(0);
      }

      return {
        destroy: function () {
          b.all();
          root.classList.remove('about', 'about-transcript');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'An eighteen minute interview scrubbed on a speech axis, one exchange resolved at a time.',
      philosophy: [
        'A scrolling transcript is a document; a scrubbed one is a recording. The reader handles time instead of handling text, and that single change is what makes the interview feel like it happened.',
        'Only one exchange is legible at a time. Nine visible answers is a FAQ page, and a FAQ page is what this concept exists to refuse.',
        'The axis is the only chrome. No avatar, no play button, no fake audio element: there is no audio file, and pretending there is would be a lie the interface tells for decoration.',
        'The numbers are the material. Timecodes, the 18:42 runtime and the 01 / 09 position are set in JetBrains Mono with tabular figures; every word the interviewee says is set in the display face.'
      ],
      hierarchy: [
        '1. The answer. It is the largest block of continuous text on screen at clamp(1rem, 1.1vw, 1.1875rem) / 1.62 and it owns the optical centre.',
        '2. The question above it at clamp(1.5rem, 3vw, 2.375rem), weight 500, tracking -0.035em, in the accent hue, so the two voices are never confused.',
        '3. The axis at the bottom edge: 132px tall on desktop, the only thing on the page that responds continuously to input.',
        '4. The index column at 15rem: nine timecodes with their questions, resting at var(--ink-3), the active one at full ink with a 2px accent rule on its left edge.',
        '5. The page title, read once and then ignored. It sets the frame; it is not competing with the transcript.'
      ],
      structure: [
        'Root: `position: absolute; inset: 0`, `display: grid`, `grid-template-rows: auto minmax(0, 1fr) auto`, `overflow: hidden`.',
        'Row 1 header: h2 + lede at 68ch + runtime as a mono figure pinned to the right of the grid.',
        'Row 2 body: `grid-template-columns: 15rem minmax(0, 1fr)`, gap `clamp(1.5rem, 3vw, 3.5rem)`. Left is nav > ol of nine buttons, right is an article with `aria-live="polite"`.',
        'Row 3 axis: a `role="slider"` div with `tabindex="0"` wrapping a single canvas plus a 1px hover ghost rule.',
        'The answer element caps at 68ch and its words are individual spans carrying `--i`.'
      ],
      interaction: [
        'One scalar of state: `targetSeconds` in 0..1122. Everything else is derived from it.',
        'Pointer drag on the axis maps clientX to seconds linearly across the padded track width. `setPointerCapture` on pointerdown so a drag that leaves the axis keeps working.',
        'ArrowLeft and ArrowRight step 5 seconds. ArrowUp / ArrowDown and PageUp / PageDown jump to the previous or next exchange start plus 1 second. Home and End go to 0 and 1122.',
        'Clicking any of the nine index buttons seeks to that exchange start plus 1 second and snaps without damping, because a click is a decision and should not be interpolated.',
        'The active exchange is the last one whose `at` is at or below the drawn time. No hysteresis: the boundary is the boundary.',
        'The drawn time damps toward the target at lambda 9. Keyboard and index seeks bypass the damping; only the drag is smoothed.'
      ],
      choreography: [
        { n: 'Exchange swap', d: 'On active change the pane class `is-in` is removed, one forced reflow read is taken, and the class is re-added. Question words: opacity 0 to 1 and translate3d(0, 0.42em, 0) to 0, 300ms, cubic-bezier(0.23, 1, 0.32, 1), delay calc(var(--i) * 16ms) capped at 260ms. Answer words: the same, 420ms and calc(var(--i) * 9ms) capped at 380ms, so the question lands as a phrase and the answer arrives as speech.' },
        { n: 'Why transitions and not keyframes', d: 'A fast scrub crosses three boundaries in half a second. Transitions retarget from the current computed value; keyframes restart every word from opacity 0 and produce a visible flicker. This is the single most important implementation choice in the concept.' },
        { n: 'Playhead', d: 'Drawn time damps toward target with damp(current, target, 9, dt). At lambda 9 the head settles in roughly 330ms and reads as a weighted transport control rather than a cursor.' },
        { n: 'Index active rule', d: 'The 2px left rule scales from scaleY(0) to scaleY(1) with transform-origin: top, 260ms, cubic-bezier(0.23, 1, 0.32, 1). Transform only; the row does not reflow.' },
        { n: 'Axis grab', d: 'On pointerdown the axis background steps from rgba(255,255,255,0.02) to 0.045 over 140ms. That is the whole affordance; a grab cursor plus a scale would be two signals for one event.' },
        { n: 'Entry', d: 'Header, index and axis fade in over 520ms with a 60ms stagger, cubic-bezier(0.23, 1, 0.32, 1). The first exchange is already resolved at t=0; nothing about the concept requires the reader to wait.' }
      ],
      scroll: [
        'A page-level takeover with no page scroll. The stage clips and the concept fills it.',
        'If the viewport is shorter than 620px the index column collapses to a horizontal scroll-snap strip so the pane keeps its height.',
        'The answer never scrolls internally on desktop. If an answer would overflow, reduce the answer type step; do not introduce a scrollbar inside a nine-item interface.',
        'No window scroll listener anywhere in this concept.'
      ],
      hover: [
        'Gated behind `@media (hover: hover) and (pointer: fine)`.',
        'Index rows lift their timecode from var(--ink-3) to var(--ink-2) and their question to full ink over 180ms. No translate: a nine-row list that shifts on hover reads as unstable.',
        'Hovering the axis shows a 1px ghost rule at the pointer position at rgba(236,236,239,0.16) with a timecode label above it. It previews the seek without performing it, and it is a transform on one absolutely positioned span, not a canvas redraw.',
        'The cursor reticle takes the label "Scrub" over the axis only.'
      ],
      click: [
        'Click anywhere on the axis seeks there and begins a drag in the same gesture.',
        'Index buttons seek and snap. They are real buttons with aria-current and an aria-label carrying the full question.',
        'There is no play, no pause and no autoplay. Time only moves when the reader moves it, which is the honest model for a transcript with no recording behind it.'
      ],
      responsive: {
        desktop: 'Three rows. Index at 15rem on the left, pane at 68ch, axis 132px tall with timecode labels under every second mark.',
        tablet: 'Index narrows to 11rem and drops the question text, keeping the timecode only. Axis 108px. Pane measure falls to 66ch.',
        mobile: 'Below 768px the composition inverts. The axis moves directly under the header at 84px tall with no timecode labels; the index becomes a horizontal scroll-snap row of 44px timecode chips; the pane takes the remaining height with the question at 1.375rem and the answer at 1rem / 1.62. Canvas column count drops by a third and DPR caps at 1.75. The drag still works, but the chips are the primary control, because dragging a 320px axis across eighteen minutes is six seconds per pixel.'
      },
      a11y: [
        'The axis is a role="slider" with aria-valuemin 0, aria-valuemax 1122, aria-valuenow, and an aria-valuetext reading "07:40, And something you were wrong about?" on every seek.',
        'Every drag action has a keyboard equivalent, per WCAG 2.2 dragging-movements: arrows for fine seeking, up and down for exchange jumps, Home and End for the ends.',
        'The canvas is mirrored through a visually-hidden focusable list of all nine exchanges with the full question and answer as text, so the concept is completely readable with the canvas ignored.',
        'The pane is aria-live="polite" and announces the newly resolved exchange once, not once per word.',
        'Under prefers-reduced-motion: reduce the playhead does not damp, the per-word transitions collapse to a single 160ms opacity fade on the pane, and no word translates. The full text is present in the DOM at all times regardless.',
        'Contrast: answer text at var(--ink) on var(--void) is 14.4:1; the question hue #5FA8D3 on the same ground is 7.1:1.'
      ],
      perf: [
        'Per frame: one damp, one integer comparison for the active index, and one canvas repaint of roughly 2 x cols fillRect calls plus nine ticks. At 1440px that is about 520 axis-aligned unstroked rectangles.',
        'The speech envelope is precomputed once at module load as a 1122-entry array. It is never regenerated and never allocated per frame.',
        'The word spans are built only when the active exchange changes, at most nine times, replacing about 45 nodes each time.',
        'One forced reflow read per exchange change, which is nine reads over the life of the concept.',
        'Canvas DPR comes from the shared env value, capped at 1.75 on mobile. The hover ghost is a transform on a span, never a canvas repaint.'
      ],
      packages: [
        { p: 'none required', w: 'One canvas, one damped scalar and CSS transitions. No animation library is involved anywhere in this concept.' },
        { p: 'gsap (installed)', w: 'Only for the entry stagger of the three rows. The scrub itself must not go through a tween engine; it is driven directly by pointer position.' },
        { p: 'no wavesurfer.js', w: 'There is no audio file. A waveform library would download a decoder to draw an array we generated ourselves.' }
      ],
      architecture: [
        { f: 'components/sections/AboutTranscript.tsx', r: 'Server Component. Renders the header, the nine index buttons and the first exchange as real HTML so the whole interview is crawlable and readable before hydration.' },
        { f: 'components/about/TranscriptAxis.tsx', r: '"use client". The canvas, the pointer and key handling, and the damped playhead. Roughly 180 lines.' },
        { f: 'components/about/ExchangePane.tsx', r: '"use client". Receives the active index and renders the word spans. Memoised on the index so a playhead move does not re-render it.' },
        { f: 'lib/about/interview.ts', r: 'The nine exchanges, the 1122 second duration and the seeded speech envelope generator. Pure, importable from the server component.' }
      ],
      state: [
        'activeIndex is the only value in useState. It changes at most nine times.',
        'targetSeconds and drawnSeconds live in refs and are written by the rAF loop. Putting either in state re-renders the tree sixty times a second on a drag.',
        'The canvas element, the DPR and the measured track width are refs.',
        'Cancel the animation frame and release pointer capture on unmount.'
      ],
      typography: [
        'Question: display face, weight 500, clamp(1.5rem, 3vw, 2.375rem), tracking -0.035em, line-height 1.06, in the accent hue.',
        'Answer: display face, weight 400, clamp(1rem, 1.1vw, 1.1875rem), line-height 1.62, colour var(--ink), measure capped at 68ch.',
        'Timecodes, runtime and the 01 / 09 position: JetBrains Mono 500 at 0.6875rem, tracking 0.18em, uppercase, tabular figures.',
        'Index questions are the display face at 0.8125rem, clamped to two lines. They are prose, so they are not mono.',
        'Mono never carries a sentence anywhere in this concept. It carries time and position only.'
      ],
      color: [
        'Ground var(--void) #08080a. Surfaces are the ground plus a 1px var(--line) hairline; there are no filled panels.',
        'Signature hue #5FA8D3 appears in exactly four places: the question, the played portion of the envelope, the active index rule, and the active exchange mark.',
        'The playhead is the only pure white on the page, which is what makes it read as the live element rather than as another line.',
        'The unplayed envelope is rgba(236,236,239,0.13), deliberately below the contrast floor because it is decoration; every value it encodes is also present as text.',
        'Light theme: ground #FAFAF8, the envelope hue darkens to #2F7DA8 for 4.5:1 on the question, and the playhead becomes the ink colour, since white on white is invisible.'
      ],
      spacing: [
        'Header padding clamp(1.5rem, 3.4vw, 3.25rem), with the runtime figure on the same baseline as the h2 cap height.',
        'Body gap clamp(1.5rem, 3vw, 3.5rem) between index and pane. Index rows are 0.6875rem vertical with a 1px hairline between them and no boxes.',
        'The question sits 1.5rem above the answer and 2.5rem below the cue line. More space above a heading than below it, throughout.',
        'The axis has 22px horizontal padding on desktop and 10px on mobile, so the playhead at 00:00 and at 18:42 is never clipped by the edge.',
        'The hint strip needs 3.25rem of bottom clearance; the axis row reserves it.'
      ],
      relationships: [
        'Horizontal position IS time. Nothing else on the page encodes it, and the mapping is linear with no easing, so a gap between two marks is a real silence of that length.',
        'Envelope height encodes speech density, which is why the answer stretches are taller than the question marks. It is a model of a recording and the caption says so.',
        'The accent hue encodes the interviewee. The interviewer is never given a colour, because they are a device and not a subject.',
        'The index is the same nine facts in the other dimension: all of them at once, none of them resolved. Together the two views are the whole interview.'
      ],
      acceptance: [
        'Dragging the axis end to end moves through all nine exchanges with no dropped frames on a mid-tier laptop.',
        'Scrubbing quickly across three boundaries never shows a word at opacity 0 flickering back in.',
        'Tab reaches the axis, and arrows, Home, End, PageUp and PageDown all move the playhead with the position announced.',
        'With the canvas removed from the page, every question and answer is still readable as text.',
        'On a 375px screen the timecode chips are the primary control and there is no horizontal page overflow.',
        'With reduced motion set the playhead jumps, the words do not translate, and the interview is fully readable.'
      ]
    }
  });

  /* ==========================================================================
     PAGE 02  -  PORTRAIT
     --------------------------------------------------------------------------
     A portrait with no photograph in it. The figure is a signed distance field
     of four smooth-minimum ellipses, turned into a height map, differentiated
     into normals, and printed through one of three screens: a dot halftone, a
     ridgeline relief, or a raster of scanlines. A key light you move with the
     pointer is the only thing that changes per frame.

     WHY PROCEDURAL AND NOT A PHOTOGRAPH
     -----------------------------------
     A stock photograph of somebody who is not Miftaul is a lie, and a real
     headshot is a 300kb network request that resizes badly, cannot be lit, and
     dates the page the day the haircut changes. A drawing that is honest about
     being a drawing costs zero bytes, is resolution independent, and can be
     handed to the reader as something to operate.

     WHY THE DOTS ARE BATCHED BY RADIUS
     ----------------------------------
     A halftone is roughly two thousand dots at this size. Two thousand
     individual fills is a frame budget spent on state changes rather than on
     pixels. Radius is quantised into six steps and each step is submitted as
     one path, so the whole screen is six fills. That is also what a real
     halftone is: a fixed ink, a varying dot.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'about-page-portrait',
    num: 2,
    name: 'Portrait',
    kind: 'Canvas / signed distance field',
    accent: HUE.figure,
    tagline: 'A likeness printed, not photographed',
    desc: 'A figure built from a distance field, lit by a key light you steer, and printed through a dot, ridge or raster screen. ' +
          'The name is set in two layers so the type passes behind the head and in front of the shoulder.',
    interaction: 'Move to steer the key light. Press 1, 2 or 3, or use the three screen buttons, to change how the figure is printed.',
    hint: 'Move to light &middot; 1 / 2 / 3 change the screen',

    /* Miniature: the coarse silhouette from PRE.face, relit by a light that
       swings on a slow sine. About thirty eight operations a frame, and the
       cell list is precomputed at load. */
    preview: function (ctx, w, h, t, heat) {
      var cells = PRE.face;
      var side = Math.min(w, h) * 0.82;
      var bx = (w - side * 0.72) / 2;
      var by = (h - side) / 2;
      var lx = Math.cos(t * 0.5) * 0.8;
      var ly = -0.45;
      var i, c, lum, r;

      /* Two radius buckets, two paths. The card version of the same batching
         the full concept uses. */
      for (var band = 0; band < 2; band++) {
        ctx.beginPath();
        for (i = 0; i < cells.length; i++) {
          c = cells[i];
          lum = SE.math.clamp(0.18 + c.h * 0.7 + (c.u - 0.5) * lx * 0.9 - ly * 0.2, 0, 1);
          if ((lum > 0.5 ? 1 : 0) !== band) continue;
          r = (0.7 + lum * 2.2) * (side / 90);
          ctx.moveTo(bx + c.u * side * 0.72 + r, by + c.v * side);
          ctx.arc(bx + c.u * side * 0.72, by + c.v * side, r, 0, TAU);
        }
        ctx.fillStyle = band
          ? 'rgba(236,236,239,' + (0.72 + heat * 0.2).toFixed(3) + ')'
          : 'rgba(142,154,166,' + (0.32 + heat * 0.16).toFixed(3) + ')';
        ctx.fill();
      }

      /* The two type layers, reduced to two rules that cross the figure. */
      box(ctx, w * 0.06, h * 0.30, w * 0.88, 2, 'rgba(236,236,239,0.16)');
      box(ctx, w * 0.06, h * 0.68, w * 0.88, 2, 'rgba(236,236,239,0.40)');
    },

    mount: function (root) {
      var env = SE.env, M = SE.math;
      var b = bag();

      root.classList.add('about', 'about-portrait');
      tint(root, HUE.figure);

      var SCREENS = [
        { id: 'dot',    label: 'Dot',    note: '7px halftone, six radius steps' },
        { id: 'ridge',  label: 'Ridge',  note: 'Height plotted as displaced rules' },
        { id: 'raster', label: 'Raster', note: 'One scanline per row, luminance as weight' }
      ];

      /* ------------------------------------------------------------- DOM */
      var stage = SE.el('div', 'about-portrait__stage');

      var back = SE.el('div', 'about-portrait__type about-portrait__type--back');
      back.setAttribute('aria-hidden', 'true');
      back.textContent = 'MIFTAUL';
      stage.appendChild(back);

      var canvasEl = SE.el('canvas', 'about-portrait__canvas');
      stage.appendChild(canvasEl);

      var front = SE.el('div', 'about-portrait__type about-portrait__type--front');
      front.setAttribute('aria-hidden', 'true');
      front.textContent = 'ISLAM';
      stage.appendChild(front);

      /* The two display layers above are aria-hidden, because a screen reader
         should hear the name once and not as two fragments. This is the real
         heading. It is visually hidden while the display type carries the
         name, and it becomes the visible name below 768px where the interlock
         is abandoned, so it is a sibling of the copy rather than inside it. */
      var nameEl = SE.el('h2', 'about-portrait__name', BIO.name);
      root.appendChild(nameEl);
      /* The stage is appended after the heading on purpose. Desktop positions
         every one of these absolutely, so DOM order costs nothing there; below
         768px it is plain block flow and this IS the reading order. Ordering
         with flex `order` instead would need every child pinned with
         `flex: none` to stop the column crushing them. */
      root.appendChild(stage);

      var copy = SE.el('div', 'about-portrait__copy');
      copy.innerHTML =
        '<p class="about-portrait__thesis">' + BIO.thesis + '</p>' +
        '<p class="about-portrait__note">' + BIO.standfirst + '</p>';
      root.appendChild(copy);

      /* The facts are a sibling of the copy, not a child of it: they are
         positioned against the stage corner, and nesting them would make the
         copy block their containing block. */
      var facts = SE.el('dl', 'about-portrait__facts');
      facts.innerHTML = BIO.facts.map(function (f) {
        return '<div><dt>' + f.k + '</dt><dd class="t-num">' + f.v + '</dd></div>';
      }).join('');
      root.appendChild(facts);

      var caption = SE.el('p', 'about-portrait__caption');
      caption.innerHTML =
        'No photograph is loaded. The figure is a signed distance field of four ellipses, ' +
        'joined with a polynomial smooth minimum, lit from a single key light and printed ' +
        'through a <span data-screen></span> screen.';
      root.appendChild(caption);

      var bar = SE.el('div', 'about-portrait__screens');
      bar.setAttribute('role', 'radiogroup');
      bar.setAttribute('aria-label', 'Printing screen');
      bar.innerHTML = SCREENS.map(function (s, i) {
        return '<button type="button" role="radio" data-s="' + i + '" aria-checked="' + (i === 0) + '">' +
               '<i class="t-num">' + (i + 1) + '</i><b>' + s.label + '</b></button>';
      }).join('');
      root.appendChild(bar);

      root.appendChild(SE.hintStrip(
        '<span>Move to light the figure</span><span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> screen</span>'
      ));

      root.appendChild(SE.srList('Portrait: a procedurally drawn figure and the facts beside it',
        srItems(BIO.facts.concat(SCREENS.map(function (s) {
          return { k: 'Screen: ' + s.label, v: s.note };
        })), function (f) {
          return { name: f.k, categoryLabel: 'about', role: f.v, note: '' };
        }), function () {}));

      /* ----------------------------------------------------------- state */
      var cv = b.cv(SE.canvas(canvasEl));
      var cvx = cv.ctx;
      var field = null;
      var mode = 0;
      /* Light direction in the figure's own space. lz is fixed: a key light
         that can swing behind the subject produces a black frame, which is
         accurate and useless. */
      var lx = -0.42, ly = -0.52, lz = 0.74;
      var tlx = lx, tly = ly;
      var drift = 0;
      var dirty = true;
      var step = 0;

      var RADII = 6;   /* radius steps in the halftone; six is a printer's screen */

      /* The figure is a central column, not a full-bleed plate: the four
         corners of the stage carry the caption, the switcher, the copy and the
         facts, and a figure that grows into them turns a composition into a
         collision. 46% of the width is the widest the shoulders can be and
         still leave a real column on each side. */
      function build() {
        step = env.mobile ? 11 : 7;
        var side = Math.min(cv.w * (env.mobile ? 0.82 : 0.52), cv.h * 1.0);
        field = figureField(cv.w, cv.h, step, {
          side: side,
          bx: (cv.w - side) / 2,
          by: (cv.h - side) * (env.mobile ? 0.5 : 0.40)
        });
        dirty = true;
      }
      cv.observe(function () { build(); if (env.reduced) render(); });
      build();

      function setMode(i) {
        mode = i;
        SE.$$('button', bar).forEach(function (btn, k) {
          btn.setAttribute('aria-checked', k === i ? 'true' : 'false');
        });
        SE.$('[data-screen]', caption).textContent = SCREENS[i].label.toLowerCase();
        root.setAttribute('data-screen', SCREENS[i].id);
        dirty = true;
        if (env.reduced) render();
      }

      SE.$$('button', bar).forEach(function (btn) {
        b.on(btn, 'click', function () { setMode(+btn.getAttribute('data-s')); });
      });

      b.on(document, 'keydown', function (e) {
        if (e.key === '1') setMode(0);
        else if (e.key === '2') setMode(1);
        else if (e.key === '3') setMode(2);
      });

      /* ------------------------------------------------------------ draw */
      function render() {
        cv.clear();
        if (!field) return;
        var f = field, cols = f.cols, rows = f.rows, s = f.step;
        var i, j, k, px, py, lum;

        if (mode === 0) {
          /* HALFTONE. Radius encodes luminance, ink stays constant, and an
             ordered-dither threshold decides whether the dot is printed at
             all, which is what stops the shadow side turning into a flat
             grey wash. */
          for (var band = 0; band < RADII; band++) {
            var lo = band / RADII, hi = (band + 1) / RADII;
            var r = (0.18 + (band + 0.5) / RADII * 0.82) * s * 0.46;
            cvx.beginPath();
            for (j = 0; j < rows; j++) {
              py = j * s;
              var fall = figureFall(f, py);
              for (i = 0; i < cols; i++) {
                k = j * cols + i;
                if (f.nz[k] <= 0) continue;
                lum = figureLum(f, k, lx, ly, lz) * fall;
                if (lum < lo || lum >= hi) continue;
                /* The dither threshold is what stops the shadow side flooding
                   into an even grey. Dropped dots ARE the shadow, exactly as
                   they are in a newspaper halftone. */
                if (lum < bayerAt(i, j) * 0.55) continue;
                px = i * s + (j % 2 ? s * 0.5 : 0);
                cvx.moveTo(px + r, py);
                cvx.arc(px, py, r, 0, TAU);
              }
            }
            cvx.fillStyle = 'rgba(236,236,239,' + (0.26 + (band / (RADII - 1)) * 0.60).toFixed(3) + ')';
            cvx.fill();
          }
        } else if (mode === 1) {
          /* RELIEF. One polyline per row, displaced upward by the lit height.
             Rows read as contours because the displacement is the surface, not
             a decoration applied to it. */
          cvx.lineWidth = 1;
          cvx.lineJoin = 'round';
          for (j = 0; j < rows; j += 2) {
            py = j * s;
            var rfall = figureFall(f, py);
            var open = false;
            cvx.beginPath();
            for (i = 0; i < cols; i++) {
              k = j * cols + i;
              px = i * s;
              if (f.hgt[k] <= 0) {
                if (open) { cvx.lineTo(px, py); open = false; }
                continue;
              }
              lum = figureLum(f, k, lx, ly, lz) * rfall;
              var yy = py - f.hgt[k] * lum * s * 4.2;
              if (!open) { cvx.moveTo(px, py); open = true; }
              cvx.lineTo(px, yy);
            }
            cvx.strokeStyle = 'rgba(236,236,239,' + (0.16 + (j / rows) * 0.46).toFixed(3) + ')';
            cvx.stroke();
          }
        } else {
          /* RASTER. Luminance becomes the weight of a scanline segment, which
             is how a laser printer would actually render this and reads much
             harder-edged than the halftone. */
          for (j = 0; j < rows; j++) {
            py = j * s;
            var sfall = figureFall(f, py);
            for (i = 0; i < cols; i++) {
              k = j * cols + i;
              if (f.nz[k] <= 0) continue;
              lum = figureLum(f, k, lx, ly, lz) * sfall;
              var th = Math.max(0.6, lum * s * 0.72);
              cvx.fillStyle = 'rgba(236,236,239,' + (0.10 + lum * 0.72).toFixed(3) + ')';
              cvx.fillRect(i * s, py - th * 0.5, s + 0.6, th);
            }
          }
        }
      }

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        if (env.reduced) {
          /* A deliberately arranged still: three quarters light from the upper
             left, which is where a key light belongs, and no idle motion. */
          tlx = -0.42; tly = -0.52;
        } else if (env.fine) {
          /* Until the pointer has been anywhere, the portrait is a still with
             a key light three quarters from the upper left. A page that starts
             mid-orbit tells the reader the light is decoration; a page that
             starts arranged and then follows tells them it is a control. */
          if (SE.pointer.active) {
            tlx = M.clamp(SE.pointer.dnx * 0.85, -0.92, 0.92);
            tly = M.clamp(-0.15 + SE.pointer.dny * 0.55, -0.92, 0.5);
          } else {
            tlx = -0.42; tly = -0.52;
          }
        } else {
          /* Touch has no hover, so the light takes a very slow orbit instead.
             0.13 rad/s is one revolution every forty eight seconds, which is
             below the threshold where motion competes with reading. */
          drift += dt * 0.13;
          tlx = Math.cos(drift) * 0.72;
          tly = -0.35 + Math.sin(drift) * 0.28;
        }

        var nlx = env.reduced ? tlx : M.damp(lx, tlx, 5, dt);
        var nly = env.reduced ? tly : M.damp(ly, tly, 5, dt);
        /* Repaint only when the light actually moved. A still pointer on a
           still page costs one comparison a frame instead of two thousand
           arcs. */
        if (Math.abs(nlx - lx) > 0.0008 || Math.abs(nly - ly) > 0.0008) dirty = true;
        lx = nlx; ly = nly;
        if (!dirty) return;
        dirty = false;
        render();
      }
      /* With motion off the light never changes, so there is nothing for a
         frame loop to do and it is not subscribed at all. */
      if (!env.reduced) b.tick(tick);

      setMode(0);
      render();

      return {
        destroy: function () {
          b.all();
          root.classList.remove('about', 'about-portrait');
          root.removeAttribute('data-screen');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A procedurally drawn portrait, lit by the pointer and printed through three different screens.',
      philosophy: [
        'There is no image file anywhere in this concept. The figure is generated: a signed distance field of four ellipses joined with a polynomial smooth minimum, pushed through a square root to give a dome rather than a flat cut-out, and differentiated into normals by finite differences.',
        'A stock photograph of somebody who is not the subject is a lie. A real headshot is a network request that resizes badly, cannot be lit, and dates the page. A drawing that is honest about being a drawing is better on every axis, and the caption says exactly what it is.',
        'The name is set across two z-layers with the figure between them, so the type passes behind the head and in front of the shoulder. Interlocking type and image is the whole composition; without it this is a picture with a caption.',
        'Three screens, not three filters. Dot, ridge and raster are three real ways of getting a continuous tone onto a surface that can only do one ink, and each one shows a different property of the same field.'
      ],
      hierarchy: [
        '1. The figure. It occupies min(width, height * 0.98) centred horizontally and bottom-aligned, and it is the first thing the eye lands on.',
        '2. The name, at clamp(4rem, 15vw, 13rem), weight 700, tracking -0.06em, split as MIFTAUL behind at 26% and ISLAM in front at 56%.',
        '3. The thesis line, "I optimise for the second year.", at clamp(1.25rem, 2.2vw, 1.75rem) in the accent hue.',
        '4. The four facts as a mono definition list, bottom right, tabular.',
        '5. The screen switcher: three small buttons carrying 1, 2, 3 and a name.',
        '6. The caption, at 0.75rem var(--ink-3). It is the disclosure, and disclosures do not compete.'
      ],
      structure: [
        'Root `position: absolute; inset: 0; overflow: hidden`, with `--pad` as the only inset token.',
        'A stage layer holds three children in painting order: the back type div (z 0), the canvas (z 1, transparent background), the front type div (z 2).',
        'The copy block sits at the top left: h2 name (visually hidden on desktop, where the display type carries it), thesis, standfirst at 68ch, and a dl of four facts.',
        'The screen switcher is a `role="radiogroup"` of three real radio buttons in the top right.',
        'Everything the canvas encodes is also present as text in a visually-hidden focusable list.'
      ],
      interaction: [
        'The pointer sets a light direction. `lightX = clamp(pointerNormX * 0.85, -0.92, 0.92)`, `lightY = clamp(-0.15 + pointerNormY * 0.55, -0.92, 0.5)`, `lightZ` fixed at 0.74. Z is fixed because a key light that can swing behind the subject produces a black frame, which is accurate and useless.',
        'The light damps toward the pointer at lambda 5, which is roughly a 200ms settle. Any faster and a mouse jitter becomes a strobe on two thousand dots.',
        'Keys 1, 2 and 3 switch screen. So do the three buttons, which are the discoverable version of the same thing.',
        'On touch, where there is no hover, the light takes a slow orbit at 0.13 rad/s, one revolution every 48 seconds. That is below the rate at which ambient motion competes with reading.',
        'A dirty flag gates the repaint: if the light moved less than 0.0008 on both axes and the screen did not change, the frame costs one comparison instead of two thousand arcs.'
      ],
      choreography: [
        { n: 'Light damp', d: 'damp(current, target, 5, dt) on both axes. Settles in about 200ms. Frame-rate independent, so a 120Hz display does not double the speed.' },
        { n: 'Screen change', d: 'The canvas is repainted immediately with no cross-fade. A cross-fade between two screens would need two offscreen buffers and would read as a filter transition rather than as a different press. The three type-layer positions shift 220ms cubic-bezier(0.23, 1, 0.32, 1) so the composition acknowledges the change without the figure dissolving.' },
        { n: 'Entry', d: 'Back type slides up 40px and fades over 700ms, canvas fades over 520ms at 120ms, front type slides up 24px over 700ms at 200ms. All cubic-bezier(0.23, 1, 0.32, 1). The three-layer stack assembles front to back, which is the one moment the interlock is explained.' },
        { n: 'Screen buttons', d: 'Checked state is a 1px border stepping from var(--line) to var(--c-line) plus the index numeral going to the accent hue, 180ms. No fill, no scale: three buttons that inflate on selection make a control panel out of a caption.' },
        { n: 'What must not animate', d: 'The dots themselves never tween. Each frame is a complete print of the current light. Interpolating dot radii between frames would smear the screen into a blur and destroy the one thing that makes it read as printed.' }
      ],
      scroll: [
        'A page-level takeover with no scroll on desktop. The canvas fills the stage.',
        'Below 768px the root becomes a single vertical scroller: figure at 52vh, then name, thesis, standfirst, facts, switcher.',
        'The canvas is unobserved and the ticker unsubscribed when the concept is destroyed. There is no IntersectionObserver because a page concept is either mounted or gone.'
      ],
      hover: [
        'The entire canvas is the hover surface, gated behind `@media (hover: hover) and (pointer: fine)`. There is no hover state on the figure itself; the light IS the hover state.',
        'Screen buttons lift from var(--ink-3) to var(--ink) over 180ms.',
        'The cursor reticle takes the label "Light".',
        'Fact rows do not respond to hover. They are data, and data that reacts to a passing pointer reads as interactive when it is not.'
      ],
      click: [
        'Clicking a screen button switches the screen. That is the only click target in the concept.',
        'Clicking the canvas does nothing on purpose. A canvas that changes state on click, with no affordance saying so, is a discoverability failure dressed as an easter egg.'
      ],
      responsive: {
        desktop: 'Figure at min(width, height * 0.98), bottom-aligned. Name at 13rem across two z-layers. Copy block bottom left at 68ch, facts bottom right, switcher top right. Field step 7px, roughly 2000 printed cells.',
        tablet: 'Name drops to 8rem and the front layer moves down 4vh so it still crosses the shoulder rather than the jaw. Copy block moves under the figure. Field step 9px.',
        mobile: 'Below 768px this is a different composition, not a smaller one. The root becomes a vertical scroller: the figure takes 52vh at the top with the name set as one line at 3rem above it and no interlock, because a 375px column cannot support type passing behind a head. Below the figure come the thesis, the standfirst at 100%, the facts as a two-column mono grid, and the switcher as a 44px-tall row. Field step rises to 11px, which is roughly 700 cells, and DPR caps at 1.75. The light orbits instead of tracking, because there is no pointer.'
      },
      a11y: [
        'The two display type layers are `aria-hidden="true"` and the name is repeated once in a real h2, so a screen reader hears "Miftaul Islam" and not "MIFTAUL ISLAM".',
        'The screen switcher is a real `role="radiogroup"` with three `role="radio"` buttons carrying aria-checked, reachable by Tab and operable by Space.',
        'The canvas is mirrored into a visually-hidden focusable list containing the four facts and a description of each of the three screens.',
        'The caption states in plain language that the figure is generated and how. A procedural portrait that lets the reader believe it is a photograph is dishonest even when it is beautiful.',
        'Under `prefers-reduced-motion: reduce` the light is fixed at (-0.42, -0.52, 0.74), three quarters from the upper left, the orbit does not run, and there is no entry animation. The portrait is a still, deliberately arranged, not a broken interactive.',
        'Ink values run from rgba(236,236,239,0.30) to 0.92 against #08080a. The lightest cells clear 4.5:1; the darkest are shadow and carry no information that is not also in the text.'
      ],
      perf: [
        'The field is built once per resize: cols x rows samples of the distance field plus one finite-difference pass for the normals. At 1440x720 with a 7px step that is roughly 26,000 samples, about 4ms, and it happens on resize only.',
        'Per frame the field is re-lit, never re-sampled. Lighting is a three-term dot product per live cell.',
        'The halftone batches its two thousand dots into six paths by radius step. Six fills instead of two thousand is the difference between 2ms and 14ms.',
        'A dirty flag skips the repaint entirely when the light has not moved by more than 0.0008 on either axis.',
        'Typed arrays (Float32Array) for height and the three normal components, allocated once. Nothing in the render path allocates.',
        'Mobile raises the step from 7px to 11px, which cuts the live cell count by roughly two thirds, and caps DPR at 1.75.'
      ],
      packages: [
        { p: 'none required', w: 'Canvas 2D and arithmetic. The distance field, the smooth minimum, the normals and the Bayer matrix are about sixty lines in total.' },
        { p: 'no three.js', w: 'This is a 2D print of a 2.5D height field. WebGL would give a real shader and cost 600kb to draw the same two thousand dots, plus a context that competes with every other concept in the gallery.' },
        { p: 'no image assets', w: 'Explicitly. The whole argument of the concept is that the portrait is generated.' }
      ],
      architecture: [
        { f: 'components/sections/AboutPortrait.tsx', r: 'Server Component. Renders the name, thesis, standfirst, facts and caption as real HTML. The page is complete and readable before any JavaScript runs.' },
        { f: 'components/about/FigureCanvas.tsx', r: '"use client". Owns the canvas, the field build, the light, and the three render paths.' },
        { f: 'lib/about/figure.ts', r: 'sdEllipse, smin, figureSD, buildField and lightCell. Pure functions with no DOM, unit-testable, roughly 70 lines.' },
        { f: 'lib/about/bayer.ts', r: 'The 4x4 ordered dither matrix and its lookup. Six lines, but it belongs on its own so nobody inlines a magic array.' }
      ],
      state: [
        'The screen index is the only value in useState. It changes when a person presses a button.',
        'The light vector, the field, the canvas context and the dirty flag are all refs. A light that lives in state re-renders the tree on every pointer move.',
        'The field is rebuilt in a ResizeObserver callback, not in an effect keyed on window size.',
        'Cancel the frame and disconnect the observer on unmount.'
      ],
      typography: [
        'Display name: Space Grotesk 700 at clamp(4rem, 15vw, 13rem), tracking -0.06em, line-height 0.78. At this size the default tracking opens up visibly, and -0.06em is what closes it.',
        'Thesis: display 400 at clamp(1.25rem, 2.2vw, 1.75rem), tracking -0.02em, in the accent hue.',
        'Standfirst: display 400 at 1rem / 1.62, var(--ink-2), capped at 68ch.',
        'Facts: keys in mono 500 at 0.625rem, tracking 0.2em, uppercase, var(--ink-4); values in mono 400 at 0.8125rem, var(--ink), tabular.',
        'Caption: display 400 at 0.75rem / 1.5, var(--ink-3), capped at 52ch. It is a footnote and is set like one.'
      ],
      color: [
        'The figure is printed in var(--ink) at alphas from 0.30 to 0.92. It is achromatic on purpose: a coloured portrait would make the accent decorative, and here the accent has a job.',
        'Signature hue #8E9AA6 appears only on the thesis line, the checked screen button numeral, and the 1px rule under the copy block. Three places.',
        'The ground is var(--void) and stays flat. No vignette, no radial wash: the light is in the drawing, so faking a second one in CSS would contradict it.',
        'The back type layer sits at rgba(236,236,239,0.09), the front at 0.86. That gap is what makes the figure read as being between them.',
        'Light theme: the ink inverts to #14141A at the same alpha ramp on a #FAFAF8 ground, and the back type rises to 0.14 because light grounds swallow low-alpha ink faster than dark ones do.'
      ],
      spacing: [
        'Root inset `clamp(1.125rem, 3.4vw, 3.25rem)`.',
        'The back type baseline sits at 34% of the stage height, the front at 72%. Those two numbers are the composition: the head must clear the first and the shoulder must cross the second.',
        'Copy block bottom left, 68ch wide, 2.5rem above the hint strip clearance.',
        'Facts: four rows on a 0.5rem vertical rhythm with a 1px hairline above the group, no boxes.',
        'Screen buttons: 2.25rem tall, 0.5rem apart, top right, 1px border and no fill.'
      ],
      relationships: [
        'Dot radius encodes surface luminance, which encodes the angle between the surface normal and the key light. Nothing is arbitrary; the picture is a readout of a lighting calculation.',
        'The ordered dither threshold is why the shadow side breaks into scattered dots instead of turning into flat grey. That break IS the shadow, in the same way a newspaper photograph shows one.',
        'Type layer order encodes depth. It is the only depth cue in the composition, which is why the figure has no drop shadow anywhere.',
        'The three screens encode three different things about the same field: dot shows luminance, ridge shows height, raster shows both at a lower resolution. Switching between them is the argument that a portrait is a choice of projection.'
      ],
      acceptance: [
        'Moving the pointer across the figure visibly moves the light, and the shadow side breaks into scattered dots rather than going flat grey.',
        'The name reads as one word passing behind the head and in front of the shoulder, not as two labels stacked on an image.',
        'Pressing 1, 2 and 3 changes the screen instantly with no dissolve.',
        'A screen reader hears the name once, the thesis, the standfirst, the four facts, and a description of each screen.',
        'Nothing in the network tab is an image.',
        'On a 375px screen the composition is a vertical document with the figure at 52vh, and the light orbits slowly rather than sitting dead.',
        'With reduced motion set the light is fixed upper left, nothing drifts, and the portrait still reads as deliberately lit.'
      ]
    }
  });

  /* ==========================================================================
     PAGE 03  -  MANIFESTO
     --------------------------------------------------------------------------
     A long typographic argument. Six paragraphs, one correction, one closing
     line. The reader scrolls; the paragraph crossing the reading line is at
     full ink and the rest recede. There is exactly one authored moment in the
     whole piece: the sentence that gets struck out and replaced.

     WHY ONE MOMENT AND NOT SEVEN
     ----------------------------
     If every paragraph performs, none of them is emphasis. The dimming is a
     gradient the reader stops noticing within two screens, which is correct;
     the strike is the single event, it happens once, and it is the thesis of
     the whole page. A manifesto with six set pieces is a slideshow.

     WHY ONE SCROLLTOP READ AND NOT SEVEN OBSERVERS
     ----------------------------------------------
     Emphasis here is continuous, not a threshold, so IntersectionObserver is
     the wrong instrument: it fires on crossings and says nothing in between.
     One scrollTop read per frame plus cached offsets is both cheaper and
     exactly the right shape for the data.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'about-page-manifesto',
    num: 3,
    name: 'Manifesto',
    kind: 'DOM / scroll-lit type',
    accent: HUE.argument,
    tagline: 'One argument, and the sentence it corrects',
    desc: 'Six paragraphs held at reading measure, lit one at a time as they cross the reading line. ' +
          'The single authored moment is a sentence struck through and replaced by the one that is actually true.',
    interaction: 'Scroll. The paragraph at the reading line is at full ink; the correction draws itself as you pass through it.',
    hint: 'Scroll to read &middot; One correction, at the middle',

    /* Miniature: a column of text rules with a travelling band of emphasis and
       one struck line. Thirty two operations. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.16;
      var iw = w - padX * 2;
      var n = 13;
      var gap = h * 0.062;
      var top = h * 0.14;
      var band = (0.10 + ((t * 0.10) % 1.2)) * h;
      var i, y, d, lit;

      for (i = 0; i < n; i++) {
        y = top + i * gap;
        d = Math.abs(y - band) / (h * 0.16);
        lit = Math.max(0.10, 1 - d * d);
        /* One line in the column is the correction. It carries a rule through
           it and a brighter replacement directly beneath. */
        if (i === 7) {
          box(ctx, padX, y, iw * 0.76, 1.5, 'rgba(236,236,239,' + (0.14 + lit * 0.22).toFixed(3) + ')');
          hair(ctx, padX, y + 0.75, padX + iw * 0.76 * Math.min(1, lit * 1.6), y + 0.75,
            'rgba(220,199,161,' + (0.5 + heat * 0.4).toFixed(3) + ')');
          continue;
        }
        box(ctx, padX, y, iw * (i === 8 ? 0.82 : 0.52 + (i % 4) * 0.13), 1.5,
          'rgba(236,236,239,' + (0.08 + lit * 0.70).toFixed(3) + ')');
      }

      /* The reading tick on the left margin. */
      box(ctx, padX - 8, band - 5, 2, 10, 'rgba(220,199,161,0.9)');
    },

    mount: function (root) {
      var env = SE.env, M = SE.math;
      var b = bag();

      root.classList.add('about', 'about-manifesto');
      tint(root, HUE.argument);

      /* ------------------------------------------------------------- DOM */
      var scroller = SE.el('div', 'about-manifesto__scroll about-scroll');
      var inner = SE.el('article', 'about-manifesto__inner');

      var html =
        '<header class="about-manifesto__head">' +
          '<h2 class="about__title">Month one was never the hard part</h2>' +
          '<p class="about__lede">Six paragraphs and one correction, on what a codebase actually costs.</p>' +
        '</header>';

      BIO.manifesto.forEach(function (blk, i) {
        if (blk.t === 'p') {
          html += '<p class="about-manifesto__p" data-lit="' + i + '">' + blk.s + '</p>';
        } else if (blk.t === 'turn') {
          html +=
            /* <s> so the correction survives as meaning and not only as a
               drawn line: a screen reader that ignores the rule still hears
               that this sentence was struck out. */
            '<div class="about-manifesto__turn" data-lit="' + i + '" data-turn>' +
              '<p class="about-manifesto__strike">' +
                '<s aria-label="Struck out: ' + blk.strike + '">' + blk.strike + '</s>' +
                '<i class="about-manifesto__rule" aria-hidden="true"></i></p>' +
              '<p class="about-manifesto__fixed">' + blk.fixed + '</p>' +
            '</div>';
        } else {
          html += '<p class="about-manifesto__end" data-lit="' + i + '">' + blk.s + '</p>';
        }
      });

      html += '<footer class="about-manifesto__foot"><span class="t-num">' + BIO.name.toUpperCase() +
              '</span><span class="t-num">SINCE 2019</span></footer>';

      inner.innerHTML = html;
      scroller.appendChild(inner);
      root.appendChild(scroller);

      /* The rail is a position readout, not a progress bar: a single tick that
         travels, with no filled track behind it. */
      var rail = SE.el('div', 'about-manifesto__rail');
      rail.setAttribute('aria-hidden', 'true');
      rail.innerHTML = '<i></i>';
      root.appendChild(rail);
      var tick = SE.$('i', rail);

      root.appendChild(SE.hintStrip('<span>Scroll to read</span><span>The correction is at the middle</span>'));

      /* ----------------------------------------------------------- state */
      var blocks = SE.$$('[data-lit]', inner).map(function (el) {
        return { el: el, top: 0, h: 0, lit: -1, turn: el.hasAttribute('data-turn') };
      });
      var turnEl = SE.$('[data-turn]', inner);
      var ruleEl = turnEl ? SE.$('.about-manifesto__rule', turnEl) : null;
      var fixedEl = turnEl ? SE.$('.about-manifesto__fixed', turnEl) : null;
      var railH = 0, innerH = 0, viewH = 0;
      var strike = -1;

      function measure() {
        viewH = scroller.clientHeight;
        innerH = inner.offsetHeight;
        railH = rail.clientHeight;
        blocks.forEach(function (bk) {
          bk.top = bk.el.offsetTop;
          bk.h = bk.el.offsetHeight;
          bk.lit = -1;                      /* force a rewrite after a reflow */
        });
      }

      var ro = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = b.obs(new ResizeObserver(measure));
        ro.observe(scroller);
        ro.observe(inner);
      } else {
        b.on(window, 'resize', measure);
      }
      measure();

      /* Reduced motion: everything at full ink, the correction already made.
         The argument is the content, and the content does not need the
         choreography to be complete. */
      if (env.reduced) {
        root.classList.add('is-static');
        if (ruleEl) ruleEl.style.transform = 'scaleX(1)';
        if (fixedEl) { fixedEl.style.opacity = '1'; fixedEl.style.transform = 'none'; }
      }

      /* ------------------------------------------------------------ tick */
      /* One scrollTop read a frame. Offsets are cached and only recomputed by
         the ResizeObserver, so nothing here forces a layout. */
      function frame() {
        if (env.reduced) return;
        var st = scroller.scrollTop;
        /* The reading line sits at 42% of the viewport rather than at the
           middle: text is read downward, so the line the eye is actually on
           is above centre. */
        var read = st + viewH * 0.42;
        var i, bk, centre, d, lit;

        for (i = 0; i < blocks.length; i++) {
          bk = blocks[i];
          centre = bk.top + bk.h * 0.5;
          /* Falloff measured in viewports, not pixels, so a long paragraph and
             a one-line closer dim at the same rate. */
          d = Math.abs(centre - read) / (viewH * 0.46);
          lit = M.clamp(1 - d * d, 0, 1);
          if (Math.abs(lit - bk.lit) < 0.006) continue;
          bk.lit = lit;
          bk.el.style.setProperty('--lit', lit.toFixed(3));
        }

        if (turnEl) {
          /* The one authored moment. Progress is the reading line's passage
             through the turn block: the rule draws over the first 55%, the
             replacement rises over the last 45%, so the strike completes
             before the correction arrives. Reading it in the other order
             would give away the answer before the question. */
          var p = M.clamp((read - turnEl.offsetTop + viewH * 0.16) /
                          (turnEl.offsetHeight + viewH * 0.30), 0, 1);
          if (Math.abs(p - strike) > 0.004) {
            strike = p;
            var draw = M.clamp(p / 0.55, 0, 1);
            var rise = M.clamp((p - 0.55) / 0.45, 0, 1);
            ruleEl.style.transform = 'scaleX(' + draw.toFixed(3) + ')';
            fixedEl.style.opacity = rise.toFixed(3);
            fixedEl.style.transform = 'translate3d(0,' + ((1 - rise) * 18).toFixed(1) + 'px,0)';
          }
        }

        var prog = innerH > viewH ? M.clamp(st / (innerH - viewH), 0, 1) : 0;
        tick.style.transform = 'translate3d(0,' + (prog * Math.max(0, railH - 34)).toFixed(1) + 'px,0)';
      }
      /* Nothing here is continuous with motion off: the argument is already
         fully lit and the correction already made, so the loop is never
         subscribed rather than being subscribed and returning immediately. */
      if (!env.reduced) { b.tick(frame); frame(); }

      return {
        destroy: function () {
          b.all();
          root.classList.remove('about', 'about-manifesto', 'is-static');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A long typographic argument lit one paragraph at a time, with a single sentence struck out and replaced.',
      philosophy: [
        'This is a piece of writing, not a section with writing in it. The type is the whole design: measure, leading, one weight, one hue, and nothing else on the page.',
        'Emphasis is a gradient, not a state. The paragraph at the reading line is at full ink and its neighbours recede continuously, which is closer to how attention actually works than a class flipping on at a threshold.',
        'There is exactly one authored moment: the sentence "Good code is code that is easy to write." is struck through and replaced by "Good code is code that is cheap to be wrong about." If every paragraph performed, none of them would be emphasis.',
        'Nothing here is decorated. No pull quotes, no dropped capitals, no rules between sections. Everything on the page is either the argument or the reader position.'
      ],
      hierarchy: [
        '1. The paragraph at the reading line. It is at full var(--ink); everything else is between 0.22 and 1.0 opacity.',
        '2. The correction, which is the only element with a second colour and the only element that draws.',
        '3. The closing line, set one step larger than the body at clamp(1.375rem, 2.4vw, 1.875rem), because it is the sentence the reader leaves with.',
        '4. The title, read once at the top and then scrolled past. It is not sticky; a sticky heading over a manifesto is a heading that does not trust the writing.',
        '5. The reading tick on the left margin at 2px by 34px. It is a position readout, not a progress bar, and it has no filled track.'
      ],
      structure: [
        'Root `position: absolute; inset: 0`, containing one scroller at `inset: 0; overflow-y: auto; overscroll-behavior: contain`.',
        'Inside the scroller, one article at `max-width: 34rem` centred, with `padding: 22vh 0 34vh` so the first and last paragraphs can both reach the reading line.',
        'Seven blocks: five paragraphs, one turn, one closer. The turn is a div containing a struck p (with a 1px rule child) and the replacement p.',
        'The reading tick is a sibling of the scroller, absolutely positioned on the left margin, so it does not scroll with the content.',
        'The footer is two mono labels on one hairline. It ends the piece rather than continuing it.'
      ],
      interaction: [
        'Scroll is the only input. There is no hijack, no snapping and no pinning: the reader sets the pace entirely.',
        'One `scrollTop` read per frame from the concept scroller. Never a window scroll listener.',
        'Per block: `distance = abs(blockCentre - readingLine) / (viewportHeight * 0.46)`, `lit = clamp(1 - distance^2, 0, 1)`. The square is what makes the falloff feel optical rather than linear.',
        'The reading line sits at 42% of the viewport height, not 50%. Text is read downward, so the line the eye is actually on is above centre.',
        'A write is skipped unless `lit` moved by more than 0.006, which cuts custom property writes to roughly one block per frame during a normal scroll.',
        'Turn progress: `p = clamp((readingLine - turnTop + viewH * 0.16) / (turnHeight + viewH * 0.30), 0, 1)`. The rule draws over `p` 0 to 0.55 and the replacement rises over 0.55 to 1.'
      ],
      choreography: [
        { n: 'Paragraph lighting', d: 'opacity: calc(0.22 + var(--lit) * 0.78), written as a custom property from the frame loop. No transition on the property: it is already continuous, and a transition on top of a scrub introduces lag between the scrollbar and the page.' },
        { n: 'The strike', d: 'A 1px rule at the accent hue, `transform: scaleX()` from `transform-origin: left`, driven directly by scroll progress 0 to 0.55. It is a pen crossing out a sentence, so it must draw left to right at the reader speed and never at its own.' },
        { n: 'The correction', d: 'The replacement line rises 18px and fades in over progress 0.55 to 1. It arrives only after the strike has finished, because reading it in the other order gives away the answer before the question.' },
        { n: 'Struck sentence after the strike', d: 'It stays on the page at 0.34 opacity for good. Removing it would destroy the point: the argument is that the first sentence is what most people believe, and it has to remain visible for the second to mean anything.' },
        { n: 'Reading tick', d: 'translate3d on the Y axis only, no transition, driven by `scrollTop / (contentHeight - viewportHeight)`. Transform on a 2px element is the cheapest continuous indicator there is.' },
        { n: 'What deliberately does not animate', d: 'Nothing enters. No paragraph fades up on first sight, no stagger, no reveal. This is a document; a document that assembles itself while you are trying to read it is a document that does not respect the reader.' }
      ],
      scroll: [
        'The concept owns its own scroller because the stage body clips. Everything is measured against that element, never against the window.',
        '`overscroll-behavior: contain` so reaching the end does not chain to the page behind the stage.',
        'Offsets are cached and recomputed only in a ResizeObserver callback. The frame loop reads `scrollTop` and nothing else, so it never forces a layout.',
        'Padding of 22vh at the top and 34vh at the bottom, so the first and last blocks can both reach the reading line and be fully lit.',
        'Under reduced motion the frame loop returns immediately and every block is left at full opacity, with the strike drawn and the correction present.'
      ],
      hover: [
        'None. There is no hover state anywhere in this concept, and that is a decision.',
        'Text that reacts to a passing pointer invites the reader to point at it, and pointing at prose is not reading it.',
        'The cursor stays the native text cursor over the whole article, because selecting and copying a sentence is a real thing a reader wants to do here.'
      ],
      click: [
        'None. Nothing in the concept is clickable except native text selection.',
        'A manifesto with a "read more" is not a manifesto.'
      ],
      responsive: {
        desktop: 'Article at 34rem centred, body at 1.25rem / 1.72, reading tick in the left margin at 4.5rem from the edge. Dimming floor 0.22.',
        tablet: 'Article at 30rem, body at 1.1875rem / 1.7, tick moves to 2rem from the edge.',
        mobile: 'Below 768px the dimming floor rises from 0.22 to 0.46, because a 375px column shows fewer paragraphs at once and heavy dimming on a phone reads as a rendering fault rather than as emphasis. Body drops to 1.0625rem / 1.68 with 1.25rem side padding, the reading tick is removed entirely (there is a native scrollbar and the margin no longer exists), and the turn block stacks with the strike above the correction at the same size instead of a size step.'
      },
      a11y: [
        'Every paragraph is real, ordered, selectable text at all times. The lighting only changes opacity, never `display`, `visibility` or `content`.',
        'The struck sentence is wrapped in `<s>` with an `aria-label` of "Struck out: Good code is code that is easy to write", so the correction survives as meaning and not only as a graphic.',
        'The opacity floor is 0.22 in the dark theme, which keeps a dimmed paragraph at roughly 3.4:1. That is deliberately below the body-text threshold for non-current paragraphs, so the lit one must be reachable: the reading line moves with the scroll and every paragraph reaches full ink. Anyone who prefers no dimming gets it via reduced motion.',
        'Under `prefers-reduced-motion: reduce`: every paragraph at full ink, the strike drawn, the correction visible, the loop unsubscribed. The complete argument, statically arranged.',
        'The reading tick is `aria-hidden` and duplicates nothing; the native scrollbar is the accessible position indicator.'
      ],
      perf: [
        'One `scrollTop` read per frame plus seven arithmetic comparisons. Offsets are cached.',
        'At most one or two custom property writes per frame, because a write is skipped unless `lit` moved by more than 0.006.',
        'Opacity and transform only. Nothing here paints text in a new colour per frame, which would cost a full text repaint of a 34rem column.',
        'No IntersectionObserver: emphasis is continuous, and an observer that fires on crossings says nothing between them.',
        'The frame loop returns on its first line under reduced motion. There is no idle cost.'
      ],
      packages: [
        { p: 'none required', w: 'One scroll read, seven custom properties and two transforms. Adding GSAP here would mean seven ScrollTriggers to compute a value that is one subtraction.' },
        { p: 'no lenis', w: 'This is a nested scroller inside a modal stage. Smooth-scrolling it fights the native scrollbar and the trackpad, and reading is the one activity where the reader should own the pace exactly.' },
        { p: 'no split-text plugin', w: 'Emphasis is per paragraph, not per word or character. Splitting the text would create about 900 spans to animate seven values.' }
      ],
      architecture: [
        { f: 'components/sections/AboutManifesto.tsx', r: 'Server Component. The full argument renders as plain semantic HTML: h2, six p, one figure for the turn, one footer. Fully readable and crawlable with JavaScript off.' },
        { f: 'components/about/ReadingLight.tsx', r: '"use client". A leaf that takes a ref to the article, caches block offsets in a ResizeObserver, and writes --lit in a rAF loop. About 60 lines and it renders no markup of its own.' },
        { f: 'lib/about/manifesto.ts', r: 'The seven blocks as a typed array. The turn is its own variant so the renderer cannot accidentally treat it as a paragraph.' }
      ],
      state: [
        'Nothing is in useState. There is no state in this concept: everything is a derived value written directly to the DOM.',
        'Block offsets, the cached `lit` per block, and the last strike progress are refs.',
        'That is the whole point of the ReadingLight leaf: it renders nothing, so it can never re-render.',
        'Cancel the frame and disconnect the observer on unmount.'
      ],
      typography: [
        'Body: Space Grotesk 400 at clamp(1.0625rem, 1.3vw, 1.25rem), line-height 1.72, measure 34rem which lands at roughly 68 characters in this face.',
        'Paragraph spacing 1.6em, which is larger than the leading, so paragraphs read as separate thoughts without a rule between them.',
        'The turn: struck line at the body size in var(--ink-3) with `<s>`; the replacement one step up at clamp(1.25rem, 2vw, 1.625rem), weight 500, tracking -0.03em, in the accent hue.',
        'The closer at clamp(1.375rem, 2.4vw, 1.875rem), line-height 1.3, tracking -0.03em.',
        'Mono appears exactly twice, in the footer, carrying the name and the year. Nowhere else in the piece.'
      ],
      color: [
        'One ink and one hue. var(--ink) at an opacity ramp from 0.22 to 1.0 for the argument; #DCC7A1 for the strike rule and the corrected sentence, and nothing else.',
        'The ground stays var(--void) with no wash, no vignette and no texture. A manifesto on a gradient is an advertisement.',
        'The struck sentence settles at var(--ink-3), which is dimmer than a lit paragraph but never invisible: the reader has to be able to see what was corrected.',
        'The reading tick is the accent hue at 0.9, the only saturated element outside the correction.',
        'Light theme: ground #FAFAF8, ink #14141A with the same opacity ramp, and the accent darkens to #8A6E2E so the corrected sentence clears 4.5:1 on paper white.'
      ],
      spacing: [
        'Article `padding: 22vh 0 34vh`. Both numbers exist so the first and last paragraphs can reach the reading line and be fully lit; without them the argument opens and closes dimmed.',
        'Paragraph rhythm 1.6em, turn block 3.5em above and below, closer 4em above.',
        'The turn is inset 1.5rem from the left with a 1px accent rule on that edge, the only indentation in the piece.',
        'Reading tick at 4.5rem from the left edge on desktop, vertically inset by the stage chrome.',
        'Footer 1px hairline with 1.25rem above and the hint clearance below.'
      ],
      relationships: [
        'Opacity encodes distance from the reading line and nothing else. It is not importance, not hierarchy, not sequence: purely where the reader is.',
        'The strike encodes belief being revised in real time. Its direction, left to right at reading speed, is what makes it read as a correction rather than as a decoration.',
        'The vertical gap between the struck line and its replacement is the argument: they are the same claim, one wrong, one right, and putting them anywhere but directly adjacent would break the comparison.',
        'The tick position encodes how much argument is left, which is the one piece of navigational information a long read owes the reader.'
      ],
      acceptance: [
        'The whole argument is readable with JavaScript disabled and with reduced motion on.',
        'Scrolling at any speed keeps the paragraph at the reading line at full ink with no lag behind the scrollbar.',
        'The strike draws left to right exactly at the reader speed and stops when the reader stops.',
        'The corrected sentence never appears before the strike is complete.',
        'Text can be selected and copied normally throughout.',
        'On a 375px screen the dimming is gentler and no paragraph is ever below 0.46 opacity.',
        'DevTools shows no layout or style recalculation of the article during a scroll, only compositing.'
      ]
    }
  });

  /* ==========================================================================
     PAGE 04  -  CONSTELLATION
     --------------------------------------------------------------------------
     Seven working principles as a field you can interrogate. Ask it a
     different question and the same seven nodes re-project onto a different
     pair of axes; the edges between them, which are the argument, never move.

     WHY THE POSITIONS CHANGE AND THE EDGES DO NOT
     ---------------------------------------------
     The edges are a claim: this principle exists because that one does. That
     claim is true no matter what you are asking. The coordinates are a
     projection, and a projection is only ever an answer to one question. A
     diagram that lets you swap the question and watch what stays put is
     an argument; one fixed scatter is a chart.

     WHY THE LABELS ARE DOM AND THE FIELD IS CANVAS
     ----------------------------------------------
     Seven labels rendered with fillText are seven pieces of type that cannot
     be selected, cannot take focus, and cannot carry a hover state. Seven
     absolutely positioned buttons moved with a transform are crisp, tabbable,
     hoverable, and cost seven composited writes a frame. The canvas keeps what
     it is good at: several hundred edge and grid strokes.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'about-page-constellation',
    num: 4,
    name: 'Constellation',
    kind: 'Canvas field / DOM nodes',
    accent: HUE.principle,
    tagline: 'Seven principles, and what they cost to hold',
    desc: 'Working principles arranged as a field with real dependencies between them. Ask the field a different question ' +
          'and the same seven nodes re-project while the edges hold still.',
    interaction: 'Hover or Tab a node to read it, click to pin it. Press 1, 2 or 3 to ask the field a different question.',
    hint: 'Hover a node &middot; 1 / 2 / 3 change the question &middot; <kbd>Esc</kbd> clears',

    /* Miniature: seven nodes crossfading between two projections, with the
       eight edges drawn as one path. Around thirty operations. */
    preview: function (ctx, w, h, t, heat) {
      var stars = PRE.stars;
      var padX = w * 0.14, padY = h * 0.16;
      var iw = w - padX * 2, ih = h - padY * 2;
      var m = 0.5 - 0.5 * Math.cos(SE.math.clamp((t * 0.22) % 2.4 - 0.4, 0, 1) * Math.PI);
      var pts = [], i, s;

      for (i = 0; i < stars.length; i++) {
        s = stars[i];
        pts.push([
          padX + (s.a[0] + (s.b[0] - s.a[0]) * m) * iw,
          padY + (s.a[1] + (s.b[1] - s.a[1]) * m) * ih
        ]);
      }

      ctx.strokeStyle = 'rgba(79,182,163,' + (0.20 + heat * 0.16).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 0; i < BIO.edges.length; i++) {
        var e = BIO.edges[i];
        if (!pts[e[0]] || !pts[e[1]]) continue;
        ctx.moveTo(pts[e[0]][0], pts[e[0]][1]);
        ctx.lineTo(pts[e[1]][0], pts[e[1]][1]);
      }
      ctx.stroke();

      ctx.beginPath();
      for (i = 0; i < pts.length; i++) {
        ctx.moveTo(pts[i][0] + 2.6, pts[i][1]);
        ctx.arc(pts[i][0], pts[i][1], 2.6, 0, TAU);
      }
      ctx.fillStyle = 'rgba(236,236,239,' + (0.72 + heat * 0.22).toFixed(3) + ')';
      ctx.fill();

      /* The two axes. They are the only fixed things in the picture. */
      hair(ctx, padX - 10, padY - 8, padX - 10, h - padY + 8, 'rgba(236,236,239,0.14)');
      hair(ctx, padX - 10, h - padY + 8, w - padX + 8, h - padY + 8, 'rgba(236,236,239,0.14)');
    },

    mount: function (root) {
      var env = SE.env, M = SE.math;
      var b = bag();
      var P = BIO.principles;
      var Q = BIO.questions;
      var N = P.length;

      root.classList.add('about', 'about-constellation');
      tint(root, HUE.principle);

      /* ------------------------------------------------------------- DOM */
      var head = SE.el('header', 'about-constellation__head');
      head.innerHTML =
        '<h2 class="about__title">Seven things I will argue about</h2>' +
        '<p class="about__lede">Each one has a cost. The lines between them are dependencies, not decoration: ' +
          'the field can be asked three different questions and the lines hold still through all of them.</p>';
      root.appendChild(head);

      var asks = SE.el('div', 'about-constellation__asks');
      asks.setAttribute('role', 'radiogroup');
      asks.setAttribute('aria-label', 'Question asked of the field');
      asks.innerHTML = Q.map(function (q, i) {
        return '<button type="button" role="radio" data-q="' + i + '" aria-checked="' + (i === 0) + '">' +
               '<i class="t-num">' + (i + 1) + '</i><b>' + q.q + '</b></button>';
      }).join('');
      root.appendChild(asks);

      var plot = SE.el('div', 'about-constellation__plot');
      var canvasEl = SE.el('canvas', 'about-constellation__canvas');
      plot.appendChild(canvasEl);

      /* Each node is a real button. On the plot only the key is visible; below
         768px the plot is abandoned and the same buttons become the rows of a
         list, at which point the line, the coordinate and the connections stop
         being hidden. Same markup, two compositions. */
      var nodes = SE.el('div', 'about-constellation__nodes');
      nodes.innerHTML = P.map(function (p, i) {
        var leans = BIO.edges.filter(function (e) { return e[0] === i || e[1] === i; })
          .map(function (e) { return P[e[0] === i ? e[1] : e[0]].key; });
        return '<button type="button" class="about-constellation__node" data-n="' + i + '">' +
               '<i aria-hidden="true"></i>' +
               '<b>' + p.key + '</b>' +
               '<span class="about-constellation__nline">' + p.line + '</span>' +
               '<span class="about-constellation__nmeta">' +
                 '<em class="t-num" data-coord></em>' +
                 '<em>Leans on ' + (leans.join(', ') || 'nothing else') + '</em>' +
               '</span></button>';
      }).join('');
      plot.appendChild(nodes);

      /* Axis captions are DOM, positioned against the plot, so they are real
         selectable type instead of fillText at 9px. */
      var axes = SE.el('div', 'about-constellation__axes');
      axes.setAttribute('aria-hidden', 'true');
      axes.innerHTML =
        '<span class="about-constellation__ax about-constellation__ax--x0"></span>' +
        '<span class="about-constellation__ax about-constellation__ax--x1"></span>' +
        '<span class="about-constellation__ax about-constellation__ax--y0"></span>' +
        '<span class="about-constellation__ax about-constellation__ax--y1"></span>';
      plot.appendChild(axes);
      root.appendChild(plot);

      var panel = SE.el('aside', 'about-constellation__panel');
      panel.setAttribute('aria-live', 'polite');
      panel.innerHTML =
        '<h3 data-key></h3>' +
        '<p class="about-constellation__line" data-line></p>' +
        '<p class="about-constellation__body" data-body></p>' +
        '<p class="about-constellation__cost"><span class="t-num">COST</span><em data-cost></em></p>' +
        '<p class="about-constellation__leans"><span class="t-num">LEANS ON</span><em data-leans></em></p>';
      root.appendChild(panel);

      root.appendChild(SE.hintStrip(
        '<span>Hover or Tab a node</span><span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> question</span><span><kbd>Esc</kbd> clear</span>'
      ));

      /* The buttons carry each principle. What they cannot carry is the shape
         of the graph, so the hidden list carries the dependencies instead of
         repeating the same seven sentences. */
      root.appendChild(SE.srList('Constellation: how the seven principles depend on each other',
        srItems(P, function (p, i) {
          var leans = BIO.edges.filter(function (e) { return e[0] === i || e[1] === i; })
            .map(function (e) { return P[e[0] === i ? e[1] : e[0]].key; });
          return {
            name: p.key,
            categoryLabel: 'principle ' + (i + 1) + ' of ' + N,
            role: 'connected to ' + (leans.join(', ') || 'nothing else'),
            note: p.cost
          };
        }), function (s) {
          var i = P.map(function (p) { return p.key; }).indexOf(s.name);
          if (i >= 0) select(i, true);
        }));

      /* ----------------------------------------------------------- state */
      var cv = b.cv(SE.canvas(canvasEl));
      var cvx = cv.ctx;
      var btns = SE.$$('.about-constellation__node', nodes);
      var ask = 0;
      var active = -1;
      var pinned = -1;

      /* Each node keeps its drawn position and its target separately, so a
         question change is a journey and not a jump cut. */
      var pts = P.map(function (p) {
        return { x: p.q[0][0], y: p.q[0][1], tx: p.q[0][0], ty: p.q[0][1], glow: 0, gt: 0 };
      });

      function setAsk(i) {
        ask = i;
        SE.$$('button', asks).forEach(function (btn, k) {
          btn.setAttribute('aria-checked', k === i ? 'true' : 'false');
        });
        pts.forEach(function (pt, k) {
          pt.tx = P[k].q[i][0];
          pt.ty = P[k].q[i][1];
          if (env.reduced) { pt.x = pt.tx; pt.y = pt.ty; }
        });
        SE.$('.about-constellation__ax--x0', axes).textContent = Q[i].x[0];
        SE.$('.about-constellation__ax--x1', axes).textContent = Q[i].x[1];
        SE.$('.about-constellation__ax--y0', axes).textContent = Q[i].y[0];
        SE.$('.about-constellation__ax--y1', axes).textContent = Q[i].y[1];

        /* The mobile composition is a list, and a list has to be ordered by
           something. Ordering by the current question's Y axis is the same
           information the plot carries vertically, so switching question
           reorders the rows instead of moving anything spatially. Written on
           question change only, never per frame. */
        var rank = P.map(function (p, k) { return { k: k, v: p.q[i][1] }; })
          .sort(function (a, c) { return c.v - a.v; });
        rank.forEach(function (r, order) {
          btns[r.k].style.order = String(order);
          var coord = SE.$('[data-coord]', btns[r.k]);
          if (coord) {
            coord.textContent = P[r.k].q[i][0].toFixed(2) + ' / ' + P[r.k].q[i][1].toFixed(2);
          }
        });
        if (env.reduced) render();
      }

      function select(i, keep) {
        active = i;
        if (keep) pinned = i;
        var p = P[i];
        if (!p) { panel.classList.remove('is-on'); return; }
        var leans = BIO.edges.filter(function (e) { return e[0] === i || e[1] === i; })
          .map(function (e) { return P[e[0] === i ? e[1] : e[0]].key; });
        SE.$('[data-key]', panel).textContent = p.key;
        SE.$('[data-line]', panel).textContent = p.line;
        SE.$('[data-body]', panel).textContent = p.body;
        SE.$('[data-cost]', panel).textContent = p.cost;
        SE.$('[data-leans]', panel).textContent = leans.join(', ') || 'Nothing else';
        panel.classList.add('is-on');
        btns.forEach(function (btn, k) { btn.classList.toggle('is-on', k === i); });
        if (env.reduced) { pts.forEach(function (pt, k) { pt.glow = k === i ? 1 : 0; }); render(); }
      }

      function clear() {
        pinned = -1;
        active = -1;
        panel.classList.remove('is-on');
        btns.forEach(function (btn) { btn.classList.remove('is-on'); });
      }

      SE.$$('button', asks).forEach(function (btn) {
        b.on(btn, 'click', function () { setAsk(+btn.getAttribute('data-q')); });
      });

      btns.forEach(function (btn, i) {
        b.on(btn, 'pointerenter', function () { if (env.fine && pinned < 0) select(i); });
        b.on(btn, 'pointerleave', function () { if (env.fine && pinned < 0) clear(); });
        b.on(btn, 'focus', function () { select(i, pinned >= 0); });
        b.on(btn, 'click', function () { select(i, true); });
      });

      b.on(document, 'keydown', function (e) {
        if (e.key === '1') setAsk(0);
        else if (e.key === '2') setAsk(1);
        else if (e.key === '3') setAsk(2);
        else if (e.key === 'Escape' && pinned >= 0) clear();
      });

      /* ------------------------------------------------------------ draw */
      var pad = { l: 0, r: 0, t: 0, bt: 0 };

      function layout() {
        var w = cv.w, h = cv.h;
        pad.l = env.mobile ? 26 : 52;
        pad.r = env.mobile ? 26 : 52;
        pad.t = env.mobile ? 22 : 40;
        pad.bt = env.mobile ? 22 : 40;
        return { w: w, h: h, iw: w - pad.l - pad.r, ih: h - pad.t - pad.bt };
      }

      function render() {
        /* Below 768px there is no plot to draw. The buttons are laid out by
           the document, so writing a transform onto them here would fight the
           list rather than position anything. */
        if (env.mobile) return;
        cv.clear();
        var L = layout();
        if (L.iw < 20 || L.ih < 20) return;
        var i, e, a, c;

        /* Grid: five rules each way at 5% ink. It is a coordinate system, so
           it should be legible enough to read a position off and quiet enough
           that nobody mistakes it for content. */
        cvx.strokeStyle = 'rgba(236,236,239,0.045)';
        cvx.lineWidth = 1;
        cvx.beginPath();
        for (i = 0; i <= 4; i++) {
          var gx = Math.round(pad.l + (i / 4) * L.iw) + 0.5;
          var gy = Math.round(pad.t + (i / 4) * L.ih) + 0.5;
          cvx.moveTo(gx, pad.t); cvx.lineTo(gx, pad.t + L.ih);
          cvx.moveTo(pad.l, gy);  cvx.lineTo(pad.l + L.iw, gy);
        }
        cvx.stroke();

        cvx.strokeStyle = 'rgba(236,236,239,0.14)';
        cvx.beginPath();
        cvx.moveTo(Math.round(pad.l) + 0.5, pad.t);
        cvx.lineTo(Math.round(pad.l) + 0.5, Math.round(pad.t + L.ih) + 0.5);
        cvx.lineTo(pad.l + L.iw, Math.round(pad.t + L.ih) + 0.5);
        cvx.stroke();

        function sx(p) { return pad.l + p.x * L.iw; }
        function sy(p) { return pad.t + p.y * L.ih; }

        /* Edges, in two passes so the ones touching the active node are drawn
           over the rest instead of under a random half of them. */
        for (var pass = 0; pass < 2; pass++) {
          cvx.beginPath();
          for (i = 0; i < BIO.edges.length; i++) {
            e = BIO.edges[i];
            var touches = active >= 0 && (e[0] === active || e[1] === active);
            if ((touches ? 1 : 0) !== pass) continue;
            cvx.moveTo(sx(pts[e[0]]), sy(pts[e[0]]));
            cvx.lineTo(sx(pts[e[1]]), sy(pts[e[1]]));
          }
          cvx.strokeStyle = pass
            ? SE.rgba(HUE.principle, 0.85)
            : 'rgba(236,236,239,0.12)';
          cvx.lineWidth = pass ? 1.4 : 1;
          cvx.stroke();
        }

        /* Node marks. The DOM label sits beside each one; the canvas only ever
           draws the dot and its ring. */
        for (i = 0; i < N; i++) {
          a = pts[i];
          c = { x: sx(a), y: sy(a) };
          if (a.glow > 0.01) {
            cvx.beginPath();
            cvx.arc(c.x, c.y, 5 + a.glow * 11, 0, TAU);
            cvx.strokeStyle = SE.rgba(HUE.principle, 0.14 + a.glow * 0.4);
            cvx.lineWidth = 1;
            cvx.stroke();
          }
          cvx.beginPath();
          cvx.arc(c.x, c.y, 3.4 + a.glow * 1.8, 0, TAU);
          cvx.fillStyle = a.glow > 0.5 ? '#fff' : SE.rgba(HUE.principle, 0.9);
          cvx.fill();
        }

        /* Move the seven labels. Transform only, so this is a composite and
           never a layout. */
        for (i = 0; i < N; i++) {
          /* The independent `translate` property, not `transform`: CSS keeps
             `transform` for the flip and the two compose, so the loop never
             has to measure a label to know how far to push it. */
          btns[i].style.translate = sx(pts[i]).toFixed(1) + 'px ' + sy(pts[i]).toFixed(1) + 'px';
          /* Labels on the right half of the plot flip to the other side of
             their dot, so nothing hangs off the edge of the field. */
          btns[i].classList.toggle('is-flip', pts[i].x > 0.62);
        }
      }

      cv.observe(render);

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        var moved = false;
        for (var i = 0; i < N; i++) {
          var p = pts[i];
          p.gt = (i === active) ? 1 : 0;
          if (env.reduced) {
            p.x = p.tx; p.y = p.ty; p.glow = p.gt;
          } else {
            /* lambda 4 is a deliberate three quarters of a second. A question
               is a re-projection, and a re-projection the reader cannot follow
               with their eye teaches nothing. */
            p.x = M.damp(p.x, p.tx, 4, dt);
            p.y = M.damp(p.y, p.ty, 4, dt);
            p.glow = M.damp(p.glow, p.gt, 10, dt);
          }
          if (Math.abs(p.x - p.tx) > 0.0004 || Math.abs(p.y - p.ty) > 0.0004 ||
              Math.abs(p.glow - p.gt) > 0.004) moved = true;
        }
        if (moved || tick.first) { tick.first = false; render(); }
      }
      tick.first = true;
      /* With motion off the nodes jump to each projection, so a re-render is
         driven by the two functions that change state and no loop is needed. */
      if (!env.reduced) b.tick(tick);

      setAsk(0);
      render();

      return {
        destroy: function () {
          b.all();
          root.classList.remove('about', 'about-constellation');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'Seven working principles as a field that can be asked three different questions.',
      philosophy: [
        'The edges are a claim: this principle exists because that one does. That claim is true regardless of what you are asking, so the edges never move. The coordinates are a projection, and a projection is an answer to exactly one question.',
        'A single fixed scatter of principles is a chart. A field where you can change the question and watch which relationships survive is an argument, and this section is supposed to be making one.',
        'Every principle carries its cost in the panel. A list of principles with no costs attached is a wish list; the cost line is what makes it a position somebody actually holds.',
        'Nothing here is generated. Seven nodes, eight edges and twenty-one coordinates, all hand-written, because a randomly generated graph is decoration wearing the clothes of data.'
      ],
      hierarchy: [
        '1. The field. It takes the centre and roughly 58% of the stage width.',
        '2. The active node: 5.2px dot in white with an expanding ring, its label at full ink, and its edges at 0.85 accent while the rest sit at 0.12 ink.',
        '3. The panel on the right at 24rem: key, the one-line position, the paragraph behind it, the cost, and what it leans on.',
        '4. The three questions, top left under the title, as a radio group.',
        '5. The axis captions at each end of the two rules, mono 0.625rem var(--ink-4). They are the legend and they stay quiet.'
      ],
      structure: [
        'Root `position: absolute; inset: 0`, CSS grid `grid-template-columns: minmax(0, 1fr) 24rem` and `grid-template-rows: auto minmax(0, 1fr)`.',
        'The plot is a positioned container holding: one canvas at inset 0, one absolutely positioned div of seven real buttons, and four axis caption spans.',
        'The canvas draws the grid, the two axis rules, the eight edges and the seven dots. It draws no text at all.',
        'Each node button contains a 9px dot marker, the key as visible text, and the full position line as `.sr-only`, so hearing the button is hearing the principle.',
        'The panel is `aria-live="polite"` and is the only element that changes on selection.'
      ],
      interaction: [
        'Hover or focus a node selects it; the panel fills and its edges light. Hover only takes effect when nothing is pinned.',
        'Click pins the selection so the panel survives the pointer leaving. Escape unpins.',
        'Keys 1, 2 and 3 ask the three questions; so do the three radio buttons.',
        'A question change retargets all seven node positions. They damp toward the new projection at lambda 4, which is roughly 750ms of travel.',
        'The seven labels are moved with `translate3d` every frame while anything is in motion. When nothing moves by more than 0.0004 in normalised space and no glow moves by more than 0.004, the frame does no work at all.',
        'Tab order runs through the seven nodes in principle order, which is the order they are written in, not the order they happen to sit on screen.'
      ],
      choreography: [
        { n: 'Re-projection', d: 'damp(current, target, 4, dt) per axis, roughly a 750ms settle. Slower than a UI transition on purpose: the whole information content of a question change is which nodes moved and which did not, and a reader who cannot follow the travel with their eye learns nothing.' },
        { n: 'Node glow', d: 'damp(current, target, 10, dt), about 200ms. Selection feedback has to be near-instant even though the layout is not.' },
        { n: 'Active ring', d: 'Radius 5px to 16px as glow goes 0 to 1, stroked at accent alpha 0.14 to 0.54. Drawn per frame on canvas, so there is no CSS box-shadow anywhere.' },
        { n: 'Panel fill', d: 'opacity 0 to 1 and translate3d(0, 10px, 0) to 0 over 220ms, cubic-bezier(0.23, 1, 0.32, 1). A transition, not a keyframe, because moving the pointer across the field fires this several times a second and a transition retargets cleanly.' },
        { n: 'Label flip', d: 'A node past x = 0.62 flips its label to the left of its dot. It is a class toggle, so the flip is instant. Easing a label from one side of a dot to the other reads as a bug.' },
        { n: 'Entry', d: 'Nodes start at the first projection with zero glow and no entry animation. The composition is already correct at t=0, and animating seven dots into place would spend the reader attention that the first question change needs.' }
      ],
      scroll: [
        'None. The field is one screen and stays one screen.',
        'Below 900px height the panel moves under the plot and takes `max-height: 38vh` with its own internal scroll.',
        'No window scroll listener and no IntersectionObserver: a page concept is either mounted or gone.'
      ],
      hover: [
        'Gated behind `@media (hover: hover) and (pointer: fine)`.',
        'Hovering a node selects it and lights its edges. Hover is a preview and click is a commitment: once anything is pinned, hover stops changing the panel, so crossing the field does not strobe it.',
        'The node label goes from var(--ink-2) to var(--ink) over 160ms. The dot itself does not scale on hover; the canvas ring is the size change and two size changes for one event is one too many.',
        'The cursor reticle carries the principle key.'
      ],
      click: [
        'Click pins a node. The pinned node keeps the panel and keeps its edges lit while the pointer goes anywhere.',
        'Escape unpins, as does clicking the pinned node again.',
        'Clicking the empty field does nothing. There is no marquee select and no pan: the field is 660px of plot with seven things in it and it does not need navigation.'
      ],
      responsive: {
        desktop: 'Two columns: plot at 1fr, panel at 24rem. Plot insets 52px so no label is clipped. Grid at 5 by 5.',
        tablet: 'Panel narrows to 19rem, plot insets fall to 36px, and node labels drop to 0.75rem.',
        mobile: 'Below 768px the field is abandoned as a two-axis plot, because seven labelled nodes in a 375px square is an unreadable pile. The same seven principles become a vertical list of expandable rows, ordered by the current question, with the position on the current axis shown as a small mono coordinate pair. The three questions become a horizontal scroll-snap row of 44px chips, and choosing one reorders the list with a 320ms transition rather than moving anything spatially. The edges are printed as a "leans on" line inside each row. Same data, same argument, no plot.'
      },
      a11y: [
        'The seven nodes are real buttons in DOM order with the full position line included as visually hidden text, so the canvas is not the only way to reach any of it.',
        'Tab order follows the written order of the principles, not their screen position, so it stays stable across all three projections.',
        'The panel is `aria-live="polite"` and announces the selected principle once.',
        'The hidden list mirrors what the buttons cannot: each principle and everything it connects to, so the shape of the graph is available as text.',
        'The three questions are a real `role="radiogroup"` and are operable with the arrow keys as well as with 1, 2 and 3.',
        'Under `prefers-reduced-motion: reduce` the nodes jump straight to the new projection and the glow is binary. The field stays fully interrogable; only the travel is removed.',
        'Node labels sit at var(--ink-2), 7.2:1 on the ground, and never rely on the accent hue to carry state: the active node also changes its dot to white and its label to full ink.'
      ],
      perf: [
        'Per frame while moving: 7 damps by 3 values, one canvas repaint of about 10 grid strokes, 8 edges in 2 paths, 7 dots, and 7 transform writes.',
        'When nothing moves, the frame does one comparison loop over seven nodes and returns without touching the canvas or the DOM.',
        'Labels are transformed, never repositioned with `left` or `top`, so a re-projection is a composite and not seven layouts.',
        'Edges are batched into two paths by whether they touch the active node. Sixteen individual strokes would be sixteen state changes to draw eight lines.',
        'No box-shadow anywhere. The active ring is a stroked arc on the canvas, which costs one path and does not create a new paint layer.'
      ],
      packages: [
        { p: 'none required', w: 'Seven points, eight edges and a damp function. A force layout library would add 40kb to animate twenty-one hand-written coordinates.' },
        { p: 'no d3-force', w: 'Explicitly rejected. A force simulation puts the nodes wherever physics puts them, which means the position is no longer an answer to the question. The whole concept depends on the coordinates being authored.' },
        { p: 'gsap (installed)', w: 'Optional for the panel transition. The re-projection must stay on the damp so it is frame-rate independent and interruptible mid-travel by another question.' }
      ],
      architecture: [
        { f: 'components/sections/AboutPrinciples.tsx', r: 'Server Component. Renders the title, the three question buttons, the seven principles as a real list, and the panel content for the first one. Everything is present before hydration.' },
        { f: 'components/about/PrincipleField.tsx', r: '"use client". The canvas, the seven positioned buttons, the damped projection and the render loop.' },
        { f: 'components/about/PrinciplePanel.tsx', r: 'Presentational. Takes an index and renders key, line, body, cost and connections.' },
        { f: 'lib/about/principles.ts', r: 'The seven principles with their three coordinate pairs each, the eight edges, and the three question definitions. Pure data, no functions.' }
      ],
      state: [
        '`activeIndex` and `pinnedIndex` are useState. They change on human input and drive the panel.',
        '`askIndex` is useState because it changes what the axis captions say, which is real rendered output.',
        'The seven node positions, their targets and their glow values are refs written by the rAF loop. Positions in state would re-render the tree sixty times during every question change.',
        'Cancel the frame and disconnect the ResizeObserver on unmount.'
      ],
      typography: [
        'Node labels: display 500 at 0.8125rem, tracking -0.01em, var(--ink-2), rising to var(--ink) when active. Prose, so not mono.',
        'Panel key: display 500 at clamp(1.25rem, 1.9vw, 1.625rem), tracking -0.03em.',
        'Panel position line: display 400 at 1.0625rem / 1.5 in the accent hue. Panel body at 0.9375rem / 1.62 var(--ink-2), measure 42ch.',
        'Cost and connection labels: mono 500 at 0.5625rem, tracking 0.2em, uppercase, var(--ink-4), with their values in the display face beside them.',
        'Axis captions: mono 400 at 0.625rem, tracking 0.16em, var(--ink-4). They are measurements and they are set like measurements.'
      ],
      color: [
        'Signature hue #4FB6A3 carries three things: the resting dots at 0.9, the active edges at 0.85, and the panel position line. Nothing else.',
        'Resting edges are rgba(236,236,239,0.12); the grid is 0.045. Both are deliberately below the text contrast floor because they are structure, not content.',
        'The active dot is the only pure white in the concept, which is what makes selection unmistakable without any size change on the label.',
        'The panel sits on the ground with a 1px left rule in the accent hue. No filled card: seven principles do not need a container to be a group.',
        'Light theme: ground #FAFAF8, grid at rgba(20,20,26,0.06), and the accent darkens to #2E7D6F so the panel line clears 4.5:1.'
      ],
      spacing: [
        'Plot inset 52px on desktop, which is set by the widest node label plus its dot, so no label can be clipped at any projection.',
        'Grid at 5 by 5, which is enough to read a position off and few enough that it does not become a texture.',
        'Panel padding `clamp(1.25rem, 2vw, 2rem)` with a 1.25rem gap between the position line and the body.',
        'Question buttons 2.25rem tall, 0.5rem apart, aligned to the left edge of the title above them.',
        'The hint strip needs 3.25rem, and the plot bottom inset accounts for it so no node can land underneath it.'
      ],
      relationships: [
        'Position answers the current question, and only the current question. That is why the axis captions change with it: an unlabelled axis in a re-projectable plot is a lie.',
        'Edges encode dependency, are hand-authored, and hold still across all three projections. Watching a pair stay connected while both ends travel is the concept working.',
        'Node colour is state, not category. All seven principles are the same kind of thing, so giving them seven hues would invent a taxonomy that does not exist.',
        'The cost line encodes what the principle actually costs to hold. Without it the field is seven opinions; with it, it is seven trades.'
      ],
      acceptance: [
        'Pressing 1, 2 and 3 visibly re-projects all seven nodes over roughly three quarters of a second, and the edges stay attached throughout.',
        'Hovering a node lights it and its edges; clicking pins it; Escape clears it.',
        'Tab reaches all seven nodes in written order and each one announces its full position line.',
        'No node label is ever clipped by the plot edge at any of the three projections.',
        'With reduced motion set, questions switch instantly and the field is still fully interrogable.',
        'On a 375px screen the plot is replaced by an ordered list of expandable rows, with no attempt to squeeze seven labelled nodes into a square.',
        'The frame loop does no canvas work while the field is at rest.'
      ]
    }
  });

  /* ==========================================================================
     PAGE 05  -  LEDGER
     --------------------------------------------------------------------------
     Where a working week actually goes, kept as a ledger rather than shown as
     a dashboard. Nine rows, two columns of hours, a signed delta, and twelve
     weeks of shape per row. A crosshair you move across the twelve weeks turns
     the mean column into that week's reading.

     WHY THIS IS NOT A DASHBOARD
     ---------------------------
     No donuts, no filled bars, no traffic lights, no card per metric. Those
     patterns exist to make a number look important; a ledger exists to let two
     numbers be compared. Everything here is a hairline, a tabular figure or a
     twelve point polyline, and the only saturated element on the page is the
     probe the reader is holding.

     WHY THE GUESS COLUMN IS THE POINT
     ---------------------------------
     "Where the time goes" is uninteresting on its own. "Where I thought it
     went, and where it went" is an admission. Both columns are budgeted
     against the same 38.5 hour week on purpose, so the deltas have to cancel:
     the interesting figure is never the total, it is which way each row moved.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'about-page-ledger',
    num: 5,
    name: 'Ledger',
    kind: 'DOM table / canvas series',
    accent: HUE.ledger,
    tagline: 'Where the week goes, against where I said it went',
    desc: 'Nine rows of self-logged time set against the estimate written before the log started, with twelve weeks of shape behind each one. ' +
          'Move the probe and every mean becomes that week reading.',
    interaction: 'Move across the twelve week field to set the probe, or use Left and Right. The mean column becomes the reading for the week under the probe.',
    hint: 'Move to probe a week &middot; Arrows step &middot; <kbd>Esc</kbd> returns to the mean',

    /* Miniature: five ledger rows as right-aligned figure rules with one
       polyline and a travelling probe. Around forty operations. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.08;
      var iw = w - padX * 2;
      var rows = 4;
      var top = h * 0.20;
      var gap = (h * 0.62) / rows;
      var sparkX = padX + iw * 0.52;
      var sparkW = iw * 0.48;
      var probe = Math.floor(((t * 0.55) % 12));
      var i, k, y, r, v;

      hair(ctx, padX, h * 0.13, w - padX, h * 0.13, 'rgba(236,236,239,0.14)');

      for (i = 0; i < rows; i++) {
        y = top + i * gap;
        r = BIO.ledger[i];
        /* Left: the activity, as a rule. Right of it: the two figures. */
        box(ctx, padX, y, iw * 0.26, 1.5, 'rgba(236,236,239,' + (0.30 + heat * 0.22).toFixed(3) + ')');
        box(ctx, padX + iw * 0.34, y, iw * 0.07, 1.5, 'rgba(236,236,239,0.62)');
        box(ctx, padX + iw * 0.44, y, iw * 0.05, 1.5, 'rgba(236,236,239,0.22)');

        ctx.strokeStyle = 'rgba(141,167,80,' + (0.42 + heat * 0.38).toFixed(3) + ')';
        ctx.lineWidth = 1;
        /* Every second week, not all twelve: at 150px wide the shape is
           identical and the operation count halves. */
        ctx.beginPath();
        for (k = 0; k < 12; k += 2) {
          v = r.series[k] / 12;
          ctx.lineTo(sparkX + (k / 11) * sparkW, y + 2 - v * gap * 0.85);
        }
        ctx.stroke();
      }

      var px = sparkX + (probe / 11) * sparkW;
      hair(ctx, px, h * 0.13, px, top + rows * gap, 'rgba(255,255,255,0.55)');
      box(ctx, px - 2, h * 0.13 - 3, 4, 3, '#fff');
    },

    mount: function (root) {
      var env = SE.env, M = SE.math;
      var b = bag();
      var L = BIO.ledger;
      var N = L.length;
      var WEEKS = BIO.weeks;

      root.classList.add('about', 'about-ledger');
      tint(root, HUE.ledger);

      function signed(v) {
        if (Math.abs(v) < 0.001) return '0h 00';
        return (v > 0 ? '+' : '-') + hm(Math.abs(v));
      }

      var totalLogged = L.reduce(function (s, r) { return s + r.logged; }, 0);
      var totalGuess = L.reduce(function (s, r) { return s + r.guess; }, 0);

      /* ------------------------------------------------------------- DOM */
      var wrap = SE.el('div', 'about-ledger__wrap');
      wrap.innerHTML =
        '<header class="about-ledger__head">' +
          '<h2 class="about__title">Twelve weeks, to the quarter hour</h2>' +
          '<p class="about__lede">What I wrote down before I started logging, and what the log said. ' +
            'Both columns are budgeted against the same ' + BIO.week + ' hour week, so the deltas cancel. ' +
            'The total is not the interesting number.</p>' +
        '</header>';

      var table = SE.el('div', 'about-ledger__table');
      table.setAttribute('role', 'slider');
      table.setAttribute('tabindex', '0');
      table.setAttribute('aria-label', 'Week probe across twelve logged weeks');
      table.setAttribute('aria-valuemin', '0');
      table.setAttribute('aria-valuemax', String(WEEKS));

      var spark = SE.el('canvas', 'about-ledger__spark');
      spark.setAttribute('aria-hidden', 'true');
      table.appendChild(spark);

      var grid = SE.el('div', 'about-ledger__grid');
      grid.innerHTML =
        '<div class="about-ledger__row about-ledger__row--head">' +
          '<span class="about-ledger__k">Activity</span>' +
          '<span class="about-ledger__n t-num" data-head>Logged mean</span>' +
          '<span class="about-ledger__n t-num">Guessed</span>' +
          '<span class="about-ledger__n t-num">Delta</span>' +
          '<span class="about-ledger__s t-num">Twelve weeks</span>' +
        '</div>' +
        L.map(function (r, i) {
          return '<div class="about-ledger__row" data-row="' + i + '">' +
            '<span class="about-ledger__k">' + r.k + '</span>' +
            '<span class="about-ledger__n t-num" data-logged="' + i + '">' + hm(r.logged) + '</span>' +
            '<span class="about-ledger__n t-num about-ledger__n--dim">' + hm(r.guess) + '</span>' +
            '<span class="about-ledger__n t-num about-ledger__n--delta" data-sign="' +
              (r.delta > 0 ? 'up' : r.delta < 0 ? 'down' : 'flat') + '">' + signed(r.delta) + '</span>' +
            '<span class="about-ledger__s"></span>' +
          '</div>';
        }).join('') +
        '<div class="about-ledger__row about-ledger__row--total">' +
          '<span class="about-ledger__k">Total</span>' +
          '<span class="about-ledger__n t-num">' + hm(totalLogged) + '</span>' +
          '<span class="about-ledger__n t-num about-ledger__n--dim">' + hm(totalGuess) + '</span>' +
          '<span class="about-ledger__n t-num about-ledger__n--delta" data-sign="flat">' +
            signed(totalLogged - totalGuess) + '</span>' +
          '<span class="about-ledger__s t-num" data-weeklabel></span>' +
        '</div>';
      table.appendChild(grid);
      wrap.appendChild(table);

      var note = SE.el('p', 'about-ledger__note');
      note.innerHTML =
        'Self-logged over ' + WEEKS + ' weeks and rounded to the quarter hour. The weekly series is a <b>model</b>: ' +
        'four recorded week shapes, each summing to zero, assigned per row and scaled by that row volatility. ' +
        'Stating that is more honest than inventing ' + (N * WEEKS) + ' separate readings and presenting them as measurements.';
      wrap.appendChild(note);

      root.appendChild(wrap);
      root.appendChild(SE.hintStrip(
        '<span>Move to probe a week</span><span>Left / Right steps</span><span><kbd>Esc</kbd> back to the mean</span>'
      ));

      root.appendChild(SE.srList('Ledger: nine activities, logged mean against the estimate',
        srItems(L, function (r) {
          return {
            name: r.k,
            categoryLabel: 'logged ' + hm(r.logged) + ' a week',
            role: 'guessed ' + hm(r.guess),
            note: 'Delta ' + signed(r.delta) + '. Range across twelve weeks ' +
                  hm(Math.min.apply(null, r.series)) + ' to ' + hm(Math.max.apply(null, r.series)) + '.'
          };
        }), function () {}));

      /* ----------------------------------------------------------- state */
      var cv = b.cv(SE.canvas(spark));
      var cvx = cv.ctx;
      var rowEls = SE.$$('[data-row]', grid);
      var loggedEls = SE.$$('[data-logged]', grid);
      var headEl = SE.$('[data-head]', grid);
      var weekLabel = SE.$('[data-weeklabel]', grid);
      var probe = -1;          /* -1 means no probe: the mean column is the mean */
      var drawn = 0;           /* damped probe position in week units */
      var bands = [];          /* per row: y band inside the canvas */
      var col = { x: 0, w: 0 };
      var maxV = 0;

      L.forEach(function (r) {
        for (var i = 0; i < r.series.length; i++) if (r.series[i] > maxV) maxV = r.series[i];
      });
      /* One shared vertical scale for all nine rows. Per-row autoscaling would
         make a two hour row look as busy as a nine hour one, which is the most
         common way a small-multiples chart lies. */
      maxV = Math.ceil(maxV * 1.08 * 4) / 4;

      function measure() {
        var tb = table.getBoundingClientRect();
        bands = rowEls.map(function (el) {
          var rb = el.getBoundingClientRect();
          return { top: rb.top - tb.top, h: rb.height };
        });
        var probeCell = SE.$('.about-ledger__s', rowEls[0]);
        if (probeCell) {
          var cb = probeCell.getBoundingClientRect();
          col.x = cb.left - tb.left;
          col.w = cb.width;
        }
      }

      var ro = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = b.obs(new ResizeObserver(function () { measure(); render(); }));
        ro.observe(table);
      } else {
        b.on(window, 'resize', function () { measure(); render(); });
      }

      function setProbe(w) {
        probe = w < 0 ? -1 : M.clamp(Math.round(w), 0, WEEKS - 1);
        if (probe < 0) {
          headEl.textContent = 'Logged mean';
          weekLabel.textContent = '';
          table.removeAttribute('aria-valuenow');
          table.setAttribute('aria-valuetext', 'No week probed, showing the twelve week mean');
          loggedEls.forEach(function (el, i) { el.textContent = hm(L[i].logged); });
          table.classList.remove('is-probing');
          if (env.reduced) { drawn = 0; render(); }
          return;
        }
        headEl.textContent = 'Week ' + SE.pad(probe + 1);
        weekLabel.textContent = 'WEEK ' + SE.pad(probe + 1) + ' / ' + WEEKS;
        table.setAttribute('aria-valuenow', String(probe + 1));
        table.setAttribute('aria-valuetext', 'Week ' + (probe + 1) + ' of ' + WEEKS + ', ' +
          L.map(function (r) { return r.k + ' ' + hm(r.series[probe]); }).join(', '));
        loggedEls.forEach(function (el, i) { el.textContent = hm(L[i].series[probe]); });
        table.classList.add('is-probing');
        if (env.reduced) { drawn = probe; render(); }
      }

      /* ----------------------------------------------------- interaction */
      function weekFromEvent(e) {
        var tb = table.getBoundingClientRect();
        var x = e.clientX - tb.left - col.x;
        return (x / Math.max(1, col.w)) * (WEEKS - 1);
      }

      b.on(table, 'pointermove', function (e) {
        if (!env.fine) return;
        setProbe(weekFromEvent(e));
      });
      b.on(table, 'pointerleave', function () { if (env.fine) setProbe(-1); });
      /* Touch: a drag anywhere across the table sets the probe, and the probe
         stays where the finger left it, because there is no pointerleave to
         return it to the mean. */
      b.on(table, 'pointerdown', function (e) {
        if (env.fine) return;
        setProbe(weekFromEvent(e));
      });

      b.on(table, 'keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowLeft') { setProbe((probe < 0 ? WEEKS : probe) - 1); e.preventDefault(); }
        else if (k === 'ArrowRight') { setProbe(probe < 0 ? 0 : probe + 1); e.preventDefault(); }
        else if (k === 'Home') { setProbe(0); e.preventDefault(); }
        else if (k === 'End') { setProbe(WEEKS - 1); e.preventDefault(); }
        else if (k === 'Escape') { setProbe(-1); }
      });

      /* ------------------------------------------------------------ draw */
      function render() {
        cv.clear();
        if (!bands.length || col.w < 20) return;
        var i, k, r, band, x, y, v;

        for (i = 0; i < N; i++) {
          r = L[i];
          band = bands[i];
          if (!band) continue;
          var base = band.top + band.h * 0.82;
          var amp = band.h * 0.70;

          /* Row baseline. It is the zero line for the series, so it is drawn
             first and never covered. */
          cvx.strokeStyle = 'rgba(236,236,239,0.055)';
          cvx.lineWidth = 1;
          cvx.beginPath();
          cvx.moveTo(col.x, Math.round(base) + 0.5);
          cvx.lineTo(col.x + col.w, Math.round(base) + 0.5);
          cvx.stroke();

          /* The mean, as a dotted rule. Two references per row: the mean and
             zero, which is all a twelve point series needs to be readable. */
          var my = base - (r.logged / maxV) * amp;
          cvx.strokeStyle = SE.rgba(HUE.ledger, 0.22);
          cvx.setLineDash([2, 3]);
          cvx.beginPath();
          cvx.moveTo(col.x, Math.round(my) + 0.5);
          cvx.lineTo(col.x + col.w, Math.round(my) + 0.5);
          cvx.stroke();
          cvx.setLineDash([]);

          cvx.strokeStyle = SE.rgba(HUE.ledger, 0.88);
          cvx.lineWidth = 1.3;
          cvx.lineJoin = 'round';
          cvx.beginPath();
          for (k = 0; k < WEEKS; k++) {
            x = col.x + (k / (WEEKS - 1)) * col.w;
            y = base - (r.series[k] / maxV) * amp;
            if (k === 0) cvx.moveTo(x, y); else cvx.lineTo(x, y);
          }
          cvx.stroke();
        }

        if (probe < 0 && drawn < 0.001) return;

        /* The probe. One rule the full height of the table plus one dot per
           row, which is what turns nine independent sparklines into one
           readable cross-section. */
        var px = col.x + (drawn / (WEEKS - 1)) * col.w;
        var alpha = probe < 0 ? 0 : 1;
        if (alpha <= 0) return;
        cvx.strokeStyle = 'rgba(255,255,255,0.42)';
        cvx.lineWidth = 1;
        cvx.beginPath();
        cvx.moveTo(Math.round(px) + 0.5, bands[0].top);
        cvx.lineTo(Math.round(px) + 0.5, bands[N - 1].top + bands[N - 1].h);
        cvx.stroke();

        cvx.beginPath();
        for (i = 0; i < N; i++) {
          band = bands[i];
          if (!band) continue;
          v = L[i].series[M.clamp(Math.round(drawn), 0, WEEKS - 1)];
          y = band.top + band.h * 0.82 - (v / maxV) * (band.h * 0.70);
          cvx.moveTo(px + 2.6, y);
          cvx.arc(px, y, 2.6, 0, TAU);
        }
        cvx.fillStyle = '#fff';
        cvx.fill();
      }

      cv.observe(function () { measure(); render(); });
      measure();

      /* ------------------------------------------------------------ tick */
      var lastDrawn = -99, lastProbe = -99;
      function tick(dt) {
        var target = probe < 0 ? drawn : probe;
        drawn = env.reduced ? target : M.damp(drawn, target, 12, dt);
        if (Math.abs(drawn - lastDrawn) < 0.004 && probe === lastProbe) return;
        lastDrawn = drawn;
        lastProbe = probe;
        render();
      }
      /* With motion off the probe jumps between weeks, so the render is
         driven straight from setProbe and there is no loop. */
      if (!env.reduced) b.tick(tick);

      setProbe(-1);
      render();

      return {
        destroy: function () {
          b.all();
          root.classList.remove('about', 'about-ledger');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'Nine rows of self-logged time against the estimate written before the log started, probed by week.',
      philosophy: [
        'This is a ledger, not a dashboard. No donuts, no filled bars, no traffic lights, no card per metric. Those patterns exist to make one number look important; a ledger exists so two numbers can be compared without ceremony.',
        'The guess column is the point. "Where the time goes" is a fact; "where I said it went and where it went" is an admission, and an About section without an admission in it is a brochure.',
                'Both columns are budgeted against the same 38.5 hour week deliberately, so the deltas must cancel to zero. The total is never the interesting figure. Which way each row moved is.',
        'The weekly series is labelled as a model in the body copy, in the markup, and in the accessible description. Inventing 108 precise readings and presenting them as measurements would be the exact dishonesty this concept is about.'
      ],
      hierarchy: [
        '1. The nine activity names, display 400 at clamp(0.9375rem, 1.15vw, 1.0625rem), full ink. They are the content.',
        '2. The logged column, mono 500 at 0.9375rem tabular, full ink. It is the column that changes under the probe.',
        '3. The twelve week series behind each row, one polyline at accent 0.88 with a dotted mean rule at 0.22.',
        '4. The guess column at var(--ink-3) and the delta at var(--ink-2), both mono tabular.',
        '5. The total row, separated by a 1px rule, carrying the same three figures plus the probed week label.',
        '6. The model note at 0.75rem var(--ink-3). Last in the visual order, first in importance for honesty.'
      ],
      structure: [
        'Root `position: absolute; inset: 0`, a single column layout with `--pad` inset and the hint clearance at the bottom.',
        'The table is one `role="slider"` container holding an absolutely positioned canvas at inset 0 and a CSS grid of eleven rows on top of it.',
        'Grid columns: `minmax(0, 1fr) 6.5rem 6.5rem 6.5rem minmax(9rem, 22rem)`. The last column is the series field and is the only one the canvas draws into.',
        'Each row is a real grid row with a 1px bottom hairline. There are no boxes, no zebra striping, and no borders on the individual cells.',
        'The canvas measures each row band and the series column with `getBoundingClientRect` once per resize, so the drawing is aligned to the real type and not to an assumed row height.'
      ],
      interaction: [
        'Moving the pointer anywhere across the table maps clientX into the series column and sets the probe to the nearest of twelve weeks. It snaps: there is no reading between week 6 and week 7.',
        'While probed, the head of the logged column changes from "Logged mean" to "Week 07" and all nine figures in it become that week reading. Leaving the table returns every figure to the mean.',
        'ArrowLeft and ArrowRight step a week, Home and End jump to the ends, Escape returns to the mean. This is the full keyboard equivalent of the pointer probe, per WCAG 2.2.',
        'On touch there is no pointerleave, so a tap sets the probe and it stays where it was left. Escape and a second tap outside the field return it.',
        'The probe rule damps at lambda 12, about 150ms, which is fast enough to feel attached to the pointer and slow enough that crossing twelve weeks reads as travel rather than as flicker.',
        'One shared vertical scale across all nine rows. Per-row autoscaling would make the two hour row look as busy as the nine hour row, which is the most common way a small-multiples chart lies.'
      ],
      choreography: [
        { n: 'Probe travel', d: 'damp(current, target, 12, dt), roughly 150ms. Every dot on every row moves together, which is what makes nine independent sparklines read as one cross-section.' },
        { n: 'Figure swap', d: 'The nine logged figures are replaced by textContent with no transition at all. A number that cross-fades is a number you cannot read during the cross-fade, and this column exists to be read.' },
        { n: 'Column head change', d: '"Logged mean" to "Week 07" is also an instant swap, but the head cell gets a 1px accent underline that scales from scaleX(0) with transform-origin left over 180ms cubic-bezier(0.23, 1, 0.32, 1). The rule is the state change; the text is just the label.' },
        { n: 'Row emphasis', d: 'None. No row highlights on hover. A ledger where the row under the pointer lights up invites the reader to compare a row with the pointer rather than with the row next to it.' },
        { n: 'Entry', d: 'Rows fade in over 420ms with a 26ms stagger, cubic-bezier(0.23, 1, 0.32, 1), and the nine polylines are drawn at full length immediately. Drawing the series left to right would be a chart animation, and chart animations delay the only thing the reader came for.' },
        { n: 'Tabular figures everywhere', d: 'font-variant-numeric: tabular-nums on every numeric cell. Without it, swapping 9h 15 for 10h 00 shifts the column by a pixel on every probe move, and the whole table shivers.' }
      ],
      scroll: [
        'The page fits one screen at 1440 by 900 with no scroll. Below 760px of height the wrap becomes its own scroller with `overscroll-behavior: contain`.',
        'The canvas is remeasured in a ResizeObserver on the table, so a scroll that changes nothing does not trigger a remeasure.',
        'No window scroll listener anywhere.'
      ],
      hover: [
        'Gated behind `@media (hover: hover) and (pointer: fine)`.',
        'Hovering the table sets the probe. That is the entire hover behaviour; no row lifts, no cell tints, no tooltip appears.',
        'The cursor over the series column is `col-resize`, because horizontal position is the only thing that matters there and the cursor should say so.',
        'The cursor reticle carries the probed week as its label.'
      ],
      click: [
        'Click does nothing on desktop. The probe follows the pointer already, and making a click pin it would add a mode with no visible affordance.',
        'On touch, a tap or drag sets the probe, because there is no hover to follow.',
        'Nothing in the ledger navigates anywhere. It is a page you read and leave.'
      ],
      responsive: {
        desktop: 'Five columns: activity at 1fr, three figure columns at 6.5rem, series column between 9rem and 22rem. Rows 3.25rem tall. Probe on hover.',
        tablet: 'The guess column keeps its figure but loses its head to an abbreviation; the series column falls to its 9rem minimum. Rows 3rem.',
        mobile: 'Below 768px the table is not a table. Each activity becomes a stacked block: the name on its own line at 1rem, then a mono strip reading "LOGGED 9h 15 / GUESSED 4h 30 / +4h 45", then the twelve week series drawn full bleed at 44px tall underneath it. The probe is driven by a drag anywhere on the block and stays where the finger leaves it, since there is no pointerleave. The total becomes the last block with the same shape. Nothing is truncated and nothing scrolls horizontally.'
      },
      a11y: [
        'The table is a `role="slider"` with aria-valuemin 0, aria-valuemax 12, aria-valuenow, and an aria-valuetext that reads the whole cross-section: "Week 7 of 12, Reading code that already exists 9h 45, Writing new code 8h 00, ...".',
        'Arrow keys, Home, End and Escape reproduce every pointer capability, satisfying WCAG 2.2 dragging-movements.',
        'The canvas is `aria-hidden` and mirrored by a visually-hidden focusable list carrying each activity, its mean, its guess, its delta and its twelve week range as text.',
        'Every figure is real text in the DOM, never painted into the canvas. The canvas draws only lines and dots.',
        'The word "model" is bold in the note and repeated in the accessible description, so nobody can come away believing the 108 weekly values were separately measured.',
        'Under `prefers-reduced-motion: reduce` the probe jumps between weeks with no damping and the row entry stagger does not run. The instrument works identically.',
        'Colour is never the only signal: the delta column carries a plus or minus sign as text, not only a hue.'
      ],
      perf: [
        'Per frame while probing: one damp and one canvas repaint of nine baselines, nine dotted mean rules, nine twelve-point polylines and ten probe marks. About 250 path operations.',
        'The frame returns immediately when the probe has not moved by more than 0.004 of a week and the target week has not changed, so a still page costs one comparison.',
        'Row bands and the series column geometry are measured once per resize with getBoundingClientRect, never in the frame loop.',
        'Nine textContent writes per probe change, which happens at most twelve times across the whole field, not per frame.',
        'Tabular figures mean the nine swaps never change the width of the column, so a probe move causes no layout at all.'
      ],
      packages: [
        { p: 'none required', w: 'Nine polylines of twelve points each. Any charting library would be 40kb to draw 108 lineTo calls and would bring its own opinions about axes, legends and tooltips, all of which this concept rejects.' },
        { p: 'no recharts, no chart.js, no visx', w: 'Explicitly. Every one of them makes a dashboard by default, and the entire argument of the concept is that this is not a dashboard.' },
        { p: 'gsap (installed)', w: 'Only for the row entry stagger, and only because it is already in the bundle. A CSS transition with a per-row delay does the same job.' }
      ],
      architecture: [
        { f: 'components/sections/AboutLedger.tsx', r: 'Server Component. Renders the whole table as real HTML with the means in place, plus the note. Fully readable and copyable with JavaScript off.' },
        { f: 'components/about/WeekProbe.tsx', r: '"use client". Owns the canvas, the measurement, the probe state and the render loop. Receives the rows as props.' },
        { f: 'lib/about/ledger.ts', r: 'The nine rows, the four week shapes, the derivation of the twelve week series and the deltas. Pure, and the derivation runs once at module load rather than per render.' }
      ],
      state: [
        '`probeWeek` is the only useState value, an integer from -1 to 11. It changes on human input.',
        'The damped probe position, the measured row bands and the series column geometry are refs written by the loop and the observer.',
        'The nine logged figures are written with textContent from the probe handler, not through React, because they change together and always to a known value.',
        'Cancel the frame and disconnect the ResizeObserver on unmount.'
      ],
      typography: [
        'Activity names: Space Grotesk 400 at clamp(0.9375rem, 1.15vw, 1.0625rem), var(--ink). Prose, so not mono.',
        'Every figure: JetBrains Mono 500 at 0.9375rem with font-variant-numeric: tabular-nums. Non-negotiable, or the column shivers on every probe move.',
        'Column heads: mono 500 at 0.5625rem, tracking 0.2em, uppercase, var(--ink-4).',
        'The delta carries its sign as a character, never as a colour alone, at var(--ink-2).',
        'The note: display 400 at 0.75rem / 1.55, var(--ink-3), measure 74ch, with the single word "model" at weight 500 in the accent hue.'
      ],
      color: [
        'Signature hue #8DA750 appears on the polylines at 0.88, the dotted mean rules at 0.22, the probed column underline, and the word "model" in the note. Nowhere else.',
        'The probe rule and its nine dots are pure white, the only pure white on the page, which is what makes the reader position unmistakable at a glance.',
        'Row hairlines at var(--line), 8% ink. Nine rows with heavier rules would read as a spreadsheet.',
        'The delta column does not use red and green. Up and down are carried by the sign character and by nothing else, which also removes the implication that one direction is bad.',
        'Light theme: ground #FAFAF8, hairlines at rgba(20,20,26,0.1), the accent darkens to #5D7024 for contrast on the polylines, and the probe becomes the ink colour.'
      ],
      spacing: [
        'Rows 3.25rem tall on desktop, which is set by the mono figure size plus enough air that the polyline behind it never touches the type.',
        'The series polyline occupies the middle 62% of its row band with its zero line at 82% of the band height, so consecutive rows never appear to share a curve.',
        'Figure columns fixed at 6.5rem so the three of them align regardless of value, and so the column head abbreviations do not change the layout.',
        'Total row separated by a 1px rule with 0.75rem above and 0.75rem below, the only place in the table with extra space.',
        'The note sits 2rem under the table, above the hint clearance.'
      ],
      relationships: [
        'Vertical position within a row band IS hours, on one shared scale across all nine rows. That shared scale is the honesty: a small row must look small.',
        'The dotted rule is the row mean, so a series that spends most of twelve weeks above its own dotted line is a row that a few quiet weeks are dragging down.',
        'The gap between the logged and guessed columns is the whole argument, and the delta column is that gap made explicit so nobody has to do the subtraction.',
        'The probe rule makes nine independent series into a single cross-section: what an actual week 7 looked like across everything at once.'
      ],
      acceptance: [
        'The two totals are identical and the delta total is exactly zero.',
        'Moving across the field swaps all nine figures with no column shift and no shiver.',
        'Arrow keys, Home, End and Escape do everything the pointer does, and the announced value names the week and every reading in it.',
        'Every number in the concept is selectable text; none of them is painted into the canvas.',
        'The note names the series as a model, and the accessible description repeats it.',
        'On a 375px screen each activity is a stacked block with a full width series and no horizontal scroll anywhere.',
        'With reduced motion set the probe jumps between weeks and everything else is identical.'
      ]
    }
  });

  /* ==========================================================================
     SECTION 01  -  ANCHOR
     --------------------------------------------------------------------------
     A two column split where the left column holds and the right column moves.
     The left is the standing statement: who, what, and the one sentence that
     does not change. The right is six dated beats that pass it.

     WHY STICKY AND NOT A PINNED RAIL
     --------------------------------
     A sticky column consumes exactly as much scroll as the content beside it
     needs, and not one pixel more. A pinned rail decides in advance how long
     the reader will be held, which is the thing that makes pinned sections
     feel like a hostage negotiation. The section is as tall as six beats, the
     left column stays for exactly that long, and then the page continues.

     WHY THERE IS NO TICKER IN THIS CONCEPT
     --------------------------------------
     Nothing here is continuous except one 2px tick, which is driven by the
     shared scrub helper. The beat state is a threshold, so it is an
     IntersectionObserver. A rAF loop would be a loop that spends most of its
     life computing that nothing changed.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'about-section-anchor',
    num: 1,
    pageOf: 'about-page-transcript',
    screens: 3.2,
    name: 'Anchor',
    kind: 'DOM / sticky split',
    accent: HUE.interview,
    tagline: 'One side holds still while the other one moves',
    desc: 'The standing statement sits and stays; six dated beats pass it on the right. ' +
          'The left column counts them off, so the reader always knows where in the history they are.',
    interaction: 'Scroll. The left column holds for exactly as long as the six beats take and then releases.',
    hint: 'Scroll &middot; The left column holds',

    /* Miniature: a fixed left block and a moving column of right blocks.
       Twenty six operations. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.08;
      var midX = w * 0.42;
      var drift = ((t * 22) % (h * 0.42));
      var i, y;

      /* Left: the anchor. It never moves. */
      box(ctx, padX, h * 0.30, midX - padX - w * 0.04, 3, 'rgba(236,236,239,0.82)');
      box(ctx, padX, h * 0.40, (midX - padX - w * 0.04) * 0.7, 1.5, 'rgba(95,168,211,' + (0.6 + heat * 0.3).toFixed(3) + ')');
      box(ctx, padX, h * 0.52, (midX - padX - w * 0.04) * 0.5, 1, 'rgba(236,236,239,0.20)');
      box(ctx, padX, h * 0.58, (midX - padX - w * 0.04) * 0.62, 1, 'rgba(236,236,239,0.20)');

      hair(ctx, midX, h * 0.10, midX, h * 0.90, 'rgba(236,236,239,0.10)');

      /* Right: four beats scrolling past. */
      for (i = -1; i < 4; i++) {
        y = h * 0.14 + i * h * 0.42 + drift;
        if (y < h * 0.04 || y > h * 0.92) continue;
        box(ctx, midX + w * 0.05, y, w * 0.06, 1.5, 'rgba(95,168,211,0.75)');
        box(ctx, midX + w * 0.05, y + h * 0.07, (w - midX) * 0.62, 2, 'rgba(236,236,239,0.66)');
        box(ctx, midX + w * 0.05, y + h * 0.14, (w - midX) * 0.78, 1, 'rgba(236,236,239,0.20)');
        box(ctx, midX + w * 0.05, y + h * 0.19, (w - midX) * 0.5, 1, 'rgba(236,236,239,0.20)');
      }

      /* The tick on the anchor rail. */
      box(ctx, padX - 6, h * 0.30 + (drift / (h * 0.42)) * h * 0.4, 2, 12, 'rgba(95,168,211,0.9)');
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var b = bag();
      var B = BIO.beats;

      root.classList.add('about-sec', 'about-anchor');
      tint(root, HUE.interview);

      /* ------------------------------------------------------------- DOM */
      var wrap = SE.el('div', 'about-anchor__wrap');

      var hold = SE.el('div', 'about-anchor__hold');
      hold.innerHTML =
        '<div class="about-anchor__holdin">' +
          '<h2 class="about-sec__title">' + BIO.name + '</h2>' +
          '<p class="about-anchor__role t-num">' + BIO.role.toUpperCase() + '</p>' +
          '<p class="about-anchor__thesis">' + BIO.thesis + '</p>' +
          '<p class="about-sec__lede">' + BIO.standfirst + '</p>' +
          '<div class="about-anchor__count">' +
            '<span class="about-anchor__rail" aria-hidden="true"><i></i></span>' +
            '<span class="about-anchor__now t-num" role="status" aria-live="polite"></span>' +
          '</div>' +
        '</div>';
      wrap.appendChild(hold);

      var move = SE.el('ol', 'about-anchor__move');
      move.innerHTML = B.map(function (bt, i) {
        return '<li class="about-anchor__beat" data-beat="' + i + '">' +
          '<span class="about-anchor__yr t-num">' + bt.yr + '</span>' +
          '<h3 class="about-anchor__bt">' + bt.t + '</h3>' +
          '<p class="about-anchor__bb">' + bt.b + '</p>' +
        '</li>';
      }).join('');
      wrap.appendChild(move);
      root.appendChild(wrap);

      /* The affordance lives inside the holding column, so it is reachable at
         any point during the hold rather than parked at the bottom where a
         reader convinced by beat two has to scroll past four more to find it.
         `is-on` is added immediately because there is nothing to earn here:
         the section never hides its own exit. */
      var more = SE.seeMore('Hear the full interview', ctx.onSeeMore);
      more.classList.add('about-anchor__more', 'is-on');
      SE.$('.about-anchor__holdin', hold).appendChild(more);

      /* ----------------------------------------------------------- state */
      var beats = SE.$$('.about-anchor__beat', move);
      var nowEl = SE.$('.about-anchor__now', hold);
      var tickEl = SE.$('.about-anchor__rail i', hold);
      var active = -1;

      function setActive(i) {
        if (i === active) return;
        active = i;
        nowEl.textContent = SE.pad(i + 1) + ' / ' + SE.pad(B.length) + '  ' + B[i].yr;
        beats.forEach(function (el, k) { el.classList.toggle('is-now', k === i); });
      }

      /* Which beat is current is a threshold question, so it is an observer,
         not a scrub. The band is the middle 40% of the viewport, which means
         a beat becomes current when it is where a reader is actually looking. */
      if (typeof IntersectionObserver !== 'undefined') {
        var io = b.obs(new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('is-in');
              setActive(+e.target.getAttribute('data-beat'));
            }
          });
        }, { root: ctx.scroller, threshold: 0.01, rootMargin: '-30% 0px -30% 0px' }));
        beats.forEach(function (el) { io.observe(el); });

        /* A second observer with no inset margin handles the reveal, so a
           beat that never reaches the middle band still arrives. */
        var io2 = b.obs(new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-in');
            io2.unobserve(e.target);
          });
        }, { root: ctx.scroller, threshold: 0.12 }));
        beats.forEach(function (el) { io2.observe(el); });
      } else {
        beats.forEach(function (el) { el.classList.add('is-in'); });
      }
      setActive(0);

      if (env.reduced) beats.forEach(function (el) { el.classList.add('is-in'); });

      /* The one continuous value in the concept: a 2px tick on the left rail.
         Transform only, and it comes from the shared scrub helper rather than
         from a scroll listener of our own. */
      var scrub = b.kill(SE.scrub(ctx.scroller, wrap, function (p) {
        tickEl.style.transform = 'translate3d(0,' + (p * 100).toFixed(2) + 'px,0)';
      }));

      return {
        destroy: function () {
          b.all();
          root.classList.remove('about-sec', 'about-anchor');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A sticky standing statement beside six dated beats that scroll past it.',
      philosophy: [
        'One side holds and one side moves. That is the entire structure, and it is the correct one for a biography: there is a person who does not change and a sequence of things that happened to them.',
        'Sticky, not pinned. A sticky column consumes exactly as much scroll as the content beside it needs. A pinned rail decides in advance how long the reader will be held, which is what makes pinned sections feel like a hostage negotiation.',
        'The beats are dated and specific. "A pharmacy under a counter" and "an inventory system on a laptop on a UPS" are the kind of detail that cannot be written by someone who was not there, which is the only thing that makes a career history worth reading.',
        'The left column counts the beats off, so the reader always knows where in six years they are without a progress bar anywhere on the page.'
      ],
      hierarchy: [
        '1. The name, at clamp(2rem, 4.2vw, 3.5rem), weight 500, tracking -0.045em. It is the largest thing and it never moves.',
        '2. The current beat title on the right at clamp(1.375rem, 2.4vw, 1.875rem).',
        '3. The thesis line under the name at clamp(1.125rem, 1.7vw, 1.375rem) in the accent hue.',
        '4. The standfirst at 68ch, var(--ink-2).',
        '5. The counter, "03 / 06  2020", mono at 0.625rem with a 2px tick beside it. The only element that moves continuously.',
        '6. Beat years, mono, in the accent hue, hanging in the left margin of each beat.'
      ],
      structure: [
        'Section root is ordinary block flow, because it lives inside somebody else scrolling page and must not be absolutely positioned.',
        'One wrap at `display: grid; grid-template-columns: minmax(0, 27rem) minmax(0, 1fr)` with a `clamp(2rem, 6vw, 6rem)` gap.',
        'Left column child is `position: sticky; top: 0; min-height: 100svh; display: flex; align-items: center`, so the statement is optically centred while it holds.',
        'Right column is an ordered list of six beats, each `padding-block: clamp(4rem, 16vh, 9rem)`, which is what makes the section roughly 3.2 viewports tall.',
        'The See more button lives inside the sticky column, so it is reachable at any point during the hold rather than only at the end.'
      ],
      interaction: [
        'Scroll, and nothing else. No hijack, no snap, no wheel handler.',
        'The current beat comes from an IntersectionObserver with `rootMargin: -30% 0px -30% 0px`, so a beat becomes current when it is in the middle 40% of the viewport, which is where a reader is actually looking.',
        'A second observer with `threshold: 0.12` and no inset handles the entry reveal and unobserves each beat after it fires, so nothing keeps firing after the first pass.',
        'The 2px tick is driven by the shared scrub helper over the section, which uses ScrollTrigger when it is present and a passive listener on the section scroller when it is not.',
        'There is no rAF loop in this concept at all.'
      ],
      choreography: [
        { n: 'Beat entry', d: 'opacity 0 to 1 and translate3d(0, 22px, 0) to 0, 620ms, cubic-bezier(0.23, 1, 0.32, 1). One reveal per beat, fired once, then unobserved. No stagger inside a beat: the year, the title and the body arrive together because they are one thought.' },
        { n: 'Current beat', d: 'The year goes from var(--ink-4) to the accent hue and a 1px rule to its left scales from scaleY(0) to scaleY(1) over 320ms, transform-origin top. The body does not change; a paragraph that brightens as you read it is a paragraph competing with itself.' },
        { n: 'Counter', d: 'textContent swap with no transition. "03 / 06  2020" changes six times in the whole section and has to be readable at the instant it changes.' },
        { n: 'Tick', d: 'translate3d on Y across a 100px rail, driven directly by scrub progress, no easing. It is a position readout and a position readout that lags is wrong.' },
        { n: 'The hold release', d: 'Nothing. Sticky ends by itself and the left column scrolls away with the page. Fading it out at the boundary would be the concept apologising for its own structure.' }
      ],
      scroll: [
        'The section is roughly 3.2 viewports tall, determined by the six beats and their padding, not by a magic number in a rail.',
        'It consumes scroll rather than fighting it: the reader can scroll straight through at any speed and arrives at the next section with momentum intact.',
        'No `window.addEventListener("scroll")`. The tick uses the shared scrub helper; everything else is an observer.',
        'Both observers are disconnected in destroy, and the scrub is killed.'
      ],
      hover: [
        'Gated behind `@media (hover: hover) and (pointer: fine)`.',
        'The only hover state in the section is on the See more button, which reverses its fill from the bottom edge over 220ms.',
        'Beats do not respond to hover. They are read, not chosen.'
      ],
      click: [
        'One click target: "Hear the full interview", which opens the Transcript page concept.',
        'It lives in the sticky column so it is available during the whole hold, not parked at the bottom where a reader who is convinced at beat two has to scroll past four more to reach it.'
      ],
      responsive: {
        desktop: 'Two columns, sticky left at 27rem, beats on the right at 62ch. Beat padding clamp(4rem, 16vh, 9rem).',
        tablet: 'Left column narrows to 20rem and the standfirst drops to 56ch. The sticky behaviour is unchanged.',
        mobile: 'Below 768px there is no split, because a 375px column cannot hold two of anything. The statement becomes a normal opening block that scrolls away, the counter and its tick are removed (the beats are directly adjacent now, so counting them off is redundant), and the six beats become a single column with the year as a hanging mono label above each title. The See more button stays with the statement, which is now the opening block, so it is the first thing after the standfirst rather than a permanent fixture in a column that no longer exists.'
      },
      a11y: [
        'The beats are a real ordered list, so a screen reader announces "list of six items" and the sequence is structural rather than visual.',
        'The counter is `role="status" aria-live="polite"` and announces "03 / 06 2020" once per beat.',
        'The reveal only animates opacity and transform. Every beat is in the DOM, in order, and readable at all times.',
        'Under `prefers-reduced-motion: reduce` every beat is revealed immediately, the tick does not move, and the sticky column still holds. Sticky is layout, not motion, and removing it would break the composition rather than calm it.',
        'The See more button is a real button with a descriptive label, not an icon or a chevron.',
        'The section never traps focus and never prevents the reader from leaving.'
      ],
      perf: [
        'No requestAnimationFrame anywhere in this concept.',
        'Two IntersectionObservers over six elements. The reveal observer unobserves each element as it fires, so after the first pass it is watching nothing.',
        'One transform write per scroll frame for the tick.',
        'Sticky positioning is handled by the compositor. There is no JavaScript involved in holding the left column.',
        'Six beats, no canvas, no images. This is the cheapest concept in the area, and that is a legitimate reason to choose it.'
      ],
      packages: [
        { p: 'none required', w: 'position: sticky plus two observers. Every part of this is a browser primitive.' },
        { p: 'gsap ScrollTrigger (installed)', w: 'Only for the tick, and only because it smooths the value. A passive scroll listener on the section scroller is the documented fallback and it works.' },
        { p: 'no framer-motion', w: 'Six reveals with one transition each. A layout animation library here would be 40kb to replace nine lines of CSS.' }
      ],
      architecture: [
        { f: 'components/sections/AboutAnchor.tsx', r: 'Server Component. The statement, the six beats and the See more link all render as static HTML; the section is complete before hydration.' },
        { f: 'components/about/BeatReveal.tsx', r: '"use client". A thin wrapper that attaches the two observers and toggles classes. Renders its children unchanged.' },
        { f: 'app/about/interview/page.tsx', r: 'The See more destination. This section is the teaser and that route is the full argument, so it must be built as part of the same task.' },
        { f: 'lib/about/beats.ts', r: 'The six beats as typed data, shared with the interview page.' }
      ],
      state: [
        '`currentBeat` is the only useState value and it changes six times.',
        'The revealed set is handled entirely with class names, not state: reveal is a one-way transition and putting it in state means re-rendering six components to add a class.',
        'The tick position is written directly to the element style from the scrub callback.',
        'Disconnect both observers and kill the scrub on unmount.'
      ],
      typography: [
        'Name: display 500 at clamp(2rem, 4.2vw, 3.5rem), tracking -0.045em, line-height 0.94.',
        'Role: mono 500 at 0.625rem, tracking 0.24em, uppercase, var(--ink-4). It is a label, so it is mono.',
        'Thesis: display 400 at clamp(1.125rem, 1.7vw, 1.375rem) in the accent hue.',
        'Beat title: display 500 at clamp(1.375rem, 2.4vw, 1.875rem), tracking -0.035em.',
        'Beat body: display 400 at 1.0625rem / 1.66, var(--ink-2), measure 62ch.',
        'Years: mono 500 at 0.6875rem, tracking 0.2em, tabular, hanging in the left margin of each beat.'
      ],
      color: [
        'Signature hue #5FA8D3 on the thesis line, the current beat year, the current beat rule and the tick. Four places.',
        'Everything else is the ink ramp: title at var(--ink), body at var(--ink-2), inactive years at var(--ink-4).',
        'One vertical hairline at var(--line) between the two columns, which is the only structural line in the section.',
        'No fills, no cards, no panels. Six beats separated by space rather than by boxes.',
        'Light theme: ground #FAFAF8, hairline rgba(20,20,26,0.1), and the accent darkens to #2F7DA8 for the thesis line.'
      ],
      spacing: [
        'Column gap clamp(2rem, 6vw, 6rem). Wide enough that the two columns are separate documents rather than a table.',
        'Beat padding-block clamp(4rem, 16vh, 9rem), which sets the section at roughly 3.2 viewports and gives each beat the middle of the screen to itself.',
        'Year hangs 3.5rem to the left of the beat title on desktop, inside the right column, so the years form their own vertical line.',
        'Sticky column vertically centred with `align-items: center` at `min-height: 100svh`, using svh rather than vh so it does not jump when a mobile browser bar hides.',
        'Section padding-block clamp(4rem, 12vh, 8rem) top and bottom, so the sticky hold starts and ends cleanly against the neighbouring sections.'
      ],
      relationships: [
        'Holding still versus moving encodes permanence versus history. It is the only structural metaphor in the section and everything else defers to it.',
        'The counter connects the two columns: it is the one element on the left that is caused by something on the right.',
        'Year position encodes sequence, and the years hanging in their own margin makes the sequence readable as a column at a glance without reading a single title.',
        'The accent hue marks exactly one beat at a time, which is what makes "where am I" answerable without the counter.'
      ],
      acceptance: [
        'The left column holds for the full length of the six beats and releases cleanly into the next section.',
        'The counter reads the correct beat as each one reaches the middle of the viewport.',
        'A fast scroll straight through the section arrives at the next one with momentum intact and nothing half-revealed.',
        'The See more button is reachable at any point during the hold.',
        'On a 375px screen there is no split, the years hang above their titles, and the See more button sits under the opening statement.',
        'With reduced motion set every beat is visible immediately and the section still reads as a two column composition.'
      ]
    }
  });

  /* ==========================================================================
     SECTION 02  -  SENTENCE
     --------------------------------------------------------------------------
     One sentence, forty eight words long, that finishes itself while the
     reader scrolls through it. The sticky viewport holds one screen; scroll
     progress is a single number written to the container, and every word works
     out its own opacity from it in CSS.

     WHY ONE CUSTOM PROPERTY AND NOT FORTY EIGHT WRITES
     --------------------------------------------------
     The obvious implementation writes an opacity to each word every frame,
     which is forty eight style writes and forty eight recalculations sixty
     times a second. Writing `--p` once and letting each word compute
     `clamp(0.14, (var(--p) * 48 - var(--i)) * 2.6, 1)` is one write, and the
     browser resolves the rest in the style engine where it belongs.

     WHY THE SENTENCE IS ONE SENTENCE
     --------------------------------
     Because the mechanism only means anything if the reader cannot finish the
     thought without reaching the end. A paragraph revealed word by word is a
     gimmick; a single clause-stacked sentence with its point in the last five
     words is a reason to keep scrolling.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'about-section-sentence',
    num: 2,
    pageOf: 'about-page-manifesto',
    screens: 2.9,
    name: 'Sentence',
    kind: 'DOM / one scrubbed value',
    accent: HUE.argument,
    tagline: 'A sentence that will not finish without you',
    desc: 'Forty eight words held on one screen, arriving as the reader scrolls through the section. ' +
          'The point is in the last five words, so the mechanism and the meaning end together.',
    interaction: 'Scroll. The sentence completes at your pace and the closing clause takes the accent when it lands.',
    hint: 'Scroll &middot; The sentence completes as you go',

    /* Miniature: word rules with a resolving boundary. Around thirty
       operations, and the layout is arithmetic rather than a stored list. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.10;
      var iw = w - padX * 2;
      var lines = 5;
      var lh = h * 0.11;
      var top = h * 0.26;
      var p = SE.math.clamp(((t * 0.20) % 1.6) - 0.1, 0, 1);
      var i, j, x, y, wd, idx = 0, total = 24;

      for (j = 0; j < lines; j++) {
        y = top + j * lh;
        x = padX;
        for (i = 0; i < 5; i++) {
          wd = iw * (0.09 + ((idx * 7) % 5) * 0.032);
          if (x + wd > w - padX) break;
          var lit = SE.math.clamp((p * total - idx) * 2.2, 0.12, 1);
          box(ctx, x, y, wd, 2,
            idx >= total - 5
              ? 'rgba(220,199,161,' + (lit * (0.55 + heat * 0.4)).toFixed(3) + ')'
              : 'rgba(236,236,239,' + (lit * 0.85).toFixed(3) + ')');
          x += wd + iw * 0.022;
          idx++;
        }
      }

      hair(ctx, padX, h * 0.16, padX + iw * p, h * 0.16, 'rgba(220,199,161,0.5)');
    },

    mount: function (root, ctx) {
      var env = SE.env, M = SE.math;
      var b = bag();

      root.classList.add('about-sec', 'about-sentence');
      tint(root, HUE.argument);

      var parts = BIO.sentence.split(' ');
      var N = parts.length;
      /* The tail is the last clause, "because everything else is preference and
         the feedback loop is the tool." It is the point of the sentence, so it
         is the only part that changes colour, and only once it has all
         arrived. */
      var TAIL = N - 12;

      /* ------------------------------------------------------------- DOM */
      /* 48 words over roughly 1.9 screens of travel is about 25 words a
         screen: slow enough to read, fast enough not to feel held. A phone
         holds fewer words per screen, so the same rail would make the sentence
         crawl; it shortens rather than staying constant. */
      var rail = b.rail(SE.scrollRail(ctx.scroller, env.mobile ? 2.2 : 2.9));

      var stage = SE.el('div', 'about-sentence__stage');
      var inner = SE.el('div', 'about-sentence__inner');

      var line = SE.el('p', 'about-sentence__line');
      line.style.setProperty('--n', String(N));
      /* Joined on a real space, so the line breaks normally and a selection
         copies ordinary spaces. An nbsp inside each span would make the whole
         sentence one unbreakable run. */
      line.innerHTML = parts.map(function (word, i) {
        return '<span class="about-sentence__w' + (i >= TAIL ? ' about-sentence__w--tail' : '') +
               '" style="--i:' + i + '">' + word + '</span>';
      }).join(' ');
      inner.appendChild(line);

      var foot = SE.el('div', 'about-sentence__foot');
      foot.innerHTML = '<span class="about-sentence__count t-num">' + N + ' WORDS</span>';
      inner.appendChild(foot);

      var more = SE.seeMore('Read the argument behind it', ctx.onSeeMore);
      more.classList.add('about-sentence__more');
      foot.appendChild(more);

      stage.appendChild(inner);
      rail.sticky.appendChild(stage);
      root.appendChild(rail.rail);

      /* ----------------------------------------------------------- state */
      var target = 0, drawn = 0, done = false;

      /* Reduced motion: the sentence is complete and static. It is a sentence;
         the reader has lost nothing but the timing. */
      if (env.reduced) {
        line.style.setProperty('--p', '1');
        root.classList.add('is-done');
        more.classList.add('is-on');
      } else {
        var scrub = b.kill(SE.scrub(ctx.scroller, rail.rail, function (p) {
          /* The sentence finishes at 82% of the rail so the reader gets a
             beat to read the completed thing before the section leaves. A
             sentence that completes on the last pixel is a sentence nobody
             ever sees whole. */
          target = M.clamp(p / 0.82, 0, 1);
        }));

        b.tick(function (dt) {
          drawn = M.damp(drawn, target, 10, dt);
          if (Math.abs(drawn - target) < 0.0006) drawn = target;
          line.style.setProperty('--p', drawn.toFixed(4));
          var nowDone = drawn > 0.985;
          if (nowDone !== done) {
            done = nowDone;
            root.classList.toggle('is-done', done);
            more.classList.toggle('is-on', done);
          }
        });
      }

      return {
        destroy: function () {
          b.all();
          root.classList.remove('about-sec', 'about-sentence', 'is-done');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A forty eight word sentence that completes itself as the reader scrolls through the section.',
      philosophy: [
        'The mechanism only means anything if the reader cannot finish the thought without reaching the end. The point of the sentence is in its last five words, so the reveal and the meaning finish together.',
        'One sentence, not a paragraph. A paragraph revealed word by word is a gimmick; a clause-stacked sentence with its payoff at the end is a reason to keep scrolling.',
        'The reveal is opacity only. No blur, no letter spacing animation, no character scramble. Those all make the text harder to read at exactly the moment it becomes readable.',
        'It finishes at 82% of the rail, not at 100%. A sentence that completes on the last pixel of the section is a sentence nobody ever sees whole.'
      ],
      hierarchy: [
        '1. The sentence. It is the only content, set at clamp(1.5rem, 3.4vw, 3rem) with a 24ch measure so it stacks into eight or nine lines.',
        '2. The last twelve words, which take the accent hue the moment the sentence is complete.',
        '3. The word count in mono at 0.625rem, bottom left. It is a real count of the sentence above it, not a decoration.',
        '4. The See more button, which appears only once the sentence is finished, because offering the long version before the short one has landed is offering the wrong thing.'
      ],
      structure: [
        'Section root is ordinary block flow. Inside it, the shared scroll rail: an over-tall div with a `position: sticky` one-screen child.',
        'Sticky child holds one flex-centred inner block containing the sentence and a footer row.',
        'The sentence is a single p with forty eight span children, each carrying `--i` as its index. The p carries `--n` (48) and `--p` (progress).',
        'No wrapper per line and no line breaks in the markup. The measure does the wrapping, so it reflows correctly at every width.',
        'The See more button is inside the footer, alongside the word count.'
      ],
      interaction: [
        'Scroll, and nothing else. The section is 2.9 viewports tall and consumes scroll rather than trapping it.',
        'The shared scrub helper gives 0..1 over the rail. It is divided by 0.82 and clamped, so the sentence completes with roughly half a viewport of rail left.',
        'The progress damps toward the scrub target at lambda 10, about 180ms, and snaps exactly when it is within 0.0006 so the final state is exact rather than asymptotic.',
        'One custom property write per frame. Every word derives its own opacity in CSS from `clamp(0.14, (var(--p) * var(--n) - var(--i)) * 2.6, 1)`.',
        'The 2.6 multiplier makes the transition band about a third of a word wide, so words arrive as words rather than as a continuous smear across the paragraph.'
      ],
      choreography: [
        { n: 'Word arrival', d: 'opacity from 0.14 to 1, computed per word in CSS from one shared progress value. No transition property on the words at all: the value is already continuous and a transition on top of a scrub lags behind the scrollbar.' },
        { n: 'The tail', d: 'The last twelve words transition color from var(--ink) to the accent hue over 420ms cubic-bezier(0.23, 1, 0.32, 1) when progress passes 0.985. It fires once, and it is the only colour change in the section.' },
        { n: 'See more', d: 'opacity 0 to 1 and translate3d(0, 10px, 0) to 0 over 420ms, tied to the same 0.985 threshold. It appears with the payoff, not before it.' },
        { n: 'What does not animate', d: 'Nothing enters when the section comes into view. The sentence begins at its resting position with its first words already legible, so a reader who lands mid-section is reading, not waiting.' },
        { n: 'Snap at the end', d: 'When the damped value is within 0.0006 of the target it is set exactly equal. Without it, the last word sits at 0.998 opacity forever and the tail threshold flickers.' }
      ],
      scroll: [
        'Uses the shared scroll rail: an over-tall container with a sticky one-screen viewport. Sticky rather than a pinned trigger, because pinning inside a nested scroll container rewrites layout and this section lives inside one.',
        '2.9 viewports of rail. That is 48 words over roughly 1.9 screens of travel, which is about 25 words per screen: slow enough to read, fast enough not to feel held.',
        'The reader can scroll straight through at any speed. There is no snap, no wheel capture and no minimum dwell.',
        'The scrub is killed and the ticker unsubscribed in destroy.'
      ],
      hover: [
        'None on the sentence. It is text to be read, and text that reacts to a passing pointer invites pointing instead of reading.',
        'The See more button has the standard directional fill, gated behind `@media (hover: hover) and (pointer: fine)`.'
      ],
      click: [
        'One click target: "Read the argument behind it", which opens the Manifesto page concept.',
        'It is disabled and invisible until the sentence completes. Offering the long version before the short one has landed is offering the wrong thing.'
      ],
      responsive: {
        desktop: 'Sentence at clamp(1.5rem, 3.4vw, 3rem), measure 24ch, centred in a one-screen sticky viewport. Footer pinned to the bottom of that viewport.',
        tablet: 'Measure widens to 26ch as the type step drops, so the line count stays near nine rather than growing past twelve.',
        mobile: 'Below 768px the rail shortens from 2.9 to 2.2 viewports, because a phone screen holds fewer words and the same rail length would make the sentence crawl. Type drops to 1.5rem with a 20ch measure, the sentence is left aligned instead of centred (centred ragged type at small sizes is harder to scan), and the footer becomes a stacked block with the word count above a full-width 44px See more button.'
      },
      a11y: [
        'The sentence is one continuous string of real text in the DOM at all times. Selecting and copying it gives the whole sentence with correct spacing, because the separators are real spaces between the spans rather than entities glued inside them.',
        'Opacity never goes below 0.14 and every word reaches 1. Nothing is ever `display: none` or `visibility: hidden`, so a screen reader reads the finished sentence regardless of scroll position.',
        'Under `prefers-reduced-motion: reduce` the progress is set to 1 at mount, the tail is already accented, the See more button is already visible, and no loop runs at all.',
        'The See more button is a real button with a descriptive label.',
        'The word count is a true count of the sentence above it, so it is data rather than decoration and is announced as such.'
      ],
      perf: [
        'Exactly one custom property write per frame. The forty eight word opacities are resolved by the style engine, not by JavaScript.',
        'Opacity only. No transform on the words, no filter, no blur, and therefore no layer explosion from forty eight promoted elements.',
        'The loop stops writing once the damped value snaps to the target, so a stationary reader mid-sentence costs one comparison per frame.',
        'No canvas, no images, no measurement. This concept is essentially free.',
        'Sticky positioning is compositor-driven; there is no JavaScript holding the viewport.'
      ],
      packages: [
        { p: 'none required', w: 'One scrub value and one CSS expression. There is nothing here for a library to do.' },
        { p: 'gsap ScrollTrigger (installed)', w: 'Provides the scrub with its own smoothing. The documented passive-listener fallback works identically, just less smoothly.' },
        { p: 'no split-text plugin', w: 'The split is on spaces and it happens once at build time on the server. A plugin that splits DOM text at runtime would do the same job after hydration and cause a visible reflow.' }
      ],
      architecture: [
        { f: 'components/sections/AboutSentence.tsx', r: 'Server Component. Splits the sentence and renders forty eight spans with their indices. The sentence is in the HTML source, complete, before any JavaScript.' },
        { f: 'components/about/SentenceScrub.tsx', r: '"use client". Attaches the ScrollTrigger, damps the value and writes one custom property. Renders no markup.' },
        { f: 'app/about/manifesto/page.tsx', r: 'The See more destination. This section is the compressed version of that argument, so the route must be built with it.' },
        { f: 'lib/about/voice.ts', r: 'The sentence and the tail index as shared constants, so the section and the manifesto cannot drift apart.' }
      ],
      state: [
        'No useState at all. The only value is the damped progress, which lives in a ref and is written straight to a DOM node style.',
        'The completed flag is a class toggle, not state.',
        'The client leaf renders nothing, so it can never re-render.',
        'Kill the ScrollTrigger and cancel the frame on unmount.'
      ],
      typography: [
        'Sentence: Space Grotesk 400 at clamp(1.5rem, 3.4vw, 3rem), line-height 1.22, tracking -0.035em, measure 24ch.',
        'Line height 1.22 rather than a reading leading: at this size the sentence has to read as one block of type, and 1.6 would push nine lines past the height of the viewport.',
        'Word spans are `display: inline` and joined on real spaces, so line breaking is normal and a selection copies ordinary spaces. A non-breaking space inside each span makes the whole sentence one unbreakable run that overflows the viewport.',
        'Word count: mono 500 at 0.625rem, tracking 0.22em, uppercase, var(--ink-4).',
        'No mono anywhere in the sentence. It is the most prose thing in the whole area.'
      ],
      color: [
        'The sentence is var(--ink), varying only in opacity from 0.14 to 1.',
        'The last twelve words become #DCC7A1 once complete. That is the only hue in the section, and it appears exactly once.',
        'Ground var(--void), flat, with no vignette and no wash. There is one sentence on the screen and it does not need help.',
        'The word count sits at var(--ink-4), which is deliberately quiet: it is a fact about the sentence, not part of it.',
        'Light theme: ground #FAFAF8, ink #14141A on the same opacity ramp, and the accent darkens to #8A6E2E so the closing clause clears 4.5:1.'
      ],
      spacing: [
        'The sticky viewport is exactly one screen. The inner block is flex-centred within it, so the sentence sits at the optical centre at every viewport height.',
        'The footer is pinned to the bottom of the sticky viewport with 2rem of clearance, so it never collides with the sentence at any line count.',
        'Rail length 2.9 viewports on desktop, 2.2 on mobile.',
        'Section padding-block clamp(4rem, 12vh, 8rem) so the sticky hold begins and ends cleanly against its neighbours.',
        'Measure 24ch, which puts the sentence at nine lines on desktop and a block roughly 520px tall: enough to read as one shape inside a one screen viewport without touching the footer.'
      ],
      relationships: [
        'Horizontal reading order IS time. The word index is the only variable, and progress is the only input, so the mapping is completely legible after two words.',
        'The colour change encodes arrival at the point, which is why it happens to a clause and not to a single word: the payoff is a phrase.',
        'The See more button appearing at the same threshold encodes "now there is more", which is only true once the short version has been delivered.',
        'The word count is the section stating its own size, which is the same honesty the Ledger concept is built on.'
      ],
      acceptance: [
        'Scrolling through the section completes the sentence at roughly 82% of the rail, leaving time to read the whole thing before it leaves.',
        'Scrolling backwards uncompletes it smoothly with no flicker at the tail threshold.',
        'The completed sentence can be selected and copied as one correctly spaced string.',
        'The See more button appears only after the sentence completes.',
        'With reduced motion set the sentence is complete and accented at mount and no loop runs.',
        'On a 375px screen the rail is shorter, the sentence is left aligned, and the footer is a stacked block with a 44px button.',
        'DevTools shows one style write per frame during the scroll and no layout.'
      ]
    }
  });

  /* ==========================================================================
     SECTION 03  -  RESOLVE
     --------------------------------------------------------------------------
     The same procedural figure as the Portrait page, printed on a plate that
     resolves out of noise as the section is scrolled through. At the start the
     plate is scattered dots at random weights; by the end it is a lit halftone
     of the same distance field.

     WHY THE NOISE IS THE SAME DOTS
     ------------------------------
     The cheap version of this effect is a noise texture that cross-fades into
     an image. That reads as two pictures, one replacing the other. Here every
     dot in the noise is a dot of the portrait, displaced and mis-weighted, so
     the resolve is one picture finding itself. The reader can see individual
     dots travelling, which is the whole difference.

     WHY DOTS ARE BORN RATHER THAN FADED IN
     --------------------------------------
     Each cell carries a birth threshold. Below it the dot is not drawn at all,
     which means the plate genuinely gains density instead of the whole grid
     just getting brighter. Density arriving is what makes it read as a print
     coming up rather than as an opacity ramp.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'about-section-resolve',
    num: 3,
    pageOf: 'about-page-portrait',
    screens: 2.4,
    name: 'Resolve',
    kind: 'Canvas / scrubbed halftone',
    accent: HUE.figure,
    tagline: 'A likeness arriving out of its own noise',
    desc: 'A halftone plate whose dots start scattered and mis-weighted and travel into place as the section is read. ' +
          'No image is loaded; the noise and the portrait are the same two thousand dots.',
    interaction: 'Scroll. The plate resolves at your pace, and the copy beside it arrives with it.',
    hint: 'Scroll &middot; The plate resolves',

    /* Miniature: the coarse silhouette with a displacement that decays on a
       loop. Around thirty six operations. */
    preview: function (ctx, w, h, t, heat) {
      var cells = PRE.face;
      var dust = PRE.dust;
      var side = Math.min(w, h) * 0.86;
      var bw = side * 0.7;
      var bx = (w - bw) / 2;
      var by = (h - side) / 2;
      var p = SE.math.clamp(((t * 0.24) % 1.9) - 0.15, 0, 1);
      var i, c, d, r;

      ctx.beginPath();
      for (i = 0; i < cells.length; i++) {
        c = cells[i];
        d = dust[i % dust.length];
        if (p < (d.x * 0.8)) continue;
        r = (0.6 + c.h * 2.0) * (side / 92);
        var jx = (d.x - 0.5) * (1 - p) * bw * 0.5;
        var jy = (d.y - 0.5) * (1 - p) * side * 0.4;
        ctx.moveTo(bx + c.u * bw + jx + r, by + c.v * side + jy);
        ctx.arc(bx + c.u * bw + jx, by + c.v * side + jy, r, 0, TAU);
      }
      ctx.fillStyle = 'rgba(236,236,239,' + (0.34 + p * 0.5 + heat * 0.12).toFixed(3) + ')';
      ctx.fill();

      /* The plate edge. It never moves; only the ink inside it arrives. */
      ctx.strokeStyle = 'rgba(142,154,166,' + (0.28 + heat * 0.22).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(bx) + 0.5, Math.round(by) + 0.5, Math.round(bw), Math.round(side));
    },

    mount: function (root, ctx) {
      var env = SE.env, M = SE.math;
      var b = bag();

      root.classList.add('about-sec', 'about-resolve');
      tint(root, HUE.figure);

      /* ------------------------------------------------------------- DOM */
      var rail = b.rail(SE.scrollRail(ctx.scroller, env.mobile ? 2.0 : 2.4));

      var stage = SE.el('div', 'about-resolve__stage');
      var plate = SE.el('figure', 'about-resolve__plate');
      var canvasEl = SE.el('canvas', 'about-resolve__canvas');
      plate.appendChild(canvasEl);
      var cap = SE.el('figcaption', 'about-resolve__cap',
        'Signed distance field, ' + (env.mobile ? 11 : 8) + 'px screen. No photograph.');
      plate.appendChild(cap);
      stage.appendChild(plate);

      var copy = SE.el('div', 'about-resolve__copy');
      copy.innerHTML =
        '<h2 class="about-sec__title">There is no photograph of me on this site</h2>' +
        '<p class="about-sec__lede">' + BIO.standfirst + '</p>' +
        '<p class="about-resolve__note">The plate on the left is drawn, not loaded. It is four ellipses joined ' +
          'with a polynomial smooth minimum, lit from one key light and printed as a dot screen. ' +
          'It weighs nothing, it resizes without artefacts, and it is honest about being a drawing.</p>';
      stage.appendChild(copy);

      var more = SE.seeMore('Open the full plate', ctx.onSeeMore);
      more.classList.add('about-resolve__more');
      copy.appendChild(more);

      rail.sticky.appendChild(stage);
      root.appendChild(rail.rail);

      root.appendChild(SE.srList('Resolve: a procedurally drawn portrait plate',
        srItems(BIO.facts, function (f) {
          return { name: f.k, categoryLabel: 'about', role: f.v, note: '' };
        }), function () {}));

      /* The copy arrives on entry, not on the scrub. Text tied to a scrollbar
         is text nobody can read at their own pace, and the plate is already
         doing the scrubbed job. */
      var revealIo = revealer(copy, SE.$$('h2, p', copy), ctx.scroller, 90);
      if (revealIo) b.obs(revealIo);

      /* ----------------------------------------------------------- state */
      var cv = b.cv(SE.canvas(canvasEl));
      var cvx = cv.ctx;
      var field = null;
      var jit = null;          /* per cell: jx, jy, birth, weight noise */
      var step = 0;
      var target = env.reduced ? 1 : 0;
      var drawn = env.reduced ? 1 : 0;
      var last = -1;
      var RADII = 5;

      function build() {
        step = env.mobile ? 11 : 8;
        var side = Math.min(cv.w * 0.98, cv.h * 0.98);
        field = figureField(cv.w, cv.h, step, {
          side: side,
          bx: (cv.w - side) / 2,
          by: (cv.h - side) * 0.5
        });
        /* One seeded pass over the grid. Seeded, so the noise is identical on
           every reload: a resolve that starts differently each time is a
           resolve nobody can art-direct. */
        var rand = SE.rng(770118);
        var n = field.cols * field.rows;
        jit = { jx: new Float32Array(n), jy: new Float32Array(n), born: new Float32Array(n), w: new Float32Array(n) };
        for (var k = 0; k < n; k++) {
          jit.jx[k] = (rand() - 0.5) * 2;
          jit.jy[k] = (rand() - 0.5) * 2;
          jit.born[k] = rand() * 0.72;   /* all dots exist by p = 0.72 */
          jit.w[k] = 0.25 + rand() * 0.75;
        }
        last = -1;
      }
      cv.observe(function () { build(); render(drawn); });
      build();

      if (!env.reduced) {
        b.kill(SE.scrub(ctx.scroller, rail.rail, function (p) {
          /* Resolved by 78% of the rail, so the finished plate is on screen
             for a beat before the section leaves. */
          target = M.clamp(p / 0.78, 0, 1);
        }));
      } else {
        root.classList.add('is-static');
        more.classList.add('is-on');
      }

      /* ------------------------------------------------------------ draw */
      function render(p) {
        cv.clear();
        if (!field) return;
        var f = field, cols = f.cols, rows = f.rows, s = f.step;
        /* Displacement decays with the square of the remaining distance, so
           the last third of the resolve is a settle rather than a slide. */
        var d = (1 - p) * (1 - p) * s * 7;
        var i, j, k, px, py, lum, fall;

        for (var band = 0; band < RADII; band++) {
          var lo = band / RADII, hi = (band + 1) / RADII;
          var r = (0.20 + (band + 0.5) / RADII * 0.80) * s * 0.46;
          cvx.beginPath();
          for (j = 0; j < rows; j++) {
            py = j * s;
            fall = figureFall(f, py);
            for (i = 0; i < cols; i++) {
              k = j * cols + i;
              if (f.nz[k] <= 0) continue;
              if (p < jit.born[k]) continue;
              lum = figureLum(f, k, -0.42, -0.52, 0.74) * fall;
              /* Weight is wrong at the start and correct at the end, which is
                 why the noise reads as the same ink rather than as a texture
                 laid over the top. */
              lum = lum * p + jit.w[k] * (1 - p);
              if (lum < lo || lum >= hi) continue;
              if (lum < bayerAt(i, j) * 0.5) continue;
              px = i * s + (j % 2 ? s * 0.5 : 0) + jit.jx[k] * d;
              cvx.moveTo(px + r, py + jit.jy[k] * d);
              cvx.arc(px, py + jit.jy[k] * d, r, 0, TAU);
            }
          }
          cvx.fillStyle = 'rgba(236,236,239,' +
            ((0.22 + (band / (RADII - 1)) * 0.62) * (0.42 + p * 0.58)).toFixed(3) + ')';
          cvx.fill();
        }
      }

      /* With motion off the plate is drawn resolved at mount and there is
         nothing left to animate, so no loop is subscribed. */
      if (!env.reduced) {
        b.tick(function (dt) {
          drawn = M.damp(drawn, target, 8, dt);
          if (Math.abs(drawn - last) < 0.0015) return;
          last = drawn;
          render(drawn);
          more.classList.toggle('is-on', drawn > 0.72);
        });
      }
      render(drawn);

      return {
        destroy: function () {
          b.all();
          root.classList.remove('about-sec', 'about-resolve', 'is-static');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A procedurally drawn halftone plate that resolves out of its own noise as the section is read.',
      philosophy: [
        'Every dot in the noise is a dot of the portrait, displaced and mis-weighted. The cheap version of this effect cross-fades a noise texture into an image, which reads as two pictures replacing each other; this is one picture finding itself, and individual dots can be watched travelling.',
        'Dots are born rather than faded in. Each cell carries a birth threshold and is simply not drawn below it, so the plate gains real density instead of the whole grid getting brighter. Density arriving is what makes it read as a print coming up.',
        'No image is loaded anywhere, and the caption under the plate says so in plain language. The claim "no photograph" is the point of the section, so it is stated, not implied.',
        'The plate has a hard rectangular edge that never moves. Only the ink inside it arrives, which is what makes it a plate rather than a particle effect.'
      ],
      hierarchy: [
        '1. The plate. It occupies the left 46% of the sticky viewport at a 4:5 aspect, edged with a 1px rule.',
        '2. The heading, "There is no photograph of me on this site", at clamp(1.75rem, 3.2vw, 2.75rem).',
        '3. The standfirst at 68ch, var(--ink-2).',
        '4. The explanation of the drawing, at 0.9375rem var(--ink-3), which is where the technical honesty lives.',
        '5. The plate caption in mono at 0.5625rem: "Signed distance field, 8px screen. No photograph."',
        '6. The See more button, which appears once the plate is 72% resolved.'
      ],
      structure: [
        'Section root is ordinary block flow, containing the shared scroll rail with a sticky one-screen child.',
        'Sticky child is a grid: `grid-template-columns: minmax(0, 0.86fr) minmax(0, 1fr)` with a `clamp(2rem, 5vw, 5rem)` gap.',
        'Left cell is a figure holding one canvas plus a figcaption. The canvas is sized by the figure, and the figure has an `aspect-ratio: 4 / 5` with a `max-height: 72svh` cap.',
        'Right cell is the copy block, vertically centred.',
        'A visually-hidden focusable list carries the four facts, so the canvas is not the only content in the section for a screen reader.'
      ],
      interaction: [
        'Scroll. The shared scrub gives 0..1 over a 2.4 viewport rail, divided by 0.78 and clamped so the plate is finished with about half a viewport of rail left.',
        'Progress damps toward the scrub target at lambda 8, which is roughly 220ms, so a fast flick still resolves smoothly instead of snapping.',
        'The canvas repaints only when the damped progress has moved more than 0.0015. A reader stopped mid-resolve costs one comparison per frame.',
        'Displacement decays as `(1 - p)^2 * step * 7`, so the last third of the resolve is a settle rather than a slide. Linear decay makes the dots arrive all at once and look like a snap.',
        'Dot weight is `trueLum * p + noiseWeight * (1 - p)`, which is why the noise is made of the same ink and not of a different material.'
      ],
      choreography: [
        { n: 'Resolve', d: 'Progress 0 to 1 over 78% of a 2.4 viewport rail, damped at lambda 8. Three things move together: birth threshold gates density, displacement decays quadratically, and per-dot weight lerps from noise to true luminance.' },
        { n: 'Plate edge', d: 'A static 1px rule at accent 0.42. It does not draw itself in, does not fade, and does not scale. It is the frame, and a frame that animates is a frame competing with its own contents.' },
        { n: 'Copy arrival', d: 'The heading, standfirst and note fade in and rise 18px over 620ms cubic-bezier(0.23, 1, 0.32, 1) with a 90ms stagger, fired once by an IntersectionObserver at 0.15 threshold. They are not tied to the scrub: text that tracks a scrollbar is text nobody can read at their own pace.' },
        { n: 'See more', d: 'Appears at progress 0.72, when the plate is legible as a figure. Offering the full version before this one has resolved is offering something the reader cannot yet evaluate.' },
        { n: 'Light direction', d: 'Fixed at (-0.42, -0.52, 0.74) in this concept, unlike the page version. A section has one job and the pointer already has a job on this page; making the light interactive here would compete with scrolling.' }
      ],
      scroll: [
        'The shared scroll rail: over-tall container, sticky one-screen viewport. 2.4 viewports on desktop, 2.0 on mobile.',
        'The section consumes scroll and never traps it. A reader who scrolls straight through sees the plate resolve in about a second and arrives at the next section with momentum.',
        'Progress runs backwards correctly: scrolling up unresolves the plate through the same path.',
        'The scrub is killed, the ticker unsubscribed, the ResizeObserver disconnected and the canvas released in destroy.'
      ],
      hover: [
        'None. The plate is not interactive in section mode; the page version is where the light becomes a control.',
        'The See more button carries the only hover state, gated behind `@media (hover: hover) and (pointer: fine)`.',
        'The cursor over the plate stays the default. A canvas that changes the cursor without doing anything on click is a promise it does not keep.'
      ],
      click: [
        'One click target: "Open the full plate", which opens the Portrait page concept where the light becomes interactive.',
        'The plate itself is not clickable. Two ways to reach the same place, one of them invisible, is one too many.'
      ],
      responsive: {
        desktop: 'Two columns, plate at 0.86fr with a 4:5 aspect capped at 72svh, copy at 1fr. Field step 8px, roughly 1900 live cells.',
        tablet: 'Plate drops to 0.7fr and the copy measure falls to 56ch. Field step 9px.',
        mobile: 'Below 768px the split is abandoned. The plate becomes a full-width band at 42svh at the top of the sticky viewport with the caption directly under it, and the copy sits below at full width with the See more button as a 44px full-width control. The rail shortens from 2.4 to 2.0 viewports, the field step rises from 8px to 11px which cuts the live cell count by roughly half, and DPR caps at 1.75.'
      },
      a11y: [
        'The canvas is decorative in the strict sense: everything it conveys is stated in the caption and in the copy beside it. It still carries a visually-hidden focusable list of the four facts, so the section is never a blank region for a screen reader.',
        'The caption is a real figcaption inside a real figure, so the relationship between the plate and its description is structural.',
        'Under `prefers-reduced-motion: reduce` the plate is drawn fully resolved at mount, the scrub is never attached, and the copy is visible immediately. The section is a still with a portrait in it, which is a complete composition and not a broken animation.',
        'Copy contrast: heading at var(--ink) is 14.4:1, standfirst at var(--ink-2) is 7.2:1, the technical note at var(--ink-3) is 4.6:1.',
        'The See more button is a real button with a descriptive label and is reachable by keyboard as soon as it is visible.'
      ],
      perf: [
        'The field and the noise arrays are built once per resize into five typed arrays. Nothing in the render path allocates.',
        'Five radius bands, five paths, roughly 1900 arcs at the fully resolved state and fewer while resolving because unborn dots are skipped entirely.',
        'The repaint is skipped unless the damped progress moved more than 0.0015.',
        'The noise is seeded, so it is identical on every reload. A resolve that starts differently each time cannot be art directed.',
        'Mobile raises the step from 8px to 11px and caps DPR at 1.75, which roughly halves the per-frame arc count.'
      ],
      packages: [
        { p: 'none required', w: 'Canvas 2D, one distance field and four typed arrays.' },
        { p: 'no three.js, no particle library', w: 'Two thousand dots that never interact with each other need neither a scene graph nor a physics step. A particle library here would be 60kb to run a loop we already have.' },
        { p: 'gsap ScrollTrigger (installed)', w: 'Supplies the scrub with smoothing. The passive-listener fallback works identically.' }
      ],
      architecture: [
        { f: 'components/sections/AboutResolve.tsx', r: 'Server Component. Heading, standfirst, technical note, caption and the See more link render as static HTML.' },
        { f: 'components/about/ResolvePlate.tsx', r: '"use client". Owns the canvas, the field, the noise arrays, the scrub and the render loop.' },
        { f: 'lib/about/figure.ts', r: 'Shared with the Portrait page: sdEllipse, smin, figureSD, buildField, lightCell, verticalFalloff. One implementation, so the two concepts cannot drift into two different faces.' },
        { f: 'app/about/portrait/page.tsx', r: 'The See more destination, where the key light becomes interactive. Must be built with this section.' }
      ],
      state: [
        'No useState. Progress lives in a ref and drives the canvas directly.',
        'The field and the four noise arrays are refs, rebuilt only by the ResizeObserver.',
        'The See more visibility is a class toggle rather than state, because it flips once.',
        'Kill the ScrollTrigger, cancel the frame and disconnect the observer on unmount.'
      ],
      typography: [
        'Heading: display 500 at clamp(1.75rem, 3.2vw, 2.75rem), tracking -0.04em, line-height 0.98, measure 18ch so it breaks into three deliberate lines.',
        'Standfirst: display 400 at 1.0625rem / 1.64, var(--ink-2), measure 68ch.',
        'Technical note: display 400 at 0.9375rem / 1.6, var(--ink-3), measure 62ch. Prose about code is still prose, so it is not mono.',
        'Caption: mono 400 at 0.5625rem, tracking 0.18em, uppercase, var(--ink-4). It is a plate annotation, which is exactly what mono is for.',
        'No type is drawn on the canvas anywhere.'
      ],
      color: [
        'The plate is achromatic: var(--ink) at alphas from 0.09 during the noise phase to 0.84 fully resolved. A coloured portrait would make the accent decorative.',
        'Signature hue #8E9AA6 appears on the plate edge at 0.42 and nowhere else in the section.',
        'The overall ink multiplier is `0.42 + p * 0.58`, so the noise phase is genuinely dimmer and the plate visibly gains presence rather than just sharpness.',
        'Ground var(--void), flat. No wash behind the plate: the light is in the drawing.',
        'Light theme: ink inverts to #14141A on the same alpha ramp over #FAFAF8, and the plate edge darkens to #5C6670.'
      ],
      spacing: [
        'Grid gap clamp(2rem, 5vw, 5rem) between plate and copy.',
        'Plate aspect 4:5, capped at 72svh so it never pushes the copy off a short laptop screen.',
        'Caption sits 0.75rem under the plate edge, aligned to its left rule.',
        'Copy block vertically centred against the plate, with 1.25rem between heading and standfirst and 1.75rem before the technical note.',
        'Section padding-block clamp(4rem, 12vh, 8rem).'
      ],
      relationships: [
        'Dot displacement encodes how far the plate is from being resolved, and it decays quadratically so the reader can feel the settle rather than only see the endpoint.',
        'Dot density encodes the same thing on a second channel, which is what makes the effect readable at a glance instead of only in motion.',
        'Dot radius encodes surface luminance, exactly as it does in the Portrait page concept, so the two share a visual language as well as a code path.',
        'The static plate edge encodes that the frame is a decision and the contents are a process.'
      ],
      acceptance: [
        'Scrolling through the section resolves the plate from scattered noise into a legible lit figure, and scrolling back unresolves it along the same path.',
        'Individual dots can be seen travelling, not just fading.',
        'The plate is fully resolved with roughly half a viewport of rail left.',
        'Nothing in the network tab is an image.',
        'With reduced motion set the plate is drawn fully resolved at mount and no loop runs.',
        'On a 375px screen the plate is a full-width band above the copy and the button is a 44px full-width control.',
        'The caption states plainly that there is no photograph.'
      ]
    }
  });

  /* ==========================================================================
     SECTION 04  -  TENETS
     --------------------------------------------------------------------------
     Seven working principles as a compact strip: one line each, a mono index,
     and a cost. Opening one expands it in place, pushing the rest down rather
     than replacing them or opening a panel somewhere else.

     WHY EXPAND IN PLACE AND NOT A PANEL
     -----------------------------------
     A side panel makes the reader look away from the thing they just clicked,
     and on the way back they have to find their place again. Expanding in
     place keeps the row under the pointer, keeps the neighbours visible, and
     makes it obvious that the detail belongs to that row and not to a shared
     surface.

     WHY grid-template-rows AND NOT max-height
     -----------------------------------------
     `max-height` on an accordion is always a guess, and a wrong guess either
     clips the content or leaves the last part of the transition running
     against nothing. `grid-template-rows: 0fr` to `1fr` animates to the real
     measured height with no magic number anywhere.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'about-section-tenets',
    num: 4,
    pageOf: 'about-page-constellation',
    screens: 1.4,
    name: 'Tenets',
    kind: 'DOM / expand in place',
    accent: HUE.principle,
    tagline: 'Seven positions, each with its price on it',
    desc: 'A compact strip of working principles, one line each. Opening one expands it where it sits, with the ' +
          'reasoning underneath and the cost stated as plainly as the position.',
    interaction: 'Click or press Enter on a row to expand it in place. One is open at a time, and Escape closes it.',
    hint: 'Open a row &middot; One at a time &middot; <kbd>Esc</kbd> closes',

    /* Miniature: seven rows where one is open. Twenty eight operations. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.10;
      var iw = w - padX * 2;
      var n = 7;
      var open = Math.floor((t * 0.30) % n);
      var rowH = h * 0.086;
      var openH = h * 0.20;
      var y = h * 0.10;
      var i;

      for (i = 0; i < n; i++) {
        var isOpen = i === open;
        hair(ctx, padX, y, w - padX, y, 'rgba(236,236,239,0.10)');
        box(ctx, padX, y + rowH * 0.34, iw * 0.05, 1.5,
          isOpen ? 'rgba(79,182,163,0.95)' : 'rgba(236,236,239,0.22)');
        box(ctx, padX + iw * 0.09, y + rowH * 0.34, iw * (0.30 + (i % 3) * 0.08), 2,
          isOpen ? 'rgba(236,236,239,0.92)' : 'rgba(236,236,239,' + (0.34 + heat * 0.16).toFixed(3) + ')');
        if (isOpen) {
          box(ctx, padX + iw * 0.09, y + rowH * 0.72, iw * 0.74, 1, 'rgba(236,236,239,0.26)');
          box(ctx, padX + iw * 0.09, y + rowH * 0.72 + h * 0.045, iw * 0.56, 1, 'rgba(236,236,239,0.26)');
          box(ctx, padX + iw * 0.09, y + rowH * 0.72 + h * 0.09, iw * 0.34, 1, 'rgba(79,182,163,0.6)');
        }
        y += isOpen ? openH : rowH;
        if (y > h * 0.94) break;
      }
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var b = bag();
      var P = BIO.principles;

      root.classList.add('about-sec', 'about-tenets');
      tint(root, HUE.principle);

      /* ------------------------------------------------------------- DOM */
      var wrap = SE.el('div', 'about-tenets__wrap');
      wrap.innerHTML =
        '<header class="about-tenets__head">' +
          '<h2 class="about-sec__title">Seven positions, with the price on each one</h2>' +
          '<p class="about-sec__lede">Principles with no cost attached are a wish list. Every one of these ' +
            'is a trade, and the trade is written under it.</p>' +
        '</header>';

      var list = SE.el('div', 'about-tenets__list');
      list.innerHTML = P.map(function (p, i) {
        var id = 'about-tenet-' + i;
        return '<div class="about-tenets__row" data-row="' + i + '">' +
          '<h3 class="about-tenets__h">' +
            '<button type="button" class="about-tenets__btn" aria-expanded="false" aria-controls="' + id + '">' +
              '<i class="t-num">' + SE.pad(i + 1) + '</i>' +
              '<b>' + p.key + '</b>' +
              '<span class="about-tenets__line">' + p.line + '</span>' +
              '<svg class="about-tenets__mark" viewBox="0 0 16 16" aria-hidden="true">' +
                '<path d="M2 8h12" /><path class="about-tenets__markv" d="M8 2v12" />' +
              '</svg>' +
            '</button>' +
          '</h3>' +
          '<div class="about-tenets__panel" id="' + id + '" role="region">' +
            '<div class="about-tenets__panelin">' +
              '<p class="about-tenets__body">' + p.body + '</p>' +
              '<p class="about-tenets__cost"><span class="t-num">COST</span><em>' + p.cost + '</em></p>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      wrap.appendChild(list);

      var more = SE.seeMore('See how they connect', ctx.onSeeMore);
      more.classList.add('about-tenets__more', 'is-on');
      wrap.appendChild(more);
      root.appendChild(wrap);

      /* ----------------------------------------------------------- state */
      var rows = SE.$$('.about-tenets__row', list);
      var btns = SE.$$('.about-tenets__btn', list);
      var open = -1;

      function setOpen(i) {
        open = (i === open) ? -1 : i;
        rows.forEach(function (row, k) {
          var on = k === open;
          row.classList.toggle('is-open', on);
          btns[k].setAttribute('aria-expanded', on ? 'true' : 'false');
        });
      }

      btns.forEach(function (btn, i) {
        b.on(btn, 'click', function () { setOpen(i); });
      });

      b.on(list, 'keydown', function (e) {
        if (e.key === 'Escape' && open >= 0) {
          var focus = btns[open];
          setOpen(-1);
          focus.focus();
        }
      });

      /* Rows arrive once on entry. Seven rows with a 46ms stagger is 320ms of
         total arrival, which is short enough that a reader who lands on the
         section mid-scroll never waits for it. */
      var io = revealer(list, rows, ctx.scroller, 46);
      if (io) b.obs(io);
      if (env.reduced) rows.forEach(function (r) { r.classList.add('is-in'); });

      /* The first principle opens by default so the pattern is visible without
         anybody having to guess that the rows do anything. An accordion where
         every row is shut is an accordion that looks like a list. */
      setOpen(0);

      return {
        destroy: function () {
          b.all();
          root.classList.remove('about-sec', 'about-tenets');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'Seven working principles as a compact strip, each expanding in place with its reasoning and its cost.',
      philosophy: [
        'Every principle carries its price. A list of principles with no costs attached is a wish list; "Two migrations instead of one, most of the time" is what turns an opinion into a position somebody actually holds.',
        'Expanding in place, not in a panel. A side panel makes the reader look away from the thing they clicked and then find their place again on the way back. In place keeps the row under the pointer and makes it obvious the detail belongs to that row.',
        'The strip is compact by default: seven rows of one line each fit on one screen, so the whole position is legible before anything is opened.',
        'The first row opens on mount. An accordion where every row is shut looks like a list, and a reader who does not know the rows open never opens one.'
      ],
      hierarchy: [
        '1. The seven keys at 1.0625rem weight 500, which are what a skimming reader takes away.',
        '2. The position beside each key at 0.9375rem var(--ink-2), clamped to two lines, which is enough for all seven at desktop width so nothing is ever truncated in practice.',
        '3. The open row: its key goes to full ink, its index takes the accent hue, and its 1px left rule appears.',
        '4. The reasoning paragraph inside the open row at 0.9375rem / 1.62, measure 68ch. The position itself is never repeated: it is already in the header two lines above.',
        '5. The cost line, mono label plus display value, separated by a hairline.',
        '6. The plus and minus mark at the right of each row, 16px, 1.4 stroke.'
      ],
      structure: [
        'Section root is ordinary block flow. One wrap at `max-width: 62rem` centred.',
        'Each row is a div containing an h3 with a real button, and a panel div with `role="region"` and an id the button controls.',
        'The panel is `display: grid; grid-template-rows: 0fr` with a single `overflow: hidden` child. Open sets it to `1fr`.',
        'The section is roughly 1.4 viewports tall, which is the most compact concept in the area and deliberately so.',
        'The See more button sits after the strip, visible from the start.'
      ],
      interaction: [
        'Click or Enter or Space on a row header toggles it. One row is open at a time: opening a second closes the first, because seven open rows is the list this concept exists to avoid.',
        'Clicking the open row closes it. Escape closes the open row and returns focus to its own header, so the reader never loses their place.',
        'Tab moves through the seven headers in order. The panel contents are in the accessibility tree only while the row is open, because `grid-template-rows: 0fr` plus `overflow: hidden` collapses them to zero height.',
        'The first row is open at mount so the affordance is demonstrated rather than described.',
        'Rows reveal once on entry through an IntersectionObserver at 0.18 threshold with a 46ms stagger, and each is unobserved after firing.'
      ],
      choreography: [
        { n: 'Expand', d: 'grid-template-rows 0fr to 1fr, 340ms, cubic-bezier(0.32, 0.72, 0, 1). The drawer curve, because that is what this is. Height is tolerated here specifically because an accordion has no transform equivalent that does not either clip or overlap its neighbours.' },
        { n: 'Why not max-height', d: 'A max-height accordion is always a guess. Too small clips the content; too large leaves the last part of the transition running against nothing, which reads as a lag at the end of every open. 0fr to 1fr animates to the real measured height with no magic number.' },
        { n: 'Panel contents', d: 'The inner block fades 0 to 1 over 260ms with a 80ms delay on open, and 120ms with no delay on close. Asymmetric on purpose: opening should feel like arriving, closing should feel like getting out of the way.' },
        { n: 'The mark', d: 'The vertical stroke of the plus rotates 90 degrees and scales to 0 over 300ms cubic-bezier(0.23, 1, 0.32, 1), turning a plus into a minus. Transform on one path; no icon swap, no second SVG.' },
        { n: 'Row entry', d: 'opacity 0 to 1, translate3d(0, 14px, 0) to 0, 520ms cubic-bezier(0.23, 1, 0.32, 1), stagger 46ms. Seven rows is 320ms of total arrival, short enough that a reader landing mid-section never waits.' },
        { n: 'Left rule', d: 'The open row grows a 1px accent rule on its left edge, scaleY 0 to 1 from transform-origin top, 300ms. It is the only thing that marks which row is open besides the ink weight.' }
      ],
      scroll: [
        'The section is about 1.4 viewports and does not pin, hold or hijack anything. It is the quiet one of the four interactive sections.',
        'Opening a row grows the section, which pushes the following content down. That is correct: the reader asked for more and the page gives them more.',
        'No scroll-into-view on open. Scrolling the page under a reader who just clicked is the single most disorienting thing an accordion can do.',
        'The reveal observer unobserves each row as it fires and is disconnected in destroy.'
      ],
      hover: [
        'Gated behind `@media (hover: hover) and (pointer: fine)`.',
        'A hovered row lifts its key from var(--ink-2) to var(--ink) and its mark from var(--ink-4) to var(--ink-2) over 160ms. No background fill and no translate: rows that shift on hover make a seven-row strip feel unstable.',
        'The whole header is the hover and click target, not just the key, so the pointer never has to be precise.'
      ],
      click: [
        'Row headers toggle. One open at a time. Clicking the open row closes it.',
        'One other target: "See how they connect", which opens the Constellation page concept where the dependencies between these seven become visible.',
        'Nothing else in the section is clickable.'
      ],
      responsive: {
        desktop: 'Seven rows at a 3.5rem minimum, about 4.5rem in practice with a two line position. Header grid `2.5rem minmax(0, 14rem) minmax(0, 1fr) 2rem`: index, key, position line, mark. Wrap at 62rem.',
        tablet: 'The position line drops to 0.875rem and the key column narrows to 11rem.',
        mobile: 'Below 768px the four column header becomes two rows inside a 56px-tall target: index and key on the first line, the position line clamped to two lines on the second, and the mark absolutely positioned top right. The key column disappears as a column because there is no room for four columns in 375px. Row height rises to a 56px minimum so every header clears the 44px touch target with margin, and the See more button becomes full width.'
      },
      a11y: [
        'Real disclosure pattern: each header is a button inside an h3, carrying `aria-expanded` and `aria-controls`, and each panel is a `role="region"` with a matching id.',
        'Collapsed panels are zero height with `overflow: hidden`, so their contents are correctly removed from the accessibility tree rather than being visually hidden but still announced.',
        'Escape closes the open row and returns focus to its header. Focus is never lost or moved somewhere the reader did not ask for.',
        'The seven headers are in DOM order and reachable by Tab with no roving tabindex, because seven is a small enough number that every one deserves a stop.',
        'Under `prefers-reduced-motion: reduce` rows are revealed immediately, the expand transition is removed (the row snaps open), and the plus mark swaps instantly. The disclosure works identically.',
        'Contrast: keys at var(--ink) 14.4:1, position lines at var(--ink-2) 7.2:1, mono cost labels at var(--ink-4) are decorative labels beside a full-contrast value.'
      ],
      perf: [
        'No requestAnimationFrame, no canvas, no measurement. This and Anchor are the two cheapest concepts in the area.',
        'One IntersectionObserver over seven rows, which unobserves each row as it fires and is watching nothing after the first pass.',
        'The expand transition animates grid-template-rows on one row at a time. It is a layout animation, which is why exactly one runs at once and why it lasts 340ms rather than a second.',
        'No box-shadow, no filter, no backdrop-filter anywhere in the section.',
        'Seven rows of text. Total DOM cost is under sixty nodes.'
      ],
      packages: [
        { p: 'none required', w: 'A native disclosure pattern with a CSS grid transition. No accordion library, and no Radix Accordion either: seven rows with one open at a time is about twenty lines and the ARIA is not complicated.' },
        { p: 'no framer-motion', w: 'AnimatePresence with layout animation would measure and animate the whole list on every open. The grid transition animates one row and touches nothing else.' },
        { p: 'consider @radix-ui/react-accordion', w: 'Justified only if the project already depends on Radix. It brings correct keyboard handling for free; the trade is 12kb for behaviour that is twenty lines here.' }
      ],
      architecture: [
        { f: 'components/sections/AboutTenets.tsx', r: 'Server Component. All seven rows, both open and closed content, render as static HTML. The full text is crawlable whether or not a row is open.' },
        { f: 'components/about/TenetRow.tsx', r: '"use client". One row: the button, the aria wiring and the open class. Receives open state and a toggle from the parent.' },
        { f: 'lib/about/principles.ts', r: 'Shared with the Constellation page: key, line, body, cost and the coordinate triples. One source, so the section and the page cannot disagree about what a principle says.' },
        { f: 'app/about/principles/page.tsx', r: 'The See more destination, where the dependencies between the seven become visible. Build it with this section.' }
      ],
      state: [
        '`openIndex` in useState on the parent, a single integer from -1 to 6.',
        'Rows are presentational and receive `isOpen` as a prop. No row owns its own open state, because only one can be open and two sources of truth for that is how an accordion ends up with two rows open.',
        'The revealed set is class names, not state.',
        'Disconnect the observer on unmount. There is nothing else to clean up.'
      ],
      typography: [
        'Keys: display 500 at 1.0625rem, tracking -0.015em.',
        'Position lines: display 400 at 0.9375rem / 1.45, var(--ink-2), clamped to two lines closed and unclamped when open, so a narrower viewport can never hide the end of a sentence.',
        'Index: mono 500 at 0.625rem, tracking 0.18em, tabular, var(--ink-4), going to the accent hue when open.',
        'Body: display 400 at 0.9375rem / 1.62, var(--ink-2), measure 68ch.',
        'Cost: mono 500 label at 0.5625rem tracking 0.2em, value in the display face at 0.875rem var(--ink-2). The label is a measurement name, so it is mono; the value is a sentence, so it is not.'
      ],
      color: [
        'Signature hue #4FB6A3 on the open row index and its 1px left rule. Two places in the whole section.',
        'Row hairlines at var(--line). Seven rows separated by 8% ink and nothing else, no zebra striping, no filled headers, no cards.',
        'The open row does not get a background. Contrast between open and closed is carried by the ink weight of the key, the accent index and the left rule.',
        'The plus mark is var(--ink-4) resting, var(--ink-2) on hover, and the accent hue when open.',
        'Light theme: ground #FAFAF8, hairlines rgba(20,20,26,0.1), accent darkens to #2E7D6F.'
      ],
      spacing: [
        'Closed row 3.5rem tall on desktop, 56px minimum on mobile so the header clears the 44px touch target with room.',
        'Header grid `2.5rem minmax(0, 14rem) minmax(0, 1fr) 2rem` with a 1rem gap: index, key, line, mark.',
        'Panel body inset 3.5rem, which is the 2.5rem index column plus the 1rem grid gap, so the paragraph starts exactly under the key. The index column is a margin, not a column of content.',
        'Cost line 1rem below the body, separated by a 1px hairline inset to the same 3.5rem.',
        'Section padding-block clamp(4rem, 12vh, 8rem), wrap at 62rem centred.'
      ],
      relationships: [
        'Vertical order is the order they were written, not a ranking. Nothing in the design implies the first is the most important, which is why there is no size step between the seven keys.',
        'The cost line is directly under the reasoning, so the trade is impossible to read without reading what it buys.',
        'Only one row can be open, which encodes that these are seven separate positions and not a single argument in seven parts.',
        'The See more link encodes what the strip cannot show: which of these seven depend on each other.'
      ],
      acceptance: [
        'Seven rows fit one screen when closed on a 1440 by 900 display.',
        'Opening a row expands it in place with no scroll jump and no neighbour overlapping.',
        'Only one row is ever open. Escape closes it and returns focus to its own header.',
        'Collapsed panel text is not announced by a screen reader.',
        'The first row is open at mount.',
        'On a 375px screen every header is at least 56px tall and the position line clamps to two lines.',
        'With reduced motion set rows snap open with no transition and everything else is identical.'
      ]
    }
  });

  /* ==========================================================================
     SECTION 05  -  MEASURE
     --------------------------------------------------------------------------
     The quietest of the ten. No canvas, no scrub, no rail, no pointer, no
     hover on anything except one button. One arrival on entry, and then the
     section never moves again.

     WHY THIS IS A DIRECTION AND NOT AN ABSENCE
     ------------------------------------------
     Restraint is only a direction if something was actually decided. What is
     decided here: a two column asymmetry with the heading hanging in the left
     margin, a 68ch measure held exactly, a four row optimises-for table where
     the negative clause is a second column rather than a parenthesis, a
     hanging signature rule, and one 520ms arrival. Take any of those out and
     it becomes a paragraph in a div, which is the thing the whole area exists
     to refuse.

     THE ONE AUTHORED DETAIL
     -----------------------
     The "not X" column. Every claim about what somebody optimises for is
     empty without the thing they are trading away, and setting the trade as
     its own aligned column rather than as a parenthetical is the difference
     between a value and a decision.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'about-section-measure',
    num: 5,
    pageOf: 'about-page-ledger',
    screens: 1.2,
    name: 'Measure',
    kind: 'DOM / type only',
    accent: HUE.ledger,
    tagline: 'Nothing moves after the first half second',
    desc: 'A quiet editorial block: two paragraphs at a held measure and four things optimised for, each set against ' +
          'the thing it trades away. The only motion is one arrival, and then the section is still.',
    interaction: 'Read it. The only control is the link to the full accounting.',
    hint: 'The quiet one &middot; Nothing moves after it arrives',

    /* Miniature: a hanging heading, a held measure, and four paired rules.
       Twenty two operations, the fewest in the area, which is the point. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.10;
      var iw = w - padX * 2;
      var colX = padX + iw * 0.30;
      var i, y;

      /* The heading hangs in the left margin. */
      box(ctx, padX, h * 0.20, iw * 0.20, 2.5, 'rgba(236,236,239,' + (0.72 + heat * 0.2).toFixed(3) + ')');
      box(ctx, padX, h * 0.28, iw * 0.14, 2.5, 'rgba(236,236,239,' + (0.72 + heat * 0.2).toFixed(3) + ')');

      /* The held measure. Every line is the same width except the last. */
      for (i = 0; i < 4; i++) {
        y = h * 0.20 + i * h * 0.075;
        box(ctx, colX, y, iw * (i === 3 ? 0.42 : 0.70), 1, 'rgba(236,236,239,0.26)');
      }

      hair(ctx, colX, h * 0.56, w - padX, h * 0.56, 'rgba(236,236,239,0.12)');

      /* Four paired rows: what, then what it is not. */
      for (i = 0; i < 4; i++) {
        y = h * 0.63 + i * h * 0.078;
        box(ctx, colX, y, iw * (0.20 + (i % 2) * 0.08), 1.5, 'rgba(236,236,239,0.62)');
        box(ctx, colX + iw * 0.34, y, iw * (0.16 + (i % 3) * 0.05), 1.5,
          'rgba(141,167,80,' + (0.42 + heat * 0.3).toFixed(3) + ')');
      }
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var b = bag();

      root.classList.add('about-sec', 'about-measure');
      tint(root, HUE.ledger);

      /* ------------------------------------------------------------- DOM */
      var wrap = SE.el('div', 'about-measure__wrap');
      wrap.innerHTML =
        '<h2 class="about-measure__title">Mostly software nobody talks about</h2>' +
        '<div class="about-measure__col">' +
          BIO.editorial.map(function (p, i) {
            return '<p class="about-measure__p' + (i === 0 ? ' about-measure__p--lede' : '') + '">' + p + '</p>';
          }).join('') +
          '<h3 class="about-measure__sub">What he optimises for</h3>' +
          '<dl class="about-measure__opt">' + BIO.optimises.map(function (o) {
            return '<div><dt>' + o.k + '</dt><dd>' + o.v + '</dd></div>';
          }).join('') + '</dl>' +
          '<p class="about-measure__sign"><span class="t-num">' + BIO.name.toUpperCase() +
            '</span><span class="t-num">' + BIO.facts[0].v.toUpperCase() + '</span></p>' +
        '</div>';
      root.appendChild(wrap);

      var more = SE.seeMore('See the full accounting', ctx.onSeeMore);
      more.classList.add('about-measure__more', 'is-on');
      SE.$('.about-measure__col', wrap).appendChild(more);

      /* ------------------------------------------------------------ entry */
      /* One arrival, once, and then the section is still for as long as the
         reader stays on the page. Two elements move: the heading and the
         column. Anything more is a section performing its own restraint,
         which is not restraint. */
      var items = [SE.$('.about-measure__title', wrap), SE.$('.about-measure__col', wrap)];
      var io = revealer(wrap, items, ctx.scroller, 90);
      if (io) b.obs(io);
      if (env.reduced) items.forEach(function (n) { n.classList.add('is-in'); });

      return {
        destroy: function () {
          b.all();
          root.classList.remove('about-sec', 'about-measure');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A quiet editorial block that arrives once and then never moves again.',
      philosophy: [
        'Restraint is only a direction if something was decided. What is decided here: a two column asymmetry with the heading hanging in the left margin, a 68ch measure held exactly, an optimises-for table where the traded-away clause is its own aligned column, a hanging signature rule, and one 520ms arrival. Remove any of those and it is a paragraph in a div.',
        'The "not X" column is the authored detail. Every claim about what somebody optimises for is empty without the thing they trade away, and setting the trade as an aligned column rather than as a parenthetical is the difference between a value and a decision.',
        'Nothing moves after the first half second. Not a hover on a paragraph, not a parallax, not an idle loop. A section whose whole argument is quiet cannot also be busy.',
        'It is written in the third person while the other nine are in the first. This is the block that would sit under a portrait in a printed programme, and that voice is the one that belongs there.'
      ],
      hierarchy: [
        '1. The heading, hanging in the left column at clamp(1.75rem, 3vw, 2.5rem), weight 500, measure 14ch so it breaks into three deliberate lines.',
        '2. The opening paragraph, one step up from the body at clamp(1.0625rem, 1.35vw, 1.25rem), which is the only size change in the running text.',
        '3. The second paragraph at 1rem / 1.68.',
        '4. The four optimises-for rows: the term at 1rem full ink, the trade at 0.9375rem in the accent hue, aligned in its own column.',
        '5. The signature rule: two mono labels on one hairline, name at the left and city at the right.',
        '6. The link to the full accounting, last, because everything above it is complete without it.'
      ],
      structure: [
        'Section root is ordinary block flow. One wrap at `max-width: 68rem` centred, `display: grid`, `grid-template-columns: minmax(0, 16rem) minmax(0, 1fr)` with a `clamp(2rem, 6vw, 5rem)` gap.',
        'Left column is the heading only, top aligned, hanging in its own margin. It is not sticky: this section does not hold anything.',
        'Right column carries the two paragraphs, the subheading, the definition list and the signature.',
        'The optimises list is a real dl of four `div > dt + dd` pairs, laid out as a two column grid so the trades align in a column.',
        'No canvas, no rail, no observer beyond the single entry reveal, and no ticker subscription at all.'
      ],
      interaction: [
        'None beyond reading. There is one focusable element in the whole section: the link to the full accounting.',
        'One IntersectionObserver at 0.18 threshold fires the arrival once and unobserves both elements immediately.',
        'No scrub, no scroll listener, no rAF, no pointer handler.',
        'The section is roughly 1.2 viewports tall and consumes scroll at exactly the rate the reader supplies it.',
        'This is the concept to choose when the About section sits between two loud neighbours and needs to be the place the page breathes.'
      ],
      choreography: [
        { n: 'Arrival', d: 'opacity 0 to 1 and translate3d(0, 16px, 0) to 0 over 520ms, cubic-bezier(0.23, 1, 0.32, 1), on exactly two elements: the heading at 0ms and the column at 90ms. That 90ms is the entire choreography of the section.' },
        { n: 'Why 16px and not 40', d: 'A long travel on a block of body copy makes the text unreadable during the transition and draws attention to the animation rather than to the writing. 16px is enough to read as arrival and short enough to be over before the eye settles.' },
        { n: 'Why one stagger step and not five', d: 'Staggering the heading, both paragraphs, the subheading, four list rows and the signature would be nine steps and about 800ms of assembly. The reader would watch it build instead of reading it. Two elements, one step.' },
        { n: 'What never animates', d: 'Everything else. No hover on the paragraphs, no lift on the list rows, no underline sweep on the link, no idle motion of any kind, ever.' },
        { n: 'The hover that does exist', d: 'The See more button, with the standard directional fill from the bottom edge, 220ms cubic-bezier(0.23, 1, 0.32, 1). One control, one behaviour, gated behind a fine pointer.' }
      ],
      scroll: [
        'No rail, no sticky, no pin. The section is as tall as its content and scrolls at the reader pace.',
        'One IntersectionObserver, which unobserves both targets after the first intersection and is disconnected in destroy.',
        'No window scroll listener anywhere.',
        'Under reduced motion the observer is skipped entirely and both elements are marked arrived at mount.'
      ],
      hover: [
        'Exactly one hover state in the whole section, on the See more button, gated behind `@media (hover: hover) and (pointer: fine)`.',
        'Paragraphs, list rows and the signature have no hover state. They are text.',
        'The cursor is the native text cursor throughout, because selecting and copying is a real thing to want here.'
      ],
      click: [
        'One click target: "See the full accounting", which opens the Ledger page concept.',
        'Nothing else is clickable, and nothing pretends to be.'
      ],
      responsive: {
        desktop: 'Two columns: heading at 16rem hanging left, content at 1fr with a 68ch measure. Optimises list as a two column grid at `minmax(0, 1fr) minmax(0, 1fr)`.',
        tablet: 'Heading column narrows to 12rem and the measure falls to 62ch. The optimises grid keeps two columns; the trade clause is the whole point of the layout and collapsing it first would remove it.',
        mobile: 'Below 768px the hang is abandoned: the heading sits above the column at 1.625rem with a 20ch measure, and the paragraphs run full width at 1rem / 1.68 with a 1.25rem gutter. The optimises list becomes four stacked pairs, with the term on one line and the trade indented 1rem beneath it and still in the accent hue, so the relationship survives without a column. The signature stacks to two lines and the button becomes a full-width 44px control.'
      },
      a11y: [
        'Everything in the section is real semantic text: h2, two p, h3, a dl of four pairs, and a button. There is nothing to mirror because there is no canvas.',
        'The arrival only touches opacity and transform. All content is in the DOM and reachable from the moment it renders, animation or not.',
        'Under `prefers-reduced-motion: reduce` nothing animates at all and no observer is created. This concept is the only one in the area that is genuinely identical with motion off, which is worth knowing when choosing it.',
        'Contrast: heading and terms at var(--ink) 14.4:1, paragraphs at var(--ink-2) 7.2:1, the trade clauses in #8DA750 at 8.1:1.',
        'The dl is a real description list, so a screen reader announces four term and description pairs rather than eight loose strings.',
        'Measure is held between 65ch and 68ch, which is the range where line length stops costing comprehension.'
      ],
      perf: [
        'No canvas, no rAF, no scroll handler, no measurement, no images.',
        'One IntersectionObserver over two elements, disconnected after the first fire.',
        'Total animated properties in the section: two opacities and two transforms, once.',
        'Under forty DOM nodes.',
        'This is by a wide margin the cheapest of the ten concepts, and on a page that already has three canvas sections that is a legitimate reason to pick it.'
      ],
      packages: [
        { p: 'none required', w: 'A grid, a dl and one observer. There is nothing here for a library to do and adding one would be the opposite of the point.' },
        { p: 'no framer-motion, no gsap', w: 'Two elements moving 16px once. A 40kb animation runtime for that is a worse decision than the animation itself.' },
        { p: 'no intersection-observer polyfill', w: 'Supported everywhere in the target matrix, and if it were missing the correct fallback is to show the content, which is one line.' }
      ],
      architecture: [
        { f: 'components/sections/AboutMeasure.tsx', r: 'Server Component. The entire section renders as static HTML with no client boundary at all if the arrival is done with a CSS scroll-driven animation instead of an observer.' },
        { f: 'components/about/Arrive.tsx', r: '"use client". A generic two-element reveal wrapper. Optional: `animation-timeline: view()` in CSS does the same job with no JavaScript where support allows.' },
        { f: 'lib/about/copy.ts', r: 'The two editorial paragraphs and the four optimises-for pairs, shared with the Ledger page.' },
        { f: 'app/about/ledger/page.tsx', r: 'The See more destination. This section states what he optimises for; that page shows the hours behind it.' }
      ],
      state: [
        'No state of any kind. Not useState, not a ref that changes, not a context.',
        'The arrival is two class names added once by an observer callback.',
        'If the CSS `animation-timeline: view()` path is taken, the section has no client component at all.',
        'Disconnect the observer on unmount, and that is the entire cleanup.'
      ],
      typography: [
        'Heading: Space Grotesk 500 at clamp(1.75rem, 3vw, 2.5rem), tracking -0.04em, line-height 1.0, measure 14ch so it breaks into three deliberate lines rather than wrapping arbitrarily.',
        'Opening paragraph: 400 at clamp(1.0625rem, 1.35vw, 1.25rem), line-height 1.62. It is the only size change in the running text and it does the work an eyebrow would otherwise be asked to do.',
        'Second paragraph: 400 at 1rem, line-height 1.68, var(--ink-2).',
        'Optimises terms: 500 at 1rem var(--ink). Trades: 400 at 0.9375rem in the accent hue. Both in the display face, because both are sentences.',
        'Mono appears exactly twice, in the signature rule, carrying the name and the city. Nowhere else in the section.',
        'Measure held between 65ch and 68ch throughout, which is the range where line length stops costing comprehension.'
      ],
      color: [
        'Three values: var(--ink) for the heading and terms, var(--ink-2) for the paragraphs, #8DA750 for the four trade clauses.',
        'Two hairlines at var(--line): one above the optimises list, one above the signature. That is every rule in the section.',
        'No fills, no cards, no panels, no tinted backgrounds, no shadow of any kind.',
        'The accent appears only on the trades, so the eye can read the four things being given up as a column without reading the four terms first, which is the fastest possible summary of the section.',
        'Light theme: ground #FAFAF8, ink #14141A, secondary #4A4A55, and the accent darkens to #5D7024 to hold 4.5:1 at 0.9375rem.'
      ],
      spacing: [
        'Wrap at 68rem, grid gap clamp(2rem, 6vw, 5rem), heading column 16rem.',
        'Paragraph rhythm 1.5em. Subheading 3rem above and 1.25rem below, which is the "more space above a heading than below it" rule applied literally.',
        'Optimises rows on a 0.875rem vertical rhythm with a 1px hairline above the group only, never between the rows.',
        'Signature 3rem below the list with a 1px hairline and 1rem of clearance under it.',
        'Section padding-block clamp(5rem, 14vh, 9rem), the most generous in the area, because the whole direction is that this block has room.'
      ],
      relationships: [
        'Column position encodes the trade: the left of each pair is what is optimised for, the right is what is given up. It is the only structural idea in the section and everything else stays out of its way.',
        'The size step on the opening paragraph encodes "start here" without a label, which is why there is no eyebrow anywhere.',
        'The hanging heading encodes that the heading is a margin note on the column and not a banner across the top of it.',
        'The signature rule encodes an ending. It is the only element that spans the full column width.'
      ],
      acceptance: [
        'Nothing in the section moves after the first 610ms, under any input, forever.',
        'The measure never exceeds 68ch at any viewport width.',
        'The four trade clauses align in their own column and can be read as a list without reading the terms.',
        'With motion off the section is pixel-identical to the section with motion on, once arrived.',
        'There is exactly one focusable element in the section.',
        'On a 375px screen the heading sits above the column and each trade is indented under its own term, still in the accent hue.',
        'The section renders correctly with JavaScript entirely disabled.'
      ]
    }
  });


  /* ==========================================================================
     LEGIBLE SET  -  shared content for pages 06 to 10
     --------------------------------------------------------------------------
     The first five page concepts are instruments: you scrub them, project them,
     read them as a chart. They are defensible and they are also the reason a
     visitor asked what they were looking at. Pages 06 to 10 answer the plain
     question instead. Each one states a name, a role, a place, a readable
     biography, something human, and one next step, in that order, above the
     fold, with no decoding step in between.

     The art direction is still the variable. What changes is that the layout is
     now a layout a reader already knows how to use: a profile, a story, a card,
     a numbered process, an interview in plain question and answer form.
     ========================================================================== */

  HUE.profile = '#D89C7A';   /* page 06  terracotta  */
  HUE.story   = '#9B8FD4';   /* page 07  violet      */
  HUE.card    = '#E0D7C3';   /* page 08  bone        */
  HUE.process = '#C77A9E';   /* page 09  rose        */
  HUE.answers = '#E0B94A';   /* page 10  amber       */

  /* The plain-language layer of the same person. Nothing here contradicts the
     material above it; it is the same six years said in sentences. */
  BIO.location = 'Dhaka, Bangladesh';
  BIO.tz = 'UTC+6';
  BIO.email = 'hello@miftaul.dev';
  BIO.available = 'Open to full-time work and to projects of three months or longer';

  /* Three paragraphs, roughly 55, 60 and 45 words. Written to be read in that
     order and to stand alone if only the first is read. */
  BIO.paras = [
    'Miftaul Islam is a full-stack developer in Dhaka. He has built web software professionally since 2019, most of it the kind people use all day and never mention: a pharmacy inventory system, a logistics console eight dispatchers sat in front of for eleven hours, internal tools with no marketing page and no room to be wrong.',
    'He works in TypeScript, Next.js and Postgres, and takes a project from the database schema through to the thing on the screen. A normal week is about a quarter new code; the rest is reading what already exists, reviewing, reproducing bugs and deleting what nobody uses. He writes the interface before the implementation, ships the boring version first, and keeps the build under sixty seconds so people still run it before pushing.',
    'He is open to full-time work and to projects of three months or longer. He replies the same day most days, and would rather have a twenty minute call than a long written brief.'
  ];

  /* The human column. Not hobbies as decoration: these are the three things a
     person actually wants to know before working with someone. */
  BIO.human = [
    { k: 'How he works',
      v: 'One long uninterrupted block in the morning, nothing scheduled before two in the afternoon. Interfaces and schemas get written down before any implementation, because the signature is where the real review happens.' },
    { k: 'What he will not ship',
      v: 'A form that empties itself when validation fails. An authorisation check that only exists in the browser. Infinite scroll on anything a person may need to find a second time.' },
    { k: 'Away from the screen',
      v: 'Cycling in Dhaka before the traffic starts, and reading source code for dependencies he has no plans to use. He keeps a file in every repository of things he believed on day one that turned out to be false.' }
  ];

  /* Story chapters. Years are mono; the prose is prose. Five chapters so the
     arc is start, first real job, the years of learning it properly, now, next. */
  BIO.story = [
    { yr: '2016', t: 'A notice board nobody maintained',
      p: 'The first thing I built was a notice board for my school, written in PHP on a shared host a teacher paid for by the year. It was not good code. It kept working for four years after I stopped touching it, and I still think that is the only number from those years worth reporting.' },
    { yr: '2019', t: 'The first paid job',
      p: 'A pharmacy on a busy street hired me to replace a paper stock book. The system ran on one laptop on a small battery backup, on a street where the power failed about twice a week. Everything had to keep working while the network did not, which taught me offline-first years before I knew there was a phrase for it.' },
    { yr: '2020', t: 'Learning it the ordinary way',
      p: 'Node and Postgres, in a team small enough that I was also the person the alert woke at four in the morning. Being on call is a slow and expensive teacher, but nothing else has ever made me care as much about what a system does when it is already broken.' },
    { yr: '2023', t: 'Eleven hours a day',
      p: 'Two years on a logistics console that eight dispatchers lived inside for a full shift. Nobody ever praised it. They simply stopped mentioning it, which for a tool used that heavily is the better outcome and the one I now aim for by default.' },
    { yr: '2026', t: 'Where this is going',
      p: 'I am working in TypeScript, Next.js and Postgres, with strong opinions about what runs on the server and what has any business running on the phone. What I want next is a team that reviews carefully and ships anyway, on a product that is still going to exist in three years.' }
  ];

  /* Identity card rows. Short values on purpose: this concept is the one you
     scan, not the one you read. */
  BIO.cardRows = [
    { k: 'Name',        v: 'Miftaul Islam' },
    { k: 'Role',        v: 'Full-stack developer' },
    { k: 'Location',    v: 'Dhaka, Bangladesh (UTC+6)' },
    { k: 'Working since', v: '2019' },
    { k: 'Currently',   v: 'Logistics and internal tools, front to back' },
    { k: 'Core stack',  v: 'TypeScript, Next.js, Postgres' },
    { k: 'Also uses',   v: 'Node, Prisma, Playwright, Docker' },
    { k: 'Availability', v: 'Full-time roles and projects from three months' },
    { k: 'Reply time',  v: 'Same day, most days' },
    { k: 'Languages',   v: 'Bangla, English' }
  ];

  /* Six steps, in the order a real project actually goes. Each paragraph is one
     or two sentences and says what happens, not what it is called. */
  BIO.process = [
    { t: 'A call, before anything is written',
      p: 'Twenty minutes to hear what the software is for and who has to use it. Most of that time is spent finding the one constraint that decides everything else, which is rarely the one in the brief.' },
    { t: 'A written scope you can argue with',
      p: 'One page: what gets built, what explicitly does not, what it costs and roughly when. If the scope is wrong, this is the cheapest possible place to find out, so I would rather it be picked apart now than agreed to politely.' },
    { t: 'The schema and the interfaces first',
      p: 'Before any screens, the data model and the function signatures get written down. Design review happens here, in the shape of the types, because that is the last point where changing your mind is nearly free.' },
    { t: 'The boring version, shipped early',
      p: 'The first working version is deliberately plain, and it goes somewhere you can open it as soon as it does anything at all. Watching someone use a plain version tells you more in ten minutes than a month of describing a clever one.' },
    { t: 'Revision against real use',
      p: 'Then the passes that make it good: the empty states, the error copy, the thing that is slow on a bad connection, the keyboard path for whoever is doing this two hundred times a day.' },
    { t: 'Handover, and a pass that only deletes',
      p: 'You get the repository, the runbook and a walkthrough. Around month three I go back through and remove the flags nobody flipped and the endpoints nobody called, because that pass never happens unless it is scheduled.' }
  ];

  /* The questions people actually open with, answered in the first person and
     at full length. No timecodes, no scrub axis: it is an interview to read. */
  BIO.answers = [
    { q: 'What do you build?',
      a: 'Web applications, end to end. In practice that means the Postgres schema, the API, the front end and the deploy, usually for internal software: inventory, logistics, dashboards, the tools a business runs on rather than the ones it advertises.' },
    { q: 'What is your stack?',
      a: 'TypeScript everywhere, Next.js on the front, Node and Postgres behind it. I pick boring, well documented tools on purpose, because the interesting part of a project should be the problem and not the infrastructure holding it up.' },
    { q: 'How do you work day to day?',
      a: 'One long block in the morning with nothing scheduled before two. I write the interface before the implementation, read logs before dashboards, and keep the build under sixty seconds so it stays worth running locally. You get a working link early and a short written update at the end of each week.' },
    { q: 'What is a project with you actually like?',
      a: 'A call, then a one page scope you are invited to argue with, then a plain working version far sooner than is comfortable. After that it is revision against real use, and at the end a repository, a runbook and a walkthrough rather than a zip file and silence.' },
    { q: 'What have you been wrong about?',
      a: 'I spent about a year believing that if the types were strict enough, the tests could be thin. Types tell you the shape is right. They will happily let you send a perfectly typed refund to the wrong account, and one afternoon in 2022 they did.' },
    { q: 'What are you looking for now?',
      a: 'A team that reviews carefully and ships anyway. Those two are far less in tension than people assume, and every good year I have had came from a group that managed both. Full-time or a project of three months or more, remote from Dhaka or on site.' }
  ];

  /* A next step, worded the same way on all five pages so it reads as one
     person and not five. */
  BIO.cta = { work: 'See the work', talk: 'Get in touch', mailto: 'mailto:hello@miftaul.dev' };

  /* Shared markup for the closing action pair. Page concepts render the same
     two controls; only the surrounding layout changes. */
  function actions(cls) {
    return '<div class="about-act ' + cls + '">' +
      '<button type="button" class="about-act__btn about-act__btn--lead" data-act="work">' + BIO.cta.work + '</button>' +
      '<a class="about-act__btn" href="' + BIO.cta.mailto + '">' + BIO.cta.talk + '</a>' +
      '<span class="about-act__note t-num">' + BIO.email + '</span>' +
      '</div>';
  }

  /* Wire the lead control to the concept's page-level counterpart when the
     shell provides one, and remove it when it does not, so a dead button never
     ships. */
  function wireActions(scope, b, ctx) {
    var btn = SE.$('[data-act="work"]', scope);
    if (!btn) return;
    if (ctx && typeof ctx.onSeeMore === 'function') {
      b.on(btn, 'click', function () { ctx.onSeeMore(); });
    } else {
      btn.parentNode.removeChild(btn);
    }
  }

  /* One authored entrance, shared. The class lands on the next frame so the
     initial state is painted first and the transition actually runs. Reduced
     motion skips straight to the arranged composition. */
  function enter(root, b) {
    if (SE.env.reduced) { root.classList.add('is-in'); return; }
    b.timer(function () { root.classList.add('is-in'); }, 40);
  }

  /* ==========================================================================
     PAGE 06  -  PROFILE
     --------------------------------------------------------------------------
     The one everybody recognises: a portrait on the left, a name, a role, a
     place and three paragraphs on the right. The whole argument for it is that
     a visitor knows what it is before reading a word, which frees every bit of
     craft in it to go into the typography rather than into teaching a new
     interface.

     THE PORTRAIT IS A PLACEHOLDER AND SAYS SO BY BEING PORTRAIT SHAPED
     -----------------------------------------------------------------
     There is no photograph in this repository. The plate draws the shared
     silhouette as a two-tone halftone at a 4:5 portrait aspect, lit from the
     upper left, in a bordered frame. It reads as the place a photograph goes,
     which is exactly what it is. In production the canvas is replaced by a
     next/image fill at the same aspect ratio and nothing else moves.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'about-page-profile',
    num: 6,
    name: 'Profile',
    kind: 'DOM / portrait and column',
    accent: HUE.profile,
    tagline: 'Portrait left, name and biography right',
    desc: 'A large portrait panel beside the name, the role, the location and a three paragraph biography. ' +
          'Below it, three short notes on how he works and two links: see the work, or send an email.',
    interaction: 'Read. The page scrolls; the portrait stays put beside the column on desktop.',
    hint: 'Scroll for the working notes',

    /* Miniature: a portrait plate on the left, a name rule and a body column on
       the right. Twenty eight operations, deterministic. */
    preview: function (ctx, w, h, t, heat) {
      var px = w * 0.10, py = h * 0.14;
      var pw = w * 0.31, ph = h * 0.66;
      var i, y;

      /* The plate. A filled portrait-aspect panel with a rule around it, so the
         thumbnail reads as "photo here" at 120px wide. */
      box(ctx, px, py, pw, ph, 'rgba(216,156,122,0.10)');
      hair(ctx, px, py, px + pw, py, 'rgba(216,156,122,0.45)');
      hair(ctx, px, py + ph, px + pw, py + ph, 'rgba(216,156,122,0.45)');
      hair(ctx, px, py, px, py + ph, 'rgba(216,156,122,0.28)');
      hair(ctx, px + pw, py, px + pw, py + ph, 'rgba(216,156,122,0.28)');

      /* Nine silhouette dots, evenly picked from the shared face sample. */
      for (i = 0; i < PRE.face.length; i += Math.ceil(PRE.face.length / 11)) {
        var c = PRE.face[i];
        dot(ctx, px + pw * (0.16 + c.u * 0.68), py + ph * (0.10 + c.v * 0.84),
          1.1 + c.h * 1.5, 'rgba(216,156,122,' + (0.20 + c.h * 0.42 + heat * 0.18).toFixed(3) + ')');
      }

      /* The column: name, role, then five body rules at reading weight. */
      var cx = w * 0.49, cw = w * 0.41;
      box(ctx, cx, py + h * 0.04, cw * 0.78, 4, 'rgba(236,236,239,0.86)');
      box(ctx, cx, py + h * 0.13, cw * 0.50, 2, 'rgba(216,156,122,0.70)');
      for (i = 0; i < 6; i++) {
        y = py + h * 0.24 + i * h * 0.075;
        box(ctx, cx, y, cw * (0.94 - (i % 3) * 0.16), 1.5,
          'rgba(236,236,239,' + (0.30 + (i < 3 ? 0.12 : 0) + Math.max(0, 0.16 - i * 0.02)).toFixed(3) + ')');
      }
      /* One travelling emphasis on the column, the same authored moment the
         page itself has. */
      var k = Math.floor((t * 0.55) % 6);
      box(ctx, cx - 7, py + h * 0.24 + k * h * 0.075 - 1, 2, 4, 'rgba(216,156,122,0.9)');
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var b = bag();

      root.classList.add('about', 'about-profile');
      tint(root, HUE.profile);

      var scroller = pageScroller(root, 'about-profile__scroll');
      var inner = SE.el('div', 'about-profile__inner');

      var html =
        '<div class="about-profile__top">' +
          '<figure class="about-profile__plate" role="img" ' +
            'aria-label="Portrait of Miftaul Islam. Placeholder artwork; a photograph is used in production.">' +
            '<canvas class="about-profile__canvas"></canvas>' +
          '</figure>' +
          '<div class="about-profile__col">' +
            '<h2 class="about-profile__name">' + BIO.name + '</h2>' +
            '<p class="about-profile__role">' + BIO.role +
              '<span class="about-profile__where t-num">' + BIO.location + '</span></p>' +
            '<div class="about-profile__bio">' +
              BIO.paras.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
            '</div>' +
            actions('about-profile__act') +
          '</div>' +
        '</div>' +
        '<div class="about-profile__notes">' +
          BIO.human.map(function (n) {
            return '<section class="about-profile__note">' +
              '<h3>' + n.k + '</h3><p>' + n.v + '</p></section>';
          }).join('') +
        '</div>';

      inner.innerHTML = html;
      scroller.appendChild(inner);

      root.appendChild(SE.hintStrip('<span>Scroll for the working notes</span><span>' + BIO.location + '</span>'));

      wireActions(inner, b, ctx);

      /* The three working notes sit below the fold, so they arrive on entry
         rather than all at mount. One observer, items unobserved on first fire. */
      var io = revealer(inner, SE.$$('.about-profile__note', inner), scroller, 60);
      if (io) b.obs(io);

      /* ------------------------------------------------------------- plate */
      /* Painted once per size change, never per frame. A portrait is a still
         image; animating it would be the exact mistake this page exists to
         avoid. */
      var cv = b.cv(SE.canvas(SE.$('.about-profile__canvas', inner)));

      function paint() {
        var w = cv.w, h = cv.h, c = cv.ctx;
        if (!w || !h) return;
        cv.clear();

        /* Ground: a single flat plate, one step above the void so the frame
           reads as a printed panel rather than a hole. */
        c.fillStyle = '#101015';
        c.fillRect(0, 0, w, h);

        var step = env.mobile ? 9 : 7;
        /* Fit the shared 0..1 figure box so head and shoulders fill the plate
           with the crown about 6% down and the shoulders running off the
           bottom edge, which is how a portrait is actually cropped. */
        var side = h * 0.94;
        var fit = { side: side, bx: (w - side) / 2, by: h * 0.05 };
        var f = figureField(w, h, step, fit);
        var lx = -0.42, ly = -0.58, lz = 0.70;   /* key light, upper left */
        var i, j, k, x, y, fall, lum, v, r;

        for (j = 0; j < f.rows; j++) {
          y = j * step;
          fall = figureFall(f, y);
          for (i = 0; i < f.cols; i++) {
            k = j * f.cols + i;
            if (f.nz[k] <= 0) continue;
            lum = figureLum(f, k, lx, ly, lz) * fall;
            /* Ordered dither on the dot radius, not on a binary threshold: the
               dither keeps the tonal steps from banding across the cheek while
               the radius keeps the print reading as a halftone. */
            v = Math.max(0, Math.min(1, lum - (bayerAt(i, j) - 0.5) * 0.16));
            if (v < 0.06) continue;
            r = (step * 0.50) * (0.30 + v * 0.72);
            x = i * step + (j % 2 ? step * 0.5 : 0);
            /* Duotone: shadow is a cool grey, highlight is the concept hue.
               Two inks, the way a portrait would actually be printed. */
            c.fillStyle = 'rgb(' +
              Math.round(58 + v * 158) + ',' +
              Math.round(60 + v * 128) + ',' +
              Math.round(68 + v * 92) + ')';
            c.beginPath();
            c.arc(x, y, r, 0, TAU);
            c.fill();
          }
        }
      }

      cv.observe(paint);
      paint();

      enter(root, b);

      return {
        destroy: function () {
          b.all();
          root.className = '';
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'The classic About page, set properly',
      philosophy: [
        'A visitor should know what the page is before reading a word. Portrait plus name plus paragraphs is the one About layout everybody has already learned, so all of the craft can go into the typesetting instead of into teaching an interface.',
        'The portrait is a placeholder that announces itself as one: a 4:5 halftone plate in a frame. In production it is replaced by a photograph at the same aspect and nothing else in the layout moves.',
        'Motion is limited to a single 520ms entrance. Nothing on this page moves while it is being read.'
      ],
      hierarchy: [
        '1. Name, 44 to 68px, --ink.',
        '2. Role and location on one line, 15px, role at --ink, location in mono at --ink-4.',
        '3. Three biography paragraphs, 17px / 1.68, --ink-2, held at 66ch.',
        '4. Portrait plate, visually large but second in reading order on mobile.',
        '5. Two actions.',
        '6. Three working notes, 15px, --ink-2, below the fold.'
      ],
      structure: [
        'Root `.about-profile` is absolute inset 0 with its own scroller `.about-profile__scroll`.',
        '`.about-profile__top` is `grid-template-columns: minmax(0, 0.72fr) minmax(0, 1fr)` with a `clamp(2rem, 4.5vw, 4.5rem)` gap.',
        '`.about-profile__plate` is `aspect-ratio: 4 / 5`, `max-height: 62vh`, 1px --line-2 border, 2px radius, `position: sticky; top: var(--pad)` on viewports 1024px and wider.',
        'Canvas fills the plate via SE.canvas, painted on resize only.',
        '`.about-profile__notes` is a three column grid at 1024px and wider, one column below.'
      ],
      interaction: [
        'Vertical scroll only. No hover state changes layout.',
        '"See the work" calls ctx.onSeeMore(); if the shell supplies no handler the button is removed from the DOM at mount rather than left inert.',
        '"Get in touch" is an ordinary mailto anchor so it works with JavaScript disabled.'
      ],
      choreography: [
        { n: 'Entrance', d: 'Plate and column: opacity 0 to 1, translate3d(0, 18px, 0) to 0, 520ms cubic-bezier(0.23, 1, 0.32, 1). Column starts at 90ms so the reader lands on the name after the plate has settled.' },
        { n: 'Notes', d: 'IntersectionObserver at threshold 0.18, each note opacity 0 to 1 and translate3d(0, 14px, 0) to 0 over 420ms ease-out, 60ms apart. Observed elements are unobserved on first fire.' },
        { n: 'Nothing else', d: 'No idle loop, no parallax, no ticker subscription. The canvas paints on resize only.' }
      ],
      scroll: [
        'Plate is sticky at `top: var(--pad)` from 1024px up, releasing when `.about-profile__top` ends.',
        'No scroll listener anywhere. Sticky is CSS; the notes use IntersectionObserver.'
      ],
      hover: [
        'Inside `@media (hover: hover) and (pointer: fine)` only: action buttons move border-color from --line-2 to --c-accent and color to --c-accent over 180ms ease-out.'
      ],
      click: [
        '"See the work" opens the work area. "Get in touch" opens the mail client.'
      ],
      responsive: {
        desktop: 'Two columns, plate 0.72fr on the left and sticky, biography 1fr on the right at 66ch. Notes in three columns.',
        tablet: 'Same two columns at a 0.62fr / 1fr ratio, plate no longer sticky, notes in two columns.',
        mobile: 'Recomposed to a single column, and the order changes: name and role first, then the plate at `aspect-ratio: 4 / 5` full width, then the paragraphs, then the actions as full-width 48px targets, then the notes stacked. Canvas halftone step goes 7px to 9px and DPR is capped at 2.'
      },
      a11y: [
        'The plate is `role="img"` with an aria-label naming the subject and stating that it is placeholder artwork; the canvas itself is aria-hidden through the figure.',
        'Heading order is h2 name, h3 per working note.',
        'Actions are a real button and a real anchor, both keyboard reachable, focus ring 2px --c-accent at 2px offset.',
        'All body copy is --ink-2 (7.2:1) or brighter; the mono location is --ink-4 (4.7:1) and is short metadata, not prose.',
        'prefers-reduced-motion: entrance transitions removed, all content at final position on first paint.'
      ],
      perf: [
        'Zero rAF subscriptions. The canvas paints once per resize.',
        'Halftone cost is one figureField sample per resize, roughly 4,000 cells on a 420 by 520 plate at 7px.',
        'No filter, no box-shadow, no backdrop-filter anywhere.'
      ],
      packages: [
        { p: 'gsap (installed)', w: 'Not needed. Two CSS transitions and one IntersectionObserver cover the whole page.' },
        { p: 'next/image', w: 'Use it. Replace the canvas with a fill image at 4:5, priority on the desktop breakpoint, and delete the halftone code entirely.' }
      ],
      architecture: [
        { f: 'components/about/ProfilePage.tsx', r: 'Server component. Renders name, role, location, paragraphs, notes from a typed bio module.' },
        { f: 'components/about/PortraitPlate.tsx', r: 'The 4:5 framed plate. next/image in production; the halftone canvas only as a development fallback.' },
        { f: 'components/about/Actions.tsx', r: 'Client component, the button plus mailto pair.' },
        { f: 'lib/about/bio.ts', r: 'The single typed source of name, role, location, paragraphs, notes.' }
      ],
      state: [
        'No React state at all in the static path.',
        'The IntersectionObserver instance is a ref, never state; the observed nodes are refs.',
        'Reduced-motion preference is read once in an effect and written to a data attribute, not held in state.'
      ],
      typography: [
        'Name: Space Grotesk 500, clamp(2.25rem, 5.2vw, 4.25rem), line-height 0.94, letter-spacing -0.04em.',
        'Role: Space Grotesk 400, 0.9375rem, --ink; location in JetBrains Mono 0.6875rem, letter-spacing 0.16em, uppercase, --ink-4.',
        'Body: Space Grotesk 400, clamp(1rem, 1.15vw, 1.0625rem), line-height 1.68, max-width 66ch, --ink-2.',
        'Note headings: 0.8125rem mono, letter-spacing 0.14em, uppercase, --c-accent.'
      ],
      color: [
        'Accent #D89C7A is used on the location rule, the note headings, the plate frame and the focus ring. Nowhere on body copy.',
        'The halftone is two inks: shadow rgb(58, 60, 68), highlight rgb(216, 188, 160). No third colour.',
        'Plate ground is --surface (#101015), one step above the page void.'
      ],
      spacing: [
        'Page inset: var(--pad) = clamp(1.125rem, 3.4vw, 3.25rem).',
        'Column gap: clamp(2rem, 4.5vw, 4.5rem). Paragraph rhythm: 1.125rem.',
        'Notes band is separated by a 1px --line rule with 3.5rem above and 2.5rem below.'
      ],
      relationships: [
        'Mono means metadata: location, email, years. It never carries a sentence.',
        'The accent marks only the three things a visitor should find fast: where he is, what the notes are, and where the actions are.',
        'Plate size encodes nothing; it is a photograph slot at a fixed 4:5.'
      ],
      acceptance: [
        'Name, role, location, three paragraphs and both actions are all visible without scrolling at 1440 by 900.',
        'At 390 by 844 the order is name, role, plate, paragraphs, actions, notes, with no horizontal scrollbar.',
        'SE.ticker.count() is unchanged from before mount to after destroy().',
        'With prefers-reduced-motion set, every element is at its final opacity and position on the first painted frame.'
      ]
    }
  });

  /* ==========================================================================
     PAGE 07  -  STORY
     --------------------------------------------------------------------------
     The same six years told as a story you scroll: five titled chapters, each
     with a year in the gutter and one paragraph of ordinary prose. It answers
     "how did you get here" in the order a person would actually answer it,
     which is chronologically, out loud, without a diagram.

     WHY THE YEAR IS IN THE GUTTER AND NOT IN THE HEADING
     ----------------------------------------------------
     A heading that opens with a number reads as a list item. Put the year in a
     mono gutter beside the chapter and the heading gets to be a sentence, the
     years line up into a column you can skim on their own, and the two can be
     read independently. On desktop the year sticks to the top of its chapter
     while that chapter is being read, so you always know which one you are in.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'about-page-story',
    num: 7,
    name: 'Story',
    kind: 'DOM / scrolled chapters',
    accent: HUE.story,
    tagline: 'Five chapters, in the order they happened',
    desc: 'A scrolling biography in five titled chapters, each with its year in the margin and one paragraph of plain prose. ' +
          'It opens with the name, role and location and closes with three notes on how he works and two links.',
    interaction: 'Scroll. Chapters fade up as they enter; the year in the margin sticks while you are inside its chapter.',
    hint: 'Scroll &middot; 2016 to now',

    /* Miniature: a mono year column, a hairline spine, and stacked chapter
       blocks. Thirty one operations. */
    preview: function (ctx, w, h, t, heat) {
      var spine = w * 0.28;
      var cx = w * 0.34, cw = w * 0.52;
      var top = h * 0.13, gap = h * 0.205;
      var i, j, y;

      hair(ctx, spine, top - h * 0.03, spine, h * 0.94, 'rgba(236,236,239,0.10)');

      /* One travelling chapter, the same single authored moment the page has. */
      var lit = Math.floor((t * 0.42) % 4);

      for (i = 0; i < 4; i++) {
        y = top + i * gap;
        var on = i === lit ? 1 : 0;

        /* Year, drawn as a short mono-weight block in the gutter. */
        box(ctx, w * 0.10, y, w * 0.13, 3,
          'rgba(155,143,212,' + (0.45 + on * (0.45 + heat * 0.1)).toFixed(3) + ')');
        dot(ctx, spine, y + 1.5, on ? 2.4 : 1.4,
          'rgba(155,143,212,' + (0.35 + on * 0.6).toFixed(3) + ')');

        /* Chapter title, then three lines of prose. */
        box(ctx, cx, y - 1, cw * (0.62 + (i % 2) * 0.2), 3.5,
          'rgba(236,236,239,' + (0.52 + on * 0.40).toFixed(3) + ')');
        for (j = 0; j < 3; j++) {
          box(ctx, cx, y + h * 0.055 + j * h * 0.042, cw * (0.96 - j * 0.18), 1.5,
            'rgba(236,236,239,' + (0.16 + on * 0.22).toFixed(3) + ')');
        }
      }
    },

    mount: function (root, ctx) {
      var b = bag();

      root.classList.add('about', 'about-story');
      tint(root, HUE.story);

      var scroller = pageScroller(root, 'about-story__scroll');
      var inner = SE.el('div', 'about-story__inner');

      var html =
        '<header class="about-story__head">' +
          '<h2 class="about-story__name">' + BIO.name + '</h2>' +
          '<p class="about-story__role">' + BIO.role +
            '<span class="about-story__where t-num">' + BIO.location + '</span></p>' +
          '<p class="about-story__lede">' + BIO.paras[0] + '</p>' +
        '</header>' +
        '<div class="about-story__chapters">' +
          BIO.story.map(function (c) {
            return '<section class="about-story__ch">' +
              '<p class="about-story__yr t-num">' + c.yr + '</p>' +
              '<div class="about-story__body">' +
                '<h3 class="about-story__t">' + c.t + '</h3>' +
                '<p class="about-story__p">' + c.p + '</p>' +
              '</div>' +
            '</section>';
          }).join('') +
        '</div>' +
        '<footer class="about-story__foot">' +
          '<h3 class="about-story__footTitle">A few things that are true on any project</h3>' +
          '<dl class="about-story__notes">' +
            BIO.human.map(function (n) {
              return '<div><dt>' + n.k + '</dt><dd>' + n.v + '</dd></div>';
            }).join('') +
          '</dl>' +
          actions('about-story__act') +
        '</footer>';

      inner.innerHTML = html;
      scroller.appendChild(inner);

      root.appendChild(SE.hintStrip('<span>Scroll from 2016 to now</span><span>' + BIO.role + ', ' + BIO.location + '</span>'));

      wireActions(inner, b, ctx);

      /* One observer for the chapters and the closing notes. Everything above
         the fold is handled by the entrance instead, so the reader never waits
         on an observer for the first thing they see. */
      var items = SE.$$('.about-story__ch', inner).concat(SE.$$('.about-story__foot > *', inner));
      var io = revealer(inner, items, scroller, 70);
      if (io) b.obs(io);

      enter(root, b);

      return {
        destroy: function () {
          b.all();
          root.className = '';
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A biography in five chapters',
      philosophy: [
        'Chronology is the format people already use to answer "how did you get here". Any cleverer ordering makes the reader rebuild the timeline in their head before they can use it.',
        'The year belongs in the margin, not in the heading. That leaves the heading free to be a sentence and turns the years into a column you can skim on their own.',
        'Five chapters, roughly 60 words each. Any more and the page stops being a story and becomes a CV in paragraph form.'
      ],
      hierarchy: [
        '1. Name, then role and location.',
        '2. Opening paragraph, 17px --ink at 66ch, the whole answer in case nothing else is read.',
        '3. Chapter titles, 24 to 30px --ink.',
        '4. Chapter paragraphs, 17px --ink-2 at 68ch.',
        '5. Years, mono 12px --ink-4 in the gutter, deliberately quiet.',
        '6. Closing notes and the two actions.'
      ],
      structure: [
        'Root `.about-story` absolute inset 0, own scroller `.about-story__scroll`, inner capped at 74rem and centred.',
        'Each `.about-story__ch` is `grid-template-columns: 7rem minmax(0, 1fr)` with a 1px --line top rule and 2.75rem of padding above.',
        '`.about-story__yr` is `position: sticky; top: var(--pad)` inside its own chapter, so it releases at the chapter boundary.',
        'Closing `.about-story__notes` is a three column definition list at 1024px and wider.'
      ],
      interaction: [
        'Vertical scroll only. No scrubbing, no pinning, no scroll hijack: the wheel does exactly what the wheel does.',
        '"See the work" calls ctx.onSeeMore(); removed from the DOM if no handler is supplied. "Get in touch" is a mailto anchor.'
      ],
      choreography: [
        { n: 'Entrance', d: 'Header only: opacity 0 to 1 and translate3d(0, 20px, 0) to 0 over 520ms cubic-bezier(0.23, 1, 0.32, 1), applied 40ms after mount so the initial state paints first.' },
        { n: 'Chapters', d: 'IntersectionObserver threshold 0.18, rootMargin 0px 0px -8% 0px. Each chapter opacity 0 to 1, translate3d(0, 16px, 0) to 0 over 460ms ease-out, 70ms apart within a group of six. Unobserved on first fire so nothing recomputes on the way back up.' },
        { n: 'Deliberately absent', d: 'No per-word reveal, no scroll-linked opacity on paragraphs. Body copy that changes brightness while the eye is on it is harder to read, and this page is only for reading.' }
      ],
      scroll: [
        'The year is CSS `position: sticky` within its chapter. No JavaScript reads scrollTop anywhere on this page.',
        'No ScrollTrigger, no Lenis dependency. If gsap is absent the page is byte-for-byte the same.'
      ],
      hover: [
        'Inside `@media (hover: hover) and (pointer: fine)` only: the action buttons shift border-color and color to --c-accent over 180ms ease-out. Chapters have no hover state.'
      ],
      click: [
        'Two targets only, both in the footer.'
      ],
      responsive: {
        desktop: 'Two column chapters, 7rem year gutter, sticky year, notes in three columns, measure at 68ch.',
        tablet: 'Year gutter narrows to 5rem, notes drop to two columns, measure holds at 66ch.',
        mobile: 'Recomposed: the year moves above its chapter title as a 11px mono line with 0.18em tracking and the gutter disappears entirely, so the paragraph gets the full width at 34ch to 40ch. Notes stack, actions become full-width 48px targets.'
      },
      a11y: [
        'h2 for the name, h3 per chapter and for the closing block. The years are paragraphs, not headings, because they are not landmarks.',
        'The closing notes are a real dl / dt / dd, so the pairing survives a screen reader.',
        'Body copy at --ink-2 (7.2:1); the opening paragraph at --ink (16.9:1). Years are --ink-4 (4.7:1) and are metadata, not prose.',
        'prefers-reduced-motion: the observer is skipped entirely and every chapter is marked in at mount, so no content depends on entering the viewport.'
      ],
      perf: [
        'Zero rAF subscriptions and zero canvases. One IntersectionObserver, disconnected in destroy().',
        'Transitions are opacity and transform only. Sticky years are composited by the browser.',
        'About 3.4KB of text; nothing is fetched.'
      ],
      packages: [
        { p: 'gsap (installed)', w: 'Do not use it here. An IntersectionObserver and two CSS transitions are smaller and cannot desynchronise from the scroll.' },
        { p: 'lenis (installed)', w: 'Do not add smooth scroll to a reading page. It delays the position the reader asked for.' }
      ],
      architecture: [
        { f: 'components/about/StoryPage.tsx', r: 'Server component. Maps the chapter array to sections.' },
        { f: 'components/about/Chapter.tsx', r: 'One chapter: year, title, paragraph.' },
        { f: 'components/about/useReveal.ts', r: 'Client hook wrapping one shared IntersectionObserver for every chapter on the page.' },
        { f: 'lib/about/story.ts', r: 'Typed chapter array: year, title, paragraph.' }
      ],
      state: [
        'No state. The reveal hook writes a data attribute through a ref; React never re-renders on scroll.',
        'The observer instance is a module-level ref shared by all chapters, not one observer per chapter.'
      ],
      typography: [
        'Name: Space Grotesk 500, clamp(2rem, 4.4vw, 3.5rem), line-height 0.96, letter-spacing -0.038em.',
        'Chapter title: Space Grotesk 500, clamp(1.375rem, 2.1vw, 1.875rem), line-height 1.14, letter-spacing -0.024em.',
        'Chapter paragraph: 1.0625rem / 1.7, max-width 68ch, --ink-2.',
        'Year: JetBrains Mono 500, 0.75rem, letter-spacing 0.16em, --ink-4, tabular figures.'
      ],
      color: [
        'Accent #9B8FD4 appears on the chapter marker dot, the closing dt labels and the focus ring. Never on a paragraph.',
        'Chapter rules are --line (8% ink). The closing block is separated by a --line-2 rule at 16%.'
      ],
      spacing: [
        'Chapter rhythm: 2.75rem above the rule, 2.75rem below it.',
        'Header to first chapter: clamp(3rem, 8vh, 5.5rem).',
        'Footer inset above the hint strip: calc(var(--hint) + 2rem).'
      ],
      relationships: [
        'Vertical position encodes time, and only time. Nothing else on the page is ordered by anything.',
        'Mono means a year. The dot on the spine marks the chapter boundary, nothing more.'
      ],
      acceptance: [
        'Name, role, location and the opening paragraph are all visible at 1440 by 900 before any scroll.',
        'All five years are legible in the gutter and the column is optically aligned to the chapter titles.',
        'At 390 by 844 the year sits above the title, there is no gutter, and there is no horizontal scrollbar.',
        'SE.ticker.count() is unchanged across mount and destroy().'
      ]
    }
  });

  /* ==========================================================================
     PAGE 08  -  CARD
     --------------------------------------------------------------------------
     One plate, everything findable without scrolling: name, role, place,
     availability, the years, the stack, the reply time, a short biography, the
     one thing he will not ship, and two links. It is the page for the reader
     who is deciding in fifteen seconds whether to send the email.

     WHY A LABELLED TABLE AND NOT A PARAGRAPH
     ----------------------------------------
     A paragraph is read start to finish. A labelled table is scanned, which is
     the mode a person is actually in when they are checking whether someone is
     available and where they are. The biography is still here as prose, sitting
     beside the table rather than instead of it, so the page serves both without
     asking the reader which one they are.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'about-page-card',
    num: 8,
    name: 'Card',
    kind: 'DOM / labelled plate',
    accent: HUE.card,
    tagline: 'Everything about him on one plate',
    desc: 'A single bordered plate holding the name, role, location, years working, current focus, tools, availability and reply time, ' +
          'each on a labelled row, with a short biography beside it and two links at the foot.',
    interaction: 'Read and scan. Nothing is hidden behind a control; the whole card is present at once.',
    hint: 'Everything on one plate &middot; No scrolling needed',

    /* Miniature: the plate outline, a name rule, and seven label / value rows.
       Thirty four operations. */
    preview: function (ctx, w, h, t, heat) {
      var x = w * 0.11, y = h * 0.13;
      var cw = w * 0.78, chh = h * 0.74;
      var i, ry;

      /* The plate. Four hairlines rather than a stroked rect, so the frame
         weight matches the rules inside it. */
      box(ctx, x, y, cw, chh, 'rgba(224,215,195,0.035)');
      hair(ctx, x, y, x + cw, y, 'rgba(224,215,195,0.42)');
      hair(ctx, x, y + chh, x + cw, y + chh, 'rgba(224,215,195,0.42)');
      hair(ctx, x, y, x, y + chh, 'rgba(224,215,195,0.42)');
      hair(ctx, x + cw, y, x + cw, y + chh, 'rgba(224,215,195,0.42)');

      /* Name and role, then the rule that separates the head from the rows. */
      box(ctx, x + w * 0.055, y + h * 0.075, cw * 0.54, 4.5, 'rgba(236,236,239,0.88)');
      box(ctx, x + w * 0.055, y + h * 0.145, cw * 0.32, 2, 'rgba(224,215,195,0.62)');
      hair(ctx, x, y + h * 0.215, x + cw, y + h * 0.215, 'rgba(236,236,239,0.10)');

      /* Seven rows: a short label on the left, a longer value on the right. */
      var lit = Math.floor((t * 0.6) % 7);
      for (i = 0; i < 7; i++) {
        ry = y + h * 0.27 + i * h * 0.063;
        box(ctx, x + w * 0.055, ry, cw * 0.20, 1.5,
          'rgba(224,215,195,' + (i === lit ? 0.72 + heat * 0.2 : 0.34).toFixed(3) + ')');
        box(ctx, x + w * 0.34, ry, cw * (0.30 + ((i * 7) % 5) * 0.06), 1.5,
          'rgba(236,236,239,' + (i === lit ? 0.72 : 0.36).toFixed(3) + ')');
        if (i < 6) hair(ctx, x + w * 0.055, ry + h * 0.031, x + cw - w * 0.055, ry + h * 0.031,
          'rgba(236,236,239,0.055)');
      }

      /* Two action outlines at the foot of the plate. */
      hair(ctx, x + w * 0.055, y + chh - h * 0.055, x + w * 0.055 + cw * 0.22, y + chh - h * 0.055,
        'rgba(224,215,195,0.55)');
      hair(ctx, x + w * 0.055 + cw * 0.27, y + chh - h * 0.055, x + w * 0.055 + cw * 0.46, y + chh - h * 0.055,
        'rgba(236,236,239,0.28)');
    },

    mount: function (root, ctx) {
      var b = bag();

      root.classList.add('about', 'about-card');
      tint(root, HUE.card);

      var scroller = pageScroller(root, 'about-card__scroll');
      var inner = SE.el('div', 'about-card__inner');

      /* The first three rows are the identity and are set as the heading, so
         they are not repeated in the table below. */
      var rows = BIO.cardRows.slice(3);

      inner.innerHTML =
        '<article class="about-card__plate">' +
          '<header class="about-card__head">' +
            '<h2 class="about-card__name">' + BIO.name + '</h2>' +
            '<p class="about-card__role">' + BIO.role + '</p>' +
            '<p class="about-card__where t-num">' + BIO.location + '</p>' +
            '<p class="about-card__status"><i aria-hidden="true"></i>Available for work</p>' +
          '</header>' +
          '<div class="about-card__grid">' +
            '<dl class="about-card__rows">' +
              rows.map(function (r, i) {
                return '<div class="about-card__row">' +
                  '<dt><span class="about-card__i t-num">' + SE.pad(i + 1) + '</span>' + r.k + '</dt>' +
                  '<dd>' + r.v + '</dd>' +
                '</div>';
              }).join('') +
            '</dl>' +
            '<div class="about-card__side">' +
              '<section class="about-card__bio">' +
                '<h3>In one paragraph</h3>' +
                '<p>' + BIO.paras[0] + '</p>' +
              '</section>' +
              '<section class="about-card__bio">' +
                '<h3>' + BIO.human[1].k + '</h3>' +
                '<p>' + BIO.human[1].v + '</p>' +
              '</section>' +
            '</div>' +
          '</div>' +
          '<footer class="about-card__foot">' +
            actions('about-card__act') +
          '</footer>' +
        '</article>';

      scroller.appendChild(inner);
      root.appendChild(SE.hintStrip('<span>' + BIO.role + '</span><span>' + BIO.location + ' &middot; ' + BIO.tz + '</span>'));

      wireActions(inner, b, ctx);
      enter(root, b);

      return {
        destroy: function () {
          b.all();
          root.className = '';
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'The scannable one',
      philosophy: [
        'Someone deciding whether to send an email is scanning, not reading. Give them labelled rows, in the order they ask the questions: where, how long, doing what, with what, free when, answering how fast.',
        'The prose does not get deleted for the table, it sits next to it. A page that only scans has no voice; a page that only reads cannot be checked.',
        'Nothing is behind a control. No tabs, no accordions, no "read more". The whole card is present on first paint.'
      ],
      hierarchy: [
        '1. Name, 40 to 64px --ink.',
        '2. Role, 18px --ink; location in mono --ink-4; availability with a 6px accent dot.',
        '3. Seven labelled rows: label mono 12px --ink-4, value 15px --ink.',
        '4. Two prose blocks at 46ch, --ink-2, on the right.',
        '5. Two actions at the foot of the plate.'
      ],
      structure: [
        'Root `.about-card` absolute inset 0 with its own scroller; the plate is centred with `place-items: center` and `min-height: 100%`.',
        '`.about-card__plate` is max-width 68rem, 1px --line-2 border, 2px radius, --void-2 background, padding clamp(1.5rem, 3.4vw, 3rem).',
        '`.about-card__grid` is `grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr)` with a clamp(2rem, 4vw, 4rem) gap.',
        'Each `.about-card__row` is `grid-template-columns: 13.5rem minmax(0, 1fr)` with a 1px --line bottom rule.'
      ],
      interaction: [
        'None beyond scrolling on short viewports and the two links. That is the point of the concept.',
        '"See the work" calls ctx.onSeeMore() and is removed if no handler exists; "Get in touch" is a mailto anchor.'
      ],
      choreography: [
        { n: 'Entrance', d: 'The plate: opacity 0 to 1 and translate3d(0, 14px, 0) to 0 over 520ms cubic-bezier(0.23, 1, 0.32, 1), applied 40ms after mount. One element, one transition; the rows do not stagger, because a staggered table is a table you cannot read for 600ms.' },
        { n: 'Availability dot', d: 'Static. A pulsing dot on a page that is otherwise still would pull the eye off the name for as long as the page is open.' },
        { n: 'Nothing else', d: 'No idle animation, no ticker subscription, no observer.' }
      ],
      scroll: [
        'At 1440 by 900 the plate fits without scrolling. Below that the page scrolls normally, with the plate vertically centred while it fits and top-aligned once it does not.',
        'No scroll listener of any kind.'
      ],
      hover: [
        'Inside `@media (hover: hover) and (pointer: fine)` only: rows raise their value from --ink to --ink at 100% and lift the row background to rgba(236,236,239,0.02) over 140ms ease-out, which is a reading aid on a wide table, not decoration.',
        'Actions shift border-color and color to --c-accent over 180ms.'
      ],
      click: [
        'Two targets. The card itself is not clickable, because a card-shaped element that navigates on click is a trap for anyone trying to select the email address.'
      ],
      responsive: {
        desktop: 'Two columns inside the plate, rows on the left at a 13.5rem label column, prose on the right at 46ch.',
        tablet: 'One column: rows first at a 11rem label column, prose below at 60ch.',
        mobile: 'Recomposed. Each row becomes a stacked block, label above value, with the mono index removed and the row rule kept as the only separator. The plate loses its side border and becomes a full-bleed panel with top and bottom rules only, so no measure is lost to a frame. Actions become full-width 48px targets.'
      },
      a11y: [
        'The table is a real dl with one div per pair, so dt and dd stay associated.',
        'The availability dot is aria-hidden; the word "Available for work" carries the meaning.',
        'Row indices are decorative mono numbers inside the dt and are aria-hidden.',
        'Labels are --ink-4 (4.7:1) and short; values are --ink (16.9:1); prose is --ink-2 (7.2:1).',
        'prefers-reduced-motion: entrance removed, plate at final position on first paint.'
      ],
      perf: [
        'No canvas, no observer, no ticker. One CSS transition on one element for the whole page.',
        'The plate is a single paint; nothing composites after the entrance completes.'
      ],
      packages: [
        { p: 'gsap (installed)', w: 'Not needed. One transition on one element.' },
        { p: 'A table library', w: 'Do not. This is ten static pairs, not a data grid; a library here would ship 40KB to render a dl.' }
      ],
      architecture: [
        { f: 'components/about/CardPage.tsx', r: 'Server component, renders the whole plate from a typed record.' },
        { f: 'components/about/CardRow.tsx', r: 'One dt / dd pair with its index.' },
        { f: 'lib/about/card.ts', r: 'The typed record: name, role, location, since, focus, stack, tools, availability, replyTime, languages.' }
      ],
      state: [
        'No state and no client component in the static path. Only the "See the work" button needs "use client".',
        'Availability is a field in the record, not a computed value, so it cannot silently go stale in a way nobody can see.'
      ],
      typography: [
        'Name: Space Grotesk 500, clamp(2rem, 4vw, 3.25rem), line-height 0.98, letter-spacing -0.038em.',
        'Row label: JetBrains Mono 500, 0.75rem, letter-spacing 0.14em, uppercase, --ink-4.',
        'Row value: Space Grotesk 400, 0.9375rem, line-height 1.5, --ink.',
        'Prose: 0.9375rem / 1.66, max-width 46ch, --ink-2.'
      ],
      color: [
        'Accent #E0D7C3 carries the availability dot, the prose headings and the focus ring only.',
        'Plate ground is --void-2 (#0b0b0f), one step above the page --void, with a --line-2 border. No shadow, no glass.'
      ],
      spacing: [
        'Plate padding: clamp(1.5rem, 3.4vw, 3rem). Row height: 0.875rem above and below the value.',
        'Head to grid: 2rem, separated by a --line rule. Grid to foot: 2rem, separated by a --line rule.'
      ],
      relationships: [
        'The mono index is a scanning aid and encodes nothing but order.',
        'The accent dot means one thing on this page: currently available. It appears nowhere else in that hue.'
      ],
      acceptance: [
        'At 1440 by 900 the entire plate, including both actions, is visible without scrolling.',
        'Every one of the ten fields is present and labelled, and the email address can be selected with the mouse.',
        'At 390 by 844 rows are stacked label-over-value with no horizontal scrollbar and the plate runs full width.',
        'SE.ticker.count() is unchanged across mount and destroy(), and destroy() leaves no listener behind.'
      ]
    }
  });

  /* ==========================================================================
     PAGE 09  -  PROCESS
     --------------------------------------------------------------------------
     Six numbered steps describing how a project actually goes, from the first
     call to the pass in month three that only deletes things. It is the About
     page for the reader whose real question is not "who is this" but "what
     happens if I hire him", and it answers that in the order it happens.

     WHY NUMBERS AND NOT ICONS
     -------------------------
     A numbered list says two things an icon row cannot: that there is an order,
     and that the order is the argument. Six mono numerals in a column also give
     the page its only ornament for free, which is why there is no other one.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'about-page-process',
    num: 9,
    name: 'Process',
    kind: 'DOM / numbered steps',
    accent: HUE.process,
    tagline: 'What actually happens, in order',
    desc: 'Six numbered steps describing how a project runs from the first call to handover, each with a short paragraph in plain language. ' +
          'Opens with the name, role and location; closes with how he works and two links.',
    interaction: 'Scroll. Steps arrive one after another as they enter; nothing moves once it is on screen.',
    hint: 'Six steps &middot; First call to handover',

    /* Miniature: a numbered column joined by a spine, each step a title and one
       line of prose. Thirty three operations. */
    preview: function (ctx, w, h, t, heat) {
      var nx = w * 0.17;
      var cx = w * 0.30, cw = w * 0.56;
      var top = h * 0.15, gap = h * 0.155;
      var i, y;

      hair(ctx, nx, top, nx, top + gap * 4.4, 'rgba(236,236,239,0.09)');

      var lit = Math.floor((t * 0.5) % 5);
      for (i = 0; i < 5; i++) {
        y = top + i * gap;
        var on = i === lit ? 1 : 0;

        /* The step marker: a small square, filled when the step is lit. Squares
           rather than circles, because in this file circles are only dots. */
        box(ctx, nx - 4, y - 4, 8, 8,
          on ? 'rgba(199,122,158,' + (0.85 + heat * 0.15).toFixed(3) + ')' : 'rgba(199,122,158,0.20)');
        hair(ctx, nx - 4, y - 4, nx + 4, y - 4, 'rgba(199,122,158,0.5)');
        hair(ctx, nx - 4, y + 4, nx + 4, y + 4, 'rgba(199,122,158,0.5)');

        /* Title, then two lines of prose. */
        box(ctx, cx, y - 5, cw * (0.54 + (i % 3) * 0.14), 3.5,
          'rgba(236,236,239,' + (0.50 + on * 0.42).toFixed(3) + ')');
        box(ctx, cx, y + h * 0.022, cw * 0.94, 1.5,
          'rgba(236,236,239,' + (0.16 + on * 0.22).toFixed(3) + ')');
        box(ctx, cx, y + h * 0.052, cw * 0.66, 1.5,
          'rgba(236,236,239,' + (0.16 + on * 0.22).toFixed(3) + ')');
      }
    },

    mount: function (root, ctx) {
      var b = bag();

      root.classList.add('about', 'about-process');
      tint(root, HUE.process);

      var scroller = pageScroller(root, 'about-process__scroll');
      var inner = SE.el('div', 'about-process__inner');

      inner.innerHTML =
        '<header class="about-process__head">' +
          '<h2 class="about-process__name">' + BIO.name + '</h2>' +
          '<p class="about-process__role">' + BIO.role +
            '<span class="about-process__where t-num">' + BIO.location + '</span></p>' +
          '<p class="about-process__lede">' + BIO.paras[1] + '</p>' +
          '<h3 class="about-process__sub">How a project runs, start to finish</h3>' +
        '</header>' +
        '<ol class="about-process__steps">' +
          BIO.process.map(function (s, i) {
            return '<li class="about-process__step">' +
              '<span class="about-process__n t-num" aria-hidden="true">' + SE.pad(i + 1) + '</span>' +
              '<div class="about-process__body">' +
                '<h4 class="about-process__t">' + s.t + '</h4>' +
                '<p class="about-process__p">' + s.p + '</p>' +
              '</div>' +
            '</li>';
          }).join('') +
        '</ol>' +
        '<footer class="about-process__foot">' +
          '<section class="about-process__note">' +
            '<h3>' + BIO.human[0].k + '</h3>' +
            '<p>' + BIO.human[0].v + '</p>' +
          '</section>' +
          '<section class="about-process__note">' +
            '<h3>Availability</h3>' +
            '<p>' + BIO.available + '. ' + BIO.paras[2].split('. ').slice(1).join('. ') + '</p>' +
          '</section>' +
          actions('about-process__act') +
        '</footer>';

      scroller.appendChild(inner);
      root.appendChild(SE.hintStrip('<span>Six steps, first call to handover</span><span>' + BIO.location + '</span>'));

      wireActions(inner, b, ctx);

      var io = revealer(inner, SE.$$('.about-process__step', inner).concat(SE.$$('.about-process__foot > *', inner)), scroller, 70);
      if (io) b.obs(io);

      enter(root, b);

      return {
        destroy: function () {
          b.all();
          root.className = '';
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'How the work actually goes',
      philosophy: [
        'The question behind most About pages is not biographical. It is "what happens if I hire this person", and a numbered sequence answers it in the order the reader will live it.',
        'Every step names a real artefact: a call, a one page scope, a schema, a link you can open, a runbook. A process page that only names activities is a process page nobody can hold you to.',
        'Six steps. Four is a slogan and ten is a methodology; six is roughly how many stages a three month project actually has.'
      ],
      hierarchy: [
        '1. Name, role, location.',
        '2. Opening paragraph, 17px --ink at 66ch.',
        '3. "How a project runs, start to finish", 22 to 30px --ink.',
        '4. Step titles, 19 to 24px --ink.',
        '5. Step paragraphs, 16px --ink-2 at 66ch.',
        '6. Step numerals, mono 13px --c-accent at 55% opacity: an index, never the loudest thing in the row.'
      ],
      structure: [
        'Root `.about-process` absolute inset 0 with its own scroller; inner capped at 68rem and centred.',
        'The steps are a real `ol`, list-style none, each `li` a grid of `4.5rem minmax(0, 1fr)`.',
        'A 1px --line spine is drawn with a `::before` on the ol at `left: 2.25rem`, stopping 1.5rem short of the last numeral so it reads as a sequence with an end rather than an open axis.',
        'Footer is a two column grid of notes above the action pair.'
      ],
      interaction: [
        'Vertical scroll only. No step is collapsible: an accordion here would hide the answer behind the question.',
        '"See the work" calls ctx.onSeeMore() and is removed when no handler is supplied; "Get in touch" is a mailto anchor.'
      ],
      choreography: [
        { n: 'Entrance', d: 'Header only: opacity 0 to 1 and translate3d(0, 20px, 0) to 0 over 520ms cubic-bezier(0.23, 1, 0.32, 1), 40ms after mount.' },
        { n: 'Steps', d: 'IntersectionObserver at threshold 0.18 with rootMargin 0px 0px -8% 0px. Each step: opacity 0 to 1, translate3d(0, 16px, 0) to 0 over 440ms ease-out, 70ms apart. Unobserved on first fire.' },
        { n: 'Numeral', d: 'The numeral shares its parent step transition rather than getting its own; a numeral that counts up or draws in would make the reader wait to find out what number it already is.' }
      ],
      scroll: [
        'No scroll listener, no ScrollTrigger, no pinning. The reader keeps the scroll position they asked for.'
      ],
      hover: [
        'Inside `@media (hover: hover) and (pointer: fine)` only: hovering a step raises its numeral opacity from 0.55 to 1 over 140ms ease-out. Nothing moves.'
      ],
      click: [
        'Two targets, both in the footer.'
      ],
      responsive: {
        desktop: 'Numeral gutter 4.5rem with the spine, step paragraphs at 66ch, footer notes in two columns.',
        tablet: 'Gutter narrows to 3.25rem, spine holds, notes stay at two columns until 768px.',
        mobile: 'Recomposed: the numeral moves inline with the step title as a 11px mono prefix, the gutter and the spine are both removed, and each step is separated by a 1px --line rule instead. The paragraph gets the full width. Actions become full-width 48px targets.'
      },
      a11y: [
        'A real ordered list, so the count and position are announced. The visual numerals are aria-hidden because the list already carries them.',
        'Heading order: h2 name, h3 section title, h4 per step.',
        'Step paragraphs at --ink-2 (7.2:1); numerals are --c-accent on --void at 55% opacity and are decorative only.',
        'prefers-reduced-motion: the observer is skipped and every step is marked in at mount.'
      ],
      perf: [
        'No canvas, no ticker, one IntersectionObserver disconnected in destroy().',
        'The spine is a 1px pseudo-element, not a border on every row, so there is one paint rather than six.'
      ],
      packages: [
        { p: 'gsap (installed)', w: 'Not needed. Six CSS transitions triggered by one observer.' },
        { p: 'framer-motion (installed)', w: 'Do not add it for a stagger this small. It would ship a runtime to do what a --d custom property already does.' }
      ],
      architecture: [
        { f: 'components/about/ProcessPage.tsx', r: 'Server component, maps the step array to list items.' },
        { f: 'components/about/Step.tsx', r: 'One numbered step.' },
        { f: 'components/about/useReveal.ts', r: 'Shared observer hook, the same one the Story page uses.' },
        { f: 'lib/about/process.ts', r: 'Typed step array: title, paragraph.' }
      ],
      state: [
        'No state. Step order is array order; nothing is computed at runtime.',
        'The observer is a ref shared across steps.'
      ],
      typography: [
        'Section title: Space Grotesk 500, clamp(1.375rem, 2.4vw, 1.875rem), letter-spacing -0.026em.',
        'Step title: Space Grotesk 500, clamp(1.1875rem, 1.7vw, 1.5rem), line-height 1.18.',
        'Step paragraph: 1rem / 1.68, max-width 66ch, --ink-2.',
        'Numeral: JetBrains Mono 500, 0.8125rem, letter-spacing 0.12em, tabular figures.'
      ],
      color: [
        'Accent #C77A9E appears on the numerals, the footer note headings and the focus ring. Never on prose.',
        'The spine is --line at 8% ink. There is no filled track and no progress indicator: this is a sequence, not a measurement.'
      ],
      spacing: [
        'Step rhythm: 2.5rem between steps, 0.75rem between a step title and its paragraph.',
        'Header to first step: clamp(2.5rem, 7vh, 4.5rem).',
        'Footer separated by a --line-2 rule with 3rem above.'
      ],
      relationships: [
        'The numeral encodes position in the sequence and nothing else. It is not a rating, a duration or a weight.',
        'The spine encodes continuity: these six things happen to the same project, in this order.'
      ],
      acceptance: [
        'Name, role, location and the opening paragraph are visible at 1440 by 900 before any scroll.',
        'All six steps are readable with motion disabled and none of them depend on entering the viewport.',
        'At 390 by 844 numerals sit inline with the titles, the spine is gone, and there is no horizontal scrollbar.',
        'SE.ticker.count() is unchanged across mount and destroy().'
      ]
    }
  });

  /* ==========================================================================
     PAGE 10  -  CONVERSATION
     --------------------------------------------------------------------------
     The six questions people actually open an email with, answered in the first
     person at full length. No recording, no timecodes, no scrub axis: the
     question is a heading, the answer is prose underneath it, and both are
     legible in a screenshot.

     WHY THE QUESTION IS THE HEADING
     -------------------------------
     Set the question as a heading and the page becomes navigable by scanning
     the questions alone, which is how anybody uses an FAQ that is not pretending
     to be something else. It also means the document outline is a list of the
     things a reader wanted to know, which is a better outline than any set of
     invented section names.
     ========================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'about-page-conversation',
    num: 10,
    name: 'Conversation',
    kind: 'DOM / question and answer',
    accent: HUE.answers,
    tagline: 'Six questions, answered in full',
    desc: 'Six questions people usually ask, each answered in a first-person paragraph: what he builds, his stack, how he works, ' +
          'what a project is like, what he got wrong, and what he wants next. Name, role and location sit at the top; two links at the foot.',
    interaction: 'Scroll and read. Every answer is open; nothing is behind a toggle.',
    hint: 'Six questions &middot; All answers open',

    /* Miniature: three question and answer groups, question in the accent and
       answers in body weight, with a left margin rule. Thirty operations. */
    preview: function (ctx, w, h, t, heat) {
      var mx = w * 0.15;
      var cw = w * 0.68;
      var top = h * 0.14, gap = h * 0.27;
      var i, j, y;

      hair(ctx, mx - 9, top - h * 0.03, mx - 9, h * 0.93, 'rgba(236,236,239,0.08)');

      var lit = Math.floor((t * 0.42) % 3);
      for (i = 0; i < 3; i++) {
        y = top + i * gap;
        var on = i === lit ? 1 : 0;

        /* The question mark in the margin, then the question itself. */
        dot(ctx, mx - 9, y + 2, on ? 2.6 : 1.5,
          'rgba(224,185,74,' + (0.35 + on * 0.6).toFixed(3) + ')');
        box(ctx, mx, y, cw * (0.50 + (i % 2) * 0.22), 4,
          'rgba(224,185,74,' + (0.55 + on * (0.35 + heat * 0.1)).toFixed(3) + ')');

        /* Four lines of answer, at reading weight. */
        for (j = 0; j < 4; j++) {
          box(ctx, mx, y + h * 0.058 + j * h * 0.042, cw * (0.98 - (j === 3 ? 0.38 : (j % 2) * 0.12)), 1.5,
            'rgba(236,236,239,' + (0.18 + on * 0.24).toFixed(3) + ')');
        }
      }
    },

    mount: function (root, ctx) {
      var b = bag();

      root.classList.add('about', 'about-talk');
      tint(root, HUE.answers);

      var scroller = pageScroller(root, 'about-talk__scroll');
      var inner = SE.el('div', 'about-talk__inner');

      inner.innerHTML =
        '<header class="about-talk__head">' +
          '<h2 class="about-talk__name">' + BIO.name + '</h2>' +
          '<p class="about-talk__role">' + BIO.role +
            '<span class="about-talk__where t-num">' + BIO.location + '</span></p>' +
          '<p class="about-talk__lede">' + BIO.paras[0] + '</p>' +
        '</header>' +
        '<div class="about-talk__qa">' +
          BIO.answers.map(function (x) {
            return '<section class="about-talk__pair">' +
              '<h3 class="about-talk__q">' + x.q + '</h3>' +
              '<p class="about-talk__a">' + x.a + '</p>' +
            '</section>';
          }).join('') +
        '</div>' +
        '<footer class="about-talk__foot">' +
          '<p class="about-talk__close">' + BIO.available +
            '. He replies the same day most days, from ' + BIO.location + ' on ' + BIO.tz + '.</p>' +
          actions('about-talk__act') +
        '</footer>';

      scroller.appendChild(inner);
      root.appendChild(SE.hintStrip('<span>Six questions, all answers open</span><span>' + BIO.email + '</span>'));

      wireActions(inner, b, ctx);

      var io = revealer(inner, SE.$$('.about-talk__pair', inner).concat(SE.$$('.about-talk__foot > *', inner)), scroller, 70);
      if (io) b.obs(io);

      enter(root, b);

      return {
        destroy: function () {
          b.all();
          root.className = '';
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'The questions people actually ask',
      philosophy: [
        'The interview format works because the reader recognises their own question in the heading. Written as invented section titles, the same six answers stop being findable.',
        'Every answer is open. An accordion on six paragraphs saves a screen of scrolling and costs the reader the ability to scan, search the page, or screenshot it.',
        'First person throughout. A page written in the third person about how someone likes to work reads like a proposal somebody else wrote for him.'
      ],
      hierarchy: [
        '1. Name, role, location.',
        '2. Opening paragraph, 17px --ink at 66ch.',
        '3. Questions, 22 to 28px --c-accent: they are the navigation.',
        '4. Answers, 17px --ink-2 at 70ch.',
        '5. Closing availability line and two actions.'
      ],
      structure: [
        'Root `.about-talk` absolute inset 0 with its own scroller; inner capped at 62rem and centred, which is narrower than the other pages because this one is almost entirely prose.',
        'Each pair is a `section` holding an `h3` question and a `p` answer, separated by 1px --line rules with 2.5rem of padding.',
        'A 1px --line margin rule runs the length of the question column with a 5px accent dot at each question, drawn with `::before` on the section.'
      ],
      interaction: [
        'Scroll and read. No toggles, no filters, no tabs.',
        '"See the work" calls ctx.onSeeMore() and is removed when no handler exists; "Get in touch" is a mailto anchor.'
      ],
      choreography: [
        { n: 'Entrance', d: 'Header only: opacity 0 to 1 and translate3d(0, 20px, 0) to 0 over 520ms cubic-bezier(0.23, 1, 0.32, 1), 40ms after mount.' },
        { n: 'Pairs', d: 'IntersectionObserver at threshold 0.18, rootMargin 0px 0px -8% 0px. Each pair: opacity 0 to 1, translate3d(0, 16px, 0) to 0 over 440ms ease-out, 70ms apart. Unobserved on first fire so scrolling back up never re-triggers.' },
        { n: 'Explicitly rejected', d: 'Per-word or per-line reveal on the answers. At 70ch and 55 words an answer would be arriving for longer than it takes to read the first line of it.' }
      ],
      scroll: [
        'No scroll listener anywhere. No pinning, no scrub, no snap: a page of six paragraphs must be scrollable at whatever speed the reader wants.'
      ],
      hover: [
        'Inside `@media (hover: hover) and (pointer: fine)` only: hovering a pair raises its margin dot from 0.55 to 1 opacity over 140ms ease-out. The text is untouched.'
      ],
      click: [
        'Two targets, both in the footer.'
      ],
      responsive: {
        desktop: 'Single centred column at 62rem, questions at 28px, answers at 70ch, a 1.75rem margin rule carrying the dots.',
        tablet: 'Same column, questions at 24px, margin rule at 1.25rem, answers at 68ch.',
        mobile: 'Recomposed: the margin rule and its dots are removed entirely and the pair separator becomes the only structure, questions drop to 19px and the answer runs the full width at 38ch to 42ch. Actions become full-width 48px targets.'
      },
      a11y: [
        'Questions are h3 headings, so the document outline is the list of questions and a screen reader user can jump between them.',
        'Answers are ordinary paragraphs; nothing is aria-expanded, because nothing collapses.',
        'Questions are --c-accent (#E0B94A on #08080a, above 9:1) and answers are --ink-2 (7.2:1).',
        'prefers-reduced-motion: the observer is skipped and every pair is marked in at mount.'
      ],
      perf: [
        'No canvas, no ticker, one IntersectionObserver disconnected in destroy().',
        'Roughly 4KB of text. Nothing is fetched and nothing is measured at runtime.'
      ],
      packages: [
        { p: 'gsap (installed)', w: 'Not needed. One observer and two transitions.' },
        { p: 'A headless accordion (radix, headlessui)', w: 'Do not. Nothing on this page collapses, and adding one would be the exact mistake the concept exists to avoid.' }
      ],
      architecture: [
        { f: 'components/about/ConversationPage.tsx', r: 'Server component, maps the answer array to sections.' },
        { f: 'components/about/QAPair.tsx', r: 'One question and answer.' },
        { f: 'lib/about/answers.ts', r: 'Typed array of question and answer strings.' }
      ],
      state: [
        'No state at all. There is nothing on this page that can be open or closed.',
        'The observer is a ref; React never re-renders after hydration.'
      ],
      typography: [
        'Question: Space Grotesk 500, clamp(1.1875rem, 2.2vw, 1.75rem), line-height 1.16, letter-spacing -0.026em, text-wrap balance.',
        'Answer: Space Grotesk 400, clamp(1rem, 1.15vw, 1.0625rem), line-height 1.72, max-width 70ch, --ink-2, text-wrap pretty.',
        'Location and email: JetBrains Mono 0.6875rem, letter-spacing 0.16em, uppercase, --ink-4.'
      ],
      color: [
        'Accent #E0B94A carries the questions, the margin dots and the focus ring. It is the only hue on the page.',
        'Rules are --line at 8% ink; the footer rule is --line-2 at 16%.'
      ],
      spacing: [
        'Pair rhythm: 2.5rem above and below each rule. Question to answer: 0.875rem.',
        'Header to first question: clamp(2.5rem, 7vh, 4.5rem).',
        'Footer inset above the hint strip: calc(var(--hint) + 2rem).'
      ],
      relationships: [
        'The accent means "this is a question". Nothing else on the page uses it, so scanning for the hue is scanning for the questions.',
        'Vertical order is the order somebody would ask these in an email, from what he does to what he wants next.'
      ],
      acceptance: [
        'Name, role, location, the opening paragraph and the first question are visible at 1440 by 900 before any scroll.',
        'All six answers are readable with JavaScript disabled and with motion disabled.',
        'At 390 by 844 the margin rule is gone, the answers run full width, and there is no horizontal scrollbar.',
        'SE.ticker.count() is unchanged across mount and destroy().'
      ]
    }
  });
})(window.SE = window.SE || {});

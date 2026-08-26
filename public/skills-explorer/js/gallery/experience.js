/* ============================================================================
   AREA: EXPERIENCE  -  ten directions for a career history.
   ----------------------------------------------------------------------------
   Career history is almost always a vertical timeline with dots, and a vertical
   timeline with dots can only say one thing: this happened, then this happened.
   Sequence is the least interesting fact about a career.

   THE THREE THINGS THAT ARE INTERESTING
   -------------------------------------
   1. OVERLAP    - two roles running at once is a fact about capacity, and a
                   list of jobs physically cannot show it.
   2. ACCUMULATION - what you were still carrying from the last job while doing
                   the next one. Technologies, on-call, people.
   3. ALTITUDE   - what you were responsible for, which is not monotonic. The
                   contract in this history runs deliberately BELOW the day job
                   it overlaps, and that is the most honest mark on the chart.

   Every one of the ten concepts below is built to say at least one of those
   three things, and the numbers they quote are arithmetic on one shared model,
   not copy. 79 months of calendar, 103 months of role, 24 of them doubled.

   MOBILE
   ------
   A time axis in a 390px column is not a squeezed time axis, it is a different
   axis. Every concept here that draws time horizontally draws it VERTICALLY
   below 768px, with a different label anchoring and a different track packing.
   That flip is a CSS media query plus one branch in the canvas renderers, and
   the branch reads the CANVAS width rather than `SE.env.mobile`, because
   `env.mobile` is only refreshed on a media-query change and a concept can be
   narrower than the window anyway.
   ========================================================================== */
(function (SE) {
  'use strict';

  var M = SE.math;
  var D = SE.DATA || { byId: {}, skills: [] };
  var AREA = 'experience';

  /* ==========================================================================
     THE TIME MODEL
     --------------------------------------------------------------------------
     Everything is a month index counted from Jan 2020, so every position on
     every axis in this file is integer arithmetic on the same origin. Dates as
     strings would mean five concepts each parsing them slightly differently.
     ======================================================================== */
  var EPOCH_Y = 2020;
  var NOW = 79;                    /* Aug 2026 */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function mLabel(i) { return MON[((i % 12) + 12) % 12] + ' ' + (EPOCH_Y + Math.floor(i / 12)); }
  function mShort(i) { return MON[((i % 12) + 12) % 12] + ' ' + String(EPOCH_Y + Math.floor(i / 12)).slice(2); }
  function yearOf(i) { return EPOCH_Y + Math.floor(i / 12); }

  /* "1 yr 7 mo", not "19 months" - the year is the unit a reader compares on,
     and the remainder is what stops it rounding into a lie. */
  function dur(m) {
    if (m < 12) return m + ' mo';
    var y = Math.floor(m / 12), r = m % 12;
    return y + ' yr' + (r ? ' ' + r + ' mo' : '');
  }

  /* ==========================================================================
     THE ROLES
     --------------------------------------------------------------------------
     Invented, but built to be plausible: continuous employment with no gaps,
     one deliberate two-year contract running alongside two different day jobs,
     and an altitude ladder that steps up three times and sideways once.

     `alt` is a rung on the ladder below, not a score. `ships` are dated so the
     LEDGER concept can replay them in order; the months chosen are inside each
     role's own span and spaced far enough apart to read as a working year.
     ======================================================================== */
  var LADDER = [
    { n: 1, label: 'Ships features', what: 'A screen, a component, a page.' },
    { n: 2, label: 'Owns a service', what: 'A service and the data underneath it.' },
    { n: 3, label: 'Owns a system', what: 'A system end to end, and the pager that comes with it.' },
    { n: 4, label: 'Owns the platform', what: 'The architecture, and the people building on it.' }
  ];

  var ROLES = [
    {
      id: 'sandbar',
      company: 'Sandbar Digital',
      title: 'Frontend Engineer',
      place: 'Dhaka, Bangladesh',
      a: 1, b: 20, alt: 1, lane: 0, primary: true, current: false,
      kind: 'Full time',
      scope: 'Pages and components',
      was: 'A nine-person agency shipping marketing sites and small dashboards. I was the one who made them fast.',
      ships: [
        { m: 6, t: 'Rebuilt the agency Next.js starter so a new client site booted in a day instead of a week.' },
        { m: 11, t: 'Took the biggest client homepage from 4.1s to 1.2s on 3G, with responsive AVIF art and a deferred map.' },
        { m: 16, t: 'Wrote the deploy script that ended the Friday FTP ritual.' }
      ],
      tech: ['nextjs', 'react', 'typescript', 'tailwind', 'gsap', 'vercel']
    },
    {
      id: 'ferrymark',
      company: 'Ferrymark Logistics',
      title: 'Full-stack Engineer',
      place: 'Dhaka, Bangladesh',
      a: 20, b: 39, alt: 2, lane: 1, primary: true, current: false,
      kind: 'Full time',
      scope: 'Services and their data',
      was: 'Container tracking for a mid-size freight forwarder. Six services and one very tired Postgres.',
      ships: [
        { m: 25, t: 'Replaced the nightly CSV import with a Redis-backed queue. Container status went from twelve hours stale to under a minute.' },
        { m: 30, t: 'Added partial indexes and rewrote the two worst tracking queries. Dashboard p95 went from 3.4s to 210ms.' },
        { m: 35, t: 'Moved the whole thing into Docker so a new engineer had it running before lunch.' }
      ],
      tech: ['node', 'express', 'typescript', 'postgres', 'redis', 'rest', 'docker']
    },
    {
      id: 'northsound',
      company: 'Northsound Studio',
      title: 'Contract Engineer',
      place: 'Remote',
      a: 24, b: 48, alt: 1, lane: 2, primary: false, current: false,
      kind: 'Contract, two days a week',
      scope: 'One interaction at a time',
      was: 'Two evenings a week and most Sundays, building the interactive pieces for a motion studio and its clients.',
      ships: [
        { m: 28, t: 'Built the scroll choreography for three campaign sites on one shared ticker instead of nine.' },
        { m: 41, t: 'Shipped a product configurator that held 60fps on a 2018 iPad without touching WebGL.' }
      ],
      tech: ['gsap', 'react', 'typescript', 'tailwind']
    },
    {
      id: 'halden',
      company: 'Halden Health',
      title: 'Senior Engineer',
      place: 'Remote, Berlin',
      a: 39, b: 69, alt: 3, lane: 3, primary: true, current: false,
      kind: 'Full time',
      scope: 'A system and its pager',
      was: 'Scheduling and records for forty outpatient clinics. The part of the system where being wrong costs somebody an appointment.',
      ships: [
        { m: 45, t: 'Took the deploy from a 40-minute manual checklist to a push, with a preview environment per pull request.' },
        { m: 52, t: 'Split scheduling out of the monolith into a NestJS service on a Prisma schema.' },
        { m: 57, t: 'Ran the old and new schedulers side by side for five weeks until the numbers agreed, then deleted the old one.' }
      ],
      tech: ['nestjs', 'node', 'prisma', 'postgres', 'graphql', 'docker', 'actions', 'aws']
    },
    {
      id: 'clerkwell',
      company: 'Clerkwell',
      title: 'Lead Engineer, Platform',
      place: 'Remote, London',
      a: 69, b: 80, alt: 4, lane: 4, primary: true, current: true,
      kind: 'Full time',
      scope: 'Architecture and a team',
      was: 'Retrieval and tool use for a research assistant used by legal teams. I own the layer between the model and the truth.',
      ships: [
        { m: 72, t: 'Built the citation pipeline: Postgres full text plus embeddings, reranked, every answer traceable to a paragraph.' },
        { m: 76, t: 'Put a token budget on every request and an eval harness on every merge, so a prompt change that loses accuracy fails the build.' },
        { m: 78, t: 'Hired and onboarded three engineers into the platform team.' }
      ],
      tech: ['llm', 'rag', 'agents', 'nextjs', 'postgres', 'redis', 'go', 'aws']
    }
  ];

  /* --------------------------------------------------------------- derived */
  var SPAN_A = ROLES[0].a;
  var SPAN_B = ROLES[ROLES.length - 1].b;
  var SPAN = SPAN_B - SPAN_A;                       /* 79 months of calendar */

  var ROLE_MONTHS = 0;
  ROLES.forEach(function (r, i) {
    r.i = i;
    r.months = r.b - r.a;
    r.f0 = (r.a - SPAN_A) / SPAN;
    r.f1 = (r.b - SPAN_A) / SPAN;
    r.range = mLabel(r.a) + ' - ' + (r.current ? 'Present' : mLabel(r.b - 1));
    r.rangeShort = mShort(r.a) + ' - ' + (r.current ? 'now' : mShort(r.b - 1));
    r.durLabel = dur(r.months);
    r.rung = LADDER[r.alt - 1];
    r.techs = r.tech.map(function (id) { return D.byId ? D.byId[id] : null; })
                    .filter(function (s) { return !!s; });
    r.techLine = r.techs.map(function (s) { return s.name; }).join(', ');
    ROLE_MONTHS += r.months;
  });

  /* Every pair of roles that share at least one month. Two windows here, and
     they are the whole reason this area exists. */
  var OVERLAPS = [];
  for (var oi = 0; oi < ROLES.length; oi++) {
    for (var oj = oi + 1; oj < ROLES.length; oj++) {
      var lo = Math.max(ROLES[oi].a, ROLES[oj].a);
      var hi = Math.min(ROLES[oi].b, ROLES[oj].b);
      if (hi > lo) {
        OVERLAPS.push({
          a: lo, b: hi, months: hi - lo,
          f0: (lo - SPAN_A) / SPAN, f1: (hi - SPAN_A) / SPAN,
          pair: [ROLES[oi], ROLES[oj]],
          label: ROLES[oi].company + ' + ' + ROLES[oj].company,
          range: mLabel(lo) + ' - ' + mLabel(hi - 1)
        });
      }
    }
  }
  var DOUBLED = OVERLAPS.reduce(function (n, o) { return n + o.months; }, 0);

  /* Greedy interval packing, used only by the vertical (mobile) layouts, where
     five lanes would leave each bar four pixels wide. Roles that never share a
     month share a track, so five roles fold into three columns. Deterministic:
     the input is already sorted by start month. */
  var TRACKS = (function packTracks() {
    var ends = [];
    ROLES.forEach(function (r) {
      var t = 0;
      while (t < ends.length && ends[t] > r.a) t++;
      ends[t] = r.b;
      r.track = t;
    });
    return ends.length;
  })();

  /* Technologies in first-use order, with the month they entered production.
     This is the accumulation argument as data: the list only ever grows. */
  var TECHS = [];
  (function buildTechs() {
    var seen = {};
    ROLES.forEach(function (r) {
      r.techs.forEach(function (s) {
        if (seen[s.id]) { seen[s.id].roles.push(r); return; }
        seen[s.id] = { skill: s, m: r.a, roles: [r] };
        TECHS.push(seen[s.id]);
      });
    });
    TECHS.forEach(function (t) { t.months = SPAN_B - t.m; });
  })();

  /* One flat event stream, sorted. LEDGER replays it; nothing else has to know
     it exists. `w` is the sort weight inside a month so a JOIN never lands
     after the ADOPT it caused. */
  var EVENTS = [];
  (function buildEvents() {
    ROLES.forEach(function (r) {
      EVENTS.push({ m: r.a, w: 0, lvl: 'JOIN', role: r, text: r.title + ' at ' + r.company + '. ' + r.kind + '.' });
      EVENTS.push({ m: r.a, w: 1, lvl: 'SCOPE', role: r, text: 'Scope: ' + r.rung.label.toLowerCase() + '. ' + r.scope + '.' });
      r.techs.forEach(function (s, k) {
        var t = null;
        for (var i = 0; i < TECHS.length; i++) if (TECHS[i].skill === s) t = TECHS[i];
        if (t && t.m === r.a && t.roles[0] === r) {
          EVENTS.push({ m: r.a, w: 2 + k * 0.01, lvl: 'ADOPT', role: r, text: s.name + ' into production. ' + s.role + '.' });
        }
      });
      r.ships.forEach(function (s) {
        EVENTS.push({ m: s.m, w: 3, lvl: 'SHIP', role: r, text: s.t });
      });
      if (!r.current) {
        EVENTS.push({ m: r.b - 1, w: 9, lvl: 'LEAVE', role: r, text: 'Left ' + r.company + ' after ' + r.durLabel + '.' });
      }
    });
    EVENTS.sort(function (x, y) { return (x.m - y.m) || (x.w - y.w); });
    EVENTS.forEach(function (e, i) { e.i = i; e.f = (e.m - SPAN_A) / SPAN; });
  })();

  var LEVELS = { JOIN: 0.92, SCOPE: 0.62, ADOPT: 0.46, SHIP: 1, LEAVE: 0.34 };

  var SUMMARY = {
    calendar: SPAN,
    role: ROLE_MONTHS,
    doubled: DOUBLED,
    roles: ROLES.length,
    techs: TECHS.length,
    years: Math.round(SPAN / 12 * 10) / 10
  };

  /* ==========================================================================
     SHARED HELPERS  -  scoped to this area, never exported.
     ======================================================================== */

  /* One place that owns a concept's hue, so no concept has to remember to
     derive its own alphas or to retint the stage chrome. */
  function tint(root, hex) {
    root.style.setProperty('--c-accent', hex);
    root.style.setProperty('--c-line', SE.rgba(hex, 0.42));
    root.style.setProperty('--c-mid', SE.rgba(hex, 0.24));
    root.style.setProperty('--c-soft', SE.rgba(hex, 0.13));
    root.style.setProperty('--c-wash', SE.rgba(hex, 0.055));
    if (SE.stageAccent) SE.stageAccent(hex);
  }

  /* SE.srList is the mandated accessible mirror for a canvas, but its intro
     sentence is written for the Skills area ("N technologies"). Pass it
     role-shaped items and rewrite that one sentence rather than forking the
     helper: the buttons, the focus wiring and the container semantics are
     exactly what is wanted here. */
  function srRoles(label, onSelect) {
    var items = ROLES.map(function (r) {
      return { name: r.company, categoryLabel: r.range, role: r.title, note: r.was, _r: r };
    });
    var wrap = SE.srList(label, items, function (it, how) { onSelect(it._r, how); });
    var p = SE.$('p', wrap);
    if (p) {
      p.textContent = label + '. ' + ROLES.length + ' roles between ' + mLabel(SPAN_A) +
        ' and now, two of them concurrent. Each one is focusable and selectable.';
    }
    return wrap;
  }

  function shipsHtml(r, cls) {
    return r.ships.map(function (s, k) {
      return '<li class="' + cls + '" style="--k:' + k + '">' +
             '<i class="t-num" aria-hidden="true">' + mShort(s.m) + '</i>' +
             '<span>' + s.t + '</span></li>';
    }).join('');
  }

  function techHtml(r, cls) {
    return r.techs.map(function (s, k) {
      return '<span class="' + cls + '" style="--k:' + k + '">' + s.name + '</span>';
    }).join('');
  }

  /* Which roles were live in a given month. The single most useful question a
     career chart can answer, and the one a list of jobs cannot. */
  function liveAt(m) {
    return ROLES.filter(function (r) { return m >= r.a && m < r.b; });
  }

  /* Year boundaries inside the span, as fractions. Used by four concepts. */
  var YEARS = (function () {
    var out = [];
    for (var y = yearOf(SPAN_A); y <= yearOf(SPAN_B - 1); y++) {
      var m = (y - EPOCH_Y) * 12;
      out.push({ y: y, m: m, f: M.clamp((m - SPAN_A) / SPAN, 0, 1) });
    }
    return out;
  })();

  /* A step path through the primary track: plateau, ramp, plateau. Returned as
     normalised points so ALTITUDE can draw it at any size or orientation.

     The primary roles are contiguous - one ends the month the next begins - so
     without RAMP every transition would be a zero-width vertical jump. Ten
     weeks is roughly how long a step up actually takes to land, and giving the
     ramp that width is what lets it be drawn as a climb instead of a cliff. */
  var RAMP = 2.4 / SPAN;
  function altitudePath() {
    var pts = [];
    var prim = ROLES.filter(function (r) { return r.primary; });
    prim.forEach(function (r, i) {
      var y = (r.alt - 0.5) / LADDER.length;
      var s = i === 0 ? r.f0 : r.f0 + RAMP / 2;
      var e = i === prim.length - 1 ? r.f1 : r.f1 - RAMP / 2;
      pts.push({ f: s, y: y, role: r, edge: i === 0 ? 'start' : 'ramp' });
      pts.push({ f: e, y: y, role: r, edge: 'hold' });
    });
    return pts;
  }
  /* Solved once at module scope. A preview runs on the shared ticker and must
     never allocate an array of points sixty times a second. */
  var APATH = altitudePath();

  /* ==========================================================================
     PREVIEW HELPERS
     --------------------------------------------------------------------------
     Card miniatures run on the shared ticker with a strict budget of roughly
     forty draw operations a frame. These two account for most of it.
     ======================================================================== */
  function pxLine(ctx, x1, y1, x2, y2, stroke) {
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function bar(ctx, x, y, w, h, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }

  /* ==========================================================================
     PAGE 01  -  OVERLAP
     --------------------------------------------------------------------------
     Five roles as bars against a real month grid. Duration is length, overlap
     is two bars sharing a column of the axis, and a scrubbable marker answers
     the question a resume physically cannot: what were you carrying in March
     2023?

     WHY THERE IS NO CANVAS HERE
     ---------------------------
     A Gantt of five bars, seven year rules and two concurrency bands is about
     twenty elements. In canvas that would cost DPR handling, a resize
     observer, hand-rolled hit testing, a hidden accessibility mirror, and text
     that cannot use tabular figures. In DOM every bar is already a <button>
     with a focus ring, the dates are real text, and the only thing that moves
     per frame is one transform on the marker. Canvas is for the concepts below
     that draw a curve.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'experience-page-overlap',
    num: 1,
    name: 'Overlap',
    kind: 'DOM / month grid',
    accent: '#3FA9E0',
    tagline: 'Duration and concurrency, on one axis',
    desc: 'Five roles drawn as bars on a shared month grid, so length reads as length and two jobs at once reads as two bars. ' +
          'A marker you scrub names every role that was live on any date in the span.',
    interaction: 'Move across the grid to scrub the marker, or use Left and Right to step a month at a time. Click a bar to open the role.',
    hint: 'Scrub the marker &middot; Click a bar',

    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.06, padY = h * 0.14;
      var iw = w - padX * 2, ih = h - padY * 2;
      var lh = ih / ROLES.length;

      ctx.lineWidth = 1;
      for (var y = 0; y < YEARS.length; y += 2) {
        var gx = Math.round(padX + YEARS[y].f * iw) + 0.5;
        pxLine(ctx, gx, padY, gx, h - padY, 'rgba(236,236,239,0.07)');
      }

      var head = (t * 0.17) % 1.25;
      var mf = M.clamp(head, 0, 1);

      OVERLAPS.forEach(function (o) {
        bar(ctx, padX + o.f0 * iw, padY, (o.f1 - o.f0) * iw, ih, 'rgba(63,169,224,' + (0.07 + heat * 0.05).toFixed(3) + ')');
      });

      ROLES.forEach(function (r, i) {
        var live = mf >= r.f0 && mf < r.f1;
        bar(ctx, padX + r.f0 * iw, padY + i * lh + lh * 0.22, (r.f1 - r.f0) * iw, lh * 0.5,
          live ? 'rgba(63,169,224,0.95)' : 'rgba(63,169,224,' + (0.3 + heat * 0.16).toFixed(3) + ')');
      });

      var mx = Math.round(padX + mf * iw) + 0.5;
      pxLine(ctx, mx, padY - h * 0.06, mx, h - padY + h * 0.06, 'rgba(255,255,255,0.7)');
      ctx.fillStyle = '#fff';
      ctx.fillRect(mx - 2, padY - h * 0.06, 4, 3);
    },

    mount: function (root, ctx) {
      var env = SE.env;
      root.classList.add('experience', 'experience-overlap');
      tint(root, '#3FA9E0');

      /* ------------------------------------------------------------- DOM */
      var wrap = SE.el('div', 'experience-overlap__wrap');
      wrap.innerHTML =
        '<header class="experience-overlap__head">' +
          '<h2 class="experience-overlap__title">Two of these ran at the same time</h2>' +
          '<p class="experience-overlap__lede">' + SUMMARY.roles + ' roles across ' + SUMMARY.calendar +
            ' months of calendar and ' + SUMMARY.role + ' months of role. ' + SUMMARY.doubled +
            ' of those months were doubled.</p>' +
        '</header>';

      var chart = SE.el('div', 'experience-overlap__chart');
      chart.style.setProperty('--rows', ROLES.length);
      chart.style.setProperty('--tracks', TRACKS);

      /* Year rules and the two concurrency bands are static geometry. They are
         written once and never touched again. */
      var grid = SE.el('div', 'experience-overlap__grid');
      grid.setAttribute('aria-hidden', 'true');
      grid.innerHTML =
        OVERLAPS.map(function (o) {
          return '<b class="experience-overlap__band" style="--f0:' + o.f0.toFixed(5) +
                 ';--f1:' + o.f1.toFixed(5) + '"></b>';
        }).join('') +
        YEARS.map(function (y) {
          return '<i class="experience-overlap__year" style="--f:' + y.f.toFixed(5) +
                 '"><em class="t-num">' + y.y + '</em></i>';
        }).join('');
      chart.appendChild(grid);

      var lanes = SE.el('div', 'experience-overlap__lanes');
      var rows = ROLES.map(function (r) {
        var b = SE.el('button', 'experience-overlap__lane');
        b.type = 'button';
        b.style.setProperty('--lane', r.lane);
        b.style.setProperty('--tk', r.track);
        b.style.setProperty('--f0', r.f0.toFixed(5));
        b.style.setProperty('--f1', r.f1.toFixed(5));
        b.setAttribute('data-role', r.id);
        b.setAttribute('aria-label', r.company + ', ' + r.title + ', ' + r.range + ', ' + r.durLabel);
        b.innerHTML =
          '<span class="experience-overlap__label">' +
            '<b class="experience-overlap__co">' + r.company + '</b>' +
            '<span class="experience-overlap__ti">' + r.title + '</span>' +
            '<span class="experience-overlap__dt t-num">' + r.range + '</span>' +
            '<span class="experience-overlap__du t-num">' + r.durLabel + '</span>' +
          '</span>' +
          '<span class="experience-overlap__track" aria-hidden="true">' +
            '<i class="experience-overlap__fill"></i>' +
          '</span>';
        lanes.appendChild(b);
        return { el: b, r: r, fill: SE.$('.experience-overlap__fill', b) };
      });
      chart.appendChild(lanes);

      var marker = SE.el('div', 'experience-overlap__marker');
      marker.setAttribute('aria-hidden', 'true');
      chart.appendChild(marker);
      wrap.appendChild(chart);

      var read = SE.el('p', 'experience-overlap__read');
      read.setAttribute('role', 'status');
      read.setAttribute('aria-live', 'polite');
      wrap.appendChild(read);

      var detail = SE.el('aside', 'experience-overlap__detail');
      wrap.appendChild(detail);

      root.appendChild(wrap);
      root.appendChild(SE.hintStrip(
        '<span>Move to scrub</span><span>Left / Right steps a month</span><span>Click opens a role</span>'
      ));

      /* ----------------------------------------------------------- state */
      var f = 1, target = 1, lastMonth = -1, selected = null;
      var vertical = false;
      var boxW = 0, boxH = 0;

      function measure() {
        var rect = chart.getBoundingClientRect();
        boxW = rect.width;
        boxH = rect.height;
        /* The orientation flip reads the CHART width, not the window and not
           `SE.env.mobile`: env.mobile is only refreshed on a media-query
           change, and this concept can be narrower than the window anyway. */
        vertical = boxW < 768;
        root.classList.toggle('is-vertical', vertical);
      }

      function place() {
        /* Direct transform write on the marker itself. Setting a custom
           property on `chart` instead would recalculate styles for every bar
           in the subtree, sixty times a second, for no reason. */
        if (vertical) marker.style.transform = 'translate3d(0,' + (f * boxH).toFixed(2) + 'px,0)';
        else marker.style.transform = 'translate3d(' + (f * boxW).toFixed(2) + 'px,0,0)';
      }

      function narrate() {
        var m = M.clamp(SPAN_A + Math.round(f * SPAN), SPAN_A, SPAN_B - 1);
        if (m === lastMonth) return;
        lastMonth = m;
        var live = liveAt(m);
        read.innerHTML =
          '<b class="t-num">' + mLabel(m) + '</b>' +
          '<span>' + (live.length ? live.map(function (r) { return r.company; }).join(' + ') : 'Between roles') + '</span>' +
          '<em class="t-num">' + live.length + ' live</em>';
        rows.forEach(function (row) {
          row.el.classList.toggle('is-live', live.indexOf(row.r) !== -1);
        });
      }

      /* ----------------------------------------------------- interaction */
      function onMove(e) {
        var rect = chart.getBoundingClientRect();
        target = vertical
          ? M.clamp((e.clientY - rect.top) / Math.max(1, rect.height), 0, 1)
          : M.clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      }
      chart.addEventListener('pointermove', onMove, { passive: true });
      chart.addEventListener('pointerleave', function () { target = 1; });

      function select(r) {
        selected = r;
        rows.forEach(function (row) { row.el.setAttribute('aria-pressed', String(row.r === r)); });
        if (!r) { detail.classList.remove('is-on'); detail.innerHTML = ''; return; }
        detail.innerHTML =
          '<div class="experience-overlap__dtop">' +
            '<b>' + r.company + '</b>' +
            '<span class="t-num">' + r.range + '</span>' +
          '</div>' +
          '<p class="experience-overlap__dwas">' + r.was + '</p>' +
          '<ul class="experience-overlap__dships">' + shipsHtml(r, 'experience-overlap__ship') + '</ul>' +
          '<p class="experience-overlap__dtech">' + techHtml(r, 'experience-overlap__chip') + '</p>' +
          '<p class="experience-overlap__dmeta t-num">' + r.place + '<em>' + r.rung.label + '</em></p>';
        detail.classList.add('is-on');
        /* Park the marker in the middle of the role you just opened, so the
           readout agrees with the panel instead of contradicting it. */
        target = (r.f0 + r.f1) / 2;
      }

      lanes.addEventListener('click', function (e) {
        var b = e.target.closest('[data-role]');
        if (!b) return;
        var r = ROLES.filter(function (x) { return x.id === b.getAttribute('data-role'); })[0];
        select(selected === r ? null : r);
      });

      function onKey(e) {
        var step = e.shiftKey ? 12 : 1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          var d = (e.key === 'ArrowRight' ? 1 : -1) * step / SPAN;
          target = M.clamp(target + d, 0, 1);
          e.preventDefault();
        } else if (e.key === 'Home') { target = 0; e.preventDefault(); }
        else if (e.key === 'End') { target = 1; e.preventDefault(); }
        else if (e.key === 'Escape' && selected) { select(null); e.preventDefault(); }
      }
      root.addEventListener('keydown', onKey);

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        /* lambda 16 is about 60ms to 63%: fast enough that the marker reads as
           attached to the pointer, slow enough that it does not judder on a
           coarse trackpad sample. A settled marker costs one comparison. */
        var next = env.reduced ? target : M.damp(f, target, 16, dt);
        if (Math.abs(next - f) < 0.00008) return;
        f = next;
        place();
        narrate();
      }
      SE.ticker.add(tick);

      var ro = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(function () { measure(); place(); });
        ro.observe(chart);
      }
      measure();
      place();
      narrate();

      /* Entry: the bars grow from their start date. transform-origin is the
         left edge (top edge when vertical) so the growth reads as elapsed
         time, not as a box inflating. The label fades separately so the type
         is never scaled. */
      var enterT = null;
      if (!env.reduced) {
        enterT = setTimeout(function () { root.classList.add('is-in'); }, 40);
      } else {
        root.classList.add('is-in', 'is-instant');
      }

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          clearTimeout(enterT);
          root.removeEventListener('keydown', onKey);
          chart.removeEventListener('pointermove', onMove);
          if (ro) ro.disconnect();
          root.classList.remove('experience', 'experience-overlap', 'is-in', 'is-instant', 'is-vertical');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A career as overlapping bars on a real month grid',
      philosophy: [
        'A list of jobs cannot express concurrency, and concurrency is the single most informative fact in this history: two roles ran together for 24 of 79 months. Put every role on one shared axis and that fact becomes visible before a word is read.',
        'Length is duration. Nothing else in the composition is allowed to encode duration, so the eye can trust the one signal it has.',
        'The marker exists to answer one question a resume cannot: on a given date, what were you carrying? That question is why this is a chart and not a list.'
      ],
      hierarchy: [
        '1. The five bars. They are the content; everything else annotates them.',
        '2. The two concurrency bands, drawn as a 5% accent wash behind the bars across the months where more than one role was live.',
        '3. The scrub marker, a 1px full-height rule with a 4x3px cap, at 70% white. It is the only pure white in the composition.',
        '4. The role labels in the left gutter: company at 500, title in mono, dates and duration in tabular mono at 40% ink.',
        '5. Year rules at 7% ink with their numeral at 10px. Present as reference, never as structure.'
      ],
      structure: [
        'Section `id="experience"`, `min-h-[100dvh]`, CSS grid `auto 1fr auto` for heading, chart, readout.',
        'Chart is `position: relative` with two absolutely positioned layers: a static grid layer (year rules + concurrency bands) and a lane layer.',
        'Each lane is a `<button>` containing a label span and a track span; the fill inside the track is the bar. The whole row is the hit target, so a 14% wide bar is still easy to click.',
        'The marker is a sibling of both layers, moved only by transform.',
        'A detail panel sits below the chart on desktop and becomes a bottom sheet under 768px.'
      ],
      interaction: [
        'SCRUB: `pointermove` on the chart sets a target fraction 0..1 from `(clientX - rect.left) / rect.width`. The rendered fraction damps toward it with lambda 16 (about 60ms to 63%), so the marker has weight without lag.',
        'LEAVE: target returns to 1.0, which is today. The chart has a resting state and it is the present.',
        'KEYBOARD: ArrowLeft / ArrowRight step 1 month (`1 / 79`), Shift steps 12. Home jumps to the first month, End to today, Escape closes the detail panel.',
        'SELECT: clicking a lane opens the role and moves the marker target to the midpoint of that role, so the readout and the panel always agree.',
        'READOUT: recomputed only when the rounded month index changes, not every frame. It names every live role joined with a plus, and prints the count.'
      ],
      choreography: [
        { n: 'Bar entry', d: 'Each fill runs `transform: scaleX(0) -> scaleX(1)`, `transform-origin: left center`, 620ms `cubic-bezier(0.23, 1, 0.32, 1)`, `transition-delay: calc(var(--lane) * 70ms)`. The label is a separate element fading `opacity 0 -> 1` plus `translateX(-10px) -> 0` over 420ms at `delay + 120ms`, because scaling a bar with type inside it squashes the type.' },
        { n: 'Marker', d: 'Exponential damp lambda 16 on a single 0..1 value, written as `translate3d(Xpx,0,0)` directly on the marker element. Never as a custom property on the parent: that would restyle every bar in the subtree each frame.' },
        { n: 'Live state', d: 'Bars whose span contains the marker month get `is-live`: border-color to 100% accent and fill opacity 0.34 -> 0.92 over 180ms `ease`. This is feedback, so it stays under 200ms.' },
        { n: 'Detail panel', d: 'opacity 0 -> 1 with `translateY(14px) -> 0` over 240ms `cubic-bezier(0.23, 1, 0.32, 1)`. Below 768px it becomes a sheet: `translateY(100%) -> 0` over 320ms `cubic-bezier(0.32, 0.72, 0, 1)`.' },
        { n: 'What does NOT animate', d: 'The grid, the year rules and the concurrency bands are written once at mount. A chart whose reference marks move is a chart you cannot read.' }
      ],
      scroll: [
        'No scroll hijacking at all. This is a stationary chart and pinning it would be a tax on the reader for zero information gain.',
        'One IntersectionObserver on the section: unsubscribe the marker damp from the shared ticker when the section leaves the viewport.',
        'Run the bar entry once on first intersection at threshold 0.25. Do not re-run it on re-entry.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'Lane hover: label ink steps from `--ink-2` to `--ink`, and the fill gains a 1px accent top highlight. Nothing translates, because the bar position IS the data.',
        'The marker follows the pointer everywhere inside the chart, including over the gutter labels, so there is no dead zone.'
      ],
      click: [
        'Click a lane to open its role; click the same lane again or press Escape to close.',
        'The panel carries: what the job actually was in one sentence, the two or three dated things shipped, the technology list, the location, and the responsibility rung.',
        'Shipped items are prefixed with the month they shipped in tabular mono, so the panel is itself a small timeline.'
      ],
      responsive: {
        desktop: 'Horizontal axis. 5 lanes at 76px each, gutter `minmax(11rem, 15rem)`, year numerals above the plot, detail panel below the chart as a 3-column grid.',
        tablet: 'Same horizontal axis, gutter drops to 10rem, duration column is dropped from the label, lane height falls to 64px.',
        mobile: 'The axis rotates. Time runs top to bottom down the left edge with year numerals on a rail; the five roles are packed by a greedy interval fit into 3 vertical tracks (roles that never share a month share a track), each a 4px column; labels are anchored to the top of their own bar in the remaining width. Scrub reads `clientY` instead of `clientX`. This is a different drawing of the same model, not a squeezed one.'
      },
      a11y: [
        'Every bar is a real `<button>` with `aria-pressed` and an `aria-label` reading "Ferrymark Logistics, Full-stack Engineer, Sep 2021 - Mar 2023, 1 yr 7 mo". No hidden mirror list is needed because the chart is already DOM.',
        'The readout is `role="status" aria-live="polite"`, so scrubbing is narrated without stealing focus.',
        'All dates and durations use `font-variant-numeric: tabular-nums`, so the gutter column does not shift a pixel as the marker moves.',
        'Keyboard parity with the pointer is complete: arrows scrub, Home and End jump, Enter opens. This satisfies WCAG 2.2 "dragging movements" without a separate affordance.',
        'Under `prefers-reduced-motion: reduce`: bars are already at full length on mount, the marker jumps rather than damping, and the detail panel cross-fades with no translate. Every number stays readable.'
      ],
      perf: [
        'Per frame: exactly one `transform` write. Text is rewritten only when the rounded month index changes, which is at most a few times a second.',
        'Twenty DOM nodes total for the chart. No canvas, no DPR handling, no hit testing.',
        'Bar geometry is set once as `left: calc(var(--f0) * 100%)` and `width: calc((var(--f1) - var(--f0)) * 100%)`. Percentages, so a resize costs zero JavaScript.',
        'One ResizeObserver on the chart drives the orientation flip and re-measures the marker. No `window.addEventListener("resize")`.'
      ],
      packages: [
        { p: 'none required', w: 'The whole chart is CSS percentages plus one damped scalar. A charting library here would ship 90kb to draw five rectangles and would fight you over the tabular figures.' },
        { p: 'gsap (installed)', w: 'Optional, only if you prefer a timeline for the entry stagger. The CSS cascade already does it with `transition-delay`, and interrupts correctly for free.' },
        { p: 'no d3', w: 'There is one linear scale in this concept and it is `(m - start) / span`.' }
      ],
      architecture: [
        { f: 'components/sections/Experience.tsx', r: 'Server Component. Renders the full chart markup including every bar and label, so the history is crawlable and present before hydration.' },
        { f: 'components/experience/OverlapMarker.tsx', r: '"use client" leaf. Owns the damped scrub value, the pointer and key handlers, and the readout. Renders only the marker and the status line.' },
        { f: 'lib/experience/timeline.ts', r: 'Pure: `monthIndex()`, `label()`, `dur()`, `overlaps()`, `packTracks()`. No DOM, unit-testable, shared by every experience concept.' },
        { f: 'lib/experience/roles.ts', r: 'The role data plus derived fractions, computed once at module scope.' }
      ],
      state: [
        '`selectedRoleId: string | null` is the only value in `useState`. It changes on intent.',
        'The scrub fraction, the damping target and the last narrated month must all be refs. A 0..1 value in state is sixty React renders a second and will collapse a mid-range phone.',
        'The live-role set is derived from the month index inside the loop, never stored.'
      ],
      typography: [
        'Company: display face 500 at `clamp(0.9375rem, 1.1vw, 1.0625rem)`, `-0.02em`.',
        'Title: mono 400 at 10px, `0.1em` tracking, `--ink-3`.',
        'Dates and durations: mono with `font-variant-numeric: tabular-nums` at 10px. This is non-negotiable in a gutter of five stacked date ranges.',
        'Section heading: display 500 at `clamp(1.75rem, 3.4vw, 2.75rem)`, `line-height: 0.98`, `-0.035em`, balanced.'
      ],
      color: [
        'One hue for the whole concept, at four alphas: 100% for a live bar, 34% for a resting bar, 13% for the fill wash, 5.5% for the concurrency band.',
        'Ground is `--void`, never pure black. Year rules are neutral ink at 7%, never the accent, because reference marks must not compete with data marks.',
        'In light mode: raise every accent alpha by roughly 1.4x and drop the concurrency band to 4%; thin washes disappear on white.'
      ],
      spacing: [
        'Lane height 76px desktop, 64px tablet. The bar is 18px of that; the rest is the label and the air that separates the rows.',
        'Gutter `minmax(11rem, 15rem)`, plot `1fr`. Fixed gutter, because a proportional one makes the axis change scale as the label text changes.',
        'Chart inset `clamp(1.25rem, 4vw, 4.5rem)` matching the page gutter token.'
      ],
      relationships: [
        'Horizontal position encodes date. Bar length encodes duration. Those are the only two spatial encodings, and nothing is allowed to duplicate them.',
        'Vertical position encodes nothing but reading order, and that is deliberate: if lane order also encoded seniority the chart would be making two claims with one axis.',
        'The concurrency band encodes the intersection of two spans. It is derived, never authored, so it cannot drift out of sync with the bars.',
        'The live count in the readout is the chart summarising itself in one integer.'
      ],
      acceptance: [
        'Moving across the chart scrubs a marker with no visible stepping, and the readout names exactly the roles whose bars the marker crosses.',
        'The two concurrency bands sit exactly under the months where two bars overlap, at any window width.',
        'Tab reaches all five roles; arrow keys scrub the marker; Escape closes the panel.',
        'At 390px the chart is a vertical time axis with three packed tracks, not a horizontal one squeezed.',
        'With reduced motion on, the bars are at full length immediately and the marker jumps, and every date is still readable.'
      ]
    }
  });

  /* ==========================================================================
     PAGE 02  -  ALTITUDE
     --------------------------------------------------------------------------
     Responsibility plotted over time. Each role is a plateau at its rung, each
     move is a climb, and the two-year contract runs as a SECOND, lower line
     across the same months as the day job.

     THE ARGUMENT
     ------------
     That second line is the whole point. A career chart that only ever rises
     is a chart nobody believes. Someone senior taking narrow contract work on
     the side, deliberately below their own altitude, is a true and specific
     thing about how a person works - and the moment you draw it, the ladder
     stops being a brag and starts being a description.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'experience-page-altitude',
    num: 2,
    name: 'Altitude',
    kind: 'Canvas / plotted line',
    accent: '#3FD1A0',
    tagline: 'Responsibility, plotted against time',
    desc: 'A step line across four rungs of responsibility, where every role is a plateau and every move is a climb. ' +
          'The contract years run as a second line below the main one, because altitude is not monotonic and pretending it is would be a lie.',
    interaction: 'Move across the plot to scrub a reader line that names the rung and the roles at that date. Click or focus a plateau to open the role.',
    hint: 'Scrub the plot &middot; Click a plateau',

    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.07, padY = h * 0.16;
      var iw = w - padX * 2, ih = h - padY * 2;
      var pts = APATH;
      var draw = M.clamp((t * 0.34) % 1.7, 0, 1);

      ctx.lineWidth = 1;
      for (var i = 0; i < LADDER.length; i++) {
        var gy = Math.round(padY + ih - ((i + 0.5) / LADDER.length) * ih) + 0.5;
        pxLine(ctx, padX, gy, w - padX, gy, 'rgba(236,236,239,0.06)');
      }

      function X(f) { return padX + Math.min(f, draw) * iw; }
      function Y(y) { return padY + ih - y * ih; }

      ctx.beginPath();
      ctx.moveTo(X(pts[0].f), Y(pts[0].y));
      for (var k = 1; k < pts.length; k++) {
        if (pts[k].edge === 'ramp') ctx.lineTo(X(pts[k].f), Y(pts[k - 1].y));
        ctx.lineTo(X(pts[k].f), Y(pts[k].y));
        if (pts[k].f > draw) break;
      }
      ctx.strokeStyle = 'rgba(63,209,160,' + (0.8 + heat * 0.2).toFixed(2) + ')';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.lineTo(X(Math.min(pts[pts.length - 1].f, draw)), Y(0));
      ctx.lineTo(X(pts[0].f), Y(0));
      ctx.closePath();
      ctx.fillStyle = 'rgba(63,209,160,' + (0.07 + heat * 0.05).toFixed(3) + ')';
      ctx.fill();

      var c = ROLES[2];
      if (draw > c.f0) {
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.2;
        pxLine(ctx, X(c.f0), Y(0.16), X(Math.min(c.f1, draw)), Y(0.16), 'rgba(63,209,160,0.5)');
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.arc(X(Math.min(1, draw)), Y(pts[pts.length - 1].y), 2.6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    },

    mount: function (root, ctx) {
      var env = SE.env;
      root.classList.add('experience', 'experience-altitude');
      tint(root, '#3FD1A0');

      var wrap = SE.el('div', 'experience-altitude__wrap');
      wrap.innerHTML =
        '<header class="experience-altitude__head">' +
          '<h2 class="experience-altitude__title">The line that goes down on purpose</h2>' +
          '<p class="experience-altitude__lede">Four rungs of responsibility over ' + SUMMARY.calendar +
            ' months. The dashed run is two years of contract work taken deliberately below the day job it overlapped.</p>' +
        '</header>';

      var plot = SE.el('div', 'experience-altitude__plot');
      var canvasEl = SE.el('canvas', 'experience-altitude__canvas');
      plot.appendChild(canvasEl);
      wrap.appendChild(plot);

      var read = SE.el('div', 'experience-altitude__read');
      read.setAttribute('role', 'status');
      read.setAttribute('aria-live', 'polite');
      wrap.appendChild(read);

      var detail = SE.el('aside', 'experience-altitude__detail');
      wrap.appendChild(detail);

      root.appendChild(wrap);
      root.appendChild(srRoles('Altitude: responsibility plotted against time', function (r, how) {
        select(r);
        if (how === 'focus') target = (r.f0 + r.f1) / 2;
      }));
      root.appendChild(SE.hintStrip(
        '<span>Move to scrub</span><span>Left / Right steps a month</span><span>Tab reaches every role</span>'
      ));

      /* ----------------------------------------------------------- model */
      var cv = SE.canvas(canvasEl);
      var cx = cv.ctx;
      var PATH = APATH;
      var contract = ROLES.filter(function (r) { return !r.primary; });
      var reveal = env.reduced ? 1 : 0;
      var f = 1, target = 1, lastMonth = -1, selected = null, hoverRole = null;

      function vertical() { return cv.w < 768; }

      /* Ramps are smoothstepped rather than straight. A career move is not a
         constant-rate transition; drawing it as one makes the chart read like
         a spreadsheet plot of nothing. */
      function smooth(p) { return p * p * (3 - 2 * p); }

      function select(r) {
        selected = r;
        if (!r) { detail.classList.remove('is-on'); detail.innerHTML = ''; return; }
        detail.innerHTML =
          '<div class="experience-altitude__dtop">' +
            '<b>' + r.company + '</b>' +
            '<span class="t-num">' + r.range + '</span>' +
          '</div>' +
          '<p class="experience-altitude__drung"><i class="t-num">' + SE.pad(r.alt) + '</i>' + r.rung.label +
            '<em>' + r.rung.what + '</em></p>' +
          '<p class="experience-altitude__dwas">' + r.was + '</p>' +
          '<ul class="experience-altitude__dships">' + shipsHtml(r, 'experience-altitude__ship') + '</ul>' +
          '<p class="experience-altitude__dtech">' + techHtml(r, 'experience-altitude__chip') + '</p>';
        detail.classList.add('is-on');
      }

      function narrate() {
        var m = M.clamp(SPAN_A + Math.round(f * SPAN), SPAN_A, SPAN_B - 1);
        if (m === lastMonth) return;
        lastMonth = m;
        var live = liveAt(m);
        var top = live.reduce(function (best, r) { return (!best || r.alt > best.alt) ? r : best; }, null);
        read.innerHTML =
          '<b class="t-num">' + mLabel(m) + '</b>' +
          '<span class="experience-altitude__rrung">' + (top ? top.rung.label : 'Between roles') + '</span>' +
          '<span class="experience-altitude__rrole">' + live.map(function (r) { return r.company; }).join(' + ') + '</span>';
      }

      /* ------------------------------------------------------------ draw */
      function render() {
        cv.clear();
        var w = cv.w, h = cv.h;
        if (w < 6 || h < 6) return;
        var vert = vertical();

        var padA = vert ? h * 0.05 : w * 0.06;            /* along time */
        var padB = vert ? w * 0.10 : h * 0.12;            /* along altitude */
        var lenT = (vert ? h : w) - padA * 2;
        var lenA = (vert ? w : h) - padB * 2 - (vert ? 0 : h * 0.06);

        /* One pair of mappers, so the vertical case is a coordinate swap and
           not a second renderer. */
        function X(tf, av) {
          return vert ? padB + av * lenA : padA + tf * lenT;
        }
        function Y(tf, av) {
          return vert ? padA + tf * lenT : (h - padB) - av * lenA;
        }

        /* ladder rules */
        cx.lineWidth = 1;
        cx.font = '500 9px "JetBrains Mono", monospace';
        cx.textBaseline = 'middle';
        LADDER.forEach(function (L, i) {
          var av = (L.n - 0.5) / LADDER.length;
          var lit = selected ? selected.alt === L.n : false;
          cx.strokeStyle = 'rgba(236,236,239,' + (lit ? 0.16 : 0.055) + ')';
          cx.beginPath();
          if (vert) { cx.moveTo(Math.round(X(0, av)) + 0.5, padA); cx.lineTo(Math.round(X(0, av)) + 0.5, h - padA); }
          else { cx.moveTo(padA, Math.round(Y(0, av)) + 0.5); cx.lineTo(w - padA, Math.round(Y(0, av)) + 0.5); }
          cx.stroke();
          cx.fillStyle = 'rgba(236,236,239,' + (lit ? 0.72 : 0.28) + ')';
          if (vert) {
            cx.textAlign = 'center';
            cx.fillText(String(L.n), X(0, av), padA - 8);
          } else {
            cx.textAlign = 'right';
            cx.fillText(L.label.toUpperCase(), w - padA, Y(0, av) - 9);
          }
        });

        /* year ticks along the time axis */
        cx.fillStyle = 'rgba(236,236,239,0.26)';
        YEARS.forEach(function (y, i) {
          if (vert && i % 2) return;
          cx.strokeStyle = 'rgba(236,236,239,0.05)';
          cx.beginPath();
          if (vert) { cx.moveTo(padB * 0.5, Math.round(Y(y.f, 0)) + 0.5); cx.lineTo(w - padB * 0.2, Math.round(Y(y.f, 0)) + 0.5); }
          else { cx.moveTo(Math.round(X(y.f, 0)) + 0.5, padB * 0.4); cx.lineTo(Math.round(X(y.f, 0)) + 0.5, h - padB * 0.6); }
          cx.stroke();
          cx.textAlign = vert ? 'left' : 'center';
          if (vert) cx.fillText(String(y.y), 4, Y(y.f, 0));
          else cx.fillText(String(y.y), X(y.f, 0), h - padB * 0.3);
        });

        /* the main step line, clipped to the reveal fraction */
        var lim = reveal;
        var clipped = [];
        for (var i = 0; i < PATH.length; i++) {
          var p = PATH[i];
          if (p.edge === 'ramp') {
            /* Sample the ramp so it curves. Eight samples is visually
               indistinguishable from thirty-two at this scale and costs a
               quarter as much. */
            var prev = PATH[i - 1];
            for (var s = 1; s < 8; s++) {
              var k = s / 8;
              var rf = prev.f + (p.f - prev.f) * k;
              if (rf > lim) break;
              clipped.push({ f: rf, y: prev.y + (p.y - prev.y) * smooth(k) });
            }
          }
          if (p.f > lim) break;
          clipped.push({ f: p.f, y: p.y });
        }

        if (clipped.length > 1) {
          /* area under the line: accumulated responsibility, at 7% */
          var last = clipped[clipped.length - 1];
          cx.beginPath();
          cx.moveTo(X(clipped[0].f, clipped[0].y), Y(clipped[0].f, clipped[0].y));
          clipped.forEach(function (q) { cx.lineTo(X(q.f, q.y), Y(q.f, q.y)); });
          cx.lineTo(X(last.f, 0), Y(last.f, 0));
          cx.lineTo(X(clipped[0].f, 0), Y(clipped[0].f, 0));
          cx.closePath();
          cx.fillStyle = 'rgba(63,209,160,0.07)';
          cx.fill();

          cx.beginPath();
          cx.moveTo(X(clipped[0].f, clipped[0].y), Y(clipped[0].f, clipped[0].y));
          clipped.forEach(function (q) { cx.lineTo(X(q.f, q.y), Y(q.f, q.y)); });
          cx.lineWidth = 2;
          cx.lineJoin = 'round';
          cx.lineCap = 'round';
          cx.strokeStyle = 'rgba(63,209,160,0.95)';
          cx.stroke();
        }

        /* the contract line: dashed, thinner, and below */
        contract.forEach(function (r) {
          if (reveal < r.f0) return;
          var av = (r.alt - 0.5) / LADDER.length - 0.08;
          var e = Math.min(r.f1, lim);
          cx.setLineDash([4, 4]);
          cx.lineWidth = 1.4;
          cx.strokeStyle = 'rgba(63,209,160,0.55)';
          cx.beginPath();
          cx.moveTo(X(r.f0, av), Y(r.f0, av));
          cx.lineTo(X(e, av), Y(e, av));
          cx.stroke();
          cx.setLineDash([]);
        });

        /* plateau labels */
        cx.font = '500 10px "JetBrains Mono", monospace';
        ROLES.forEach(function (r) {
          if (reveal < r.f0 + 0.01) return;
          var av = (r.alt - 0.5) / LADDER.length - (r.primary ? 0 : 0.08);
          var on = selected === r || hoverRole === r;
          cx.fillStyle = on ? '#fff' : 'rgba(236,236,239,0.55)';
          cx.textAlign = 'left';
          cx.textBaseline = vert ? 'middle' : 'bottom';
          var lx = X(r.f0, av) + (vert ? 10 : 6);
          var ly = Y(r.f0, av) + (vert ? 10 : -8);
          cx.fillText(r.company, lx, ly);
          cx.beginPath();
          cx.arc(X(r.f0, av), Y(r.f0, av), on ? 4 : 2.4, 0, Math.PI * 2);
          cx.fillStyle = on ? '#fff' : 'rgba(63,209,160,0.9)';
          cx.fill();
        });

        /* reader line */
        if (reveal > 0.98) {
          var rv = liveAt(SPAN_A + Math.round(f * SPAN));
          var rav = rv.length ? (rv[rv.length - 1].alt - 0.5) / LADDER.length : 0.1;
          cx.strokeStyle = 'rgba(236,236,239,0.2)';
          cx.lineWidth = 1;
          cx.beginPath();
          if (vert) { cx.moveTo(padB * 0.6, Math.round(Y(f, 0)) + 0.5); cx.lineTo(w - padB * 0.2, Math.round(Y(f, 0)) + 0.5); }
          else { cx.moveTo(Math.round(X(f, 0)) + 0.5, padB * 0.4); cx.lineTo(Math.round(X(f, 0)) + 0.5, h - padB * 0.6); }
          cx.stroke();
          cx.beginPath();
          cx.arc(X(f, rav), Y(f, rav), 3.4, 0, Math.PI * 2);
          cx.fillStyle = '#fff';
          cx.fill();
        }
      }

      /* ----------------------------------------------------- interaction */
      function fracFromEvent(e) {
        var rect = canvasEl.getBoundingClientRect();
        return vertical()
          ? M.clamp((e.clientY - rect.top) / Math.max(1, rect.height), 0, 1)
          : M.clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      }
      function roleAt(fr) {
        var live = liveAt(SPAN_A + Math.round(fr * SPAN));
        return live.length ? live[live.length - 1] : null;
      }
      function onMove(e) {
        target = fracFromEvent(e);
        var r = roleAt(target);
        if (r !== hoverRole) {
          hoverRole = r;
          SE.cursor && SE.cursor.label(r ? r.company : '');
        }
      }
      canvasEl.addEventListener('pointermove', onMove, { passive: true });
      canvasEl.addEventListener('pointerleave', function () {
        hoverRole = null;
        SE.cursor && SE.cursor.label('');
      });
      canvasEl.addEventListener('click', function (e) {
        var r = roleAt(fracFromEvent(e));
        select(selected === r ? null : r);
      });

      function onKey(e) {
        var step = e.shiftKey ? 12 : 1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          target = M.clamp(target + (e.key === 'ArrowRight' ? 1 : -1) * step / SPAN, 0, 1);
          e.preventDefault();
        } else if (e.key === 'Enter' && hoverRole) { select(hoverRole); e.preventDefault(); }
        else if (e.key === 'Escape' && selected) { select(null); e.preventDefault(); }
      }
      root.addEventListener('keydown', onKey);

      cv.observe(function () { render(); });

      function tick(dt) {
        /* The line draws itself once, over 1.6s. It is an explanation beat,
           not decoration: it shows the reader that the x axis is time before
           they have read a single label. */
        if (reveal < 1) reveal = Math.min(1, reveal + dt / 1.6);
        f = env.reduced ? target : M.damp(f, target, 14, dt);
        narrate();
        render();
      }
      SE.ticker.add(tick);
      narrate();
      render();

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          root.removeEventListener('keydown', onKey);
          canvasEl.removeEventListener('pointermove', onMove);
          cv.destroy();
          SE.cursor && SE.cursor.label('');
          root.classList.remove('experience', 'experience-altitude');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A step plot of responsibility, with an honest dip in it',
      philosophy: [
        'Titles are noise across companies. What actually changed between roles is the size of the thing you were responsible for, so plot that: four named rungs, from "ships features" to "owns the platform".',
        'The second, dashed line is the argument. Two years of contract work ran below the day job it overlapped, on purpose. A chart that only rises is a chart nobody believes.',
        'Ramps are smoothstepped, not straight. A move between roles has acceleration in it; a constant-rate diagonal is the visual language of a spreadsheet with nothing to say.'
      ],
      hierarchy: [
        '1. The step line at 95% accent, 2px, round joins. It is the whole composition.',
        '2. The area under it at 7% accent: accumulated responsibility, present as mass rather than as a number.',
        '3. The dashed contract run at 55% accent, 1.4px, dash [4,4], offset 8% of the plot height below its rung.',
        '4. Plateau labels in mono at the start of each plateau, 55% ink at rest and pure white when attended.',
        '5. Four ladder rules at 5.5% ink with right-aligned uppercase labels; the selected role\'s rung brightens to 16%.'
      ],
      structure: [
        'Full-bleed section `id="experience"`, `min-h-[100dvh]`, one `<canvas>` filling the plot area.',
        'Heading block above the plot, readout strip below it, detail panel to the right on desktop.',
        'The canvas draws: ladder rules, year ticks, the area fill, the step line, the contract line, plateau labels, the reader line.',
        'A visually hidden focusable list mirrors every role into the accessibility tree; focusing an entry both selects the role and moves the reader line to it.'
      ],
      interaction: [
        'SCRUB: `pointermove` sets a target fraction; the drawn fraction damps at lambda 14 (about 70ms to 63%).',
        'The readout names the date, the rung label of the highest live role, and every live company joined with a plus.',
        'CLICK: selects the highest-altitude role live at the cursor date. Clicking it again clears. Escape clears.',
        'KEYBOARD: Left and Right step 1 month, Shift steps 12, Enter selects the role under the reader line.',
        'ENTRY: the line draws left to right over exactly 1.6s, once. It is not a loop and it does not replay on re-entry.'
      ],
      choreography: [
        { n: 'Line draw', d: 'A single `reveal` scalar goes 0 to 1 over 1.6s linear, and every path is clipped to it. Linear because it represents time passing at a constant rate; easing it would imply the years went by at different speeds.' },
        { n: 'Ramp shape', d: 'Each transition between plateaus is sampled at 8 points with `smoothstep(k) = k*k*(3-2k)`. Eight samples is visually indistinguishable from thirty-two at this scale and costs a quarter as much.' },
        { n: 'Reader line', d: 'Exponential damp lambda 14 on one 0..1 value. Deliberately slower than the OVERLAP marker at lambda 16, because here the line is reading a curve rather than pointing at a bar.' },
        { n: 'Plateau attention', d: 'The dot under the pointer grows 2.4px to 4px and its label goes from 55% ink to pure white. No transition needed: the canvas repaints anyway, and a tween on a canvas value is a second animation system.' },
        { n: 'Detail panel', d: 'opacity plus `translateX(14px) -> 0` over 240ms `cubic-bezier(0.23, 1, 0.32, 1)`. Below 768px it slides up as a sheet over 320ms `cubic-bezier(0.32, 0.72, 0, 1)`.' }
      ],
      scroll: [
        'No scroll interaction. The plot is stationary and complete in one screen.',
        'IntersectionObserver at threshold 0.3 starts the 1.6s draw and subscribes the render loop; leaving the viewport unsubscribes it.',
        'The reveal value is remembered, so scrolling away mid-draw and back does not restart the animation from zero.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'The native cursor is hidden over the canvas and replaced by a reticle carrying the hovered company name; there is no text to select on a plot.',
        'Hovering brightens the plateau dot and its label only. The line itself never changes weight, because line weight would then be encoding two different things.'
      ],
      click: [
        'Click selects the highest-altitude role live at that date, which is the one the line is drawn at.',
        'The panel leads with the rung: a two-digit index, the rung name, and one sentence describing what that rung actually means.',
        'Escape and a second click on the same plateau both clear the selection and return the ladder rules to their resting alpha.'
      ],
      responsive: {
        desktop: 'Time on X, altitude on Y. Ladder labels right-aligned above their rules, year numerals along the bottom, 8-sample ramps, detail panel in a right column.',
        tablet: 'Identical plot; ladder labels shorten to their first word and the detail panel moves below the plot.',
        mobile: 'The axes swap. Time runs top to bottom, altitude runs left to right, and the plot becomes a climb you read downward like a route card. Ladder rules become vertical, labelled 1 to 4 across the top; year numerals move to the left edge and print every other year; plateau labels sit to the right of their dot. Same renderer, one coordinate swap, genuinely different drawing.'
      },
      a11y: [
        'The canvas gets `role="img"` and an `aria-label` describing the shape in one sentence, including the dip.',
        'Every role is mirrored into a visually hidden focusable list; `focus` selects the role and moves the reader line, so tabbing walks the chart.',
        'The readout is `aria-live="polite"` and prints the rung in words, so the altitude is never colour-only or position-only information.',
        'Dates in the readout and panel use `font-variant-numeric: tabular-nums`.',
        'Under `prefers-reduced-motion: reduce`: no 1.6s draw (the completed line renders immediately), no damping on the reader line, no cursor reticle. Selection, keyboard and the panel all still work.'
      ],
      perf: [
        'Per frame: about 4 ladder rules, 7 year ticks, roughly 60 line segments, 5 label draws and 2 dots. Comfortably inside one 16ms budget.',
        'Cap DPR at 2 (1.75 on mobile) via the shared canvas wrapper. A 3x plot is nine times the fill rate for a 2px line.',
        'Quantise every reference rule to `Math.round(y) + 0.5` so 1px hairlines land on a pixel instead of smearing across two.',
        'Never use `shadowBlur` or `ctx.filter`. The area fill is a flat 7% rgba, which composites for free.',
        'Text is the expensive part of a canvas: 5 company labels plus 4 rung labels plus 7 year numerals is the entire budget, and none of them are redrawn at a different size per frame.'
      ],
      packages: [
        { p: 'none required', w: 'The plot is one linear scale and a smoothstep. A charting library would give you axes you do not want and take away the dashed second line you do.' },
        { p: 'no d3-shape', w: 'The curve here is deliberately not a spline. `d3.curveMonotoneX` would round the plateau corners, and a plateau with rounded corners stops reading as "this held steady for two years".' },
        { p: 'gsap (installed)', w: 'Not needed. The one entry animation is a scalar advanced by dt inside the render loop you already have.' }
      ],
      architecture: [
        { f: 'components/sections/Experience.tsx', r: 'Server shell: heading, readout markup, and the hidden accessible role list rendered from data.' },
        { f: 'components/experience/AltitudeCanvas.tsx', r: '"use client" leaf. Owns the canvas, the reveal scalar, the reader line and the hit test.' },
        { f: 'lib/experience/altitude.ts', r: 'Pure: `ladder`, `altitudePath(roles)`, `smoothstep()`. Returns normalised points so the component never does arithmetic on pixels.' },
        { f: 'lib/useTicker.ts', r: 'The single shared rAF subscription for the whole site.' }
      ],
      state: [
        '`selectedRoleId: string | null` in `useState`. Nothing else.',
        'The reveal scalar, the reader fraction, the damping target and the hovered role are refs read directly by the render loop.',
        'The live-role set at a date is derived inside the loop from the month index; storing it would be caching a pure function of a value that changes every frame.'
      ],
      typography: [
        'Rung labels: mono 500 at 9px, `0.16em` tracking, uppercase, drawn to canvas.',
        'Plateau labels: mono 500 at 10px. Mono because these sit next to dates and years and must share a rhythm with them.',
        'Readout: the rung name in the display face at `clamp(1rem, 1.6vw, 1.25rem)`, the date in tabular mono at 11px.',
        'Section heading: display 500 at `clamp(1.75rem, 3.4vw, 2.75rem)`, `-0.035em`, `line-height: 0.98`.'
      ],
      color: [
        'One hue at four alphas: 95% for the line, 55% for the dashed contract run, 7% for the area, 90% for the plateau dots.',
        'Everything that is reference rather than data is neutral ink: ladder rules at 5.5%, year ticks at 5%, year numerals at 26%.',
        'In light mode: the area fill rises to 12% and the ladder rules to 9%, because a 5% hairline is invisible on white. The hue itself does not change.'
      ],
      spacing: [
        'Plot padding: 6% of width along the time axis, 12% of height along the altitude axis. The extra headroom is for the plateau labels, which sit above their line.',
        'Rungs are evenly spaced at `(n - 0.5) / 4` of the plot height. Even spacing, because the ladder is ordinal and uneven spacing would imply a measured distance between rungs.',
        'The contract line sits exactly 8% of plot height below its own rung: far enough to read as separate, close enough to read as related.'
      ],
      relationships: [
        'Horizontal position is date. Vertical position is responsibility. Line style separates the primary track from the contract track. Three signals, three meanings, no overlap.',
        'The area under the line encodes accumulated responsibility over time, which is the closest honest visual to "experience".',
        'The dashed line crossing under the solid one is the only place in this whole area where two roles are drawn at two different altitudes in the same month. That crossing is the concept.',
        'Nothing encodes salary, seniority label, or company size, and the chart is better for it.'
      ],
      acceptance: [
        'On first view the line draws itself once in 1.6s and then holds completely still.',
        'The dashed contract run is visibly below the solid line for the months they share, at every window size.',
        'Moving across the plot moves a reader line whose readout always names the correct rung and companies for that month.',
        'Tabbing through the hidden list moves the reader line from role to role.',
        'At 390px the plot is a vertical climb, not a horizontal one squeezed, and every label is still readable.',
        'With reduced motion on, the completed plot appears immediately and the reader line jumps.'
      ]
    }
  });

  /* ==========================================================================
     PAGE 03  -  TENURE
     --------------------------------------------------------------------------
     One role owns the whole frame at a time, full bleed. The cinematic move is
     not the type size, it is the field behind it: a hairline for every one of
     the 79 months of the career, with only this role's months lit. Step to the
     next role and the lit window slides and resizes along the career.

     WHY A CLIP-PATH AND NOT A TRANSFORM
     -----------------------------------
     The lit window is a copy of the month field clipped to the role's span. A
     transform would stretch the hairlines inside it, which would silently
     change the month spacing and make the field a lie. clip-path is expensive
     per frame and free once per navigation, and this changes once per
     navigation - which is exactly the discrete state change the shape rules
     allow it for.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'experience-page-tenure',
    num: 3,
    name: 'Tenure',
    kind: 'DOM / framed handoff',
    accent: '#E08A4C',
    tagline: 'One role owns the frame at a time',
    desc: 'Each role takes the whole viewport in turn, with a field of 79 month hairlines behind it and only its own months lit. ' +
          'Stepping forward slides that lit window along the career, so you never lose your place in the whole.',
    interaction: 'Step with the arrows, the two controls, a swipe, or a click anywhere on the career rail.',
    hint: 'Left / Right steps &middot; Click the rail to jump',

    preview: function (ctx, w, h, t, heat) {
      var i = Math.floor((t * 0.34) % ROLES.length);
      var k = ((t * 0.34) % 1);
      var r = ROLES[i];
      var padX = w * 0.08;
      var iw = w - padX * 2;

      /* month field */
      ctx.fillStyle = 'rgba(236,236,239,0.10)';
      for (var m = 0; m < SPAN; m += 2) {
        ctx.fillRect(padX + (m / SPAN) * iw, h * 0.18, 1, h * 0.64);
      }
      ctx.fillStyle = 'rgba(224,138,76,' + (0.75 + heat * 0.25).toFixed(2) + ')';
      for (var q = Math.round(r.f0 * SPAN); q < Math.round(r.f1 * SPAN); q += 2) {
        ctx.fillRect(padX + (q / SPAN) * iw, h * 0.18, 1, h * 0.64);
      }

      /* the frame's copy, sliding up as it hands over */
      var lift = k > 0.86 ? (k - 0.86) / 0.14 : 0;
      var oy = -lift * h * 0.1;
      var al = 1 - lift;
      bar(ctx, padX, h * 0.40 + oy, iw * 0.52, h * 0.11, 'rgba(236,236,239,' + (0.72 * al).toFixed(3) + ')');
      bar(ctx, padX, h * 0.57 + oy, iw * 0.3, 3, 'rgba(236,236,239,' + (0.3 * al).toFixed(3) + ')');
      bar(ctx, padX, h * 0.65 + oy, iw * 0.44, 2, 'rgba(236,236,239,' + (0.18 * al).toFixed(3) + ')');
      bar(ctx, padX, h * 0.71 + oy, iw * 0.36, 2, 'rgba(236,236,239,' + (0.18 * al).toFixed(3) + ')');
    },

    mount: function (root, ctx) {
      var env = SE.env;
      root.classList.add('experience', 'experience-tenure');
      tint(root, '#E08A4C');

      var wrap = SE.el('div', 'experience-tenure__wrap');

      /* The month field is a repeating gradient, so 79 hairlines cost zero
         elements. The lit window is one element carrying the same gradient at
         full accent, clipped to the active role. */
      var field = SE.el('div', 'experience-tenure__field');
      field.setAttribute('aria-hidden', 'true');
      field.innerHTML = '<i class="experience-tenure__window"></i>';
      wrap.appendChild(field);
      var win = SE.$('.experience-tenure__window', field);

      var frames = SE.el('div', 'experience-tenure__frames');
      var items = ROLES.map(function (r, i) {
        var a = SE.el('article', 'experience-tenure__frame');
        a.id = 'tenure-' + r.id;
        a.setAttribute('aria-label', r.company + ', ' + r.range);
        a.innerHTML =
          '<p class="experience-tenure__meta t-num" style="--k:0">' +
            '<span>' + r.range + '</span><em>' + r.durLabel + '</em><span>' + r.place + '</span>' +
          '</p>' +
          '<h2 class="experience-tenure__co" style="--k:1">' + r.company + '</h2>' +
          '<p class="experience-tenure__ti" style="--k:2">' + r.title + '<em>' + r.kind + '</em></p>' +
          '<p class="experience-tenure__was" style="--k:3">' + r.was + '</p>' +
          '<ul class="experience-tenure__ships" style="--k:4">' + shipsHtml(r, 'experience-tenure__ship') + '</ul>' +
          '<p class="experience-tenure__tech" style="--k:5">' + techHtml(r, 'experience-tenure__chip') + '</p>';
        frames.appendChild(a);
        return { el: a, r: r };
      });
      wrap.appendChild(frames);

      /* The career rail: the whole span, always visible, with a click target
         per role. It is what stops a full-bleed frame from being disorienting. */
      var rail = SE.el('nav', 'experience-tenure__rail');
      rail.setAttribute('aria-label', 'Career rail');
      rail.innerHTML =
        '<span class="experience-tenure__railline" aria-hidden="true"></span>' +
        ROLES.map(function (r, i) {
          return '<button type="button" class="experience-tenure__stop" data-go="' + i + '" ' +
                 'style="--f0:' + r.f0.toFixed(5) + ';--f1:' + r.f1.toFixed(5) + '" ' +
                 'aria-label="' + r.company + ', ' + r.range + '"><i></i></button>';
        }).join('') +
        '<span class="experience-tenure__railends t-num" aria-hidden="true">' +
          '<em>' + mLabel(SPAN_A) + '</em><em>Now</em></span>';
      wrap.appendChild(rail);

      var nav = SE.el('div', 'experience-tenure__nav');
      nav.innerHTML =
        '<button class="iconbtn" data-step="-1" aria-label="Previous role">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '<span class="experience-tenure__count t-num" role="status" aria-live="polite"></span>' +
        '<button class="iconbtn" data-step="1" aria-label="Next role">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>';
      wrap.appendChild(nav);

      root.appendChild(wrap);
      root.appendChild(SE.hintStrip('<span>Left and Right step</span><span>Click the rail to jump</span>'));

      var count = SE.$('.experience-tenure__count', nav);
      var stops = SE.$$('[data-go]', rail);

      /* ----------------------------------------------------------- state */
      var at = 0;

      function show(i, dir) {
        i = M.clamp(i, 0, ROLES.length - 1);
        if (i === at && root.classList.contains('is-ready')) return;
        var r = ROLES[i];
        /* Direction-aware: forward leaves upward, back leaves downward. A
           sequence that always exits the same way loses its sense of place. */
        root.classList.toggle('is-back', dir < 0);
        items.forEach(function (it, k) { it.el.classList.toggle('is-on', k === i); });
        stops.forEach(function (b, k) { b.setAttribute('aria-current', String(k === i)); });
        win.style.setProperty('--f0', r.f0.toFixed(5));
        win.style.setProperty('--f1', r.f1.toFixed(5));
        count.textContent = SE.pad(i + 1) + ' / ' + SE.pad(ROLES.length);
        at = i;
        root.classList.add('is-ready');
      }

      function step(d) { show(M.clamp(at + d, 0, ROLES.length - 1), d); }

      nav.addEventListener('click', function (e) {
        var b = e.target.closest('[data-step]');
        if (b) step(parseInt(b.getAttribute('data-step'), 10));
      });
      rail.addEventListener('click', function (e) {
        var b = e.target.closest('[data-go]');
        if (!b) return;
        var i = parseInt(b.getAttribute('data-go'), 10);
        show(i, i > at ? 1 : -1);
      });

      function onKey(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { step(1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { step(-1); e.preventDefault(); }
        else if (e.key === 'Home') { show(0, -1); e.preventDefault(); }
        else if (e.key === 'End') { show(ROLES.length - 1, 1); e.preventDefault(); }
      }
      root.addEventListener('keydown', onKey);

      /* Wheel steps, but the listener stays passive and never calls
         preventDefault: a full-viewport takeover may consume the wheel, it may
         not take the page hostage. The cooldown is what stops one trackpad
         flick from skipping three roles. */
      var cool = 0;
      function onWheel(e) {
        var now = performance.now();
        if (now - cool < 520) return;
        var d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (Math.abs(d) < 24) return;
        cool = now;
        step(d > 0 ? 1 : -1);
      }
      wrap.addEventListener('wheel', onWheel, { passive: true });

      /* Swipe, with the arrow keys above as its required non-drag equivalent. */
      var sx = 0, sy = 0, tracking = false;
      function onDown(e) { sx = e.clientX; sy = e.clientY; tracking = true; }
      function onUp(e) {
        if (!tracking) return;
        tracking = false;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
      }
      frames.addEventListener('pointerdown', onDown, { passive: true });
      frames.addEventListener('pointerup', onUp, { passive: true });
      frames.addEventListener('pointercancel', function () { tracking = false; }, { passive: true });

      show(0, 1);

      return {
        destroy: function () {
          root.removeEventListener('keydown', onKey);
          wrap.removeEventListener('wheel', onWheel);
          frames.removeEventListener('pointerdown', onDown);
          frames.removeEventListener('pointerup', onUp);
          root.classList.remove('experience', 'experience-tenure', 'is-ready', 'is-back');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'Full-bleed frames over a field of 79 month hairlines',
      philosophy: [
        'Give a role the whole viewport and its specifics stop being bullet points and start being the subject. One frame, one job, nothing else competing.',
        'The risk with a full-bleed sequence is disorientation: five beautiful frames and no idea where you are. The month field behind fixes that. It is the entire career, always on screen, and each frame lights only its own window of it.',
        'Cinematic here means restraint, not effects: a field, a lit window, a hard cut, and a rail. No wipes, no parallax, no flares.'
      ],
      hierarchy: [
        '1. The company name at `clamp(2.5rem, 7.5vw, 6.5rem)`, display 500, `-0.045em`. It is the loudest thing on the screen by a wide margin.',
        '2. The two or three dated things shipped, at `clamp(0.9375rem, 1.15vw, 1.0625rem)` with the month in tabular mono at 40% ink.',
        '3. The title and engagement kind in mono at 11px directly under the name.',
        '4. The metadata line above the name: date range, duration, location, all tabular.',
        '5. The month field at 5% ink, lit window at 34%. Loud enough to locate you, quiet enough to be background.'
      ],
      structure: [
        'Full-bleed section `id="experience"`, `min-h-[100dvh]`, `overflow: hidden`.',
        'Layer 1: the month field, a `repeating-linear-gradient` with a 1px stop every `100% / 79`, so 79 hairlines cost zero elements.',
        'Layer 2: the lit window, an absolutely positioned copy of that gradient at full accent, clipped with `inset(0 calc((1 - var(--f1)) * 100%) 0 calc(var(--f0) * 100%))`.',
        'Layer 3: five absolutely positioned `<article>` frames stacked; exactly one carries `is-on`.',
        'Layer 4: the career rail at the bottom, with one button per role positioned by the same two fractions.',
        'Layer 5: previous / next controls and a live "02 / 05" counter.'
      ],
      interaction: [
        'STEP: previous and next buttons, ArrowLeft / ArrowRight (and Up / Down), Home, End.',
        'JUMP: every role has a button on the career rail sized to its own span, so the rail doubles as a scale drawing of the career.',
        'WHEEL: `|delta| > 24` steps one role, with a 520ms cooldown so one trackpad flick cannot skip three. The listener is passive and never calls preventDefault.',
        'SWIPE: horizontal drag over 48px steps, with the arrow keys as the required non-drag equivalent.',
        'The counter is `aria-live="polite"`, so every step is announced.'
      ],
      choreography: [
        { n: 'The lit window', d: '`clip-path: inset()` transitions over 620ms `cubic-bezier(0.77, 0, 0.175, 1)`. This is the one continuity transition in the concept: the window slides and resizes along the career, so a hard cut in the foreground still reads as a move rather than a teleport. clip-path is expensive per frame and free once per navigation, which is exactly what this is.' },
        { n: 'Frame exit', d: 'opacity 1 -> 0 with `translateY(0 -> -18px)` over 260ms `cubic-bezier(0.23, 1, 0.32, 1)`. Direction-aware: going back it leaves downward instead. Exit is roughly 62% of the enter duration, which is what keeps the sequence feeling responsive.' },
        { n: 'Frame enter', d: 'opacity 0 -> 1 with `translateY(22px -> 0)` over 420ms `cubic-bezier(0.23, 1, 0.32, 1)`, and the six blocks inside stagger with `transition-delay: calc(var(--k) * 55ms)`. The metadata line arrives first and the technology chips last.' },
        { n: 'Rail stop', d: 'The active stop grows from 2px to 4px tall and goes from 26% to 100% accent over 220ms `ease`. Height on a 2px element is cheap and there is no transform equivalent for a rule getting thicker from its own centre line.' },
        { n: 'What does NOT move', d: 'The month field. If the field drifted, the lit window would stop meaning anything.' }
      ],
      scroll: [
        'This concept does not use page scroll. It is a stepped sequence in one viewport.',
        'It consumes wheel delta as a step, but only while the pointer is inside the section, only above a 24px threshold, and never with preventDefault. The page keeps scrolling normally.',
        'If you would rather not touch the wheel at all, drop that listener. Buttons, keys, rail and swipe already cover every input.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'Rail stops: the inner rule goes from 26% to 62% accent over 180ms. The active one is already at 100%.',
        'Technology chips: border steps from `--line` to the accent at 42%. Nothing moves; the frame is the composition and hover theatre would fight it.'
      ],
      click: [
        'Previous and next step by one. Rail stops jump directly and set the direction from the index delta, so a backwards jump animates backwards.',
        'There is no click target on the frame body itself. Nothing here opens anything else: the frame already IS the detail view.',
        'Every control is at least 44x44 including the rail stops, whose hit area extends 16px above and below the 2px rule.'
      ],
      responsive: {
        desktop: 'Company name up to 6.5rem, content in a 46rem measure inset `clamp(2rem, 7vw, 8rem)` from the left, rail across the bottom with the span endpoints labelled, nav bottom right.',
        tablet: 'Name caps at 4.5rem, the shipped list drops to two lines each, the rail keeps its full width.',
        mobile: 'The rail moves to the TOP, directly under the metadata line, because on a phone the "where am I" question is asked before the content is read, not after. The name drops to `clamp(1.875rem, 9vw, 2.75rem)` and wraps to two lines with `pb-1` reserve. Previous and next become two 48px controls pinned to the bottom edge with a safe-area inset, and swipe becomes the primary gesture.'
      },
      a11y: [
        'Each frame is a real `<article>` with an `aria-label` of company and date range. Inactive frames are `aria-hidden` and their focusable children are `tabindex="-1"`, so a screen reader reads one role at a time.',
        'The "02 / 05" counter is the accessible position indicator and lives in an `aria-live="polite"` region.',
        'Every rail stop is a button with `aria-current` and a label naming the company and range.',
        'Swipe is never the only way to advance: arrows, buttons and rail all do the same job. That is WCAG 2.2 dragging-movements, satisfied by construction.',
        'Under `prefers-reduced-motion: reduce`: the clip-path transition and both frame transitions drop to a 120ms opacity cross-fade with no translate. Stepping still works and the lit window still moves; it simply arrives.'
      ],
      perf: [
        'Per navigation: one clip-path transition, two opacity plus transform transitions, one class toggle. Between navigations the section is completely idle and subscribes to no ticker at all.',
        'The month field is a single `repeating-linear-gradient`. Painting 79 hairlines as 79 elements would be 79 layout boxes for a background texture.',
        'Frames are stacked absolutely and only the active one is composited; the rest sit at `opacity: 0` with `visibility: hidden` after their exit so they are skipped entirely.',
        '`will-change: clip-path` on the lit window only, and only while a transition is in flight.'
      ],
      packages: [
        { p: 'none required', w: 'Five stacked panels and a clip-path transition. A carousel library would add a track, a drag engine and a virtualiser for five items that all fit in the DOM.' },
        { p: 'no framer-motion AnimatePresence', w: 'Tempting, but the exit here is a CSS transition on an element that is never unmounted. Keeping all five mounted is what makes the content server-rendered and crawlable.' },
        { p: 'gsap (installed)', w: 'Only if you want the enter stagger as a timeline. The CSS cascade already does it and interrupts correctly when someone steps twice quickly.' }
      ],
      architecture: [
        { f: 'components/sections/Experience.tsx', r: 'Server Component. Renders all five frames, the rail and the field, so the whole history is in the HTML.' },
        { f: 'components/experience/TenureStepper.tsx', r: '"use client" leaf. Owns the active index, the key, wheel and swipe handlers, and writes the two clip fractions.' },
        { f: 'components/experience/CareerRail.tsx', r: 'Presentational. Takes roles and an active index; positions each stop from `f0` and `f1`.' },
        { f: 'lib/experience/timeline.ts', r: 'Shared span arithmetic. The rail and the field must derive their fractions from the same function or they will disagree by a month.' }
      ],
      state: [
        '`activeIndex: number` in `useState`. It changes on intent, a handful of times.',
        'The wheel cooldown timestamp and the swipe origin are refs. They change during a gesture and must not re-render anything.',
        'The clip fractions are written as CSS custom properties on one element, not held in state, because they are a pure function of `activeIndex`.'
      ],
      typography: [
        'Company: display 500 at `clamp(2.5rem, 7.5vw, 6.5rem)`, `letter-spacing: -0.045em`, `line-height: 0.92`.',
        'Title and kind: mono 500 at 11px, `0.14em` tracking, uppercase.',
        'Metadata and ship months: mono with `font-variant-numeric: tabular-nums` at 10px, so the date column above the name never shifts between frames.',
        'Shipped items: display 400 at `clamp(0.9375rem, 1.15vw, 1.0625rem)`, `line-height: 1.55`, measure capped at 46ch.'
      ],
      color: [
        'One hue, three alphas: 100% for the lit window and the active rail stop, 42% for chip borders, 26% for resting rail stops.',
        'The month field is neutral ink at 5%. If it took the accent it would compete with the lit window and the whole device would collapse.',
        'Ground is `--void`. In light mode the field rises to 9% and the lit window drops to 62% accent, because a full-strength hairline field on white is a barcode.'
      ],
      spacing: [
        'Content inset `clamp(2rem, 7vw, 8rem)` from the left and vertically centred with `align-content: center`. The generous left margin is what makes it read as a frame rather than a slide.',
        'Shipped list rows: 0.75rem vertical rhythm with a hairline between, no rule above the first or below the last.',
        'The rail sits `clamp(1.25rem, 4vh, 2.5rem)` from the bottom edge with the nav controls on the same baseline.'
      ],
      relationships: [
        'Horizontal position on the field and rail encodes date. Lit width encodes duration. Nothing else encodes either.',
        'The lit window is the same two fractions as the rail stop, from the same function, so the background and the control can never disagree.',
        'The frame carries no chart at all, and that is the trade: this concept spends everything on the specifics and delegates the shape of the career to the two thin surfaces at the edges.',
        'Direction of exit encodes direction of travel, which is the only thing making a hard cut legible as a sequence.'
      ],
      acceptance: [
        'Stepping forward and back moves the lit window along the field to exactly the role you are looking at, at any window width.',
        'One trackpad flick advances exactly one role.',
        'The page behind the section still scrolls normally while the pointer is inside it.',
        'Tab reaches previous, next and all five rail stops; arrows step; Home and End jump to the ends.',
        'At 390px the rail is above the content, the name wraps to two lines with no clipped descenders, and both controls are at least 48px.',
        'With reduced motion on, stepping is an instant cross-fade and the lit window still lands in the right place.'
      ]
    }
  });

  /* ==========================================================================
     PAGE 04  -  DOSSIER
     --------------------------------------------------------------------------
     A document, set properly. Dense, ruled, tabular, and confident enough to
     let the specifics do the work with almost no motion at all.

     THE ONE INTERACTION THAT EARNS ITS PLACE
     ----------------------------------------
     Click any technology anywhere in the document and every role that used it
     lights while the rest recede. That answers "how long have you actually
     used Postgres" from the career itself rather than from a self-reported
     number, which is the single most useful thing a work history can do and
     the thing a printed CV structurally cannot.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'experience-page-dossier',
    num: 4,
    name: 'Dossier',
    kind: 'DOM / ruled document',
    accent: '#9AA7B8',
    tagline: 'A document, and a cross-reference',
    desc: 'The whole history written out at full density on a 24px baseline, with dates in a fixed tabular column and marginalia beside each role. ' +
          'Selecting any technology cross-references it across every role, so the years come from the record rather than from a claim.',
    interaction: 'Read it. Click any technology to cross-reference it across the whole history, and the index tracks where you are.',
    hint: 'Click a technology to cross-reference it',

    preview: function (ctx, w, h, t, heat) {
      var rand = SE.rng(90210);
      var padX = w * 0.07;
      var colX = padX + w * 0.17;
      var lineH = h * 0.055;
      var n = Math.floor((h * 0.78) / lineH);
      var lit = Math.floor((t * 1.1) % n);

      /* index column */
      for (var i = 0; i < 5; i++) {
        bar(ctx, padX, h * 0.16 + i * lineH * 1.5, w * 0.1, 2,
          'rgba(154,167,184,' + (0.28 + heat * 0.2).toFixed(3) + ')');
      }
      pxLine(ctx, colX - w * 0.03, h * 0.12, colX - w * 0.03, h * 0.92, 'rgba(236,236,239,0.09)');

      /* the document body: hairlines of authored-looking length */
      ctx.lineWidth = 1;
      for (var k = 0; k < n; k++) {
        var y = h * 0.14 + k * lineH;
        var wd = (0.34 + rand() * 0.62) * (w - colX - padX);
        var head = k % 6 === 0;
        var on = k === lit || k === lit + 1;
        bar(ctx, colX, y, head ? wd * 0.7 : wd, head ? 3 : 2,
          'rgba(236,236,239,' + ((head ? 0.5 : 0.16) + (on ? 0.34 : 0) + heat * 0.06).toFixed(3) + ')');
      }
    },

    mount: function (root, ctx) {
      var env = SE.env;
      root.classList.add('experience', 'experience-dossier');
      tint(root, '#9AA7B8');

      var scroller = SE.el('div', 'experience-dossier__scroller');
      var doc = SE.el('article', 'experience-dossier__doc');

      doc.innerHTML =
        '<header class="experience-dossier__masthead">' +
          '<h2 class="experience-dossier__title">' + (D.identity ? D.identity.name : 'Work history') + ', in full</h2>' +
          '<dl class="experience-dossier__facts t-num">' +
            '<div><dt>Calendar</dt><dd>' + SUMMARY.calendar + ' mo</dd></div>' +
            '<div><dt>Role</dt><dd>' + SUMMARY.role + ' mo</dd></div>' +
            '<div><dt>Doubled</dt><dd>' + SUMMARY.doubled + ' mo</dd></div>' +
            '<div><dt>Roles</dt><dd>' + SE.pad(SUMMARY.roles) + '</dd></div>' +
            '<div><dt>Stack</dt><dd>' + SE.pad(SUMMARY.techs) + '</dd></div>' +
          '</dl>' +
        '</header>' +
        ROLES.map(function (r, i) {
          return '<section class="experience-dossier__entry" id="dossier-' + r.id + '" data-entry="' + i + '" ' +
                 'data-tech="' + r.tech.join(' ') + '">' +
            '<p class="experience-dossier__dates t-num">' +
              '<b>' + mLabel(r.a) + '</b><i>' + (r.current ? 'Present' : mLabel(r.b - 1)) + '</i>' +
              '<em>' + r.durLabel + '</em></p>' +
            '<div class="experience-dossier__main">' +
              '<h3 class="experience-dossier__co">' + r.company + '</h3>' +
              '<p class="experience-dossier__ti">' + r.title + '</p>' +
              '<p class="experience-dossier__was">' + r.was + '</p>' +
              '<ul class="experience-dossier__ships">' + shipsHtml(r, 'experience-dossier__ship') + '</ul>' +
              '<p class="experience-dossier__tech">' +
                r.techs.map(function (s) {
                  return '<button type="button" class="experience-dossier__chip" data-t="' + s.id +
                         '" aria-pressed="false">' + s.name + '</button>';
                }).join('') +
              '</p>' +
            '</div>' +
            '<aside class="experience-dossier__margin t-num">' +
              '<span>' + r.place + '</span>' +
              '<span>' + r.kind + '</span>' +
              '<span>' + r.rung.label + '</span>' +
              '<span>' + SE.pad(r.techs.length) + ' technologies</span>' +
            '</aside>' +
          '</section>';
        }).join('');

      scroller.appendChild(doc);

      var index = SE.el('nav', 'experience-dossier__index');
      index.setAttribute('aria-label', 'Roles');
      index.innerHTML =
        '<span class="experience-dossier__mark" aria-hidden="true"></span>' +
        '<ul class="experience-dossier__ilist">' +
          ROLES.map(function (r, i) {
            return '<li><a href="#dossier-' + r.id + '" data-i="' + i + '">' +
                   '<b>' + r.company + '</b>' +
                   '<span class="t-num">' + r.rangeShort + '</span></a></li>';
          }).join('') +
        '</ul>' +
        '<p class="experience-dossier__xref t-num" role="status" aria-live="polite"></p>';

      root.appendChild(index);
      root.appendChild(scroller);

      var xref = SE.$('.experience-dossier__xref', index);
      var mark = SE.$('.experience-dossier__mark', index);
      var links = SE.$$('a[data-i]', index);
      var entries = SE.$$('.experience-dossier__entry', doc);

      /* --------------------------------------------------- cross-reference */
      var activeTech = null;

      function crossRef(id) {
        activeTech = (activeTech === id) ? null : id;
        root.classList.toggle('is-xref', !!activeTech);
        SE.$$('.experience-dossier__chip', doc).forEach(function (c) {
          var on = activeTech && c.getAttribute('data-t') === activeTech;
          c.classList.toggle('is-hit', !!on);
          c.setAttribute('aria-pressed', String(!!on));
        });
        entries.forEach(function (s) {
          var has = activeTech && s.getAttribute('data-tech').split(' ').indexOf(activeTech) !== -1;
          s.classList.toggle('is-dim', !!activeTech && !has);
        });
        links.forEach(function (a, i) {
          var has = activeTech && ROLES[i].tech.indexOf(activeTech) !== -1;
          a.classList.toggle('is-dim', !!activeTech && !has);
        });
        if (!activeTech) { xref.textContent = ''; return; }
        var rec = null;
        for (var i = 0; i < TECHS.length; i++) if (TECHS[i].skill.id === activeTech) rec = TECHS[i];
        if (!rec) { xref.textContent = ''; return; }
        xref.innerHTML =
          '<b>' + rec.skill.name + '</b>' +
          '<span>' + rec.roles.length + (rec.roles.length === 1 ? ' role' : ' roles') + '</span>' +
          '<span>first ' + mLabel(rec.m) + '</span>' +
          '<span>' + dur(rec.months) + ' in production</span>';
      }

      doc.addEventListener('click', function (e) {
        var c = e.target.closest('[data-t]');
        if (c) { crossRef(c.getAttribute('data-t')); e.preventDefault(); }
      });

      function onKey(e) {
        if (e.key === 'Escape' && activeTech) { crossRef(activeTech); e.preventDefault(); }
      }
      root.addEventListener('keydown', onKey);

      /* ------------------------------------------------------ index track */
      /* One rule that translates to the active index entry. A transform on a
         single element, not a class on five, so it can never end up in two
         places at once during a fast scroll. */
      var io = new IntersectionObserver(function (list) {
        list.forEach(function (en) {
          if (!en.isIntersecting) return;
          var i = parseInt(en.target.getAttribute('data-entry'), 10);
          links.forEach(function (a, k) { a.setAttribute('aria-current', String(k === i)); });
          var li = links[i] ? links[i].parentNode : null;
          if (li) mark.style.transform = 'translate3d(0,' + li.offsetTop + 'px,0)';
        });
      }, { root: scroller, threshold: 0.02, rootMargin: '-12% 0px -70% 0px' });
      entries.forEach(function (s) { io.observe(s); });

      index.addEventListener('click', function (e) {
        var a = e.target.closest('a[data-i]');
        if (!a) return;
        e.preventDefault();
        var t = entries[parseInt(a.getAttribute('data-i'), 10)];
        if (t) scroller.scrollTo({ top: t.offsetTop - 24, behavior: env.reduced ? 'auto' : 'smooth' });
      });

      return {
        destroy: function () {
          io.disconnect();
          root.removeEventListener('keydown', onKey);
          root.classList.remove('experience', 'experience-dossier', 'is-xref');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'The full record on a baseline grid, cross-referenced by technology',
      philosophy: [
        'Some work histories do not need a device. They need to be set properly: a real baseline grid, a fixed tabular date column, hairlines only where something is actually being separated, and marginalia that annotates rather than decorates.',
        'The confidence is in the density. Everything is on the page at once, nothing is hidden behind a disclosure, and the reader is trusted to scan.',
        'The one interaction earns its place because it does something paper cannot: cross-reference a technology across every role and answer "how many months, starting when" from the record.'
      ],
      hierarchy: [
        '1. Company names at `clamp(1.375rem, 2.4vw, 1.875rem)` display 500. Five of them, evenly spaced down the document.',
        '2. The dated shipped items. These are the substance and they get the widest measure, capped at 64ch.',
        '3. The date column: start on top at full ink, end below at 55%, duration at 40%. Fixed 8rem wide, tabular, so the eye reads down the years in a straight line.',
        '4. Technology chips, which are also the controls.',
        '5. Marginalia at 10px, 34% ink, right column: location, engagement, rung, count. Present for the reader who wants it, invisible to the one who does not.'
      ],
      structure: [
        'Two column layout: a `position: sticky` index at `minmax(13rem, 16rem)` and the document at `1fr`.',
        'The document is its own scroll container in the takeover, and plain page flow when embedded in a portfolio.',
        'Each entry is a three column subgrid: dates, main, marginalia. Subgrid so the date column stays in a single vertical line across all five entries regardless of content height.',
        'A masthead above the first entry carries the five summary figures as a `<dl>`.',
        'The index carries a running cross-reference readout at the bottom.'
      ],
      interaction: [
        'CROSS-REFERENCE: clicking any technology chip sets it active. Every matching chip in the document goes to `is-hit`; every entry without it drops to 28% opacity; every index row without it does the same.',
        'The readout prints the technology, the number of roles it appears in, the month it first went into production, and the total time since, computed from the roles rather than authored.',
        'Clicking the active chip again, or Escape, clears the filter.',
        'INDEX: entries scroll-spy through an IntersectionObserver with `rootMargin: -12% 0px -70% 0px`, so the active entry is the one crossing the upper third rather than whichever is largest.',
        'Clicking an index row scrolls to that entry with `behavior: "smooth"`, or `"auto"` under reduced motion.'
      ],
      choreography: [
        { n: 'Index mark', d: 'One 1px rule, `translate3d(0, offsetTop, 0)` over 320ms `cubic-bezier(0.32, 0.72, 0, 1)`. A single moving element rather than a class on five, so a fast scroll cannot leave it in two places at once.' },
        { n: 'Cross-reference', d: 'opacity 1 -> 0.28 on non-matching entries over 180ms `ease`. Opacity only. Nothing translates, because the document is a grid and moving it would break the baseline.' },
        { n: 'Chip hit', d: 'border-color and color to full accent over 140ms `ease`. Under 200ms because it is direct feedback on a click.' },
        { n: 'Deliberately absent', d: 'No entry reveal on scroll, no stagger, no parallax. A document that introduces itself paragraph by paragraph is a document that does not trust its own content.' }
      ],
      scroll: [
        'Native scroll only. No pinning, no scrub, no hijack.',
        'One IntersectionObserver for the five entries. Never `window.addEventListener("scroll")`.',
        'The index is `position: sticky; top: 0` inside the grid, which needs no JavaScript and cannot desynchronise.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'Chips: border `--line` to accent at 42% over 140ms.',
        'Index rows: ink `--ink-3` to `--ink-2`. The active row is already at full ink with the mark beside it.',
        'Nothing lifts, scales or shadows. This is a document.'
      ],
      click: [
        'Chips toggle the cross-reference. They are real buttons with `aria-pressed`, so the state is exposed and not just visual.',
        'Index rows are anchors to real element ids, so they work with JavaScript disabled and are shareable as deep links.',
        'Escape clears the cross-reference from anywhere in the section.'
      ],
      responsive: {
        desktop: 'Three column entries: 8rem dates, 1fr main, 11rem marginalia. Sticky index on the left. 24px baseline.',
        tablet: 'Marginalia folds under the main column as an inline row of tabular spans separated by space, not by a middot. Index narrows to 11rem.',
        mobile: 'Single column. The index becomes a sticky top bar carrying only the running total and a horizontally scrollable technology filter row, because a 13rem sidebar in a 390px column is not a sidebar. Dates move above the company name as one tabular line. Marginalia inlines at 10px directly under the shipped list. The baseline drops from 24px to 22px.'
      },
      a11y: [
        'The whole concept is real semantic markup: `<article>`, `<section>`, `<h3>`, `<dl>`, `<ul>`. Nothing here is a div pretending.',
        'Chips are `<button aria-pressed>`, not spans with click handlers, so the filter state is announced.',
        'The cross-reference readout is `role="status" aria-live="polite"`.',
        'Dimming is opacity 0.28, never `display: none`, so a screen reader still reads the full history while the filter is on. Filtering is a visual aid, not a content gate.',
        'Every date uses `font-variant-numeric: tabular-nums`. In a five-row date column that is the difference between a table and a ransom note.',
        'Under `prefers-reduced-motion: reduce`: smooth scrolling becomes `auto`, the index mark jumps, and the dim transition drops to 120ms. Nothing else was moving anyway.'
      ],
      perf: [
        'Zero animation frames. This concept subscribes to no ticker and costs nothing at rest, which is the correct answer for a document.',
        'The cross-reference is one class toggle per entry and one per chip: about 33 style writes on a click, not per frame.',
        'One IntersectionObserver with five targets.',
        '`content-visibility: auto` with a `contain-intrinsic-size` on off-screen entries is safe here, because the layout is a plain vertical grid with no measured track.'
      ],
      packages: [
        { p: 'none required', w: 'CSS subgrid and one IntersectionObserver. There is no library that improves on that here.' },
        { p: 'no motion library', w: 'The only animation is a 320ms transform on one rule. Adding a motion runtime for that would be the most expensive line of code in the section.' }
      ],
      architecture: [
        { f: 'components/sections/Experience.tsx', r: 'Server Component rendering the entire document. This concept is 100% server-renderable and should be.' },
        { f: 'components/experience/TechCrossRef.tsx', r: '"use client" leaf wrapping only the chips and the readout. It sets one attribute on the section root; CSS does the rest.' },
        { f: 'components/experience/DossierIndex.tsx', r: '"use client". Owns the IntersectionObserver and the moving mark.' },
        { f: 'lib/experience/techIndex.ts', r: 'Pure: builds `{ skill, firstMonth, roles[] }` from the role list. Shared with any other concept that needs first-use dates.' }
      ],
      state: [
        '`activeTechId: string | null` and `activeEntry: number` in `useState`. Both change on intent or on a scroll boundary, a handful of times per visit.',
        'The observer instance and the mark element are refs.',
        'Do not put scroll position in state. The observer gives you a discrete index; that is the only scroll-derived value this concept needs.'
      ],
      typography: [
        'Everything sits on a 24px baseline. Set `line-height` in multiples of it and derive section spacing from it rather than from a spacing scale, or the grid is decorative rather than real.',
        'Company: display 500 at `clamp(1.375rem, 2.4vw, 1.875rem)`, `-0.03em`.',
        'Body and shipped items: display 400 at 0.9375rem, `line-height: 1.6`, measure 64ch.',
        'Dates, durations, counts and marginalia: mono with tabular figures at 10px, `0.08em` tracking.',
        'Title in mono uppercase at 10px, `0.16em`. Mono here is for data and identifiers, never for the prose.'
      ],
      color: [
        'The accent is a low-chroma pewter, and that is a decision, not a compromise: a document that shouts in colour stops reading as a record. The hue appears only on hit chips, the index mark and the active date.',
        'Everything else is the neutral ink ramp: `--ink` for names, `--ink-2` for prose, `--ink-3` for dates, `--ink-4` for marginalia.',
        'In light mode: the ink ramp inverts and hairlines go from 8% white to 12% black, because a rule that reads as a hairline on black reads as nothing on white.'
      ],
      spacing: [
        '24px baseline. Entry separation is 3 baselines (72px), the rule above each entry sits 1 baseline above its first line.',
        'Date column fixed at 8rem. Fixed, because a proportional date column changes width when one entry says "Present".',
        'Document measure capped at 64ch for prose and 72ch for shipped items. Marginalia is deliberately outside that measure so it never interrupts a line.'
      ],
      relationships: [
        'Vertical position encodes chronology, and the fixed date column is what makes that legible without a single graphic mark.',
        'The technology cross-reference encodes co-occurrence: which roles shared a tool. That is the accumulation argument, expressed as a query rather than a chart.',
        'Marginalia encodes the facts that are true of a role but not interesting in sequence: location, engagement type, rung. Putting them in the margin is the whole point; putting them in the flow would flatten the hierarchy.',
        'Opacity encodes filter membership and nothing else, which is why nothing else in this concept is ever partially transparent.'
      ],
      acceptance: [
        'The date column is a single unbroken vertical line of tabular figures down all five entries at every width.',
        'Clicking PostgreSQL lights it in three roles and prints the correct first-use month and total months.',
        'The index mark lands on the entry crossing the upper third of the viewport, and never on two at once during a fast scroll.',
        'With JavaScript disabled the entire history is still readable and the index links still jump.',
        'At 390px the index is a top bar with a scrollable filter row, not a squeezed sidebar.',
        'With reduced motion on, nothing moves except the scroll position, and it jumps.'
      ]
    }
  });

  /* ==========================================================================
     PAGE 05  -  LEDGER
     --------------------------------------------------------------------------
     A career as a system's history: 50 timestamped events across five sources,
     replayed by a playhead. Drag it back to Feb 2022 and the log rewinds, the
     stack shrinks, and the state panel tells you exactly what was true then.

     THE CONTROL IS A REAL RANGE INPUT
     ---------------------------------
     A hand-rolled slider here would mean re-implementing keyboard stepping,
     page-up jumps, focus, the value announcement and the touch target, and
     getting one of them subtly wrong. A styled <input type="range"> with
     aria-valuetext set to the month label is smaller, correct on the first
     try, and it is the difference between "scrub" being a gesture and being an
     interaction anyone can perform.

     AND IT SUBSCRIBES TO NOTHING
     ----------------------------
     There is no ticker subscription in this concept. It is input-driven, so a
     ledger sitting still costs exactly zero.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'experience-page-ledger',
    num: 5,
    name: 'Ledger',
    kind: 'DOM + canvas / replayed log',
    accent: '#A582F0',
    tagline: 'A career replayed as a system log',
    desc: 'Fifty timestamped events across five sources, from joining to shipping to adopting a technology, replayed by a playhead you drag. ' +
          'A state panel beside it answers what was true on any date: roles live, rung, stack size, months elapsed.',
    interaction: 'Drag the playhead, or focus it and use the arrow keys, to replay the log forward and backward. The state panel follows.',
    hint: 'Drag the playhead &middot; Arrow keys step a month',

    preview: function (ctx, w, h, t, heat) {
      var rand = SE.rng(31337);
      var padX = w * 0.07;
      var rows = 11;
      var rowH = (h * 0.76) / rows;
      var head = ((t * 0.19) % 1.3);
      var cut = M.clamp(head, 0, 1) * rows;

      for (var i = 0; i < rows; i++) {
        var y = h * 0.12 + i * rowH;
        var on = i < cut;
        var a = on ? 0.62 + heat * 0.2 : 0.1;
        bar(ctx, padX, y, w * 0.055, 2, 'rgba(165,130,240,' + (on ? 0.95 : 0.14).toFixed(3) + ')');
        bar(ctx, padX + w * 0.085, y, w * 0.09, 2, 'rgba(236,236,239,' + (a * 0.5).toFixed(3) + ')');
        bar(ctx, padX + w * 0.20, y, (0.24 + rand() * 0.5) * (w - padX * 2), 2,
          'rgba(236,236,239,' + a.toFixed(3) + ')');
      }

      var py = h * 0.12 + cut * rowH;
      pxLine(ctx, padX * 0.5, py, w - padX * 0.5, py, 'rgba(255,255,255,0.55)');
      ctx.fillStyle = '#fff';
      ctx.fillRect(padX * 0.5, py - 1.5, 3, 3);
    },

    mount: function (root, ctx) {
      var env = SE.env;
      root.classList.add('experience', 'experience-ledger');
      tint(root, '#A582F0');

      var wrap = SE.el('div', 'experience-ledger__wrap');
      wrap.innerHTML =
        '<header class="experience-ledger__head">' +
          '<h2 class="experience-ledger__title">Everything, in the order it happened</h2>' +
          '<p class="experience-ledger__lede">' + EVENTS.length + ' events across ' + SUMMARY.roles +
            ' sources. Drag the playhead and the record rewinds with it.</p>' +
        '</header>';

      var body = SE.el('div', 'experience-ledger__body');

      var logWrap = SE.el('div', 'experience-ledger__logwrap');
      var log = SE.el('ol', 'experience-ledger__log');
      log.setAttribute('aria-label', 'Career event log');
      log.innerHTML = EVENTS.map(function (e) {
        return '<li class="experience-ledger__row" data-i="' + e.i + '">' +
          '<i class="experience-ledger__t t-num">' + mShort(e.m) + '</i>' +
          '<b class="experience-ledger__lvl" data-lvl="' + e.lvl + '">' + e.lvl + '</b>' +
          '<span class="experience-ledger__src">' + e.role.company + '</span>' +
          '<span class="experience-ledger__msg">' + e.text + '</span>' +
        '</li>';
      }).join('');
      logWrap.appendChild(log);
      body.appendChild(logWrap);

      var state = SE.el('aside', 'experience-ledger__state');
      state.setAttribute('role', 'status');
      state.setAttribute('aria-live', 'polite');
      body.appendChild(state);
      wrap.appendChild(body);

      var scrub = SE.el('div', 'experience-ledger__scrub');
      scrub.innerHTML =
        '<canvas class="experience-ledger__density" aria-hidden="true"></canvas>' +
        '<input class="experience-ledger__range" type="range" min="' + SPAN_A + '" max="' + (SPAN_B - 1) +
          '" step="1" value="' + (SPAN_B - 1) + '" aria-label="Replay position in the career">' +
        '<div class="experience-ledger__ticks t-num" aria-hidden="true">' +
          YEARS.map(function (y) {
            return '<i style="--f:' + y.f.toFixed(5) + '">' + y.y + '</i>';
          }).join('') +
        '</div>';
      wrap.appendChild(scrub);

      root.appendChild(wrap);
      root.appendChild(SE.hintStrip('<span>Drag the playhead</span><span>Arrows step a month, Page keys step a year</span>'));

      var range = SE.$('.experience-ledger__range', scrub);
      var densityEl = SE.$('.experience-ledger__density', scrub);
      var rows = SE.$$('.experience-ledger__row', log);

      var cv = SE.canvas(densityEl);
      var cx = cv.ctx;
      var at = SPAN_B - 1;
      var lastCut = -1;

      /* -------------------------------------------------------- density */
      function drawDensity() {
        cv.clear();
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4) return;
        var f = (at - SPAN_A) / SPAN;

        cx.lineWidth = 1;
        YEARS.forEach(function (y) {
          pxLine(cx, Math.round(y.f * w) + 0.5, 0, Math.round(y.f * w) + 0.5, h, 'rgba(236,236,239,0.06)');
        });

        /* One tick per event, height by level. The strip is what gives the
           slider a shape: you can see where the busy years were before you
           have touched it. */
        EVENTS.forEach(function (e) {
          var hh = h * (0.30 + (LEVELS[e.lvl] || 0.5) * 0.62);
          var past = e.m <= at;
          cx.fillStyle = past ? 'rgba(165,130,240,0.85)' : 'rgba(165,130,240,0.16)';
          cx.fillRect(Math.round(e.f * (w - 2)), h - hh, 1.5, hh);
        });

        pxLine(cx, Math.round(f * w) + 0.5, 0, Math.round(f * w) + 0.5, h, 'rgba(255,255,255,0.75)');
      }

      /* ---------------------------------------------------------- state */
      function paint() {
        var m = at;
        var cut = 0;
        for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i].m <= m) cut = i + 1;

        if (cut !== lastCut) {
          rows.forEach(function (li, k) { li.classList.toggle('is-on', k < cut); });
          /* Follow the newest visible line, but only when the cut actually
             moves. Writing scrollTop every input event would fight the user's
             own wheel inside the log. */
          var newest = rows[Math.max(0, cut - 1)];
          if (newest) {
            logWrap.scrollTo({
              top: Math.max(0, newest.offsetTop - logWrap.clientHeight * 0.68),
              behavior: env.reduced ? 'auto' : 'smooth'
            });
          }
          lastCut = cut;
        }

        var live = liveAt(m);
        var rung = live.reduce(function (best, r) { return (!best || r.alt > best.alt) ? r : best; }, null);
        var stack = TECHS.filter(function (t) { return t.m <= m; }).length;
        var shipped = EVENTS.filter(function (e) { return e.lvl === 'SHIP' && e.m <= m; }).length;

        state.innerHTML =
          '<p class="experience-ledger__now t-num">' + mLabel(m) + '</p>' +
          '<dl class="experience-ledger__facts">' +
            '<div><dt>Live</dt><dd>' + (live.length ? live.map(function (r) { return r.company; }).join('<br>') : 'Between roles') + '</dd></div>' +
            '<div><dt>Rung</dt><dd>' + (rung ? rung.rung.label : 'None') + '</dd></div>' +
            '<div><dt>Stack</dt><dd class="t-num">' + SE.pad(stack) + ' in production</dd></div>' +
            '<div><dt>Shipped</dt><dd class="t-num">' + SE.pad(shipped) + ' logged</dd></div>' +
            '<div><dt>Elapsed</dt><dd class="t-num">' + dur(m - SPAN_A + 1) + '</dd></div>' +
          '</dl>';

        range.setAttribute('aria-valuetext', mLabel(m) + ', ' +
          (live.length ? live.map(function (r) { return r.company; }).join(' and ') : 'between roles'));
        drawDensity();
      }

      function onInput() {
        at = M.clamp(parseInt(range.value, 10) || SPAN_A, SPAN_A, SPAN_B - 1);
        paint();
      }
      range.addEventListener('input', onInput);

      /* Clicking a log line moves the playhead to that event, so the log is
         also a way to navigate rather than only a thing being narrated to. */
      log.addEventListener('click', function (e) {
        var li = e.target.closest('[data-i]');
        if (!li) return;
        at = EVENTS[parseInt(li.getAttribute('data-i'), 10)].m;
        range.value = String(at);
        paint();
      });

      cv.observe(function () { drawDensity(); });
      paint();

      return {
        destroy: function () {
          range.removeEventListener('input', onInput);
          cv.destroy();
          root.classList.remove('experience', 'experience-ledger');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A timestamped event stream with a state panel and a playhead',
      philosophy: [
        'A career is a system with a history, and the honest format for a system history is a log: timestamp, level, source, message. Joining is an event. Shipping is an event. Putting a technology into production for the first time is an event.',
        'The playhead turns a static list into a claim you can check. Drag back to Feb 2022 and the state panel tells you the stack was 12 technologies and the rung was "owns a service". Nobody has to take that on trust.',
        'Levels are printed as words, never as colour alone. JOIN, SCOPE, ADOPT, SHIP and LEAVE are text in the row, so the log is readable in greyscale, in a screen reader, and in a screenshot.'
      ],
      hierarchy: [
        '1. The message column. It is the content; everything to its left is metadata.',
        '2. The state panel: the date at `clamp(1.25rem, 2vw, 1.625rem)` tabular, then five labelled facts.',
        '3. The playhead and the density strip along the bottom, which is where the interaction lives.',
        '4. Level and source columns in mono at 10px, fixed width, so the log has a spine.',
        '5. Rows after the playhead at 12% opacity: present as the shape of what is to come, unreadable on purpose.'
      ],
      structure: [
        'Section `id="experience"`, `min-h-[100dvh]`, grid `auto 1fr auto`: heading, body, scrub bar.',
        'Body is a two column grid: the log in its own scroll container at `1fr`, the state panel at `minmax(15rem, 20rem)`.',
        'Each row is a `<li>` with four spans: timestamp, level, source, message. Fixed widths on the first three via a grid template, so the message column starts on the same x for all 50 rows.',
        'The scrub bar layers a decorative `<canvas>` density strip under a real `<input type="range">`, with year numerals below positioned by fraction.'
      ],
      interaction: [
        'PLAYHEAD: the range input runs from month 1 to month 79 with step 1. Dragging it sets the cut; rows at or before it are live, rows after drop to 12% opacity.',
        'Keyboard comes free from the input: Left and Right step one month, PageUp and PageDown step a larger block, Home and End jump to the ends.',
        '`aria-valuetext` is set to "Mar 2023, Ferrymark Logistics and Northsound Studio" on every change, so the value is announced as a date and a situation rather than as the number 38.',
        'The state panel recomputes live roles, highest rung, technologies in production, shipped count and elapsed time from the same event stream. Nothing in it is authored.',
        'Clicking any log row moves the playhead to that event, so the log is navigation as well as narration.'
      ],
      choreography: [
        { n: 'Row state', d: 'opacity 0.12 -> 1 with `translateY(4px) -> 0` over 180ms `cubic-bezier(0.23, 1, 0.32, 1)`, as a CSS transition on a class. A transition and not a keyframe, because a fast drag retargets it dozens of times a second and keyframes would restart from zero every time.' },
        { n: 'Log follow', d: '`scrollTo({ behavior: "smooth" })` to put the newest live row at 68% down the container, fired only when the cut index actually changes. Writing scrollTop on every input event would fight the reader scrolling the log by hand.' },
        { n: 'Density strip', d: 'Redrawn on input and on resize, never on a frame tick. 50 event ticks plus 7 year rules plus a playhead is about 58 operations, which is nothing once and would be wasteful sixty times a second.' },
        { n: 'No ticker at all', d: 'This concept subscribes to no animation loop. A log sitting still must cost zero, and here it genuinely does.' }
      ],
      scroll: [
        'The log has its own scroll container with `overscroll-behavior: contain`, so reaching its end does not chain into the page.',
        'The page itself is not hijacked. There is no pin, no scrub tied to scroll, and no reason for either.',
        'The playhead is deliberately NOT driven by page scroll: scroll position is a reading control, and overloading it with a data control means the reader can no longer do either one precisely.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'Rows: background steps to `--surface` at 180ms and the timestamp goes from 40% to 70% ink. Nothing moves.',
        'The range thumb grows from 14px to 18px tall on hover and 20px while active, on `height` with a 140ms transition. A 2px wide rule has no transform equivalent for getting taller from its own centre.'
      ],
      click: [
        'Clicking a row sets the playhead to that event month and repaints the state panel.',
        'There is no modal, no expansion and no detail view. The row already contains the whole message; hiding half of it behind a click would be theatre.',
        'The range input is 44px tall in hit area even though its visible track is 2px, using a transparent pseudo-element rather than padding, so the layout does not shift.'
      ],
      responsive: {
        desktop: 'Two columns, log left at `1fr`, state panel right at `minmax(15rem, 20rem)`. Row grid `4.5rem 3.5rem 8rem 1fr`. Density strip 44px tall.',
        tablet: 'The source column is dropped from the row grid and folded into the message as a leading bold word. State panel narrows to 14rem.',
        mobile: 'The state panel moves ABOVE the log as a two-row horizontal strip of the five facts, because on a phone the answer must be visible while your thumb is on the slider at the bottom. Rows drop both level and source columns to `3.75rem 1fr`, with the level printed as a leading uppercase word inside the message. The density strip drops to 32px and the range gets a 48px hit area above the safe-area inset.'
      },
      a11y: [
        'The control is a real `<input type="range">`. Keyboard stepping, focus, value announcement and the drag alternative are all native and correct, which no hand-rolled slider gets right on the first attempt.',
        '`aria-valuetext` carries a human sentence, never the raw month index.',
        'The state panel is a `<dl>` inside `role="status" aria-live="polite"`, so a screen reader hears the recomputed state without losing its place in the log.',
        'The log is an `<ol>`, because the order is the meaning.',
        'Rows past the playhead are dimmed with opacity, never removed, so the full history stays in the accessibility tree at all times.',
        'Levels are words. Colour is never the only carrier of the event type.',
        'Under `prefers-reduced-motion: reduce`: the log follow becomes `behavior: "auto"` and the row transition drops to a 120ms opacity change with no translate.'
      ],
      perf: [
        'Zero requestAnimationFrame subscriptions. Every repaint is user-initiated.',
        'A drag across the whole range fires roughly 80 input events; each one is 50 class toggles and one canvas redraw, which measures well under a frame.',
        'Guard the row toggles behind a changed-cut check, so a drag inside one month costs nothing.',
        'Cap the density canvas DPR at 2. It is 44px tall; there is no reason for it to be a 3x surface.',
        '50 rows is small enough to render in full. Past a few hundred events this would need windowing, and the honest note is that a career does not have a few hundred events.'
      ],
      packages: [
        { p: 'none required', w: 'A native range input, a list, and one small canvas. Every slider library here would be a downgrade in accessibility.' },
        { p: 'no virtualiser', w: '50 rows. TanStack Virtual would cost more than the rows it removes.' },
        { p: 'no charting library', w: 'The density strip is 50 `fillRect` calls.' }
      ],
      architecture: [
        { f: 'components/sections/Experience.tsx', r: 'Server Component. Renders all 50 rows so the entire history is crawlable and present without JavaScript.' },
        { f: 'components/experience/LedgerPlayhead.tsx', r: '"use client" leaf: the range input, the density canvas, and the cut index.' },
        { f: 'components/experience/LedgerState.tsx', r: 'Presentational. Takes a month index and the derived state; renders the `<dl>`.' },
        { f: 'lib/experience/events.ts', r: 'Pure: builds and sorts the event stream from roles, and exposes `stateAt(month)` returning live roles, rung, stack size and shipped count. Unit-testable, and the single source of every number the panel prints.' }
      ],
      state: [
        '`month: number` in `useState`. It changes on input, which is user-paced, and it drives real DOM.',
        'The last cut index is a ref, used only to skip work when a drag stays inside one month.',
        'Derived state (`stateAt(month)`) is computed with `useMemo` on `month`. Never stored, because it is a pure function of a value you already have.',
        'The 50 events are built once at module scope, not in a component.'
      ],
      typography: [
        'The entire log is mono, and this is the one place in the whole area where mono for a full line of prose is correct: it is a log, the column alignment is the format, and the timestamps must be tabular.',
        'Timestamps: mono 500 at 10px with `font-variant-numeric: tabular-nums`. Levels: mono 700 at 9px, `0.18em` tracking, uppercase.',
        'Messages: mono 400 at 0.8125rem, `line-height: 1.55`. Cap the container at 92ch; a log line that wraps four times stops being a log line.',
        'The state panel breaks out of mono for its labels and rung name, in the display face, so the panel reads as commentary on the log rather than as more log.'
      ],
      color: [
        'One hue at three alphas: 85% for a past event tick, 16% for a future one, 100% for the level word on a live row.',
        'Levels are distinguished by the word and by tick height, never by five different hues. Five hues here would be five meanings the reader has to memorise.',
        'The playhead is the only pure white in the composition, at 75%.',
        'In light mode: future ticks rise from 16% to 26% and the row dim goes from 0.12 to 0.3, because dimming toward white loses far more legibility than dimming toward black.'
      ],
      spacing: [
        'Row height 26px on a 13px mono baseline. Tight on purpose: density is what makes a log read as a record.',
        'Row grid `4.5rem 3.5rem 8rem 1fr` with a 0.75rem gap. Fixed columns, so the message column starts on the same x for all 50 rows.',
        'The scrub bar is 44px of density strip plus a 20px year rail, pinned to the bottom of the section with `clamp(1rem, 3vh, 2rem)` of clearance.'
      ],
      relationships: [
        'Horizontal position in the density strip encodes date. Tick height encodes level. Opacity encodes past versus future. Three signals, three meanings.',
        'The state panel encodes accumulation directly: the stack count only ever rises as you drag forward, which is the argument this whole area is making, expressed as a number that changes in front of you.',
        'The "Live" field is the only place in this concept where concurrency appears, and it appears as two company names on two lines. That is enough; the overlap concept is where the chart lives.',
        'Nothing encodes importance. Every event has the same weight in the log, which is what stops it becoming a highlight reel.'
      ],
      acceptance: [
        'Dragging the playhead from the right edge to Feb 2022 rewinds the log and drops the stack count to its correct value for that month.',
        'The state panel and the log never disagree: the newest live row is always the last event at or before the playhead.',
        'Tabbing to the slider and pressing Left and Right steps one month at a time and announces the new date and situation.',
        'Scrolling the log by hand is not fought by the auto-follow unless the playhead actually moves.',
        'At 390px the state panel is above the log and the slider has a 48px hit area.',
        'With reduced motion on, rows change state with no translate and the log jumps rather than smooth-scrolls.'
      ]
    }
  });

  /* ==========================================================================
     SECTION MACHINERY
     --------------------------------------------------------------------------
     The five concepts below live inside somebody else's scrolling page. They
     consume scroll, they never trap it, and every one of them exposes its own
     exit through ctx.onSeeMore(). Nothing here is page-specific; it is the
     bookkeeping that stops five destroy() functions each forgetting a
     different listener.
     ======================================================================== */

  /* Teardown bag. Register on the way in, unwind in reverse on the way out.
     Ten hand-written teardowns is how a gallery leaks a ticker subscription
     per open, and SE.ticker.count() is the number that catches it. */
  function bag() {
    var fns = [];
    return {
      on: function (t, type, fn, opts) {
        t.addEventListener(type, fn, opts);
        fns.push(function () { t.removeEventListener(type, fn, opts); });
      },
      tick: function (fn) {
        SE.ticker.add(fn);
        fns.push(function () { SE.ticker.remove(fn); });
        return fn;
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

  /* Reveal on entry, once, then stop watching. No scroll listener, and no
     rAF loop for a state that changes at most five times in a section. */
  function revealOnce(b, scroller, nodes, threshold) {
    if (SE.env.reduced || typeof IntersectionObserver === 'undefined') {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return null;
    }
    var io = b.obs(new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { root: scroller, threshold: threshold || 0.14 }));
    nodes.forEach(function (n) { io.observe(n); });
    return io;
  }

  /* A section pinned to one screen has a hard height budget, and the budget
     is the SCROLLER's height, not the window's: inside this shell the two
     differ by the stage chrome, and on a laptop that difference is the
     140px that decides whether a panel fits. A `@media (max-height)` query
     would be measuring the wrong box, so the three rail concepts read the
     scroller and shed content through two classes instead. */
  function shortWatch(b, root, scroller, px) {
    function check() {
      var h = scroller ? scroller.clientHeight : window.innerHeight;
      root.classList.toggle('is-short', h < px);
      root.classList.toggle('is-tiny', h < px - 90);
    }
    if (scroller && typeof ResizeObserver !== 'undefined') {
      b.obs(new ResizeObserver(check)).observe(scroller);
    }
    check();
  }

  /* Every section names the same three numbers, so they live in one string
     rather than in five slightly different sentences. */
  function summaryLine() {
    return SUMMARY.calendar + ' months of calendar, ' + SUMMARY.role +
           ' months of role, ' + SUMMARY.doubled + ' of them doubled.';
  }

  /* ==========================================================================
     SECTION 01  -  AXIS
     --------------------------------------------------------------------------
     The compact teaser for OVERLAP. One horizontal rule, seven year marks,
     and five roles reduced to brackets sitting on the axis - three above it,
     two below, from the same greedy packing the page concept uses. A sweep
     line crosses as the reader scrolls and each bracket resolves as its start
     date passes under it.

     WHY A BRACKET AND NOT A BAR
     ---------------------------
     A bar is a quantity. A bracket is a span with two dates on it, which is
     what a role actually is, and it survives being 140px wide in a section
     band a third the height of the page concept. The page gets bars because
     the page has room for them.

     SCROLL BUDGET: 2.2 screens. One screen of sticky viewport plus 1.2
     screens of travel, which is the whole axis. It holds for slightly longer
     than it takes to read the heading and then it lets go.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'experience-section-axis',
    num: 1,
    pageOf: 'experience-page-overlap',
    screens: 2.2,
    name: 'Axis',
    kind: 'DOM / swept time axis',
    accent: '#3FA9E0',
    tagline: 'Six years compressed onto one rule',
    desc: 'Five roles as brackets on a single month axis, three above the rule and two below. ' +
          'Scroll sweeps a read line across it and each role resolves as its start date passes.',
    interaction: 'Scroll to move the sweep. Hover or focus a bracket to hold the readout on that role; click one to open the full grid.',
    hint: 'Scroll sweeps the axis &middot; Click a bracket',

    /* Miniature: the axis, two concurrency windows, five brackets and the
       sweep. Twenty four draw operations, no randomness at all, so the card
       is identical on every reload without needing a seed. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.07;
      var iw = w - padX * 2;
      var axis = Math.round(h * 0.52) + 0.5;
      /* The whole drawing lives in a band around the rule. Spreading it over
         the full card height would turn five 1px brackets into five boxes. */
      var cap = h * 0.115;
      var bandT = axis - cap * 1.7;
      var bandH = cap * 3.4;
      var i;

      ctx.lineWidth = 1;
      for (i = 0; i < YEARS.length; i += 2) {
        var gx = Math.round(padX + YEARS[i].f * iw) + 0.5;
        pxLine(ctx, gx, bandT, gx, bandT + bandH, 'rgba(236,236,239,0.07)');
      }

      var mf = M.clamp((t * 0.15) % 1.3, 0, 1);

      OVERLAPS.forEach(function (o) {
        if (o.f0 > mf) return;
        bar(ctx, padX + o.f0 * iw, bandT, (Math.min(o.f1, mf) - o.f0) * iw, bandH,
          'rgba(63,169,224,' + (0.08 + heat * 0.05).toFixed(3) + ')');
      });

      pxLine(ctx, padX, axis, w - padX, axis, 'rgba(236,236,239,0.18)');

      /* The span carries the data and the two caps only terminate it, so the
         caps are drawn at half the alpha and half the weight. Equal weight
         is what turns a bracket into a box at card scale. */
      ROLES.forEach(function (r) {
        var x0 = padX + r.f0 * iw;
        var x1 = padX + Math.min(r.f1, Math.max(r.f0, mf)) * iw;
        if (x1 - x0 < 1) return;
        var y = Math.round(axis + ((r.track % 2) === 0 ? -cap : cap)) + 0.5;
        var a = (mf >= r.f0 && mf < r.f1) ? 0.95 : 0.42 + heat * 0.2;
        ctx.lineWidth = 1.6;
        pxLine(ctx, x0, y, x1, y, 'rgba(63,169,224,' + a.toFixed(3) + ')');
        ctx.lineWidth = 1;
        var c = 'rgba(63,169,224,' + (a * 0.45).toFixed(3) + ')';
        pxLine(ctx, Math.round(x0) + 0.5, y, Math.round(x0) + 0.5, axis, c);
        pxLine(ctx, Math.round(x1) + 0.5, y, Math.round(x1) + 0.5, axis, c);
      });

      var mx = Math.round(padX + mf * iw) + 0.5;
      pxLine(ctx, mx, bandT - cap * 0.9, mx, bandT + bandH + cap * 0.9, 'rgba(255,255,255,0.7)');
      ctx.fillStyle = '#fff';
      ctx.fillRect(mx - 1.5, bandT - cap * 0.9, 3, 3);
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var b = bag();

      root.classList.add('experience-sec', 'experience-axis');
      tint(root, '#3FA9E0');

      /* ------------------------------------------------------------- DOM */
      var rail = b.rail(SE.scrollRail(ctx.scroller, 2.2));
      var stage = SE.el('div', 'experience-axis__stage');
      rail.sticky.appendChild(stage);
      root.appendChild(rail.rail);

      var head = SE.el('div', 'experience-axis__head');
      head.innerHTML =
        '<h2 class="experience-sec__title">' + SUMMARY.calendar + ' months, and ' +
          SUMMARY.doubled + ' of them counted twice</h2>' +
        '<p class="experience-sec__lede">Five roles on one axis. Length is duration, and the two ' +
          'places where the line doubles are the months when two jobs ran at once.</p>';
      stage.appendChild(head);

      var plot = SE.el('div', 'experience-axis__plot');
      var field = SE.el('div', 'experience-axis__field');

      /* Reference geometry: written once, never touched again. A chart whose
         reference marks move is a chart you cannot read. */
      var grid = SE.el('div', 'experience-axis__grid');
      grid.setAttribute('aria-hidden', 'true');
      grid.innerHTML =
        OVERLAPS.map(function (o, i) {
          return '<b class="experience-axis__band" data-band="' + i + '" style="--f0:' +
                 o.f0.toFixed(5) + ';--f1:' + o.f1.toFixed(5) + '"></b>';
        }).join('') +
        YEARS.map(function (y) {
          return '<i class="experience-axis__year" style="--f:' + y.f.toFixed(5) +
                 '"><em class="t-num">' + y.y + '</em></i>';
        }).join('') +
        '<i class="experience-axis__rule"></i>';
      field.appendChild(grid);

      var marksWrap = SE.el('div', 'experience-axis__marks');
      var marks = ROLES.map(function (r, i) {
        var el = SE.el('button', 'experience-axis__mark');
        el.type = 'button';
        el.style.setProperty('--f0', r.f0.toFixed(5));
        el.style.setProperty('--f1', r.f1.toFixed(5));
        el.setAttribute('data-side', String(r.track % 2));
        if (i === ROLES.length - 1) el.setAttribute('data-last', '1');
        el.setAttribute('aria-label',
          r.company + ', ' + r.title + ', ' + r.range + ', ' + r.durLabel + '. Opens the full grid.');
        el.innerHTML =
          '<i class="experience-axis__span" aria-hidden="true"></i>' +
          '<span class="experience-axis__tag">' +
            '<b class="experience-axis__co">' + r.company + '</b>' +
            '<em class="experience-axis__dt t-num">' + r.rangeShort + '</em>' +
          '</span>';
        marksWrap.appendChild(el);
        return { el: el, r: r };
      });
      field.appendChild(marksWrap);
      plot.appendChild(field);

      var sweep = SE.el('div', 'experience-axis__sweep');
      sweep.setAttribute('aria-hidden', 'true');
      plot.appendChild(sweep);
      stage.appendChild(plot);

      var read = SE.el('p', 'experience-axis__read');
      read.setAttribute('role', 'status');
      read.setAttribute('aria-live', 'polite');
      stage.appendChild(read);

      /* The exit is available for the whole hold. A reader convinced by the
         first bracket should not have to scroll past four more to find it. */
      var more = SE.seeMore('See the full grid', ctx.onSeeMore);
      more.classList.add('experience-axis__more', 'is-on');
      stage.appendChild(more);

      /* ----------------------------------------------------------- state */
      var bands = SE.$$('.experience-axis__band', grid);
      var progress = 0, f = -1, hold = null, lastMonth = -1;
      var vertical = false, boxW = 0, boxH = 0;

      /* The orientation flip is a class, not a media query, so the CSS and
         the sweep transform can never disagree about which axis time runs
         on. It reads the section's own width rather than SE.env.mobile,
         which is only refreshed on a media-query change. */
      function measure() {
        var rect = plot.getBoundingClientRect();
        boxW = rect.width;
        boxH = rect.height;
        vertical = root.getBoundingClientRect().width < 768;
        root.classList.toggle('is-vertical', vertical);
      }

      function place() {
        if (vertical) sweep.style.transform = 'translate3d(0,' + (f * boxH).toFixed(2) + 'px,0)';
        else sweep.style.transform = 'translate3d(' + (f * boxW).toFixed(2) + 'px,0,0)';
      }

      /* Rewritten only when the rounded month changes: at most 79 times
         across the whole sweep, not sixty times a second. */
      function narrate() {
        var m = M.clamp(SPAN_A + Math.round(f * SPAN), SPAN_A, SPAN_B - 1);
        if (m === lastMonth) return;
        lastMonth = m;
        var live = liveAt(m);
        read.innerHTML =
          '<b class="t-num">' + mLabel(m) + '</b>' +
          '<span>' + (live.length
            ? live.map(function (r) { return r.company; }).join(' + ')
            : 'Between roles') + '</span>' +
          '<em class="t-num">' + live.length + (live.length === 1 ? ' role live' : ' roles live') + '</em>';
        /* Under reduced motion every bracket is already resolved. The sweep
           still moves and still names what it crosses, but nothing is
           hidden waiting to be revealed. */
        marks.forEach(function (mk) {
          mk.el.classList.toggle('is-lit', env.reduced || f >= mk.r.f0 - 0.0005);
          mk.el.classList.toggle('is-live', live.indexOf(mk.r) !== -1);
        });
        bands.forEach(function (bd, i) {
          bd.classList.toggle('is-lit', env.reduced || f >= OVERLAPS[i].f0);
        });
      }

      /* ----------------------------------------------------- interaction */
      /* Hover and focus park the sweep on a role instead of selecting it.
         Scroll owns the base value; the hold is an override that expires. */
      marks.forEach(function (mk) {
        var mid = (mk.r.f0 + mk.r.f1) / 2;
        b.on(mk.el, 'pointerenter', function () { hold = mid; });
        b.on(mk.el, 'pointerleave', function () { hold = null; });
        b.on(mk.el, 'focus', function () { hold = mid; });
        b.on(mk.el, 'blur', function () { hold = null; });
        b.on(mk.el, 'click', function () { ctx.onSeeMore(); });
      });

      /* The sweep finishes at 82% of the rail, not at 100%. The last 18% is
         the release: the completed axis has to be readable for a beat while
         the section is still fully on screen, otherwise the payoff happens
         behind the reader's own scroll. */
      b.kill(SE.scrub(ctx.scroller, rail.rail, function (p) {
        progress = M.clamp(p / 0.82, 0, 1);
      }));

      /* ------------------------------------------------------------ tick */
      b.tick(function (dt) {
        var target = hold == null ? progress : hold;
        /* lambda 11 is about 90ms to 63%. ScrollTrigger already smooths the
           scrub at 0.6; this second stage is what keeps the sweep steady on
           the passive-listener fallback, where the input is raw. */
        var next = env.reduced ? target : M.damp(f, target, 11, dt);
        if (Math.abs(next - f) < 0.00006) return;
        f = next;
        place();
        narrate();
      });

      if (typeof ResizeObserver !== 'undefined') {
        b.obs(new ResizeObserver(function () { measure(); place(); }))
          .observe(plot);
      }
      shortWatch(b, root, ctx.scroller, 620);
      measure();
      f = 0;
      place();
      narrate();

      revealOnce(b, ctx.scroller, [head, read, more], 0.1);
      if (env.reduced) [head, read, more].forEach(function (n) { n.classList.add('is-in'); });

      return {
        destroy: function () {
          b.all();
          root.classList.remove('experience-sec', 'experience-axis', 'is-vertical', 'is-short', 'is-tiny');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'A single month axis with five roles on it, swept by scroll.',
      philosophy: [
        'A section has one claim to make, and this one makes the claim the page concept spends a whole viewport on: two of these ran at the same time. Everything else is annotation.',
        'The axis is the argument. Length is duration, horizontal position is date, and nothing else in the composition is allowed to encode either, so the eye can trust the one signal it has.',
        'Roles are brackets, not bars. A bar is a quantity; a bracket is a span with a start and an end, which is what a role is, and it stays legible at a third of the page concept height.',
        'The reader must be able to leave. The section is 2.2 viewports, the exit is visible for all of it, and scrolling straight through at full speed lands cleanly in whatever comes next.'
      ],
      hierarchy: [
        '1. The five brackets. 1px accent hairlines with 10px end caps sitting on the axis rule.',
        '2. The axis rule itself, 1px at --line-2 (16% ink), running the full width.',
        '3. The sweep, 1px at 62% white with a 3x3px cap. The only pure white in the section.',
        '4. The heading at clamp(1.375rem, 2.8vw, 2.25rem), which states the two numbers the axis then proves.',
        '5. The readout under the axis: month in accent mono at 11px, live companies at 13px --ink-2, count right-aligned in --ink-3.',
        '6. Year rules at 6% ink with their numeral at 10px --ink-4. Reference, never structure.'
      ],
      structure: [
        'Section root is ordinary block flow. It lives inside somebody else\'s page and must never be absolutely positioned.',
        'One over-tall rail (2.2 x viewport) containing a `position: sticky; top: 0` viewport of exactly one screen. Sticky rather than ScrollTrigger `pin: true`: pinning injects a pin-spacer and rewrites layout, which is fragile inside a nested scroller.',
        'Sticky child is a CSS grid `auto minmax(0, 1fr) auto auto` for heading, plot, readout, exit.',
        'The plot holds two absolute layers: a static grid (year rules, two concurrency bands, the axis rule) and a marks layer of five `<button>` elements positioned by `left: calc(var(--f0) * 100%)` and `width: calc((var(--f1) - var(--f0)) * 100%)`.',
        'The sweep is a sibling of both layers, moved only by transform.'
      ],
      interaction: [
        'SCROLL: the rail\'s pass through the scroller yields 0..1. ScrollTrigger with `scrub: 0.6` when it is present, a passive listener on the scroller when it is not.',
        'The rendered fraction damps toward that value with lambda 11 (about 90ms to 63%), which is what keeps the sweep steady on the un-smoothed fallback path.',
        'HOVER / FOCUS: entering a bracket parks the sweep at the midpoint of that role, `(f0 + f1) / 2`. Leaving releases it back to scroll position. The hold is an override, never a mode.',
        'CLICK: any bracket opens the full grid. There is no selection state in a section; a section that accumulates state is a page in disguise.',
        'READOUT: recomputed only when the rounded month index changes, at most 79 times across the whole sweep. It names every live role joined with a plus and prints the count.'
      ],
      choreography: [
        { n: 'Bracket resolve', d: '`clip-path: inset(0 100% 0 0)` to `inset(0 0 0 0)` over 560ms `cubic-bezier(0.23, 1, 0.32, 1)`, plus `opacity 0 -> 1` over 300ms. clip-path rather than scaleX so the two 1px end caps stay exactly 1px instead of being stretched to 3px at the start of the growth. Fired once per bracket, when the sweep crosses its start month.' },
        { n: 'Bracket label', d: 'A separate element: `opacity 0 -> 1` with `translateY(6px) -> 0` (upward for the marks above the rule, downward for the two below), 420ms `cubic-bezier(0.23, 1, 0.32, 1)`, 90ms after the bracket. Type is never inside a scaled or clipped box.' },
        { n: 'Live state', d: 'A bracket whose span contains the sweep month gets `is-live`: border-color to 100% accent, fill to the 13% accent wash, company ink to the accent. 180ms `ease`, because this is feedback and feedback stays under 200ms.' },
        { n: 'Sweep', d: 'Exponential damp lambda 11 on one 0..1 scalar, written as `translate3d(Xpx,0,0)` directly on the sweep element. Never as a custom property on the parent, which would restyle every bracket in the subtree each frame.' },
        { n: 'Concurrency band', d: '`opacity 0 -> 1` over 420ms `cubic-bezier(0.23, 1, 0.32, 1)` when the sweep reaches its first month. Geometry never animates; only the reveal does.' },
        { n: 'What does NOT animate', d: 'The axis rule, the year rules and the year numerals. They are written once at mount and are the fixed frame the moving parts are measured against.' }
      ],
      scroll: [
        'Budget: 2.2 viewports. One is the sticky viewport, 1.2 is the travel, which is exactly the length of the axis. Nothing is held for longer than it takes to cross it once.',
        'No wheel handler, no snap, no hijack. The reader can scroll straight through at any speed and arrives at the next section with momentum intact.',
        'No `window.addEventListener("scroll")` anywhere. Scroll position comes from ScrollTrigger or a passive listener on the section scroller; the entry reveal is an IntersectionObserver that unobserves each node after it fires.',
        'One ticker subscription, removed in destroy. Per frame it is one comparison when the value has settled.'
      ],
      hover: [
        'Gated behind `@media (hover: hover) and (pointer: fine)`.',
        'Bracket hover: the sweep parks on that role, the company ink steps from --ink to the accent, and the bracket border goes to 100% accent. Nothing translates, because the bracket position IS the data.',
        'The readout follows the hold, so hovering a bracket and reading the month underneath always agree.'
      ],
      click: [
        'Every bracket is a link into the page-level grid, and so is the "See the full grid" button.',
        'The button carries `is-on` from mount rather than being earned at 80% progress. A section that hides its own exit until the reader has consumed all of it is holding them hostage.'
      ],
      responsive: {
        desktop: 'Horizontal axis at 58% of the plot height. Three brackets above the rule, two below, from the same greedy interval packing the page concept uses. Plot 11rem to 16rem tall.',
        tablet: 'Identical geometry. The heading drops to clamp(1.375rem, 3.4vw, 1.875rem) and the bracket labels lose the date line below 900px, keeping the company name.',
        mobile: 'Below 768px the axis rotates. Time runs top to bottom over 26rem, year numerals sit on a 3rem left rail, and the two packed tracks become two 10px columns at x=0 and x=1.25rem. Labels for track 0 set from the left at 2.75rem; the single track 1 role sets right-aligned against the far edge, so a 4-month gap in start dates cannot collide. The sweep becomes a horizontal rule moved on Y. The flip is driven by a class from a ResizeObserver on the section width, not a media query, so the CSS and the transform axis can never disagree.'
      },
      a11y: [
        'Every bracket is a real `<button>` with an `aria-label` reading "Ferrymark Logistics, Full-stack Engineer, Sep 2021 - Mar 2023, 1 yr 7 mo. Opens the full grid." No hidden mirror list is needed because the axis is already DOM.',
        'Focus does what hover does: parks the sweep on that role. Keyboard parity with the pointer is complete without a separate affordance, which satisfies WCAG 2.2 dragging movements.',
        'The readout is `role="status" aria-live="polite"`, so the sweep is narrated without stealing focus, and only when the month actually changes.',
        'Dates and durations use `font-variant-numeric: tabular-nums`, so a label never shifts by a pixel as the sweep moves.',
        'Under `prefers-reduced-motion: reduce`: every bracket is already resolved at mount, the sweep jumps to the scroll position rather than damping, the entry reveal does not run, and the composition is identical.'
      ],
      perf: [
        'Per frame: one transform write, and only when the damped value actually moved by more than 6e-5.',
        'About 30 DOM nodes. No canvas, no DPR handling, no hit testing.',
        'Geometry is percentages, so a resize costs zero JavaScript. One ResizeObserver drives only the orientation flip and the sweep re-measure.',
        'clip-path and border-color changes are discrete state changes fired once per bracket, never per frame.'
      ],
      packages: [
        { p: 'gsap + ScrollTrigger (installed)', w: 'Only for the scrub. `scrub: 0.6` gives the sweep its smoothing for free. Degrade to a passive scroll listener and a slightly stiffer damp if it is absent; the feature still works.' },
        { p: 'lenis (installed)', w: 'Optional. It makes the sweep feel better because it makes all scrolling feel better, not because this section needs it.' },
        { p: 'no charting library', w: 'The entire scale is `(m - start) / span`. A charting library would ship 90kb to draw one rule and five brackets and would fight you over tabular figures.' }
      ],
      architecture: [
        { f: 'components/sections/ExperienceAxis.tsx', r: 'Server Component. Renders the axis, all five brackets and every label, so the history is crawlable and present before hydration.' },
        { f: 'components/experience/AxisSweep.tsx', r: '"use client" leaf. Owns the scrub subscription, the damped scalar, the hold override and the readout. Renders only the sweep and the status line.' },
        { f: 'app/experience/page.tsx', r: 'The "See more" destination. Build it: the section is a teaser and a teaser that leads nowhere is a dead end.' },
        { f: 'lib/experience/timeline.ts', r: 'Pure: `monthIndex()`, `label()`, `dur()`, `overlaps()`, `packTracks()`. Shared with every other experience concept.' }
      ],
      state: [
        'Nothing in this section belongs in `useState`. There is no selection and no open panel.',
        'The scrub progress, the damped fraction, the hold override and the last narrated month are all refs. A 0..1 value in state is sixty React renders a second.',
        'The lit and live sets are derived from the month index inside the loop and written with `classList.toggle`, never stored.'
      ],
      typography: [
        'Heading: display face 500 at clamp(1.375rem, 2.8vw, 2.25rem), line-height 1.0, -0.035em, balanced.',
        'Company: display 500 at 0.8125rem, -0.015em.',
        'Dates: mono 10px with tabular-nums, --ink-3. Year numerals: mono 10px, --ink-4, 0.14em tracking.',
        'Readout month: mono 11px, 0.14em tracking, uppercase, in the accent. Mono is for the data here and nowhere else.'
      ],
      color: [
        'One hue at four alphas: 100% for a live bracket, 42% for a resolved one, 13% for the live fill, 5.5% for the concurrency band.',
        'Ground is --void. The axis rule and year rules are neutral ink, never the accent, because a reference mark must not compete with a data mark.',
        'Prose sits on --ink-2 (7.2:1) and quiet labels on --ink-4 (4.7:1). Nothing informational is drawn below AA.',
        'In light mode: raise every accent alpha by about 1.4x and drop the concurrency band to 4%, because thin washes vanish on white.'
      ],
      spacing: [
        'Sticky viewport padding clamp(2.5rem, 8vh, 5rem) block, var(--pad) inline, matching the area gutter token.',
        'Plot 11rem minimum, 16rem maximum. Above 16rem the brackets stop reading as marks on a rule and start reading as a chart, which is the page concept\'s job.',
        'Bracket 10px tall with its label 14px clear of the cap. Grid gap clamp(1rem, 2.4vh, 2rem).'
      ],
      relationships: [
        'Horizontal position encodes date. Bracket length encodes duration. Those are the only two spatial encodings in the section.',
        'Which side of the rule a bracket sits on encodes nothing but the packing, and that is deliberate: if the side also encoded seniority the axis would be making two claims at once.',
        'The concurrency band is the intersection of two spans, derived rather than authored, so it cannot drift out of sync with the brackets.',
        'The live count is the axis summarising itself in one integer, which is the whole reason the sweep exists.'
      ],
      acceptance: [
        'Scrolling through the section moves the sweep from the first month to the last exactly once, with no stepping, and every bracket is resolved by the time the section releases.',
        'The two concurrency bands sit exactly under the months where two brackets overlap, at any width.',
        'Tab reaches all five brackets; focusing one parks the sweep on it and announces the month; Enter opens the full grid.',
        'Scrolling past at full speed leaves the reader in the next section with no residue: no fixed element, no locked scroll, no ticker still running.',
        'At 390px time runs vertically over 26rem with two packed columns, and there is no horizontal overflow anywhere.',
        'With reduced motion on, every bracket is resolved at mount and the sweep jumps rather than damps.'
      ]
    }
  });

  /* ==========================================================================
     SECTION 02  -  ASCENT
     --------------------------------------------------------------------------
     ALTITUDE's argument, rotated. Time runs down the section and
     responsibility runs across it, so scrolling IS climbing. The whole route
     is present from the first frame as an unresolved ghost, wobbling by two
     pixels; the scrub draws the real line over it and each plateau resolves
     as the pen reaches it.

     WHY THE GHOST IS THERE
     ----------------------
     A path that draws into empty space asks the reader to scroll on faith. A
     path that draws over a visible route tells them how far there is to go
     and what shape it is, which is the only honest way to ask somebody to
     keep scrolling. The wobble is seeded, so the ghost is identical on every
     reload; it is the difference between "not drawn yet" and "not decided
     yet", and it is what makes the resolve read as a resolve.

     THE SECOND LINE
     ---------------
     Northsound is drawn dashed, at rung one, for the twenty four months it
     ran alongside a rung two and a rung three job. It sits to the LEFT of the
     main line for that whole stretch, which is the entire point of this
     family: a career chart that only ever rises is a chart nobody believes.

     SCROLL BUDGET: 2.8 screens. One screen of sticky viewport and 1.8 of
     travel, of which the pen uses the first 84% and the last 16% is release.
     ======================================================================== */

  /* The route, resampled at a fixed 72 steps with a seeded two pixel wobble.
     Solved once at module scope: the preview runs on the shared ticker and
     must never build a polyline sixty times a second. */
  var GHOST = (function buildGhost() {
    var rnd = SE.rng(0x5A17);
    var pts = [];
    var N = 72;
    for (var i = 0; i <= N; i++) {
      var f = i / N;
      var x = APATH[0].y;
      for (var k = 0; k < APATH.length - 1; k++) {
        var a = APATH[k], b = APATH[k + 1];
        if (f >= a.f && f <= b.f) {
          var d = b.f - a.f;
          x = d < 1e-6 ? b.y : a.y + (b.y - a.y) * ((f - a.f) / d);
          break;
        }
        if (f > b.f) x = b.y;
      }
      pts.push({ f: f, x: x, w: (rnd() - 0.5) * 2 });
    }
    return pts;
  })();

  var CONTRACT = ROLES.filter(function (r) { return !r.primary; })[0];

  /* Walk the plateau path from the top down to `stop`, interpolating the
     segment the pen is standing on. Shared by the preview and the concept so
     the miniature and the real thing cannot draw different routes. */
  function strokeClimb(c, stop, X, Y) {
    var started = false;
    c.beginPath();
    for (var i = 0; i < APATH.length; i++) {
      var p = APATH[i];
      if (p.f > stop) {
        var q = APATH[i - 1];
        if (q) {
          var d = p.f - q.f;
          var t = d < 1e-6 ? 0 : (stop - q.f) / d;
          c.lineTo(X(q.y + (p.y - q.y) * t), Y(stop));
        }
        break;
      }
      if (!started) { c.moveTo(X(p.y), Y(p.f)); started = true; }
      else c.lineTo(X(p.y), Y(p.f));
    }
    c.stroke();
  }

  SE.register({
    area: AREA,
    variant: 'section',
    id: 'experience-section-ascent',
    num: 2,
    pageOf: 'experience-page-altitude',
    screens: 2.8,
    name: 'Ascent',
    kind: 'Canvas + DOM / scrubbed climb',
    accent: '#3FD1A0',
    tagline: 'Scrolling down is climbing up',
    desc: 'Time runs down the section and responsibility runs across it, so the route is a climb the reader ' +
          'performs. The whole path is present as a ghost and resolves plateau by plateau as the pen passes.',
    interaction: 'Scroll to draw the line. Hover a plateau to hold the pen there. The dashed line is the contract, drawn at the rung it actually occupied.',
    hint: 'Scroll draws the climb &middot; The dashed line runs below it',

    /* Miniature: rung guides, the ghost route, the drawn route, the dashed
       contract, five plateau dots and the pen. Fourteen strokes. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.16, padY = h * 0.1;
      var iw = w - padX * 2, ih = h - padY * 2;
      function X(a) { return padX + a * iw; }
      function Y(f) { return padY + f * ih; }
      var i;

      ctx.lineWidth = 1;
      for (i = 0; i < LADDER.length; i++) {
        var gx = Math.round(X((i + 0.5) / LADDER.length)) + 0.5;
        pxLine(ctx, gx, padY, gx, h - padY, 'rgba(236,236,239,0.05)');
      }

      var pen = M.clamp((t * 0.13) % 1.28, 0, 1);

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(63,209,160,' + (0.17 + heat * 0.08).toFixed(3) + ')';
      ctx.beginPath();
      for (i = 0; i < GHOST.length; i++) {
        var g = GHOST[i];
        var gx2 = X(g.x) + g.w * 2;
        if (i === 0) ctx.moveTo(gx2, Y(g.f)); else ctx.lineTo(gx2, Y(g.f));
      }
      ctx.stroke();

      ctx.setLineDash([2.5, 2.5]);
      ctx.strokeStyle = 'rgba(63,209,160,' + (CONTRACT.f0 < pen ? 0.68 : 0.12).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(X(0.125), Y(CONTRACT.f0));
      ctx.lineTo(X(0.125), Y(Math.min(CONTRACT.f1, Math.max(CONTRACT.f0, pen))));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.lineWidth = 1.6;
      ctx.strokeStyle = 'rgba(63,209,160,0.95)';
      strokeClimb(ctx, pen, X, Y);

      ctx.lineWidth = 1;
      for (i = 0; i < APATH.length; i += 2) {
        var p = APATH[i];
        ctx.fillStyle = p.f <= pen ? 'rgba(63,209,160,0.95)' : 'rgba(63,209,160,0.18)';
        ctx.fillRect(X(p.y) - 1.5, Y(p.f) - 1.5, 3, 3);
      }

      var py = Math.round(Y(pen)) + 0.5;
      pxLine(ctx, padX * 0.4, py, w - padX * 0.4, py, 'rgba(255,255,255,0.5)');
      ctx.fillStyle = '#fff';
      ctx.fillRect(padX * 0.4, py - 1.5, 3, 3);
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var b = bag();

      root.classList.add('experience-sec', 'experience-ascent');
      tint(root, '#3FD1A0');

      /* ------------------------------------------------------------- DOM */
      var rail = b.rail(SE.scrollRail(ctx.scroller, 2.8));
      var stage = SE.el('div', 'experience-ascent__stage');
      rail.sticky.appendChild(stage);
      root.appendChild(rail.rail);

      var head = SE.el('div', 'experience-ascent__head');
      head.innerHTML =
        '<h2 class="experience-sec__title">One of these lines goes down</h2>' +
        '<p class="experience-sec__lede">Responsibility across, time down. Four rungs, five roles, and a ' +
          'two year contract taken deliberately below the day job it ran beside.</p>';
      stage.appendChild(head);

      var plot = SE.el('div', 'experience-ascent__plot');

      var rungs = SE.el('div', 'experience-ascent__rungs');
      rungs.setAttribute('aria-hidden', 'true');
      rungs.innerHTML = LADDER.map(function (l) {
        return '<i class="experience-ascent__rung" style="--x:' +
               ((l.n - 0.5) / LADDER.length).toFixed(4) + '">' +
               '<b class="t-num">' + l.n + '</b><em>' + l.label + '</em></i>';
      }).join('');
      plot.appendChild(rungs);

      var field = SE.el('div', 'experience-ascent__field');
      var canvasEl = SE.el('canvas', 'experience-ascent__canvas');
      canvasEl.setAttribute('aria-hidden', 'true');
      field.appendChild(canvasEl);

      /* The plateau labels are DOM, not canvas text: they carry dates, and a
         date drawn on a canvas cannot use tabular figures, cannot be selected
         and cannot be found by a browser search. The canvas draws geometry
         only. */
      var labelWrap = SE.el('div', 'experience-ascent__labels');
      labelWrap.setAttribute('aria-hidden', 'true');
      var labels = ROLES.map(function (r) {
        var el = SE.el('span', 'experience-ascent__label');
        el.style.setProperty('--f', r.f0.toFixed(5));
        /* --f1 is only read by the mobile composition, where the contract
           label centres on its own run instead of hanging off its start. */
        el.style.setProperty('--f1', r.f1.toFixed(5));
        el.style.setProperty('--x', ((r.alt - 0.5) / LADDER.length).toFixed(4));
        el.setAttribute('data-role', r.id);
        if (r.alt >= 4) el.setAttribute('data-flip', '1');
        if (!r.primary) el.setAttribute('data-aside', '1');
        el.innerHTML =
          '<b class="experience-ascent__co">' + r.company + '</b>' +
          '<em class="experience-ascent__rl">' + r.rung.label + '</em>' +
          '<em class="experience-ascent__dt t-num">' + r.rangeShort + '</em>';
        labelWrap.appendChild(el);
        return { el: el, r: r };
      });
      field.appendChild(labelWrap);

      var pen = SE.el('div', 'experience-ascent__pen', '<em class="t-num"></em>');
      pen.setAttribute('aria-hidden', 'true');
      field.appendChild(pen);
      plot.appendChild(field);
      stage.appendChild(plot);

      /* Below 768px the five labels live in one 262px column, and the two
         that start four months apart cannot both fit beside their own y. So
         on mobile the contract leaves the plot and becomes a key: the dashed
         line stays exactly where it is, and this sentence says what it is.
         Hidden above 768px, where the in-plot label is better. */
      var note = SE.el('p', 'experience-ascent__note',
        'Dashed: <b>' + CONTRACT.company + '</b>. ' + CONTRACT.kind + ', ' +
        '<span class="t-num">' + CONTRACT.rangeShort + '</span>, at rung ' + CONTRACT.alt + '.');
      stage.appendChild(note);

      var read = SE.el('p', 'experience-ascent__read');
      read.setAttribute('role', 'status');
      read.setAttribute('aria-live', 'polite');
      stage.appendChild(read);

      var more = SE.seeMore('See the full plot', ctx.onSeeMore);
      more.classList.add('experience-ascent__more', 'is-on');
      stage.appendChild(more);

      /* The mandated mirror for a canvas concept. The plateau labels are
         aria-hidden because this list already says everything they say, and
         announcing a company twice is worse than announcing it once. */
      stage.appendChild(srRoles('Ascent: responsibility plotted against time', function (r) {
        hold = (r.f0 + r.f1) / 2;
      }));

      /* ----------------------------------------------------------- state */
      var cv = b.cv(SE.canvas(canvasEl));
      var c2 = cv.ctx;
      var rungEls = SE.$$('.experience-ascent__rung', rungs);
      var penChip = SE.$('em', pen);
      var progress = 0, f = 0, hold = null, lastMonth = -1, drawnAt = -1;
      /* The rung currently under the pen, resolved once per month change in
         narrate() and read by render(). Recomputing it inside the draw would
         allocate a filtered array on every redraw of a scroll. */
      var activeAlt = 0;
      var boxH = 0;

      function measure() { boxH = field.getBoundingClientRect().height; }

      function render() {
        cv.clear();
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4) return;

        /* The spine composition: below 220px of canvas the labels have moved
           out into their own column, so the plot is a narrow climb and the
           inset drops from 10% to a flat 12px. */
        var narrow = w < 220;
        var padX = narrow ? 12 : w * 0.09;
        var iw = Math.max(1, w - padX * 2);
        function X(a) { return padX + a * iw; }
        function Y(fr) { return fr * h; }

        /* rung guides */
        c2.lineWidth = 1;
        for (var i = 0; i < LADDER.length; i++) {
          var gx = Math.round(X((i + 0.5) / LADDER.length)) + 0.5;
          c2.strokeStyle = activeAlt === i + 1
            ? 'rgba(63,209,160,0.26)' : 'rgba(236,236,239,0.045)';
          c2.beginPath();
          c2.moveTo(gx, 0);
          c2.lineTo(gx, h);
          c2.stroke();
        }

        c2.lineJoin = 'round';
        c2.lineCap = 'round';

        /* the unresolved route */
        c2.lineWidth = narrow ? 1 : 1.2;
        c2.strokeStyle = 'rgba(63,209,160,0.15)';
        c2.beginPath();
        for (var g = 0; g < GHOST.length; g++) {
          var gp = GHOST[g];
          var gx2 = X(gp.x) + gp.w * (narrow ? 1.4 : 2.6);
          if (g === 0) c2.moveTo(gx2, Y(gp.f)); else c2.lineTo(gx2, Y(gp.f));
        }
        c2.stroke();

        /* the contract, dashed, at the rung it actually occupied */
        c2.setLineDash(narrow ? [2.5, 3] : [4, 4]);
        c2.lineWidth = narrow ? 1.2 : 1.5;
        c2.strokeStyle = 'rgba(63,209,160,' + (f > CONTRACT.f0 ? 0.7 : 0.14) + ')';
        c2.beginPath();
        c2.moveTo(X(0.125), Y(CONTRACT.f0));
        c2.lineTo(X(0.125), Y(Math.min(CONTRACT.f1, Math.max(CONTRACT.f0, f))));
        c2.stroke();
        c2.setLineDash([]);

        /* the resolved route */
        c2.lineWidth = narrow ? 1.8 : 2.2;
        c2.strokeStyle = 'rgba(63,209,160,0.96)';
        strokeClimb(c2, f, X, Y);

        /* plateau terminals */
        for (var k = 0; k < APATH.length; k += 2) {
          var p = APATH[k];
          var done = p.f <= f;
          c2.fillStyle = done ? 'rgba(63,209,160,0.96)' : 'rgba(63,209,160,0.2)';
          c2.fillRect(X(p.y) - 2, Y(p.f) - 2, 4, 4);
        }
      }

      function place() {
        pen.style.transform = 'translate3d(0,' + (f * boxH).toFixed(2) + 'px,0)';
      }

      function narrate() {
        var m = M.clamp(SPAN_A + Math.round(f * SPAN), SPAN_A, SPAN_B - 1);
        if (m === lastMonth) return;
        lastMonth = m;
        var live = liveAt(m);
        var prim = live.filter(function (r) { return r.primary; })[0];
        activeAlt = prim ? prim.alt : 0;
        drawnAt = -1;
        penChip.textContent = mShort(m);
        read.innerHTML =
          '<b class="t-num">' + mLabel(m) + '</b>' +
          '<span>' + (prim ? prim.rung.label : 'Between roles') + '</span>' +
          '<i>' + live.map(function (r) { return r.company; }).join(' + ') + '</i>' +
          (live.length > 1 ? '<em>two rungs at once</em>' : '');
        rungEls.forEach(function (el, i) {
          el.classList.toggle('is-on', !!prim && prim.alt === i + 1);
        });
        labels.forEach(function (lb) {
          lb.el.classList.toggle('is-on', env.reduced || f >= lb.r.f0 - 0.0005);
          lb.el.classList.toggle('is-live', live.indexOf(lb.r) !== -1);
        });
      }

      /* ----------------------------------------------------- interaction */
      labels.forEach(function (lb) {
        var mid = (lb.r.f0 + lb.r.f1) / 2;
        b.on(lb.el, 'pointerenter', function () { hold = mid; });
        b.on(lb.el, 'pointerleave', function () { hold = null; });
      });

      /* The pen finishes at 84% of the rail. The last 16% is the beat where
         the finished climb is readable before the section releases. */
      b.kill(SE.scrub(ctx.scroller, rail.rail, function (p) {
        progress = M.clamp(p / 0.84, 0, 1);
      }));

      cv.observe(function () { measure(); place(); drawnAt = -1; });

      /* ------------------------------------------------------------ tick */
      b.tick(function (dt) {
        var target = hold == null ? progress : hold;
        /* lambda 8 is slower than AXIS on purpose. A pen has mass; a sweep is
           a readout. About 125ms to 63%. */
        var next = env.reduced ? target : M.damp(f, target, 8, dt);
        if (Math.abs(next - f) > 0.00005) {
          f = next;
          place();
          narrate();
        }
        /* Redraw only when the drawn length has actually moved by more than
           a third of a pixel at the current canvas height. */
        if (drawnAt < 0 || Math.abs(f - drawnAt) * Math.max(1, cv.h) > 0.34) {
          drawnAt = f;
          render();
        }
      });

      shortWatch(b, root, ctx.scroller, 700);
      measure();
      place();
      narrate();
      render();

      revealOnce(b, ctx.scroller, [head, plot, read, more], 0.08);
      if (env.reduced) [head, plot, read, more].forEach(function (n) { n.classList.add('is-in'); });

      return {
        destroy: function () {
          b.all();
          root.classList.remove('experience-sec', 'experience-ascent', 'is-short', 'is-tiny');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'Time down, responsibility across, and the whole route visible before it is drawn.',
      philosophy: [
        'Rotating the plot is not decoration. In a scrolling page, down is the direction the reader is already travelling, so putting time on the vertical axis makes the scroll gesture and the passage of time the same motion. The reader climbs the ladder by scrolling it.',
        'The route is present before it is drawn. A line that draws into empty space asks for faith; a line that draws over a visible ghost tells the reader how far there is to go and what shape it is.',
        'The second line is the argument. A career chart that only ever rises is a chart nobody believes. Two years of contract work at rung one, running beside a rung two and then a rung three job, is a true and specific thing, and drawing it below the main line is what turns a ladder into a description.',
        'Nothing here is a score. The rungs are named responsibilities, not levels, and the top rung is not better than the bottom one, it is different.'
      ],
      hierarchy: [
        '1. The resolved line: 2.2px, 96% accent, round joins and caps.',
        '2. The four plateau terminals: 4x4px squares, full accent once passed, 20% before.',
        '3. The dashed contract line: 1.5px, 4/4 dash, 70% accent once reached.',
        '4. The plateau labels: company at 0.875rem 500, rung name in mono 10px, dates in tabular mono at --ink-4.',
        '5. The ghost: 1.2px at 11% accent with a seeded two pixel wobble.',
        '6. Rung guides at 4.5% ink, rising to 26% accent for the rung currently under the pen.',
        '7. The pen: a 1px rule at 22% white with a month chip on its left end. The only white in the section.'
      ],
      structure: [
        'Section root is ordinary block flow. One rail 2.8 viewports tall with a `position: sticky; top: 0` one-screen viewport inside it.',
        'Sticky child is a CSS grid `auto auto auto auto`, content centred, for heading, plot, readout and exit.',
        'The plot is a rung header row plus a field. The field is one coordinate space: the canvas, the label layer and the pen track are all `position: absolute; inset: 0` on the same box, so a label at `top: 40%` and a canvas y of `0.40 * h` are the same pixel. Any padding lives on the field, never on one of the three layers.',
        'Labels are `<span>` and the canvas is `aria-hidden`; the accessible mirror is a single visually-hidden focusable list, so nothing is announced twice.'
      ],
      interaction: [
        'SCROLL: the rail\'s pass through the scroller gives 0..1, remapped as `min(p / 0.84, 1)` so the pen finishes with 16% of the rail still to go and the finished climb is readable before the section releases.',
        'The drawn length damps toward that value with lambda 8 (about 125ms to 63%), slower than a readout because a pen has mass.',
        'HOVER: entering a plateau label parks the pen at `(f0 + f1) / 2` for that role. Leaving releases it back to scroll position.',
        'KEYBOARD: the visually-hidden role list is focusable, and focusing an entry parks the pen exactly as hover does. The list becomes visible on `:focus-within`, so a sighted keyboard user sees what they are driving.',
        'READOUT: recomputed only when the rounded month changes. It names the month, the rung, and every live company, and adds "two rungs at once" during the 24 doubled months.'
      ],
      choreography: [
        { n: 'Line draw', d: 'Not an animation. The drawn length is scroll position, damped with lambda 8, and the canvas is redrawn only when that length has moved by more than a third of a pixel at the current canvas height. Scrolling back un-draws it, which is correct: it is a position, not a playback.' },
        { n: 'Plateau resolve', d: 'The label gets `is-on` when the pen passes its start month. `opacity 0 -> 1` and `translateY(8px) -> 0` over 480ms `cubic-bezier(0.23, 1, 0.32, 1)`, with the date line 80ms behind the company name. The terminal square on the canvas switches from 20% to 96% accent in the same frame, with no tween: a 4px square fading is a 4px square looking broken.' },
        { n: 'Live plateau', d: 'A label whose role contains the pen month gets its company ink in the accent and a 1px accent rule to its left scaling from `scaleY(0)` over 260ms, transform-origin top. 260ms because this is a state change, not a button press.' },
        { n: 'Rung guide', d: 'The guide under the pen goes from 4.5% neutral to 26% accent. Redrawn with the canvas, so it is a step, not a tween. A tween on a reference mark makes the reference mark look like data.' },
        { n: 'Pen', d: 'One `translate3d(0,Ypx,0)` on the pen element per frame, plus a `textContent` swap on the month chip at most 79 times across the whole section.' },
        { n: 'What does NOT animate', d: 'The ghost route, the rung header labels, and the geometry of anything. The ghost is the fixed thing the resolve is measured against.' }
      ],
      scroll: [
        'Budget: 2.8 viewports. One is the sticky viewport and 1.8 is travel, which is what 79 months of climb needs to not feel rushed.',
        'The reader can scroll straight through at any speed. There is no snap, no wheel handler and no minimum dwell.',
        'Scroll position comes from ScrollTrigger `scrub: 0.6` when it is present and a passive listener on the section scroller when it is not. No `window.addEventListener("scroll")` anywhere.',
        'Entry reveal is one IntersectionObserver at threshold 0.08 that unobserves each node after it fires.'
      ],
      hover: [
        'Gated behind `@media (hover: hover) and (pointer: fine)`.',
        'Plateau label hover parks the pen on that role and lifts the company ink to full. The label does not move: its position on the plot is its date and its rung, and moving it would be moving the data.',
        'The canvas itself has no hover. Hit testing five polyline segments to reproduce what the labels already do would be work for nothing.'
      ],
      click: [
        'One click target: "See the full plot", which opens the Altitude page concept.',
        'It carries `is-on` from mount. The section never hides its own exit.'
      ],
      responsive: {
        desktop: 'Canvas inset 9% each side, four rung guides across it, plateau labels anchored beside their own plateau. Rung 4 labels flip to right aligned because there is no room to their right. Field height clamp(19rem, 46vh, 27rem).',
        tablet: 'Same plot. The rung header keeps its numerals and drops the rung names below 900px, because four names across 700px sets at 8px and 8px is not a label.',
        mobile: 'Below 768px the canvas becomes a 4.5rem spine on the left and the plateau labels move out into a single column beside it. The canvas renderer reads its own width and switches inset from 9% to a flat 12px, the ghost wobble from 2.6px to 1.4px, and the dash from 4/4 to 2.5/3. The rung header becomes four numerals under the spine. The contract label leaves the plot entirely: two 180px labels cannot share a 262px column when their start dates are four months apart, so the dashed line stays exactly where it is and a one line key under the plot says what it is. Moving a label to a lie about its own date would be worse than moving it out.'
      },
      a11y: [
        'One visually-hidden focusable list mirrors the five roles with company, range, title and the one-sentence description. It becomes visible on `:focus-within`, so a sighted keyboard user can see what they are driving.',
        'Focusing an entry parks the pen on that role, which is exactly what hover does. Keyboard and pointer have the same power.',
        'The canvas is `aria-hidden="true"` and so are the plateau labels, because the mirror already carries their content. Announcing a company twice is worse than announcing it once.',
        'The readout is `role="status" aria-live="polite"` and updates at most once per month index.',
        'Every date and month uses `font-variant-numeric: tabular-nums`.',
        'Under `prefers-reduced-motion: reduce`: every plateau label is resolved at mount, the pen jumps to the scroll position rather than damping, and the entry reveal does not run. The line still draws with scroll, because that is a position readout and not an animation.'
      ],
      perf: [
        'One canvas, DPR-correct, redrawn only when the drawn length moves by more than a third of a device-independent pixel. A settled pen costs one comparison.',
        'About 14 stroke calls per redraw: 4 rung guides, the ghost, the contract, the route, and five terminals.',
        'The ghost polyline is 73 points, resampled once at module scope with a seeded PRNG. Nothing allocates per frame.',
        'The pen is a DOM element moved by transform, not a canvas draw, so the month chip gets real tabular figures for free.',
        'One ResizeObserver via the canvas helper. No resize listener.'
      ],
      packages: [
        { p: 'gsap + ScrollTrigger (installed)', w: 'The scrub only. Degrade to a passive listener and the section still works, slightly less smooth.' },
        { p: 'no charting library', w: 'The route is nine points. A charting library would ship a scale system, an axis system and a tooltip system to draw nine points and would fight every one of the decisions above.' },
        { p: 'no three', w: 'This is 2D. WebGL here would cost a context, a shader compile and a fallback path to draw a polyline that canvas 2D draws in 14 calls.' }
      ],
      architecture: [
        { f: 'components/sections/ExperienceAscent.tsx', r: 'Server Component. Renders the heading, the rung header, every plateau label and the hidden role list, so the content exists without JavaScript.' },
        { f: 'components/experience/AscentCanvas.tsx', r: '"use client" leaf. Owns the canvas ref, the scrub subscription, the damped pen value and the redraw threshold. Renders the canvas and the pen only.' },
        { f: 'lib/experience/altitude.ts', r: 'Pure: `altitudePath()`, `resampleGhost(seed)`, `strokeClimb(ctx, stop)`. No DOM, unit-testable, shared with the Altitude page.' },
        { f: 'app/experience/altitude/page.tsx', r: 'The "See more" destination. Build it.' }
      ],
      state: [
        'Nothing belongs in `useState`. There is no selection and no panel.',
        'The scrub progress, the damped pen, the hold override, the last drawn length and the last narrated month are all refs, written inside one `useEffect` loop.',
        'The canvas is never a controlled React surface. React renders the element once; the draw loop owns the pixels.'
      ],
      typography: [
        'Heading: display 500 at clamp(1.375rem, 2.8vw, 2.25rem), line-height 1.0, -0.035em.',
        'Company: display 500 at 0.875rem, -0.015em.',
        'Rung name: mono 9px, 0.14em tracking, uppercase, --ink-4.',
        'Dates and the pen chip: mono 10px with tabular-nums.',
        'Rung header: numeral in mono 11px accent, name in mono 9px --ink-3. Mono here is measurement, not costume.'
      ],
      color: [
        'One hue at six alphas: 96% resolved line, 70% contract, 26% active rung guide, 20% unpassed terminal, 11% ghost, and the label ink at full --ink.',
        'The rung guides are neutral ink until they are the active rung. A reference mark only earns the accent when it becomes data.',
        'Prose sits on --ink-2, quiet labels on --ink-4, both above AA on --void.',
        'In light mode: ghost rises from 11% to 18%, the resolved line drops to 88%, and the pen goes from white to --ink at 55%, because a white rule on white is not a rule.'
      ],
      spacing: [
        'Field height clamp(19rem, 46vh, 27rem), which is what 79 months needs before the plateaus start colliding.',
        'Canvas inset 9% each side on desktop so the rung 1 and rung 4 guides are not on the edge of the box.',
        'Labels sit 14px clear of their rung guide. Grid gap clamp(1.25rem, 3vh, 2.5rem).'
      ],
      relationships: [
        'Vertical position encodes date. Horizontal position encodes responsibility. Line style encodes employment kind: solid is the day job, dashed is the contract.',
        'A dot encodes the start of a plateau, which is the month a scope changed rather than the month a job started. Those are different dates and the chart is careful about it.',
        'Nothing encodes salary, seniority or quality. The rungs are named responsibilities and the top one is not better than the bottom one.',
        'The ghost encodes the future of the scroll, which is the one thing the reader cannot otherwise know.'
      ],
      acceptance: [
        'Scrolling through draws the route from the first month to the last exactly once and un-draws it on the way back up.',
        'The dashed contract line sits at rung one for exactly the months Northsound ran, and visibly to the left of the main line for all of them.',
        'The rung guide under the pen is the only lit guide, and it changes exactly when the readout says the rung changed.',
        'Tab reaches the hidden role list, it becomes visible on focus, and focusing an entry parks the pen on that role.',
        'Scrolling past at full speed leaves no fixed element, no locked scroll and no ticker subscription behind.',
        'At 390px the canvas is a 4.5rem spine with the labels in their own column, and there is no horizontal overflow.',
        'With reduced motion on, every plateau label is resolved at mount and the pen jumps rather than damps.'
      ]
    }
  });

  /* ==========================================================================
     SECTION 03  -  STANDING
     --------------------------------------------------------------------------
     What is true now, at full size, with everything before it compressed to
     scale beside it. The column on the right is not a menu: it is the same
     history drawn at one twelfth the size, ordered newest first, with every
     segment's height proportional to the months it ran. The panel is the
     territory and the column is the map of it.

     WHY IT RUNS BACKWARDS
     ---------------------
     Every other reading of a career starts in 2020 and works forward, which
     is the order the events happened and the opposite of the order anybody
     cares about them. Here scrolling recedes: the present is the resting
     state, and the reader travels back only as far as they want to. The
     column is labelled 2026 at the top and 2020 at the bottom so the
     inversion is stated rather than sprung.

     WHY 103 AND NOT 79
     ------------------
     The segments are role months, and they sum to 103 against 79 months of
     calendar. That gap IS the overlap, expressed as the column being taller
     than the time it covers, which is a thing a proportional stack can say
     and a list cannot.

     SCROLL BUDGET: 2.2 screens. One screen of sticky viewport and 1.2 of
     travel, of which the marker uses the first 85%.
     ======================================================================== */

  /* Newest first, and the fractions the column is built from. Solved once. */
  var RECENT = ROLES.slice().sort(function (a, b) { return b.a - a.a; });
  RECENT.forEach(function (r, i) { r.recent = i; });
  var RECENT_ROWS = RECENT.map(function (r) { return (r.months / ROLE_MONTHS).toFixed(4) + 'fr'; }).join(' ');
  var RECENT_BANDS = (function () {
    var acc = 0;
    return RECENT.map(function (r) {
      var a = acc;
      acc += r.months / ROLE_MONTHS;
      return { role: r, a: a, b: acc };
    });
  })();

  SE.register({
    area: AREA,
    variant: 'section',
    id: 'experience-section-standing',
    num: 3,
    pageOf: 'experience-page-tenure',
    screens: 2.2,
    name: 'Standing',
    kind: 'DOM / feature and scale column',
    accent: '#E08A4C',
    tagline: 'The present at full size, the past to scale',
    desc: 'The role running now takes the whole panel; the five and a half years before it are compressed ' +
          'into one proportional column beside it. Scrolling recedes through that column instead of advancing.',
    interaction: 'Scroll to recede through the column, or hover and click a segment to open it. The present is always marked.',
    hint: 'Scroll recedes &middot; Click a segment',

    /* Miniature: the feature block, the proportional column and the marker.
       Twenty one operations, no randomness. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.07, padY = h * 0.13;
      var iw = w - padX * 2, ih = h - padY * 2;
      var colW = iw * 0.2;
      var colX = w - padX - colW;
      var featW = iw - colW - iw * 0.06;
      var i;

      var p = M.clamp((t * 0.12) % 1.3, 0, 1);
      var sel = 0;
      for (i = 0; i < RECENT_BANDS.length; i++) if (p >= RECENT_BANDS[i].a) sel = i;

      /* the feature: one heavy rule and four text ribs */
      bar(ctx, padX, padY, featW * 0.62, 3, 'rgba(224,138,76,0.95)');
      for (i = 0; i < 4; i++) {
        bar(ctx, padX, padY + ih * (0.2 + i * 0.13), featW * (i === 3 ? 0.42 : 0.86), 1.5,
          'rgba(236,236,239,' + (0.16 + heat * 0.06).toFixed(3) + ')');
      }
      bar(ctx, padX, padY + ih * 0.78, featW * 0.3, 6, 'rgba(224,138,76,' + (0.2 + heat * 0.1).toFixed(3) + ')');

      /* the column, drawn to the same scale as the history it represents */
      for (i = 0; i < RECENT_BANDS.length; i++) {
        var bd = RECENT_BANDS[i];
        var y0 = padY + bd.a * ih;
        var hh = (bd.b - bd.a) * ih - 2;
        bar(ctx, colX, y0, colW, hh,
          i === sel ? 'rgba(224,138,76,0.9)' : 'rgba(224,138,76,' + (0.16 + heat * 0.08).toFixed(3) + ')');
      }

      var my = Math.round(padY + p * ih) + 0.5;
      pxLine(ctx, colX - colW * 0.55, my, w - padX, my, 'rgba(255,255,255,0.72)');
      ctx.fillStyle = '#fff';
      ctx.fillRect(colX - colW * 0.55, my - 1.5, 3, 3);
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var b = bag();

      root.classList.add('experience-sec', 'experience-standing');
      tint(root, '#E08A4C');

      /* ------------------------------------------------------------- DOM */
      var rail = b.rail(SE.scrollRail(ctx.scroller, 2.2));
      var stage = SE.el('div', 'experience-standing__stage');
      rail.sticky.appendChild(stage);
      root.appendChild(rail.rail);

      var head = SE.el('div', 'experience-standing__head');
      head.innerHTML =
        '<h2 class="experience-sec__title">Right now, and everything behind it</h2>' +
        '<p class="experience-sec__lede">' + SUMMARY.role + ' months of role inside ' + SUMMARY.calendar +
          ' months of calendar. The column is that history at one twelfth the size, newest at the top.</p>';
      stage.appendChild(head);

      var body = SE.el('div', 'experience-standing__body');

      var feature = SE.el('article', 'experience-standing__feature');
      feature.setAttribute('aria-live', 'polite');
      body.appendChild(feature);

      var stack = SE.el('div', 'experience-standing__stack');
      stack.innerHTML =
        '<i class="experience-standing__cap t-num" aria-hidden="true">' + yearOf(SPAN_B - 1) + '</i>' +
        '<i class="experience-standing__cap experience-standing__cap--end t-num" aria-hidden="true">' +
          yearOf(SPAN_A) + '</i>';

      var list = SE.el('ol', 'experience-standing__list');
      /* Exact fr units, handed to CSS as one custom property rather than as
         `grid-template-rows` directly: the mobile composition feeds the same
         string to `grid-template-columns`, so the rail carries the identical
         proportions without JS having to know which axis it is on. */
      list.style.setProperty('--rows', RECENT_ROWS);
      var segs = RECENT.map(function (r, i) {
        var li = SE.el('li', 'experience-standing__row');
        var el = SE.el('button', 'experience-standing__seg');
        el.type = 'button';
        el.setAttribute('data-i', String(i));
        if (!r.primary) el.setAttribute('data-aside', '1');
        el.setAttribute('aria-label',
          r.company + ', ' + r.title + ', ' + r.range + ', ' + r.durLabel +
          (r.current ? '. Current role.' : '') + ' Opens it in the panel.');
        el.innerHTML =
          '<i class="experience-standing__bar" aria-hidden="true"></i>' +
          '<span class="experience-standing__sco">' + r.company + '</span>' +
          '<em class="experience-standing__sdu t-num">' + r.durLabel + '</em>' +
          /* The rail composition uses the start year instead of the company
             name: the shortest segment is 37px wide there and a four figure
             year fits where a company name cannot. Read left to right the
             years also state the direction, which is what the two caps do on
             desktop. */
          '<u class="experience-standing__syr t-num">' + yearOf(r.a) + '</u>' +
          (r.current ? '<b class="experience-standing__now">Now</b>' : '');
        li.appendChild(el);
        list.appendChild(li);
        return { el: el, r: r };
      });
      stack.appendChild(list);

      var marker = SE.el('div', 'experience-standing__marker');
      marker.setAttribute('aria-hidden', 'true');
      stack.appendChild(marker);
      body.appendChild(stack);
      stage.appendChild(body);

      var more = SE.seeMore('See every handoff', ctx.onSeeMore);
      more.classList.add('experience-standing__more', 'is-on');
      stage.appendChild(more);

      /* ----------------------------------------------------------- state */
      var progress = 0, f = 0, hold = null, shown = -1;
      var listW = 0, listH = 0, isRail = false;

      /* The rotation is a class computed from the section's own width, not a
         media query, so the CSS layout and the marker's transform axis can
         never disagree about which way the column runs. */
      function measure() {
        var rect = list.getBoundingClientRect();
        listW = rect.width;
        listH = rect.height;
        isRail = root.getBoundingClientRect().width < 768;
        root.classList.toggle('is-rail', isRail);
      }

      function place() {
        marker.style.transform = isRail
          ? 'translate3d(' + (f * listW).toFixed(2) + 'px,0,0)'
          : 'translate3d(0,' + (f * listH).toFixed(2) + 'px,0)';
      }

      function fill(r) {
        feature.innerHTML =
          '<h3 class="experience-standing__co">' + r.company + '</h3>' +
          '<p class="experience-standing__ti">' + r.title + '</p>' +
          '<p class="experience-standing__meta">' +
            '<span class="t-num">' + r.range + '</span>' +
            '<span class="t-num">' + r.durLabel + '</span>' +
            '<span>' + r.place + '</span>' +
            '<span>' + r.kind + '</span>' +
          '</p>' +
          '<p class="experience-standing__was">' + r.was + '</p>' +
          '<ul class="experience-standing__ships">' + shipsHtml(r, 'experience-standing__ship') + '</ul>' +
          '<p class="experience-standing__tech">' + techHtml(r, 'experience-standing__chip') + '</p>' +
          '<p class="experience-standing__rung"><b>' + r.rung.label + '</b><span>' + r.rung.what + '</span></p>';
      }

      function select(i) {
        if (i === shown) return;
        shown = i;
        var r = RECENT[i];
        fill(r);
        segs.forEach(function (s, k) {
          s.el.classList.toggle('is-on', k === i);
          s.el.setAttribute('aria-current', String(k === i));
        });
        if (!env.reduced) {
          /* Re-arm the entry transition on the freshly written panel. One
             forced reflow, at most five times across the whole section. */
          feature.classList.remove('is-fresh');
          void feature.offsetWidth;
          feature.classList.add('is-fresh');
        }
      }

      /* ----------------------------------------------------- interaction */
      segs.forEach(function (s, i) {
        var mid = (RECENT_BANDS[i].a + RECENT_BANDS[i].b) / 2;
        b.on(s.el, 'pointerenter', function () { hold = mid; });
        b.on(s.el, 'pointerleave', function () { hold = null; });
        b.on(s.el, 'focus', function () { hold = mid; });
        b.on(s.el, 'blur', function () { hold = null; });
        /* Click pins it: the reader has chosen, so scrolling on should not
           take it away from them until they scroll past that segment. */
        b.on(s.el, 'click', function () { hold = mid; select(i); });
      });

      /* The marker finishes at 85% of the rail; the last 15% holds on the
         first role so the oldest job is not read in a half-exited section. */
      b.kill(SE.scrub(ctx.scroller, rail.rail, function (p) {
        progress = M.clamp(p / 0.85, 0, 1);
      }));

      /* ------------------------------------------------------------ tick */
      b.tick(function (dt) {
        var target = hold == null ? progress : hold;
        /* lambda 10, about 100ms to 63%. The marker is a position readout on
           a 26rem column, so it can be quick without reading as nervous. */
        var next = env.reduced ? target : M.damp(f, target, 10, dt);
        if (Math.abs(next - f) < 0.00006) return;
        f = next;
        place();
        var i = 0;
        for (var k = 0; k < RECENT_BANDS.length; k++) if (f >= RECENT_BANDS[k].a) i = k;
        select(i);
      });

      if (typeof ResizeObserver !== 'undefined') {
        b.obs(new ResizeObserver(function () { measure(); place(); })).observe(list);
      }
      shortWatch(b, root, ctx.scroller, 720);
      measure();
      place();
      select(0);

      revealOnce(b, ctx.scroller, [head, body, more], 0.08);
      if (env.reduced) [head, body, more].forEach(function (n) { n.classList.add('is-in'); });

      return {
        destroy: function () {
          b.all();
          root.classList.remove('experience-sec', 'experience-standing', 'is-rail', 'is-short', 'is-tiny');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'The current role at full size beside the whole history compressed to scale.',
      philosophy: [
        'What somebody is doing now is the most useful fact in a career history and it is usually given the same 200px as a job they left five years ago. Here it gets the panel and everything else gets one twelfth of it.',
        'The column is not a menu. Every segment\'s height is that role\'s months, so the column is the same history drawn small. That is what makes it worth looking at rather than just clicking.',
        'Scrolling recedes rather than advances. The present is the resting state and the reader travels back only as far as they want to, which is the order anybody actually reads a career in.',
        'The segments sum to 103 months against 79 months of calendar, so the column is visibly taller than the time it covers. That gap is the overlap, expressed as a proportion rather than as a sentence.'
      ],
      hierarchy: [
        '1. The company name in the panel: display 500 at clamp(1.75rem, 3.6vw, 2.75rem), -0.04em.',
        '2. The three dated things shipped, each with its month in tabular mono in a fixed 3.75rem column.',
        '3. The compressed column at 13rem wide, segments in the accent at 16% resting and 90% selected.',
        '4. The "Now" tag on the current segment: mono 9px, accent, always present regardless of what is selected.',
        '5. The marker: a 1px rule at 72% white across the column with a 3x3px cap.',
        '6. The meta row: range, duration, place, employment kind, separated by 1px rules rather than by dots.'
      ],
      structure: [
        'Section root is ordinary block flow. One rail 2.2 viewports tall with a `position: sticky; top: 0` one-screen viewport.',
        'Sticky child is a grid `auto minmax(0, 1fr) auto` for heading, body, exit.',
        'The body is `grid-template-columns: minmax(0, 1fr) 13rem` with a clamp(1.5rem, 4vw, 4rem) gap.',
        'The column is a single CSS grid whose `grid-template-rows` is written once from JS as exact fr units (`10.68fr 29.13fr ...`). One grid rather than five percentage heights, so the segments cannot drift apart by a rounding pixel each.',
        'The marker is a sibling of the grid, moved only by transform.',
        'The panel is one `<article aria-live="polite">` whose innerHTML is rewritten on selection, which happens at most five times across the section.'
      ],
      interaction: [
        'SCROLL: the rail gives 0..1, remapped as `min(p / 0.85, 1)`. The last 15% holds on the oldest role so it is not read in a half-exited section.',
        'The marker damps toward that value with lambda 10 (about 100ms to 63%).',
        'The selected role is whichever proportional band contains the marker. The bands are cumulative role-month fractions, computed once.',
        'HOVER / FOCUS: entering a segment parks the marker at the middle of that segment. Leaving releases it back to scroll position.',
        'CLICK: pins the marker on that segment. The reader has chosen, so scrolling a little should not take it away from them; scrolling past that band does.',
        'The current role keeps its "Now" tag no matter what is selected, so the present is never lost.'
      ],
      choreography: [
        { n: 'Panel swap', d: '`opacity 0 -> 1` with `translateY(10px) -> 0` over 260ms `cubic-bezier(0.23, 1, 0.32, 1)`. Re-armed by removing a class, reading `offsetWidth` once to force the reflow, and adding it back. One forced reflow per swap and at most five swaps per pass, which is cheaper than keeping two panels alive to crossfade between.' },
        { n: 'Ships stagger', d: 'Each shipped line is `translateY(8px) -> 0` and `opacity 0 -> 1` over 320ms with `transition-delay: calc(var(--k) * 60ms)`, so the three arrive as three rather than as a block. 60ms is the smallest gap that still reads as sequence.' },
        { n: 'Segment selection', d: 'Background from 16% to 90% accent and the company ink from --ink-2 to --void over 180ms `ease`. Feedback, so under 200ms. The segment does not resize: its height is its duration and its duration did not change.' },
        { n: 'Marker', d: 'One `translate3d(0,Ypx,0)` per frame on the marker element, damped lambda 10.' },
        { n: 'What does NOT animate', d: 'The column geometry, the "Now" tag and the two year caps. The column is the fixed scale the panel is measured against; a scale that moves is not a scale.' }
      ],
      scroll: [
        'Budget: 2.2 viewports. One is the sticky viewport, 1.2 is travel, which gives each of the five roles roughly a quarter of a screen of reading.',
        'No hijack, no snap. Scrolling straight through recedes through five roles and lands in the next section with momentum intact.',
        'Scroll position comes from ScrollTrigger or a passive listener on the section scroller. No `window.addEventListener("scroll")`.',
        'The entry reveal is one IntersectionObserver at threshold 0.08 that unobserves each node after it fires.'
      ],
      hover: [
        'Gated behind `@media (hover: hover) and (pointer: fine)`.',
        'Segment hover parks the marker and lifts the segment to 40% accent. The panel follows, so hovering the column reads the history without leaving the section.',
        'Technology chips take a border-colour change only. They are labels, not controls.'
      ],
      click: [
        'Clicking a segment pins it. Clicking is a stronger statement than hovering and it should survive a small scroll.',
        '"See every handoff" opens the Tenure page concept, where each role owns the frame in turn.',
        'The exit carries `is-on` from mount.'
      ],
      responsive: {
        desktop: 'Two columns: panel `minmax(0, 1fr)`, column `13rem`, gap clamp(1.5rem, 4vw, 4rem). Column height is the full body height, so the proportions are read against the panel beside them.',
        tablet: 'Column narrows to 10rem and drops the duration from each segment, keeping the company name. The panel drops the technology chips below 900px, because a chip row that wraps to three lines is a list pretending to be a row.',
        mobile: 'Below 768px the column rotates: it becomes a full width proportional rail above the panel, 2.75rem tall, newest at the LEFT, with the marker travelling left to right and the year caps at each end. Segment labels reduce to the company name rotated to horizontal in the segment, and the shortest segment (11 months, 10.7% of the rail) keeps a 44px minimum hit area by growing its button beyond its bar. The panel then takes the full width below it. Same data, same proportions, a different instrument.'
      },
      a11y: [
        'Every segment is a real `<button>` with `aria-current` and an `aria-label` reading "Halden Health, Senior Engineer, Apr 2023 - Aug 2025, 2 yr 6 mo. Opens it in the panel."',
        'The panel is `aria-live="polite"`, so a swap is announced without stealing focus.',
        'Focus does what hover does. Keyboard parity is complete without a separate affordance.',
        'Dates and durations use `font-variant-numeric: tabular-nums`, so a column of five durations does not shift.',
        'The "Now" tag is real text, not a colour, so the present is identifiable without colour vision.',
        'Under `prefers-reduced-motion: reduce`: the panel swaps with no translate and no re-armed transition, the marker jumps to the scroll position, and the entry reveal does not run.'
      ],
      perf: [
        'Per frame: one transform write, and a band lookup over five numbers that only writes DOM when the band actually changes.',
        'The panel is rewritten at most five times across the whole section. Rewriting innerHTML five times is cheaper than keeping five panels mounted and toggling them.',
        'The column is one CSS grid with fr units, so a resize costs zero JavaScript.',
        'One ResizeObserver on the column, driving the marker re-measure. No resize listener.'
      ],
      packages: [
        { p: 'gsap + ScrollTrigger (installed)', w: 'The scrub only.' },
        { p: 'no framer-motion here', w: 'The panel swap is one class toggle and one transition. A layout animation library would add 40kb to cross-fade a div five times.' },
        { p: 'no virtualisation', w: 'Five segments. Anything that virtualises five rows is a dependency looking for a problem.' }
      ],
      architecture: [
        { f: 'components/sections/ExperienceStanding.tsx', r: 'Server Component. Renders the current role\'s panel and all five segments, so the present is in the HTML before hydration.' },
        { f: 'components/experience/ScaleColumn.tsx', r: '"use client" leaf. Owns the scrub subscription, the damped marker, the hold override and the band lookup. Emits the selected index upward.' },
        { f: 'components/experience/RolePanel.tsx', r: 'Presentational. Takes a role and renders it. No state.' },
        { f: 'app/experience/tenure/page.tsx', r: 'The "See more" destination. Build it.' }
      ],
      state: [
        '`selectedIndex: number` is the only value that belongs in state, and it changes at most five times per pass.',
        'The scrub progress, the damped marker and the hold override are refs.',
        'The band table is computed at module scope from the role data, never in a render.'
      ],
      typography: [
        'Company in the panel: display 500 at clamp(1.75rem, 3.6vw, 2.75rem), -0.04em, line-height 1.0.',
        'Title: mono 11px, 0.14em tracking, uppercase, --ink-2.',
        'Meta row: 11px, --ink-3, with tabular-nums on the range and duration.',
        'Body and shipped lines: 0.875rem at line-height 1.55, --ink-2, measure capped at 62ch.',
        'Segment company: 0.75rem 500. Segment duration: mono 10px tabular. "Now": mono 9px, 0.16em tracking.'
      ],
      color: [
        'One hue at four alphas: 90% for the selected segment, 40% on hover, 16% resting, and 13% for the panel\'s rung block.',
        'A selected segment carries --void ink on accent fill, which is the only inverted type in the section and the reason it reads as selected at a glance.',
        'Prose sits on --ink-2 and quiet labels on --ink-3. Nothing informational below AA.',
        'In light mode: resting segments rise to 22%, the selected segment keeps its inverted ink, and the marker goes from white to --ink at 60%.'
      ],
      spacing: [
        'Sticky viewport padding clamp(2rem, 6vh, 4rem) block, var(--pad) inline.',
        'Column 13rem wide, segments separated by a 2px gap rather than a border, so the gap belongs to the grid and not to the segment.',
        'Panel measure capped at 62ch. Shipped lines in a `3.75rem minmax(0, 1fr)` grid so all three months start on the same x.'
      ],
      relationships: [
        'Segment height encodes months in that role. That is the only thing height encodes.',
        'Vertical order encodes recency, newest first, which is stated by the year caps at each end of the column.',
        'Fill encodes selection. Nothing encodes quality, seniority or salary.',
        'The column being taller than 79 months of calendar encodes the overlap, which is the one fact this area exists to show.'
      ],
      acceptance: [
        'On arrival the panel shows the current role and the column shows five segments whose heights are in the ratio 11 : 30 : 24 : 19 : 19.',
        'Scrolling through moves the marker from the top of the column to the bottom exactly once and the panel follows it, ending on the oldest role with the section still fully visible.',
        'Hovering a segment previews it and leaving returns to the scroll position; clicking pins it.',
        'The "Now" tag stays on the current role whatever is selected.',
        'Tab reaches all five segments and focusing one previews it.',
        'At 390px the column is a horizontal rail above the panel with the same proportions and no horizontal overflow.',
        'With reduced motion on, the panel swaps without translating and the marker jumps.'
      ]
    }
  });

  /* ==========================================================================
     SECTION 04  -  REGISTER
     --------------------------------------------------------------------------
     Five company names at display size, one per line, and the one you are
     pointing at opens inside its own row. Nothing slides in from the side,
     nothing overlays anything: the row you are reading is the row that grows.

     WHY THERE IS NO RAIL
     --------------------
     Pinning an index would be a tax on the reader for zero information gain.
     A register is read by running an eye down it, which is a thing the
     reader already knows how to do at their own speed. The section consumes
     1.25 screens because that is how tall five 88px rows and one open detail
     actually are, not because a number was chosen.

     THE ONE PLACE HEIGHT IS ALLOWED TO ANIMATE
     ------------------------------------------
     This is an accordion, and an accordion is the single case where there is
     no transform equivalent: `grid-template-rows: 0fr -> 1fr` on the detail
     wrapper with `overflow: hidden` on its child. Everything else in the row
     is transform and opacity. The list reserves the height of its tallest
     configuration, so opening a row never moves the section boundary and
     never pushes the next section down the page.

     SCROLL BUDGET: 1.25 screens, set as a min-height in pixels from the
     scroller's own height rather than in `vh`, because inside a nested
     scroller `vh` is the window and the window is not the scroller.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'experience-section-register',
    num: 4,
    pageOf: 'experience-page-dossier',
    screens: 1.25,
    name: 'Register',
    kind: 'DOM / index that opens in place',
    accent: '#9AA7B8',
    tagline: 'Five names, and the one you are reading opens',
    desc: 'The companies set as an index in display type. Pointing at a line resolves it in place: the dates ' +
          'lengthen, a rule draws, and the role opens inside its own row while the others recede.',
    interaction: 'Move down the index, or Tab through it. The line under the pointer opens; the current role is open when nothing is.',
    hint: 'Point at a line &middot; It opens where it sits',

    /* Miniature: five index rules with one open, plus the detail ribs.
       Twenty two operations. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.08, padY = h * 0.12;
      var iw = w - padX * 2, ih = h - padY * 2;
      var open = Math.floor((t * 0.28) % ROLES.length);
      var i, y = padY;
      var rowH = ih / (ROLES.length + 1.6);

      for (i = 0; i < ROLES.length; i++) {
        var isOpen = i === open;
        /* the name, as a heavy rule whose length is the company name length */
        bar(ctx, padX, y, iw * (0.3 + (ROLES[i].company.length / 22) * 0.34),
          isOpen ? 4 : 3,
          isOpen ? 'rgba(215,222,232,0.95)' : 'rgba(215,222,232,' + (0.24 + heat * 0.1).toFixed(3) + ')');
        /* the date, right aligned */
        bar(ctx, w - padX - iw * (isOpen ? 0.24 : 0.15), y + 0.5, iw * (isOpen ? 0.24 : 0.15), 2,
          'rgba(154,167,184,' + (isOpen ? 0.85 : 0.3).toFixed(3) + ')');
        y += rowH * 0.62;

        if (isOpen) {
          for (var k = 0; k < 3; k++) {
            bar(ctx, padX, y, iw * (k === 2 ? 0.34 : 0.66), 1.5,
              'rgba(236,236,239,' + (0.16 + heat * 0.05).toFixed(3) + ')');
            y += rowH * 0.3;
          }
          y += rowH * 0.16;
        }
        pxLine(ctx, padX, Math.round(y - rowH * 0.2) + 0.5, w - padX, Math.round(y - rowH * 0.2) + 0.5,
          'rgba(236,236,239,0.08)');
        y += rowH * 0.38;
      }
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var b = bag();

      root.classList.add('experience-sec', 'experience-register');
      tint(root, '#9AA7B8');

      /* ------------------------------------------------------------- DOM */
      var stage = SE.el('div', 'experience-register__stage');
      root.appendChild(stage);

      var head = SE.el('div', 'experience-register__head');
      head.innerHTML =
        '<h2 class="experience-sec__title">Five places, in the order they happened</h2>' +
        '<p class="experience-sec__lede">' + summaryLine() + ' Point at a line and it opens where it sits.</p>';
      stage.appendChild(head);

      var list = SE.el('ol', 'experience-register__list');
      var rows = ROLES.map(function (r, i) {
        var li = SE.el('li', 'experience-register__row');
        li.style.setProperty('--k', i);
        var el = SE.el('button', 'experience-register__entry');
        el.type = 'button';
        el.setAttribute('data-i', String(i));
        el.setAttribute('aria-expanded', 'false');
        el.setAttribute('aria-label', r.company + ', ' + r.title + ', ' + r.range + ', ' + r.durLabel);
        el.innerHTML =
          '<span class="experience-register__line">' +
            '<b class="experience-register__co">' + r.company +
              /* The present has to stay identifiable when the reader is
                 pointing at 2021. A word, not a colour. */
              (r.current ? '<sup class="experience-register__now">Now</sup>' : '') +
            '</b>' +
            '<span class="experience-register__dates">' +
              '<em class="experience-register__short t-num">' + r.rangeShort + '</em>' +
              '<em class="experience-register__long t-num">' + r.range + '</em>' +
            '</span>' +
          '</span>' +
          '<span class="experience-register__wrap">' +
            '<span class="experience-register__detail">' +
              '<span class="experience-register__ti">' + r.title + '</span>' +
              '<span class="experience-register__was">' + r.was + '</span>' +
              '<span class="experience-register__last">' +
                '<i class="t-num">' + mShort(r.ships[r.ships.length - 1].m) + '</i>' +
                '<u>' + r.ships[r.ships.length - 1].t + '</u>' +
              '</span>' +
              '<span class="experience-register__tech">' + techHtml(r, 'experience-register__chip') + '</span>' +
            '</span>' +
          '</span>';
        li.appendChild(el);
        list.appendChild(li);
        return { el: el, li: li, r: r };
      });
      stage.appendChild(list);

      var more = SE.seeMore('Open the full document', ctx.onSeeMore);
      more.classList.add('experience-register__more', 'is-on');
      stage.appendChild(more);

      /* ----------------------------------------------------------- state */
      /* The resting state is the current role, not "nothing". An index whose
         resting state is empty spends its first screen telling the reader
         that it has nothing to say yet. */
      var restIndex = 0;
      ROLES.forEach(function (r, i) { if (r.current) restIndex = i; });
      var open = -1, pinned = -1;

      function setOpen(i) {
        if (i === open) return;
        open = i;
        rows.forEach(function (row, k) {
          var on = k === i;
          row.el.classList.toggle('is-open', on);
          row.el.setAttribute('aria-expanded', String(on));
        });
        list.classList.toggle('has-open', i >= 0);
      }

      function rest() { setOpen(pinned >= 0 ? pinned : restIndex); }

      rows.forEach(function (row, i) {
        b.on(row.el, 'pointerenter', function () { setOpen(i); });
        b.on(row.el, 'focus', function () { setOpen(i); });
        b.on(row.el, 'blur', rest);
        /* Click pins, so a touch reader is not fighting a hover model that
           their device does not have. A second click releases it. */
        b.on(row.el, 'click', function () {
          pinned = pinned === i ? -1 : i;
          rest();
          setOpen(pinned >= 0 ? pinned : i);
        });
      });
      b.on(list, 'pointerleave', rest);

      /* Arrow keys move down the index without leaving it, which is what a
         reader expects from a list of five things. */
      b.on(list, 'keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        var i = rows.map(function (x) { return x.el; }).indexOf(document.activeElement);
        if (i < 0) return;
        var n = M.clamp(i + (e.key === 'ArrowDown' ? 1 : -1), 0, rows.length - 1);
        rows[n].el.focus();
        e.preventDefault();
      });

      /* The scroll budget is real pixels from the scroller's own height. In
         a nested scroller `vh` is the window, and the window is not the
         scroller. */
      var sizer = null;
      function size() {
        var h = ctx.scroller ? ctx.scroller.clientHeight : window.innerHeight;
        stage.style.minHeight = Math.round(h * 1.25) + 'px';
      }
      if (ctx.scroller && typeof ResizeObserver !== 'undefined') {
        sizer = b.obs(new ResizeObserver(size));
        sizer.observe(ctx.scroller);
      }
      size();

      rest();
      revealOnce(b, ctx.scroller, [head].concat(rows.map(function (x) { return x.li; })).concat([more]), 0.12);
      if (env.reduced) {
        [head, more].forEach(function (n) { n.classList.add('is-in'); });
        rows.forEach(function (x) { x.li.classList.add('is-in'); });
      }

      /* No ticker subscription at all. Every state in this concept is a
         threshold or a pointer event, and a rAF loop here would be a loop
         that spends its life computing that nothing changed. */
      return {
        destroy: function () {
          b.all();
          root.classList.remove('experience-sec', 'experience-register');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'An index of five companies where the line you point at opens inside itself.',
      philosophy: [
        'An index is read by running an eye down it. That is a gesture the reader already owns, and the only thing the interface has to do is answer instantly when the eye stops.',
        'The detail opens where the name is. A side panel would make the reader look away from the thing they just chose, and an overlay would hide the four they did not.',
        'The resting state is the current role, not nothing. An index whose default is empty spends its first screen telling you it has nothing to say yet.',
        'Nothing is pinned and nothing is hijacked. This is 1.25 screens of ordinary page, and the reader leaves it whenever they want.'
      ],
      hierarchy: [
        '1. The five company names: display 400 at clamp(1.75rem, 5vw, 3.5rem), -0.045em. They are the content.',
        '2. The open row\'s name at full --ink; the other four drop to --ink-3 while one is open.',
        '3. The date range, right aligned in tabular mono, which lengthens from "Sep 21 - Mar 23" to "Sep 2021 - Mar 2023" as the row opens.',
        '4. The detail: title in mono 10px accent, one sentence of what the job was at 0.9375rem --ink-2, the last dated thing shipped, and the technology chips.',
        '5. A 1px rule between rows at --line. The open row\'s rule goes to --c-line.'
      ],
      structure: [
        'Section root is ordinary block flow with a `min-height` written in pixels from the scroller\'s own height. Inside a nested scroller `vh` measures the window, and the window is not the scroller.',
        'One `<ol>` of five `<li>`, each containing a full width `<button>`. The button is the row, so the whole 88px band is the target.',
        'The detail is a `grid-template-rows: 0fr` wrapper around an `overflow: hidden` child. Opening sets it to `1fr`.',
        'The list reserves `min-height: 34rem`, which is its tallest configuration, so opening a row never moves the section boundary or pushes the next section down the page.'
      ],
      interaction: [
        'HOVER: `pointerenter` on a row opens it. `pointerleave` on the LIST, not on the row, returns to rest, so moving between two rows never flickers through the resting state.',
        'FOCUS: focusing a row opens it, exactly as hover does. Blur returns to rest.',
        'CLICK: pins a row so a touch reader is not fighting a hover model their device does not have. Clicking the pinned row again releases it.',
        'ARROW KEYS: Down and Up move focus between rows and preventDefault, so a reader can run the index from the keyboard without leaving it.',
        'REST: the current role. Not the first row, and not nothing.'
      ],
      choreography: [
        { n: 'Row open', d: '`grid-template-rows: 0fr -> 1fr` over 380ms `cubic-bezier(0.32, 0.72, 0, 1)`. This is the one place height is allowed to animate: an accordion has no transform equivalent, and a scaleY would squash the type inside it.' },
        { n: 'Detail resolve', d: 'The four detail parts each run `opacity 0 -> 1` and `translateY(10px) -> 0` over 320ms `cubic-bezier(0.23, 1, 0.32, 1)` with `transition-delay: calc(var(--k) * 55ms + 90ms)`. The 90ms offset is the height transition getting far enough open that the text is not revealed against a moving edge.' },
        { n: 'Date lengthen', d: 'Two absolutely stacked spans crossfading over 220ms `ease`, short form out and long form in. Both are tabular, so the right edge does not move while they swap.' },
        { n: 'Recede', d: 'The four rows that are not open go from --ink to --ink-3 over 240ms `ease`. Colour only. Scaling or shifting them would make the index move while the reader is aiming at it.' },
        { n: 'Entry', d: 'Each row `opacity 0 -> 1` with `translateY(18px) -> 0` over 620ms `cubic-bezier(0.23, 1, 0.32, 1)`, `transition-delay: calc(var(--k) * 70ms)`. One IntersectionObserver at threshold 0.12, unobserved per node after it fires.' },
        { n: 'What does NOT animate', d: 'The rules between rows, the list height, and the section boundary. A section that changes height under a pointer is a section that moves the page while somebody is reading it.' }
      ],
      scroll: [
        'Budget: 1.25 screens, which is what five 88px rows, one open detail and the heading actually measure. No rail, no pin, no scrub.',
        'Pinning a hover index would be a tax on the reader for zero information gain: they already know how to run an eye down a list.',
        'The only scroll-aware code is one IntersectionObserver for the entry reveal, which unobserves each node after it fires.',
        'There is no ticker subscription in this concept at all. Every state here is a threshold or a pointer event.'
      ],
      hover: [
        'Gated behind `@media (hover: hover) and (pointer: fine)`.',
        'The row under the pointer opens; the other four recede in ink only.',
        '`pointerleave` is bound to the list rather than to each row, so travelling from row two to row three never passes through the resting state and never flickers.',
        'Technology chips take a border colour change and nothing else. They are labels, not controls.'
      ],
      click: [
        'Click pins a row. Touch has no hover, and an index that only answers to hover is an index that does nothing on a phone.',
        'Clicking the pinned row releases it back to the current role.',
        '"Open the full document" opens the Dossier page concept, where the same history is set as a ruled document with a live cross reference.'
      ],
      responsive: {
        desktop: 'Company name and date range on one line, name left, date right, both on the same baseline. Row band 88px, detail indented to the name\'s left edge.',
        tablet: 'Name drops to clamp(1.5rem, 4.4vw, 2.5rem) and the date keeps its own column. Row band 76px.',
        mobile: 'Below 768px the date leaves the line and sits under the name in mono 10px, because a 3.5rem name and a date cannot share 350px without one of them shrinking to a size that is not a size. The row band becomes 72px, the detail drops the technology chips (a chip row that wraps three times is a list pretending to be a row), and the whole row is a 72px tap target rather than a hover target. Pinning by tap is the interaction model there; hover is not.'
      },
      a11y: [
        'Every row is a real `<button>` with `aria-expanded` reflecting its open state and an `aria-label` reading "Halden Health, Senior Engineer, Apr 2023 - Aug 2025, 2 yr 6 mo".',
        'Focus does exactly what hover does, so the keyboard reader gets the same content in the same place.',
        'ArrowDown and ArrowUp move between rows and preventDefault only when focus is already inside the index.',
        'The detail is always in the DOM and always readable by a screen reader; the accordion only affects its height.',
        'Dates use `font-variant-numeric: tabular-nums`, so the short and long forms crossfade without the right edge moving.',
        'Under `prefers-reduced-motion: reduce`: rows are already in place at mount, the accordion opens in 120ms with no stagger on the detail parts, and the date forms swap without a crossfade.'
      ],
      perf: [
        'No rAF loop, no canvas, no scroll listener. One IntersectionObserver and one ResizeObserver, both disconnected in destroy.',
        'Opening a row is one class toggle. The transition is CSS, so it runs off the main thread except for the accordion height, which is the one exception and is bounded to 380ms.',
        'All five details are in the DOM from the start. Five short blocks of text is cheaper than mounting and unmounting one.',
        'The list reserves its tallest height, so opening a row costs one layout of the list and never a layout of the page below it.'
      ],
      packages: [
        { p: 'none required', w: 'A five row accordion is `grid-template-rows: 0fr -> 1fr` and a class. A headless accordion library would ship a focus manager and a collapsible primitive to do less than this.' },
        { p: 'no framer-motion', w: 'There is no layout animation here. The list height is fixed on purpose.' },
        { p: 'gsap (installed)', w: 'Not used. The entry stagger is `transition-delay: calc(var(--k) * 70ms)` in the cascade, which interrupts correctly for free.' }
      ],
      architecture: [
        { f: 'components/sections/ExperienceRegister.tsx', r: 'Server Component. Renders all five rows including every detail, so the whole history is crawlable and present before hydration.' },
        { f: 'components/experience/RegisterRow.tsx', r: '"use client" leaf only if you need the pin behaviour. The hover and focus states can be pure CSS if you drop pinning, which you should not, because phones.' },
        { f: 'app/experience/dossier/page.tsx', r: 'The "See more" destination. Build it.' }
      ],
      state: [
        '`openIndex: number` and `pinnedIndex: number` are the only state, and both change on intent.',
        'The resting index is derived from the role data at module scope (`roles.find(r => r.current)`), never stored.',
        'Nothing here is per frame, so nothing here is a ref.'
      ],
      typography: [
        'Company: display 400 at clamp(1.75rem, 5vw, 3.5rem), -0.045em, line-height 1.0. Weight 400 rather than 500 because at 3.5rem a 500 reads as shouting.',
        'Dates: mono 11px with tabular-nums, --ink-3 closed and --c-accent open.',
        'Title: mono 10px, 0.16em tracking, uppercase, --c-accent.',
        'Detail prose: 0.9375rem at line-height 1.6, --ink-2, measure capped at 60ch.'
      ],
      color: [
        'The hue here is a cool grey at 100%, 42% and 13%. This family is the document, and a document does not need a colour to be a document.',
        'Open row: name --ink, date --c-accent, rule --c-line. Closed rows while one is open: name --ink-3, which is 5.5:1 and still comfortably readable rather than "greyed out".',
        'Ground --void. Rules at --line, 8% ink.',
        'In light mode: the receded name goes to a 55% neutral rather than a lighter grey, because receding toward white removes far more legibility than receding toward black.'
      ],
      spacing: [
        'Row band 88px desktop, 76px tablet, 72px mobile. That is a comfortable pointer target at every size without the index becoming a menu.',
        'Detail padding-block 0.25rem top and 1.5rem bottom, indented 0 so it starts on the name\'s own left edge.',
        'List reserves 34rem. Section min-height is 1.25 times the scroller height, written in pixels from the scroller rather than in vh.'
      ],
      relationships: [
        'Vertical order encodes chronology, oldest first, which is stated by the dates and not by a label.',
        'Ink weight encodes attention: the open row is at full ink and the rest recede. Nothing encodes importance.',
        'The date lengthening encodes the state change itself, which is why it is the one piece of type allowed to change form.',
        'Row height is constant. Duration is not encoded here, because the Overlap and Standing concepts already encode it and encoding it twice with two different geometries would be two claims with one axis.'
      ],
      acceptance: [
        'On arrival the current role is open and the other four are closed.',
        'Moving the pointer down the index opens each row in turn with no flicker between rows and no page movement below the section.',
        'The section boundary does not move when a row opens or closes, at any window width.',
        'Tab reaches all five rows, focusing one opens it, and ArrowDown and ArrowUp walk the index.',
        'On a touch device, tapping a row pins it open and tapping it again releases it.',
        'At 390px the date sits under the name, the row is a 72px tap target, and there is no horizontal overflow.',
        'With reduced motion on, the rows are in place at mount and the accordion opens in 120ms with no stagger.'
      ]
    }
  });

  /* ==========================================================================
     SECTION 05  -  CLAUSE
     --------------------------------------------------------------------------
     The whole history as two sentences, with four phrases that open. Nothing
     is hidden behind a chevron, nothing is filed under a tab: the summary IS
     the navigation, and every phrase that can be expanded is a phrase that
     was worth writing anyway.

     THE POINT OF VIEW
     -----------------
     Four of the five sections in this area draw something. This one refuses
     to. A reader who wants the argument in six seconds gets it in a sentence
     they can read at their own speed, and a reader who does not believe a
     number can open the number and find the arithmetic underneath it. That
     is a different offer from a chart, and a set of ten directions that does
     not contain one quiet one is not a set of ten directions.

     WHY THE NUMBERS ARE OPENABLE
     ----------------------------
     "24 of those months ran twice" is the kind of claim a reader is entitled
     to check. Opening it prints the two windows, their exact ranges and the
     two companies in each, which is the arithmetic. A claim that cannot be
     opened is a claim asking to be taken on trust.

     SCROLL BUDGET: 1.1 screens closed. Opening a clause grows the section,
     which is correct: the reader asked for it, and disclosure that reserves
     space for content nobody opened is a section that wastes a screen on
     nothing.
     ======================================================================== */

  /* Calendar months and role months per year. This table is the arithmetic
     behind "79 and 103": in 2022 and 2023 the role figure is double the
     calendar figure, and that is the whole area's argument as a number. */
  var YEAR_ROWS = (function buildYearRows() {
    var out = [];
    for (var y = yearOf(SPAN_A); y <= yearOf(SPAN_B - 1); y++) {
      var lo = Math.max(SPAN_A, (y - EPOCH_Y) * 12);
      var hi = Math.min(SPAN_B, (y - EPOCH_Y + 1) * 12);
      var role = 0, live = 0;
      ROLES.forEach(function (r) {
        var o = Math.min(r.b, hi) - Math.max(r.a, lo);
        if (o > 0) { role += o; live++; }
      });
      out.push({ y: y, cal: hi - lo, role: role, live: live });
    }
    return out;
  })();
  var YEAR_MAX = YEAR_ROWS.reduce(function (m, r) { return Math.max(m, r.role); }, 1);

  SE.register({
    area: AREA,
    variant: 'section',
    id: 'experience-section-clause',
    num: 5,
    pageOf: 'experience-page-ledger',
    screens: 1.1,
    name: 'Clause',
    kind: 'DOM / openable sentence',
    accent: '#A582F0',
    tagline: 'The whole history, and the arithmetic underneath it',
    desc: 'Two sentences carry the entire career, and four of their phrases open in place to print the ' +
          'evidence: the roles, the year by year arithmetic, the two overlap windows, and the contract.',
    interaction: 'Click any underlined phrase to open it under the sentence. Several can be open at once, and they stay in the order they are written.',
    hint: 'Click an underlined phrase &middot; It opens below the sentence',

    /* Miniature: three lines of sentence with two lit phrases, and one open
       panel of four rows under it. Twenty four operations. */
    preview: function (ctx, w, h, t, heat) {
      var padX = w * 0.09;
      var iw = w - padX * 2;
      var y = h * 0.16;
      var i;
      var open = Math.floor((t * 0.24) % 2);

      /* the sentence: three ribs, with two clause runs in the accent */
      var runs = [
        [[0, 0.34, 0], [0.38, 0.94, 1]],
        [[0, 0.52, 1], [0.56, 0.88, 0]],
        [[0, 0.46, 0]]
      ];
      for (i = 0; i < runs.length; i++) {
        for (var k = 0; k < runs[i].length; k++) {
          var run = runs[i][k];
          bar(ctx, padX + run[0] * iw, y, (run[1] - run[0]) * iw, 4,
            run[2]
              ? 'rgba(165,130,240,' + (0.75 + heat * 0.2).toFixed(3) + ')'
              : 'rgba(236,236,239,' + (0.3 + heat * 0.12).toFixed(3) + ')');
          if (run[2]) {
            pxLine(ctx, padX + run[0] * iw, Math.round(y + 7) + 0.5,
              padX + run[1] * iw, Math.round(y + 7) + 0.5, 'rgba(165,130,240,0.7)');
          }
        }
        y += h * 0.13;
      }

      /* the open panel */
      y += h * 0.08;
      pxLine(ctx, padX, Math.round(y) + 0.5, w - padX, Math.round(y) + 0.5, 'rgba(165,130,240,0.34)');
      y += h * 0.05;
      for (i = 0; i < 4; i++) {
        bar(ctx, padX, y, iw * 0.16, 2, 'rgba(165,130,240,' + (0.6 + heat * 0.2).toFixed(3) + ')');
        bar(ctx, padX + iw * 0.22, y, iw * (open ? 0.5 : 0.66) * (1 - i * 0.12), 2,
          'rgba(236,236,239,' + (0.18 + heat * 0.06).toFixed(3) + ')');
        y += h * 0.09;
      }
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var b = bag();

      root.classList.add('experience-sec', 'experience-clause');
      tint(root, '#A582F0');

      /* ------------------------------------------------------------- DOM */
      var stage = SE.el('div', 'experience-clause__stage');
      root.appendChild(stage);

      /* The four panels, written once. Each is the evidence for one phrase. */
      var PANELS = [
        {
          key: 'roles',
          label: 'The five',
          html: '<ol class="experience-clause__roles">' + ROLES.map(function (r) {
            return '<li class="experience-clause__role">' +
              '<b>' + r.company + '</b>' +
              '<span>' + r.title + '</span>' +
              '<em class="t-num">' + r.range + '</em>' +
              '<i class="t-num">' + r.durLabel + '</i>' +
            '</li>';
          }).join('') + '</ol>'
        },
        {
          key: 'months',
          label: 'Year by year',
          html: '<table class="experience-clause__years"><thead><tr>' +
            '<th scope="col">Year</th><th scope="col">Calendar</th>' +
            '<th scope="col">Role</th><th scope="col">Live</th>' +
            '<th scope="col"><span class="sr-only">Role months to scale</span></th>' +
            '</tr></thead><tbody>' +
            YEAR_ROWS.map(function (yr) {
              return '<tr' + (yr.role > yr.cal ? ' class="is-double"' : '') + '>' +
                '<th scope="row" class="t-num">' + yr.y + '</th>' +
                '<td class="t-num">' + yr.cal + ' mo</td>' +
                '<td class="t-num">' + yr.role + ' mo</td>' +
                '<td class="t-num">' + yr.live + '</td>' +
                '<td><i class="experience-clause__ybar" style="--w:' +
                  (yr.role / YEAR_MAX).toFixed(4) + ';--c:' + (yr.cal / YEAR_MAX).toFixed(4) +
                  '"></i></td>' +
              '</tr>';
            }).join('') +
            '</tbody></table>' +
            '<p class="experience-clause__foot">The mark on each bar is that year\'s calendar. ' +
            'Where the bar runs past it, two roles were live.</p>'
        },
        {
          key: 'doubled',
          label: 'Both windows',
          html: '<ul class="experience-clause__windows">' + OVERLAPS.map(function (o) {
            return '<li class="experience-clause__window">' +
              '<b class="t-num">' + o.months + ' mo</b>' +
              '<span>' + o.pair[0].company + '<em>and</em>' + o.pair[1].company + '</span>' +
              '<i class="t-num">' + o.range + '</i>' +
            '</li>';
          }).join('') + '</ul>' +
          '<p class="experience-clause__foot">' + DOUBLED + ' months across two windows. ' +
          'Every other month in the span had exactly one role in it.</p>'
        },
        {
          key: 'contract',
          label: 'The second job',
          html: '<div class="experience-clause__contract">' +
            '<b>' + CONTRACT.company + '</b>' +
            '<span class="experience-clause__cmeta t-num">' + CONTRACT.range + '</span>' +
            '<span class="experience-clause__cmeta">' + CONTRACT.kind + '</span>' +
            '<p>' + CONTRACT.was + '</p>' +
            '<ul class="experience-clause__cships">' +
              shipsHtml(CONTRACT, 'experience-clause__cship') + '</ul>' +
            '<p class="experience-clause__foot">Scope: ' + CONTRACT.rung.label.toLowerCase() +
            '. The day jobs it ran beside were ' + LADDER[1].label.toLowerCase() + ' and then ' +
            LADDER[2].label.toLowerCase() + '.</p>' +
          '</div>'
        }
      ];

      /* The sentence. Each `{key}` is replaced by a real button, so the copy
         and the controls are the same text and cannot drift apart. */
      var SENTENCE =
        'There were {roles}. They cover {months}, because {doubled}, and the ' +
        'second of the two was {contract}.';
      var PHRASE = {
        roles: 'five roles',
        months: SUMMARY.calendar + ' months of calendar and ' + SUMMARY.role + ' months of work',
        doubled: SUMMARY.doubled + ' of those months ran twice',
        contract: 'a contract taken deliberately below the day job'
      };

      var head = SE.el('div', 'experience-clause__head');
      head.innerHTML =
        '<p class="experience-clause__sentence">' +
        /* A `<span role="button">` rather than a real `<button>`, and this is
           the one place that trade is right. A button is an atomic inline
           block: it cannot be split across two lines, and the UA stylesheet
           centres its text. At 390px "79 months of calendar and 103 months
           of work" has to wrap inside the sentence, and with a real button
           it wraps as a centred block that breaks the paragraph around it.
           A span splits correctly, so the phrase stays part of the sentence.
           The keyboard contract is restored below: tabindex, aria-expanded,
           aria-controls, and Enter and Space both activate. */
        SENTENCE.replace(/\{(\w+)\}/g, function (_, k) {
          return '<span class="experience-clause__clause" role="button" tabindex="0" data-key="' + k +
                 '" aria-expanded="false" aria-controls="experience-clause-' + k + '">' +
                 PHRASE[k] + '</span>';
        }) +
        '</p>' +
        '<button type="button" class="experience-clause__all">Open all four</button>';
      stage.appendChild(head);

      var panels = SE.el('div', 'experience-clause__panels');
      var byKey = {};
      PANELS.forEach(function (p, i) {
        var sec = SE.el('section', 'experience-clause__panel');
        sec.id = 'experience-clause-' + p.key;
        sec.style.setProperty('--k', i);
        sec.innerHTML =
          '<div class="experience-clause__inner">' +
            '<h3 class="experience-clause__ptitle">' + p.label + '</h3>' +
            p.html +
          '</div>';
        panels.appendChild(sec);
        byKey[p.key] = sec;
      });
      stage.appendChild(panels);

      var more = SE.seeMore('Replay it as a log', ctx.onSeeMore);
      more.classList.add('experience-clause__more', 'is-on');
      stage.appendChild(more);

      /* ----------------------------------------------------------- state */
      var clauses = SE.$$('.experience-clause__clause', head);
      var allBtn = SE.$('.experience-clause__all', head);
      var openState = {};

      function apply(key, on) {
        openState[key] = on;
        byKey[key].classList.toggle('is-open', on);
        clauses.forEach(function (c) {
          if (c.getAttribute('data-key') !== key) return;
          c.classList.toggle('is-open', on);
          c.setAttribute('aria-expanded', String(on));
        });
        var count = 0;
        PANELS.forEach(function (p) { if (openState[p.key]) count++; });
        allBtn.textContent = count === PANELS.length ? 'Close all four' : 'Open all four';
        allBtn.setAttribute('data-all', count === PANELS.length ? '1' : '0');
      }

      clauses.forEach(function (c) {
        function toggle() {
          var k = c.getAttribute('data-key');
          apply(k, !openState[k]);
        }
        b.on(c, 'click', toggle);
        /* Space and Enter, because a span with role="button" does not get
           them for free the way a real button does. */
        b.on(c, 'keydown', function (e) {
          if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
          e.preventDefault();
          toggle();
        });
      });

      b.on(allBtn, 'click', function () {
        var closing = allBtn.getAttribute('data-all') === '1';
        PANELS.forEach(function (p) { apply(p.key, !closing); });
      });

      /* The resting state opens the first clause. A disclosure whose default
         is entirely closed spends its first screen teaching the reader that
         it is a disclosure. */
      apply('roles', true);

      /* Scroll budget in real pixels from the scroller's own height, because
         inside a nested scroller `vh` is the window and the window is not
         the scroller. Closed only: opening a clause grows the section, which
         is correct, because the reader asked for it. */
      function size() {
        var h = ctx.scroller ? ctx.scroller.clientHeight : window.innerHeight;
        stage.style.minHeight = Math.round(h * 1.1) + 'px';
      }
      if (ctx.scroller && typeof ResizeObserver !== 'undefined') {
        b.obs(new ResizeObserver(size)).observe(ctx.scroller);
      }
      size();

      revealOnce(b, ctx.scroller, [head, panels, more], 0.12);
      if (env.reduced) [head, panels, more].forEach(function (n) { n.classList.add('is-in'); });

      /* No ticker, no scrub, no canvas. Everything here is a click. */
      return {
        destroy: function () {
          b.all();
          root.classList.remove('experience-sec', 'experience-clause');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    },

    spec: {
      subtitle: 'Two sentences carrying the whole history, with four phrases that open into the evidence.',
      philosophy: [
        'A reader who wants the argument in six seconds should get it in a sentence. A reader who does not believe a number should be able to open the number and find the arithmetic underneath it.',
        'The summary is the navigation. There is no menu, no tab strip and no chevron; the four things worth expanding are the four phrases that were worth writing.',
        '"24 of those months ran twice" is a claim a reader is entitled to check. Opening it prints both windows, their exact ranges and the two companies in each. A claim that cannot be opened is a claim asking to be taken on trust.',
        'Four of the five sections in this area draw something. This one refuses to, and that refusal is the direction. A set of ten that has no quiet one is not a set of ten.'
      ],
      hierarchy: [
        '1. The sentence: display 400 at clamp(1.25rem, 2.6vw, 2rem), line-height 1.45, measure 48ch. It is the whole section when nothing is open.',
        '2. The four clause phrases: same size, --ink rather than --ink-2, with a 1px accent underline at 42% that goes solid and 2px when open.',
        '3. The panel headings in mono 10px accent.',
        '4. The year table: five columns, all figures tabular, the two doubled years marked with an accent row rule.',
        '5. "Open all four", a quiet text button at 11px --ink-3 under the sentence.'
      ],
      structure: [
        'Section root is ordinary block flow with a `min-height` in pixels from the scroller\'s own height. Closed only; opening grows it.',
        'The sentence is one `<p>` built from a template string with `{key}` placeholders replaced by real `<button aria-expanded aria-controls>` elements, so the copy and the controls are literally the same text and cannot drift apart.',
        'Four `<section>` panels follow in the order the phrases appear, each a `grid-template-rows: 0fr` accordion around an `overflow: hidden` inner.',
        'The year breakdown is a real `<table>` with `<th scope>` on both axes, because it is a table.'
      ],
      interaction: [
        'CLICK a phrase: toggles its panel. Several can be open at once and they stay in sentence order, so the reading order never depends on the click order.',
        '"Open all four" opens every panel and becomes "Close all four" once they all are.',
        'The resting state has the first clause open, because a disclosure whose default is entirely closed spends its first screen teaching the reader that it is a disclosure.',
        'There is no hover state on the phrases beyond the underline lifting to full accent. Opening on hover would open panels the reader did not ask for and move the page under them.',
        'No scroll interaction of any kind. The section is 1.1 screens closed and the reader scrolls through it the way they scroll through a paragraph.'
      ],
      choreography: [
        { n: 'Panel open', d: '`grid-template-rows: 0fr -> 1fr` over 420ms `cubic-bezier(0.32, 0.72, 0, 1)`, the drawer curve, because that is what this is. The one sanctioned use of an animated height: an accordion has no transform equivalent.' },
        { n: 'Panel content', d: 'The inner block runs `opacity 0 -> 1` and `translateY(12px) -> 0` over 340ms `cubic-bezier(0.23, 1, 0.32, 1)` delayed 120ms, so the content is not revealed against an edge that is still moving.' },
        { n: 'Clause underline', d: '`text-decoration-color` from 42% accent to 100% and `text-decoration-thickness` from 1px to 2px over 180ms `ease`, with the ink already at --ink. Feedback, so under 200ms. Nothing translates: the phrase is inside a sentence and a word that moves breaks the line it is set in.' },
        { n: 'Year bars', d: 'Each bar `transform: scaleX(0) -> scaleX(1)` from the left over 520ms with `transition-delay: calc(var(--r) * 45ms)`, running only when its panel opens. Seven bars at 45ms is 315ms of stagger, which is short enough to read as one gesture.' },
        { n: 'Entry', d: 'The sentence and the panel stack `opacity 0 -> 1` with `translateY(16px) -> 0` over 620ms `cubic-bezier(0.23, 1, 0.32, 1)`. One IntersectionObserver at threshold 0.12, unobserved per node.' },
        { n: 'What does NOT animate', d: 'The sentence text itself. A summary that assembles word by word is a summary you cannot read until it has finished performing.' }
      ],
      scroll: [
        'Budget: 1.1 screens closed, set as a min-height in pixels computed from the scroller\'s own height. Inside a nested scroller `vh` measures the window and the window is not the scroller.',
        'Opening a clause grows the section and pushes the rest of the page down. That is correct: the reader asked for it. Reserving space for content nobody opened would waste a screen on nothing.',
        'No rail, no pin, no scrub, no scroll listener. One IntersectionObserver for the entry reveal.',
        'There is no ticker subscription in this concept at all.'
      ],
      hover: [
        'Gated behind `@media (hover: hover) and (pointer: fine)`.',
        'A clause phrase lifts its underline to full accent and its ink to --ink. That is the whole hover vocabulary.',
        'Opening on hover is refused: it would open panels the reader did not ask for and move the page while they were reading it.'
      ],
      click: [
        'Four phrases, one "Open all four", and the section exit. Six controls in the whole section, and the table has none.',
        '"Replay it as a log" opens the Ledger page concept, where the same history runs as a dated event stream with a draggable playhead.'
      ],
      responsive: {
        desktop: 'Sentence at 2rem over 48ch. Year table in five columns with the scale bar as the fifth. Panels indented 0, full measure.',
        tablet: 'Sentence drops to clamp(1.25rem, 3.2vw, 1.625rem). The table keeps all five columns; at this width the bar is still 8rem wide, which is enough to compare seven years.',
        mobile: 'Below 768px the sentence sets at clamp(1.125rem, 5.2vw, 1.5rem) over the full width. The year table drops the scale bar and the "Live" column and keeps year, calendar and role, because three numbers per row is what fits at 390px without the figures reaching 9px. The role list becomes two lines per role instead of one. Every panel is full bleed to the section gutter. The clause underlines get 0.15em of extra descender clearance, because at 1.5rem an underline under a "y" needs it.'
      },
      a11y: [
        'Each phrase is a `<span role="button" tabindex="0">` with `aria-expanded` and `aria-controls` pointing at its panel id. A real `<button>` is an atomic inline block: it cannot split across two lines and the UA stylesheet centres its text, so at 390px a wrapping phrase would break the paragraph around it. Enter and Space are wired by hand and a focus-visible ring is drawn, which restores everything a button would have given.',
        'The panels are `<section>` elements with an `<h3>`, so a screen reader can navigate to them by heading.',
        'The year breakdown is a real `<table>` with `<th scope="col">` and `<th scope="row">`, and the bar column has a visually hidden column header.',
        'Every figure uses `font-variant-numeric: tabular-nums`.',
        'Colour is never the only signal: the doubled years are marked by a "2" in the Live column as well as by an accent rule.',
        'Under `prefers-reduced-motion: reduce`: panels open in 140ms with no content translate and the year bars are at full width immediately.'
      ],
      perf: [
        'No rAF loop, no canvas, no scroll listener. One IntersectionObserver and one ResizeObserver, both disconnected in destroy.',
        'All four panels are in the DOM from mount. Four short blocks of text and a seven row table is cheaper than mounting and unmounting them.',
        'Opening a panel is one class toggle. The only layout work is the accordion height, bounded to 420ms.',
        'The year table is computed once at module scope from the role data, never in a render.'
      ],
      packages: [
        { p: 'none required', w: 'Four accordions and a table. A disclosure library would ship a focus manager to do less than `aria-expanded` and a class.' },
        { p: 'no charting library', w: 'The year bars are `transform: scaleX(var(--w))` on a 2px div. That is the entire chart.' },
        { p: 'gsap (installed)', w: 'Not used. The stagger is `transition-delay: calc(var(--r) * 45ms)` in the cascade.' }
      ],
      architecture: [
        { f: 'components/sections/ExperienceClause.tsx', r: 'Server Component. Renders the sentence and all four panels, so the entire history is in the HTML and crawlable whether or not anything is opened.' },
        { f: 'components/experience/ClauseSentence.tsx', r: '"use client" leaf. Owns the four open flags and renders the buttons. The panels stay server-rendered; only their open class is client state.' },
        { f: 'lib/experience/arithmetic.ts', r: 'Pure: `yearRows()`, `overlaps()`, `totals()`. The numbers in the sentence and the numbers in the panels come from the same function, which is the only way they can be guaranteed to agree.' },
        { f: 'app/experience/ledger/page.tsx', r: 'The "See more" destination. Build it.' }
      ],
      state: [
        'One `Record<string, boolean>` of four flags. Nothing else.',
        'Nothing is per frame, so nothing is a ref.',
        'The sentence text is a template with `{key}` placeholders, so the phrase copy lives in one place and the button labels cannot drift from it.'
      ],
      typography: [
        'Sentence: display 400 at clamp(1.25rem, 2.6vw, 2rem), line-height 1.45, -0.02em, measure 48ch. 400 rather than 500 because this is prose, not a heading.',
        'Clause phrases: same face and size, --ink, underlined with `text-decoration` rather than a border, 1px at `text-underline-offset: 0.18em`, going to 2px accent when open. A border draws one rule around the whole inline box; a text decoration draws on every line fragment and knows where the descenders are.',
        'Panel headings: mono 10px, 0.18em tracking, uppercase, accent.',
        'Table figures: mono 11px tabular. Table body text 0.8125rem.',
        'Panel prose: 0.875rem at line-height 1.6, --ink-2.'
      ],
      color: [
        'One hue at four alphas: 100% for an open clause underline, 42% for a closed one, 24% for the doubled year rules, and 13% for the panel ground.',
        'The sentence sets in --ink-2 with the four phrases at --ink, so the openable parts are brighter than the words around them before any hover happens.',
        'Ground --void. Panel ground is a 5.5% accent wash with a 1px accent left rule, which is the only fill in the section.',
        'In light mode: the closed underline goes from 42% to 55% and the panel wash from 5.5% to 7%, because thin washes disappear on white.'
      ],
      spacing: [
        'Sentence measure 48ch, margin-bottom clamp(1.5rem, 3vh, 2.25rem).',
        'Panels separated by 0.75rem. Panel inner padding 1rem 1.25rem.',
        'Table rows 2rem with a 1px rule between. Section min-height 1.1 times the scroller height.'
      ],
      relationships: [
        'A phrase encodes a claim; its panel encodes the evidence for that claim. Nothing opens that is not evidence for the words on top of it.',
        'Panel order encodes sentence order, never click order, so two readers who open the same four panels in different orders read the same page.',
        'In the year table, bar length encodes role months and the mark on the bar encodes calendar months. Where the bar runs past the mark, two roles were live.',
        'The underline weight encodes open state and nothing else.'
      ],
      acceptance: [
        'On arrival the sentence is fully readable and the first clause is open under it.',
        'Clicking any phrase opens its panel directly under the sentence, and the four panels always appear in sentence order regardless of the order they were opened.',
        'The year table sums to 79 calendar months and 103 role months, and exactly two rows are marked as doubled.',
        'The overlap panel prints two windows whose months sum to 24.',
        '"Open all four" opens everything and then reads "Close all four".',
        'Tab reaches all four phrases and the "Open all four" button, and every phrase reports its state through `aria-expanded`.',
        'At 390px the table has three columns and the sentence sets over the full width with no horizontal overflow.',
        'With reduced motion on, panels open in 140ms and the year bars are at full width immediately.'
      ]
    }
  });

  /* ~~SENTINEL~~ */

})(window.SE = window.SE || {});

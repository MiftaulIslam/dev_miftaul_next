/* ============================================================================
   AREA: NAVIGATION  -  10 concepts (5 page, 5 section)
   ----------------------------------------------------------------------------
   Navigation is chrome, not content. It is seen hundreds of times a session, so
   the frequency gate from motion design applies harder here than anywhere else
   in this explorer: an animation that delights on the first view is an
   irritation on the fiftieth. The rule applied throughout this file is

       constant interactions  ->  fast and subtle, or nothing
       rare interactions      ->  the whole expressive budget

   So hovering a link is a 140ms colour change and nothing else, while opening a
   mega menu is a 900ms staged reveal. The command palette, which a power user
   opens dozens of times a day, has almost no open animation at all - that is
   deliberate, not an omission (Raycast ships none for the same reason).

   WHY EVERY CONCEPT RENDERS A FAUX PAGE
   -------------------------------------
   Chrome cannot be judged in isolation. A navbar that hides on scroll is
   meaningless without something to scroll, and a dock is meaningless without a
   page for it to float over. So each concept builds a short, deliberately quiet
   page inside its own root: real headings, real body copy, real section
   anchors. The page is styled down on purpose so it never competes with the
   navigation being evaluated.

   HOW SCROLL WORKS IN BOTH MODES
   ------------------------------
   In `section` mode the concept is one block inside the shell's own scroller,
   so the faux page is ordinary flow content and the chrome is `position:
   sticky` inside the concept root - it holds while the section is on screen and
   releases when the reader moves past, which is exactly how real page chrome
   behaves. In `page` mode there is no outer scroller, so the concept root
   becomes the scroller itself. One code path, two hosts.
   ========================================================================== */
(function (SE) {
  'use strict';

  var env = SE.env;
  var M = SE.math;

  /* ======================================================================
     SHARED DATA
     ----------------------------------------------------------------------
     Invented in this file per the contract, but invented to be plausible.
     Labels name their destination rather than hiding behind an umbrella:
     "Index" and "Stack" tell you what is there, "Home" and "More" do not.
     ====================================================================== */

  var LINKS = [
    { id: 'index',   label: 'Index',   icon: 'index',   meta: 'Start here' },
    { id: 'work',    label: 'Work',    icon: 'work',    meta: 'Eleven builds, six still running' },
    { id: 'stack',   label: 'Stack',   icon: 'stack',   meta: 'What it is made of' },
    { id: 'studio',  label: 'Studio',  icon: 'studio',  meta: 'How the work happens' },
    { id: 'writing', label: 'Writing', icon: 'writing', meta: 'Notes on the craft' },
    { id: 'contact', label: 'Contact', icon: 'contact', meta: 'One slot open in Q1' }
  ];

  var PROJECTS = [
    { name: 'Kestrel Ledger',  note: 'Double entry accounting for freight brokers', year: '2025' },
    { name: 'Halden Transit',  note: 'Live arrivals for a regional bus network',    year: '2024' },
    { name: 'Peartree Health', note: 'Intake and triage across five clinics',       year: '2024' },
    { name: 'Fieldnote',       note: 'Offline first survey capture',                year: '2023' }
  ];

  var NOTES = [
    { title: 'The migration you cannot roll back', date: 'Mar 2025' },
    { title: 'Reading a query plan out loud',      date: 'Nov 2024' },
    { title: 'Why the queue is the product',       date: 'Jun 2024' }
  ];

  /* Body copy for the faux page. Quiet on purpose: it exists so the chrome has
     something to sit over, and it must never pull the eye off the chrome. */
  var COPY = {
    index: {
      h: 'Full stack, mostly the parts nobody sees',
      p: 'I build the layer between a product idea and the database, then make sure it ' +
         'still holds up on a Tuesday afternoon when the traffic is real.'
    },
    work: {
      h: 'Selected work',
      p: 'Eleven projects shipped. Six are still in production and two of those I no longer maintain, ' +
         'which is the outcome I am proudest of.'
    },
    stack: {
      h: 'What it runs on',
      p: 'TypeScript from the browser to the worker, Postgres for anything that has to survive a ' +
         'restart, and as little else as the problem will allow.'
    },
    studio: {
      h: 'How the work happens',
      p: 'One person. Three weeks of shaping before any product code, a written decision log you keep ' +
         'after I leave, and a handover that assumes I will not be around to explain it.'
    },
    writing: {
      h: 'Notes',
      p: 'Written down mostly so I stop making the same mistake twice.'
    },
    contact: {
      h: 'Open for one project in Q1',
      p: 'Write with the problem, not the specification. A paragraph is usually enough to tell whether ' +
         'we should be talking.'
    }
  };

  /* ======================================================================
     ICONS
     ----------------------------------------------------------------------
     Authored inline SVG on one 24x24 grid at one stroke weight (1.5, round
     caps, round joins). No emoji and no unicode glyph standing in for a mark:
     a glyph is font dependent and cannot take a design token.
     ====================================================================== */

  var ICONS = {
    index:   'M4 7h16M4 12h11M4 17h7',
    work:    'M4 8h16v11H4zM9 8V6.5A2.5 2.5 0 0 1 11.5 4h1A2.5 2.5 0 0 1 15 6.5V8',
    stack:   'M12 4 3.5 8.6 12 13.2l8.5-4.6L12 4M3.5 13.4 12 18l8.5-4.6',
    studio:  'M12 3.2 4.2 7.6v8.8L12 20.8l7.8-4.4V7.6L12 3.2M12 12.2 4.2 7.6M12 12.2l7.8-4.6M12 12.2v8.6',
    writing: 'M4.5 19.5h3.6L19.2 8.4a1.9 1.9 0 0 0-2.7-2.7L5.4 16.8v2.7M14.6 8.2l1.9 1.9',
    contact: 'M4 6h16v12H4zM4.4 6.6 12 12.7l7.6-6.1',
    search:  'M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M19.5 19.5l-3.9-3.9',
    close:   'M6.5 6.5l11 11M17.5 6.5l-11 11',
    menu:    'M4 8.5h16M4 15.5h16',
    ret:     'M19.5 5.5v5a3 3 0 0 1-3 3H5m0 0 4-4m-4 4 4 4',
    out:     'M8.5 15.5 15.5 8.5M9.5 8.5h6v6',
    down:    'M6 9.5l6 6 6-6',
    right:   'M9.5 5.5l6 6.5-6 6.5',
    cmd:     'M9.5 9.5h5v5h-5zM9.5 9.5V7.6A2.05 2.05 0 1 0 7.45 9.5H9.5M14.5 9.5V7.6A2.05 2.05 0 1 1 16.55 9.5H14.5' +
             'M9.5 14.5v1.9A2.05 2.05 0 1 1 7.45 14.5H9.5M14.5 14.5v1.9a2.05 2.05 0 1 0 2.05-1.9H14.5',
    dot:     'M12 10.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8'
  };

  function icon(name, cls) {
    return '<svg class="nav-ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" ' +
           'aria-hidden="true" focusable="false"><path d="' + (ICONS[name] || ICONS.dot) + '"/></svg>';
  }

  /* ======================================================================
     SMALL UTILITIES
     ====================================================================== */

  var uidN = 0;
  function uid(prefix) { uidN += 1; return 'nav-' + prefix + '-' + uidN; }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* A raised cosine (Hann) window. This is the falloff behind the dock, and the
     reason it is here rather than a linear ramp: a linear tent has a corner at
     the cursor and another at each edge of the influence radius, and the eye
     reads those corners as stepping. A Hann window is smooth in value and in
     slope at every point, so the magnification swells and releases instead of
     switching on. f(0) = 1, f(+/-1) = 0, f'(0) = f'(+/-1) = 0. */
  function hann(u) {
    u = Math.abs(u);
    return u >= 1 ? 0 : 0.5 * (1 + Math.cos(Math.PI * u));
  }

  /* ======================================================================
     HOST  -  where the page scrolls and where the chrome sticks
     ====================================================================== */

  function makeHost(root, ctx) {
    var mode = (ctx && ctx.mode) || 'page';
    var scroller = (mode === 'section' && ctx && ctx.scroller) ? ctx.scroller : root;
    var own = scroller === root;

    root.classList.add('nav-c');
    if (own) root.classList.add('nav-scroll');

    /* A zero-height sticky layer. Chrome is positioned absolutely inside it, so
       a bar can sit at the top of the viewport and a dock at the bottom without
       either one taking part in layout or costing a reflow. */
    var layer = SE.el('div', 'nav-layer');

    var ro = null;
    function sizeVar() {
      var h = scroller.clientHeight || window.innerHeight;
      layer.style.setProperty('--nav-vh', h + 'px');
    }
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(sizeVar);
      ro.observe(scroller);
    } else {
      window.addEventListener('resize', sizeVar);
    }
    sizeVar();

    /* WCAG 2.2 "focus not obscured": a sticky bar over a scroll container will
       cover a focused control that the browser scrolls into view unless the
       container reserves room for it. One line, and it is the difference
       between a nav that is accessible and one that only looks accessible. */
    var prevPad = scroller.style.scrollPaddingTop;
    var prevPadB = scroller.style.scrollPaddingBottom;

    var api = {
      mode: mode,
      isPage: mode === 'page',
      root: root,
      scroller: scroller,
      own: own,
      layer: layer,
      /* Section anchors must be unique in the document: two concepts can be in
         the DOM at once, and a duplicate id would send a link to the wrong one. */
      uidPrefix: uid('p'),

      reserve: function (top, bottom) {
        scroller.style.scrollPaddingTop = (top || 0) + 'px';
        scroller.style.scrollPaddingBottom = (bottom || 0) + 'px';
      },

      /* Scroll to one of the faux page's sections inside whichever element is
         actually doing the scrolling. Measured from rects rather than
         offsetTop, because offsetParent is not guaranteed to be the scroller. */
      goTo: function (id, offset) {
        var el = SE.$('#' + id, root);
        if (!el) return;
        var top = scroller.scrollTop +
                  el.getBoundingClientRect().top -
                  scroller.getBoundingClientRect().top -
                  (offset || 0);
        top = Math.max(0, top);
        if (env.reduced || typeof scroller.scrollTo !== 'function') {
          scroller.scrollTop = top;
        } else {
          scroller.scrollTo({ top: top, behavior: 'smooth' });
        }
      },

      destroy: function () {
        if (ro) ro.disconnect();
        else window.removeEventListener('resize', sizeVar);
        scroller.style.scrollPaddingTop = prevPad;
        scroller.style.scrollPaddingBottom = prevPadB;
      }
    };
    return api;
  }

  /* ======================================================================
     SCROLL STATE
     ----------------------------------------------------------------------
     One passive listener per concept that records scrollTop and nothing else.
     No layout work happens in the listener; every concept reads the recorded
     value from inside the shared ticker. Never a window scroll listener.
     ====================================================================== */

  function watchScroll(scroller) {
    var s = { y: 0, max: 1, atEnd: false };
    function read() {
      s.y = scroller.scrollTop;
      s.max = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
      s.atEnd = s.y >= s.max - 2;
    }
    scroller.addEventListener('scroll', read, { passive: true });
    read();
    return {
      state: s,
      read: read,
      destroy: function () { scroller.removeEventListener('scroll', read); }
    };
  }

  /* ======================================================================
     SECTION SPY
     ----------------------------------------------------------------------
     A band across the middle of the viewport; whichever section crosses it is
     the one being read. IntersectionObserver only, per the contract, and the
     asymmetric margins put the band slightly above centre because readers sit
     above the middle of what they are reading.
     ====================================================================== */

  function spySections(host, ids, onChange) {
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        var id = entries[i].target.id;
        if (id !== current) { current = id; onChange(id); }
      }
    }, {
      root: host.scroller,
      rootMargin: '-42% 0px -52% 0px',
      threshold: 0
    });
    ids.forEach(function (id) {
      var el = SE.$('#' + id, host.root);
      if (el) io.observe(el);
    });
    return { destroy: function () { io.disconnect(); } };
  }

  /* ======================================================================
     FOCUS TRAP
     ----------------------------------------------------------------------
     Every overlay in this area uses this: Tab wraps at the overlay boundary,
     Escape closes, focus returns to the trigger. The focusin guard is what
     makes it a real trap rather than a Tab handler - without it, focus that
     escapes by any other route (a click, a browser find bar) never comes back.
     Both handlers stop propagation so the stage's own Tab wrap and Escape
     close do not fire underneath.
     ====================================================================== */

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusablesIn(el) {
    return SE.$$(FOCUSABLE, el).filter(function (n) {
      return n.offsetWidth > 0 || n.offsetHeight > 0 || n.getClientRects().length > 0;
    });
  }

  function makeTrap(container, onEscape) {
    var returnTo = null;
    var on = false;

    function onKey(e) {
      if (!on) return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== 'Tab') return;
      var f = focusablesIn(container);
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      var a = document.activeElement;
      if (e.shiftKey && (a === first || !container.contains(a))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (a === last || !container.contains(a))) {
        e.preventDefault(); first.focus();
      }
      e.stopPropagation();
    }

    function onFocusIn(e) {
      if (!on) return;
      if (container.contains(e.target)) return;
      var f = focusablesIn(container);
      if (f.length) f[0].focus();
    }

    container.addEventListener('keydown', onKey);

    return {
      activate: function (trigger, initial) {
        returnTo = trigger || document.activeElement;
        on = true;
        document.addEventListener('focusin', onFocusIn, true);
        var target = initial || focusablesIn(container)[0];
        if (target) target.focus({ preventScroll: true });
      },
      release: function () {
        if (!on) return;
        on = false;
        document.removeEventListener('focusin', onFocusIn, true);
        if (returnTo && document.contains(returnTo)) {
          returnTo.focus({ preventScroll: true });
        }
        returnTo = null;
      },
      destroy: function () {
        on = false;
        container.removeEventListener('keydown', onKey);
        document.removeEventListener('focusin', onFocusIn, true);
      }
    };
  }

  /* ======================================================================
     THE FAUX PAGE
     ----------------------------------------------------------------------
     Restrained by design. Small type, one hairline per block, no images, no
     cards. Its only job is to give the chrome a page to react to.
     ====================================================================== */

  function fauxPage(host, opts) {
    opts = opts || {};
    var page = SE.el('div', 'nav-page');
    var ids = [];

    LINKS.forEach(function (link, i) {
      if (opts.only && opts.only.indexOf(link.id) === -1) return;

      var id = host.uidPrefix + '-' + link.id;
      ids.push(id);

      var sec = SE.el('section', 'nav-page__sec');
      sec.id = id;
      sec.setAttribute('aria-labelledby', id + '-h');

      var body =
        '<h2 class="nav-page__h" id="' + id + '-h">' + COPY[link.id].h + '</h2>' +
        '<p class="nav-page__p">' + COPY[link.id].p + '</p>';

      if (link.id === 'work') {
        body += '<ul class="nav-page__rows">' + PROJECTS.map(function (p) {
          return '<li><span class="nav-page__rn">' + p.name + '</span>' +
                 '<span class="nav-page__rr">' + p.note + '</span>' +
                 '<span class="nav-page__ry t-num">' + p.year + '</span></li>';
        }).join('') + '</ul>';
      } else if (link.id === 'writing') {
        body += '<ul class="nav-page__rows">' + NOTES.map(function (n) {
          return '<li><span class="nav-page__rn">' + n.title + '</span>' +
                 '<span class="nav-page__rr"></span>' +
                 '<span class="nav-page__ry t-num">' + n.date + '</span></li>';
        }).join('') + '</ul>';
      } else if (link.id === 'stack') {
        body += '<p class="nav-page__tags">' +
          ['TypeScript', 'Postgres', 'Next.js', 'Redis', 'Fly.io', 'Playwright'].map(function (t) {
            return '<span>' + t + '</span>';
          }).join('') + '</p>';
      }

      sec.innerHTML = body;
      sec.style.setProperty('--i', String(i));
      page.appendChild(sec);
    });

    page.ids = ids;
    return page;
  }

  /* The "see more" affordance every section concept owes the reader. Placed in
     the faux page rather than in the chrome, because putting it in the chrome
     would change the very thing being evaluated. */
  function attachSeeMore(page, ctx, label) {
    if (!ctx || typeof ctx.onSeeMore !== 'function') return null;
    var wrap = SE.el('div', 'nav-page__more');
    var btn = SE.seeMore(label || 'Open the full navigation', ctx.onSeeMore);
    wrap.appendChild(btn);
    page.appendChild(wrap);
    return btn;
  }

  /* ======================================================================
     FUZZY MATCH  (command palette)
     ----------------------------------------------------------------------
     Subsequence match with a score. Consecutive characters and matches at a
     word boundary are worth far more than a scattered hit, which is the whole
     difference between a filter that reads your mind and one that returns
     everything. Returns null when the needle is not a subsequence at all.
     ====================================================================== */

  function fuzzy(needle, hay) {
    if (!needle) return { score: 0, hits: [] };
    var n = needle.toLowerCase();
    var h = hay.toLowerCase();
    var hits = [];
    var score = 0;
    var cursor = 0;
    var prev = -2;

    for (var i = 0; i < n.length; i++) {
      var c = n.charAt(i);
      if (c === ' ') { prev = -2; continue; }
      var found = h.indexOf(c, cursor);
      if (found < 0) return null;
      var boundary = found === 0 || !/[a-z0-9]/.test(h.charAt(found - 1));
      score += (found === prev + 1 ? 9 : 1) + (boundary ? 7 : 0) + (found === 0 ? 5 : 0);
      hits.push(found);
      prev = found;
      cursor = found + 1;
    }
    /* Shorter targets win ties: "Work" should outrank "Network settings". */
    return { score: score - h.length * 0.06, hits: hits };
  }

  function markHits(text, hits) {
    if (!hits || !hits.length) return esc(text);
    var out = '';
    var set = {};
    for (var k = 0; k < hits.length; k++) set[hits[k]] = 1;
    for (var i = 0; i < text.length; i++) {
      var ch = esc(text.charAt(i));
      out += set[i] ? '<b>' + ch + '</b>' : ch;
    }
    return out;
  }

  /* ==========================================================================
     PAGE 01  -  ATRIUM
     --------------------------------------------------------------------------
     A full screen mega menu. The bar carries the three destinations people ask
     for by name; everything else lives behind one disclosure, so the bar never
     grows a second row and never needs a hover to reach a destination.

     The reveal is the one place in this concept that spends any motion budget.
     Opening a mega menu is a rare, deliberate act, so it gets a real staged
     entrance: a plate drops from the top edge, where the trigger is, so the
     panel comes from the thing you pressed. Only once it has landed does the
     content resolve. Closing is the same path in reverse at roughly 70% of the
     duration, because leaving should never feel like waiting.
     ========================================================================== */

  SE.register({
    area: 'nav',
    variant: 'page',
    id: 'nav-page-megamenu',
    num: 1,
    name: 'Atrium',
    kind: 'Overlay / staged reveal',
    accent: '#B37CFF',
    tagline: 'One door, and everything is behind it',
    desc: 'A bar that stays honest about its width by putting the long tail behind a single disclosure. ' +
          'The panel drops from the edge it was opened from and resolves its columns in sequence.',
    interaction: 'Press Everything, or Tab to it and press Enter. Escape closes and returns you to the trigger.',
    hint: 'Open Everything &middot; <kbd>Esc</kbd> closes',

    preview: function (ctx, w, h, t, heat) {
      var barY = Math.round(h * 0.16);
      /* One slow open and close cycle, so the card shows the actual gesture. */
      var cycle = (t * 0.34) % 1;
      var p = cycle < 0.62 ? Math.min(1, cycle / 0.30) : Math.max(0, 1 - (cycle - 0.62) / 0.22);
      p = p * p * (3 - 2 * p);
      var panelH = h * 0.62 * p;

      ctx.fillStyle = 'rgba(179,124,255,' + (0.09 + heat * 0.05).toFixed(3) + ')';
      ctx.fillRect(0, barY, w, panelH);
      ctx.strokeStyle = 'rgba(179,124,255,' + (0.34 + heat * 0.26).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(barY + panelH) + 0.5);
      ctx.lineTo(w, Math.round(barY + panelH) + 0.5);
      ctx.stroke();

      for (var i = 0; i < 4; i++) {
        var lp = M.clamp((p - 0.42 - i * 0.11) / 0.38, 0, 1);
        if (lp <= 0) continue;
        var ly = barY + h * 0.14 + i * h * 0.115;
        ctx.fillStyle = 'rgba(236,236,239,' + (0.20 + lp * 0.45).toFixed(3) + ')';
        ctx.fillRect(w * 0.10, ly, (w * 0.34) * lp, 3);
        ctx.fillStyle = 'rgba(236,236,239,0.12)';
        ctx.fillRect(w * 0.56, ly + 1, (w * 0.26) * lp, 1);
      }

      /* The bar is drawn last so the plate reads as sliding out from under it. */
      ctx.fillStyle = '#0b0b0f';
      ctx.fillRect(0, 0, w, barY);
      ctx.strokeStyle = 'rgba(236,236,239,0.14)';
      ctx.beginPath();
      ctx.moveTo(0, barY + 0.5); ctx.lineTo(w, barY + 0.5);
      ctx.stroke();
      ctx.fillStyle = 'rgba(236,236,239,0.55)';
      ctx.fillRect(w * 0.08, barY * 0.44, w * 0.13, 2);
      ctx.fillStyle = 'rgba(179,124,255,0.95)';
      ctx.fillRect(w * 0.82, barY * 0.36, w * 0.10, 2);
      ctx.fillRect(w * 0.82, barY * 0.56, w * 0.10, 2);
    },

    spec: {
      subtitle: 'A mega menu that drops from the edge it was opened from',
      philosophy: [
        'A navigation bar has a fixed budget: one line, under 80px. The moment a portfolio grows past five destinations the honest answer is not a smaller font or a second row, it is a disclosure. This concept puts the three destinations people ask for by name in the bar and everything else one press away.',
        'The panel comes from the top edge because that is where the trigger is. A menu that fades in at the centre of the screen has thrown away the only spatial information it had.',
        'Content resolves after the plate lands, never during. Reading a moving surface is work, and there is nothing to read until the surface has stopped.'
      ],
      hierarchy: [
        '1. The five destinations at clamp(1.75rem, 3.4vw, 2.75rem), weight 400. They are the reason the panel exists.',
        '2. Their meta lines at 11px mono in ink-3. Present, never competing.',
        '3. Recent work: four rows of name plus year, hairline separated.',
        '4. The contact block, with the availability line in the signature hue. One coloured thing in the panel.',
        '5. The bar stays visible above the panel so the trigger never disappears from under the pointer.'
      ],
      structure: [
        'A <header> on a fixed 64px row: wordmark, three inline <a>, and the disclosure <button aria-expanded aria-controls>.',
        'The panel lives in a zero height position:sticky layer, absolutely positioned at height 100dvh. role="dialog" aria-modal="true" aria-labelledby its own heading.',
        'Panel grid is 7fr for destinations and 5fr split into two stacked blocks. Not three equal columns.',
        'Closed state is visibility:hidden, which removes the panel from the tab order and the accessibility tree at once, with no aria-hidden and no tabindex sweep.'
      ],
      interaction: [
        'The trigger toggles. aria-expanded flips with the state, never after it.',
        'On open the page content behind becomes inert, focus moves to the first destination, and Tab wraps at the panel boundary.',
        'Closing: Escape, the close button, a click on the strip of page below the panel, or the trigger again. Focus returns to the trigger every time.',
        'A document focusin listener pulls focus back into the panel if it escapes by any route other than Tab. Without it this is a Tab handler, not a trap.',
        'Destinations preventDefault, scroll the container with behavior:smooth (auto under reduced motion), and close the panel first so the reader watches the arrival rather than watching it through a panel.'
      ],
      choreography: [
        { n: 'Plate drop', d: 'transform translate3d(0,-100%,0) to none over 520ms cubic-bezier(0.32, 0.72, 0, 1). Over 300ms on purpose: a full frame surface arriving is a cinematic moment, not UI feedback.' },
        { n: 'Content resolve', d: 'opacity 0 to 1 with translate3d(0,14px,0) to none, 380ms cubic-bezier(0.23, 1, 0.32, 1), delay 180ms + index * 34ms. Above 40ms a stagger starts reading as a queue instead of one gesture.' },
        { n: 'Trigger mark', d: 'The two menu bars rotate to 45deg and -45deg and translate to meet, 220ms cubic-bezier(0.23, 1, 0.32, 1), transform-box: fill-box. The mark states the current state rather than labelling the next one.' },
        { n: 'Close', d: 'Content opacity to 0 over 120ms with no translate and no stagger; plate translate3d(0,-100%,0) over 380ms cubic-bezier(0.77, 0, 0.175, 1). 73% of the entrance, the ratio at which an exit stops feeling like a wait.' },
        { n: 'Link hover', d: 'colour 140ms ease plus a 1px rule scaleX(0) to scaleX(1) from the left over 220ms cubic-bezier(0.23, 1, 0.32, 1). Nothing moves: a destination that shifts under the pointer is a destination you can miss.' }
      ],
      scroll: [
        'The page behind does not scroll while the panel is open. The container takes overflow:hidden and the previous value is restored on close.',
        'The bar is position:sticky, not fixed, so it belongs to its scroll container and works unchanged when nested inside another scroller.',
        'scroll-padding-top equal to the bar height is set on the container so a focused control is never scrolled underneath the bar.'
      ],
      hover: [
        'Every hover rule sits inside @media (hover: hover) and (pointer: fine).',
        'Bar links: ink-2 to ink over 140ms. That is the entire hover treatment for something seen on every screen of the site.',
        'Panel destinations get the underline wipe plus the meta line stepping from ink-4 to ink-3.',
        'Hover never reaches a destination on its own. There is no hover-opened dropdown anywhere in this concept.'
      ],
      click: [
        'Trigger toggles the panel and moves focus.',
        'Destination closes the panel, then scrolls.',
        'Recent work rows are real links to the project route.',
        'The strip of page visible below the panel closes it, and that strip is left visible on purpose so the escape route is obvious.'
      ],
      responsive: {
        desktop: 'Bar at 64px with three inline links. Panel is a 7/5 grid, destinations up to 2.75rem, panel padding clamp(2rem, 5vw, 5rem).',
        tablet: 'Bar drops to two inline links. Panel becomes one column with recent work and contact side by side beneath the destinations.',
        mobile: 'Below 768px the bar carries only the wordmark and the trigger, and the trigger grows to 48x48. The panel becomes a full height single column that scrolls internally, destinations drop to 2rem, and recent work collapses to name plus year with the description removed. A different panel, not a narrower one.'
      },
      a11y: [
        'Real <nav>, real <a>, real <button>. aria-expanded on the trigger, aria-controls to the panel id, aria-current="page" on the destination matching the section in view.',
        'Panel is role="dialog" aria-modal="true" with an accessible name from its own heading.',
        'Focus is trapped while open, restored to the trigger on close, and pulled back by a document focusin guard if it escapes.',
        'Escape closes and calls preventDefault so an outer dialog does not also close.',
        'Every target is at least 44x44 with at least 8px between, including bar links, which are padded rather than sized to their text.',
        'Under prefers-reduced-motion the plate cross fades over 140ms instead of translating, and the content stagger becomes one 120ms opacity change with no delay and no translate.'
      ],
      perf: [
        'Zero per frame work. The whole concept is CSS transitions on transform and opacity plus one IntersectionObserver for the active section.',
        'The stagger is transition-delay from a --i custom property: one style recalculation on open rather than one tween per element.',
        'The panel stays in the DOM. Building sixteen nodes on every open is measurable on a mid range phone and the panel is small enough that keeping it costs nothing.',
        'No backdrop-filter on the panel. It is opaque, so a blur would be paying for an effect nobody can see.'
      ],
      packages: [
        { p: 'none required', w: 'A disclosure, a trap and two transitions. A headless menu library here buys focus management you would immediately override to get the panel geometry.' },
        { p: 'no framer-motion', w: 'AnimatePresence exists to animate an element out before unmounting it. This panel never unmounts, so there is nothing for it to solve.' },
        { p: 'gsap (installed)', w: 'Do not use it here. A CSS transition retargets from its current value when the user closes mid-open; a timeline has to be reversed by hand.' }
      ],
      architecture: [
        { f: 'components/navbar/Navbar.tsx', r: 'Server rendered bar. Links come from NAV_LINKS so the markup exists without JS.' },
        { f: 'components/navbar/MegaPanel.tsx', r: '"use client" leaf. Owns open state, the trap and the inert toggle. Receives destinations and recent work as props.' },
        { f: 'lib/useFocusTrap.ts', r: 'Tab wrap, focusin guard, Escape, return focus. One implementation for every overlay on the site.' },
        { f: 'lib/navShell.ts', r: 'Already exists. Keep it as the single source of activeSection so the panel and the dock cannot disagree.' }
      ],
      state: [
        'open: boolean in useState. It changes on intent, not per frame.',
        'The element that opened the panel is a ref, not state. In state it would re-render the bar on every open for no visual reason.',
        'activeSection comes from the existing navShell store, not from a second IntersectionObserver inside this component.',
        'Do not put the panel behind a route. A mega menu that changes the URL breaks the back button in a way nobody expects.'
      ],
      typography: [
        'Destinations: display face 400 at clamp(1.75rem, 3.4vw, 2.75rem), letter-spacing -0.03em, line-height 1.05.',
        'Meta lines and bar links: mono 11px, letter-spacing 0.16em, uppercase. Mono because these are labels and indices, never prose.',
        'Panel heading: mono 11px in ink-3. It names the panel for a screen reader and stays out of the way visually.',
        'Years in recent work use tabular figures so the column does not shimmy.'
      ],
      color: [
        'Panel ground is surface, one step up from the page, so it reads as a layer rather than as a hole.',
        'The signature hue appears exactly three times: the trigger mark, the underline wipe, and the availability line.',
        'The bar takes a 1px bottom hairline at 8% ink only once content is under it, and none at the top of the page. That single line is the whole scroll edge treatment.',
        'In light mode invert the ground and drop every hairline to 12% of near black. Do not invert the accent.'
      ],
      spacing: [
        'Bar 64px tall, horizontal padding clamp(1.25rem, 4vw, 4.5rem), matching the page gutter so the wordmark sits on the same vertical as the content below.',
        'Panel padding clamp(2rem, 5vw, 5rem), destination column starting on the same gutter as the wordmark.',
        'Destination rows: 0.875rem vertical padding with a hairline between, none above the first or below the last.',
        'The panel stops short of the viewport bottom only where the bar is, which is what tells the reader this is a layer and not a page.'
      ],
      relationships: [
        'Position in the bar communicates priority. Do not also colour code the bar links.',
        'The drop direction communicates the source: the panel belongs to the trigger at the top edge.',
        'The meta line under each destination is what makes this a mega menu rather than a big list: it answers what is in there before the reader commits.',
        'aria-current is the only place the current section is marked. Do not also bold it and add a dot.'
      ],
      acceptance: [
        'The bar renders on one line at 1440px, 1024px and 768px and never exceeds 64px in height.',
        'Pressing the trigger drops the panel from the top edge and the columns resolve in sequence after it lands.',
        'Tab from the last panel link goes to the first, not to the page behind.',
        'Escape closes the panel and the trigger is visibly focused.',
        'Pressing Escape while the plate is still travelling reverses from where the plate actually is, with no jump.',
        'With reduced motion on the panel cross fades, nothing translates, and every destination is still reachable.'
      ]
    },

    mount: function (root, ctx) {
      var host = makeHost(root, ctx);
      var panelId = uid('atrium-panel');
      var headId = uid('atrium-head');

      /* ---------------------------------------------------------- chrome */
      var bar = SE.el('header', 'nav-atrium__bar');
      var inline = [LINKS[1], LINKS[4], LINKS[5]];
      bar.innerHTML =
        '<a class="nav-atrium__mark" href="#' + host.uidPrefix + '-index" data-go="index">' +
          '<b>Miftaul</b><span>Islam</span></a>' +
        '<nav class="nav-atrium__inline" aria-label="Primary">' +
          '<ul>' + inline.map(function (l) {
            return '<li><a href="#' + host.uidPrefix + '-' + l.id + '" data-go="' + l.id + '">' +
                   l.label + '</a></li>';
          }).join('') + '</ul>' +
        '</nav>' +
        '<button class="nav-atrium__trigger" type="button" aria-expanded="false" ' +
          'aria-controls="' + panelId + '">' +
          '<span>Everything</span>' +
          '<svg class="nav-ico nav-atrium__mk" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            '<path d="M4 8.5h16"/><path d="M4 15.5h16"/></svg>' +
        '</button>';

      /* ----------------------------------------------------------- panel */
      var panel = SE.el('div', 'nav-atrium__panel');
      panel.id = panelId;
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', headId);

      var dests = LINKS.map(function (l, i) {
        return '<li style="--i:' + i + '"><a href="#' + host.uidPrefix + '-' + l.id + '" data-go="' + l.id + '">' +
               '<span class="nav-atrium__dn">' + l.label + '</span>' +
               '<span class="nav-atrium__dm">' + l.meta + '</span></a></li>';
      }).join('');

      panel.innerHTML =
        '<div class="nav-atrium__plate">' +
          '<div class="nav-atrium__inner">' +
            '<div class="nav-atrium__top" style="--i:0">' +
              '<h2 class="nav-atrium__head" id="' + headId + '">Everything on this site</h2>' +
              '<button class="nav-atrium__close" type="button" aria-label="Close the menu">' +
                icon('close') + '</button>' +
            '</div>' +
            '<div class="nav-atrium__grid">' +
              '<nav class="nav-atrium__dest" aria-label="All sections"><ul>' + dests + '</ul></nav>' +
              '<div class="nav-atrium__side">' +
                '<section class="nav-atrium__block" style="--i:4">' +
                  '<h3>Recent work</h3>' +
                  '<ul>' + PROJECTS.map(function (p) {
                    return '<li><a href="#' + host.uidPrefix + '-work" data-go="work">' +
                           '<span>' + p.name + '</span><i class="t-num">' + p.year + '</i></a></li>';
                  }).join('') + '</ul>' +
                '</section>' +
                '<section class="nav-atrium__block" style="--i:6">' +
                  '<h3>Contact</h3>' +
                  '<p class="nav-atrium__avail">One project slot open in Q1</p>' +
                  '<a class="nav-atrium__mailto" href="#' + host.uidPrefix + '-contact" data-go="contact">' +
                    '<span>write@miftaul.dev</span>' + icon('out') + '</a>' +
                '</section>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      host.layer.appendChild(bar);
      host.layer.appendChild(panel);
      root.appendChild(host.layer);

      var page = fauxPage(host);
      root.appendChild(page);
      host.reserve(80, 24);

      /* ------------------------------------------------------------ state */
      var trigger = SE.$('.nav-atrium__trigger', bar);
      var open = false;
      var trap = makeTrap(panel, function () { setOpen(false); });
      var prevOverflow = '';

      function setOpen(v) {
        if (v === open) return;
        open = v;
        root.classList.toggle('is-open', v);
        panel.classList.toggle('is-on', v);
        trigger.setAttribute('aria-expanded', String(v));
        if ('inert' in HTMLElement.prototype) page.inert = v;

        if (v) {
          prevOverflow = host.scroller.style.overflow;
          host.scroller.style.overflow = 'hidden';
          trap.activate(trigger, SE.$('.nav-atrium__dest a', panel));
        } else {
          host.scroller.style.overflow = prevOverflow;
          trap.release();
        }
      }

      trigger.addEventListener('click', function () { setOpen(!open); });
      SE.$('.nav-atrium__close', panel).addEventListener('click', function () { setOpen(false); });

      /* The strip of page left visible below the panel is the escape route, so
         it has to actually work. */
      panel.addEventListener('click', function (e) {
        if (e.target === panel) setOpen(false);
      });

      function onNavClick(e) {
        var a = e.target.closest ? e.target.closest('[data-go]') : null;
        if (!a) return;
        e.preventDefault();
        var id = a.getAttribute('data-go');
        if (open) setOpen(false);
        host.goTo(host.uidPrefix + '-' + id, 64);
      }
      root.addEventListener('click', onNavClick);

      /* --------------------------------------------------- active section */
      var links = SE.$$('[data-go]', root);
      var spy = spySections(host, page.ids, function (id) {
        var short = id.replace(host.uidPrefix + '-', '');
        links.forEach(function (a) {
          if (a.getAttribute('data-go') === short) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
      });

      /* Scroll edge: the bar earns its hairline only once content is under it. */
      var sw = watchScroll(host.scroller);
      function tick() {
        bar.classList.toggle('is-edged', sw.state.y > 12);
      }
      SE.ticker.add(tick);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          sw.destroy();
          spy.destroy();
          trap.destroy();
          root.removeEventListener('click', onNavClick);
          host.scroller.style.overflow = prevOverflow;
          host.destroy();
          root.classList.remove('nav-c', 'nav-scroll', 'is-open');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     PAGE 02  -  PALETTE
     --------------------------------------------------------------------------
     A keyboard-first command surface. Real fuzzy filtering with a real score,
     real arrow navigation, real focus management, and a real empty state.

     THE MOST IMPORTANT DECISION HERE IS THE ABSENCE OF AN ANIMATION
     --------------------------------------------------------------
     A palette is opened dozens of times a day by the person who knows the
     shortcut. That puts it at the top of the frequency scale, where the correct
     amount of motion is none: Raycast has no open animation, and it is the
     fastest-feeling launcher on the platform for exactly that reason. What
     ships here is a 90ms opacity change and nothing else - not a scale, not a
     translate, not a stagger on the results. The active row does not transition
     at all, because it moves on every arrow press and a transition there is
     indistinguishable from input lag.
     ========================================================================== */

  var COMMANDS = (function () {
    var out = [];
    LINKS.forEach(function (l) {
      out.push({ g: 'Go to', label: l.label, hint: l.meta, icon: l.icon, go: l.id });
    });
    PROJECTS.forEach(function (p) {
      out.push({ g: 'Work', label: p.name, hint: p.year, icon: 'work', go: 'work' });
    });
    NOTES.forEach(function (n) {
      out.push({ g: 'Writing', label: n.title, hint: n.date, icon: 'writing', go: 'writing' });
    });
    out.push({ g: 'Actions', label: 'Copy email address', hint: 'write@miftaul.dev', icon: 'contact' });
    out.push({ g: 'Actions', label: 'Download the resume', hint: 'PDF, 2 pages', icon: 'writing' });
    out.push({ g: 'Actions', label: 'Switch to the light theme', hint: 'Appearance', icon: 'studio' });
    return out;
  })();

  var GROUP_ORDER = ['Go to', 'Work', 'Writing', 'Actions'];

  SE.register({
    area: 'nav',
    variant: 'page',
    id: 'nav-page-command',
    num: 2,
    name: 'Palette',
    kind: 'Palette / fuzzy filter',
    accent: '#5AB4FF',
    tagline: 'Navigation for people who never touch the mouse',
    desc: 'A command surface with a scored subsequence filter, arrow navigation and full focus management. ' +
          'It opens with no animation on purpose, because that is what a surface opened fifty times a day earns.',
    interaction: 'Press Control or Command and K. Type to filter, arrows to move, Enter to go, Escape to close.',
    hint: '<kbd>Ctrl</kbd><kbd>K</kbd> to open &middot; <kbd>Esc</kbd> closes',

    preview: function (ctx, w, h, t, heat) {
      var bx = w * 0.12, bw = w * 0.76;
      var by = h * 0.14, bh = h * 0.72;

      ctx.fillStyle = 'rgba(16,16,21,0.96)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = 'rgba(90,180,255,' + (0.28 + heat * 0.24).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);

      /* Field: a query being typed, then a caret that blinks on a real 1.06s
         period rather than a round number, so it never syncs with anything. */
      var fieldH = bh * 0.22;
      ctx.strokeStyle = 'rgba(236,236,239,0.10)';
      ctx.beginPath();
      ctx.moveTo(bx, Math.round(by + fieldH) + 0.5);
      ctx.lineTo(bx + bw, Math.round(by + fieldH) + 0.5);
      ctx.stroke();

      var typed = Math.floor(((t * 0.9) % 6));
      ctx.fillStyle = 'rgba(236,236,239,0.55)';
      ctx.fillRect(bx + bw * 0.10, by + fieldH * 0.46, bw * 0.06 * typed, 2);
      if ((t % 1.06) < 0.6) {
        ctx.fillStyle = 'rgba(90,180,255,0.95)';
        ctx.fillRect(bx + bw * 0.10 + bw * 0.06 * typed + 2, by + fieldH * 0.30, 1.5, fieldH * 0.34);
      }

      /* Four rows; the selection steps down instantly, never travels. */
      var rowH = (bh - fieldH) / 4.6;
      var sel = Math.floor((t * 1.4) % 4);
      for (var i = 0; i < 4; i++) {
        var ry = by + fieldH + rowH * (i + 0.15);
        if (i === sel) {
          ctx.fillStyle = 'rgba(90,180,255,' + (0.14 + heat * 0.08).toFixed(3) + ')';
          ctx.fillRect(bx + 1, ry - rowH * 0.12, bw - 2, rowH * 0.82);
        }
        ctx.fillStyle = 'rgba(236,236,239,' + (i === sel ? 0.82 : 0.30) + ')';
        ctx.fillRect(bx + bw * 0.10, ry + rowH * 0.30, bw * (0.30 + (i % 3) * 0.08), 2);
        ctx.fillStyle = 'rgba(236,236,239,0.14)';
        ctx.fillRect(bx + bw * 0.74, ry + rowH * 0.30, bw * 0.14, 2);
      }
    },

    spec: {
      subtitle: 'A keyboard-first command surface with a scored fuzzy filter',
      philosophy: [
        'The frequency gate decides the motion budget here, and it decides it is zero. A palette opened fifty times a day must appear the instant the shortcut is pressed. What ships is a 90ms opacity change, which is under the threshold where a large surface appearing reads as a glitch, and nothing above it.',
        'The filter has to be real. A substring includes() will not find "Kestrel Ledger" from "kl", and a palette that fails on the query the user actually types is worse than no palette at all.',
        'The pointer is a fallback here, not the primary input. Everything is reachable with the mouse, but the layout, the ordering and the footer hints are all designed for someone whose hands never leave the keyboard.'
      ],
      hierarchy: [
        '1. The field. It is the tallest element in the surface and the caret is the only thing that blinks.',
        '2. The active row, marked by a filled plate in the signature hue at 14% plus full ink text. There is exactly one at all times.',
        '3. Matched characters inside a label, at full ink while the rest of the label sits at 76%. This is the feedback that proves the filter is doing what the user asked.',
        '4. Group headings at 10px mono, ink-4. Structural, not content.',
        '5. The footer hint row, ink-4, naming the three keys that matter.'
      ],
      structure: [
        'Trigger in the bar is a real <button> showing the shortcut, so the feature is discoverable by someone who does not already know it exists.',
        'Overlay is role="dialog" aria-modal="true" with an accessible name.',
        'Field is <input role="combobox" aria-expanded aria-controls aria-activedescendant aria-autocomplete="list" autocomplete="off" spellcheck="false">.',
        'Results are a single role="listbox" containing role="group" blocks with aria-label, each holding role="option" rows with stable ids.',
        'Options are divs, not buttons. In the combobox pattern focus never leaves the input and the active option is named by aria-activedescendant. Making them tab stops would break the pattern and put twenty stops between the field and the close button.'
      ],
      interaction: [
        'Open: Control+K or Command+K anywhere in the page, or the bar button. The handler calls preventDefault so the browser search box does not also open.',
        'Type: filter runs on every input event over about twenty items, which is well inside one frame. Do not debounce it; a debounce here is perceptible and buys nothing.',
        'ArrowDown and ArrowUp move the active option and wrap at both ends. Home and End jump to the first and last. PageDown and PageUp move by five.',
        'Enter activates the active option. Escape closes and returns focus to the trigger. A click on the scrim closes.',
        'The active option is scrolled into view with block:"nearest" and no smooth behaviour, because smooth scrolling on an arrow key is lag.',
        'Selection resets to the first result on every query change, which is the only ordering a user can predict.'
      ],
      choreography: [
        { n: 'Open', d: 'opacity 0 to 1 over 90ms linear on the scrim and the box together. No transform, no scale, no stagger. This is the frequency gate applied hard: at fifty opens a day, motion is a tax.' },
        { n: 'Close', d: 'opacity to 0 over 70ms. Faster than the open because the user has already decided.' },
        { n: 'Active row', d: 'No transition at all. background-color and colour change on the same frame as the key. A 120ms fade on a row that moves on every arrow press is indistinguishable from input lag.' },
        { n: 'Result list change', d: 'No enter animation on rows. The list is rebuilt on every keystroke; animating it would mean the user is reading a list that is still arriving.' },
        { n: 'Trigger press', d: 'transform scale(0.98) on :active over 100ms cubic-bezier(0.23, 1, 0.32, 1). The one piece of motion in the concept, and it is feedback on a press.' }
      ],
      scroll: [
        'The results list is the only scroll region, capped at min(56vh, 26rem) with overflow-y:auto and overscroll-behavior:contain so a fast wheel inside it never scrolls the page behind.',
        'The page behind takes overflow:hidden while the palette is open.',
        'Activating a Go to result closes the palette and then scrolls the container to the anchor, smooth normally and auto under reduced motion.'
      ],
      hover: [
        'Hovering a row sets it as the active option, so the pointer and the keyboard drive the same single piece of state. Two competing highlights is the most common bug in hand built palettes.',
        'Hover is gated behind @media (hover: hover) and (pointer: fine).',
        'A pointermove guard suppresses hover-driven activation until the pointer actually moves, so a list rebuild under a stationary cursor does not steal the keyboard selection.'
      ],
      click: [
        'Click on a row activates it exactly as Enter does. One activate() function, two callers.',
        'Click on the scrim closes. Click inside the box does not.',
        'The close button carries an accessible name, because an icon-only control without one is unusable with a screen reader.'
      ],
      responsive: {
        desktop: 'Box at min(38rem, calc(100% - 4rem)), pinned 14vh from the top of the container. Footer hints visible.',
        tablet: 'Same geometry at min(32rem, calc(100% - 3rem)). Group headings stay.',
        mobile: 'Below 768px there is no keyboard shortcut to discover, so the trigger becomes a full 48px search button in the bar and the palette becomes a full height sheet with the field pinned at the top and the list filling the rest. Footer hints are dropped, hints on each row are dropped, and row height goes to 52px. The shortcut listener is not registered at all.'
      },
      a11y: [
        'The combobox pattern, implemented properly: aria-expanded on the input, aria-controls to the listbox, aria-activedescendant to the active option id, aria-selected on that option and only that option.',
        'The result count is announced through a visually hidden aria-live="polite" region ("7 results") so a screen reader user knows the filter did something.',
        'Focus is trapped inside the box and returns to the trigger on close.',
        'The empty state is real text, not an icon, and it names the query that failed.',
        'Every row is at least 44px tall, and the field is 56px.',
        'Under prefers-reduced-motion there is nothing to reduce, which is the point. The 90ms opacity change stays because a surface appearing with zero transition reads as a repaint bug.'
      ],
      perf: [
        'Zero per frame work. There is no ticker subscription in this concept at all.',
        'Filtering about twenty items costs microseconds. If the command list ever passes a few hundred, memoise the lowercased haystacks once rather than reaching for a worker.',
        'The list is rebuilt with one innerHTML write per keystroke. At this size that is cheaper and far less code than diffing, and there are no event listeners on rows to leak because the container is delegated.',
        'The shortcut listener is a single keydown on window, added on mount and removed in cleanup.'
      ],
      packages: [
        { p: 'cmdk', w: 'The one place in this whole area where a library is the right call in production. It ships the combobox semantics, the filtering hook and the group primitives. Use it if the palette is going to grow; hand roll only if it stays this small.' },
        { p: 'no framer-motion', w: 'There is nothing to animate. Adding a motion component here would add a bundle to render a 90ms opacity change that CSS does for free.' },
        { p: 'no fuse.js', w: 'Twenty five commands do not need a full text search engine. The scored subsequence match below is fifteen lines and is tuned for short labels, which Fuse is not.' }
      ],
      architecture: [
        { f: 'components/navbar/CommandPalette.tsx', r: '"use client" leaf. Owns open state, query, active index and the shortcut listener.' },
        { f: 'lib/commands.ts', r: 'The command registry: sections, projects, notes and actions, each with a group, a label, a hint and a run(). Pure data plus one function per action.' },
        { f: 'lib/fuzzy.ts', r: 'score(needle, haystack) returning null or { score, hits }. Pure, unit testable, and the hits array is what drives the character highlighting.' },
        { f: 'components/navbar/Navbar.tsx', r: 'Renders the trigger and shows the platform-correct shortcut label, Command on Apple and Control everywhere else.' }
      ],
      state: [
        'query and open in useState. activeIndex in useState too, because it drives aria-activedescendant which must be in the rendered markup.',
        'The filtered list is a useMemo over query, never state. Deriving it into state gives you two sources of truth and a stale render.',
        'The element that opened the palette is a ref.',
        'Do not sync the query to the URL. A palette query is not a page.'
      ],
      typography: [
        'Field: display face 400 at 1.0625rem. Large enough to read a long project title, small enough that the surface stays compact.',
        'Row labels: display face 400 at 0.9375rem. Matched characters go to weight 500 and full ink; do not colour them, coloured characters inside a word read as a rendering fault.',
        'Hints and group headings: mono 10px, 0.16em tracking, uppercase.',
        'Footer key hints in mono 10px inside 1px bordered <kbd> at 2px radius.'
      ],
      color: [
        'The box sits on surface-2 with a 1px border in the signature hue at 28%. That border is the only thing that separates it from the scrim, and it is enough.',
        'The active row plate is the signature hue at 14%, which clears 3:1 against the box ground without turning the row into a button.',
        'Matched characters are ink at 100% against a label at 76%. Contrast, not hue.',
        'The scrim is the page ground at 72% with no blur. A blur here costs a full screen filter pass on every open, fifty times a day.'
      ],
      spacing: [
        'Field 56px tall with 1rem horizontal padding and a 1.25rem gap after the leading icon.',
        'Rows 44px tall with 1rem horizontal padding. No border between rows: the active plate is the separator and hairlines under twenty rows would be noise.',
        'Group headings get 1rem of space above and 0.5rem below, which is the only vertical rhythm the list needs.',
        'The box is pinned 14vh from the top rather than centred, so the list grows downward into space that is already empty.'
      ],
      relationships: [
        'The group communicates what kind of thing a row is. Do not also badge each row with its type.',
        'The hint column communicates the one distinguishing fact: a year for a project, a date for a note, a section summary for a destination.',
        'Character highlighting communicates why a row matched, which is what makes a fuzzy filter feel accurate rather than lucky.',
        'The active plate communicates where Enter will take you, and nothing else in the surface is allowed to look like it.'
      ],
      acceptance: [
        'Control or Command and K opens the palette from anywhere on the page and the browser default is suppressed.',
        'Typing "kl" finds Kestrel Ledger, and the K and the L are visibly the characters that matched.',
        'Arrow keys wrap at both ends, and the active row is always scrolled into view without smooth scrolling.',
        'Enter navigates, Escape closes, and the trigger is focused afterwards.',
        'Moving the mouse over a row and then pressing an arrow key does not leave two rows highlighted.',
        'Opening the palette shows no movement of any kind, only the surface appearing.'
      ]
    },

    mount: function (root, ctx) {
      var host = makeHost(root, ctx);
      var listId = uid('pal-list');
      var optBase = uid('pal-opt');
      var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');

      /* ---------------------------------------------------------- chrome */
      var bar = SE.el('header', 'nav-palette__bar');
      bar.innerHTML =
        '<a class="nav-palette__mark" href="#' + host.uidPrefix + '-index" data-go="index">' +
          '<b>Miftaul</b><span>Islam</span></a>' +
        '<nav class="nav-palette__inline" aria-label="Primary"><ul>' +
          LINKS.slice(1, 5).map(function (l) {
            return '<li><a href="#' + host.uidPrefix + '-' + l.id + '" data-go="' + l.id + '">' +
                   l.label + '</a></li>';
          }).join('') +
        '</ul></nav>' +
        '<button class="nav-palette__trigger" type="button">' +
          icon('search') + '<span class="nav-palette__tl">Search</span>' +
          '<span class="nav-palette__kb" aria-hidden="true"><kbd>' + (mac ? '⌘' : 'Ctrl') + '</kbd><kbd>K</kbd></span>' +
        '</button>';

      /* --------------------------------------------------------- overlay */
      var overlay = SE.el('div', 'nav-palette__overlay');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Search and commands');
      overlay.innerHTML =
        '<div class="nav-palette__box">' +
          '<div class="nav-palette__field">' +
            icon('search') +
            '<input class="nav-palette__input" type="text" role="combobox" ' +
              'aria-expanded="true" aria-controls="' + listId + '" aria-activedescendant="" ' +
              'aria-autocomplete="list" autocomplete="off" spellcheck="false" ' +
              'placeholder="Search sections, work and notes">' +
            '<button class="nav-palette__x" type="button" aria-label="Close search">' + icon('close') + '</button>' +
          '</div>' +
          '<div class="nav-palette__results" id="' + listId + '" role="listbox" aria-label="Results"></div>' +
          '<p class="nav-palette__count sr-only" role="status" aria-live="polite"></p>' +
          '<div class="nav-palette__foot" aria-hidden="true">' +
            '<span><kbd>&uarr;</kbd><kbd>&darr;</kbd> move</span>' +
            '<span><kbd>&crarr;</kbd> go</span>' +
            '<span><kbd>Esc</kbd> close</span>' +
          '</div>' +
        '</div>';

      host.layer.appendChild(bar);
      host.layer.appendChild(overlay);
      root.appendChild(host.layer);

      var page = fauxPage(host);
      root.appendChild(page);
      host.reserve(80, 24);

      /* ------------------------------------------------------------ refs */
      var trigger = SE.$('.nav-palette__trigger', bar);
      var box = SE.$('.nav-palette__box', overlay);
      var input = SE.$('.nav-palette__input', overlay);
      var results = SE.$('.nav-palette__results', overlay);
      var countOut = SE.$('.nav-palette__count', overlay);
      var open = false;
      var matches = [];
      var active = 0;
      var pointerArmed = false;
      var trap = makeTrap(overlay, function () { setOpen(false); });
      var prevOverflow = '';

      /* ---------------------------------------------------------- filter */
      function filter(q) {
        var scored = [];
        for (var i = 0; i < COMMANDS.length; i++) {
          var c = COMMANDS[i];
          var r = fuzzy(q, c.label);
          if (!r) continue;
          scored.push({ cmd: c, score: r.score, hits: r.hits });
        }
        /* Stable within a group: sort by score, then keep the registry order,
           so an empty query renders the list in the order it was authored. */
        scored.sort(function (a, b) {
          if (b.score !== a.score) return b.score - a.score;
          return COMMANDS.indexOf(a.cmd) - COMMANDS.indexOf(b.cmd);
        });
        return scored;
      }

      function render(q) {
        matches = filter(q);
        active = 0;

        if (!matches.length) {
          results.innerHTML = '<p class="nav-palette__empty">Nothing matches ' +
            '<b>' + esc(q) + '</b>. Try a project name, a section, or a word from a note title.</p>';
          input.setAttribute('aria-activedescendant', '');
          countOut.textContent = 'No results';
          return;
        }

        var html = '';
        var flat = 0;
        GROUP_ORDER.forEach(function (g) {
          var inGroup = matches.filter(function (m) { return m.cmd.g === g; });
          if (!inGroup.length) return;
          html += '<div class="nav-palette__group" role="group" aria-label="' + g + '">' +
                  '<p class="nav-palette__gh">' + g + '</p>';
          inGroup.forEach(function (m) {
            m.index = flat;
            html += '<div class="nav-palette__row" role="option" id="' + optBase + '-' + flat + '" ' +
                      'aria-selected="false" data-i="' + flat + '">' +
                      icon(m.cmd.icon) +
                      '<span class="nav-palette__rl">' + markHits(m.cmd.label, m.hits) + '</span>' +
                      '<span class="nav-palette__rh">' + esc(m.cmd.hint) + '</span>' +
                    '</div>';
            flat += 1;
          });
          html += '</div>';
        });
        results.innerHTML = html;

        /* matches is now in group render order, which is the order the arrows
           must walk. Re-sort it to match what the eye sees. */
        matches.sort(function (a, b) { return a.index - b.index; });
        countOut.textContent = matches.length + (matches.length === 1 ? ' result' : ' results');
        setActive(0, false);
      }

      function setActive(i, scroll) {
        if (!matches.length) return;
        active = (i + matches.length) % matches.length;
        var rows = SE.$$('.nav-palette__row', results);
        for (var k = 0; k < rows.length; k++) {
          var on = k === active;
          rows[k].classList.toggle('is-active', on);
          rows[k].setAttribute('aria-selected', String(on));
          if (on) {
            input.setAttribute('aria-activedescendant', rows[k].id);
            if (scroll !== false) rows[k].scrollIntoView({ block: 'nearest' });
          }
        }
      }

      function activate(i) {
        var m = matches[i];
        if (!m) return;
        setOpen(false);
        if (m.cmd.go) host.goTo(host.uidPrefix + '-' + m.cmd.go, 64);
      }

      /* ------------------------------------------------------------ open */
      function setOpen(v) {
        if (v === open) return;
        open = v;
        overlay.classList.toggle('is-on', v);
        root.classList.toggle('is-open', v);
        if ('inert' in HTMLElement.prototype) page.inert = v;

        if (v) {
          prevOverflow = host.scroller.style.overflow;
          host.scroller.style.overflow = 'hidden';
          input.value = '';
          render('');
          trap.activate(trigger, input);
        } else {
          host.scroller.style.overflow = prevOverflow;
          trap.release();
        }
      }

      trigger.addEventListener('click', function () { setOpen(true); });
      SE.$('.nav-palette__x', overlay).addEventListener('click', function () { setOpen(false); });
      overlay.addEventListener('mousedown', function (e) {
        if (e.target === overlay) setOpen(false);
      });

      input.addEventListener('input', function () { render(input.value); });

      input.addEventListener('keydown', function (e) {
        if (!matches.length && e.key !== 'Escape') return;
        if (e.key === 'ArrowDown') { e.preventDefault(); pointerArmed = false; setActive(active + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); pointerArmed = false; setActive(active - 1); }
        else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
        else if (e.key === 'End') { e.preventDefault(); setActive(matches.length - 1); }
        else if (e.key === 'PageDown') { e.preventDefault(); setActive(Math.min(matches.length - 1, active + 5)); }
        else if (e.key === 'PageUp') { e.preventDefault(); setActive(Math.max(0, active - 5)); }
        else if (e.key === 'Enter') { e.preventDefault(); activate(active); }
      });

      /* The pointer only takes over the selection once it has actually moved.
         Without this guard, rebuilding the list under a stationary cursor
         steals the keyboard's selection on every keystroke. */
      results.addEventListener('pointermove', function () { pointerArmed = true; });
      results.addEventListener('pointerover', function (e) {
        if (!pointerArmed || !env.fine) return;
        var row = e.target.closest ? e.target.closest('.nav-palette__row') : null;
        if (row) setActive(parseInt(row.getAttribute('data-i'), 10), false);
      });
      results.addEventListener('click', function (e) {
        var row = e.target.closest ? e.target.closest('.nav-palette__row') : null;
        if (row) activate(parseInt(row.getAttribute('data-i'), 10));
      });

      function onKey(e) {
        if (env.mobile) return;
        if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          setOpen(!open);
        }
      }
      window.addEventListener('keydown', onKey);

      function onNavClick(e) {
        var a = e.target.closest ? e.target.closest('[data-go]') : null;
        if (!a) return;
        e.preventDefault();
        host.goTo(host.uidPrefix + '-' + a.getAttribute('data-go'), 64);
      }
      root.addEventListener('click', onNavClick);

      var barLinks = SE.$$('.nav-palette__inline a, .nav-palette__mark', bar);
      var spy = spySections(host, page.ids, function (id) {
        var short = id.replace(host.uidPrefix + '-', '');
        barLinks.forEach(function (a) {
          if (a.getAttribute('data-go') === short) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
      });

      var sw = watchScroll(host.scroller);
      function tick() { bar.classList.toggle('is-edged', sw.state.y > 12); }
      SE.ticker.add(tick);

      render('');

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          window.removeEventListener('keydown', onKey);
          root.removeEventListener('click', onNavClick);
          sw.destroy();
          spy.destroy();
          trap.destroy();
          host.scroller.style.overflow = prevOverflow;
          host.destroy();
          root.classList.remove('nav-c', 'nav-scroll', 'is-open');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     PAGE 03  -  COMPASS
     --------------------------------------------------------------------------
     A contextual radial menu that expands where the pointer already is. The
     argument for a radial: with six or fewer destinations, direction is faster
     to aim than distance, and the hand does not have to travel to a corner.

     The argument against it, which has to be answered rather than ignored, is
     that a menu you open by holding is a gesture-only interaction. So there is
     also a real button in the bar that opens the same menu at the centre of the
     screen, and once open the whole thing is operable with four arrow keys.
     WCAG 2.2 calls this the dragging-movements criterion; it is not optional.
     ========================================================================== */

  SE.register({
    area: 'nav',
    variant: 'page',
    id: 'nav-page-radial',
    num: 3,
    name: 'Compass',
    kind: 'Radial / pointer anchored',
    accent: '#2FD59A',
    tagline: 'The menu comes to the hand',
    desc: 'Six destinations on a ring that opens under the pointer, armed by direction rather than by ' +
          'distance. A button and four arrow keys reach the same menu without a gesture.',
    interaction: 'Hold the page for a moment, or right click, or press the Compass button. Arrow keys rotate, Enter goes.',
    hint: 'Hold anywhere &middot; arrows rotate &middot; <kbd>Esc</kbd> closes',

    preview: function (ctx, w, h, t, heat) {
      var cx = w / 2, cy = h / 2;
      var R = Math.min(w, h) * 0.30;
      var cycle = (t * 0.4) % 1;
      var p = cycle < 0.7 ? Math.min(1, cycle / 0.22) : Math.max(0, 1 - (cycle - 0.7) / 0.16);
      p = p * p * (3 - 2 * p);
      if (p <= 0.01) p = 0.01;

      ctx.strokeStyle = 'rgba(47,213,154,' + (0.22 + heat * 0.16).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R * p, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
      ctx.stroke();

      /* The needle: what the ring is armed on, swinging with the pointer. */
      var arm = -Math.PI / 2 + Math.sin(t * 0.8) * 1.9;
      ctx.strokeStyle = 'rgba(236,236,239,' + (0.30 * p).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(arm) * R * 0.82 * p, cy + Math.sin(arm) * R * 0.82 * p);
      ctx.stroke();

      var armed = Math.round((arm + Math.PI / 2) / (Math.PI / 3));
      for (var i = 0; i < 6; i++) {
        var a = -Math.PI / 2 + i * (Math.PI / 3);
        var x = cx + Math.cos(a) * R * p;
        var y = cy + Math.sin(a) * R * p;
        var on = ((i % 6) + 6) % 6 === ((armed % 6) + 6) % 6;
        ctx.beginPath();
        ctx.arc(x, y, on ? 5.5 : 3.2, 0, Math.PI * 2);
        ctx.fillStyle = on ? 'rgba(47,213,154,0.98)' : 'rgba(236,236,239,' + (0.34 * p + 0.06) + ')';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236,236,239,0.7)';
      ctx.fill();
    },

    spec: {
      subtitle: 'A contextual radial menu armed by direction, not distance',
      philosophy: [
        'Fitts law says a target is easier to hit when it is closer and bigger. A radial menu opened at the pointer makes every destination equidistant and puts all of them within about 110px of where the hand already was, which is the entire case for the pattern.',
        'Direction is the input, not position. Past a 30px dead zone the menu arms whichever sector the pointer is pointing at, however far past the ring it goes, so a flick commits as reliably as a careful aim.',
        'A radial menu that can only be opened by holding is a gesture-only interaction and fails WCAG 2.2. This one has a button and full arrow-key operation, and neither is an afterthought bolted on the side.'
      ],
      hierarchy: [
        '1. The armed sector: full ink label, a filled dot in the signature hue, and the needle pointing at it.',
        '2. The needle from the centre to the armed angle, at 30% ink. It is what turns six dots into an instrument.',
        '3. The ring, 1px in the signature hue at 22%. It groups the six without boxing them.',
        '4. Unarmed labels at 62% ink.',
        'Nothing else exists inside the ring. A radial menu with a title in the middle has lost the plot.'
      ],
      structure: [
        'A trigger <button> in the bar for discoverability and for keyboard users.',
        'The menu is role="menu" with six role="menuitem" buttons, absolutely positioned inside a zero height sticky layer so it can be placed anywhere in the viewport without affecting layout.',
        'Each item is placed with transform: translate3d(x, y, 0), computed once per open from cos and sin of its angle. Never with top and left.',
        'An SVG circle behind the items draws the ring with stroke-dashoffset.',
        'The centre point carries a 30px dead zone: inside it nothing is armed, so opening the menu and releasing without moving cancels rather than picking whatever happened to be nearest.'
      ],
      interaction: [
        'OPEN: pointerdown held for 400ms without moving more than 8px, or contextmenu (which preventDefaults), or the bar button. 400ms is the platform long-press convention; below about 300ms it fires on ordinary clicks.',
        'ARM: the angle from the centre to the pointer, snapped to the nearest of six 60deg sectors, but only past the 30px dead zone.',
        'COMMIT: pointerup while armed, or Enter or Space on a focused item, or a click on an item.',
        'The centre is clamped so the whole ring plus its labels stays inside the viewport: cx to [R+64, width-R-64], cy to [R+64, height-R-64]. A radial menu that opens half off screen is worse than a list.',
        'KEYBOARD: the bar button opens the ring at the centre of the viewport and focuses the top item. ArrowRight and ArrowDown move clockwise, ArrowLeft and ArrowUp anticlockwise, both wrapping. Home and End jump to the first and last. Escape closes and returns focus to the trigger.'
      ],
      choreography: [
        { n: 'Bloom', d: 'Each item goes from translate3d(0,0,0) scale(0.72) opacity 0 to its final translate at scale(1) opacity 1 over 320ms cubic-bezier(0.23, 1, 0.32, 1), staggered 18ms clockwise from the top. 18ms is fast enough that six items read as one gesture opening, not as six items arriving.' },
        { n: 'Ring draw', d: 'stroke-dashoffset from the full circumference to 0 over 380ms cubic-bezier(0.23, 1, 0.32, 1), starting with the bloom so the ring is complete a moment after the items land.' },
        { n: 'Needle', d: 'Angle damped toward the pointer angle at lambda 22 (about 45ms to 63%), with the delta unwrapped to the short way round so it never takes the long path through 359 degrees. Written as one rotate per frame on a single element.' },
        { n: 'Arm', d: 'The armed dot goes from 3px to 5px and the label from 62% to 100% ink, 120ms cubic-bezier(0.23, 1, 0.32, 1). Under 160ms because arming happens continuously while the hand moves.' },
        { n: 'Close', d: 'All items to opacity 0 and scale(0.9) over 140ms with no stagger, ring dashoffset back over 140ms. There is no reverse bloom: a menu you have finished with should leave at once.' }
      ],
      scroll: [
        'The menu does not scroll and does not lock the page. It closes on any scroll of the container, because a menu anchored to a point on the screen is meaningless once the content under that point has moved.',
        'That close listener is the concept scroll listener on the container, passive, and is the only one.',
        'The bar behind stays sticky and keeps working while the ring is open.'
      ],
      hover: [
        'Hover is not how this menu is reached. It arms on pointer angle only while the menu is already open, which is a different thing from a hover-opened dropdown.',
        'The bar trigger takes the same 140ms colour change as every other bar control.',
        'On touch there is no hover at all and nothing is lost, because arming happens on the finger position during the hold.'
      ],
      click: [
        'A short click on the page does nothing. Only a 400ms hold opens the ring, so ordinary interaction with the page is never hijacked.',
        'Right click opens the ring and suppresses the browser context menu. This is a real trade: some users want the browser menu, so ship it behind a preference, or drop the contextmenu binding and keep the hold.',
        'Clicking an item commits. Clicking outside the ring closes without committing.'
      ],
      responsive: {
        desktop: 'Radius 112px, item boxes 56px, labels outside the ring at 11px mono, needle visible.',
        tablet: 'Identical. The hold gesture becomes the primary path because a trackpad long press is natural.',
        mobile: 'Below 768px the radius drops to 92px, item boxes go to 48px to clear the touch target floor, and labels move outside the ring so a thumb never covers the one it is arming. The contextmenu binding is dropped because there is no right click, and the dead zone grows to 38px to allow for a less precise touch centre.'
      },
      a11y: [
        'role="menu" with role="menuitem" children and roving tabindex: exactly one item is tabbable at a time and the arrow keys move both focus and the roving index.',
        'The trigger carries aria-haspopup="true" and aria-expanded.',
        'Focus is trapped in the ring while it is open and returns to whatever opened it.',
        'Every item has a visible text label. An icon-only radial menu is a memory test.',
        'Item boxes are 56px on desktop and 48px on touch, and the geometry guarantees at least 8px between neighbours at both radii.',
        'Under prefers-reduced-motion the bloom is replaced by a 120ms opacity change with items already at their final positions, the ring draws instantly, and the needle jumps to the armed angle instead of sweeping.'
      ],
      perf: [
        'The ticker subscription is added on open and removed on close. A closed menu costs nothing at all.',
        'One transform write per frame while open, on the needle. The items are positioned once per open and never touched again.',
        'Hit testing is a single atan2 on the recorded pointer position. There is no per-item distance test and no getBoundingClientRect in the frame.',
        'The ring is one SVG circle, not six arc paths, so arming changes no geometry.'
      ],
      packages: [
        { p: 'none required', w: 'Six cos and sin calls and one atan2. Any radial menu package would bring its own opinions about positioning that you would then fight.' },
        { p: 'no framer-motion', w: 'The bloom is a transform and an opacity with a delay. A motion component per item would add six subscriptions to animate something CSS already interrupts correctly.' }
      ],
      architecture: [
        { f: 'components/navbar/CompassMenu.tsx', r: '"use client" leaf. Owns open state, centre point, armed index and the pointer bindings.' },
        { f: 'lib/radial.ts', r: 'Pure geometry: pointFor(index, count, radius), sectorFor(angle, count), clampCentre(point, radius, viewport). Unit testable with no DOM.' },
        { f: 'lib/useLongPress.ts', r: 'pointerdown, a 400ms timer, an 8px movement cancel, and pointercancel handling. Reusable for any hold gesture on the site.' },
        { f: 'components/navbar/Navbar.tsx', r: 'Renders the trigger and keeps it in the tab order.' }
      ],
      state: [
        'open, centre and armedIndex in useState. armedIndex changes at most six times during a gesture, not per frame, so state is correct here.',
        'The needle angle and the raw pointer position are refs written from the ticker. Putting the needle angle in state would re-render six items sixty times a second.',
        'The long-press timer is a ref and must be cleared in the effect cleanup, on pointerup and on pointercancel. A leaked timer opens a menu after the user has moved on.',
        'The element that opened the menu is a ref.'
      ],
      typography: [
        'Labels: mono 11px, 0.14em tracking, uppercase. Short, evenly weighted, and legible at any angle around the ring.',
        'No label wraps. If a destination name does not fit in one line at this size, the destination needs a shorter name, not a smaller font.',
        'The trigger uses the same mono 11px as every other bar control so the bar reads as one system.'
      ],
      color: [
        'Ring and armed dot are the signature hue. Everything else is neutral ink.',
        'The armed state is communicated by ink weight and dot size as well as hue, so it survives a colour vision deficiency.',
        'The plate behind each item is surface-2 at 92% with a 1px hairline, opaque enough to stay legible over any part of the page.',
        'No scrim. The ring is small and the page behind stays readable, which is the point of a contextual menu.'
      ],
      spacing: [
        'Radius 112px desktop, 92px touch. Six items at 60deg gives about 112px of arc between neighbours at the desktop radius, comfortably past the 8px separation floor.',
        'Labels sit 22px outside the ring so the item plate never overlaps its own text.',
        'Dead zone 30px desktop, 38px touch.',
        'Viewport clamp keeps at least 64px between the ring and any edge.'
      ],
      relationships: [
        'Angle communicates identity. The top sector is always the same destination, which is what lets a returning user flick without looking.',
        'The needle communicates the current arm, and it is the only travelling element in the concept.',
        'Distance communicates nothing and is deliberately ignored past the dead zone. That is the difference between a radial menu that feels precise and one that feels fussy.',
        'Order around the ring matches the order of the bar links, so the two navigations teach each other.'
      ],
      acceptance: [
        'Holding anywhere on the page for 400ms opens the ring centred on the pointer, and a short click does not.',
        'Opening near an edge still shows the whole ring and all six labels.',
        'Moving the pointer arms the sector it points at, at any distance past the dead zone, and the needle follows without lag or overshoot.',
        'The bar button opens the same menu at the centre and the arrow keys walk it in both directions with wrapping.',
        'Escape closes and the trigger is focused.',
        'With reduced motion on the items appear in place, the needle jumps, and every destination is still reachable.'
      ]
    },

    mount: function (root, ctx) {
      var host = makeHost(root, ctx);
      var R = env.mobile ? 92 : 112;
      var DEAD = env.mobile ? 38 : 30;
      var N = LINKS.length;

      var bar = SE.el('header', 'nav-compass__bar');
      bar.innerHTML =
        '<a class="nav-compass__mark" href="#' + host.uidPrefix + '-index" data-go="index">' +
          '<b>Miftaul</b><span>Islam</span></a>' +
        '<nav class="nav-compass__inline" aria-label="Primary"><ul>' +
          LINKS.slice(1, 4).map(function (l) {
            return '<li><a href="#' + host.uidPrefix + '-' + l.id + '" data-go="' + l.id + '">' + l.label + '</a></li>';
          }).join('') +
        '</ul></nav>' +
        '<button class="nav-compass__trigger" type="button" aria-haspopup="true" aria-expanded="false">' +
          icon('studio') + '<span>Compass</span></button>';

      var ring = SE.el('div', 'nav-compass__ring');
      ring.setAttribute('role', 'menu');
      ring.setAttribute('aria-label', 'Destinations');
      var C = 2 * Math.PI * R;
      ring.innerHTML =
        '<svg class="nav-compass__circle" width="' + (R * 2 + 4) + '" height="' + (R * 2 + 4) + '" ' +
          'viewBox="0 0 ' + (R * 2 + 4) + ' ' + (R * 2 + 4) + '" aria-hidden="true">' +
          '<circle cx="' + (R + 2) + '" cy="' + (R + 2) + '" r="' + R + '" ' +
            'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '"/></svg>' +
        '<i class="nav-compass__needle" aria-hidden="true"></i>' +
        '<i class="nav-compass__hub" aria-hidden="true"></i>' +
        LINKS.map(function (l, i) {
          var a = -Math.PI / 2 + i * (Math.PI * 2 / N);
          var x = Math.cos(a) * R, y = Math.sin(a) * R;
          /* Labels are pushed outward along the same ray so a plate never sits
             on top of its own text. */
          var side = Math.cos(a) < -0.3 ? 'l' : (Math.cos(a) > 0.3 ? 'r' : 'c');
          return '<button class="nav-compass__item is-' + side + '" type="button" role="menuitem" ' +
                   'tabindex="' + (i === 0 ? '0' : '-1') + '" data-i="' + i + '" data-go="' + l.id + '" ' +
                   'style="--x:' + x.toFixed(1) + 'px;--y:' + y.toFixed(1) + 'px;--i:' + i + '">' +
                   '<span class="nav-compass__plate">' + icon(l.icon) + '</span>' +
                   '<span class="nav-compass__label">' + l.label + '</span>' +
                 '</button>';
        }).join('');

      host.layer.appendChild(bar);
      host.layer.appendChild(ring);
      root.appendChild(host.layer);

      var page = fauxPage(host);
      root.appendChild(page);
      host.reserve(80, 24);

      /* ------------------------------------------------------------ state */
      var trigger = SE.$('.nav-compass__trigger', bar);
      var needle = SE.$('.nav-compass__needle', ring);
      var items = SE.$$('.nav-compass__item', ring);
      var open = false;
      var armed = -1;
      var focusIdx = 0;
      var angle = -Math.PI / 2, angleTarget = -Math.PI / 2;
      var cx = 0, cy = 0;
      var holdTimer = null, holdX = 0, holdY = 0, fromHold = false;
      var trap = makeTrap(ring, function () { setOpen(false); });

      function place(clientX, clientY) {
        var r = host.layer.getBoundingClientRect();
        var vh = host.scroller.clientHeight || window.innerHeight;
        var vw = r.width;
        cx = M.clamp(clientX - r.left, R + 64, Math.max(R + 64, vw - R - 64));
        cy = M.clamp(clientY - r.top, R + 64, Math.max(R + 64, vh - R - 64));
        ring.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      }

      function setArmed(i) {
        if (i === armed) return;
        armed = i;
        for (var k = 0; k < items.length; k++) items[k].classList.toggle('is-armed', k === armed);
      }

      function setOpen(v, atX, atY) {
        if (v === open) return;
        open = v;
        trigger.setAttribute('aria-expanded', String(v));
        if (v) {
          var r = host.layer.getBoundingClientRect();
          var vh = host.scroller.clientHeight || window.innerHeight;
          place(atX == null ? r.left + r.width / 2 : atX, atY == null ? r.top + vh / 2 : atY);
          setArmed(-1);
          angle = angleTarget = -Math.PI / 2;
          needle.style.transform = 'rotate(' + (angle * 180 / Math.PI + 90).toFixed(2) + 'deg)';
          ring.classList.add('is-on');
          setFocus(0);
          trap.activate(trigger, items[0]);
          if (!env.reduced) SE.ticker.add(tick);
        } else {
          ring.classList.remove('is-on');
          setArmed(-1);
          fromHold = false;
          SE.ticker.remove(tick);
          trap.release();
        }
      }

      function setFocus(i) {
        focusIdx = ((i % N) + N) % N;
        for (var k = 0; k < items.length; k++) {
          items[k].setAttribute('tabindex', k === focusIdx ? '0' : '-1');
        }
        items[focusIdx].focus({ preventScroll: true });
        setArmed(focusIdx);
        angleTarget = -Math.PI / 2 + focusIdx * (Math.PI * 2 / N);
        if (env.reduced) {
          angle = angleTarget;
          needle.style.transform = 'rotate(' + (angle * 180 / Math.PI + 90).toFixed(2) + 'deg)';
        }
      }

      function commit(i) {
        var l = LINKS[i];
        setOpen(false);
        if (l) host.goTo(host.uidPrefix + '-' + l.id, 64);
      }

      /* ----------------------------------------------------------- ticker */
      function tick(dt) {
        /* Unwrap the delta to the short way round, or the needle takes the long
           path every time the pointer crosses due north. */
        var d = angleTarget - angle;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        angle = M.damp(angle, angle + d, 22, dt);
        needle.style.transform = 'rotate(' + (angle * 180 / Math.PI + 90).toFixed(2) + 'deg)';
      }

      /* ------------------------------------------------------ pointer arm */
      function onMove(e) {
        if (!open) return;
        var r = host.layer.getBoundingClientRect();
        var dx = (e.clientX - r.left) - cx;
        var dy = (e.clientY - r.top) - cy;
        if (Math.sqrt(dx * dx + dy * dy) < DEAD) { setArmed(-1); return; }
        var a = Math.atan2(dy, dx);
        angleTarget = a;
        var idx = Math.round((a + Math.PI / 2) / (Math.PI * 2 / N));
        setArmed(((idx % N) + N) % N);
      }

      function clearHold() {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      }

      function onDown(e) {
        if (open) return;
        if (e.target.closest && e.target.closest('.nav-compass__bar, .nav-page__more')) return;
        holdX = e.clientX; holdY = e.clientY;
        clearHold();
        holdTimer = setTimeout(function () {
          holdTimer = null;
          fromHold = true;
          setOpen(true, holdX, holdY);
        }, 400);
      }

      function onHoldMove(e) {
        if (!holdTimer) return;
        if (Math.abs(e.clientX - holdX) > 8 || Math.abs(e.clientY - holdY) > 8) clearHold();
      }

      function onUp() {
        clearHold();
        if (open && fromHold && armed >= 0) commit(armed);
        else if (open && fromHold) { fromHold = false; }
      }

      function onContext(e) {
        if (env.touch) return;
        if (e.target.closest && e.target.closest('.nav-compass__bar')) return;
        e.preventDefault();
        setOpen(true, e.clientX, e.clientY);
      }

      root.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onHoldMove, { passive: true });
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      root.addEventListener('contextmenu', onContext);

      trigger.addEventListener('click', function () { setOpen(!open); });

      ring.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); setFocus(focusIdx + 1); }
        else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); setFocus(focusIdx - 1); }
        else if (k === 'Home') { e.preventDefault(); setFocus(0); }
        else if (k === 'End') { e.preventDefault(); setFocus(N - 1); }
      });

      ring.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.nav-compass__item') : null;
        if (b) commit(parseInt(b.getAttribute('data-i'), 10));
      });

      function onNavClick(e) {
        var a = e.target.closest ? e.target.closest('.nav-compass__bar [data-go]') : null;
        if (!a) return;
        e.preventDefault();
        host.goTo(host.uidPrefix + '-' + a.getAttribute('data-go'), 64);
      }
      root.addEventListener('click', onNavClick);

      /* A menu anchored to a point on screen is meaningless once the content
         under that point has moved, so scrolling closes it. */
      var sw = watchScroll(host.scroller);
      var lastY = sw.state.y;
      function edge() {
        bar.classList.toggle('is-edged', sw.state.y > 12);
        if (open && Math.abs(sw.state.y - lastY) > 6) setOpen(false);
        lastY = sw.state.y;
      }
      SE.ticker.add(edge);

      var barLinks = SE.$$('.nav-compass__bar [data-go]', bar);
      var spy = spySections(host, page.ids, function (id) {
        var short = id.replace(host.uidPrefix + '-', '');
        barLinks.forEach(function (a) {
          if (a.getAttribute('data-go') === short) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
      });

      return {
        destroy: function () {
          clearHold();
          SE.ticker.remove(tick);
          SE.ticker.remove(edge);
          root.removeEventListener('pointerdown', onDown);
          root.removeEventListener('contextmenu', onContext);
          root.removeEventListener('click', onNavClick);
          window.removeEventListener('pointermove', onHoldMove);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
          sw.destroy();
          spy.destroy();
          trap.destroy();
          host.destroy();
          root.classList.remove('nav-c', 'nav-scroll');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     PAGE 04  -  INDEX
     --------------------------------------------------------------------------
     Navigation as an oversized typographic index. No icons, no panels, no
     accent colour: the destinations at 5rem are the entire composition, and
     contrast does the work colour would otherwise do.

     The reveal is a mask: each line sits in an overflow-hidden box and its
     inner span rises from 105% to 0. That is the one motion in this file that
     is allowed to take more than half a second, because it happens once per
     opening and it is the whole point of the concept.
     ========================================================================== */

  SE.register({
    area: 'nav',
    variant: 'page',
    id: 'nav-page-index',
    num: 4,
    name: 'Index',
    kind: 'Type / mask reveal',
    accent: '#E8E2D6',
    tagline: 'The list is the design',
    desc: 'A takeover built from nothing but type. Lines rise out of their own mask, the one under the ' +
          'pointer holds full ink while the rest step back, and closing sends them the way they came.',
    interaction: 'Open the index, then move or Tab through the lines. Escape closes and returns to the trigger.',
    hint: 'Open the index &middot; <kbd>Tab</kbd> walks it',

    preview: function (ctx, w, h, t, heat) {
      var n = 4;
      var pad = w * 0.10;
      var cycle = (t * 0.30) % 1;
      var focus = Math.floor((t * 0.55) % n);

      for (var i = 0; i < n; i++) {
        var lp = M.clamp((cycle * 3.2 - i * 0.30), 0, 1);
        lp = lp * lp * (3 - 2 * lp);
        if (cycle > 0.72) lp = M.clamp(1 - (cycle - 0.72) * 5.2 + (n - 1 - i) * 0.12, 0, 1);
        var lh = h * 0.155;
        var y = h * 0.12 + i * (lh + h * 0.045);
        var on = i === focus && lp > 0.9;
        /* Each line is drawn inside its own clipped box, which is what makes
           the rise read as a mask rather than as a slide. */
        ctx.save();
        ctx.beginPath();
        ctx.rect(pad, y, w - pad * 2, lh);
        ctx.clip();
        ctx.fillStyle = 'rgba(232,226,214,' + (on ? 0.92 : 0.34 + heat * 0.10) + ')';
        ctx.fillRect(pad + (on ? 6 : 0), y + lh * (1 - lp) + lh * 0.22, (w - pad * 2) * (0.42 + (i % 3) * 0.16), lh * 0.44);
        ctx.restore();

        ctx.strokeStyle = 'rgba(232,226,214,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, Math.round(y + lh) + 0.5);
        ctx.lineTo(w - pad, Math.round(y + lh) + 0.5);
        ctx.stroke();
      }
    },

    spec: {
      subtitle: 'A full screen index where type is the only material',
      philosophy: [
        'Most navigation overlays are a panel with a list inside it. This one deletes the panel. The destinations are set large enough to be the composition, and the only other marks on the screen are five hairlines and a close control.',
        'It is the one concept in this area with no signature hue. That is deliberate: with type this size, contrast is already the loudest signal available, and adding colour would be a second voice saying the same thing.',
        'Dimming the lines you are not on is what turns a list into an index. It answers "where am I" without a highlight, a badge or a marker.'
      ],
      hierarchy: [
        '1. The attended line at 100% ink, shifted 18px right.',
        '2. Its meta line, which fades in only for the attended row. Six meta lines showing at once would be a paragraph.',
        '3. The other lines at 34% ink. Present, readable, clearly not the subject.',
        '4. Hairlines between rows at 8% ink.',
        '5. The close control, mono 11px, top right. The quietest thing on the screen because Escape is the real close.'
      ],
      structure: [
        'Trigger <button aria-expanded aria-controls> in a 60px bar.',
        'Overlay is role="dialog" aria-modal="true" filling the container, ground at the page colour so it reads as the page replacing itself rather than as a sheet on top.',
        'Each destination is <span class="mask"><a>...</a></span> where the mask is overflow:hidden and the anchor is the thing that transforms. Without the mask the lines slide in from visibly outside the row.',
        'A right aligned mono meta column per row, on the same baseline as the line it belongs to.'
      ],
      interaction: [
        'The trigger opens; Escape, the close control, or activating a destination closes.',
        'Pointer or focus attends a line. Both drive the same single attendedIndex, so a keyboard user gets exactly the composition a mouse user gets.',
        'Leaving the list with the pointer clears the attend state and every line returns to 34%; the focused line, if any, keeps it.',
        'Activating a destination closes the overlay first, then scrolls, so the reader watches the section arrive rather than watching it through an overlay.'
      ],
      choreography: [
        { n: 'Line rise', d: 'transform translate3d(0,105%,0) to none inside an overflow-hidden mask, 560ms cubic-bezier(0.23, 1, 0.32, 1), delay 120ms + index * 52ms. 105% rather than 100% so the descenders clear the mask edge before the line starts to show.' },
        { n: 'Meta fade', d: 'opacity 0 to 1 over 300ms cubic-bezier(0.23, 1, 0.32, 1) on the attended row only. No translate: the meta line belongs to the destination and moving it would separate them.' },
        { n: 'Attend shift', d: 'transform translate3d(18px,0,0) over 260ms cubic-bezier(0.23, 1, 0.32, 1). Siblings go to 34% ink over 220ms. Both are ink and transform only, so a fast sweep across six lines composites and never repaints.' },
        { n: 'Close', d: 'Lines return to translate3d(0,105%,0) over 320ms cubic-bezier(0.77, 0, 0.175, 1) with a reverse stagger of 26ms, so the list leaves the way it arrived, bottom first. 57% of the entrance.' },
        { n: 'Ground', d: 'opacity 0 to 1 over 200ms, ahead of the lines, so the type never rises against the page it is covering.' }
      ],
      scroll: [
        'The overlay does not scroll on desktop: six destinations at this size fit one viewport by design, and if a seventh is added the size comes down rather than the list gaining a scrollbar.',
        'The page behind takes overflow:hidden while open.',
        'On mobile the overlay does scroll, because six lines at 12vw do not fit a phone. It gets overscroll-behavior:contain so the page behind never moves.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine).',
        'Attending a line shifts it 18px and drops its siblings. This is affordable here and nowhere else in this area, because the overlay is seen occasionally rather than constantly.',
        'The 18px shift is on the anchor, which fills the row, so the pointer never falls off the target it just moved.'
      ],
      click: [
        'Destination: close, then scroll.',
        'The meta column is not clickable and not focusable. It is a label for the line, and a second target on the same row would double the tab stops for no gain.',
        'Clicking the ground closes.'
      ],
      responsive: {
        desktop: 'Lines at clamp(2.5rem, 8vw, 6rem), meta column right aligned at 11px mono, 18px attend shift.',
        tablet: 'Lines at 5.5vw with the meta column kept. The attend shift drops to 12px because the rows are shorter.',
        mobile: 'Below 768px the lines drop to clamp(1.875rem, 11vw, 3rem) and the meta moves under each line at 10px rather than into a column, because a right aligned column on a 375px screen collides with the descenders. Sibling dimming is dropped entirely, since there is no hover to drive it and dimming on focus alone would flicker as the reader taps.'
      },
      a11y: [
        'Real <a> elements inside a <nav aria-label="All sections">. The mask is presentational and carries no role.',
        'Focus and hover set the same attendedIndex, so tabbing through the index looks exactly like moving through it with a mouse.',
        'Focus is trapped, Escape closes, focus returns to the trigger.',
        'Rows are 76px tall on desktop and 60px on mobile, so the target size floor is met several times over.',
        'The dimmed state is 34% ink on the page ground, which still clears 4.5:1. Dimming must never take a destination below the contrast floor, which is why it stops at 34% and not lower.',
        'Under prefers-reduced-motion the mask reveal becomes a 160ms opacity fade with no stagger and no translate, and the attend shift is dropped, leaving only the ink change.'
      ],
      perf: [
        'No per frame work at all. Six transitions, driven by class changes.',
        'The dimming is one class on the list container plus a :not(:hover) selector, not six style writes. Set the state on the parent and let the cascade do the rest.',
        'will-change: transform on the six anchors only while the overlay is open, removed on close, so six layers are not held for the life of the page.',
        'The overlay stays mounted. Six anchors is nothing to keep and rebuilding them would restart the fonts.'
      ],
      packages: [
        { p: 'none required', w: 'A mask reveal is overflow:hidden plus a transform. SplitText would be for characters, and this concept moves whole lines.' },
        { p: 'gsap (installed)', w: 'Reasonable alternative for the stagger if the site already runs a GSAP timeline, but CSS transition-delay from --i is smaller and interrupts correctly when the user closes mid-open.' }
      ],
      architecture: [
        { f: 'components/navbar/IndexOverlay.tsx', r: '"use client" leaf. Open state, attendedIndex, the trap.' },
        { f: 'components/navbar/Navbar.tsx', r: 'Bar and trigger, server rendered.' },
        { f: 'app/globals.css', r: 'The mask utility and the two curves, as tokens rather than inline values.' }
      ],
      state: [
        'open and attendedIndex in useState. attendedIndex changes at pointer speed across six rows, which is a handful of renders, not sixty a second.',
        'If the list ever grows past about a dozen rows, move attendedIndex to a data attribute written imperatively and let CSS do the dimming.',
        'No route change. This overlay is a layer on the current page.'
      ],
      typography: [
        'This concept is entirely typography, so the face has to carry it: a geometric grotesque with tight apertures, 400 weight, not a display serif.',
        'clamp(2.5rem, 8vw, 6rem), letter-spacing -0.045em, line-height 0.95. Display type needs negative tracking; the spacing that ships with a face is drawn for body copy.',
        'Meta column: mono 11px, 0.16em, uppercase. The counterweight that stops the big type looking like a poster with nothing to say.',
        'No italics, no second family, no gradient. Emphasis is ink and position.'
      ],
      color: [
        'No signature hue. Off white ink on the page ground, and one dimmed step at 34%.',
        'That is the point of difference against the other four page concepts, and it is only available to the concept whose entire content is text.',
        'In light mode invert to near black on a warm off white and keep the dimmed step at 38%, because dark ink dimmed on white loses legibility faster than light ink on black.'
      ],
      spacing: [
        'Rows 76px tall on desktop with a hairline between and none above the first or below the last.',
        'The list starts at 22vh, not centred. A centred list of six leaves a band of empty at the top that reads as a mistake rather than as space.',
        'Left gutter matches the page gutter exactly, so the index sits on the same vertical as the content it replaces.',
        'Meta column is right aligned to the same gutter on the other side.'
      ],
      relationships: [
        'Ink weight communicates attention, and it is the only signal doing that job.',
        'Vertical order communicates the order of the page, so the index doubles as a table of contents.',
        'The meta line is the only place a count appears, and each one is a real count rather than a decorative number.',
        'Position, not colour, communicates the current section: aria-current is marked with a small filled square at the start of the row.'
      ],
      acceptance: [
        'Opening the index rises six lines out of their masks in sequence with no visible clipping at the descenders.',
        'Attending a line dims the other five and reveals only its meta line.',
        'Tabbing produces exactly the same composition as moving the mouse.',
        'Closing sends the lines back down bottom first and returns focus to the trigger.',
        'At 375px the lines fit without horizontal scroll and the meta sits under each line.',
        'With reduced motion on the overlay fades, nothing rises, and every destination is reachable.'
      ]
    },

    mount: function (root, ctx) {
      var host = makeHost(root, ctx);
      var ovId = uid('index-ov');
      var headId = uid('index-head');
      var N = LINKS.length;

      var COUNTS = {
        index: 'Overview', work: '11 projects', stack: '6 tools',
        studio: 'Process', writing: '3 notes', contact: 'Q1 open'
      };

      var bar = SE.el('header', 'nav-index__bar');
      bar.innerHTML =
        '<a class="nav-index__mark" href="#' + host.uidPrefix + '-index" data-go="index">' +
          '<b>Miftaul</b><span>Islam</span></a>' +
        '<button class="nav-index__trigger" type="button" aria-expanded="false" aria-controls="' + ovId + '">' +
          'Index</button>';

      var ov = SE.el('div', 'nav-index__ov');
      ov.id = ovId;
      ov.setAttribute('role', 'dialog');
      ov.setAttribute('aria-modal', 'true');
      ov.setAttribute('aria-labelledby', headId);
      ov.innerHTML =
        '<div class="nav-index__top">' +
          '<h2 class="nav-index__head" id="' + headId + '">Index</h2>' +
          '<button class="nav-index__close" type="button">Close</button>' +
        '</div>' +
        '<nav class="nav-index__list" aria-label="All sections"><ul>' +
          LINKS.map(function (l, i) {
            return '<li style="--i:' + i + ';--o:' + (N - 1 - i) + '">' +
                     '<span class="nav-index__mask">' +
                       '<a href="#' + host.uidPrefix + '-' + l.id + '" data-go="' + l.id + '" data-i="' + i + '">' +
                         '<span class="nav-index__ln">' + l.label + '</span>' +
                         '<span class="nav-index__lc t-num">' + COUNTS[l.id] + '</span>' +
                       '</a>' +
                     '</span>' +
                     '<span class="nav-index__meta">' + l.meta + '</span>' +
                   '</li>';
          }).join('') +
        '</ul></nav>';

      host.layer.appendChild(bar);
      host.layer.appendChild(ov);
      root.appendChild(host.layer);

      var page = fauxPage(host);
      root.appendChild(page);
      host.reserve(76, 24);

      var trigger = SE.$('.nav-index__trigger', bar);
      var list = SE.$('.nav-index__list', ov);
      var rows = SE.$$('.nav-index__list li', ov);
      var open = false;
      var trap = makeTrap(ov, function () { setOpen(false); });
      var prevOverflow = '';

      function attend(i) {
        list.classList.toggle('is-attending', i >= 0);
        for (var k = 0; k < rows.length; k++) rows[k].classList.toggle('is-on', k === i);
      }

      function setOpen(v) {
        if (v === open) return;
        open = v;
        ov.classList.toggle('is-on', v);
        root.classList.toggle('is-open', v);
        trigger.setAttribute('aria-expanded', String(v));
        if ('inert' in HTMLElement.prototype) page.inert = v;
        if (v) {
          prevOverflow = host.scroller.style.overflow;
          host.scroller.style.overflow = 'hidden';
          trap.activate(trigger, SE.$('.nav-index__list a', ov));
        } else {
          host.scroller.style.overflow = prevOverflow;
          attend(-1);
          trap.release();
        }
      }

      trigger.addEventListener('click', function () { setOpen(!open); });
      SE.$('.nav-index__close', ov).addEventListener('click', function () { setOpen(false); });
      ov.addEventListener('click', function (e) { if (e.target === ov) setOpen(false); });

      /* Pointer and focus write the same single piece of state, so tabbing
         through the index produces exactly the composition the mouse gives. */
      if (env.fine) {
        list.addEventListener('pointerover', function (e) {
          var a = e.target.closest ? e.target.closest('a[data-i]') : null;
          if (a) attend(parseInt(a.getAttribute('data-i'), 10));
        });
        list.addEventListener('pointerleave', function () { attend(-1); });
      }
      list.addEventListener('focusin', function (e) {
        var a = e.target.closest ? e.target.closest('a[data-i]') : null;
        if (a) attend(parseInt(a.getAttribute('data-i'), 10));
      });

      function onNavClick(e) {
        var a = e.target.closest ? e.target.closest('[data-go]') : null;
        if (!a) return;
        e.preventDefault();
        if (open) setOpen(false);
        host.goTo(host.uidPrefix + '-' + a.getAttribute('data-go'), 60);
      }
      root.addEventListener('click', onNavClick);

      var marks = SE.$$('[data-go]', root);
      var spy = spySections(host, page.ids, function (id) {
        var short = id.replace(host.uidPrefix + '-', '');
        marks.forEach(function (a) {
          if (a.getAttribute('data-go') === short) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
      });

      var sw = watchScroll(host.scroller);
      function tick() { bar.classList.toggle('is-edged', sw.state.y > 12); }
      SE.ticker.add(tick);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          root.removeEventListener('click', onNavClick);
          sw.destroy();
          spy.destroy();
          trap.destroy();
          host.scroller.style.overflow = prevOverflow;
          host.destroy();
          root.classList.remove('nav-c', 'nav-scroll', 'is-open');
          root.innerHTML = '';
        }
      };
    }
  });

  /* Everything above is shared. Everything below registers one concept. */

  /* ==========================================================================
     PAGE 05  -  SHUTTER
     --------------------------------------------------------------------------
     Every other overlay in this area arrives. This one is already there.

     The navigation sits behind the page, full screen, from the moment the
     document loads. Opening it does not summon a panel: it slides the page down
     in its track until the navigation underneath is uncovered, leaving a strip
     of the page still visible at the bottom edge so the reader can see exactly
     what they will get back. Nothing fades in, nothing is built, nothing is
     torn down. The only thing that moves is the thing that was in the way.

     That inversion is the whole art direction, and it drives the layout too.
     A panel that arrives is a list, because a list is what fits inside a panel.
     A surface that was always behind the page can be a room: six full height
     bays divided by hairlines, each one a destination, labels set on the floor
     of the bay. It is the shop shutter going up on a row of stalls.
     ========================================================================== */

  SE.register({
    area: 'nav',
    variant: 'page',
    id: 'nav-page-shutter',
    num: 5,
    name: 'Shutter',
    kind: 'Depth / page slides away',
    accent: '#E8B04B',
    tagline: 'The navigation was behind the page the whole time',
    desc: 'Opening does not build a panel. The page slides down in its track and uncovers six ' +
          'full height bays that were already there, leaving a strip of the page at the bottom edge.',
    interaction: 'Press Sections. The page slides down; press the strip it leaves behind, or Escape, to close.',
    hint: 'Open Sections &middot; <kbd>Esc</kbd> closes',

    /* Miniature: the bays are drawn first, the page plate slides down over them
       on a slow cycle, and the bar is drawn last so the plate reads as passing
       underneath it. Thirty two operations. */
    preview: function (ctx, w, h, t, heat) {
      var barY = Math.round(h * 0.15);
      var cycle = (t * 0.30) % 1;
      var p = cycle < 0.60 ? Math.min(1, cycle / 0.32) : Math.max(0, 1 - (cycle - 0.60) / 0.24);
      p = p * p * (3 - 2 * p);

      var lip = h * 0.14;
      var leafTop = barY + (h - barY - lip) * p;
      var bays = 5;

      /* The room behind. Bays are always drawn; the plate is what hides them. */
      for (var i = 0; i < bays; i++) {
        var bx = (w / bays) * i;
        if (i > 0) {
          ctx.strokeStyle = 'rgba(236,236,239,0.10)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(Math.round(bx) + 0.5, barY);
          ctx.lineTo(Math.round(bx) + 0.5, h);
          ctx.stroke();
        }
        var on = i === 1;
        ctx.fillStyle = on
          ? 'rgba(232,176,75,' + (0.85 + heat * 0.15).toFixed(3) + ')'
          : 'rgba(236,236,239,' + (0.30 + heat * 0.14).toFixed(3) + ')';
        ctx.fillRect(bx + w * 0.030, h * 0.78, (w / bays) - w * 0.060, 3);
        ctx.fillStyle = 'rgba(236,236,239,0.13)';
        ctx.fillRect(bx + w * 0.030, h * 0.70, ((w / bays) - w * 0.060) * 0.62, 1);
      }

      /* The page, as one plate, on its way down. */
      ctx.fillStyle = '#0b0b0f';
      ctx.fillRect(0, leafTop, w, h - leafTop);
      ctx.fillStyle = 'rgba(232,176,75,' + (0.55 + p * 0.45).toFixed(3) + ')';
      ctx.fillRect(0, leafTop, w, 2);
      for (var k = 0; k < 3; k++) {
        ctx.fillStyle = 'rgba(236,236,239,' + (0.20 - k * 0.05).toFixed(3) + ')';
        ctx.fillRect(w * 0.10, leafTop + h * 0.14 + k * h * 0.10, w * (0.44 - k * 0.09), 2);
      }

      /* The bar never moves, so it is drawn last and covers the plate's travel. */
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, w, barY);
      ctx.strokeStyle = 'rgba(236,236,239,0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, barY + 0.5); ctx.lineTo(w, barY + 0.5);
      ctx.stroke();
      ctx.fillStyle = 'rgba(236,236,239,0.55)';
      ctx.fillRect(w * 0.08, barY * 0.45, w * 0.14, 2);
      ctx.fillStyle = 'rgba(232,176,75,0.95)';
      ctx.fillRect(w * 0.80, barY * 0.45, w * 0.12, 2);
    },

    spec: {
      subtitle: 'The page slides down and uncovers navigation that was always behind it',
      philosophy: [
        'Every other navigation overlay arrives from somewhere. This one is already present, sitting behind the page from first paint, and opening only moves the page out of the way. The difference is not decorative: a surface that arrives has to justify where it came from, and a surface that was always there does not have to explain anything.',
        'Because the navigation is not confined to a panel, it does not have to be a list. Six full height bays divided by hairlines use the whole revealed area, and a destination whose target is a 260px wide column is far easier to hit than one whose target is a 32px tall row.',
        'The page never leaves completely. A 96px strip stays at the bottom edge, still showing the exact content the reader was looking at, so the way back is visible rather than remembered.'
      ],
      hierarchy: [
        '1. The six bay labels at clamp(1.5rem, 2.6vw, 2.25rem), weight 400, sitting on the floor of each bay. They are the only reason the shutter opens.',
        '2. The bay meta line at 11px mono in ink-3, one line above the label.',
        '3. The bay you were reading, marked with aria-current and a 2px rule in the signature hue along the bay floor. One mark, not a mark plus a colour plus a weight.',
        '4. The strip of page at the bottom edge, unchanged and undimmed, because it is where the reader left off.',
        '5. The bar, which does not move at any point and holds the trigger under the pointer that pressed it.'
      ],
      structure: [
        'Three layers in one scroll container. Deep layer: position:sticky, top:0, height:0, z-index 0, holding the navigation absolutely positioned at height 100dvh. Leaf: the page itself, position:relative, z-index 1, opaque page ground. Chrome layer: position:sticky, height:0, z-index 8, holding the 64px bar and the close strip.',
        'The navigation is a <nav> containing a <ul> laid out as grid-template-columns: repeat(6, 1fr) with a 1px column rule. Each bay is one <a> filling the full height of the cell, so the whole column is the target.',
        'The leaf is a single element wrapping all page sections. It is what translates, so one transform moves the entire document.',
        'Closed state on the navigation is visibility:hidden, which removes six links from the tab order and the accessibility tree in one property, with no aria-hidden and no tabindex sweep.'
      ],
      interaction: [
        'The trigger in the bar toggles. aria-expanded flips with the state and the chevron rotates 180deg to state which way the page will move.',
        'Open translates the leaf by calc(100dvh - 96px) on the Y axis. It never translates on X, so the movement matches the axis of the scroll it interrupts.',
        'While open the scroll container takes overflow:hidden and its previous value is restored on close. scrollTop is preserved by the browser, so the leaf returns to the exact reading position.',
        'Three ways to close: the trigger again, the close strip at the bottom edge, or Escape. Focus returns to the trigger in all three cases.',
        'The close strip is a real button spanning the full width at 96px tall, transparent, so the page underneath shows through and the target is 96px of viewport rather than a 32px label.',
        'A bay closes the shutter first, then scrolls, so the reader watches the arrival rather than watching it through a shutter that is still moving.'
      ],
      choreography: [
        { n: 'Leaf travel', d: 'transform: translate3d(0, calc(100dvh - 96px), 0), 520ms cubic-bezier(0.32, 0.72, 0, 1). Over the 300ms UI ceiling on purpose: this is a full frame surface moving its own height, which is a cinematic moment, and it happens a handful of times per session.' },
        { n: 'Backdrop settle', d: 'The navigation moves from translate3d(0, 22px, 0) opacity 0.55 to none opacity 1 on the same 520ms curve. Same curve, opposite direction, one fortieth of the distance: the two surfaces part instead of one sliding over a static picture.' },
        { n: 'Close strip', d: 'opacity 0 to 1 over 160ms cubic-bezier(0.23, 1, 0.32, 1) with a 300ms delay, so it appears once the leaf has all but landed. A control that fades in beside a moving edge reads as debris.' },
        { n: 'Chevron', d: 'transform: rotate(180deg), 220ms cubic-bezier(0.23, 1, 0.32, 1), transform-box: fill-box, transform-origin: center. It states the direction the page is about to travel.' },
        { n: 'Close', d: 'Leaf returns over 400ms cubic-bezier(0.77, 0, 0.175, 1), 77% of the entrance. The strip drops to opacity 0 over 100ms with no delay so nothing is left floating over the returning page.' },
        { n: 'Bay hover', d: 'background-color transparent to rgba(232,176,75,0.05) and label ink-2 to ink, both 140ms ease. No transform: a 260px wide target that moves under the pointer is a target you can miss.' }
      ],
      scroll: [
        'The page does not scroll while the shutter is open. The container takes overflow:hidden, which the browser preserves scrollTop across.',
        'The bar is position:sticky rather than fixed, so it belongs to its scroll container and behaves identically when the whole thing is nested inside another scroller.',
        'scroll-padding-top of 80px and scroll-padding-bottom of 24px are set on the container so a focused control is never scrolled under the bar. WCAG 2.2 focus-not-obscured, in one property.',
        'The active bay is tracked by a single IntersectionObserver with rootMargin -42% 0px -52% 0px, a band slightly above centre because readers sit above the middle of what they are reading.'
      ],
      hover: [
        'Every hover rule sits inside @media (hover: hover) and (pointer: fine).',
        'Bay: ground to 5% of the signature hue and label to full ink over 140ms. That is the entire hover treatment.',
        'The bay column rule brightens from 8% to 16% ink so the boundary of the target you are inside is legible.',
        'Nothing in this concept opens on hover. The shutter is a deliberate act and requires a press.'
      ],
      click: [
        'Trigger toggles the shutter and moves focus into the first bay.',
        'Bay closes the shutter and scrolls the container to that section.',
        'Close strip closes and returns focus to the trigger.',
        'The contact address in the footer of the navigation is a real mailto link, not a scroll target.'
      ],
      responsive: {
        desktop: 'Six bays across at repeat(6, 1fr), labels at up to 2.25rem on the bay floor, 96px close strip, bar at 64px.',
        tablet: 'Bays wrap to repeat(3, 1fr) over two rows and the column rule becomes a full grid rule. Labels drop to 1.5rem.',
        mobile: 'Below 768px there are no bays. The revealed area becomes a single column of six 56px rows with a hairline between, labels at 1.25rem, meta lines removed, and the leaf travels only calc(100dvh - 64px) so the strip is thumb sized rather than pointer sized. A different composition, not a narrower one.'
      },
      a11y: [
        'Real <nav>, real <a>, real <button>. aria-expanded on the trigger, aria-controls to the navigation id, aria-current="page" on the bay matching the section in view.',
        'The navigation is role="dialog" aria-modal="true" with an accessible name from its own heading, because while it is open the page behind it is inert.',
        'Focus is trapped while open, restored to the trigger on close, and pulled back by a document focusin guard if it escapes by a route other than Tab.',
        'Escape closes and calls preventDefault so a containing dialog does not also close.',
        'Every target clears 44x44 with at least 8px between. The bays are far larger; the close strip is 96px tall and full width.',
        'Focus rings use outline with a 3px offset and no ancestor of a focusable element has overflow:hidden, so no ring is ever clipped by a mask this concept owns.',
        'Under prefers-reduced-motion the leaf does not translate. It cross fades to opacity 0 over 140ms and the navigation cross fades in, so the reveal still happens and nothing travels.'
      ],
      perf: [
        'Zero per frame work while closed or open. The whole concept is two CSS transitions on transform and opacity plus one IntersectionObserver.',
        'One transform moves the entire page because the page is wrapped in a single leaf element. Six columns of navigation never move at all.',
        'will-change: transform is set on the leaf only while the class that opens it is present, so the compositor layer exists for the 520ms it is needed and not for the rest of the session.',
        'No backdrop-filter. The leaf is opaque, so a blur would be paying for an effect with nothing behind it to see.'
      ],
      packages: [
        { p: 'none required', w: 'A disclosure, a focus trap and two transitions. A headless overlay library would hand you focus management you would then fight to keep the bar outside the trap.' },
        { p: 'no framer-motion', w: 'AnimatePresence exists to hold an element in the tree while it animates out. Nothing here ever unmounts, so there is nothing for it to solve.' },
        { p: 'gsap (installed)', w: 'Do not use it here. A CSS transition retargets from its current value when the reader closes mid open; a timeline has to be reversed by hand and will jump if the reversal is late.' }
      ],
      architecture: [
        { f: 'app/layout.tsx', r: 'Renders the deep navigation layer, the leaf wrapper and the bar around {children}. The leaf must wrap the whole route so one transform moves everything.' },
        { f: 'components/navbar/ShutterNav.tsx', r: '"use client" leaf. Owns open state, the trap, the inert toggle and the scroll lock. Receives destinations as props.' },
        { f: 'components/navbar/Bay.tsx', r: 'One destination column. Server rendered, no client JS of its own.' },
        { f: 'lib/useFocusTrap.ts', r: 'Tab wrap, focusin guard, Escape, return focus. One implementation for every overlay on the site.' },
        { f: 'lib/navShell.ts', r: 'Already exists. Single source of activeSection so the bar and the bays cannot disagree.' }
      ],
      state: [
        'open: boolean in useState. It changes on intent, a few times a session, never per frame.',
        'The trigger element is a ref, not state. Putting it in state re-renders the bar on every open for no visual reason.',
        'The saved overflow value is a ref. It is restored on close and in the effect cleanup, so a route change mid open cannot leave the page unscrollable.',
        'activeSection comes from the existing navShell store rather than a second IntersectionObserver inside this component.',
        'Do not put the shutter behind a route. An overlay that changes the URL breaks the back button in a way no reader expects.'
      ],
      typography: [
        'Bay labels: display face 400 at clamp(1.5rem, 2.6vw, 2.25rem), letter-spacing -0.02em, line-height 1.05. Tracking tightens as the size grows because letters read further apart the larger they get.',
        'Bay meta and bar links: mono 11px, letter-spacing 0.16em, uppercase. Mono is for labels and indices here, never for prose.',
        'The navigation heading is mono 11px in ink-3. It names the surface for a screen reader and stays out of the way of the bays.',
        'The strip carries no type at all except the close label, so the page showing through it stays readable.'
      ],
      color: [
        'The page leaf is --void, one step darker than the navigation ground at --void-2, so the leaf reads as the near surface even where the seam is the only visible boundary.',
        'The signature hue appears exactly three times: the 2px seam on the leading edge of the leaf, the rule under the current bay, and the 5% hover ground.',
        'Column rules at 8% ink, rising to 16% on the bay under the pointer. Nothing else in the navigation carries a border.',
        'In light mode invert the two grounds and take every hairline to 12% of near black. Do not invert the seam.'
      ],
      spacing: [
        'Bar 64px, horizontal padding clamp(1.25rem, 4vw, 4.5rem), the same gutter as the page below so the wordmark sits on the content column.',
        'Bays inset 1.25rem from their column rule, labels sitting 2.5rem from the bay floor so they clear the close strip.',
        'Close strip 96px on pointer devices, 64px on touch, sized to what the input can hit rather than to the label inside it.',
        'The revealed area is exactly 100dvh minus the bar and minus the strip. Nothing in the navigation ever scrolls, which is why six is the ceiling for bays.'
      ],
      relationships: [
        'Depth encodes permanence. The navigation is behind because it is always available; the page is in front because it is what you are doing right now.',
        'The seam encodes the leading edge of a moving surface, which is why it is the only 2px line in the concept.',
        'The remaining strip of page encodes the way back, and it shows content the reader has already read rather than a generic close panel because recognising your place is faster than reading a label.',
        'aria-current is the only place the current section is marked in the accessibility tree, and the bay floor rule is its only visual echo.'
      ],
      acceptance: [
        'The navigation is present in the DOM behind the page at first paint and requires no JavaScript to exist.',
        'Pressing the trigger slides the page down and leaves a 96px strip showing the page content the reader was on at the bottom edge.',
        'The bays do not move, build, stagger or fade in at any point.',
        'Tab from the last bay goes to the first, not to the page behind it.',
        'Escape closes and the trigger is visibly focused afterwards, with a focus ring that is not clipped.',
        'Closing restores the exact scroll position the reader opened from.',
        'With reduced motion on, nothing translates, the navigation is still reachable, and every bay still works.'
      ]
    },

    mount: function (root, ctx) {
      var host = makeHost(root, ctx);
      var navId = uid('shutter-nav');
      var headId = uid('shutter-head');

      /* ------------------------------------------------- deep layer (behind)
         A second zero height sticky layer, placed before the leaf in DOM order
         and given a lower stacking level, so the navigation genuinely paints
         behind the page rather than pretending to. It carries its own viewport
         height variable because the shared one lives on the chrome layer. */
      var deep = SE.el('div', 'nav-shutter__deep');

      var back = SE.el('div', 'nav-shutter__back');
      back.id = navId;
      back.setAttribute('role', 'dialog');
      back.setAttribute('aria-modal', 'true');
      back.setAttribute('aria-labelledby', headId);

      var bays = LINKS.map(function (l) {
        return '<li><a href="#' + host.uidPrefix + '-' + l.id + '" data-go="' + l.id + '">' +
               '<span class="nav-shutter__bm">' + l.meta + '</span>' +
               '<span class="nav-shutter__bn">' + l.label + '</span></a></li>';
      }).join('');

      back.innerHTML =
        '<div class="nav-shutter__inner">' +
          '<div class="nav-shutter__top">' +
            '<h2 class="nav-shutter__head" id="' + headId + '">Everything on this site</h2>' +
            '<p class="nav-shutter__where">Reading <b>Index</b></p>' +
          '</div>' +
          '<nav class="nav-shutter__bays" aria-label="All sections"><ul>' + bays + '</ul></nav>' +
          '<div class="nav-shutter__foot">' +
            '<a class="nav-shutter__mail" href="mailto:write@miftaul.dev">' +
              '<span>write@miftaul.dev</span>' + icon('out') + '</a>' +
            '<p class="nav-shutter__avail">One project slot open in Q1</p>' +
          '</div>' +
        '</div>';

      deep.appendChild(back);
      root.appendChild(deep);

      /* ------------------------------------------------- chrome layer (front) */
      var bar = SE.el('header', 'nav-shutter__bar');
      bar.innerHTML =
        '<a class="nav-shutter__mark" href="#' + host.uidPrefix + '-index" data-go="index">' +
          '<b>Miftaul</b><span>Islam</span></a>' +
        '<button class="nav-shutter__trigger" type="button" aria-expanded="false" ' +
          'aria-controls="' + navId + '">' +
          '<span>Sections</span>' +
          '<svg class="nav-ico nav-shutter__chev" viewBox="0 0 24 24" aria-hidden="true" ' +
            'focusable="false"><path d="' + ICONS.down + '"/></svg>' +
        '</button>';

      var strip = SE.el('button', 'nav-shutter__strip');
      strip.type = 'button';
      strip.innerHTML =
        '<span class="nav-shutter__seam" aria-hidden="true"></span>' +
        '<span class="nav-shutter__striplab">Close</span>';

      host.layer.appendChild(bar);
      host.layer.appendChild(strip);
      root.appendChild(host.layer);

      /* ------------------------------------------------------------- leaf
         Appended last, after both zero height sticky layers, so their natural
         position is the top of the scroll container. A sticky element cannot
         travel above where it would have been laid out, so a chrome layer
         placed after the page would only appear once the reader reached the
         bottom of it. */
      var leaf = SE.el('div', 'nav-shutter__leaf');
      var page = fauxPage(host);
      leaf.appendChild(page);
      root.appendChild(leaf);

      host.reserve(80, 24);

      /* The deep layer needs the same viewport height the chrome layer gets, and
         the leaf needs it to know how far to travel. One observer, two readers,
         set on the concept root so both inherit it. */
      var vro = null;
      function sizeVar() {
        var vh = host.scroller.clientHeight || window.innerHeight;
        root.style.setProperty('--nav-shut-vh', vh + 'px');
      }
      if (typeof ResizeObserver !== 'undefined') {
        vro = new ResizeObserver(sizeVar);
        vro.observe(host.scroller);
      } else {
        window.addEventListener('resize', sizeVar);
      }
      sizeVar();

      /* ------------------------------------------------------------ state */
      var trigger = SE.$('.nav-shutter__trigger', bar);
      var where = SE.$('.nav-shutter__where b', back);
      var open = false;
      var prevOverflow = '';
      var clipT = 0;
      var trap = makeTrap(back, function () { setOpen(false); });

      function setOpen(v) {
        if (v === open) return;
        open = v;
        clearTimeout(clipT);
        root.classList.toggle('is-open', v);
        trigger.setAttribute('aria-expanded', String(v));
        if ('inert' in HTMLElement.prototype) leaf.inert = v;

        if (v) {
          /* Sliding a five screen page down by one screen does not uncover the
             navigation, it uncovers the screen of page that was above the fold.
             So the leaf is clipped to the window the reader is actually looking
             at, once, at the moment of opening. clip-path is in the element's
             own coordinate space, so the transform that follows carries the
             clipped plate with it. The page does not scroll while open, which
             is what makes a single constant clip correct. */
          leaf.style.clipPath = 'inset(' + Math.round(host.scroller.scrollTop) + 'px 0 0 0)';
          prevOverflow = host.scroller.style.overflow;
          host.scroller.style.overflow = 'hidden';
          trap.activate(trigger, SE.$('.nav-shutter__bays a', back));
        } else {
          host.scroller.style.overflow = prevOverflow;
          trap.release();
          /* Released only once the leaf is home. Clearing it early would pop
             the page above the fold back into view mid travel. */
          clipT = setTimeout(function () { leaf.style.clipPath = ''; }, env.reduced ? 0 : 420);
        }
      }

      trigger.addEventListener('click', function () { setOpen(!open); });
      strip.addEventListener('click', function () { setOpen(false); });

      function onNavClick(e) {
        var a = e.target.closest ? e.target.closest('[data-go]') : null;
        if (!a) return;
        e.preventDefault();
        var id = a.getAttribute('data-go');
        if (open) setOpen(false);
        host.goTo(host.uidPrefix + '-' + id, 64);
      }
      root.addEventListener('click', onNavClick);

      /* --------------------------------------------------- active section */
      var marks = SE.$$('[data-go]', root);
      var spy = spySections(host, page.ids, function (id) {
        var short = id.replace(host.uidPrefix + '-', '');
        marks.forEach(function (a) {
          if (a.getAttribute('data-go') === short) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
        for (var i = 0; i < LINKS.length; i++) {
          if (LINKS[i].id === short && where) where.textContent = LINKS[i].label;
        }
      });

      var sw = watchScroll(host.scroller);
      function tick() { bar.classList.toggle('is-edged', sw.state.y > 12); }
      SE.ticker.add(tick);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          clearTimeout(clipT);
          root.removeEventListener('click', onNavClick);
          if (vro) vro.disconnect();
          else window.removeEventListener('resize', sizeVar);
          sw.destroy();
          spy.destroy();
          trap.destroy();
          host.scroller.style.overflow = prevOverflow;
          host.destroy();
          root.style.removeProperty('--nav-shut-vh');
          root.classList.remove('nav-c', 'nav-scroll', 'is-open');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     SECTION 01  -  DOCK
     --------------------------------------------------------------------------
     Magnification, done with the actual maths rather than a CSS hover scale.

     Three things separate a real dock from the imitation:

     1. THE FALLOFF IS SMOOTH IN ITS SLOPE, NOT JUST ITS VALUE. A linear tent
        has a corner at the cursor and one at each edge of the influence radius,
        and the eye reads those corners as stepping. A raised cosine has zero
        derivative at both ends, so the swell arrives and leaves without a seam.
        That is the `hann` helper at the top of this file.

     2. NEIGHBOURS MOVE. An icon that grows in place either overlaps the one
        beside it or leaves a hole. Sizes are accumulated across the row and
        every item is displaced by the difference between its magnified centre
        and its resting centre, so the row breathes outward from the cursor and
        stays centred on the same axis.

     3. IT IS FAST. Hovering a dock is a constant interaction, so the response
        is a 38ms time constant, which is close enough to instant that no one
        will call it an animation. The expressive budget goes to the label,
        which is a 120ms opacity change, and nowhere else.

     THE KEYBOARD GETS THE SAME INSTRUMENT
     -------------------------------------
     Magnification driven only by a pointer is a feature half the audience does
     not have. Focus moves the magnification centre exactly as the cursor does,
     so tabbing through the dock swells and releases in the same way, and the
     arrow keys are wired as a shortcut on top of a normal tab order rather
     than as a replacement for one.
     ========================================================================== */

  SE.register({
    area: 'nav',
    variant: 'section',
    id: 'nav-section-dock',
    num: 1,
    pageOf: 'nav-page-radial',
    screens: 4.4,
    name: 'Dock',
    kind: 'DOM / cursor magnification',
    accent: '#2FD59A',
    tagline: 'A magnifier, with the falloff curve that makes it one',
    desc: 'Six destinations on a floating tray that swells under the cursor with a raised cosine falloff ' +
          'and displaces its neighbours. Focus drives the same magnification, so the keyboard gets the instrument too.',
    interaction: 'Move the pointer across the tray. Tab into it and use the arrow keys for the same effect.',
    hint: 'Hover the tray &middot; <kbd>Arrow</kbd> keys do the same',

    /* Miniature: a tray of six tiles under a cursor that sweeps back and forth,
       magnified by the same raised cosine the concept uses. Twenty six ops. */
    preview: function (ctx, w, h, t, heat) {
      var n = 6;
      var pad = w * 0.10;
      var span = w - pad * 2;
      var slot = span / n;
      var base = slot * 0.62;
      var top = h * 0.70;
      var cursor = pad + span * (0.5 + 0.46 * Math.sin(t * 0.85));
      var rad = slot * 2.2;
      var i, sizes = [], total = 0;

      /* Quiet page above the tray, so the dock reads as floating over content. */
      for (i = 0; i < 3; i++) {
        ctx.fillStyle = 'rgba(236,236,239,' + (0.16 - i * 0.04).toFixed(3) + ')';
        ctx.fillRect(pad, h * 0.16 + i * h * 0.13, span * (0.66 - i * 0.14), 2);
      }

      for (i = 0; i < n; i++) {
        var cx = pad + slot * (i + 0.5);
        var u = Math.abs(cursor - cx) / rad;
        var wgt = u >= 1 ? 0 : 0.5 * (1 + Math.cos(Math.PI * u));
        sizes[i] = base * (1 + 0.72 * wgt);
        total += sizes[i];
      }

      ctx.fillStyle = 'rgba(22,22,28,0.94)';
      ctx.fillRect(pad - 6, top - base - 6, span + 12, base + 12);
      ctx.strokeStyle = 'rgba(236,236,239,0.16)';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(pad - 6) + 0.5, Math.round(top - base - 6) + 0.5, span + 12, base + 12);

      var x = pad + (span - (total + (n - 1) * (slot - base))) / 2;
      for (i = 0; i < n; i++) {
        var s = sizes[i];
        var lift = s - base;
        var on = lift > base * 0.30;
        ctx.fillStyle = on
          ? 'rgba(47,213,154,' + (0.55 + heat * 0.35).toFixed(3) + ')'
          : 'rgba(236,236,239,0.24)';
        ctx.fillRect(x, top - s, s, s);
        x += s + (slot - base);
      }

      /* The cursor itself, so the card explains what is driving the swell. */
      ctx.fillStyle = 'rgba(236,236,239,0.72)';
      ctx.fillRect(cursor - 1, top + 6, 2, 8);
    },

    spec: {
      subtitle: 'Cursor magnification with a raised cosine falloff and a keyboard equivalent',
      philosophy: [
        'Magnification is only worth building if the falloff is right. A linear ramp has a corner at the cursor and one at each end of its radius, and the eye reads corners as steps. A raised cosine window, 0.5 * (1 + cos(pi * u)), is continuous in value and in slope at every point, so the swell arrives and releases without a seam.',
        'Neighbours have to move. An icon that grows in place either collides with the one beside it or floats in a hole. Sizes are accumulated across the row, so the dock breathes outward from the cursor and stays centred on its own axis.',
        'Hovering a dock is a constant interaction, so the response has to be effectively instant. Everything expressive here is spent on the label, which appears in 120ms, and on nothing else.',
        'A magnifier that only a pointer can drive excludes half the audience. Focus moves the magnification centre exactly as the cursor does.'
      ],
      hierarchy: [
        '1. The icon under the cursor, at 68px against a 44px rest size.',
        '2. Its label, 10px mono, which is the only text the dock shows at all.',
        '3. The current section, marked with aria-current and a single 3px dot on the tray floor.',
        '4. The other five icons at rest, ink-2 on a surface tile.',
        '5. The tray itself, which is the quietest thing in the composition because it is only a shelf.'
      ],
      structure: [
        'A <nav aria-label="Sections"> absolutely positioned inside its own zero height position:sticky layer with bottom: 0, placed after the page content, 32px from the bottom edge of the scrollport. Bottom anchored chrome hung off a top:0 layer stays on screen a full viewport after its section has ended.',
        'One <ul> as a flex row of six 44px cells with a fixed 10px gap. The layout width of the row never changes, which is what keeps the magnification off the layout path entirely.', 'Tray end padding is 32px, and it is derived rather than chosen: the widest the row can ever get is 24 * sum(hann) = 24 * 2.553 = 61.3px, which the re-centring splits into 30.6px at each end. 32px is that number rounded up, which is why no icon ever hangs off the tray.',
        'Per cell: an <a> that carries the horizontal displacement, a tile <span> that carries the scale with transform-origin 50% 100%, an aria-current dot, and an absolutely positioned label above.',
        'The tray has overflow:visible. Magnified tiles rise above it by design, and a focus ring on a 44px cell must never be clipped by the chrome that contains it.'
      ],
      interaction: [
        'Rest size 44px, maximum 68px, gap 10px. Magnification factor 1.545.',
        'Influence radius R = 2.2 * (44 + 10) = 118.8px, so the cursor reaches a little over two slots on each side.',
        'Weight for item i: w = 0.5 * (1 + cos(pi * u)) for |u| < 1, else 0, where u = (cursorX - restCentreX) / R. Size = 44 + 24 * w * amount.',
        'Displacement: sizes are accumulated left to right, the row is re-centred on the resting row centre, and each item translates by magnifiedCentre - restingCentre. No item ever overlaps another.',
        'Cursor follow: damp(px, targetX, 26, dt), a 38ms time constant. 63% of the distance in 38ms and 95% in 115ms, which reads as tracking rather than as animation while still killing pointer jitter.',
        'Engage and release: the magnification amount damps 0 to 1 at lambda 22 on enter and 1 to 0 at lambda 14 on leave. Release is slower than engage because a dock that snaps flat the moment the pointer leaves feels like it was switched off.',
        'Keyboard: Tab reaches every item in order. Focus sets the magnification centre to that item, so the dock swells around it identically. ArrowLeft and ArrowRight move focus, Home and End jump to the ends, Enter activates.',
        'Whichever item carries the highest weight above 0.5 shows its label. The label is the only thing that changes discretely; everything else is continuous.'
      ],
      choreography: [
        { n: 'Swell', d: 'transform: scale(size / 44) on the tile with transform-origin 50% 100%, written per frame from the ticker, peaking at 1.545. No CSS transition on the tile, because the value is already smoothed by the damp and a transition on top would add a second, slower filter.' },
        { n: 'Displace', d: 'transform: translate3d(dx, 0, 0) on the item, per frame from the same pass. Two transform writes per item, twelve per frame in total.' },
        { n: 'Label', d: 'opacity 0 to 1 over 120ms cubic-bezier(0.23, 1, 0.32, 1). Its vertical offset is written per frame as translate3d(-50%, -(size - 44)px, 0) so it rides the top edge of the tile it belongs to.' },
        { n: 'Release', d: 'The amount value falls to 0 at lambda 14, a 71ms time constant, so the row settles rather than dropping.' },
        { n: 'Press', d: 'transform: scale(0.94) on the tile for 100ms cubic-bezier(0.23, 1, 0.32, 1), applied on :active so the feedback lands on pointer down rather than on click.' }
      ],
      scroll: [
        'The dock is chrome, so it does not consume scroll. It sits in a sticky layer, holds while the section is on screen, and releases when the reader moves past it.',
        'The active section comes from one IntersectionObserver with rootMargin -42% 0px -52% 0px, and marks exactly one item with aria-current.',
        'scroll-padding-bottom equal to the dock height plus 24px is set on the container so a focused control is never scrolled underneath the tray.',
        'The magnification pass reads the row rect once per active frame and only while the amount is above 0.002, so a page being scrolled with the pointer away from the dock does no work at all.'
      ],
      hover: [
        'Every hover rule sits inside @media (hover: hover) and (pointer: fine). On a touch device the magnification never runs and the dock is a plain tab bar.',
        'Tile ink steps from ink-2 to ink over 140ms. That is the only colour change in the interaction.',
        'The tray does not react to hover as a whole. Only the items do, because the tray is not a target.'
      ],
      click: [
        'An item scrolls the container to its section with behavior:smooth, or auto under reduced motion.',
        'The dock never opens a menu. It has six destinations and no seventh, which is the constraint that lets it stay one row.',
        'The See more control lives in the page rather than in the dock, because putting it in the dock would change the thing being evaluated.'
      ],
      responsive: {
        desktop: 'Floating 378px tray, centred, 32px from the bottom. Magnification live.',
        tablet: 'Identical geometry. Magnification still runs when a fine pointer is present and is simply never engaged when one is not.',
        mobile: 'Below 768px the tray becomes a full width bottom tab bar: 64px tall, six equal flex cells, 28px icons with the label always visible underneath at 10px, no tray inset, no shadow, no magnification, and a top hairline instead of a border. A different pattern, not a smaller one, because there is no pointer to magnify with.'
      },
      a11y: [
        'A real <nav> with a real <ul> of real <a> elements. Every item is in the tab order; the arrow keys are a shortcut layered on top, never a replacement.',
        'aria-current="page" marks the section in view, and the 3px dot is its only visual echo.',
        'Targets are 44x44 with a 10px gap, above the 44px and 8px floors.',
        'The tray has overflow:visible so the 2px focus ring at 3px offset is never clipped, and the tray padding is 8px so the ring has room inside the chrome.',
        'Focus drives magnification, so a keyboard user gets the same feedback a pointer user does rather than a static list.',
        'Under prefers-reduced-motion both damping constants are bypassed: the magnification centre and the amount jump to their targets, so the dock is exactly as usable and nothing travels.'
      ],
      perf: [
        'Twelve transform writes per frame and no layout writes. The row width is fixed, so magnification never touches layout.',
        'One rect read per active frame, and only while the amount is above 0.002. With the pointer away from the dock the frame costs one comparison.',
        'will-change: transform is applied by a class only while the dock is live, so twelve compositor layers exist during a hover and not for the rest of the session.',
        'No CSS transition on the tiles. The value arriving from the damp is already smooth, and a transition would filter it a second time and add lag.',
        'No backdrop-filter on the tray. A blur that re-rasterises on every scroll frame to show a hint of near black page underneath is not a trade worth making.'
      ],
      packages: [
        { p: 'none required', w: 'The whole concept is one raised cosine, one accumulation and two exponential damps. A spring library would add a dependency to solve a problem that is nine lines of maths.' },
        { p: 'no framer-motion', w: 'useMotionValue would work, but this needs one shared pass over six items per frame, not six independent motion values each scheduling their own work.' },
        { p: 'gsap (installed)', w: 'Use gsap.ticker if the app already has one, so the dock shares a single rAF with the rest of the page. Do not use tweens here: the target changes every frame and a tween would be killed and rebuilt sixty times a second.' }
      ],
      architecture: [
        { f: 'components/navbar/Dock.tsx', r: '"use client" leaf. Owns the pointer and focus state and the per frame pass. Nothing above it re-renders.' },
        { f: 'components/navbar/DockItem.tsx', r: 'One cell. Receives a ref so the parent can write transforms without a React render.' },
        { f: 'lib/magnify.ts', r: 'Pure function: (cursorX, restCentres, rest, max, radius, amount) returns sizes and displacements. Testable without a DOM.' },
        { f: 'lib/navShell.ts', r: 'Already exists. Single source of activeSection so the dock and the page cannot disagree.' },
        { f: 'app/(nav)/sections/page.tsx', r: 'The See more route. Build it as the Compass page level view rather than a list of the same six links.' }
      ],
      state: [
        'The cursor position, the magnification amount and the current sizes are refs. They change every frame and must never touch React state.',
        'activeIndex for the label is state, because it changes a handful of times per hover and drives a class.',
        'activeSection comes from the shared nav store, not from a second observer inside the dock.',
        'Item DOM nodes are collected into a ref array at mount. Querying the DOM inside the frame loop is the classic way this pattern gets slow.'
      ],
      typography: [
        'Labels: mono 10px, letter-spacing 0.14em, uppercase. They are labels for icons, which is exactly what mono is for.',
        'There is no other type in the dock. A dock with icons and permanent labels is a tab bar, and a tab bar does not need magnification.',
        'On mobile the label becomes permanent at 10px under a 28px icon, and the magnification disappears with it.'
      ],
      color: [
        'Tray at 92% of surface-2 over the page. Slightly translucent so the page ghosts through, with no blur, so it reads as a layer without costing a filter pass.',
        'Tiles at surface with ink-2 icons; the item under the cursor goes to full ink.',
        'The signature hue appears once, as the 3px aria-current dot. Size is already carrying the cursor position, so colour is not asked to say it again.',
        'Shadow is 0 14px 34px rgba(0,0,0,0.5): a real offset and a real blur, because a zero offset halo is decoration rather than depth.'
      ],
      spacing: [
        'Rest 44px, gap 10px, tray padding 10px vertical and 32px at the ends. Resting row 314px inside a 378px tray.',
        'Tray sits 32px from the bottom edge of the container, which is far enough that it never reads as attached to it.',
        'The label sits 10px above the top edge of the tile it belongs to and rides upward as the tile grows.',
        'On mobile the bar is 64px tall, which leaves 44px of target height plus room for a 10px label.'
      ],
      relationships: [
        'Size encodes proximity to the cursor and nothing else. It is not also brightness and not also elevation.',
        'Displacement encodes the fact that the row is a physical strip: things next to something that grew have to move.',
        'The dot encodes the current section. It is the only signal that is not driven by the pointer, which is why it is the only coloured mark.',
        'The label encodes what an icon means, and it appears only for the one icon the reader is asking about.'
      ],
      acceptance: [
        'Sweeping the pointer across the tray produces a swell with no visible corner at the cursor or at the edge of its influence.', 'The icon that grows is the one directly under the cursor. The tray has 32px of padding, so a pointer coordinate taken from the border box rather than the content box would magnify its neighbour instead.', 'No icon ever crosses the edge of the tray, at any cursor position.',
        'No two icons ever overlap, at any cursor position, at any width.',
        'The row stays centred on the same axis whether or not it is magnified.',
        'Tabbing into the dock magnifies around the focused item, and the arrow keys move that focus.',
        'The focus ring is fully visible on the first and last items, not clipped by the tray.',
        'With the pointer away from the dock, a profile of a scroll shows no per frame work from this component.',
        'With reduced motion on, magnification still happens and simply arrives instantly.',
        'Below 768px the component renders as a labelled tab bar and the magnification code never runs.'
      ]
    },

    mount: function (root, ctx) {
      var host = makeHost(root, ctx);

      /* ----------------------------------------------------------- geometry */
      var REST = 44, PEAK = 68, GAP = 10;
      var N = LINKS.length;
      var RADIUS = 2.2 * (REST + GAP);
      var restTotal = N * REST + GAP * (N - 1);
      var restCentre = [];
      for (var g = 0; g < N; g++) restCentre.push(g * (REST + GAP) + REST / 2);

      /* --------------------------------------------------------------- DOM */
      var dock = SE.el('nav', 'nav-dock');
      dock.setAttribute('aria-label', 'Sections');
      dock.innerHTML =
        '<ul class="nav-dock__row">' + LINKS.map(function (l) {
          return '<li class="nav-dock__cell">' +
            '<a class="nav-dock__item" href="#' + host.uidPrefix + '-' + l.id + '" ' +
               'data-go="' + l.id + '">' +
              '<span class="nav-dock__tile">' + icon(l.icon) + '</span>' +
              '<span class="nav-dock__dot" aria-hidden="true"></span>' +
              '<span class="nav-dock__lab" aria-hidden="true">' + l.label + '</span>' +
              '<span class="nav-dock__sr">' + l.label + '</span>' +
            '</a></li>';
        }).join('') + '</ul>';

      root.appendChild(host.layer);

      var page = fauxPage(host);
      root.appendChild(page);
      attachSeeMore(page, ctx, 'Open the full navigation');

      /* Bottom anchored chrome needs its own sticky layer, not the shared top
         one. A zero height `position: sticky; bottom: 0` element placed after
         the page holds the dock against the bottom edge of the scrollport for
         exactly as long as the section is on screen, and lets go the moment the
         reader passes it. Hanging it off the top layer instead would leave it
         on screen a full viewport after the section had ended. */
      var base = SE.el('div', 'nav-dock__base');
      base.appendChild(dock);
      root.appendChild(base);

      host.reserve(24, 120);

      var row = SE.$('.nav-dock__row', dock);
      var items = SE.$$('.nav-dock__item', dock);
      var tiles = SE.$$('.nav-dock__tile', dock);
      var labs = SE.$$('.nav-dock__lab', dock);

      /* ------------------------------------------------------------- state */
      var px = restTotal / 2;      /* magnification centre, row local pixels */
      var targetX = px;
      var amt = 0;                 /* how magnified the row currently is     */
      var want = 0;                /* how magnified it is being asked to be  */
      var pointerIn = false;
      var focusIn = false;
      var named = -1;
      var live = false;
      var clientX = 0;
      var lastSize = [];
      var lastDx = [];
      for (var q = 0; q < N; q++) { lastSize.push(REST); lastDx.push(0); }

      /* getBoundingClientRect gives the border box, but every resting centre is
         measured from the content box. With 32px of tray padding that is more
         than half a slot, which would magnify the icon next to the cursor
         rather than the one under it. Read once, refresh on the breakpoint. */
      var originX = 0;
      function measureOrigin() {
        var cs = window.getComputedStyle(row);
        originX = (row.clientLeft || 0) + (parseFloat(cs.paddingLeft) || 0);
      }
      var small = window.matchMedia('(max-width: 768px)');

      function resetTransforms() {
        for (var i = 0; i < N; i++) {
          items[i].style.transform = '';
          tiles[i].style.transform = '';
          labs[i].style.transform = '';
          lastSize[i] = REST;
          lastDx[i] = 0;
        }
      }

      function setNamed(i) {
        if (i === named) return;
        if (named >= 0) items[named].classList.remove('is-named');
        named = i;
        if (named >= 0) items[named].classList.add('is-named');
      }

      function setLive(v) {
        if (v === live) return;
        live = v;
        dock.classList.toggle('is-live', v);
      }

      /* The whole magnification, once per frame, in one pass. */
      function apply() {
        var sizes = [];
        var total = 0;
        var i, u, w;

        for (i = 0; i < N; i++) {
          u = (px - restCentre[i]) / RADIUS;
          w = hann(u) * amt;
          sizes[i] = REST + (PEAK - REST) * w;
          total += sizes[i];
        }
        total += GAP * (N - 1);

        /* Re-centre so the row grows outward from its own axis rather than
           marching to the right as it swells. */
        var x = (restTotal - total) / 2;
        var best = -1, bestS = REST + 1;

        for (i = 0; i < N; i++) {
          var s = sizes[i];
          var dx = (x + s / 2) - restCentre[i];
          x += s + GAP;

          /* Size and displacement move independently: an item far outside the
             influence radius never changes size but still has to slide, because
             the row is re-centred around whatever grew. Testing only the size
             is how a dock ends up with one icon overlapping its neighbour. */
          if (Math.abs(dx - lastDx[i]) > 0.03) {
            items[i].style.transform = 'translate3d(' + dx.toFixed(2) + 'px,0,0)';
            lastDx[i] = dx;
          }
          if (Math.abs(s - lastSize[i]) > 0.03) {
            tiles[i].style.transform = 'scale(' + (s / REST).toFixed(4) + ')';
            lastSize[i] = s;
          }
          if (s > bestS) { bestS = s; best = i; }
        }

        /* The label rides the top edge of the tile it belongs to. */
        if (best >= 0) {
          labs[best].style.transform =
            'translate3d(-50%,' + (-(sizes[best] - REST)).toFixed(2) + 'px,0)';
        }
        setNamed(amt > 0.5 ? best : -1);
      }

      function frame(dt) {
        if (small.matches) return;

        if (env.reduced) {
          px = targetX;
          amt = want;
        } else {
          px = M.damp(px, targetX, 26, dt);
          amt = M.damp(amt, want, want ? 22 : 14, dt);
        }

        if (amt < 0.003 && want === 0) {
          if (live) { amt = 0; apply(); setLive(false); }
          return;                              /* fully at rest: no work */
        }
        setLive(true);

        /* One layout read per active frame, before any writes. */
        if (pointerIn) targetX = clientX - row.getBoundingClientRect().left - originX;
        apply();
      }
      SE.ticker.add(frame);

      /* ----------------------------------------------------------- pointer */
      function onEnter(e) {
        if (small.matches) return;
        pointerIn = true;
        want = 1;
        clientX = e.clientX;
        px = targetX = clientX - row.getBoundingClientRect().left - originX;
      }
      function onMove(e) { clientX = e.clientX; }
      function onLeave() {
        pointerIn = false;
        if (!focusIn) want = 0;
      }
      row.addEventListener('pointerenter', onEnter);
      row.addEventListener('pointermove', onMove);
      row.addEventListener('pointerleave', onLeave);

      /* ---------------------------------------------------------- keyboard */
      function onFocusIn(e) {
        var i = items.indexOf(e.target);
        if (i < 0) return;
        focusIn = true;
        want = 1;
        targetX = restCentre[i];
        if (env.reduced) px = targetX;
      }
      function onFocusOut(e) {
        if (dock.contains(e.relatedTarget)) return;
        focusIn = false;
        if (!pointerIn) want = 0;
      }
      function onKey(e) {
        var i = items.indexOf(document.activeElement);
        if (i < 0) return;
        var to = -1;
        if (e.key === 'ArrowRight') to = (i + 1) % N;
        else if (e.key === 'ArrowLeft') to = (i - 1 + N) % N;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = N - 1;
        if (to < 0) return;
        e.preventDefault();
        e.stopPropagation();
        items[to].focus();
      }
      dock.addEventListener('focusin', onFocusIn);
      dock.addEventListener('focusout', onFocusOut);
      dock.addEventListener('keydown', onKey);

      function onSmall() {
        measureOrigin();
        if (small.matches) { want = 0; amt = 0; setLive(false); resetTransforms(); }
      }
      if (small.addEventListener) small.addEventListener('change', onSmall);
      else small.addListener(onSmall);
      onSmall();

      /* -------------------------------------------------------- navigation */
      function onNavClick(e) {
        var a = e.target.closest ? e.target.closest('[data-go]') : null;
        if (!a) return;
        e.preventDefault();
        host.goTo(host.uidPrefix + '-' + a.getAttribute('data-go'), 24);
      }
      root.addEventListener('click', onNavClick);

      var spy = spySections(host, page.ids, function (id) {
        var short = id.replace(host.uidPrefix + '-', '');
        items.forEach(function (a) {
          if (a.getAttribute('data-go') === short) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
      });

      return {
        destroy: function () {
          SE.ticker.remove(frame);
          row.removeEventListener('pointerenter', onEnter);
          row.removeEventListener('pointermove', onMove);
          row.removeEventListener('pointerleave', onLeave);
          dock.removeEventListener('focusin', onFocusIn);
          dock.removeEventListener('focusout', onFocusOut);
          dock.removeEventListener('keydown', onKey);
          if (small.removeEventListener) small.removeEventListener('change', onSmall);
          else small.removeListener(onSmall);
          root.removeEventListener('click', onNavClick);
          spy.destroy();
          host.destroy();
          root.classList.remove('nav-c', 'nav-scroll');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     SECTION 02  -  ISLAND
     --------------------------------------------------------------------------
     A single slab of chrome that changes shape and contents according to where
     the reader is, and expands into the whole navigation when asked.

     WHY IT IS A SLAB AND NOT A PILL
     -------------------------------
     Every Dynamic Island imitation on the web reaches for border-radius: 999px.
     This application has one corner radius, 2px, and a 999px capsule dropped
     into it would read as a component borrowed from somewhere else. The idea
     that matters is not the roundness, it is that one surface carries different
     information at different moments instead of five surfaces each waiting
     their turn.

     THE FREQUENCY GATE DECIDED EVERY DURATION HERE
     ----------------------------------------------
     Four of the five states are entered by scrolling, which happens constantly,
     so the morph between them is 260ms and the content crossfade is 120ms: fast
     enough that it never becomes something you wait for. The fifth state, the
     expansion into the full navigation, is entered by a deliberate press a few
     times per session, so it gets 380ms and a real staged reveal. Same
     component, two motion budgets, chosen by how often each moment happens.

     WHY WIDTH AND HEIGHT ARE ANIMATED AT ALL
     ----------------------------------------
     Transform is the rule for anything that runs per frame, and nothing here
     does. The slab resizes on a state change, a handful of times per minute at
     most, and the alternative - scaling a background plate and counter scaling
     its contents - distorts the corner radius and the 1px border on every
     frame of the transition. The slab is absolutely positioned inside a zero
     height layer with `contain: layout`, so the resize invalidates
     nothing outside itself.
     ========================================================================== */

  SE.register({
    area: 'nav',
    variant: 'section',
    id: 'nav-section-island',
    num: 2,
    pageOf: 'nav-page-command',
    screens: 4.4,
    name: 'Island',
    kind: 'DOM / state driven morph',
    accent: '#5AB4FF',
    tagline: 'One slab that says the one thing worth saying here',
    desc: 'A floating slab that changes shape and contents with the reader position: a wordmark at the top, ' +
          'a section readout while reading, the project in view inside the work list, and an invitation at the end.',
    interaction: 'Scroll and the slab changes what it holds. Press it to expand into the full navigation; Escape closes.',
    hint: 'Scroll to change it &middot; <kbd>Esc</kbd> closes',

    /* Miniature: the slab cycling through its four scroll states while a
       progress rule fills underneath. Twenty eight operations. */
    preview: function (ctx, w, h, t, heat) {
      var phase = (t * 0.42) % 4;
      var idx = Math.floor(phase);
      var frac = phase - idx;
      var morph = M.clamp(frac / 0.22, 0, 1);
      morph = morph * morph * (3 - 2 * morph);

      var wid = [0.34, 0.56, 0.66, 0.52];
      var hei = [0.11, 0.11, 0.20, 0.14];
      var from = idx, to = (idx + 1) % 4;
      var pw = w * (wid[from] + (wid[to] - wid[from]) * morph);
      var ph = h * (hei[from] + (hei[to] - hei[from]) * morph);
      var px = (w - pw) / 2;
      var py = h * 0.12;
      var i;

      /* Page underneath, so the slab reads as chrome rather than as content. */
      for (i = 0; i < 4; i++) {
        ctx.fillStyle = 'rgba(236,236,239,' + (0.13 - i * 0.025).toFixed(3) + ')';
        ctx.fillRect(w * 0.12, h * 0.46 + i * h * 0.12, w * (0.60 - i * 0.11), 2);
      }

      ctx.fillStyle = 'rgba(16,16,21,0.97)';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = 'rgba(236,236,239,0.18)';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(px) + 0.5, Math.round(py) + 0.5, Math.round(pw), Math.round(ph));

      /* Contents resolve after the box has settled, never during. */
      var res = M.clamp((frac - 0.26) / 0.16, 0, 1);
      ctx.fillStyle = 'rgba(90,180,255,' + (0.55 + heat * 0.35).toFixed(3) + ')';
      ctx.fillRect(px + 10, py + ph * 0.42, 4, 4);
      ctx.fillStyle = 'rgba(236,236,239,' + (0.28 + res * 0.52).toFixed(3) + ')';
      ctx.fillRect(px + 20, py + ph * 0.40, pw * 0.42 * res, 3);
      if (ph > h * 0.15) {
        ctx.fillStyle = 'rgba(236,236,239,' + (0.16 * res).toFixed(3) + ')';
        ctx.fillRect(px + 20, py + ph * 0.66, pw * 0.56 * res, 2);
      }

      /* The progress rule tracks the scrollbar exactly, so it never eases. */
      ctx.fillStyle = 'rgba(90,180,255,0.85)';
      ctx.fillRect(px, py + ph - 2, pw * (phase / 4), 2);
    },

    spec: {
      subtitle: 'One slab of chrome that changes shape and contents by scroll position',
      philosophy: [
        'Chrome usually solves the "what should I say here" problem by saying everything at once: a bar with a wordmark, six links, a progress bar and a call to action, all permanently visible, all competing. This concept says one thing at a time and picks which one by where the reader is.',
        'The Dynamic Island idea is not the rounded capsule, it is that one surface serves several moments instead of several surfaces taking turns. This application has one corner radius, 2px, so the capsule is a slab and the idea survives intact.',
        'Four of the five states are entered by scrolling and therefore get 260ms and no ceremony. The fifth is entered by a press a few times a session and gets 380ms and a staged reveal. Same component, two budgets, decided by frequency rather than by taste.'
      ],
      hierarchy: [
        '1. Whatever the current state exists to say: the section name, the project in view, or the availability line.',
        '2. The 2px progress rule along the bottom edge, which is the only thing present in every state except the expansion.',
        '3. The label above it, 10px mono in ink-3, which is a caption for the thing above it and never competes.',
        '4. The disclosure control on the right, 32px, always in the same place so the way to the full navigation never moves.',
        '5. The slab itself, which carries a hairline and a near opaque ground and nothing else.'
      ],
      structure: [
        'A wrapper <div> absolutely positioned inside a zero height position:sticky layer, 20px from the top, centred with left:50% and translateX(-50%) so a width change never moves anything else.',
        'The slab is one element with contain: layout. Width and height come from a state class, not from inline styles, so the geometry lives in the stylesheet. Paint containment is deliberately not used: it clips exactly like overflow:hidden and would cut the focus ring off the disclosure sitting 4px from the edge.',
        'Five faces are stacked absolutely inside it, exactly one visible at a time via visibility, which takes the other four out of the tab order and the accessibility tree at once.',
        'The expansion face is a real <nav> with a real <ul> of six <a> elements. The other four faces are readouts.',
        'A visually hidden <p aria-live="polite"> carries the section name. The visible faces are not live regions, because a live region that changes size and position is announced unpredictably.'
      ],
      interaction: [
        'State is derived once per frame from the recorded scrollTop, not from a scroll listener doing layout work.',
        'mark: scrollTop under 24px. 200 x 40. The wordmark, and nothing else.',
        'where: reading any section other than work or contact. 312 x 40. Section name plus the progress rule.',
        'work: the work section is in view. 352 x 64, two lines, showing the project row currently crossing the middle band.',
        'close: the contact section is in view or the scroller is within 2px of the end. 316 x 48, availability line plus a real link.',
        'open: the disclosure was pressed. 456 x 116, six destinations in a 3 by 2 grid.',
        'The mark boundary has hysteresis: it is entered below 24px and left above 56px. Without it the slab flickers between two states while the reader hovers the threshold.',
        'The progress rule is transform: scaleX(scrollTop / scrollRange) with transform-origin left, written per frame with no transition, because a progress indicator that eases is a progress indicator that lies.'
      ],
      choreography: [
        { n: 'Scroll morph', d: 'width and height over 260ms cubic-bezier(0.32, 0.72, 0, 1). Under the 300ms UI ceiling because this happens tens of times per session.' },
        { n: 'Content swap', d: 'Outgoing face opacity to 0 over 90ms linear; incoming face opacity to 1 over 140ms cubic-bezier(0.23, 1, 0.32, 1) after an 80ms delay. The new content lands once the box has almost finished resizing, so nothing is read while it moves.' },
        { n: 'Expansion', d: 'width and height over 380ms cubic-bezier(0.32, 0.72, 0, 1), and the six destinations resolve with opacity 0 to 1 and translate3d(0, 8px, 0) to none over 260ms cubic-bezier(0.23, 1, 0.32, 1), delay 120ms + index * 26ms.' },
        { n: 'Collapse', d: 'Same geometry over 280ms cubic-bezier(0.77, 0, 0.175, 1), 74% of the expansion, with the destinations dropping to opacity 0 over 90ms and no stagger.' },
        { n: 'Progress', d: 'scaleX written per frame from the ticker, no transition, no easing. It is a measurement, not an animation.' },
        { n: 'Disclosure mark', d: 'The chevron rotates 180deg over 220ms cubic-bezier(0.23, 1, 0.32, 1). It states the state, it does not label the next one.' }
      ],
      scroll: [
        'The slab consumes no scroll. It is chrome sitting in a sticky layer, which holds while the section is on screen and releases when the reader moves past.',
        'The active section comes from one IntersectionObserver at -42% / -52%; the project in view comes from a second observer over the four work rows at -48% / -48%.',
        'While the expansion is open the container takes overflow:hidden and the previous value is restored on close.',
        'No window scroll listener anywhere. One passive listener on the container records scrollTop and the ticker reads it.'
      ],
      hover: [
        'Every hover rule sits inside @media (hover: hover) and (pointer: fine).',
        'The disclosure gains a brighter hairline over 140ms. The slab itself does not react to hover at all, because it is a readout, not a target.',
        'Destinations inside the expansion take a 5% ground and full ink over 140ms, with no movement.'
      ],
      click: [
        'The disclosure toggles the expansion, flips aria-expanded and moves focus to the first destination.',
        'A destination closes the expansion, then scrolls to its section.',
        'The call to action in the close state is a real link to the contact section.',
        'Clicking the page outside the slab while it is expanded closes it.'
      ],
      responsive: {
        desktop: 'Centred at the top, 20px down, morphing between 200px and 456px wide.',
        tablet: 'Same behaviour, widths reduced by roughly 12% so the slab never exceeds half the viewport.',
        mobile: 'Below 768px the slab moves to the bottom edge, spans the full width minus a 12px gutter, and stops morphing horizontally entirely: only its height changes, between 48px and 60px. The expansion becomes a full width sheet of six 52px rows rather than a 3 by 2 grid. Width morphing on a 375px screen is a 40px change nobody can see, and the bottom edge is where a thumb is.'
      },
      a11y: [
        'The expansion is role="dialog" aria-modal="true", named by its own heading, with focus trapped, Escape to close and focus returned to the disclosure.',
        'A visually hidden aria-live="polite" element announces the section name on change. The visible faces are not live regions, so a screen reader hears one short sentence rather than the whole slab being re-read.',
        'aria-current="page" marks the destination for the section in view.',
        'The disclosure is drawn at 32px, because the slab is only 40px tall in most states, but its hit area is extended to 44x44 by a pseudo element. Extending a target past its drawn box is the only honest way to keep the touch floor inside chrome this short. On mobile, where the slab is 48px, it is simply drawn at 44px.',
        'The slab takes layout containment but never paint containment and never overflow:hidden, so the focus ring on the disclosure is never clipped by the chrome around it. On mobile, where the expansion list can scroll, the ring is drawn inside the row at -3px offset instead.',
        'Under prefers-reduced-motion the morph and the crossfade both become instant: geometry snaps, faces swap with no transition, and the progress rule still tracks because it is information rather than motion.'
      ],
      perf: [
        'One transform write per frame, and only when the progress has changed by more than 0.001. Everything else happens on a state change.',
        'contain: layout on the slab means the width and height transition invalidates layout inside the slab only. It is absolutely positioned in a zero height layer, so nothing outside it can be affected in the first place.',
        'Faces stay mounted. Five small nodes cost less than building and discarding one on every scroll state change.',
        'Two IntersectionObservers, no scroll listener doing work, no ResizeObserver beyond the one the layer already owns.'
      ],
      packages: [
        { p: 'none required', w: 'A state machine over a scroll value and two CSS transitions. Any library here would be paying for a scheduler you do not need.' },
        { p: 'framer-motion (installed)', w: 'Only if the app already uses it: a layout animation would let the slab morph without hardcoded sizes. It costs a measurement pass per state change, which is the trade.' },
        { p: 'no gsap', w: 'A tween would be killed and rebuilt every time the reader crosses a threshold; a CSS transition retargets from its current value for free.' }
      ],
      architecture: [
        { f: 'components/navbar/Island.tsx', r: '"use client" leaf. Owns the state machine, the expansion and the trap. Faces are children so they are server rendered.' },
        { f: 'components/navbar/faces/*.tsx', r: 'One component per face. Pure, no client JS of their own.' },
        { f: 'lib/useScrollState.ts', r: 'Reads scrollTop from a passive listener into a ref and derives the state inside a rAF, with the 24px / 56px hysteresis baked in.' },
        { f: 'lib/navShell.ts', r: 'Already exists. activeSection lives there so the slab and the page cannot disagree.' },
        { f: 'app/(nav)/command/page.tsx', r: 'The See more route. Build it as the Palette command surface rather than a repeat of these six links.' }
      ],
      state: [
        'scrollTop and the progress value are refs. They change every frame.',
        'The derived state name is state, because it changes a few times per scroll and drives classes and content.',
        'expanded is state. The element that opened it is a ref.',
        'The project in view is state, set by an observer, not computed per frame from rects.'
      ],
      typography: [
        'Captions: mono 10px, letter-spacing 0.16em, uppercase, in ink-3. Every face has exactly one.',
        'The subject of each face is the display face at 0.8125rem, weight 500, in full ink. Small on purpose: this is chrome, and chrome that competes with the page has failed.',
        'The project note in the work face is 0.6875rem in ink-3, truncated with an ellipsis at one line rather than wrapping and changing the slab height.',
        'Nothing in the slab is above 0.875rem. It is a status readout, not a headline.'
      ],
      color: [
        'Slab ground is surface at 97%, so a hint of the page moves underneath it and it reads as a layer rather than as a hole cut in the page.',
        'The signature hue appears twice: the progress rule and the 4px state dot on the left of the reading face.',
        'Everything else is the ink ramp. The expansion adds a single 5% hover ground and nothing more.',
        'In light mode invert both grounds and take the hairline to 12% of near black. Do not invert the progress rule.'
      ],
      spacing: [
        'Slab padding 0 12px, with the disclosure inset 4px from the right edge and its 44x44 hit area overhanging that edge by 6px on each side.',
        'Face content uses a 10px gap between the caption and its subject, on one baseline in the 40px states and stacked in the 64px state.',
        'The expansion is a 3 by 2 grid with an 8px gap, which is the floor for adjacent targets.',
        '20px from the top edge on desktop, 12px from the bottom on mobile. Chrome that touches an edge reads as attached to it.'
      ],
      relationships: [
        'Size encodes how much there is to say. The slab is smallest when the reader is at the top and there is nothing to report.',
        'The progress rule encodes position in the document, and only that. It is not also a loading indicator.',
        'The state dot encodes that the readout is live, which is the one thing a static label could not tell you.',
        'The disclosure never moves between states, because the way out of a changing surface must be the thing that does not change.'
      ],
      acceptance: [
        'Scrolling from the top to the bottom produces four different slab geometries and four different contents, with no flicker at any threshold.',
        'The progress rule reaches exactly 100% when the scroller reaches its end and matches the scrollbar the whole way.',
        'Inside the work section the slab names the project row crossing the middle of the viewport.',
        'Pressing the disclosure expands the slab, focus lands on the first destination, and Escape returns focus to the disclosure.',
        'Tab from the last destination goes to the first, not to the page behind.',
        'With reduced motion on, the slab changes state instantly and the progress rule still tracks.',
        'Below 768px the slab sits at the bottom, never changes width, and the expansion is a full width list.'
      ]
    },

    mount: function (root, ctx) {
      var host = makeHost(root, ctx);
      var openId = uid('island-open');
      var headId = uid('island-head');

      /* --------------------------------------------------------------- DOM */
      var wrap = SE.el('div', 'nav-island is-mark');
      wrap.innerHTML =
        '<div class="nav-island__pill">' +
          '<div class="nav-island__stack">' +

            '<div class="nav-island__face is-on" data-s="mark">' +
              '<span class="nav-island__mark"><b>Miftaul</b><span>Islam</span></span>' +
            '</div>' +

            '<div class="nav-island__face" data-s="where">' +
              '<span class="nav-island__pulse" aria-hidden="true"></span>' +
              '<span class="nav-island__cap">Reading</span>' +
              '<strong class="nav-island__subj" data-sec>Index</strong>' +
            '</div>' +

            '<div class="nav-island__face nav-island__face--tall" data-s="work">' +
              '<span class="nav-island__cap">In view</span>' +
              '<strong class="nav-island__subj" data-proj>' + PROJECTS[0].name + '</strong>' +
              '<span class="nav-island__note" data-projnote>' + PROJECTS[0].note + '</span>' +
            '</div>' +

            '<div class="nav-island__face" data-s="close">' +
              '<span class="nav-island__cap">Q1</span>' +
              '<strong class="nav-island__subj">One slot open</strong>' +
              '<a class="nav-island__cta" href="#' + host.uidPrefix + '-contact" ' +
                 'data-go="contact">Write</a>' +
            '</div>' +

            '<nav class="nav-island__face nav-island__open" data-s="open" id="' + openId + '" ' +
                 'role="dialog" aria-modal="true" aria-labelledby="' + headId + '">' +
              '<p class="nav-island__oh" id="' + headId + '">Everything on this site</p>' +
              '<ul>' + LINKS.map(function (l, i) {
                return '<li style="--i:' + i + '">' +
                  '<a href="#' + host.uidPrefix + '-' + l.id + '" data-go="' + l.id + '">' +
                  icon(l.icon) + '<span>' + l.label + '</span></a></li>';
              }).join('') + '</ul>' +
            '</nav>' +

          '</div>' +
          '<button class="nav-island__trig" type="button" aria-expanded="false" ' +
                  'aria-controls="' + openId + '" aria-label="Open all sections">' +
            '<svg class="nav-ico nav-island__chev" viewBox="0 0 24 24" aria-hidden="true" ' +
              'focusable="false"><path d="' + ICONS.down + '"/></svg>' +
          '</button>' +
          '<span class="nav-island__prog" aria-hidden="true"></span>' +
        '</div>' +
        '<p class="nav-island__live" aria-live="polite"></p>';

      /* A scrim so a press on the page closes the expansion. The page itself
         is inert while the expansion is open, so it cannot receive the press;
         the scrim is chrome, it can, and it doubles as the dimming that puts
         the expansion in front of everything else. */
      var scrim = SE.el('div', 'nav-island__scrim');
      host.layer.appendChild(scrim);
      host.layer.appendChild(wrap);
      root.appendChild(host.layer);

      var page = fauxPage(host);
      root.appendChild(page);
      attachSeeMore(page, ctx, 'Open the command surface');
      host.reserve(148, 24);

      var pill = SE.$('.nav-island__pill', wrap);
      var trig = SE.$('.nav-island__trig', wrap);
      var prog = SE.$('.nav-island__prog', wrap);
      var live = SE.$('.nav-island__live', wrap);
      var openFace = SE.$('.nav-island__open', wrap);
      var faces = SE.$$('.nav-island__face', wrap);
      var secOut = SE.$('[data-sec]', wrap);
      var projOut = SE.$('[data-proj]', wrap);
      var noteOut = SE.$('[data-projnote]', wrap);

      /* ------------------------------------------------------------- state */
      var state = 'mark';
      var expanded = false;
      var active = 'index';
      var prevOverflow = '';
      var lastP = -1;
      var trap = makeTrap(openFace, function () { setExpanded(false); });

      function setFace(name) {
        for (var i = 0; i < faces.length; i++) {
          faces[i].classList.toggle('is-on', faces[i].getAttribute('data-s') === name);
        }
      }

      function setState(next) {
        if (next === state) return;
        wrap.classList.remove('is-' + state);
        state = next;
        wrap.classList.add('is-' + state);
        setFace(state);
      }

      function setExpanded(v) {
        if (v === expanded) return;
        expanded = v;
        root.classList.toggle('is-island-open', v);
        trig.setAttribute('aria-expanded', String(v));
        if ('inert' in HTMLElement.prototype) page.inert = v;

        if (v) {
          prevOverflow = host.scroller.style.overflow;
          host.scroller.style.overflow = 'hidden';
          setState('open');
          trap.activate(trig, SE.$('.nav-island__open a', wrap));
        } else {
          host.scroller.style.overflow = prevOverflow;
          trap.release();
          setState(derive());
        }
      }

      /* The state machine. Hysteresis on the first boundary only, because that
         is the only one a reader can hover: the others are section changes,
         which the observer has already debounced by construction. */
      function derive() {
        var y = sw.state.y;
        if (state === 'mark' ? y < 56 : y < 24) return 'mark';
        if (active === 'work') return 'work';
        if (active === 'contact' || sw.state.atEnd) return 'close';
        return 'where';
      }

      var sw = watchScroll(host.scroller);

      function frame() {
        if (!expanded) setState(derive());
        var p = M.clamp(sw.state.y / sw.state.max, 0, 1);
        if (Math.abs(p - lastP) > 0.001) {
          prog.style.transform = 'scaleX(' + p.toFixed(4) + ')';
          lastP = p;
        }
      }
      SE.ticker.add(frame);

      /* ---------------------------------------------------------- controls */
      trig.addEventListener('click', function () { setExpanded(!expanded); });

      scrim.addEventListener('click', function () { setExpanded(false); });

      function onNavClick(e) {
        var a = e.target.closest ? e.target.closest('[data-go]') : null;
        if (!a) return;
        e.preventDefault();
        var id = a.getAttribute('data-go');
        if (expanded) setExpanded(false);
        host.goTo(host.uidPrefix + '-' + id, 76);
      }
      root.addEventListener('click', onNavClick);

      /* ---------------------------------------------------- active section */
      var marks = SE.$$('.nav-island__open [data-go]', wrap);
      var spy = spySections(host, page.ids, function (id) {
        var short = id.replace(host.uidPrefix + '-', '');
        active = short;
        marks.forEach(function (a) {
          if (a.getAttribute('data-go') === short) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
        for (var i = 0; i < LINKS.length; i++) {
          if (LINKS[i].id !== short) continue;
          secOut.textContent = LINKS[i].label;
          live.textContent = LINKS[i].label;
        }
      });

      /* The project crossing the middle band, for the tall state. */
      var rows = SE.$$('#' + host.uidPrefix + '-work .nav-page__rows li', root);
      var rowIO = null;
      if (rows.length) {
        rowIO = new IntersectionObserver(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (!entries[i].isIntersecting) continue;
            var k = rows.indexOf(entries[i].target);
            if (k < 0 || !PROJECTS[k]) continue;
            projOut.textContent = PROJECTS[k].name;
            noteOut.textContent = PROJECTS[k].note;
          }
        }, { root: host.scroller, rootMargin: '-48% 0px -48% 0px', threshold: 0 });
        rows.forEach(function (li) { rowIO.observe(li); });
      }

      return {
        destroy: function () {
          SE.ticker.remove(frame);
          root.removeEventListener('click', onNavClick);
          if (rowIO) rowIO.disconnect();
          spy.destroy();
          sw.destroy();
          trap.destroy();
          host.scroller.style.overflow = prevOverflow;
          host.destroy();
          root.classList.remove('nav-c', 'nav-scroll', 'is-island-open');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     SECTION 03  -  TIDE
     --------------------------------------------------------------------------
     A bar that gets out of the way going down and comes back going up, with the
     one idea that makes the pattern honest: IT NEVER FULLY LEAVES.

     The retract distance is the bar height minus three pixels, not one hundred
     percent. What stays behind is the bar's own bottom edge: a hairline track
     with the reading progress filled along it. So the reader never loses their
     position, the returning bar always arrives from somewhere visible, and the
     progress indicator is not a second component bolted on, it is the last
     three pixels of the first one.

     THE TWO THRESHOLDS ARE NOT THE SAME NUMBER
     ------------------------------------------
     It takes 56 accumulated pixels of downward scroll to hide and 28 of upward
     scroll to bring it back. Asymmetric on purpose: asking for the navigation
     back is a request the interface should grant immediately, while hiding it
     is something the interface decided on the reader's behalf and should
     therefore be slower to commit to. A single symmetric threshold is what
     makes these bars flicker.
     ========================================================================== */

  SE.register({
    area: 'nav',
    variant: 'section',
    id: 'nav-section-tide',
    num: 3,
    pageOf: 'nav-page-megamenu',
    screens: 4.4,
    name: 'Tide',
    kind: 'DOM / directional retract',
    accent: '#B37CFF',
    tagline: 'It goes out, but it leaves the waterline',
    desc: 'A bar that retracts on the way down and returns on the way up, stopping three pixels short so ' +
          'its own bottom edge stays on screen as the reading progress track.',
    interaction: 'Scroll down and it retracts; scroll up 28px and it is back. Focus anything inside it and it stays.',
    hint: 'Scroll down to retract &middot; up to return',

    /* Miniature: a page moving under a bar that retracts and returns, with the
       progress track always on screen. Thirty operations. */
    preview: function (ctx, w, h, t, heat) {
      var cycle = (t * 0.34) % 1;
      /* Down for most of the cycle, then a short scroll back up. */
      var down = cycle < 0.62;
      var hide = down ? M.clamp((cycle - 0.16) / 0.18, 0, 1) : M.clamp(1 - (cycle - 0.62) / 0.10, 0, 1);
      hide = hide * hide * (3 - 2 * hide);

      var barH = h * 0.16;
      var peek = 3;
      var barY = -(barH - peek) * hide;
      var scroll = (cycle * h * 2.2) % (h * 0.30);
      var i;

      /* The page, drifting under the chrome. */
      for (i = 0; i < 6; i++) {
        var ly = h * 0.28 + i * h * 0.145 - scroll;
        if (ly < barH || ly > h) continue;
        ctx.fillStyle = 'rgba(236,236,239,' + (0.15 - (i % 3) * 0.035).toFixed(3) + ')';
        ctx.fillRect(w * 0.10, ly, w * (0.62 - (i % 3) * 0.15), 2);
      }

      /* The bar. */
      ctx.fillStyle = '#0b0b0f';
      ctx.fillRect(0, barY, w, barH);
      ctx.fillStyle = 'rgba(236,236,239,' + (0.55 * (1 - hide) + 0.10).toFixed(3) + ')';
      ctx.fillRect(w * 0.08, barY + barH * 0.42, w * 0.14, 2);
      for (i = 0; i < 3; i++) {
        ctx.fillStyle = 'rgba(236,236,239,' + (0.26 * (1 - hide) + 0.04).toFixed(3) + ')';
        ctx.fillRect(w * 0.52 + i * w * 0.13, barY + barH * 0.44, w * 0.09, 2);
      }

      /* The waterline: always on screen, wherever the bar is. */
      ctx.fillStyle = 'rgba(236,236,239,0.12)';
      ctx.fillRect(0, barY + barH - 2, w, 2);
      ctx.fillStyle = 'rgba(179,124,255,' + (0.75 + heat * 0.25).toFixed(3) + ')';
      ctx.fillRect(0, barY + barH - 2, w * (0.12 + cycle * 0.84), 2);
    },

    spec: {
      subtitle: 'A bar that retracts on the way down and leaves its progress track behind',
      philosophy: [
        'Hide on scroll is usually implemented as translateY(-100%), and that is the mistake. A bar that leaves entirely takes the reader position with it, and when it comes back it arrives from nowhere. Retracting by the bar height minus three pixels leaves its own bottom edge on screen as the progress track, so nothing is ever lost and the return has a source.',
        'The two thresholds are deliberately different. 56px of accumulated downward scroll to hide, 28px of upward scroll to return. Hiding is a decision the interface made for the reader and should be slow to commit to; showing is a request the reader made and should be granted at once.',
        'Direction is measured from accumulated movement, not from the sign of the last frame. A trackpad produces a stream of tiny deltas with both signs in it, and reacting to the sign of any single one is exactly how these bars end up flickering.'
      ],
      hierarchy: [
        '1. The six destinations, mono 11px, which is the only reason the bar exists.',
        '2. The wordmark, which anchors the left gutter and doubles as the link home.',
        '3. The 2px progress fill on the waterline, the one coloured thing in the concept.',
        '4. The waterline track itself at 8% ink, which is present whether or not the bar is.',
        '5. The bar ground, which appears only once content is underneath it.'
      ],
      structure: [
        'A <header> absolutely positioned inside a zero height position:sticky layer, full width, 64px tall.',
        'Inside it a <nav aria-label="Primary"> with a <ul> of six <a>, each padded to a 44px hit height with 8px between.',
        'The progress element is a child of the bar, positioned at its bottom edge: a 1px track at 8% ink with a 2px fill scaled along it. It belongs to the bar, which is what makes the retract continuous rather than a swap between two components.',
        'The retract is a single transform on the header. Nothing inside it moves relative to it, so there is one composited layer and no per child work.'
      ],
      interaction: [
        'scrollTop is recorded by one passive listener that does nothing else. All decisions happen in the shared ticker.',
        'A signed accumulator adds the frame delta and resets to zero whenever the sign of the delta differs from the sign of the accumulator.',
        'Hide when the accumulator passes +56px, and only while scrollTop is above 96px.',
        'Show when the accumulator passes -28px.',
        'Always show within the first 96px, because the bar belongs at the top of a document.',
        'Always show within 64px of the end, because there is nothing left to read and the controls should come back.',
        'Always show while focus is anywhere inside the bar, so a keyboard user is never chasing a control that is retracting. WCAG 2.2 focus-not-obscured, enforced rather than hoped for.',
        'The accumulator resets on every state change, so it takes a fresh 56px to hide again immediately after a return.'
      ],
      choreography: [
        { n: 'Retract', d: 'transform: translate3d(0, calc(-1 * (64px - 3px)), 0) over 220ms cubic-bezier(0.77, 0, 0.175, 1). An in-out curve because the bar is moving on screen rather than entering or leaving it.' },
        { n: 'Return', d: 'transform to none over 180ms cubic-bezier(0.23, 1, 0.32, 1). 82% of the retract and a stronger ease-out, because arriving should feel quicker than leaving.' },
        { n: 'Progress', d: 'transform: scaleX(scrollTop / scrollRange), transform-origin left, written per frame with no transition at all. A progress indicator with an ease is an indicator that is wrong for 200ms at a time.' },
        { n: 'Scroll edge', d: 'background-color and border-color over 220ms once scrollTop passes 12px. The bar earns its ground only when there is content underneath it.' },
        { n: 'Link hover', d: 'colour only, 140ms ease. Nothing moves. This is the most frequently hovered thing on any site.' }
      ],
      scroll: [
        'The bar consumes no scroll and never blocks it. It is chrome in a sticky layer, so it holds while the section is on screen and releases when the reader passes it.',
        'No window scroll listener. One passive listener on the container records a number; the ticker reads it.',
        'scroll-padding-top of 76px is set on the container so a focused control is never scrolled under the bar.',
        'The active destination comes from one IntersectionObserver at -42% / -52%.'
      ],
      hover: [
        'Every hover rule sits inside @media (hover: hover) and (pointer: fine).',
        'Destination ink steps from the dim ramp to full ink over 140ms. That is the entire treatment.',
        'The bar does not react to hover as a whole, and hovering it does not bring it back. Hover is not intent, and a bar that reappears because the pointer drifted is a bar that reappears constantly.'
      ],
      click: [
        'A destination scrolls the container to its section.',
        'The wordmark returns to the top of the document.',
        'Nothing in the bar opens anything. The See more control in the page opens the mega menu, which is where a disclosure belongs.'
      ],
      responsive: {
        desktop: 'Top bar at 64px, wordmark left, six destinations right, waterline along the bottom edge.',
        tablet: 'Same, with the destination padding reduced from 12px to 10px so six still fit on one line at 768px.',
        mobile: 'Below 768px the bar moves to the bottom edge and retracts downward instead of upward, because that is where a thumb is and because a top bar that hides on a 375px screen takes the only navigation with it. The destinations become a horizontal scroll-snap strip so all six stay reachable without a menu, and the waterline moves to the top edge of the bar so the retracted strip sits at the bottom of the screen. A different composition, not a narrower one.'
      },
      a11y: [
        'A real <header> and a real <nav aria-label="Primary"> with real <a>. aria-current="page" on the destination for the section in view.',
        'Focus inside the bar pins it visible for as long as focus stays there, which is the only correct answer to hide-on-scroll and keyboard navigation.',
        'Every destination is 44px tall with 8px between, and the wordmark is padded to the same height rather than sized to its text.',
        'The bar has no overflow:hidden anywhere, so a focus ring at 3px offset is never clipped by the chrome.',
        'The progress element is aria-hidden. It is a picture of the scrollbar, and a screen reader already has the scrollbar.',
        'Under prefers-reduced-motion the bar never translates at all: it simply stays. The progress fill keeps tracking, because it is information rather than motion.'
      ],
      perf: [
        'One transform write per frame for the progress fill, and only when it has changed by more than 0.001. The retract is a class toggle a handful of times per scroll.',
        'The whole bar is one composited layer during the retract, because nothing inside it moves relative to it.',
        'No layout reads in the scroll path. scrollTop, scrollHeight and clientHeight are read once per scroll event by the shared watcher, never inside the frame.',
        'One IntersectionObserver, one passive scroll listener, one ticker subscription.'
      ],
      packages: [
        { p: 'none required', w: 'An accumulator, two thresholds and one CSS transition. Every hide-on-scroll library is this plus a scroll listener you did not want.' },
        { p: 'no framer-motion', w: 'useScroll would re-render a component on a value that only ever drives one class. The class is the state; the transform is CSS.' },
        { p: 'lenis (installed)', w: 'Works unchanged with smooth scrolling on, because the accumulator reads scrollTop rather than wheel deltas. If you drive this from wheel events instead, Lenis will break it.' }
      ],
      architecture: [
        { f: 'components/navbar/TideBar.tsx', r: '"use client" leaf. Owns the accumulator and the hidden flag. Links are children so they stay server rendered.' },
        { f: 'lib/useDirectionalHide.ts', r: 'The accumulator, both thresholds, the top and bottom clamps and the focus pin. Returns one boolean.' },
        { f: 'lib/useScrollProgress.ts', r: 'Writes scaleX to a ref inside a rAF. Never sets state.' },
        { f: 'lib/navShell.ts', r: 'Already exists. activeSection lives there.' },
        { f: 'app/(nav)/menu/page.tsx', r: 'The See more route: the Atrium mega menu, not a repeat of these six links.' }
      ],
      state: [
        'The accumulator, the last scrollTop and the progress value are refs. They change every frame.',
        'hidden is state, because it drives a class and changes a handful of times per scroll.',
        'focusWithin is state, set from onFocus and onBlur on the header with a relatedTarget check.',
        'Do not put scrollTop in state. That is a re-render per frame for a value that only ever becomes a transform.'
      ],
      typography: [
        'Destinations and wordmark: mono 11px, letter-spacing 0.16em, uppercase. These are labels, which is what mono is for.',
        'Nothing in the bar is prose, so nothing in the bar uses the display face at a reading size.',
        'The wordmark carries weight 600 on the given name and the dim ramp on the family name, which is the entire visual identity of the bar.'
      ],
      color: [
        'Bar ground is void-2, one step up from the page, and appears only once scrollTop passes 12px.',
        'The waterline track is 8% ink and the fill is the signature hue. That is the only colour in the concept.',
        'aria-current is marked by full ink on the label and nothing else. No underline, no dot, no weight change on top of it.',
        'In light mode invert the ground and take the track to 12% of near black. Do not invert the fill.'
      ],
      spacing: [
        'Bar 64px, horizontal padding matching the page gutter so the wordmark sits on the content column.',
        'Destinations at 12px horizontal padding with an 8px gap, which puts adjacent targets exactly on the floor.',
        'The retract distance is 61px, which is the bar height minus the three pixels of waterline that stay.',
        'On mobile the bar is 60px and the strip scrolls horizontally with 12px of scroll padding at each end so the first and last destination are never half cut.'
      ],
      relationships: [
        'Direction of travel encodes intent: down means reading, up means looking for something.',
        'The waterline encodes position in the document and is the only thing that is never hidden, because position is the one thing the reader must not lose.',
        'The bar ground encodes whether there is content behind the bar. At the top of the document there is not, so there is no ground.',
        'Focus encodes intent as strongly as scroll direction does, which is why it pins the bar.'
      ],
      acceptance: [
        'Scrolling down past 96px retracts the bar and leaves a visible progress track at the top of the viewport.',
        'Scrolling up by 28px brings it back, from any position.',
        'A trackpad flick with mixed frame deltas never produces a flicker.',
        'Tabbing to a destination while the bar is retracted brings it back before the focus ring is drawn.',
        'The progress fill reaches exactly 100% at the end of the scroller and matches the scrollbar throughout.',
        'With reduced motion on, the bar never moves and everything else behaves identically.',
        'Below 768px the bar sits at the bottom, retracts downward, and all six destinations are reachable by swiping the strip.'
      ]
    },

    mount: function (root, ctx) {
      var host = makeHost(root, ctx);

      var bar = SE.el('header', 'nav-tide__bar');
      bar.innerHTML =
        '<a class="nav-tide__mark" href="#' + host.uidPrefix + '-index" data-go="index">' +
          '<b>Miftaul</b><span>Islam</span></a>' +
        '<nav class="nav-tide__nav" aria-label="Primary"><ul>' +
          LINKS.map(function (l) {
            return '<li><a href="#' + host.uidPrefix + '-' + l.id + '" data-go="' + l.id + '">' +
                   l.label + '</a></li>';
          }).join('') +
        '</ul></nav>' +
        '<span class="nav-tide__line" aria-hidden="true">' +
          '<i class="nav-tide__fill"></i></span>';

      host.layer.appendChild(bar);
      root.appendChild(host.layer);

      var page = fauxPage(host);
      root.appendChild(page);
      attachSeeMore(page, ctx, 'Open the mega menu');
      host.reserve(76, 24);

      var fill = SE.$('.nav-tide__fill', bar);

      /* ------------------------------------------------------------- state */
      var sw = watchScroll(host.scroller);
      var lastY = sw.state.y;
      var acc = 0;
      var hidden = false;
      var pinned = false;
      var lastP = -1;

      var HIDE_AT = 56;    /* accumulated downward pixels before it retracts */
      var SHOW_AT = -28;   /* accumulated upward pixels before it returns    */
      var TOP_ZONE = 96;   /* never retracted inside this band               */
      var END_ZONE = 64;   /* nor within this much of the end                */

      function frame() {
        var y = sw.state.y;
        var d = y - lastY;
        lastY = y;

        if (d !== 0) {
          /* Reset on a direction change rather than reacting to the sign of a
             single frame. A trackpad emits both signs inside one gesture. */
          if ((d > 0) !== (acc > 0)) acc = 0;
          acc += d;
        }

        var want = hidden;
        if (env.reduced || pinned || y <= TOP_ZONE || y >= sw.state.max - END_ZONE) want = false;
        else if (acc > HIDE_AT) want = true;
        else if (acc < SHOW_AT) want = false;

        if (want !== hidden) {
          hidden = want;
          acc = 0;
          bar.classList.toggle('is-hidden', hidden);
        }

        bar.classList.toggle('is-edged', y > 12);

        var p = M.clamp(y / sw.state.max, 0, 1);
        if (Math.abs(p - lastP) > 0.001) {
          fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
          lastP = p;
        }
      }
      SE.ticker.add(frame);

      /* Focus pins the bar. A control that retracts out from under the focus
         ring is a control the keyboard cannot use. */
      function onFocusIn() { pinned = true; }
      function onFocusOut(e) {
        if (bar.contains(e.relatedTarget)) return;
        pinned = false;
      }
      bar.addEventListener('focusin', onFocusIn);
      bar.addEventListener('focusout', onFocusOut);

      function onNavClick(e) {
        var a = e.target.closest ? e.target.closest('[data-go]') : null;
        if (!a) return;
        e.preventDefault();
        host.goTo(host.uidPrefix + '-' + a.getAttribute('data-go'), 76);
      }
      root.addEventListener('click', onNavClick);

      var marks = SE.$$('.nav-tide__nav [data-go]', bar);
      var spy = spySections(host, page.ids, function (id) {
        var short = id.replace(host.uidPrefix + '-', '');
        marks.forEach(function (a) {
          if (a.getAttribute('data-go') === short) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
      });

      return {
        destroy: function () {
          SE.ticker.remove(frame);
          bar.removeEventListener('focusin', onFocusIn);
          bar.removeEventListener('focusout', onFocusOut);
          root.removeEventListener('click', onNavClick);
          spy.destroy();
          sw.destroy();
          host.destroy();
          root.classList.remove('nav-c', 'nav-scroll');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     SECTION 04  -  SPINE
     --------------------------------------------------------------------------
     A vertical rail on the right edge: six ticks, one thread, and a label that
     appears only for the tick you are asking about.

     WHY THE RIGHT EDGE
     ------------------
     Prose starts at the left gutter, and a rail on the left sits in the path of
     every line the reader begins. On the right it lands where the eye already
     is at the end of a line, and it shares an edge with the scrollbar, which is
     the one piece of chrome that already means "position in the document".

     WHY THE THREAD IS NOT A PERCENTAGE BAR
     --------------------------------------
     It is a 1px line that runs the full height of the rail whether or not
     anything has been read, and the filled part of it is the part behind you.
     A percentage bar says "you are 34% done", which nobody asked. A thread
     says "these are the six things, and this is how far down them you are",
     which is the only question a rail exists to answer.
     ========================================================================== */

  SE.register({
    area: 'nav',
    variant: 'section',
    id: 'nav-section-spine',
    num: 4,
    pageOf: 'nav-page-shutter',
    screens: 4.4,
    name: 'Spine',
    kind: 'DOM / edge rail',
    accent: '#E8B04B',
    tagline: 'Six ticks and a thread, on the edge the eye already ends at',
    desc: 'A vertical rail of six section ticks joined by a thread whose filled part is the distance already ' +
          'read. Labels appear only for the tick under the pointer or the focus ring.',
    interaction: 'Scroll and the active tick extends. Hover or focus a tick to read its label; press it to go there.',
    hint: 'Scroll &middot; the rail tracks the section',

    /* Miniature: the rail on the right with a thread filling as the page moves
       under it, one tick extended. Twenty six operations. */
    preview: function (ctx, w, h, t, heat) {
      var n = 6;
      var railX = w * 0.86;
      var top = h * 0.18;
      var span = h * 0.64;
      var gap = span / (n - 1);
      var cycle = (t * 0.22) % 1;
      var active = Math.min(n - 1, Math.floor(cycle * n));
      var i;

      /* Page copy on the left, drifting, so the rail has something to track. */
      var drift = (t * 16) % (h * 0.24);
      for (i = 0; i < 7; i++) {
        var ly = h * 0.14 + i * h * 0.12 - drift;
        if (ly < 0 || ly > h) continue;
        ctx.fillStyle = 'rgba(236,236,239,' + (0.14 - (i % 3) * 0.035).toFixed(3) + ')';
        ctx.fillRect(w * 0.08, ly, w * (0.54 - (i % 3) * 0.13), 2);
      }

      /* The thread: full height always, filled behind the reader. */
      ctx.fillStyle = 'rgba(236,236,239,0.12)';
      ctx.fillRect(Math.round(railX) + 0.5, top, 1, span);
      ctx.fillStyle = 'rgba(232,176,75,' + (0.60 + heat * 0.30).toFixed(3) + ')';
      ctx.fillRect(Math.round(railX) + 0.5, top, 1, span * cycle);

      for (i = 0; i < n; i++) {
        var ty = top + gap * i;
        var on = i === active;
        var len = on ? w * 0.10 : w * 0.045;
        ctx.fillStyle = on
          ? 'rgba(232,176,75,' + (0.90 + heat * 0.10).toFixed(3) + ')'
          : 'rgba(236,236,239,0.26)';
        ctx.fillRect(railX - len, ty - 1, len, 2);
      }

      /* The label, only for the tick being attended to. */
      ctx.fillStyle = 'rgba(236,236,239,0.55)';
      ctx.fillRect(railX - w * 0.30, top + gap * active - 2, w * 0.16, 3);
    },

    spec: {
      subtitle: 'A vertical rail of six ticks joined by a thread that fills behind the reader',
      philosophy: [
        'A rail belongs on the right. Prose starts at the left gutter, so a left rail sits in the path of every line the reader begins; on the right it lands where the eye already is at the end of a line, next to the scrollbar, which already means position in the document.',
        'The thread is not a percentage bar. It runs the full height of the rail whether or not anything has been read, and the filled part is the part behind you. A percentage says how done you are; a thread says what the six things are and where among them you stand.',
        'Labels appear one at a time. Six labels showing at once is a menu, and a rail exists precisely so a menu does not have to be on screen.'
      ],
      hierarchy: [
        '1. The active tick, extended from 20px to 40px and in full ink.',
        '2. The label for whichever tick is being hovered or focused, 10px mono, appearing to the left of the rail.',
        '3. The filled part of the thread, in the signature hue, which is the reading distance covered.',
        '4. The five inactive ticks, 20px at 26% ink, present and clearly not the subject.',
        '5. The thread track at 8% ink, which is structure rather than information.'
      ],
      structure: [
        'A <nav aria-label="Sections"> absolutely positioned in a zero height position:sticky layer, vertically centred with top: 50% of the recorded viewport height and translateY(-50%).',
        'One <ul> as a 20px gap column of six 44x44 <li>. The tick itself is a 2px rule inside the target, not the target: a 2px tall link would be unhittable.',
        'The thread is two absolutely positioned 1px elements behind the list: a full height track and a fill scaled along it.',
        'Labels are absolutely positioned to the left of each tick, right aligned so they grow away from the rail rather than into it.',
        'The rail has no overflow:hidden. A label that slid out of a masked rail would take the focus ring with it, which is exactly the bug that masking a rail introduces.'
      ],
      interaction: [
        'Section tracking is one IntersectionObserver with rootMargin -42% 0px -52% 0px, so the section crossing a band slightly above centre is the active one.',
        'The tick extends from 20px to 40px, which is width, so it is done with transform: scaleX from a 40px rule with transform-origin: right. Scaling from the right means the tick grows away from the rail edge.',
        'The thread fill is transform: scaleY(scrollTop / scrollRange) with transform-origin: top, written per frame and never transitioned.',
        'Hover or focus on a tick reveals its label. Both use the same class, so the keyboard and the pointer get the same affordance rather than the keyboard getting a worse one.',
        'Pressing a tick scrolls the container to that section with behavior smooth, or auto under reduced motion.',
        'Below 768px the rail becomes a horizontal strip and the active chip is centred in it by setting scrollLeft directly, rather than by scrollIntoView, which would also scroll the page.'
      ],
      choreography: [
        { n: 'Tick extend', d: 'transform: scaleX(0.5) to scaleX(1) on a 40px rule, transform-origin right, 200ms cubic-bezier(0.23, 1, 0.32, 1). Width is never animated; the rule is always 40px and the transform decides how much of it is showing.' },
        { n: 'Tick ink', d: 'background-color over 160ms ease, running alongside the extend so the two land together.' },
        { n: 'Label', d: 'opacity 0 to 1 and translate3d(6px, 0, 0) to none over 160ms cubic-bezier(0.23, 1, 0.32, 1). It enters from the rail because that is what it belongs to. 6px, not 20px: this is a frequent interaction and a long slide would be an irritation by the tenth tick.' },
        { n: 'Thread fill', d: 'transform: scaleY, per frame, no transition. It is a measurement.' },
        { n: 'Press', d: 'The tick rule takes scaleX(1) immediately on :active rather than waiting for the section to arrive, so the press is acknowledged before the scroll begins.' }
      ],
      scroll: [
        'The rail consumes no scroll and never blocks it. It is chrome in a sticky layer that holds while the section is on screen and releases when the reader passes it.',
        'One passive scroll listener records scrollTop; the ticker reads it. No window scroll listener anywhere.',
        'Smooth scrolling to a section is the container scrollTo, so it works identically inside a nested scroller.',
        'scroll-padding of 24px top and bottom is set on the container, since the rail is at the side and obscures nothing vertically.'
      ],
      hover: [
        'Every hover rule sits inside @media (hover: hover) and (pointer: fine).',
        'Hovering a tick extends it to 32px, between the resting 20px and the active 40px, so hovering never impersonates the current section.',
        'The label appears on hover and on focus with the same rule, so there is one behaviour rather than a pointer behaviour and a keyboard consolation.',
        'Hovering the rail as a whole does nothing. The rail is not a target.'
      ],
      click: [
        'A tick scrolls the container to its section. It does not open anything.',
        'The active tick is still clickable and scrolls to the top of the section it marks, which is what a reader halfway through a section expects.',
        'The See more control in the page opens the page level view, because a control in the rail would change the thing being evaluated.'
      ],
      responsive: {
        desktop: 'Vertical rail on the right, centred, clamp(1rem, 2.4vw, 2rem) from the edge, 44px targets on a 20px pitch.',
        tablet: 'Same rail, moved to 1rem from the edge and the labels reduced to 9px so they never cross the measure of the prose.',
        mobile: 'Below 768px a vertical rail is unreachable by a thumb and steals width from a 375px measure, so it becomes a horizontal scroll-snap strip at the bottom edge: six 44px chips with their labels always visible, the active chip centred by setting scrollLeft, and the thread rotated to a horizontal fill along the top edge of the strip. A different pattern, not a rotated one.'
      },
      a11y: [
        'A real <nav aria-label="Sections"> with real <a>. aria-current="page" on the tick for the section in view.',
        'Each target is 44x44 with a 20px pitch, so adjacent targets are 20px apart, above the 8px floor. The visible tick is a 2px rule inside that target, never the target itself.',
        'Every tick carries its label as real text, positioned rather than hidden, so it is in the accessibility tree at all times regardless of whether it is visible.',
        'Hover and focus share one rule, so the label is available to the keyboard on exactly the same terms as to the pointer.',
        'No ancestor of a tick has overflow:hidden, so the focus ring at 3px offset is never clipped by the rail.',
        'Under prefers-reduced-motion the tick jumps between its two lengths with no transition and the label appears with opacity only and no travel. The thread keeps tracking, because it is information.'
      ],
      perf: [
        'One transform write per frame for the thread fill, and only when the progress has changed by more than 0.001.',
        'Tick state is a class toggled by an observer, so the six ticks cost nothing between section changes.',
        'Labels are always in the DOM and always laid out. Six 10px strings are cheaper to keep than to build on hover.',
        'The rail is 40px wide and never reflows. transform only, no width animation anywhere.'
      ],
      packages: [
        { p: 'none required', w: 'One IntersectionObserver, one scroll value and CSS. A scrollspy library is this plus assumptions about your DOM.' },
        { p: 'no framer-motion', w: 'Nothing here needs a spring, a layout animation or an exit animation. Six class toggles and one transform.' },
        { p: 'lenis (installed)', w: 'Compatible. Use lenis.scrollTo for the tick press if the app already has it, so the programmatic scroll matches the momentum of every other scroll on the site.' }
      ],
      architecture: [
        { f: 'components/navbar/Spine.tsx', r: '"use client" leaf. Owns the observer and the progress write. Ticks are children.' },
        { f: 'components/navbar/SpineTick.tsx', r: 'One target. Pure, receives active and label as props.' },
        { f: 'lib/useSectionSpy.ts', r: 'The IntersectionObserver with the -42% / -52% band, returning the active id. Shared with every other chrome component.' },
        { f: 'lib/navShell.ts', r: 'Already exists. activeSection lives there so the rail and the bar cannot disagree.' },
        { f: 'app/(nav)/sections/page.tsx', r: 'The See more route: the Shutter full screen view, which is the same six destinations at full size.' }
      ],
      state: [
        'activeId is state. It changes six times per full read and drives classes.',
        'The progress value is a ref written straight to a transform. It must never be state.',
        'The hovered tick is not state at all. It is a CSS :hover rule, because nothing outside the tick needs to know.',
        'On mobile the centring scrollLeft is computed in an effect on activeId, not tracked as state.'
      ],
      typography: [
        'Labels: mono 10px, letter-spacing 0.14em, uppercase, right aligned. Right aligned because they grow leftward, away from the rail, and a ragged right edge next to a rail reads as a mistake.',
        'There is no other type in the rail. A rail with a heading is a sidebar.',
        'On mobile the chip labels stay 10px mono but lose the uppercase, because six uppercase words in a 375px strip is more tracking than the width can carry.'
      ],
      color: [
        'Ticks at 26% ink resting, full ink active. That contrast difference is the whole state model.',
        'The signature hue appears twice: the thread fill and the active tick. Both are the same fact, seen at two scales.',
        'Thread track at 8% ink. It is structure, and structure is never as bright as information.',
        'In light mode invert the ink ramp and take the track to 12% of near black. Do not invert the fill.'
      ],
      spacing: [
        'Targets 44x44 on a 20px pitch, so the rail is 384px tall in total and stays centred in any viewport above 560px.',
        'Rail inset clamp(1rem, 2.4vw, 2rem) from the right edge, which keeps it clear of a 65ch measure at every width.',
        'Labels sit 12px to the left of the rail edge, which is far enough that the tick and the word never read as one shape.',
        'On mobile the strip is 56px tall with 12px of scroll padding at each end so the first and last chip are never half cut.'
      ],
      relationships: [
        'Tick length encodes state: 20px resting, 32px hovered, 40px active. One dimension, three values, no second signal.',
        'Thread fill encodes distance covered, which is a different question from which section you are in, which is why it is a different mark.',
        'Vertical position encodes document order, which is the only reason a vertical rail is more useful than six chips.',
        'The label encodes what a tick means and appears only when the reader asks, because the rail is designed to be ignorable.'
      ],
      acceptance: [
        'Scrolling through all six sections extends exactly one tick at a time, with no gap where none is active.',
        'The thread fill reaches exactly 100% at the end of the scroller and matches the scrollbar throughout.',
        'Hovering and focusing a tick produce identical results.',
        'The focus ring on the first and last tick is fully visible, not clipped by the rail.',
        'The rail never overlaps the prose measure at 1024px, 1280px or 1440px.',
        'With reduced motion on, ticks change length instantly and labels appear without travelling.',
        'Below 768px the rail is a horizontal strip at the bottom, and the active chip is centred in it without the page scrolling.'
      ]
    },

    mount: function (root, ctx) {
      var host = makeHost(root, ctx);

      var rail = SE.el('nav', 'nav-spine');
      rail.setAttribute('aria-label', 'Sections');
      rail.innerHTML =
        '<span class="nav-spine__thread" aria-hidden="true">' +
          '<i class="nav-spine__fill"></i></span>' +
        '<ul class="nav-spine__list">' + LINKS.map(function (l) {
          return '<li><a class="nav-spine__tick" href="#' + host.uidPrefix + '-' + l.id + '" ' +
                 'data-go="' + l.id + '">' +
                 '<span class="nav-spine__lab">' + l.label + '</span>' +
                 '<span class="nav-spine__rule" aria-hidden="true"></span>' +
                 '</a></li>';
        }).join('') + '</ul>';

      host.layer.appendChild(rail);
      root.appendChild(host.layer);

      var page = fauxPage(host);
      root.appendChild(page);
      attachSeeMore(page, ctx, 'Open the full navigation');
      host.reserve(24, 96);

      var fill = SE.$('.nav-spine__fill', rail);
      var list = SE.$('.nav-spine__list', rail);
      var ticks = SE.$$('.nav-spine__tick', rail);
      var small = window.matchMedia('(max-width: 768px)');

      /* ------------------------------------------------------------ frame */
      var sw = watchScroll(host.scroller);
      var lastP = -1;
      var lastAxis = '';

      function frame() {
        var p = M.clamp(sw.state.y / sw.state.max, 0, 1);
        var axis = small.matches ? 'X' : 'Y';
        if (Math.abs(p - lastP) > 0.001 || axis !== lastAxis) {
          fill.style.transform = 'scale' + axis + '(' + p.toFixed(4) + ')';
          lastP = p;
          lastAxis = axis;
        }
      }
      SE.ticker.add(frame);

      /* --------------------------------------------------- active section */
      function centreChip(a) {
        if (!small.matches) return;
        /* scrollIntoView would also scroll the page. Setting scrollLeft on the
           strip itself moves exactly one thing. */
        var target = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2;
        target = Math.max(0, target);
        if (env.reduced || typeof list.scrollTo !== 'function') list.scrollLeft = target;
        else list.scrollTo({ left: target, behavior: 'smooth' });
      }

      var spy = spySections(host, page.ids, function (id) {
        var short = id.replace(host.uidPrefix + '-', '');
        ticks.forEach(function (a) {
          if (a.getAttribute('data-go') === short) {
            a.setAttribute('aria-current', 'page');
            centreChip(a);
          } else {
            a.removeAttribute('aria-current');
          }
        });
      });

      function onNavClick(e) {
        var a = e.target.closest ? e.target.closest('[data-go]') : null;
        if (!a) return;
        e.preventDefault();
        host.goTo(host.uidPrefix + '-' + a.getAttribute('data-go'), 24);
      }
      root.addEventListener('click', onNavClick);

      return {
        destroy: function () {
          SE.ticker.remove(frame);
          root.removeEventListener('click', onNavClick);
          spy.destroy();
          sw.destroy();
          host.destroy();
          root.classList.remove('nav-c', 'nav-scroll');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     SECTION 05  -  LIMELIGHT
     --------------------------------------------------------------------------
     A travelling indicator, built the way one has to be built if it is going to
     read as a physical object rather than as a rectangle being repositioned.

     THE TWO EDGES ARE DAMPED SEPARATELY
     -----------------------------------
     A single transform interpolated between two rectangles moves rigidly, and a
     rigid rectangle carries no information about which way it is going. Here the
     leading edge and the trailing edge are two independent exponential damps
     with different rates: the edge in the direction of travel runs at lambda 19
     and the edge behind it at lambda 11. The lamp therefore stretches toward
     where it is going and closes up once it arrives, which is exactly how a
     thing with mass behaves and exactly what tells you the direction before you
     have read the label.

     THE NUMBERS ARE DERIVED, NOT CHOSEN
     -----------------------------------
     With those two rates, the width overshoot peaks at ln(19/11)/8 = 68ms into
     the move, at 19.9% of the distance travelled. The leading edge is 95% home
     at 158ms and the trailing edge at 273ms. So a one item hop stretches by
     about 18px and a jump across the bar stretches by about 90px: the further
     it goes, the more it leans, which is the entire point.

     DIRECTION IS RECOMPUTED EVERY FRAME
     -----------------------------------
     Not latched at the start of the move. If the reader retargets mid flight the
     roles of the two edges swap on the next frame, and because both edges keep
     whatever position they currently hold, the reversal inherits its own
     velocity rather than restarting from zero. That is the difference between an
     indicator you can interrupt and one that has to finish first.
     ========================================================================== */

  SE.register({
    area: 'nav',
    variant: 'section',
    id: 'nav-section-limelight',
    num: 5,
    pageOf: 'nav-page-index',
    screens: 4.4,
    name: 'Limelight',
    kind: 'DOM / two edge damping',
    accent: '#E8E2D6',
    tagline: 'It leans the way it is going',
    desc: 'A lamp that travels between six destinations with its leading and trailing edges damped at ' +
          'different rates, so it stretches toward the target and closes up on arrival.',
    interaction: 'Scroll, or press a destination. The lamp leans in the direction of travel and can be retargeted mid flight.',
    hint: 'Scroll or press &middot; watch which way it leans',

    /* Miniature: the lamp crossing a row of items, stretching toward the one it
       is heading for. Thirty operations. */
    preview: function (ctx, w, h, t, heat) {
      var n = 5;
      var pad = w * 0.08;
      var span = w - pad * 2;
      var slot = span / n;
      var barY = h * 0.30;

      /* A slow tour of the row, with a pause on each item. */
      var phase = (t * 0.30) % n;
      var idx = Math.floor(phase);
      var frac = phase - idx;
      var ease = M.clamp(frac / 0.34, 0, 1);
      var leadE = 1 - Math.pow(1 - ease, 3.2);
      var trailE = 1 - Math.pow(1 - ease, 1.5);

      var from = pad + slot * idx;
      var to = pad + slot * ((idx + 1) % n);
      if (to < from) { to = from; }
      var left = from + (to - from) * trailE;
      var right = from + slot + ((to + slot) - (from + slot)) * leadE;

      ctx.fillStyle = 'rgba(232,226,214,' + (0.11 + heat * 0.06).toFixed(3) + ')';
      ctx.fillRect(left, barY, Math.max(6, right - left), h * 0.20);

      var i;
      for (i = 0; i < n; i++) {
        var cx = pad + slot * (i + 0.5);
        var on = i === idx && ease < 0.2 || i === (idx + 1) % n && ease > 0.8;
        ctx.fillStyle = on ? 'rgba(236,236,239,0.92)' : 'rgba(236,236,239,0.34)';
        ctx.fillRect(cx - slot * 0.26, barY + h * 0.09, slot * 0.52, 2);
      }

      /* The bar edge and the wordmark, so the row reads as chrome. */
      ctx.strokeStyle = 'rgba(236,236,239,0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(h * 0.60) + 0.5);
      ctx.lineTo(w, Math.round(h * 0.60) + 0.5);
      ctx.stroke();
      ctx.fillStyle = 'rgba(236,236,239,0.50)';
      ctx.fillRect(pad, barY + h * 0.09, 0, 2);

      /* Quiet page underneath. */
      for (i = 0; i < 3; i++) {
        ctx.fillStyle = 'rgba(236,236,239,' + (0.13 - i * 0.035).toFixed(3) + ')';
        ctx.fillRect(pad, h * 0.72 + i * h * 0.10, span * (0.58 - i * 0.14), 2);
      }
    },

    spec: {
      subtitle: 'A travelling indicator whose two edges are damped at different rates',
      philosophy: [
        'An indicator that moves rigidly between two positions carries no information about direction. Damping the leading and trailing edges at different rates makes it stretch toward its target and close up on arrival, which states the direction before the reader has finished reading the label.',
        'Both numbers are derived rather than chosen. Leading edge lambda 19, trailing edge lambda 11: the width overshoot peaks at ln(19/11)/8 = 68ms into the move at 19.9% of the distance travelled, the leading edge is 95% home at 158ms and the trailing edge at 273ms. A short hop leans a little and a long jump leans a lot, because the lean is a fraction of the distance rather than a constant.',
        'Direction is recomputed every frame rather than latched when the move starts. Retargeting mid flight swaps the roles of the two edges on the next frame, and because both edges keep whatever position they currently hold, the reversal inherits its velocity instead of restarting.',
        'This is chrome that is looked at on every screen, so the whole move is under 300ms and the lean is under 20%. An indicator that bounces is delightful once and tiresome by the tenth section.'
      ],
      hierarchy: [
        '1. The active destination label, full ink.',
        '2. The lamp behind it, a 10% ink plate. It is a ground, not a highlight: it never outranks the word it is under.',
        '3. The other five labels at the dim ramp.',
        '4. The wordmark, which anchors the gutter.',
        '5. The bar hairline, which appears only once content is underneath.'
      ],
      structure: [
        'A <header> in a zero height position:sticky layer, 64px tall, holding the wordmark and a <nav aria-label="Primary">.',
        'The <ul> is position:relative and is the offset parent for both the items and the lamp, so every measurement is in one coordinate space.',
        'The lamp is one absolutely positioned <span> of a fixed 100px base width at z-index 0, with the items at z-index 1 above it. Its geometry is entirely transform, so it never triggers layout.',
        'Items are 44px tall <a> with 12px of horizontal padding and an 8px gap, which puts adjacent targets exactly on the floor.'
      ],
      interaction: [
        'Per frame: read the active item geometry from the cache, compute the current centre from the two edge values, and take the sign of (targetCentre - currentCentre) as the direction.',
        'Moving right: the right edge damps at lambda 19 and the left edge at lambda 11. Moving left: the rates swap. Equal rates would produce a rigid rectangle.',
        'The transform written is translate3d(left, 0, 0) scaleX((right - left) / 100) with transform-origin left center, so one element expresses both position and width without touching layout.',
        'On first paint the lamp snaps to the active item with no travel. An indicator that slides in from index zero on load is the most common bug in this pattern.',
        'Item geometry is measured once at mount and re-measured by a ResizeObserver on the list, so a font swap or a viewport change never leaves the lamp misaligned.',
        'Focus does not move the lamp. The lamp tracks the section in view; focus gets a 1px underline. Two signals, two meanings, no argument between them.'
      ],
      choreography: [
        { n: 'Lead edge', d: 'damp(edge, target, 19, dt). 95% of the distance in 158ms, which is when the move reads as finished.' },
        { n: 'Trail edge', d: 'damp(edge, target, 11, dt). 95% in 273ms. The 115ms it lags by is the whole effect.' },
        { n: 'Lean', d: 'Peak width overshoot 19.9% of the travel distance at t = 68ms, from the two rates. Not a keyframe and not a magic number: the consequence of the two lambdas.' },
        { n: 'Label ink', d: 'colour over 140ms ease. No transform on the label, ever. A word that moves under the pointer is a word you can misread.' },
        { n: 'Press', d: 'The item takes opacity 0.7 for 100ms on :active. The lamp does not react to the press; it reacts to the arrival, which is the honest signal.' },
        { n: 'Focus', d: 'A 1px rule under the focused item, no transition, because focus moves on every keypress and a 60ms fade behind a Tab is lag.' }
      ],
      scroll: [
        'The bar consumes no scroll. It is chrome in a sticky layer.',
        'The active destination comes from one IntersectionObserver at -42% / -52%. The lamp follows the observer, not the scroll position, so it moves once per section rather than continuously.',
        'Pressing a destination scrolls the container; the lamp only moves when the new section actually arrives, which is why a press and a scroll produce identical motion.',
        'scroll-padding-top of 76px so a focused control is never scrolled under the bar.'
      ],
      hover: [
        'Every hover rule sits inside @media (hover: hover) and (pointer: fine).',
        'Hovering a destination raises its ink over 140ms and does nothing else. The lamp does not follow the pointer: it means "you are here", and hover does not change where you are.',
        'The bar as a whole does not respond to hover.'
      ],
      click: [
        'A destination scrolls the container to its section. The lamp travels when the section arrives.',
        'Pressing a second destination mid travel retargets the lamp on the next frame, and it leans the other way from wherever it currently is.',
        'The See more control in the page opens the page level view.'
      ],
      responsive: {
        desktop: 'Six destinations on one row, 12px padding, 8px gaps, lamp travelling behind them.',
        tablet: 'Padding drops to 10px so six still fit at 768px. Everything else is identical.',
        mobile: 'Below 768px six destinations do not fit on one line at any legible size, so the row becomes a horizontal scroll-snap strip and the lamp becomes a 2px underline rather than a plate: a filled plate behind a strip that is itself scrolling reads as two things moving at once. The active chip is centred by setting scrollLeft on the strip. Same maths, different mark.'
      },
      a11y: [
        'A real <header>, a real <nav aria-label="Primary"> and real <a>. aria-current="page" on the destination for the section in view.',
        'The lamp is aria-hidden. It is a picture of aria-current, and a screen reader already has aria-current.',
        'Focus is marked separately from the current section, so a keyboard user moving through the bar can always tell where focus is and where they are.',
        'Targets are 44px tall with 8px between, and the wordmark is padded rather than sized to its text.',
        'The list has no overflow:hidden on desktop, so a focus ring at 3px offset is never clipped. On mobile, where the strip does scroll horizontally, the ring is drawn inside the chip at -3px offset instead.',
        'Under prefers-reduced-motion both damping constants are bypassed: the lamp jumps to the target with no travel and no lean. The indicator still says where you are, which is its job.'
      ],
      perf: [
        'One transform write per frame, and only while the lamp is more than 0.05px from its target. Between section changes the frame costs one comparison.',
        'Item geometry is cached. Reading offsetLeft inside the frame loop would force a layout every frame for six values that change on resize.',
        'The lamp is one element and one composited layer. There is no per item work of any kind.',
        'One IntersectionObserver, one ResizeObserver, one ticker subscription, one passive scroll listener for the bar edge.'
      ],
      packages: [
        { p: 'none required', w: 'Two exponential damps and one transform. This is the case a library would make worse, because the whole effect lives in the fact that the two edges are separate values.' },
        { p: 'no framer-motion layoutId', w: 'Shared layout animation is the usual answer here, and it moves the indicator rigidly. Rigid is the thing this concept exists to avoid.' },
        { p: 'gsap (installed)', w: 'Use gsap.ticker if the app has one so this shares a single rAF. Do not use tweens: the target can change mid flight and a tween would have to be killed and rebuilt.' }
      ],
      architecture: [
        { f: 'components/navbar/Limelight.tsx', r: '"use client" leaf. Owns the two edge refs, the geometry cache and the frame pass.' },
        { f: 'lib/twoEdge.ts', r: 'Pure: (leftRef, rightRef, targetLeft, targetRight, dt) applies the two damps and returns the transform string. Testable without a DOM.' },
        { f: 'lib/useMeasuredItems.ts', r: 'ResizeObserver plus a cache of offsetLeft and offsetWidth for each item. Never read inside the frame.' },
        { f: 'lib/navShell.ts', r: 'Already exists. activeSection lives there.' },
        { f: 'app/(nav)/index/page.tsx', r: 'The See more route: the Index full screen list, which is these six destinations at full size.' }
      ],
      state: [
        'The two edge positions are refs. They change every frame.',
        'The geometry cache is a ref, refreshed by the observer callback.',
        'activeIndex is state, because it drives aria-current and a class on six elements.',
        'Do not derive the lamp position from React state. That is a render per frame for a value that only ever becomes a transform.'
      ],
      typography: [
        'Destinations and wordmark: mono 11px, letter-spacing 0.16em, uppercase. Labels, which is what mono is for.',
        'Nothing else in the bar is type. The lamp is a plate, not a pill with a word in it.',
        'On mobile the chips keep 11px, because the strip scrolls and there is no reason to shrink type that already fits.'
      ],
      color: [
        'The lamp is 10% of the signature hue, which in this concept is bone rather than a saturated accent. It is a ground: it must never be brighter than the word sitting on it.',
        'Active label full ink, inactive labels the dim ramp. That difference is the state model; the lamp only says where.',
        'The bar earns a void-2 ground and a hairline once scrollTop passes 12px, and has neither at the top of the document.',
        'In light mode invert the ground, take the lamp to 8% of near black, and leave the ink ramp inverted with it.'
      ],
      spacing: [
        'Bar 64px, gutter matching the page so the wordmark sits on the content column.',
        'Destinations 12px horizontal padding, 8px gap, 44px tall. The lamp inherits the item box exactly, so it is never a rounded pill floating inside a bigger target.',
        'The lamp base width is 100px and everything else is scaleX, so the transform is one number rather than a layout.',
        'On mobile the strip has 12px of scroll padding at each end so the first and last chip are never half cut.'
      ],
      relationships: [
        'Horizontal position encodes which section is in view.',
        'The lean encodes the direction of travel, and its size encodes how far the lamp is going, because it is a fraction of the distance.',
        'Ink encodes which label is current. The lamp is a ground and does not double as that signal.',
        'Focus is drawn with a different mark from the current section, because they are different facts and a reader tabbing through the bar needs both at once.'
      ],
      acceptance: [
        'On first paint the lamp is already under the active destination, with no travel.',
        'Moving from the first destination to the last leans right, visibly wider mid flight than at rest.',
        'Pressing a destination on the far side while the lamp is still travelling makes it lean the other way from where it currently is, with no jump.',
        'The lamp never overshoots past its target position. Only the width overshoots.',
        'The lamp is aligned to the item within a pixel after a viewport resize and after a webfont swap.',
        'Between section changes a profile shows no per frame work from this component.',
        'With reduced motion on, the lamp jumps and nothing leans.',
        'Below 768px the strip scrolls, the lamp is a 2px underline, and the active chip is centred without the page moving.'
      ]
    },

    mount: function (root, ctx) {
      var host = makeHost(root, ctx);

      var LAMP_BASE = 100;   /* the lamp's layout width; everything else is scaleX */
      var LEAD = 19;         /* lambda of the edge in the direction of travel      */
      var TRAIL = 11;        /* lambda of the edge behind it                       */

      var bar = SE.el('header', 'nav-limelight__bar');
      bar.innerHTML =
        '<a class="nav-limelight__mark" href="#' + host.uidPrefix + '-index" data-go="index">' +
          '<b>Miftaul</b><span>Islam</span></a>' +
        '<nav class="nav-limelight__nav" aria-label="Primary"><ul>' +
          '<span class="nav-limelight__lamp" aria-hidden="true"></span>' +
          LINKS.map(function (l) {
            return '<li><a href="#' + host.uidPrefix + '-' + l.id + '" data-go="' + l.id + '">' +
                   l.label + '</a></li>';
          }).join('') +
        '</ul></nav>';

      host.layer.appendChild(bar);
      root.appendChild(host.layer);

      var page = fauxPage(host);
      root.appendChild(page);
      attachSeeMore(page, ctx, 'Open the full index');
      host.reserve(76, 24);

      var list = SE.$('.nav-limelight__nav ul', bar);
      var lamp = SE.$('.nav-limelight__lamp', bar);
      var items = SE.$$('.nav-limelight__nav a', bar);

      /* --------------------------------------------------------- geometry */
      var geo = [];
      function measure() {
        geo = items.map(function (a) {
          return { l: a.offsetLeft, r: a.offsetLeft + a.offsetWidth };
        });
      }
      measure();

      var ro = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(function () { measure(); snap = true; });
        ro.observe(list);
      }

      /* ------------------------------------------------------------ state */
      var idx = 0;
      var left = geo.length ? geo[0].l : 0;
      var right = geo.length ? geo[0].r : LAMP_BASE;
      var snap = true;      /* first paint, and after any re-measure */
      var lastWrite = '';

      function write() {
        var wdt = Math.max(1, right - left);
        var s = 'translate3d(' + left.toFixed(2) + 'px,0,0) scaleX(' +
                (wdt / LAMP_BASE).toFixed(5) + ')';
        if (s === lastWrite) return;
        lamp.style.transform = s;
        lastWrite = s;
      }

      function frame(dt) {
        var g = geo[idx];
        if (!g) return;

        if (snap || env.reduced) {
          left = g.l;
          right = g.r;
          snap = false;
          write();
          return;
        }

        var dl = g.l - left;
        var dr = g.r - right;
        if (Math.abs(dl) < 0.05 && Math.abs(dr) < 0.05) {
          if (left !== g.l || right !== g.r) { left = g.l; right = g.r; write(); }
          return;                                   /* settled: no work */
        }

        /* Direction from where the lamp actually is, recomputed every frame, so
           a retarget mid flight swaps the two rates instead of restarting. */
        var goingRight = (g.l + g.r) >= (left + right);
        left = M.damp(left, g.l, goingRight ? TRAIL : LEAD, dt);
        right = M.damp(right, g.r, goingRight ? LEAD : TRAIL, dt);
        write();
      }
      SE.ticker.add(frame);

      /* ---------------------------------------------------------- the bar */
      var sw = watchScroll(host.scroller);
      function edge() { bar.classList.toggle('is-edged', sw.state.y > 12); }
      SE.ticker.add(edge);

      var small = window.matchMedia('(max-width: 768px)');
      function centreChip(a) {
        if (!small.matches) return;
        var target = Math.max(0, a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2);
        if (env.reduced || typeof list.scrollTo !== 'function') list.scrollLeft = target;
        else list.scrollTo({ left: target, behavior: 'smooth' });
      }

      var spy = spySections(host, page.ids, function (id) {
        var short = id.replace(host.uidPrefix + '-', '');
        for (var i = 0; i < items.length; i++) {
          var on = items[i].getAttribute('data-go') === short;
          if (on) {
            items[i].setAttribute('aria-current', 'page');
            idx = i;
            measure();
            centreChip(items[i]);
          } else {
            items[i].removeAttribute('aria-current');
          }
        }
      });

      function onNavClick(e) {
        var a = e.target.closest ? e.target.closest('[data-go]') : null;
        if (!a) return;
        e.preventDefault();
        host.goTo(host.uidPrefix + '-' + a.getAttribute('data-go'), 76);
      }
      root.addEventListener('click', onNavClick);

      return {
        destroy: function () {
          SE.ticker.remove(frame);
          SE.ticker.remove(edge);
          if (ro) ro.disconnect();
          root.removeEventListener('click', onNavClick);
          spy.destroy();
          sw.destroy();
          host.destroy();
          root.classList.remove('nav-c', 'nav-scroll');
          root.innerHTML = '';
        }
      };
    }
  });

})(window.SE = window.SE || {});

/* ============================================================================
   CORE  -  environment flags, one shared ticker, canvas + math helpers.
   ----------------------------------------------------------------------------
   Design rule enforced here: there is exactly ONE requestAnimationFrame loop in
   the whole application. Every concept, every preview, and Lenis all subscribe
   to it. Six concepts each running their own rAF is how a page like this ends
   up at 22fps on a laptop; a single loop that drains an empty subscriber list
   and stops costs nothing when nothing is animating.
   ========================================================================== */
(function (SE) {
  'use strict';

  /* ------------------------------------------------------------------ env */
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');

  var env = SE.env = {
    reduced: mqReduce.matches,
    fine: mqFine.matches,
    touch: !mqFine.matches,
    mobile: window.innerWidth < 768,
    tablet: window.innerWidth >= 768 && window.innerWidth < 1100,
    dpr: 1,
    gsap: false,
    lenis: false
  };

  function refreshEnv() {
    env.reduced = mqReduce.matches;
    env.fine = mqFine.matches;
    env.touch = !mqFine.matches;
    env.mobile = window.innerWidth < 768;
    env.tablet = window.innerWidth >= 768 && window.innerWidth < 1100;
    env.dpr = Math.min(window.devicePixelRatio || 1, env.mobile ? 1.75 : 2);
    document.documentElement.classList.toggle('is-reduced', env.reduced);
    document.documentElement.classList.toggle('is-fine', env.fine);
  }
  refreshEnv();

  var envListeners = [];
  SE.onEnvChange = function (fn) { envListeners.push(fn); };
  function broadcastEnv() { envListeners.forEach(function (fn) { fn(env); }); }

  if (mqReduce.addEventListener) {
    mqReduce.addEventListener('change', function () { refreshEnv(); broadcastEnv(); });
    mqFine.addEventListener('change', function () { refreshEnv(); broadcastEnv(); });
  }

  /* --------------------------------------------------------------- ticker */
  var subs = [];
  var running = false;
  var last = 0;

  function frame(now) {
    if (!subs.length) { running = false; return; }
    var t = now / 1000;
    /* Clamp dt: after a tab switch `now - last` can be many seconds, which
       would teleport every animated value. 1/30s ceiling keeps motion sane. */
    var dt = Math.min(t - last, 1 / 30);
    if (dt < 0) dt = 0;
    last = t;
    for (var i = 0; i < subs.length; i++) {
      var fn = subs[i];
      if (fn) fn(dt, t);
    }
    requestAnimationFrame(frame);
  }

  SE.ticker = {
    add: function (fn) {
      if (subs.indexOf(fn) !== -1) return fn;
      subs.push(fn);
      if (!running) {
        running = true;
        last = performance.now() / 1000;
        requestAnimationFrame(frame);
      }
      return fn;
    },
    remove: function (fn) {
      var i = subs.indexOf(fn);
      if (i !== -1) subs.splice(i, 1);
    },
    count: function () { return subs.length; }
  };

  /* ----------------------------------------------------------------- math */
  var M = SE.math = {
    clamp: function (v, a, b) { return v < a ? a : v > b ? b : v; },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    map: function (v, a, b, c, d) { return c + (d - c) * ((v - a) / (b - a)); },
    /* Frame-rate independent damping. `lambda` is roughly "how many e-folds
       per second"; 8 is snappy, 3 is languid. Never use a raw 0.1 lerp per
       frame - that silently changes speed on a 120Hz display. */
    damp: function (current, target, lambda, dt) {
      return current + (target - current) * (1 - Math.exp(-lambda * dt));
    },
    round: function (v, p) { var m = Math.pow(10, p || 0); return Math.round(v * m) / m; }
  };

  /* Deterministic PRNG: layouts must look identical on every reload, or the
     "premium" feeling collapses into randomness. */
  SE.rng = function (seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;  s >>>= 0;
      return s / 4294967296;
    };
  };

  /* ---------------------------------------------------------------- color */
  SE.hexToRgb = function (hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  SE.rgba = function (hex, a) {
    var c = SE.hexToRgb(hex);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  };

  /* --------------------------------------------------------------- canvas */
  /* Handles DPR, resize, and hands back logical (CSS px) dimensions so all
     drawing code can stay in CSS pixels and never think about retina. */
  SE.canvas = function (el) {
    var ctx = el.getContext('2d', { alpha: true });
    var api = { el: el, ctx: ctx, w: 0, h: 0, dpr: env.dpr };

    api.resize = function () {
      var r = el.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width));
      var h = Math.max(1, Math.round(r.height));
      var dpr = env.dpr;
      if (api.w === w && api.h === h && api.dpr === dpr) return false;
      api.w = w; api.h = h; api.dpr = dpr;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    api.clear = function () { ctx.clearRect(0, 0, api.w, api.h); };

    /* Free the backing bitmap. With seventy preview canvases on the index at
       full size, the page would hold roughly 90MB of pixels that nobody is
       looking at. Off-screen previews drop to 1x1 and re-inflate on entry. */
    api.release = function () {
      if (api.w === 0) return;
      api.w = 0; api.h = 0; api.dpr = 0;
      el.width = 1; el.height = 1;
    };

    var ro = null;
    api.observe = function (onResize) {
      api.resize();
      if (typeof ResizeObserver === 'undefined') {
        window.addEventListener('resize', function () {
          if (api.resize() && onResize) onResize(api);
        });
        return;
      }
      ro = new ResizeObserver(function () {
        if (api.resize() && onResize) onResize(api);
      });
      ro.observe(el);
    };
    api.destroy = function () { if (ro) ro.disconnect(); ro = null; };

    return api;
  };

  /* -------------------------------------------------------------- pointer */
  /* One listener for the entire app. Concepts read SE.pointer instead of each
     attaching their own pointermove handler. */
  var pointer = SE.pointer = { x: 0, y: 0, nx: 0, ny: 0, dnx: 0, dny: 0, active: false, down: false };

  window.addEventListener('pointermove', function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.active = true;
  }, { passive: true });

  window.addEventListener('pointerdown', function () { pointer.down = true; }, { passive: true });
  window.addEventListener('pointerup', function () { pointer.down = false; }, { passive: true });
  window.addEventListener('blur', function () { pointer.down = false; });

  /* Damped copy, updated once per frame. Concepts that want parallax read
     `dnx/dny` and get smoothing for free instead of each rolling their own. */
  SE.ticker.add(function (dt) {
    if (env.reduced) { pointer.dnx = 0; pointer.dny = 0; return; }
    pointer.dnx = M.damp(pointer.dnx, pointer.nx, 4.5, dt);
    pointer.dny = M.damp(pointer.dny, pointer.ny, 4.5, dt);
  });

  /* ------------------------------------------------------------------- dom */
  SE.el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  SE.$ = function (sel, root) { return (root || document).querySelector(sel); };
  SE.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* Pad an index for display: 1 -> "01". Used everywhere for the concept
     numbering, so it lives here rather than being re-implemented six times. */
  SE.pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* --------------------------------------------------------------- easing */
  /* Curve values are taken from the strong-UI set rather than the browser
     built-ins, which are too weak to read as deliberate at this scale. */
  SE.ease = {
    out: 'cubic-bezier(0.23, 1, 0.32, 1)',
    inOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
    drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
    gsapOut: 'expo.out',
    gsapInOut: 'expo.inOut'
  };

  /* ------------------------------------------------------- reduced motion */
  /* Single helper so no concept has to remember the rule: reduced motion is
     "fewer and gentler", not "nothing". Callers pass both variants. */
  SE.motion = function (full, gentle) { return env.reduced ? gentle : full; };

  /* --------------------------------------------------- accessibility list */
  /* A canvas is a pixel surface with no accessibility tree. Every canvas-based
     concept mirrors its contents into one of these: a visually-hidden but
     focusable list of real buttons. Tab order matches reading order, focus
     drives the same selection the pointer does, and a screen reader gets the
     full stack as text. This is the difference between "impressive" and
     "impressive and shippable". */
  SE.srList = function (label, skills, onSelect) {
    var wrap = SE.el('div', 'sr-only');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', label);

    var intro = SE.el('p', null, label + '. ' + skills.length +
      ' technologies. Use Tab to move through them; each one is focusable and selectable.');
    wrap.appendChild(intro);

    var ul = SE.el('ul');
    skills.forEach(function (s) {
      var li = SE.el('li');
      var b = SE.el('button');
      b.type = 'button';
      b.textContent = s.name + ' - ' + s.categoryLabel + ', ' + s.role + '. ' + s.note;
      b.addEventListener('focus', function () { onSelect(s, 'focus'); });
      b.addEventListener('click', function () { onSelect(s, 'click'); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    return wrap;
  };

  /* --------------------------------------------------------- detail panel */
  /* Shared by ORBIT and LATTICE. One implementation, so the two concepts
     cannot drift apart in the details that make a panel feel considered. */
  SE.makeDetail = function () {
    var root = SE.el('div', 'detail');
    root.setAttribute('aria-live', 'polite');
    root.innerHTML =
      '<div class="detail__top">' +
        '<span class="detail__cat"></span>' +
        '<button class="iconbtn" data-close aria-label="Clear selection">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</div>' +
      '<h3 class="detail__name"></h3>' +
      '<p class="detail__role"></p>' +
      '<p class="detail__note"></p>' +
      '<div class="detail__stat"></div>' +
      '<div class="detail__rel"></div>';

    var api = { el: root };

    api.show = function (s) {
      root.style.setProperty('--c-accent', s.accent);
      root.querySelector('.detail__cat').textContent = s.categoryLabel;
      root.querySelector('.detail__name').textContent = s.name;
      root.querySelector('.detail__role').textContent = s.role;
      root.querySelector('.detail__note').textContent = s.note;
      root.querySelector('.detail__stat').innerHTML =
        '<span><b>' + s.years + '</b> yr in production</span>' +
        '<span><b>' + (SE.DATA.neighbours[s.id] || []).length + '</b> connections</span>';
      var rel = SE.DATA.related(s.id, 6);
      root.querySelector('.detail__rel').innerHTML = rel.length
        ? rel.map(function (r) { return '<span>' + r.name + '</span>'; }).join('')
        : '<span>Standalone</span>';
      root.classList.add('is-on');
    };
    api.hide = function () { root.classList.remove('is-on'); };
    api.onClose = function (fn) {
      root.querySelector('[data-close]').addEventListener('click', fn);
    };
    return api;
  };

  /* ------------------------------------------------------------ hint bar */
  /* A hint is onboarding: it tells you the input model before you have tried
     anything. The instant you act, it has done its job and is only obscuring
     content - which on a reading-heavy concept means it literally sits on top
     of a sentence. It retires on the first interaction of any kind. */
  SE.hintStrip = function (html) {
    var n = SE.el('div', 'hint-strip', html);
    n.setAttribute('aria-hidden', 'true');

    var events = ['wheel', 'pointerdown', 'keydown', 'touchstart'];
    function retire() {
      n.classList.add('is-gone');
      events.forEach(function (e) {
        window.removeEventListener(e, retire, true);
      });
    }
    events.forEach(function (e) {
      window.addEventListener(e, retire, { capture: true, passive: true });
    });
    /* Handed back so a concept's destroy() can drop the listeners early if it
       is torn down before the reader ever interacts. */
    n.retireHint = retire;
    return n;
  };

  /* ===========================================================================
     SCROLL RAIL  -  the shared mechanism behind every section-level concept.
     ---------------------------------------------------------------------------
     An over-tall rail containing a `position: sticky` viewport of exactly one
     screen. The height difference IS the scroll distance, and the sticky child
     holds still while it is consumed.

     Sticky rather than ScrollTrigger `pin: true`: pinning injects a pin-spacer
     and rewrites layout, which is fragile inside a nested scroll container -
     exactly where every section concept here lives. Sticky achieves the same
     effect with zero layout surgery.
     ======================================================================== */
  SE.scrollRail = function (scroller, screens) {
    var rail = SE.el('div', 'srail');
    var sticky = SE.el('div', 'srail__sticky');
    rail.appendChild(sticky);

    function size() {
      var h = scroller.clientHeight || window.innerHeight;
      rail.style.height = Math.round(h * screens) + 'px';
      sticky.style.height = h + 'px';
    }

    var ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(size);
      ro.observe(scroller);
    } else {
      window.addEventListener('resize', size);
    }
    size();

    return {
      rail: rail,
      sticky: sticky,
      size: size,
      destroy: function () {
        if (ro) ro.disconnect();
        else window.removeEventListener('resize', size);
      }
    };
  };

  /* Scrub a 0..1 progress value from an element's pass through a scroller.
     Uses ScrollTrigger when it is there and a passive scroll listener when it
     is not, so a failed CDN degrades the smoothing rather than the feature. */
  SE.scrub = function (scroller, trigger, onUpdate) {
    if (window.gsap && window.ScrollTrigger) {
      var st = window.ScrollTrigger.create({
        scroller: scroller,
        trigger: trigger,
        start: 'top top',
        end: 'bottom bottom',
        scrub: env.reduced ? true : 0.6,
        invalidateOnRefresh: true,
        onUpdate: function (self) { onUpdate(self.progress); }
      });
      onUpdate(st.progress || 0);
      return { kill: function () { st.kill(); } };
    }

    var handler = function () {
      var top = trigger.offsetTop - scroller.scrollTop;
      var span = trigger.offsetHeight - scroller.clientHeight;
      onUpdate(M.clamp(-top / Math.max(1, span), 0, 1));
    };
    scroller.addEventListener('scroll', handler, { passive: true });
    handler();
    return { kill: function () { scroller.removeEventListener('scroll', handler); } };
  };

  /* Every section concept ends with the same affordance, so it lives here. */
  SE.seeMore = function (label, onClick) {
    /* Deliberately NOT btn--accent. That is the shell's vermillion, and the
       design rule is that the shell accent never appears inside a concept
       stage. `.seemore` re-points the button's own ink/line properties at
       --c-accent instead, so the control always wears the hue of whatever
       concept it belongs to. */
    var b = SE.el('button', 'btn seemore', label || 'See more');
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  };

})(window.SE = window.SE || {});

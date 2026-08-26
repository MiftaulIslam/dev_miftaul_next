/* ============================================================================
   SHELL  -  hero, area galleries, stage routing, page transition, cursor,
             toast, clipboard.
   ----------------------------------------------------------------------------
   The shell knows nothing about any individual concept. It reads the registry,
   renders a gallery per area, and mounts whatever it is handed. Adding an area
   costs two files and one row in SE.AREAS.
   ========================================================================== */
(function (SE) {
  'use strict';

  var env = SE.env, M = SE.math;
  var gsap = window.gsap;

  var shell = SE.shell = {};

  /* --------------------------------------------------------------- cursor */
  /* Deliberately NOT a global custom cursor. The native cursor is untouched
     everywhere except inside a concept's interactive canvas, where there is no
     text to select and a reticle communicates "this surface is spatial". */
  (function initCursor() {
    var el = SE.$('#cursor');
    if (!el || !env.fine || env.reduced) { if (el) el.remove(); return; }

    var label = SE.$('.cursor__label', el);
    var x = 0, y = 0;

    SE.ticker.add(function (dt) {
      x = M.damp(x, SE.pointer.x, 22, dt);
      y = M.damp(y, SE.pointer.y, 22, dt);
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      el.classList.toggle('is-down', SE.pointer.down);
    });

    SE.cursor = {
      on: function (v) { el.classList.toggle('is-on', !!v); },
      label: function (text) {
        label.textContent = text || '';
        el.classList.toggle('has-label', !!text);
      },
      grab: function (v) { el.classList.toggle('is-grab', !!v); }
    };
  })();

  if (!SE.cursor) {
    SE.cursor = { on: function () {}, label: function () {}, grab: function () {} };
  }

  /* ---------------------------------------------------------------- toast */
  (function initToast() {
    var el = SE.$('#toast');
    var textEl = SE.$('#toast-text');
    var metaEl = SE.$('#toast-meta');
    var timer = null;

    SE.toast = function (text, meta) {
      textEl.textContent = text;
      metaEl.textContent = meta || '';
      el.classList.remove('is-on');
      void el.offsetWidth;
      el.classList.add('is-on');
      clearTimeout(timer);
      timer = setTimeout(function () { el.classList.remove('is-on'); }, 2600);
    };
  })();

  /* ------------------------------------------------------------------ copy */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(fallback);
    }
    return Promise.resolve(fallback());

    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* nothing else to try */ }
      document.body.removeChild(ta);
    }
  }

  shell.copyPrompt = function (conceptId) {
    var c = SE.get(conceptId);
    if (!c) return;
    var text = SE.buildPrompt(conceptId);
    if (!text) { SE.toast('No prompt spec for this concept', c.name); return; }
    copyText(text).then(function () {
      var words = text.split(/\s+/).length;
      SE.toast('Next.js prompt copied',
        c.name + ' / ' + (c.variant === 'section' ? 'section' : 'page') + ' / ' + words.toLocaleString() + ' words');
    });
  };

  /* ------------------------------------------------------------------ wipe */
  var wipeEl = SE.$('#wipe');
  var wipeBands = wipeEl ? SE.$$('span', wipeEl) : [];

  function wipe(mid, done) {
    if (!gsap || env.reduced) {
      if (mid) mid();
      if (done) done();
      return;
    }
    wipeEl.classList.add('is-active');
    gsap.timeline({ onComplete: function () { wipeEl.classList.remove('is-active'); if (done) done(); } })
      .set(wipeBands, { transformOrigin: 'left center' })
      .to(wipeBands, { scaleX: 1, duration: 0.46, ease: 'expo.inOut', stagger: 0.04 })
      .add(function () { if (mid) mid(); })
      .set(wipeBands, { transformOrigin: 'right center' })
      .to(wipeBands, { scaleX: 0, duration: 0.52, ease: 'expo.inOut', stagger: 0.04 }, '+=0.06');
  }

  function uncover(done) {
    if (!gsap || env.reduced) {
      wipeBands.forEach(function (b) { b.style.transform = 'scaleX(0)'; });
      document.body.classList.remove('boot');
      if (done) done();
      return;
    }
    gsap.set(wipeBands, { transformOrigin: 'right center', scaleX: 1 });
    gsap.to(wipeBands, {
      scaleX: 0, duration: 0.68, ease: 'expo.inOut', stagger: 0.05,
      onStart: function () { document.body.classList.remove('boot'); },
      onComplete: function () { wipeEl.classList.remove('is-active'); if (done) done(); }
    });
  }

  /* ----------------------------------------------------------------- lenis */
  /* Lenis smooths the index page only. It attaches a NON-PASSIVE global wheel
     listener and preventDefault()s every wheel event so it can drive the window
     itself. That is fine while the index is the only scroller, and fatal the
     moment a concept opens: the stage is a fixed overlay with its own inner
     scroll container, and Lenis eats the wheel before it ever reaches it.

     `lenis.stop()` is NOT sufficient - it stops Lenis from scrolling but it
     keeps swallowing the wheel, so the inner container still receives nothing.
     The only reliable fix is to tear the instance down while a concept is open
     and rebuild it on close. Rebuilding is cheap and happens at human speed. */
  var lenis = null;
  var lenisTick = null;

  function initLenis() {
    if (lenis || !window.Lenis || env.reduced) return;
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    env.lenis = true;
    lenisTick = function (dt, t) { lenis.raf(t * 1000); };
    SE.ticker.add(lenisTick);
    if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
  }

  function killLenis() {
    if (!lenis) return;
    SE.ticker.remove(lenisTick);
    lenisTick = null;
    lenis.destroy();
    lenis = null;
    env.lenis = false;
  }

  /* ------------------------------------------------------------------ hero */
  function initHeroCanvas() {
    var el = SE.$('#hero-canvas');
    if (!el) return;
    var cv = SE.canvas(el);
    var ctx = cv.ctx;
    var spacing = 34, cols = 0, rows = 0, offX = 0, offY = 0;
    var t = 0;

    function refit() {
      spacing = Math.max(26, Math.min(cv.w, cv.h) / 26);
      cols = Math.ceil(cv.w / spacing) + 1;
      rows = Math.ceil(cv.h / spacing) + 1;
      offX = (cv.w - (cols - 1) * spacing) / 2;
      offY = (cv.h - (rows - 1) * spacing) / 2;
    }
    cv.observe(refit);
    refit();

    function draw(dt) {
      t += dt;
      cv.clear();
      var r = el.getBoundingClientRect();
      var px, py;
      if (SE.pointer.active) {
        px = SE.pointer.x - r.left;
        py = SE.pointer.y - r.top;
      } else {
        /* Idle drift on a slow Lissajous so the hero is alive before the
           pointer ever arrives. Two incommensurate periods, so it never
           visibly repeats. */
        px = cv.w * (0.5 + Math.sin(t * 0.13) * 0.30);
        py = cv.h * (0.44 + Math.cos(t * 0.091) * 0.26);
      }
      var R = Math.min(cv.w, cv.h) * 0.55;
      var R2 = R * R;

      for (var i = 0; i < cols; i++) {
        var x = offX + i * spacing;
        for (var j = 0; j < rows; j++) {
          var y = offY + j * spacing;
          var dx = x - px, dy = y - py;
          var d2 = dx * dx + dy * dy;
          var near = d2 < R2 ? 1 - d2 / R2 : 0;
          near *= near;               /* squared falloff reads as light */
          var wave = env.reduced ? 0.5 : (Math.sin(t * 0.55 + i * 0.22 + j * 0.17) + 1) / 2;
          var a = 0.20 + near * 0.55 + wave * 0.07;
          /* Integer position AND integer size. A 1.5px rect at a fractional
             offset spreads its alpha over four antialiased pixels, which at
             these alphas is the difference between a visible grid and a black
             rectangle. */
          var s = 2 + Math.round(near * 2);
          ctx.fillStyle = 'rgba(236,236,239,' + a.toFixed(3) + ')';
          ctx.fillRect((x - s / 2) | 0, (y - s / 2) | 0, s, s);
        }
      }
    }

    if (env.reduced) { draw(0); return; }
    SE.ticker.add(draw);
  }

  function buildHeroIndex() {
    var ul = SE.$('#hero-index');
    if (!ul) return;
    ul.innerHTML = SE.AREAS.filter(function (a) { return SE.areaCount(a.id) > 0; })
      .map(function (a) {
        return '<li><a href="#area-' + a.id + '"><i class="t-num">' +
               SE.pad(SE.areaCount(a.id)) + '</i>' + a.label + '</a></li>';
      }).join('');
  }

  function heroEntry() {
    if (!gsap || env.reduced) return;
    var words = SE.$$('.hero__title .word > span');
    gsap.timeline({ delay: 0.12 })
      .from(words, { yPercent: 112, duration: 0.95, ease: 'expo.out', stagger: 0.07 })
      .from('.hero__sub', { opacity: 0, y: 18, duration: 0.7, ease: 'expo.out' }, '-=0.55')
      .from('.hero__cta .btn', { opacity: 0, y: 14, duration: 0.55, ease: 'expo.out', stagger: 0.07 }, '-=0.45')
      .from('.hero__index li', { opacity: 0, x: 18, duration: 0.5, ease: 'expo.out', stagger: 0.045 }, '-=0.5')
      .from('.masthead > *', { opacity: 0, y: -10, duration: 0.5, ease: 'expo.out', stagger: 0.08 }, '-=0.6');
  }

  /* ================================================================ index */
  var previews = [];

  /* Column spans per group size. Asymmetric on purpose: equal thirds is the
     single clearest sign a grid was not composed.
     Composed for ANY count rather than looked up from a fixed table, because a
     group can hold anywhere from one concept to a dozen, and a table that stops
     at six silently degrades to flat equal rows past that. */
  var ROW_RHYTHM = [[7, 5], [5, 7], [6, 6]];

  function spansFor(n) {
    if (n === 1) return [12];
    if (n === 3) return [5, 7, 12];
    var out = [], row = 0;
    while (out.length < n) {
      /* an odd tail gets the full width rather than a lonely half */
      if (n - out.length === 1) { out.push(12); break; }
      var pair = ROW_RHYTHM[row % ROW_RHYTHM.length];
      out.push(pair[0], pair[1]);
      row++;
    }
    return out.slice(0, n);
  }
  var RATIO = { 12: '21 / 9', 7: '16 / 9', 6: '16 / 10', 5: '4 / 3' };

  function buildCard(c, span) {
    var card = SE.el('article', 'card is-hidden');
    card.style.setProperty('--card-hue', SE.rgba(c.accent, 0.18));
    card.style.gridColumn = 'span ' + span;
    card.style.setProperty('--pane-ratio', RATIO[span] || '16 / 9');

    card.innerHTML =
      '<div class="card__glow" aria-hidden="true"></div>' +
      '<div class="card__pane">' +
        '<span class="card__num t-num">' + SE.pad(c.num) + '</span>' +
        '<span class="card__kind">' + c.kind + '</span>' +
        '<canvas></canvas>' +
      '</div>' +
      '<div class="card__meta">' +
        '<h4 class="card__name"><button type="button" data-open="' + c.id + '">' + c.name + '</button></h4>' +
        '<p class="card__desc">' + c.desc + '</p>' +
        '<p class="card__inter"><b>Interaction</b><span>' + c.interaction + '</span></p>' +
      '</div>' +
      '<div class="card__actions">' +
        '<button class="btn btn--sm" data-open="' + c.id + '">Explore</button>' +
        '<button class="btn btn--sm btn--ghost" data-copy="' + c.id + '">Copy Next.js prompt</button>' +
      '</div>';

    var preview = SE.mountPreview(SE.$('canvas', card), c.id);
    previews.push(preview);

    if (env.fine) {
      card.addEventListener('pointerenter', function () {
        preview.setHeat(1); SE.cursor.on(true); SE.cursor.label('Explore');
      });
      card.addEventListener('pointerleave', function () {
        preview.setHeat(0); SE.cursor.on(false); SE.cursor.label('');
      });
    }
    card.addEventListener('focusin', function () { preview.setHeat(1); });
    card.addEventListener('focusout', function () {
      if (!card.contains(document.activeElement)) preview.setHeat(0);
    });

    return card;
  }

  function buildGroup(list, label, note) {
    if (!list.length) return null;
    var group = SE.el('section', 'gallery__group');
    var spans = spansFor(list.length);

    group.innerHTML =
      '<div class="gallery__grouphead">' +
        '<h3>' + label + '</h3>' +
        '<p>' + note + '</p>' +
        '<span class="t-num">' + SE.pad(list.length) + '</span>' +
      '</div>';

    var grid = SE.el('div', 'grid');
    list.forEach(function (c, i) { grid.appendChild(buildCard(c, spans[i] || 6)); });
    group.appendChild(grid);
    return group;
  }

  function buildGalleries() {
    var host = SE.$('#galleries');
    if (!host) return;
    var reveal = [];

    SE.AREAS.forEach(function (area) {
      var page = SE.list(area.id, 'page');
      var section = SE.list(area.id, 'section');
      if (!page.length && !section.length) return;

      var sec = SE.el('section', 'gallery');
      sec.id = 'area-' + area.id;
      sec.innerHTML =
        '<header class="gallery__head">' +
          '<h2 class="gallery__title">' + area.label + '</h2>' +
          '<p class="gallery__blurb">' + (typeof area.blurb === 'function' ? area.blurb() : area.blurb) + '</p>' +
          '<span class="gallery__count t-num">' + SE.pad(page.length + section.length) + '</span>' +
        '</header>';

      var g1 = buildGroup(section, 'In-page section',
        'Lives between other sections. Consumes scroll, hands off, and offers a way through to the full view.');
      var g2 = buildGroup(page, 'Full page',
        'Owns the whole viewport. The deep view a section hands off to.');
      if (g1) sec.appendChild(g1);
      if (g2) sec.appendChild(g2);

      host.appendChild(sec);
      reveal = reveal.concat(SE.$$('.card', sec));
    });

    revealOnScroll(reveal);
    buildAreaRail();

    var total = SE.registry.all.length;
    var mh = SE.$('#mh-count');
    if (mh) mh.textContent = SE.pad(total);
  }

  /* Scroll reveal via IntersectionObserver and a CSS transition, not a tween
     per card: the cascade is cheaper, interrupts correctly, and needs no
     library for what is fundamentally a fade. */
  function revealOnScroll(nodes) {
    if (env.reduced) {
      nodes.forEach(function (n) { n.classList.remove('is-hidden'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = nodes.indexOf(e.target);
        e.target.style.transitionDelay = ((i % 2) * 90) + 'ms';
        e.target.classList.remove('is-hidden');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function buildAreaRail() {
    var rail = SE.$('#arearail');
    if (!rail) return;
    var areas = SE.AREAS.filter(function (a) { return SE.areaCount(a.id) > 0; });
    rail.innerHTML = areas.map(function (a) {
      return '<a href="#area-' + a.id + '" data-area="' + a.id + '">' + a.label +
             '<i class="t-num">' + SE.pad(SE.areaCount(a.id)) + '</i></a>';
    }).join('');

    var links = SE.$$('a', rail);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id.replace('area-', '');
        links.forEach(function (a) {
          a.setAttribute('aria-current', String(a.getAttribute('data-area') === id));
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    areas.forEach(function (a) {
      var el = SE.$('#area-' + a.id);
      if (el) io.observe(el);
    });
  }

  function initMasthead() {
    var mh = SE.$('#masthead');
    var rail = SE.$('#arearail');
    var hero = SE.$('.hero');
    if (!mh || !hero) return;
    var io = new IntersectionObserver(function (entries) {
      var past = !entries[0].isIntersecting;
      mh.classList.toggle('is-stuck', past);
      if (rail) rail.classList.toggle('is-on', past);
    }, { threshold: 0, rootMargin: '-72px 0px 0px 0px' });
    io.observe(hero);
  }

  /* ================================================================ stage */
  var stage = { el: null, mount: null, current: null, mode: null, instance: null, lastTrigger: null };

  function initStage() {
    stage.el = SE.$('#stage');
    stage.mount = SE.$('#stage-mount');

    SE.$('#stage-close').addEventListener('click', function () { closeStage(); });
    SE.$('#stage-prev').addEventListener('click', function () { stepStage(-1); });
    SE.$('#stage-next').addEventListener('click', function () { stepStage(1); });
    SE.$('#stage-copy').addEventListener('click', function () {
      if (stage.current) shell.copyPrompt(stage.current);
    });

    SE.$('#stage-dots').addEventListener('click', function (e) {
      var b = e.target.closest('[data-goto]');
      if (b) goStage(b.getAttribute('data-goto'));
    });

    stage.el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        /* Concepts handle Escape for their own selection first; only close the
           stage if nothing inside consumed it. */
        if (!e.defaultPrevented &&
            !stage.el.querySelector('.detail.is-on, .kinetic__focus.is-on')) {
          closeStage();
        }
        return;
      }
      if (e.key !== 'Tab') return;
      var f = focusables(stage.el);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function focusables(root) {
    return SE.$$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', root)
      .filter(function (n) {
        return !n.disabled && (n.offsetParent !== null || n.closest('.sr-only'));
      });
  }

  SE.stageAccent = function (hex) {
    if (stage.el) stage.el.style.setProperty('--c-accent', hex);
  };

  function setInert(v) {
    ['main', 'footer', '#masthead', '#arearail'].forEach(function (sel) {
      var n = SE.$(sel);
      if (!n) return;
      if ('inert' in HTMLElement.prototype) n.inert = v;
      else n.setAttribute('aria-hidden', String(v));
    });
  }

  /* The faux page a section concept is judged inside. A section evaluated on a
     blank stage is a page concept wearing a different label. */
  function buildPageFrame() {
    var frame = SE.el('div', 'pageframe');
    /* Belt and braces: if a Lenis instance is ever live at the same time as
       the stage, this attribute makes it ignore wheel events over the frame. */
    frame.setAttribute('data-lenis-prevent', '');
    frame.innerHTML =
      '<section class="pageframe__block">' +
        '<span class="pageframe__tag">Preceding section</span>' +
        '<h3>The section above ends here, and the one you are judging begins below.</h3>' +
        '<p>This block exists so the concept can be seen with a neighbour. Scroll into the ' +
        'concept, through it, and out the other side. If it traps you, holds the scroll ' +
        'hostage, or refuses to hand off, it is not a section.</p>' +
      '</section>' +
      '<div class="pageframe__mount"></div>' +
      '<section class="pageframe__block">' +
        '<span class="pageframe__tag">Following section</span>' +
        '<h3>And the page continues, as if nothing unusual had happened.</h3>' +
        '<p>Arriving here calmly, with scroll momentum intact, is most of what separates a ' +
        'section that belongs in a page from a set piece that was dropped into one.</p>' +
      '</section>';
    return frame;
  }

  function mountConcept(id, mode) {
    if (stage.instance) { stage.instance.destroy(); stage.instance = null; }
    stage.mount.innerHTML = '';
    stage.mount.className = 'stage__mount';

    var c = SE.get(id);
    if (!c) return;
    stage.current = id;
    stage.mode = mode || c.variant;

    var area = SE.AREAS.filter(function (a) { return a.id === c.area; })[0];
    SE.$('#stage-num').textContent = SE.pad(c.num);
    SE.$('#stage-name').textContent = c.name;
    SE.$('#stage-area').textContent = (area ? area.label : c.area) + ' / ' +
      (stage.mode === 'section' ? 'Section' : 'Full page');
    SE.$('#stage-hint').innerHTML = c.hint || '';
    SE.stageAccent(c.accent);

    /* Peer dots address the concept's own group, so prev/next never jumps
       between a page gallery and a section gallery mid-browse. */
    var peers = SE.list(c.area, c.variant);
    SE.$('#stage-dots').innerHTML = peers.map(function (p) {
      return '<button type="button" data-goto="' + p.id + '" aria-current="' + (p.id === id) +
             '" aria-label="' + SE.pad(p.num) + ' ' + p.name + '"></button>';
    }).join('');

    if (stage.mode === 'section') {
      var frame = buildPageFrame();
      stage.mount.appendChild(frame);
      var host = SE.$('.pageframe__mount', frame);
      stage.instance = c.mount(host, {
        mode: 'section',
        scroller: frame,
        onSeeMore: function () { seeMore(c); }
      });
    } else {
      stage.mount.appendChild(SE.el('div', 'stage__page'));
      stage.instance = c.mount(SE.$('.stage__page', stage.mount), {
        mode: 'page',
        scroller: null,
        onSeeMore: function () {}
      });
    }

    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  /* "See more" resolution, in priority order:
     1. the concept declares it implements both modes  -> re-mount itself
     2. the concept names its page counterpart         -> open that
     3. same-numbered page concept in the same area    -> open that
     A section with nowhere to go is a dead end, so the fallback always
     resolves to something. */
  function seeMore(c) {
    if (c.dual) { transitionTo(c.id, 'page'); return; }
    if (c.pageOf && SE.get(c.pageOf)) { transitionTo(c.pageOf, 'page'); return; }
    var pair = SE.list(c.area, 'page').filter(function (p) { return p.num === c.num; })[0];
    if (pair) { transitionTo(pair.id, 'page'); return; }
    var any = SE.list(c.area, 'page')[0];
    if (any) transitionTo(any.id, 'page');
  }

  function transitionTo(id, mode) {
    wipe(function () {
      mountConcept(id, mode);
      history.replaceState(null, '', hashFor(id, mode));
    });
  }

  function hashFor(id, mode) {
    return '#/c/' + id + (mode === 'section' ? '' : '/full');
  }

  function openStage(id, trigger, mode) {
    var c = SE.get(id);
    if (!c) return;
    if (stage.el.classList.contains('is-open')) { goStage(id, mode); return; }

    stage.lastTrigger = trigger || document.activeElement;
    document.body.classList.add('stage-open');
    SE.pausePreviews(true);
    killLenis();

    wipe(function () {
      stage.el.classList.add('is-open');
      setInert(true);
      mountConcept(id, mode);
      var h = hashFor(id, mode || c.variant);
      if (location.hash !== h) history.pushState(null, '', h);
    }, function () {
      SE.$('#stage-close').focus({ preventScroll: true });
    });
  }

  function goStage(id, mode) {
    var c = SE.get(id);
    if (!c || (id === stage.current && (mode || c.variant) === stage.mode)) return;
    transitionTo(id, mode || c.variant);
  }

  function stepStage(dir) {
    var c = SE.get(stage.current);
    if (!c) return;
    var peers = SE.list(c.area, c.variant);
    var i = peers.map(function (p) { return p.id; }).indexOf(c.id);
    if (i < 0) return;
    goStage(peers[(i + dir + peers.length) % peers.length].id, stage.mode);
  }

  function closeStage() {
    if (!stage.el.classList.contains('is-open')) return;
    wipe(function () {
      if (stage.instance) { stage.instance.destroy(); stage.instance = null; }
      stage.el.classList.remove('is-open');
      stage.current = null;
      stage.mode = null;
      setInert(false);
      document.body.classList.remove('stage-open');
      SE.pausePreviews(false);
      initLenis();
      history.replaceState(null, '', location.pathname + location.search);
    }, function () {
      if (stage.lastTrigger && document.contains(stage.lastTrigger)) {
        stage.lastTrigger.focus({ preventScroll: true });
      }
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  }

  shell.open = openStage;
  shell.close = closeStage;

  /* ---------------------------------------------------------------- router */
  function routeFromHash() {
    var m = (location.hash || '').match(/^#\/c\/([A-Za-z0-9_-]+)(\/full)?/);
    if (m && SE.get(m[1])) {
      var mode = m[2] ? 'page' : SE.get(m[1]).variant;
      if (stage.current !== m[1] || stage.mode !== mode) openStage(m[1], null, mode);
    } else if (stage.el && stage.el.classList.contains('is-open')) {
      closeStage();
    }
  }

  /* ------------------------------------------------------------ delegation */
  function initDelegation() {
    document.addEventListener('click', function (e) {
      var open = e.target.closest('[data-open], [data-open-concept]');
      if (open) {
        e.preventDefault();
        openStage(open.getAttribute('data-open') || open.getAttribute('data-open-concept'), open);
        return;
      }
      var copy = e.target.closest('[data-copy]');
      if (copy) {
        e.preventDefault();
        e.stopPropagation();
        shell.copyPrompt(copy.getAttribute('data-copy'));
        return;
      }
      var to = e.target.closest('[data-scroll-to]');
      if (to) {
        e.preventDefault();
        var target = SE.$(to.getAttribute('data-scroll-to'));
        if (!target) return;
        if (lenis) lenis.scrollTo(target, { offset: -20 });
        else target.scrollIntoView({ behavior: env.reduced ? 'auto' : 'smooth' });
      }
    });

    window.addEventListener('hashchange', routeFromHash);
    window.addEventListener('popstate', routeFromHash);
  }

  /* ------------------------------------------------------------------ boot */
  shell.boot = function () {
    initLenis();
    buildHeroIndex();
    initHeroCanvas();
    buildGalleries();
    initMasthead();
    initStage();
    initDelegation();

    /* Fonts land after first paint and the hero words are measured against a
       masked line box, so wait for them before running the reveal. */
    var start = function () { uncover(heroEntry); routeFromHash(); };
    if (document.fonts && document.fonts.ready) {
      var fired = false;
      var go = function () { if (!fired) { fired = true; start(); } };
      document.fonts.ready.then(go);
      setTimeout(go, 1200);          /* never let a font block the page */
    } else {
      start();
    }

    SE.onEnvChange(function () {
      if (env.reduced) killLenis(); else if (!stage.el.classList.contains('is-open')) initLenis();
    });
  };

})(window.SE = window.SE || {});

/* ============================================================================
   CONCEPT 02  -  REEL
   ----------------------------------------------------------------------------
   The stack as a cut sequence. Each layer is a scene with its own colour grade,
   and scrolling is the edit: you pan laterally through the reel while the
   current scene's contents cut in.

   WHY SCROLLTRIGGER HERE
   ----------------------
   This is the one concept whose meaning IS the scroll position - the sequence
   is the argument. A scrubbed, position-locked pan is exactly what ScrollTrigger
   exists for. It is deliberately NOT used in the other five, where scroll would
   have been a decoration bolted onto an interaction that already works.

   MOBILE IS A DIFFERENT EDIT, NOT A SMALLER ONE
   ---------------------------------------------
   Lateral panning on a 390px screen is a bad edit: the type has nowhere to go.
   Under 768px the reel becomes a vertical cut with scroll-snap, wired through
   gsap.matchMedia so crossing the breakpoint reverts and rebuilds cleanly.
   ========================================================================== */
(function (SE) {
  'use strict';

  var concept = {
    id: 'reel',
    num: 2,
    name: 'Reel',
    kind: 'Scroll-driven / GSAP',
    accent: '#FF6A3D',
    tagline: 'The stack as a cut sequence',
    desc: 'Six scenes, six colour grades, one lateral pan. Scroll is the edit: the reel moves, ' +
          'the scene cuts, the layer states its case and hands over.',
    interaction: 'Scroll to pan the reel. Each scene grades the frame and cuts its contents in. Click a chapter to jump.',
    hint: 'Scroll to pan &middot; Click a chapter to jump',

    mount: function (root) {
      var env = SE.env, D = SE.DATA, M = SE.math;
      var gsap = window.gsap;
      var hasST = !!(gsap && window.ScrollTrigger);
      if (hasST) gsap.registerPlugin(window.ScrollTrigger);

      var n = D.categories.length;

      /* ------------------------------------------------------------ DOM */
      root.classList.add('reel');

      var bars = SE.el('div', 'reel__bars');
      bars.innerHTML = '<span></span><span></span>';
      root.appendChild(bars);

      var grade = SE.el('div', 'reel__grade');
      root.appendChild(grade);

      var scroller = SE.el('div', 'reel__scroller');
      var rail = SE.el('div', 'reel__rail');
      var sticky = SE.el('div', 'reel__sticky');
      var track = SE.el('div', 'reel__track');

      D.categories.forEach(function (cat, i) {
        var scene = SE.el('section', 'reel__scene');
        scene.style.setProperty('--c-accent', cat.accent);
        scene.setAttribute('aria-label', 'Scene ' + SE.pad(i + 1) + ', ' + cat.label);

        var rows = cat.skills.map(function (s, si) {
          return '<li class="reel__row" style="--i:' + si + '">' +
                   '<span class="reel__rowname">' + s.name + '</span>' +
                   '<span class="reel__rowrole">' + s.role + '</span>' +
                   '<span class="reel__rowyr t-num">' + s.years + ' yr</span>' +
                 '</li>';
        }).join('');

        scene.innerHTML =
          '<div class="reel__plate t-num" aria-hidden="true">' + SE.pad(i + 1) + '</div>' +
          '<div class="reel__body">' +
            '<p class="reel__slate t-num">SC ' + SE.pad(i + 1) + ' / ' + SE.pad(n) + '<i></i>' + cat.layer.toUpperCase() + '</p>' +
            '<h3 class="reel__title">' + cat.label + '</h3>' +
            '<p class="reel__kicker">' + cat.kicker + '</p>' +
            '<p class="reel__blurb">' + cat.blurb + '</p>' +
            '<ul class="reel__rows">' + rows + '</ul>' +
          '</div>';

        track.appendChild(scene);
      });

      sticky.appendChild(track);
      rail.appendChild(sticky);
      scroller.appendChild(rail);
      root.appendChild(scroller);

      /* chapter rail -------------------------------------------------- */
      var chapters = SE.el('div', 'reel__chapters');
      chapters.innerHTML =
        '<span class="reel__tc t-num" aria-hidden="true">01 / ' + SE.pad(n) + '</span>' +
        '<div class="reel__ticks">' +
          D.categories.map(function (c, i) {
            return '<button type="button" data-ch="' + i + '" aria-label="Jump to scene ' +
                   SE.pad(i + 1) + ', ' + c.label + '"><i style="--h:' + c.accent + '"></i>' +
                   '<em>' + c.label + '</em></button>';
          }).join('') +
        '</div>' +
        '<div class="reel__progress"><span></span></div>';
      root.appendChild(chapters);

      var tc = SE.$('.reel__tc', chapters);
      var progressBar = SE.$('.reel__progress span', chapters);
      var tickBtns = SE.$$('button', chapters);
      var scenes = SE.$$('.reel__scene', track);
      var plates = scenes.map(function (s) { return SE.$('.reel__plate', s); });

      root.appendChild(SE.hintStrip(
        '<span>Scroll &mdash; pan the reel</span><span>Click a chapter &mdash; jump</span>'
      ));

      /* ------------------------------------------------------- sizing */
      function sizeVh() {
        var h = scroller.clientHeight;
        root.style.setProperty('--vh', h + 'px');
        root.style.setProperty('--n', n);
      }
      sizeVh();

      var ro = new ResizeObserver(function () {
        sizeVh();
        if (hasST) window.ScrollTrigger.refresh();
      });
      ro.observe(root);

      /* ------------------------------------------------------ activation */
      var active = -1;

      function setActive(i) {
        if (i === active) return;
        active = i;
        scenes.forEach(function (s, k) { s.classList.toggle('is-live', k === i); });
        tickBtns.forEach(function (b, k) { b.setAttribute('aria-current', String(k === i)); });
        var cat = D.categories[i];
        root.style.setProperty('--c-accent', cat.accent);
        grade.style.setProperty('--g', cat.accent);
        if (tc) tc.textContent = SE.pad(i + 1) + ' / ' + SE.pad(n);
        SE.stageAccent && SE.stageAccent(cat.accent);
      }
      setActive(0);

      /* -------------------------------------------------- choreography */
      var mm = null, st = null;

      function wireHorizontal() {
        var maxX = function () {
          return Math.max(0, track.scrollWidth - sticky.clientWidth);
        };

        var tween = gsap.to(track, {
          x: function () { return -maxX(); },
          ease: 'none',
          scrollTrigger: {
            scroller: scroller,
            trigger: rail,
            start: 'top top',
            end: 'bottom bottom',
            scrub: env.reduced ? true : 0.85,
            invalidateOnRefresh: true,
            onUpdate: function (self) { onProgress(self.progress); }
          }
        });
        st = tween.scrollTrigger;
        onProgress(0);
      }

      function onProgress(p) {
        if (progressBar) progressBar.style.transform = 'scaleX(' + p + ')';
        var pos = p * (n - 1);
        setActive(M.clamp(Math.round(pos), 0, n - 1));

        /* Scrubbed counter-parallax on each scene plate: the giant numeral
           drifts against the pan, which is what makes a lateral move read as
           depth rather than as a slide. Direct transform writes, six per
           frame, so nothing recalculates styles for a subtree. */
        if (env.reduced) return;
        for (var i = 0; i < plates.length; i++) {
          var d = M.clamp(pos - i, -1.4, 1.4);
          plates[i].style.transform = 'translate3d(' + (d * 26).toFixed(2) + '%,0,0)';
        }
      }

      function wireVertical() {
        /* No scrub: a vertical cut wants discrete arrivals, not a smear. */
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var i = scenes.indexOf(e.target);
            if (i >= 0) setActive(i);
          });
        }, { root: scroller, threshold: 0.55 });
        scenes.forEach(function (s) { io.observe(s); });

        var onScroll = function () {
          var p = scroller.scrollTop / Math.max(1, scroller.scrollHeight - scroller.clientHeight);
          if (progressBar) progressBar.style.transform = 'scaleX(' + p + ')';
        };
        scroller.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        return function () {
          io.disconnect();
          scroller.removeEventListener('scroll', onScroll);
        };
      }

      var teardownVertical = null;

      if (hasST) {
        mm = gsap.matchMedia();
        mm.add('(min-width: 768px)', function () {
          root.classList.add('is-horizontal');
          wireHorizontal();
          return function () { root.classList.remove('is-horizontal'); st = null; };
        });
        mm.add('(max-width: 767px)', function () {
          teardownVertical = wireVertical();
          return function () { if (teardownVertical) teardownVertical(); teardownVertical = null; };
        });
      } else {
        teardownVertical = wireVertical();
      }

      /* ------------------------------------------------------- chapters */
      chapters.addEventListener('click', function (e) {
        var b = e.target.closest('[data-ch]');
        if (!b) return;
        var i = parseInt(b.getAttribute('data-ch'), 10);
        var max = scroller.scrollHeight - scroller.clientHeight;
        var top = (i / (n - 1)) * max;
        if (root.classList.contains('is-horizontal')) {
          scroller.scrollTo({ top: top, behavior: env.reduced ? 'auto' : 'smooth' });
        } else {
          scenes[i].scrollIntoView({ behavior: env.reduced ? 'auto' : 'smooth', block: 'start' });
        }
      });

      /* Keyboard: the reel is a sequence, so arrows should move by scene. */
      function onKey(e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        if (!root.contains(document.activeElement) && document.activeElement !== document.body) return;
        var dir = e.key === 'ArrowDown' ? 1 : -1;
        var next = M.clamp(active + dir, 0, n - 1);
        if (next === active) return;
        e.preventDefault();
        tickBtns[next].click();
      }
      window.addEventListener('keydown', onKey);

      /* ------------------------------------------------------ entrance */
      if (gsap && !env.reduced) {
        gsap.fromTo(bars.children,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 });
        gsap.fromTo(scenes[0].querySelector('.reel__body'),
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.15 });
      }

      return {
        destroy: function () {
          window.removeEventListener('keydown', onKey);
          ro.disconnect();
          if (mm) mm.revert();
          if (teardownVertical) teardownVertical();
          if (st) st.kill();
          if (window.ScrollTrigger) {
            window.ScrollTrigger.getAll().forEach(function (t) {
              if (t.scroller === scroller) t.kill();
            });
          }
          if (gsap) gsap.killTweensOf(track);
          root.classList.remove('reel', 'is-horizontal');
          root.innerHTML = '';
        }
      };
    }
  };

  (SE.concepts = SE.concepts || {})[concept.id] = concept;
})(window.SE = window.SE || {});

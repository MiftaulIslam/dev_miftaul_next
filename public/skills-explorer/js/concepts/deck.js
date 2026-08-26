/* ============================================================================
   CONCEPT 05  -  DECK
   ----------------------------------------------------------------------------
   A physical stack you flick through. CSS 3D, a hand-written momentum model,
   rubber-banding at the ends, cursor-tracked tilt with a specular sheen, and an
   expand that turns the front card into the detail view rather than opening a
   modal next to it.

   WHY THE PHYSICS ARE HAND-WRITTEN
   --------------------------------
   GSAP's inertia plugin is a paid Club plugin, and a spring here is about
   fifteen lines. Velocity is captured on release, decays with friction, then a
   critically-ish damped spring pulls to the nearest whole card. Because it is
   one continuous `pos` value, a new grab mid-flight simply takes over - the
   motion is interruptible by construction instead of by special-casing.
   ========================================================================== */
(function (SE) {
  'use strict';

  var concept = {
    id: 'deck',
    num: 5,
    name: 'Deck',
    kind: 'CSS 3D / drag physics',
    accent: '#FFB020',
    tagline: 'A stack you can pick up',
    desc: 'Cards with real depth, real momentum, and real resistance at the ends. Switching layers ' +
          'deals a new hand; opening a card expands the card itself.',
    interaction: 'Drag or flick to move through the deck. Tilt follows the cursor. Click the front card to expand it.',
    hint: 'Drag to flick &middot; Click the front card',

    mount: function (root) {
      var env = SE.env, M = SE.math, D = SE.DATA;

      root.classList.add('deck');

      /* ------------------------------------------------------------ DOM */
      var tabs = SE.el('div', 'deck__tabs');
      tabs.setAttribute('role', 'tablist');
      tabs.setAttribute('aria-label', 'Stack layers');
      tabs.innerHTML = D.categories.map(function (c, i) {
        return '<button type="button" role="tab" data-cat="' + i + '" ' +
               'aria-selected="' + (i === 0) + '" style="--c-accent:' + c.accent + '">' +
               '<i class="t-num">' + SE.pad(i + 1) + '</i>' + c.label + '</button>';
      }).join('');
      root.appendChild(tabs);

      var stage = SE.el('div', 'deck__stage');
      var plane = SE.el('div', 'deck__plane');
      stage.appendChild(plane);
      root.appendChild(stage);

      var counter = SE.el('div', 'deck__counter');
      counter.innerHTML = '<span class="t-num" data-cur>01</span><i></i><span class="t-num" data-tot>06</span>';
      root.appendChild(counter);

      root.appendChild(SE.hintStrip(
        '<span>Drag &mdash; flick</span><span>Click &mdash; expand</span><span><kbd>&larr;</kbd><kbd>&rarr;</kbd> step</span>'
      ));

      var curOut = SE.$('[data-cur]', counter);
      var totOut = SE.$('[data-tot]', counter);

      /* ----------------------------------------------------------- state */
      var catIndex = 0;
      var cards = [];
      var pos = 0, posVel = 0, target = 0;
      var dragging = false, dragStart = 0, posStart = 0, lastX = 0, lastT = 0;
      var tiltX = 0, tiltY = 0, tiltTX = 0, tiltTY = 0;
      var expanded = false;
      var swapping = false;

      function skills() { return D.categories[catIndex].skills; }

      function buildCards() {
        plane.innerHTML = '';
        cards = skills().map(function (s, i) {
          var el = SE.el('article', 'deck__card');
          el.style.setProperty('--c-accent', s.accent);
          el.style.setProperty('--i', i);
          el.setAttribute('tabindex', '-1');
          el.setAttribute('aria-label', s.name + '. ' + s.role);

          var art = s.iconSrc
            ? '<img src="' + s.iconSrc + '" alt="" loading="lazy" onerror="this.remove()">'
            : '<span class="deck__mono">' + s.monogram + '</span>';

          el.innerHTML =
            '<header class="deck__cardtop">' +
              '<span class="t-num">' + SE.pad(i + 1) + ' / ' + SE.pad(skills().length) + '</span>' +
              '<span>' + s.categoryLabel + '</span>' +
            '</header>' +
            '<div class="deck__art">' + art + '</div>' +
            '<h3 class="deck__name">' + s.name + '</h3>' +
            '<p class="deck__role">' + s.role + '</p>' +
            '<div class="deck__more">' +
              '<p class="deck__note">' + s.note + '</p>' +
              '<p class="deck__rel">' +
                (D.related(s.id, 5).map(function (r) { return '<span>' + r.name + '</span>'; }).join('') || '<span>Standalone</span>') +
              '</p>' +
            '</div>' +
            '<footer class="deck__cardfoot t-num">' + s.years + ' YR</footer>' +
            '<div class="deck__sheen" aria-hidden="true"></div>';

          plane.appendChild(el);
          return { el: el, skill: s, d: 99 };
        });
        totOut.textContent = SE.pad(cards.length);
        pos = 0; posVel = 0; target = 0;
        layout(true);
      }

      /* ----------------------------------------------------------- layout */
      function layout(force) {
        var n = cards.length;
        for (var i = 0; i < n; i++) {
          var c = cards[i];
          var d = i - pos;
          if (!force && Math.abs(d - c.d) < 0.0015) continue;
          c.d = d;

          var ad = Math.abs(d);
          var vis = ad < 4.2;
          c.el.style.visibility = vis ? '' : 'hidden';
          if (!vis) continue;

          var depth = expanded ? 210 : 128;
          var tx = d * (expanded ? 46 : 30);
          var tz = -ad * depth;
          var ty = ad * (expanded ? 4 : 12);
          var ry = d * -7.5;
          var sc = expanded && ad < 0.5 ? 1.06 : 1;
          var op = M.clamp(1 - ad * 0.26, 0, 1);

          c.el.style.transform =
            'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,' + tz.toFixed(2) + 'px)' +
            ' rotateY(' + ry.toFixed(2) + 'deg) scale(' + sc + ')';
          c.el.style.opacity = op.toFixed(3);
          c.el.style.zIndex = String(200 - Math.round(ad * 10));
          c.el.classList.toggle('is-front', ad < 0.5);
          c.el.setAttribute('aria-hidden', ad < 0.5 ? 'false' : 'true');
          c.el.setAttribute('tabindex', ad < 0.5 ? '0' : '-1');
        }
        var idx = M.clamp(Math.round(pos), 0, n - 1);
        curOut.textContent = SE.pad(idx + 1);
      }

      /* --------------------------------------------------------- physics */
      function clampPos(p) {
        var n = cards.length - 1;
        /* Rubber band: past the ends the deck still moves, at a third of the
           rate, which is the entire reason the ends feel like ends. */
        if (p < 0) return p * 0.34;
        if (p > n) return n + (p - n) * 0.34;
        return p;
      }

      function tick(dt) {
        tiltX = M.damp(tiltX, tiltTX, 7, dt);
        tiltY = M.damp(tiltY, tiltTY, 7, dt);
        plane.style.transform = 'rotateX(' + tiltX.toFixed(2) + 'deg) rotateY(' + tiltY.toFixed(2) + 'deg)';

        if (dragging) { layout(); return; }

        var n = cards.length - 1;
        var settled = Math.abs(posVel) < 0.0015 && Math.abs(pos - target) < 0.0015;
        if (settled) return;

        if (env.reduced) { pos = target; posVel = 0; layout(); return; }

        /* momentum first, then a spring toward the nearest card */
        posVel *= Math.pow(0.0025, dt);
        var t = M.clamp(Math.round(pos + posVel * 0.16), 0, n);
        target = t;
        var k = 118, damp = 19;
        var acc = (target - pos) * k - posVel * damp;
        posVel += acc * dt;
        pos += posVel * dt;
        if (Math.abs(posVel) < 0.0015 && Math.abs(pos - target) < 0.0015) { pos = target; posVel = 0; }
        layout();
      }
      SE.ticker.add(tick);

      /* ------------------------------------------------------ interaction */
      function onDown(e) {
        if (e.target.closest('.deck__tabs')) return;
        dragging = true;
        dragStart = e.clientX;
        posStart = pos;
        lastX = e.clientX;
        lastT = performance.now();
        posVel = 0;
        root.classList.add('is-dragging');
        SE.cursor && SE.cursor.grab(true);
        stage.setPointerCapture && e.pointerId != null && stage.setPointerCapture(e.pointerId);
      }

      function onMove(e) {
        var r = stage.getBoundingClientRect();
        if (!env.reduced) {
          tiltTY = M.clamp(((e.clientX - r.left) / r.width - 0.5) * 13, -7, 7);
          tiltTX = M.clamp(-((e.clientY - r.top) / r.height - 0.5) * 9, -5, 5);
        }

        var front = cards[M.clamp(Math.round(pos), 0, cards.length - 1)];
        if (front) {
          var fr = front.el.getBoundingClientRect();
          front.el.style.setProperty('--mx', ((e.clientX - fr.left) / fr.width * 100).toFixed(1) + '%');
          front.el.style.setProperty('--my', ((e.clientY - fr.top) / fr.height * 100).toFixed(1) + '%');
        }

        if (!dragging) return;
        var now = performance.now();
        var dt = Math.max(1, now - lastT) / 1000;
        var dxStep = e.clientX - lastX;
        lastX = e.clientX; lastT = now;
        posVel = M.clamp(-dxStep / 250 / dt, -14, 14);
        pos = clampPos(posStart - (e.clientX - dragStart) / 250);
      }

      function onUp() {
        if (!dragging) return;
        dragging = false;
        root.classList.remove('is-dragging');
        SE.cursor && SE.cursor.grab(false);
      }

      stage.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      stage.addEventListener('pointerleave', function () {
        tiltTX = 0; tiltTY = 0;
      });

      /* click-to-expand, but only when the pointer did not travel: a flick
         must never also open a card */
      var downX = 0;
      stage.addEventListener('pointerdown', function (e) { downX = e.clientX; });
      stage.addEventListener('click', function (e) {
        if (Math.abs(e.clientX - downX) > 6) return;
        var card = e.target.closest('.deck__card');
        if (!card || !card.classList.contains('is-front')) return;
        setExpanded(!expanded);
      });

      function setExpanded(v) {
        expanded = v;
        root.classList.toggle('is-expanded', v);
        layout(true);
      }

      function step(dir) {
        target = M.clamp(Math.round(pos) + dir, 0, cards.length - 1);
        posVel = 0;
        if (env.reduced) { pos = target; layout(); }
      }

      function onKey(e) {
        if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
        else if (e.key === 'Escape' && expanded) setExpanded(false);
        else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement &&
                 document.activeElement.classList.contains('deck__card')) {
          setExpanded(!expanded); e.preventDefault();
        }
      }
      window.addEventListener('keydown', onKey);

      root.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { posVel += e.deltaX * 0.006; }
      }, { passive: true });

      /* ----------------------------------------------------- category tabs */
      tabs.addEventListener('click', function (e) {
        var b = e.target.closest('[data-cat]');
        if (!b || swapping) return;
        var i = parseInt(b.getAttribute('data-cat'), 10);
        if (i === catIndex) return;
        SE.$$('[data-cat]', tabs).forEach(function (n, k) {
          n.setAttribute('aria-selected', String(k === i));
        });
        swapping = true;
        root.classList.add('is-swapping');
        root.style.setProperty('--c-accent', D.categories[i].accent);
        SE.stageAccent && SE.stageAccent(D.categories[i].accent);
        var delay = env.reduced ? 0 : 260;
        setTimeout(function () {
          catIndex = i;
          setExpanded(false);
          buildCards();
          root.classList.remove('is-swapping');
          swapping = false;
        }, delay);
      });

      root.style.setProperty('--c-accent', D.categories[0].accent);
      buildCards();

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
          window.removeEventListener('keydown', onKey);
          root.classList.remove('deck', 'is-dragging', 'is-expanded', 'is-swapping');
          root.innerHTML = '';
        }
      };
    }
  };

  (SE.concepts = SE.concepts || {})[concept.id] = concept;
})(window.SE = window.SE || {});

/* ============================================================================
   CONCEPT 04  -  KINETIC
   ----------------------------------------------------------------------------
   No containers. The technology names ARE the layout. Six bands of outlined
   display type drift at different speeds and directions; the whole field skews
   with input velocity; hovering fills a word and pushes its neighbours aside;
   clicking promotes it to the full frame through a measured FLIP.

   TYPE SCALE CARRIES THE DATA
   ---------------------------
   `weight` from data.js drives font-size, not a progress bar. A technology you
   have five years in is physically larger in the composition. That is the
   editorial way to say the same thing a percentage says, without the survey.
   ========================================================================== */
(function (SE) {
  'use strict';

  var concept = {
    id: 'kinetic',
    num: 4,
    name: 'Kinetic',
    kind: 'DOM / kinetic type',
    accent: '#ECECEF',
    tagline: 'Typography as the entire interface',
    desc: 'Six drifting bands of outlined display type. Depth comes from speed and scale, ' +
          'not from cards. Nothing on screen is a container.',
    interaction: 'Scroll or drag to shear the field. Hover to fill a word and displace its neighbours. Click to promote it to full frame.',
    hint: 'Scroll to shear &middot; Click a word to promote',

    mount: function (root) {
      var env = SE.env, M = SE.math, D = SE.DATA;
      var gsap = window.gsap;

      root.classList.add('kinetic');
      if (env.reduced) root.classList.add('is-static');

      /* ------------------------------------------------------------ DOM */
      var rail = SE.el('div', 'kinetic__rail');
      rail.innerHTML = D.categories.map(function (c, i) {
        return '<span data-rail="' + c.id + '"><i class="t-num">' + SE.pad(i + 1) + '</i>' + c.label + '</span>';
      }).join('');
      root.appendChild(rail);

      var field = SE.el('div', 'kinetic__field');
      root.appendChild(field);

      var rows = D.categories.map(function (cat, i) {
        var row = SE.el('div', 'kinetic__row');
        row.setAttribute('data-cat', cat.id);
        row.style.setProperty('--c-accent', cat.accent);

        var track = SE.el('div', 'kinetic__track');
        /* Two identical sets so the wrap is seamless: translate by -half and
           the second set is already exactly where the first one was. */
        for (var pass = 0; pass < 2; pass++) {
          cat.skills.forEach(function (s) {
            var w = SE.el('span', 'kinetic__word');
            w.setAttribute('data-skill', s.id);
            w.setAttribute('role', 'button');
            w.setAttribute('tabindex', pass === 0 ? '0' : '-1');
            w.setAttribute('aria-label', s.name + ', ' + cat.label + '. ' + s.role);
            if (pass === 1) w.setAttribute('aria-hidden', 'true');
            w.style.setProperty('--w', s.weight.toFixed(2));
            w.textContent = s.name;
            track.appendChild(w);
          });
        }

        row.appendChild(track);
        field.appendChild(row);

        return {
          cat: cat,
          el: row,
          track: track,
          dir: i % 2 === 0 ? -1 : 1,
          base: 16 + (i % 3) * 7,
          x: i % 2 === 0 ? 0 : -1,       /* -1 = start shifted, set on measure */
          half: 0,
          slow: 0
        };
      });

      var focusEl = SE.el('div', 'kinetic__focus');
      focusEl.innerHTML =
        '<button class="kinetic__focusclose iconbtn" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<div class="kinetic__focusword"></div>' +
        '<div class="kinetic__focusmeta">' +
          '<p class="kinetic__focuscat"></p>' +
          '<p class="kinetic__focusrole"></p>' +
          '<p class="kinetic__focusnote"></p>' +
          '<p class="kinetic__focusrel"></p>' +
        '</div>';
      root.appendChild(focusEl);

      root.appendChild(SE.hintStrip(
        '<span>Scroll &mdash; shear</span><span>Click &mdash; promote</span><span><kbd>Esc</kbd> back</span>'
      ));

      /* --------------------------------------------------------- measure */
      function measure() {
        rows.forEach(function (r) {
          r.half = r.track.scrollWidth / 2;
          if (r.x === -1 || r.x < -r.half || r.x > 0) r.x = r.dir < 0 ? 0 : -r.half;
        });
      }
      var ro = new ResizeObserver(measure);
      ro.observe(field);
      /* Fonts land after first paint; re-measure once they do. */
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
      measure();

      /* -------------------------------------------------------- velocity */
      var vel = 0, shear = 0, boost = 0;

      function addImpulse(d) {
        if (env.reduced) return;
        boost += M.clamp(d, -60, 60);
      }

      function onWheel(e) { addImpulse(e.deltaY * 0.55); }
      root.addEventListener('wheel', onWheel, { passive: true });

      var dragY = null, dragX = null;
      root.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.kinetic__word') || e.target.closest('button')) return;
        dragY = e.clientY; dragX = e.clientX;
        root.classList.add('is-dragging');
      });
      window.addEventListener('pointermove', onDrag, { passive: true });
      function onDrag(e) {
        if (dragY === null) return;
        addImpulse((dragY - e.clientY) * 1.6 + (dragX - e.clientX) * 0.8);
        dragY = e.clientY; dragX = e.clientX;
      }
      function endDrag() { dragY = null; dragX = null; root.classList.remove('is-dragging'); }
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);

      /* --------------------------------------------------------- hover */
      var hoverWord = null;

      function clearPush(track) {
        SE.$$('.kinetic__word', track).forEach(function (w) { w.style.transform = ''; });
      }

      function onOver(e) {
        var w = e.target.closest('.kinetic__word');
        if (w === hoverWord) return;

        if (hoverWord) {
          hoverWord.classList.remove('is-lit');
          clearPush(hoverWord.parentNode);
          var pr = rowOf(hoverWord); if (pr) pr.slow = 0;
        }
        hoverWord = w || null;
        SE.cursor && SE.cursor.label(w ? 'Promote' : '');

        if (!w) { setRail(null); return; }
        w.classList.add('is-lit');
        setRail(w.parentNode.parentNode.getAttribute('data-cat'));

        var r = rowOf(w);
        if (r) r.slow = 1;

        /* Magnetic wave: neighbours step aside, falling off with distance.
           Written once per hover change, not per frame. */
        if (env.reduced) return;
        var sibs = SE.$$('.kinetic__word', w.parentNode);
        var idx = sibs.indexOf(w);
        sibs.forEach(function (s, i) {
          if (s === w) return;
          var d = i - idx;
          var mag = Math.max(0, 1 - Math.abs(d) / 4);
          if (mag <= 0) { s.style.transform = ''; return; }
          s.style.transform = 'translate3d(' + (Math.sign(d) * mag * 26).toFixed(1) + 'px,0,0)';
        });
      }
      field.addEventListener('pointerover', onOver);
      field.addEventListener('pointerleave', function () { onOver({ target: root }); });

      function rowOf(wordEl) {
        var rowEl = wordEl.parentNode.parentNode;
        for (var i = 0; i < rows.length; i++) if (rows[i].el === rowEl) return rows[i];
        return null;
      }

      var railEls = SE.$$('[data-rail]', rail);
      function setRail(catId) {
        railEls.forEach(function (n) {
          n.classList.toggle('is-on', n.getAttribute('data-rail') === catId);
        });
      }

      /* ---------------------------------------------------- focus (FLIP) */
      var focused = null;
      var wordOut = SE.$('.kinetic__focusword', focusEl);

      function promote(wordEl) {
        var s = D.byId[wordEl.getAttribute('data-skill')];
        if (!s) return;
        focused = s;

        wordOut.textContent = s.name;
        focusEl.style.setProperty('--c-accent', s.accent);
        SE.$('.kinetic__focuscat', focusEl).textContent =
          SE.pad(D.categories.findIndex(function (c) { return c.id === s.category; }) + 1) + ' / ' + s.categoryLabel;
        SE.$('.kinetic__focusrole', focusEl).textContent = s.role + ' - ' + s.years + ' years in production';
        SE.$('.kinetic__focusnote', focusEl).textContent = s.note;
        var rel = D.related(s.id, 6);
        SE.$('.kinetic__focusrel', focusEl).textContent =
          rel.length ? 'Wired to ' + rel.map(function (r) { return r.name; }).join(', ') : 'Standalone';

        root.classList.add('is-focused');
        focusEl.classList.add('is-on');

        if (!gsap || env.reduced) { focusEl.style.opacity = 1; return; }

        /* Measured shared-element transition: read the word where it actually
           sits, then animate the promoted copy from that exact rect. */
        var from = wordEl.getBoundingClientRect();
        gsap.set(wordOut, { clearProps: 'transform' });
        var to = wordOut.getBoundingClientRect();
        var sc = to.width ? from.width / to.width : 0.2;
        var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        var dy = (from.top + from.height / 2) - (to.top + to.height / 2);

        gsap.fromTo(wordOut,
          { x: dx, y: dy, scale: sc, opacity: 0.2 },
          { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.82, ease: 'expo.out' });
        gsap.fromTo(focusEl, { opacity: 0 }, { opacity: 1, duration: 0.34, ease: 'power2.out' });
        gsap.fromTo(SE.$$('.kinetic__focusmeta > *', focusEl),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.055, ease: 'expo.out', delay: 0.26 });
        gsap.fromTo(rows.map(function (r) { return r.el; }),
          { opacity: 1 },
          { opacity: 0.06, duration: 0.5, ease: 'power2.out', stagger: 0.03 });
      }

      function demote() {
        if (!focused) return;
        focused = null;
        root.classList.remove('is-focused');
        if (!gsap || env.reduced) { focusEl.classList.remove('is-on'); resetRows(); return; }
        gsap.to(focusEl, {
          opacity: 0, duration: 0.28, ease: 'power2.in',
          onComplete: function () { focusEl.classList.remove('is-on'); focusEl.style.opacity = ''; }
        });
        resetRows();
      }

      function resetRows() {
        if (!gsap) { rows.forEach(function (r) { r.el.style.opacity = ''; }); return; }
        gsap.to(rows.map(function (r) { return r.el; }),
          { opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.03 });
      }

      field.addEventListener('click', function (e) {
        var w = e.target.closest('.kinetic__word');
        if (w) promote(w);
      });
      field.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var w = e.target.closest('.kinetic__word');
        if (!w) return;
        e.preventDefault();
        promote(w);
      });
      SE.$('.kinetic__focusclose', focusEl).addEventListener('click', demote);
      focusEl.addEventListener('click', function (e) {
        if (e.target === focusEl) demote();
      });

      function onKey(e) { if (e.key === 'Escape' && focused) demote(); }
      window.addEventListener('keydown', onKey);

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        if (env.reduced) return;

        /* One velocity value shears the whole field. Boost decays fast, the
           residual skew decays slower, which is what gives the field weight. */
        vel = M.damp(vel, boost, 9, dt);
        boost = M.damp(boost, 0, 3.4, dt);
        shear = M.damp(shear, M.clamp(vel * 0.055, -9, 9), 6, dt);

        var opacityLock = focused ? 0 : 1;

        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (!r.half) continue;
          var slowFactor = 1 - r.slow * 0.82;
          var speed = (r.base * slowFactor + vel * 0.9) * r.dir;
          r.x += speed * dt * opacityLock;
          if (r.x <= -r.half) r.x += r.half;
          if (r.x >= 0) r.x -= r.half;
          r.track.style.transform =
            'translate3d(' + r.x.toFixed(2) + 'px,0,0) skewX(' + (shear * (i % 2 ? -1 : 1) * 0.5).toFixed(2) + 'deg)';
        }
      }
      SE.ticker.add(tick);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          window.removeEventListener('keydown', onKey);
          window.removeEventListener('pointermove', onDrag);
          window.removeEventListener('pointerup', endDrag);
          window.removeEventListener('pointercancel', endDrag);
          ro.disconnect();
          if (gsap) gsap.killTweensOf([wordOut, focusEl].concat(rows.map(function (r) { return r.el; })));
          root.classList.remove('kinetic', 'is-static', 'is-focused', 'is-dragging');
          root.innerHTML = '';
        }
      };
    }
  };

  (SE.concepts = SE.concepts || {})[concept.id] = concept;
})(window.SE = window.SE || {});

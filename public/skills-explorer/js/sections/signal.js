/* ============================================================================
   SECTION S01  -  SIGNAL
   ----------------------------------------------------------------------------
   The stack read as an instrument trace. Scroll draws a waveform left to right;
   every technology is a peak whose height is its weight, every layer is a
   coloured run of the trace, and a playhead calls out what it is crossing.

   WHY THIS IS A SECTION AND NOT A PAGE
   ------------------------------------
   It consumes scroll rather than fighting it. The reader arrives, the trace
   draws itself as they keep scrolling at their own pace, and they leave. There
   is no state to return to and nothing to dismiss - which is exactly the
   contract a section inside a longer page has to honour.
   ========================================================================== */
(function (SE) {
  'use strict';

  var concept = {
    id: 'signal',
    num: 1,
    name: 'Signal',
    kind: 'Canvas / scrubbed trace',
    accent: '#4CC9F0',
    tagline: 'The stack as an instrument reading',
    desc: 'Scroll draws a single continuous trace across the section. Each technology is a peak, ' +
          'each layer a coloured run, and a playhead names what it crosses.',
    interaction: 'Scroll to draw the trace. The playhead calls out each technology as it passes. Hover the finished trace to read any peak.',
    hint: 'Scroll draws the trace',
    screens: 2.8,

    mount: function (root, ctx) {
      var env = SE.env, M = SE.math, D = SE.DATA;
      var isPage = ctx.mode === 'page';
      var skills = D.skills;
      var N = skills.length;

      root.classList.add('signal', isPage ? 'is-page' : 'is-section');

      /* ------------------------------------------------------------ DOM */
      var host, rail = null, scrubber = null;

      if (isPage) {
        host = SE.el('div', 'signal__stage');
        root.appendChild(host);
      } else {
        rail = SE.scrollRail(ctx.scroller, concept.screens);
        host = SE.el('div', 'signal__stage');
        rail.sticky.appendChild(host);
        root.appendChild(rail.rail);
      }

      var head = SE.el('div', 'signal__head');
      head.innerHTML =
        '<h2 class="signal__title">' + (isPage ? 'Every peak, in order' : 'One continuous reading') + '</h2>' +
        '<p class="signal__lede">' + (isPage
          ? 'The full trace, held still. Move across it to read any technology, or click a peak to open it.'
          : N + ' technologies across ' + D.categories.length +
            ' layers, drawn as one uninterrupted signal.') + '</p>';
      host.appendChild(head);

      var canvasEl = SE.el('canvas', 'signal__canvas');
      host.appendChild(canvasEl);

      var readout = SE.el('div', 'signal__readout');
      readout.setAttribute('role', 'status');
      readout.setAttribute('aria-live', 'polite');
      readout.innerHTML =
        '<span class="signal__rlayer"></span>' +
        '<strong class="signal__rname"></strong>' +
        '<span class="signal__rrole"></span>' +
        '<span class="signal__ryears t-num"></span>';
      host.appendChild(readout);

      var more = null;
      if (!isPage) {
        more = SE.seeMore('See the full trace', ctx.onSeeMore);
        more.classList.add('signal__more');
        host.appendChild(more);
      }

      host.appendChild(SE.srList('Signal: the stack as an instrument trace', skills, function (s) {
        setActive(s.index, true);
      }));

      /* --------------------------------------------------------- model */
      var cv = SE.canvas(canvasEl);
      var cvx = cv.ctx;
      var progress = isPage ? 1 : 0;
      var drawn = isPage ? 1 : 0;
      var activeIdx = -1;
      var hoverX = null;
      var sigma = 0.30 / N;   /* < half the peak spacing, so peaks read as peaks */

      /* Precompute the x position and category run of every peak once. */
      var peaks = skills.map(function (s, i) {
        return { s: s, x: (i + 0.55) / N, rgb: SE.hexToRgb(s.accent) };
      });
      var gates = [];
      D.categories.forEach(function (cat) {
        var first = peaks.find(function (p) { return p.s.category === cat.id; });
        if (first) gates.push({ cat: cat, x: first.x - 0.55 / N, rgb: SE.hexToRgb(cat.accent) });
      });

      function envelope(x) {
        var y = 0;
        /* Only peaks within 3 sigma can contribute, so walk a window rather
           than all 29 for every one of ~700 samples. */
        var lo = Math.max(0, Math.floor((x - sigma * 3.6) * N) - 1);
        var hi = Math.min(N - 1, Math.ceil((x + sigma * 3.6) * N) + 1);
        for (var i = lo; i <= hi; i++) {
          var d = (x - peaks[i].x) / sigma;
          y += peaks[i].s.weight * Math.exp(-0.5 * d * d);
        }
        return y;
      }

      function catAt(x) {
        var best = gates[0];
        for (var i = 0; i < gates.length; i++) if (gates[i].x <= x) best = gates[i];
        return best;
      }

      function nearestPeak(x) {
        var i = M.clamp(Math.round(x * N - 0.55), 0, N - 1);
        return i;
      }

      /* ----------------------------------------------------- interaction */
      function setActive(i, fromKeyboard) {
        if (i === activeIdx) return;
        activeIdx = i;
        var s = skills[i];
        if (!s) return;
        readout.style.setProperty('--c-accent', s.accent);
        SE.$('.signal__rlayer', readout).textContent = s.categoryLabel;
        SE.$('.signal__rname', readout).textContent = s.name;
        SE.$('.signal__rrole', readout).textContent = s.role;
        SE.$('.signal__ryears', readout).textContent = s.years + ' YR';
        readout.classList.add('is-on');
        if (fromKeyboard && isPage) hoverX = peaks[i].x;
      }

      if (isPage) {
        canvasEl.addEventListener('pointermove', function (e) {
          var r = canvasEl.getBoundingClientRect();
          hoverX = M.clamp((e.clientX - r.left) / r.width, 0, 1);
          setActive(nearestPeak(hoverX));
          SE.cursor && SE.cursor.label(skills[activeIdx] ? skills[activeIdx].name : '');
        }, { passive: true });
        canvasEl.addEventListener('pointerleave', function () {
          hoverX = null;
          SE.cursor && SE.cursor.label('');
        });
      }

      if (!isPage) {
        scrubber = SE.scrub(ctx.scroller, rail.rail, function (p) { progress = p; });
      }

      cv.observe(function () {});

      /* ------------------------------------------------------------ draw */
      function render() {
        cv.clear();
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4) return;

        var padX = w * (env.mobile ? 0.05 : 0.07);
        var innerW = w - padX * 2;
        var base = h * 0.74;
        var amp = h * (env.mobile ? 0.30 : 0.40);

        /* --- graticule ------------------------------------------------- */
        cvx.strokeStyle = 'rgba(236,236,239,0.05)';
        cvx.lineWidth = 1;
        for (var g = 0; g < 4; g++) {
          var gy = Math.round(base - (g / 3) * amp) + 0.5;
          cvx.beginPath();
          cvx.moveTo(padX, gy);
          cvx.lineTo(w - padX, gy);
          cvx.stroke();
        }

        /* --- layer gates ----------------------------------------------- */
        cvx.font = '500 9px "JetBrains Mono", monospace';
        cvx.textBaseline = 'alphabetic';
        gates.forEach(function (gate) {
          var gx = Math.round(padX + gate.x * innerW) + 0.5;
          var lit = drawn > gate.x;
          cvx.strokeStyle = 'rgba(' + gate.rgb.join(',') + ',' + (lit ? 0.34 : 0.09) + ')';
          cvx.beginPath();
          cvx.moveTo(gx, base - amp - h * 0.06);
          cvx.lineTo(gx, base + h * 0.05);
          cvx.stroke();
          cvx.fillStyle = 'rgba(' + gate.rgb.join(',') + ',' + (lit ? 0.9 : 0.24) + ')';
          cvx.textAlign = 'left';
          cvx.fillText(gate.cat.label.toUpperCase(), gx + 6, base - amp - h * 0.075);
        });

        /* --- baseline -------------------------------------------------- */
        cvx.strokeStyle = 'rgba(236,236,239,0.10)';
        cvx.beginPath();
        cvx.moveTo(padX, Math.round(base) + 0.5);
        cvx.lineTo(w - padX, Math.round(base) + 0.5);
        cvx.stroke();

        /* --- the trace, stroked as per-layer runs ----------------------- */
        var step = 1.6 / innerW;
        var x = 0;
        var run = null;
        cvx.lineWidth = env.mobile ? 1.4 : 1.8;
        cvx.lineJoin = 'round';
        cvx.lineCap = 'round';

        function flush() {
          if (!run) return;
          cvx.strokeStyle = 'rgba(' + run.rgb.join(',') + ',0.92)';
          cvx.stroke();
          run = null;
        }

        while (x <= drawn) {
          var c = catAt(x);
          if (!run || run.cat !== c) {
            flush();
            run = { cat: c, rgb: c.rgb };
            cvx.beginPath();
            var py0 = base - envelope(x) * amp;
            cvx.moveTo(padX + x * innerW, py0);
          }
          var e = envelope(x);
          /* Instrument noise only where the signal is quiet: a peak with a
             wobble on it reads as a rendering bug, a flat line without one
             reads as a chart. */
          var noise = (1 - Math.min(1, e)) * (Math.sin(x * 520) * 1.1 + Math.sin(x * 187) * 0.7);
          cvx.lineTo(padX + x * innerW, base - e * amp + noise);
          x += step;
        }
        flush();

        /* --- peak ticks and dots --------------------------------------- */
        peaks.forEach(function (p, i) {
          if (p.x > drawn) return;
          var px = padX + p.x * innerW;
          var py = base - envelope(p.x) * amp;
          var isActive = i === activeIdx;
          cvx.strokeStyle = 'rgba(' + p.rgb.join(',') + ',' + (isActive ? 0.5 : 0.16) + ')';
          cvx.lineWidth = 1;
          cvx.beginPath();
          cvx.moveTo(px, py);
          cvx.lineTo(px, base);
          cvx.stroke();

          cvx.beginPath();
          cvx.arc(px, py, isActive ? 4 : 2, 0, Math.PI * 2);
          cvx.fillStyle = isActive ? '#fff' : 'rgba(' + p.rgb.join(',') + ',0.85)';
          cvx.fill();
        });

        /* --- playhead --------------------------------------------------- */
        var phx = isPage ? (hoverX == null ? null : hoverX) : (drawn < 0.999 ? drawn : null);
        if (phx != null) {
          var lx = padX + phx * innerW;
          var ly = base - envelope(phx) * amp;
          cvx.strokeStyle = 'rgba(236,236,239,0.22)';
          cvx.lineWidth = 1;
          cvx.beginPath();
          cvx.moveTo(lx, base - amp - h * 0.06);
          cvx.lineTo(lx, base + h * 0.05);
          cvx.stroke();

          cvx.beginPath();
          cvx.arc(lx, ly, 9, 0, Math.PI * 2);
          cvx.fillStyle = 'rgba(255,255,255,0.14)';
          cvx.fill();
          cvx.beginPath();
          cvx.arc(lx, ly, 3.2, 0, Math.PI * 2);
          cvx.fillStyle = '#fff';
          cvx.fill();
        }
      }

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        /* Damp the drawn length toward scroll progress. A raw scrub value
           makes the trace stutter with the scrollbar; damping it makes the
           pen feel like it has mass. */
        var target = isPage ? 1 : progress;
        drawn = env.reduced ? target : M.damp(drawn, target, 7, dt);

        if (!isPage) {
          var i = nearestPeak(drawn);
          if (drawn > 0.01) setActive(i);
          if (more) more.classList.toggle('is-on', drawn > 0.80);
        }
        render();
      }
      SE.ticker.add(tick);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          if (scrubber) scrubber.kill();
          if (rail) rail.destroy();
          cv.destroy();
          root.classList.remove('signal', 'is-page', 'is-section');
          root.innerHTML = '';
        }
      };
    }
  };

  (SE.sections = SE.sections || {})[concept.id] = concept;
})(window.SE = window.SE || {});

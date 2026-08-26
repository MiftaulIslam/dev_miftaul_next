/* ============================================================================
   CONCEPT 06  -  STRATA
   ----------------------------------------------------------------------------
   The stack as an actual stack: six slabs in isometric space, in the order a
   request passes through them. A packet descends the spine, each slab it
   crosses fires, and a latency readout narrates the hop.

   THIS IS THE ONE THAT ARGUES
   ---------------------------
   The other five concepts present a set of technologies. This one presents an
   understanding of how they compose - which is the thing a senior engineer is
   actually hired for, and the thing a grid of logos can never say.

   MOBILE IS A DIFFERENT DIAGRAM
   -----------------------------
   An isometric slab stack in a 390px column is unreadable. Under 900px the
   same model renders as a vertical trace: bars on a rail, packet descending
   the rail. Identical data, identical narration, different drawing.
   ========================================================================== */
(function (SE) {
  'use strict';

  var concept = {
    id: 'strata',
    num: 6,
    name: 'Strata',
    kind: 'CSS 3D / system trace',
    accent: '#7C8BFF',
    tagline: 'The stack drawn as a stack',
    desc: 'Six slabs in the order a request crosses them. Send a request and watch it descend, ' +
          'fire each layer, and come back. The composition is the point.',
    interaction: 'Hover a slab to lift it out of the stack. Send a request to trace the path. Click to open a layer.',
    hint: 'Hover to lift &middot; Send a request to trace',

    mount: function (root) {
      var env = SE.env, M = SE.math, D = SE.DATA;
      var cats = D.categories;
      var n = cats.length;

      root.classList.add('strata');

      /* ------------------------------------------------------------ DOM */
      var scene = SE.el('div', 'strata__scene');
      var stack = SE.el('div', 'strata__stack');

      var spine = SE.el('div', 'strata__spine');
      stack.appendChild(spine);

      var layers = cats.map(function (cat, i) {
        var layer = SE.el('div', 'strata__layer');
        layer.style.setProperty('--z', i);
        layer.style.setProperty('--c-accent', cat.accent);
        layer.setAttribute('data-layer', String(i));

        /* chips sit in-plane: components on a board, deliberately unreadable
           as text and readable as density */
        var chips = cat.skills.map(function (s) {
          return '<i style="--w:' + s.weight.toFixed(2) + '"></i>';
        }).join('');

        layer.innerHTML =
          '<div class="strata__slab"><div class="strata__chips">' + chips + '</div></div>' +
          '<button type="button" class="strata__tag" aria-label="Open layer ' + cat.layer + '">' +
            '<i class="t-num">' + SE.pad(i + 1) + '</i>' +
            '<b>' + cat.layer + '</b>' +
            '<em class="t-num">' + SE.pad(cat.skills.length) + '</em>' +
          '</button>';

        stack.appendChild(layer);
        return { el: layer, cat: cat, tag: SE.$('.strata__tag', layer), slab: SE.$('.strata__slab', layer) };
      });

      var packet = SE.el('div', 'strata__packet');
      packet.setAttribute('aria-hidden', 'true');
      stack.appendChild(packet);

      scene.appendChild(stack);
      root.appendChild(scene);

      /* ------------------------------------------------------ side panel */
      var side = SE.el('aside', 'strata__side');
      side.innerHTML =
        '<p class="t-label" data-k="kicker"></p>' +
        '<h3 class="strata__sidename"></h3>' +
        '<p class="strata__sideblurb"></p>' +
        '<ul class="strata__list"></ul>';
      root.appendChild(side);

      /* --------------------------------------------------------- readout */
      var hud = SE.el('div', 'strata__hud');
      hud.innerHTML =
        '<button type="button" class="btn btn--sm" data-send>Send a request</button>' +
        '<div class="strata__trace t-num" role="status" aria-live="polite"><span data-hop>idle</span><em data-ms>0 ms</em></div>';
      root.appendChild(hud);

      root.appendChild(SE.hintStrip(
        '<span>Hover &mdash; lift a layer</span><span>Click &mdash; open it</span>'
      ));

      var hopOut = SE.$('[data-hop]', hud);
      var msOut = SE.$('[data-ms]', hud);
      var sendBtn = SE.$('[data-send]', hud);

      /* ----------------------------------------------------------- state */
      var active = 0;
      var hovered = -1;

      function setActive(i) {
        active = i;
        var cat = cats[i];
        layers.forEach(function (L, k) { L.el.classList.toggle('is-active', k === i); });
        SE.$('[data-k="kicker"]', side).textContent = SE.pad(i + 1) + ' / ' + cat.kicker;
        SE.$('.strata__sidename', side).textContent = cat.label;
        SE.$('.strata__sideblurb', side).textContent = cat.blurb;
        side.style.setProperty('--c-accent', cat.accent);
        SE.$('.strata__list', side).innerHTML = cat.skills.map(function (s, k) {
          return '<li style="--i:' + k + '"><span>' + s.name + '</span><em>' + s.role + '</em>' +
                 '<b class="t-num">' + s.years + '</b></li>';
        }).join('');
        SE.stageAccent && SE.stageAccent(cat.accent);
      }

      stack.addEventListener('pointerover', function (e) {
        var L = e.target.closest('[data-layer]');
        var i = L ? parseInt(L.getAttribute('data-layer'), 10) : -1;
        if (i === hovered) return;
        hovered = i;
        layers.forEach(function (l, k) { l.el.classList.toggle('is-lifted', k === hovered); });
        SE.cursor && SE.cursor.label(i >= 0 ? cats[i].layer : '');
      });
      stack.addEventListener('pointerleave', function () {
        hovered = -1;
        layers.forEach(function (l) { l.el.classList.remove('is-lifted'); });
        SE.cursor && SE.cursor.label('');
      });

      stack.addEventListener('click', function (e) {
        var L = e.target.closest('[data-layer]');
        if (!L) return;
        setActive(parseInt(L.getAttribute('data-layer'), 10));
      });

      function onKey(e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          var dir = e.key === 'ArrowDown' ? 1 : -1;
          var next = M.clamp(active + dir, 0, n - 1);
          if (next !== active) { setActive(next); e.preventDefault(); }
        }
      }
      window.addEventListener('keydown', onKey);

      /* ----------------------------------------------------------- trace */
      /* Synthetic but plausible per-hop cost. Labelled as a model in the HUD
         so it never reads as a measured benchmark. */
      var hopCost = [4, 11, 6, 19, 5, 42];

      var trace = { on: false, t: 0, dir: 1, hop: 0, ms: 0, idle: 0 };

      function hopDuration(i) { return env.reduced ? 0 : 0.34 + hopCost[i % hopCost.length] / 190; }

      function startTrace() {
        trace.on = true; trace.t = 0; trace.dir = 1; trace.hop = 0; trace.ms = 0;
        root.classList.add('is-tracing');
        if (env.reduced) { stepTraceInstant(); }
      }

      function stepTraceInstant() {
        /* Reduced motion: the explanation is still available, one hop per
           click, with no travel. */
        trace.hop = (trace.hop + 1) % n;
        trace.ms += hopCost[trace.hop];
        layers[trace.hop].el.classList.add('is-hit');
        setTimeout(function () { layers[trace.hop].el.classList.remove('is-hit'); }, 400);
        narrate(trace.hop);
        setPacket(trace.hop / (n - 1));
        if (trace.hop === n - 1) { trace.on = false; root.classList.remove('is-tracing'); }
      }

      function narrate(i) {
        hopOut.textContent = (cats[i] ? cats[i].layer.toUpperCase() : 'IDLE');
        msOut.textContent = Math.round(trace.ms) + ' ms';
      }

      function setPacket(p) {
        packet.style.setProperty('--pp', p.toFixed(4));
      }
      setPacket(0);

      sendBtn.addEventListener('click', function () {
        if (env.reduced) { if (!trace.on) startTrace(); else stepTraceInstant(); return; }
        startTrace();
      });

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        if (env.reduced) return;

        if (!trace.on) {
          trace.idle -= dt;
          if (trace.idle <= 0) { trace.idle = 7.5; startTrace(); }
          return;
        }

        var dur = hopDuration(trace.hop);
        trace.t += dt / Math.max(0.001, dur);

        if (trace.t >= 1) {
          trace.t = 0;
          layers[trace.hop].el.classList.add('is-hit');
          (function (idx) {
            setTimeout(function () { layers[idx].el.classList.remove('is-hit'); }, 380);
          })(trace.hop);
          trace.ms += hopCost[trace.hop] * (trace.dir > 0 ? 1 : 0.35);
          narrate(trace.hop);

          trace.hop += trace.dir;
          if (trace.hop >= n) { trace.hop = n - 1; trace.dir = -1; }
          else if (trace.hop < 0) {
            trace.hop = 0; trace.dir = 1; trace.on = false;
            root.classList.remove('is-tracing');
            hopOut.textContent = 'RESPONSE';
            setPacket(0);
            return;
          }
        }

        var from = M.clamp(trace.hop - trace.dir, 0, n - 1);
        var to = trace.hop;
        /* ease-in-out per hop: the packet accelerates out of a layer and
           decelerates into the next, which is what makes it read as travel
           between two places rather than a dot sliding on a rail */
        var e = trace.t < 0.5 ? 2 * trace.t * trace.t : 1 - Math.pow(-2 * trace.t + 2, 2) / 2;
        setPacket(M.lerp(from, to, e) / (n - 1));
      }
      SE.ticker.add(tick);

      setActive(0);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          window.removeEventListener('keydown', onKey);
          root.classList.remove('strata', 'is-tracing');
          root.innerHTML = '';
        }
      };
    }
  };

  (SE.concepts = SE.concepts || {})[concept.id] = concept;
})(window.SE = window.SE || {});

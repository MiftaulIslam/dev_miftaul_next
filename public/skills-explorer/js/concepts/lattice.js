/* ============================================================================
   CONCEPT 03  -  LATTICE
   ----------------------------------------------------------------------------
   The stack as a wiring diagram. Nodes are technologies, edges are real
   adjacencies from data.js, and hovering anything reveals its neighbourhood.
   The argument this concept makes is not "I know 29 things", it is "these 29
   things are one system and I know where the wires go".

   LAYOUT IS SOLVED ONCE, NOT EVERY FRAME
   --------------------------------------
   A live force simulation on 29 nodes never fully settles: it breathes, and
   breathing reads as instability, not as craft. The layout is relaxed for a
   fixed number of iterations at mount with a seeded PRNG - identical on every
   load - and the frame loop only applies a small idle drift, a parallax offset,
   and the highlight state. Deterministic, calm, and about 40x cheaper.
   ========================================================================== */
(function (SE) {
  'use strict';

  var TAU = Math.PI * 2;

  var concept = {
    id: 'lattice',
    num: 3,
    name: 'Lattice',
    kind: 'Canvas / graph',
    accent: '#3DDC97',
    tagline: 'The stack as a wiring diagram',
    desc: 'Every technology is a node, every adjacency is a wire. Signals travel the wires so ' +
          'the graph reads as a running system rather than a diagram of one.',
    interaction: 'Hover a node to light its neighbourhood and dim everything else. Click to lock the trace. Filter by layer.',
    hint: 'Hover to trace &middot; Click to lock',

    mount: function (root) {
      var env = SE.env, M = SE.math, D = SE.DATA;

      /* ------------------------------------------------------------ DOM */
      var canvasEl = SE.el('canvas', 'lattice__canvas');
      root.appendChild(canvasEl);

      var detail = SE.makeDetail();
      root.appendChild(detail.el);

      var legend = SE.el('div', 'lattice__legend');
      legend.innerHTML =
        '<span class="t-label">Layers</span>' +
        D.categories.map(function (c, i) {
          return '<button type="button" data-cat="' + c.id + '" style="--h:' + c.accent + '">' +
                 '<i></i>' + c.label + '</button>';
        }).join('');
      root.appendChild(legend);

      var readout = SE.el('div', 'lattice__readout');
      readout.innerHTML =
        '<span class="t-num" data-k="nodes">' + D.skills.length + '</span><em>nodes</em>' +
        '<span class="t-num" data-k="edges">' + D.edges.length + '</span><em>edges</em>' +
        '<span class="t-num" data-k="focus">--</span><em>traced</em>';
      root.appendChild(readout);
      var focusOut = SE.$('[data-k="focus"]', readout);

      root.appendChild(SE.hintStrip(
        '<span>Hover &mdash; trace</span><span>Click &mdash; lock</span><span><kbd>Esc</kbd> clear</span>'
      ));

      root.appendChild(SE.srList('Lattice: the stack as a connected graph', D.skills, function (s) {
        select(s.id);
      }));

      /* ------------------------------------------------ layout relaxation */
      var rand = SE.rng(19970518);
      var nodes = D.skills.map(function (s, i) {
        var a = (i / D.skills.length) * TAU;
        return {
          skill: s,
          /* seeded ring start converges faster and more evenly than pure noise */
          x: Math.cos(a) * 240 + (rand() - 0.5) * 60,
          y: Math.sin(a) * 240 + (rand() - 0.5) * 60,
          vx: 0, vy: 0,
          r: 3 + s.weight * 4.6,
          phase: rand() * TAU,
          rgb: SE.hexToRgb(s.accent),
          sx: 0, sy: 0,
          glow: 0, glowTarget: 0
        };
      });
      var nodeById = {};
      nodes.forEach(function (nd) { nodeById[nd.skill.id] = nd; });

      var links = D.edges.map(function (e) {
        return { a: nodeById[e.a.id], b: nodeById[e.b.id], strength: e.strength };
      });

      /* Category anchors on a hexagon: without them the graph collapses into
         one blob and the layer story disappears. */
      var anchors = {};
      D.categories.forEach(function (c, i) {
        var a = (i / D.categories.length) * TAU - Math.PI / 2;
        anchors[c.id] = { x: Math.cos(a) * 260, y: Math.sin(a) * 210 };
      });

      (function relax() {
        var ITER = 420;
        for (var it = 0; it < ITER; it++) {
          var cool = 1 - it / ITER;

          for (var i = 0; i < nodes.length; i++) {
            var a = nodes[i];
            for (var j = i + 1; j < nodes.length; j++) {
              var b = nodes[j];
              var dx = b.x - a.x, dy = b.y - a.y;
              var d2 = dx * dx + dy * dy || 0.01;
              var d = Math.sqrt(d2);
              var f = 5200 / d2;
              var ux = dx / d, uy = dy / d;
              a.vx -= ux * f; a.vy -= uy * f;
              b.vx += ux * f; b.vy += uy * f;
            }
          }

          for (var k = 0; k < links.length; k++) {
            var L = links[k];
            var dx2 = L.b.x - L.a.x, dy2 = L.b.y - L.a.y;
            var dd = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 0.01;
            var ideal = 116 - L.strength * 34;
            var fs = (dd - ideal) * 0.012 * L.strength;
            var ux2 = dx2 / dd, uy2 = dy2 / dd;
            L.a.vx += ux2 * fs; L.a.vy += uy2 * fs;
            L.b.vx -= ux2 * fs; L.b.vy -= uy2 * fs;
          }

          for (var m = 0; m < nodes.length; m++) {
            var nd = nodes[m];
            var an = anchors[nd.skill.category];
            nd.vx += (an.x - nd.x) * 0.008;
            nd.vy += (an.y - nd.y) * 0.008;
            nd.vx += -nd.x * 0.0015;
            nd.vy += -nd.y * 0.0015;
            nd.x += nd.vx * 0.55 * cool;
            nd.y += nd.vy * 0.55 * cool;
            nd.vx *= 0.82; nd.vy *= 0.82;
          }
        }
      })();

      /* normalise to a unit box so canvas fitting is trivial */
      (function normalise() {
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodes.forEach(function (nd) {
          minX = Math.min(minX, nd.x); maxX = Math.max(maxX, nd.x);
          minY = Math.min(minY, nd.y); maxY = Math.max(maxY, nd.y);
        });
        var w = maxX - minX || 1, h = maxY - minY || 1;
        nodes.forEach(function (nd) {
          nd.nx = (nd.x - minX) / w - 0.5;
          nd.ny = (nd.y - minY) / h - 0.5;
        });
      })();

      /* ---------------------------------------------------------- state */
      var cv = SE.canvas(canvasEl);
      var ctx = cv.ctx;
      var hoverId = null, lockedId = null, catFilter = null;
      var pulses = [];
      var elapsed = 0, ambientTimer = 0, reveal = 0;
      var scale = 1, ox = 0, oy = 0;

      function refit() {
        var pad = env.mobile ? 54 : 96;
        scale = Math.min((cv.w - pad * 2) / 1.02, (cv.h - pad * 2) / 1.02);
        ox = cv.w / 2; oy = cv.h / 2;
      }
      cv.observe(refit);
      refit();

      function activeId() { return lockedId || hoverId; }

      function isNear(id) {
        var a = activeId();
        if (!a) return true;
        if (id === a) return true;
        return (D.neighbours[a] || []).indexOf(id) !== -1;
      }

      /* ---------------------------------------------------------- pulses */
      function spawnPulse(link, dir) {
        if (env.reduced || pulses.length > 30) return;
        pulses.push({
          link: link,
          t: 0,
          dir: dir === undefined ? (Math.random() < 0.5 ? 1 : -1) : dir,
          speed: 0.55 + link.strength * 0.6,
          life: 1
        });
      }

      function spawnNeighbourhood(id) {
        for (var i = 0; i < links.length; i++) {
          var L = links[i];
          if (L.a.skill.id === id) spawnPulse(L, 1);
          else if (L.b.skill.id === id) spawnPulse(L, -1);
        }
      }

      /* ----------------------------------------------------- interaction */
      function select(id) {
        lockedId = id;
        if (id) { detail.show(D.byId[id]); spawnNeighbourhood(id); }
        else detail.hide();
        updateReadout();
      }
      detail.onClose(function () { select(null); });

      function updateReadout() {
        var a = activeId();
        focusOut.textContent = a ? SE.pad((D.neighbours[a] || []).length) : '--';
      }

      function localPoint(e) {
        var r = canvasEl.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }

      function pick(px, py) {
        var best = null, bestD = 26 * 26;
        for (var i = 0; i < nodes.length; i++) {
          var nd = nodes[i];
          if (catFilter && nd.skill.category !== catFilter) continue;
          var dx = nd.sx - px, dy = nd.sy - py;
          var d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; best = nd; }
        }
        return best;
      }

      canvasEl.addEventListener('pointermove', function (e) {
        var p = localPoint(e);
        var hit = pick(p.x, p.y);
        var id = hit ? hit.skill.id : null;
        if (id === hoverId) return;
        hoverId = id;
        canvasEl.style.cursor = id ? 'pointer' : '';
        SE.cursor && SE.cursor.label(id ? D.byId[id].name : '');
        if (id && !lockedId) spawnNeighbourhood(id);
        updateReadout();
      }, { passive: true });

      canvasEl.addEventListener('pointerleave', function () {
        hoverId = null; SE.cursor && SE.cursor.label(''); updateReadout();
      });

      canvasEl.addEventListener('pointerdown', function (e) {
        var p = localPoint(e);
        var hit = pick(p.x, p.y);
        select(hit ? (hit.skill.id === lockedId ? null : hit.skill.id) : null);
      });

      function onKey(e) { if (e.key === 'Escape' && lockedId) select(null); }
      window.addEventListener('keydown', onKey);

      legend.addEventListener('click', function (e) {
        var b = e.target.closest('[data-cat]');
        if (!b) return;
        var id = b.getAttribute('data-cat');
        catFilter = catFilter === id ? null : id;
        SE.$$('[data-cat]', legend).forEach(function (n) {
          n.setAttribute('aria-pressed', String(n.getAttribute('data-cat') === catFilter));
        });
      });

      /* ------------------------------------------------------------ draw */
      function render() {
        cv.clear();
        var a = activeId();
        var px = env.reduced ? 0 : SE.pointer.dnx * 14;
        var py = env.reduced ? 0 : SE.pointer.dny * 10;

        for (var i = 0; i < nodes.length; i++) {
          var nd = nodes[i];
          var drift = env.reduced ? 0 : 1;
          nd.sx = ox + nd.nx * scale + px + Math.sin(elapsed * 0.42 + nd.phase) * 3.2 * drift;
          nd.sy = oy + nd.ny * scale + py + Math.cos(elapsed * 0.35 + nd.phase * 1.7) * 3.2 * drift;
        }

        /* --- edges ----------------------------------------------------- */
        ctx.lineWidth = 1;
        for (var k = 0; k < links.length; k++) {
          var L = links[k];
          var lit = a && (L.a.skill.id === a || L.b.skill.id === a);
          var filteredOut = catFilter &&
            (L.a.skill.category !== catFilter || L.b.skill.category !== catFilter);

          var alpha = 0.10 + L.strength * 0.10;
          if (a) alpha = lit ? 0.42 + L.strength * 0.3 : 0.035;
          if (filteredOut) alpha *= 0.18;
          alpha *= reveal;
          if (alpha < 0.01) continue;

          var rgb = lit ? L.a.rgb : [140, 148, 160];
          ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(L.a.sx, L.a.sy);
          ctx.lineTo(L.b.sx, L.b.sy);
          ctx.stroke();
        }

        /* --- pulses ---------------------------------------------------- */
        for (var p = 0; p < pulses.length; p++) {
          var pu = pulses[p];
          var t = pu.dir > 0 ? pu.t : 1 - pu.t;
          var x = M.lerp(pu.link.a.sx, pu.link.b.sx, t);
          var y = M.lerp(pu.link.a.sy, pu.link.b.sy, t);
          var rgbp = pu.dir > 0 ? pu.link.a.rgb : pu.link.b.rgb;
          var al = Math.sin(pu.t * Math.PI) * 0.9 * reveal;
          ctx.fillStyle = 'rgba(' + rgbp[0] + ',' + rgbp[1] + ',' + rgbp[2] + ',' + al.toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(x, y, 1.9, 0, TAU);
          ctx.fill();
        }

        /* --- nodes ----------------------------------------------------- */
        ctx.textBaseline = 'middle';
        for (var m = 0; m < nodes.length; m++) {
          var node = nodes[m];
          var s = node.skill;
          var near = isNear(s.id);
          var isA = s.id === a;
          var filtered = catFilter && s.category !== catFilter;

          var alpha2 = (a ? (near ? 1 : 0.16) : 0.9) * (filtered ? 0.16 : 1) * reveal;
          var r = node.r * (1 + node.glow * 0.45);

          if (node.glow > 0.01) {
            var g = ctx.createRadialGradient(node.sx, node.sy, 0, node.sx, node.sy, r * 8);
            g.addColorStop(0, 'rgba(' + node.rgb[0] + ',' + node.rgb[1] + ',' + node.rgb[2] + ',' + (0.3 * node.glow * reveal) + ')');
            g.addColorStop(1, 'rgba(' + node.rgb[0] + ',' + node.rgb[1] + ',' + node.rgb[2] + ',0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(node.sx, node.sy, r * 8, 0, TAU);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(node.sx, node.sy, r, 0, TAU);
          ctx.fillStyle = 'rgba(' + node.rgb[0] + ',' + node.rgb[1] + ',' + node.rgb[2] + ',' + alpha2.toFixed(3) + ')';
          ctx.fill();

          if (isA) {
            ctx.beginPath();
            ctx.arc(node.sx, node.sy, r + 6 + node.glow * 3, 0, TAU);
            ctx.strokeStyle = 'rgba(' + node.rgb[0] + ',' + node.rgb[1] + ',' + node.rgb[2] + ',' + (0.55 * reveal) + ')';
            ctx.stroke();
          }

          /* Labels are the expensive part of a graph. Draw them only where
             they can be read: the traced neighbourhood, or the heavier nodes
             when nothing is traced. */
          var showLabel = a ? near : (s.weight > 0.78 || env.mobile === false);
          if (!showLabel || filtered) continue;
          var la = alpha2 * (isA ? 1 : 0.78);
          ctx.font = (isA ? '500 ' : '400 ') + (env.mobile ? 9 : 10) + 'px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(236,236,239,' + la.toFixed(3) + ')';
          ctx.fillText(s.name, node.sx + r + 7, node.sy + 0.5);
        }
      }

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        if (reveal < 1) reveal = env.reduced ? 1 : Math.min(1, reveal + dt / 0.9);
        elapsed += dt;

        var a = activeId();
        for (var i = 0; i < nodes.length; i++) {
          var nd = nodes[i];
          nd.glowTarget = nd.skill.id === a ? 1 : 0;
          nd.glow = M.damp(nd.glow, nd.glowTarget, 8, dt);
        }

        for (var p = pulses.length - 1; p >= 0; p--) {
          pulses[p].t += dt * pulses[p].speed;
          if (pulses[p].t >= 1) pulses.splice(p, 1);
        }

        /* Ambient traffic. Rate-limited on purpose: a graph where every wire
           is always firing is a screensaver, not a diagram. */
        if (!env.reduced) {
          ambientTimer -= dt;
          if (ambientTimer <= 0) {
            ambientTimer = 0.9 + Math.random() * 1.4;
            if (!a && links.length) spawnPulse(links[(Math.random() * links.length) | 0]);
          }
        }

        render();
      }
      SE.ticker.add(tick);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          window.removeEventListener('keydown', onKey);
          cv.destroy();
          root.innerHTML = '';
        }
      };
    }
  };

  (SE.concepts = SE.concepts || {})[concept.id] = concept;
})(window.SE = window.SE || {});

/* ============================================================================
   SECTION S05  -  DEPTH
   ----------------------------------------------------------------------------
   A forward dolly through the stack. The technologies are not arranged around
   you, they are arranged in front of you, and scrolling flies the camera
   through them. Each layer is a gate you pass through, and passing it regrades
   the frame.

   NOT A SECOND ORBIT
   ------------------
   Orbit rotates a fixed system around a centre; you stay outside it looking in.
   This moves the viewer through a corridor; you are inside it and the far wall
   keeps arriving. Same data, opposite spatial relationship, and the difference
   is legible in the first second.
   ========================================================================== */
(function (SE) {
  'use strict';

  var concept = {
    id: 'depth',
    num: 5,
    name: 'Depth',
    kind: 'Canvas / forward dolly',
    accent: '#A78BFA',
    tagline: 'Fly through the stack rather than around it',
    desc: 'Technologies sit at real distances ahead of you and scroll flies the camera through ' +
          'them. Each layer is a gate; passing through it regrades the frame.',
    interaction: 'Scroll to fly forward. Names resolve out of the far plane and pass you. The cursor steers.',
    hint: 'Scroll flies the camera',
    screens: 3.4,

    mount: function (root, ctx) {
      var env = SE.env, M = SE.math, D = SE.DATA;
      var isPage = ctx.mode === 'page';
      var skills = D.skills;
      var cats = D.categories;

      root.classList.add('depth', isPage ? 'is-page' : 'is-section');

      /* ------------------------------------------------------------ DOM */
      var host, rail = null, scrubber = null;
      if (isPage) {
        host = SE.el('div', 'depth__stage');
        root.appendChild(host);
      } else {
        rail = SE.scrollRail(ctx.scroller, concept.screens);
        host = SE.el('div', 'depth__stage');
        rail.sticky.appendChild(host);
        root.appendChild(rail.rail);
      }

      var canvasEl = SE.el('canvas', 'depth__canvas');
      host.appendChild(canvasEl);

      var hud = SE.el('div', 'depth__hud');
      hud.setAttribute('aria-live', 'polite');
      hud.innerHTML =
        '<span class="depth__gate"></span>' +
        '<span class="depth__meter"><i></i></span>' +
        '<span class="depth__count t-num"></span>';
      host.appendChild(hud);

      var index = null;
      if (isPage) {
        index = SE.el('div', 'depth__index');
        index.innerHTML = cats.map(function (c, i) {
          return '<button type="button" data-fly="' + i + '" style="--c-accent:' + c.accent + '">' +
                 '<i class="t-num">' + SE.pad(i + 1) + '</i>' + c.label + '</button>';
        }).join('');
        host.appendChild(index);
      }

      var more = null;
      if (!isPage) {
        more = SE.seeMore('Fly it yourself', ctx.onSeeMore);
        more.classList.add('depth__more');
        host.appendChild(more);
      }

      host.appendChild(SE.srList('Depth: a corridor of technologies', skills, function (s) {
        flyTo(s.index);
      }));

      /* --------------------------------------------------------- model */
      var cv = SE.canvas(canvasEl);
      var cvx = cv.ctx;
      var rand = SE.rng(31337);
      var SPACING = 300;
      var FOCAL = 620;
      var NEAR = 40;

      /* Each technology gets a fixed slot in the corridor. Seeded, so the
         corridor is the same corridor on every load - a flythrough that
         reshuffles itself is a screensaver. */
      var items = skills.map(function (s, i) {
        var ring = i % 3;
        var ang = rand() * Math.PI * 2;
        var spread = 140 + ring * 130 + rand() * 90;
        return {
          s: s,
          z: (i + 1) * SPACING,
          x: Math.cos(ang) * spread,
          y: Math.sin(ang) * spread * 0.62,
          rgb: SE.hexToRgb(s.accent)
        };
      });

      var gates = cats.map(function (cat) {
        var first = items.find(function (it) { return it.s.category === cat.id; });
        return { cat: cat, z: first ? first.z - SPACING * 0.55 : 0, rgb: SE.hexToRgb(cat.accent) };
      });

      var totalZ = items[items.length - 1].z + SPACING;
      var camZ = 0, camTarget = 0;
      var progress = 0;
      var vel = 0;
      var lastGate = -1;

      cv.observe(function () {});

      /* ----------------------------------------------------- interaction */
      function flyTo(i) {
        var it = items[i];
        if (!it) return;
        camTarget = M.clamp(it.z - FOCAL * 0.55, 0, totalZ);
      }

      if (isPage) {
        host.addEventListener('wheel', function (e) {
          vel += e.deltaY * 1.5;
        }, { passive: true });

        var dragY = null;
        host.addEventListener('pointerdown', function (e) {
          if (e.target.closest('button')) return;
          dragY = e.clientY;
          SE.cursor && SE.cursor.grab(true);
        });
        var onDrag = function (e) {
          if (dragY === null) return;
          vel += (dragY - e.clientY) * 9;
          dragY = e.clientY;
        };
        var endDrag = function () { dragY = null; SE.cursor && SE.cursor.grab(false); };
        window.addEventListener('pointermove', onDrag, { passive: true });
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);

        if (index) {
          index.addEventListener('click', function (e) {
            var b = e.target.closest('[data-fly]');
            if (!b) return;
            var gi = parseInt(b.getAttribute('data-fly'), 10);
            camTarget = M.clamp(gates[gi].z - FOCAL * 0.4, 0, totalZ);
          });
        }

        concept._cleanupPage = function () {
          window.removeEventListener('pointermove', onDrag);
          window.removeEventListener('pointerup', endDrag);
          window.removeEventListener('pointercancel', endDrag);
        };
      } else {
        scrubber = SE.scrub(ctx.scroller, rail.rail, function (p) {
          progress = p;
          camTarget = p * (totalZ - FOCAL);
        });
      }

      /* ------------------------------------------------------------ draw */
      function render() {
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4) return;
        cv.clear();

        var cx = w / 2, cy = h / 2;
        var scale = Math.min(w, h) / 620;
        var px = env.reduced ? 0 : SE.pointer.dnx * 60;
        var py = env.reduced ? 0 : SE.pointer.dny * 40;

        /* --- gates, far to near ---------------------------------------- */
        for (var g = gates.length - 1; g >= 0; g--) {
          var gate = gates[g];
          var gz = gate.z - camZ;
          if (gz < NEAR || gz > FOCAL * 7) continue;
          var gs = FOCAL / gz;
          var gw = 420 * gs * scale;
          var gh = 300 * gs * scale;
          var gx = cx + px * gs * 0.5;
          var gy = cy + py * gs * 0.5;
          var ga = M.clamp(1 - gz / (FOCAL * 6), 0, 1) * 0.5;

          cvx.strokeStyle = 'rgba(' + gate.rgb.join(',') + ',' + ga.toFixed(3) + ')';
          cvx.lineWidth = 1;
          cvx.strokeRect(gx - gw, gy - gh, gw * 2, gh * 2);

          if (gs > 0.22 && gs < 3) {
            cvx.font = '500 ' + Math.round(M.clamp(11 * gs * scale * 1.6, 8, 22)) + 'px "JetBrains Mono", monospace';
            cvx.textAlign = 'left';
            cvx.textBaseline = 'bottom';
            cvx.fillStyle = 'rgba(' + gate.rgb.join(',') + ',' + (ga * 1.7).toFixed(3) + ')';
            cvx.fillText(gate.cat.label.toUpperCase(), gx - gw, gy - gh - 6);
          }
        }

        /* --- items, far to near (painter's order) ----------------------- */
        var visible = 0;
        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i];
          var z = it.z - camZ;
          if (z < NEAR || z > FOCAL * 7) continue;
          var s = FOCAL / z;
          var sx = cx + (it.x + px) * s * scale;
          var sy = cy + (it.y + py) * s * scale;

          /* Fade in from the far plane, and fade out again as it sweeps past
             the camera - otherwise names smear across the lens at the last
             moment and the corridor reads as noise. */
          var far = M.clamp(1 - z / (FOCAL * 5.5), 0, 1);
          var near = M.clamp((z - NEAR) / (FOCAL * 0.55), 0, 1);
          var a = far * near;
          if (a < 0.02) continue;
          visible++;

          var fs = M.clamp(15 * s * scale, 7, 96);
          cvx.font = (s > 0.8 ? '500 ' : '400 ') + Math.round(fs) + 'px "Space Grotesk", sans-serif';
          cvx.textAlign = 'center';
          cvx.textBaseline = 'middle';

          cvx.fillStyle = 'rgba(236,236,239,' + (a * 0.95).toFixed(3) + ')';
          cvx.fillText(it.s.name, sx, sy);

          if (s > 0.55) {
            cvx.font = '400 ' + Math.round(M.clamp(fs * 0.26, 7, 13)) + 'px "JetBrains Mono", monospace';
            cvx.fillStyle = 'rgba(' + it.rgb.join(',') + ',' + (a * 0.85).toFixed(3) + ')';
            cvx.fillText(it.s.role.toUpperCase(), sx, sy + fs * 0.72);
          }
        }

        /* --- HUD -------------------------------------------------------- */
        var gi = 0;
        for (var k = 0; k < gates.length; k++) if (gates[k].z <= camZ + FOCAL * 0.5) gi = k;
        if (gi !== lastGate) {
          lastGate = gi;
          host.style.setProperty('--c-accent', gates[gi].cat.accent);
          SE.$('.depth__gate', hud).textContent = gates[gi].cat.label;
          SE.stageAccent && SE.stageAccent(gates[gi].cat.accent);
        }
        SE.$('.depth__count', hud).textContent = SE.pad(visible) + ' IN FRAME';
        SE.$('.depth__meter i', hud).style.transform =
          'scaleX(' + M.clamp(camZ / (totalZ - FOCAL), 0, 1).toFixed(3) + ')';
      }

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        if (isPage) {
          camTarget = M.clamp(camTarget + vel * dt, 0, totalZ - FOCAL);
          vel *= Math.pow(0.02, dt);
          if (Math.abs(vel) < 1) vel = 0;
        }
        camZ = env.reduced ? camTarget : M.damp(camZ, camTarget, 4.5, dt);
        if (more) more.classList.toggle('is-on', progress > 0.5);
        render();
      }
      SE.ticker.add(tick);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          if (scrubber) scrubber.kill();
          if (rail) rail.destroy();
          if (concept._cleanupPage) { concept._cleanupPage(); concept._cleanupPage = null; }
          cv.destroy();
          root.classList.remove('depth', 'is-page', 'is-section');
          root.innerHTML = '';
        }
      };
    }
  };

  (SE.sections = SE.sections || {})[concept.id] = concept;
})(window.SE = window.SE || {});

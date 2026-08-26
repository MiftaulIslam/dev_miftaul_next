/* ============================================================================
   CONCEPT 01  -  ORBIT
   ----------------------------------------------------------------------------
   A stack rendered as an orbital system: one ring per category, one body per
   technology, a core that is the developer.

   WHY NO THREE.JS HERE
   --------------------
   Everything on screen is a labelled point. In WebGL, text means rendering each
   label to a texture and billboarding a quad - more code, more memory, blurrier
   type, and a 600kb dependency, to draw the same thirty dots. A hand-written
   perspective projection onto a 2D canvas gives crisp native text, exact depth
   sorting, and roughly 200 lines. WebGL earns its place when there are
   thousands of instances or a real shader; not here.
   ========================================================================== */
(function (SE) {
  'use strict';

  var TAU = Math.PI * 2;

  var concept = {
    id: 'orbit',
    num: 1,
    name: 'Orbit',
    kind: 'Canvas / projected 3D',
    accent: '#4CC9F0',
    tagline: 'The stack as a system with a centre of gravity',
    desc: 'One ring per layer, one body per technology, orbiting a core. Depth, not decoration: ' +
          'a technology closer to the viewer is literally closer to the work.',
    interaction: 'Move to steer the camera. Hover a body to raise it out of its ring. Click to focus and hold the shot.',
    hint: 'Move to steer &middot; Click a body to focus',

    mount: function (root) {
      var env = SE.env, M = SE.math, D = SE.DATA;

      /* ------------------------------------------------------------ DOM */
      var canvasEl = SE.el('canvas', 'orbit__canvas');
      root.appendChild(canvasEl);

      var detail = SE.makeDetail();
      root.appendChild(detail.el);

      var legend = SE.el('div', 'orbit__legend');
      legend.innerHTML = D.categories.map(function (c, i) {
        return '<button type="button" data-ring="' + i + '" style="--h:' + c.accent + '">' +
               '<i></i><span>' + c.label + '</span></button>';
      }).join('');
      root.appendChild(legend);

      root.appendChild(SE.hintStrip(
        '<span>Move &mdash; steer</span><span>Click &mdash; focus</span><span><kbd>Esc</kbd> clear</span>'
      ));

      var srBox = SE.srList('Orbit: the stack as an orbital system', D.skills, function (s) {
        select(s.id);
      });
      root.appendChild(srBox);

      /* --------------------------------------------------------- model */
      var cv = SE.canvas(canvasEl);
      var rand = SE.rng(20260826);

      var rings = D.categories.map(function (cat, i) {
        return {
          cat: cat,
          radius: 96 + i * 56,
          inclination: (i % 2 ? 1 : -1) * (0.20 + i * 0.055),
          azimuth: i * 0.62,
          phase: rand() * TAU,
          speed: (i % 2 ? 1 : -1) * (0.115 - i * 0.011),
          rgb: SE.hexToRgb(cat.accent)
        };
      });

      var bodies = [];
      rings.forEach(function (ring, ri) {
        var n = ring.cat.skills.length;
        ring.cat.skills.forEach(function (s, si) {
          bodies.push({
            skill: s,
            ring: ring,
            ringIndex: ri,
            a0: (si / n) * TAU,
            /* animated per body, so a hover can raise one body out of its ring
               without disturbing the others */
            lift: 0, liftTarget: 0,
            glow: 0, glowTarget: 0,
            sx: 0, sy: 0, sz: 0, ss: 1
          });
        });
      });

      var stars = [];
      var starCount = env.mobile ? 60 : 150;
      for (var i = 0; i < starCount; i++) {
        stars.push({
          x: (rand() - 0.5) * 1900,
          y: (rand() - 0.5) * 1200,
          z: (rand() - 0.5) * 1900,
          m: 0.25 + rand() * 0.75
        });
      }

      /* --------------------------------------------------------- camera */
      var cam = {
        yaw: 0.35, yawDrift: 0.35, pitch: -0.30,
        zoom: 1, zoomTarget: 1,
        dist: 640, focal: 700
      };
      var timeScale = 1, timeScaleTarget = 1;
      var fit = 1;
      var hoverId = null, selectedId = null, ringFilter = -1;
      var dirty = true;
      var reveal = 0;                        /* 0..1 entry choreography */

      function refit() {
        var outer = rings[rings.length - 1].radius + 30;
        fit = (Math.min(cv.w, cv.h) * (env.mobile ? 0.40 : 0.44)) / outer;
        dirty = true;
      }
      cv.observe(refit);
      refit();

      /* ------------------------------------------------------ projection */
      /* Ring-local -> world -> camera -> screen. Written out longhand rather
         than with a matrix library: six trig calls per body per frame is
         nothing, and the intent stays readable. */
      function project(x, y, z, out) {
        var yaw = cam.yaw, pitch = cam.pitch;
        var cy = Math.cos(yaw), sy = Math.sin(yaw);
        var x3 = x * cy + z * sy;
        var z3 = -x * sy + z * cy;
        var cp = Math.cos(pitch), sp = Math.sin(pitch);
        var y3 = y * cp - z3 * sp;
        var z4 = y * sp + z3 * cp;
        var s = cam.focal / Math.max(1, cam.focal + z4 + cam.dist / fit);
        out.x = cv.w / 2 + x3 * s * fit * cam.zoom;
        out.y = cv.h / 2 + y3 * s * fit * cam.zoom;
        out.z = z4;
        out.s = s;
        return out;
      }

      function ringPoint(ring, angle, lift, out) {
        var r = ring.radius + lift;
        var x = r * Math.cos(angle);
        var z = r * Math.sin(angle);
        var inc = ring.inclination;
        var y1 = -z * Math.sin(inc);
        var z1 = z * Math.cos(inc);
        var az = ring.azimuth;
        var x2 = x * Math.cos(az) + z1 * Math.sin(az);
        var z2 = -x * Math.sin(az) + z1 * Math.cos(az);
        out.wx = x2; out.wy = y1; out.wz = z2;
        return out;
      }

      var tmpW = { wx: 0, wy: 0, wz: 0 };
      var tmpP = { x: 0, y: 0, z: 0, s: 1 };
      var corePt = { x: 0, y: 0, z: 0, s: 1 };

      /* ------------------------------------------------------ interaction */
      function select(id) {
        selectedId = id;
        if (id) {
          detail.show(D.byId[id]);
          timeScaleTarget = 0.22;            /* time dilates while you look */
        } else {
          detail.hide();
          timeScaleTarget = 1;
        }
        dirty = true;
      }
      detail.onClose(function () { select(null); });

      function pick(px, py) {
        var best = null, bestD = 30 * 30;
        for (var i = 0; i < bodies.length; i++) {
          var b = bodies[i];
          if (ringFilter >= 0 && b.ringIndex !== ringFilter) continue;
          var dx = b.sx - px, dy = b.sy - py;
          var d = dx * dx + dy * dy;
          /* nearer bodies win ties: bias the radius by projected scale */
          var rad = 26 * b.ss;
          if (d < rad * rad && d < bestD) { bestD = d; best = b; }
        }
        return best;
      }

      function localPoint(e) {
        var r = canvasEl.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }

      function onMove(e) {
        var p = localPoint(e);
        var hit = pick(p.x, p.y);
        var id = hit ? hit.skill.id : null;
        if (id !== hoverId) {
          hoverId = id;
          canvasEl.style.cursor = id ? 'pointer' : '';
          SE.cursor && SE.cursor.label(id ? D.byId[id].name : '');
          dirty = true;
        }
      }

      function onDown(e) {
        var p = localPoint(e);
        var hit = pick(p.x, p.y);
        select(hit ? (hit.skill.id === selectedId ? null : hit.skill.id) : null);
      }

      canvasEl.addEventListener('pointermove', onMove, { passive: true });
      canvasEl.addEventListener('pointerdown', onDown);
      canvasEl.addEventListener('pointerleave', function () {
        hoverId = null; SE.cursor && SE.cursor.label(''); dirty = true;
      });

      function onKey(e) { if (e.key === 'Escape' && selectedId) select(null); }
      window.addEventListener('keydown', onKey);

      legend.addEventListener('click', function (e) {
        var b = e.target.closest('[data-ring]');
        if (!b) return;
        var idx = parseInt(b.getAttribute('data-ring'), 10);
        ringFilter = ringFilter === idx ? -1 : idx;
        SE.$$('button', legend).forEach(function (n, i) {
          n.setAttribute('aria-pressed', String(i === ringFilter));
        });
        dirty = true;
      });

      /* ------------------------------------------------------------ draw */
      function drawRing(ring, alpha) {
        var steps = env.mobile ? 44 : 72;
        ctx.beginPath();
        for (var i = 0; i <= steps; i++) {
          ringPoint(ring, (i / steps) * TAU, 0, tmpW);
          project(tmpW.wx, tmpW.wy, tmpW.wz, tmpP);
          if (i === 0) ctx.moveTo(tmpP.x, tmpP.y); else ctx.lineTo(tmpP.x, tmpP.y);
        }
        ctx.strokeStyle = 'rgba(' + ring.rgb[0] + ',' + ring.rgb[1] + ',' + ring.rgb[2] + ',' + alpha + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      var ctx = cv.ctx;

      function render() {
        cv.clear();
        ctx.save();

        var focused = selectedId ? D.byId[selectedId] : null;
        var hovered = hoverId ? D.byId[hoverId] : null;
        var attention = focused || hovered;

        /* --- starfield ------------------------------------------------- */
        for (var i = 0; i < stars.length; i++) {
          var st = stars[i];
          project(st.x, st.y, st.z, tmpP);
          if (tmpP.s <= 0.05) continue;
          var a = 0.06 + tmpP.s * 0.16 * st.m;
          ctx.fillStyle = 'rgba(236,236,239,' + (a * reveal).toFixed(3) + ')';
          ctx.fillRect(tmpP.x, tmpP.y, 1.15 * tmpP.s, 1.15 * tmpP.s);
        }

        /* --- rings ----------------------------------------------------- */
        for (var r = 0; r < rings.length; r++) {
          var dim = (ringFilter >= 0 && ringFilter !== r) ? 0.22 : 1;
          var att = attention && attention.category !== rings[r].cat.id ? 0.4 : 1;
          drawRing(rings[r], 0.16 * dim * att * reveal);
        }

        /* --- core ------------------------------------------------------ */
        project(0, 0, 0, corePt);
        var coreR = 96 * corePt.s * fit * cam.zoom;
        var g = ctx.createRadialGradient(corePt.x, corePt.y, 0, corePt.x, corePt.y, coreR);
        g.addColorStop(0, 'rgba(236,236,239,' + (0.13 * reveal) + ')');
        g.addColorStop(0.45, 'rgba(120,160,200,' + (0.05 * reveal) + ')');
        g.addColorStop(1, 'rgba(8,8,10,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(corePt.x, corePt.y, coreR, 0, TAU);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '500 ' + Math.round(11 * Math.min(1.4, fit * 3.4)) + 'px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(236,236,239,' + (0.5 * reveal) + ')';
        ctx.fillText('S T A C K', corePt.x, corePt.y);

        /* --- bodies, painter-sorted ------------------------------------ */
        var list = bodies.slice().sort(function (a, b) { return b.sz - a.sz; });

        for (var k = 0; k < list.length; k++) {
          var b = list[k];
          var s = b.skill;
          var isHover = s.id === hoverId;
          var isSel = s.id === selectedId;
          var filtered = ringFilter >= 0 && b.ringIndex !== ringFilter;

          var base = M.clamp((b.ss - 0.44) / 0.62, 0, 1);       /* depth fade */
          var dim = filtered ? 0.14 : 1;
          if (attention && !isHover && !isSel) {
            dim *= (attention.category === s.category) ? 0.62 : 0.26;
          }
          var alpha = (0.28 + base * 0.72) * dim * reveal;
          var rgb = b.ring.rgb;

          /* connector to the core, drawn only for the thing you are looking
             at: 29 permanent spokes would be a hairball. */
          if (isHover || isSel) {
            ctx.beginPath();
            ctx.moveTo(corePt.x, corePt.y);
            ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.34 * reveal) + ')';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          var rad = (2.4 + s.weight * 3.6) * b.ss * (1 + b.glow * 0.7);

          if (b.glow > 0.01) {
            var gg = ctx.createRadialGradient(b.sx, b.sy, 0, b.sx, b.sy, rad * 7);
            gg.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.34 * b.glow * reveal) + ')');
            gg.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
            ctx.fillStyle = gg;
            ctx.beginPath();
            ctx.arc(b.sx, b.sy, rad * 7, 0, TAU);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(b.sx, b.sy, rad, 0, TAU);
          ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
          ctx.fill();

          if (isSel || isHover) {
            ctx.beginPath();
            ctx.arc(b.sx, b.sy, rad + 5 + b.glow * 4, 0, TAU);
            ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.5 * reveal) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          var labelAlpha = alpha * (isHover || isSel ? 1 : 0.72);
          if (labelAlpha > 0.05) {
            var fs = Math.round(M.clamp(9 * b.ss * (fit * 2.6), 8, 15));
            ctx.font = (isHover || isSel ? '500 ' : '400 ') + fs + 'px "JetBrains Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = (isHover || isSel)
              ? 'rgba(236,236,239,' + labelAlpha + ')'
              : 'rgba(236,236,239,' + (labelAlpha * 0.8) + ')';
            ctx.fillText(s.name, b.sx + rad + 7, b.sy);
          }
        }

        ctx.restore();
      }

      /* ------------------------------------------------------------ tick */
      var elapsed = 0;

      function tick(dt) {
        /* entry: bodies and rings fade up together over ~1.1s */
        if (reveal < 1) {
          reveal = env.reduced ? 1 : Math.min(1, reveal + dt / 1.1);
          dirty = true;
        }

        timeScale = M.damp(timeScale, timeScaleTarget, 3, dt);

        if (!env.reduced) {
          elapsed += dt * timeScale;

          /* camera: idle drift, or track the selected body */
          if (selectedId) {
            var sel = null;
            for (var i = 0; i < bodies.length; i++) {
              if (bodies[i].skill.id === selectedId) { sel = bodies[i]; break; }
            }
            if (sel) {
              ringPoint(sel.ring, sel.a0 + elapsed * sel.ring.speed + sel.ring.phase, 0, tmpW);
              var phi = Math.atan2(tmpW.wx, tmpW.wz);
              var target = Math.PI - phi;
              /* unwrap so the camera always takes the short way round */
              while (target - cam.yawDrift > Math.PI) target -= TAU;
              while (target - cam.yawDrift < -Math.PI) target += TAU;
              cam.yawDrift = M.damp(cam.yawDrift, target, 1.7, dt);
            }
            cam.zoomTarget = 1.1;
          } else {
            cam.yawDrift += dt * 0.055;
            cam.zoomTarget = 1;
          }

          cam.zoom = M.damp(cam.zoom, cam.zoomTarget, 3, dt);
          cam.yaw = cam.yawDrift + SE.pointer.dnx * 0.42;
          cam.pitch = -0.30 + SE.pointer.dny * 0.24;
          dirty = true;
        }

        /* per-body hover lift and glow, damped independently */
        for (var j = 0; j < bodies.length; j++) {
          var b = bodies[j];
          var active = b.skill.id === hoverId || b.skill.id === selectedId;
          b.liftTarget = active ? 26 : 0;
          b.glowTarget = active ? 1 : 0;
          var nl = M.damp(b.lift, b.liftTarget, 7, dt);
          var ng = M.damp(b.glow, b.glowTarget, 7, dt);
          if (Math.abs(nl - b.lift) > 0.01 || Math.abs(ng - b.glow) > 0.002) dirty = true;
          b.lift = nl; b.glow = ng;

          var a = b.a0 + elapsed * b.ring.speed + b.ring.phase;
          ringPoint(b.ring, a, b.lift, tmpW);
          project(tmpW.wx, tmpW.wy, tmpW.wz, tmpP);
          b.sx = tmpP.x; b.sy = tmpP.y; b.sz = tmpP.z; b.ss = tmpP.s;
        }

        if (dirty) { render(); if (env.reduced) dirty = false; }
      }

      SE.ticker.add(tick);

      /* ---------------------------------------------------------- destroy */
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

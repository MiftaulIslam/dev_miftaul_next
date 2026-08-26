/* ============================================================================
   PREVIEWS  -  live miniatures for the index cards.
   ----------------------------------------------------------------------------
   A thumbnail of a motion concept is a lie. Each card runs a real, miniature
   version of its concept's signature motion, so what you compare on the index
   is what you get in the stage.

   COST CONTROL
   ------------
   Six always-on canvases would be the single most expensive thing on the page.
   Each preview: draws under ~40 operations per frame, unsubscribes from the
   ticker the moment it leaves the viewport (IntersectionObserver), stops
   entirely while a concept stage is open, and renders one static frame under
   reduced motion.
   ========================================================================== */
(function (SE) {
  'use strict';

  var TAU = Math.PI * 2;
  var renderers = {};

  /* ---------------------------------------------------------------- ORBIT */
  renderers.orbit = function (cv, D) {
    var rand = SE.rng(7717);
    var rings = D.categories.slice(0, 4).map(function (c, i) {
      return { r: 0.20 + i * 0.11, flat: 0.30 + i * 0.045, rgb: SE.hexToRgb(c.accent), sp: (i % 2 ? 1 : -1) * (0.5 - i * 0.07) };
    });
    var dots = [];
    rings.forEach(function (ring, ri) {
      var n = 3 + (ri % 2);
      for (var i = 0; i < n; i++) dots.push({ ring: ring, a: (i / n) * TAU + rand() * 0.5, w: 0.5 + rand() * 0.5 });
    });

    return function (ctx, w, h, t, heat) {
      var cx = w / 2, cy = h / 2, R = Math.min(w, h);

      rings.forEach(function (ring) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, ring.r * R, ring.r * R * ring.flat, 0, 0, TAU);
        ctx.strokeStyle = 'rgba(' + ring.rgb.join(',') + ',' + (0.16 + heat * 0.14) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.16);
      g.addColorStop(0, 'rgba(236,236,239,' + (0.16 + heat * 0.12) + ')');
      g.addColorStop(1, 'rgba(8,8,10,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.16, 0, TAU);
      ctx.fill();

      dots.sort(function (a, b) {
        return Math.sin(a.a + t * a.ring.sp) - Math.sin(b.a + t * b.ring.sp);
      });

      dots.forEach(function (d) {
        var a = d.a + t * d.ring.sp * (1 + heat * 0.5);
        var x = cx + Math.cos(a) * d.ring.r * R;
        var y = cy + Math.sin(a) * d.ring.r * R * d.ring.flat;
        var depth = (Math.sin(a) + 1) / 2;
        var rr = (1.1 + d.w * 1.8) * (0.55 + depth * 0.8);
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, TAU);
        ctx.fillStyle = 'rgba(' + d.ring.rgb.join(',') + ',' + (0.3 + depth * 0.6) + ')';
        ctx.fill();
      });
    };
  };

  /* ----------------------------------------------------------------- REEL */
  renderers.reel = function (cv, D) {
    var cats = D.categories;
    return function (ctx, w, h, t, heat) {
      var bar = Math.max(5, h * 0.085);
      var inner = h - bar * 2;
      var pw = Math.max(62, w * 0.21);
      var span = pw * cats.length;
      var x0 = -((t * (22 + heat * 40)) % span);

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      for (var i = -1; i <= Math.ceil(w / pw) + 1; i++) {
        var x = x0 + i * pw;
        if (x > w || x + pw < 0) continue;
        var ci = ((i % cats.length) + cats.length) % cats.length;
        var rgb = SE.hexToRgb(cats[ci].accent);

        var gr = ctx.createLinearGradient(x, bar, x, h - bar);
        gr.addColorStop(0, 'rgba(' + rgb.join(',') + ',' + (0.22 + heat * 0.12) + ')');
        gr.addColorStop(1, 'rgba(' + rgb.join(',') + ',0.015)');
        ctx.fillStyle = gr;
        ctx.fillRect(x + 2, bar, pw - 4, inner);

        ctx.font = '700 ' + Math.round(inner * 0.26) + 'px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(236,236,239,' + (0.17 + heat * 0.12) + ')';
        ctx.fillText(SE.pad(ci + 1), x + 10, h / 2);

        ctx.strokeStyle = 'rgba(236,236,239,0.09)';
        ctx.beginPath();
        ctx.moveTo(x + 2, bar); ctx.lineTo(x + 2, h - bar);
        ctx.stroke();
      }

      /* letterbox last, so it crops the strip like a gate */
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, w, bar);
      ctx.fillRect(0, h - bar, w, bar);

      var ph = ((t * 0.13) % 1) * w;
      ctx.fillStyle = 'rgba(255,106,61,0.9)';
      ctx.fillRect(ph, h - bar - 2, Math.max(16, w * 0.05), 2);
    };
  };

  /* -------------------------------------------------------------- LATTICE */
  renderers.lattice = function (cv, D) {
    var rand = SE.rng(4242);
    var pts = [];
    for (var i = 0; i < 15; i++) {
      var cat = D.categories[i % D.categories.length];
      pts.push({ x: 0.12 + rand() * 0.76, y: 0.14 + rand() * 0.72, rgb: SE.hexToRgb(cat.accent), r: 1.4 + rand() * 2.4 });
    }
    var links = [];
    for (var a = 0; a < pts.length; a++) {
      for (var b = a + 1; b < pts.length; b++) {
        var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.29) links.push([a, b]);
      }
    }
    var pulses = links.slice(0, 4).map(function (l, i) { return { l: l, t: i * 0.25 }; });

    return function (ctx, w, h, t, heat) {
      ctx.lineWidth = 1;
      links.forEach(function (l) {
        ctx.beginPath();
        ctx.moveTo(pts[l[0]].x * w, pts[l[0]].y * h);
        ctx.lineTo(pts[l[1]].x * w, pts[l[1]].y * h);
        ctx.strokeStyle = 'rgba(150,158,170,' + (0.13 + heat * 0.16) + ')';
        ctx.stroke();
      });

      pulses.forEach(function (p, i) {
        p.t = (t * (0.22 + heat * 0.3) + i * 0.25) % 1;
        var A = pts[p.l[0]], B = pts[p.l[1]];
        var x = (A.x + (B.x - A.x) * p.t) * w;
        var y = (A.y + (B.y - A.y) * p.t) * h;
        ctx.beginPath();
        ctx.arc(x, y, 1.7, 0, TAU);
        ctx.fillStyle = 'rgba(' + A.rgb.join(',') + ',' + Math.sin(p.t * Math.PI).toFixed(2) + ')';
        ctx.fill();
      });

      pts.forEach(function (p, i) {
        var pulse = 1 + Math.sin(t * 1.1 + i) * 0.12 * (0.4 + heat);
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * pulse, 0, TAU);
        ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',' + (0.6 + heat * 0.35) + ')';
        ctx.fill();
      });
    };
  };

  /* -------------------------------------------------------------- KINETIC */
  renderers.kinetic = function (cv, D) {
    var words = D.skills.map(function (s) { return s.name.toUpperCase(); });
    var lines = [
      { y: 0.20, dir: -1, sp: 24, size: 0.100, from: 0 },
      { y: 0.43, dir: 1, sp: 15, size: 0.080, from: 7 },
      { y: 0.64, dir: -1, sp: 31, size: 0.065, from: 14 },
      { y: 0.84, dir: 1, sp: 19, size: 0.052, from: 21 }
    ];
    /* Measure once per size: measureText per word per frame across three bands
       is the one genuinely expensive thing a text preview can do. */
    var cache = null;

    return function (ctx, w, h, t, heat) {
      if (!cache || cache.h !== h) {
        cache = {
          h: h,
          lines: lines.map(function (L) {
            var fs = Math.max(9, Math.round(h * L.size));
            ctx.font = '700 ' + fs + 'px "Space Grotesk", sans-serif';
            var items = [], total = 0;
            for (var i = 0; i < 12; i++) {
              var word = words[(L.from + i) % words.length];
              var wd = ctx.measureText(word).width + fs * 0.45;
              items.push({ word: word, wd: wd });
              total += wd;
            }
            return { fs: fs, items: items, total: total };
          })
        };
      }

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.lineWidth = 1;

      lines.forEach(function (L, li) {
        var c = cache.lines[li];
        ctx.font = '700 ' + c.fs + 'px "Space Grotesk", sans-serif';
        ctx.strokeStyle = 'rgba(236,236,239,' + (0.26 + heat * 0.22) + ')';
        ctx.fillStyle = 'rgba(236,236,239,' + (0.11 + heat * 0.45) + ')';

        var off = (t * (L.sp + heat * 30) * L.dir) % c.total;
        if (off > 0) off -= c.total;

        var x = off, k = 0;
        while (x < w + 24 && k < 80) {
          var it = c.items[k % c.items.length];
          if (x + it.wd > -24) {
            if ((k + li) % 4 === 0) ctx.fillText(it.word, x, h * L.y);
            else ctx.strokeText(it.word, x, h * L.y);
          }
          x += it.wd;
          k++;
        }
      });
    };
  };

  /* ----------------------------------------------------------------- DECK */
  renderers.deck = function (cv, D) {
    var hues = D.categories.map(function (c) { return SE.hexToRgb(c.accent); });
    return function (ctx, w, h, t, heat) {
      var n = hues.length;
      var pos = (t * (0.2 + heat * 0.34)) % n;
      var cw = Math.min(w * 0.19, h * 0.46);
      var ch = cw * 1.36;

      var list = [];
      for (var i = 0; i < n; i++) {
        var d = i - pos;
        if (d < -0.5) d += n;          /* wrap the departing card to the back */
        list.push({ i: i, d: d });
      }
      list.sort(function (a, b) { return b.d - a.d; });   /* far first */

      list.forEach(function (o) {
        var d = o.d;
        var al = Math.max(0, 1 - d * 0.19);
        if (al <= 0.03) return;

        var sc = 1 - Math.min(0.4, d * 0.075);
        var x = w / 2 - cw * 0.62 + d * (cw * 0.31);
        var y = h / 2 + d * 3.5;
        var rgb = hues[o.i];

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(sc, sc);

        var gr = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
        gr.addColorStop(0, 'rgba(' + rgb.join(',') + ',' + (0.26 * al).toFixed(3) + ')');
        gr.addColorStop(0.42, 'rgba(19,19,25,' + al.toFixed(3) + ')');
        gr.addColorStop(1, 'rgba(11,11,15,' + al.toFixed(3) + ')');
        ctx.fillStyle = gr;
        ctx.fillRect(-cw / 2, -ch / 2, cw, ch);

        ctx.strokeStyle = 'rgba(' + rgb.join(',') + ',' + (0.5 * al).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.strokeRect(-cw / 2 + 0.5, -ch / 2 + 0.5, cw - 1, ch - 1);

        /* inner top highlight: the one mark that makes a rectangle read as a
           physical card rather than as a swatch */
        ctx.fillStyle = 'rgba(255,255,255,' + (0.10 * al).toFixed(3) + ')';
        ctx.fillRect(-cw / 2 + 1, -ch / 2 + 1, cw - 2, 1);

        ctx.fillStyle = 'rgba(236,236,239,' + (0.55 * al).toFixed(3) + ')';
        ctx.fillRect(-cw / 2 + 9, ch / 2 - 24, cw * 0.44, 2);
        ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (0.7 * al).toFixed(3) + ')';
        ctx.fillRect(-cw / 2 + 9, ch / 2 - 16, cw * 0.26, 2);
        ctx.restore();
      });
    };
  };

  /* --------------------------------------------------------------- STRATA */
  renderers.strata = function (cv, D) {
    var cats = D.categories;
    return function (ctx, w, h, t, heat) {
      var n = cats.length;
      var cx = w / 2, cy = h / 2;
      /* The whole read depends on slab half-height being small relative to the
         Z step. Derive both from one number so they can never drift apart and
         turn the stack into overlapping mush. */
      var sh = Math.min(h * 0.115, w * 0.045);
      var sw = sh * 2.6;
      var step = sh * 1.2;
      var top = cy - (n - 1) * step / 2;

      var cycle = (t * (0.22 + heat * 0.3)) % 1.7;
      var pk = cycle < 1 ? cycle : Math.max(0, 1 - (cycle - 1) / 0.55);
      var pkY = top + pk * (n - 1) * step;

      /* spine */
      ctx.strokeStyle = 'rgba(236,236,239,0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, top - sh);
      ctx.lineTo(cx, top + (n - 1) * step + sh);
      ctx.stroke();

      for (var i = n - 1; i >= 0; i--) {
        var y = top + i * step;
        var rgb = SE.hexToRgb(cats[i].accent);
        var hit = cycle < 1.05 && Math.abs(y - pkY) < step * 0.6;

        ctx.beginPath();
        ctx.moveTo(cx - sw, y);
        ctx.lineTo(cx, y - sh);
        ctx.lineTo(cx + sw, y);
        ctx.lineTo(cx, y + sh);
        ctx.closePath();
        ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (hit ? 0.34 : 0.035 + heat * 0.025) + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(' + rgb.join(',') + ',' + (hit ? 1 : 0.4 + heat * 0.16) + ')';
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, pkY, 8, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, pkY, 2.6, 0, TAU);
      ctx.fillStyle = '#fff';
      ctx.fill();
    };
  };

  /* ------------------------------------------------------------- mounting */
  var live = [];
  var paused = false;

  /* Exposed so the registry adapter can hand a built-in renderer to a concept
     that predates the registry. */
  SE.previewRenderers = renderers;

  SE.mountPreview = function (canvasEl, conceptId) {
    /* Two shapes are supported. Built-in concepts ship a factory
       (cv, DATA) -> draw. Registry concepts ship `preview` directly as
       (ctx, w, h, t, heat), which is the documented contract for area authors. */
    var make = renderers[conceptId];
    var registered = SE.get && SE.get(conceptId);
    var cv = SE.canvas(canvasEl);
    var draw = make ? make(cv, SE.DATA) : (registered && registered.preview);

    if (typeof draw !== 'function') {
      /* A concept with no preview gets a quiet placeholder rather than an
         empty black rectangle that reads as a broken card. */
      var hue = SE.hexToRgb((registered && registered.accent) || '#5c5c68');
      draw = function (ctx, w, h, t) {
        var step = 22;
        ctx.strokeStyle = 'rgba(' + hue.join(',') + ',0.16)';
        ctx.lineWidth = 1;
        for (var x = -h; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + h, h);
          ctx.stroke();
        }
      };
    }
    var heat = 0, heatTarget = 0, t = 0, visible = false, subscribed = false;

    cv.observe(function () { frame(0); });

    function frame(dt) {
      if (!SE.env.reduced) {
        t += dt;
        heat = SE.math.damp(heat, heatTarget, 5, dt);
      } else {
        t = 3.2;                       /* a considered static frame, not t=0 */
        heat = heatTarget;
      }
      cv.clear();
      cv.ctx.save();
      draw(cv.ctx, cv.w, cv.h, t, heat);
      cv.ctx.restore();
    }

    function sync() {
      if (visible) { cv.resize(); }
      var want = visible && !paused && !SE.env.reduced;
      if (want && !subscribed) { SE.ticker.add(frame); subscribed = true; }
      else if (!want && subscribed) { SE.ticker.remove(frame); subscribed = false; }
      if (visible) frame(0);
      else cv.release();
    }

    /* A generous rootMargin so a card has its bitmap back before it is on
       screen, and the first drawn frame is never blank. */
    var io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0, rootMargin: '300px 0px 300px 0px' });
    io.observe(canvasEl);

    var api = {
      setHeat: function (v) { heatTarget = v; if (SE.env.reduced) frame(0); },
      destroy: function () {
        io.disconnect();
        SE.ticker.remove(frame);
        cv.destroy();
        var i = live.indexOf(api);
        if (i >= 0) live.splice(i, 1);
      },
      _sync: sync
    };
    live.push(api);
    return api;
  };

  /* The stage covers the index entirely; keeping six canvases painting behind
     an opaque overlay is pure waste. */
  SE.pausePreviews = function (v) {
    paused = v;
    live.forEach(function (p) { p._sync(); });
  };

})(window.SE = window.SE || {});

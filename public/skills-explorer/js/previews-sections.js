/* ============================================================================
   PREVIEWS  -  miniatures for the five section-level Skills concepts.
   ----------------------------------------------------------------------------
   Kept out of previews.js so the built-in page concepts and the section
   concepts stay separable. Same factory contract: (cv, DATA) -> draw.
   ========================================================================== */
(function (SE) {
  'use strict';

  var TAU = Math.PI * 2;
  var R = SE.previewRenderers;

  /* ---------------------------------------------------------------- SIGNAL */
  R.signal = function (cv, D) {
    var rand = SE.rng(90210);
    var n = 18;
    var peaks = [];
    for (var i = 0; i < n; i++) {
      var cat = D.categories[Math.floor(i / 3) % D.categories.length];
      peaks.push({ x: (i + 0.5) / n, a: 0.3 + rand() * 0.7, rgb: SE.hexToRgb(cat.accent) });
    }
    var sigma = 0.42 / n;

    function env(x) {
      var y = 0;
      for (var i = 0; i < peaks.length; i++) {
        var d = (x - peaks[i].x) / sigma;
        if (d > -3.4 && d < 3.4) y += peaks[i].a * Math.exp(-0.5 * d * d);
      }
      return y;
    }

    return function (ctx, w, h, t, heat) {
      var pad = w * 0.05;
      var iw = w - pad * 2;
      var base = h * 0.68;
      var amp = h * 0.34;
      var head = ((t * (0.16 + heat * 0.2)) % 1.25);
      var drawn = Math.min(1, head);

      ctx.strokeStyle = 'rgba(236,236,239,0.05)';
      ctx.lineWidth = 1;
      for (var g = 0; g < 3; g++) {
        var gy = Math.round(base - (g / 2) * amp) + 0.5;
        ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(w - pad, gy); ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(236,236,239,0.10)';
      ctx.beginPath();
      ctx.moveTo(pad, Math.round(base) + 0.5);
      ctx.lineTo(w - pad, Math.round(base) + 0.5);
      ctx.stroke();

      var step = 2 / iw, x = 0, run = null;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';

      function flush() {
        if (!run) return;
        ctx.strokeStyle = 'rgba(' + run.join(',') + ',0.9)';
        ctx.stroke();
        run = null;
      }

      while (x <= drawn) {
        var pi = Math.min(peaks.length - 1, Math.floor(x * n));
        var rgb = peaks[pi].rgb;
        if (!run || run !== rgb) {
          flush();
          run = rgb;
          ctx.beginPath();
          ctx.moveTo(pad + x * iw, base - env(x) * amp);
        }
        var e = env(x);
        var noise = (1 - Math.min(1, e)) * Math.sin(x * 480) * 1.2;
        ctx.lineTo(pad + x * iw, base - e * amp + noise);
        x += step;
      }
      flush();

      if (drawn < 1) {
        var lx = pad + drawn * iw;
        var ly = base - env(drawn) * amp;
        ctx.strokeStyle = 'rgba(236,236,239,0.2)';
        ctx.beginPath(); ctx.moveTo(lx, base - amp); ctx.lineTo(lx, base + h * 0.06); ctx.stroke();
        ctx.beginPath(); ctx.arc(lx, ly, 2.6, 0, TAU);
        ctx.fillStyle = '#fff'; ctx.fill();
      }
    };
  };

  /* --------------------------------------------------------------- COLUMNS */
  R.columns = function (cv, D) {
    var cats = D.categories;
    return function (ctx, w, h, t, heat) {
      var n = cats.length;
      var open = Math.floor((t * (0.28 + heat * 0.35)) % n);
      var frac = ((t * (0.28 + heat * 0.35)) % 1);
      var eased = frac < 0.18 ? frac / 0.18 : 1;
      var gap = 2;
      var openW = w * 0.42;
      var restW = (w - openW - gap * (n - 1)) / (n - 1);

      var x = 0;
      for (var i = 0; i < n; i++) {
        var isOpen = i === open;
        var cw = isOpen ? restW + (openW - restW) * eased : restW;
        var rgb = SE.hexToRgb(cats[i].accent);

        var gr = ctx.createLinearGradient(x, 0, x, h);
        gr.addColorStop(0, 'rgba(' + rgb.join(',') + ',' + (isOpen ? 0.20 : 0.06) + ')');
        gr.addColorStop(0.6, 'rgba(11,11,15,1)');
        ctx.fillStyle = gr;
        ctx.fillRect(x, 0, cw, h);

        ctx.strokeStyle = 'rgba(' + rgb.join(',') + ',' + (isOpen ? 0.5 : 0.18) + ')';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, 0.5, cw - 1, h - 1);

        /* spine tick, then unfurled rows only on the open strip */
        ctx.fillStyle = 'rgba(236,236,239,' + (isOpen ? 0.6 : 0.22) + ')';
        ctx.fillRect(x + 7, 9, Math.min(cw - 14, 12), 2);

        if (isOpen && cw > 40) {
          var rows = cats[i].skills.length;
          for (var r = 0; r < rows; r++) {
            var rowA = Math.max(0, Math.min(1, (eased - r * 0.08) / 0.3));
            if (rowA <= 0) continue;
            var ry = h * 0.34 + r * Math.min(14, h * 0.085);
            if (ry > h - 10) break;
            ctx.fillStyle = 'rgba(236,236,239,' + (0.42 * rowA) + ')';
            ctx.fillRect(x + 10, ry, (cw - 24) * (0.45 + (r % 3) * 0.18) * rowA, 2);
            ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (0.55 * rowA) + ')';
            ctx.fillRect(x + cw - 16, ry, 6, 2);
          }
        }
        x += cw + gap;
      }
    };
  };

  /* ------------------------------------------------------------------ MASK */
  R.mask = function (cv, D) {
    var cats = D.categories;
    return function (ctx, w, h, t, heat) {
      var n = cats.length;
      var p = (t * (0.16 + heat * 0.2)) % n;
      var i0 = Math.floor(p), f = p - i0;
      var i1 = (i0 + 1) % n;
      var roll = h * 0.9;

      function fit(word, tw, th) {
        ctx.font = '700 100px "Space Grotesk", sans-serif';
        var m = ctx.measureText(word).width || 1;
        return Math.max(20, Math.min(100 * (tw / m), th));
      }

      var wa = cats[i0].label.toUpperCase();
      var wb = cats[i1].label.toUpperCase();
      var fa = fit(wa, w * 0.86, h * 0.6);
      var fb = fit(wb, w * 0.86, h * 0.6);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#14141a';
      ctx.font = '700 ' + fa + 'px "Space Grotesk", sans-serif';
      ctx.fillText(wa, w / 2, h / 2 - f * roll);
      ctx.font = '700 ' + fb + 'px "Space Grotesk", sans-serif';
      ctx.fillText(wb, w / 2, h / 2 + (1 - f) * roll);
      ctx.restore();

      /* the field, painted only inside the letterforms */
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      var rowH = Math.max(7, h * 0.075);
      ctx.font = '500 ' + Math.round(rowH * 0.6) + 'px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      var names = cats[i0].skills.map(function (s) { return s.name.toUpperCase(); });
      var rgb = SE.hexToRgb(cats[i0].accent);
      for (var r = 0; r * rowH < h + rowH; r++) {
        var dir = r % 2 ? 1 : -1;
        var off = ((t * (22 + (r % 3) * 14) * dir) % 400) - 400;
        var x = off, k = r, guard = 0;
        while (x < w + 20 && guard++ < 30) {
          var word = names[k % names.length];
          ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (0.65 + ((k + r) % 3) * 0.15) + ')';
          ctx.fillText(word, x, r * rowH + rowH * 0.5);
          x += ctx.measureText(word).width + rowH * 0.5;
          k++;
        }
      }
      ctx.restore();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(236,236,239,' + (0.2 + heat * 0.15) + ')';
      ctx.font = '700 ' + fa + 'px "Space Grotesk", sans-serif';
      ctx.strokeText(wa, w / 2, h / 2 - f * roll);
      ctx.font = '700 ' + fb + 'px "Space Grotesk", sans-serif';
      ctx.strokeText(wb, w / 2, h / 2 + (1 - f) * roll);
      ctx.restore();
    };
  };

  /* ---------------------------------------------------------------- PLATES */
  R.plates = function (cv, D) {
    var cats = D.categories;
    return function (ctx, w, h, t, heat) {
      var n = cats.length;
      var p = (t * (0.2 + heat * 0.28)) % n;

      for (var i = 0; i < n; i++) {
        var d = i - p;
        if (d < -1.2 || d > 3.4) continue;
        var s = d <= 0 ? 1 + d * 0.07 : 1;
        var y = d <= 0 ? 0 : d * h * 0.34;
        var dim = d < 0 ? Math.min(0.82, -d * 0.9) : 0;
        var rgb = SE.hexToRgb(cats[i].accent);
        var pw = w * s, ph = h * s;
        var px = (w - pw) / 2, py = (h - ph) / 2 + y;

        var gr = ctx.createLinearGradient(px, py + ph, px + pw, py);
        gr.addColorStop(0, 'rgba(' + rgb.join(',') + ',0.26)');
        gr.addColorStop(0.55, 'rgba(10,10,14,1)');
        gr.addColorStop(1, 'rgba(10,10,14,1)');
        ctx.fillStyle = gr;
        ctx.fillRect(px, py, pw, ph);

        ctx.strokeStyle = 'rgba(' + rgb.join(',') + ',0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

        ctx.font = '700 ' + Math.round(ph * 0.34) + 'px "Space Grotesk", sans-serif';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(' + rgb.join(',') + ',0.30)';
        ctx.fillText(SE.pad(i + 1), px + 12, py + 10);

        ctx.fillStyle = 'rgba(236,236,239,0.55)';
        for (var r = 0; r < 4; r++) {
          var ry = py + ph * 0.55 + r * Math.min(11, ph * 0.09);
          if (ry > py + ph - 8) break;
          ctx.fillRect(px + pw * 0.5, ry, pw * 0.34 * (0.5 + (r % 3) * 0.22), 2);
        }

        if (dim > 0) {
          ctx.fillStyle = 'rgba(8,8,10,' + dim.toFixed(3) + ')';
          ctx.fillRect(px, py, pw, ph);
        }
      }
    };
  };

  /* ----------------------------------------------------------------- DEPTH */
  R.depth = function (cv, D) {
    var rand = SE.rng(5150);
    var items = D.skills.slice(0, 20).map(function (s, i) {
      var a = rand() * TAU;
      return {
        name: s.name.toUpperCase(),
        z: (i + 1) * 220,
        x: Math.cos(a) * (90 + (i % 3) * 90),
        y: Math.sin(a) * (60 + (i % 3) * 55),
        rgb: SE.hexToRgb(s.accent)
      };
    });
    var total = items[items.length - 1].z;
    var FOCAL = 460;

    return function (ctx, w, h, t, heat) {
      var cam = (t * (60 + heat * 90)) % total;
      var cx = w / 2, cy = h / 2;
      var scale = Math.min(w, h) / 380;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (var i = items.length - 1; i >= 0; i--) {
        var it = items[i];
        var z = it.z - cam;
        if (z < 30 || z > FOCAL * 6) continue;
        var s = FOCAL / z;
        var far = Math.max(0, Math.min(1, 1 - z / (FOCAL * 4.5)));
        var near = Math.max(0, Math.min(1, (z - 30) / (FOCAL * 0.5)));
        var a = far * near;
        if (a < 0.03) continue;
        var fs = Math.max(6, Math.min(52, 12 * s * scale));
        ctx.font = (s > 0.9 ? '500 ' : '400 ') + Math.round(fs) + 'px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(236,236,239,' + (a * 0.92).toFixed(3) + ')';
        ctx.fillText(it.name, cx + it.x * s * scale, cy + it.y * s * scale);
      }

      /* a gate frame arriving out of the far plane */
      var gz = FOCAL * 2.2 - (cam % (FOCAL * 2.4));
      if (gz > 40) {
        var gs = FOCAL / gz;
        var gw = 300 * gs * scale, gh = 200 * gs * scale;
        ctx.strokeStyle = 'rgba(167,139,250,' + (Math.max(0, 1 - gz / (FOCAL * 3)) * 0.45).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - gw, cy - gh, gw * 2, gh * 2);
      }
    };
  };

})(window.SE = window.SE || {});

/* ============================================================================
   SECTION S03  -  MASK
   ----------------------------------------------------------------------------
   The layer name is cut out of a moving field of its own technologies. Scroll
   rolls the word from one layer to the next; the field behind it swaps with it.
   Nothing is written on top of anything - the type IS the window.

   HOW THE CUT-OUT WORKS
   ---------------------
   The letterforms are painted first, then the field is painted over them with
   `source-atop`, which only marks pixels that are already opaque. That gives a
   true cut-out in one pass with no offscreen buffer.

   The obvious alternative, `destination-in`, cannot do the roll: two sequential
   destination-in passes intersect rather than union, so the outgoing and
   incoming words would erase each other and leave nothing. Drawing both words
   first, then compositing the field atop the union, is what makes a two-word
   transition possible at all.
   ========================================================================== */
(function (SE) {
  'use strict';

  var concept = {
    id: 'mask',
    num: 3,
    name: 'Mask',
    kind: 'Canvas / type as window',
    accent: '#FFB020',
    tagline: 'The layer name cut out of its own contents',
    desc: 'One enormous word per layer, with that layer\'s technologies drifting inside the ' +
          'letterforms. Scroll rolls the word to the next layer and the field goes with it.',
    interaction: 'Scroll to roll between layers. The field drifts toward the cursor. Every word is a window onto its own contents.',
    hint: 'Scroll rolls the word',
    screens: 3.2,

    mount: function (root, ctx) {
      var env = SE.env, M = SE.math, D = SE.DATA;
      var isPage = ctx.mode === 'page';
      var cats = D.categories;
      var N = cats.length;

      root.classList.add('mask', isPage ? 'is-page' : 'is-section');

      /* ------------------------------------------------------------ DOM */
      var host, rail = null, scrubber = null;
      if (isPage) {
        host = SE.el('div', 'mask__stage');
        root.appendChild(host);
      } else {
        rail = SE.scrollRail(ctx.scroller, concept.screens);
        host = SE.el('div', 'mask__stage');
        rail.sticky.appendChild(host);
        root.appendChild(rail.rail);
      }

      var canvasEl = SE.el('canvas', 'mask__canvas');
      host.appendChild(canvasEl);

      var caption = SE.el('div', 'mask__caption');
      caption.setAttribute('aria-live', 'polite');
      caption.innerHTML = '<span class="mask__ckicker"></span><span class="mask__cblurb"></span>';
      host.appendChild(caption);

      var index = null;
      if (isPage) {
        index = SE.el('div', 'mask__index');
        index.innerHTML = cats.map(function (c, i) {
          return '<button type="button" data-layer="' + i + '" style="--c-accent:' + c.accent + '">' +
                   '<i class="t-num">' + SE.pad(i + 1) + '</i>' +
                   '<b>' + c.label + '</b>' +
                   '<em>' + c.skills.map(function (s) { return s.name; }).join(', ') + '</em>' +
                 '</button>';
        }).join('');
        root.appendChild(index);
      }

      var more = null;
      if (!isPage) {
        more = SE.seeMore('Read every layer', ctx.onSeeMore);
        more.classList.add('mask__more');
        host.appendChild(more);
      }

      host.appendChild(SE.srList('Mask: each layer name cut from its own technologies', D.skills, function () {}));

      /* --------------------------------------------------------- canvas */
      var cv = SE.canvas(canvasEl);
      var cvx = cv.ctx;

      var pos = 0;            /* continuous position across layers, 0..N-1 */
      var shown = 0;
      var elapsed = 0;
      var hoverLayer = -1;

      cv.observe(function () {});

      function setCaption(i) {
        var c = cats[i];
        if (!c) return;
        host.style.setProperty('--c-accent', c.accent);
        SE.$('.mask__ckicker', caption).textContent = c.kicker;
        SE.$('.mask__cblurb', caption).textContent = c.blurb;
        SE.stageAccent && SE.stageAccent(c.accent);
      }
      setCaption(0);

      if (isPage && index) {
        index.addEventListener('pointerover', function (e) {
          var b = e.target.closest('[data-layer]');
          if (!b) return;
          hoverLayer = parseInt(b.getAttribute('data-layer'), 10);
          SE.$$('[data-layer]', index).forEach(function (n, k) {
            n.setAttribute('aria-current', String(k === hoverLayer));
          });
        });
        index.addEventListener('focusin', function (e) {
          var b = e.target.closest('[data-layer]');
          if (b) hoverLayer = parseInt(b.getAttribute('data-layer'), 10);
        });
      }

      if (!isPage) {
        scrubber = SE.scrub(ctx.scroller, rail.rail, function (p) {
          pos = p * (N - 1);
        });
      }

      /* --------------------------------------------------------- drawing */
      function fitFont(text, targetW, targetH) {
        cvx.font = '700 100px "Space Grotesk", sans-serif';
        var wpx = cvx.measureText(text).width || 1;
        return M.clamp(Math.min(100 * (targetW / wpx), targetH), 28, 460);
      }

      function paintField(catIndex, offsetY, alpha) {
        var cat = cats[catIndex];
        if (!cat) return;
        var rgb = SE.hexToRgb(cat.accent);
        var names = cat.skills.map(function (s) { return s.name.toUpperCase(); });
        var rowH = Math.max(12, cv.h * 0.036);   /* dense enough that a letterform reads as a window, not a stencil */
        var rows = Math.ceil(cv.h / rowH) + 2;
        var px = env.reduced ? 0 : SE.pointer.dnx * 26;

        cvx.textBaseline = 'middle';
        cvx.textAlign = 'left';
        cvx.font = '500 ' + Math.round(rowH * 0.74) + 'px "JetBrains Mono", monospace';

        for (var r = 0; r < rows; r++) {
          var y = r * rowH + offsetY % rowH - rowH;
          var dir = r % 2 ? 1 : -1;
          var speed = 18 + (r % 4) * 11;
          var shift = ((elapsed * speed * dir) % 600) + px * dir * 0.4;
          var x = shift - 600;
          var k = r;
          while (x < cv.w + 40) {
            var word = names[k % names.length];
            var a = (0.82 + ((k + r) % 3) * 0.18) * alpha;   /* the field must clear 4.5:1 inside the aperture */
            cvx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a.toFixed(3) + ')';
            cvx.fillText(word, x, y);
            x += cvx.measureText(word).width + rowH * 0.5;
            k++;
          }
        }
      }

      function render() {
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4) return;
        cv.clear();

        var i0 = M.clamp(Math.floor(shown), 0, N - 1);
        var i1 = M.clamp(i0 + 1, 0, N - 1);
        var f = M.clamp(shown - i0, 0, 1);
        var rollY = h * 0.62;   /* short enough that one word is always in frame mid-roll */

        var targetW = w * (env.mobile ? 0.94 : 0.86);
        var targetH = h * (env.mobile ? 0.42 : 0.62);

        var wordA = cats[i0].label.toUpperCase();
        var fsA = fitFont(wordA, targetW, targetH);
        var wordB = i1 !== i0 ? cats[i1].label.toUpperCase() : null;
        var fsB = wordB ? fitFont(wordB, targetW, targetH) : 0;

        /* 1. the letterforms, as the union both words paint into */
        cvx.save();
        cvx.textAlign = 'center';
        cvx.textBaseline = 'middle';
        /* Dark fill, not white. This is a window, and the parts of the window
           the field has not reached should read as unlit glass. A white fill
           makes the word look like solid type with confetti on it. */
        cvx.fillStyle = '#14141a';
        cvx.font = '700 ' + fsA + 'px "Space Grotesk", sans-serif';
        cvx.fillText(wordA, w / 2, h / 2 - f * rollY);
        if (wordB) {
          cvx.font = '700 ' + fsB + 'px "Space Grotesk", sans-serif';
          cvx.fillText(wordB, w / 2, h / 2 + (1 - f) * rollY);
        }
        cvx.restore();

        /* 2. the field, painted only where the letterforms already are */
        cvx.save();
        cvx.globalCompositeOperation = 'source-atop';
        paintField(i0, 0, 1 - f * 0.55);
        if (f > 0.001 && i1 !== i0) paintField(i1, h * 0.5, f);
        cvx.restore();

        /* 3. the outline, so the shape survives wherever the field is sparse */
        cvx.save();
        cvx.textAlign = 'center';
        cvx.textBaseline = 'middle';
        cvx.lineWidth = 1;
        cvx.strokeStyle = 'rgba(236,236,239,0.22)';
        cvx.font = '700 ' + fsA + 'px "Space Grotesk", sans-serif';
        cvx.strokeText(wordA, w / 2, h / 2 - f * rollY);
        if (wordB) {
          cvx.font = '700 ' + fsB + 'px "Space Grotesk", sans-serif';
          cvx.strokeText(wordB, w / 2, h / 2 + (1 - f) * rollY);
        }
        cvx.restore();
      }

      /* ------------------------------------------------------------ tick */
      var lastCaption = -1;

      function tick(dt) {
        elapsed += env.reduced ? 0 : dt;

        /* Damp toward the ROUNDED layer, not the continuous scroll position.
           Scrubbing the position directly leaves the word off-centre at almost
           every scroll offset; rounding makes it rest centred and roll quickly
           between, which reads as arrival rather than as drift. */
        var target = Math.round(pos);
        if (isPage) {
          target = hoverLayer >= 0 ? hoverLayer : (env.reduced ? 0 : Math.round((elapsed * 0.22) % N));
        }
        shown = env.reduced ? target : M.damp(shown, target, 5.5, dt);

        var ci = M.clamp(Math.round(shown), 0, N - 1);
        if (ci !== lastCaption) { lastCaption = ci; setCaption(ci); }
        if (more) more.classList.toggle('is-on', pos > 0.35);

        render();
      }
      SE.ticker.add(tick);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          if (scrubber) scrubber.kill();
          if (rail) rail.destroy();
          cv.destroy();
          root.classList.remove('mask', 'is-page', 'is-section');
          root.innerHTML = '';
        }
      };
    }
  };

  (SE.sections = SE.sections || {})[concept.id] = concept;
})(window.SE = window.SE || {});

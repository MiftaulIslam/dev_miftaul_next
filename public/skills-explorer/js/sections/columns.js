/* ============================================================================
   SECTION S02  -  COLUMNS
   ----------------------------------------------------------------------------
   Six vertical strips, one per layer. At rest they are a set of spines. Open
   one and it takes the room from the others; its label swings from vertical to
   horizontal and its technologies unfurl.

   ON ANIMATING FLEX-GROW
   ----------------------
   Transform and opacity are the rule, and this breaks it deliberately. An
   accordion has no transform equivalent: scaling a strip squashes its type, so
   the text would need a counter-scale that no longer matches its own metrics.
   Six elements relaying out once per intent - not per frame - is the correct
   trade, and it is the same exemption a height-animated accordion gets.
   ========================================================================== */
(function (SE) {
  'use strict';

  var concept = {
    id: 'columns',
    num: 2,
    name: 'Columns',
    kind: 'DOM / accordion strips',
    accent: '#3DDC97',
    tagline: 'Six spines that take the room from each other',
    desc: 'At rest, six vertical strips. Open one and it claims the width, its label swings ' +
          'horizontal, and its technologies unfurl in sequence.',
    interaction: 'Hover or tap a strip to open it. Scroll drifts the strips against each other. Arrow keys step between layers.',
    hint: 'Hover a strip to open it',
    screens: 1,

    mount: function (root, ctx) {
      var env = SE.env, M = SE.math, D = SE.DATA;
      var isPage = ctx.mode === 'page';
      var cats = D.categories;

      root.classList.add('columns', isPage ? 'is-page' : 'is-section');

      var head = SE.el('div', 'columns__head');
      head.innerHTML =
        '<h2 class="columns__title">' + (isPage ? 'All six, open at once' : 'Six layers, one at a time') + '</h2>' +
        '<p class="columns__lede">' + (isPage
          ? 'The accordion opened all the way. Every layer, every technology, every role, held side by side.'
          : 'Each strip holds a layer of the stack. Open one and the others make room.') + '</p>';
      root.appendChild(head);

      var strips = SE.el('div', 'columns__set');
      strips.setAttribute('role', 'tablist');
      strips.setAttribute('aria-label', 'Stack layers');
      root.appendChild(strips);

      var items = cats.map(function (cat, i) {
        var el = SE.el('article', 'columns__strip');
        el.style.setProperty('--c-accent', cat.accent);
        el.style.setProperty('--i', i);
        el.setAttribute('data-col', String(i));

        var rows = cat.skills.map(function (s, k) {
          return '<li style="--k:' + k + '">' +
                   '<span class="columns__sname">' + s.name + '</span>' +
                   '<span class="columns__srole">' + s.role + '</span>' +
                   (isPage ? '<span class="columns__snote">' + s.note + '</span>' : '') +
                   '<span class="columns__syr t-num">' + s.years + '</span>' +
                 '</li>';
        }).join('');

        el.innerHTML =
          '<button class="columns__spine" type="button" role="tab" aria-selected="false">' +
            '<span class="columns__idx t-num">' + SE.pad(i + 1) + '</span>' +
            '<span class="columns__vlabel">' + cat.label + '</span>' +
            '<span class="columns__count t-num">' + SE.pad(cat.skills.length) + '</span>' +
          '</button>' +
          '<div class="columns__body">' +
            '<div class="columns__inner">' +
              '<h3 class="columns__hlabel">' + cat.label + '</h3>' +
              '<p class="columns__kicker">' + cat.kicker + '</p>' +
              '<p class="columns__blurb">' + cat.blurb + '</p>' +
              '<ul class="columns__list">' + rows + '</ul>' +
            '</div>' +
          '</div>';

        strips.appendChild(el);
        return { el: el, cat: cat, inner: SE.$('.columns__inner', el), spine: SE.$('.columns__spine', el) };
      });

      var more = null;
      if (!isPage) {
        more = SE.seeMore('Open every layer', ctx.onSeeMore);
        more.classList.add('columns__more');
        root.appendChild(more);
      }

      /* --------------------------------------------------------- opening */
      var open = isPage ? -1 : 0;

      function setOpen(i) {
        if (isPage) return;
        open = i;
        items.forEach(function (it, k) {
          var on = k === i;
          it.el.classList.toggle('is-open', on);
          it.spine.setAttribute('aria-selected', String(on));
          it.spine.setAttribute('tabindex', on ? '0' : '-1');
        });
        if (i >= 0) SE.stageAccent && SE.stageAccent(cats[i].accent);
      }

      if (!isPage) {
        setOpen(0);

        if (env.fine) {
          strips.addEventListener('pointerover', function (e) {
            var s = e.target.closest('[data-col]');
            if (!s) return;
            setOpen(parseInt(s.getAttribute('data-col'), 10));
          });
        }
        strips.addEventListener('click', function (e) {
          var s = e.target.closest('[data-col]');
          if (!s) return;
          setOpen(parseInt(s.getAttribute('data-col'), 10));
        });
        strips.addEventListener('keydown', function (e) {
          var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!dir) return;
          e.preventDefault();
          var next = M.clamp(open + dir, 0, items.length - 1);
          setOpen(next);
          items[next].spine.focus();
        });
      } else {
        items.forEach(function (it) { it.el.classList.add('is-open'); });
      }

      /* -------------------------------------------------------- parallax */
      /* The strips drift against each other as the section passes. This is the
         only reason the section reads as depth rather than as a widget: six
         planes moving at five different rates. */
      var scrubber = null;
      if (!isPage && ctx.scroller && !env.reduced) {
        scrubber = SE.scrub(ctx.scroller, root, function (p) {
          var d = (p - 0.5) * 2;                    /* -1 .. 1 across the pass */
          for (var i = 0; i < items.length; i++) {
            var rate = ((i % 3) - 1) * 26 + (i % 2 ? 8 : -8);
            items[i].inner.style.transform = 'translate3d(0,' + (d * rate).toFixed(1) + 'px,0)';
          }
        });
      }

      return {
        destroy: function () {
          if (scrubber) scrubber.kill();
          root.classList.remove('columns', 'is-page', 'is-section');
          root.innerHTML = '';
        }
      };
    }
  };

  (SE.sections = SE.sections || {})[concept.id] = concept;
})(window.SE = window.SE || {});

/* ============================================================================
   SECTION S04  -  PLATES
   ----------------------------------------------------------------------------
   Six full-bleed plates that stick and stack. Each layer arrives over the last,
   which recedes and dims behind it rather than scrolling away. By the end the
   reader has physically travelled down through the stack.

   REAL STICKY-STACK, NOT A REVEAL LIST
   ------------------------------------
   The common failure is a sequence of sections that merely fade in as they
   enter - it looks similar in a screenshot and feels nothing alike. Here every
   plate genuinely holds at the top of the viewport while the next one climbs
   over it, and the outgoing plate's scale and scrim are scrubbed by the
   INCOMING plate's position, which is what couples them.
   ========================================================================== */
(function (SE) {
  'use strict';

  var concept = {
    id: 'plates',
    num: 4,
    name: 'Plates',
    kind: 'Sticky stack / GSAP',
    accent: '#FF6A3D',
    tagline: 'Six plates that stack as you descend',
    desc: 'Each layer holds the frame while the next climbs over it. The one behind recedes ' +
          'instead of leaving, so the stack accumulates as you read down it.',
    interaction: 'Scroll to descend through the layers. Each plate holds, then the next takes the frame. The stack stays behind you.',
    hint: 'Scroll descends the stack',
    screens: 1,

    mount: function (root, ctx) {
      var env = SE.env, M = SE.math, D = SE.DATA;
      var isPage = ctx.mode === 'page';
      var gsap = window.gsap;
      var cats = D.categories;

      root.classList.add('plates', isPage ? 'is-page' : 'is-section');

      /* ---------------------------------------------------------- rail */
      var railIdx = null;
      if (isPage) {
        railIdx = SE.el('nav', 'plates__rail');
        railIdx.setAttribute('aria-label', 'Layers');
        railIdx.innerHTML = cats.map(function (c, i) {
          return '<a href="#plate-' + c.id + '" data-r="' + i + '" style="--c-accent:' + c.accent + '">' +
                 '<i class="t-num">' + SE.pad(i + 1) + '</i><span>' + c.label + '</span></a>';
        }).join('');
        root.appendChild(railIdx);
      }

      var stack = SE.el('div', 'plates__stack');
      root.appendChild(stack);

      var plates = cats.map(function (cat, i) {
        var el = SE.el('section', 'plates__plate');
        el.id = 'plate-' + cat.id;
        el.style.setProperty('--c-accent', cat.accent);
        el.style.setProperty('--i', i);
        el.setAttribute('aria-label', cat.label + ' layer');

        var rows = cat.skills.map(function (s, k) {
          return '<li style="--k:' + k + '">' +
                   '<i class="t-num">' + SE.pad(k + 1) + '</i>' +
                   '<span class="plates__sname">' + s.name + '</span>' +
                   '<span class="plates__srole">' + s.role + '</span>' +
                   (isPage ? '<span class="plates__snote">' + s.note + '</span>' : '') +
                   '<span class="plates__syr t-num">' + s.years + ' yr</span>' +
                 '</li>';
        }).join('');

        el.innerHTML =
          '<div class="plates__wash" aria-hidden="true"></div>' +
          '<div class="plates__grid">' +
            '<div class="plates__lead">' +
              '<span class="plates__num t-num" aria-hidden="true">' + SE.pad(i + 1) + '</span>' +
              '<h3 class="plates__name">' + cat.label + '</h3>' +
              '<p class="plates__kicker">' + cat.kicker + '</p>' +
              '<p class="plates__blurb">' + cat.blurb + '</p>' +
            '</div>' +
            '<ul class="plates__list">' + rows + '</ul>' +
          '</div>' +
          '<div class="plates__scrim" aria-hidden="true"></div>';

        stack.appendChild(el);
        return { el: el, cat: cat, scrim: SE.$('.plates__scrim', el) };
      });

      var more = null;
      if (!isPage) {
        more = SE.seeMore('Read the whole stack', ctx.onSeeMore);
        more.classList.add('plates__more');
        plates[plates.length - 1].el.querySelector('.plates__grid').appendChild(more);
        more.classList.add('is-on');
      }

      /* -------------------------------------------------------- sizing */
      var ro = null;
      function size() {
        var h = (ctx.scroller ? ctx.scroller.clientHeight : window.innerHeight);
        root.style.setProperty('--vh', h + 'px');
      }
      if (!isPage && ctx.scroller) {
        size();
        if (typeof ResizeObserver !== 'undefined') {
          ro = new ResizeObserver(size);
          ro.observe(ctx.scroller);
        }
      }

      /* --------------------------------------------------- choreography */
      var triggers = [];

      if (!isPage && gsap && window.ScrollTrigger && !env.reduced) {
        plates.forEach(function (p, i) {
          if (i === plates.length - 1) return;
          var next = plates[i + 1].el;
          var tw = gsap.to(p.el, {
            scale: 0.93,
            ease: 'none',
            scrollTrigger: {
              scroller: ctx.scroller,
              trigger: next,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true
            }
          });
          triggers.push(tw.scrollTrigger);

          var tw2 = gsap.to(p.scrim, {
            opacity: 0.78,
            ease: 'none',
            scrollTrigger: {
              scroller: ctx.scroller,
              trigger: next,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true
            }
          });
          triggers.push(tw2.scrollTrigger);
        });
      }

      /* Page mode: a left rail that tracks which layer is in view. */
      var io = null;
      if (isPage && railIdx) {
        var links = SE.$$('a', railIdx);
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var i = plates.findIndex(function (p) { return p.el === e.target; });
            links.forEach(function (a, k) { a.setAttribute('aria-current', String(k === i)); });
            if (i >= 0) SE.stageAccent && SE.stageAccent(cats[i].accent);
          });
        }, { root: ctx.scroller || null, threshold: 0.45 });
        plates.forEach(function (p) { io.observe(p.el); });
      }

      return {
        destroy: function () {
          triggers.forEach(function (t) { t && t.kill(); });
          if (gsap) gsap.killTweensOf(plates.map(function (p) { return p.el; }));
          if (io) io.disconnect();
          if (ro) ro.disconnect();
          root.classList.remove('plates', 'is-page', 'is-section');
          root.innerHTML = '';
        }
      };
    }
  };

  (SE.sections = SE.sections || {})[concept.id] = concept;
})(window.SE = window.SE || {});

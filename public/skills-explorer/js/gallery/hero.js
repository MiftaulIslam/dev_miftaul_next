/* ============================================================================
   AREA: HERO  -  10 concepts (5 page, 5 section)
   ----------------------------------------------------------------------------
   A hero is the first five seconds. It is not a decorative band at the top of a
   page; it is the moment the reader decides whether the rest is worth reading.
   So every concept in this file is built around one claim - this is Miftaul
   Islam, this is what he builds - and the motion exists only to make that claim
   land, hold, and then get out of the way.

   THE RULE THAT SHAPES ALL TEN
   ----------------------------
   A hero is seen once per visit and looked at for about four seconds. That puts
   it at the far end of the frequency scale from, say, a nav link, so the whole
   expressive budget is available here in a way it is nowhere else on the site.
   What it does NOT buy is a hero that keeps performing after it has been read.
   Every page concept below settles: the entry choreography runs once, resolves
   into a composition that would be worth screenshotting with no motion at all,
   and afterwards only responds to the pointer. Nothing here loops forever
   because it looked good in a preview.

   PAGE VERSUS SECTION
   -------------------
   The five page concepts own the viewport and may hold the reader still. The
   five section concepts sit inside a scrolling page with real neighbours above
   and below: they consume scroll rather than fight it, they always release, and
   each one offers a way through to the full argument. A section that traps the
   reader is a page concept wearing the wrong label.

   WHY SO LITTLE WEBGL
   -------------------
   Nine of these ten are typography. Type on a 2D canvas is native, crisp, and
   subpixel-correct at any DPR; type in WebGL means rendering glyph atlases to
   textures and billboarding quads, which costs a 600kb dependency to produce a
   blurrier result. Canvas is used where there is a real field to paint (a
   particle horizon, a masked letterform field) and plain DOM everywhere the
   thing on screen is words the reader has to read.
   ========================================================================== */
(function (SE) {
  'use strict';

  var env = SE.env;
  var M = SE.math;
  var TAU = Math.PI * 2;

  /* ======================================================================
     IDENTITY
     ----------------------------------------------------------------------
     Invented in this file per the contract, but invented to be plausible and
     kept identical across all ten concepts, because ten art directions of the
     same person is the comparison being offered. If the copy drifted between
     them, the reader would be comparing the writing instead of the design.

     The value line is one sentence, concrete, and states a consequence rather
     than a capability. "Experienced backend engineer" tells you nothing that
     a job title did not already tell you.
     ====================================================================== */

  var IDENT = {
    first: 'Miftaul',
    last: 'Islam',
    full: 'Miftaul Islam',
    role: 'Full stack developer',
    focus: 'TypeScript, Postgres, and the seams between services',
    place: 'Dhaka, working remote',
    status: 'One project slot open from March',
    statusShort: 'One slot open, March',
    value: 'I build the half of a product that still has to be standing at 3am.',
    valueAlt: 'The interesting problems are never in the interface. They are in what happens when it is 3am and the queue is behind.',
    years: 9,
    shipped: 24,
    running: 11,
    mail: 'hello@miftaul.dev'
  };

  /* Uppercase ledger of the same identity, used by the concepts that set type
     on canvas. Kept here so a change to the name cannot desynchronise the
     canvas concepts from the DOM ones. */
  var CAPS = {
    first: IDENT.first.toUpperCase(),
    last: IDENT.last.toUpperCase(),
    role: IDENT.role.toUpperCase()
  };

  /* ======================================================================
     SHARED HELPERS
     ====================================================================== */

  var seq = 0;
  function uid(p) { seq += 1; return 'hero-' + p + '-' + seq; }

  /* A canvas is a pixel surface with no accessibility tree. SE.srList is the
     shared mirror, and it expects the skills data shape, so hero content is
     expressed in those same four fields rather than forking the helper. Tab
     order matches reading order on screen. */
  function srRows(extra) {
    var rows = [
      { name: IDENT.full, categoryLabel: 'Name', role: IDENT.role, note: IDENT.value },
      { name: IDENT.focus, categoryLabel: 'Focus', role: 'Day to day', note: 'The stack the work actually runs on.' },
      { name: IDENT.status, categoryLabel: 'Availability', role: 'Current', note: IDENT.place + '.' }
    ];
    return extra ? rows.concat(extra) : rows;
  }

  function srMirror(label, extra) {
    return SE.srList(label, srRows(extra), function () {});
  }

  /* Wrap every character of `text` in its own element. Used by the concepts
     that animate per glyph. Spaces get a non-breaking space so the line does
     not collapse, and each element carries its index so CSS can stagger from
     a custom property instead of one tween per letter. */
  function splitChars(text, cls) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var n = SE.el('i', cls);
      n.textContent = ch === ' ' ? ' ' : ch;
      n.style.setProperty('--k', String(i));
      n.setAttribute('aria-hidden', 'true');
      frag.appendChild(n);
    }
    return frag;
  }

  /* A word split into per-glyph elements needs the whole word available to a
     screen reader as one string, or it is read out letter by letter. */
  function glyphWord(text, wrapCls, charCls) {
    var w = SE.el('span', wrapCls);
    w.appendChild(splitChars(text, charCls));
    var sr = SE.el('span', 'sr-only', text);
    w.appendChild(sr);
    return w;
  }

  /* One IntersectionObserver helper for the entry reveals, so no concept has
     to remember to disconnect. Fires once. */
  function onceVisible(el, fn, threshold) {
    if (typeof IntersectionObserver === 'undefined') { fn(); return { destroy: function () {} }; }
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      fn();
    }, { threshold: threshold == null ? 0.25 : threshold });
    io.observe(el);
    return { destroy: function () { io.disconnect(); } };
  }

  /* Section concepts here are reachable at #/c/<id>/full as well as inside the
     page frame, so each has to survive being mounted with mode 'page'. This
     wraps the two hosts once so a concept body never branches on it again. */
  function shellFor(root, ctx, cls, screens) {
    var isPage = ctx.mode === 'page';
    root.classList.add(cls, isPage ? 'is-page' : 'is-section');

    var api = { isPage: isPage, rail: null, host: SE.el('div', cls + '__view') };
    if (isPage) {
      root.appendChild(api.host);
    } else {
      api.rail = SE.scrollRail(ctx.scroller, screens);
      api.rail.sticky.appendChild(api.host);
      root.appendChild(api.rail.rail);
    }

    api.destroy = function () {
      if (api.rail) api.rail.destroy();
      root.classList.remove(cls, 'is-page', 'is-section');
      root.innerHTML = '';
    };
    return api;
  }

  /* The standard pair of hero actions. Composed per concept rather than
     rendered from one template, because a shared button row is exactly how ten
     art directions start looking like one art direction with ten skins - so
     this only builds the nodes and leaves placement and styling to the caller. */
  function actions(cls, secondLabel, onSecond) {
    var wrap = SE.el('div', cls);
    var a = SE.el('button', 'btn btn--sm', 'See the work');
    a.type = 'button';
    a.addEventListener('click', function () {
      SE.toast && SE.toast('Demo hero', 'In the real build this routes to /work');
    });
    wrap.appendChild(a);

    if (secondLabel) {
      var b = SE.el('button', 'btn btn--sm btn--ghost', secondLabel);
      b.type = 'button';
      b.addEventListener('click', onSecond);
      wrap.appendChild(b);
    }
    return wrap;
  }

  /* ======================================================================
     P01  APERTURE
     ----------------------------------------------------------------------
     An iris opens onto the name, and a raking light crosses it once as it
     settles. The idea is a lens, not a curtain: the plate that hides the
     composition is a real many-bladed aperture with a polygonal opening, and
     after the entry it stays on screen as a corner vignette that the pointer
     can stop down and open up again.

     WHY THE OCCLUDER IS A CANVAS ON TOP OF DOM
     ------------------------------------------
     The revealed content is real HTML: a real h1, real buttons, real focus
     order. Only the thing hiding it is painted. A clip-path on the content
     would have worked visually and cost the composition its text selection,
     its subpixel type rendering, and its ability to be read by anything that
     does not run JavaScript. The mask is the effect, so the mask is what gets
     drawn.
     ====================================================================== */

  SE.register({
    area: 'hero',
    variant: 'page',
    id: 'hero-page-aperture',
    num: 1,
    name: 'Aperture',
    kind: 'Canvas / iris reveal',
    accent: '#C9A96A',
    tagline: 'The name arrives the way a lens opens',
    desc: 'A ten bladed iris opens onto the name and a raking light crosses it once as it settles. ' +
          'The blades stay as a corner vignette that the pointer can stop down again.',
    interaction: 'Move up and down to change the stop; the readout tracks the real aperture value.',
    hint: 'Move vertically to change the stop',

    preview: function (ctx, w, h, t, heat) {
      var cx = w / 2, cy = h / 2;
      var R = Math.min(w, h) * 0.62;
      /* One slow open and close so the card shows the actual gesture rather
         than a still of the end state. */
      var cycle = (t * 0.26) % 1;
      var p = cycle < 0.58 ? Math.min(1, cycle / 0.34) : Math.max(0, 1 - (cycle - 0.58) / 0.24);
      p = 1 - Math.pow(1 - p, 3);
      var r = R * (0.06 + p * 0.94);
      var spin = -0.5 + p * 0.5;
      var N = 8;

      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.moveTo(cx + Math.cos(spin) * r, cy + Math.sin(spin) * r);
      for (var i = 1; i <= N; i++) {
        var a = spin + (i / N) * TAU;
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = '#0b0b0f';
      ctx.fill('evenodd');

      ctx.beginPath();
      for (var j = 0; j < N; j++) {
        var b = spin + (j / N) * TAU;
        ctx.moveTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r);
        ctx.lineTo(cx + Math.cos(b) * (r + w), cy + Math.sin(b) * (r + w));
      }
      ctx.strokeStyle = 'rgba(201,169,106,' + (0.16 + heat * 0.16).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();

      /* The name, only as much of it as the opening admits. */
      ctx.font = '500 ' + Math.round(h * 0.20) + 'px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(236,236,239,' + (0.20 + p * 0.62).toFixed(3) + ')';
      ctx.fillText('MIFTAUL', cx, cy);
    },

    spec: {
      subtitle: 'A ten bladed iris opens onto the name, then stays as a stop the pointer can change',
      philosophy: [
        'A hero reveal should be a mechanism, not a fade. A fade says the page finished loading. An iris says a lens was opened onto something that was already there, which is a materially different claim about the content.',
        'The reveal is over in 1.15 seconds and never runs again. Anything that keeps performing after the reader has read it is decoration charging rent.',
        'What survives the entry is the point: the blades do not leave. They settle into a corner vignette that the pointer stops down, so the mechanism stays honest instead of being a one time trick.'
      ],
      hierarchy: [
        '1. The name at clamp(3.5rem, 12vw, 11rem), weight 500, tracking -0.055em. It is the entire reason for the aperture.',
        '2. The value line at clamp(1rem, 1.6vw, 1.375rem) in ink-2, max 34ch. One sentence, and it states a consequence.',
        '3. The role line in mono 11px, tracking 0.2em, sitting under the name as a caption not a label.',
        '4. Two actions, primary outlined and secondary ghost, on the same baseline as the meta rows.',
        '5. The stop readout in the top right corner at mono 10px in ink-4. It is instrumentation, so it is quiet and it is real.'
      ],
      structure: [
        'Root is position:absolute inset:0 overflow:hidden, filling the stage with its own stacking context.',
        'Layer 1 (z 1): the composition, a plain <header> with h1, two <p>, a meta <dl>, and a button row. Real DOM, real focus order, readable with no JavaScript.',
        'Layer 2 (z 2): a full bleed <canvas> with pointer-events:none carrying the plate, the blades, and the light rake.',
        'Layer 3 (z 3): the stop readout, a role="status" element so a screen reader hears the aperture value change.',
        'No wrapper animates layout. The canvas is the only thing that repaints.'
      ],
      interaction: [
        'Pointer Y across the viewport maps to aperture radius: normalised -1 at the top to +1 at the bottom drives radius from 0.86 to 1.04 of the half diagonal, damped with lambda 4.',
        'That radius maps onto the real f-stop series 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, and the readout prints the nearest stop. The number is derived from what is on screen, never invented.',
        'The plate is pointer-events:none, so the composition underneath keeps every hover, click and text selection it would have had without the effect.',
        'There is no click behaviour on the canvas. A hero that hides an interaction behind a click nobody is told about has hidden it.'
      ],
      choreography: [
        { n: 'Iris open', d: 'Radius 0 to 0.96 of half diagonal over 1150ms on 1 - (1-p)^4, which is expo.out expressed as a raw curve because the value is driven per frame, not tweened. Over 300ms deliberately: a full frame reveal is a cinematic moment, not UI feedback.' },
        { n: 'Blade spin', d: 'Rotation -0.62rad to 0 across the same 1150ms and the same curve, so the blades rotate as they retract exactly the way a real iris does. Spin and radius sharing one curve is what makes it read as one mechanism.' },
        { n: 'Name rise', d: 'Two words, each in an overflow:hidden line box, translate3d(0,108%,0) to none over 900ms cubic-bezier(0.23, 1, 0.32, 1), starting at 300ms with a 90ms stagger between them. Starts before the iris finishes so the reveal catches the movement rather than showing a static word.' },
        { n: 'Light rake', d: 'A 26 degree band, width 34% of the diagonal, travelling across the full frame from 420ms to 1550ms on a linear ramp, peak alpha 0.14, faded in and out over the first and last 22% of its travel. Linear because it is a light source crossing at constant speed, not a UI element arriving.' },
        { n: 'Support fade', d: 'Value line, meta and buttons: opacity 0 to 1 with translate3d(0,14px,0) to none, 620ms cubic-bezier(0.23, 1, 0.32, 1), delays 640ms, 720ms, 800ms. The stagger is 80ms, which is the upper edge before a group starts reading as a queue.' },
        { n: 'Stop change', d: 'Radius damped toward the pointer target at lambda 4, roughly a 250ms settle. Slow enough to feel like a mechanical ring being turned, fast enough not to lag the hand.' }
      ],
      scroll: [
        'None. This is a full viewport takeover and it does not move on scroll.',
        'In a real page, put the next section flush beneath it with no scroll cue. The fold is its own affordance.'
      ],
      hover: [
        'All pointer response is gated behind @media (hover: hover) and (pointer: fine). On touch the aperture holds at its resting stop.',
        'Buttons keep the shared control treatment: a fill bar wipes up from the bottom edge over 220ms cubic-bezier(0.23, 1, 0.32, 1). Nothing bespoke, because the hero is not where a button learns a new language.'
      ],
      click: [
        'Primary action routes to the work index. Secondary opens mail.',
        'The canvas has no click target at all.'
      ],
      responsive: {
        desktop: 'Name on two lines, left aligned on the gutter, value line to its right on the same optical baseline, meta and actions on one row along the bottom.',
        tablet: 'Value line drops below the name. Meta becomes two columns. Blades stay at ten.',
        mobile: 'Below 768px this is a different composition, not a smaller one. Six blades instead of ten because a ten sided polygon on a 390px screen is a circle. The opening radius goes to 0.93 of the half diagonal, which on a tall viewport cuts the top and bottom rather than the sides, landing inside the frame padding. The name sets at 16vw, the value line moves under it, the meta collapses from four rows to two, and the buttons go full width and stack. Pointer stop control is off because there is no fine pointer to drive it, and the readout prints the resting stop.'
      },
      a11y: [
        'The composition is real HTML underneath the canvas: h1, p, dl, button. The canvas is decorative and carries aria-hidden="true".',
        'A visually hidden but focusable mirror lists the name, focus, availability and both actions, so the whole hero is reachable by keyboard and readable by a screen reader.',
        'The stop readout is role="status" aria-live="polite", so a change is announced without stealing focus.',
        'Under prefers-reduced-motion the iris is drawn once at its resting radius, the name and support content are present with no transform, there is no rake and no pointer response. Reduced means arrived, not broken.',
        'Focus ring is the shared 2px outline at 3px offset and is never removed. The canvas sits above the content but cannot obscure focus because it is transparent inside the opening.'
      ],
      perf: [
        'The whole canvas is four operations per frame: one evenodd fill for the plate and hole, one batched stroke for all blade edges, one gradient fill for the rake while it is travelling, one text free.',
        'The rake gradient is the only allocation and it only exists for 1.13 seconds.',
        'DPR capped at 2 on desktop and 1.75 on mobile. Above that you are paying for pixels nobody can resolve.',
        'When reduced motion is on, nothing subscribes to the frame loop at all; the canvas is painted once and again on resize.'
      ],
      packages: [
        { p: 'none required', w: 'One canvas, one polygon, one gradient. A tween library would add 40kb to drive a single scalar that is already being damped per frame.' },
        { p: 'gsap (installed)', w: 'Use it only for the name rise if the project already uses gsap for page transitions, so the hero shares a timeline with them. Do not use it for the iris: the radius has to retarget continuously from pointer input, which is damping, not tweening.' },
        { p: 'no three', w: 'There is no third dimension here. A WebGL context to draw one polygon is a joke at the reader expense.' }
      ],
      architecture: [
        { f: 'components/hero/Aperture.tsx', r: 'Server rendered composition. Name, value line, meta and actions exist in the HTML payload.' },
        { f: 'components/hero/ApertureIris.tsx', r: '"use client" leaf. Owns the canvas, the frame subscription and the pointer listener. Receives nothing but the accent hue.' },
        { f: 'lib/useRaf.ts', r: 'One shared frame loop for the whole site. Every animated component subscribes; nothing calls requestAnimationFrame directly.' },
        { f: 'lib/fstop.ts', r: 'Radius fraction to nearest stop. Pure, testable, and the readout cannot drift from the drawing.' }
      ],
      state: [
        'Nothing about the iris is React state. Radius, spin, elapsed and pointer are refs, because they change every frame and a re-render per frame is how a hero drops to 30fps.',
        'The f-stop label is the one exception: it changes maybe six times a second at most, so it is useState, throttled to only set when the stop index actually changes.',
        'prefers-reduced-motion is read once with matchMedia and subscribed for changes, not read on every frame.'
      ],
      typography: [
        'Name: display face weight 500 at clamp(3.5rem, 12vw, 11rem), letter-spacing -0.055em, line-height 0.84. Tight because at that size default tracking reads as a gap.',
        'Value line: display face weight 400 at clamp(1rem, 1.6vw, 1.375rem), line-height 1.5, max-width 34ch.',
        'Role, meta and the stop readout: mono at 10px and 11px, letter-spacing 0.2em, uppercase. Mono is used only for labels and measurements, never for the sentence.',
        'No kicker above the name. The name is the largest thing on the screen; labelling it is redundant.'
      ],
      color: [
        'Ground is the near black void token. Never #000: a true black kills the falloff on the rake and flattens the vignette into a hard edge.',
        'The signature hue is a warm brass and it appears exactly three times: the blade edges, the rake, and the availability dot in the meta row.',
        'The name is plain ink. Gradient text would fight the rake, which is the only light source in the composition.',
        'For a light theme, invert the ground and paint the plate in near white; the blades keep the brass because a warm edge on paper still reads as a lens.'
      ],
      spacing: [
        'Content inset is the page gutter, clamp(1.25rem, 4vw, 4.5rem), so the hero sits on the same vertical as everything beneath it.',
        'Name to value line: 1.5rem. Name to role caption: 0.75rem. Tighter above than below, because the caption belongs to the name and the value line does not.',
        'Meta row to the bottom edge: clamp(1.5rem, 5vh, 3rem), matched to the top inset so the composition is optically centred rather than mathematically centred.',
        'Actions sit on the same baseline as the meta so the bottom of the frame reads as one line, not two stacked bands.'
      ],
      relationships: [
        'Blade radius encodes the aperture value and nothing else. The readout is derived from it, so the two can never disagree.',
        'The rake direction, 26 degrees down to the right, matches the diagonal the name is set on. A raking light at a random angle would read as a lens flare sticker.',
        'The corner vignette encodes that the frame is a lens, which is what makes the pointer control discoverable at all.'
      ],
      acceptance: [
        'On load the frame is black for roughly 150ms, the opening grows and rotates as one movement, and the two words of the name are already rising as it clears them.',
        'One band of light crosses the composition and does not come back.',
        'Moving the pointer from the top to the bottom of the viewport visibly closes the corners in and the readout steps down through the real stop series.',
        'The canvas never intercepts a click: text is selectable and both buttons are hoverable everywhere in the frame.',
        'With reduced motion on there is no entry, no rake and no pointer response, and the composition is still deliberately arranged rather than left at a neutral default.',
        'At 390px the iris has six blades, the name sets on two lines, and nothing scrolls horizontally.'
      ]
    },

    mount: function (root) {
      root.classList.add('hero-aperture');

      var mob = env.mobile;
      var stopId = uid('stop');

      /* ------------------------------------------------------------ DOM */
      var frame = SE.el('header', 'hero-aperture__frame');
      frame.innerHTML =
        '<div class="hero-aperture__lead">' +
          '<h1 class="hero-aperture__name">' +
            '<span class="hero-aperture__line"><span>' + IDENT.first + '</span></span>' +
            '<span class="hero-aperture__line"><span>' + IDENT.last + '</span></span>' +
          '</h1>' +
          '<p class="hero-aperture__role">' + IDENT.role + '</p>' +
        '</div>' +
        '<div class="hero-aperture__aside">' +
          '<p class="hero-aperture__value">' + IDENT.value + '</p>' +
          '<dl class="hero-aperture__meta">' +
            '<div><dt>Available</dt><dd><i></i>' + IDENT.status + '</dd></div>' +
            '<div><dt>Based</dt><dd>' + IDENT.place + '</dd></div>' +
            '<div><dt>Shipping since</dt><dd class="t-num">' + (2026 - IDENT.years) + '</dd></div>' +
            '<div><dt>Still in production</dt><dd class="t-num">' + IDENT.running + ' of ' + IDENT.shipped + '</dd></div>' +
          '</dl>' +
        '</div>';
      root.appendChild(frame);

      var act = actions('hero-aperture__cta', 'Write to me', function () {
        SE.toast && SE.toast('Demo hero', IDENT.mail);
      });
      SE.$('.hero-aperture__lead', frame).appendChild(act);

      var canvasEl = SE.el('canvas', 'hero-aperture__iris');
      canvasEl.setAttribute('aria-hidden', 'true');
      root.appendChild(canvasEl);

      var readout = SE.el('div', 'hero-aperture__stop');
      readout.id = stopId;
      readout.setAttribute('role', 'status');
      readout.setAttribute('aria-live', 'polite');
      readout.innerHTML = '<span>Stop</span><b class="t-num">f/2.8</b>';
      root.appendChild(readout);

      root.appendChild(srMirror('Aperture: the name revealed by an opening iris', [
        { name: 'See the work', categoryLabel: 'Action', role: 'Primary', note: 'Opens the project index.' },
        { name: 'Write to me', categoryLabel: 'Action', role: 'Secondary', note: IDENT.mail }
      ]));

      /* --------------------------------------------------------- model */
      var cv = SE.canvas(canvasEl);
      var ctx = cv.ctx;
      var BLADES = mob ? 6 : 10;
      /* Resting circumradius as a fraction of the half diagonal. Tuned so the
         polygon's flat sides sit just inside the long edges of a landscape
         viewport: any larger and the aperture is invisible at rest, which
         would make the pointer control undiscoverable. On a tall phone the
         geometry inverts, so the mobile value is tuned instead to cut the top
         and bottom by about 18px, which lands inside the frame padding and
         keeps the lens legible without eating the composition. */
      var OPEN = mob ? 0.93 : 0.88;
      var STOP_MIN = 0.84;
      var STOP_MAX = 1.00;
      var STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];

      var elapsed = 0;
      var openP = env.reduced ? 1 : 0;    /* 0..1 entry progress */
      var radius = 0;
      var radiusTarget = 0;
      var spin = env.reduced ? 0 : -0.62;
      var half = 1;
      var stopIndex = -1;
      var opened = env.reduced;

      function refit() {
        half = Math.hypot(cv.w, cv.h) / 2;
      }
      cv.observe(function () { refit(); render(); });
      refit();

      /* Radius fraction to the nearest real stop. Deriving the label from the
         drawing is the whole reason the readout is allowed to exist. */
      function stopFor(frac) {
        var t = M.clamp((frac - STOP_MIN) / Math.max(0.0001, STOP_MAX - STOP_MIN), 0, 1);
        return Math.round((1 - t) * (STOPS.length - 1));
      }

      function setStop(i) {
        if (i === stopIndex) return;
        stopIndex = i;
        SE.$('b', readout).textContent = 'f/' + STOPS[i];
      }

      /* ------------------------------------------------------------ draw */
      function render() {
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4) return;
        cv.clear();

        var cx = w / 2, cy = h / 2;
        var r = Math.max(0.5, radius);

        /* Plate and opening in one path. evenodd turns the inner polygon into
           a hole, so the reveal costs exactly one fill. */
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.moveTo(cx + Math.cos(spin) * r, cy + Math.sin(spin) * r);
        for (var i = 1; i <= BLADES; i++) {
          var a = spin + (i / BLADES) * TAU;
          ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        ctx.closePath();
        /* One value step below the ground rather than equal to it. Painting
           the plate in the page colour is what turns an aperture into an
           invisible rectangle: the reveal only reads because the interior is
           lit and the surround is not. */
        ctx.fillStyle = '#050507';
        ctx.fill('evenodd');

        /* The aperture boundary itself. This is the line that says "lens",
           so it is the brightest thing the canvas draws. */
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(spin) * r, cy + Math.sin(spin) * r);
        for (var k = 1; k <= BLADES; k++) {
          var ak = spin + (k / BLADES) * TAU;
          ctx.lineTo(cx + Math.cos(ak) * r, cy + Math.sin(ak) * r);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(201,169,106,0.44)';
        ctx.lineWidth = 1;
        ctx.stroke();

        /* Blade edges: one batched path for all of them. Drawn beyond the
           frame so the leading edge always reaches the corner. */
        ctx.beginPath();
        for (var j = 0; j < BLADES; j++) {
          var b = spin + (j / BLADES) * TAU;
          ctx.moveTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r);
          ctx.lineTo(cx + Math.cos(b) * (r + half), cy + Math.sin(b) * (r + half));
        }
        ctx.strokeStyle = 'rgba(201,169,106,0.20)';
        ctx.lineWidth = 1;
        ctx.stroke();

        /* The rake: one band of light crossing once, at the same angle the
           name is set on. It exists for 1.13s and is never allocated again. */
        if (!env.reduced && elapsed > 0.42 && elapsed < 1.55) {
          var rp = (elapsed - 0.42) / 1.13;
          var band = half * 0.68;
          var travel = -band + rp * (w + band * 2);
          var fade = Math.min(1, rp / 0.22) * Math.min(1, (1 - rp) / 0.22);
          var g = ctx.createLinearGradient(travel, cy - band * 0.49, travel + band, cy + band * 0.49);
          g.addColorStop(0, 'rgba(201,169,106,0)');
          g.addColorStop(0.5, 'rgba(240,224,190,' + (0.19 * fade).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(201,169,106,0)');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }
      }

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        elapsed += dt;

        if (openP < 1) {
          openP = Math.min(1, openP + dt / 1.15);
          var e = 1 - Math.pow(1 - openP, 4);        /* expo.out, driven raw */
          radiusTarget = half * OPEN * e;
          spin = -0.62 * (1 - e);
          radius = radiusTarget;
          if (!opened && openP > 0.26) { opened = true; root.classList.add('is-open'); }
        } else if (env.fine && !env.reduced) {
          /* Pointer Y is the aperture ring. Damped rather than tweened,
             because the target retargets continuously from the hand. */
          var frac = M.map(M.clamp(SE.pointer.ny, -1, 1), -1, 1, STOP_MAX, STOP_MIN);
          radiusTarget = half * frac;
          radius = M.damp(radius, radiusTarget, 4, dt);
          setStop(stopFor(radius / half));
        }

        render();
      }

      var sub = null;
      if (env.reduced) {
        radius = half * OPEN;
        spin = 0;
        root.classList.add('is-open');
        setStop(stopFor(OPEN));
        render();
      } else {
        setStop(stopFor(OPEN));
        sub = SE.ticker.add(tick);
      }

      return {
        destroy: function () {
          if (sub) SE.ticker.remove(tick);
          cv.destroy();
          root.classList.remove('hero-aperture', 'is-open');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ======================================================================
     P02  MASS
     ----------------------------------------------------------------------
     The name set as large as the frame allows, with the letterforms taking on
     weight where the pointer is. Not a wobble filter over a bitmap: each glyph
     picks a real font weight and a real horizontal scale from its distance to
     the pointer, and the line is renormalised every frame so it stays flush to
     both margins. Pushing on one letter therefore squeezes its neighbours,
     which is the entire idea. Type with mass displaces the type beside it.

     WHY THE LINE IS RENORMALISED
     ----------------------------
     The obvious implementation lets the swollen glyph push the line wider and
     the name runs off the screen. Redistributing the same measure between the
     glyphs instead keeps the composition intact at every moment, so there is
     never a frame where the hero is broken, and it turns a decorative warp
     into a physical one: the letters are competing for a fixed amount of room.
     ====================================================================== */

  SE.register({
    area: 'hero',
    variant: 'page',
    id: 'hero-page-mass',
    num: 2,
    name: 'Mass',
    kind: 'Canvas / weighted type',
    accent: '#5b6ef5',
    tagline: 'Letterforms that take on weight where you look',
    desc: 'The name at the full measure of the frame, each glyph picking a real font weight and width from ' +
          'its distance to the pointer. The line is renormalised every frame, so one letter swelling compresses the rest.',
    interaction: 'Move across the name. Weight is picked up fast and shed slowly, so the type feels heavy.',
    hint: 'Move across the name',

    preview: function (ctx, w, h, t, heat) {
      var word = 'MIFTAUL';
      var fs = Math.round(h * 0.34);
      var pad = w * 0.06;
      var avail = w - pad * 2;
      /* A cursor that sweeps back and forth so the card shows the gesture. */
      var px = pad + (0.5 + Math.sin(t * 0.7) * 0.46) * avail;
      var sig = avail * 0.17;

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      var i, d, bump, adv = [], total = 0;
      var slot = avail / word.length;
      for (i = 0; i < word.length; i++) {
        d = (pad + (i + 0.5) * slot - px) / sig;
        bump = Math.exp(-0.5 * d * d);
        adv.push(1 + bump * (0.7 + heat * 0.5));
        total += adv[i];
      }
      var k = avail / total;
      var x = pad;
      for (i = 0; i < word.length; i++) {
        var s = adv[i] * k / slot;
        ctx.save();
        ctx.translate(x, h / 2);
        ctx.scale(s, 1);
        ctx.font = (adv[i] > 1.36 ? '700 ' : adv[i] > 1.1 ? '500 ' : '300 ') + fs + 'px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(236,236,239,' + (0.5 + (adv[i] - 1) * 0.5).toFixed(3) + ')';
        ctx.fillText(word.charAt(i), 0, 0);
        ctx.restore();
        x += adv[i] * k;
      }

      ctx.beginPath();
      ctx.moveTo(pad, h * 0.5 + fs * 0.42);
      ctx.lineTo(w - pad, h * 0.5 + fs * 0.42);
      ctx.strokeStyle = 'rgba(91,110,245,' + (0.24 + heat * 0.28).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    },

    spec: {
      subtitle: 'Per glyph weight and width driven by pointer distance, with the measure held constant',
      philosophy: [
        'The name is the largest thing on the screen because it is the most important thing on the screen. Everything else in the composition is sized relative to it, not to a type scale imported from somewhere else.',
        'Warping type is trivial to do badly. The difference between kinetic typography and a novelty filter is whether the letterforms stay letterforms: real weights from a real family, real advances, no shear, no bitmap distortion.',
        'Mass is a timing decision more than a visual one. Weight is picked up in about 110ms and shed over about 280ms, so the type feels like it has inertia rather than like it is following a cursor.'
      ],
      hierarchy: [
        '1. The name, filling the measure on two flush lines. Nothing else on screen competes for size.',
        '2. The value line at clamp(0.9375rem, 1.3vw, 1.125rem) in the bottom bar, max 40ch.',
        '3. Role and availability in mono 10px, flanking the value line on the same rule.',
        '4. Two actions at the right end of the bottom bar, so the eye finishes on them.',
        '5. The field hairlines behind the type at 4% ink. They exist to show the displacement, and they are the quietest thing on screen.'
      ],
      structure: [
        'Root is a two row grid: 1fr for the canvas, auto for the bottom bar. The canvas gets min-height:0 so it can actually shrink.',
        'One <canvas> carrying the field, the two baselines, and every glyph. Nothing about the name is DOM.',
        'The bottom bar is a four column grid on a single hairline: role, value, availability, actions.',
        'A visually hidden focusable list mirrors the name, role, value and both actions, because the headline is painted, not marked up.'
      ],
      interaction: [
        'Per glyph influence is a 2D gaussian on the distance from pointer to glyph centre: sigmaX is 11% of the measure, sigmaY is 0.8 of the line height. Falloff, not a radius, so there is no visible edge to the effect.',
        'Influence 0 to 1 maps to a font weight bucket at thresholds 0.12, 0.35 and 0.62, giving 300, 400, 500 and 700. Advances are premeasured for all four weights at layout time so switching weight never overlaps a neighbour.',
        'The same influence maps to a horizontal scale of 1.0 to 1.85 and a vertical scale of 1.0 to 1.05.',
        'After scaling, the sum of advances is divided into the available measure and every glyph is multiplied by that factor. The line is exactly flush to both margins in every frame.',
        'Damping is asymmetric: lambda 9 while influence is rising, lambda 3.6 while it falls. Equal rates read as a cursor filter; unequal rates read as weight.',
        'The field hairlines behind the type are displaced away from the pointer by up to 26px on the same gaussian, at 60% of the glyph amplitude, so the background lags the foreground.'
      ],
      choreography: [
        { n: 'Entry', d: 'Influence at every glyph starts at 1 and decays to its resting value over 900ms on the natural damping curve. The name therefore arrives at full weight and settles into its light resting state, which reads as a strike rather than a fade.' },
        { n: 'Baselines', d: 'Two 1px rules scaleX 0 to 1 from the left, 700ms cubic-bezier(0.23, 1, 0.32, 1), stagger 90ms. Drawn on the canvas as a width multiplier, not as a DOM transform.' },
        { n: 'Bottom bar', d: 'opacity 0 to 1 with translate3d(0,12px,0) to none, 560ms cubic-bezier(0.23, 1, 0.32, 1), delay 420ms. One movement for the whole bar; the four cells do not stagger against each other because they are one line of information.' },
        { n: 'Weight gain', d: 'Damped at lambda 9, about 110ms to 90% of target. Fast enough that the letter is already heavy by the time the eye arrives.' },
        { n: 'Weight release', d: 'Damped at lambda 3.6, about 280ms. Two and a half times the gain, which is the ratio at which the letters read as reluctant instead of sticky.' }
      ],
      scroll: [
        'None. Full viewport takeover.',
        'If the real page needs a scroll affordance, put the next section flush against the bottom bar and let the bar be the edge.'
      ],
      hover: [
        'The entire effect is gated on (hover: hover) and (pointer: fine). On a touch device the warp follows the finger while it is down and returns to the composed arrangement on release.',
        'No glyph is a hover target. Nothing in the name is clickable, so nothing in the name gets a cursor change.'
      ],
      click: [
        'Nothing on the canvas responds to a click. Actions live in the bottom bar as real buttons.'
      ],
      responsive: {
        desktop: 'Two flush lines, each independently sized to fill the measure, capped at 42% of the canvas height. Field at 60 hairlines.',
        tablet: 'Same two lines. Bottom bar drops the availability cell and becomes three columns.',
        mobile: 'Below 768px this is a different composition. The bottom bar moves above the name and becomes two stacked lines, the name sets on two lines at a fixed 21vw rather than measure-fitted, the field drops to 24 hairlines, and the warp is driven by touch position while a finger is down. With no finger down the type holds a composed arrangement with the influence peak at 34% along the first line, not a flat default.'
      },
      a11y: [
        'The painted name is mirrored in a visually hidden focusable list, so it is in the tab order and in the accessibility tree in reading order.',
        'The canvas carries aria-hidden="true" so the name is not announced twice.',
        'The bottom bar is real DOM: real buttons, real focus ring, 44px minimum target height.',
        'Under prefers-reduced-motion nothing subscribes to the frame loop. The name is painted once in the composed arrangement, the field is static, and the bottom bar has no entry transform.',
        'Contrast: resting glyph alpha is 0.82 on the near black ground, which is above 4.5:1 at this size by a wide margin. The field hairlines carry no information, so their 4% is not a contrast failure.'
      ],
      perf: [
        'Per frame cost is one batched stroke for the field, two strokes for the baselines, and one save, transform, fillText, restore per glyph. Twelve glyphs is 48 operations, well inside budget at 60fps.',
        'Advances for all four weights are measured once per layout, never per frame. measureText in a frame loop is the single most common way a canvas type effect ends up janky.',
        'The canvas bounding rect is cached on resize instead of read per frame, so the pointer mapping never forces a layout.',
        'Under reduced motion the ticker subscription is never created.'
      ],
      packages: [
        { p: 'none required', w: 'Canvas 2D and one gaussian. A physics library would be simulating springs for a value that is already frame rate independent damping.' },
        { p: 'no three', w: 'Text in WebGL means a glyph atlas and billboarded quads. That is a worse looking name and 600kb, to avoid an effect the 2D context does natively.' },
        { p: 'next/font', w: 'Required, not optional. The layout is measured from the loaded face, so a fallback swap would relayout the name. Self host the display face and use document.fonts.ready before the first measure.' }
      ],
      architecture: [
        { f: 'components/hero/Mass.tsx', r: 'Server rendered bottom bar and the hidden name mirror. The name exists in the HTML payload.' },
        { f: 'components/hero/MassType.tsx', r: '"use client" leaf owning the canvas, the layout measure and the frame subscription.' },
        { f: 'lib/typeLayout.ts', r: 'Pure: string plus available box plus weight list, returns glyph advances per weight. Unit testable without a canvas.' },
        { f: 'lib/useRaf.ts', r: 'The shared frame loop.' }
      ],
      state: [
        'Every per glyph value is a ref inside one array. None of it is React state; sixty state updates a second would re-render the tree sixty times a second.',
        'The layout result is memoised on measure plus font-loaded, and recomputed only in a ResizeObserver callback.',
        'The pointer is read from one document level listener shared with the rest of the site, not from a listener per component.'
      ],
      typography: [
        'Display face across four weights: 300, 400, 500, 700. Variable font preferred, because a variable axis removes the bucket steps entirely; the bucket implementation is the fallback for static families.',
        'Uppercase for the name here, and only here, because the effect works on the flat top and bottom of caps. Lowercase would put the whole effect on the x-height and lose it in the ascenders.',
        'Line height is 0.74 of the font size, so the two lines almost touch. At this scale the gap between lines is the composition.',
        'The bottom bar is mono 10px at 0.18em tracking for labels and the display face at 1rem for the sentence. Mono for data, never for prose.'
      ],
      color: [
        'The name is plain ink at 0.82 alpha resting, rising to 1.0 at full influence. Brightness carries weight along with the letterform.',
        'The signature indigo appears only in the field hairlines near the pointer and in the availability dot. It never touches the name.',
        'Ground is the flat void token with no gradient, because a gradient behind type this large fights the letterforms.',
        'On a light theme, invert the ground and drop the resting alpha to 0.86 of near black. The field stays indigo.'
      ],
      spacing: [
        'Canvas inset is 5% of the width on each side, which is tighter than the page gutter on purpose: the name is meant to feel like it is straining against the frame.',
        'The two lines sit 0.74em apart, measured baseline to baseline.',
        'Bottom bar padding is clamp(0.875rem, 2vh, 1.25rem) vertical and the page gutter horizontal, so the bar aligns with the content beneath it in the real page.',
        'The bar sits on a single 1px hairline and has no other separators. Four cells, three gaps, one line.'
      ],
      relationships: [
        'Glyph weight encodes distance to the pointer. Glyph width encodes the same thing, redundantly, so the effect survives on a display where the weight steps are hard to see.',
        'Field displacement encodes the same field at a lower amplitude, which is what makes the depth read.',
        'Nothing else in the composition is coded by anything. One signal, three expressions of it.'
      ],
      acceptance: [
        'The name arrives heavy and settles light within about a second, and never moves again on its own.',
        'Moving the pointer along the first line visibly thickens the letters under it and thins the ones beside it, and both lines stay exactly flush to the left and right margins throughout.',
        'Moving off the canvas returns every glyph to its resting weight in under half a second with no snap.',
        'Weight release is visibly slower than weight gain.',
        'With reduced motion on, the name is painted once, is not flat, and never updates again.',
        'At 390px the bar is above the name, the name sets on two lines, and nothing scrolls horizontally.'
      ]
    },

    mount: function (root) {
      root.classList.add('hero-mass');

      var mob = env.mobile;
      var LINES = [CAPS.first, CAPS.last];
      var WEIGHTS = [300, 400, 500, 700];

      /* ------------------------------------------------------------ DOM */
      var canvasEl = SE.el('canvas', 'hero-mass__type');
      canvasEl.setAttribute('aria-hidden', 'true');
      root.appendChild(canvasEl);

      var bar = SE.el('div', 'hero-mass__bar');
      bar.innerHTML =
        '<span class="hero-mass__role">' + IDENT.role + '</span>' +
        '<p class="hero-mass__value">' + IDENT.value + '</p>' +
        '<span class="hero-mass__avail"><i></i>' + IDENT.status + '</span>';
      root.appendChild(bar);
      bar.appendChild(actions('hero-mass__cta', 'Write to me', function () {
        SE.toast && SE.toast('Demo hero', IDENT.mail);
      }));

      root.appendChild(srMirror('Mass: the name set at the full measure of the frame', [
        { name: 'See the work', categoryLabel: 'Action', role: 'Primary', note: 'Opens the project index.' },
        { name: 'Write to me', categoryLabel: 'Action', role: 'Secondary', note: IDENT.mail }
      ]));

      /* --------------------------------------------------------- model */
      var cv = SE.canvas(canvasEl);
      var ctx = cv.ctx;
      var FIELD = mob ? 24 : 60;
      var lines = [];
      var rect = { left: 0, top: 0 };
      var padX = 0, availW = 0;
      var entry = 0;
      var settle = 1;                 /* 1 at mount, decays to 0: the strike */

      function fontStr(weight, fs) {
        return weight + ' ' + fs + 'px "Space Grotesk", sans-serif';
      }

      /* Advances are measured once per layout for every weight the glyph can
         take, at one probe size, then scaled arithmetically. Calling
         measureText inside the frame loop is the classic way a canvas type
         effect ends up janky.

         Both lines share ONE font size, chosen so the longest line exactly
         fills the measure and the shorter one sets ragged right. Sizing each
         line to be flush instead would make the five letter line 34% larger
         than the seven letter line, which reads as a mistake rather than as
         typography. */
      var PROBE = 140;
      var CAPH = 0.72;                 /* cap height as a fraction of em */

      function layout() {
        var w = cv.w, h = cv.h;
        padX = w * 0.05;
        availW = Math.max(40, w - padX * 2);
        lines = [];
        if (w < 4 || h < 4) return;

        var i, j, li, ch;
        var probed = [];               /* per line, per glyph, per weight */
        var fs = Infinity;

        for (li = 0; li < LINES.length; li++) {
          var g = [], sum = 0;
          for (i = 0; i < LINES[li].length; i++) {
            ch = LINES[li].charAt(i);
            var adv = [];
            for (j = 0; j < WEIGHTS.length; j++) {
              ctx.font = fontStr(WEIGHTS[j], PROBE);
              adv.push(ctx.measureText(ch).width);
            }
            g.push({ ch: ch, adv: adv });
            sum += adv[0];
          }
          probed.push({ g: g, sum: sum });
          fs = Math.min(fs, PROBE * (availW / Math.max(1, sum)));
        }

        /* Fit the pair vertically. Both lines share the size, so one factor
           preserves the whole relationship. */
        var gap = fs * 0.06;
        var totalH = fs * CAPH * 2 + gap;
        var maxH = h * (mob ? 0.64 : 0.74);
        if (totalH > maxH) fs *= maxH / totalH;
        fs = Math.round(fs);
        gap = fs * 0.06;

        var capH = fs * CAPH;
        var top = (h - (capH * 2 + gap)) / 2;

        for (li = 0; li < LINES.length; li++) {
          var glyphs = [], rest = 0;
          for (i = 0; i < probed[li].g.length; i++) {
            var p = probed[li].g[i];
            var scaled = [];
            for (j = 0; j < WEIGHTS.length; j++) scaled.push(p.adv[j] * fs / PROBE);
            rest += scaled[0];
            glyphs.push({ ch: p.ch, adv: scaled, cx: 0, bump: settle, target: 0, wi: 0, sx: 1 });
          }
          lines.push({
            fs: fs,
            capH: capH,
            /* Each line holds its own resting width. That fixed measure is
               what turns one glyph swelling into its neighbours compressing. */
            measure: rest,
            y: Math.round(top + capH),
            glyphs: glyphs
          });
          top += capH + gap;
        }

        /* Seed the resting centres so the first frame samples a real field
           rather than finding every glyph piled at zero. */
        for (li = 0; li < lines.length; li++) {
          var L = lines[li], x = padX;
          for (i = 0; i < L.glyphs.length; i++) {
            L.glyphs[i].cx = x + L.glyphs[i].adv[0] / 2;
            x += L.glyphs[i].adv[0];
          }
        }
      }

      function refit() {
        var r = canvasEl.getBoundingClientRect();
        rect.left = r.left; rect.top = r.top;
        layout();
      }
      cv.observe(function () {
        refit();
        if (env.reduced) settlePose(); else render();
      });
      refit();

      function bucket(b) {
        return b < 0.12 ? 0 : b < 0.35 ? 1 : b < 0.62 ? 2 : 3;
      }

      /* ------------------------------------------------------------ draw */
      function render() {
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4 || !lines.length) return;
        cv.clear();

        var px, py;
        /* A phone with no finger down has no pointer to follow, so it holds
           the composed pose rather than decaying to an even resting weight.
           A flat default is not a design. */
        var usePose = env.reduced || !SE.pointer.active || (env.touch && !SE.pointer.down);
        if (usePose) {
          /* A composed arrangement, not a flat default: the peak sits at 34%
             along the first line so the resting frame is still a design. */
          px = padX + availW * 0.34;
          py = lines[0].y - lines[0].fs * 0.3;
        } else {
          px = SE.pointer.x - rect.left;
          py = SE.pointer.y - rect.top;
        }

        var sigX = availW * 0.11;

        /* Field: one batched stroke. Displaced on the same gaussian at 60% of
           the glyph amplitude, so the background lags the foreground. */
        ctx.beginPath();
        for (var f = 0; f <= FIELD; f++) {
          var fx = padX + (f / FIELD) * availW;
          var fd = (fx - px) / (sigX * 1.6);
          var push = Math.exp(-0.5 * fd * fd) * 26 * Math.sign(fx - px || 1);
          var lx = Math.round(fx + push) + 0.5;
          ctx.moveTo(lx, h * 0.06);
          ctx.lineTo(lx, h * 0.94);
        }
        ctx.strokeStyle = 'rgba(91,110,245,0.10)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';

        for (var li = 0; li < lines.length; li++) {
          var L = lines[li];
          var sigY = L.capH * 0.9;
          var i, g, total = 0;

          /* Pass one: resolve the bucket and the scaled advance. */
          for (i = 0; i < L.glyphs.length; i++) {
            g = L.glyphs[i];
            g.wi = bucket(g.bump);
            g.sx = 1 + g.bump * 0.70;
            total += g.adv[g.wi] * g.sx;
          }
          /* Pass two: redistribute the line's own fixed measure. This is what
             makes one letter swelling compress its neighbours instead of
             pushing the name off the frame. */
          var k = L.measure / Math.max(1, total);
          var x = padX;
          var reveal = M.clamp((entry - li * 0.09) / 0.7, 0, 1);
          reveal = 1 - Math.pow(1 - reveal, 4);

          for (i = 0; i < L.glyphs.length; i++) {
            g = L.glyphs[i];
            var aw = g.adv[g.wi] * g.sx * k;
            g.cx = x + aw / 2;

            if (reveal > 0.01) {
              ctx.save();
              ctx.translate(x, L.y);
              ctx.scale(g.sx * k, 1 + g.bump * 0.05);
              ctx.font = fontStr(WEIGHTS[g.wi], L.fs);
              ctx.fillStyle = 'rgba(236,236,239,' + (0.70 + g.bump * 0.30).toFixed(3) + ')';
              ctx.fillText(g.ch, 0, 0);
              ctx.restore();
            }

            /* Target influence for the NEXT frame, from this frame's centre. */
            var dx = (g.cx - px) / sigX;
            var dy = (L.y - L.capH * 0.5 - py) / sigY;
            g.target = Math.exp(-0.5 * (dx * dx + dy * dy));
            x += aw;
          }

          /* Baseline rule, drawn as a width multiplier so the entry is a
             wipe rather than a DOM transform stacked on top of a canvas. It
             runs the full measure, past the ragged end of the short line. */
          var by = Math.round(L.y + L.fs * 0.14) + 0.5;
          ctx.beginPath();
          ctx.moveTo(padX, by);
          ctx.lineTo(padX + availW * reveal, by);
          ctx.strokeStyle = 'rgba(236,236,239,0.09)';
          ctx.stroke();
        }
      }

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        if (entry < 1) entry = Math.min(1, entry + dt / 0.9);
        if (settle > 0) settle = Math.max(0, settle - dt / 0.9);

        for (var li = 0; li < lines.length; li++) {
          var L = lines[li];
          for (var i = 0; i < L.glyphs.length; i++) {
            var g = L.glyphs[i];
            /* g.target already comes from the composed pose when there is no
               finger down, so there is nothing to special case here. */
            var t = Math.max(g.target, settle);
            /* Asymmetric: weight is picked up in about 110ms and shed over
               about 280ms. Equal rates read as a cursor filter. */
            g.bump = M.damp(g.bump, t, t > g.bump ? 9 : 3.6, dt);
          }
        }
        render();
      }

      /* Reduced motion still has to be a DESIGN. One pass resolves each
         glyph target from the composed pointer position, the second draws
         it, so the still frame is the arrangement the concept would settle
         into rather than every letter pinned at maximum weight. */
      function settlePose() {
        entry = 1; settle = 0;
        render();
        for (var li = 0; li < lines.length; li++) {
          var L = lines[li];
          for (var i = 0; i < L.glyphs.length; i++) L.glyphs[i].bump = L.glyphs[i].target;
        }
        render();
      }

      var sub = null;
      if (env.reduced) {
        settlePose();
      } else {
        sub = SE.ticker.add(tick);
      }
      root.classList.add('is-open');

      return {
        destroy: function () {
          if (sub) SE.ticker.remove(tick);
          cv.destroy();
          root.classList.remove('hero-mass', 'is-open');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ======================================================================
     P03  CORRIDOR
     ----------------------------------------------------------------------
     Real layers in real Z. Seven hairline gates recede toward a vanishing
     point with two side walls running back with them, and the composition is
     distributed through that depth rather than pasted on the front of it: the
     name is at the mouth, the value line is a few metres back, the meta is
     further still. The pointer dollies the camera.

     WHY CSS 3D AND NOT A CANVAS
     ---------------------------
     Every plane here contains type the reader has to read. CSS 3D gives real
     text at real subpixel quality with the perspective divide done by the
     compositor, and the whole camera is ONE transform on ONE wrapper, so the
     per frame cost is a single style write no matter how many planes exist.
     Painting the same scene on a canvas would mean rasterising type at a
     scale factor every frame, which is both slower and blurrier.

     WHY FOCUS FLATTENS THE CAMERA
     -----------------------------
     A control seen through a rotated perspective is a control that is hard to
     read and hard to hit. Any focus inside the corridor eases the camera back
     to neutral over ~400ms, so a keyboard user is never asked to read
     distorted type. That behaviour costs four lines and is the difference
     between a 3D hero and an inaccessible one.
     ====================================================================== */

  SE.register({
    area: 'hero',
    variant: 'page',
    id: 'hero-page-corridor',
    num: 3,
    name: 'Corridor',
    kind: 'CSS 3D / camera dolly',
    accent: '#2cbfa6',
    tagline: 'The composition distributed through depth, not stacked on a surface',
    desc: 'Seven hairline gates and two walls recede toward a vanishing point, with the name at the mouth and ' +
          'the supporting lines set metres behind it. The pointer dollies the camera through the whole scene.',
    interaction: 'Move to steer and dolly. Anything receiving focus eases the camera flat so type is never read at an angle.',
    hint: 'Move to dolly the camera',

    preview: function (ctx, w, h, t, heat) {
      var vx = w * (0.5 + Math.sin(t * 0.33) * 0.10);
      var vy = h * (0.44 + Math.cos(t * 0.27) * 0.06);
      var N = 6;
      /* Gates travel toward the viewer on a loop, so the card shows the dolly
         rather than a still of a tunnel. */
      var drift = (t * 0.22) % 1;

      ctx.lineWidth = 1;
      for (var i = 0; i < N; i++) {
        var k = (i + drift) / N;
        var s = k * k;                       /* perspective compression */
        var gw = w * (0.10 + s * 1.05);
        var gh = h * (0.12 + s * 1.05);
        ctx.beginPath();
        ctx.rect(Math.round(vx - gw / 2) + 0.5, Math.round(vy - gh / 2) + 0.5, Math.round(gw), Math.round(gh));
        ctx.strokeStyle = 'rgba(44,191,166,' + (0.06 + (1 - s) * (0.34 + heat * 0.24)).toFixed(3) + ')';
        ctx.stroke();
      }

      var g = ctx.createRadialGradient(vx, vy, 0, vx, vy, w * 0.18);
      g.addColorStop(0, 'rgba(44,191,166,' + (0.24 + heat * 0.16).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(8,8,10,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(vx, vy, w * 0.18, 0, TAU);
      ctx.fill();

      ctx.font = '500 ' + Math.round(h * 0.15) + 'px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(236,236,239,' + (0.66 + heat * 0.24).toFixed(3) + ')';
      ctx.fillText('MIFTAUL', w / 2, h * 0.78);
    },

    spec: {
      subtitle: 'Seven gates in Z, the composition spread through them, one transform for the camera',
      philosophy: [
        'Depth in a hero is usually a lie: a drop shadow, or two layers moving at different speeds. This one is literal. The value line is genuinely further away than the name, and moving the camera proves it.',
        'Distributing the composition through depth solves a real hierarchy problem. The name does not need to be bigger than the value line to outrank it; it just needs to be nearer.',
        'A camera is only interesting if it can be moved. If the pointer did nothing, this would be a static perspective illustration and the whole 3D layer would be costing frames for a still image.'
      ],
      hierarchy: [
        '1. The name at the mouth of the corridor, z 0, clamp(3rem, 9.5vw, 8.5rem). Nearest therefore largest, with no extra emphasis needed.',
        '2. The role caption directly under it on the same plane.',
        '3. The two actions on a plane 60px nearer than the name, so they sit optically in front of it.',
        '4. The value line at z -300, which makes it read as the second thing without being styled as a subheading.',
        '5. The meta row at z -620, present and clearly subordinate.',
        '6. The gates and walls at z -320 to -2200. Structure, never content.'
      ],
      structure: [
        'Root sets perspective: 1200px and perspective-origin: 50% 44%, and is overflow:hidden because a dollied plane will exceed the frame.',
        'One .__world child with transform-style: preserve-3d. It is the only element the frame loop touches.',
        'Seven .__gate elements sharing one inset box, differing only in a --z custom property set inline at mount.',
        'Two .__wall elements: left at transform-origin left center rotateY(90deg), right at right center rotateY(-90deg), each 2400px deep, each masked to fade toward the vanishing point.',
        'Four content planes: near (name, role), lift (actions, z +60), mid (value, z -300), deep (meta, z -620).',
        'A radial light at the vanishing point, painted as a background on the farthest gate. Set once, never animated.'
      ],
      interaction: [
        'Camera translate: X is pointer.nx * -90px, Y is pointer.ny * -46px, both read from the shared pre-damped pointer at lambda 4.5.',
        'Camera dolly: Z is pointer.ny * 200px, symmetric about zero and damped separately at lambda 3, so the dolly has more inertia than the pan. That difference is what makes it feel like a camera rather than a mouse follower.',
        'Camera rotation: rotateY is pointer.nx * 3.2deg and rotateX is pointer.ny * -2.2deg. Small on purpose. Past about 5deg the type at the far planes stops being readable.',
        'Focus flatten: any focusin inside the root eases a neutral factor 0 to 1 at lambda 5, multiplying every camera term to zero in roughly 400ms. focusout eases it back.',
        'One style write per frame, on one element. Adding a plane costs nothing at runtime.'
      ],
      choreography: [
        { n: 'Gate arrival', d: 'Each gate opacity 0 to its resting value plus translate3d(0,0,-420px) to none, 900ms cubic-bezier(0.23, 1, 0.32, 1), stagger 70ms from the far gate forward. The corridor builds from the vanishing point outward, which is the only order that reads as a space rather than a stack.' },
        { n: 'Walls', d: 'opacity 0 to 1 over 1100ms cubic-bezier(0.23, 1, 0.32, 1) with a 240ms delay. No transform: a wall that slides is a wall that is not attached to anything.' },
        { n: 'Name', d: 'translate3d(0,40px,0) to none plus opacity, 820ms cubic-bezier(0.23, 1, 0.32, 1), delay 380ms. 2D transform on a 3D plane, so it composites without a nested preserve-3d context.' },
        { n: 'Depth planes', d: 'Same treatment, delays 520ms and 600ms. The nearer plane arrives first: in a corridor, things reach you in order of distance.' },
        { n: 'Dolly settle', d: 'Damped at lambda 3, roughly 330ms to 90%. Slower than the pan at lambda 4.5, because a camera body has more mass than a pan head.' },
        { n: 'Focus flatten', d: 'Neutral factor damped at lambda 5, about 200ms to 63% and 400ms to settled. Fast enough that a Tab press does not feel like waiting for a camera.' }
      ],
      scroll: [
        'None. Full viewport takeover.',
        'Do not add a scroll driven dolly on top of this. Two inputs on one camera is how a scene ends up fighting itself.'
      ],
      hover: [
        'The entire camera is inside @media (hover: hover) and (pointer: fine). On touch it holds at neutral, which is a composed shot, not a broken one.',
        'Buttons keep the shared control treatment. Nothing in the corridor is a hover target except real controls.'
      ],
      click: [
        'No click behaviour on the scene. Both actions are real buttons on the nearest plane.'
      ],
      responsive: {
        desktop: 'Full corridor: seven gates, two walls, four content planes, camera live.',
        tablet: 'Five gates, walls kept, camera amplitude reduced to 70%. Meta drops from four cells to two.',
        mobile: 'Below 768px the perspective is removed entirely and this becomes a flat, hairline separated vertical stack: name, role, value, two meta rows, actions. Not a squeezed corridor. Depth needs both a wide frame and a pointer, and a phone has neither, so the concept states the same hierarchy through rules and spacing instead.'
      },
      a11y: [
        'Every plane is real DOM. The name is an h1, the actions are buttons, the meta is a dl. Nothing is painted.',
        'Focus inside the corridor flattens the camera, so a keyboard user never has to read or target rotated type.',
        'The gates and walls are aria-hidden decoration.',
        'Under prefers-reduced-motion the camera never subscribes to the frame loop, the corridor is rendered at its resting depth, and every entry transition is an opacity change with no translate.',
        'Contrast is checked at the far planes, where the perspective divide makes type smaller: the meta row at z -620 renders at about 66% of its CSS size, so it is set at 0.8125rem to land above 11px on screen.'
      ],
      perf: [
        'One transform write per frame on one element. Plane count is irrelevant to frame cost.',
        'will-change: transform on the world element only. Putting it on every plane would create nine compositor layers to move one.',
        'The wall gradients and the vanishing point light are backgrounds, painted once. Nothing gradient based is touched per frame.',
        'No filter and no box-shadow anywhere in the scene, because both would re-rasterise on every camera move.',
        'Under reduced motion nothing subscribes at all.'
      ],
      packages: [
        { p: 'none required', w: 'CSS 3D with one transform. This is the case where the platform is better than the library.' },
        { p: 'no three', w: 'A WebGL corridor would need text as textures and would lose selectable, accessible, subpixel type. It buys nothing here.' },
        { p: 'no framer-motion', w: 'The camera is a continuously retargeting value, not a tween between two states. Damping in the frame loop is both simpler and correct.' }
      ],
      architecture: [
        { f: 'components/hero/Corridor.tsx', r: 'Server rendered. Every plane and all copy exist in the HTML payload; the scene is complete without JavaScript.' },
        { f: 'components/hero/CorridorCamera.tsx', r: '"use client" leaf. Takes a ref to the world element, subscribes the camera, owns the focusin listener.' },
        { f: 'app/globals.css', r: 'The --z scale and the gate insets as CSS custom properties, so depth is a token and not a magic number in JSX.' }
      ],
      state: [
        'No React state at all in the camera. Position, rotation and the neutral factor are refs.',
        'Plane depths are static props rendered into inline style once on the server.',
        'Do not put pointer position in state to "share" it. One module level pointer store with a subscribe function, read by refs.'
      ],
      typography: [
        'Name: display face 500, clamp(3rem, 9.5vw, 8.5rem), tracking -0.05em, line-height 0.88.',
        'Value line: display face 400 at 1.375rem on the mid plane. It is set larger than it needs to be at z 0 because the perspective divide will shrink it to about 1.0rem on screen.',
        'Meta and role: mono 0.8125rem and 0.6875rem, tracking 0.18em, uppercase. Sized up for the same reason.',
        'Type size in a perspective scene is always two numbers: the CSS size and the size it renders at. Design against the second one.'
      ],
      color: [
        'Ground is void with a single radial light at the vanishing point in the signature teal at 14%. One light source, at the one place the eye is being sent.',
        'Gates step from 4% ink at the far end to 14% at the near end. The step, not the colour, is what encodes distance.',
        'Walls carry a 1px repeating hairline at 5% ink, masked to fade toward the vanishing point.',
        'The teal appears in the vanishing light, in the availability dot and nowhere else. The name stays plain ink.'
      ],
      spacing: [
        'Gates share one inset box of 16% vertical and 9% horizontal. Same box, different depth, which is what makes them read as one corridor rather than seven rectangles.',
        'Content planes align to the page gutter horizontally, so the composition still sits on the site grid despite the perspective.',
        'Name to role: 0.875rem. Name to actions: 2rem. The caption belongs to the name, the actions do not.',
        'Depth spacing is geometric, not linear: -320, -650, -1050, -1500, -2000, -2600, -3300. Even spacing in Z looks uneven on screen because perspective is a divide, not a subtraction.'
      ],
      relationships: [
        'Z position encodes rank. Nearest is most important, and that is the only hierarchy signal the supporting content uses.',
        'Gate opacity encodes distance, redundantly with scale, so the corridor still reads on a display where the far gates are near the black point.',
        'The vanishing light encodes where the corridor goes, which is the only reason the composition can afford this much empty middle.'
      ],
      acceptance: [
        'The corridor builds from the far gate forward, and the near content arrives after the structure it sits in.',
        'Moving the pointer visibly changes the depth relationship between the name and the value line, not just their screen position. Parallax between the planes is obvious.',
        'The dolly lags the pan by a visible amount.',
        'Pressing Tab flattens the camera within about half a second and the focused control is upright and legible.',
        'With reduced motion on, the corridor is present and still has depth, and nothing moves.',
        'At 390px there is no perspective at all and the content is a flat stack that fits the viewport without scrolling.'
      ]
    },

    mount: function (root) {
      root.classList.add('hero-corridor');

      var mob = env.mobile;
      /* Geometric, not linear. Even spacing in Z looks uneven on screen
         because perspective is a divide, not a subtraction. */
      var DEPTHS = mob ? [] : [-320, -650, -1050, -1500, -2000, -2600, -3300];

      var world = SE.el('div', 'hero-corridor__world');
      root.appendChild(world);

      /* -------------------------------------------------------- structure */
      DEPTHS.forEach(function (z, i) {
        var g = SE.el('div', 'hero-corridor__gate' + (i === DEPTHS.length - 1 ? ' is-far' : ''));
        g.setAttribute('aria-hidden', 'true');
        g.style.setProperty('--z', z + 'px');
        g.style.setProperty('--k', String(DEPTHS.length - 1 - i));
        /* Resting opacity goes through a custom property, not through inline
           `opacity`: an inline value would outrank the entry transition and
           the corridor would simply appear. */
        g.style.setProperty('--o', String(M.round(0.14 - i * 0.014, 3)));
        world.appendChild(g);
      });

      if (!mob) {
        ['l', 'r'].forEach(function (side) {
          var wall = SE.el('div', 'hero-corridor__wall hero-corridor__wall--' + side);
          wall.setAttribute('aria-hidden', 'true');
          world.appendChild(wall);
        });
      }

      /* ---------------------------------------------------------- content */
      /* Depth is only worth spending on content that survives the perspective
         divide. At z -900 a line renders at 57% of its CSS size, so what goes
         there is set large on purpose: the sign at the end of a corridor. The
         meta rows, which cannot afford to shrink, stay at z 0. */
      var deep = SE.el('div', 'hero-corridor__plane hero-corridor__plane--deep');
      deep.style.setProperty('--z', '-900px');
      deep.innerHTML = '<p class="hero-corridor__sign">' + IDENT.status + '</p>';
      world.appendChild(deep);

      var mid = SE.el('div', 'hero-corridor__plane hero-corridor__plane--mid');
      mid.style.setProperty('--z', '-300px');
      mid.innerHTML = '<p class="hero-corridor__value">' + IDENT.value + '</p>';
      world.appendChild(mid);

      /* The name sits marginally behind z 0 so nothing in the composition is
         ever magnified past the gutter by the perspective divide. */
      var near = SE.el('header', 'hero-corridor__plane hero-corridor__plane--near');
      near.style.setProperty('--z', '-40px');
      near.innerHTML =
        '<h1 class="hero-corridor__name">' + IDENT.first + '<br>' + IDENT.last + '</h1>' +
        '<p class="hero-corridor__role">' + IDENT.role + '</p>';
      world.appendChild(near);

      var lift = SE.el('div', 'hero-corridor__plane hero-corridor__plane--lift');
      lift.style.setProperty('--z', '0px');
      lift.innerHTML =
        '<dl class="hero-corridor__meta">' +
          '<div><dt>Based</dt><dd>' + IDENT.place + '</dd></div>' +
          '<div><dt>Shipping since</dt><dd class="t-num">' + (2026 - IDENT.years) + '</dd></div>' +
          '<div><dt>In production</dt><dd class="t-num">' + IDENT.running + ' of ' + IDENT.shipped + '</dd></div>' +
        '</dl>';
      lift.appendChild(actions('hero-corridor__cta', 'Write to me', function () {
        SE.toast && SE.toast('Demo hero', IDENT.mail);
      }));
      world.appendChild(lift);

      /* ---------------------------------------------------------- camera */
      var camZ = 0, neutral = 0;
      var live = env.fine && !env.reduced && !mob;

      function onFocusIn() { neutralTarget = 1; }
      function onFocusOut() {
        /* Only release once focus has actually left the corridor. */
        if (!root.contains(document.activeElement)) neutralTarget = 0;
      }
      var neutralTarget = 0;
      root.addEventListener('focusin', onFocusIn);
      root.addEventListener('focusout', onFocusOut);

      function tick(dt) {
        neutral = M.damp(neutral, neutralTarget, 5, dt);
        var f = 1 - neutral;

        /* Symmetric about zero so the resting shot is the undollied one. An
           asymmetric range leaves the scene permanently magnified, which
           quietly eats the gutter. */
        var zT = M.clamp(SE.pointer.ny, -1, 1) * 200;
        /* The dolly is damped separately and more slowly than the pan. A
           camera body has more mass than a pan head, and that difference is
           most of what makes this read as a camera. */
        camZ = M.damp(camZ, zT, 3, dt);

        var x = (-SE.pointer.dnx * 90 * f).toFixed(2);
        var y = (-SE.pointer.dny * 46 * f).toFixed(2);
        var z = (camZ * f).toFixed(2);
        var ry = (SE.pointer.dnx * 3.2 * f).toFixed(3);
        var rx = (-SE.pointer.dny * 2.2 * f).toFixed(3);

        /* Written as a custom property rather than as an inline transform, so
           the mobile rule that flattens the scene can win on the cascade
           instead of needing !important. */
        world.style.setProperty('--cam',
          'translate3d(' + x + 'px,' + y + 'px,' + z + 'px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)');
      }

      var sub = live ? SE.ticker.add(tick) : null;

      /* The reveal builds from the vanishing point forward: the corridor is a
         space, so it has to exist before anything can stand in it. */
      var raf = setTimeout(function () { root.classList.add('is-open'); }, 40);

      return {
        destroy: function () {
          if (sub) SE.ticker.remove(tick);
          clearTimeout(raf);
          root.removeEventListener('focusin', onFocusIn);
          root.removeEventListener('focusout', onFocusOut);
          root.classList.remove('hero-corridor', 'is-open');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ======================================================================
     P04  SIGNAL
     ----------------------------------------------------------------------
     The name resolves out of noise, and a strip beside it reports the
     resolution as it happens.

     WHY THE READOUT IS ALLOWED TO EXIST
     -----------------------------------
     A hero with a technical looking data strip is usually lying: invented
     latencies, fake build hashes, a fake uptime. Every field in this one is
     computed from the animation that is running two centimetres to its left.
     Locked count, entropy, substitution count and elapsed time are all real
     measurements of a real process. That is the only condition under which a
     readout belongs in a hero, and it is why this one stops updating and says
     LOCKED when the process finishes instead of inventing new numbers.

     WHY THE NAME IS NOT SET IN MONO
     -------------------------------
     Character scrambles are almost always monospaced because proportional
     glyphs make the line jitter. Setting a person's name in a terminal face to
     dodge that is a costume. Instead every character gets a fixed box measured
     from its real glyph once, so the scramble happens inside a stable grid and
     the display face survives.
     ====================================================================== */

  var SIG_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var SIG_LOWER = 'abcdefghijkmnopqrstuvwxyz';
  var SIG_SYM = '#%&$@/<>*+=';

  SE.register({
    area: 'hero',
    variant: 'page',
    id: 'hero-page-signal',
    num: 4,
    name: 'Signal',
    kind: 'DOM / scramble resolve',
    accent: '#93dd52',
    tagline: 'A name resolving out of noise, measured while it happens',
    desc: 'Each character cycles through noise on a fixed cadence and locks on a staggered schedule. The strip beside ' +
          'it reports locked count, entropy, substitutions and elapsed time, all computed from the run itself.',
    interaction: 'Hover a word to re-resolve it. Resolve again re-runs the whole name from the keyboard.',
    hint: 'Hover a word to re-resolve it',

    preview: function (ctx, w, h, t, heat) {
      var word = 'MIFTAUL';
      var n = word.length;
      var cell = w * 0.09;
      var x0 = (w - cell * n) / 2;
      var cy = h * 0.46;
      /* One resolve every 3.4s, so the card shows the process, not a still. */
      var cyc = (t / 3.4) % 1;
      var rnd = SE.rng(9001 + Math.floor(t * 18));

      ctx.font = '500 ' + Math.round(h * 0.24) + 'px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (var i = 0; i < n; i++) {
        var lock = 0.16 + (i / n) * 0.52;
        var done = cyc > lock;
        var ch = done ? word.charAt(i) : SIG_UPPER.charAt(Math.floor(rnd() * 26));
        ctx.fillStyle = done
          ? 'rgba(236,236,239,' + (0.86 + heat * 0.14).toFixed(3) + ')'
          : 'rgba(147,221,82,' + (0.30 + heat * 0.2).toFixed(3) + ')';
        ctx.fillText(ch, x0 + cell * (i + 0.5), cy);
      }

      /* The lock register, one tick per character. */
      for (var j = 0; j < n; j++) {
        var lit = cyc > 0.16 + (j / n) * 0.52;
        ctx.fillStyle = lit ? 'rgba(147,221,82,0.9)' : 'rgba(236,236,239,0.14)';
        ctx.fillRect(Math.round(x0 + cell * j + 2), Math.round(h * 0.74), Math.round(cell - 6), 2);
      }
    },

    spec: {
      subtitle: 'Staggered per character resolution with a readout computed from the run',
      philosophy: [
        'A hero has about four seconds. A resolve that takes 1.9 of them is spending half the budget, so it has to pay that back: what the reader gets is the impression that the name was recovered rather than displayed.',
        'Every number in the strip is measured from the animation beside it. A fake latency or a fake build hash in a hero is the cheapest possible trick and the easiest to spot.',
        'The process finishes and says so. Nothing here loops. An idle scramble on a name is a name nobody can read.'
      ],
      hierarchy: [
        '1. The name at clamp(3rem, 10vw, 9rem), weight 500. Both lines flush left on the gutter.',
        '2. The role caption under it in mono 11px.',
        '3. The value line at clamp(1rem, 1.5vw, 1.25rem), max 36ch, set below the name.',
        '4. The readout strip on the right, five label and value rows in mono 10px. Present, subordinate, and the only place the signature hue appears in quantity.',
        '5. The lock register under the strip: one 2px tick per character.',
        '6. Two actions at the bottom of the left column.'
      ],
      structure: [
        'Root is a two column grid, 1fr for the composition and a fixed clamp(11rem, 18vw, 15rem) rail for the readout.',
        'The name is an h1 containing one span per word; each word contains one <i> per character plus a visually hidden span carrying the whole word, so a screen reader gets "Miftaul" and not "M i f t a u l".',
        'Every character box is set to a fixed pixel width measured from its own real glyph after fonts are ready. The scramble therefore happens inside a stable grid with zero reflow.',
        'The readout is a <dl> with role="status" aria-live="off". It updates too fast to announce, so it does not try.',
        'A real "Resolve again" button gives the effect a keyboard and touch equivalent.'
      ],
      interaction: [
        'Substitution cadence is 55ms, driven from accumulated time in the frame loop rather than a setInterval, so it is frame rate independent and stops instantly on destroy.',
        'Character i locks at 0.45s + i * 0.085s + jitter, where jitter is 0 to 0.22s from a seeded PRNG. Seeded, so the resolution order is identical on every reload.',
        'Total resolve is about 1.9s for a twelve character name.',
        'Glyph pool matches the case of the slot it fills: uppercase slots draw from A to Z, lowercase from a to z, with 18% of draws from a symbol pool. Mixing cases makes the noise look like static instead of like text.',
        'Hovering a word re-resolves that word only, on the same schedule. Gated on (hover: hover) and (pointer: fine).',
        'The "Resolve again" button re-runs the whole name and is the touch and keyboard equivalent of the hover.',
        'When every character is locked the concept unsubscribes from the frame loop. Zero cost at rest is not an optimisation here, it is the design.'
      ],
      choreography: [
        { n: 'Resolve', d: 'Per character: 55ms substitution cadence, lock at 0.45s + index * 0.085s + up to 0.22s of seeded jitter. The jitter is what stops the lock from reading as a wipe left to right.' },
        { n: 'Lock flash', d: 'On lock the character goes from the signature hue at 0.55 alpha to full ink over 220ms cubic-bezier(0.23, 1, 0.32, 1), driven by a class and a CSS transition so a re-lock retargets from wherever the colour currently is.' },
        { n: 'Register tick', d: 'Each tick scaleY 0.35 to 1 and colour to the signature hue over 180ms cubic-bezier(0.23, 1, 0.32, 1), at the moment its character locks. transform-origin bottom.' },
        { n: 'Support', d: 'Value line, actions and readout: opacity 0 to 1 with translate3d(0,12px,0) to none, 520ms cubic-bezier(0.23, 1, 0.32, 1), delays 900ms, 980ms, 1060ms. They arrive while the name is still resolving, so the composition is never a lone word on a black field.' },
        { n: 'Word re-resolve', d: 'Same schedule, but the per character index restarts within the word, so a five character word re-resolves in about 0.9s. Shorter than the first run on purpose: a repeat is confirmation, not an introduction.' }
      ],
      scroll: ['None. Full viewport takeover.'],
      hover: [
        'Word hover re-resolves, gated behind (hover: hover) and (pointer: fine). Nothing else in the composition has a hover state beyond the shared button treatment.',
        'The word does not change size, weight or position on hover. It changes content, which is the whole point.'
      ],
      click: [
        '"Resolve again" re-runs the full name.',
        'Both hero actions behave as they do everywhere else.'
      ],
      responsive: {
        desktop: 'Two columns with the readout rail on the right. Five readout rows plus the register.',
        tablet: 'Readout rail moves under the value line as a horizontal row of five fields. Name unchanged.',
        mobile: 'Below 768px this is a different composition. The readout drops to three fields (state, locked, elapsed) in one row across the bottom, the register runs full width beneath it, the name sets on two lines at 13vw, and the value line moves above the name so the first thing under the thumb is the invitation rather than the metadata. Character boxes are re-measured on resize because the glyph width changes with the type size.'
      },
      a11y: [
        'Each word carries a visually hidden span with the real word, and the per character elements are aria-hidden. A screen reader hears the name, never the noise.',
        'The readout is aria-live="off" deliberately: at a 55ms cadence a live region would be an unusable stream of announcements. The final state is available as static text once locked.',
        '"Resolve again" is a real button with a real label, and it is the keyboard equivalent of the hover behaviour.',
        'Under prefers-reduced-motion the name is rendered resolved on the first frame, no substitution ever runs, the readout shows the locked state, and hover re-resolve is disabled. The register is drawn complete.',
        'The scramble never changes layout, so a magnifier user does not lose their place mid resolve.'
      ],
      perf: [
        'Text is written only on a substitution, not every frame: at 55ms that is about 18 writes per second across at most twelve nodes, and only while resolving.',
        'Character boxes are fixed width, so a substitution triggers paint on one node and never layout on the line.',
        'The frame subscription is removed the moment the last character locks, so the resting cost of this hero is zero.',
        'Glyph widths are measured once after document.fonts.ready and again only on resize.'
      ],
      packages: [
        { p: 'none required', w: 'A scramble is a timer, an array and a string. Every library for this ships a full tween engine to change textContent.' },
        { p: 'no gsap TextPlugin', w: 'TextPlugin interpolates between two strings; it does not do per character scheduling with jitter, and bending it into that shape is more code than writing it.' },
        { p: 'next/font', w: 'Required. The character boxes are measured from the real face, so a fallback swap mid measure would leave the grid wrong. Measure after document.fonts.ready.' }
      ],
      architecture: [
        { f: 'components/hero/Signal.tsx', r: 'Server rendered. The resolved name is in the HTML payload, so it is correct before hydration and correct without JavaScript.' },
        { f: 'components/hero/useScramble.ts', r: '"use client" hook. Owns the schedule, the cadence and the seeded jitter. Returns a ref callback and a re-run function.' },
        { f: 'components/hero/SignalReadout.tsx', r: 'Client leaf. Subscribes to the same run and renders the five fields.' },
        { f: 'lib/seededRandom.ts', r: 'The PRNG. The lock order must be identical on every load or the hero feels different every time for no reason.' }
      ],
      state: [
        'Per character lock times, current glyph and the substitution counter are refs inside one array. None of it is state.',
        'The only React state is the resolved boolean, which flips once and drives the LOCKED label.',
        'The readout writes through refs to four text nodes rather than re-rendering, because it changes eighteen times a second.',
        'Do not put elapsed time in state. That is sixty re-renders a second to move one number.'
      ],
      typography: [
        'Name: display face 500, clamp(3rem, 10vw, 9rem), tracking -0.045em, line-height 0.9.',
        'Character boxes are fixed pixel widths measured per glyph, with each glyph centred in its box. Not a monospace stack and not ch units, both of which would change the letterfit.',
        'Readout labels and values: mono 10px and 11px, tabular figures, tracking 0.18em. This is measurement, so it is the one place mono is correct.',
        'The value line stays in the display face. A sentence in mono is a sentence pretending to be a log line.'
      ],
      color: [
        'Unlocked characters are the signature lime at 0.55; locked characters are plain ink. Colour encodes state and nothing else.',
        'The register ticks are 14% ink unlit and full lime lit.',
        'The readout values are lime, the labels are ink-4. Ground is flat void with no gradient, so the noise has nothing to compete with.',
        'On a light theme, unlocked characters take the same lime at 0.7 against near white and locked characters go to near black.'
      ],
      spacing: [
        'Two column gap is clamp(2rem, 5vw, 4rem). The readout rail is clamp(11rem, 18vw, 15rem), sized to the longest value plus its label.',
        'Name to role caption: 0.875rem. Name to value line: 1.75rem.',
        'Readout rows are 0.625rem apart with a hairline above the register only. Five rows, one rule.',
        'Actions sit at the bottom of the left column on the same baseline as the register, so the composition closes on one line.'
      ],
      relationships: [
        'Character colour encodes lock state. The register encodes the same thing spatially, so the reader can see how far the resolve has got without reading the count.',
        'Entropy is the fraction of characters still unlocked, so it is derived from the register, not from a second source that could disagree with it.',
        'Nothing in the readout is decorative. If a field cannot be computed from the run, it is not in the strip.'
      ],
      acceptance: [
        'The name resolves in about two seconds, out of order, and the same order on every reload.',
        'The locked count in the readout always matches the number of lit ticks in the register.',
        'When the last character locks, the state field reads LOCKED, elapsed stops, and the frame loop subscription is gone.',
        'Hovering a word re-resolves only that word and the readout counts back down and up again.',
        '"Resolve again" produces the same result from the keyboard.',
        'The name never shifts horizontally by even a pixel during a resolve.',
        'With reduced motion on, the name is readable on the first frame and no substitution ever occurs.'
      ]
    },

    mount: function (root) {
      root.classList.add('hero-signal');

      var WORDS = [IDENT.first, IDENT.last];
      var rand = SE.rng(20260826);

      /* ------------------------------------------------------------ DOM */
      var main = SE.el('div', 'hero-signal__main');
      var h1 = SE.el('h1', 'hero-signal__name');
      var chars = [];

      WORDS.forEach(function (word, wi) {
        var w = SE.el('span', 'hero-signal__word');
        w.setAttribute('data-w', String(wi));
        for (var i = 0; i < word.length; i++) {
          var c = SE.el('i', 'hero-signal__ch');
          c.textContent = word.charAt(i);
          c.setAttribute('aria-hidden', 'true');
          w.appendChild(c);
          chars.push({ el: c, real: word.charAt(i), word: wi, idx: i, locked: true, lockAt: 0, jit: rand() * 0.22 });
        }
        w.appendChild(SE.el('span', 'sr-only', word));
        h1.appendChild(w);
      });
      main.appendChild(h1);
      main.appendChild(SE.el('p', 'hero-signal__role', IDENT.role));
      main.appendChild(SE.el('p', 'hero-signal__value', IDENT.value));
      main.appendChild(actions('hero-signal__cta', 'Resolve again', function () { run(-1); }));
      root.appendChild(main);

      var rail = SE.el('aside', 'hero-signal__rail');
      rail.innerHTML =
        '<dl class="hero-signal__read">' +
          '<div><dt>State</dt><dd data-f="state">LOCKED</dd></div>' +
          '<div><dt>Locked</dt><dd class="t-num" data-f="locked">' + SE.pad(chars.length) + '/' + SE.pad(chars.length) + '</dd></div>' +
          '<div><dt>Entropy</dt><dd class="t-num" data-f="entropy">0.000</dd></div>' +
          '<div><dt>Substitutions</dt><dd class="t-num" data-f="swaps">0</dd></div>' +
          '<div><dt>Elapsed</dt><dd class="t-num" data-f="elapsed">0.00s</dd></div>' +
        '</dl>' +
        '<div class="hero-signal__reg" aria-hidden="true"></div>';
      root.appendChild(rail);

      var reg = SE.$('.hero-signal__reg', rail);
      chars.forEach(function (c) {
        c.tick = SE.el('i');
        c.tick.className = 'is-lit';
        reg.appendChild(c.tick);
      });

      var F = {};
      SE.$$('[data-f]', rail).forEach(function (n) { F[n.getAttribute('data-f')] = n; });

      /* --------------------------------------------------------- model */
      var running = false;
      var elapsed = 0;
      var acc = 0;
      var swaps = 0;
      var CADENCE = 0.055;
      var sub = null;

      /* Fixed character boxes, measured from the real glyph once the face has
         landed. This is what lets a proportional display face carry a
         scramble without the line jittering. */
      function measure() {
        chars.forEach(function (c) {
          c.el.style.width = '';
          c.el.textContent = c.real;
        });
        chars.forEach(function (c) {
          var w = c.el.getBoundingClientRect().width;
          c.box = Math.ceil(w) + 1;
        });
        chars.forEach(function (c) { c.el.style.width = c.box + 'px'; });
      }

      function noiseFor(c) {
        if (rand() < 0.18) return SIG_SYM.charAt(Math.floor(rand() * SIG_SYM.length));
        var pool = c.real === c.real.toUpperCase() ? SIG_UPPER : SIG_LOWER;
        return pool.charAt(Math.floor(rand() * pool.length));
      }

      function paint() {
        var locked = 0;
        for (var i = 0; i < chars.length; i++) if (chars[i].locked) locked++;
        F.state.textContent = running ? 'RESOLVING' : 'LOCKED';
        F.locked.textContent = SE.pad(locked) + '/' + SE.pad(chars.length);
        F.entropy.textContent = ((chars.length - locked) / chars.length).toFixed(3);
        F.swaps.textContent = String(swaps);
        F.elapsed.textContent = elapsed.toFixed(2) + 's';
      }

      /* wordIndex -1 re-runs everything. */
      function run(wordIndex) {
        if (env.reduced) return;
        var n = 0;
        chars.forEach(function (c) {
          if (wordIndex >= 0 && c.word !== wordIndex) return;
          c.locked = false;
          c.el.classList.remove('is-locked');
          c.tick.classList.remove('is-lit');
          /* Index within the run, so a re-resolved word finishes faster than
             the first full pass. A repeat is confirmation, not an entrance. */
          c.lockAt = 0.45 + n * 0.085 + c.jit;
          n++;
        });
        elapsed = 0; acc = 0; swaps = 0;
        running = true;
        if (!sub) sub = SE.ticker.add(tick);
        paint();
      }

      function tick(dt) {
        elapsed += dt;
        acc += dt;

        var swap = false;
        while (acc >= CADENCE) { acc -= CADENCE; swap = true; }

        var remaining = 0;
        for (var i = 0; i < chars.length; i++) {
          var c = chars[i];
          if (c.locked) continue;
          if (elapsed >= c.lockAt) {
            c.locked = true;
            c.el.textContent = c.real;
            c.el.classList.add('is-locked');
            c.tick.classList.add('is-lit');
            continue;
          }
          remaining++;
          if (swap) { c.el.textContent = noiseFor(c); swaps++; }
        }

        if (swap || remaining === 0) paint();

        if (remaining === 0) {
          /* Resolved. Leave the frame loop entirely: the resting cost of this
             hero is zero, and that is the design, not an optimisation. */
          running = false;
          paint();
          SE.ticker.remove(tick);
          sub = null;
        }
      }

      /* Hover to re-resolve one word, pointer gated. */
      /* Fires on entering a DIFFERENT word, not on every pointerover inside
         the one the pointer is already in. Without the guard a slow sweep
         across a word re-triggers it once per glyph boundary. */
      var hoverWord = -1;
      function onEnter(e) {
        var w = e.target.closest ? e.target.closest('[data-w]') : null;
        if (!w) { hoverWord = -1; return; }
        var idx = parseInt(w.getAttribute('data-w'), 10);
        if (idx === hoverWord) return;
        hoverWord = idx;
        if (running) return;
        run(idx);
      }
      function onLeave() { hoverWord = -1; }
      if (env.fine && !env.reduced) {
        h1.addEventListener('pointerover', onEnter);
        h1.addEventListener('pointerleave', onLeave);
      }

      function onResize() { measure(); }
      var ro = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(onResize);
        ro.observe(root);
      } else {
        window.addEventListener('resize', onResize);
      }

      measure();
      paint();
      var start = setTimeout(function () {
        root.classList.add('is-open');
        run(-1);
      }, 60);

      return {
        destroy: function () {
          clearTimeout(start);
          if (sub) SE.ticker.remove(tick);
          if (ro) ro.disconnect(); else window.removeEventListener('resize', onResize);
          h1.removeEventListener('pointerover', onEnter);
          h1.removeEventListener('pointerleave', onLeave);
          root.classList.remove('hero-signal', 'is-open');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ======================================================================
     P05  HORIZON
     ----------------------------------------------------------------------
     A volumetric light horizon with particulate drifting up through it, and
     the name rising out of the light.

     WHY THE NAME IS DOM OVER A CANVAS FIELD
     ---------------------------------------
     The field is genuinely a field: gradients, shafts and two hundred moving
     points, which is exactly what a canvas is for. The name is a name, which
     is exactly what the DOM is for. Compositing one over the other costs a
     single stacking context and keeps the type crisp, selectable and in the
     accessibility tree.

     HOW "RISING OUT OF" IS DONE WITHOUT ANIMATING A MASK
     ----------------------------------------------------
     The name sits inside a wrapper with a STATIC bottom-up alpha mask. The
     name then translates upward through it. Because the mask does not move,
     nothing re-rasterises per frame; the letterforms simply clear the fade as
     they rise. Animating mask-position instead would repaint the layer on
     every frame for an identical result.
     ====================================================================== */

  SE.register({
    area: 'hero',
    variant: 'page',
    id: 'hero-page-horizon',
    num: 5,
    name: 'Horizon',
    kind: 'Canvas / volumetric field',
    accent: '#e8517e',
    tagline: 'The name rising out of a band of light',
    desc: 'A lit horizon with volumetric shafts and drifting particulate, painted on canvas, with the name rising ' +
          'through a static fade so it clears the light as it arrives.',
    interaction: 'Move to slide the light source and shift the particulate against it.',
    hint: 'Move to slide the light',

    preview: function (ctx, w, h, t, heat) {
      var hy = h * 0.66;
      var cx = w * (0.5 + Math.sin(t * 0.19) * 0.22);

      var g = ctx.createLinearGradient(0, hy - h * 0.5, 0, hy + h * 0.2);
      g.addColorStop(0, 'rgba(232,81,126,0)');
      g.addColorStop(0.72, 'rgba(232,81,126,' + (0.16 + heat * 0.12).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,220,232,' + (0.34 + heat * 0.2).toFixed(3) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, hy - h * 0.5, w, h * 0.7);

      var r = ctx.createRadialGradient(cx, hy, 0, cx, hy, w * 0.42);
      r.addColorStop(0, 'rgba(255,232,240,' + (0.42 + heat * 0.24).toFixed(3) + ')');
      r.addColorStop(1, 'rgba(8,8,10,0)');
      ctx.fillStyle = r;
      ctx.fillRect(0, 0, w, hy + 4);

      ctx.fillStyle = 'rgba(255,240,246,0.85)';
      ctx.fillRect(0, Math.round(hy), w, 1);

      /* Particulate. Seeded so the card is identical on every reload. */
      var rnd = SE.rng(4711);
      for (var i = 0; i < 16; i++) {
        var px = rnd() * w;
        var sp = 0.1 + rnd() * 0.3;
        var py = hy - ((t * sp * h * 0.5 + rnd() * h) % (h * 0.62));
        var a = 0.16 + rnd() * 0.4;
        ctx.fillStyle = 'rgba(255,236,242,' + (a * (0.6 + heat * 0.5)).toFixed(3) + ')';
        ctx.fillRect(px | 0, py | 0, 1, 1);
      }

      ctx.font = '500 ' + Math.round(h * 0.19) + 'px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'rgba(236,236,239,' + (0.82 + heat * 0.18).toFixed(3) + ')';
      ctx.fillText('MIFTAUL', w / 2, hy - h * 0.03);
    },

    spec: {
      subtitle: 'A lit horizon with volumetric shafts and drifting particulate, the name rising through a static fade',
      philosophy: [
        'Atmosphere is the one thing a flat dark hero cannot fake. A horizon gives the composition a floor, a light source and a direction, and once those exist the name has somewhere to arrive from.',
        'The light is one source in one place. Two light sources in a hero is how a page ends up looking like a stock gradient.',
        'The particulate is not decoration, it is the thing that makes the light volumetric. Without motes in it, a light shaft is a triangle.'
      ],
      hierarchy: [
        '1. The name, rising through the light, at clamp(3.25rem, 11vw, 10rem).',
        '2. The horizon itself. It is the second loudest thing on screen and it is not content, which is deliberate: it is the stage.',
        '3. The role caption and the value line, set below the horizon line where the field is darkest and type is most legible.',
        '4. Two actions, bottom left.',
        '5. The availability line, bottom right, the only other place the signature hue appears.'
      ],
      structure: [
        'Root is position:absolute inset:0 with overflow:hidden and its own stacking context.',
        'Layer 1: a full bleed canvas carrying the sky gradient, the glow, six volumetric shafts, the particulate and the horizon line.',
        'Layer 2: the name wrapper, which owns a STATIC linear-gradient alpha mask running from transparent at its bottom edge to opaque 42% up. The h1 inside it translates upward on entry, so the letterforms clear the fade as they rise. Nothing about the mask animates.',
        'Layer 3: the copy block and actions, below the horizon line.',
        'A visually hidden focusable mirror lists the name, role, value and availability, because the field is painted.'
      ],
      interaction: [
        'Pointer X slides the light centre across 34% of the frame width, damped through the shared pre-damped pointer at lambda 4.5.',
        'The particulate field parallaxes against the light at 40% of that amplitude, so the motes and the source do not move together.',
        'Pointer Y raises and lowers the horizon by 3% of the frame height. Small: a horizon that moves a lot stops being a horizon.',
        'There is no click interaction on the field. Everything actionable is a real control below it.'
      ],
      choreography: [
        { n: 'Light up', d: 'Horizon glow alpha 0 to 1 over 1400ms on a raw 1 - (1-p)^3 curve, driven per frame. Slower than anything else in the composition because it is dawn, not a UI element.' },
        { n: 'Name rise', d: 'translate3d(0,60%,0) to none plus opacity 0 to 1, 1150ms cubic-bezier(0.23, 1, 0.32, 1), delay 260ms. The 60% is measured against the name box, so it holds at any type size.' },
        { n: 'Shafts', d: 'Six shafts, each with its own phase, sweeping alpha between 0.03 and 0.10 on a 14 to 22 second period. The periods are mutually irrational so the pattern never visibly repeats.' },
        { n: 'Particulate', d: '170 motes on desktop, 46 on mobile. Vertical speed 6 to 26px per second, horizontal sway on a per mote sine at 0.15 to 0.4 rad per second and 6 to 18px amplitude. Motes wrap at the top and re-enter below the horizon.' },
        { n: 'Copy', d: 'opacity 0 to 1 with translate3d(0,14px,0) to none, 620ms cubic-bezier(0.23, 1, 0.32, 1), delays 760ms, 840ms and 920ms.' },
        { n: 'Light slide', d: 'Follows the shared damped pointer at lambda 4.5, roughly 220ms. Fast enough to feel connected to the hand, slow enough that the whole horizon is not twitching.' }
      ],
      scroll: ['None. Full viewport takeover.'],
      hover: [
        'The light slide is inside (hover: hover) and (pointer: fine). On touch the light rests at centre, which is a composed frame.',
        'No element in the field is a hover target.'
      ],
      click: ['Nothing on the field. The two actions are real buttons.'],
      responsive: {
        desktop: 'Horizon at 62% height, six shafts, 170 motes, name centred on the horizon.',
        tablet: 'Four shafts, 110 motes, name drops to 9vw.',
        mobile: 'Below 768px the horizon moves down to 74% and the composition becomes vertical rather than centred: the name sets flush left on the gutter at 15vw with the copy stacked beneath it, shafts drop to three, motes to 46, and DPR is capped at 1.75. The light does not follow anything, because there is nothing to follow.'
      },
      a11y: [
        'The canvas is aria-hidden decoration. The name, role, value and availability are all real DOM.',
        'A visually hidden focusable mirror carries the same content in reading order.',
        'Copy sits below the horizon line where the ground is darkest, so contrast is measured against the darkest part of the field, not against its average.',
        'Under prefers-reduced-motion the field is painted once with the motes in a seeded static arrangement, the shafts at their mid alpha, the name already risen, and no frame subscription at all.',
        'The name never sits on top of the brightest part of the glow. That is a composition rule and also a contrast one.'
      ],
      perf: [
        'The sky gradient is built once per resize and cached. Only the moving radial glow is allocated per frame, which is one gradient object.',
        'Motes are drawn as 1px and 2px fillRect at integer coordinates. A fractional 1.5px rect spreads its alpha over four antialiased pixels, which at these alphas is the difference between a starfield and a grey haze.',
        'No shadowBlur anywhere. A canvas shadow on 170 motes is the single most expensive thing you can do in a 2D context.',
        'DPR capped at 2 on desktop and 1.75 on mobile, and the mote count is a function of device class, not of screen area.',
        'Under reduced motion the field is painted once and again only on resize.'
      ],
      packages: [
        { p: 'none required', w: 'Canvas 2D gradients and 170 points. A particle library would be 30kb to run a loop that is already six lines.' },
        { p: 'no three', w: 'This is a 2D field with no camera and no geometry. WebGL would buy a shader nobody asked for.' },
        { p: 'gsap (installed)', w: 'Use it for the name rise only if the site already runs a gsap page transition and the hero should share its timeline. The field itself must stay in the frame loop.' }
      ],
      architecture: [
        { f: 'components/hero/Horizon.tsx', r: 'Server rendered name, copy and actions. The hero is complete without JavaScript; the field is what is missing.' },
        { f: 'components/hero/HorizonField.tsx', r: '"use client" leaf owning the canvas, the mote array and the frame subscription.' },
        { f: 'lib/field.ts', r: 'Seeded mote generation. Pure, so the field is identical on server and client and reproducible in a test.' }
      ],
      state: [
        'The mote array is a ref, allocated once at the measured size and mutated in place. Allocating per frame is what makes a particle field stutter under GC.',
        'Nothing in the field is React state.',
        'The reduced motion flag is read once and subscribed for changes, so toggling it at the OS level updates without a reload.'
      ],
      typography: [
        'Name: display face 500 at clamp(3.25rem, 11vw, 10rem), tracking -0.05em, line-height 0.9, on one line where it fits and two where it does not.',
        'Value line: display face 400 at clamp(1rem, 1.4vw, 1.1875rem), max 42ch.',
        'Role and availability: mono 10px, tracking 0.2em, uppercase.',
        'The name is not centred over the brightest point. Optically it sits about 6% left of the light, which is what keeps it readable.'
      ],
      color: [
        'One light source in the signature rose, warming to near white at its core. Everything else in the field is that same hue at lower alpha.',
        'Ground is void below the horizon and a very slightly lifted void above it, so the horizon is a value edge as well as a light.',
        'The name is plain ink. Tinting type with the light is how a hero ends up unreadable at the exact moment it matters.',
        'Motes are near white at 0.16 to 0.56 alpha, never the accent, because coloured dust reads as confetti.'
      ],
      spacing: [
        'Horizon at 62% of the frame height, which puts the name in the upper third and the copy in the lower quarter with the light between them.',
        'Copy block starts 4vh below the horizon line, so it is never inside the brightest band.',
        'Name to role caption: 1rem. Copy block to actions: 1.75rem.',
        'Left gutter is the page gutter throughout, so the hero lands on the site grid despite being an atmospheric composition.'
      ],
      relationships: [
        'Light position encodes the pointer and nothing else.',
        'Mote brightness encodes depth: brighter motes move faster and are drawn larger, which is the only depth cue in the field.',
        'The horizon line is the only hard edge in the composition, and it is what separates "atmosphere" from "blurry gradient".'
      ],
      acceptance: [
        'The light comes up over about a second and a half and the name rises through it, clearing the fade as it goes.',
        'Moving the pointer left and right visibly slides the light and the motes move against it, not with it.',
        'No banding is visible in the glow at 1440px on an 8 bit display.',
        'The copy under the horizon is legible at every pointer position, including with the light at its extreme.',
        'With reduced motion on, the field is painted once, is a composed arrangement rather than an empty frame, and nothing moves.',
        'At 390px the composition is flush left with three shafts and 46 motes, and the frame rate holds at 60.'
      ]
    },

    mount: function (root) {
      root.classList.add('hero-horizon');

      var mob = env.mobile;
      var MOTES = mob ? 46 : (env.tablet ? 110 : 170);
      var SHAFTS = mob ? 3 : (env.tablet ? 4 : 6);
      var HY = mob ? 0.74 : 0.62;

      /* ------------------------------------------------------------ DOM */
      var canvasEl = SE.el('canvas', 'hero-horizon__field');
      canvasEl.setAttribute('aria-hidden', 'true');
      root.appendChild(canvasEl);

      var nameWrap = SE.el('div', 'hero-horizon__namewrap');
      nameWrap.innerHTML = '<h1 class="hero-horizon__name">' + IDENT.first + ' ' + IDENT.last + '</h1>';
      root.appendChild(nameWrap);

      var copy = SE.el('div', 'hero-horizon__copy');
      copy.innerHTML =
        '<p class="hero-horizon__role">' + IDENT.role + '</p>' +
        '<p class="hero-horizon__value">' + IDENT.value + '</p>';
      copy.appendChild(actions('hero-horizon__cta', 'Write to me', function () {
        SE.toast && SE.toast('Demo hero', IDENT.mail);
      }));
      root.appendChild(copy);

      var avail = SE.el('p', 'hero-horizon__avail', '<i></i>' + IDENT.status);
      root.appendChild(avail);

      root.appendChild(srMirror('Horizon: the name rising out of a band of light', [
        { name: 'See the work', categoryLabel: 'Action', role: 'Primary', note: 'Opens the project index.' },
        { name: 'Write to me', categoryLabel: 'Action', role: 'Secondary', note: IDENT.mail }
      ]));

      /* --------------------------------------------------------- model */
      var cv = SE.canvas(canvasEl);
      var ctx = cv.ctx;
      var rand = SE.rng(80512);

      var motes = [];
      for (var i = 0; i < MOTES; i++) {
        motes.push({
          x: rand(), y: rand(),
          sp: 6 + rand() * 20,               /* px per second, upward */
          sw: 0.15 + rand() * 0.25,          /* sway rate, rad per second */
          sa: 6 + rand() * 12,               /* sway amplitude, px */
          ph: rand() * TAU,
          a: 0.16 + rand() * 0.40,
          big: rand() > 0.82
        });
      }

      var shafts = [];
      for (var s = 0; s < SHAFTS; s++) {
        shafts.push({
          x: (s + 0.5) / SHAFTS + (rand() - 0.5) * 0.06,
          w: 0.06 + rand() * 0.10,
          /* Mutually irrational periods, so the pattern never visibly repeats. */
          per: 14 + rand() * 8,
          ph: rand() * TAU,
          lean: (rand() - 0.5) * 0.22
        });
      }

      var sky = null;
      var elapsed = 0;
      var lightUp = env.reduced ? 1 : 0;

      function refit() {
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4) return;
        var hy = h * HY;
        /* Built once per resize. Only the moving glow is allocated per frame. */
        sky = ctx.createLinearGradient(0, 0, 0, hy);
        sky.addColorStop(0, 'rgba(20,10,16,0)');
        sky.addColorStop(0.62, 'rgba(58,18,38,0.30)');
        sky.addColorStop(1, 'rgba(232,81,126,0.30)');
      }
      cv.observe(function () { refit(); render(); });
      refit();

      /* ------------------------------------------------------------ draw */
      function render() {
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4) return;
        cv.clear();

        var pn = (env.reduced || mob) ? 0 : SE.pointer.dnx;
        var pv = (env.reduced || mob) ? 0 : SE.pointer.dny;
        var hy = Math.round(h * HY + pv * h * 0.03);
        var cx = w * 0.57 + pn * w * 0.17;
        var L = lightUp;

        ctx.globalAlpha = L;
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, hy);

        /* Volumetric shafts, above the horizon only. Drawn as leaning
           parallelograms so they read as light rather than as columns. */
        for (var s = 0; s < shafts.length; s++) {
          var sh = shafts[s];
          var a = 0.03 + (Math.sin(elapsed * (TAU / sh.per) + sh.ph) * 0.5 + 0.5) * 0.07;
          var sx = sh.x * w + pn * w * 0.09;
          var half = sh.w * w * 0.5;
          ctx.beginPath();
          ctx.moveTo(sx - half, hy);
          ctx.lineTo(sx + half, hy);
          ctx.lineTo(sx + half * 2.4 + sh.lean * w * 0.3, 0);
          ctx.lineTo(sx - half * 2.4 + sh.lean * w * 0.3, 0);
          ctx.closePath();
          /* Falls off toward the top. A flat alpha wedge reads as a triangle
             with a hard edge; light has to thin out as it travels. */
          var sg = ctx.createLinearGradient(0, hy, 0, 0);
          sg.addColorStop(0, 'rgba(255,214,228,' + a.toFixed(3) + ')');
          sg.addColorStop(0.55, 'rgba(255,214,228,' + (a * 0.42).toFixed(3) + ')');
          sg.addColorStop(1, 'rgba(255,214,228,0)');
          ctx.fillStyle = sg;
          ctx.fill();
        }

        /* The one light source. */
        var r = ctx.createRadialGradient(cx, hy, 0, cx, hy, Math.max(w, h) * 0.52);
        r.addColorStop(0, 'rgba(255,236,243,0.50)');
        r.addColorStop(0.22, 'rgba(232,81,126,0.24)');
        r.addColorStop(1, 'rgba(8,8,10,0)');
        ctx.fillStyle = r;
        ctx.fillRect(0, 0, w, hy + 1);

        /* Particulate. Integer coordinates and integer sizes: a fractional
           1.5px rect spreads its alpha across four antialiased pixels, which
           at these alphas is the difference between a field and a grey haze. */
        var drift = env.reduced ? 0 : elapsed;
        for (var i = 0; i < motes.length; i++) {
          var m = motes[i];
          var my = hy - (((m.y * hy) + drift * m.sp) % hy);
          var mx = m.x * w + Math.sin(drift * m.sw + m.ph) * m.sa - pn * w * 0.07;
          if (mx < -4) mx += w; else if (mx > w + 4) mx -= w;
          var fade = 1 - Math.abs(my - hy * 0.55) / (hy * 0.75);
          if (fade <= 0) continue;
          ctx.fillStyle = 'rgba(255,242,247,' + (m.a * fade * L).toFixed(3) + ')';
          var sz = m.big ? 2 : 1;
          ctx.fillRect(mx | 0, my | 0, sz, sz);
        }

        /* The one hard edge in the composition. Without it this is a blurry
           gradient rather than a horizon. */
        var spill = ctx.createLinearGradient(0, hy, 0, hy + h * 0.14);
        spill.addColorStop(0, 'rgba(232,81,126,0.22)');
        spill.addColorStop(1, 'rgba(232,81,126,0)');
        ctx.fillStyle = spill;
        ctx.fillRect(0, hy, w, h * 0.14);

        var grad = ctx.createLinearGradient(cx - w * 0.5, 0, cx + w * 0.5, 0);
        grad.addColorStop(0, 'rgba(255,240,246,0.06)');
        grad.addColorStop(0.5, 'rgba(255,244,248,0.72)');
        grad.addColorStop(1, 'rgba(255,240,246,0.06)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, hy, w, 1);
        ctx.globalAlpha = 1;
      }

      /* ------------------------------------------------------------ tick */
      function tick(dt) {
        elapsed += dt;
        if (lightUp < 1) {
          var p = Math.min(1, elapsed / 1.4);
          lightUp = 1 - Math.pow(1 - p, 3);
        }
        render();
      }

      var sub = null;
      if (env.reduced) {
        render();
      } else {
        sub = SE.ticker.add(tick);
      }
      var start = setTimeout(function () { root.classList.add('is-open'); }, 40);

      return {
        destroy: function () {
          clearTimeout(start);
          if (sub) SE.ticker.remove(tick);
          cv.destroy();
          root.classList.remove('hero-horizon', 'is-open');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ======================================================================
     S01  CURTAIN            (pairs with P01 Aperture)
     ----------------------------------------------------------------------
     A live field visible only through the letterforms of the name, which
     comes apart as the reader scrolls past it.

     WHY IT IS A SECTION AND NOT A PAGE
     ----------------------------------
     It consumes scroll instead of fighting it. The reader arrives, the name
     is solid, and every millimetre they scroll takes the name further apart
     until the section releases and the page carries on. There is no state to
     return to and nothing to dismiss, which is the contract a section inside
     a longer page has to honour. Scrolling back reassembles it exactly,
     because the whole thing is a pure function of progress.

     THE MASK IS A COMPOSITE, NOT A CLIP
     -----------------------------------
     The glyphs are painted first and everything after them is drawn with
     source-atop, which clips each draw to the existing alpha without touching
     the rest of the canvas. destination-in is the mode people reach for here
     and it is wrong: it is not additive, so the second letter erases what the
     first one kept. source-atop antialiases correctly at the letterform edges
     and survives the glyphs being individually translated and rotated during
     the dissolve, which a clip-path on a DOM element would not.
     ====================================================================== */

  SE.register({
    area: 'hero',
    variant: 'section',
    id: 'hero-section-curtain',
    num: 1,
    name: 'Curtain',
    kind: 'Canvas / masked field',
    accent: '#4fc8e8',
    tagline: 'A field you can only see through the name',
    desc: 'A moving field is visible only inside the letterforms. Scrolling past takes the name apart glyph by glyph ' +
          'and hands the page on, and scrolling back puts it exactly where it was.',
    interaction: 'Scroll. Progress alone drives the dissolve, so the section is fully reversible.',
    hint: 'Scroll to take the name apart',
    screens: 2.6,

    preview: function (ctx, w, h, t, heat) {
      var word = 'MIFTAUL';
      var fs = Math.round(h * 0.42);
      var cyc = (t * 0.2) % 1;
      var dis = M.clamp((cyc - 0.35) / 0.5, 0, 1);
      var rnd = SE.rng(3301);

      /* Letters first, as the destination. source-atop then clips everything
         drawn afterwards to them WITHOUT erasing what came before, which is
         the one composite mode that accumulates correctly here. */
      ctx.font = '700 ' + fs + 'px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#123246';
      var cell = w / word.length;
      var r2 = SE.rng(77);
      for (var j = 0; j < word.length; j++) {
        var a = r2() * TAU;
        ctx.fillText(word.charAt(j), cell * (j + 0.5) + Math.cos(a) * dis * w * 0.2,
                     h / 2 + Math.sin(a) * dis * h * 0.4);
      }

      ctx.globalCompositeOperation = 'source-atop';
      var pw = ctx.createLinearGradient(0, 0, w, h);
      pw.addColorStop(0, 'rgba(158,232,252,' + (0.9 * (1 - dis)).toFixed(3) + ')');
      pw.addColorStop(1, 'rgba(28,84,132,' + (0.7 * (1 - dis)).toFixed(3) + ')');
      ctx.fillStyle = pw;
      ctx.fillRect(0, 0, w, h);

      for (var i = 0; i < 16; i++) {
        var y = rnd() * h;
        var len = w * (0.10 + rnd() * 0.34);
        var x = ((rnd() * w) + t * (18 + rnd() * 70)) % (w + len) - len;
        ctx.fillStyle = 'rgba(226,248,255,' + ((0.3 + rnd() * 0.6) * (0.6 + heat * 0.5) * (1 - dis)).toFixed(3) + ')';
        ctx.fillRect(x | 0, y | 0, len, 1 + (rnd() > 0.7 ? 1 : 0));
      }
      ctx.globalCompositeOperation = 'source-over';
    },

    spec: {
      subtitle: 'A canvas field intersected with the letterforms, taken apart by scroll progress',
      philosophy: [
        'A section hero has one job the page version does not: leave. Everything here is a pure function of scroll progress, so leaving is the same gesture as arriving and the reader is never trapped or surprised.',
        'The name is the window. The field is only interesting because it is bounded by something meaningful, which is why the same field on a full bleed rectangle would be a screensaver.',
        'The dissolve is not a fade. Each glyph leaves in its own direction on its own seeded vector, so the name comes apart rather than dimming, and the hairline outline stays behind long enough that the shape is never lost.'
      ],
      hierarchy: [
        '1. The name, filling the measure, as the aperture the field is seen through.',
        '2. The value line at the lower left, on the ground rather than inside the field.',
        '3. The role and availability in mono 10px on the same baseline.',
        '4. "See the full hero" appears once the dissolve is a third of the way through, at the lower right.',
        '5. The field itself. It has no content and it never competes with any.'
      ],
      structure: [
        'SE.scrollRail with 2.6 screens: an over-tall rail containing a position:sticky one screen viewport. Sticky rather than a pinned ScrollTrigger, because pinning injects a spacer and rewrites layout inside a nested scroller.',
        'One full bleed canvas inside the sticky viewport.',
        'A caption block absolutely positioned at the lower left, and the see-more control at the lower right. Both real DOM over the canvas.',
        'A visually hidden focusable mirror carries the name, role, value and availability, because everything visual here is painted.',
        'In page mode the same component renders with progress pinned at 0: solid name, live field, no rail.'
      ],
      interaction: [
        'Scroll progress 0 to 1 across the rail via ScrollTrigger with scrub 0.6, falling back to a passive scroll listener when GSAP is absent.',
        'Dissolve begins at progress 0.42 and completes at 0.92, so the reader gets a solid name for the first 40% of the section.',
        'Each glyph has a seeded direction: offset up to 26% of the frame width along its own vector, plus up to 0.16rad of rotation. Seeded, so the name comes apart identically on every visit.',
        'Field alpha falls linearly with the dissolve, so the letters empty out as they separate.',
        'The whole sticky viewport ramps opacity from 1 to 0 between progress 0.82 and 1.0, which is the handoff: the next section is already arriving as this one clears.',
        'There is no pointer interaction at all. A section that responds to the pointer competes with the reader scrolling past it.'
      ],
      choreography: [
        { n: 'Field', d: 'A cached diagonal wash plus 150 streaks on desktop and 56 on mobile. Horizontal velocity 18 to 88px per second, length 6% to 38% of the frame width, 1px to 3px tall, one in seven near white. Wrapped, not respawned, so there is no visible birth edge.' },
        { n: 'Dissolve', d: 'Progress 0.42 to 0.92 mapped through 1 - (1-p)^2, so the glyphs leave slowly and finish fast. A linear dissolve reads as a slider being dragged.' },
        { n: 'Glyph vector', d: 'Per glyph angle from a seeded PRNG, magnitude up to 0.26 of the frame width, rotation up to 0.16rad. Applied as one canvas transform per glyph, not as a filter.' },
        { n: 'Outline', d: 'The letterform outline is stroked at 10% ink for the whole section and fades out over the last 12% of progress, so the shape survives the field emptying.' },
        { n: 'Handoff', d: 'Sticky viewport opacity 1 to 0 across progress 0.82 to 1.0. Opacity only, one style write per frame, on a composited property.' },
        { n: 'See more', d: 'opacity 0 to 1 with translate3d(0,10px,0) to none, 420ms cubic-bezier(0.23, 1, 0.32, 1), crossing the 0.35 progress threshold. A class toggle at a threshold, not a per frame write.' }
      ],
      scroll: [
        'The section consumes 2.6 viewport heights and releases cleanly at both ends. It never captures the wheel, never calls preventDefault, and never uses a scroll listener on window.',
        'Everything is a pure function of progress, so scrolling back up reassembles the name exactly.',
        'The handoff fade means the following section is visible before this one has finished its rail, which is what stops the transition reading as a cut.'
      ],
      hover: [
        'None on the field. The only hover states are the shared button treatment on "See the full hero".',
        'This is deliberate: hover on a section that is mid scroll is an interaction the reader did not ask for.'
      ],
      click: [
        '"See the full hero" opens the page level counterpart, which is the Aperture treatment of the same name.',
        'Nothing else is clickable.'
      ],
      responsive: {
        desktop: 'Name on one line filling the measure. 96 streaks. Caption lower left, see-more lower right.',
        tablet: 'Name still one line, 60 streaks, caption drops the value line to two lines.',
        mobile: 'Below 768px the name sets on two stacked lines, streaks drop to 34, DPR to 1.75, and the caption and see-more stack into one lower block rather than sitting at opposite corners. The rail shortens to 2.1 screens because a 2.6 screen section is a long way to scroll on a phone for one idea.'
      },
      a11y: [
        'The canvas is aria-hidden. A visually hidden focusable list carries the name, role, value, availability and the see-more action.',
        'The see-more control is a real button with a real label and is reachable by keyboard at any scroll position, not only after the threshold: it is visually hidden before 0.35, not display:none.',
        'Under prefers-reduced-motion the field holds still in a seeded arrangement and the dissolve still tracks scroll, because that is the reader driving it directly. No autonomous motion of any kind runs.',
        'The section never traps focus and never intercepts the wheel or keyboard scrolling.'
      ],
      perf: [
        'Per frame: one cached gradient fill, 150 fillRect, one composite pass, one fillText per glyph, one stroke per glyph. About 180 operations, comfortable at 60fps.',
        'source-atop clips every subsequent draw to the glyph alpha at no per glyph cost. destination-in looks like the right mode and is not: it is not additive across draw calls.',
        'The streak array is allocated once and mutated in place.',
        'The canvas releases its backing bitmap when the section leaves the viewport, via the shared canvas helper.',
        'No shadowBlur, no filter, no per frame gradient allocation.'
      ],
      packages: [
        { p: 'gsap + ScrollTrigger (installed)', w: 'Worth it here for scrub smoothing and for invalidateOnRefresh when the rail height changes. Degrade to a passive scroll listener if it is absent; the feature survives, the smoothing does not.' },
        { p: 'lenis (installed)', w: 'Use it, and drive it from the same frame loop as everything else. Two independent rAF loops is how a scrubbed canvas ends up a frame behind the page.' },
        { p: 'no canvas library', w: 'The whole effect is fillRect, one composite mode and fillText.' }
      ],
      architecture: [
        { f: 'components/hero/CurtainSection.tsx', r: 'Server rendered caption, see-more link and the hidden mirror. Mounts the field as a client child.' },
        { f: 'components/hero/CurtainField.tsx', r: '"use client" leaf. Owns the canvas, the streak array and the ScrollTrigger.' },
        { f: 'app/(site)/hero/page.tsx', r: 'The page level route the see-more control opens. Build it: a section that hands off to nothing is a dead end.' },
        { f: 'lib/useRaf.ts', r: 'The shared frame loop, also driving lenis.' }
      ],
      state: [
        'Scroll progress is a ref written by the ScrollTrigger callback and read by the frame loop. Never state: it changes every frame.',
        'The see-more visibility is the one piece of state, and it flips at a threshold rather than tracking progress.',
        'Streaks and glyph vectors are refs, seeded once, mutated in place.'
      ],
      typography: [
        'Name: display face 700 on canvas, sized to fill the measure minus a 5% inset. Heavier than the page concepts because a thin letterform is a poor window: there has to be enough counter area for the field to be visible through.',
        'Value line: display face 400 at clamp(0.9375rem, 1.3vw, 1.125rem), max 40ch.',
        'Role and availability: mono 10px, tracking 0.2em, uppercase.',
        'Uppercase for the name, because caps give the largest continuous aperture per unit of width.'
      ],
      color: [
        'Streaks are the signature cyan across 0.22 to 0.82 alpha. One hue, varied only in value.',
        'The letterform outline is 10% ink, never the accent: an outlined coloured word would read as a logo.',
        'Ground is flat void. The field is the only light in the section, and it is inside the name.',
        'Caption copy is ink-2 on the ground, outside the field, so its contrast never depends on what the field is doing.'
      ],
      spacing: [
        'Canvas inset is 5% of the width, tighter than the page gutter, so the name strains against the frame.',
        'Caption sits at the page gutter and clamp(1.5rem, 5vh, 3rem) from the bottom.',
        'See-more sits on the same bottom baseline at the opposite gutter, so the bottom of the section reads as one line.',
        'The rail is 2.6 screens: enough for a solid read, a full dissolve and a handoff, and not one screen more.'
      ],
      relationships: [
        'Glyph separation encodes scroll progress and nothing else.',
        'Field alpha encodes the same progress, redundantly, so the dissolve reads even at a glance.',
        'The outline encodes where the name was, which is what keeps the composition legible in the middle of the dissolve.'
      ],
      acceptance: [
        'Arriving at the section, the name is solid and the field is visibly moving inside it.',
        'Scrolling takes the letters apart along different vectors, not straight down and not all together.',
        'Scrolling back up reassembles the name exactly, with no drift.',
        'The section releases at the bottom of its rail with the following block already visible.',
        'The wheel is never captured. Fast scrolling passes straight through the section.',
        'The see-more control is reachable by Tab before it is visible, and opens the page level hero.',
        'At 390px the name is on two lines and the caption and control are stacked, not at opposite corners.'
      ]
    },

    mount: function (root, ctx) {
      var mob = env.mobile;
      var screens = mob ? 2.1 : 2.6;
      var sh = shellFor(root, ctx, 'hero-curtain', screens);
      var host = sh.host;

      /* ------------------------------------------------------------ DOM */
      var canvasEl = SE.el('canvas', 'hero-curtain__canvas');
      canvasEl.setAttribute('aria-hidden', 'true');
      host.appendChild(canvasEl);

      var cap = SE.el('div', 'hero-curtain__cap');
      cap.innerHTML =
        '<p class="hero-curtain__role">' + IDENT.role + '</p>' +
        '<p class="hero-curtain__value">' + IDENT.value + '</p>' +
        '<p class="hero-curtain__avail"><i></i>' + IDENT.status + '</p>';
      host.appendChild(cap);

      var more = null;
      if (!sh.isPage) {
        more = SE.seeMore('See the full hero', ctx.onSeeMore);
        more.classList.add('hero-curtain__more');
        host.appendChild(more);
      }

      host.appendChild(srMirror('Curtain: a field seen through the letterforms of the name', more ? [
        { name: 'See the full hero', categoryLabel: 'Action', role: 'Opens', note: 'The page level treatment of the same name.' }
      ] : null));

      /* --------------------------------------------------------- model */
      var cv = SE.canvas(canvasEl);
      var cx2 = cv.ctx;
      var rand = SE.rng(51221);
      var STREAKS = mob ? 56 : (env.tablet ? 96 : 150);
      var elapsed = 0;
      var drawn = 0;

      var streaks = [];
      for (var i = 0; i < STREAKS; i++) {
        streaks.push({
          y: rand(), x: rand(),
          sp: 18 + rand() * 70,
          len: 0.06 + rand() * 0.32,
          a: 0.30 + rand() * 0.70,
          vy: (rand() - 0.5) * 240,
          h: 1 + Math.floor(rand() * 3),
          hot: rand() > 0.86
        });
      }

      var LINES = mob ? [CAPS.first, CAPS.last] : [CAPS.first + ' ' + CAPS.last];
      var glyphs = [];
      var layoutRev = 0;

      /* Per glyph exit vector, seeded so the name comes apart the same way on
         every visit. Assigned once, independent of layout. */
      var vecRand = SE.rng(9182);
      var vectors = [];
      for (var v = 0; v < 40; v++) {
        var ang = vecRand() * TAU;
        vectors.push({ dx: Math.cos(ang), dy: Math.sin(ang) * 0.7, rot: (vecRand() - 0.5) * 0.32 });
      }

      function layout() {
        glyphs = [];
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4) return;
        var padX = w * 0.05;
        var avail = w - padX * 2;
        var probe = 140;
        var fs = Infinity, sums = [];
        var li, i;

        for (li = 0; li < LINES.length; li++) {
          cx2.font = '700 ' + probe + 'px "Space Grotesk", sans-serif';
          var sum = 0;
          for (i = 0; i < LINES[li].length; i++) sum += cx2.measureText(LINES[li].charAt(i)).width;
          sums.push(sum);
          fs = Math.min(fs, probe * (avail / Math.max(1, sum)));
        }
        var capH = fs * 0.72;
        var gap = fs * 0.06;
        var totalH = capH * LINES.length + gap * (LINES.length - 1);
        if (totalH > h * 0.72) { var f = (h * 0.72) / totalH; fs *= f; capH *= f; gap *= f; totalH *= f; }

        var top = (h - totalH) / 2;
        var k = 0;
        for (li = 0; li < LINES.length; li++) {
          cx2.font = '700 ' + Math.round(fs) + 'px "Space Grotesk", sans-serif';
          var lineW = 0, adv = [];
          for (i = 0; i < LINES[li].length; i++) {
            var a = cx2.measureText(LINES[li].charAt(i)).width;
            adv.push(a); lineW += a;
          }
          var x = padX + (avail - lineW) / 2;
          for (i = 0; i < LINES[li].length; i++) {
            glyphs.push({
              ch: LINES[li].charAt(i),
              x: x, y: top + capH, fs: Math.round(fs),
              vec: vectors[k % vectors.length]
            });
            x += adv[i];
            k++;
          }
          top += capH + gap;
        }
        layoutRev++;
      }

      /* A wash under the streaks. 150 hairlines alone are far too sparse to
         read through a letterform: without a base value the name looks like an
         empty outline rather than a window onto something. Built once per
         resize; only the streaks move. */
      var wash = null;
      function buildWash() {
        if (cv.h < 4) return;
        wash = cx2.createLinearGradient(0, 0, cv.w, cv.h);
        wash.addColorStop(0, 'rgba(158,232,252,0.92)');
        wash.addColorStop(0.42, 'rgba(64,172,218,0.72)');
        wash.addColorStop(1, 'rgba(28,84,132,0.62)');
      }

      cv.observe(function () { layout(); buildWash(); render(); });
      layout();
      buildWash();

      var progress = 0;
      var scrubber = null;
      if (!sh.isPage) {
        scrubber = SE.scrub(ctx.scroller, sh.rail.rail, function (p) { progress = p; });
      }

      /* ------------------------------------------------------------ draw */
      function render() {
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4 || !glyphs.length) return;
        cv.clear();

        /* Slowly and then quickly. A linear dissolve reads as a slider. */
        var d = M.clamp((drawn - 0.42) / 0.50, 0, 1);
        d = 1 - Math.pow(1 - d, 2);
        var fieldA = 1 - d;

        /* --- the letters, as the destination --------------------------- */
        /* Glyphs first, then source-atop for everything after them.
           destination-in is the mode people reach for here and it is wrong:
           it is not additive, so the second letter erases everything the
           first one kept. source-atop clips each new draw to the existing
           alpha and leaves the rest of the canvas alone, which is what lets a
           wash and 150 streaks accumulate inside twelve letterforms. */
        cx2.fillStyle = '#0d2534';
        drawGlyphs(cx2, d, true);
        cx2.globalCompositeOperation = 'source-atop';

        if (wash) {
          cx2.globalAlpha = fieldA;
          cx2.fillStyle = wash;
          cx2.fillRect(0, 0, w, h);
          cx2.globalAlpha = 1;
        }

        var t = env.reduced ? 0 : elapsed;
        for (var i = 0; i < streaks.length; i++) {
          var s = streaks[i];
          var len = s.len * w;
          var x = ((s.x * (w + len)) + t * s.sp) % (w + len) - len;
          var y = s.y * h + s.vy * d;
          cx2.fillStyle = s.hot
            ? 'rgba(226,248,255,' + (s.a * fieldA).toFixed(3) + ')'
            : 'rgba(120,216,244,' + (s.a * 0.55 * fieldA).toFixed(3) + ')';
          cx2.fillRect(x | 0, y | 0, len, s.h);
        }

        cx2.globalCompositeOperation = 'source-over';

        /* --- the shape survives the field emptying --------------------- */
        var outline = 0.10 * (1 - M.clamp((drawn - 0.88) / 0.12, 0, 1));
        if (outline > 0.004) {
          cx2.strokeStyle = 'rgba(236,236,239,' + outline.toFixed(3) + ')';
          cx2.lineWidth = 1;
          drawGlyphs(cx2, d, false);
        }
      }

      function drawGlyphs(g2, d, fill) {
        var w = cv.w;
        g2.textAlign = 'left';
        g2.textBaseline = 'alphabetic';
        for (var g = 0; g < glyphs.length; g++) {
          var G = glyphs[g];
          g2.save();
          g2.translate(G.x + G.vec.dx * d * w * 0.26, G.y + G.vec.dy * d * w * 0.26);
          if (d > 0.001) g2.rotate(G.vec.rot * d);
          g2.font = '700 ' + G.fs + 'px "Space Grotesk", sans-serif';
          if (fill) g2.fillText(G.ch, 0, 0);
          else g2.strokeText(G.ch, 0, 0);
          g2.restore();
        }
      }

      /* ------------------------------------------------------------ tick */
      var lastDrawn = -1;
      function tick(dt) {
        elapsed += dt;
        var target = sh.isPage ? 0 : progress;
        drawn = env.reduced ? target : M.damp(drawn, target, 8, dt);

        /* Reduced motion means the field does not move, so a frame with the
           same progress as the last one has nothing to redraw. Subscribed
           rather than unsubscribed because the reader can still scroll, and
           scroll-linked change is the reader moving it, not autoplay. */
        if (env.reduced && Math.abs(drawn - lastDrawn) < 0.0004) return;
        lastDrawn = drawn;

        if (!sh.isPage) {
          /* The handoff. Opacity only, one write, on a composited property. */
          var out = 1 - M.clamp((drawn - 0.82) / 0.18, 0, 1);
          host.style.opacity = out.toFixed(3);
          if (more) more.classList.toggle('is-on', drawn > 0.35);
        }
        render();
      }
      SE.ticker.add(tick);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          if (scrubber) scrubber.kill();
          cv.destroy();
          sh.destroy();
        }
      };
    }
  });

  /* ======================================================================
     S02  MAGNET             (pairs with P02 Mass)
     ----------------------------------------------------------------------
     A composition where every element is attracted to the pointer, and the
     amount it moves is inversely proportional to how important it is. The
     name barely shifts. The call to action moves most. Hierarchy is stated by
     mass rather than by size, and the reader can feel it before they read it.

     WHY MASS AND NOT UNIFORM MAGNETISM
     ----------------------------------
     Uniform magnetism is a novelty: everything slides toward the cursor and
     the composition means nothing. Giving each element a mass turns the same
     mechanic into an argument about rank. It also solves the practical
     problem that a heading which moves is a heading that is hard to read.
     ====================================================================== */

  SE.register({
    area: 'hero',
    variant: 'section',
    id: 'hero-section-magnet',
    num: 2,
    name: 'Magnet',
    kind: 'DOM / mass field',
    accent: '#6e9bd1',
    tagline: 'Everything is pulled toward you, in inverse proportion to its rank',
    desc: 'Each element in the composition is attracted to the pointer with a mass of its own. The name is heavy and ' +
          'barely shifts, the call to action is light and comes to meet you.',
    interaction: 'Move near an element to pull it. Focus produces the same pull, so the keyboard sees the same composition.',
    hint: 'Move near an element to pull it',
    screens: 1.8,

    preview: function (ctx, w, h, t, heat) {
      var px = w * (0.5 + Math.sin(t * 0.55) * 0.34);
      var py = h * (0.5 + Math.cos(t * 0.41) * 0.24);
      /* Four elements, four masses. Heavier bars move less. */
      var items = [
        { x: 0.12, y: 0.30, w: 0.52, h: 0.13, m: 1.0 },
        { x: 0.12, y: 0.50, w: 0.34, h: 0.05, m: 0.55 },
        { x: 0.12, y: 0.66, w: 0.44, h: 0.035, m: 0.34 },
        { x: 0.12, y: 0.80, w: 0.20, h: 0.06, m: 0.16 }
      ];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var bx = it.x * w, by = it.y * h;
        var dx = px - (bx + it.w * w * 0.5), dy = py - (by + it.h * h * 0.5);
        var dist = Math.hypot(dx, dy);
        var fall = Math.exp(-0.5 * Math.pow(dist / (w * 0.42), 2));
        var pull = (0.26 + heat * 0.24) * fall / it.m;
        ctx.fillStyle = i === 3
          ? 'rgba(110,155,209,' + (0.7 + heat * 0.3).toFixed(3) + ')'
          : 'rgba(236,236,239,' + (0.20 + (1 - it.m) * 0.30 + fall * 0.22).toFixed(3) + ')';
        ctx.fillRect(bx + dx * pull, by + dy * pull, it.w * w, it.h * h);
      }
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, TAU);
      ctx.fillStyle = 'rgba(110,155,209,0.9)';
      ctx.fill();
    },

    spec: {
      subtitle: 'Per element attraction with per element mass, so movement encodes rank',
      philosophy: [
        'Magnetic hover is everywhere and almost always means nothing. Giving each element a mass turns it into a statement: what moves least matters most, and the reader can feel the hierarchy before they have read a word.',
        'It also fixes the usual failure. A heading that slides around under the pointer is a heading nobody can read, so here the heading is the heaviest thing in the field and moves about four pixels.',
        'The section still has to leave. Attraction fades to zero over the last quarter of the rail so the composition is completely still by the time it hands off.'
      ],
      hierarchy: [
        '1. The name, mass 1.0, maximum travel 5px. It is the anchor of the field in every sense.',
        '2. The value line, mass 0.55, travel 11px.',
        '3. Role and availability, mass 0.38, travel 16px.',
        '4. The primary action, mass 0.16, travel 38px. It comes to meet the pointer, which is the one place in the composition where that is the correct behaviour.',
        '5. Three index marks, mass 0.12, travel up to 50px. They are the free particles that make the field visible.'
      ],
      structure: [
        'SE.scrollRail with 1.8 screens. Short on purpose: the idea is legible in about one screen of scrolling and padding it out would be padding.',
        'One .__field wrapper, position:relative, containing every attractable element.',
        'Each element is a real node with a data-mass attribute. The concept reads offsetLeft and offsetTop once per layout, so element centres never require a getBoundingClientRect per element per frame.',
        'One rect read per frame, on the field wrapper, to map the pointer into field coordinates. Reading it per element would be seven forced layouts a frame.',
        'The see-more control is a real button, and it is itself an attractable element with mass 0.16.'
      ],
      interaction: [
        'For each element: delta from element centre to pointer, gaussian falloff with sigma equal to 34% of the field width, offset equal to delta multiplied by 0.30 and divided by mass, clamped to that element maximum travel.',
        'Damped at lambda 7 toward the target, so the elements have a settle rather than tracking the cursor exactly.',
        'Attraction is multiplied by a scroll gate: 0 below progress 0.12, full between 0.28 and 0.72, back to 0 by 0.92. The field is only live while the section is actually being read.',
        'Keyboard: focus on an attractable control applies its full travel toward the field centre, so a keyboard user sees the same emphasis a pointer user sees. That is the WCAG 2.2 equivalent for a pointer only effect.',
        'On touch there is no attraction at all. Instead scroll progress translates the elements along their own seeded vectors between progress 0.15 and 0.60, which is a different composition using the same mechanic.'
      ],
      choreography: [
        { n: 'Assemble', d: 'Every element enters from its own vector at 40px with opacity 0, resolving between progress 0.02 and 0.22. Progress driven, not time driven, so it is reversible.' },
        { n: 'Attraction', d: 'Damped at lambda 7, roughly 140ms to 90% of target. Faster than the pointer damping in the shared store, so the elements feel attached to the cursor rather than trailing it.' },
        { n: 'Release', d: 'When the pointer leaves the field the target goes to zero and the same lambda 7 damping returns everything. Symmetric, because a magnet does not have a different release curve.' },
        { n: 'Focus pull', d: 'A focused control transitions to its full travel over 240ms cubic-bezier(0.23, 1, 0.32, 1). A transition, not the frame loop, so it retargets correctly when focus moves quickly.' },
        { n: 'Exit', d: 'Attraction gate to 0 across progress 0.72 to 0.92, then the whole field translate3d(0,-40px,0) with opacity to 0 across 0.86 to 1.0. Still before it leaves: a composition that is still moving as it exits reads as a glitch.' }
      ],
      scroll: [
        '1.8 screens of rail. The reader is never held: progress maps directly to the state of the field and the section releases at the end.',
        'Attraction is gated by progress so the field is inert while the section is entering or leaving.',
        'No wheel capture, no preventDefault, no scroll listener on window.'
      ],
      hover: [
        'The entire attraction field is inside @media (hover: hover) and (pointer: fine).',
        'Elements do not change colour, size or weight on hover. They move. One signal.',
        'The primary action keeps its standard fill wipe on top of the magnetic travel, because the button still has to behave like a button.'
      ],
      click: [
        'The primary action goes to the work index; the secondary opens mail.',
        '"See the full hero" opens the page level counterpart, the Mass treatment of the same name.'
      ],
      responsive: {
        desktop: 'Full field, seven attractable elements, index marks present.',
        tablet: 'Index marks drop to one, travel distances scale by 0.7 with the narrower field.',
        mobile: 'Below 768px this is a different composition. There is no pointer, so there is no field: the elements are laid out as a left aligned stack and scroll progress translates each one along its seeded vector between progress 0.15 and 0.60, which gives the same sense of parts finding their positions. Index marks are removed and the actions go full width.'
      },
      a11y: [
        'Every element is real DOM in reading order. Nothing here is painted.',
        'Focus produces the same visual emphasis as hover, which is the accessible equivalent required for a pointer only effect.',
        'Maximum travel on any focusable control is 38px and the control never moves while it has focus, so a keyboard target is never a moving target.',
        'Under prefers-reduced-motion attraction is disabled entirely, the entry is an opacity change, and the composition sits in its arranged positions.',
        'Text never moves far enough to break a magnifier viewport: 5px on the name, 11px on the value line.'
      ],
      perf: [
        'One getBoundingClientRect per frame, on the field wrapper only. Element positions come from offsetLeft and offsetTop, cached per layout.',
        'One transform write per element per frame, on at most seven elements.',
        'No layout property is ever animated, and no child transform is driven from a custom property on the parent, which would recalculate styles for every child.',
        'The frame subscription is skipped entirely when there is no fine pointer or reduced motion is on.'
      ],
      packages: [
        { p: 'gsap + ScrollTrigger (installed)', w: 'For the progress scrub only. The attraction itself must not be a tween: it retargets continuously.' },
        { p: 'framer-motion', w: 'A reasonable alternative for the attraction using useMotionValue and useTransform, which keeps the values off the React render path. Do not use useState for pointer position under any circumstances.' },
        { p: 'no physics engine', w: 'This is one exponential falloff and one damping term. A physics library here is 40kb for six lines of arithmetic.' }
      ],
      architecture: [
        { f: 'components/hero/MagnetSection.tsx', r: 'Server rendered composition. Every element and all copy in the HTML payload.' },
        { f: 'components/hero/useMagnetField.ts', r: '"use client" hook. Registers elements with a mass, owns the frame subscription, writes transforms through refs.' },
        { f: 'app/(site)/hero/page.tsx', r: 'The page level route the see-more control opens.' }
      ],
      state: [
        'Element offsets are refs in one array. Zero React state in the field.',
        'The scroll gate is a ref written by the ScrollTrigger callback.',
        'The only state is whether the see-more control is visible, which flips once at a threshold.'
      ],
      typography: [
        'Name: display face 500 at clamp(2.75rem, 7.5vw, 6.5rem), tracking -0.045em.',
        'Value line: display face 400 at clamp(1rem, 1.4vw, 1.1875rem), max 38ch.',
        'Role, availability and index marks: mono 10px, tracking 0.2em, uppercase.',
        'Nothing here uses type size to state hierarchy beyond the name. That is the point: mass is doing that work.'
      ],
      color: [
        'The signature slate blue appears on the index marks, the availability dot and the primary action border. Three places.',
        'Everything else is the ink scale. A magnetic field that is also a colour field is two ideas fighting.',
        'Ground is void-2, one step up from the page, so the section reads as a distinct block within a longer page.'
      ],
      spacing: [
        'The field is inset by the page gutter and vertically centred in the sticky viewport.',
        'Name to value line: 1.5rem. Value line to actions: 2rem.',
        'Index marks sit on the right third at 22%, 54% and 79% of the field height. Asymmetric on purpose: evenly spaced marks read as a scale.',
        'Maximum travel never exceeds the gap to the nearest neighbour, so two attracted elements can never collide.'
      ],
      relationships: [
        'Travel distance encodes rank, inversely. That is the entire information design of the section.',
        'The index marks exist to make the field visible where there is no content, so the reader can see that the whole plane is live.',
        'The scroll gate encodes attention: the field is only alive while the section is the thing being read.'
      ],
      acceptance: [
        'Moving the pointer across the composition moves the call to action several times further than the name.',
        'The name moves, but by so little that it is never hard to read.',
        'Tabbing to the primary action produces the same pull, and the control does not move once focused.',
        'By the time the section starts to leave, nothing is moving.',
        'Scrolling back up reassembles the composition from the same vectors.',
        'With reduced motion on, nothing is attracted to anything and the composition is still deliberately arranged.',
        'At 390px there is no attraction, and scroll progress moves the elements into place instead.'
      ]
    },

    mount: function (root, ctx) {
      var mob = env.mobile;
      var sh = shellFor(root, ctx, 'hero-magnet', 1.8);
      var host = sh.host;

      var field = SE.el('div', 'hero-magnet__field');
      host.appendChild(field);

      /* Mass, and the maximum travel that mass allows. Movement encodes rank,
         so these two numbers ARE the hierarchy of the section. */
      function add(cls, html, mass, travel, tag) {
        var n = SE.el(tag || 'div', 'hero-magnet__' + cls, html);
        n.style.setProperty('--k', String(items.length));
        field.appendChild(n);
        items.push({ el: n, mass: mass, travel: travel, x: 0, y: 0, tx: 0, ty: 0, cx: 0, cy: 0, vec: null });
        return n;
      }
      var items = [];

      add('name', IDENT.first + '<br>' + IDENT.last, 1.0, 5, 'h2');
      add('role', IDENT.role, 0.38, 16, 'p');
      add('value', IDENT.value, 0.55, 11, 'p');

      var acts = add('cta', '', 0.16, 38);
      acts.appendChild(actions('hero-magnet__ctarow', 'Write to me', function () {
        SE.toast && SE.toast('Demo hero', IDENT.mail);
      }));

      add('avail', '<i></i>' + IDENT.status, 0.38, 16, 'p');

      if (!mob) {
        var marks = ['22', '54', '79'];
        marks.forEach(function (top, i) {
          var m = add('mark', SE.pad(i + 1), 0.12, 50, 'span');
          m.style.top = top + '%';
          m.setAttribute('aria-hidden', 'true');
        });
      }

      var more = null;
      if (!sh.isPage) {
        more = SE.seeMore('See the full hero', ctx.onSeeMore);
        more.classList.add('hero-magnet__more');
        host.appendChild(more);
      }

      /* Seeded exit vectors, reused for the touch composition. */
      var vr = SE.rng(6612);
      items.forEach(function (it) {
        var a = vr() * TAU;
        it.vec = { dx: Math.cos(a), dy: Math.sin(a) };
      });

      /* --------------------------------------------------------- model */
      var live = env.fine && !env.reduced && !mob;
      var progress = sh.isPage ? 0.5 : 0;
      var gate = 0;

      function measure() {
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          /* offsetLeft and offsetTop are layout relative and unaffected by the
             transforms this concept writes, so centres never need a rect. */
          it.cx = it.el.offsetLeft + it.el.offsetWidth / 2;
          it.cy = it.el.offsetTop + it.el.offsetHeight / 2;
        }
      }

      var ro = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(measure);
        ro.observe(field);
      } else {
        window.addEventListener('resize', measure);
      }
      measure();

      var scrubber = null;
      if (!sh.isPage) {
        scrubber = SE.scrub(ctx.scroller, sh.rail.rail, function (p) { progress = p; });
      }

      function tick(dt) {
        /* The field is only alive while the section is the thing being read. */
        var g = M.clamp((progress - 0.12) / 0.16, 0, 1) * (1 - M.clamp((progress - 0.72) / 0.20, 0, 1));
        gate = M.damp(gate, sh.isPage ? 1 : g, 6, dt);

        var enter = M.clamp((progress - 0.02) / 0.20, 0, 1);
        enter = sh.isPage ? 1 : 1 - Math.pow(1 - enter, 3);
        var exit = sh.isPage ? 0 : M.clamp((progress - 0.86) / 0.14, 0, 1);

        var r = field.getBoundingClientRect();      /* one rect read per frame */
        var px = SE.pointer.x - r.left;
        var py = SE.pointer.y - r.top;
        var sig = r.width * 0.34;
        var inside = live && SE.pointer.active &&
          px > -160 && py > -160 && px < r.width + 160 && py < r.height + 160;

        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var tx = 0, ty = 0;

          if (inside) {
            var dx = px - it.cx, dy = py - it.cy;
            var d2 = (dx * dx + dy * dy) / (sig * sig);
            var fall = Math.exp(-0.5 * d2);
            var pull = 0.30 * fall / it.mass * gate;
            tx = M.clamp(dx * pull, -it.travel, it.travel);
            ty = M.clamp(dy * pull, -it.travel, it.travel);
          } else if (!live && !env.reduced) {
            /* No pointer: scroll progress moves the parts into position
               instead. Same mechanic, different input. */
            var s = 1 - M.clamp((progress - 0.15) / 0.45, 0, 1);
            tx = it.vec.dx * s * it.travel * 1.4;
            ty = it.vec.dy * s * it.travel * 1.4;
          }

          it.tx = tx; it.ty = ty;
          it.x = M.damp(it.x, tx, 7, dt);
          it.y = M.damp(it.y, ty, 7, dt);

          var ex = (1 - enter) * it.vec.dx * 40;
          var ey = (1 - enter) * it.vec.dy * 40 - exit * 40;
          it.el.style.transform =
            'translate3d(' + (it.x + ex).toFixed(2) + 'px,' + (it.y + ey).toFixed(2) + 'px,0)';
          it.el.style.opacity = (enter * (1 - exit)).toFixed(3);
        }

        if (more) more.classList.toggle('is-on', progress > 0.30 && progress < 0.86);
      }

      var sub = null;
      if (env.reduced) {
        items.forEach(function (it) { it.el.style.opacity = '1'; });
      } else {
        sub = SE.ticker.add(tick);
      }

      return {
        destroy: function () {
          if (sub) SE.ticker.remove(tick);
          if (scrubber) scrubber.kill();
          if (ro) ro.disconnect(); else window.removeEventListener('resize', measure);
          sh.destroy();
        }
      };
    }
  });

  /* ======================================================================
     S03  ASSEMBLY           (pairs with P03 Corridor)
     ----------------------------------------------------------------------
     The hero is built out of a modular grid on entry and taken back apart as
     the reader leaves. The grid is not a decorative overlay: the name, the
     copy and the actions occupy named cells in the same grid the field is
     made of, so what assembles is the composition itself.

     WHY THIS IS CLASS TOGGLES AND NOT A PER FRAME LOOP
     --------------------------------------------------
     Forty cells, each with an entry and an exit, is exactly the case where
     people reach for a tween per element and end up with forty concurrent
     animations. Here the entry is one class and a transition-delay computed
     from a custom property, and the exit is six band classes crossing six
     progress thresholds. Total per frame cost is zero, and total style writes
     across the whole section is under ten.
     ====================================================================== */

  SE.register({
    area: 'hero',
    variant: 'section',
    id: 'hero-section-assembly',
    num: 3,
    name: 'Assembly',
    kind: 'DOM / modular grid',
    accent: '#e2ded3',
    tagline: 'A hero that builds itself out of the grid it is set on',
    desc: 'Cells resolve in a seeded order to build the composition, then leave in bands as the reader scrolls past. ' +
          'The name and the copy sit in the same grid the field is made of.',
    interaction: 'Scroll. Entry assembles the grid, exit disassembles it in bands, and both are reversible.',
    hint: 'Scroll to assemble and release',
    screens: 2.2,

    preview: function (ctx, w, h, t, heat) {
      var cols = 7, rows = 4;
      var cw = w / cols, ch = h / rows;
      var cyc = (t * 0.26) % 1;
      var rnd = SE.rng(1237);
      var order = [];
      var i;
      for (i = 0; i < cols * rows; i++) order.push({ i: i, r: rnd() });
      order.sort(function (a, b) { return a.r - b.r; });

      for (i = 0; i < order.length; i++) {
        var k = i / order.length;
        var on = cyc > k * 0.7 && cyc < 0.72 + k * 0.26;
        if (!on) continue;
        var idx = order[i].i;
        var cxp = (idx % cols) * cw;
        var cyp = Math.floor(idx / cols) * ch;
        var mid = Math.floor(idx / cols) === 1 || Math.floor(idx / cols) === 2;
        ctx.fillStyle = mid
          ? 'rgba(226,222,211,' + (0.16 + heat * 0.14).toFixed(3) + ')'
          : 'rgba(226,222,211,0.05)';
        ctx.fillRect(cxp + 1, cyp + 1, cw - 2, ch - 2);
      }

      ctx.font = '500 ' + Math.round(h * 0.22) + 'px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(236,236,239,' + (0.5 + Math.min(1, cyc * 2) * 0.45).toFixed(3) + ')';
      ctx.fillText('MIFTAUL', cw * 0.5, h * 0.5);
    },

    spec: {
      subtitle: 'A modular grid that resolves into the composition and leaves in bands',
      philosophy: [
        'Most grid reveal heroes put a decorative grid behind content that was laid out separately. Here the content occupies cells of the same grid, so assembling the grid and assembling the composition are the same event.',
        'The order matters more than the effect. Cells resolve on a seeded random order, not left to right, because a sequential wipe reads as a loading bar and a random one reads as a structure finding itself.',
        'It leaves the way it came, in bands, so the reader who scrolls back gets the composition back exactly.'
      ],
      hierarchy: [
        '1. The name, spanning columns 1 to 7 of 12 on rows 2 to 3.',
        '2. The value line in columns 8 to 12 on row 3, so it reads as a marginal note rather than a subheading.',
        '3. The role and the availability line on row 4, columns 1 to 4 and 9 to 12.',
        '4. The actions on row 5, columns 1 to 4.',
        '5. The empty cells. They are the quietest thing on screen at 3% ink and they are what makes the grid legible.'
      ],
      structure: [
        'SE.scrollRail at 2.2 screens with a sticky one screen viewport.',
        'One CSS grid, 12 columns by 5 rows on desktop, 4 by 6 on mobile. Every cell is a real div with a --k index; content blocks are grid-area placed children of the same grid.',
        'Cells carry a --band index from 0 to 5, assigned by column group, which is what the exit uses.',
        'Content is real DOM in reading order regardless of grid placement, because grid-area does not reorder the accessibility tree and must not be relied on to.',
        'In page mode the grid renders fully assembled with no rail.'
      ],
      interaction: [
        'Entry: an IntersectionObserver at threshold 0.2 adds .is-in once, and the cells resolve on transition-delay: calc(var(--k) * 26ms) where --k is a seeded shuffle index. About 1.05s for forty cells.',
        'Content blocks resolve after the field, at fixed delays of 620ms, 700ms, 760ms and 820ms.',
        'Exit: six band classes are toggled as scroll progress crosses 0.62, 0.66, 0.70, 0.74, 0.78 and 0.82. Six class writes for the whole disassembly.',
        'The name and the actions are in the last band, so what survives longest is what matters most.',
        'No pointer interaction. The section is driven entirely by arrival and by progress.'
      ],
      choreography: [
        { n: 'Cell resolve', d: 'opacity 0 to 1 with transform scale(0.94) to none, 520ms cubic-bezier(0.23, 1, 0.32, 1), delay index * 26ms from a seeded shuffle. 26ms because forty cells at 40ms would take 1.6s, which is past the point where a reveal becomes a wait.' },
        { n: 'Content resolve', d: 'opacity 0 to 1 with translate3d(0,18px,0) to none, 640ms cubic-bezier(0.23, 1, 0.32, 1), delays 620, 700, 760, 820ms. Fixed delays, not part of the shuffle: the content is not one of the cells, it is what the cells were building toward.' },
        { n: 'Band exit', d: 'Per band: opacity to 0 with transform scale(0.96) and translate3d(0,-14px,0), 420ms cubic-bezier(0.77, 0, 0.175, 1). ease-in-out on the way out because the cells are leaving the screen rather than arriving in it.' },
        { n: 'Name exit', d: 'Last band, 0.82 progress, same 420ms. It is the only thing on screen for the final 18% of the rail, which is the handoff.' },
        { n: 'Reverse', d: 'Every threshold is a class toggle on a comparison, so scrolling back up re-adds the bands in reverse and the same transitions run backwards. Nothing is one way.' }
      ],
      scroll: [
        '2.2 screens. Enough for the assembly to be read, held and released.',
        'Six threshold crossings across the exit range. Class toggles, not per frame writes.',
        'The section never captures the wheel and releases cleanly at both ends.'
      ],
      hover: [
        'Cells have no hover state. Forty hoverable rectangles that do nothing is forty invitations to nothing.',
        'Only the real controls have hover treatment, and it is the shared button treatment.'
      ],
      click: [
        'The two actions behave as everywhere else.',
        '"See the full hero" opens the page level counterpart, the Corridor treatment.'
      ],
      responsive: {
        desktop: '12 by 5 grid, 60 cells, gap 2px, cell minimum height 4.4vh.',
        tablet: '8 by 5, 40 cells, content spans widen to keep the same visual weight.',
        mobile: 'Below 768px this is a different composition: a 4 by 6 grid, the name spanning all four columns on rows 2 and 3, copy stacked below rather than set as a marginal note, and the shuffle stagger drops to 18ms so the assembly finishes in under 0.5s. A phone reader does not wait a second for a grid.'
      },
      a11y: [
        'Every cell is aria-hidden and has no tab stop. Sixty focusable rectangles would destroy the tab order of the page.',
        'Content is in source order regardless of grid placement, so the reading order and the visual order agree.',
        'Under prefers-reduced-motion every cell and every content block is present at full opacity with no transform, no stagger and no exit. The composition is arranged; it simply does not assemble.',
        'The see-more control is a real button, in the tab order at all times.',
        'Empty cells at 3% ink carry no information and are not a contrast failure; every piece of actual content is on the ground, not on a cell.'
      ],
      perf: [
        'Zero per frame work. The entry is one class and a CSS cascade; the exit is six class toggles across the whole section.',
        'The stagger is transition-delay from a custom property, which is one style recalculation on entry rather than sixty tweens.',
        'transform and opacity only. Cells never animate a layout property, so the grid is laid out exactly once.',
        'The scroll subscription is a ScrollTrigger callback comparing against six numbers, which is cheaper than most scroll handlers do in their first line.'
      ],
      packages: [
        { p: 'none required for the animation', w: 'CSS grid plus one IntersectionObserver plus six class toggles. Adding a stagger library here would be adding a runtime to do what transition-delay does at zero cost.' },
        { p: 'gsap + ScrollTrigger (installed)', w: 'For the progress value only, and only because the project already has it. An IntersectionObserver rootMargin ladder would also work.' },
        { p: 'no framer-motion', w: 'AnimatePresence and staggerChildren would mount sixty motion components to animate opacity. The cost is not worth it for a transition CSS already does.' }
      ],
      architecture: [
        { f: 'components/hero/AssemblySection.tsx', r: 'Server rendered grid and content. Cell --k values come from a seeded shuffle computed on the server so the markup is deterministic and hydration matches.' },
        { f: 'components/hero/useAssemblyBands.ts', r: '"use client" hook. Owns the IntersectionObserver and the six band thresholds.' },
        { f: 'app/(site)/hero/page.tsx', r: 'The page level route the see-more control opens.' },
        { f: 'lib/seededShuffle.ts', r: 'Deterministic shuffle. The assembly order must be the same on every visit or the section feels arbitrary.' }
      ],
      state: [
        'The entry flag is one boolean, set once.',
        'Band state is a single integer, 0 to 6, updated only when a threshold is crossed. Not a float, and not progress.',
        'Progress itself is a ref. Putting it in state would re-render sixty cells sixty times a second.'
      ],
      typography: [
        'Name: display face 500 at clamp(2.5rem, 6.5vw, 5.5rem), tracking -0.04em, line-height 0.92. Smaller than the page concepts because it shares the frame with a visible grid.',
        'Value line: display face 400 at 1rem, max 32ch, set as a marginal note in the right columns.',
        'Role, availability and cell indices: mono 10px, tracking 0.2em, uppercase.',
        'The type sits on the grid lines, not floating between them. Baseline alignment to the cell edges is what makes the composition read as one system.'
      ],
      color: [
        'Cells are 3% ink, rising to 6% for the two rows the content occupies. The step is what makes the content rows read as occupied.',
        'The signature bone hue appears on the availability dot, the cell indices and the primary action border.',
        'Ground is void-2, one step up from the page, so the section is a block within a longer page.',
        'No cell is ever coloured to indicate anything. The grid is structure, not data.'
      ],
      spacing: [
        'Grid gap is 2px, which reads as a hairline system rather than as tiles.',
        'The grid is inset by the page gutter, so it lands on the site grid.',
        'Content blocks have 1.25rem of internal padding from their cell edges, so type never sits on a grid line.',
        'Five rows at a minimum of 4.4vh each, so the grid keeps its proportion on a short viewport.'
      ],
      relationships: [
        'Cell tone encodes occupancy: the rows carrying content are one step brighter than the rest.',
        'Resolve order encodes nothing, deliberately. It is seeded and random because any order that meant something would be a hierarchy claim the grid cannot support.',
        'Exit band encodes rank: what leaves last is what matters most, and that is the only ranking the disassembly makes.'
      ],
      acceptance: [
        'Entering the section, the cells resolve in a scattered order and finish in about a second, and the content lands after them.',
        'The name and the copy are aligned to the same grid the cells are drawn on.',
        'Scrolling out removes the cells in six bands, leaving the name last.',
        'Scrolling back up reassembles all six bands in reverse with no stuck cells.',
        'The order is identical on every reload.',
        'With reduced motion on the grid is present, complete and still.',
        'At 390px the grid is 4 by 6, the copy is stacked, and the assembly is finished in under half a second.'
      ]
    },

    mount: function (root, ctx) {
      var mob = env.mobile;
      var sh = shellFor(root, ctx, 'hero-assembly', 2.2);
      var host = sh.host;

      var COLS = mob ? 4 : (env.tablet ? 8 : 12);
      var ROWS = mob ? 6 : 5;
      var BANDS = 6;

      var grid = SE.el('div', 'hero-assembly__grid');
      grid.style.setProperty('--cols', String(COLS));
      grid.style.setProperty('--rows', String(ROWS));
      host.appendChild(grid);

      /* Two layers on one template rather than one grid holding both. Auto
         placed cells flow AROUND explicitly placed content, which would push
         the field out of its own rectangle; separating them keeps the cells
         on an exact COLS by ROWS lattice and the content on the same lines. */
      var fieldEl = SE.el('div', 'hero-assembly__field');
      fieldEl.setAttribute('aria-hidden', 'true');
      fieldEl.style.setProperty('--cols', String(COLS));
      fieldEl.style.setProperty('--rows', String(ROWS));
      grid.appendChild(fieldEl);

      /* Seeded shuffle: the resolve order has to be identical on every visit,
         or the section feels arbitrary rather than composed. */
      var srand = SE.rng(31417);
      var total = COLS * ROWS;
      var order = [];
      for (var i = 0; i < total; i++) order.push({ i: i, r: srand() });
      order.sort(function (a, b) { return a.r - b.r; });
      var rank = new Array(total);
      for (i = 0; i < order.length; i++) rank[order[i].i] = i;

      var contentRows = mob ? [1, 2] : [1, 2];
      for (i = 0; i < total; i++) {
        var row = Math.floor(i / COLS);
        var cell = SE.el('div', 'hero-assembly__cell' + (contentRows.indexOf(row) >= 0 ? ' is-occupied' : ''));
        cell.setAttribute('aria-hidden', 'true');
        cell.style.setProperty('--k', String(rank[i]));
        /* Band by column group, so the disassembly sweeps rather than
           dissolving, and the last band holds the name. */
        cell.style.setProperty('--band', String(Math.min(BANDS - 1, Math.floor((i % COLS) / (COLS / BANDS)))));
        cell.setAttribute('data-band', String(Math.min(BANDS - 1, Math.floor((i % COLS) / (COLS / BANDS)))));
        fieldEl.appendChild(cell);
      }

      var nameEl = SE.el('h2', 'hero-assembly__name', IDENT.first + '<br>' + IDENT.last);
      var valueEl = SE.el('p', 'hero-assembly__value', IDENT.value);
      var roleEl = SE.el('p', 'hero-assembly__role', IDENT.role);
      var availEl = SE.el('p', 'hero-assembly__avail', '<i></i>' + IDENT.status);
      var ctaEl = actions('hero-assembly__cta', 'Write to me', function () {
        SE.toast && SE.toast('Demo hero', IDENT.mail);
      });
      grid.appendChild(nameEl);
      grid.appendChild(valueEl);
      grid.appendChild(roleEl);
      grid.appendChild(availEl);
      grid.appendChild(ctaEl);

      var more = null;
      if (!sh.isPage) {
        more = SE.seeMore('See the full hero', ctx.onSeeMore);
        more.classList.add('hero-assembly__more');
        host.appendChild(more);
      }

      /* ------------------------------------------------------- behaviour */
      var vis = null;
      if (sh.isPage || env.reduced) {
        root.classList.add('is-in');
      } else {
        vis = onceVisible(host, function () { root.classList.add('is-in'); }, 0.2);
      }

      var band = -1;
      var THRESH = [0.62, 0.66, 0.70, 0.74, 0.78, 0.82];
      var scrubber = null;

      function setBand(n) {
        if (n === band) return;
        band = n;
        for (var b = 0; b < BANDS; b++) {
          fieldEl.classList.toggle('is-out-' + b, b < n);
        }
        if (more) more.classList.toggle('is-on', n === 0);
      }

      if (!sh.isPage && !env.reduced) {
        scrubber = SE.scrub(ctx.scroller, sh.rail.rail, function (p) {
          var n = 0;
          for (var t = 0; t < THRESH.length; t++) if (p > THRESH[t]) n = t + 1;
          setBand(n);
          if (more) more.classList.toggle('is-on', p > 0.24 && p < 0.66);
        });
      } else if (more) {
        more.classList.add('is-on');
      }

      return {
        destroy: function () {
          if (scrubber) scrubber.kill();
          if (vis) vis.destroy();
          root.classList.remove('is-in');
          sh.destroy();
        }
      };
    }
  });

  /* ======================================================================
     S04  TICKER             (pairs with P04 Signal)
     ----------------------------------------------------------------------
     Four bands of identity text running at different speeds, sheared by how
     fast the reader is scrolling. Scroll velocity is the input, and it drives
     both the speed of the bands and a horizontal skew, so the strip physically
     leans in the direction of travel and springs back when the reader stops.

     ONE MARQUEE, NOT FOUR
     ---------------------
     Four bands read as one device because they share one velocity, one shear
     and one type treatment; only direction and speed differ. Four unrelated
     marquees on a page is filler. The hero block sits BETWEEN the bands rather
     than over them, so the strip is the composition rather than a background
     for it.
     ====================================================================== */

  SE.register({
    area: 'hero',
    variant: 'section',
    id: 'hero-section-ticker',
    num: 4,
    name: 'Ticker',
    kind: 'DOM / velocity shear',
    accent: '#b466f0',
    tagline: 'Bands of identity that lean with how fast you are moving',
    desc: 'Four bands of identity text run at different speeds and shear with scroll velocity, so the strip leans in ' +
          'the direction of travel and springs back when the reader stops.',
    interaction: 'Scroll. Velocity drives band speed and shear; the bands never stop entirely.',
    hint: 'Scroll faster to shear the bands',
    screens: 2.4,

    preview: function (ctx, w, h, t, heat) {
      var rows = 4;
      var rh = h / rows;
      /* A velocity that swings, so the card shows the shear. */
      var vel = Math.sin(t * 0.9) * (0.6 + heat * 0.4);
      var skew = vel * 0.30;

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      for (var r = 0; r < rows; r++) {
        var dir = r % 2 ? -1 : 1;
        var sp = (26 + r * 13) * dir * (1 + vel * 1.6);
        var fs = Math.round(rh * 0.62);
        ctx.font = (r === 1 ? '500 ' : '300 ') + fs + 'px "Space Grotesk", sans-serif';
        var word = r === 1 ? 'MIFTAUL ISLAM  ' : 'FULL STACK  ';
        var wWidth = ctx.measureText(word).width;
        var off = ((t * sp) % wWidth + wWidth) % wWidth;
        var y = rh * (r + 0.5);
        ctx.save();
        ctx.transform(1, 0, -skew, 1, skew * y, 0);
        ctx.fillStyle = r === 1
          ? 'rgba(180,102,240,' + (0.72 + heat * 0.28).toFixed(3) + ')'
          : 'rgba(236,236,239,' + (0.16 + heat * 0.12).toFixed(3) + ')';
        for (var x = -off; x < w; x += wWidth) ctx.fillText(word, x, y);
        ctx.restore();
      }
    },

    spec: {
      subtitle: 'Four bands sharing one velocity, one shear and one type system',
      philosophy: [
        'A marquee that runs at a constant speed regardless of what the reader is doing is wallpaper. Making velocity the input turns it into a response: the strip knows the reader is moving and leans with them.',
        'One marquee per page is the rule. These four bands are one device, sharing a single velocity and a single shear, with only speed and direction differing. Four unrelated scrolling strips would be filler.',
        'The bands never stop. At rest they carry a slow base speed, because a marquee that halts reads as a bug rather than as a resting state.'
      ],
      hierarchy: [
        '1. The hero block, name and actions, sitting between bands two and three where the eye is already looking.',
        '2. Band two, the name band, set at 500 weight in the signature hue.',
        '3. Bands one, three and four in the ink scale at 300 weight, carrying the role, the stack and the availability.',
        '4. The rules between the bands. One hairline each, no boxes.'
      ],
      structure: [
        'SE.scrollRail at 2.4 screens with a sticky one screen viewport.',
        'Four .__band rows, each containing one .__track with its text repeated twice so the wrap is seamless.',
        'The hero block is a normal flow child between bands two and three, not an absolutely positioned overlay, so the bands and the composition share one layout.',
        'Each track carries its text twice and translates in the range -50% to 0, which wraps without measuring anything.',
        'Text inside the tracks is aria-hidden; the hero block carries the real content.'
      ],
      interaction: [
        'Velocity is the derivative of scroll progress: (p - pPrevious) / dt, damped at lambda 6, clamped to plus or minus 2.5.',
        'Band speed is base plus velocity * 320, where base is 14 to 34 px per second by band and direction alternates.',
        'Shear is velocity * -9 degrees, clamped to plus or minus 12deg, applied as skewX on the band. Past 12deg the letterforms stop being readable.',
        'Vertical squash: scaleY of 1 minus the absolute velocity * 0.03, clamped to a 0.94 floor. Squash and stretch, applied at a scale small enough to be felt rather than seen.',
        'Both shear and squash return to zero through the same damping when the reader stops, which is the spring back.',
        'The hero block itself never shears. Content the reader has to read does not move.'
      ],
      choreography: [
        { n: 'Base drift', d: 'Band speeds 14, 22, 28 and 34 px per second, alternating direction. Slow enough to be ambient, fast enough to be visibly alive at rest.' },
        { n: 'Velocity coupling', d: 'Band speed adds velocity * 320 px per second. At a normal wheel scroll that roughly triples the drift; at a flick it is about eight times.' },
        { n: 'Shear', d: 'skewX of velocity * -9deg clamped to 12deg, damped at lambda 6, about 170ms to settle. The negative sign makes the top of the band lead, which is the direction real inertia would take it.' },
        { n: 'Spring back', d: 'Same lambda 6 damping toward zero. No overshoot: a marquee that bounces reads as a toy.' },
        { n: 'Hero block', d: 'opacity 0 to 1 with translate3d(0,20px,0) to none across progress 0.06 to 0.24, and out across 0.80 to 0.96. Progress driven, so it is reversible.' }
      ],
      scroll: [
        '2.4 screens. Velocity needs room to build, so a shorter rail would make the shear unreachable at a normal scroll speed.',
        'Progress derivative is computed in the frame loop from a scrubbed value, never from a scroll event, so it is smooth and frame rate independent.',
        'The section releases cleanly and the bands keep their base drift right up to the moment they leave.'
      ],
      hover: [
        'No hover state on the bands. They are not targets.',
        'Only the real controls in the hero block have hover treatment.'
      ],
      click: [
        'The two actions in the hero block behave as everywhere else.',
        '"See the full hero" opens the page level counterpart, the Signal treatment.'
      ],
      responsive: {
        desktop: 'Four bands at clamp(2.5rem, 5.5vw, 4.5rem), hero block between bands two and three.',
        tablet: 'Three bands, type down to 4vw, same velocity coupling.',
        mobile: 'Below 768px this is a different composition: two bands only, both above the hero block rather than around it, type at 8vw, base speeds halved, and shear clamped to 6deg because a strong skew on a narrow viewport pushes the text off both edges at once. The hero block goes full width with stacked actions.'
      },
      a11y: [
        'Band text is aria-hidden and duplicated for the wrap, so a screen reader never hears the name four times.',
        'The hero block carries the real name, role, value and actions in reading order.',
        'Under prefers-reduced-motion the bands hold at a composed offset with no drift, no velocity coupling and no shear. They become four typographic rules, which is a legitimate composition rather than a broken one.',
        'Nothing moving carries information, so a reader who cannot track motion loses nothing.',
        'The bands are never the only place a piece of content appears.'
      ],
      perf: [
        'One transform write per band per frame, on four elements. The transform string combines translate3d, skewX and scaleY so it is a single property write.',
        'Tracks are duplicated in markup rather than measured and repositioned, so the wrap costs one modulo per frame and no layout read.',
        'will-change: transform on the four tracks only.',
        'No text is re-rendered. The bands translate; they never re-layout.'
      ],
      packages: [
        { p: 'gsap + ScrollTrigger (installed)', w: 'For the scrubbed progress value. Velocity is derived in the frame loop rather than read from ScrollTrigger, so the number is consistent with the loop that consumes it.' },
        { p: 'lenis (installed)', w: 'Strongly recommended here: smoothed scroll produces a smooth velocity, and a raw wheel gives a spiky one that makes the shear stutter.' },
        { p: 'no marquee library', w: 'Every one of them animates a fixed speed loop. The whole point here is that the speed is not fixed.' }
      ],
      architecture: [
        { f: 'components/hero/TickerSection.tsx', r: 'Server rendered bands and hero block. Every band renders its text twice on the server.' },
        { f: 'components/hero/useScrollVelocity.ts', r: '"use client" hook. Returns a ref carrying damped velocity, shared by anything else on the site that wants it.' },
        { f: 'app/(site)/hero/page.tsx', r: 'The page level route the see-more control opens.' }
      ],
      state: [
        'Velocity, per band offset, shear and squash are all refs. None of it is state.',
        'The hero block visibility is derived from progress in the frame loop and written as opacity, not stored.',
        'Do not store velocity in a context provider that re-renders consumers. Expose it as a ref plus a subscribe function.'
      ],
      typography: [
        'Bands: display face 300 at clamp(2.5rem, 5.5vw, 4.5rem), tracking -0.02em, uppercase. The name band steps up to 500.',
        'Band text is separated by a middle dot with a wide space on each side, one per repeat, which is the only separator in the composition.',
        'Hero block name: display face 500 at clamp(2rem, 4.5vw, 3.5rem). Smaller than the bands on purpose: the bands are the texture, the block is the message.',
        'Role and availability: mono 10px, tracking 0.2em, uppercase.'
      ],
      color: [
        'The name band is the signature orchid. The other three bands are 12% to 18% ink.',
        'That single coloured band is the only thing in the section that is not the ink scale, and it is the band carrying the name.',
        'Ground is void. Hairlines between the bands are 8% ink.',
        'The hero block sits on the ground, not on a panel, so its contrast never depends on what is passing behind it.'
      ],
      spacing: [
        'Band height is 1.34em of its own type size, so the rules sit close to the letterforms.',
        'Hairline between every band and none at the outer edges, so the strip reads as a continuous system.',
        'The hero block has clamp(2rem, 5vh, 3.5rem) of space above and below it, which is the only generous space in the section.',
        'Bands bleed full width, past the page gutter. That is the one place in this hero where the gutter is deliberately broken.'
      ],
      relationships: [
        'Shear direction encodes scroll direction. Shear magnitude encodes speed.',
        'Band speed encodes the same thing, redundantly, so the coupling reads even if the shear is subtle at low speeds.',
        'Colour encodes which band carries the name, and nothing else.'
      ],
      acceptance: [
        'At rest the bands drift slowly and are clearly not stopped.',
        'A fast scroll visibly shears the bands in the direction of travel, and they spring back within about 200ms of stopping.',
        'The hero block never shears and is readable at any scroll speed.',
        'The bands wrap with no visible seam at any speed.',
        'With reduced motion on, the bands are still, composed, and no velocity coupling runs.',
        'At 390px there are two bands, the shear is gentler, and nothing scrolls horizontally.'
      ]
    },

    mount: function (root, ctx) {
      var mob = env.mobile;
      var sh = shellFor(root, ctx, 'hero-ticker', 2.4);
      var host = sh.host;

      var ROWS = mob ? [
        { text: CAPS.first + ' ' + CAPS.last, hue: true, base: 9 },
        { text: 'FULL STACK DEVELOPER', hue: false, base: -13 }
      ] : [
        { text: 'TYPESCRIPT  POSTGRES  NODE  REACT', hue: false, base: 14 },
        { text: CAPS.first + ' ' + CAPS.last, hue: true, base: -22 },
        { text: 'FULL STACK DEVELOPER', hue: false, base: 28 },
        { text: 'ONE PROJECT SLOT OPEN FROM MARCH', hue: false, base: -34 }
      ];

      var bands = [];
      function makeBand(row) {
        var b = SE.el('div', 'hero-ticker__band' + (row.hue ? ' is-hue' : ''));
        b.setAttribute('aria-hidden', 'true');
        var track = SE.el('div', 'hero-ticker__track');
        /* Text twice, so the wrap is a modulo instead of a measurement. */
        var run = row.text + '  ·  ';
        track.innerHTML = '<span>' + run + run + run + '</span><span>' + run + run + run + '</span>';
        b.appendChild(track);
        bands.push({ el: b, track: track, base: row.base, x: 0 });
        return b;
      }

      var split = mob ? ROWS.length : 2;
      for (var i = 0; i < split; i++) host.appendChild(makeBand(ROWS[i]));

      var block = SE.el('div', 'hero-ticker__block');
      block.innerHTML =
        '<h2 class="hero-ticker__name">' + IDENT.full + '</h2>' +
        '<p class="hero-ticker__value">' + IDENT.value + '</p>';
      block.appendChild(actions('hero-ticker__cta', 'Write to me', function () {
        SE.toast && SE.toast('Demo hero', IDENT.mail);
      }));
      host.appendChild(block);

      for (i = split; i < ROWS.length; i++) host.appendChild(makeBand(ROWS[i]));

      var more = null;
      if (!sh.isPage) {
        more = SE.seeMore('See the full hero', ctx.onSeeMore);
        more.classList.add('hero-ticker__more');
        /* Inside the block, not over a band: a control that sits on moving
           type is a control nobody can read. */
        block.appendChild(more);
      }

      /* --------------------------------------------------------- model */
      var progress = sh.isPage ? 0.5 : 0;
      var prevP = progress;
      var vel = 0, shear = 0, squash = 0;
      var MAXSKEW = mob ? 6 : 12;
      var scrubber = null;
      if (!sh.isPage) {
        scrubber = SE.scrub(ctx.scroller, sh.rail.rail, function (p) { progress = p; });
      }

      function tick(dt) {
        /* Velocity is the derivative of the scrubbed progress, not a scroll
           event. Derived in the same loop that consumes it, so the number can
           never be a frame out of date. */
        var raw = dt > 0 ? (progress - prevP) / dt : 0;
        prevP = progress;
        vel = M.damp(vel, M.clamp(raw, -2.5, 2.5), 6, dt);

        shear = M.damp(shear, M.clamp(vel * -9, -MAXSKEW, MAXSKEW), 6, dt);
        squash = M.damp(squash, Math.min(0.06, Math.abs(vel) * 0.03), 6, dt);

        for (var b = 0; b < bands.length; b++) {
          var B = bands[b];
          B.x += (B.base + vel * 320) * dt;
          /* The track holds the text twice, so wrapping is a modulo on half
             its width and never a measurement. */
          var half = B.track.scrollWidth / 2 || 1;
          B.x = ((B.x % half) + half) % half;
          B.el.style.transform =
            'skewX(' + shear.toFixed(2) + 'deg) scaleY(' + (1 - squash).toFixed(3) + ')';
          B.track.style.transform = 'translate3d(' + (-B.x).toFixed(2) + 'px,0,0)';
        }

        var enter = M.clamp((progress - 0.06) / 0.18, 0, 1);
        var exit = sh.isPage ? 0 : M.clamp((progress - 0.80) / 0.16, 0, 1);
        var o = sh.isPage ? 1 : enter * (1 - exit);
        block.style.opacity = o.toFixed(3);
        block.style.transform = 'translate3d(0,' + ((1 - enter) * 20 - exit * 20).toFixed(1) + 'px,0)';
        if (more) more.classList.toggle('is-on', progress > 0.26 && progress < 0.80);
      }

      var sub = null;
      if (env.reduced) {
        /* Composed, not stopped: each band holds a deliberate offset so the
           strip still reads as four staggered lines. */
        bands.forEach(function (B, k) {
          B.track.style.transform = 'translate3d(' + (-60 - k * 90) + 'px,0,0)';
        });
        block.style.opacity = '1';
        if (more) more.classList.add('is-on');
      } else {
        sub = SE.ticker.add(tick);
      }

      return {
        destroy: function () {
          if (sub) SE.ticker.remove(tick);
          if (scrubber) scrubber.kill();
          sh.destroy();
        }
      };
    }
  });

  /* ======================================================================
     S05  HANDOFF            (pairs with P05 Horizon)
     ----------------------------------------------------------------------
     A hero title that does not fade out. It shrinks, travels, and docks into
     the top left of the frame as the label of whatever comes next, so the
     reader watches the hero become the page chrome instead of watching it
     disappear.

     WHY THIS IS THE MOST USEFUL SECTION HERO OF THE FIVE
     ----------------------------------------------------
     Every other treatment leaves. This one converts. At the end of the rail
     the name is still on screen, at a fifth of its size, sitting where a
     sticky page label sits, which means the reader never loses the identity
     of the site while they read the rest of it. The scale ratio and the dock
     position are the whole design.
     ====================================================================== */

  SE.register({
    area: 'hero',
    variant: 'section',
    id: 'hero-section-handoff',
    num: 5,
    name: 'Handoff',
    kind: 'DOM / scrubbed dock',
    accent: '#f09a3e',
    tagline: 'The hero does not leave, it becomes the label',
    desc: 'The title shrinks and travels to the top left as the reader scrolls, docking as the label of the next ' +
          'section. Scale lags translation, so the movement carries weight instead of sliding.',
    interaction: 'Scroll. Progress maps directly to the dock, so the title can be parked anywhere along the path.',
    hint: 'Scroll to dock the title',
    screens: 2.8,

    preview: function (ctx, w, h, t, heat) {
      var cyc = (t * 0.24) % 1;
      var p = cyc < 0.72 ? cyc / 0.72 : 1;
      var e = p * p * (3 - 2 * p);
      var sc = 1 - e * 0.62;
      var x = (w * 0.5) * (1 - e) + w * 0.06 * e;
      var y = (h * 0.5) * (1 - e) + h * 0.16 * e;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sc, sc);
      ctx.font = '500 ' + Math.round(h * 0.30) + 'px "Space Grotesk", sans-serif';
      ctx.textAlign = e > 0.5 ? 'left' : 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(236,236,239,' + (0.72 + heat * 0.28).toFixed(3) + ')';
      ctx.fillText('MIFTAUL', 0, 0);
      ctx.restore();

      /* The rule the title docks onto. */
      ctx.beginPath();
      ctx.moveTo(w * 0.06, Math.round(h * 0.28) + 0.5);
      ctx.lineTo(w * 0.06 + (w * 0.88) * e, Math.round(h * 0.28) + 0.5);
      ctx.strokeStyle = 'rgba(240,154,62,' + (0.4 + heat * 0.4).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(236,236,239,' + (0.10 + e * 0.24).toFixed(3) + ')';
      ctx.fillRect(w * 0.06, h * 0.44, w * 0.5 * e, 3);
      ctx.fillRect(w * 0.06, h * 0.56, w * 0.36 * e, 3);
    },

    spec: {
      subtitle: 'A title that shrinks and docks as the label of the section it hands off to',
      philosophy: [
        'A hero that fades out has thrown away the identity of the site at the exact moment the reader starts reading. This one converts it into the page label instead, so the name is never off screen.',
        'The handoff is legible because it is one continuous object. There is no cross fade between a big title and a small one; it is the same node, scaled and moved.',
        'Scale lags translation by a small amount of progress. That single offset is what makes a shrinking object feel like it has weight rather than like it is being resized.'
      ],
      hierarchy: [
        '1. The title, at every point along its path. It is the only thing that persists through the whole section.',
        '2. The value line and actions, present only in the first half, fading before the dock begins so they never compete with the travel.',
        '3. The rule the title docks onto, drawn as it arrives.',
        '4. The next section content, which becomes visible under the docked label.'
      ],
      structure: [
        'SE.scrollRail at 2.8 screens. Longer than the other sections because the travel needs room to be read as a movement rather than a jump.',
        'One .__title element, transform-origin left top, carrying the whole travel. Nothing else moves.',
        'A .__rule element with transform-origin left, scaleX driven by progress.',
        'The value line and actions are a separate block that fades on progress and is inert after 0.5.',
        'The docked state is not a separate element. There is exactly one title in the DOM at all times.'
      ],
      interaction: [
        'Progress 0 to 1 maps through a smoothstep to a travel parameter e.',
        'Translation: from the composition centre to the dock at the page gutter and 8% of the frame height, interpolated on e.',
        'Scale: from 1 to 0.30, interpolated on a version of e delayed by 0.06 progress and clamped, which is the lag that gives the movement weight.',
        'transform-origin is left top for the whole path, so the scale never pulls the title away from the edge it is docking to.',
        'The support block opacity goes to 0 across progress 0.30 to 0.48 and its pointer-events go to none once faded, so a faded control is never clickable.',
        'The rule scaleX runs 0 to 1 across progress 0.55 to 0.90, arriving just before the title lands on it.'
      ],
      choreography: [
        { n: 'Travel', d: 'Position interpolated on smoothstep(progress), which is 3p^2 - 2p^3. Symmetric acceleration, because the title is being carried by the scroll rather than arriving under its own power.' },
        { n: 'Scale lag', d: 'Scale uses smoothstep(clamp((progress - 0.06) / 0.94)), so it trails the translation by 6% of the rail. Around 60 to 100ms at a normal scroll speed, which is exactly the amount that reads as mass.' },
        { n: 'Support fade', d: 'opacity 1 to 0 across progress 0.30 to 0.48 with no transform. It is leaving the argument, not the screen.' },
        { n: 'Next index', d: 'The three row index of what follows: opacity 0 to 1 with translate3d(0,22px,0) to none across progress 0.62 to 0.88, so the label and the thing it labels arrive together.' },
        { n: 'Rule draw', d: 'scaleX 0 to 1 from the left across progress 0.55 to 0.90, transform-origin left. It is finished before the title lands, so the title docks onto something that is already there.' },
        { n: 'Dock settle', d: 'The last 10% of the rail moves the title by under 4px. The path is deliberately front loaded so the end of the section feels like an arrival rather than a slow crawl.' }
      ],
      scroll: [
        '2.8 screens of rail, the longest of the five sections, because the travel is the content.',
        'Everything is a pure function of progress, so the title can be parked anywhere along the path and scrolling back retraces it exactly.',
        'The section releases with the title docked, and in a real page that docked title becomes the sticky label for what follows.'
      ],
      hover: [
        'None on the title. It is moving; a hover target that moves is a hover target you miss.',
        'The actions keep the shared button treatment while they are present.'
      ],
      click: [
        'The two actions behave as everywhere else, and stop being clickable once faded.',
        '"See the full hero" opens the page level counterpart, the Horizon treatment.'
      ],
      responsive: {
        desktop: 'Title travels from centre to the gutter at 8% height, scaling 1 to 0.30.',
        tablet: 'Same path, scale floor raised to 0.36 so the docked label stays above 20px.',
        mobile: 'Below 768px this is a different composition. The title starts flush left rather than centred, travels only vertically to a full width top bar, and scales 1 to 0.42 rather than 0.30, because a 30% scale of a 12vw title is unreadable on a phone. The support block sits under the title rather than beside it.'
      },
      a11y: [
        'One h2 for the whole section. The docked label is the same element, so a screen reader is never told the heading twice and the document outline never changes mid scroll.',
        'The support block gets pointer-events: none and aria-hidden once it has faded, so a control at 4% opacity is never focusable.',
        'Under prefers-reduced-motion the title still tracks progress, because that is the reader moving it directly, but the scale lag is removed and the movement is linear. Nothing runs on its own.',
        'The docked title stays above 4.5:1 contrast at its smallest size; the scale floor exists partly for that reason.',
        'The see-more control is in the tab order at all times.'
      ],
      perf: [
        'Two transform writes per frame, on two elements, plus one opacity write.',
        'transform-origin is set once, never per frame.',
        'No layout property is animated at any point in the travel.',
        'The title is promoted with will-change: transform for the duration of the section only, removed by the concept on destroy.'
      ],
      packages: [
        { p: 'gsap + ScrollTrigger (installed)', w: 'The right tool: scrub 0.6 gives the travel the smoothing it needs, and invalidateOnRefresh keeps the dock coordinates correct when the viewport resizes mid section.' },
        { p: 'lenis (installed)', w: 'Recommended. The travel is long and a raw wheel makes a long scrub feel stepped.' },
        { p: 'no view transitions API', w: 'Tempting, but this is one continuous element inside one document, not a transition between two states. A view transition would be a cross fade of two titles, which is the exact thing this concept exists to avoid.' }
      ],
      architecture: [
        { f: 'components/hero/HandoffSection.tsx', r: 'Server rendered title, support block and see-more control.' },
        { f: 'components/hero/useDockScrub.ts', r: '"use client" hook. Owns the ScrollTrigger and writes the two transforms through refs.' },
        { f: 'components/layout/StickyLabel.tsx', r: 'The docked title continues as this in the real page. Share one component so the handoff is genuinely continuous rather than a lookalike.' },
        { f: 'app/(site)/hero/page.tsx', r: 'The page level route the see-more control opens.' }
      ],
      state: [
        'Progress is a ref. The two transforms are written directly to nodes.',
        'The support block inert flag is the only state, and it flips once at a threshold.',
        'Dock coordinates are computed from the container rect in a ResizeObserver, cached, and never read per frame.'
      ],
      typography: [
        'Title: display face 500 at clamp(2.75rem, 8vw, 7rem), tracking -0.045em. At the 0.30 dock scale that lands around 21 to 34px, which is a real label size.',
        'Value line: display face 400 at clamp(1rem, 1.4vw, 1.1875rem), max 38ch.',
        'Role and availability: mono 10px, tracking 0.2em, uppercase.',
        'The title is one line, never two. A two line title cannot dock into a label without reflowing, and reflow mid travel is the one thing this concept cannot survive.'
      ],
      color: [
        'The signature amber appears on the dock rule and the availability dot. Two places.',
        'The title is plain ink at every scale. A title that changes colour as it docks is two objects again.',
        'Ground is void. The section carries no panel and no card.'
      ],
      spacing: [
        'The dock target is the page gutter horizontally and 8% of the frame height vertically, which is where a sticky page label sits in the real layout.',
        'The rule sits 1.25rem below the docked title baseline and runs to the opposite gutter.',
        'The support block starts 2rem below the title in its resting position.',
        'The travel path is a straight line. A curved path would be one more thing to read in a movement that is already carrying the whole section.'
      ],
      relationships: [
        'Position and scale both encode progress, and they are the same signal offset in time. That offset is the only place in the concept where two signals disagree, and it is deliberate.',
        'The rule encodes arrival: it is complete before the title lands.',
        'Nothing encodes anything else. The section makes one claim and spends everything on it.'
      ],
      acceptance: [
        'The title never disappears. At every scroll position it is on screen and legible.',
        'Scale visibly trails position: the title is still large as it starts moving and is still shrinking as it settles.',
        'The rule is complete before the title reaches it.',
        'Faded actions cannot be clicked or tabbed to.',
        'Scrolling back up retraces the path exactly with no drift.',
        'With reduced motion on, the travel is linear and no scale lag runs.',
        'At 390px the title travels vertically only and never shrinks below 42% of its starting size.'
      ]
    },

    mount: function (root, ctx) {
      var mob = env.mobile;
      var sh = shellFor(root, ctx, 'hero-handoff', 2.8);
      var host = sh.host;

      var title = SE.el('h2', 'hero-handoff__title', IDENT.full);
      host.appendChild(title);

      var rule = SE.el('div', 'hero-handoff__rule');
      rule.setAttribute('aria-hidden', 'true');
      host.appendChild(rule);

      var support = SE.el('div', 'hero-handoff__support');
      support.innerHTML =
        '<p class="hero-handoff__role">' + IDENT.role + '</p>' +
        '<p class="hero-handoff__value">' + IDENT.value + '</p>' +
        '<p class="hero-handoff__avail"><i></i>' + IDENT.status + '</p>';
      support.appendChild(actions('hero-handoff__cta', 'Write to me', function () {
        SE.toast && SE.toast('Demo hero', IDENT.mail);
      }));
      host.appendChild(support);

      /* What the docked title becomes the label of. Without this the end of
         the travel is an empty frame and the handoff has nothing to hand to. */
      var next = SE.el('div', 'hero-handoff__next');
      next.innerHTML = [
        ['Selected work', IDENT.shipped + ' shipped, ' + IDENT.running + ' still in production.'],
        ['How I work', 'Three weeks of shaping before any product code.'],
        ['Contact', IDENT.status + '.']
      ].map(function (r) {
        return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
      }).join('');
      next.className = 'hero-handoff__next';
      host.appendChild(next);

      var more = null;
      if (!sh.isPage) {
        more = SE.seeMore('See the full hero', ctx.onSeeMore);
        more.classList.add('hero-handoff__more');
        host.appendChild(more);
      }

      /* --------------------------------------------------------- model */
      var SCALE_END = mob ? 0.42 : (env.tablet ? 0.36 : 0.30);
      var progress = sh.isPage ? 0 : 0;
      var from = { x: 0, y: 0 }, to = { x: 0, y: 0 };
      var inert = false;

      function measure() {
        var r = host.getBoundingClientRect();
        var t = title.getBoundingClientRect();
        /* transform-origin is left top for the whole path, so both endpoints
           are expressed as the offset of that corner. */
        var startX = mob ? 0 : Math.round((r.width - t.width / currentScale()) / 2 - title.offsetLeft);
        from.x = mob ? 0 : startX;
        from.y = 0;
        to.x = 0;
        to.y = Math.round(r.height * 0.08) - title.offsetTop;
      }
      function currentScale() { return 1; }

      var ro = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(measure);
        ro.observe(host);
      } else {
        window.addEventListener('resize', measure);
      }
      measure();

      var scrubber = null;
      if (!sh.isPage) {
        scrubber = SE.scrub(ctx.scroller, sh.rail.rail, function (p) { progress = p; });
      }

      function smooth(p) { return p * p * (3 - 2 * p); }

      var lastP = -1;
      function tick() {
        var p = sh.isPage ? 0 : progress;
        /* Progress is the only input, so an unchanged progress is a frame
           with nothing to write. */
        if (Math.abs(p - lastP) < 0.0002) return;
        lastP = p;
        var e = smooth(M.clamp(p, 0, 1));
        /* Scale trails translation by 6% of the rail. That single offset is
           what makes a shrinking object read as having mass. */
        var es = env.reduced ? e : smooth(M.clamp((p - 0.06) / 0.94, 0, 1));
        var sc = 1 - es * (1 - SCALE_END);

        var x = from.x + (to.x - from.x) * e;
        var y = from.y + (to.y - from.y) * e;
        title.style.transform =
          'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';

        var ruleP = M.clamp((p - 0.55) / 0.35, 0, 1);
        rule.style.transform = 'scaleX(' + ruleP.toFixed(3) + ')';

        var sup = 1 - M.clamp((p - 0.30) / 0.18, 0, 1);
        support.style.opacity = sup.toFixed(3);

        /* The next-section index resolves as the title arrives, so the label
           and the thing it labels land together. */
        var nx = M.clamp((p - 0.62) / 0.26, 0, 1);
        next.style.opacity = nx.toFixed(3);
        next.style.transform = 'translate3d(0,' + ((1 - nx) * 22).toFixed(1) + 'px,0)';
        next.style.pointerEvents = nx < 0.05 ? 'none' : '';
        var nowInert = sup < 0.05;
        if (nowInert !== inert) {
          inert = nowInert;
          support.style.pointerEvents = inert ? 'none' : '';
          support.setAttribute('aria-hidden', String(inert));
        }

        if (more) more.classList.toggle('is-on', p > 0.10 && p < 0.62);
      }

      var sub = null;
      if (sh.isPage) {
        tick();
      } else {
        sub = SE.ticker.add(tick);
      }

      return {
        destroy: function () {
          if (sub) SE.ticker.remove(tick);
          if (scrubber) scrubber.kill();
          if (ro) ro.disconnect(); else window.removeEventListener('resize', measure);
          sh.destroy();
        }
      };
    }
  });

})(window.SE = window.SE || {});

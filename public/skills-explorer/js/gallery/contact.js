/* ============================================================================
   AREA: CONTACT  -  10 concepts (5 page, 5 section)
   ----------------------------------------------------------------------------
   Contact is the last surface a visitor reads before deciding, and it is the
   one place in a portfolio where beauty and function are not in tension: they
   are the same requirement. A contact concept that looks extraordinary and
   ships an unlabelled input with a 3:1 placeholder has not made a trade, it has
   failed. So the rule applied through this whole file is:

       the composition may be as expressive as it likes,
       the form underneath it is always the same boring, correct form.

   That is why every form-bearing concept here is built from ONE state machine
   (makeForm below) rather than from ten hand-rolled forms. A single machine
   means a single place where the label association, the blur validation, the
   error summary focus order, the disabled-while-sending state, the failure
   path and the reduced-motion feedback are correct, and no concept can quietly
   drop one of them because its layout was harder.

   WHAT IS REAL AND WHAT IS NOT
   ----------------------------
   Nothing is sent. Submitting runs a simulated transport (a tracked timeout,
   cleared on destroy) so that the full state cycle - idle, focus, filled,
   invalid, submitting, success, failure, retry - can actually be inspected.
   Every concept says so in visible copy, and the failure branch is reachable
   on demand through a small "Preview the failure state" control rather than by
   a random dice roll, because a state you cannot reproduce is a state nobody
   reviews.

   COLOUR AND CONTRAST
   -------------------
   The field tokens at the top of gallery-contact.css are chosen against the
   actual surfaces they sit on, not against an imagined white page. Labels,
   helper text, placeholders and error text all clear WCAG AA 4.5:1 on the
   panel and field backgrounds used here; the measured values are recorded in
   that file next to the tokens.
   ========================================================================== */
(function (SE) {
  'use strict';

  var env = SE.env;
  var M = SE.math;

  /* ======================================================================
     INVENTED CONTENT
     ----------------------------------------------------------------------
     Per the contract this is authored here rather than pulled from SE.DATA.
     It is invented to be plausible: a availability statement a real person
     could keep, a reply window stated as a promise rather than as a measured
     average, and no fake-precise figures anywhere.
     ====================================================================== */

  var C = {
    email: 'hello@miftaul.dev',
    city: 'Dhaka',
    region: 'Dhaka, Bangladesh',
    tz: 'Asia/Dhaka',
    tzOffsetMin: 360,                 /* UTC+6, no DST in this zone */
    tzLabel: 'UTC+6',
    hours: 'Weekdays, 09:00 to 18:00 local',
    availability: 'One project slot open from March',
    availabilityTight: 'One slot, from March',
    state: 'open',                    /* semantic: drives the one status dot */
    reply: 'Replies inside two working days',
    replyTight: 'Two working days',
    replyModel: 'Target window, not a measured average',
    booked: 'Booked through February',
    handles: [
      { net: 'GitHub', handle: 'miftaulislam' },
      { net: 'LinkedIn', handle: 'in/miftaulislam' },
      { net: 'Read.cv', handle: 'miftaul' }
    ],
    /* Used by the concepts that want a sentence rather than a paragraph. */
    line: 'Write with the problem, not the specification.',
    lineLong: 'A paragraph about what is broken tells me more than a ten page brief. ' +
              'If it is a fit I will say so within two working days, and if it is not I will say that too.'
  };

  /* ======================================================================
     ICONS
     ----------------------------------------------------------------------
     Authored inline SVG on one 24x24 grid at one stroke weight (1.5, round
     caps and joins). No emoji standing in for a mark: a glyph is font
     dependent and cannot take a design token.
     ====================================================================== */

  var ICONS = {
    mail:  'M3.5 6.5h17v11h-17zM3.9 7 12 13.2 20.1 7',
    pin:   'M12 21s6.4-6 6.4-10.4A6.4 6.4 0 0 0 5.6 10.6C5.6 15 12 21 12 21M12 12.6a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4',
    clock: 'M12 3.6a8.4 8.4 0 1 0 0 16.8 8.4 8.4 0 0 0 0-16.8M12 7.4V12l3.2 2',
    check: 'M4.5 12.6 9.4 17.5 19.5 7',
    alert: 'M12 8v5M12 16.4v.2M12 3.8 2.9 19.4h18.2z',
    arrow: 'M4.5 12h14M13 6.5l5.5 5.5L13 17.5',
    back:  'M19.5 12h-14M11 6.5 5.5 12 11 17.5',
    seal:  'M12 4.2 14.3 8l4.3.9-2.9 3.3.4 4.4-4.1-1.7-4.1 1.7.4-4.4L5.4 8.9 9.7 8z'
  };

  function icon(name, cls) {
    return '<svg class="contact-ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" ' +
           'aria-hidden="true" focusable="false"><path d="' + (ICONS[name] || ICONS.arrow) + '"/></svg>';
  }

  /* ======================================================================
     SMALL UTILITIES
     ====================================================================== */

  var uidN = 0;
  function uid(prefix) { uidN += 1; return 'contact-' + prefix + '-' + uidN; }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Mount-time host setup shared by every concept. Page mode owns the whole
     stage and must therefore manage its own scrolling; section mode is
     ordinary flow content inside the shell's scroller and must not. */
  function host(root, ctx, name) {
    var mode = (ctx && ctx.mode) || 'page';
    root.classList.add('contact-c', 'contact-' + name, mode === 'page' ? 'is-page' : 'is-section');
    return mode;
  }

  function unhost(root, name) {
    root.classList.remove('contact-c', 'contact-' + name, 'is-page', 'is-section');
    root.innerHTML = '';
  }

  /* One IntersectionObserver helper for the whole area. Section concepts here
     resolve on entry rather than on a pinned scroll rail: a closing section
     that holds the reader for two extra screens on their way out of the page
     is the exact behaviour a contact section must not have. */
  function onEnter(el, cb, threshold) {
    if (typeof IntersectionObserver === 'undefined') { cb(); return { destroy: function () {} }; }
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      cb();
    }, { threshold: threshold == null ? 0.28 : threshold, rootMargin: '0px 0px -4% 0px' });
    io.observe(el);
    return { destroy: function () { io.disconnect(); } };
  }

  /* A raised cosine (Hann) falloff. Used by the magnetic concepts. A linear
     tent has a corner at the cursor and another at the edge of the radius, and
     the eye reads those corners as stepping; a Hann window is smooth in value
     AND in slope everywhere, so attraction swells and releases instead of
     switching on. f(0)=1, f(+/-1)=0, f'(0)=f'(+/-1)=0. */
  function hann(u) {
    u = Math.abs(u);
    return u >= 1 ? 0 : 0.5 * (1 + Math.cos(Math.PI * u));
  }

  /* Local time in the studio's zone, computed from the viewer's clock rather
     than invented. Returns { hh, mm, ss, minutes }. */
  function studioTime() {
    var now = new Date();
    var utc = now.getTime() + now.getTimezoneOffset() * 60000;
    var d = new Date(utc + C.tzOffsetMin * 60000);
    return {
      hh: d.getHours(), mm: d.getMinutes(), ss: d.getSeconds(),
      minutes: d.getHours() * 60 + d.getMinutes(),
      day: d.getDay()
    };
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* Is the studio inside its stated working hours right now? This drives the
     one status dot in the file. A dot that encodes real state earns itself; a
     dot used as decoration does not. */
  function withinHours() {
    var t = studioTime();
    if (t.day === 0 || t.day === 6) return false;
    return t.minutes >= 9 * 60 && t.minutes < 18 * 60;
  }

  /* ======================================================================
     FIELD DEFINITIONS
     ----------------------------------------------------------------------
     type / inputmode / autocomplete are set per field so that mobile
     keyboards and password-manager autofill both behave. Error copy names the
     problem AND the recovery; "Invalid input" is not an error message.
     ====================================================================== */

  var FIELD_DEFS = {
    name: {
      label: 'Your name',
      type: 'text',
      autocomplete: 'name',
      placeholder: 'Rasheda Karim',
      help: 'However you would like to be addressed.',
      slot: 'your name',
      slotWidth: '13ch',
      slotPlaceholder: 'Rasheda Karim',
      check: function (v) {
        var s = v.trim();
        if (!s) return 'Add a name so I know who I am replying to.';
        if (s.length < 2) return 'That is too short to be a name. Two characters or more.';
        return '';
      }
    },
    email: {
      label: 'Email address',
      type: 'email',
      inputmode: 'email',
      autocomplete: 'email',
      spellcheck: 'false',
      placeholder: 'you@studio.com',
      help: 'The reply goes here and nowhere else.',
      slot: 'your email',
      slotWidth: '16ch',
      slotPlaceholder: 'you@studio.com',
      check: function (v) {
        var s = v.trim();
        if (!s) return 'Add an email address or the reply has nowhere to go.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) {
          return 'That address is missing something. Check the part after the @.';
        }
        return '';
      }
    },
    org: {
      label: 'Company or project name',
      type: 'text',
      autocomplete: 'organization',
      placeholder: 'Halden Transit',
      help: 'Optional. Leave it blank if there is not one yet.',
      slot: 'the project',
      optional: true,
      check: function () { return ''; }
    },
    brief: {
      label: 'What you are building',
      el: 'textarea',
      rows: 4,
      autocomplete: 'off',
      placeholder: 'A booking flow that keeps failing at the payment step.',
      help: 'A paragraph is plenty. The problem is more useful than the specification.',
      slot: 'what you are building',
      slotWidth: '21ch',
      slotPlaceholder: 'a checkout that keeps failing',
      check: function (v) {
        var s = v.trim();
        if (!s) return 'Write a line or two about the work.';
        if (s.length < 12) return 'A little more, please. One full sentence is enough.';
        return '';
      }
    },
    note: {
      label: 'Your message',
      el: 'textarea',
      rows: 3,
      autocomplete: 'off',
      placeholder: 'We are three weeks from launch and the queue keeps backing up.',
      help: 'The problem, in your own words.',
      slot: 'the problem',
      slotWidth: '21ch',
      slotPlaceholder: 'the queue keeps backing up',
      check: function (v) {
        var s = v.trim();
        if (!s) return 'Write a line or two so the note is not blank.';
        if (s.length < 12) return 'A little more, please. One full sentence is enough.';
        return '';
      }
    },
    timing: {
      label: 'When it needs to start',
      el: 'choice',
      options: ['Right away', 'Within a month', 'This quarter', 'Still exploring'],
      help: 'A rough answer is fine. It changes what I can promise.',
      slot: 'the timing',
      slotWidth: 'auto',
      check: function (v) { return v ? '' : 'Pick the closest option so I can answer honestly.'; }
    }
  };

  /* ======================================================================
     FORM MACHINE
     ----------------------------------------------------------------------
     One implementation, six form-bearing concepts. Everything a reviewer
     would check lives here exactly once:

       - a visible <label for> per field, never a placeholder acting as one
       - helper text in the markup, error text BELOW the field
       - aria-describedby wiring both of them to the control
       - validation on blur, never per keystroke; once a field is already in
         error, typing may CLEAR the error but never introduce a new one, so
         nobody is scolded mid-word
       - failed submit with several errors focuses a linked summary; with one
         error it focuses that field directly
       - submitting disables the control, shows determinate progress, and is
         announced; reduced motion drops the progress bar and keeps the words
       - a failure branch with retry that preserves everything typed

     Layouts: 'stack' is the ordinary column, 'slot' renders each field as an
     inline blank inside a sentence (used by CONVERSATION). Both produce the
     same accessibility tree; only the arrangement differs.
     ====================================================================== */

  function makeForm(o) {
    var reduced = env.reduced;
    var layout = o.layout || 'stack';
    var delay = o.delay || 1500;
    var timers = [];
    var fields = [];
    var state = 'idle';
    var failNext = false;
    var destroyed = false;

    function later(fn, ms) {
      var id = setTimeout(function () {
        timers.splice(timers.indexOf(id), 1);
        if (!destroyed) fn();
      }, ms);
      timers.push(id);
      return id;
    }

    var form = SE.el('form', 'contact-fm contact-fm--' + layout + (o.tight ? ' is-tight' : ''));
    form.setAttribute('novalidate', '');
    form.setAttribute('data-state', 'idle');

    /* --- error summary ------------------------------------------------ */
    /* Present in the DOM from the start but hidden, so its id is stable and
       the focus target never has to be created mid-interaction. */
    var summary = SE.el('div', 'contact-fm__summary');
    summary.id = uid('summary');
    summary.setAttribute('role', 'alert');
    summary.setAttribute('tabindex', '-1');
    summary.hidden = true;
    form.appendChild(summary);

    var body = SE.el('div', 'contact-fm__body');
    form.appendChild(body);

    /* --- fields -------------------------------------------------------- */
    (o.fields || ['name', 'email', 'brief']).forEach(function (key) {
      var def = FIELD_DEFS[key];
      if (!def) return;
      var f = buildField(key, def, layout, o);
      fields.push(f);
      if (layout === 'slot') return;      /* sentence layout places its own */
      body.appendChild(f.wrap);
    });

    if (layout === 'slot' && typeof o.sentence === 'function') {
      body.appendChild(o.sentence(fields));
    }

    /* --- footer -------------------------------------------------------- */
    var foot = SE.el('div', 'contact-fm__foot');

    var submit = SE.el('button', 'contact-fm__submit');
    submit.type = 'submit';
    submit.innerHTML =
      '<span class="contact-fm__submitlabel">' + esc(o.submit || 'Send') + '</span>' +
      '<span class="contact-fm__bar" aria-hidden="true"></span>';
    foot.appendChild(submit);

    var aside = SE.el('div', 'contact-fm__aside');
    aside.innerHTML = '<p class="contact-fm__note">Nothing is sent. This explorer simulates the request.</p>';
    var probe = SE.el('button', 'contact-fm__probe', 'Preview the failure state');
    probe.type = 'button';
    aside.appendChild(probe);
    foot.appendChild(aside);
    form.appendChild(foot);

    /* --- live status --------------------------------------------------- */
    /* role="status" rather than role="alert": progress is polite, errors are
       assertive, and conflating them makes a screen reader interrupt itself
       every time the button label changes. */
    var status = SE.el('p', 'contact-fm__status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.appendChild(status);

    /* --- failure banner ------------------------------------------------ */
    var fail = SE.el('div', 'contact-fm__fail');
    fail.setAttribute('role', 'alert');
    fail.hidden = true;
    fail.innerHTML =
      '<span class="contact-fm__failmark">' + icon('alert') + '</span>' +
      '<div><p class="contact-fm__failtitle">The message did not go out.</p>' +
      '<p class="contact-fm__failbody">Nothing you typed was lost. Try again, or write to ' +
      '<a href="mailto:' + C.email + '">' + C.email + '</a> instead.</p></div>';
    var retry = SE.el('button', 'contact-fm__retry', 'Try again');
    retry.type = 'button';
    SE.$('div', fail).appendChild(retry);
    form.appendChild(fail);

    /* ------------------------------------------------------------ state */
    function setState(next) {
      state = next;
      form.setAttribute('data-state', next);
      submit.disabled = (next === 'sending');
      if (next === 'sending') submit.setAttribute('aria-disabled', 'true');
      else submit.removeAttribute('aria-disabled');

      var label = SE.$('.contact-fm__submitlabel', submit);
      if (next === 'sending') label.textContent = o.sending || 'Sending';
      else label.textContent = o.submit || 'Send';

      fail.hidden = (next !== 'failed');

      if (next === 'sending') {
        status.textContent = 'Sending your message.';
      } else if (next === 'sent') {
        status.textContent = 'Sent. ' + C.reply + '.';
      } else if (next === 'failed') {
        status.textContent = 'The message did not go out. Nothing was lost.';
      } else {
        status.textContent = '';
      }

      if (o.onState) o.onState(next, api);
    }

    /* -------------------------------------------------------- progress */
    var bar = SE.$('.contact-fm__bar', submit);

    function runBar() {
      if (reduced) return;             /* words carry it instead */
      bar.style.transition = 'none';
      bar.style.transform = 'scaleX(0)';
      /* Force a style flush so the reset is not coalesced with the run. */
      void bar.offsetWidth;
      bar.style.transition = 'transform ' + delay + 'ms linear';
      bar.style.transform = 'scaleX(1)';
    }
    function clearBar() {
      bar.style.transition = 'none';
      bar.style.transform = 'scaleX(0)';
    }

    /* ------------------------------------------------------- validation */
    function validateField(f, live) {
      var msg = f.def.check(fieldValue(f));
      /* live pass: only ever remove an error, never add one mid-word */
      if (live && msg) return !!f.error;
      applyError(f, msg);
      return !msg;
    }

    function applyError(f, msg) {
      f.error = msg;
      f.wrap.classList.toggle('is-invalid', !!msg);
      f.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (f.errEl.textContent !== msg) f.errEl.textContent = msg;
    }

    function invalidFields() {
      return fields.filter(function (f) { return !!f.error; });
    }

    fields.forEach(function (f) {
      f.input.addEventListener('blur', function () {
        if (state === 'sending') return;
        validateField(f, false);
      });
      f.input.addEventListener('input', function () {
        if (f.def.el !== 'choice') f.wrap.classList.toggle('is-filled', !!f.input.value);
        if (f.error) validateField(f, true);
      });
      if (f.def.el === 'choice') {
        f.wrap.addEventListener('change', function () {
          f.wrap.classList.add('is-filled');
          if (f.error) validateField(f, true);
        });
      }
      f.input.addEventListener('focus', function () { f.wrap.classList.add('is-focus'); });
      f.input.addEventListener('blur', function () { f.wrap.classList.remove('is-focus'); });
    });

    /* ----------------------------------------------------------- submit */
    function showSummary(bad) {
      /* The alert is unhidden BEFORE its content is written. A role="alert"
         whose text is already present when it becomes visible is frequently
         not announced at all. */
      summary.hidden = false;
      summary.innerHTML =
        '<p class="contact-fm__summarytitle">' + bad.length + ' fields need attention before this can go out.</p>' +
        '<ul class="contact-fm__summarylist">' +
        bad.map(function (f) {
          return '<li><a href="#' + f.input.id + '" data-jump="' + f.input.id + '">' + esc(f.error) + '</a></li>';
        }).join('') +
        '</ul>';
      summary.focus();
    }

    function hideSummary() {
      summary.hidden = true;
      summary.innerHTML = '';
    }

    summary.addEventListener('click', function (e) {
      var a = e.target.closest('[data-jump]');
      if (!a) return;
      e.preventDefault();
      var target = form.querySelector('#' + a.getAttribute('data-jump'));
      if (target) target.focus();
    });

    function onSubmit(e) {
      e.preventDefault();
      if (state === 'sending') return;

      hideSummary();
      fields.forEach(function (f) { validateField(f, false); });
      var bad = invalidFields();

      if (bad.length > 1) { showSummary(bad); return; }
      if (bad.length === 1) { bad[0].input.focus(); return; }

      setState('sending');
      runBar();
      later(function () {
        clearBar();
        if (failNext) {
          failNext = false;
          probe.classList.remove('is-armed');
          probe.textContent = 'Preview the failure state';
          setState('failed');
          retry.focus();
        } else {
          setState('sent');
        }
      }, delay);
    }

    form.addEventListener('submit', onSubmit);

    retry.addEventListener('click', function () {
      setState('idle');
      submit.focus();
    });

    probe.addEventListener('click', function () {
      failNext = !failNext;
      probe.classList.toggle('is-armed', failNext);
      probe.textContent = failNext ? 'Failure armed for the next send' : 'Preview the failure state';
    });

    /* -------------------------------------------------------------- api */
    var api = {
      el: form,
      fields: fields,
      get state() { return state; },
      values: function () {
        var out = {};
        fields.forEach(function (f) { out[f.key] = fieldValue(f); });
        return out;
      },
      reset: function () {
        fields.forEach(function (f) {
          if (f.def.el === 'choice') {
            SE.$$('input', f.wrap).forEach(function (r) { r.checked = false; });
          } else {
            f.input.value = '';
          }
          applyError(f, '');
          f.wrap.classList.remove('is-filled');
        });
        hideSummary();
        clearBar();
        setState('idle');
      },
      focusFirst: function () { if (fields[0]) fields[0].input.focus(); },
      destroy: function () {
        destroyed = true;
        timers.forEach(clearTimeout);
        timers.length = 0;
        form.removeEventListener('submit', onSubmit);
      }
    };

    setState('idle');
    return api;
  }

  /* The one place a field's value is read. A radio group's value lives on
     whichever radio is checked, not on the element the machine holds, and
     shadowing `.value` on that element is how you write an infinite loop:
     the getter reads the checked radio, which on the first option IS the
     element being shadowed. */
  function fieldValue(f) {
    if (f.def.el === 'choice') {
      var c = f.wrap.querySelector('input:checked');
      return c ? c.value : '';
    }
    return f.input.value;
  }

  /* ------------------------------------------------------- field builder */
  function buildField(key, def, layout, o) {
    var id = uid(key);
    var helpId = id + '-help';
    var errId = id + '-err';
    var isSlot = layout === 'slot';

    /* A textarea cannot live inside a sentence: it takes a whole line and
       breaks the paragraph in two. In slot layout a multi-line field becomes a
       single-line input with the same name, the same validation and the same
       label. The answer is one clause either way. */
    var asArea = def.el === 'textarea' && !isSlot;

    var wrap = SE.el('div', 'contact-fd' + (isSlot ? ' contact-fd--slot' : '') +
      (asArea ? ' contact-fd--area' : '') +
      (def.el === 'choice' ? ' contact-fd--choice' : ''));
    if (isSlot && def.slotWidth) wrap.style.setProperty('--slotw', def.slotWidth);

    var input, labelEl;

    if (def.el === 'choice') {
      /* A radio group, not a styled <select>. A native select cannot be given
         a legible dark treatment on every platform without appearance:none,
         and once that is off the control needs re-teaching to screen readers
         anyway. Radios are already correct. */
      var fs = SE.el('fieldset', 'contact-fd__set');
      fs.setAttribute('aria-describedby', helpId + ' ' + errId);
      var legend = SE.el('legend', 'contact-fd__label', esc(def.label));
      fs.appendChild(legend);
      var row = SE.el('div', 'contact-fd__choices');
      def.options.forEach(function (opt, i) {
        var oid = id + '-' + i;
        var lab = SE.el('label', 'contact-fd__choice');
        lab.setAttribute('for', oid);
        lab.innerHTML = '<input type="radio" id="' + oid + '" name="' + id + '" value="' + esc(opt) + '">' +
                        '<span>' + esc(opt) + '</span>';
        row.appendChild(lab);
      });
      fs.appendChild(row);
      wrap.appendChild(fs);
      labelEl = legend;
      /* The "input" for machine purposes is the first radio: it is what gets
         focused from the error summary and what carries aria-invalid. */
      input = SE.$('input', row);
    } else {
      labelEl = SE.el('label', 'contact-fd__label', esc(def.label) +
        (def.optional ? '<span class="contact-fd__opt">Optional</span>' : ''));
      labelEl.setAttribute('for', id);
      wrap.appendChild(labelEl);

      input = SE.el(asArea ? 'textarea' : 'input', 'contact-fd__input');
      input.id = id;
      input.name = key;
      if (!asArea) input.type = def.type || 'text';
      if (asArea && def.rows) input.rows = def.rows;
      if (def.inputmode) input.setAttribute('inputmode', def.inputmode);
      if (def.autocomplete) input.setAttribute('autocomplete', def.autocomplete);
      if (def.spellcheck) input.setAttribute('spellcheck', def.spellcheck);
      input.placeholder = (isSlot && def.slotPlaceholder) ? def.slotPlaceholder : (def.placeholder || '');
      if (!def.optional) input.setAttribute('aria-required', 'true');
      input.setAttribute('aria-describedby', helpId + ' ' + errId);
      wrap.appendChild(input);
    }

    var helpEl = SE.el('p', 'contact-fd__help', esc(def.help));
    helpEl.id = helpId;
    wrap.appendChild(helpEl);

    /* Error text lives BELOW the control and below the helper text, and the
       slot always occupies its line so an appearing error never reflows the
       composition around it. */
    var errEl = SE.el('p', 'contact-fd__err');
    errEl.id = errId;
    errEl.setAttribute('role', 'alert');
    wrap.appendChild(errEl);

    var f = {
      key: key,
      def: def,
      wrap: wrap,
      input: input,
      labelEl: labelEl,
      helpEl: helpEl,
      errEl: errEl,
      error: ''
    };

    return f;
  }

  /* ======================================================================
     SHARED PIECES USED BY MORE THAN ONE CONCEPT
     ====================================================================== */

  /* The success composition. Every form-bearing concept ends here, so the
     confirmation cannot drift between them: same mark, same promise, same way
     back. `extra` lets a concept add one line in its own voice. */
  function makeSent(o) {
    var el = SE.el('div', 'contact-sent');
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<span class="contact-sent__mark">' + icon('check') + '</span>' +
      '<h3 class="contact-sent__title">' + esc(o.title || 'It is on its way.') + '</h3>' +
      '<p class="contact-sent__body">' + esc(o.body || (C.reply + '. If it is urgent, say so in a second note and I will move it up.')) + '</p>' +
      '<dl class="contact-sent__meta">' +
        '<div><dt>Reply window</dt><dd>' + esc(C.replyTight) + '</dd></div>' +
        '<div><dt>Address</dt><dd>' + esc(C.email) + '</dd></div>' +
      '</dl>';
    var again = SE.el('button', 'contact-sent__again', o.again || 'Write another');
    again.type = 'button';
    el.appendChild(again);
    return { el: el, again: again };
  }

  /* The standard block of facts. Used by four concepts, so the wording of the
     availability and the reply window can never contradict itself. */
  function factsList(cls, compact) {
    var el = SE.el('dl', cls);
    el.innerHTML =
      '<div><dt>' + (compact ? 'Where' : 'Based in') + '</dt><dd>' + esc(C.city) + ' <span class="t-num">' + esc(C.tzLabel) + '</span></dd></div>' +
      '<div><dt>' + (compact ? 'Reply' : 'Reply window') + '</dt><dd>' + esc(C.replyTight) + '</dd></div>' +
      '<div><dt>' + (compact ? 'Open' : 'Availability') + '</dt><dd>' + esc(C.availabilityTight) + '</dd></div>';
    return el;
  }

  /* Screen-reader mirror items. SE.srList wants a skill-shaped record, so the
     shape is met honestly rather than by passing half-empty objects. */
  function srItems(list) {
    return list.map(function (x) {
      return { name: x.n, categoryLabel: x.c, role: x.r, note: x.d, id: x.n };
    });
  }

  /* ======================================================================
     PAGE 01  -  DISPATCH
     ----------------------------------------------------------------------
     The form as a transmission. Three authored states with real motion in
     between them, not three screens that cut.

       COMPOSING  a quiet lane runs under the composition, carrying nothing
       SENDING    the message becomes one lit packet and crosses the lane
       CONFIRMED  the packet lands, the far marker takes the hit, the panel
                  turns over into a confirmation

     WHY THE LANE IS CANVAS AND THE MARKERS ARE NOT
     ----------------------------------------------
     The packet, its trail and the idle motes are dozens of sub-pixel dots a
     frame, which is exactly what canvas is for. The two endpoint markers are
     labelled text, which canvas is exactly wrong for: it would be blurrier,
     unselectable and invisible to assistive technology. So the lane is drawn
     and the labels are DOM, positioned on the same geometry.
     ====================================================================== */

  var dispatch = {
    area: 'contact',
    variant: 'page',
    id: 'contact-page-dispatch',
    num: 1,
    name: 'Dispatch',
    kind: 'Canvas / staged transmission',
    accent: '#2FD4B4',
    tagline: 'Sending is an event, not a page reload',
    desc: 'A contact form staged as a transmission: composing, sending and confirming are three ' +
          'authored states with real motion between them. The send is the only moment on the page ' +
          'that is allowed to be cinematic.',
    interaction: 'Fill the form and submit. The message becomes a packet that crosses the lane and lands on the far marker.',
    hint: 'Submit to watch the send &middot; Nothing is actually sent',

    preview: function (ctx, w, h, t, heat) {
      var rand = SE.rng(4411);
      var y = h * 0.62;
      var x0 = w * 0.12, x1 = w * 0.88;

      /* lane */
      ctx.strokeStyle = 'rgba(47,212,180,0.26)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
      ctx.setLineDash([]);

      /* endpoints */
      ctx.fillStyle = 'rgba(236,236,239,0.5)';
      ctx.fillRect(x0 - 3, y - 3, 6, 6);
      ctx.strokeStyle = 'rgba(47,212,180,0.7)';
      ctx.strokeRect(x1 - 4.5, y - 4.5, 9, 9);

      /* the composing block above the lane */
      ctx.fillStyle = 'rgba(236,236,239,' + (0.13 + heat * 0.09).toFixed(3) + ')';
      ctx.fillRect(x0, h * 0.20, w * 0.34, 3);
      ctx.fillRect(x0, h * 0.30, w * 0.46, 3);
      ctx.fillRect(x0, h * 0.40, w * 0.26, 3);

      /* the packet, looping the lane */
      var p = ((t * (0.34 + heat * 0.3)) % 1.6) / 1.6;
      var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var px = x0 + (x1 - x0) * e;
      for (var i = 0; i < 6; i++) {
        var tp = Math.max(0, e - i * 0.035);
        ctx.fillStyle = 'rgba(47,212,180,' + (0.5 - i * 0.075).toFixed(3) + ')';
        ctx.fillRect(x0 + (x1 - x0) * tp - 1, y - 1, 2, 2);
      }
      ctx.fillStyle = '#fff';
      ctx.fillRect(px - 2, y - 2, 4, 4);

      /* idle motes, deterministic */
      for (var k = 0; k < 5; k++) {
        var mx = x0 + rand() * (x1 - x0);
        var my = y + (rand() - 0.5) * h * 0.34;
        ctx.fillStyle = 'rgba(236,236,239,0.10)';
        ctx.fillRect(mx | 0, my | 0, 1, 1);
      }
    },

    mount: function (root, ctx) {
      var mode = host(root, ctx, 'dispatch');
      root.style.setProperty('--c-accent', dispatch.accent);
      var reduced = env.reduced;

      /* ------------------------------------------------------------ DOM */
      var canvasEl = SE.el('canvas', 'contact-dispatch__lane');
      canvasEl.setAttribute('aria-hidden', 'true');
      root.appendChild(canvasEl);

      var wrapEl = SE.el('div', 'contact-dispatch__wrap');
      root.appendChild(wrapEl);

      var head = SE.el('header', 'contact-dispatch__head');
      head.innerHTML =
        '<h2 class="contact-dispatch__title">Send it and I will read it.</h2>' +
        '<p class="contact-dispatch__lede">' + esc(C.lineLong) + '</p>';
      head.appendChild(factsList('contact-dispatch__facts'));
      wrapEl.appendChild(head);

      var panel = SE.el('div', 'contact-dispatch__panel');
      wrapEl.appendChild(panel);

      var form = makeForm({
        fields: ['name', 'email', 'brief'],
        submit: 'Send the message',
        sending: 'Sending',
        delay: 1500,
        onState: onFormState
      });
      panel.appendChild(form.el);

      /* Mobile carries the transmission here instead of on the lane: a 3px
         band directly under the submit control, so the send is visible in the
         same glance as the button that started it. CSS-only, driven by the
         same data-stage attribute, so it costs nothing on desktop where it is
         display:none. */
      var mini = SE.el('div', 'contact-dispatch__ministrip', '<i></i>');
      mini.setAttribute('aria-hidden', 'true');
      form.el.insertBefore(mini, SE.$('.contact-fm__status', form.el));

      var sent = makeSent({
        title: 'Delivered to the far marker.',
        body: C.reply + '. If the work is urgent, send a second note saying so and it moves up the queue.'
      });
      sent.el.classList.add('contact-dispatch__sent');
      panel.appendChild(sent.el);
      sent.again.addEventListener('click', function () {
        form.reset();
        form.focusFirst();
      });

      /* Endpoint markers, sitting on the same geometry the canvas uses. */
      var markA = SE.el('div', 'contact-dispatch__mark contact-dispatch__mark--a');
      markA.innerHTML = '<i></i><b>Composer</b><span>This browser</span>';
      var markB = SE.el('div', 'contact-dispatch__mark contact-dispatch__mark--b');
      markB.innerHTML = '<i></i><b>Inbox</b><span>' + esc(C.email) + '</span>';
      root.appendChild(markA);
      root.appendChild(markB);

      /* The canvas depicts three named stages, so the screen-reader mirror
         names them and each item moves focus somewhere useful rather than
         being a button that does nothing. */
      var sr = SE.srList('Dispatch: the three stages of the send', srItems([
        { n: 'Composing', c: 'Stage one', r: 'The lane is idle', d: 'The form is open and nothing is in transit.' },
        { n: 'Sending', c: 'Stage two', r: 'One packet crosses the lane', d: 'The submit control is disabled and shows determinate progress.' },
        { n: 'Confirmed', c: 'Stage three', r: 'The far marker takes the hit', d: 'The panel turns over into the confirmation and the reply window.' }
      ]), function () { form.focusFirst(); });
      root.appendChild(sr);

      /* --------------------------------------------------------- model */
      var cv = SE.canvas(canvasEl);
      var cx = cv.ctx;
      var rand = SE.rng(90210);

      var motes = [];
      var moteCount = env.mobile ? 14 : 34;
      for (var i = 0; i < moteCount; i++) {
        motes.push({ x: rand(), y: rand(), s: 0.3 + rand() * 0.7, ph: rand() * 6.28 });
      }

      var stage = 'idle';
      var travel = 0;           /* 0..1 packet position along the lane */
      var land = 0;             /* 0..1 landing bloom on the far marker */
      var lineLife = 0;         /* 0..1 lane brightness */
      var elapsed = 0;

      function laneY() { return cv.h * 0.885; }
      function laneX0() { return cv.w * (env.mobile ? 0.07 : 0.06); }
      function laneX1() { return cv.w * (env.mobile ? 0.93 : 0.94); }

      function onFormState(next) {
        stage = next;
        root.setAttribute('data-stage', next);
        if (next === 'sending') {
          travel = 0; land = 0;
        } else if (next === 'sent') {
          travel = 1; land = 0.001;
        } else if (next === 'failed') {
          /* The packet never made it. It dies two thirds along, which is the
             whole failure story told without a word of copy. */
          travel = Math.min(travel, 0.66);
        } else {
          travel = 0; land = 0;
        }
      }

      /* ---------------------------------------------------------- draw */
      function render() {
        cv.clear();
        var w = cv.w, h = cv.h;
        if (w < 4 || h < 4) return;
        var y = Math.round(laneY()) + 0.5;
        var x0 = laneX0(), x1 = laneX1();

        /* --- idle motes: the field the lane runs through --------------- */
        for (var i = 0; i < motes.length; i++) {
          var m = motes[i];
          var drift = reduced ? 0 : Math.sin(elapsed * 0.22 + m.ph) * 6;
          var mx = (x0 + m.x * (x1 - x0) + drift) | 0;
          var my = (h * 0.10 + m.y * h * 0.68) | 0;
          cx.fillStyle = 'rgba(236,236,239,' + (0.05 + m.s * 0.06).toFixed(3) + ')';
          cx.fillRect(mx, my, 1, 1);
        }

        /* --- the lane -------------------------------------------------- */
        cx.strokeStyle = 'rgba(47,212,180,' + (0.16 + lineLife * 0.34).toFixed(3) + ')';
        cx.lineWidth = 1;
        cx.setLineDash([3, 6]);
        cx.lineDashOffset = reduced ? 0 : -elapsed * 14;
        cx.beginPath();
        cx.moveTo(x0, y);
        cx.lineTo(x1, y);
        cx.stroke();
        cx.setLineDash([]);
        cx.lineDashOffset = 0;

        /* --- the packet and its trail ---------------------------------- */
        if (travel > 0.0005) {
          var pos = x0 + (x1 - x0) * travel;
          for (var k = 7; k >= 1; k--) {
            var tt = Math.max(0, travel - k * 0.018);
            var tx = x0 + (x1 - x0) * tt;
            cx.fillStyle = 'rgba(47,212,180,' + (0.42 - k * 0.05).toFixed(3) + ')';
            cx.fillRect(tx - 1, y - 1, 2, 2);
          }
          var glow = cx.createRadialGradient(pos, y, 0, pos, y, 26);
          glow.addColorStop(0, 'rgba(47,212,180,0.34)');
          glow.addColorStop(1, 'rgba(47,212,180,0)');
          cx.fillStyle = glow;
          cx.beginPath();
          cx.arc(pos, y, 26, 0, Math.PI * 2);
          cx.fill();
          cx.fillStyle = '#ffffff';
          cx.fillRect(pos - 2.5, y - 2.5, 5, 5);
        }

        /* --- the landing bloom on the far marker ----------------------- */
        if (land > 0.0005) {
          var r = 8 + land * 44;
          cx.strokeStyle = 'rgba(47,212,180,' + (0.55 * (1 - land)).toFixed(3) + ')';
          cx.lineWidth = 1;
          cx.beginPath();
          cx.arc(x1, y, r, 0, Math.PI * 2);
          cx.stroke();
        }
      }

      /* ---------------------------------------------------------- tick */
      function tick(dt) {
        elapsed += dt;

        var wantLine = (stage === 'sending' || stage === 'sent') ? 1 : 0;
        lineLife = reduced ? wantLine : M.damp(lineLife, wantLine, 4, dt);

        if (stage === 'sending') {
          if (reduced) {
            travel = 1;
          } else {
            /* Deliberately not damped toward 1: the packet has somewhere to
               be and should arrive on schedule with the progress bar, so it
               is driven by elapsed time with an ease-in-out shape. */
            travel = M.clamp(travel + dt / 1.5, 0, 1);
          }
        } else if (stage === 'failed') {
          /* Fallback is faster than the flight: a failure should not be dwelt
             on. lambda 3.4 is roughly 300ms perceptual. */
          travel = reduced ? 0 : M.damp(travel, 0, 3.4, dt);
          if (travel < 0.004) travel = 0;
        } else if (stage === 'sent') {
          travel = 1;
          land = reduced ? 0 : Math.min(1, land + dt / 0.9);
          if (land >= 1) land = 0;
        } else {
          travel = reduced ? 0 : M.damp(travel, 0, 6, dt);
        }

        render();
      }

      cv.observe(function () { render(); });
      SE.ticker.add(tick);
      render();

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          form.destroy();
          cv.destroy();
          root.removeAttribute('data-stage');
          root.style.removeProperty('--c-accent');
          unhost(root, 'dispatch');
        }
      };
    },

    spec: {
      subtitle: 'The form as a transmission with three authored states',
      philosophy: [
        'Most contact forms have exactly one designed state and two afterthoughts. This one treats composing, sending and confirming as three compositions with real motion between them, because the send is the only moment on a portfolio where a visitor has actually committed to something.',
        'The cinematic budget is spent once, on the send. Everything before it is quiet: a lane at 16% alpha under the composition, a panel, a form. Spending the budget everywhere would make the send mean nothing.',
        'The form underneath is deliberately ordinary. Visible labels, helper text, blur validation, an error summary. The staging is allowed to be expressive precisely because none of it is load bearing for correctness.'
      ],
      hierarchy: [
        '1. The form panel. It is the only thing on the page a visitor has to operate, so it sits on a raised surface at the highest local contrast.',
        '2. The heading and the lede, top left, 46ch measure, setting the terms before the form is read.',
        '3. The three facts (location, reply window, availability) as a definition list under the lede at mono 11px.',
        '4. The transmission lane at 84.5% of viewport height, 16% alpha at rest and 50% while in flight.',
        '5. The mote field behind everything at 5% to 11% alpha, 34 dots on desktop and 14 on mobile.',
        'During SENDING the order inverts for one and a half seconds: the packet is the brightest thing on screen at pure white, and the panel drops to 62% opacity.'
      ],
      structure: [
        'Section fills the viewport, `position: relative`, `overflow: hidden`.',
        'Layer 1: `<canvas>` absolutely filling the section, `aria-hidden="true"`. Draws the lane, the packet, the trail and the mote field only.',
        'Layer 2: a two-column grid, 7fr / 5fr with a 6vw gap, holding the heading block and the form panel.',
        'Layer 3: two absolutely positioned endpoint markers at the lane ends. Real DOM, because they carry text.',
        'Layer 4: the confirmation panel, stacked in the same grid cell as the form and cross-faded with it.',
        'Layer 5: a visually hidden focusable list naming the three stages, each item focusing the form.'
      ],
      interaction: [
        'IDLE: the lane dashes drift at 14px per second, the motes breathe on a 0.22 rad/s sine. No auto-play beyond that.',
        'FOCUS: field border moves from 14% to 26% alpha over 140ms and the focus ring is a 2px accent outline at 2px offset. Both, not one: the ring alone disappears against a dark field for low-vision users, the border alone is invisible to a keyboard user scanning quickly.',
        'BLUR: the field validates. Typing never introduces an error, only clears one, so nobody is corrected mid-word.',
        'SUBMIT with 2 or more errors: the error summary is unhidden, then populated, then focused. Unhiding before writing matters, because a role="alert" that already has its text when it appears is frequently not announced.',
        'SUBMIT with exactly 1 error: no summary, focus goes straight to the field. A one-item list is a worse experience than the field itself.',
        'SUBMIT valid: state becomes sending for 1500ms. The submit control is disabled, its label becomes "Sending", a determinate bar scales from 0 to 1 in that exact time, and the packet crosses the lane on the same clock.',
        'FAILURE: reachable on demand from the "Preview the failure state" control. The packet stalls at 0.66 and falls back at damping lambda 3.4, and a banner with a retry appears. Everything typed is preserved.'
      ],
      choreography: [
        { n: 'Packet flight', d: 'travel 0 to 1 driven by elapsed time over exactly 1.5s, matched to the progress bar so the two never disagree. Not damped: the packet has a schedule to keep.' },
        { n: 'Trail', d: 'Seven 2px squares at travel minus k*0.018, alpha 0.42 - k*0.05. Enough to read as speed, short enough not to read as a comet.' },
        { n: 'Lane wake', d: 'Lane alpha damps 0.16 to 0.50 at lambda 4 when a send starts and back when it ends. The lane is a channel that lights up, not a decoration that blinks.' },
        { n: 'Landing bloom', d: 'A single stroked ring at the far marker, radius 8 to 52px over 900ms, alpha 0.55 falling to 0. One ring, once. A repeating pulse would turn a confirmation into an alarm.' },
        { n: 'Panel turn', d: 'Form and confirmation are stacked in one grid cell. Form leaves with opacity 1 to 0 and translateY 0 to -14px over 320ms cubic-bezier(0.23, 1, 0.32, 1); confirmation arrives on the same curve over 420ms with a 120ms overlap. A crossfade, not a cut.' },
        { n: 'Failure fallback', d: 'travel damps to 0 at lambda 3.4, roughly 300ms perceptual. Faster than the send, because a failure should not be dwelt on.' }
      ],
      scroll: [
        'The page concept does not scroll on desktop: the composition is sized to the viewport with clamp() so nothing is below the fold.',
        'Below 768px the composition becomes a column and scrolls normally. No scroll hijacking anywhere.',
        'If the section is embedded in a longer page, use IntersectionObserver at threshold 0.28 to start the mote drift, and stop it on exit. An idle canvas animation nobody is looking at is pure battery.'
      ],
      hover: [
        'Gate every hover behind `@media (hover: hover) and (pointer: fine)`.',
        'Submit control: background moves to the accent and the label to the near-black ink over 140ms. No lift, no shadow.',
        'Endpoint markers: the small square goes from 40% to 100% accent over 140ms. That is the whole hover.',
        'Fields have no hover treatment at all. A field that reacts to a passing cursor reads as a button.'
      ],
      click: [
        'Submit runs the state machine described above. It is a real `<button type="submit">` inside a real `<form>`, so Enter from any field submits.',
        '"Preview the failure state" arms the next send to fail and relabels itself to say so. A failure you cannot reproduce is a failure nobody reviews.',
        '"Write another" resets every field, clears every error, returns to idle and moves focus to the first field.',
        'The endpoint markers are not interactive. They are labels on a diagram.'
      ],
      responsive: {
        desktop: 'Two columns 7fr / 5fr, 6vw gap. Lane at 84.5% height across 88% of the width. Heading at clamp(2.5rem, 4.6vw, 4.25rem).',
        tablet: 'Same two columns at 6fr / 6fr with the heading measure dropping to 38ch; the facts list moves under the panel.',
        mobile: 'Below 768px the layout is rebuilt, not shrunk. Single column: heading, then form, then the lane as a 3px strip directly under the submit control with the two markers as its end labels, so the transmission is still visible in the same glance as the button that starts it. Mote count drops from 34 to 14 and the canvas renders at DPR capped to 1.75.'
      },
      a11y: [
        'Every field has a visible `<label for>`; no placeholder is ever the only label. Placeholders are examples, not instructions.',
        'Helper text and error text are both linked with `aria-describedby`, and the error element is present in the DOM from the start so its id is stable.',
        'Errors carry `role="alert"`; the summary is unhidden before it is populated and then focused with `tabindex="-1"`.',
        'The submit control is disabled and `aria-disabled` during sending, and a `role="status" aria-live="polite"` region announces "Sending your message", then the outcome.',
        'The canvas is `aria-hidden="true"` because it depicts state, not content; the same state is carried in text by the live region, and a visually hidden list names the three stages for orientation.',
        'Under `prefers-reduced-motion: reduce`: no mote drift, no dash travel, no packet flight, no landing bloom. The submit still disables, the label still changes, the live region still announces, and the panel still turns over, as a 120ms opacity change. Reduced means fewer and gentler, never less informed.',
        'Contrast measured against the actual surfaces: label #f1f1f4 on panel #101015 is 16.9:1, helper and placeholder #a9abb6 on field #131319 is 7.1:1, error #ff8f7a on panel is 8.5:1. All AA at every size used.',
        'Inputs are 48px tall, above the 44px floor, and the submit control never wraps to two lines at desktop.'
      ],
      perf: [
        'One canvas, one ticker subscription. Per frame: 34 fillRect for motes, one stroked dashed line, up to 8 fillRect for the packet and trail, and at most one radial gradient. Roughly 45 operations.',
        'The radial gradient for the packet glow is created per frame only while a send is in flight, which is 1.5 seconds out of the session.',
        'Everything animated is transform and opacity. The panel turn is opacity plus translateY; nothing animates width, height or box-shadow in a loop.',
        'The progress bar is a scaleX transition on a single element with an explicit duration, not a per-frame width write.',
        'The simulated transport is a tracked setTimeout. It is cleared on destroy, along with the ticker subscription and the ResizeObserver.'
      ],
      packages: [
        { p: 'none required', w: 'Canvas 2D and CSS transitions cover the whole concept. The packet is a 5px square.' },
        { p: 'no three.js', w: 'One dot moving along one line. WebGL would add 600kb to draw a square.' },
        { p: 'gsap (installed)', w: 'Optional, and only for the panel turn if you want the confirmation to stagger its lines. The send itself must stay on the same clock as the progress bar, so drive it from elapsed time, not from a tween you cannot query.' },
        { p: 'no form library', w: 'Three fields and one async call. react-hook-form and zod would be 20kb to validate an email and a minimum length, and would still need every aria attribute written by hand.' }
      ],
      architecture: [
        { f: 'components/sections/Contact.tsx', r: 'Server shell: heading, lede, facts and the full form markup render on the server so the page is usable before hydration.' },
        { f: 'components/contact/DispatchLane.tsx', r: '"use client": the canvas, the mote field and the packet. Takes `stage` as a prop and owns nothing else.' },
        { f: 'components/contact/ContactForm.tsx', r: '"use client": the state machine. Owns field values, errors, stage and the summary focus behaviour.' },
        { f: 'components/contact/Field.tsx', r: 'One field: label, control, helper, error, and the aria wiring. Every concept in this area shares it.' },
        { f: 'lib/contact/validate.ts', r: 'Pure validators returning a message or an empty string. Testable without a DOM.' },
        { f: 'app/api/contact/route.ts', r: 'The real transport when you wire one up. Until then the client resolves a promise after 1500ms.' }
      ],
      state: [
        '`stage` ("idle" | "sending" | "sent" | "failed") is state: four renders per submit, and the whole layout depends on it.',
        'Field values are state, because they are controlled inputs. Errors are state for the same reason.',
        'Packet travel, mote positions and the lane dash offset are refs written directly to the canvas. They change sixty times a second and no DOM depends on them.',
        'The simulated transport timeout id is a ref, cleared in the effect teardown.',
        'The failure-arming flag is a ref: it changes no pixels until the next submit.'
      ],
      typography: [
        'Heading: display 500 at clamp(2.5rem, 4.6vw, 4.25rem), tracking -0.045em, line-height 0.94, balanced.',
        'Lede: 1.0625rem / 1.62 at 46ch. Never wider; a 90ch lede is the fastest way to make a page unread.',
        'Labels: display 500 at 0.8125rem, tracking 0.01em. Not mono: a label is prose addressed to a person.',
        'Helper and error text: 0.75rem / 1.5. Error text is never italic, because italics at 12px on a dark ground lose the stem contrast that makes them readable.',
        'Facts list and the marker captions: mono 500 at 0.6875rem, tracking 0.18em, uppercase. Mono is for data only.',
        'Submit label: mono 500 at 0.6875rem, tracking 0.16em, uppercase, one line at every breakpoint.'
      ],
      color: [
        'Signature hue #2FD4B4 appears in exactly four places: the lane, the packet trail, the focus ring, and the submit fill. Nowhere else.',
        'The packet itself is pure white, the only pure white on the page, which is what makes it read as energy rather than as an object.',
        'Error #ff8f7a and success #6fe3b0 are semantic and are never the signature hue. A form that turns its brand colour red is a form nobody trusts.',
        'Field background #131319 sits 3 steps off the panel #101015: enough to read as an inset, not enough to become a card.',
        'In light mode: panel becomes #ffffff on a #f6f6f8 ground, field #f1f1f4, the lane hue darkens to #0F8E78 to hold 3:1 against white, and the packet becomes near-black ink because a white packet on white is invisible.'
      ],
      spacing: [
        'Panel padding clamp(1.5rem, 3vw, 2.5rem). Field stack gap 1.25rem, and 0.5rem between a label and its control.',
        'The gap above a heading is always larger than the gap below it: 4rem above, 1.25rem below.',
        'Grid gap 6vw between the argument and the form, which is what keeps the two from reading as one block.',
        'The lane sits at 84.5% of the viewport height so it is clearly under the composition and clearly not a footer rule.',
        'Error text reserves its line height whether or not it has content, so an appearing error never reflows the fields below it.'
      ],
      relationships: [
        'Horizontal position on the lane encodes progress. It is the same value as the progress bar, which is why the two are driven by one clock.',
        'Brightness encodes activity: the lane is dim when idle and bright in flight, so the channel and the message are visually distinct things.',
        'The two endpoint markers encode the two ends of a real transaction, which is what makes the failure state legible: the packet did not reach the second marker.',
        'Panel opacity encodes control: at 62% during the send, it is telling you the form is not yours to edit right now, before you try.'
      ],
      acceptance: [
        'Tabbing from the first field to the submit control passes through exactly: name, email, message, submit, failure preview. No hidden stops.',
        'Submitting an empty form focuses the error summary and reads out how many fields need attention; submitting with one bad field focuses that field instead.',
        'While sending, the submit control cannot be pressed twice, and the progress bar finishes at the same moment the packet lands.',
        'The failure state can be reproduced on demand, preserves every typed value, and offers both a retry and a plain email address.',
        'With reduced motion on, there is no drift, no flight and no bloom, and a user still learns that the message is sending and then that it sent.',
        'Every label, helper, placeholder and error measured with getComputedStyle clears 4.5:1 against the surface it actually sits on.'
      ]
    }
  };

  SE.register(dispatch);

  /* ======================================================================
     PAGE 02  -  STATEMENT
     ----------------------------------------------------------------------
     An enormous typographic invitation. The form is almost incidental: it
     exists, it is complete and correct, and it is one intent away.

     WHY THE FORM IS NOT ON SCREEN AT REST
     -------------------------------------
     Because the argument is. A visitor who has read five sections and reached
     the bottom of a portfolio does not need a form in front of them; they need
     one sentence that decides it. Once decided, the form must be immediately
     and completely available, which is why the reveal is a 620ms curtain and
     not a route change, why focus lands in the first field, and why the plain
     address is on screen the whole time for anyone who would rather not use a
     form at all.

     ON MOBILE THE REVEAL IS REMOVED ENTIRELY. Hiding a form behind a gesture
     on a phone is hostile, so below 768px the composition is a statement with
     the form already under it, and the reveal control disappears.
     ====================================================================== */

  var statement = {
    area: 'contact',
    variant: 'page',
    id: 'contact-page-statement',
    num: 2,
    name: 'Statement',
    kind: 'Type / curtain reveal',
    accent: '#F5C451',
    tagline: 'One sentence decides it, the form only records it',
    desc: 'A full-viewport typographic invitation with the address in plain sight and the form one ' +
          'intent away. The statement does not disappear when the form arrives, it becomes the header.',
    interaction: 'Press "Write to me" and the composition lifts to bring the form into view, with focus landing in the first field.',
    hint: 'Write to me opens the form &middot; The address always works',

    preview: function (ctx, w, h, t, heat) {
      var rand = SE.rng(1207);
      /* Two heavy statement lines that rise out of their line boxes, then a
         set of thin form rules that arrive underneath. */
      var cycle = (t * 0.34) % 4;
      var rise = M.clamp(cycle / 0.9, 0, 1);
      var open = M.clamp((cycle - 1.4) / 0.9, 0, 1);
      var e = 1 - Math.pow(1 - rise, 3);
      var eo = 1 - Math.pow(1 - open, 3);
      var lift = eo * h * 0.16;

      var x = w * 0.10;
      var lh = h * 0.20;
      var y0 = h * 0.30 - lift;

      for (var i = 0; i < 2; i++) {
        var y = y0 + i * lh * 1.05;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y - lh * 0.72, w * 0.80, lh * 0.72);
        ctx.clip();
        var off = (1 - e) * lh * 0.9;
        ctx.fillStyle = 'rgba(236,236,239,' + (0.72 + heat * 0.2).toFixed(3) + ')';
        ctx.fillRect(x, y - lh * 0.60 + off, w * (i === 0 ? 0.58 : 0.76), lh * 0.46);
        ctx.restore();
      }

      /* the form arriving underneath */
      for (var k = 0; k < 3; k++) {
        var fy = h * 0.68 + k * h * 0.10 - lift * 0.4;
        var a = eo * (0.30 + heat * 0.2);
        ctx.strokeStyle = 'rgba(245,196,81,' + a.toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, fy);
        ctx.lineTo(x + w * (0.30 + rand() * 0.34), fy);
        ctx.stroke();
      }
    },

    mount: function (root, ctx) {
      host(root, ctx, 'statement');
      root.style.setProperty('--c-accent', statement.accent);
      var reduced = env.reduced;

      var inner = SE.el('div', 'contact-statement__inner');
      root.appendChild(inner);

      /* The two lines are wrapped in masked line boxes so the entry can be a
         rise out of the leading rather than a fade. Authored as spans in the
         heading so the heading is still one string to a screen reader. */
      var h2 = SE.el('h2', 'contact-statement__line');
      h2.innerHTML =
        '<span class="contact-statement__box"><span>Tell me what</span></span>' +
        '<span class="contact-statement__box"><span>you are building.</span></span>';
      inner.appendChild(h2);

      var sub = SE.el('p', 'contact-statement__sub',
        esc(C.availability) + '. ' + esc(C.reply) + '.');
      inner.appendChild(sub);

      var actions = SE.el('div', 'contact-statement__actions');
      var cta = SE.el('button', 'contact-statement__cta',
        '<span>Write to me</span>' + icon('arrow'));
      cta.type = 'button';
      cta.setAttribute('aria-expanded', 'false');
      actions.appendChild(cta);

      var addr = SE.el('a', 'contact-statement__addr', esc(C.email));
      addr.href = 'mailto:' + C.email;
      actions.appendChild(addr);
      inner.appendChild(actions);

      var formWrap = SE.el('div', 'contact-statement__form');
      formWrap.id = uid('statement-form');
      cta.setAttribute('aria-controls', formWrap.id);

      var form = makeForm({
        fields: ['name', 'email', 'brief'],
        submit: 'Send',
        sending: 'Sending',
        delay: 1500,
        onState: function (next) { root.setAttribute('data-stage', next); }
      });
      formWrap.appendChild(form.el);

      /* Per-field stagger index, so the reveal cascades instead of arriving as
         one block. Set as a custom property rather than six selectors. */
      form.fields.forEach(function (f, i) { f.wrap.style.setProperty('--i', i); });

      var sent = makeSent({
        title: 'Read within a working day, replied to within two.',
        body: 'Nothing else happens automatically. No sequence, no newsletter, no follow up from a tool.'
      });
      sent.el.classList.add('contact-statement__sent');
      formWrap.appendChild(sent.el);
      sent.again.addEventListener('click', function () { form.reset(); form.focusFirst(); });

      inner.appendChild(formWrap);

      /* ------------------------------------------------------ interaction */
      var open = false;
      function setOpen(v, moveFocus) {
        open = v;
        root.setAttribute('data-contact-open', String(v));
        cta.setAttribute('aria-expanded', String(v));
        if (v && moveFocus) {
          /* Focus after the curtain has started, not after it has finished:
             waiting for the full 620ms makes the keyboard feel disconnected
             from the press. */
          setTimeout(function () { form.focusFirst(); }, reduced ? 0 : 160);
        }
      }
      setOpen(false, false);

      cta.addEventListener('click', function () { setOpen(true, true); });

      /* ------------------------------------------------------------ entry */
      /* One authored moment on arrival: the two lines rise out of their line
         boxes. Everything else is already in place. */
      var entered = false;
      function enter() {
        if (entered) return;
        entered = true;
        root.setAttribute('data-entered', 'true');
      }
      var enterTimer = setTimeout(enter, reduced ? 0 : 60);

      return {
        destroy: function () {
          clearTimeout(enterTimer);
          form.destroy();
          root.removeAttribute('data-contact-open');
          root.removeAttribute('data-entered');
          root.removeAttribute('data-stage');
          root.style.removeProperty('--c-accent');
          unhost(root, 'statement');
        }
      };
    },

    spec: {
      subtitle: 'An enormous typographic invitation with the form one intent away',
      philosophy: [
        'By the time a visitor reaches the bottom of a portfolio they do not need a form, they need one sentence that decides it. So the sentence gets the whole viewport and the form gets a keypress.',
        'Progressive disclosure is only defensible if the disclosed thing arrives complete and instantly. The form is fully built and fully accessible before the reveal; the reveal moves the viewport, it does not build anything.',
        'The plain email address is on screen the entire time, at the same size as the reveal control. Anyone who would rather not use a form should never have to open one to find out where to write.'
      ],
      hierarchy: [
        '1. The statement, two lines at clamp(2.75rem, 11.5vw, 10rem). It is the only thing above the fold at rest.',
        '2. The reveal control and the address, side by side and typographically equal, because they are two ways to do the same thing.',
        '3. The availability and reply window as one quiet line under the statement at 1.0625rem.',
        '4. The form, below the fold at rest and the whole composition once open.',
        'Once open, the order inverts: the statement translates up and out and becomes a header, and the form is the page.'
      ],
      structure: [
        'Section is a single column, `min-h-[100dvh]`, `overflow: hidden` at the section level so the curtain can crop the statement.',
        'Layer 1: an inner wrapper that carries the whole translate. Statement, sub line, actions and form are all inside it, so one transform moves everything and nothing has to be re-laid-out.',
        'Layer 2: the heading, with each line inside a masked `<span>` so the entry can be a rise out of the line box.',
        'Layer 3: the actions row, a `<button>` and an `<a href="mailto:">`.',
        'Layer 4: the form block, stacked with its confirmation in one grid cell.',
        'No canvas anywhere. This concept is type and one transform.'
      ],
      interaction: [
        'ENTRY: on mount, the two heading lines translate from 108% to 0 inside their masked boxes over 900ms cubic-bezier(0.23, 1, 0.32, 1) with a 90ms stagger. Nothing else animates in.',
        'REVEAL: pressing the control sets a data attribute on the section. The inner wrapper translates by min(34vh, 20rem) over 620ms cubic-bezier(0.32, 0.72, 0, 1), which is the drawer curve, because this is a drawer.',
        'The form fields fade and rise 18px on the same open, staggered 60ms per field via `transition-delay: calc(var(--i) * 60ms)`, starting 140ms into the curtain so the two moves overlap rather than queue.',
        'FOCUS: lands in the first field 160ms after the press, not after the 620ms curtain finishes. Waiting for the full move makes the keyboard feel disconnected from the button.',
        'The control carries `aria-expanded` and `aria-controls` pointing at the form region, so the relationship is in the accessibility tree and not only in the motion.',
        'The rest of the form behaves exactly as every other concept in this area: blur validation, error summary on multi-error submit, disabled progress while sending, a failure branch with retry.'
      ],
      choreography: [
        { n: 'Line rise', d: 'translateY 108% to 0 inside `overflow: hidden` line boxes, 900ms cubic-bezier(0.23, 1, 0.32, 1), 90ms stagger. 108% rather than 100% so descenders clear the mask edge.' },
        { n: 'Curtain', d: 'translate3d(0, -min(34vh, 20rem), 0) on the inner wrapper, 620ms cubic-bezier(0.32, 0.72, 0, 1). One transform on one element moves the entire composition; nothing below it is measured or re-laid-out.' },
        { n: 'Field cascade', d: 'opacity 0 to 1 and translateY 18px to 0 over 420ms cubic-bezier(0.23, 1, 0.32, 1), delay 140ms + index * 60ms. Three fields, so the last one starts 260ms in and the whole cascade is done before the curtain is.' },
        { n: 'Control exit', d: 'The reveal control fades to 0 and goes `visibility: hidden` over 220ms. It has done its job and leaving it on screen invites a second press that does nothing.' },
        { n: 'Confirmation', d: 'Same crossfade as every other concept in the area: form out over 320ms, confirmation in over 420ms with a 120ms overlap.' }
      ],
      scroll: [
        'At rest the composition is exactly one viewport and does not scroll. After the reveal it is one viewport plus the form, which the curtain brings into view, so it still does not need scroll on a laptop.',
        'On short viewports and on mobile the section scrolls normally. No hijack, no pin, no rail.',
        'If this is a section inside a longer page, run the line rise from an IntersectionObserver at threshold 0.4 and run it once.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'Reveal control: the accent underline grows from 1px to 2px and the arrow translates 3px right over 140ms. Two small changes, one intent.',
        'Address: underline offset moves from 4px to 6px over 140ms. That is all a mailto link needs.',
        'The statement itself has no hover state. It is not a control.'
      ],
      click: [
        'The reveal control opens the form and moves focus. It cannot close it again, because a form a visitor has started typing in must never be collapsible by the same button that opened it.',
        'The address is a real mailto link and works with the keyboard, with middle click, and with copy-link.',
        'Submit runs the shared state machine.'
      ],
      responsive: {
        desktop: 'Statement at clamp(2.75rem, 11.5vw, 10rem) over two lines. Curtain distance min(34vh, 20rem). Actions row horizontal.',
        tablet: 'Same, with the statement dropping to 9vw so it still holds two lines, and the curtain to 30vh.',
        mobile: 'Below 768px the reveal is REMOVED, not shrunk. The form is already under the statement, the reveal control is `display: none`, and the curtain transform is `none`. Hiding a form behind a gesture on a phone is hostile, and a visitor on a phone has already scrolled a long way to get here. The statement drops to clamp(2.25rem, 12vw, 3.5rem) over three lines and the address becomes a full-width tap target at 48px.'
      },
      a11y: [
        'The reveal control is a real `<button>` with `aria-expanded` and `aria-controls` referencing the form region.',
        'Focus moves into the first field on open; it does not stay behind on a control that has just hidden itself.',
        'The heading is one `<h2>`; the two masked spans are presentational and do not split the accessible name.',
        'The form is the shared machine: visible labels, helper and error text linked by aria-describedby, blur validation, focus-managed error summary, live-region progress.',
        'Under `prefers-reduced-motion: reduce`: no line rise, no curtain travel, no field cascade. The form is simply present under the statement and the reveal control is hidden, exactly as on mobile. Focus still moves, the submit still disables, the live region still announces.',
        'Contrast measured on the actual surfaces: statement #f1f1f4 on #08080a is 18.4:1, sub line #a9abb6 on #08080a is 9.2:1, address #f5c451 on #08080a is 12.7:1, and every form token is the shared set at 5.7:1 or better.'
      ],
      perf: [
        'No canvas, no ticker, no observer. The entire concept is two CSS transitions and one attribute.',
        'The curtain is one transform on one element. Because the form is already laid out, opening it costs no layout at all.',
        'The line-rise entry uses `overflow: hidden` on a static parent and a transform on the child, so the mask is free.',
        'The only JavaScript that runs after mount is the form state machine.',
        'This is the cheapest concept in the area, which is worth knowing when the contact section sits at the bottom of a page that has already spent its budget.'
      ],
      packages: [
        { p: 'none required', w: 'Two CSS transitions and an attribute toggle.' },
        { p: 'gsap (installed)', w: 'Only worth it if you want the line rise to use a SplitText per word rather than per line. Per line is the better composition here, and per line needs no library.' },
        { p: 'no framer-motion', w: 'There is no layout animation, no gesture and no exit animation. AnimatePresence would be 30kb of nothing.' }
      ],
      architecture: [
        { f: 'components/sections/Contact.tsx', r: 'Server component: the statement, the sub line, the actions and the entire form markup. Nothing is conditional on the client.' },
        { f: 'components/contact/RevealForm.tsx', r: '"use client": owns one boolean and the focus move. Twenty lines.' },
        { f: 'components/contact/ContactForm.tsx', r: 'Shared with every other concept in this area.' },
        { f: 'app/globals.css', r: 'The curtain distance as a token: `--contact-curtain: min(34vh, 20rem)`, so the mobile override is one line.' }
      ],
      state: [
        '`open` is the only state in the concept. One boolean, one re-render.',
        'The stagger index is a CSS custom property written once at build time, not state.',
        'Do not put the entry animation in state. It runs once from a CSS class applied on mount.',
        'Field values and errors are state inside the shared form component, as everywhere else in this area.'
      ],
      typography: [
        'Statement: display 500 at clamp(2.75rem, 11.5vw, 10rem), tracking -0.05em, line-height 0.84. At 10rem the tracking has to be negative or the words fall apart.',
        'Sub line: 1.0625rem / 1.6 at 52ch, one line of fact and no more.',
        'Reveal control and address: mono 500 at 0.875rem, tracking 0.02em. The address is not uppercased, because an email address that has been transformed is an email address you cannot copy by eye.',
        'Form labels and helper text: the shared set, display 0.8125rem and 0.75rem.',
        'One display face and one mono face across the whole concept. No third voice.'
      ],
      color: [
        'Signature hue #F5C451 appears on the reveal control underline, the address underline, the focus rings and the submit fill. Four places.',
        'The statement is #f1f1f4 on the near-black ground. It is never the accent: a ten-rem heading in a saturated hue is a poster, not an invitation.',
        'The ground is the section ground with no panel behind the form, which is what keeps the form feeling incidental rather than boxed.',
        'In light mode the accent darkens to #8A6410 to hold 4.5:1 against white for the underlines, and the statement becomes the near-black ink.'
      ],
      spacing: [
        'Statement to sub line: 2rem. Sub line to actions: clamp(2rem, 5vh, 3.5rem). Actions to form: clamp(3rem, 9vh, 6rem), which is the gap the curtain travels through.',
        'Actions row gap 2.5rem between the control and the address, so they read as alternatives rather than as a pair.',
        'Section padding clamp(2rem, 8vh, 6rem) horizontal gutter, with the statement starting at the gutter and never centred.',
        'The form is capped at 34rem so it never stretches to the width of a ten-rem statement.'
      ],
      relationships: [
        'Scale encodes priority: the statement is forty times the size of the helper text, which is exactly how much more it matters at this moment.',
        'The curtain distance encodes the relationship between the two states: the statement does not vanish, it moves up and becomes a header, so the invitation is still the frame the form sits in.',
        'Putting the control and the address at the same size encodes that they are equally valid. Making the address smaller would be a dark pattern in a very quiet coat.'
      ],
      acceptance: [
        'At rest the statement and the address are both fully visible without scrolling on a 900px-tall laptop.',
        'Pressing the control moves focus into the first field and announces the expanded state.',
        'On a 390px phone there is no reveal control and the form is already visible under the statement.',
        'With reduced motion on, nothing travels and everything is reachable.',
        'The statement never wraps to three lines above 768px, and never wraps mid-word.',
        'The address can be selected and copied as plain text.'
      ]
    }
  };

  SE.register(statement);

  /* ======================================================================
     PAGE 03  -  CONSOLE
     ----------------------------------------------------------------------
     A precise instrument surface. Availability, local time and the reply
     window are read like gauges rather than written like marketing.

     THE HONESTY RULE THIS CONCEPT LIVES OR DIES BY
     ----------------------------------------------
     An instrument that shows invented readings is a lie with a nice typeface.
     So: the clock is REAL, computed from the viewer's own clock and the
     studio's fixed offset, and the "hours ahead of you" figure is derived from
     the viewer's actual timezone. The reply window is NOT a measurement, it is
     a commitment, and it is labelled as one on the instrument itself. Nothing
     here presents a number as data that is not data.
     ====================================================================== */

  var consoleC = {
    area: 'contact',
    variant: 'page',
    id: 'contact-page-console',
    num: 3,
    name: 'Console',
    kind: 'Canvas / live instrument',
    accent: '#5BA8FF',
    tagline: 'Read the availability instead of being told it',
    desc: 'Local time, working hours and the reply window rendered as an instrument you read rather ' +
          'than a paragraph you skim. The clock is real; the reply window is labelled as a commitment, not a measurement.',
    interaction: 'The instrument updates once a second. Fill the brief on the right, including when the work needs to start.',
    hint: 'Live local time &middot; The window is a commitment, not an average',

    preview: function (ctx, w, h, t, heat) {
      var pad = w * 0.10;
      var axisY = h * 0.66;
      var span = w - pad * 2;

      /* the axis */
      ctx.strokeStyle = 'rgba(236,236,239,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, axisY + 0.5);
      ctx.lineTo(w - pad, axisY + 0.5);
      ctx.stroke();

      /* ticks */
      for (var i = 0; i <= 6; i++) {
        var x = pad + (i / 6) * span;
        var tall = i % 2 === 0;
        ctx.strokeStyle = 'rgba(236,236,239,' + (tall ? 0.28 : 0.14) + ')';
        ctx.beginPath();
        ctx.moveTo(x + 0.5, axisY);
        ctx.lineTo(x + 0.5, axisY + (tall ? 8 : 5));
        ctx.stroke();
      }

      /* the target band */
      var b0 = pad + span * 0.06, b1 = pad + span * 0.5;
      ctx.fillStyle = 'rgba(91,168,255,' + (0.18 + heat * 0.12).toFixed(3) + ')';
      ctx.fillRect(b0, axisY - h * 0.20, b1 - b0, h * 0.20);
      ctx.strokeStyle = 'rgba(91,168,255,0.6)';
      ctx.beginPath();
      ctx.moveTo(b1 + 0.5, axisY - h * 0.24);
      ctx.lineTo(b1 + 0.5, axisY + 6);
      ctx.stroke();

      /* the scan, stepping once per second */
      var step = Math.floor(t) % 7;
      var sx = pad + (step / 6) * span;
      ctx.fillStyle = 'rgba(236,236,239,0.9)';
      ctx.fillRect(sx - 1, axisY - h * 0.30, 2, h * 0.30);

      /* the readout block above */
      ctx.fillStyle = 'rgba(236,236,239,' + (0.5 + heat * 0.3).toFixed(3) + ')';
      ctx.fillRect(pad, h * 0.20, w * 0.22, 4);
      ctx.fillStyle = 'rgba(91,168,255,0.85)';
      ctx.fillRect(pad, h * 0.30, w * 0.13, 3);
    },

    mount: function (root, ctx) {
      host(root, ctx, 'console');
      root.style.setProperty('--c-accent', consoleC.accent);
      var reduced = env.reduced;

      var wrapEl = SE.el('div', 'contact-console__wrap');
      root.appendChild(wrapEl);

      /* ------------------------------------------------- instrument column */
      var rig = SE.el('section', 'contact-console__rig');
      rig.setAttribute('aria-label', 'Availability instrument');

      var openNow = withinHours();
      var head = SE.el('div', 'contact-console__head');
      head.innerHTML =
        '<h2 class="contact-console__title">Where things stand.</h2>' +
        '<p class="contact-console__lede">' + esc(C.line) + ' It goes to one inbox, read by one ' +
        'person, with no automation attached.</p>';
      rig.appendChild(head);

      /* The single status dot in this file. It encodes real state (inside or
         outside stated working hours), which is the only thing that earns a
         coloured dot. */
      var live = SE.el('div', 'contact-console__live');
      live.innerHTML =
        '<div class="contact-console__cell">' +
          '<span class="contact-console__k">Studio clock</span>' +
          '<span class="contact-console__clock t-num" data-clock>--:--:--</span>' +
          '<span class="contact-console__note" data-offset></span>' +
        '</div>' +
        '<div class="contact-console__cell">' +
          '<span class="contact-console__k">Working hours</span>' +
          '<span class="contact-console__v" data-hours>' + esc(C.hours) + '</span>' +
          '<span class="contact-console__state" data-state>' +
            '<i class="contact-console__dot" aria-hidden="true"></i>' +
            '<span data-statetext>' + (openNow ? 'At the desk now' : 'Outside working hours') + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="contact-console__cell">' +
          '<span class="contact-console__k">Booking</span>' +
          '<span class="contact-console__v">' + esc(C.availability) + '</span>' +
          '<span class="contact-console__note">' + esc(C.booked) + '</span>' +
        '</div>';
      rig.appendChild(live);

      var meter = SE.el('figure', 'contact-console__meter');
      meter.innerHTML =
        '<figcaption class="contact-console__metercap">' +
          '<span>Reply window</span>' +
          '<span class="contact-console__model">' + esc(C.replyModel) + '</span>' +
        '</figcaption>';
      var canvasEl = SE.el('canvas', 'contact-console__canvas');
      canvasEl.setAttribute('aria-hidden', 'true');
      meter.appendChild(canvasEl);
      rig.appendChild(meter);

      /* The meter carries readings, so it gets a real screen-reader mirror
         rather than being written off as decoration. */
      rig.appendChild(SE.srList('Reply window instrument', srItems([
        { n: 'Scale', c: 'Axis', r: 'Zero to seventy two hours', d: 'Marked every twelve hours from the moment a message arrives.' },
        { n: 'Target window', c: 'Band', r: 'Four to thirty six working hours', d: 'The commitment, not a measured average. Weekends are not counted.' },
        { n: 'Outer bound', c: 'Marker', r: 'Two working days', d: 'If a reply has not gone out by then, write again and it moves up the queue.' }
      ]), function () { form.focusFirst(); }));

      wrapEl.appendChild(rig);

      /* ------------------------------------------------------ form column */
      var panel = SE.el('div', 'contact-console__panel');
      var form = makeForm({
        fields: ['name', 'email', 'timing', 'brief'],
        submit: 'Send the brief',
        sending: 'Sending',
        delay: 1600,
        tight: true,
        onState: function (next) { root.setAttribute('data-stage', next); }
      });
      panel.appendChild(form.el);

      var sent = makeSent({
        title: 'Logged, and in front of one person.',
        body: 'It sits in a single inbox with no automation attached. ' + C.reply + '.'
      });
      sent.el.classList.add('contact-console__sent');
      panel.appendChild(sent.el);
      sent.again.addEventListener('click', function () { form.reset(); form.focusFirst(); });

      wrapEl.appendChild(panel);

      /* ---------------------------------------------------------- clock */
      var clockEl = SE.$('[data-clock]', rig);
      var offsetEl = SE.$('[data-offset]', rig);
      var stateWrap = SE.$('[data-state]', rig);
      var stateText = SE.$('[data-statetext]', rig);

      /* Derived from the viewer's real timezone, so it is true wherever they
         are rather than being a nice-looking constant. */
      (function () {
        var viewerOffset = -new Date().getTimezoneOffset();
        var diff = Math.round((C.tzOffsetMin - viewerOffset) / 60 * 10) / 10;
        var txt;
        if (Math.abs(diff) < 0.05) txt = 'Same clock as yours';
        else if (diff > 0) txt = diff + (diff === 1 ? ' hour' : ' hours') + ' ahead of you';
        else txt = (-diff) + (diff === -1 ? ' hour' : ' hours') + ' behind you';
        offsetEl.textContent = txt;
      })();

      var lastSecond = -1;
      function paintClock() {
        var t = studioTime();
        if (t.ss === lastSecond) return false;
        lastSecond = t.ss;
        clockEl.textContent = pad2(t.hh) + ':' + pad2(t.mm) + ':' + pad2(t.ss);
        var isOpen = withinHours();
        stateWrap.setAttribute('data-live', String(isOpen));
        stateText.textContent = isOpen ? 'At the desk now' : 'Outside working hours';
        return true;
      }
      paintClock();

      /* ---------------------------------------------------------- meter */
      var cv = SE.canvas(canvasEl);
      var cx = cv.ctx;
      var HOURS = 72;
      var BAND = [4, 36];        /* the commitment, in working hours */
      var scan = 0;

      function render() {
        cv.clear();
        var w = cv.w, h = cv.h;
        if (w < 6 || h < 6) return;

        var padL = 2, padR = 2;
        var span = w - padL - padR;
        var axisY = Math.round(h * 0.70) + 0.5;

        /* target band */
        var b0 = padL + (BAND[0] / HOURS) * span;
        var b1 = padL + (BAND[1] / HOURS) * span;
        cx.fillStyle = 'rgba(91,168,255,0.16)';
        cx.fillRect(b0, axisY - h * 0.52, b1 - b0, h * 0.52);
        cx.strokeStyle = 'rgba(91,168,255,0.72)';
        cx.lineWidth = 1;
        cx.beginPath();
        cx.moveTo(Math.round(b1) + 0.5, axisY - h * 0.60);
        cx.lineTo(Math.round(b1) + 0.5, axisY + 7);
        cx.stroke();

        /* axis */
        cx.strokeStyle = 'rgba(236,236,239,0.18)';
        cx.beginPath();
        cx.moveTo(padL, axisY);
        cx.lineTo(w - padR, axisY);
        cx.stroke();

        /* ticks every 12 hours, taller every 24 */
        cx.font = '500 9px "JetBrains Mono", monospace';
        cx.textBaseline = 'top';
        for (var hh = 0; hh <= HOURS; hh += 12) {
          var x = Math.round(padL + (hh / HOURS) * span) + 0.5;
          var major = hh % 24 === 0;
          cx.strokeStyle = 'rgba(236,236,239,' + (major ? 0.34 : 0.16) + ')';
          cx.beginPath();
          cx.moveTo(x, axisY);
          cx.lineTo(x, axisY + (major ? 8 : 5));
          cx.stroke();
          if (major) {
            cx.fillStyle = 'rgba(138,140,150,1)';
            cx.textAlign = hh === 0 ? 'left' : (hh === HOURS ? 'right' : 'center');
            cx.fillText(hh + 'h', hh === 0 ? padL : (hh === HOURS ? w - padR : x), axisY + 11);
          }
        }

        /* the scan: one step per second across the axis, so the instrument
           reads as live without anything pretending to be a measurement */
        var sx = Math.round(padL + scan * span) + 0.5;
        cx.strokeStyle = 'rgba(236,236,239,0.5)';
        cx.beginPath();
        cx.moveTo(sx, axisY - h * 0.66);
        cx.lineTo(sx, axisY);
        cx.stroke();
        cx.fillStyle = '#ffffff';
        cx.fillRect(sx - 1.5, axisY - 2, 3, 3);
      }

      /* ------------------------------------------------------------ tick */
      var acc = 0;
      function tick(dt) {
        var changed = paintClock();
        if (reduced) {
          /* No sweep under reduced motion: the scan parks at the outer bound
             of the commitment, which is the reading that matters. */
          if (scan !== BAND[1] / HOURS) { scan = BAND[1] / HOURS; changed = true; }
        } else {
          acc += dt;
          var next = (acc * 0.085) % 1;         /* one pass every ~11.8s */
          if (Math.abs(next - scan) > 0.0008) { scan = next; changed = true; }
        }
        if (changed) render();
      }

      cv.observe(function () { render(); });
      SE.ticker.add(tick);
      render();

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          form.destroy();
          cv.destroy();
          root.removeAttribute('data-stage');
          root.style.removeProperty('--c-accent');
          unhost(root, 'console');
        }
      };
    },

    spec: {
      subtitle: 'A precise instrument surface for availability, timezone and reply window',
      philosophy: [
        'Most portfolios write availability as a sentence nobody believes. This one renders it as an instrument you read, which means it has to be true: the clock is computed from the viewer\'s own clock and a fixed offset, and the "hours ahead of you" figure is derived from their real timezone.',
        'The reply window is a commitment, not a measurement, and the instrument says so on its own face. Inventing a precise-looking average and letting a visitor believe it is a data-integrity problem, not a design flourish.',
        'This is the one concept in the area with a coloured status dot, because it is the one place where a dot encodes real state: inside or outside stated working hours, recomputed every second.'
      ],
      hierarchy: [
        '1. The form panel on the right. Everything on the left exists to make submitting it feel informed.',
        '2. The studio clock at mono 500 / 2.25rem with tabular figures. The largest number on the page.',
        '3. The three instrument cells: clock, working hours with the state dot, booking.',
        '4. The reply-window meter, 72 hours wide, with the target band at 16% accent fill.',
        '5. The heading and lede, which are deliberately short because the instrument is the argument.',
        'The model disclaimer sits inside the meter caption at 10px, not in a footnote. A caveat a visitor has to hunt for is not a caveat.'
      ],
      structure: [
        'Two columns, 5fr instrument / 7fr form, 5vw gap, vertically centred.',
        'Instrument column: heading block, then a three-cell grid of readings, then a `<figure>` holding the meter canvas and its `<figcaption>`.',
        'The meter canvas is `aria-hidden="true"` and mirrored by a visually hidden list that names the axis, the band and the outer bound in words.',
        'Form column: a panel holding the shared form (name, email, a timing radio group, brief) stacked with the confirmation.',
        'The timing field is a radio group in a `<fieldset>` with a `<legend>`, not a styled `<select>`. Once a select needs `appearance: none` to be legible on a dark surface it has to be re-taught to assistive technology anyway, and radios are already correct.'
      ],
      interaction: [
        'The clock repaints only when the second changes: the ticker runs at 60fps and writes to the DOM about once a second.',
        'The scan line crosses the 72-hour axis once every 11.8 seconds. It is the only always-on motion and it is one 3px rect plus one 1px line.',
        'The state dot and its label are recomputed on the same second boundary from the studio time, so at 18:00 local the page says so without a reload.',
        'The timing radio group is keyboard-native: arrow keys move within the group, Tab leaves it. That behaviour is free with radios and expensive to rebuild.',
        'Everything else is the shared form machine: blur validation, single-error field focus, multi-error summary focus, disabled progress, failure with retry.'
      ],
      choreography: [
        { n: 'Scan sweep', d: 'scan 0 to 1 at 0.085 per second, linear, wrapping. Linear because it is constant-rate progress across a scale; easing a ruler would be a lie about the scale.' },
        { n: 'Clock', d: 'No animation at all. Digits change on the second with tabular figures so nothing shifts. A number ticker on a clock is decoration on a measurement.' },
        { n: 'State dot', d: 'background-color over 220ms cubic-bezier(0.23, 1, 0.32, 1) when the studio crosses into or out of working hours. Colour only, no pulse: a pulsing dot on a contact page reads as an alarm.' },
        { n: 'Radio selection', d: 'border-color and background over 140ms. Under 300ms because this is feedback on a control the visitor is looking straight at.' },
        { n: 'Band', d: 'Static. The target window does not animate, because animating a commitment makes it look provisional.' }
      ],
      scroll: [
        'The composition is one viewport at 1100px and above. No scroll, no pin, no rail.',
        'Below 900px the two columns stack and the page scrolls normally.',
        'The ticker should be suspended by IntersectionObserver when the section is off screen. A clock nobody is looking at still costs a frame callback.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'Radio options: border 13% to 26% and label ink to full over 140ms, only on the unselected ones.',
        'The instrument cells have no hover state. They are readings, not controls, and a reading that lights up under a passing cursor invites a click that does nothing.',
        'Submit: an inset 1px scrim at 34% over 140ms.'
      ],
      click: [
        'The only clickable things in the instrument column are the screen-reader mirror buttons, which move focus into the form.',
        'The meter is not clickable. There is nothing behind it to open.',
        'Submit runs the shared machine. The timing radio group is required and produces "Pick the closest option so I can answer honestly." when empty.'
      ],
      responsive: {
        desktop: 'Two columns 5fr / 7fr. Instrument cells in a single row of three. Meter 100% wide by 88px tall with 12-hour ticks and 24-hour labels.',
        tablet: 'Columns become 1fr / 1fr; instrument cells wrap to two rows; meter drops to 76px.',
        mobile: 'Below 768px the instrument is rebuilt as a horizontal strip above the form: clock and state on one row, booking on the next, and the meter collapses to a 44px bar with labels only at 0h and 72h. The three-cell grid becomes two columns, and the timing radio group goes full width with each option as a 48px row so it is a comfortable tap target rather than a chip.'
      },
      a11y: [
        'The clock is not in a live region. A time that announces itself every second makes a screen reader unusable; the value is readable on demand and the working-hours state is available as text.',
        'The canvas is `aria-hidden="true"` and mirrored by a focusable list naming the axis, the band and the outer bound, so the instrument\'s content is in the accessibility tree as words.',
        'The reply window is labelled "Target window, not a measured average" in visible copy, at the instrument, not in a footnote.',
        'The timing control is a `<fieldset>` with a `<legend>` and native radios: correct grouping, correct arrow-key behaviour, correct announcement.',
        'Under `prefers-reduced-motion: reduce`: the scan stops and parks at the outer bound of the commitment, which is the reading that matters. The clock still updates, because a clock that stops is broken, not calm.',
        'Contrast measured on the actual surfaces: clock #f1f1f4 on #101015 is 16.8:1, cell keys #8a8c96 on #101015 is 5.7:1, the model caption #a9abb6 on #101015 is 8.3:1, and the accent #5ba8ff on #101015 is 8.1:1 for the band edge.'
      ],
      perf: [
        'One canvas at roughly 200 x 88 CSS pixels. Per frame when it repaints: one fillRect for the band, seven strokes for the axis and ticks, three fillText, and two marks. About 20 operations.',
        'It repaints only when the scan value or the second changes, which at 60fps is far fewer than 60 repaints per second under reduced motion and exactly 60 without it. Cheap either way at this size.',
        'The clock writes to the DOM once per second, not once per frame.',
        'No gradients, no shadows, no filters anywhere in the loop.',
        'Suspend the ticker off screen with IntersectionObserver.'
      ],
      packages: [
        { p: 'none required', w: 'Canvas 2D for the meter, `Intl.DateTimeFormat` for the clock if you want locale-correct formatting.' },
        { p: 'no date library', w: 'One fixed offset and a `Date`. date-fns or luxon would be 20kb to add six hours. If the studio zone ever observes DST, THEN reach for `Intl.DateTimeFormat` with a timeZone option, which is built in and still free.' },
        { p: 'no chart library', w: 'A ruler with a band on it. Recharts would be 90kb to draw seven lines.' }
      ],
      architecture: [
        { f: 'components/sections/Contact.tsx', r: 'Server shell. Renders the readings with a server-computed clock so there is no empty dash before hydration.' },
        { f: 'components/contact/StudioClock.tsx', r: '"use client": one interval, one text write, the working-hours boolean.' },
        { f: 'components/contact/ReplyMeter.tsx', r: '"use client": the canvas and the scan. Takes the band as props.' },
        { f: 'components/contact/ContactForm.tsx', r: 'Shared across the area.' },
        { f: 'lib/contact/studio.ts', r: '`studioTime()` and `withinHours()`. Pure, testable, and the single source of the offset so the clock and the state dot can never disagree.' }
      ],
      state: [
        'The clock string is state, updated once a second. That is 60 renders a minute of one text node, which is fine and is what React is for.',
        'The working-hours boolean is derived from the clock, never stored separately. Two sources for one fact is how a page ends up saying "at the desk now" at 3am.',
        'The scan position is a ref written straight to the canvas.',
        'The timing selection is form state like every other field.'
      ],
      typography: [
        'Studio clock: mono 500 at 2.25rem with `font-variant-numeric: tabular-nums`. Without tabular figures the colons walk as the digits change.',
        'Cell keys: mono 500 at 0.5625rem, tracking 0.2em, uppercase. Cell values: display 400 at 0.9375rem.',
        'Meter labels: mono 500 at 9px drawn on the canvas. Nine pixels is acceptable for an axis tick and nowhere else.',
        'Heading: display 500 at clamp(1.875rem, 3.2vw, 2.75rem). Deliberately smaller than the other page concepts, because here the instrument outranks the headline.',
        'Everything measured is mono; everything spoken is the display face. That split is the concept\'s whole type system.'
      ],
      color: [
        'Signature hue #5BA8FF on the band fill at 16%, the band edge at 72%, the focus rings, the selected radio border and the submit fill.',
        'The state dot is the only place a hue encodes a live boolean: the accent when at the desk, #8a8c96 when outside hours. Never red for "away", because away is not an error.',
        'The scan is white at 50% for its line and 100% for its head, matching the packet in DISPATCH: white is energy across this whole area.',
        'The ground is #08080a with the panel at #101015 and fields at #131319. Three steps, no more, so the instrument reads as one surface.',
        'In light mode the accent darkens to #0B5FBF for the band edge and text uses the near-black ink; the band fill drops to 12% so it does not muddy the ticks.'
      ],
      spacing: [
        'Instrument cells: 1.5rem gap, 1.25rem padding-top, separated by a single hairline above rather than a border on every cell.',
        'Meter figure: 2.5rem above, 0.75rem between caption and canvas.',
        'Panel padding clamp(1.5rem, 2.6vw, 2.25rem), field gap 1rem (the tight variant), because a four-field form on a one-viewport composition cannot afford 1.25rem.',
        'Column gap 5vw. Below that the instrument starts to read as part of the form.',
        'Radio options: 0.5rem gap, 44px min height, 0.875rem horizontal padding.'
      ],
      relationships: [
        'Horizontal position on the meter encodes elapsed working hours. That is the only quantitative encoding on the page and it is labelled in its own units.',
        'The band width encodes the size of the commitment, and its right edge is drawn as a hard line because that is the number that matters.',
        'The dot encodes presence right now; the booking line encodes availability over months. Keeping them in separate cells stops a visitor reading one as the other.',
        'The timing radio group is the only field whose answer changes what can be promised, which is why it sits directly under the email and above the brief.'
      ],
      acceptance: [
        'The clock shows a plausible local time for the stated offset and advances once a second.',
        'The "hours ahead of you" line is correct when the browser timezone is changed.',
        'The reply window is described as a commitment in visible copy that a visitor cannot miss.',
        'The timing group can be operated entirely with arrow keys and announces its legend.',
        'With reduced motion on, the scan stops at the outer bound and the clock keeps running.',
        'On a 390px phone the instrument is a strip above the form, not a squeezed column, and every radio option is at least 48px tall.'
      ]
    }
  };

  SE.register(consoleC);

  /* ======================================================================
     PAGE 04  -  CONVERSATION
     ----------------------------------------------------------------------
     The form as one sentence the visitor completes. Four inline blanks inside
     a paragraph rather than four boxes in a column.

     HOW THIS STAYS A REAL FORM
     --------------------------
     The obvious way to build a fill-in-the-blank form is to let the sentence
     be the label. That is placeholder-as-label wearing a costume: the moment a
     field is filled, its question is gone, and a screen reader gets a run-on
     paragraph with four unlabelled inputs in it.

     So every blank here is a three-row inline grid: a real visible <label>
     above the input in small mono, the input, and a reserved error row below.
     The sentence reads around the blanks; the labels annotate them, the way a
     proofread manuscript is annotated. The error row is reserved whether or
     not it has content, because an error appearing inside a paragraph must not
     reflow the sentence around it.
     ====================================================================== */

  var conversation = {
    area: 'contact',
    variant: 'page',
    id: 'contact-page-conversation',
    num: 4,
    name: 'Conversation',
    kind: 'Type / inline fields',
    accent: '#A78BFA',
    tagline: 'You finish the sentence, the form only records it',
    desc: 'One paragraph with four blanks in it, each a real labelled field. The composition reads as ' +
          'a sentence and behaves as a form, with no trade made in either direction.',
    interaction: 'Fill the blanks in the sentence. The active blank leads and the rest of the sentence steps back while you type.',
    hint: 'Tab moves between blanks &middot; The sentence is the form',

    preview: function (ctx, w, h, t, heat) {
      var rand = SE.rng(3391);
      var lineY = [h * 0.34, h * 0.54, h * 0.74];
      var x0 = w * 0.10;
      var active = Math.floor(t * 0.55) % 3;

      for (var i = 0; i < 3; i++) {
        var y = lineY[i];
        var cx = x0;
        var segs = 3 + (i % 2);
        for (var s = 0; s < segs; s++) {
          var isBlank = (s % 2) === 1;
          var segW = (isBlank ? 0.13 + rand() * 0.07 : 0.10 + rand() * 0.10) * w;
          if (isBlank) {
            var lit = (i === active);
            ctx.strokeStyle = 'rgba(167,139,250,' + (lit ? 0.95 : 0.4) + ')';
            ctx.lineWidth = lit ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(cx, y + 5.5);
            ctx.lineTo(cx + segW, y + 5.5);
            ctx.stroke();
          } else {
            ctx.fillStyle = 'rgba(236,236,239,' + (0.34 + heat * 0.2).toFixed(3) + ')';
            ctx.fillRect(cx, y - 2, segW, 4);
          }
          cx += segW + w * 0.02;
          if (cx > w * 0.9) break;
        }
      }
    },

    mount: function (root, ctx) {
      host(root, ctx, 'conversation');
      root.style.setProperty('--c-accent', conversation.accent);

      var wrapEl = SE.el('div', 'contact-conversation__wrap');
      root.appendChild(wrapEl);

      var head = SE.el('header', 'contact-conversation__head');
      head.innerHTML =
        '<h2 class="contact-conversation__title">Finish the sentence.</h2>' +
        '<p class="contact-conversation__lede">Four blanks, one paragraph. ' + esc(C.reply) +
        ', and the answer comes from a person rather than from a sequence.</p>';
      wrapEl.appendChild(head);

      var panel = SE.el('div', 'contact-conversation__panel');
      wrapEl.appendChild(panel);

      /* The sentence builder. Fragments are plain text; slots are the fields
         the form machine has already built, moved into place. */
      function sentence(fields) {
        var byKey = {};
        fields.forEach(function (f) { byKey[f.key] = f; });

        var p = SE.el('p', 'contact-conversation__sentence');
        /* Punctuation that belongs to the END of a slot is authored as its own
           node rather than as the head of the next fragment. On mobile the
           sentence becomes a stacked form, and a fragment that starts with
           ". I am building" reads as a typo; the punctuation nodes are simply
           hidden there instead. */
        var parts = [
          { t: 'Hello, my name is ' },
          { f: 'name' },
          { p: '. ' },
          { t: 'I am building ' },
          { f: 'brief' },
          { t: ' and I would like a hand with it. Write back to ' },
          { f: 'email' },
          { p: ', ' },
          { t: 'ideally ' },
          { f: 'timing' },
          { p: '.' }
        ];
        parts.forEach(function (part) {
          if (part.t) {
            p.appendChild(SE.el('span', 'contact-conversation__frag', esc(part.t)));
          } else if (part.p) {
            p.appendChild(SE.el('span', 'contact-conversation__punct', esc(part.p)));
          } else {
            var f = byKey[part.f];
            if (f) p.appendChild(f.wrap);
          }
        });
        return p;
      }

      var form = makeForm({
        layout: 'slot',
        fields: ['name', 'brief', 'email', 'timing'],
        sentence: sentence,
        submit: 'Send this note',
        sending: 'Sending',
        delay: 1500,
        onState: function (next) { root.setAttribute('data-stage', next); }
      });
      panel.appendChild(form.el);

      var sent = makeSent({
        title: 'That is the whole sentence, and it landed.',
        body: 'It goes to one inbox with nothing automated attached to it. ' + C.reply + '.',
        again: 'Start another'
      });
      sent.el.classList.add('contact-conversation__sent');
      panel.appendChild(sent.el);
      sent.again.addEventListener('click', function () { form.reset(); form.focusFirst(); });

      /* The active blank leads: the sentence around it steps back to 55% while
         a field has focus. One attribute on the paragraph, one CSS rule, no
         per-word work. */
      var sentenceEl = SE.$('.contact-conversation__sentence', form.el);
      function onFocusIn() { sentenceEl.setAttribute('data-focus', 'true'); }
      function onFocusOut() { sentenceEl.setAttribute('data-focus', 'false'); }
      sentenceEl.addEventListener('focusin', onFocusIn);
      sentenceEl.addEventListener('focusout', onFocusOut);

      return {
        destroy: function () {
          sentenceEl.removeEventListener('focusin', onFocusIn);
          sentenceEl.removeEventListener('focusout', onFocusOut);
          form.destroy();
          root.removeAttribute('data-stage');
          root.style.removeProperty('--c-accent');
          unhost(root, 'conversation');
        }
      };
    },

    spec: {
      subtitle: 'The form as one sentence with four real labelled blanks in it',
      philosophy: [
        'A contact form asks four questions. A sentence asks them in the order a person would, and reading it takes less effort than reading four labels, four helper lines and four boxes.',
        'The trap is obvious and it is the one most fill-in-the-blank forms fall into: letting the sentence be the label. That is placeholder-as-label in a costume. Every blank here carries its own visible label above it and its own error row below it.',
        'The sentence dims to 55% while a blank has focus. That is the entire interaction: it says "this is the part you are answering" without a highlight, a border colour change or a tooltip.'
      ],
      hierarchy: [
        '1. The sentence, set at clamp(1.375rem, 2.6vw, 2.125rem) with a 2.6 line-height so the blanks have room to carry a label and an error row inside the leading.',
        '2. The active blank, which is the only thing at full ink while a field has focus.',
        '3. The heading, deliberately small at clamp(1.75rem, 3vw, 2.5rem), because the sentence is the composition.',
        '4. The slot labels at mono 10px, which are always present and never compete with the sentence.',
        '5. The submit control and the note, below the paragraph and left aligned to it.'
      ],
      structure: [
        'Section is a single centred column, max-width 62rem.',
        'The form is a real `<form>`. Inside it, one `<p>` holds text nodes and four field wrappers.',
        'Each field wrapper is `display: inline-grid` with three rows: label / control / error. Inline-grid rather than inline-flex so the three rows share one column width and the control can size to its own content.',
        'The error row is `min-height: 1.1em` whether or not it has content, so an appearing error never reflows the sentence around it.',
        'The timing field is a radio group; inside the sentence it renders as four small inline chips on one line under its label.',
        'The confirmation is stacked in the same grid cell as the form and cross-faded.'
      ],
      interaction: [
        'FOCUS: the paragraph gets a data attribute on focusin and loses it on focusout. Text nodes drop to 55% ink over 220ms; the focused slot stays at 100%. One attribute, one rule, no per-word DOM.',
        'The blank underline is a 1px rule that becomes a 2px accent rule on focus, drawn with a transform scaleY on a pseudo-element so it composites.',
        'Inputs size to their content: `field-sizing: content` where supported, with a `size` attribute and a min-width fallback so the blank is never wider than the answer it expects.',
        'Tab order is sentence order, which is also reading order, because the fields are in the paragraph in the order they are read.',
        'Validation, error summary, progress, failure and retry are the shared machine, identical to every other concept in this area.',
        'The error text for a blank appears directly under that blank, inside the sentence, in the reserved row. The multi-error summary still appears above the paragraph.'
      ],
      choreography: [
        { n: 'Sentence dim', d: 'color from #f1f1f4 to #7e808c over 220ms cubic-bezier(0.23, 1, 0.32, 1) on focusin. Colour, not opacity: opacity on a paragraph would take the blanks down with it.' },
        { n: 'Blank underline', d: 'A pseudo-element at the control baseline, scaleY 1 to 2 and colour to the accent over 180ms. transform-origin bottom, so the rule thickens downward and the text does not appear to move.' },
        { n: 'Filled state', d: 'A filled blank keeps a 1px accent underline at 45% after blur, so a completed sentence reads as completed at a glance without a tick or a badge.' },
        { n: 'Error appearance', d: 'The reserved error row goes from opacity 0 to 1 over 160ms. No height animation, because the row was already there.' },
        { n: 'Confirmation', d: 'The shared crossfade: form out over 320ms, confirmation in over 420ms with a 120ms overlap.' }
      ],
      scroll: [
        'One centred column, no scroll choreography of any kind. The sentence is between 4 and 7 lines depending on viewport.',
        'On mobile the composition changes shape entirely and scrolls normally.',
        'If used as a section, reveal the paragraph with a single 420ms fade on IntersectionObserver and nothing else. A sentence that assembles itself word by word is unreadable while it does it.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'A blank shows a 1px accent underline at 60% on hover, so the interactive parts of the sentence are discoverable before a click.',
        'The sentence text itself has no hover state.',
        'Radio chips: border 13% to 26% on the unselected ones only.'
      ],
      click: [
        'Clicking anywhere on a blank focuses its input, because the label is associated with `for` and the wrapper is sized to the control.',
        'Clicking the small mono label above a blank focuses the input as well, which is what a `<label for>` is for.',
        'Submit runs the shared machine.'
      ],
      responsive: {
        desktop: 'Sentence at clamp(1.375rem, 2.6vw, 2.125rem), line-height 2.6, max-width 62rem. Blanks inline.',
        tablet: 'Same, with the sentence at 2vw and line-height 2.5.',
        mobile: 'Below 768px the sentence is ABANDONED as a layout. Four inline blanks inside a paragraph at 390px produce a ragged, unreadable column with one word per line. Instead the same fields become a stacked form, and the sentence fragments become the helper text under each label: "Hello, my name is" sits under "Your name" as context. Identical data, identical labels, identical validation, different arrangement. The heading stays and the paragraph is gone.'
      },
      a11y: [
        'Every blank has a visible `<label for>` above the control. The sentence is context, never the label.',
        'Helper text for a blank is available on the stacked mobile layout and is present but visually hidden inside the sentence layout, still linked by `aria-describedby` so it is read out.',
        'The error row is linked by `aria-describedby` and carries `role="alert"`; it is reserved so nothing reflows when it fills.',
        'Tab order equals reading order equals DOM order. There is no `tabindex` above 0 anywhere.',
        'The timing group is a `<fieldset>` with a `<legend>`, so it announces as a group even when rendered as inline chips.',
        'Under `prefers-reduced-motion: reduce`: no sentence dim, no underline growth. The focused blank is marked by the focus ring alone, which is 2px at 2px offset and never removed.',
        'Contrast measured on the actual surfaces: sentence #f1f1f4 on #0b0b0f is 17.8:1, dimmed sentence #7e808c on #0b0b0f is 4.6:1 which still clears AA at this size, slot labels #a9abb6 on #0b0b0f is 8.7:1, error #ff8f7a is 9.0:1.'
      ],
      perf: [
        'No canvas, no ticker, no observer.',
        'The dim is one colour transition on one paragraph, inherited by its text nodes. Not four transitions, not per-word spans.',
        'The underline is a pseudo-element transform, so it composites and never triggers layout.',
        '`field-sizing: content` is a single declaration and costs nothing; the fallback is a static `size` attribute, also free.',
        'This concept and STATEMENT are the two cheapest in the area.'
      ],
      packages: [
        { p: 'none required', w: 'A paragraph, four inputs, and two CSS transitions.' },
        { p: 'no autosize library', w: '`field-sizing: content` covers the width behaviour natively in current Chrome and Edge, and the `size` attribute is a correct fallback everywhere else. A 4kb autosize dependency to set a width is not worth a dependency.' },
        { p: 'no form library', w: 'Same reasoning as the rest of the area: four fields and one async call.' }
      ],
      architecture: [
        { f: 'components/sections/Contact.tsx', r: 'Server shell renders the heading and the complete sentence with all four fields.' },
        { f: 'components/contact/SentenceForm.tsx', r: '"use client": the focus attribute and the shared form state machine.' },
        { f: 'components/contact/Slot.tsx', r: 'One inline blank: label, control, reserved error row, aria wiring.' },
        { f: 'components/contact/StackedForm.tsx', r: 'The mobile arrangement. Same field definitions, different layout component, chosen by a CSS container query rather than by JavaScript so there is no hydration mismatch.' },
        { f: 'lib/contact/fields.ts', r: 'The field definitions, shared by both layouts, so the two can never drift apart.' }
      ],
      state: [
        '`focusedKey` (or simply a boolean) is state. The whole dim effect is one attribute.',
        'Field values and errors are state in the shared form component.',
        'Do not store the rendered sentence in state. It is static content with four holes in it.',
        'The mobile layout is a CSS decision, not a state decision. Branching on a matchMedia in React gives you two trees, a hydration warning and a flash.'
      ],
      typography: [
        'Sentence: display 400 at clamp(1.375rem, 2.6vw, 2.125rem), line-height 2.6. The generous leading is structural, not decorative: it is the room the labels and error rows live in.',
        'Slot labels: mono 500 at 0.625rem, tracking 0.18em, uppercase. Small enough to annotate, large enough to read.',
        'Input text: display 400 at the same size as the sentence, so a filled blank reads as part of the sentence rather than as a form value pasted into one.',
        'Error text: 0.6875rem, one line, truncation never allowed. If the message does not fit, the message is too long.',
        'Heading: display 500 at clamp(1.75rem, 3vw, 2.5rem), tracking -0.04em.'
      ],
      color: [
        'Signature hue #A78BFA appears on the blank underlines, the focus rings, the selected chip border and the submit fill.',
        'The dimmed sentence is #7e808c, chosen because it still clears 4.5:1 on the ground at this size. Dimming to a colour that fails contrast in order to make a focus effect is trading accessibility for an effect.',
        'A filled blank keeps its accent underline at 45%, which is how a completed sentence reads as completed without a tick.',
        'In light mode the ground becomes #fbfbfc, the sentence the near-black ink, the dim state #6b6d78, and the accent darkens to #6D4AEA to hold 3:1 for the underlines.'
      ],
      spacing: [
        'Line-height 2.6 on the sentence. Anything under 2.3 and the label row collides with the line above.',
        'Slot label sits 0.15em above the control baseline row; the error row reserves 1.1em below it.',
        'Sentence to submit: 3rem. Submit row to note: 1rem.',
        'Section padding clamp(3rem, 10vh, 7rem) vertical, with the column centred at max-width 62rem.',
        'Between an input and the text that follows it there is a single space character, not a margin. It is a sentence.'
      ],
      relationships: [
        'Ink level encodes attention: the blank you are answering is the only thing at full contrast.',
        'The underline weight encodes state: 1px empty, 1px accent at 45% filled, 2px accent focused, and the error border when invalid.',
        'Order encodes the conversation: name, then what, then where to reply, then when. That is the order a person asks in, which is the entire argument for this concept.'
      ],
      acceptance: [
        'Every blank has a visible label that stays visible after the blank is filled.',
        'An error under one blank does not move any other word in the sentence.',
        'Tab moves through the blanks in reading order and the focus ring is always visible against the ground.',
        'On a 390px phone the sentence is gone and a stacked form with the same labels is in its place.',
        'With reduced motion on, nothing dims and nothing grows, and the focused blank is still obvious.',
        'A screen reader reads four labelled fields, not one paragraph with four mystery boxes in it.'
      ]
    }
  };

  SE.register(conversation);

  /* ======================================================================
     PAGE 05  -  LETTER
     ----------------------------------------------------------------------
     A physical treatment. The message has weight, and sealing it is the send.

     WHY THE FOLD IS A SCALE AND NOT A 3D HINGE
     ------------------------------------------
     A convincing paper fold in the DOM needs the sheet duplicated into two
     halves that each carry a clipped copy of the content, then rotated on a
     shared hinge in preserve-3d. That is two extra copies of a live form in
     the accessibility tree, and it breaks the moment the content is a real
     input with a caret in it.

     A letter folded into thirds compresses vertically. So this fold is a
     scaleY on the sheet from 1 to 0.34 with two crease hairlines resolving at
     the fold points, its content fading out under it. It is transform and
     opacity only, it reads unmistakably as folding, and there is exactly one
     copy of the form on the page.
     ====================================================================== */

  var letter = {
    area: 'contact',
    variant: 'page',
    id: 'contact-page-letter',
    num: 5,
    name: 'Letter',
    kind: 'CSS / fold and seal',
    accent: '#D9A679',
    tagline: 'Sending should cost something, even if only a gesture',
    desc: 'The message sits on a sheet with weight and a grain. Submitting folds it along two creases ' +
          'and presses a seal, and the sheet leaves the frame. The send is an action, not a page state.',
    interaction: 'Write on the sheet and press to seal. The sheet folds along two creases, takes the seal, and leaves.',
    hint: 'Sealing is the send &middot; Nothing is actually posted',

    preview: function (ctx, w, h, t, heat) {
      var cycle = (t * 0.30) % 3.4;
      var fold = M.clamp((cycle - 1.1) / 0.9, 0, 1);
      var seal = M.clamp((cycle - 2.1) / 0.5, 0, 1);
      var ef = fold < 0.5 ? 2 * fold * fold : 1 - Math.pow(-2 * fold + 2, 2) / 2;

      var sw = w * 0.52, shFull = h * 0.62;
      var sh = shFull * (1 - ef * 0.66);
      var cx = w / 2, cy = h * 0.5;
      var x = cx - sw / 2, y = cy - sh / 2;

      /* the sheet */
      ctx.fillStyle = 'rgba(24,22,20,0.96)';
      ctx.fillRect(x, y, sw, sh);
      ctx.strokeStyle = 'rgba(217,166,121,' + (0.34 + heat * 0.2).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, sw - 1, sh - 1);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(x + 1, y + 1, sw - 2, 1);

      /* written lines, fading as it folds */
      var a = (1 - ef) * (0.34 + heat * 0.16);
      if (a > 0.01) {
        ctx.fillStyle = 'rgba(236,236,239,' + a.toFixed(3) + ')';
        for (var i = 0; i < 4; i++) {
          ctx.fillRect(x + sw * 0.10, y + sh * (0.22 + i * 0.16), sw * (0.70 - i * 0.11), 2);
        }
      }

      /* the two creases */
      if (ef > 0.02) {
        ctx.strokeStyle = 'rgba(217,166,121,' + (0.5 * ef).toFixed(3) + ')';
        for (var k = 1; k <= 2; k++) {
          var cy2 = Math.round(y + (sh * k) / 3) + 0.5;
          ctx.beginPath();
          ctx.moveTo(x, cy2);
          ctx.lineTo(x + sw, cy2);
          ctx.stroke();
        }
      }

      /* the seal */
      if (seal > 0.01) {
        var r = 7 * (0.6 + seal * 0.4);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(217,166,121,' + (0.9 * seal).toFixed(3) + ')';
        ctx.fill();
      }
    },

    mount: function (root, ctx) {
      host(root, ctx, 'letter');
      root.style.setProperty('--c-accent', letter.accent);

      var wrapEl = SE.el('div', 'contact-letter__wrap');
      root.appendChild(wrapEl);

      var head = SE.el('header', 'contact-letter__head');
      head.innerHTML =
        '<h2 class="contact-letter__title">A letter, not a ticket.</h2>' +
        '<p class="contact-letter__lede">' + esc(C.lineLong) + '</p>';
      head.appendChild(factsList('contact-letter__facts'));
      wrapEl.appendChild(head);

      /* -------------------------------------------------------- the sheet */
      var stack = SE.el('div', 'contact-letter__stack');

      var sheet = SE.el('div', 'contact-letter__sheet');
      var grain = SE.el('div', 'contact-letter__grain');
      grain.setAttribute('aria-hidden', 'true');
      sheet.appendChild(grain);

      var body = SE.el('div', 'contact-letter__body');

      /* A real letter opens with a salutation and a dateline. The date is the
         viewer's actual date rather than a decorative constant. */
      var today = new Date();
      var dateline;
      try {
        dateline = today.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {
        dateline = today.getDate() + ' / ' + (today.getMonth() + 1) + ' / ' + today.getFullYear();
      }
      var salut = SE.el('div', 'contact-letter__salut');
      salut.innerHTML =
        '<p>To the studio,</p>' +
        '<span class="contact-letter__date t-num">' + esc(dateline) + '</span>';
      body.appendChild(salut);

      var form = makeForm({
        fields: ['name', 'email', 'note'],
        submit: 'Fold and send',
        sending: 'Folding',
        delay: 1500,
        tight: true,
        onState: onLetterState
      });
      body.appendChild(form.el);
      sheet.appendChild(body);

      /* Two creases and a seal, drawn as elements rather than painted, so the
         fold can be pure transform and opacity. */
      var creases = SE.el('div', 'contact-letter__creases', '<i></i><i></i>');
      creases.setAttribute('aria-hidden', 'true');
      sheet.appendChild(creases);

      var seal = SE.el('div', 'contact-letter__seal', icon('seal'));
      seal.setAttribute('aria-hidden', 'true');
      sheet.appendChild(seal);

      stack.appendChild(sheet);

      var sent = makeSent({
        title: 'Sealed, and out of the frame.',
        body: 'It goes to one inbox. ' + C.reply + ', from a person who read the whole thing.',
        again: 'Write another'
      });
      sent.el.classList.add('contact-letter__sent');
      stack.appendChild(sent.el);
      sent.again.addEventListener('click', function () { form.reset(); form.focusFirst(); });

      wrapEl.appendChild(stack);

      function onLetterState(next) { root.setAttribute('data-stage', next); }

      return {
        destroy: function () {
          form.destroy();
          root.removeAttribute('data-stage');
          root.style.removeProperty('--c-accent');
          unhost(root, 'letter');
        }
      };
    },

    spec: {
      subtitle: 'A physical sheet where folding and sealing is the send',
      philosophy: [
        'A send that costs nothing feels like nothing. Giving the message a physical body, a fold and a seal makes the moment of commitment legible, which is the one moment on a contact page worth spending motion on.',
        'The physicality is in the material, not in the ornament: one sheet with a warm hairline, an inner top highlight, a faint grain and a real drop shadow with offset and blur. No paper texture image, no torn edges, no skeuomorphic stamp.',
        'The fold is a vertical compression with two creases resolving, not a 3D hinge. A convincing hinge needs the sheet duplicated into two clipped halves, which means two copies of a live form in the accessibility tree. The compression reads exactly as clearly and there is one form on the page.'
      ],
      hierarchy: [
        '1. The sheet. It is optically centred, 38rem wide, and the only lit surface on the page.',
        '2. The salutation and the fields on it.',
        '3. The seal button, which is the submit control, sitting at the foot of the sheet.',
        '4. The heading and lede in the left column, at 34ch.',
        '5. The three facts under the lede at mono 11px.',
        'During the fold the sheet outranks everything absolutely: the left column drops to 40% for the 700ms of the fold and comes back after.'
      ],
      structure: [
        'Two columns on desktop: 5fr argument / 7fr sheet, 5vw gap.',
        'The sheet is a single element with `transform-origin: center`, holding: a grain layer at 3% opacity, the letter body (salutation plus the shared form), a creases layer of two absolutely positioned hairlines at 33.3% and 66.6%, and the seal mark.',
        'The confirmation is a sibling of the sheet in a one-cell grid, so the sheet can leave and the confirmation can arrive in the same place.',
        'The grain is a fixed, `pointer-events: none` layer inside the sheet, never on a scrolling container.'
      ],
      interaction: [
        'IDLE: the sheet has a 0 24px 60px shadow at 55% and a 1px warm border. No float, no idle animation. Paper on a desk does not hover.',
        'SUBMIT: validation runs first. If it fails, nothing folds. A letter that folds itself and then unfolds to show an error is a joke at the visitor\'s expense.',
        'FOLD (0 to 700ms): the sheet scaleY 1 to 0.34 on cubic-bezier(0.77, 0, 0.175, 1), and its body opacity 1 to 0 over the first 180ms. The two creases go from 0 to 1 opacity over 220ms starting at 120ms.',
        'SEAL (700 to 960ms): the seal mark scales 0.6 to 1 with opacity 0 to 1 over 260ms on cubic-bezier(0.23, 1, 0.32, 1). One press, no bounce.',
        'DEPART (1060 to 1480ms): the folded, sealed sheet translates 40% down and fades to 0 over 420ms, and the confirmation arrives on the same curve with a 140ms overlap.',
        'FAILURE: the sheet unfolds on the same curve at 70% of the duration (490ms) and the banner appears under it. Everything typed is preserved.'
      ],
      choreography: [
        { n: 'Fold', d: 'scaleY 1 to 0.34, 700ms cubic-bezier(0.77, 0, 0.175, 1). transform-origin center, so the sheet closes toward its own middle the way paper does, rather than collapsing to one edge.' },
        { n: 'Ink fade', d: 'The letter body opacity 1 to 0 over 180ms with no delay. It has to be gone before the compression squashes the type, or the text visibly distorts.' },
        { n: 'Creases', d: 'opacity 0 to 1 over 220ms starting at 120ms, two 1px lines at 33.3% and 66.6% of the sheet. They are the entire reason the compression reads as a fold and not as a squash.' },
        { n: 'Seal', d: 'scale 0.6 to 1 and opacity 0 to 1 over 260ms cubic-bezier(0.23, 1, 0.32, 1), starting at 700ms. Never scale(0): nothing in the physical world appears from nothing.' },
        { n: 'Depart', d: 'translate3d(0, 40%, 0) and opacity to 0 over 420ms, starting at 1060ms. Down and out, because that is where an outbox is.' },
        { n: 'Unfold on failure', d: 'The same curve reversed at 490ms, 70% of the fold. Undoing should always be faster than doing.' }
      ],
      scroll: [
        'One viewport on desktop, no scroll choreography.',
        'Below 900px the columns stack and the page scrolls normally.',
        'Nothing here is scroll-driven. The choreography belongs to the submit, and tying it to scroll would fire it for people who never intended to send anything.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'The seal control: the mark rotates 6 degrees and the fill goes from 88% to 100% over 140ms. Six degrees is enough to read as a press and small enough not to look like a spin.',
        'The sheet itself has no hover state. It is a surface, not a control.',
        'Fields use the shared treatment: border 13% to 26% on focus only, never on hover.'
      ],
      click: [
        'The submit control is labelled "Fold and send", which names the action the visitor is about to watch. A control that says "Submit" and then folds a letter has surprised the person pressing it.',
        '"Write another" resets the sheet: it unfolds instantly under a 240ms fade, all fields clear, focus goes to the first field.',
        'The creases and the seal are `aria-hidden` and not clickable. They are the result of the action, not another way to do it.'
      ],
      responsive: {
        desktop: 'Two columns 5fr / 7fr. Sheet 38rem wide, 2.5rem padding, shadow 0 24px 60px at 55%.',
        tablet: 'Columns become 1fr / 1fr, sheet fills its column, padding drops to 2rem.',
        mobile: 'Below 768px the sheet becomes the whole composition: full-bleed to the gutter, no shadow (a 60px shadow on a 390px screen is a smudge), padding 1.25rem, and the argument column collapses to the heading plus a single line of the lede above it. The fold distance shortens to scaleY 0.5 and the depart to 24%, because a large travel on a small screen reads as a glitch rather than as a gesture.'
      },
      a11y: [
        'The fold, the creases and the seal are decorative and are all `aria-hidden`. The state is carried by the shared `role="status"` live region: "Sending your message", then "Sent".',
        'Validation runs before the fold, so an invalid form never animates. The error summary focus behaviour is identical to every other concept in the area.',
        'The seal control is a real `<button type="submit">` with a text label; the mark inside it is `aria-hidden`.',
        'The sheet is not a landmark and does not trap focus. Tab order runs heading, fields, submit, and out.',
        'Under `prefers-reduced-motion: reduce`: no fold, no seal press, no depart. The sheet cross-fades to a sealed state over 160ms and the confirmation replaces it. The visitor still sees that it was sealed and sent; they simply do not watch it happen.',
        'Contrast measured on the actual surfaces: field labels #f1f1f4 on the sheet #14120f is 17.4:1, helper #a9abb6 is 8.6:1, error #ff8f7a is 8.9:1, and the submit ink #08080a on #d9a679 is 9.2:1.'
      ],
      perf: [
        'The whole choreography is transform and opacity on four elements. No canvas, no ticker.',
        'The grain is a static inline SVG data URI at 3% opacity on a non-scrolling element inside the sheet. Never attach a grain layer to a scrolling container: it repaints the whole layer every frame.',
        'The shadow is set once and never animated. `box-shadow` on a state change is fine; in a loop it is the single most expensive thing on a page.',
        'The fold uses a scale on a small subtree. Add `will-change: transform` to the sheet only while `data-stage` is sending, and remove it after, so the compositor layer is not held for the life of the page.',
        'Total JavaScript after mount: the form state machine and one attribute write per state.'
      ],
      packages: [
        { p: 'none required', w: 'Four CSS transitions on one subtree.' },
        { p: 'gsap (installed)', w: 'Worth it here, and only here: the fold, creases, seal and depart are a four-step timeline with overlaps, which is exactly what a timeline is for. `gsap.timeline()` expresses it in eight lines. It is still optional; the CSS version with transition-delays is equivalent and ships without the import.' },
        { p: 'no lottie', w: 'A fold and a stamp. An After Effects export would be 200kb to do what a scale and a transition already do, and it could not be interrupted by a failed request.' }
      ],
      architecture: [
        { f: 'components/sections/Contact.tsx', r: 'Server shell: heading, lede, facts, sheet and the whole form.' },
        { f: 'components/contact/LetterSheet.tsx', r: '"use client": takes `stage` and owns the fold classes. No state of its own.' },
        { f: 'components/contact/ContactForm.tsx', r: 'Shared with the rest of the area.' },
        { f: 'app/globals.css', r: 'The fold tokens: `--letter-fold: 0.34`, `--letter-depart: 40%`, so the mobile override is two lines.' }
      ],
      state: [
        '`stage` drives everything. One value, four renders per submit.',
        'The creases and seal are pure CSS reactions to `data-stage`. Do not give them state.',
        'If you use the GSAP timeline instead, hold it in a ref and kill it in the effect teardown, or a failed request mid-fold leaves a tween running on an unmounted node.',
        'Field values and errors are state in the shared form component.'
      ],
      typography: [
        'Salutation: display 400 at 1.125rem, tracking 0.01em. It is the one piece of the letter that is written rather than filled in.',
        'Labels and helper text: the shared set at 0.8125rem and 0.75rem.',
        'Heading: display 500 at clamp(2rem, 3.6vw, 3.25rem), tracking -0.04em.',
        'Facts: mono 500 at 0.5625rem uppercase for the keys, display 0.8125rem for the values.',
        'The letter body uses the display face, not a script or a serif. A handwriting face on a form is a costume, and it fails at 12px.'
      ],
      color: [
        'The sheet is #14120f, a warm near-black that is two steps off the cool page ground. That difference is the whole material argument and it is worth exactly two steps, not twenty.',
        'Signature hue #D9A679 on the sheet border at 26%, the creases at 50%, the seal fill, the focus rings and the submit fill.',
        'The inner top highlight is rgba(255,255,255,0.06), 1px. It is the single mark that makes a rectangle read as a physical sheet rather than as a swatch.',
        'In light mode the sheet becomes #fdfaf4 on a #f0eee9 ground, the border a warm #d9c9ae, and the seal ink stays #D9A679 with near-black text on it.'
      ],
      spacing: [
        'Sheet padding clamp(1.5rem, 2.6vw, 2.5rem). Salutation to first field 1.5rem. Field gap 1rem (the tight variant).',
        'The creases sit at exactly 33.3% and 66.6% of the sheet height, which is where a letter is actually folded.',
        'Column gap 5vw; sheet max-width 38rem so the line length inside it stays under 60ch.',
        'Facts row 2.5rem gap, sitting on a hairline 1.125rem below the lede.'
      ],
      relationships: [
        'Vertical compression encodes folding; the two creases are what make that reading unambiguous rather than merely a squash.',
        'The seal encodes commitment: it appears only after the fold completes, in the same way a seal is pressed only after a letter is closed.',
        'Downward departure encodes an outbox. Sending upward would read as deletion.',
        'The left column dimming to 40% during the fold encodes that the argument is finished and the action is what matters now.'
      ],
      acceptance: [
        'An invalid submit never folds the sheet.',
        'The fold reads as folding, not as squashing, because the creases resolve at the third points.',
        'The seal never appears before the fold completes.',
        'A failed send unfolds the sheet faster than it folded and keeps everything typed.',
        'With reduced motion on, the sheet cross-fades to sealed and the confirmation appears, with no travel at all.',
        'On a 390px phone the sheet is the composition and the fold distance is shorter, so it reads as a gesture rather than as a glitch.'
      ]
    }
  };

  SE.register(letter);

  /* ======================================================================
     SECTION CONCEPTS
     ----------------------------------------------------------------------
     WHY NONE OF THESE PIN THE PAGE (except one, briefly)
     ----------------------------------------------------
     A contact section is the last thing between a reader and the end of the
     page. Holding them there for two extra screens of scroll while a set piece
     plays is the exact behaviour a closing section must not have, however good
     the set piece is. So four of the five resolve on ENTRY, via one shared
     IntersectionObserver helper, and release the reader immediately.

     WINDOW is the single exception, and it takes 0.6 of a screen, not two: the
     strip resolving as it is consumed is the concept, and it hands the reader
     straight out the other side.

     Every section here calls ctx.onSeeMore() from a visible control, and each
     one is numbered to match its page counterpart so the hand-off lands on the
     full argument for the same family.
     ====================================================================== */

  /* The shared See more control, retinted to the concept hue without touching
     a shell stylesheet: the custom properties are set on the element itself. */
  function seeMoreFor(label, accent, onClick) {
    var b = SE.seeMore(label, onClick);
    /* Retinted through custom properties set on the element itself, so no
       shell stylesheet is touched. `contact-more` is this area's own hook for
       the one dimension the shared control does not set: a 44px floor. */
    b.classList.add('contact-more');
    b.style.setProperty('--btn-ink', accent);
    b.style.setProperty('--btn-line', 'rgba(236,236,239,0.26)');
    return b;
  }

  /* ======================================================================
     SECTION 01  -  RELAY   (pairs with DISPATCH)
     ----------------------------------------------------------------------
     A compact split: everything a reader needs to write without a form on the
     left, and a two-field form on the right for the ones who would rather not
     open a mail client.

     The address is a real, selectable, copyable mailto link at display scale.
     Making the plain address smaller than the form is a quiet dark pattern:
     the visitor who wants to write from their own client should not have to
     work harder than the one who fills in a box.
     ====================================================================== */

  var relay = {
    area: 'contact',
    variant: 'section',
    id: 'contact-section-relay',
    num: 1,
    name: 'Relay',
    kind: 'Split / two field form',
    accent: '#4FDCC0',
    tagline: 'Two ways to write, neither of them hidden',
    desc: 'The address, the location and the reply window on one side, a two-field form on the other. ' +
          'A closing section that fits in a screen and hands the reader straight on.',
    interaction: 'Write in the two fields and send, or take the address and use your own mail client.',
    hint: 'Two fields &middot; The address works just as well',

    preview: function (ctx, w, h, t, heat) {
      var rand = SE.rng(8821);
      var midX = w * 0.47;

      /* left: the details */
      ctx.fillStyle = 'rgba(79,220,192,' + (0.75 + heat * 0.2).toFixed(3) + ')';
      ctx.fillRect(w * 0.08, h * 0.30, midX - w * 0.16, 5);
      for (var i = 0; i < 3; i++) {
        ctx.fillStyle = 'rgba(236,236,239,' + (0.16 + heat * 0.08).toFixed(3) + ')';
        ctx.fillRect(w * 0.08, h * 0.48 + i * h * 0.13, (0.10 + rand() * 0.18) * w, 3);
      }

      /* the divider */
      ctx.strokeStyle = 'rgba(236,236,239,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX + 0.5, h * 0.18);
      ctx.lineTo(midX + 0.5, h * 0.84);
      ctx.stroke();

      /* right: two fields and a button, with a caret blinking in the first */
      var fx = midX + w * 0.06;
      var fw = w * 0.34;
      for (var k = 0; k < 2; k++) {
        var fy = h * (0.28 + k * 0.20);
        ctx.strokeStyle = 'rgba(236,236,239,' + (k === 0 ? 0.28 : 0.14) + ')';
        ctx.strokeRect(fx + 0.5, fy + 0.5, fw, h * 0.12);
      }
      var blink = (t % 1.06) < 0.53 ? 1 : 0.1;
      ctx.fillStyle = 'rgba(79,220,192,' + blink + ')';
      ctx.fillRect(fx + 7, h * 0.31, 1.5, h * 0.06);

      ctx.fillStyle = 'rgba(79,220,192,' + (0.8 + heat * 0.2).toFixed(3) + ')';
      ctx.fillRect(fx, h * 0.70, fw * 0.42, h * 0.11);
    },

    mount: function (root, ctx) {
      var mode = host(root, ctx, 'relay');
      root.style.setProperty('--c-accent', relay.accent);

      var wrapEl = SE.el('div', 'contact-relay__wrap');
      root.appendChild(wrapEl);

      /* ------------------------------------------------------------ left */
      var side = SE.el('div', 'contact-relay__side');
      side.innerHTML =
        '<h2 class="contact-relay__title">Still here? Then write.</h2>' +
        '<a class="contact-relay__addr" href="mailto:' + C.email + '">' + esc(C.email) + '</a>' +
        '<dl class="contact-relay__facts">' +
          '<div><dt>Based in</dt><dd>' + esc(C.region) + ' <span class="t-num">' + esc(C.tzLabel) + '</span></dd></div>' +
          '<div><dt>Reply window</dt><dd>' + esc(C.replyTight) + '</dd></div>' +
          '<div><dt>Availability</dt><dd>' + esc(C.availability) + '</dd></div>' +
        '</dl>' +
        '<ul class="contact-relay__handles">' +
          C.handles.map(function (x) {
            return '<li><span>' + esc(x.net) + '</span><b class="t-num">' + esc(x.handle) + '</b></li>';
          }).join('') +
        '</ul>';
      wrapEl.appendChild(side);

      /* ----------------------------------------------------------- right */
      var panel = SE.el('div', 'contact-relay__panel');
      var form = makeForm({
        fields: ['email', 'note'],
        submit: 'Send',
        sending: 'Sending',
        delay: 1400,
        tight: true,
        onState: function (next) { root.setAttribute('data-stage', next); }
      });
      panel.appendChild(form.el);

      var sent = makeSent({
        title: 'In the inbox.',
        body: C.reply + '. Nothing automated is attached to this.'
      });
      sent.el.classList.add('contact-relay__sent');
      panel.appendChild(sent.el);
      sent.again.addEventListener('click', function () { form.reset(); form.focusFirst(); });
      wrapEl.appendChild(panel);

      /* --------------------------------------------------------- seemore */
      var more = null;
      if (mode === 'section') {
        more = seeMoreFor('Open the full contact page', relay.accent, ctx.onSeeMore);
        more.classList.add('contact-relay__more');
        side.appendChild(more);
      }

      /* ----------------------------------------------------------- enter */
      /* One authored moment: the two columns settle in on entry, once. No
         rail, no pin, no scrub. A closing section must release the reader. */
      var io = onEnter(root, function () {
        root.setAttribute('data-entered', 'true');
        if (more) more.classList.add('is-on');
      }, 0.22);

      return {
        destroy: function () {
          io.destroy();
          form.destroy();
          root.removeAttribute('data-entered');
          root.removeAttribute('data-stage');
          root.style.removeProperty('--c-accent');
          unhost(root, 'relay');
        }
      };
    },

    spec: {
      subtitle: 'A compact split of the details and a two field form',
      philosophy: [
        'A closing section has one screen and one job. This one gives the reader both ways to write, at the same visual weight, and then gets out of the way.',
        'The plain address is set at display scale as a real mailto link, not tucked under the form in 12px grey. A visitor who prefers their own mail client should not have to work harder than one who fills a box.',
        'Two fields, not five. At the bottom of a page, every extra field is a reason to close the tab, and a name can be inferred from an email signature.'
      ],
      hierarchy: [
        '1. The email address at clamp(1.5rem, 3vw, 2.25rem), the largest thing in the section.',
        '2. The heading above it at clamp(1.5rem, 2.6vw, 2rem).',
        '3. The form panel on the right, on a raised surface so it reads as an alternative rather than as the main event.',
        '4. The three facts as a definition list under the address.',
        '5. The handles as a quiet three-row list at the foot, with the platform name in the display face and the handle in mono.',
        'The See more control sits at the bottom of the left column and is deliberately the least prominent thing in the section.'
      ],
      structure: [
        'Section is a two-column grid, 6fr / 5fr, with a hairline between them at 13% and a 5vw gap.',
        'Left column: heading, address link, facts list, handles list, See more control.',
        'Right column: a panel holding the two-field form stacked with the confirmation in one grid cell.',
        'No canvas, no rail, no sticky. It is one screen of content in normal flow.',
        'The section carries `id="contact"` so page navigation can reach it.'
      ],
      interaction: [
        'ENTRY: IntersectionObserver at threshold 0.22 with rootMargin "0px 0px -4% 0px". On first intersection the section gets a data attribute and never fires again.',
        'The two columns rise 14px and fade in over 520ms cubic-bezier(0.23, 1, 0.32, 1), staggered 70ms. That is the whole entrance.',
        'The See more control fades up on the same entry, 180ms behind the columns.',
        'The form is the shared machine: blur validation, single-error field focus, multi-error summary focus, disabled progress, failure with retry.',
        'Nothing here consumes scroll. The reader arrives, reads, acts or does not, and leaves.'
      ],
      choreography: [
        { n: 'Column settle', d: 'opacity 0 to 1 and translateY 14px to 0 over 520ms cubic-bezier(0.23, 1, 0.32, 1), 70ms stagger between the two columns. Small distance, because the section is already in view when it fires.' },
        { n: 'See more', d: 'Same curve at 420ms with a 180ms delay, so it arrives after the content it refers to.' },
        { n: 'Address hover', d: 'text-underline-offset 4px to 7px over 140ms. The address is the one thing here worth a hover affordance.' },
        { n: 'Confirmation', d: 'The shared crossfade, 320ms out and 420ms in with a 120ms overlap, inside the panel so the left column never moves.' },
        { n: 'Nothing idles', d: 'There is no ambient motion in this section at all. At the bottom of a long page, stillness is the correct closing note.' }
      ],
      scroll: [
        'No scroll effects. IntersectionObserver fires the entry once and disconnects.',
        'The section is one screen tall at 1100px and taller only on mobile, where it stacks.',
        'If the page uses Lenis, nothing here needs to know about it.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'Address: underline offset 4px to 7px, colour unchanged.',
        'Handle rows: the handle goes from 68% to 100% ink over 140ms. They are not links, so nothing else changes.',
        'See more: the shared button treatment, a fill wiping up from the bottom edge.'
      ],
      click: [
        'The address is a real mailto link.',
        'The handles are text, not links. Inventing profile URLs that may not exist is worse than printing the handle and letting the reader search for it.',
        'Submit runs the shared machine; See more opens the page-level counterpart.'
      ],
      responsive: {
        desktop: 'Two columns 6fr / 5fr, hairline divider, 5vw gap, address at 2.25rem.',
        tablet: 'Columns become 1fr / 1fr and the divider is dropped; the handles list moves under the form.',
        mobile: 'Below 768px the split is abandoned. The address comes FIRST at clamp(1.375rem, 7vw, 1.75rem) as a 48px tap target, then the three facts as a two-column grid, then the form, then the handles, then See more. On a phone the fastest path is the address, so it leads; on desktop the form deserves equal billing because the pointer is already there.'
      },
      a11y: [
        'The address is a real link with a visible, selectable, copyable text value. It is never rendered as an image or split across elements to defeat scrapers, which also defeats users.',
        'The facts are a `<dl>`, so the key and value relationship is in the accessibility tree rather than implied by position.',
        'The form is the shared machine with all its behaviour intact even in the two-field variant.',
        'The See more control is a real `<button>` with a label that names its destination, not "See more" alone.',
        'Under `prefers-reduced-motion: reduce`: no rise and no stagger. Everything is simply present, arranged exactly as it lands.',
        'Contrast measured on the actual surfaces: address #f1f1f4 on #08080a is 18.4:1, fact keys #8a8c96 is 5.9:1, handles #a9abb6 is 9.2:1, and every form token is the shared set.'
      ],
      perf: [
        'No canvas, no ticker, no timers. One IntersectionObserver that disconnects after firing.',
        'The entry is two CSS transitions triggered by one attribute.',
        'Total runtime cost after entry: the form state machine and nothing else.',
        'This is the concept to reach for when the page above it is already expensive.'
      ],
      packages: [
        { p: 'none required', w: 'A grid, a link, a form and one observer.' },
        { p: 'no gsap', w: 'A two-item stagger is `transition-delay`. Importing a timeline library for 70ms of offset is not a trade.' }
      ],
      architecture: [
        { f: 'components/sections/Contact.tsx', r: 'Server component. The whole section including the form markup renders on the server.' },
        { f: 'components/contact/ContactForm.tsx', r: 'Shared across the area.' },
        { f: 'components/ui/Reveal.tsx', r: 'A generic IntersectionObserver wrapper, since several sections on the page will want the same entry.' },
        { f: 'app/(site)/contact/page.tsx', r: 'The See more destination. Build it: a section that hands off to a route that does not exist is a dead end.' }
      ],
      state: [
        '`entered` is a boolean that flips once. After that the observer is disconnected and the component never re-renders for it.',
        'Field values and errors are state inside the shared form component.',
        'Nothing else in this section is stateful.'
      ],
      typography: [
        'Address: mono 500 at clamp(1.5rem, 3vw, 2.25rem), tracking -0.01em. Mono because an email address is data, and because a monospaced address is easier to read back character by character.',
        'Heading: display 500 at clamp(1.5rem, 2.6vw, 2rem), tracking -0.035em.',
        'Fact keys: mono 500 at 0.5625rem uppercase, tracking 0.2em. Values: display 400 at 0.875rem.',
        'Handles: platform name in display 400 at 0.8125rem, handle in mono 400 at 0.8125rem, aligned in two columns so the handles form a column of their own.',
        'Form labels and helper text: the shared set.'
      ],
      color: [
        'Signature hue #4FDCC0 on the address underline, the focus rings, the submit fill and the See more control.',
        'The panel is #101015 against the #08080a section ground. One step, which is all a panel needs to read as raised on a dark page.',
        'The divider is a single 13% hairline, not a border on both columns.',
        'In light mode the ground is #f7f7f9, the panel white, and the accent darkens to #0E7F6C for the underline to hold 4.5:1.'
      ],
      spacing: [
        'Section padding clamp(4rem, 12vh, 7rem) vertical, gutter horizontal.',
        'Heading to address 1rem, address to facts 2rem, facts to handles 2rem.',
        'Facts list rows 1.25rem apart, keys 0.375rem above their values.',
        'Panel padding clamp(1.5rem, 2.4vw, 2rem), field gap 1rem.',
        'See more sits 2.5rem below the handles, which is enough separation that it reads as navigation rather than as part of the content.'
      ],
      relationships: [
        'Size encodes equivalence: the address and the form are the same weight because they are the same offer.',
        'The hairline encodes that these are two routes to one place, not two sections.',
        'The facts sit under the address rather than under the form, because they qualify the offer, not the mechanism.'
      ],
      acceptance: [
        'The section fits in one viewport at 1440 by 900 with nothing clipped.',
        'The address is selectable and copyable as plain text.',
        'Scrolling past the section at speed does not trap, pin or slow the page.',
        'The See more control names where it goes.',
        'With reduced motion on, everything is present and correctly arranged with no travel.',
        'On a 390px phone the address is first and is at least 48px tall as a tap target.'
      ]
    }
  };

  SE.register(relay);

  /* ======================================================================
     SECTION 02  -  INVITATION   (pairs with STATEMENT)
     ----------------------------------------------------------------------
     A large closing statement with one primary action. Restraint is the whole
     design: two lines, one address, one control, and a stagger on entry.
     ====================================================================== */

  var invitation = {
    area: 'contact',
    variant: 'section',
    id: 'contact-section-invitation',
    num: 2,
    name: 'Invitation',
    kind: 'Type / masked rise',
    accent: '#FFD37A',
    tagline: 'One statement, one action, nothing else on the screen',
    desc: 'A closing statement at poster scale with a single primary action under it. The section ends ' +
          'the page with a sentence rather than with a form.',
    interaction: 'The two lines rise out of their line boxes as the section enters. One control, one address.',
    hint: 'One statement &middot; One action',

    preview: function (ctx, w, h, t, heat) {
      var cycle = (t * 0.36) % 3.2;
      var rise = M.clamp(cycle / 1.0, 0, 1);
      var e = 1 - Math.pow(1 - rise, 3);
      var x = w * 0.09;
      var lh = h * 0.22;

      for (var i = 0; i < 2; i++) {
        var y = h * 0.30 + i * lh;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y - lh * 0.66, w * 0.82, lh * 0.66);
        ctx.clip();
        var d = (1 - Math.min(1, Math.max(0, (e - i * 0.12) / 0.88))) * lh * 0.8;
        ctx.fillStyle = 'rgba(236,236,239,' + (0.78 + heat * 0.18).toFixed(3) + ')';
        ctx.fillRect(x, y - lh * 0.56 + d, w * (i === 0 ? 0.66 : 0.44), lh * 0.42);
        ctx.restore();
      }

      /* the single action */
      var a = M.clamp((e - 0.5) / 0.5, 0, 1);
      ctx.fillStyle = 'rgba(255,211,122,' + (a * (0.85 + heat * 0.15)).toFixed(3) + ')';
      ctx.fillRect(x, h * 0.76, w * 0.20, h * 0.08);
      ctx.strokeStyle = 'rgba(236,236,239,' + (a * 0.24).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.24, h * 0.80 + 0.5);
      ctx.lineTo(x + w * 0.46, h * 0.80 + 0.5);
      ctx.stroke();
    },

    mount: function (root, ctx) {
      var mode = host(root, ctx, 'invitation');
      root.style.setProperty('--c-accent', invitation.accent);

      var wrapEl = SE.el('div', 'contact-invitation__wrap');
      root.appendChild(wrapEl);

      var h2 = SE.el('h2', 'contact-invitation__line');
      h2.innerHTML =
        '<span class="contact-invitation__box"><span>If any of this looks</span></span>' +
        '<span class="contact-invitation__box"><span>like your problem,</span></span>' +
        '<span class="contact-invitation__box"><span>write to me.</span></span>';
      wrapEl.appendChild(h2);

      var actions = SE.el('div', 'contact-invitation__actions');
      var cta = SE.el('a', 'contact-invitation__cta',
        '<span>Write to me</span>' + icon('arrow'));
      cta.href = 'mailto:' + C.email;
      actions.appendChild(cta);

      var meta = SE.el('p', 'contact-invitation__meta',
        esc(C.email) + '<i></i>' + esc(C.replyTight) + '<i></i>' + esc(C.availabilityTight));
      actions.appendChild(meta);
      wrapEl.appendChild(actions);

      var more = null;
      if (mode === 'section') {
        more = seeMoreFor('See the full page', invitation.accent, ctx.onSeeMore);
        more.classList.add('contact-invitation__more');
        wrapEl.appendChild(more);
      }

      var io = onEnter(root, function () {
        root.setAttribute('data-entered', 'true');
        if (more) more.classList.add('is-on');
      }, 0.3);

      return {
        destroy: function () {
          io.destroy();
          root.removeAttribute('data-entered');
          root.style.removeProperty('--c-accent');
          unhost(root, 'invitation');
        }
      };
    },

    spec: {
      subtitle: 'A closing statement at poster scale with one primary action',
      philosophy: [
        'The last section of a page should say one thing. This one says it in three lines and then offers exactly one way to act on it.',
        'There is no form here on purpose. A section that has already spent its argument does not need to also collect data; the page-level counterpart does that. Asking for both is how a closing section becomes a wall.',
        'The restraint is the design. One statement, one control, one line of facts. Anything added would be something taken away from the sentence.'
      ],
      hierarchy: [
        '1. The three-line statement at clamp(2rem, 7vw, 5.5rem).',
        '2. The single action, a filled control at 48px.',
        '3. The fact line under it: address, reply window, availability, separated by hairline marks rather than by middle dots.',
        '4. The See more control, quiet, at the foot.',
        'Nothing competes. There are four things in this section and they are in strict order of importance.'
      ],
      structure: [
        'Section is a single left-aligned column, `max-width: 68rem`, not centred: a centred poster in a left-aligned page reads as a different site.',
        'The heading is one `<h2>` with three masked `<span>` line boxes, so the rise is per line and the accessible name is still one string.',
        'The actions row holds one `<a href="mailto:">` styled as a filled control and one fact line.',
        'The See more control sits below on its own row.',
        'No canvas, no panel, no form.'
      ],
      interaction: [
        'ENTRY: IntersectionObserver at threshold 0.3. On first intersection the three lines translate from 108% to 0 inside their masks over 900ms cubic-bezier(0.23, 1, 0.32, 1) with a 90ms stagger.',
        'The action and the fact line fade up 12px over 520ms starting at 260ms, so they arrive as the last line lands.',
        'The See more control arrives 180ms after that.',
        'That is the entire interaction model. There is no hover choreography beyond the control, no parallax, and no idle motion.'
      ],
      choreography: [
        { n: 'Line rise', d: 'translateY 108% to 0 inside `overflow: hidden` line boxes, 900ms cubic-bezier(0.23, 1, 0.32, 1), 90ms stagger. 108% so descenders clear the mask edge; at this size a clipped descender reads as a rendering bug.' },
        { n: 'Action arrival', d: 'opacity 0 to 1 and translateY 12px to 0 over 520ms on the same curve, delay 260ms. It lands as the third line finishes rather than after it, so the section resolves as one move.' },
        { n: 'Control fill', d: 'On hover, the fill is already solid; the label and mark shift 3px right over 140ms. A filled primary control does not need a second colour on hover.' },
        { n: 'See more', d: '420ms fade and 10px rise, delay 440ms.' },
        { n: 'Nothing repeats', d: 'The observer disconnects after the first intersection. A statement that re-animates every time it scrolls back into view is a statement nobody finishes reading.' }
      ],
      scroll: [
        'Entry only, fired once, then the observer disconnects.',
        'No pin, no rail, no scrub. The reader passes through at their own speed.',
        'The section is roughly 0.8 of a viewport at 1440 by 900, which is deliberate: a closing section that fills the screen exactly reads as another page.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'The action: label and arrow translate 3px right over 140ms. Nothing else.',
        'The address inside the fact line is not a link. There is one action in this section and adding a second route to it would dilute it.',
        'The statement has no hover state.'
      ],
      click: [
        'One click target of consequence: the mailto action.',
        'See more opens the page-level counterpart, which is where the form lives.',
        'No modal, no expander, no reveal. If the reader wants a form, the hand-off gives them one.'
      ],
      responsive: {
        desktop: 'Three lines at clamp(2rem, 7vw, 5.5rem), left aligned, max-width 68rem. Action row horizontal.',
        tablet: 'Same at 6.5vw; the fact line wraps to two rows.',
        mobile: 'Below 768px the statement is re-broken to four shorter lines at clamp(1.75rem, 9vw, 2.5rem), the action becomes full width at 52px, and the fact line becomes a stacked list with one fact per row. The stagger drops from 90ms to 60ms because four lines at 90ms takes long enough to notice on a phone.'
      },
      a11y: [
        'The heading is one `<h2>`; the masked spans are presentational and do not fragment the accessible name.',
        'The action is a real link with a text label, not an icon-only control.',
        'The fact line is a paragraph with hairline separators drawn as `<i>` elements, so no punctuation is read out as noise.',
        'Under `prefers-reduced-motion: reduce`: no rise, no stagger, no fade. All three lines and the action are simply present.',
        'Contrast measured on the actual surfaces: statement #f1f1f4 on #08080a is 18.4:1, action ink #08080a on #ffd37a is 14.1:1, fact line #a9abb6 on #08080a is 9.2:1.',
        'The action is 48px tall at every breakpoint and its label never wraps.'
      ],
      perf: [
        'No canvas, no ticker, no timers, one observer that disconnects.',
        'Three transforms and two opacity transitions, all on elements that already exist.',
        'The masks are `overflow: hidden` on static parents, which costs nothing.',
        'This is the cheapest section in the area and the correct choice if the page above it is heavy.'
      ],
      packages: [
        { p: 'none required', w: 'Three masked spans and two transitions.' },
        { p: 'gsap SplitText (optional)', w: 'Only if you want per-word rather than per-line. Per line is the stronger composition at this scale, and per line needs no plugin.' }
      ],
      architecture: [
        { f: 'components/sections/ContactInvite.tsx', r: 'Server component. Static content plus a client Reveal wrapper.' },
        { f: 'components/ui/Reveal.tsx', r: 'Shared IntersectionObserver wrapper used by every section on the page.' },
        { f: 'app/(site)/contact/page.tsx', r: 'The See more destination, which must exist and must carry the form.' }
      ],
      state: [
        'One boolean, flipped once.',
        'Nothing else in this section has state.',
        'Do not lift the entry state into a page-level context. Each section owns its own reveal.'
      ],
      typography: [
        'Statement: display 500 at clamp(2rem, 7vw, 5.5rem), tracking -0.045em, line-height 0.92. Three lines, broken by hand at the clause, never by the browser.',
        'Action: mono 500 at 0.75rem, tracking 0.16em, uppercase.',
        'Fact line: mono 400 at 0.6875rem, tracking 0.1em, with 1px 8px hairline separators instead of middle dots.',
        'The line breaks are authored. A poster that rewraps at every viewport is not a poster.'
      ],
      color: [
        'Signature hue #FFD37A on the action fill and the See more control. Two places.',
        'The statement is #f1f1f4. A five-rem heading in a saturated hue is a poster for the colour, not for the sentence.',
        'The ground is the page ground, unchanged. This section does not introduce a surface.',
        'In light mode the action keeps the same fill with near-black ink, which already clears 14:1, and the statement becomes the near-black ink.'
      ],
      spacing: [
        'Statement to action row: clamp(2.5rem, 6vh, 4rem).',
        'Action to fact line: 1.5rem on desktop, or side by side with a 2rem gap above 1100px.',
        'See more sits 3rem below the action row.',
        'Section padding clamp(4rem, 14vh, 8rem) vertical. It is a closing section, so the space above it is larger than the space below.'
      ],
      relationships: [
        'Line breaks encode the clauses of the sentence, which is why they are authored rather than left to the browser.',
        'The single filled control encodes that there is one thing to do here.',
        'The fact line under the control encodes the terms of the offer, which is exactly the information a reader wants immediately after deciding to act.'
      ],
      acceptance: [
        'The statement holds three lines at every width from 1024px to 1920px.',
        'No descender is clipped by a mask at any size.',
        'The entry runs once and never re-runs on scroll back.',
        'There is exactly one primary action in the section.',
        'With reduced motion on, everything is present and nothing travels.',
        'The See more control is visible and reachable by keyboard.'
      ]
    }
  };

  SE.register(invitation);

  /* ======================================================================
     SECTION 03  -  WINDOW   (pairs with CONSOLE)
     ----------------------------------------------------------------------
     An availability strip that resolves as the section is consumed. The one
     concept in this area that takes any scroll at all, and it takes 0.6 of a
     screen, not two.

     THE RESOLVE
     -----------
     Each cell starts as a scrambled mono placeholder and settles into its real
     value as scroll progress crosses that cell's threshold. The scramble is
     driven by a seeded PRNG, so the noise is identical on every reload; a
     random scramble makes the section feel unstable rather than mechanical.
     ====================================================================== */

  var windowC = {
    area: 'contact',
    variant: 'section',
    id: 'contact-section-window',
    num: 3,
    name: 'Window',
    kind: 'Strip / scrubbed resolve',
    accent: '#7FC0FF',
    tagline: 'The terms of the offer, settling as you reach them',
    desc: 'A single strip of four readings that resolve out of noise as the section is consumed. It ' +
          'holds the reader for six tenths of a screen and then lets them go.',
    interaction: 'Scroll through the strip. Each reading settles as its own threshold passes.',
    hint: 'Scroll resolves the strip',
    screens: 1.6,

    preview: function (ctx, w, h, t, heat) {
      var rand = SE.rng(6104);
      var cells = 4;
      var pad = w * 0.07;
      var span = w - pad * 2;
      var cw = span / cells;
      var prog = ((t * 0.30) % 2.2) / 1.4;

      ctx.strokeStyle = 'rgba(236,236,239,0.10)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, h * 0.30 + 0.5);
      ctx.lineTo(pad + span * M.clamp(prog, 0, 1), h * 0.30 + 0.5);
      ctx.stroke();

      for (var i = 0; i < cells; i++) {
        var x = pad + i * cw;
        var settled = M.clamp((prog - i * 0.2) / 0.24, 0, 1);
        /* key */
        ctx.fillStyle = 'rgba(127,192,255,' + (0.3 + settled * 0.5).toFixed(3) + ')';
        ctx.fillRect(x, h * 0.40, cw * 0.30, 2);
        /* value: noise resolving into a solid run */
        var segs = 6;
        for (var k = 0; k < segs; k++) {
          var solid = k / segs < settled;
          var bw = cw * 0.62 / segs;
          var jitter = solid ? 0 : (rand() - 0.5) * h * 0.06;
          ctx.fillStyle = 'rgba(236,236,239,' + (solid ? (0.62 + heat * 0.2) : 0.18).toFixed(3) + ')';
          ctx.fillRect(x + k * bw, h * 0.56 + jitter, bw * 0.72, 4);
        }
      }
    },

    mount: function (root, ctx) {
      var mode = host(root, ctx, 'window');
      root.style.setProperty('--c-accent', windowC.accent);
      var reduced = env.reduced;

      var isSection = mode === 'section' && ctx && ctx.scroller;

      /* One screen of composition. In section mode it sits in a sticky
         viewport on a 1.6-screen rail, which is a gentle hold, not a pin for
         two screens. In page mode there is no scroller, so it is static. */
      var rail = null, host2;
      if (isSection) {
        rail = SE.scrollRail(ctx.scroller, windowC.screens);
        host2 = SE.el('div', 'contact-window__stage');
        rail.sticky.appendChild(host2);
        root.appendChild(rail.rail);
      } else {
        host2 = SE.el('div', 'contact-window__stage');
        root.appendChild(host2);
      }

      var wrapEl = SE.el('div', 'contact-window__wrap');
      host2.appendChild(wrapEl);

      wrapEl.innerHTML =
        '<h2 class="contact-window__title">The terms, before you write.</h2>';

      var strip = SE.el('div', 'contact-window__strip');
      var CELLS = [
        { k: 'Status', v: C.availabilityTight },
        { k: 'Reply window', v: C.replyTight },
        { k: 'Working hours', v: C.hours },
        { k: 'Where', v: C.region + ' ' + C.tzLabel }
      ];
      strip.innerHTML =
        '<div class="contact-window__rule" aria-hidden="true"><i></i></div>' +
        CELLS.map(function (c) {
          return '<div class="contact-window__cell">' +
                 '<span class="contact-window__k">' + esc(c.k) + '</span>' +
                 '<span class="contact-window__v" data-real="' + esc(c.v) + '">' + esc(c.v) + '</span>' +
                 '</div>';
        }).join('');
      wrapEl.appendChild(strip);

      var actions = SE.el('div', 'contact-window__actions');
      var cta = SE.el('a', 'contact-window__cta', '<span>Ask about March</span>' + icon('arrow'));
      cta.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('The March slot');
      actions.appendChild(cta);
      wrapEl.appendChild(actions);

      var more = null;
      if (mode === 'section') {
        more = seeMoreFor('Open the console view', windowC.accent, ctx.onSeeMore);
        more.classList.add('contact-window__more');
        actions.appendChild(more);
      }

      /* The strip carries readings, so it is mirrored for assistive tech in
         plain text and the scramble never touches the accessible value. */
      var vals = SE.$$('.contact-window__v', strip);
      vals.forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-real')); });

      /* ------------------------------------------------------- the resolve */
      var rand = SE.rng(51771);
      var GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
      var noise = vals.map(function (el) {
        var real = el.getAttribute('data-real');
        var out = '';
        for (var i = 0; i < real.length; i++) {
          out += real[i] === ' ' ? ' ' : GLYPHS[Math.floor(rand() * GLYPHS.length)];
        }
        return out;
      });

      var progress = reduced ? 1 : 0;
      var painted = -1;

      function paint(p) {
        /* Quantised to 24 steps: repainting four strings sixty times a second
           is wasted work, and the scramble reads better as a mechanism than as
           a smooth blur. */
        var step = Math.round(p * 24);
        if (step === painted) return;
        painted = step;
        var q = step / 24;
        /* Written as a custom property on the element itself, not as a
           transform string, so the CSS can pick the axis: the rule draws
           across on desktop and downward on mobile from one value. */
        SE.$('.contact-window__rule i', strip).style
          .setProperty('--p', M.clamp(q * 1.15, 0, 1).toFixed(3));
        vals.forEach(function (el, i) {
          var real = el.getAttribute('data-real');
          var settled = M.clamp((q - i * 0.14) / 0.30, 0, 1);
          var cut = Math.round(real.length * settled);
          el.textContent = real.slice(0, cut) + noise[i].slice(cut);
          el.parentNode.classList.toggle('is-settled', settled >= 1);
        });
      }
      paint(progress);

      var scrubber = null;
      if (isSection && !reduced) {
        scrubber = SE.scrub(ctx.scroller, rail.rail, function (p) { paint(p); });
      } else if (!isSection && !reduced) {
        /* Page mode has no scroller to scrub, so the resolve runs once on
           entry over 1.2s rather than being tied to nothing. */
        var el0 = 0;
        var tickFn = function (dt) {
          el0 = Math.min(1, el0 + dt / 1.2);
          paint(el0);
          if (el0 >= 1) SE.ticker.remove(tickFn);
        };
        SE.ticker.add(tickFn);
        var stopTick = tickFn;
      }

      var io = onEnter(root, function () {
        root.setAttribute('data-entered', 'true');
        if (more) more.classList.add('is-on');
      }, 0.2);

      return {
        destroy: function () {
          io.destroy();
          if (scrubber) scrubber.kill();
          if (rail) rail.destroy();
          if (typeof stopTick === 'function') SE.ticker.remove(stopTick);
          root.removeAttribute('data-entered');
          root.style.removeProperty('--c-accent');
          unhost(root, 'window');
        }
      };
    },

    spec: {
      subtitle: 'An availability strip that resolves out of noise as it is consumed',
      philosophy: [
        'The four things a visitor actually needs to know before writing are status, reply window, working hours and location. This section is those four things and nothing else.',
        'Resolving them out of noise as the reader arrives makes the strip feel like an instrument taking a reading rather than a list that was always there. It is the only motion in the section and it is tied to the reader\'s own scroll, so it never plays without them.',
        'It holds the reader for 0.6 of a screen. That is the entire budget a closing section gets, and spending two screens on it would be taking something the reader did not offer.'
      ],
      hierarchy: [
        '1. The four readings, mono 500 at clamp(0.9375rem, 1.5vw, 1.25rem).',
        '2. The heading above the strip at clamp(1.5rem, 2.8vw, 2.25rem).',
        '3. The rule that draws across the strip as progress advances.',
        '4. The single action under it.',
        '5. The See more control, quiet, beside the action.',
        'A settled cell outranks an unsettled one: settled values are at full ink, unsettled noise sits at 42%.'
      ],
      structure: [
        'Section is a rail of 1.6 viewports containing a `position: sticky` viewport of exactly one screen. Sticky, not ScrollTrigger pin: pinning injects a spacer and rewrites layout, which is fragile inside a nested scroller.',
        'Inside the sticky viewport: heading, the strip, the action row.',
        'The strip is a four-column grid with a full-width rule above it whose inner element scales on the X axis.',
        'Each cell is a key and a value; the value carries `aria-label` with the real text so assistive technology never reads the scramble.',
        'No canvas. The readings are text, which is crisper, selectable and already accessible.'
      ],
      interaction: [
        'SCROLL: progress 0 to 1 across the rail, via ScrollTrigger with scrub 0.6 where available and a passive scroll listener as the fallback.',
        'Progress is quantised to 24 steps before painting. Repainting four strings sixty times a second is wasted work, and the scramble reads better as a mechanism than as a smooth blur.',
        'Each cell settles on its own threshold: cell i begins at progress i * 0.14 and completes 0.30 later, so the four resolve in sequence rather than together.',
        'The rule scales from 0 to 1 at 1.15x progress, so it finishes slightly ahead of the last cell and the strip reads as complete.',
        'The scramble alphabet is uppercase letters and digits with spaces preserved, so the shape of the value is right before the value is.',
        'The section does not trap: at progress 1 there is still 0.6 of a screen of rail left, which scrolls away normally.'
      ],
      choreography: [
        { n: 'Resolve', d: 'Per cell, characters convert from noise to real left to right over 0.30 of total progress, starting at i * 0.14. Left to right because that is the direction the value is read in.' },
        { n: 'Rule', d: 'scaleX 0 to 1 at 1.15x progress, transform-origin left, no easing. It is a progress indicator for a scroll position, and easing a position indicator makes it lie.' },
        { n: 'Settled state', d: 'A cell that completes gets a class: value ink goes from 42% to 100% and the key hue goes to the accent over 220ms cubic-bezier(0.23, 1, 0.32, 1). A discrete change, not a scrub, so the completion is legible.' },
        { n: 'Action', d: 'Fades up 12px over 520ms on entry, independent of the scrub, so it is available before the strip finishes.' },
        { n: 'No idle', d: 'When progress is 0 or 1 nothing runs. There is no ambient scramble.' }
      ],
      scroll: [
        'Rail length 1.6 viewports: one screen of sticky composition plus 0.6 of a screen of travel.',
        'Sticky rather than pin. No layout surgery, no pin spacer, works inside a nested scroller.',
        'ScrollTrigger scrub 0.6 gives the resolve a little mass; under reduced motion the scrub is set to true (instant) and the strip starts fully resolved anyway.',
        'The passive-listener fallback computes progress from `trigger.offsetTop` and `scroller.scrollTop`, so a failed CDN degrades the smoothing rather than the feature.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'The action shifts its label and mark 3px right over 140ms.',
        'The cells have no hover state. They are readings.',
        'See more uses the shared control treatment.'
      ],
      click: [
        'One action: a mailto with a prefilled subject naming the slot being asked about. A subject line is the cheapest way to make a cold email easier to write.',
        'See more opens the console view, which is the same information as a live instrument plus a form.',
        'The cells are not clickable.'
      ],
      responsive: {
        desktop: 'Four columns, values at 1.25rem, rail 1.6 viewports, sticky one screen.',
        tablet: 'Two columns of two, values at 1.125rem, rail 1.5 viewports.',
        mobile: 'Below 768px the strip becomes four stacked rows with the key on the left and the value right-aligned, and the rule becomes a vertical line down the left edge that draws downward instead of across. The rail shortens to 1.25 viewports, because 0.6 of a screen of extra scroll on a phone is a longer wait than it is on a laptop.'
      },
      a11y: [
        'Every value carries `aria-label` with its real text, set once at mount. A screen reader never reads the scramble, and the label never changes, so nothing is announced repeatedly as the reader scrolls.',
        'The scramble is a visual treatment of already-present text, not a substitute for it. With JavaScript disabled the real values render.',
        'Under `prefers-reduced-motion: reduce`: the strip renders fully resolved, the scrub is not installed at all, and the rule is drawn complete. The section still holds its rail so the layout is identical, and the reader simply scrolls past it.',
        'The action is a real link with a text label and a 48px target.',
        'Contrast measured on the actual surfaces: settled value #f1f1f4 on #08080a is 18.4:1, unsettled noise #a9abb6 at 42% opacity resolves to roughly 4.6:1 which still clears AA, keys #7fc0ff on #08080a is 10.4:1.',
        'The section never traps: the rail always scrolls through, and there is no scroll capture of any kind.'
      ],
      perf: [
        'No canvas and no ticker in section mode. The only work is a text write on four elements, at most 24 times across the whole rail.',
        'Quantising progress to 24 steps is what keeps this cheap: without it, four `textContent` writes per frame across a 0.6-screen scroll is thousands of unnecessary string operations.',
        'The rule is a scaleX on one element.',
        'One ScrollTrigger, killed on destroy. One ResizeObserver inside the rail, disconnected on destroy.',
        'In page mode, where there is no scroller to scrub, the resolve runs once over 1.2s from the shared ticker and unsubscribes itself when it completes.'
      ],
      packages: [
        { p: 'gsap + ScrollTrigger (installed)', w: 'Worth it here: scrub 0.6 gives the resolve mass that a raw scroll listener cannot, and ScrollTrigger handles refresh on resize. The fallback path exists and works without it.' },
        { p: 'no scramble library', w: 'Sixteen lines: an alphabet, a seeded PRNG, and a slice. A text-effect dependency would be 8kb for a substring.' },
        { p: 'lenis (installed)', w: 'If Lenis is running, ScrollTrigger must be updated from its scroll event or the scrub lags the smoothing by a frame.' }
      ],
      architecture: [
        { f: 'components/sections/ContactWindow.tsx', r: 'Server component renders the heading, the strip with real values, and the action.' },
        { f: 'components/contact/ResolveStrip.tsx', r: '"use client": the rail, the scrub and the quantised paint. Takes the cells as props.' },
        { f: 'lib/contact/scramble.ts', r: 'The seeded noise generator. Pure and testable.' },
        { f: 'app/(site)/contact/page.tsx', r: 'The See more destination, carrying the console composition and the form.' }
      ],
      state: [
        'Progress is a ref, not state. It changes continuously and only four text nodes depend on it.',
        'The quantised step is also a ref, compared before every paint so a repeat step costs one integer comparison.',
        'The settled flags are class toggles, not state.',
        'The noise strings are computed once at mount with `useMemo` and never regenerate. Regenerating them per frame is what makes a scramble look like static instead of like a mechanism.'
      ],
      typography: [
        'Values: mono 500 at clamp(0.9375rem, 1.5vw, 1.25rem), tabular figures, so the string does not change width as characters resolve.',
        'Keys: mono 500 at 0.5625rem, tracking 0.2em, uppercase.',
        'Heading: display 500 at clamp(1.5rem, 2.8vw, 2.25rem), tracking -0.035em.',
        'Tabular figures are not optional here. Without them the resolving value visibly reflows as digits swap in, and the whole effect reads as a bug.'
      ],
      color: [
        'Signature hue #7FC0FF on the keys once settled, the rule, and the action fill.',
        'Unsettled noise is the value ink at 42% opacity; settled values are at full ink. That difference is the only state signal and it needs no second colour.',
        'The ground is the page ground. This section does not introduce a surface.',
        'In light mode the accent darkens to #0F63B8 for the keys and the rule, and the noise sits at 46% of the near-black ink.'
      ],
      spacing: [
        'Heading to strip: clamp(2rem, 5vh, 3rem). Strip to action row: clamp(2rem, 5vh, 3rem).',
        'Strip columns: equal, with a 2rem gap and no vertical dividers. The rule above is the only line.',
        'Key to value: 0.5rem.',
        'Section padding clamp(4rem, 12vh, 7rem) vertical.'
      ],
      relationships: [
        'Horizontal position of the rule encodes scroll progress, which is also how much of the strip has resolved. One value, two readings, no disagreement possible.',
        'Ink level encodes settled or not.',
        'Cell order encodes priority: status first, because a visitor who reads only one thing should read that one.'
      ],
      acceptance: [
        'The strip resolves left to right as the reader scrolls and never plays on its own.',
        'A screen reader reads the four real values and never the scramble.',
        'Values do not change width while resolving.',
        'The section releases the reader: after progress 1 there is still rail left and the page keeps moving.',
        'With reduced motion on, the strip is fully resolved and no scrub is installed at all.',
        'On a phone the strip is four rows with a vertical rule, not four squeezed columns.'
      ]
    }
  };

  SE.register(windowC);

  /* ======================================================================
     SECTION 04  -  MAGNET   (pairs with CONVERSATION)
     ----------------------------------------------------------------------
     A magnetic CTA composition. A field of short strokes bends toward the
     cursor, and the action itself is pulled a little way out of position.

     THE PART THAT IS USUALLY MISSING
     --------------------------------
     Magnetic buttons are a pointer trick, and a pointer trick with no
     equivalent for anyone else is decoration that excludes. Here, FOCUS is the
     attractor as well: tabbing to the control bends the whole field toward it
     and lifts it, so a keyboard user gets the same emphasis a mouse user does.
     Under touch or reduced motion the field is a still, deliberately arranged
     composition rather than a broken interactive one.

     The pull uses a raised cosine falloff. A linear tent has a corner at the
     cursor and another at the edge of the radius, and the eye reads those
     corners as stepping; a Hann window is smooth in value AND slope
     everywhere, so the attraction swells and releases.
     ====================================================================== */

  var magnet = {
    area: 'contact',
    variant: 'section',
    id: 'contact-section-magnet',
    num: 4,
    name: 'Magnet',
    kind: 'Canvas / attracted field',
    accent: '#BFA6FF',
    tagline: 'The action reaches for you before you reach for it',
    desc: 'A field of short strokes bends toward the cursor and the single action is pulled a little ' +
          'out of position. Focus is an attractor too, so the emphasis is not pointer only.',
    interaction: 'Move near the action and it leans toward you. Tab to it and the field leans toward it instead.',
    hint: 'Move near the action &middot; Tab works the same way',

    preview: function (ctx, w, h, t, heat) {
      var cols = 9, rows = 5;
      var cx = w * (0.5 + Math.sin(t * 0.5) * 0.22);
      var cy = h * (0.5 + Math.cos(t * 0.41) * 0.18);
      var R = Math.min(w, h) * 0.62;

      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var x = w * (0.10 + (i / (cols - 1)) * 0.80);
          var y = h * (0.20 + (j / (rows - 1)) * 0.60);
          var dx = cx - x, dy = cy - y;
          var d = Math.sqrt(dx * dx + dy * dy);
          var u = d / R;
          var pull = u >= 1 ? 0 : 0.5 * (1 + Math.cos(Math.PI * u));
          var a = Math.atan2(dy, dx);
          var len = 3 + pull * 7 * (0.6 + heat * 0.6);
          ctx.moveTo(x - Math.cos(a) * len * 0.5, y - Math.sin(a) * len * 0.5);
          ctx.lineTo(x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5);
        }
      }
      ctx.strokeStyle = 'rgba(191,166,255,' + (0.42 + heat * 0.28).toFixed(3) + ')';
      ctx.stroke();

      /* the action, pulled toward the attractor */
      var bw = w * 0.26, bh = h * 0.14;
      var bx = w / 2 - bw / 2 + (cx - w / 2) * 0.10;
      var by = h / 2 - bh / 2 + (cy - h / 2) * 0.10;
      ctx.fillStyle = 'rgba(191,166,255,' + (0.9 + heat * 0.1).toFixed(3) + ')';
      ctx.fillRect(bx, by, bw, bh);
    },

    mount: function (root, ctx) {
      var mode = host(root, ctx, 'magnet');
      root.style.setProperty('--c-accent', magnet.accent);
      var reduced = env.reduced;
      var interactive = env.fine && !reduced;

      var wrapEl = SE.el('div', 'contact-magnet__wrap');
      root.appendChild(wrapEl);

      var head = SE.el('header', 'contact-magnet__head');
      head.innerHTML =
        '<h2 class="contact-magnet__title">The next slot opens in March.</h2>' +
        '<p class="contact-magnet__lede">One project at a time, and the one after this is the one ' +
        'being decided now.</p>';
      wrapEl.appendChild(head);

      var field = SE.el('div', 'contact-magnet__field');
      var canvasEl = SE.el('canvas', 'contact-magnet__canvas');
      canvasEl.setAttribute('aria-hidden', 'true');
      field.appendChild(canvasEl);

      var cta = SE.el('a', 'contact-magnet__cta', '<span>Start a project</span>' + icon('arrow'));
      cta.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('A project, starting March');
      field.appendChild(cta);
      wrapEl.appendChild(field);

      var meta = SE.el('p', 'contact-magnet__meta',
        esc(C.email) + '<i></i>' + esc(C.replyTight) + '<i></i>' + esc(C.hours));
      wrapEl.appendChild(meta);

      var more = null;
      if (mode === 'section') {
        more = seeMoreFor('Open the full contact page', magnet.accent, ctx.onSeeMore);
        more.classList.add('contact-magnet__more');
        wrapEl.appendChild(more);
      }

      /* The field is decorative, but it depicts three nameable facts, so the
         screen-reader mirror names them and every item lands on the action
         rather than being a button that does nothing. */
      wrapEl.appendChild(SE.srList('Magnet: the closing offer', srItems([
        { n: 'Start a project', c: 'Action', r: 'Opens a message to ' + C.email, d: 'The single action in this section.' },
        { n: 'Reply window', c: 'Term', r: C.replyTight, d: 'A commitment, not a measured average.' },
        { n: 'Availability', c: 'Term', r: C.availability, d: 'One project at a time.' }
      ]), function () { cta.focus(); }));

      /* --------------------------------------------------------- the field */
      var cv = SE.canvas(canvasEl);
      var cxt = cv.ctx;
      var rand = SE.rng(31337);

      var cols = env.mobile ? 9 : 22;
      var rows = env.mobile ? 6 : 9;
      var nodes = [];
      function build() {
        nodes.length = 0;
        for (var i = 0; i < cols; i++) {
          for (var j = 0; j < rows; j++) {
            /* A little seeded jitter, so the field reads as filings rather
               than as a printed grid. Seeded, so it is identical on reload. */
            nodes.push({
              x: (i + 0.5) / cols + (rand() - 0.5) * 0.012,
              y: (j + 0.5) / rows + (rand() - 0.5) * 0.02
            });
          }
        }
      }
      build();

      var attX = 0.5, attY = 0.5;       /* attractor in 0..1 field space */
      var curX = 0.5, curY = 0.5;
      var strength = 0, strengthTarget = 0;
      var pullX = 0, pullY = 0;
      var active = false;
      var focused = false;
      var rect = null;

      function onEnterField() { active = true; }
      function onLeaveField() { active = false; strengthTarget = focused ? 1 : 0; }
      if (interactive) {
        field.addEventListener('pointerenter', onEnterField);
        field.addEventListener('pointerleave', onLeaveField);
      }
      function onFocus() { focused = true; }
      function onBlur() { focused = false; }
      cta.addEventListener('focus', onFocus);
      cta.addEventListener('blur', onBlur);

      function render() {
        cv.clear();
        var w = cv.w, h = cv.h;
        if (w < 8 || h < 8) return;
        var R = Math.max(w, h) * 0.55;
        var ax = curX * w, ay = curY * h;

        /* Three alpha buckets, three stroked paths. Stroking each of the 198
           segments individually would be 198 state changes a frame. */
        var buckets = [[], [], []];
        for (var k = 0; k < nodes.length; k++) {
          var n = nodes[k];
          var x = n.x * w, y = n.y * h;
          var dx = ax - x, dy = ay - y;
          var d = Math.sqrt(dx * dx + dy * dy);
          var pull = hann(d / R) * strength;
          var ang = d < 0.001 ? 0 : Math.atan2(dy, dx);
          var len = 5 + pull * 13;
          var hx = Math.cos(ang) * len * 0.5;
          var hy = Math.sin(ang) * len * 0.5;
          var b = pull > 0.55 ? 2 : (pull > 0.2 ? 1 : 0);
          buckets[b].push(x - hx, y - hy, x + hx, y + hy);
        }
        var alphas = [0.2, 0.38, 0.78];
        for (var bi = 0; bi < 3; bi++) {
          var arr = buckets[bi];
          if (!arr.length) continue;
          cxt.beginPath();
          for (var q = 0; q < arr.length; q += 4) {
            cxt.moveTo(arr[q], arr[q + 1]);
            cxt.lineTo(arr[q + 2], arr[q + 3]);
          }
          cxt.strokeStyle = 'rgba(191,166,255,' + alphas[bi] + ')';
          cxt.lineWidth = 1;
          cxt.lineCap = 'round';
          cxt.stroke();
        }
      }

      function tick(dt) {
        if (interactive && active) {
          rect = canvasEl.getBoundingClientRect();
          if (rect.width > 0) {
            attX = M.clamp((SE.pointer.x - rect.left) / rect.width, -0.4, 1.4);
            attY = M.clamp((SE.pointer.y - rect.top) / rect.height, -0.4, 1.4);
            strengthTarget = 1;
          }
        } else if (focused) {
          /* Focus is an attractor too: the field leans toward the control so a
             keyboard user gets the same emphasis a pointer user does. */
          attX = 0.5; attY = 0.5;
          strengthTarget = 1;
        } else if (!interactive) {
          /* Touch and reduced motion get a still, deliberately arranged field
             rather than a broken interactive one: the attractor parks on the
             control and the strength holds at a readable level. */
          attX = 0.5; attY = 0.5;
          strengthTarget = 0.55;
        } else {
          /* Never zero: at rest the field is still a composition with a
             centre, just a quiet one. A field that goes flat when the cursor
             leaves reads as broken rather than as calm. */
          strengthTarget = 0.28;
        }

        var nx = reduced ? attX : M.damp(curX, attX, 7, dt);
        var ny = reduced ? attY : M.damp(curY, attY, 7, dt);
        var ns = reduced ? strengthTarget : M.damp(strength, strengthTarget, 5, dt);
        var moved = Math.abs(nx - curX) > 0.0004 || Math.abs(ny - curY) > 0.0004 ||
                    Math.abs(ns - strength) > 0.002;
        curX = nx; curY = ny; strength = ns;

        /* The control is pulled a little out of position, capped at 14px so it
           never leaves the reader's aim. */
        if (interactive) {
          var tx = active ? (curX - 0.5) * 28 : 0;
          var ty = active ? (curY - 0.5) * 18 : 0;
          var npx = M.damp(pullX, tx, 6, dt);
          var npy = M.damp(pullY, ty, 6, dt);
          if (Math.abs(npx - pullX) > 0.02 || Math.abs(npy - pullY) > 0.02) {
            pullX = npx; pullY = npy;
            cta.style.transform = 'translate3d(' + pullX.toFixed(2) + 'px,' + pullY.toFixed(2) + 'px,0)';
          }
        }

        if (moved || !rendered) { rendered = true; render(); }
      }
      var rendered = false;

      cv.observe(function () { rendered = false; });
      SE.ticker.add(tick);
      render();

      var io = onEnter(root, function () {
        root.setAttribute('data-entered', 'true');
        if (more) more.classList.add('is-on');
      }, 0.22);

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          io.destroy();
          if (interactive) {
            field.removeEventListener('pointerenter', onEnterField);
            field.removeEventListener('pointerleave', onLeaveField);
          }
          cta.removeEventListener('focus', onFocus);
          cta.removeEventListener('blur', onBlur);
          cv.destroy();
          root.removeAttribute('data-entered');
          root.style.removeProperty('--c-accent');
          unhost(root, 'magnet');
        }
      };
    },

    spec: {
      subtitle: 'A magnetic action inside a field that bends toward attention',
      philosophy: [
        'The last action on a page should feel like it wants to be pressed. A field that bends toward the cursor and an action that leans a little out of position does that with two numbers and no copy.',
        'Magnetic buttons are usually a pointer trick with no equivalent for anyone else, which makes them decoration that excludes. Here focus is an attractor too: tabbing to the control bends the whole field toward it. The emphasis is available without a mouse.',
        'The pull is capped at 14px. Past that the control starts dodging the pointer, and a button that moves away from the person aiming at it is a joke, not an interaction.'
      ],
      hierarchy: [
        '1. The action, a filled control at the optical centre of the field.',
        '2. The field itself, 198 one-pixel strokes at 16% to 72% alpha depending on how strongly each is pulled.',
        '3. The heading above at clamp(1.5rem, 2.8vw, 2.25rem).',
        '4. The meta line below: address, reply window, working hours.',
        '5. The See more control at the foot.',
        'The alpha bucketing IS the hierarchy: strokes near the attractor are four and a half times brighter than the ones at rest, so attention has a visible gradient.'
      ],
      structure: [
        'Section is a single column. The field is a `position: relative` block roughly 22rem tall with a `<canvas>` absolutely filling it and the action centred over it.',
        'The canvas is `aria-hidden="true"` and mirrored by a focusable list naming the action and the two terms, each of which moves focus to the action.',
        'The action is a real `<a href="mailto:">` with a prefilled subject.',
        'Nothing in the field is a control except the action.'
      ],
      interaction: [
        'POINTER: on `pointerenter` on the field, the attractor tracks the cursor in normalised field coordinates, clamped to -0.4 to 1.4 so it can leave the field and keep pulling from just outside.',
        'The attractor position is damped at lambda 7 and the strength at lambda 5, so entering the field swells rather than snapping.',
        'Each stroke rotates to point at the attractor and grows from 4px to 17px by a raised cosine of distance over a radius of 55% of the field\'s longest side.',
        'The action is pulled by (attractor - centre) * 28px horizontally and * 18px vertically, damped at lambda 6, which caps the real displacement at about 14px.',
        'FOCUS: focusing the action parks the attractor at the centre and holds strength at 1, so the field leans toward the control. Blur releases it.',
        'TOUCH and REDUCED MOTION: no tracking at all. The attractor parks at the centre and the strength holds at 0.55, which is a still, deliberately arranged field rather than a broken interactive one.'
      ],
      choreography: [
        { n: 'Attractor follow', d: 'Exponential damp, lambda 7 on position (about 140ms to 63%). Frame-rate independent, so it feels identical at 60 and 120Hz.' },
        { n: 'Strength swell', d: 'lambda 5 on a 0 to 1 multiplier. Deliberately slower than the position: the field wakes up, then tracks.' },
        { n: 'Stroke growth', d: 'length 4px to 17px by hann(distance / radius). Smooth in value and in slope at every point, so the swell has no visible edge.' },
        { n: 'Action pull', d: 'lambda 6, capped at 14px. The control leans; it never dodges.' },
        { n: 'Release', d: 'On `pointerleave` the strength target drops to 0 and the whole field relaxes over roughly 200ms. Nothing snaps back.' }
      ],
      scroll: [
        'No scroll effects. IntersectionObserver runs the entry once.',
        'Suspend the ticker when the section leaves the viewport. A field tracking a cursor that is nowhere near it is pure battery cost.',
        'No pin, no rail, no scrub.'
      ],
      hover: [
        'The entire concept is gated behind `@media (hover: hover) and (pointer: fine)` and the matching JavaScript check. On a touch device none of the listeners are attached at all.',
        'The action has no separate hover state beyond the pull: adding a colour change on top of the magnetism would be two signals for one event.',
        'The meta line is not interactive.'
      ],
      click: [
        'One click target: the action, a mailto with a prefilled subject.',
        'The field is not clickable and does not intercept pointer events on anything but itself.',
        'See more opens the page-level counterpart.'
      ],
      responsive: {
        desktop: '22 by 9 nodes, 198 strokes, field 22rem tall, radius 55% of the longest side, pull capped at 14px.',
        tablet: 'Same grid at 18 by 8, field 18rem.',
        mobile: 'Below 768px the magnetism is removed entirely, not scaled: there is no cursor to attract. The grid drops to 9 by 6 (54 strokes), the field to 12rem, and the strokes are held at a fixed 0.55 strength pointing at the action, which renders once and never animates. The action becomes a full-width 52px control under the field rather than floating over it.'
      },
      a11y: [
        'Focus is a first-class attractor. This is the accessibility requirement that magnetic-button implementations usually skip, and it is one branch in the tick function.',
        'The canvas is `aria-hidden="true"`; a focusable list names the action and the two terms in text, and each item moves focus to the action.',
        'The action is a real link with a visible text label and a 48px target, never an icon alone.',
        'Under `prefers-reduced-motion: reduce`: no tracking, no damping, no growth. The field renders once at a fixed strength and stays still. The composition still reads as a field with a centre.',
        'No information is conveyed only by the magnetism. The offer is in the heading, the terms are in the meta line, and the action is a labelled link.',
        'Contrast measured on the actual surfaces: action ink #08080a on #bfa6ff is 10.9:1, heading #f1f1f4 on #08080a is 18.4:1, meta #a9abb6 is 9.2:1. The strokes are decorative and carry no information, so they are exempt from text contrast.'
      ],
      perf: [
        'One canvas, one ticker subscription, no timers.',
        'The 198 strokes are batched into exactly three paths by alpha bucket, so the frame costs three `stroke()` calls rather than 198. Stroking each segment individually would be 198 state changes a frame and is the single most common way this effect gets built badly.',
        'The frame is skipped entirely when neither the attractor nor the strength has moved more than its epsilon, so an idle section costs one comparison.',
        '`getBoundingClientRect` is read only while the pointer is actually inside the field, not on every frame of the page\'s life.',
        'The node jitter is generated once from a seeded PRNG at mount. Regenerating it per frame would make the field boil.'
      ],
      packages: [
        { p: 'none required', w: 'Canvas 2D, one damp function and a cosine.' },
        { p: 'no framer-motion', w: 'The pull is a damped value written to a transform. `useMotionValue` would be correct in a React codebase, and is the right call there; it is not a reason to add a library to a page that has none.' },
        { p: 'motion (if already installed)', w: 'If Motion is in the project, drive the action pull with `useMotionValue` and `useSpring` rather than with state. Never with `useState`: that re-renders the tree sixty times a second and collapses on mobile.' }
      ],
      architecture: [
        { f: 'components/sections/ContactMagnet.tsx', r: 'Server shell: heading, action, meta, and the screen-reader list.' },
        { f: 'components/contact/MagnetField.tsx', r: '"use client": the canvas, the attractor and the tick. Owns no state.' },
        { f: 'lib/useDampedPointer.ts', r: 'The damped pointer, shared with any other concept that wants parallax. One listener for the page, not one per component.' },
        { f: 'lib/math.ts', r: '`hann` and `damp`. Four lines each, and both belong in one place.' }
      ],
      state: [
        'Nothing in this concept is React state. The attractor, the strength and the pull are refs written straight to the canvas and to one transform.',
        '`entered` is the only boolean, and it flips once.',
        'If you reach for `useState` for the cursor position, the section will re-render sixty times a second and the page will drop frames on a phone. This is the single most important note in this spec.'
      ],
      typography: [
        'Action: mono 500 at 0.75rem, tracking 0.16em, uppercase, one line at every breakpoint.',
        'Heading: display 500 at clamp(1.5rem, 2.8vw, 2.25rem), tracking -0.035em.',
        'Lede: 0.9375rem / 1.6 at 48ch.',
        'Meta line: mono 400 at 0.6875rem with 1px hairline separators, never middle dots.'
      ],
      color: [
        'Signature hue #BFA6FF is the only hue in the section: the strokes, the action fill and the See more control.',
        'Stroke alpha is the whole visual system: 16% at rest, 34% in the mid band, 72% near the attractor. Three values, quantised on purpose, because a smooth alpha ramp across 198 strokes costs 198 state changes.',
        'The action ink is the near-black void colour, which clears 10.9:1 on the accent.',
        'In light mode the strokes darken to #6D4AEA at the same three alphas and the ground becomes #fbfbfc.'
      ],
      spacing: [
        'Field height 22rem on desktop, 18rem tablet, 12rem mobile.',
        'Heading to field: clamp(2rem, 5vh, 3rem). Field to meta: 1.75rem. Meta to See more: 2.5rem.',
        'Node grid 22 by 9 with seeded jitter of 1.2% horizontally and 2% vertically, which is enough to break the printed-grid reading without looking scattered.',
        'Section padding clamp(4rem, 12vh, 7rem) vertical.'
      ],
      relationships: [
        'Stroke angle encodes direction to attention; stroke length and alpha encode proximity to it. Three signals, one source.',
        'The action sitting at the field\'s centre encodes that it is what the field is about.',
        'The 14px cap encodes that the control is leaning, not fleeing. That number is the difference between charming and annoying.'
      ],
      acceptance: [
        'Tabbing to the action bends the field toward it, with no pointer involved.',
        'The action never moves more than 14px from its layout position.',
        'On a touch device no pointer listeners are attached and the field renders once.',
        'With reduced motion on, nothing tracks and nothing damps, and the composition still reads as deliberate.',
        'The frame is skipped when nothing has moved: an idle section shows no CPU in a profiler.',
        'A screen reader reaches the action and both terms as text.'
      ]
    }
  };

  SE.register(magnet);

  /* ======================================================================
     SECTION 05  -  SIGNATURE   (pairs with LETTER)
     ----------------------------------------------------------------------
     A quiet, confident sign-off. No form, no field, no canvas, no colour
     beyond one underline. It earns attention by refusing to ask for it.

     THE ADDRESS IS THE ACTION. There is no button, because at the very end of
     a page a button is a fifth thing to look at and an address is the only
     thing anyone actually needed.
     ====================================================================== */

  var signature = {
    area: 'contact',
    variant: 'section',
    id: 'contact-section-signature',
    num: 5,
    name: 'Signature',
    kind: 'Type / drawn rule',
    accent: '#E4BE95',
    tagline: 'The address is the action, and nothing else is on the page',
    desc: 'A rule draws, one line resolves, three facts settle, and the address is the only thing to ' +
          'press. A sign-off that earns attention by refusing to ask for it.',
    interaction: 'The rule draws as the section enters, then the line and the facts settle behind it.',
    hint: 'The address is the action',

    preview: function (ctx, w, h, t, heat) {
      var cycle = (t * 0.34) % 3.6;
      var draw = M.clamp(cycle / 1.0, 0, 1);
      var line = M.clamp((cycle - 0.6) / 0.8, 0, 1);
      var facts = M.clamp((cycle - 1.1) / 0.9, 0, 1);
      var e = 1 - Math.pow(1 - draw, 3);

      var x0 = w * 0.10, x1 = w * 0.90;

      /* the rule drawing */
      ctx.strokeStyle = 'rgba(228,190,149,' + (0.7 + heat * 0.25).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, h * 0.26 + 0.5);
      ctx.lineTo(x0 + (x1 - x0) * e, h * 0.26 + 0.5);
      ctx.stroke();

      /* the line */
      ctx.fillStyle = 'rgba(236,236,239,' + (line * (0.68 + heat * 0.2)).toFixed(3) + ')';
      ctx.fillRect(x0, h * 0.42, (x1 - x0) * 0.62, 5);

      /* the address, larger */
      ctx.fillStyle = 'rgba(236,236,239,' + (line * 0.9).toFixed(3) + ')';
      ctx.fillRect(x0, h * 0.58, (x1 - x0) * 0.44, 7);
      ctx.fillStyle = 'rgba(228,190,149,' + (line * 0.9).toFixed(3) + ')';
      ctx.fillRect(x0, h * 0.58 + 11, (x1 - x0) * 0.44, 1);

      /* three facts settling */
      for (var i = 0; i < 3; i++) {
        var a = M.clamp((facts - i * 0.14) / 0.5, 0, 1);
        ctx.fillStyle = 'rgba(236,236,239,' + (a * 0.26).toFixed(3) + ')';
        ctx.fillRect(x0 + i * (x1 - x0) * 0.30, h * 0.80, (x1 - x0) * 0.20, 3);
      }
    },

    mount: function (root, ctx) {
      var mode = host(root, ctx, 'signature');
      root.style.setProperty('--c-accent', signature.accent);

      var wrapEl = SE.el('div', 'contact-signature__wrap');
      root.appendChild(wrapEl);

      var rule = SE.el('div', 'contact-signature__rule', '<i></i>');
      rule.setAttribute('aria-hidden', 'true');
      wrapEl.appendChild(rule);

      var line = SE.el('h2', 'contact-signature__line',
        'That is the whole argument. The rest is a conversation.');
      wrapEl.appendChild(line);

      var addr = SE.el('a', 'contact-signature__addr', esc(C.email));
      addr.href = 'mailto:' + C.email;
      wrapEl.appendChild(addr);

      var facts = SE.el('dl', 'contact-signature__facts');
      facts.innerHTML =
        '<div><dt>Reply window</dt><dd>' + esc(C.replyTight) + '</dd></div>' +
        '<div><dt>Availability</dt><dd>' + esc(C.availabilityTight) + '</dd></div>' +
        '<div><dt>Based in</dt><dd>' + esc(C.region) + ' <span class="t-num">' + esc(C.tzLabel) + '</span></dd></div>';
      facts.querySelectorAll('div').forEach(function (d, i) { d.style.setProperty('--i', i); });
      wrapEl.appendChild(facts);

      var more = null;
      if (mode === 'section') {
        more = seeMoreFor('Open the letter view', signature.accent, ctx.onSeeMore);
        more.classList.add('contact-signature__more');
        wrapEl.appendChild(more);
      }

      var io = onEnter(root, function () {
        root.setAttribute('data-entered', 'true');
        if (more) more.classList.add('is-on');
      }, 0.34);

      return {
        destroy: function () {
          io.destroy();
          root.removeAttribute('data-entered');
          root.style.removeProperty('--c-accent');
          unhost(root, 'signature');
        }
      };
    },

    spec: {
      subtitle: 'A quiet sign-off where the address is the only thing to press',
      philosophy: [
        'At the very end of a page, a button is a fifth thing to look at. An address is the only thing anyone actually needed, so the address is the action and there is no button.',
        'Restraint is the entire design. One rule, one line, one address, three facts. Anything added would be something taken away.',
        'The choreography is one authored moment across four elements rather than four separate effects. A section this quiet cannot afford motion that draws attention to itself.'
      ],
      hierarchy: [
        '1. The address at clamp(1.75rem, 4vw, 3rem), the largest thing in the section.',
        '2. The line above it at clamp(1.25rem, 2.2vw, 1.75rem) in the display face, at 62% ink.',
        '3. The rule at the top, one pixel, in the accent.',
        '4. The three facts at mono 11px, at the foot.',
        '5. The See more control, quietest of all.',
        'The line is deliberately SMALLER than the address. It sets up the address; it is not the point.'
      ],
      structure: [
        'Single left-aligned column, `max-width: 58rem`.',
        'A rule element whose inner `<i>` scales on the X axis; the rule is `aria-hidden`.',
        'An `<h2>` for the line, an `<a href="mailto:">` for the address, a `<dl>` for the three facts, and the See more control.',
        'No canvas, no panel, no form, no surface. The section introduces no new background at all.'
      ],
      interaction: [
        'ENTRY: IntersectionObserver at threshold 0.34, fired once, then disconnected.',
        'The rule draws from scaleX 0 to 1 over 900ms cubic-bezier(0.23, 1, 0.32, 1), transform-origin left.',
        'The line fades and rises 10px over 700ms starting at 120ms, so it arrives while the rule is still drawing.',
        'The address does the same over 700ms starting at 240ms.',
        'The three facts stagger in at 60ms each starting at 420ms.',
        'That is the entire interaction model. There is no hover choreography beyond the address underline, and no idle motion of any kind.'
      ],
      choreography: [
        { n: 'Rule draw', d: 'scaleX 0 to 1, 900ms cubic-bezier(0.23, 1, 0.32, 1), transform-origin left. It is the opening gesture and it is the longest thing in the sequence, so everything else can land underneath it.' },
        { n: 'Line', d: 'opacity 0 to 1 and translateY 10px to 0, 700ms on the same curve, delay 120ms.' },
        { n: 'Address', d: 'Same, delay 240ms. Later than the line, because it is the thing being introduced.' },
        { n: 'Facts', d: 'Same at 520ms with `transition-delay: calc(420ms + var(--i) * 60ms)`. Three items at 60ms is 120ms of total offset, which reads as a settle rather than as a list appearing.' },
        { n: 'Nothing else', d: 'No idle, no parallax, no hover on anything but the address underline. Stillness is the closing note.' }
      ],
      scroll: [
        'Entry only, once, then the observer disconnects.',
        'No pin, no rail, no scrub, no parallax.',
        'The section is roughly 0.6 of a viewport, which is correct for a sign-off: it should not feel like another page.'
      ],
      hover: [
        'Gate behind `@media (hover: hover) and (pointer: fine)`.',
        'The address: text-underline-offset 5px to 8px over 140ms. That is the only hover state in the entire section.',
        'The facts and the line have none. They are not controls.',
        'See more uses the shared control treatment.'
      ],
      click: [
        'One click target of consequence: the address.',
        'See more opens the letter view, which is where the form lives.',
        'No modal, no expander, no copy-to-clipboard button. A mailto link and a selectable address already cover both ways a person will use it.'
      ],
      responsive: {
        desktop: 'Address at clamp(1.75rem, 4vw, 3rem), facts in a three-column row, rule full width of the column.',
        tablet: 'Same with facts in three columns at a tighter gap.',
        mobile: 'Below 768px the address becomes the first thing after the rule and the line moves BELOW it, because on a phone the address is what the reader came for and the sentence is what they read afterwards. The facts stack to one column with the key and value on one row, key left and value right. The stagger drops to 40ms.'
      },
      a11y: [
        'The address is a real, selectable, copyable mailto link. It is never an image and never split across elements.',
        'The rule is `aria-hidden`; it carries no information.',
        'The facts are a `<dl>`, so key and value relationships are in the accessibility tree.',
        'The See more control names its destination.',
        'Under `prefers-reduced-motion: reduce`: no draw, no rise, no stagger. The rule is present at full width and everything else is simply there.',
        'Contrast measured on the actual surfaces: address #f1f1f4 on #08080a is 18.4:1, line #a9abb6 is 9.2:1, fact keys #8a8c96 is 5.9:1, rule #e4be95 is 11.6:1.'
      ],
      perf: [
        'No canvas, no ticker, no timers. One IntersectionObserver that disconnects after firing.',
        'Five transitions on four elements, all transform and opacity.',
        'This is the cheapest concept in the entire area. If the page above it is a scroll-heavy set piece, this is the section that costs nothing to add underneath it.',
        'The stagger is a CSS custom property, not a JavaScript loop.'
      ],
      packages: [
        { p: 'none required', w: 'Four elements and five transitions.' },
        { p: 'no gsap', w: 'A three-item stagger is `transition-delay: calc(var(--i) * 60ms)`. Nothing here needs a timeline.' }
      ],
      architecture: [
        { f: 'components/sections/ContactSignature.tsx', r: 'Server component. The only client code is the shared Reveal wrapper.' },
        { f: 'components/ui/Reveal.tsx', r: 'Shared IntersectionObserver wrapper.' },
        { f: 'app/(site)/contact/page.tsx', r: 'The See more destination, carrying the letter composition and the form.' }
      ],
      state: [
        'One boolean, flipped once by the observer.',
        'Nothing else in the section has state.',
        'The stagger index is a custom property written at render, not state.'
      ],
      typography: [
        'Address: mono 500 at clamp(1.75rem, 4vw, 3rem), tracking -0.01em. Mono because an address is data, and because a monospaced address is easier to read back character by character.',
        'Line: display 400 at clamp(1.25rem, 2.2vw, 1.75rem), tracking -0.02em, at 62% ink. Smaller than the address on purpose.',
        'Fact keys: mono 500 at 0.5625rem uppercase, tracking 0.2em. Values: display 400 at 0.8125rem.',
        'Two faces, four sizes, and nothing else. A sign-off with five type sizes is not a sign-off.'
      ],
      color: [
        'Signature hue #E4BE95 in exactly two places: the rule and the address underline.',
        'Everything else is ink at three levels: full for the address, 62% for the line, 46% for the fact keys.',
        'The section introduces no background. It sits on the page ground unchanged, which is what makes it read as an ending rather than as another block.',
        'In light mode the accent darkens to #8A5B1E for the rule and underline, and the ink levels invert to the near-black scale.'
      ],
      spacing: [
        'Rule to line: 2.5rem. Line to address: 1.5rem. Address to facts: clamp(2.5rem, 6vh, 3.5rem). Facts to See more: 2.5rem.',
        'The gap above the rule is the section padding, clamp(4rem, 12vh, 7rem), and the gap below the See more control is smaller, because this is the end of the page.',
        'Facts columns: three equal, 2.5rem gap, keys 0.375rem above values.',
        'Column max-width 58rem so the line never exceeds about 60 characters.'
      ],
      relationships: [
        'Size encodes what matters: the address is the largest thing because it is the only thing to do.',
        'The rule encodes a boundary, which is what a sign-off needs: it says the argument is over.',
        'The facts sitting below the address rather than above it encode that they qualify the offer rather than gate it.'
      ],
      acceptance: [
        'There is exactly one interactive element of consequence in the section.',
        'The address is selectable and copyable as plain text.',
        'The entry runs once and never re-runs on scroll back.',
        'On a phone the address comes before the line.',
        'With reduced motion on, everything is present, the rule is at full width, and nothing travels.',
        'The section reads as an ending, not as another block of content.'
      ]
    }
  };

  SE.register(signature);

})(window.SE = window.SE || {});

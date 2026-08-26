/* ============================================================================
   BOOT
   ----------------------------------------------------------------------------
   Everything above this file only defines. Nothing runs until here, so script
   order in index.html only has to satisfy definitions, not calls.
   ========================================================================== */
(function (SE) {
  'use strict';

  /* The six page concepts and five section concepts predate the registry: they
     were written when Skills was the only area. Rather than rewrite eleven
     working files to add one property each, they are adapted here. New areas
     call SE.register() directly and never come through this path. */
  function adaptSkills() {
    ['orbit', 'reel', 'lattice', 'kinetic', 'deck', 'strata'].forEach(function (id) {
      var c = SE.concepts && SE.concepts[id];
      if (!c) return;
      SE.register({
        area: 'skills', variant: 'page', id: c.id, num: c.num, name: c.name,
        kind: c.kind, accent: c.accent, tagline: c.tagline, desc: c.desc,
        interaction: c.interaction, hint: c.hint, mount: c.mount
      });
    });

    ['signal', 'columns', 'mask', 'plates', 'depth'].forEach(function (id) {
      var c = SE.sections && SE.sections[id];
      if (!c) return;
      SE.register({
        area: 'skills', variant: 'section', id: c.id, num: c.num, name: c.name,
        kind: c.kind, accent: c.accent, tagline: c.tagline, desc: c.desc,
        interaction: c.interaction, hint: c.hint, screens: c.screens,
        /* these five implement both modes themselves, so "See more" re-mounts
           the same concept rather than jumping to an unrelated page concept */
        dual: true,
        mount: c.mount
      });
    });
  }

  function start() {
    if (window.gsap) {
      SE.env.gsap = true;
      if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.ticker.lagSmoothing(200, 33);
    } else {
      /* No CDN. Everything still works; choreography degrades to instant state
         changes and CSS transitions. */
      document.documentElement.classList.add('no-gsap');
      console.warn('[explorer] GSAP unavailable - running without choreography.');
    }

    adaptSkills();

    var n = SE.registry.all.length;
    if (!n) {
      console.error('[explorer] No concepts registered.');
      return;
    }
    console.info('[explorer] ' + n + ' concepts across ' +
      SE.AREAS.filter(function (a) { return SE.areaCount(a.id) > 0; }).length + ' areas.');

    SE.shell.boot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})(window.SE = window.SE || {});

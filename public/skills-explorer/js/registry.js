/* ============================================================================
   REGISTRY  -  the single contract every concept in the explorer registers on.
   ----------------------------------------------------------------------------
   The explorer grew from one gallery of six into seven areas of a portfolio,
   each with page-level and section-level directions, authored in parallel. That
   only works if nobody edits anybody else's files, so this is the whole seam:
   an area file calls SE.register() and touches nothing else.

   The shell owns index.html, the stage, the previews harness, and the prompt
   composer. Area files own their own concepts and their own stylesheet. There
   is no third category.
   ========================================================================== */
(function (SE) {
  'use strict';

  /* Display order of the galleries. Adding an area here plus its two files is
     the entire cost of adding a new portfolio surface. */
  SE.AREAS = [
    /* A blurb may be a function, resolved at render time. The skills blurb
       cites counts, and hardcoding them guarantees they go stale the first
       time someone edits data.js - which the README tells them to do. */
    { id: 'skills',     label: 'Skills',
      blurb: function () {
        return SE.DATA.skills.length + ' technologies across ' +
               SE.DATA.categories.length + ' layers.';
      } },
    { id: 'hero',       label: 'Hero',       blurb: 'The first five seconds.' },
    { id: 'about',      label: 'About',      blurb: 'The person behind the stack.' },
    { id: 'projects',   label: 'Projects',   blurb: 'The work, and the argument each piece makes.' },
    { id: 'experience', label: 'Experience', blurb: 'Where the time actually went.' },
    { id: 'contact',    label: 'Contact',    blurb: 'The last thing they read before deciding.' },
    { id: 'nav',        label: 'Navigation', blurb: 'Navbars and docks. Always present, never loud.' }
  ];

  var registry = { all: [], byId: {}, byArea: {} };
  SE.registry = registry;

  SE.AREAS.forEach(function (a) {
    registry.byArea[a.id] = { page: [], section: [] };
  });

  var REQUIRED = ['area', 'variant', 'id', 'num', 'name', 'kind', 'accent', 'desc', 'interaction', 'mount'];

  /* Registration is validated loudly. A concept that half-registers and then
     throws at mount time is far more expensive to debug than one that refuses
     to register with a named reason. */
  SE.register = function (c) {
    for (var i = 0; i < REQUIRED.length; i++) {
      if (c[REQUIRED[i]] == null) {
        console.error('[registry] concept rejected, missing "' + REQUIRED[i] + '"', c);
        return false;
      }
    }
    if (c.variant !== 'page' && c.variant !== 'section') {
      console.error('[registry] concept rejected, variant must be "page" or "section"', c.id);
      return false;
    }
    if (!registry.byArea[c.area]) {
      console.error('[registry] concept rejected, unknown area "' + c.area + '"', c.id);
      return false;
    }
    if (registry.byId[c.id]) {
      console.error('[registry] concept rejected, duplicate id "' + c.id + '"');
      return false;
    }
    if (typeof c.mount !== 'function') {
      console.error('[registry] concept rejected, mount must be a function', c.id);
      return false;
    }

    c.screens = c.screens || 1;
    registry.byId[c.id] = c;
    registry.byArea[c.area][c.variant].push(c);
    registry.all.push(c);
    return true;
  };

  SE.list = function (area, variant) {
    var bucket = registry.byArea[area];
    if (!bucket) return [];
    return bucket[variant].slice().sort(function (a, b) { return a.num - b.num; });
  };

  SE.get = function (id) { return registry.byId[id]; };

  SE.areaCount = function (area) {
    var b = registry.byArea[area];
    return b ? b.page.length + b.section.length : 0;
  };

})(window.SE = window.SE || {});

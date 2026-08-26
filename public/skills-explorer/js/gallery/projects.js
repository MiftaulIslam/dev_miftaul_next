/* ============================================================================
   AREA  -  PROJECTS
   ----------------------------------------------------------------------------
   Ten directions for the part of a portfolio that is actually the product: the
   work itself. Five page-level takeovers and five section-level teasers, each
   pairing with a page of the same family.

   THE ARTWORK PROBLEM, AND HOW IT IS SOLVED HERE
   ----------------------------------------------
   There is no asset pipeline in this explorer, and a projects gallery without
   artwork is a list of nouns. Two escape hatches are refused outright: a stock
   photo (a lie about the work) and a div-built fake screenshot (the single most
   recognisable machine-generated tell there is).

   Instead every project owns a PLATE: a canvas drawing that is a picture of
   what the project actually does. Halyard is a promotion graph. Tidewater is a
   reconciliation field. Quarry is a core sample with citations pointing into
   it. All six are deterministic - seeded from the project id through SE.rng -
   so a reload never reshuffles them, and all six are drawn from the project's
   own hue so the page is coloured by its contents rather than by a theme.

   >>> IN THE PRODUCTION BUILD THESE PLATES ARE PLACEHOLDERS. <<<
   Swap each one for a real capture of the running product: a screen recording
   poster frame, an architecture diagram exported from the real system, a photo
   of the hardware. The plate exists so the composition can be judged with
   something honest in the frame, not so it can ship.

   FILE MAP
   --------
     content        the six invented projects, and the helpers that read them
     art            six plate painters plus the canvas host that drives them
     case           one shared case panel, used by four of the ten concepts
     page 1..5      Reel, Drift, Index, Coverflow, Dossier
     section 1..5   Strip, Anchor, Sequence, Roster, Relay
   ========================================================================== */
(function (SE) {
  'use strict';

  if (!SE.register) {
    console.error('[projects] SE.register is missing; the registry did not load.');
    return;
  }

  var AREA = 'projects';
  var M = SE.math;
  var TAU = Math.PI * 2;

  /* ==========================================================================
     CONTENT
     --------------------------------------------------------------------------
     Six projects, invented here rather than in data.js, because data.js belongs
     to the Skills area and nobody owns two files at once.

     `outcome` is deliberately a fact rather than a percentage. "Improved
     performance by 92%" is a number nobody can check and everybody discounts;
     "rollback became one action instead of a runbook" is a claim a reader can
     interrogate in an interview, which is the entire point of a portfolio.
     ======================================================================== */
  var PROJECTS = [
    {
      id: 'halyard',
      name: 'Halyard',
      discipline: 'Release platform',
      role: 'Lead engineer',
      year: 2025,
      accent: '#E8B33C',
      art: 'pipeline',
      figure: 'Promotion path across three environments, with the gate that holds it',
      problem: 'Forty services shipped through a chat channel and a shared spreadsheet.',
      outcome: 'Deploys became signed promotions between environments, and rollback became one action instead of a runbook.',
      detail: 'Every environment is a checkpoint with its own signature, so a build cannot skip staging and a rollback ' +
              'is a promotion in reverse rather than a redeploy of an older tag. The gate is a queue: releases wait, ' +
              'they do not race. The interesting engineering was not the pipeline, it was making the failure modes ' +
              'boring enough that nobody needed to be on call for a deploy.',
      tech: ['go', 'docker', 'actions', 'aws', 'postgres', 'redis']
    },
    {
      id: 'tidewater',
      name: 'Tidewater',
      discipline: 'Freight reconciliation',
      role: 'Backend lead',
      year: 2024,
      accent: '#3FA9C9',
      art: 'flow',
      figure: 'Carrier events landing against the settlement window',
      problem: 'Carrier invoices and shipment events arrived in nine formats and were reconciled by hand each morning.',
      outcome: 'The nightly batch became a streaming reconciler, so a disputed invoice is answerable the same hour it lands.',
      detail: 'Nine ingest adapters normalise into one event shape, and settlement is a fold over that stream rather ' +
              'than a job that runs at two in the morning. Late and duplicate events were the whole problem: the ' +
              'reconciler is idempotent per shipment and keeps the raw payload, so a correction six days late still ' +
              'lands in the right place and the audit trail survives.',
      tech: ['node', 'nestjs', 'prisma', 'postgres', 'redis', 'docker']
    },
    {
      id: 'ashmore',
      name: 'Ashmore',
      discipline: 'Clinical referral',
      role: 'Full-stack engineer',
      year: 2024,
      accent: '#7C8CF8',
      art: 'ledger',
      figure: 'Three clinic records collapsing into one referral of record',
      problem: 'Referrals moved between three clinics as faxed PDFs and were re-typed at every hop.',
      outcome: 'One structured referral of record replaced the re-typing, and each clinic kept the system it already ran.',
      detail: 'Nobody was going to replace three working MSSQL installations, so the referral record became the only ' +
              'new thing and each clinic reads it through a single versioned contract. Re-typing disappeared because ' +
              'there was no longer a second place to type into. The hard part was consent: a referral carries only ' +
              'the fields the receiving clinic is entitled to see, and that filter lives in the contract, not the UI.',
      tech: ['nextjs', 'typescript', 'tailwind', 'rest', 'dotnet', 'mssql']
    },
    {
      id: 'fieldbook',
      name: 'Fieldbook',
      discipline: 'Offline survey',
      role: 'Product engineer',
      year: 2023,
      accent: '#5FC27E',
      art: 'mesh',
      figure: 'Survey points recorded offline, with the merge boundary',
      problem: 'Inspectors worked in basements and tunnels with no signal, then lost an afternoon of notes on the drive back.',
      outcome: 'The local copy became authoritative and the server became the thing that merges, so losing signal stopped being an incident.',
      detail: 'Writes go to the device first and sync when there is something to sync to. Conflicts are real and ' +
              'frequent, so they are shown rather than resolved silently: two inspectors on the same asset get a ' +
              'side-by-side and a decision, once, at the point where somebody actually knows which reading is right.',
      tech: ['react', 'typescript', 'mongo', 'express', 'node', 'aws']
    },
    {
      id: 'quarry',
      name: 'Quarry',
      discipline: 'Archive retrieval',
      role: 'Lead engineer',
      year: 2025,
      accent: '#E0664F',
      art: 'core',
      figure: 'Retrieved passages, plotted against the depth they were cited from',
      problem: 'Thirty years of drawings, specifications and site reports were searchable only by filename.',
      outcome: 'Every answer cites the page it came from, and reviewers rejected wrong citations until retrieval stopped producing them.',
      detail: 'Hybrid retrieval over chunked documents, reranked, then answered with the passages in the prompt and ' +
              'the page numbers in the output. The eval harness is the product: a reviewer marks a citation right or ' +
              'wrong, that judgement becomes a fixture, and no retrieval change ships without the fixtures passing. ' +
              'The model was never the hard part.',
      tech: ['llm', 'rag', 'postgres', 'nextjs', 'typescript', 'redis']
    },
    {
      id: 'gantry',
      name: 'Gantry',
      discipline: 'Design system',
      role: 'Design engineer',
      year: 2023,
      accent: '#CFC6AE',
      art: 'plate',
      figure: 'Type scale and state matrix, as published to the workshop route',
      problem: 'Four product teams each maintained their own button, and none of them agreed on what disabled meant.',
      outcome: 'One token layer and one motion spec, published to a workshop route where any state of any component has its own link.',
      detail: 'The system shipped as tokens first and components second, because a component library without a token ' +
              'layer just relocates the disagreement. Every state of every component is addressable by URL, so a bug ' +
              'report is a link rather than a screenshot, and the motion spec is a single file of curves and ' +
              'durations that the components import instead of inventing.',
      tech: ['react', 'typescript', 'tailwind', 'gsap', 'nextjs', 'vercel']
    }
  ];

  /* Decision records. Every entry names what was chosen, what was rejected,
     and why - because "we used Postgres" is a fact and "we chose one record
     with three readers over three-way sync" is an argument, and only the
     second one is worth a reader's attention. Kept beside the projects rather
     than inside the one concept that renders them, since they are content. */
  var DECISIONS = {
    halyard: [
      { chose: 'Promote the built artefact', over: 'Rebuild per environment',
        because: 'A rollback has to be the same bytes that passed staging, not a fresh build of an old tag.' },
      { chose: 'A queue at the gate', over: 'First writer wins',
        because: 'Two releases racing is a Friday night incident, not a throughput problem.' },
      { chose: 'Environment as a record', over: 'Environment as a pipeline stage',
        because: 'A checkpoint you can query is a checkpoint you can still audit six months later.' }
    ],
    tidewater: [
      { chose: 'A fold over the event stream', over: 'A nightly batch job',
        because: 'A dispute that arrives at ten in the morning should not wait for two the next morning.' },
      { chose: 'Keep the raw payload beside the parsed one', over: 'Parse and discard',
        because: 'The ninth format is always the one that turns out to have been read wrong.' },
      { chose: 'Idempotent per shipment', over: 'Deduplicate at ingest',
        because: 'Carriers resend, and a resend six days late still has to land in the right settlement window.' }
    ],
    ashmore: [
      { chose: 'One referral of record', over: 'Three-way sync between the clinics',
        because: 'Sync between three systems is three problems. A record with three readers is one.' },
      { chose: 'Field visibility in the contract', over: 'Field visibility in the interface',
        because: 'Consent that lives in a component leaks the first time somebody writes a second component.' },
      { chose: 'Leave the existing installations alone', over: 'Migrate all three',
        because: 'Nobody funds a migration that produces no new capability, and the referral was the capability.' }
    ],
    fieldbook: [
      { chose: 'The device is the source of truth', over: 'The server is the source of truth',
        because: 'An inspector in a tunnel is not offline. They are the only person holding the reading.' },
      { chose: 'Show the conflict', over: 'Last write wins',
        because: 'Two readings of one asset is a question for the people who took them, not for a timestamp.' },
      { chose: 'A per-record sync log', over: 'Whole-database replication',
        because: 'A survey is a few hundred small facts, and replaying facts is something you can debug.' }
    ],
    quarry: [
      { chose: 'Cite the page, every time', over: 'Answer in prose',
        because: 'An answer a reviewer cannot check is an answer nobody is allowed to act on.' },
      { chose: 'Reviewer judgements become fixtures', over: 'A one-off accuracy report',
        because: 'A number measured once is a number that regresses quietly.' },
      { chose: 'Hybrid retrieval, then rerank', over: 'Embeddings alone',
        because: 'Thirty years of drawings are full of part numbers, and part numbers do not embed.' }
    ],
    gantry: [
      { chose: 'Tokens first, components second', over: 'Components first',
        because: 'A component library without a token layer just relocates the disagreement.' },
      { chose: 'Every state has a URL', over: 'A gallery of happy paths',
        because: 'A bug report should be a link, not a screenshot with an arrow drawn on it.' },
      { chose: 'One motion file the components import', over: 'Per-component easing',
        because: 'Four teams inventing curves is how a system ends up with nine different ideas of fast.' }
    ]
  };
  PROJECTS.forEach(function (p) { p.decisions = DECISIONS[p.id] || []; });

  /* srList wants `{name, categoryLabel, role, note}`; the projects carry
     different field names, so mirror rather than contort the content model. */
  PROJECTS.forEach(function (p, i) {
    p.index = i;
    p.num = SE.pad(i + 1);
    p.categoryLabel = p.discipline + ', ' + p.year;
    p.note = p.problem + ' ' + p.outcome;
    p.rgb = SE.hexToRgb(p.accent);
  });

  var TOTAL = SE.pad(PROJECTS.length);

  /* Deterministic per-project seed. Two projects must never share a layout by
     accident, and the same project must never change between reloads. */
  function seedOf(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h >>> 0;
  }
  PROJECTS.forEach(function (p) { p.seed = seedOf(p.id); });

  /* Technology names resolved from SE.DATA at call time, never at file-eval
     time: script order is the shell's business, not this file's. */
  function techOf(p) {
    var D = SE.DATA;
    return p.tech.map(function (id) {
      var s = D && D.byId && D.byId[id];
      return s ? s.name : id;
    });
  }

  function techMarkup(p, limit) {
    var list = techOf(p);
    if (limit) list = list.slice(0, limit);
    return list.map(function (n) {
      return '<span>' + n + '</span>';
    }).join('');
  }

  function srItems() {
    return PROJECTS.map(function (p) {
      return { name: p.name, categoryLabel: p.categoryLabel, role: p.role, note: p.note, p: p };
    });
  }

  /* ==========================================================================
     ART  -  six plate painters
     --------------------------------------------------------------------------
     Every painter has the same signature and the same contract: draw into a
     w x h box using only the project's own hue plus the shell's neutrals, be
     fully determined by `rand` (a seeded SE.rng), and treat `t` as optional.
     A painter that needs `t` to look finished has failed, because most of these
     plates are painted once and then left alone for the rest of the session.
     ======================================================================== */
  var ART = {};

  function rgba(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; }
  var INK = function (a) { return 'rgba(236,236,239,' + a + ')'; };

  /* ---------------------------------------------------------------- pipeline */
  /* HALYARD. Three environment columns, orthogonally routed, with one lit
     promotion path and a gate that the path has to wait at. */
  ART.pipeline = function (cx, w, h, p, t) {
    var rand = SE.rng(p.seed);
    var cols = 3;
    var padX = w * 0.14, padY = h * 0.18;
    var innerW = w - padX * 2, innerH = h - padY * 2;
    var nodes = [];

    for (var c = 0; c < cols; c++) {
      var n = 3 + Math.floor(rand() * 2);
      var x = padX + (c / (cols - 1)) * innerW;
      for (var i = 0; i < n; i++) {
        nodes.push({ c: c, x: x, y: padY + ((i + 0.5) / n) * innerH + (rand() - 0.5) * innerH * 0.06 });
      }
    }

    /* every edge first, faint, so the lit path reads as a selection out of a
       real graph rather than as the only thing that exists */
    cx.lineWidth = 1;
    cx.strokeStyle = INK(0.10);
    for (var a = 0; a < nodes.length; a++) {
      for (var b = 0; b < nodes.length; b++) {
        if (nodes[b].c !== nodes[a].c + 1) continue;
        if (rand() > 0.62) continue;
        var mx = (nodes[a].x + nodes[b].x) / 2;
        cx.beginPath();
        cx.moveTo(nodes[a].x, nodes[a].y);
        cx.lineTo(mx, nodes[a].y);
        cx.lineTo(mx, nodes[b].y);
        cx.lineTo(nodes[b].x, nodes[b].y);
        cx.stroke();
      }
    }

    var path = [nodes[0], nodes[3], nodes[nodes.length - 1]];
    cx.strokeStyle = rgba(p.rgb, 0.9);
    cx.lineWidth = 1.6;
    cx.beginPath();
    cx.moveTo(path[0].x, path[0].y);
    for (var k = 1; k < path.length; k++) {
      var mid = (path[k - 1].x + path[k].x) / 2;
      cx.lineTo(mid, path[k - 1].y);
      cx.lineTo(mid, path[k].y);
      cx.lineTo(path[k].x, path[k].y);
    }
    cx.stroke();

    nodes.forEach(function (nd) {
      var lit = path.indexOf(nd) >= 0;
      cx.fillStyle = lit ? rgba(p.rgb, 1) : INK(0.28);
      cx.fillRect(nd.x - 3, nd.y - 3, 6, 6);
    });

    /* the gate: a bar the promotion has to clear */
    var gx = padX + innerW * 0.5;
    cx.strokeStyle = rgba(p.rgb, 0.34);
    cx.beginPath();
    cx.moveTo(gx, padY - h * 0.06);
    cx.lineTo(gx, padY + innerH + h * 0.06);
    cx.stroke();

    if (t != null) {
      var tp = (t * 0.22) % 1;
      var seg = Math.min(path.length - 2, Math.floor(tp * (path.length - 1)));
      var f = (tp * (path.length - 1)) - seg;
      var A = path[seg], B = path[seg + 1];
      cx.beginPath();
      cx.arc(A.x + (B.x - A.x) * f, A.y + (B.y - A.y) * f, 2.6, 0, TAU);
      cx.fillStyle = '#fff';
      cx.fill();
    }

    cx.font = '500 9px "JetBrains Mono", monospace';
    cx.fillStyle = INK(0.30);
    cx.textAlign = 'center';
    ['DEV', 'STAGE', 'PROD'].forEach(function (lbl, ci) {
      cx.fillText(lbl, padX + (ci / (cols - 1)) * innerW, h - padY * 0.42);
    });
    cx.textAlign = 'left';
  };

  /* -------------------------------------------------------------------- flow */
  /* TIDEWATER. A colour field: bands of the project hue at seeded densities,
     three phase-shifted curves over them, and event ticks along the floor. */
  ART.flow = function (cx, w, h, p, t) {
    var rand = SE.rng(p.seed);
    var bands = 11;
    var bh = h / bands;
    for (var i = 0; i < bands; i++) {
      var d = 0.03 + rand() * 0.16 * (1 - Math.abs(i / bands - 0.45) * 1.2);
      cx.fillStyle = rgba(p.rgb, Math.max(0.015, d));
      cx.fillRect(0, i * bh, w, bh - 0.5);
    }

    var phase = t == null ? 0 : t * 0.5;
    for (var c = 0; c < 3; c++) {
      cx.beginPath();
      cx.lineWidth = c === 0 ? 1.6 : 1;
      cx.strokeStyle = rgba(p.rgb, c === 0 ? 0.85 : 0.26);
      for (var x = 0; x <= w; x += 5) {
        var u = x / w;
        var y = h * 0.52
              + Math.sin(u * 7.1 + phase + c * 1.7) * h * 0.13
              + Math.sin(u * 17.3 - phase * 0.6 + c) * h * 0.045;
        if (x === 0) cx.moveTo(x, y); else cx.lineTo(x, y);
      }
      cx.stroke();
    }

    cx.strokeStyle = INK(0.22);
    cx.lineWidth = 1;
    cx.beginPath();
    for (var k = 0; k < 24; k++) {
      var tx = Math.round(rand() * w) + 0.5;
      var th = 4 + rand() * 12;
      cx.moveTo(tx, h - 1);
      cx.lineTo(tx, h - 1 - th);
    }
    cx.stroke();
  };

  /* ------------------------------------------------------------------ ledger */
  /* ASHMORE. Three offset page rectangles collapsing into one, with a single
     thread running through all of them. The picture is the argument. */
  ART.ledger = function (cx, w, h, p) {
    var rand = SE.rng(p.seed);
    var pw = w * 0.42, ph = h * 0.62;
    var base = { x: w * 0.5 - pw * 0.5, y: h * 0.5 - ph * 0.5 };

    for (var i = 2; i >= 0; i--) {
      var ox = base.x + (i - 1) * w * 0.10;
      var oy = base.y + (i - 1) * h * 0.07;
      cx.fillStyle = i === 1 ? 'rgba(16,16,21,0.96)' : 'rgba(11,11,15,0.9)';
      cx.fillRect(ox, oy, pw, ph);
      cx.strokeStyle = i === 1 ? rgba(p.rgb, 0.75) : INK(0.14);
      cx.lineWidth = 1;
      cx.strokeRect(ox + 0.5, oy + 0.5, pw - 1, ph - 1);

      cx.strokeStyle = INK(i === 1 ? 0.14 : 0.07);
      cx.beginPath();
      for (var r = 1; r <= 9; r++) {
        var ry = Math.round(oy + (r / 10) * ph) + 0.5;
        cx.moveTo(ox + pw * 0.10, ry);
        cx.lineTo(ox + pw * (0.34 + rand() * 0.54), ry);
      }
      cx.stroke();
    }

    /* the thread: one line entering the left copy and leaving the right one */
    cx.strokeStyle = rgba(p.rgb, 0.9);
    cx.lineWidth = 1.4;
    cx.beginPath();
    cx.moveTo(0, h * 0.5 - h * 0.07);
    cx.lineTo(base.x - w * 0.10 + pw * 0.5, h * 0.5 - h * 0.07);
    cx.lineTo(base.x + pw * 0.5, h * 0.5);
    cx.lineTo(base.x + w * 0.10 + pw * 0.5, h * 0.5 + h * 0.07);
    cx.lineTo(w, h * 0.5 + h * 0.07);
    cx.stroke();

    cx.fillStyle = rgba(p.rgb, 1);
    cx.fillRect(base.x + pw * 0.5 - 3, h * 0.5 - 3, 6, 6);
  };

  /* -------------------------------------------------------------------- mesh */
  /* FIELDBOOK. A survey triangulation: jittered grid points, near-neighbour
     links, a shaded surveyed region and the points actually recorded. */
  ART.mesh = function (cx, w, h, p, t) {
    var rand = SE.rng(p.seed);
    var cols = 7, rows = 5, pts = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        pts.push({
          x: w * (0.08 + (c / (cols - 1)) * 0.84) + (rand() - 0.5) * (w / cols) * 0.55,
          y: h * (0.12 + (r / (rows - 1)) * 0.76) + (rand() - 0.5) * (h / rows) * 0.55,
          rec: rand() > 0.66
        });
      }
    }

    var lim = Math.min(w / cols, h / rows) * 1.45;
    cx.strokeStyle = INK(0.10);
    cx.lineWidth = 1;
    cx.beginPath();
    for (var a = 0; a < pts.length; a++) {
      for (var b = a + 1; b < pts.length; b++) {
        var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
        if (dx * dx + dy * dy > lim * lim) continue;
        cx.moveTo(pts[a].x, pts[a].y);
        cx.lineTo(pts[b].x, pts[b].y);
      }
    }
    cx.stroke();

    /* surveyed region, drawn as a closed hull over one block of the grid */
    var hull = [pts[cols + 1], pts[cols + 4], pts[cols * 3 + 5], pts[cols * 3 + 1]];
    cx.beginPath();
    cx.moveTo(hull[0].x, hull[0].y);
    for (var k = 1; k < hull.length; k++) cx.lineTo(hull[k].x, hull[k].y);
    cx.closePath();
    cx.fillStyle = rgba(p.rgb, 0.10);
    cx.fill();
    cx.strokeStyle = rgba(p.rgb, 0.45);
    cx.stroke();

    pts.forEach(function (pt) {
      if (!pt.rec) {
        cx.fillStyle = INK(0.22);
        cx.fillRect(pt.x - 1, pt.y - 1, 2, 2);
        return;
      }
      cx.beginPath();
      cx.arc(pt.x, pt.y, 2.4, 0, TAU);
      cx.fillStyle = rgba(p.rgb, 0.95);
      cx.fill();
    });

    if (t != null) {
      var pulse = (t * 0.5) % 1;
      cx.beginPath();
      cx.arc(pts[cols * 2 + 3].x, pts[cols * 2 + 3].y, 4 + pulse * 22, 0, TAU);
      cx.strokeStyle = rgba(p.rgb, (1 - pulse) * 0.5);
      cx.stroke();
    }
  };

  /* -------------------------------------------------------------------- core */
  /* QUARRY. A core sample: stacked sediment, depth ticks, and leader lines from
     three bands out to the citations that referenced them. */
  ART.core = function (cx, w, h, p) {
    var rand = SE.rng(p.seed);
    var cw = w * 0.20;
    var cx0 = w * 0.30;
    var top = h * 0.10, bot = h * 0.90;
    var y = top, bands = [];

    while (y < bot) {
      var bh = Math.min(bot - y, (bot - top) * (0.045 + rand() * 0.10));
      bands.push({ y: y, h: bh, a: 0.06 + rand() * 0.55, hot: rand() > 0.74 });
      y += bh;
    }

    bands.forEach(function (b) {
      cx.fillStyle = b.hot ? rgba(p.rgb, b.a) : INK(b.a * 0.30);
      cx.fillRect(cx0, b.y, cw, b.h - 0.5);
    });
    cx.strokeStyle = INK(0.20);
    cx.lineWidth = 1;
    cx.strokeRect(cx0 + 0.5, top + 0.5, cw - 1, bot - top - 1);

    cx.strokeStyle = INK(0.16);
    cx.font = '500 8px "JetBrains Mono", monospace';
    cx.fillStyle = INK(0.34);
    cx.textAlign = 'right';
    cx.beginPath();
    for (var d = 0; d <= 6; d++) {
      var ty = Math.round(top + (d / 6) * (bot - top)) + 0.5;
      cx.moveTo(cx0 - 10, ty);
      cx.lineTo(cx0, ty);
      cx.fillText(String(d * 5), cx0 - 14, ty + 3);
    }
    cx.stroke();
    cx.textAlign = 'left';

    var hot = bands.filter(function (b) { return b.hot; }).slice(0, 3);
    cx.strokeStyle = rgba(p.rgb, 0.7);
    hot.forEach(function (b, i) {
      var ly = b.y + b.h / 2;
      var lx = cx0 + cw;
      var ex = w * (0.66 + i * 0.09);
      cx.beginPath();
      cx.moveTo(lx, ly);
      cx.lineTo(lx + w * 0.06, ly);
      cx.lineTo(ex, h * (0.24 + i * 0.24));
      cx.lineTo(ex + w * 0.10, h * (0.24 + i * 0.24));
      cx.stroke();
      cx.fillStyle = rgba(p.rgb, 0.95);
      cx.fillRect(ex + w * 0.10 - 3, h * (0.24 + i * 0.24) - 3, 6, 6);
    });
  };

  /* ------------------------------------------------------------------- plate */
  /* GANTRY. A specimen plate: the wordmark set oversize and clipped by the
     frame, typographic rules drawn across it, and the token scale beneath. */
  ART.plate = function (cx, w, h, p) {
    var rand = SE.rng(p.seed);
    var fs = Math.round(h * 0.74);
    cx.font = '700 ' + fs + 'px "Space Grotesk", sans-serif';
    cx.textBaseline = 'alphabetic';
    var baseY = h * 0.78;

    cx.fillStyle = INK(0.10);
    cx.fillText(p.name, -w * 0.04, baseY);
    cx.strokeStyle = rgba(p.rgb, 0.55);
    cx.lineWidth = 1;
    cx.strokeText(p.name, -w * 0.04, baseY);

    var rules = [
      { y: baseY, label: 'BASELINE' },
      { y: baseY - fs * 0.52, label: 'X-HEIGHT' },
      { y: baseY - fs * 0.72, label: 'CAP' }
    ];
    cx.font = '500 8px "JetBrains Mono", monospace';
    rules.forEach(function (r) {
      var ry = Math.round(r.y) + 0.5;
      cx.strokeStyle = rgba(p.rgb, 0.30);
      cx.beginPath();
      cx.moveTo(0, ry);
      cx.lineTo(w, ry);
      cx.stroke();
      cx.fillStyle = rgba(p.rgb, 0.62);
      cx.fillText(r.label, w - 62, ry - 4);
    });

    var n = 8, gx = w * 0.06, gy = h * 0.90, gw = (w * 0.5) / n;
    for (var i = 0; i < n; i++) {
      var s = 3 + i * 1.6 + rand() * 0.6;
      cx.fillStyle = INK(0.18 + i * 0.05);
      cx.fillRect(gx + i * gw, gy - s, s, s);
    }
  };

  /* Three of the six painters read `t`; the other three are finished drawings.
     A concept that shows one project at a time can therefore unsubscribe from
     the ticker entirely whenever a static plate is on screen, which is half
     the time. */
  var ANIMATED = { pipeline: 1, flow: 1, mesh: 1 };
  function isAnimated(p) { return !!(p && ANIMATED[p.art]) && !SE.env.reduced; }

  /* --------------------------------------------------------------- art host */
  /* One canvas, one project, one paint call. `paint` is idempotent, so a
     concept can call it on resize, on selection change, or every frame, and the
     cost is the same handful of operations either way. */
  function mountArt(host, project, opts) {
    opts = opts || {};
    var el = SE.el('canvas', 'projects-art__c');
    el.setAttribute('aria-hidden', 'true');
    host.appendChild(el);

    var cv = SE.canvas(el);
    var current = project;
    var reveal = opts.reveal == null ? 1 : opts.reveal;
    var lastT = opts.t0 || 0;

    /* Every painter sizes its positions relative to the box but its strokes,
       node squares and label type in absolute pixels. That is right for a
       plate the size of a card and wrong for one the size of a viewport, where
       a 1px hairline and a 6px node simply disappear. `opts.zoom` names the box
       width the painter was drawn for; the context is scaled so the drawing
       keeps its intended weight at any size. */
    function paint(t) {
      if (t != null) lastT = t;
      cv.clear();
      var w = cv.w, h = cv.h;
      if (w < 8 || h < 8 || !current) return;
      var painter = ART[current.art] || ART.plate;
      var cxt = cv.ctx;
      var k = opts.zoom ? M.clamp(Math.min(w, h * 1.7) / opts.zoom, 1, 2.4) : 1;
      cxt.save();
      if (reveal < 0.999) {
        cxt.beginPath();
        cxt.rect(0, 0, w * reveal, h);
        cxt.clip();
      }
      if (k !== 1) cxt.scale(k, k);
      painter(cxt, w / k, h / k, current, SE.env.reduced ? null : lastT);
      cxt.restore();
      if (reveal > 0.001 && reveal < 0.999) {
        cxt.fillStyle = rgba(current.rgb, 0.9);
        cxt.fillRect(Math.round(w * reveal), 0, 1, h);
      }
    }

    cv.observe(function () { paint(); });
    paint();

    return {
      el: el,
      cv: cv,
      paint: paint,
      project: function () { return current; },
      setReveal: function (v) { reveal = M.clamp(v, 0, 1); },
      setProject: function (p) { if (p === current) return; current = p; paint(); },
      destroy: function () { cv.destroy(); }
    };
  }

  /* Standard plate wrapper: canvas plus the frame furniture that makes it read
     as a figure rather than as a background. */
  function artFrame(project, opts) {
    var wrap = SE.el('div', 'projects-art');
    wrap.style.setProperty('--c-accent', project.accent);
    var art = mountArt(wrap, project, opts);
    var tag = SE.el('span', 'projects-art__tag t-num', project.num);
    wrap.appendChild(tag);
    return { el: wrap, art: art, tag: tag };
  }

  /* Two stacked plate layers that swap roles with a direction-aware handoff.
     Three concepts need exactly this, and three copies of it would drift apart
     in the one part that has to match: the timing. `dir` is the sign of the
     index change, so the outgoing plate always leaves the way the incoming one
     arrived and the reader never loses which way they just moved. */
  function plateSwap(host, opts) {
    opts = opts || {};
    host.classList.add('projects-swap');
    if (opts.axis === 'y') host.classList.add('projects-swap--y');

    var start = opts.project || PROJECTS[0];
    var layers = [SE.el('div', 'projects-swap__l'), SE.el('div', 'projects-swap__l')];
    layers.forEach(function (l) { host.appendChild(l); });
    var arts = layers.map(function (l) { return mountArt(l, start, { zoom: opts.zoom }); });
    var front = 0;
    layers[0].classList.add('is-front');

    function show(p, dir) {
      if (!p || arts[front].project() === p) return;
      var inc = 1 - front;
      arts[inc].setProject(p);
      layers[inc].classList.remove('is-out-a', 'is-out-b', 'is-front');
      layers[inc].classList.add(dir > 0 ? 'is-pre-b' : 'is-pre-a');
      /* one forced style flush, so the entrance has a start value to run from */
      void layers[inc].offsetWidth;
      layers[inc].classList.remove('is-pre-a', 'is-pre-b');
      layers[inc].classList.add('is-front');
      layers[front].classList.remove('is-front');
      layers[front].classList.add(dir > 0 ? 'is-out-a' : 'is-out-b');
      front = inc;
    }

    return {
      show: show,
      /* only the visible layer paints; the outgoing one keeps its last frame
         while it fades, which is exactly what a fading plate should do */
      paint: function (t) { arts[front].paint(t); },
      current: function () { return arts[front].project(); },
      destroy: function () { arts.forEach(function (a) { a.destroy(); }); }
    };
  }

  /* ==========================================================================
     CASE PANEL  -  one implementation, four consumers
     --------------------------------------------------------------------------
     Reel, Drift, Coverflow and Strip all need "open the full case". Four
     separate panels would drift apart in exactly the details that make a panel
     feel considered, so there is one, and it lives here.

     It swallows Escape while open. The shell also listens for Escape on the
     stage to close the whole concept; without stopPropagation the reader would
     press Escape once and lose both the panel and the concept.
     ======================================================================== */
  function makeCase(root) {
    var el = SE.el('aside', 'projects-case');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-label', 'Project case');
    el.hidden = true;
    el.innerHTML =
      '<div class="projects-case__bar">' +
        '<span class="projects-case__num t-num" data-num></span>' +
        '<span class="projects-case__disc" data-disc></span>' +
        '<button class="iconbtn" type="button" data-close aria-label="Close this case">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="projects-case__scroll">' +
        '<h3 class="projects-case__name" data-name></h3>' +
        '<p class="projects-case__meta t-num" data-meta></p>' +
        '<p class="projects-case__problem" data-problem></p>' +
        '<p class="projects-case__detail" data-detail></p>' +
        '<p class="projects-case__outcome" data-outcome></p>' +
        '<div class="projects-case__tech" data-tech></div>' +
      '</div>';
    root.appendChild(el);

    var lastFocus = null;
    var open = false;
    var timer = 0;

    function set(sel, text) { SE.$(sel, el).textContent = text; }

    function show(p, trigger) {
      lastFocus = trigger || document.activeElement;
      window.clearTimeout(timer);
      el.hidden = false;
      el.style.setProperty('--c-accent', p.accent);
      set('[data-num]', p.num + ' / ' + TOTAL);
      set('[data-disc]', p.discipline);
      set('[data-name]', p.name);
      set('[data-meta]', p.role + '   ' + p.year);
      set('[data-problem]', p.problem);
      set('[data-detail]', p.detail);
      set('[data-outcome]', p.outcome);
      SE.$('[data-tech]', el).innerHTML = techMarkup(p);
      /* Force a style flush between `hidden = false` and the class, or the
         transition has no start value to run from. Cheaper and more honest
         than borrowing a frame from the shared ticker. */
      void el.offsetWidth;
      el.classList.add('is-on');
      open = true;
      SE.$('[data-close]', el).focus({ preventScroll: true });
    }

    function hide() {
      if (!open) return;
      open = false;
      el.classList.remove('is-on');
      if (lastFocus && document.contains(lastFocus) && lastFocus.focus) {
        lastFocus.focus({ preventScroll: true });
      }
      /* keep it in the tree for the exit transition, then take it out of the
         accessibility tree entirely */
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { if (!open) el.hidden = true; }, SE.env.reduced ? 0 : 460);
    }

    SE.$('[data-close]', el).addEventListener('click', hide);

    function onKey(e) {
      if (e.key !== 'Escape' || !open) return;
      e.preventDefault();
      e.stopPropagation();
      hide();
    }
    root.addEventListener('keydown', onKey);

    return {
      el: el,
      show: show,
      hide: hide,
      isOpen: function () { return open; },
      destroy: function () {
        window.clearTimeout(timer);
        root.removeEventListener('keydown', onKey);
      }
    };
  }

  /* ==========================================================================
     SHARED SMALL PARTS
     ======================================================================== */

  /* Section concepts are mounted inside a scroller the shell owns. If that
     scroller has not arrived (or the concept is being previewed in page mode),
     fall back to the concept root, which the stylesheet makes scrollable. */
  function scrollerFor(root, ctx) {
    if (ctx && ctx.scroller) return ctx.scroller;
    root.classList.add('projects-selfscroll');
    return root;
  }

  /* Shared section header. No kicker above the heading: the heading carries
     itself, and a mono label above every section is the single most reliable
     signature of a page that was generated rather than designed. */
  function sectionHead(title, lede) {
    var n = SE.el('header', 'projects-head');
    n.innerHTML =
      '<h2 class="projects-head__title">' + title + '</h2>' +
      '<p class="projects-head__lede">' + lede + '</p>';
    return n;
  }

  /* A flick must never also count as a click. 6px at 1x, a little more on
     touch where the finger rolls during a tap. */
  var DRAG_SLOP = 6;
  function slop() { return SE.env.touch ? 9 : DRAG_SLOP; }

  /* Section concepts must not paint while they are off screen. One observer
     per concept, returning its own teardown, so no concept has to remember
     both halves of the contract. */
  function inView(el, onChange, margin) {
    if (typeof IntersectionObserver === 'undefined') {
      onChange(true);
      return { destroy: function () {} };
    }
    var io = new IntersectionObserver(function (entries) {
      onChange(entries[0].isIntersecting);
    }, { threshold: 0, rootMargin: margin || '15% 0px 15% 0px' });
    io.observe(el);
    return { destroy: function () { io.disconnect(); } };
  }

  /* Live viewport class. SE.env.mobile is sampled at load and only refreshed
     when the motion or pointer media queries change, so a concept that has to
     re-lay-out at 768px watches its own query and cleans it up itself. */
  function watchNarrow(onChange) {
    var mq = window.matchMedia('(max-width: 767px)');
    var handler = function () { onChange(mq.matches); };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
    onChange(mq.matches);
    return {
      matches: function () { return mq.matches; },
      destroy: function () {
        if (mq.removeEventListener) mq.removeEventListener('change', handler);
        else if (mq.removeListener) mq.removeListener(handler);
      }
    };
  }

  /* The standard "see more" affordance, already switched on. SE.seeMore ships
     hidden so scrubbed sections can reveal it at the right moment; the
     sections that are not scrubbed want it visible from the first frame. */
  function seeMoreNow(label, fn) {
    var b = SE.seeMore(label, fn);
    b.classList.add('is-on');
    return b;
  }

  /* Every concept repeats the same four packages block, so it lives here and
     each spec adds only what is specific to it. */
  function pkgs(extra) {
    var base = [
      { p: 'gsap 3.15 + @gsap/react (installed)', w: 'ScrollTrigger for anything scroll-linked. Guard every use; the section must render and read correctly with the script blocked.' },
      { p: 'lenis 1.3 (installed)', w: 'Smoothing only. Never let the concept depend on Lenis being present for its layout or its reachability.' },
      { p: 'framer-motion 12 (installed)', w: 'Layout and shared-element work only. Do not use it for per-frame values; those belong on motion values or a single rAF.' },
      { p: 'No canvas or carousel library', w: 'The plates are around eighty draw calls each and the physics is fifteen lines. A library here adds bundle weight and takes away control over the exact numbers below.' }
    ];
    return extra ? base.concat(extra) : base;
  }

  /* The plate contract, restated for every generated prompt, because the one
     instruction most likely to be skipped is the one that says the pretty
     placeholder is a placeholder. */
  var PLATE_NOTE = {
    f: 'components/projects/Plate.tsx',
    r: 'PLACEHOLDER ARTWORK. Draws the project plate on a canvas, seeded from the project id so it is identical on every render. In production replace this component with real captures: a poster frame from a screen recording, an exported architecture diagram, or a photograph. Keep the same box, the same aspect ratio and the same loading behaviour so nothing else has to move.'
  };

  var DATA_SHAPE = [
    'type Project = { id: string; name: string; discipline: string; role: string; year: number; accent: `#${string}`; problem: string; outcome: string; detail: string; figure: string; tech: string[] }',
    'Six projects, authored as a typed array in `content/projects.ts` and imported by a Server Component. No CMS, no fetch, no loading state: the list changes a few times a year.',
    'outcome is a sentence, never a percentage. Concrete beats quantified; a claim the reader can interrogate is worth more than a number they will discount.'
  ];

  /* ==========================================================================
     PAGE 01  -  REEL
     --------------------------------------------------------------------------
     One project owns the entire frame. Stepping is a direction-aware handoff:
     the outgoing plate leaves the way the incoming one arrives, so the reel has
     a spatial direction rather than being a crossfade with extra steps.

     WHY WHEEL-TO-STEP IS ALLOWED HERE
     ---------------------------------
     Hijacking the wheel inside a scrolling page is a hostile act. This is a
     full-viewport takeover with nothing behind it to scroll, so the wheel has
     no other job; it is treated as a one-dimensional stepper with a 520ms
     cooldown so one physical flick never advances three projects.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'projects-page-reel',
    num: 1,
    name: 'Reel',
    kind: 'Canvas / full-bleed cases',
    accent: '#E8B33C',
    tagline: 'One piece of work owns the frame',
    desc: 'Each project takes the whole viewport in turn, plate behind and argument in front, and stepping hands the ' +
          'frame over in the direction you asked for. The reader is never comparing six things at once, which is the ' +
          'point: they are reading one.',
    interaction: 'Step with the arrow keys, the wheel, the two controls, or a horizontal drag. Open the full case from the button or Enter.',
    hint: 'Left / Right steps &middot; Enter opens the case',

    /* Miniature: the plate frame handing over to the next one, with the tick
       rail counting underneath. Around 34 operations per frame. */
    preview: function (ctx, w, h, t, heat) {
      var n = 6;
      var cyc = (t * 0.30 + heat * 0.35) % n;
      var i = Math.floor(cyc);
      var k = cyc - i;
      /* ease the handoff so the miniature reads as a step, not a pan */
      var e = k < 0.72 ? 0 : Math.pow((k - 0.72) / 0.28, 0.5);
      var pad = h * 0.10;
      var bh = h - pad * 2.6;

      for (var s = 0; s < 2; s++) {
        var p = PROJECTS[(i + s) % n];
        var off = (s - e) * w;
        ctx.globalAlpha = s === 0 ? 1 - e : e;
        ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',0.14)';
        ctx.fillRect(off, pad, w, bh);
        ctx.strokeStyle = 'rgba(' + p.rgb.join(',') + ',0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var b = 0; b < 5; b++) {
          var by = pad + bh * (0.22 + b * 0.15);
          ctx.moveTo(off + w * 0.10, by);
          ctx.lineTo(off + w * (0.24 + (b % 3) * 0.20), by);
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(236,236,239,' + (0.55 + heat * 0.3) + ')';
        ctx.fillRect(off + w * 0.10, pad + bh * 0.78, w * 0.30, 3);
      }
      ctx.globalAlpha = 1;

      var ty = h - pad * 0.9;
      for (var d = 0; d < n; d++) {
        var on = d === i;
        ctx.fillStyle = on ? '#E8B33C' : 'rgba(236,236,239,0.20)';
        ctx.fillRect(w * 0.10 + d * (w * 0.055), ty, on ? w * 0.038 : w * 0.018, 2);
      }
    },

    spec: {
      subtitle: 'Six case studies, one frame, handed over in the direction you asked for.',
      philosophy: [
        'A projects grid asks the reader to choose before they know anything. A reel makes the choice for them, one piece at a time, and earns the next step instead of assuming it.',
        'The plate is the argument, not the decoration: it is a drawing of what the system does, sized to the viewport, with the prose set over its quiet corner.',
        'Direction is information. Stepping right sends the old plate left; there is never a moment where the reader cannot tell which way they just moved.',
        'The outcome line is the last thing read before the control rail, because the outcome is what a hiring reader is actually scanning for.'
      ],
      hierarchy: [
        '1. The plate, full bleed, at 100% of the viewport box.',
        '2. The project name, clamp(2.75rem, 7vw, 6.5rem), weight 500, tracking -0.045em.',
        '3. The outcome sentence, 1.0625rem on --ink at 74ch.',
        '4. The problem sentence, 0.9375rem on --ink-2.',
        '5. Role, year, discipline and index, all mono at 0.6875rem on --ink-3.',
        '6. The right-hand index and the figure caption, mono 0.5625rem on --ink-4.'
      ],
      structure: [
        'section.reel, position relative, height 100dvh, overflow hidden, isolation isolate.',
        'div.plates: the parallax wrapper. Holds exactly two absolutely positioned plate layers that swap roles on every step, so a step never allocates a third canvas.',
        'div.scrim: two stacked gradients of the ground colour, one rising from the bottom edge and one from the left. It exists so type contrast never depends on which plate is showing.',
        'div.body: the reading column, max-width 42rem, anchored bottom-left, ending in an actions row of the case button, the two steppers and the counter.',
        'nav.index: the other five projects, listed by number and name down the right edge, vertically centred. Not a row of dashes: a reader should be able to see what else exists without stepping through it, and each row is the single-pointer alternative the drag gesture owes them.',
        'figcaption.fig: bottom right, names what the plate is a picture of.',
        'aside.case: the full write-up, a right-hand sheet at min(30rem, 92vw).'
      ],
      interaction: [
        'Wheel: accumulate deltaY plus deltaX; step when |accumulated| passes 42 and the last step was more than 520ms ago, then reset the accumulator. Without the cooldown one trackpad flick advances three projects.',
        'Drag: pointer down anywhere on the plate, track dx. Below a 6px movement threshold (9px on touch) the gesture is still a click and opens the case. Past that, the plate follows the finger at 0.42x with the pointer captured.',
        'Release: step if |dx| > 22% of the viewport width, or if the release velocity is over 620px/s. Otherwise spring back to 0 over 420ms on cubic-bezier(0.23, 1, 0.32, 1).',
        'Keyboard: ArrowLeft and ArrowRight step, Home and End jump to first and last, Enter and Space open the case, Escape closes it. This is the full drag alternative required by WCAG 2.2 dragging movements, not a partial one.',
        'Index rows: each is a real button with aria-current, so the six positions are reachable by Tab without stepping through the reel, and a single click reaches any of them.',
        'Stepping is clamped, not wrapped. A reel that loops silently loses the reader\'s sense of how much is left.'
      ],
      choreography: [
        { n: 'Plate handoff', d: 'Outgoing plate: transform translate3d(-16%,0,0) and opacity 1 to 0 over 620ms cubic-bezier(0.23, 1, 0.32, 1). Incoming: from translate3d(16%,0,0) opacity 0 to translate3d(0,0,0) opacity 1 over 620ms on the same curve, starting at the same instant. Signs invert when stepping backward. A full-frame cinematic move is allowed past the 300ms UI ceiling; the controls stay live throughout.' },
        { n: 'Name rise', d: 'The name sits in a span inside an overflow-hidden line box. On step it goes from translate3d(0,112%,0) to 0 over 760ms cubic-bezier(0.23, 1, 0.32, 1), delayed 90ms so the plate is already moving when the type arrives.' },
        { n: 'Line stagger', d: 'Role line, problem, outcome and tech row: opacity 0 to 1 with translate3d(0,14px,0) to 0 over 520ms cubic-bezier(0.23, 1, 0.32, 1), delays 150, 210, 270 and 330ms. 60ms apart is enough to read as sequence and short enough that the block still lands as one gesture.' },
        { n: 'Index advance', d: 'The active index row moves from translate3d(0,0,0) to translate3d(-14px,0,0) over 380ms cubic-bezier(0.23, 1, 0.32, 1) while its 18px leader rule scales on X from 0 to 1 with transform-origin right; the previous row returns over 260ms. Transform only. Never animate the width or the left offset.' },
        { n: 'Plate parallax', d: 'The plates wrapper is translated by pointer.dnx * 14px and pointer.dny * 10px, damped at lambda 4.5 by the shared pointer. Off entirely under reduced motion and on coarse pointers.' },
        { n: 'Case sheet', d: 'transform translate3d(100%,0,0) to 0 over 460ms cubic-bezier(0.32, 0.72, 0, 1), the drawer curve, with the scrim opacity 0 to 1 over 300ms. It exits on the same path in 320ms, because an exit should be around 60 to 70 percent of the entrance.' }
      ],
      scroll: [
        'There is no page scroll. This is a viewport takeover and the wheel is repurposed as a stepper, which is only defensible because nothing is behind it.',
        'In the Next.js build this is a route, not a section: /work is the reel, and every project also resolves at /work/[slug] with the reel opened on it and the case sheet already up.',
        'The case sheet is the only scrolling region on the page, with overscroll-behavior: contain so reaching its end never scrolls the document.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine).',
        'Index rows: the hit area is 44px tall with the label set at 0.625rem inside it. On hover the label goes from --ink-4 to --ink-2 over 140ms and the leader rule scales to 0.5.',
        'The plate takes the grab cursor on hover and grabbing while held, because it is draggable and nothing else on the page says so.',
        'Nothing else moves on hover. On a page where one element owns the frame, hover feedback on the furniture is noise.'
      ],
      click: [
        'Click on the plate, below the movement threshold, opens the case for the current project.',
        'Click on an index row goes to that project directly, with the same handoff choreography and the direction taken from the sign of the index change.',
        'Previous and next controls are disabled at the ends with aria-disabled and 0.35 opacity, rather than wrapping.',
        'The case sheet returns focus to whatever opened it on close.'
      ],
      responsive: {
        desktop: 'Plate full bleed. Reading column bottom-left at max-width 42rem, index down the right edge vertically centred, figure caption bottom-right. Name at clamp scale up to 6.5rem.',
        tablet: 'Same structure, name capped at 4.25rem, reading column capped at 34rem, index labels reduced to their numbers so they never crowd the outcome line.',
        mobile: 'A different composition, not a smaller one. The plate becomes a fixed 42dvh band at the top with the type stacked beneath it on a solid ground, so the prose is never set over artwork on a small screen. The right-hand index is removed and the actions row becomes the whole control set: a full-width case button above a row of two 48px steppers and the counter. Drag stays, wheel stepping is irrelevant, parallax is off, and the plate paints at devicePixelRatio capped to 1.75.'
      },
      a11y: [
        'The reel is a labelled region; the current project is announced through an aria-live="polite" status line carrying name, discipline and year.',
        'Every drag action has a keyboard equivalent: arrows step, Home and End jump, Enter opens. WCAG 2.2 dragging movements is satisfied by the index rows alone, and twice over with the arrows.',
        'The canvas is aria-hidden and mirrored by a visually hidden but focusable list of all six projects; focusing an entry selects it.',
        'Focus is never obscured: nothing overlaps the reading column or the index, so a focused control is always fully visible inside the viewport.',
        'prefers-reduced-motion: the handoff becomes a 200ms opacity crossfade, the name and lines appear without transform, parallax and plate animation stop, and nothing auto-advances. The composition stays deliberately arranged.',
        'Index rows are 44px tall hit areas even though the label is 0.625rem, and the leader rule is decoration that carries no information on its own.'
      ],
      perf: [
        'Exactly two canvases exist for the whole route and they swap roles; a step allocates nothing.',
        'Only the front plate paints, and only while the tab is visible and reduced motion is off. Three of the six plates are static drawings and stop painting entirely once drawn.',
        'Each plate is between 60 and 110 draw calls. Backing store is capped at devicePixelRatio 2, and 1.75 below 768px.',
        'Handoff and parallax are transform and opacity only. No layout property is animated anywhere in this concept.',
        'The case sheet is mounted once and toggled, not created per open.'
      ],
      packages: pkgs(),
      architecture: [
        { f: 'app/work/page.tsx', r: 'Server Component. Imports the six projects and renders the whole reel as static markup with the first project already in place, so the route is crawlable and has no loading state.' },
        { f: 'app/work/[slug]/page.tsx', r: 'Same reel, opened on one project with the case sheet up. generateStaticParams over the six ids.' },
        { f: 'components/projects/Reel.tsx', r: '"use client". Owns the index, the step function and the pointer and key handlers. Everything else is presentational.' },
        { f: 'components/projects/ReelPlates.tsx', r: '"use client". The two swapping plate layers and the parallax wrapper.' },
        PLATE_NOTE,
        { f: 'components/projects/CaseSheet.tsx', r: 'The full write-up. Non-modal dialog, focus returned on close, Escape stopped from propagating.' },
        { f: 'content/projects.ts', r: 'The typed project array. No CMS.' }
      ],
      state: [
        'React state: the current index, and whether the case sheet is open. Those two drive the render and nothing else does.',
        'Refs, never state: drag origin, current dx, pointer velocity, the wheel accumulator, the last step timestamp, and which of the two plate layers is currently front. Putting any of these in state re-renders the tree on every pointermove.',
        'The step direction is derived from the index change at render time; it is not stored.',
        'Route and index stay in sync through the URL on /work/[slug] and through history.replaceState on plain /work, so a reader can share the piece they are looking at.'
      ],
      typography: [
        'Name: Space Grotesk 500, clamp(2.75rem, 7vw, 6.5rem), tracking -0.045em, line-height 0.92.',
        'Outcome: Space Grotesk 400, 1.0625rem, line-height 1.6, measure capped at 74ch.',
        'Role, year, index, ticks and figure caption: JetBrains Mono 500 with tabular figures. Mono is for measurement here and nowhere else; the prose is never set in it.',
        'No kicker above the name. The name and the plate together already say what section this is.'
      ],
      color: [
        'Ground stays --void. The project accent is set as --c-accent on the reel root and is the only hue in play at any moment.',
        'The accent appears in exactly four places: the plate drawing, the active tick, the case sheet rule, and the focus ring on the reel controls.',
        'The scrim is a single linear gradient of the ground colour, never a black overlay, so the plate darkens toward the type instead of going grey.',
        'Text contrast is measured over the darkest 20% of the scrim, not over the average, so the worst case still clears 4.5:1.'
      ],
      spacing: [
        'Reading column: 1.25rem between the meta line and the name, 1.5rem between the name and the prose, 0.75rem between prose lines, 1.75rem before the tech row.',
        'Page inset follows the shell gutter, clamp(1.25rem, 4vw, 4.5rem), with the bottom inset raised to clear the 64px rail.',
        'Index rows sit on a 28px pitch with a 44px tall hit area, so the visual rhythm and the touch target are decoupled.'
      ],
      relationships: [
        'Horizontal position of the plate encodes step direction and nothing else.',
        'Index row offset and its leader rule encode which project is current; index order encodes chronology, newest first.',
        'The accent hue encodes which project you are in, and is the only thing that changes colour on the page.',
        'The figure caption encodes what the plate is a drawing of, which is the honest alternative to letting a reader assume it is a screenshot.'
      ],
      acceptance: [
        'Stepping right always sends the outgoing plate left, at every entry point: wheel, drag, arrows, ticks and the two controls.',
        'One trackpad flick advances exactly one project.',
        'A 5px drag opens the case; a 40px drag does not.',
        'Tab reaches all six projects, the two steppers and the case button, and no focused control is ever covered.',
        'With reduced motion on, the reel still reads as six deliberately composed frames and nothing moves except a 200ms crossfade.',
        'At 375px the plate is a band above the type, not a background behind it, and no text sits over artwork.',
        'The plates are visibly drawings, and the code comment above them says in plain words that production replaces them with real captures.'
      ]
    },

    mount: function (root, ctx) {
      var env = SE.env;
      root.classList.add('projects-reel');

      /* ------------------------------------------------------------ DOM */
      var plates = SE.el('div', 'projects-reel__plates');
      var layers = [SE.el('div', 'projects-reel__plate'), SE.el('div', 'projects-reel__plate')];
      layers.forEach(function (l) { plates.appendChild(l); });
      root.appendChild(plates);
      root.appendChild(SE.el('div', 'projects-reel__scrim'));

      var body = SE.el('div', 'projects-reel__body');
      body.innerHTML =
        '<p class="projects-reel__meta t-num"><span data-num></span><i></i><span data-disc></span></p>' +
        '<h2 class="projects-reel__name"><span data-name></span></h2>' +
        '<p class="projects-reel__role t-num" data-role></p>' +
        '<p class="projects-reel__problem" data-problem></p>' +
        '<p class="projects-reel__outcome" data-outcome></p>' +
        '<div class="projects-reel__tech" data-tech></div>' +
        '<div class="projects-reel__actions">' +
          '<button class="btn" type="button" data-open>Read the case</button>' +
          '<span class="projects-reel__step">' +
            '<button class="iconbtn" type="button" data-step="-1" aria-label="Previous project">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>' +
            '<button class="iconbtn" type="button" data-step="1" aria-label="Next project">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>' +
          '</span>' +
          '<span class="projects-reel__count t-num"><b data-cur>01</b> / ' + TOTAL + '</span>' +
        '</div>';
      root.appendChild(body);

      var fig = SE.el('figcaption', 'projects-reel__fig t-num');
      root.appendChild(fig);

      /* The index is a list of the other five, not a row of dashes. A reader
         should be able to see what else exists without stepping through it,
         and every entry is a real button, which is also the single-pointer
         alternative the drag gesture owes them. */
      var rail = SE.el('nav', 'projects-reel__index');
      rail.setAttribute('aria-label', 'All projects');
      rail.innerHTML = PROJECTS.map(function (p, i) {
        return '<button type="button" data-go="' + i + '" aria-current="' + (i === 0) + '">' +
               '<i class="t-num">' + p.num + '</i><b>' + p.name + '</b><s></s></button>';
      }).join('');
      root.appendChild(rail);

      var status = SE.el('p', 'sr-only');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      root.appendChild(status);

      root.appendChild(SE.srList('Reel: six projects, one at a time', srItems(), function (item) {
        go(item.p.index, item.p.index > index ? 1 : -1);
      }));

      var kase = makeCase(root);

      /* ---------------------------------------------------------- state */
      var index = 0;
      var front = 0;                 /* which layer currently shows the project */
      var arts = layers.map(function (l, i) {
        return mountArt(l, PROJECTS[i === 0 ? 0 : 1], { zoom: 700 });
      });
      var narrow = watchNarrow(function () {});
      var dragging = false, dx = 0, startX = 0, lastX = 0, lastT = 0, vel = 0, moved = false;
      var wheelAcc = 0, lastStep = 0;
      var out = {
        num: SE.$('[data-num]', body), disc: SE.$('[data-disc]', body),
        name: SE.$('[data-name]', body), role: SE.$('[data-role]', body),
        problem: SE.$('[data-problem]', body), outcome: SE.$('[data-outcome]', body),
        tech: SE.$('[data-tech]', body), cur: SE.$('[data-cur]', body)
      };
      var ticks = SE.$$('[data-go]', rail);
      var steppers = SE.$$('[data-step]', body);

      /* ------------------------------------------------------- rendering */
      function paintBody(p) {
        out.num.textContent = p.num;
        out.disc.textContent = p.discipline;
        out.name.textContent = p.name;
        out.role.textContent = p.role + '   ' + p.year;
        out.problem.textContent = p.problem;
        out.outcome.textContent = p.outcome;
        out.tech.innerHTML = techMarkup(p);
        out.cur.textContent = p.num;
        fig.textContent = 'Fig. ' + p.num + '   ' + p.figure;
        status.textContent = p.name + ', ' + p.discipline + ', ' + p.year + '. ' + p.outcome;
        root.style.setProperty('--c-accent', p.accent);
        if (SE.stageAccent) SE.stageAccent(p.accent);
        ticks.forEach(function (b, i) { b.setAttribute('aria-current', String(i === index)); });
        steppers.forEach(function (b) {
          var d = parseInt(b.getAttribute('data-step'), 10);
          var end = (d < 0 && index === 0) || (d > 0 && index === PROJECTS.length - 1);
          b.setAttribute('aria-disabled', String(end));
          b.classList.toggle('is-end', end);
        });
      }

      /* The body block replays its entrance on every step. Removing the class,
         forcing a flush and re-adding it is how a CSS-driven entrance is
         retriggered without keyframes, which would restart from zero and drop
         whatever the reader was mid-reading. */
      function replayBody() {
        if (env.reduced) return;
        body.classList.remove('is-in');
        void body.offsetWidth;
        body.classList.add('is-in');
      }

      function go(i, dir) {
        i = M.clamp(i, 0, PROJECTS.length - 1);
        if (i === index) return;
        dir = dir || (i > index ? 1 : -1);
        index = i;
        lastStep = performance.now();

        var incoming = 1 - front;
        arts[incoming].setProject(PROJECTS[i]);
        layers[incoming].classList.remove('is-out-l', 'is-out-r');
        layers[incoming].classList.add(dir > 0 ? 'is-pre-r' : 'is-pre-l');
        void layers[incoming].offsetWidth;
        layers[incoming].classList.remove('is-pre-r', 'is-pre-l');
        layers[incoming].classList.add('is-front');

        layers[front].classList.remove('is-front');
        layers[front].classList.add(dir > 0 ? 'is-out-l' : 'is-out-r');

        front = incoming;
        dx = 0;
        plates.style.setProperty('--drag', '0px');
        paintBody(PROJECTS[i]);
        replayBody();
      }

      function step(d) { go(index + d, d); }

      /* ----------------------------------------------------- interaction */
      function onWheel(e) {
        if (kase.isOpen()) return;
        var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        wheelAcc += d;
        var now = performance.now();
        if (Math.abs(wheelAcc) < 42 || now - lastStep < 520) return;
        step(wheelAcc > 0 ? 1 : -1);
        wheelAcc = 0;
      }
      root.addEventListener('wheel', onWheel, { passive: true });

      function onDown(e) {
        if (kase.isOpen()) return;
        if (e.target.closest('button, a, .sr-only')) return;
        dragging = true; moved = false;
        startX = lastX = e.clientX;
        lastT = performance.now();
        vel = 0;
        root.classList.add('is-dragging');
        /* capture can throw if the pointer was released between the event
           being queued and this handler running */
        try { plates.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
      }

      function onMove(e) {
        if (!dragging) return;
        var now = performance.now();
        var dt = Math.max(8, now - lastT) / 1000;
        vel = (e.clientX - lastX) / dt;
        lastX = e.clientX; lastT = now;
        dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > slop()) moved = true;
        if (!moved) return;
        /* 0.42 rather than 1.0: the plate acknowledges the finger without
           promising that a small drag will complete a step. */
        plates.style.setProperty('--drag', (dx * 0.42).toFixed(1) + 'px');
      }

      function onUp(e) {
        if (!dragging) return;
        dragging = false;
        root.classList.remove('is-dragging');
        plates.style.setProperty('--drag', '0px');
        if (!moved) {
          if (e && e.target && !e.target.closest('button, a, .sr-only')) {
            kase.show(PROJECTS[index], null);
          }
          return;
        }
        var reach = Math.abs(dx) > root.clientWidth * 0.22 || Math.abs(vel) > 620;
        if (reach) step(dx < 0 ? 1 : -1);
        dx = 0;
      }

      plates.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);

      rail.addEventListener('click', function (e) {
        var g = e.target.closest('[data-go]');
        if (!g) return;
        var i = parseInt(g.getAttribute('data-go'), 10);
        go(i, i > index ? 1 : -1);
      });

      body.addEventListener('click', function (e) {
        var s = e.target.closest('[data-step]');
        if (s) {
          if (s.getAttribute('aria-disabled') !== 'true') step(parseInt(s.getAttribute('data-step'), 10));
          return;
        }
        if (e.target.closest('[data-open]')) kase.show(PROJECTS[index], e.target.closest('[data-open]'));
      });

      function onKey(e) {
        if (kase.isOpen()) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { step(1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { step(-1); e.preventDefault(); }
        else if (e.key === 'Home') { go(0, -1); e.preventDefault(); }
        else if (e.key === 'End') { go(PROJECTS.length - 1, 1); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === ' ') {
          /* Enter is the case shortcut, but only when focus is not already on
             a control that has its own Enter behaviour. */
          var t = e.target;
          if (t && t.closest && t.closest('button, a, [href]')) return;
          kase.show(PROJECTS[index], null); e.preventDefault();
        }
      }
      window.addEventListener('keydown', onKey);

      /* ------------------------------------------------------------ tick */
      var px = 0, py = 0;
      function tick(dt, t) {
        if (!env.reduced && env.fine) {
          px = M.damp(px, SE.pointer.dnx * 14, 6, dt);
          py = M.damp(py, SE.pointer.dny * 10, 6, dt);
          plates.style.setProperty('--px', px.toFixed(2) + 'px');
          plates.style.setProperty('--py', py.toFixed(2) + 'px');
        }
        /* only the visible plate paints, and only the three painters that
           actually use `t` do any work past the first frame */
        arts[front].paint(t);
      }

      /* ------------------------------------------------------------ boot */
      layers[0].classList.add('is-front');
      paintBody(PROJECTS[0]);
      if (env.reduced) {
        arts[0].paint(3.2);
        body.classList.add('is-in');
      } else {
        SE.ticker.add(tick);
        replayBody();
      }

      return {
        destroy: function () {
          SE.ticker.remove(tick);
          root.removeEventListener('wheel', onWheel);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
          window.removeEventListener('keydown', onKey);
          arts.forEach(function (a) { a.destroy(); });
          narrow.destroy();
          kase.destroy();
          if (SE.stageAccent) SE.stageAccent('#E8B33C');
          root.classList.remove('projects-reel', 'is-dragging');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     PAGE 02  -  DRIFT
     --------------------------------------------------------------------------
     A boundless plane of work. The six projects are laid out once into a tile
     and the tile wraps forever, so the reader can throw the plane in any
     direction and never hit a wall or an empty quarter.

     WHY THE PLATES ARE CACHED
     -------------------------
     Naively this is twelve visible plates redrawn every frame while the plane
     is moving: roughly a thousand canvas operations per frame during exactly
     the interaction that has to stay at 60fps. So each project is painted once
     into an offscreen canvas at mount, and the frame loop is twelve drawImage
     calls plus eighteen grid lines. The cost of a throw is then independent of
     how complicated the plates are.

     The trade is that a cached plate cannot animate. That is the right trade:
     on a plane the reader is physically moving, per-plate idle motion is noise.

     WHY THE PHYSICS ARE HAND-WRITTEN
     --------------------------------
     Velocity is sampled on release, decays by a per-second friction constant
     raised to dt (frame-rate independent, unlike a fixed per-frame multiply),
     and any keyboard or index jump writes into the same two numbers. One
     continuous state means a grab mid-throw simply takes over, and the keyboard
     alternative is not a separate code path that behaves differently.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'projects-page-drift',
    num: 2,
    name: 'Drift',
    kind: 'Canvas / momentum plane',
    accent: '#7C8CF8',
    tagline: 'The work laid out on a plane you can throw',
    desc: 'Six plates on a tile that wraps forever, thrown with real momentum and read wherever they come to rest. ' +
          'The reticle at the centre always names what you are looking at, so wandering never means being lost.',
    interaction: 'Drag or flick the plane. Arrow keys pan, Tab walks the projects and pulls each one to the centre, and clicking a plate opens its case.',
    hint: 'Drag to throw &middot; Arrows pan &middot; Click a plate',

    /* Miniature: the plane drifting diagonally with the tile wrapping. Six
       rectangles plus a reticle, around 26 operations per frame. */
    preview: function (ctx, w, h, t, heat) {
      var rand = SE.rng(4409);
      var cw = w * 0.46, ch = h * 0.52;
      var sp = 14 + heat * 26;
      var ox = -(t * sp) % cw, oy = -(t * sp * 0.6) % ch;
      var cells = [];
      for (var i = 0; i < 6; i++) {
        cells.push({ c: i % 3, r: (i / 3) | 0, jx: rand() * 0.16, jy: rand() * 0.16, p: PROJECTS[i] });
      }
      for (var gx = -1; gx <= 2; gx++) {
        for (var gy = -1; gy <= 2; gy++) {
          for (var k = 0; k < 6; k++) {
            var cl = cells[k];
            var x = ox + (gx * 3 + cl.c) * cw + cl.jx * cw;
            var y = oy + (gy * 2 + cl.r) * ch + cl.jy * ch;
            if (x > w || y > h || x < -cw || y < -ch) continue;
            ctx.fillStyle = 'rgba(' + cl.p.rgb.join(',') + ',0.16)';
            ctx.fillRect(x, y, cw * 0.72, ch * 0.60);
            ctx.strokeStyle = 'rgba(' + cl.p.rgb.join(',') + ',0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, cw * 0.72, ch * 0.60);
          }
        }
      }
      var cx = w / 2, cy = h / 2;
      ctx.strokeStyle = 'rgba(236,236,239,' + (0.3 + heat * 0.35) + ')';
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
      ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6);
      ctx.stroke();
    },

    spec: {
      subtitle: 'A plane of work that wraps forever, thrown with hand-written momentum.',
      philosophy: [
        'A grid tells the reader how much there is. A plane tells them there is more, and lets them decide how much of it to see. That is a different and better feeling for a body of work.',
        'Boundless has to mean boundless. A plane that stops at an edge is a scroll area wearing a costume, so the tile wraps and every direction keeps producing work.',
        'Momentum is only worth having if it can be interrupted. A grab during a throw takes over the same velocity number rather than cancelling and restarting.',
        'Freedom without a reference point is disorientation, so a fixed reticle at the centre always names what is under it. You can wander, but you always know where you are.'
      ],
      hierarchy: [
        '1. The plates themselves, 420 by 264 CSS px each, at full opacity within 40% of the viewport centre.',
        '2. The reticle and the project it names, in the readout at bottom left.',
        '3. Plate captions, mono 0.625rem, drawn on the canvas directly beneath each plate.',
        '4. The wrap grid, one hairline every 128px at 4% opacity. It exists so motion is legible in an empty quarter, and for no other reason.'
      ],
      structure: [
        'section.drift, position relative, height 100dvh, overflow hidden, touch-action none.',
        'canvas.plane: one canvas for the entire plane. Not one element per plate; a DOM plane of 54 wrapped nodes is how this pattern usually dies.',
        'Six offscreen canvases, one per project, painted once at mount at 420x264 and at devicePixelRatio, then blitted with drawImage.',
        'div.reticle: a 22px cross at the exact centre, pointer-events none.',
        'div.readout: bottom left, names the project nearest the centre and carries the case button.',
        'nav.jump: the six projects as a list on the right, each pulling its nearest instance to the centre.',
        'aside.case: the shared case sheet.'
      ],
      interaction: [
        'Tile: 3 columns by 2 rows of 560 by 470 cells, each project offset inside its cell by a seeded jitter of up to 14% so the layout never reads as a grid. The same seed every reload; a plane that reshuffles is a plane nobody can return to.',
        'Wrap: the world offset is taken modulo the tile size before drawing, so the plane is genuinely endless rather than merely long.',
        'Drag: pointer capture on down. Below the 6px movement threshold (9px on touch) the gesture stays a click and opens the plate under the cursor. Past it, the plane tracks the pointer 1:1.',
        'Velocity: sampled every pointermove as delta over the real elapsed time, clamped to 3800px/s so a single stuttered frame cannot launch the plane.',
        'Release: velocity decays as v *= 0.0022^dt, which is frame-rate independent and reads as about 90% per frame at 60fps. Motion stops below 12px/s.',
        'Keyboard: arrows pan 220px per press, Shift with an arrow pans 560px, and Home pulls the first project back under the reticle. Each writes a spring target rather than jumping, so the keyboard and the throw share one motion model. This is the WCAG 2.2 dragging-movements alternative.',
        'Tab: the six index entries each pull the nearest instance of that project to the centre with a spring at stiffness 130 and damping 23, which settles in about 520ms.',
        'Enter or Space on a focused index entry opens that project\'s case.'
      ],
      choreography: [
        { n: 'Throw', d: 'On release the plane keeps the sampled velocity and decays it by 0.0022^dt per second. A 1200px/s flick travels roughly 190px and settles in about 620ms. Nothing snaps at the end; the plane simply stops where it stopped, because a plane that snaps is a carousel.' },
        { n: 'Spring jump', d: 'Index entries, Recentre and Home use acceleration = (target - position) * 130 - velocity * 23, integrated per frame. Critically damped enough that it never overshoots visibly, and it accepts a grab mid-flight because it writes to the same velocity.' },
        { n: 'Focus falloff', d: 'Plate opacity is 1 at the centre and 0.34 at the edge, mapped over the distance from the reticle across 46% of the viewport diagonal, with a squared falloff so the centre reads as light rather than as a spotlight cutout.' },
        { n: 'Readout swap', d: 'When the project under the reticle changes, the readout block replays a 380ms cubic-bezier(0.23, 1, 0.32, 1) entrance: opacity 0 to 1 and translate3d(0,10px,0) to 0. Transition, not keyframes, because the reader can cross three plates in one throw and the block must retarget rather than restart.' },
        { n: 'Cursor', d: 'grab on the plane, grabbing while held. That is the only hover state on the whole surface; the plane is the affordance.' }
      ],
      scroll: [
        'The document does not scroll. touch-action: none on the plane, so a touch drag pans instead of scrolling the page.',
        'In the Next.js build this is /work as a route. Panning updates nothing in the URL, but opening a case pushes /work/[slug] so a piece stays shareable.',
        'The case sheet is the only scrolling region, with overscroll-behavior: contain.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine).',
        'The plane takes grab and grabbing. Nothing brightens under the cursor, because brightening a plate the reader is about to drag past is a distraction.',
        'Index entries: colour from --ink-4 to --ink-2 over 140ms, and an 18px leader rule scales in from the right.'
      ],
      click: [
        'Click a plate below the movement threshold opens its case. Hit testing is done in plane coordinates against the wrapped instance rectangles, so it works on any copy of any tile.',
        'Click on empty plane does nothing at all. A plane that deselects on background click implies a selection model this does not have.',
        'The case sheet returns focus to the element that opened it.'
      ],
      responsive: {
        desktop: 'Tile of 3 by 2 cells at 560 by 470, so the tile is 1680 by 940 and neither axis repeats inside a 1440 by 900 viewport. Plates at 420 by 264. Readout bottom left, index right, reticle centre.',
        tablet: 'Tile of 2 by 3 cells at 460 by 340, plates at 360 by 226. Index collapses to numbers only.',
        mobile: 'A different composition, not a smaller one. The tile becomes a single column of six cells, so the plane drifts vertically only and a thumb cannot lose the column sideways. Plates are 300 by 188, the index is replaced by a two-button stepper that springs to the previous or next project, the readout becomes a fixed bottom bar 40% tall, and the plate cache is rendered at devicePixelRatio capped to 1.75.'
      },
      a11y: [
        'Every drag has a keyboard equivalent, and the equivalent is the same motion model rather than a fallback: arrows pan, Shift-arrow pans further, Home returns to origin, and the six index entries pull a project to the centre.',
        'The canvas is aria-hidden. The visually hidden list mirrors all six projects with their problem and outcome, and focusing an entry pulls that project to the centre so keyboard and pointer end up in the same place.',
        'The readout is an aria-live="polite" status. It announces the project name, discipline and year when the reticle crosses into a new plate, and it is throttled to one announcement per settled position rather than one per frame.',
        'Index entries are 44px tall hit areas.',
        'prefers-reduced-motion: momentum is switched off entirely. A drag moves the plane and stops with the finger, index jumps become instant, the focus falloff is fixed rather than animated, and there is no idle drift at any point. The plane is still fully explorable.'
      ],
      perf: [
        'Six offscreen canvases painted once. The frame loop is at most twelve drawImage calls, twelve captions and eighteen grid lines.',
        'The loop unsubscribes when the plane is at rest and no pointer is down, so an idle plane costs nothing.',
        'Backing store capped at devicePixelRatio 2, and 1.75 below 768px. The plate caches are rendered at the same cap and re-rendered only when the cap changes.',
        'No DOM node moves. The only per-frame writes are to the canvas and to two CSS custom properties on the readout.',
        'Hit testing is O(6) against the wrapped instances near the pointer, not O(all copies).'
      ],
      packages: pkgs([
        { p: 'No drag or physics library', w: 'The whole model is a velocity, a friction constant and a spring: about twenty lines. A library would hide exactly the numbers this brief is specifying.' }
      ]),
      architecture: [
        { f: 'app/work/page.tsx', r: 'Server Component. Renders the readout, the index and the six projects as real markup, then hydrates the plane. The route is readable and crawlable with JavaScript disabled.' },
        { f: 'components/projects/DriftPlane.tsx', r: '"use client". Owns the canvas, the physics loop, the pointer and key handlers, and the hit test.' },
        { f: 'components/projects/usePlaneMotion.ts', r: 'The motion model on its own: position, velocity, friction, spring target, and a settled flag. Pure functions plus refs, no React state.' },
        PLATE_NOTE,
        { f: 'components/projects/CaseSheet.tsx', r: 'The shared case sheet.' },
        { f: 'content/projects.ts', r: 'The typed project array.' }
      ],
      state: [
        'React state: the index of the project under the reticle, and whether the case sheet is open. Two values, both of which actually change the render.',
        'Refs, never state: plane x and y, velocity x and y, spring target, drag origin, last pointer sample and its timestamp, the settled flag, and the six cached canvases. Every one of these changes at frame rate; in state they would each cause a full re-render.',
        'The reticle project is computed in the loop and written to state only when it changes, which is a few times per throw rather than sixty times per second.',
        'The plane offset is deliberately not persisted. Returning to /work should feel like arriving, not like resuming.'
      ],
      typography: [
        'Plate captions are drawn on the canvas in JetBrains Mono 500 at 11px with 0.16em tracking, uppercase. Mono here is measurement, not costume: it is an index number and a name in a plotting field.',
        'Readout name: Space Grotesk 500 at clamp(1.75rem, 3.4vw, 2.75rem), tracking -0.04em.',
        'Readout prose: Space Grotesk 400 at 0.9375rem, measure capped at 52ch so it never fights the plane for width.'
      ],
      color: [
        'Ground --void. Each plate carries its own project hue; the plane therefore has six hues at once, which is the one place in this design where that is correct, because they are being compared.',
        '--c-accent on the reel root follows the reticle project, so the readout, the case rule and the focus ring all agree with what is under the cross.',
        'The wrap grid is --ink at 4%. Any stronger and it becomes a graph the reader tries to read.',
        'Plate opacity falloff is applied with globalAlpha, never with a black overlay, so a dimmed plate stays the right hue.'
      ],
      spacing: [
        'Cell 560 by 470 with plates at 420 by 264, leaving 140 by 206 of air. The air is what makes it a plane rather than a mosaic, and the cell is taller than it needs to be so the tile does not repeat vertically inside one viewport.',
        'Caption baseline sits 18px below the plate edge, aligned to the plate left edge.',
        'Readout: 1rem between the meta line and the name, 1.25rem to the prose, 1.5rem to the button. Page inset follows the shell gutter.'
      ],
      relationships: [
        'Distance from the reticle encodes attention: opacity is the only channel used, and it is monotonic in that distance.',
        'Plate hue encodes which project, and is the only per-project channel.',
        'Position on the plane encodes nothing at all, and that is deliberate. Once the reader knows position is arbitrary, wandering has no wrong answer.',
        'Grid motion encodes that the plane is moving, which matters most in the moments when no plate is in frame.'
      ],
      acceptance: [
        'A throw in any direction always brings more work into frame, and there is no edge anywhere.',
        'Grabbing the plane mid-throw takes over smoothly with no jump.',
        'A 5px drag opens the plate under the cursor; a 40px drag does not.',
        'With the pointer never touched, arrows, Shift-arrows, Home and Tab reach every project and pull it to the centre.',
        'An idle plane consumes no frames: the loop is unsubscribed while nothing is moving.',
        'With reduced motion on there is no momentum and no drift, and every project is still reachable through the index.',
        'At 375px the plane moves vertically only, and a horizontal swipe does not send the column off screen.'
      ]
    },

    mount: function (root, ctx) {
      var env = SE.env;
      root.classList.add('projects-drift');

      /* ------------------------------------------------------------ DOM */
      var canvasEl = SE.el('canvas', 'projects-drift__plane');
      canvasEl.setAttribute('aria-hidden', 'true');
      root.appendChild(canvasEl);

      var vig = SE.el('div', 'projects-drift__vig');
      vig.setAttribute('aria-hidden', 'true');
      root.appendChild(vig);

      var reticle = SE.el('div', 'projects-drift__reticle');
      reticle.setAttribute('aria-hidden', 'true');
      reticle.innerHTML = '<i></i><i></i>';
      root.appendChild(reticle);

      var readout = SE.el('div', 'projects-drift__readout');
      readout.innerHTML =
        '<p class="projects-drift__meta t-num"><span data-num></span><i></i><span data-disc></span></p>' +
        '<h2 class="projects-drift__name" data-name></h2>' +
        '<p class="projects-drift__outcome" data-outcome></p>' +
        '<div class="projects-drift__actions">' +
          '<button class="btn" type="button" data-open>Read the case</button>' +
          '<button class="btn btn--ghost" type="button" data-home>Recentre</button>' +
        '</div>';
      root.appendChild(readout);

      /* The live region is a separate, text-only element. Putting the buttons
         inside an aria-live block would re-announce them on every crossing. */
      var status = SE.el('p', 'sr-only');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      root.appendChild(status);

      var jump = SE.el('nav', 'projects-drift__jump');
      jump.setAttribute('aria-label', 'Pull a project to the centre');
      jump.innerHTML = PROJECTS.map(function (p, i) {
        return '<button type="button" data-jump="' + i + '" aria-current="false">' +
               '<i class="t-num">' + p.num + '</i><b>' + p.name + '</b><s></s></button>';
      }).join('');
      root.appendChild(jump);

      root.appendChild(SE.hintStrip(
        '<span>Drag to throw</span><span><kbd>&larr;</kbd><kbd>&rarr;</kbd><kbd>&uarr;</kbd><kbd>&darr;</kbd> pan</span><span><kbd>Home</kbd> recentre</span>'
      ));

      root.appendChild(SE.srList('Drift: six projects on a boundless plane', srItems(), function (item) {
        jumpTo(item.p.index);
      }));

      var kase = makeCase(root);

      /* ------------------------------------------------------ plate cache */
      /* One offscreen canvas per project, painted once. Everything the frame
         loop does afterwards is a blit. */
      var PW = 420, PH = 264;
      var cache = [];
      var cacheDpr = 0;

      function buildCache() {
        var dpr = env.dpr || 1;
        if (dpr === cacheDpr && cache.length) return;
        cacheDpr = dpr;
        cache = PROJECTS.map(function (p) {
          var c = document.createElement('canvas');
          c.width = Math.round(PW * dpr);
          c.height = Math.round(PH * dpr);
          var g = c.getContext('2d');
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.fillStyle = '#0b0b0f';
          g.fillRect(0, 0, PW, PH);
          /* the cached plate is static: `t` is omitted deliberately */
          (ART[p.art] || ART.plate)(g, PW, PH, p);
          g.strokeStyle = 'rgba(' + p.rgb.join(',') + ',0.34)';
          g.lineWidth = 1;
          g.strokeRect(0.5, 0.5, PW - 1, PH - 1);
          return c;
        });
      }
      buildCache();

      /* ----------------------------------------------------------- layout */
      var booted = false;
      var narrow = watchNarrow(function () {
        if (!booted) return;
        layout();
        wake();
      });
      var COLS, ROWS, CW, CH, plateW, plateH, cells;

      function layout() {
        var mob = narrow.matches();
        COLS = mob ? 1 : 3;
        ROWS = mob ? 6 : 2;
        plateW = mob ? 300 : 420;
        plateH = Math.round(plateW * (PH / PW));
        CW = mob ? plateW + 48 : 560;
        CH = mob ? plateH + 96 : 470;
        var rand = SE.rng(90210);
        cells = PROJECTS.map(function (p, i) {
          var c = i % COLS, r = Math.floor(i / COLS);
          return {
            p: p, i: i,
            x: c * CW + (CW - plateW) * (0.2 + rand() * 0.6),
            y: r * CH + (CH - plateH) * (0.2 + rand() * 0.6)
          };
        });
      }
      layout();

      /* ------------------------------------------------------------ state */
      var cv = SE.canvas(canvasEl);
      var g = cv.ctx;
      var ox = 0, oy = 0, vx = 0, vy = 0;
      var tx = null, ty = null;                  /* spring target, null when free */
      var dragging = false, moved = false;
      var dragOX = 0, dragOY = 0, startX = 0, startY = 0, lastX = 0, lastY = 0, lastMs = 0;
      var reticleIdx = -1;
      var running = false;
      var jumps = SE.$$('[data-jump]', jump);
      var out = {
        num: SE.$('[data-num]', readout), disc: SE.$('[data-disc]', readout),
        name: SE.$('[data-name]', readout), outcome: SE.$('[data-outcome]', readout)
      };

      cv.observe(function () { layout(); wake(); });

      /* ------------------------------------------------------- projection */
      function tileW() { return COLS * CW; }
      function tileH() { return ROWS * CH; }

      /* Every visible copy of every plate, in screen coordinates. The plane is
         endless because this walks the wrapped range rather than a list. */
      function eachVisible(fn) {
        var w = cv.w, h = cv.h;
        var TW = tileW(), TH = tileH();
        var g0 = Math.floor((-ox - plateW) / TW);
        var g1 = Math.floor((-ox + w) / TW);
        var r0 = Math.floor((-oy - plateH) / TH);
        var r1 = Math.floor((-oy + h) / TH);
        for (var gx = g0; gx <= g1; gx++) {
          for (var gy = r0; gy <= r1; gy++) {
            for (var k = 0; k < cells.length; k++) {
              var c = cells[k];
              var x = ox + gx * TW + c.x;
              var y = oy + gy * TH + c.y;
              if (x > w || y > h || x + plateW < 0 || y + plateH < 0) continue;
              fn(c, x, y);
            }
          }
        }
      }

      function nearestToCentre() {
        var cxp = cv.w / 2, cyp = cv.h / 2;
        var best = null, bd = Infinity;
        eachVisible(function (c, x, y) {
          var dx = x + plateW / 2 - cxp, dy = y + plateH / 2 - cyp;
          var d = dx * dx + dy * dy;
          if (d < bd) { bd = d; best = c; }
        });
        return best;
      }

      /* --------------------------------------------------------- rendering */
      function reportCentre() {
        var n = nearestToCentre();
        if (n) setReadout(n.i);
      }

      function setReadout(i) {
        if (i === reticleIdx) return;
        reticleIdx = i;
        var p = PROJECTS[i];
        out.num.textContent = p.num;
        out.disc.textContent = p.discipline;
        out.name.textContent = p.name;
        out.outcome.textContent = p.outcome;
        status.textContent = p.name + ', ' + p.discipline + ', ' + p.year + '. ' + p.outcome;
        root.style.setProperty('--c-accent', p.accent);
        if (SE.stageAccent) SE.stageAccent(p.accent);
        jumps.forEach(function (b, k) { b.setAttribute('aria-current', String(k === i)); });
        if (!env.reduced) {
          readout.classList.remove('is-in');
          void readout.offsetWidth;
        }
        readout.classList.add('is-in');
      }

      function render() {
        cv.clear();
        var w = cv.w, h = cv.h;
        if (w < 8 || h < 8) return;

        /* wrap grid: eighteen lines, purely so motion is legible when no plate
           is in frame. Any stronger and it becomes a chart. */
        var pitch = 128;
        g.strokeStyle = 'rgba(236,236,239,0.04)';
        g.lineWidth = 1;
        g.beginPath();
        var sx = ox % pitch; if (sx > 0) sx -= pitch;
        for (var x = sx; x < w; x += pitch) {
          g.moveTo(Math.round(x) + 0.5, 0);
          g.lineTo(Math.round(x) + 0.5, h);
        }
        var sy = oy % pitch; if (sy > 0) sy -= pitch;
        for (var y = sy; y < h; y += pitch) {
          g.moveTo(0, Math.round(y) + 0.5);
          g.lineTo(w, Math.round(y) + 0.5);
        }
        g.stroke();

        var cxp = w / 2, cyp = h / 2;
        var reach = Math.hypot(w, h) * 0.46;
        g.font = '500 11px "JetBrains Mono", monospace';
        g.textBaseline = 'alphabetic';

        eachVisible(function (c, px, py) {
          var dx = px + plateW / 2 - cxp, dy = py + plateH / 2 - cyp;
          var d = Math.min(1, Math.hypot(dx, dy) / reach);
          var a = 1 - d * d * 0.66;
          g.globalAlpha = a;
          g.drawImage(cache[c.i], Math.round(px), Math.round(py), plateW, plateH);
          g.globalAlpha = 1;
          g.fillStyle = 'rgba(236,236,239,' + (0.18 + (1 - d) * 0.5).toFixed(3) + ')';
          g.fillText(c.p.num + '   ' + c.p.name.toUpperCase(), Math.round(px), Math.round(py) + plateH + 18);
        });
      }

      /* --------------------------------------------------------- physics */
      function wake() {
        if (running) return;
        running = true;
        SE.ticker.add(tick);
      }
      function sleep() {
        if (!running) return;
        running = false;
        SE.ticker.remove(tick);
      }

      function tick(dt) {
        var moving = false;

        if (dragging) {
          render();
          reportCentre();
          return;
        }

        if (tx != null) {
          /* spring, shared with the throw so a grab mid-flight takes over */
          var ax = (tx - ox) * 130 - vx * 23;
          var ay = (ty - oy) * 130 - vy * 23;
          if (env.reduced) { ox = tx; oy = ty; vx = vy = 0; }
          else {
            vx += ax * dt; vy += ay * dt;
            ox += vx * dt; oy += vy * dt;
          }
          if (Math.abs(tx - ox) < 0.5 && Math.abs(ty - oy) < 0.5 && Math.hypot(vx, vy) < 8) {
            ox = tx; oy = ty; vx = vy = 0; tx = ty = null;
          } else moving = true;
        } else if (!env.reduced && (Math.abs(vx) > 12 || Math.abs(vy) > 12)) {
          var f = Math.pow(0.0022, dt);
          vx *= f; vy *= f;
          ox += vx * dt; oy += vy * dt;
          moving = true;
        } else { vx = 0; vy = 0; }

        render();
        reportCentre();
        if (!moving) sleep();
      }

      /* ------------------------------------------------------ interaction */
      function onDown(e) {
        if (kase.isOpen()) return;
        if (e.target.closest('button, a, .sr-only')) return;
        dragging = true; moved = false;
        tx = ty = null;
        vx = vy = 0;
        dragOX = ox; dragOY = oy;
        startX = lastX = e.clientX;
        startY = lastY = e.clientY;
        lastMs = performance.now();
        root.classList.add('is-dragging');
        try { canvasEl.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
        wake();
      }

      function onMove(e) {
        if (!dragging) return;
        var now = performance.now();
        var dt = Math.max(8, now - lastMs) / 1000;
        vx = M.clamp((e.clientX - lastX) / dt, -3800, 3800);
        vy = M.clamp((e.clientY - lastY) / dt, -3800, 3800);
        lastX = e.clientX; lastY = e.clientY; lastMs = now;
        var dxT = e.clientX - startX, dyT = e.clientY - startY;
        if (!moved && Math.hypot(dxT, dyT) > slop()) moved = true;
        if (!moved) return;
        ox = dragOX + dxT;
        oy = dragOY + dyT;
        if (narrow.matches()) ox = dragOX;   /* vertical ribbon on a phone */
      }

      function onUp(e) {
        if (!dragging) return;
        dragging = false;
        root.classList.remove('is-dragging');
        if (!moved) {
          var hit = hitTest(e);
          if (hit) kase.show(hit.p, null);
          vx = vy = 0;
          wake();
          return;
        }
        /* a stale sample means the finger stopped before lifting; a plane that
           throws after a pause feels broken */
        if (performance.now() - lastMs > 90) { vx = 0; vy = 0; }
        if (narrow.matches()) vx = 0;
        wake();
      }

      function hitTest(e) {
        var r = canvasEl.getBoundingClientRect();
        var px = e.clientX - r.left, py = e.clientY - r.top;
        var found = null;
        eachVisible(function (c, x, y) {
          if (found) return;
          if (px >= x && px <= x + plateW && py >= y && py <= y + plateH) found = c;
        });
        return found;
      }

      canvasEl.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);

      function pan(dx, dy) {
        tx = (tx == null ? ox : tx) + dx;
        ty = (ty == null ? oy : ty) + dy;
        wake();
      }

      /* Pull the nearest copy of a project to the centre. "Nearest copy"
         matters: on a wrapped plane the reader must never be flung across
         three tiles to reach something that was already beside them. */
      function jumpTo(i) {
        var c = cells[i];
        var TW = tileW(), TH = tileH();
        var wantX = cv.w / 2 - plateW / 2 - c.x;
        var wantY = cv.h / 2 - plateH / 2 - c.y;
        var baseX = tx == null ? ox : tx;
        var baseY = ty == null ? oy : ty;
        tx = wantX + Math.round((baseX - wantX) / TW) * TW;
        ty = wantY + Math.round((baseY - wantY) / TH) * TH;
        wake();
      }

      jump.addEventListener('click', function (e) {
        var b = e.target.closest('[data-jump]');
        if (b) jumpTo(parseInt(b.getAttribute('data-jump'), 10));
      });

      readout.addEventListener('click', function (e) {
        if (e.target.closest('[data-open]')) {
          kase.show(PROJECTS[Math.max(0, reticleIdx)], e.target.closest('[data-open]'));
        } else if (e.target.closest('[data-home]')) {
          jumpTo(0);
        }
      });

      function onKey(e) {
        if (kase.isOpen()) return;
        var big = e.shiftKey ? 560 : 220;
        if (e.key === 'ArrowRight') { pan(-big, 0); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { pan(big, 0); e.preventDefault(); }
        else if (e.key === 'ArrowDown') { pan(0, -big); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { pan(0, big); e.preventDefault(); }
        else if (e.key === 'Home') { jumpTo(0); e.preventDefault(); }
      }
      window.addEventListener('keydown', onKey);

      /* core.js has no offEnvChange, so the listener is neutered by a flag
         rather than left to fire against a destroyed concept. */
      var dead = false;
      SE.onEnvChange(function () {
        if (dead) return;
        buildCache();
        layout();
        wake();
      });

      /* ------------------------------------------------------------ boot */
      /* Open on a project rather than on the tile origin, so the first frame
         is a piece of work and not a corner of empty plane. */
      booted = true;
      jumpTo(0);
      ox = tx; oy = ty; tx = ty = null;
      setReadout(0);
      render();
      wake();

      return {
        destroy: function () {
          dead = true;
          sleep();
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
          window.removeEventListener('keydown', onKey);
          cv.destroy();
          narrow.destroy();
          kase.destroy();
          cache.length = 0;
          if (SE.stageAccent) SE.stageAccent('#7C8CF8');
          root.classList.remove('projects-drift', 'is-dragging');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     PAGE 03  -  INDEX
     --------------------------------------------------------------------------
     The agency hover index, with the two things that usually make it a cliche
     removed.

     FIRST: the preview does not chase the cursor. A picture that follows the
     mouse is a picture nobody can read, and it makes the page feel like it is
     dodging. The plate sits in a fixed column and the rows point at it.

     SECOND: hovering produces information, not just an image. The plate column
     carries the figure caption, the outcome sentence and the stack, so moving
     down the index is reading rather than window shopping.

     The spine on the left is the third piece: a marker that slides to the
     active row so the reader always has a position in the list, which is
     exactly what a hovering preview normally destroys.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'projects-page-index',
    num: 3,
    name: 'Index',
    kind: 'DOM / fixed-frame index',
    accent: '#CFC6AE',
    tagline: 'A hover index that answers instead of teasing',
    desc: 'Six rows set at editorial scale, with a fixed plate column that fills in the figure, the outcome and the ' +
          'stack for whichever row you are on. Nothing chases the cursor and nothing is hidden behind a hover you have to guess at.',
    interaction: 'Move down the rows, or Tab through them; the plate column answers each one. Enter or click opens the full case.',
    hint: 'Move down the index &middot; Enter opens the case',

    /* Miniature: six index rules with a marker sliding down the spine and the
       plate column changing beside them. Around 30 operations per frame. */
    preview: function (ctx, w, h, t, heat) {
      var n = 6;
      var cyc = (t * 0.42 + heat * 0.6) % n;
      var i = Math.floor(cyc);
      var padX = w * 0.08, padY = h * 0.14;
      var rowH = (h - padY * 2) / n;
      var listW = w * 0.50;

      /* spine plus marker */
      ctx.fillStyle = 'rgba(236,236,239,0.12)';
      ctx.fillRect(padX, padY, 1, h - padY * 2);
      ctx.fillStyle = '#CFC6AE';
      ctx.fillRect(padX, padY + cyc * rowH, 2, rowH * 0.7);

      for (var r = 0; r < n; r++) {
        var on = r === i;
        var y = padY + r * rowH + rowH * 0.42;
        ctx.fillStyle = 'rgba(236,236,239,' + (on ? 0.85 : 0.20) + ')';
        ctx.fillRect(padX + 10 + (on ? 6 : 0), y, listW * (0.42 + (r % 3) * 0.16), on ? 3 : 2);
      }

      var p = PROJECTS[i];
      var px = w * 0.62, pw = w * 0.30, ph = h * 0.52;
      ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',0.16)';
      ctx.fillRect(px, padY, pw, ph);
      ctx.strokeStyle = 'rgba(' + p.rgb.join(',') + ',0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, padY + 0.5, pw, ph);
      ctx.fillStyle = 'rgba(236,236,239,0.30)';
      ctx.fillRect(px, padY + ph + 10, pw * 0.7, 2);
      ctx.fillRect(px, padY + ph + 18, pw * 0.44, 2);
    },

    spec: {
      subtitle: 'Six rows and one fixed plate column, where hovering returns an answer rather than a picture.',
      philosophy: [
        'The hover index is a good pattern wearing a bad habit. The habit is a preview that chases the cursor; remove it and the pattern becomes an editorial contents page that happens to be alive.',
        'A hover state should pay for itself in information. This one returns the figure, the outcome and the stack, so a reader who never clicks still leaves knowing what the work was.',
        'Rows at editorial scale, not list scale. Six pieces of work deserve 4rem of type each; a 14px table row says the work was routine.',
        'Position in a list is worth protecting. The spine marker means the reader always knows where they are, which is exactly what a floating preview usually takes away.'
      ],
      hierarchy: [
        '1. The six names, clamp(2rem, 4.4vw, 3.75rem), weight 400, tracking -0.04em.',
        '2. The plate for the active row, filling a 38% column at 4:3.',
        '3. The outcome sentence under the plate, 0.9375rem on --ink at 46ch.',
        '4. Row meta: discipline, role, year, mono 0.6875rem on --ink-3, in a fixed tabular column so the years line up.',
        '5. The spine, the figure caption and the stack row, mono 0.5625rem on --ink-4.'
      ],
      structure: [
        'section.index, a two column grid: 1fr for the list and minmax(22rem, 38%) for the plate column, with a 1px rule between them.',
        'ol.rows: six list items, each containing one button that fills the row. A button, not a div with a click handler, so it is reachable, announceable and has a focus ring for free.',
        'div.spine: a 1px full-height rule with a 2px marker that translates to the active row. Transform only; the marker never changes height.',
        'aside.plate: sticky at the top of the column. Two stacked plate layers that swap roles, plus the caption, outcome and stack beneath.',
        'aside.case: the shared case sheet, opened from a row.'
      ],
      interaction: [
        'Below 768px: an IntersectionObserver with rootMargin -40% top and -55% bottom activates whichever row is crossing the reading line, and the sticky plate band answers it. One state machine, two input models.',
        'Pointer: entering a row sets it active. Leaving the whole list does not clear the active row; it stays on the last one read, because a column that empties on mouse-out flashes every time the reader reaches for the scrollbar.',
        'Keyboard: Tab moves through the six row buttons and focus sets the same active row as hover, so the two input models produce identical state.',
        'ArrowDown and ArrowUp move between rows and move focus with them. Home and End jump to the first and last row.',
        'Enter, Space or a click opens the case sheet for the active row.',
        'The plate swap direction is the sign of the row index change: moving down the index sends the outgoing plate up.',
        'Hover intent: 60ms of dwell before the active row changes. Without it, dragging the cursor diagonally across the list fires all six swaps in 200ms.'
      ],
      choreography: [
        { n: 'Row activate', d: 'The name translates from 0 to 18px on X over 420ms cubic-bezier(0.23, 1, 0.32, 1) and its colour goes from --ink-3 to --ink. The 18px is transform, never padding or margin, so no row reflows and the list never jitters.' },
        { n: 'Row rule', d: 'A 1px rule under the active row scales on X from 0 to 1 with transform-origin left over 480ms cubic-bezier(0.23, 1, 0.32, 1). The previous row\'s rule collapses to transform-origin right over 300ms, so the rule reads as travelling down the list rather than blinking.' },
        { n: 'Spine marker', d: 'translate3d(0, rowIndex * rowHeight, 0) over 480ms cubic-bezier(0.23, 1, 0.32, 1). One transform on one element; the row height is read once and cached on resize.' },
        { n: 'Plate swap', d: 'Outgoing layer to translate3d(0,-14%,0) and opacity 0, incoming from translate3d(0,14%,0) opacity 0, both over 560ms cubic-bezier(0.23, 1, 0.32, 1), signs inverted when moving up the list.' },
        { n: 'Caption stagger', d: 'Figure caption, outcome and stack: opacity 0 to 1 with translate3d(0,10px,0) to 0 over 420ms cubic-bezier(0.23, 1, 0.32, 1) at delays 60, 120 and 180ms. A transition, not keyframes, so crossing three rows quickly retargets instead of restarting.' },
        { n: 'Dimming', d: 'Inactive rows sit at --ink-3 and the active one at --ink. Colour only. No blur on the inactive rows: blurring five rows to emphasise one is expensive to paint and reads as a filter effect rather than as attention.' }
      ],
      scroll: [
        'The list is exactly six rows and fits one viewport at every size above 768px, so there is no page scroll on desktop. Nothing is pinned, nothing is scrubbed.',
        'The plate column is position: sticky with a top offset equal to the page inset, which only matters below 768px where the page does scroll.',
        'In the Next.js build this is /work. Each row links to /work/[slug], so the index degrades to six working links with JavaScript disabled, which is the correct failure mode for an index.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine). Below that the active row is set by focus and by tap only.',
        'Hovering a row: name to --ink, translate 18px, rule scales in, spine marker travels, plate column swaps.',
        'The row hit area is the full width of the list column and 100% of the row height, so the reader never has to aim at the text.',
        'No cursor-following anything. The cursor label reads the project name and nothing else moves with the pointer.'
      ],
      click: [
        'Clicking anywhere in a row opens that project\'s case sheet.',
        'The case sheet returns focus to the row that opened it, so Tab continues from where the reader was.',
        'There is no second click target inside a row. One row, one destination.'
      ],
      responsive: {
        desktop: 'Two columns, list left at 1fr and plate right at 38%, spine on the far left. Names up to 3.75rem.',
        tablet: 'Same two columns with the plate column at 34% and names capped at 2.5rem. The row meta drops the role and keeps discipline and year.',
        mobile: 'A different composition, not a smaller one. There is no hover, so scroll drives the column instead: the plate becomes a sticky 16:9 band at the top of the page and whichever row crosses 40% of the viewport activates it. The spine is removed, rows become full-width blocks with their meta stacked, and the same setActive path serves both input models rather than a phone-only branch.'
      },
      a11y: [
        'Rows are buttons inside an ordered list, so the count and the position are announced without any extra markup.',
        'The plate column is aria-hidden and its text content is repeated in the button label, so a screen reader user gets the outcome from the row itself rather than from a region they have to go looking for.',
        'aria-current="true" on the active row.',
        'Focus and hover set identical state. The keyboard path is not a degraded copy of the pointer path.',
        'Focus rings are never clipped: the row buttons have their outline offset inside the row bounds, and the sticky plate column does not overlap the list.',
        'prefers-reduced-motion: the plate becomes a 200ms opacity crossfade, the name offset and the spine marker jump rather than travel, and the caption block appears without transform. Every row is still fully readable and the index still tells you where you are.'
      ],
      perf: [
        'Two plate canvases for the whole page, swapped. Only the visible one paints, and the frame loop is unsubscribed entirely whenever the active project is one of the three plates that are finished drawings rather than animations.',
        'Row activation writes one class and one custom property. No layout property is animated: the 18px offset is a transform and the rule is a scaleX.',
        'Row height is measured once per resize and cached; the spine marker reads the cached value rather than measuring per activation.',
        'Hover intent at 60ms prevents six plate swaps firing during one diagonal cursor sweep.',
        'No blur, no box-shadow and no filter anywhere in the hover path.'
      ],
      packages: pkgs([
        { p: 'No carousel or hover-preview library', w: 'This is six buttons, one class toggle and a two-layer crossfade. Every hover-preview package on npm ships the cursor-following behaviour this concept exists to avoid.' }
      ]),
      architecture: [
        { f: 'app/work/page.tsx', r: 'Server Component. Renders the six rows as real links with their full text content, so the index works with JavaScript disabled.' },
        { f: 'components/projects/IndexList.tsx', r: '"use client". Owns the active row, the hover intent timer and the keyboard handlers.' },
        { f: 'components/projects/PlateColumn.tsx', r: '"use client". The two swapping layers plus the caption block. Takes the active project and the direction as props and owns no state of its own.' },
        PLATE_NOTE,
        { f: 'components/projects/CaseSheet.tsx', r: 'The shared case sheet.' },
        { f: 'content/projects.ts', r: 'The typed project array.' }
      ],
      state: [
        'React state: the active row index, the direction of the last change, and whether the case sheet is open.',
        'Refs, never state: the hover intent timer id and the cached row height. Both change without the render needing to.',
        'Direction is stored rather than derived, because the plate swap needs to know how the reader arrived, not just where they are.',
        'The active row is not persisted or reflected in the URL. Only opening a case changes the route.'
      ],
      typography: [
        'Names: Space Grotesk 400 at clamp(2rem, 4.4vw, 3.75rem), tracking -0.04em, line-height 1.02. Weight 400 rather than 500: at this size, size is already the emphasis.',
        'Row meta and the spine: JetBrains Mono 500 with tabular figures, so the six years form a straight column.',
        'Outcome: Space Grotesk 400 at 0.9375rem over 46ch. Prose is never set in mono anywhere in this concept.'
      ],
      color: [
        'Ground --void. Inactive rows --ink-3, active --ink. That single step is the whole emphasis system.',
        '--c-accent follows the active project and appears in the spine marker, the row number and the case sheet rule.',
        'The plate column has no background of its own; the plate sits directly on the ground with a 1px --line border.',
        'The rule between the two columns is --line, one pixel, full height. It is the only structural line on the page.'
      ],
      spacing: [
        'Rows are (100dvh minus the page insets) divided by six, with a floor of 88px, so the list always fills the viewport exactly.',
        'Page inset follows the shell gutter. The spine sits 1.5rem left of the row text.',
        'Plate column: 1.25rem between the plate and the caption, 0.875rem to the outcome, 1.5rem to the stack row.'
      ],
      relationships: [
        'Vertical position of the spine marker encodes which row is active, and it is the only element that moves down the page.',
        'Row colour encodes active or not, in one step.',
        'Plate swap direction encodes which way the reader is moving through the index.',
        'The accent hue encodes which project, and it is the only hue on the page at any moment.'
      ],
      acceptance: [
        'Nothing follows the cursor anywhere on the page.',
        'Hovering row four and hovering row one produce a plate that travels in opposite directions.',
        'Sweeping the cursor diagonally across all six rows fires at most two plate swaps, not six.',
        'Tab through the list produces exactly the same visual state as hovering it.',
        'No row moves the layout when it activates: the 18px shift is a transform and the rule is a scaleX.',
        'With reduced motion on, the index is still a considered contents page and the plate still changes, just without travel.',
        'At 375px there is no fixed column, every row carries its own plate, and no information is only available on hover.'
      ]
    },

    mount: function (root, ctx) {
      var env = SE.env;
      root.classList.add('projects-index');

      /* ------------------------------------------------------------ DOM */
      var listWrap = SE.el('div', 'projects-index__list');
      var spine = SE.el('div', 'projects-index__spine');
      spine.setAttribute('aria-hidden', 'true');
      spine.innerHTML = '<i></i>';
      listWrap.appendChild(spine);

      var ol = SE.el('ol', 'projects-index__rows');
      ol.innerHTML = PROJECTS.map(function (p, i) {
        return '<li><button type="button" data-row="' + i + '" aria-current="' + (i === 0) + '">' +
                 '<span class="projects-index__n t-num">' + p.num + '</span>' +
                 '<span class="projects-index__nm">' + p.name + '</span>' +
                 '<span class="projects-index__disc t-num">' + p.discipline + '</span>' +
                 '<span class="projects-index__yr t-num">' + p.year + '</span>' +
                 '<span class="sr-only">. ' + p.role + '. ' + p.problem + ' ' + p.outcome + '</span>' +
                 '<s></s>' +
               '</button></li>';
      }).join('');
      listWrap.appendChild(ol);
      root.appendChild(listWrap);

      var col = SE.el('aside', 'projects-index__col');
      col.setAttribute('aria-hidden', 'true');
      var plateBox = SE.el('div', 'projects-index__plate');
      col.appendChild(plateBox);
      var below = SE.el('div', 'projects-index__below');
      below.innerHTML =
        '<p class="projects-index__fig t-num" data-fig></p>' +
        '<p class="projects-index__outcome" data-outcome></p>' +
        '<div class="projects-index__tech" data-tech></div>';
      col.appendChild(below);
      root.appendChild(col);

      var kase = makeCase(root);
      root.appendChild(SE.srList('Index: six projects', srItems(), function (item) {
        setActive(item.p.index);
      }));

      var swap = plateSwap(plateBox, { project: PROJECTS[0], axis: 'y', zoom: 460 });

      /* ---------------------------------------------------------- state */
      var active = 0;
      var rows = SE.$$('[data-row]', ol);
      var marker = SE.$('i', spine);
      var hoverTimer = 0;
      var figOut = SE.$('[data-fig]', below);
      var outOut = SE.$('[data-outcome]', below);
      var techOut = SE.$('[data-tech]', below);

      function setActive(i, dir) {
        i = M.clamp(i, 0, PROJECTS.length - 1);
        if (i === active && rows[i].getAttribute('aria-current') === 'true') return;
        dir = dir == null ? (i > active ? 1 : -1) : dir;
        active = i;
        var p = PROJECTS[i];

        rows.forEach(function (b, k) { b.setAttribute('aria-current', String(k === i)); });
        root.style.setProperty('--c-accent', p.accent);
        if (SE.stageAccent) SE.stageAccent(p.accent);

        /* The marker travels by a transform on one element. The row height is
           a percentage of the list, so it survives a resize without a
           measurement pass. */
        marker.style.transform = 'translate3d(0,' + (i * 100) + '%,0)';

        swap.show(p, dir);
        syncTicker(p);
        figOut.textContent = 'Fig. ' + p.num + '   ' + p.figure;
        outOut.textContent = p.outcome;
        techOut.innerHTML = techMarkup(p, 4);
        if (!env.reduced) {
          below.classList.remove('is-in');
          void below.offsetWidth;
        }
        below.classList.add('is-in');
      }

      /* ----------------------------------------------------- interaction */
      /* 60ms of dwell. Without it a diagonal sweep across the list fires all
         six swaps inside 200ms and the column strobes. */
      function intend(i) {
        window.clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(function () { setActive(i); }, 60);
      }

      ol.addEventListener('pointerover', function (e) {
        if (!env.fine) return;
        var b = e.target.closest('[data-row]');
        if (b) intend(parseInt(b.getAttribute('data-row'), 10));
      });

      ol.addEventListener('focusin', function (e) {
        var b = e.target.closest('[data-row]');
        if (b) {
          window.clearTimeout(hoverTimer);
          setActive(parseInt(b.getAttribute('data-row'), 10));
        }
      });

      ol.addEventListener('click', function (e) {
        var b = e.target.closest('[data-row]');
        if (!b) return;
        var i = parseInt(b.getAttribute('data-row'), 10);
        setActive(i);
        kase.show(PROJECTS[i], b);
      });

      if (env.fine) {
        ol.addEventListener('pointerenter', function () { SE.cursor && SE.cursor.on(true); });
        ol.addEventListener('pointerleave', function () {
          SE.cursor && SE.cursor.on(false);
          SE.cursor && SE.cursor.label('');
        });
        ol.addEventListener('pointermove', function (e) {
          var b = e.target.closest('[data-row]');
          SE.cursor && SE.cursor.label(b ? 'Open case' : '');
        });
      }

      function onKey(e) {
        if (kase.isOpen()) return;
        var next = null;
        if (e.key === 'ArrowDown') next = active + 1;
        else if (e.key === 'ArrowUp') next = active - 1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = PROJECTS.length - 1;
        if (next == null) return;
        e.preventDefault();
        next = M.clamp(next, 0, PROJECTS.length - 1);
        setActive(next);
        rows[next].focus({ preventScroll: true });
      }
      root.addEventListener('keydown', onKey);

      /* ---------------------------------------------------- mobile driver */
      /* Below 768px there is no hover to answer, so the plate column becomes a
         sticky band above the list and the row crossing 40% of the viewport
         drives it. Same setActive, same plate swap: one state machine, two
         input models, rather than a second implementation for phones. */
      var rowIO = null;
      var narrow = watchNarrow(function (isNarrow) {
        if (isNarrow && !rowIO && typeof IntersectionObserver !== 'undefined') {
          rowIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              if (!en.isIntersecting) return;
              setActive(parseInt(en.target.getAttribute('data-row'), 10));
            });
          }, { root: root, rootMargin: '-40% 0px -55% 0px', threshold: 0 });
          rows.forEach(function (b) { rowIO.observe(b); });
        } else if (!isNarrow && rowIO) {
          rowIO.disconnect();
          rowIO = null;
        }
      });

      /* ------------------------------------------------------------ tick */
      /* Three of the six plates are finished drawings; the ticker only earns
         its place while an animated one is on screen. */
      var ticking = false;
      function tick(dt, t) { swap.paint(t); }
      function syncTicker(p) {
        var want = isAnimated(p);
        if (want && !ticking) { SE.ticker.add(tick); ticking = true; }
        else if (!want && ticking) { SE.ticker.remove(tick); ticking = false; }
        if (!want) swap.paint(3.2);
      }

      /* ------------------------------------------------------------ boot */
      active = -1;
      setActive(0, 1);

      return {
        destroy: function () {
          if (ticking) SE.ticker.remove(tick);
          window.clearTimeout(hoverTimer);
          if (rowIO) rowIO.disconnect();
          narrow.destroy();
          root.removeEventListener('keydown', onKey);
          swap.destroy();
          kase.destroy();
          SE.cursor && SE.cursor.on(false);
          SE.cursor && SE.cursor.label('');
          if (SE.stageAccent) SE.stageAccent('#CFC6AE');
          root.classList.remove('projects-index');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     PAGE 04  -  COVERFLOW
     --------------------------------------------------------------------------
     An angled carousel with real perspective, and an expand that is a genuine
     shared-element transition rather than a modal appearing next to the thing
     it claims to be.

     WHY FLIP AND NOT A MODAL
     ------------------------
     The expand measures the front card's plate, lays the full-frame panel out
     at its final size, then transforms the panel's plate back onto the card's
     rectangle and releases it. First, Last, Invert, Play. The plate the reader
     was looking at becomes the plate they are now reading, on one continuous
     path, which is the entire argument for using 3D here at all: depth is only
     worth having if it survives the transition.

     WHY NO REFLECTION
     -----------------
     The mirrored floor is the one detail everybody remembers about coverflow
     and the one that dates it hardest. Depth here comes from perspective,
     occlusion and a contact shadow under the front card, which is how depth
     works in a room.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'projects-page-coverflow',
    num: 4,
    name: 'Coverflow',
    kind: 'CSS 3D / shared-element expand',
    accent: '#3FA9C9',
    tagline: 'Depth that survives the transition',
    desc: 'Six plates angled into real perspective, flicked with hand-written momentum and a rubber band at the ends. ' +
          'Opening one expands the plate itself into the full case rather than fading a panel in over it.',
    interaction: 'Drag or flick through the row, arrow keys step, and clicking the front plate expands it into the case on a measured FLIP.',
    hint: 'Drag to flick &middot; Click the front plate to expand',

    /* Miniature: five angled plates with the centre one square on, drifting.
       Around 32 operations per frame. */
    preview: function (ctx, w, h, t, heat) {
      var n = PROJECTS.length;
      var pos = (t * 0.34 + heat * 0.5) % n;
      var cw = w * 0.30, ch = h * 0.56;
      var cy = h * 0.46;
      for (var k = -2; k <= 2; k++) {
        var i = ((Math.round(pos) + k) % n + n) % n;
        var d = Math.round(pos) + k - pos;
        var ad = Math.abs(d);
        if (ad > 2.4) continue;
        var p = PROJECTS[i];
        var x = w / 2 + d * cw * 0.62;
        var sw = cw * (ad < 0.5 ? 1 : 0.30);     /* foreshortening, not scale */
        var sh = ch * (1 - Math.min(0.34, ad * 0.16));
        ctx.globalAlpha = M.clamp(1 - ad * 0.28, 0.15, 1);
        ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',0.18)';
        ctx.fillRect(x - sw / 2, cy - sh / 2, sw, sh);
        ctx.strokeStyle = 'rgba(' + p.rgb.join(',') + ',0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - sw / 2 + 0.5, cy - sh / 2 + 0.5, sw, sh);
        ctx.globalAlpha = 1;
      }
      var bar = h * 0.88;
      ctx.fillStyle = 'rgba(236,236,239,0.14)';
      ctx.fillRect(w * 0.16, bar, w * 0.68, 1);
      ctx.fillStyle = '#3FA9C9';
      ctx.fillRect(w * 0.16 + (pos / n) * w * 0.68, bar - 1, w * 0.11, 3);
    },

    spec: {
      subtitle: 'An angled row of plates with real perspective, and an expand that moves the plate itself.',
      philosophy: [
        'Depth is only worth having if it survives the transition. A 3D carousel that opens a flat modal has spent its budget on a party trick; this one carries the plate from the row into the case on one path.',
        'No mirrored floor. The reflection is the detail everybody remembers about coverflow and the one that dates it hardest; depth here comes from perspective, occlusion and a contact shadow, which is how depth works in a room.',
        'The ends are ends. A rubber band past the last plate tells the reader how much there is without a counter having to say it.',
        'Angle carries information: how far a plate is turned away is exactly how far it is from being the one you are reading.'
      ],
      hierarchy: [
        '1. The front plate, square on, 34vw wide at 4:3, with a contact shadow. Deliberately smaller than it could be: the expand has to read as an expansion, so the row plate and the case plate must not be the same size.',
        '2. The name and outcome, bottom left, clamp(2rem, 4vw, 3.25rem) and 1rem.',
        '3. The flanking plates, turned 42 degrees and receding 190px per step.',
        '4. The position rail, mono, bottom right.'
      ],
      structure: [
        'section.flow with perspective: 1400px and perspective-origin: 50% 42%. The origin sits above centre so the row reads as being at eye level rather than seen from below.',
        'div.rail with transform-style: preserve-3d, holding six card elements.',
        'article.card: one plate canvas plus a two-line caption. transform is written per frame from a single continuous position value; nothing is animated by CSS on the cards themselves.',
        'div.meta: name, discipline, outcome and the expand button, bottom left.',
        'section.expand: the full-frame case. Laid out at its final size at all times and revealed by a measured FLIP, never by a width or height animation.',
        'nav.rail-index: six position marks, bottom right, each a real button.'
      ],
      interaction: [
        'Position is one continuous float, `pos`, where 2.0 means the third plate is square on. Drag, flick, wheel, arrows and the index all write to that one number, so every input is interruptible by every other.',
        'Drag: pos -= dx / 300, so 300px of travel is exactly one plate. Below the 6px movement threshold (9px on touch) the gesture is a click and expands the front plate.',
        'Flick: velocity is sampled per pointermove, clamped to 14 plates per second, and the settle target is round(pos + velocity * 0.16), which lets a hard flick carry two or three plates.',
        'Settle: the target is chosen once, when the gesture ends, as round(pos + velocity * 0.16) clamped to the ends. Then acceleration = (target - pos) * 118 - velocity * 21, integrated per frame, which reaches it in about 380ms with no visible overshoot. Do not re-derive the target inside the loop: a loop that recomputes it every frame overwrites any target set by a key press on the very next frame, which is how a hand-rolled carousel ends up ignoring its own keyboard.',
        'Rubber band: past either end the position still moves, at 0.34 of the input, and the spring pulls it back. That resistance is what makes an end feel like an end.',
        'Wheel: horizontal wheel delta adds to velocity at 0.006 per unit. Vertical wheel is ignored, because a vertical gesture on a horizontal row is almost always someone trying to scroll the page.',
        'Keyboard: ArrowLeft and ArrowRight step one plate, Home and End jump to the ends, Enter or Space expands the front plate, Escape collapses it. This is the required alternative to the drag.',
        'Clicking a flanking plate brings it to the front rather than expanding it. One click, one meaning, depending on where the plate already is.'
      ],
      choreography: [
        { n: 'Card transform', d: 'For a plate at signed distance d from the front: translateX(d * 30% of the card width + sign(d) * 12%), translateZ(-|d| * 190px), rotateY(d * -42deg), and opacity clamp(1 - |d| * 0.26, 0, 1). Written directly to style.transform every frame from the physics value; no CSS transition on the cards, because a transition on top of a spring is two motion models fighting.' },
        { n: 'Contact shadow', d: 'A 2px blurred rule under the front card at 34% opacity, revealed by an is-front class rather than per frame. box-shadow is a discrete state change here, never a loop.' },
        { n: 'Expand (FLIP)', d: 'First: measure the front card plate rect. Last: the panel is already laid out at its final size. Invert: set the panel plate transform to translate3d(dx,dy,0) scale(a.width / b.width) with transition none. Play: force one style flush, clear the transform, and transition over 620ms cubic-bezier(0.77, 0, 0.175, 1). The panel text then fades from opacity 0 and translate3d(0,16px,0) over 320ms cubic-bezier(0.23, 1, 0.32, 1) delayed 180ms.' },
        { n: 'Collapse', d: 'The same transform is reapplied over 420ms on the same curve, which is 68% of the entrance. The panel is hidden on transitionend, with a 520ms timeout as the fallback so a dropped transitionend cannot leave a dead panel in the tree.' },
        { n: 'Index mark', d: 'The active mark scales on Y from 1 to 2.6 with transform-origin bottom over 300ms cubic-bezier(0.23, 1, 0.32, 1). Transform, not height.' }
      ],
      scroll: [
        'The page does not scroll. touch-action: pan-y on the rail so a vertical swipe on a phone still reaches the page underneath in the production build.',
        'The expanded case is the only scrolling region, with overscroll-behavior: contain.',
        'In the Next.js build /work is the row and /work/[slug] is the row with that plate expanded, so the shared-element transition also works as a route transition using the View Transition API where it is available, and as this FLIP where it is not.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine).',
        'The front plate takes the grab cursor and a cursor label reading Expand. Flanking plates get a label with their project name, because clicking them means something different.',
        'Flanking plates lift 8px on Z on hover over 180ms. Eight pixels of Z is enough to say clickable and small enough not to disturb the row.',
        'Nothing brightens. In a row where opacity already encodes distance, a hover brightness would contradict it.'
      ],
      click: [
        'Front plate: expands, via the FLIP above.',
        'Flanking plate: sets the target to that plate and springs to it. It does not expand, because the reader has not seen it square on yet.',
        'Index mark: jumps to that plate, spring, same target value.',
        'Escape or the close control collapses the expand and returns focus to the front card.'
      ],
      responsive: {
        desktop: 'Perspective 1400px, cards at 34vw and 4:3, six visible with three either side of the front one. Meta bottom left, index bottom right.',
        tablet: 'Perspective 1100px, cards at 46vw, rotation reduced to 34 degrees so the flanking plates stay readable at the shallower width.',
        mobile: 'A different composition, not a smaller one. Perspective and rotation are removed entirely: the row becomes a flat strip of 84vw plates with a 5% peek of the next one, driven by the same position value and the same physics. The meta block moves under the strip as a fixed bar, the expand becomes a full-height sheet with no FLIP (there is nowhere to fly from on a 375px screen), and the plates render at devicePixelRatio capped to 1.75.'
      },
      a11y: [
        'Each card is a button with the project name, discipline and outcome as its accessible name, so the row is a list of six real controls and not a canvas with a click handler.',
        'Arrow keys, Home and End are the required non-pointer alternative to the drag, and the index marks are the required single-pointer alternative.',
        'The expanded case is role="dialog" with aria-modal="true", focus moved to its close control, focus trapped while open, and focus returned to the front card on close.',
        'While the case is open, the row behind is inert, so Tab cannot walk into it.',
        'aria-live="polite" status announces the front project when it changes, throttled to the settled position rather than fired per frame.',
        'prefers-reduced-motion: the spring is replaced by an immediate set to the target position, the FLIP is replaced by a 200ms opacity crossfade, hover lift and rubber band are switched off, and the perspective stays because a static angled row is a composition rather than a motion effect.'
      ],
      perf: [
        'Six canvases, one per plate, painted once at mount. Only the front plate repaints per frame, and only when its painter is one of the three that use time.',
        'The per-frame write is six style.transform strings and six opacity values, all composited. No layout property is touched and no card has a CSS transition that could fight the spring.',
        'will-change: transform on the six cards only, and it is removed once the row settles.',
        'The expand panel is mounted once and toggled; its plate is a seventh canvas that only paints while the panel is open.',
        'Backing store capped at devicePixelRatio 2, and 1.75 below 768px.'
      ],
      packages: pkgs([
        { p: 'No carousel library', w: 'Swiper and Embla both own the transform, which makes a FLIP out of a card into a full-frame panel a fight. The physics here is fifteen lines and leaves the transform under this component\'s control.' }
      ]),
      architecture: [
        { f: 'app/work/page.tsx', r: 'Server Component. Renders the six cards as real markup and links, so the row is crawlable and works without JavaScript.' },
        { f: 'app/work/[slug]/page.tsx', r: 'The row with that plate expanded. generateStaticParams over the six ids.' },
        { f: 'components/projects/Coverflow.tsx', r: '"use client". Owns the position value, the spring, the pointer and key handlers, and the FLIP.' },
        { f: 'components/projects/useFlip.ts', r: 'The measure, invert and play sequence on its own, so the expand can be reused by the route transition.' },
        PLATE_NOTE,
        { f: 'components/projects/ExpandedCase.tsx', r: 'The full-frame case. Dialog semantics, focus trap, Escape.' },
        { f: 'content/projects.ts', r: 'The typed project array.' }
      ],
      state: [
        'React state: the settled front index, and whether the case is expanded. Both change a handful of times per session.',
        'Refs, never state: position, velocity, spring target, drag origin, last pointer sample, and the six card elements. Position changes sixty times a second; in state it would re-render the whole row every frame.',
        'The FLIP measurement is taken at the moment of the click and thrown away after the transition. It is never stored, because a stale rect is worse than a re-measure.',
        'Route and front index stay in sync through history.replaceState so a reader can share the plate they are looking at.'
      ],
      typography: [
        'Card caption: JetBrains Mono 500 at 0.625rem with 0.18em tracking, the index number and the name. It is a specimen label, which is exactly what mono is for.',
        'Meta name: Space Grotesk 500 at clamp(2rem, 4vw, 3.25rem), tracking -0.04em.',
        'Expanded case: name at clamp(2.5rem, 5vw, 4rem), body at 1rem over 68ch, and the detail paragraph at 0.9375rem over 74ch.'
      ],
      color: [
        'Ground --void. --c-accent follows the front project, so the caption, the index mark and the contact shadow tint all agree.',
        'Receding plates darken by opacity only, never by a black overlay, so a plate three positions back is still recognisably its own hue.',
        'The contact shadow is a tinted shadow of the project hue at 34%, not a pure black one, because a black shadow on a coloured plate reads as dirt.',
        'The expanded case sits on --surface, one step up from the row, which is the only place in this concept where two ground values are used at once.'
      ],
      spacing: [
        'Card width 42vw at 4:3, with the front card centred and the row at 46% of the viewport height.',
        'Meta block: 1rem between discipline and name, 1.25rem to the outcome, 1.75rem to the expand button.',
        'Index marks on a 22px pitch inside 44px tall hit areas.',
        'Expanded case: a two column grid at 1.1fr and 1fr, gutter clamp(2rem, 5vw, 4.5rem), with the plate on the left.'
      ],
      relationships: [
        'Rotation angle encodes distance from the front, and is the primary depth cue.',
        'Z translation encodes the same distance, and is what makes plates occlude each other correctly.',
        'Opacity encodes distance a third time. Three redundant channels for one quantity is correct here: it is the only quantity the reader has to track.',
        'The contact shadow encodes exactly one thing, which is which plate is currently readable.'
      ],
      acceptance: [
        'The expand starts from the plate the reader clicked, at that plate\'s exact position and size, every time.',
        'Flicking hard crosses two or three plates and settles without overshoot.',
        'Dragging past the last plate meets resistance and springs back.',
        'A 5px drag on the front plate expands it; a 40px drag does not.',
        'Arrow keys, Home, End and the index marks reach every plate with no pointer at all.',
        'There is no mirrored reflection anywhere.',
        'With reduced motion on, the row is a static angled composition, stepping is instant, and the case crossfades.',
        'At 375px there is no rotation and no perspective, and the same drag still moves the same position value.'
      ]
    },

    mount: function (root, ctx) {
      var env = SE.env;
      root.classList.add('projects-flow');

      /* ------------------------------------------------------------ DOM */
      var stage = SE.el('div', 'projects-flow__stage');
      var rail = SE.el('div', 'projects-flow__rail');
      stage.appendChild(rail);
      root.appendChild(stage);

      var meta = SE.el('div', 'projects-flow__meta');
      meta.innerHTML =
        '<p class="projects-flow__disc t-num" data-disc></p>' +
        '<h2 class="projects-flow__name" data-name></h2>' +
        '<p class="projects-flow__outcome" data-outcome></p>' +
        '<div class="projects-flow__actions">' +
          '<button class="btn" type="button" data-expand>Expand the plate</button>' +
        '</div>';
      root.appendChild(meta);

      var marks = SE.el('nav', 'projects-flow__marks');
      marks.setAttribute('aria-label', 'Projects');
      marks.innerHTML =
        '<span class="projects-flow__count t-num"><b data-cur>01</b> / ' + TOTAL + '</span>' +
        PROJECTS.map(function (p, i) {
          return '<button type="button" data-go="' + i + '" aria-current="' + (i === 0) +
                 '" aria-label="' + p.num + ' ' + p.name + '"><i></i></button>';
        }).join('');
      root.appendChild(marks);

      var status = SE.el('p', 'sr-only');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      root.appendChild(status);

      /* The expanded case is laid out at its final size at all times. That is
         what makes the FLIP possible: there is a real Last rectangle to
         measure against. */
      var panel = SE.el('section', 'projects-flow__expand');
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-label', 'Project case');
      panel.hidden = true;
      panel.innerHTML =
        '<div class="projects-flow__exp-plate"></div>' +
        '<div class="projects-flow__exp-body">' +
          '<p class="projects-flow__exp-meta t-num"><span data-enum></span><i></i><span data-edisc></span></p>' +
          '<h3 class="projects-flow__exp-name" data-ename></h3>' +
          '<p class="projects-flow__exp-role t-num" data-erole></p>' +
          '<p class="projects-flow__exp-problem" data-eproblem></p>' +
          '<p class="projects-flow__exp-detail" data-edetail></p>' +
          '<p class="projects-flow__exp-outcome" data-eoutcome></p>' +
          '<div class="projects-flow__exp-tech" data-etech></div>' +
        '</div>' +
        '<button class="iconbtn projects-flow__exp-close" type="button" data-close aria-label="Close this case">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>' +
        '</button>';
      root.appendChild(panel);

      root.appendChild(SE.hintStrip(
        '<span>Drag to flick</span><span><kbd>&larr;</kbd><kbd>&rarr;</kbd> step</span><span><kbd>Enter</kbd> expand</span>'
      ));

      root.appendChild(SE.srList('Coverflow: six projects in an angled row', srItems(), function (item) {
        goTo(item.p.index);
      }));

      /* ---------------------------------------------------------- cards */
      var cards = PROJECTS.map(function (p, i) {
        var el = SE.el('button', 'projects-flow__card');
        el.type = 'button';
        el.setAttribute('data-card', String(i));
        el.setAttribute('aria-label', p.name + ', ' + p.discipline + ', ' + p.year + '. ' + p.outcome);
        el.style.setProperty('--c-accent', p.accent);
        var plate = SE.el('div', 'projects-flow__plate');
        el.appendChild(plate);
        var cap = SE.el('span', 'projects-flow__cap t-num', p.num + '   ' + p.name.toUpperCase());
        el.appendChild(cap);
        rail.appendChild(el);
        return { el: el, plate: plate, art: mountArt(plate, p, { zoom: 460 }), p: p, d: 99 };
      });

      var expArt = mountArt(SE.$('.projects-flow__exp-plate', panel), PROJECTS[0], { zoom: 520 });

      /* ---------------------------------------------------------- state */
      /* watchNarrow fires its callback synchronously on construction, so the
         handler has to tolerate `narrow` not existing yet. */
      var narrow = watchNarrow(function () { if (narrow) layout(true); });
      var pos = 0, vel = 0, target = 0;
      var dragging = false, moved = false, dragStart = 0, posStart = 0, lastX = 0, lastMs = 0;
      var expanded = false, expTimer = 0, lastFocus = null;
      var out = {
        disc: SE.$('[data-disc]', meta), name: SE.$('[data-name]', meta),
        outcome: SE.$('[data-outcome]', meta), cur: SE.$('[data-cur]', marks)
      };
      var goMarks = SE.$$('[data-go]', marks);
      var frontIdx = -1;

      /* --------------------------------------------------------- layout */
      /* One continuous position value drives six transforms. No CSS
         transition on the cards: a transition on top of a spring is two
         motion models fighting over the same property. */
      function layout(force) {
        var mob = narrow.matches();
        for (var i = 0; i < cards.length; i++) {
          var c = cards[i];
          var d = i - pos;
          if (!force && Math.abs(d - c.d) < 0.0015) continue;
          c.d = d;
          var ad = Math.abs(d);
          var vis = ad < 3.6;
          c.el.style.visibility = vis ? '' : 'hidden';
          c.el.setAttribute('tabindex', ad < 0.5 ? '0' : '-1');
          if (!vis) continue;

          var tx, tz, ry;
          if (mob) {
            /* flat strip: the same position value, no perspective */
            tx = d * 92;
            tz = 0;
            ry = 0;
          } else {
            tx = d * 30 + (d > 0 ? 12 : d < 0 ? -12 : 0);
            tz = -ad * 190;
            ry = d * -42;
          }
          c.el.style.transform =
            'translate3d(' + tx.toFixed(2) + '%,0,' + tz.toFixed(1) + 'px)' +
            ' rotateY(' + ry.toFixed(2) + 'deg)';
          c.el.style.opacity = M.clamp(1 - ad * 0.26, 0, 1).toFixed(3);
          c.el.style.zIndex = String(200 - Math.round(ad * 10));
          c.el.classList.toggle('is-front', ad < 0.5);
        }
        var idx = M.clamp(Math.round(pos), 0, cards.length - 1);
        if (idx !== frontIdx) setFront(idx);
      }

      function setFront(i) {
        frontIdx = i;
        var p = PROJECTS[i];
        out.disc.textContent = p.discipline;
        out.name.textContent = p.name;
        out.outcome.textContent = p.outcome;
        out.cur.textContent = p.num;
        status.textContent = p.name + ', ' + p.discipline + ', ' + p.year + '. ' + p.outcome;
        root.style.setProperty('--c-accent', p.accent);
        if (SE.stageAccent) SE.stageAccent(p.accent);
        goMarks.forEach(function (b, k) { b.setAttribute('aria-current', String(k === i)); });
        if (!env.reduced) {
          meta.classList.remove('is-in');
          void meta.offsetWidth;
        }
        meta.classList.add('is-in');
        syncTicker();
      }

      /* -------------------------------------------------------- physics */
      function clampPos(p) {
        var n = cards.length - 1;
        /* rubber band: past the ends the row still moves, at a third of the
           rate, which is the entire reason the ends feel like ends */
        if (p < 0) return p * 0.34;
        if (p > n) return n + (p - n) * 0.34;
        return p;
      }

      /* The settle target is chosen once, at the moment the gesture ends, from
         the position the flick was heading for. It is deliberately NOT
         re-derived inside the frame loop: a loop that recomputes
         round(pos + vel * 0.16) every frame silently overwrites any target set
         by a key press or an index click on the very next frame, which is the
         classic way a hand-rolled carousel ends up ignoring its own keyboard. */
      function settleTarget() {
        target = M.clamp(Math.round(pos + vel * 0.16), 0, cards.length - 1);
      }

      var ticking = false;
      function tick(dt, t) {
        if (!dragging) {
          var settled = Math.abs(vel) < 0.0015 && Math.abs(pos - target) < 0.0015;
          if (!settled) {
            if (env.reduced) { pos = target; vel = 0; }
            else {
              var acc = (target - pos) * 118 - vel * 21;
              vel += acc * dt;
              pos += vel * dt;
              if (Math.abs(vel) < 0.0015 && Math.abs(pos - target) < 0.0015) { pos = target; vel = 0; }
            }
          }
        }
        layout();
        if (expanded) expArt.paint(t);
        else if (cards[frontIdx]) cards[frontIdx].art.paint(t);
        /* The spring stops writing without firing anything, so the loop
           releases itself at the end of the frame that settled it. */
        syncTicker();
      }

      /* The loop is only worth running while something is moving or an
         animated plate is on screen. isAnimated() is already false under
         reduced motion, so that case needs no separate branch. */
      function needsTick() {
        if (dragging) return true;
        if (Math.abs(vel) > 0.0015 || Math.abs(pos - target) > 0.0015) return true;
        return isAnimated(PROJECTS[frontIdx]);
      }
      function syncTicker() {
        var want = needsTick();
        if (want && !ticking) { SE.ticker.add(tick); ticking = true; }
        else if (!want && ticking) { SE.ticker.remove(tick); ticking = false; }
      }
      function wake() { if (!ticking) { SE.ticker.add(tick); ticking = true; } }

      /* ----------------------------------------------------- interaction */
      function goTo(i) {
        target = M.clamp(i, 0, cards.length - 1);
        vel = 0;
        /* Under reduced motion the physics branch sets pos = target on the
           very next frame, so one code path serves both cases. */
        wake();
      }
      function step(d) { goTo(Math.round(pos) + d); }

      function onDown(e) {
        if (expanded) return;
        if (e.target.closest('[data-go], .sr-only, .projects-flow__meta')) return;
        dragging = true; moved = false;
        dragStart = lastX = e.clientX;
        posStart = pos;
        lastMs = performance.now();
        vel = 0;
        root.classList.add('is-dragging');
        try { stage.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
        wake();
      }

      function onMove(e) {
        if (!dragging) return;
        var now = performance.now();
        var dt = Math.max(8, now - lastMs) / 1000;
        var dxStep = e.clientX - lastX;
        lastX = e.clientX; lastMs = now;
        vel = M.clamp(-dxStep / 300 / dt, -14, 14);
        var total = e.clientX - dragStart;
        if (!moved && Math.abs(total) > slop()) moved = true;
        if (!moved) return;
        pos = clampPos(posStart - total / 300);
      }

      function onUp(e) {
        if (!dragging) return;
        dragging = false;
        root.classList.remove('is-dragging');
        if (!moved) {
          var card = e && e.target && e.target.closest ? e.target.closest('[data-card]') : null;
          vel = 0;
          if (card) {
            var i = parseInt(card.getAttribute('data-card'), 10);
            if (i === frontIdx) expand(); else goTo(i);
          } else {
            settleTarget();
          }
        } else {
          settleTarget();
        }
        wake();
      }

      stage.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);

      stage.addEventListener('wheel', function (e) {
        /* horizontal only: a vertical gesture on a horizontal row is almost
           always someone trying to scroll the page */
        if (expanded || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        vel += e.deltaX * 0.006;
        settleTarget();
        wake();
      }, { passive: true });

      marks.addEventListener('click', function (e) {
        var b = e.target.closest('[data-go]');
        if (b) goTo(parseInt(b.getAttribute('data-go'), 10));
      });

      SE.$('[data-expand]', meta).addEventListener('click', function () { expand(); });

      if (env.fine) {
        stage.addEventListener('pointerenter', function () { SE.cursor && SE.cursor.on(true); });
        stage.addEventListener('pointerleave', function () {
          SE.cursor && SE.cursor.on(false);
          SE.cursor && SE.cursor.label('');
        });
        stage.addEventListener('pointermove', function (e) {
          var card = e.target.closest('[data-card]');
          if (!card) { SE.cursor && SE.cursor.label(''); return; }
          var i = parseInt(card.getAttribute('data-card'), 10);
          SE.cursor && SE.cursor.label(i === frontIdx ? 'Expand' : PROJECTS[i].name);
        });
      }

      /* -------------------------------------------------- shared expand */
      /* First, Last, Invert, Play. The panel is already laid out at its final
         size, so the Last rectangle is real and no width or height is ever
         animated. */
      function expand() {
        if (expanded) return;
        var p = PROJECTS[frontIdx];
        lastFocus = document.activeElement;
        expArt.setProject(p);
        panel.style.setProperty('--c-accent', p.accent);
        SE.$('[data-enum]', panel).textContent = p.num + ' / ' + TOTAL;
        SE.$('[data-edisc]', panel).textContent = p.discipline;
        SE.$('[data-ename]', panel).textContent = p.name;
        SE.$('[data-erole]', panel).textContent = p.role + '   ' + p.year;
        SE.$('[data-eproblem]', panel).textContent = p.problem;
        SE.$('[data-edetail]', panel).textContent = p.detail;
        SE.$('[data-eoutcome]', panel).textContent = p.outcome;
        SE.$('[data-etech]', panel).innerHTML = techMarkup(p);

        window.clearTimeout(expTimer);
        panel.hidden = false;
        expanded = true;

        var target2 = SE.$('.projects-flow__exp-plate', panel);
        if (!env.reduced) {
          var a = cards[frontIdx].plate.getBoundingClientRect();
          var b = target2.getBoundingClientRect();
          if (a.width > 2 && b.width > 2) {
            var s = a.width / b.width;
            var dx = (a.left + a.width / 2) - (b.left + b.width / 2);
            var dy = (a.top + a.height / 2) - (b.top + b.height / 2);
            target2.style.transition = 'none';
            target2.style.transform =
              'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
            void target2.offsetWidth;
            target2.style.transition = '';
            target2.style.transform = '';
          }
        }
        void panel.offsetWidth;
        panel.classList.add('is-on');
        root.classList.add('is-expanded');
        stage.setAttribute('aria-hidden', 'true');
        marks.setAttribute('aria-hidden', 'true');
        SE.$('[data-close]', panel).focus({ preventScroll: true });
        wake();
      }

      function collapse() {
        if (!expanded) return;
        expanded = false;
        var target2 = SE.$('.projects-flow__exp-plate', panel);
        if (!env.reduced) {
          var a = cards[frontIdx].plate.getBoundingClientRect();
          var b = target2.getBoundingClientRect();
          if (a.width > 2 && b.width > 2) {
            var s = a.width / b.width;
            var dx = (a.left + a.width / 2) - (b.left + b.width / 2);
            var dy = (a.top + a.height / 2) - (b.top + b.height / 2);
            target2.style.transform =
              'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
          }
        }
        panel.classList.remove('is-on');
        root.classList.remove('is-expanded');
        stage.removeAttribute('aria-hidden');
        marks.removeAttribute('aria-hidden');
        if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
        else cards[frontIdx].el.focus({ preventScroll: true });
        /* a dropped transitionend must not be able to leave a dead panel in
           the accessibility tree */
        window.clearTimeout(expTimer);
        expTimer = window.setTimeout(function () {
          if (expanded) return;
          panel.hidden = true;
          SE.$('.projects-flow__exp-plate', panel).style.transform = '';
          syncTicker();
        }, env.reduced ? 0 : 520);
      }

      panel.addEventListener('click', function (e) {
        if (e.target.closest('[data-close]')) collapse();
      });

      function onKey(e) {
        if (expanded) {
          if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); collapse(); }
          else if (e.key === 'Tab') {
            /* trap: the row behind is aria-hidden, so focus must not walk out */
            var f = SE.$$('button, [href], [tabindex]:not([tabindex="-1"])', panel);
            if (!f.length) return;
            var first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
          return;
        }
        if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
        else if (e.key === 'Home') { goTo(0); e.preventDefault(); }
        else if (e.key === 'End') { goTo(cards.length - 1); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === ' ') {
          var t2 = e.target;
          if (t2 && t2.closest && t2.closest('[data-card].is-front')) { expand(); e.preventDefault(); }
        }
      }
      root.addEventListener('keydown', onKey);

      rail.addEventListener('click', function (e) {
        var card = e.target.closest('[data-card]');
        if (!card || moved) return;
        var i = parseInt(card.getAttribute('data-card'), 10);
        if (i !== frontIdx) goTo(i);
      });

      /* ------------------------------------------------------------ boot */
      layout(true);
      setFront(0);
      if (env.reduced) cards.forEach(function (c) { c.art.paint(3.2); });
      syncTicker();

      return {
        destroy: function () {
          if (ticking) SE.ticker.remove(tick);
          window.clearTimeout(expTimer);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
          root.removeEventListener('keydown', onKey);
          cards.forEach(function (c) { c.art.destroy(); });
          expArt.destroy();
          narrow.destroy();
          SE.cursor && SE.cursor.on(false);
          SE.cursor && SE.cursor.label('');
          if (SE.stageAccent) SE.stageAccent('#3FA9C9');
          root.classList.remove('projects-flow', 'is-dragging', 'is-expanded');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     PAGE 05  -  DOSSIER
     --------------------------------------------------------------------------
     Six records at full density, where the engineering detail is the thing
     doing the persuading.

     THE ARGUMENT
     ------------
     "Built with Go and Postgres" is a fact. "Chose to promote the built
     artefact rather than rebuild per environment, because a rollback has to be
     the same bytes that passed staging" is an argument, and it is the only
     thing on a portfolio that a senior reader cannot get from a CV. So each
     record leads with three decisions, each naming what was rejected.

     THE ONE INTERACTION
     -------------------
     A technology filter. Not because filtering six records is hard, but
     because a reader arrives with a stack in mind, and letting them ask "what
     did you do with Postgres" is more useful than any amount of motion.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'page',
    id: 'projects-page-dossier',
    num: 5,
    name: 'Dossier',
    kind: 'DOM / ruled record',
    accent: '#A8B4C0',
    tagline: 'The decisions, and what they were chosen over',
    desc: 'Six records at full density, each leading with three decisions and the alternative each one displaced. ' +
          'A technology filter answers the question a reader with a stack in mind actually came to ask.',
    interaction: 'Read it. Filter by any technology to see only the records that used it, and the rail tracks where you are.',
    hint: 'Filter by technology &middot; The rail tracks your position',

    /* Miniature: ruled record blocks scrolling past a fixed rail, with the
       filter row lighting. Around 34 operations per frame. */
    preview: function (ctx, w, h, t, heat) {
      var rand = SE.rng(52111);
      var padX = w * 0.06;
      var railW = w * 0.14;
      var off = -((t * (7 + heat * 16)) % (h * 0.46));

      /* the records */
      for (var b = 0; b < 4; b++) {
        var y = off + b * h * 0.46 + h * 0.06;
        if (y > h || y < -h * 0.5) continue;
        var p = PROJECTS[b % PROJECTS.length];
        ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',0.85)';
        ctx.fillRect(padX + railW, y, w * 0.16, 3);
        ctx.strokeStyle = 'rgba(236,236,239,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var r = 0; r < 6; r++) {
          var ry = Math.round(y + 12 + r * h * 0.055) + 0.5;
          if (ry > h) break;
          ctx.moveTo(padX + railW, ry);
          ctx.lineTo(padX + railW + w * (0.30 + rand() * 0.44), ry);
        }
        ctx.stroke();
      }

      /* the fixed rail */
      ctx.fillStyle = 'rgba(8,8,10,0.92)';
      ctx.fillRect(0, 0, padX + railW - 6, h);
      ctx.fillStyle = 'rgba(236,236,239,0.12)';
      ctx.fillRect(padX + railW - 7, 0, 1, h);
      for (var i = 0; i < 6; i++) {
        var on = i === Math.floor((t * 0.30) % 6);
        ctx.fillStyle = on ? '#A8B4C0' : 'rgba(236,236,239,0.16)';
        ctx.fillRect(padX, h * 0.18 + i * h * 0.10, on ? railW * 0.8 : railW * 0.44, 2);
      }
    },

    spec: {
      subtitle: 'Six records at full density, each leading with the decisions and what they displaced.',
      philosophy: [
        'Density is the point, not a compromise. A reader who has scrolled past four projects to reach this one has earned the detail, and thinning it out to look calm would be throwing away the only thing a CV cannot carry.',
        'Every record leads with three decisions, each naming what was rejected. A choice without an alternative is a preference; a choice with one is engineering.',
        'One interaction, and it is a tool. Filtering by technology answers the question a reader with a stack in mind actually arrived with.',
        'Numbers are counts of things that exist, never invented measurements. Where a figure would imply a benchmark, it is labelled as a model or it is not there.'
      ],
      hierarchy: [
        '1. The project name, 2.5rem, weight 500, on the record rule.',
        '2. The three decision rows: chosen at --ink, rejected at --ink-4 with a strikethrough weight of 1px, reason at --ink-2.',
        '3. The problem and outcome sentences, 1rem over 74ch.',
        '4. Stack chips and the plate strip.',
        '5. The rail, the filter row and the record meta, mono 0.625rem.'
      ],
      structure: [
        'section.dossier, position absolute inset 0, its own scroll container with overscroll-behavior: contain. The page behind it never moves.',
        'aside.rail: sticky left column, 13rem, holding the six record links and a position marker. Not a table of contents widget; six anchors and a rule.',
        'div.filters: the union of every technology across the six projects, sorted by how many projects use it, each a toggle button with its count.',
        'article.record x6: a 24px baseline grid. Header rule, meta line, problem, outcome, three decision rows, stack chips, and a 21:9 plate strip.',
        'The decision row is a three column grid: 1fr for the choice, auto for the rejected alternative, and a full-width reason line beneath. It collapses to a stack below 900px.'
      ],
      interaction: [
        'Filter: clicking a technology chip narrows the set. Records that do not use it drop to opacity 0.22 and are marked aria-hidden, rather than being removed, so the reader keeps their sense of how much work there is.',
        'Filter chips are toggle buttons with aria-pressed. Clicking the active one clears the filter; there is also an explicit All chip.',
        'A polite live region announces the result, for example "3 of 6 records use PostgreSQL".',
        'Rail: an IntersectionObserver with rootMargin -45% top and -50% bottom marks whichever record is crossing the reading line. Never a scroll listener.',
        'Clicking a rail entry scrolls that record to the top of the container with behavior smooth, or auto under reduced motion.',
        'The stack chip inside a record is also a filter control, so a reader can pivot from a record they liked to everything else that used the same tool.'
      ],
      choreography: [
        { n: 'Record reveal', d: 'On first intersection: opacity 0 to 1 and translate3d(0,18px,0) to 0 over 620ms cubic-bezier(0.23, 1, 0.32, 1), with the decision rows staggered 60ms apart behind it. Observed once and then unobserved; a record that re-animates on every pass is a record nobody can re-read.' },
        { n: 'Filter dim', d: 'Non-matching records go to opacity 0.22 over 320ms cubic-bezier(0.23, 1, 0.32, 1). Opacity only. Never height, never display, never a filter: blurring four records to emphasise two costs a full-page repaint and reads as a lens effect.' },
        { n: 'Rail marker', d: 'translate3d(0, index * 2.25rem, 0) over 420ms cubic-bezier(0.23, 1, 0.32, 1) on a single 2px element.' },
        { n: 'Chip press', d: 'border-color and colour over 140ms ease, plus translateY(1px) on :active. Under 300ms because this is UI feedback and the reader may press five of them in a row.' },
        { n: 'Plate', d: 'The strip for the record currently crossing the reading line animates if its painter uses time; every other plate is a finished drawing and is painted once. The frame loop is unsubscribed whenever the current record has a static plate.' }
      ],
      scroll: [
        'The dossier owns its own scroll container so the rail can be sticky without any pinning, and so overscroll-behavior: contain stops a fast flick at the end from scrolling whatever is behind it.',
        'No ScrollTrigger, no pinning, no scrub. This concept reads; it is not scrubbed.',
        'Position is tracked entirely with IntersectionObserver. There is no scroll listener anywhere in this concept.',
        'In the Next.js build this is /work with each record at #record-slug, so a rail entry is a real anchor link and deep links land on a record.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine).',
        'Rail entries: colour from --ink-4 to --ink-2 over 140ms.',
        'Stack chips: border --line to --line-3, colour --ink-3 to --ink, over 140ms. They look pressable because they are.',
        'Decision rows do not respond to hover at all. They are prose, not controls, and giving prose a hover state teaches the reader to click sentences.'
      ],
      click: [
        'Rail entry: scrolls that record to the top of the container.',
        'Filter chip: toggles that technology. The same chip again clears it.',
        'Stack chip inside a record: sets the filter to that technology and scrolls to the first matching record.',
        'Nothing else is clickable. In a document, everything that looks like a link should be one.'
      ],
      responsive: {
        desktop: 'Sticky 13rem rail on the left, records in a 1fr column at max 78ch, plate strips at 21:9 full column width, decision rows as a three column grid.',
        tablet: 'Rail becomes a sticky top bar with the six numbers only. Records keep the three column decision grid down to 900px.',
        mobile: 'A different composition, not a smaller one. The rail becomes a horizontally scrollable sticky chip strip at the top, carrying the filters rather than the record list. Decision rows stack into three labelled lines. The plate strip becomes 16:9 and moves above the record header so a phone reader gets the picture before the density. Type steps down one level, but nothing is removed: a dossier that hides its detail on a phone is not a dossier.'
      },
      a11y: [
        'The records are articles with a heading each, so a screen reader can jump between them with heading navigation and never needs the rail.',
        'Filter chips are toggle buttons with aria-pressed, not links, because they change the state of this page rather than navigating.',
        'Filtered-out records are aria-hidden and their controls are removed from the tab order, so the keyboard set matches the visible set exactly.',
        'The result count is announced through an aria-live="polite" region.',
        'Rail entries are links to real anchors, so they work with JavaScript disabled.',
        'Contrast: the dimmed state is 0.22 opacity on decorative records only, and any record a reader can still reach by keyboard is always at full opacity.',
        'prefers-reduced-motion: the record reveal becomes an opacity-only fade of 200ms, the rail marker jumps, rail clicks scroll with behavior auto, and no plate animates.'
      ],
      perf: [
        'Six plate canvases at 21:9, each painted once. The ticker is subscribed only while the record crossing the reading line has an animated painter.',
        'One IntersectionObserver for record position and one for the reveal, and the reveal observer unobserves each record after it fires.',
        'Filtering writes one class per record. No layout property changes, so a filter press does not reflow the document.',
        'Content is real markup, so the first paint is the document. Nothing here waits on JavaScript to become readable.',
        'Backing store capped at devicePixelRatio 2, and 1.75 below 768px.'
      ],
      packages: pkgs([
        { p: 'No filtering or list library', w: 'Six records and a set membership test. A virtualiser or a query library here would be more code than the feature.' }
      ]),
      architecture: [
        { f: 'app/work/page.tsx', r: 'Server Component. Renders all six records in full, including every decision, so the page is complete and crawlable before any JavaScript runs.' },
        { f: 'components/projects/Dossier.tsx', r: '"use client". Owns the filter state and the two observers. Everything below it is presentational.' },
        { f: 'components/projects/Record.tsx', r: 'One record. Server Component; it takes a project and renders it, and knows nothing about filtering.' },
        { f: 'components/projects/DecisionRow.tsx', r: 'Chosen, rejected, reason. A three column grid that stacks below 900px.' },
        PLATE_NOTE,
        { f: 'content/projects.ts', r: 'The typed project array, including the decisions array per project.' }
      ],
      state: [
        'React state: the active technology filter (a string or null) and the id of the record currently crossing the reading line. Two values.',
        'Refs, never state: both IntersectionObservers and the set of already-revealed record ids.',
        'The filter belongs in the URL as ?tech=postgres so a reader can send someone "here is everything I did with Postgres". The reading position deliberately does not.',
        'Derived, never stored: the technology list and its counts, computed once from the project array at module scope.'
      ],
      typography: [
        'Everything sits on a 24px baseline. Record headings are 2.5rem with 24px leading multiples, body is 1rem at 24px leading, and mono lines are 0.625rem at 24px.',
        'Mono carries indices, years, counts and stack names: measurement and identifiers, never prose.',
        'The rejected alternative in a decision row is set at --ink-4 with a 1px rule through it. It is legible on purpose; the reader is supposed to read what was turned down.',
        'Measure is capped at 74ch for prose and 92ch for decision reasons, which run wider because they are technical and benefit from fewer line breaks.'
      ],
      color: [
        'Ground --void. Records sit directly on it with a 1px --line rule above each header; there are no cards anywhere in this concept.',
        '--c-accent is the steel grey of the concept until a record is current, at which point the record\'s own project hue takes over the rail marker and the record rule.',
        'The active filter chip is the only saturated element on screen when a filter is on.',
        'Dimmed records use opacity, so their hue stays correct and they read as recessed rather than greyed.'
      ],
      spacing: [
        '24px baseline throughout. Record blocks are 96px apart, header to meta 24px, meta to problem 48px, between decision rows 24px, stack to plate 48px.',
        'Rail entries on a 36px pitch inside 44px hit areas.',
        'Page inset follows the shell gutter, with the record column capped at 78ch and left-aligned against the rail rather than centred.'
      ],
      relationships: [
        'Rail marker position encodes which record is being read.',
        'Opacity encodes filter membership, and nothing else uses opacity in this concept.',
        'The strikethrough encodes rejection, and it is the only decorative line in the type.',
        'Project hue encodes which record, and appears in exactly three places per record: the rule, the number and the plate.'
      ],
      acceptance: [
        'Every record shows three decisions, and every decision names what it was chosen over.',
        'Filtering never changes the height of the page and never removes a record from the document.',
        'The keyboard tab set always matches the visible set: a filtered-out record is not reachable by Tab.',
        'The rail marker follows the reading position without a single scroll listener.',
        'With JavaScript disabled the whole document is still readable and every rail entry still works.',
        'No number on the page implies a measurement that was not made.',
        'At 375px nothing is hidden: the density survives, the composition changes.'
      ]
    },

    mount: function (root, ctx) {
      var env = SE.env;
      root.classList.add('projects-dossier');

      /* --------------------------------------------------- technology index */
      /* Computed from the project array, never hand-maintained: a filter row
         that can disagree with the records is worse than no filter row. */
      var techCount = {};
      PROJECTS.forEach(function (p) {
        techOf(p).forEach(function (name) { techCount[name] = (techCount[name] || 0) + 1; });
      });
      var techList = Object.keys(techCount).sort(function (a, b) {
        return techCount[b] - techCount[a] || a.localeCompare(b);
      });

      /* ------------------------------------------------------------ DOM */
      var rail = SE.el('aside', 'projects-dossier__rail');
      rail.setAttribute('aria-label', 'Records');
      rail.innerHTML =
        '<div class="projects-dossier__marker" aria-hidden="true"></div>' +
        PROJECTS.map(function (p, i) {
          return '<a href="#projects-rec-' + p.id + '" data-rail="' + i + '" aria-current="' + (i === 0) + '">' +
                 '<i class="t-num">' + p.num + '</i><b>' + p.name + '</b></a>';
        }).join('');

      var main = SE.el('div', 'projects-dossier__main');

      var head = SE.el('header', 'projects-dossier__head');
      head.innerHTML =
        '<h2 class="projects-dossier__title">Six records, and what each decision displaced</h2>' +
        '<p class="projects-dossier__lede">Every project leads with three choices and the alternative each one ' +
        'replaced. Filter by anything in the stack to see only the work that used it.</p>';
      main.appendChild(head);

      var filters = SE.el('div', 'projects-dossier__filters');
      filters.setAttribute('role', 'group');
      filters.setAttribute('aria-label', 'Filter records by technology');
      filters.innerHTML =
        '<button type="button" data-tech="" aria-pressed="true">All<i class="t-num">' + TOTAL + '</i></button>' +
        techList.map(function (name) {
          return '<button type="button" data-tech="' + name + '" aria-pressed="false">' + name +
                 '<i class="t-num">' + SE.pad(techCount[name]) + '</i></button>';
        }).join('');
      main.appendChild(filters);

      var live = SE.el('p', 'sr-only');
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      main.appendChild(live);

      var arts = [];
      var recs = PROJECTS.map(function (p, i) {
        var a = SE.el('article', 'projects-dossier__rec');
        a.id = 'projects-rec-' + p.id;
        a.style.setProperty('--c-accent', p.accent);
        a.setAttribute('data-rec', String(i));
        a.innerHTML =
          '<div class="projects-dossier__rule"></div>' +
          '<div class="projects-dossier__recmeta t-num">' +
            '<span class="projects-dossier__recnum">' + p.num + '</span>' +
            '<span>' + p.discipline + '</span>' +
            '<span>' + p.role + '</span>' +
            '<span>' + p.year + '</span>' +
          '</div>' +
          '<h3 class="projects-dossier__recname">' + p.name + '</h3>' +
          '<p class="projects-dossier__problem">' + p.problem + '</p>' +
          '<p class="projects-dossier__outcome">' + p.outcome + '</p>' +
          '<div class="projects-dossier__decisions">' +
            p.decisions.map(function (d) {
              return '<div class="projects-dossier__dec">' +
                       '<span class="projects-dossier__chose">' + d.chose + '</span>' +
                       '<span class="projects-dossier__over"><s>' + d.over + '</s></span>' +
                       '<span class="projects-dossier__because">' + d.because + '</span>' +
                     '</div>';
            }).join('') +
          '</div>' +
          '<div class="projects-dossier__stack" data-stack></div>' +
          '<figure class="projects-dossier__figure">' +
            '<div class="projects-dossier__plate"></div>' +
            '<figcaption class="t-num">Fig. ' + p.num + '   ' + p.figure + '</figcaption>' +
          '</figure>';

        SE.$('[data-stack]', a).innerHTML = techOf(p).map(function (name) {
          return '<button type="button" data-pick="' + name + '">' + name + '</button>';
        }).join('');

        main.appendChild(a);
        arts.push(mountArt(SE.$('.projects-dossier__plate', a), p, { zoom: 520 }));
        return { el: a, p: p, tech: techOf(p) };
      });

      root.appendChild(rail);
      root.appendChild(main);
      root.appendChild(SE.srList('Dossier: six project records', srItems(), function (item) {
        scrollToRec(item.p.index);
      }));

      /* ---------------------------------------------------------- state */
      var railLinks = SE.$$('[data-rail]', rail);
      var marker = SE.$('.projects-dossier__marker', rail);
      var chips = SE.$$('[data-tech]', filters);
      var filter = '';
      var current = -1;

      /* ---------------------------------------------------------- filter */
      function applyFilter(name) {
        filter = name || '';
        var n = 0;
        recs.forEach(function (r) {
          var on = !filter || r.tech.indexOf(filter) >= 0;
          if (on) n++;
          r.el.classList.toggle('is-dim', !on);
          /* the tab set has to match the visible set exactly, or a keyboard
             reader ends up inside a record they were told is filtered out */
          r.el.setAttribute('aria-hidden', String(!on));
          SE.$$('button, a', r.el).forEach(function (b) { b.tabIndex = on ? 0 : -1; });
        });
        chips.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b.getAttribute('data-tech') === filter));
        });
        SE.$$('[data-pick]', main).forEach(function (b) {
          b.classList.toggle('is-on', b.getAttribute('data-pick') === filter);
        });
        live.textContent = filter
          ? n + ' of ' + PROJECTS.length + ' records use ' + filter + '.'
          : 'Showing all ' + PROJECTS.length + ' records.';
      }

      filters.addEventListener('click', function (e) {
        var b = e.target.closest('[data-tech]');
        if (!b) return;
        var name = b.getAttribute('data-tech');
        applyFilter(name === filter ? '' : name);
      });

      main.addEventListener('click', function (e) {
        var b = e.target.closest('[data-pick]');
        if (!b) return;
        var name = b.getAttribute('data-pick');
        applyFilter(name === filter ? '' : name);
        if (filter) {
          for (var i = 0; i < recs.length; i++) {
            if (recs[i].tech.indexOf(filter) >= 0) { scrollToRec(i); break; }
          }
        }
      });

      /* ------------------------------------------------------------ rail */
      function scrollToRec(i) {
        var el = recs[i].el;
        root.scrollTo({
          top: el.offsetTop - 24,
          behavior: env.reduced ? 'auto' : 'smooth'
        });
      }

      rail.addEventListener('click', function (e) {
        var a = e.target.closest('[data-rail]');
        if (!a) return;
        e.preventDefault();
        scrollToRec(parseInt(a.getAttribute('data-rail'), 10));
      });

      function setCurrent(i) {
        if (i === current) return;
        current = i;
        var p = PROJECTS[i];
        railLinks.forEach(function (a, k) { a.setAttribute('aria-current', String(k === i)); });
        marker.style.transform = 'translate3d(0,' + (i * 100) + '%,0)';
        rail.style.setProperty('--c-accent', p.accent);
        if (SE.stageAccent) SE.stageAccent(p.accent);
        syncTicker();
      }

      /* Position comes from an observer, never from a scroll listener. */
      var posIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          setCurrent(parseInt(en.target.getAttribute('data-rec'), 10));
        });
      }, { root: root, rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      recs.forEach(function (r) { posIO.observe(r.el); });

      /* Reveal fires once per record and then stops watching it. A record that
         re-animates every time it passes is a record nobody can re-read. */
      var revealIO = null;
      if (env.reduced) {
        recs.forEach(function (r) { r.el.classList.add('is-in'); });
      } else {
        revealIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            en.target.classList.add('is-in');
            revealIO.unobserve(en.target);
          });
        }, { root: root, threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
        recs.forEach(function (r) { revealIO.observe(r.el); });
      }

      /* ------------------------------------------------------------ tick */
      var ticking = false;
      function tick(dt, t) { if (arts[current]) arts[current].paint(t); }
      function syncTicker() {
        var want = current >= 0 && isAnimated(PROJECTS[current]);
        if (want && !ticking) { SE.ticker.add(tick); ticking = true; }
        else if (!want && ticking) { SE.ticker.remove(tick); ticking = false; }
      }

      /* ------------------------------------------------------------ boot */
      /* The concept hue owns the chrome (filters, chip states); each record
         overrides --c-accent for itself and the rail follows the current one.
         Without this the filter row would borrow whichever project happens to
         be under the reading line, which makes the filter look like state it
         is not. */
      root.style.setProperty('--c-accent', '#A8B4C0');
      applyFilter('');
      setCurrent(0);
      recs[0].el.classList.add('is-in');

      return {
        destroy: function () {
          if (ticking) SE.ticker.remove(tick);
          posIO.disconnect();
          if (revealIO) revealIO.disconnect();
          arts.forEach(function (a) { a.destroy(); });
          if (SE.stageAccent) SE.stageAccent('#A8B4C0');
          root.classList.remove('projects-dossier');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     SECTION 01  -  STRIP
     --------------------------------------------------------------------------
     A horizontal run of work inside a section of ordinary height. No rail, no
     pinning, no scrubbing: the page keeps scrolling vertically past it exactly
     as it would past a paragraph.

     WHY NATIVE OVERFLOW AND NOT A TRANSFORM
     ---------------------------------------
     The strip is a real overflow-x container with scroll-snap. That buys
     trackpad gestures, touch momentum, keyboard scrolling, a scrollbar, and
     browser find-in-page, none of which a transform-based carousel has. The
     drag handler on top of it only translates a pointer drag into scrollLeft,
     so every other input model is the browser's own and behaves correctly on
     hardware nobody tested on.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'projects-section-strip',
    num: 1,
    name: 'Strip',
    kind: 'DOM / snapping run',
    accent: '#E0664F',
    tagline: 'A horizontal run that never takes the page hostage',
    desc: 'Six plates on a snapping horizontal run inside a section of ordinary height. Vertical scroll passes ' +
          'straight through it, and the run is native overflow, so trackpads, touch and keyboard all work without being reimplemented.',
    interaction: 'Scroll or drag the run sideways, or step it with the two controls and the arrow keys. Any plate opens its case.',
    hint: 'Drag the run &middot; Arrows step',
    screens: 1,
    pageOf: 'projects-page-coverflow',

    /* Miniature: a run of plates sliding past with the progress rule beneath.
       Around 26 operations per frame. */
    preview: function (ctx, w, h, t, heat) {
      var n = PROJECTS.length;
      var cw = w * 0.34, gap = w * 0.045;
      var span = (cw + gap) * n;
      var x0 = -((t * (16 + heat * 34)) % span);
      var top = h * 0.16, ch = h * 0.52;
      for (var k = 0; k < n + 2; k++) {
        var p = PROJECTS[k % n];
        var x = x0 + k * (cw + gap);
        if (x > w || x + cw < 0) continue;
        ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',0.16)';
        ctx.fillRect(x, top, cw, ch);
        ctx.strokeStyle = 'rgba(' + p.rgb.join(',') + ',0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, top + 0.5, cw, ch);
        ctx.fillStyle = 'rgba(236,236,239,0.34)';
        ctx.fillRect(x, top + ch + 8, cw * 0.5, 2);
      }
      var by = h * 0.86;
      ctx.fillStyle = 'rgba(236,236,239,0.12)';
      ctx.fillRect(w * 0.08, by, w * 0.84, 1);
      ctx.fillStyle = '#E0664F';
      ctx.fillRect(w * 0.08 + ((-x0 / span) % 1) * w * 0.62, by - 1, w * 0.22, 3);
    },

    spec: {
      subtitle: 'A native horizontal run of six plates, inside a section that never fights the page.',
      philosophy: [
        'A section earns its place by leaving. This one is one screen tall, consumes no vertical scroll, and the reader passes through it without being pinned, scrubbed or hijacked.',
        'Horizontal runs are usually built as transforms and lose everything the browser already does well. This one is real overflow: trackpad gestures, touch momentum, keyboard, the scrollbar and find-in-page all still work.',
        'Six is not many. The run shows the ends rather than pretending to be endless, and the last item is followed by the way through to the full view.',
        'The teaser owes the reader the outcome, not just the name. Each plate carries one sentence, so a reader who never clicks still learns six things.'
      ],
      hierarchy: [
        '1. The plates, 26rem wide at 4:3 in a snapping run.',
        '2. The section heading, clamp(1.75rem, 4vw, 3.25rem).',
        '3. Each plate\'s name and outcome sentence, beneath it, 1.125rem and 0.875rem.',
        '4. The progress rule and the two step controls.'
      ],
      structure: [
        'section, ordinary height, padding clamp(4rem, 12vh, 8rem) on the block axis. No sticky, no pin, no rail.',
        'header: heading and lede, plus the two step controls aligned right on the same line.',
        'div.run: overflow-x auto, scroll-snap-type x mandatory, scroll-padding-inline equal to the page gutter, and a scroll-margin so the first plate lines up with the heading.',
        'article x6: plate at 4:3, then name, then outcome. The whole card is a button that opens the case.',
        'div.progress: a 1px rule with a scaled bar, driven by scrollLeft over the maximum scroll.',
        'The See more control sits at the end of the run and again under it, because a reader who reached the end of the run and a reader who read the heading are two different people.'
      ],
      interaction: [
        'Native scroll: the run is a real overflow container. Trackpad, touch, shift-wheel and the scrollbar all work with no code.',
        'Drag: pointer down on the run, scrollLeft -= movement, with a 6px movement threshold (9px on touch) so a flick never also opens a case. Pointer capture, and the cursor becomes grabbing.',
        'Step controls: scroll by exactly one plate plus its gap, using scrollBy with behavior smooth, or auto under reduced motion.',
        'Keyboard: the run is focusable with tabindex 0 and ArrowLeft and ArrowRight step it, Home and End go to the ends. Every plate is also a button in the tab order, and focusing one scrolls it into view through scroll-snap.',
        'Vertical wheel is never intercepted. A run that converts vertical scroll into horizontal movement is the single most common way a section like this ruins a page.',
        'Progress: read from scrollLeft over scrollWidth minus clientWidth on a passive scroll listener attached to the run itself. Not a window scroll listener; this element is the only thing being measured.'
      ],
      choreography: [
        { n: 'Entry', d: 'On first intersection at 20% visibility: each card goes from opacity 0 and translate3d(0,24px,0) to 0 over 620ms cubic-bezier(0.23, 1, 0.32, 1), staggered 70ms. Observed once, then unobserved.' },
        { n: 'Progress rule', d: 'transform: scaleX(scrollLeft / maxScroll) with transform-origin left, written directly on scroll with no transition, because it is tracking a gesture and any smoothing would make it lag the finger.' },
        { n: 'Step', d: 'scrollBy with behavior smooth. The browser owns the curve; overriding it would break the interruption behaviour that makes native smooth scrolling feel right.' },
        { n: 'Card press', d: 'scale(0.985) over 120ms ease on :active. Under 160ms because it is press feedback.' },
        { n: 'Plate', d: 'Each plate is painted once at mount. Nothing on this strip animates continuously, because a section a reader is passing through should not be spending frames on itself.' }
      ],
      scroll: [
        'This section consumes no vertical scroll. It is one screen tall and the page scrolls past it normally.',
        'overscroll-behavior-x: contain on the run, so reaching its end never chains into the page or triggers a browser back gesture.',
        'The entry animation uses IntersectionObserver. There is no scroll listener on the window anywhere in this concept.',
        'Build the See more route as well: /work, rendering the full-page counterpart. The section is the teaser and the route is the argument, and the section is not finished until the route exists.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine).',
        'The run takes grab, and grabbing while held.',
        'A card on hover: the plate border goes from --line to the project hue over 180ms and the name from --ink-2 to --ink. Nothing moves, because a card that lifts inside a horizontally scrolling run reads as a wobble.',
        'The step controls dim to 0.35 and stop responding at each end rather than wrapping.'
      ],
      click: [
        'Clicking a card below the movement threshold opens its case sheet.',
        'See more calls the page-level counterpart, which is Coverflow: the run is the flat version of the same six plates and the page gives them depth.',
        'The step controls scroll; they never open anything.'
      ],
      responsive: {
        desktop: 'Cards at 26rem, three and a bit visible, step controls beside the heading, progress rule under the run.',
        tablet: 'Cards at 22rem, two and a bit visible. Same controls.',
        mobile: 'A different composition, not a smaller one. Cards go to 84vw with an 8vw peek of the next, so the run reads as swipeable without any affordance being drawn. The step controls are removed entirely because the gesture is native and better, the progress rule stays because it is the only thing that says how much is left, and the outcome sentence is clamped to three lines so a card never becomes taller than the screen.'
      },
      a11y: [
        'The run has tabindex 0 and an aria-label, so a keyboard user can scroll it with the arrow keys as a region, which is what a scroll container owes them.',
        'Every card is a real button carrying name, discipline, year and outcome in its accessible name.',
        'The drag has a keyboard equivalent (arrows, Home, End) and a single-pointer equivalent (the two step controls and the native scrollbar), which satisfies WCAG 2.2 dragging movements twice over.',
        'Focusing a card scrolls it into view without a script, through scroll-snap and the browser\'s own focus scrolling.',
        'The See more control is a real button with a clear label, present in the tab order at the end of the run.',
        'prefers-reduced-motion: entry becomes an opacity-only fade of 200ms, step controls scroll with behavior auto, and the progress rule still tracks because it is feedback rather than decoration.'
      ],
      perf: [
        'Six plate canvases, each painted once at mount and never repainted. This concept never subscribes to the frame loop at all.',
        'The progress rule is one transform written on a passive scroll listener attached to the run element.',
        'Entry animation is a CSS transition triggered by one IntersectionObserver that unobserves each card after it fires.',
        'content-visibility: auto on the section, so a strip well below the fold costs nothing to lay out.',
        'Backing store capped at devicePixelRatio 2, and 1.75 below 768px.'
      ],
      packages: pkgs([
        { p: 'No carousel library', w: 'The run is overflow-x plus scroll-snap-type, which is four lines of CSS and beats every library on gesture fidelity because it is the browser doing it.' }
      ]),
      architecture: [
        { f: 'components/sections/WorkStrip.tsx', r: 'Server Component. Renders the heading and the six cards as static markup; the run scrolls natively with no JavaScript at all.' },
        { f: 'components/sections/WorkStripControls.tsx', r: '"use client". The two step controls, the drag handler and the progress rule. An isolated leaf, so the cards stay server-rendered.' },
        PLATE_NOTE,
        { f: 'app/work/page.tsx', r: 'REQUIRED. The See more destination. Build the full-page counterpart as a real route; a section that hands off to nothing is a dead end.' },
        { f: 'content/projects.ts', r: 'The typed project array.' }
      ],
      state: [
        'React state: none in the card list. The run is a scroll container and its position is the DOM\'s state, not React\'s.',
        'Refs, never state: drag origin, the scrollLeft at drag start, and the moved flag.',
        'The progress bar is written imperatively to a ref on scroll. Putting scroll progress in state re-renders six cards per frame.',
        'The case sheet open state is the only piece of React state in the whole section.'
      ],
      typography: [
        'Card name: Space Grotesk 500 at 1.125rem, tracking -0.02em.',
        'Card outcome: 0.875rem at 1.55 line height, clamped to three lines with line-clamp so the run stays a straight edge.',
        'Index numbers and the year: JetBrains Mono 500 with tabular figures.',
        'Section heading: clamp(1.75rem, 4vw, 3.25rem), weight 500, tracking -0.042em.'
      ],
      color: [
        'Ground --void, same as the sections above and below. The strip does not introduce a second ground; it is part of the page.',
        'Each card carries its own project hue on its plate and its hover border. Six hues at once is correct here because they are side by side and being compared.',
        '--c-accent for the section chrome is the concept hue, used by the progress bar and the See more control.',
        'No card background. The plate is the card; adding a surface behind it would make six boxes out of six pictures.'
      ],
      spacing: [
        'Section padding: clamp(4rem, 12vh, 8rem) block, page gutter inline.',
        'Run gap 1.25rem, card width 26rem, scroll-padding-inline equal to the gutter so a snapped card lines up with the heading above it.',
        'Card internals: 1rem from plate to name, 0.5rem from name to outcome.',
        'Progress rule 2.5rem below the run.'
      ],
      relationships: [
        'Horizontal position encodes order, newest first, and nothing else.',
        'Progress bar width encodes how much of the run is left, which is the only thing a horizontal container cannot show by itself.',
        'Plate hue encodes which project.',
        'The end of the run encodes that there are exactly six, which is why it does not loop.'
      ],
      acceptance: [
        'Scrolling the page vertically over the strip never moves the strip sideways.',
        'The run scrolls with a trackpad, a touch swipe, the arrow keys, the two controls and the scrollbar, all without special-casing.',
        'A 5px drag on a card opens its case; a 40px drag does not.',
        'Reaching the end of the run does not trigger the browser back gesture.',
        'The See more control is reachable by Tab and leads to a route that exists.',
        'With reduced motion on, nothing animates on entry and the run still snaps.',
        'At 375px there are no step controls and the run is still fully usable.'
      ]
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var isSection = ctx.mode === 'section';
      root.classList.add('projects-strip');
      if (!isSection) scrollerFor(root, ctx);

      /* ------------------------------------------------------------ DOM */
      var sec = SE.el('section', 'projects-strip__sec');
      root.appendChild(sec);

      var head = SE.el('header', 'projects-strip__head');
      head.innerHTML =
        '<div class="projects-strip__headtext">' +
          '<h2 class="projects-strip__title">Six pieces of work, in the order they were built</h2>' +
          '<p class="projects-strip__lede">Each one carries the problem it started from and the thing that ' +
          'changed because it shipped. The full view gives them depth.</p>' +
        '</div>' +
        '<div class="projects-strip__steps">' +
          '<button class="iconbtn" type="button" data-step="-1" aria-label="Scroll the run left">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
          '<button class="iconbtn" type="button" data-step="1" aria-label="Scroll the run right">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
        '</div>';
      sec.appendChild(head);

      var run = SE.el('div', 'projects-strip__run');
      run.setAttribute('tabindex', '0');
      run.setAttribute('role', 'group');
      run.setAttribute('aria-label', 'Six projects. Use the left and right arrow keys to move through the run.');
      sec.appendChild(run);

      var arts = PROJECTS.map(function (p) {
        var card = SE.el('button', 'projects-strip__card');
        card.type = 'button';
        card.style.setProperty('--c-accent', p.accent);
        card.setAttribute('data-card', String(p.index));
        card.setAttribute('aria-label', p.name + ', ' + p.discipline + ', ' + p.year + '. ' + p.outcome);
        card.innerHTML =
          '<span class="projects-strip__plate"></span>' +
          '<span class="projects-strip__meta t-num">' + p.num + '   ' + p.discipline + '</span>' +
          '<span class="projects-strip__name">' + p.name + '</span>' +
          '<span class="projects-strip__outcome">' + p.outcome + '</span>';
        run.appendChild(card);
        return mountArt(SE.$('.projects-strip__plate', card), p, { zoom: 420 });
      });

      var foot = SE.el('div', 'projects-strip__foot');
      foot.innerHTML = '<div class="projects-strip__bar"><i></i></div>';
      sec.appendChild(foot);

      var more = null;
      if (isSection) {
        more = seeMoreNow('See all six with depth', ctx.onSeeMore);
        more.classList.add('projects-strip__more');
        foot.appendChild(more);
      }

      sec.appendChild(SE.srList('Strip: six projects', srItems(), function (item) {
        var card = SE.$('[data-card="' + item.p.index + '"]', run);
        if (card) card.scrollIntoView({ block: 'nearest', inline: 'center', behavior: env.reduced ? 'auto' : 'smooth' });
      }));

      var kase = makeCase(root);

      /* ---------------------------------------------------------- state */
      var bar = SE.$('.projects-strip__bar i', foot);
      var steps = SE.$$('[data-step]', head);
      var dragging = false, moved = false, startX = 0, startScroll = 0;

      function cardPitch() {
        var first = run.firstElementChild;
        if (!first) return 320;
        var r = first.getBoundingClientRect();
        var gap = parseFloat(getComputedStyle(run).columnGap || '20') || 20;
        return r.width + gap;
      }

      /* The progress rule tracks a gesture, so it is written with no
         transition: any smoothing here would visibly lag the finger. */
      function syncProgress() {
        var max = run.scrollWidth - run.clientWidth;
        var p = max > 1 ? run.scrollLeft / max : 0;
        bar.style.transform = 'scaleX(' + M.clamp(p, 0, 1).toFixed(4) + ')';
        steps.forEach(function (b) {
          var d = parseInt(b.getAttribute('data-step'), 10);
          var end = (d < 0 && run.scrollLeft <= 1) || (d > 0 && run.scrollLeft >= max - 1);
          b.classList.toggle('is-end', end);
          b.setAttribute('aria-disabled', String(end));
        });
      }

      /* A passive listener on this element, not on the window. It is the only
         thing being measured and there is no other way to read its position. */
      run.addEventListener('scroll', syncProgress, { passive: true });

      head.addEventListener('click', function (e) {
        var b = e.target.closest('[data-step]');
        if (!b || b.getAttribute('aria-disabled') === 'true') return;
        run.scrollBy({
          left: parseInt(b.getAttribute('data-step'), 10) * cardPitch(),
          behavior: env.reduced ? 'auto' : 'smooth'
        });
      });

      /* --------------------------------------------------------- dragging */
      function onDown(e) {
        if (e.target.closest('.sr-only')) return;
        dragging = true; moved = false;
        startX = e.clientX;
        startScroll = run.scrollLeft;
        root.classList.add('is-dragging');
        try { run.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
      }
      function onMove(e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > slop()) moved = true;
        if (!moved) return;
        run.scrollLeft = startScroll - dx;
      }
      function onUp(e) {
        if (!dragging) return;
        dragging = false;
        root.classList.remove('is-dragging');
        if (moved) return;
        var card = e && e.target && e.target.closest ? e.target.closest('[data-card]') : null;
        if (card) kase.show(PROJECTS[parseInt(card.getAttribute('data-card'), 10)], card);
      }
      run.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);

      /* Cards are real buttons, so a click can also arrive from the keyboard
         with no pointer involved at all. */
      run.addEventListener('click', function (e) {
        if (moved) return;
        var card = e.target.closest('[data-card]');
        if (card && e.detail === 0) kase.show(PROJECTS[parseInt(card.getAttribute('data-card'), 10)], card);
      });

      function onKey(e) {
        if (kase.isOpen()) return;
        if (!run.contains(document.activeElement) && document.activeElement !== run) return;
        if (e.key === 'ArrowRight') { run.scrollBy({ left: cardPitch(), behavior: env.reduced ? 'auto' : 'smooth' }); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { run.scrollBy({ left: -cardPitch(), behavior: env.reduced ? 'auto' : 'smooth' }); e.preventDefault(); }
        else if (e.key === 'Home') { run.scrollTo({ left: 0, behavior: env.reduced ? 'auto' : 'smooth' }); e.preventDefault(); }
        else if (e.key === 'End') { run.scrollTo({ left: run.scrollWidth, behavior: env.reduced ? 'auto' : 'smooth' }); e.preventDefault(); }
      }
      root.addEventListener('keydown', onKey);

      /* ---------------------------------------------------------- entry */
      var cards = SE.$$('[data-card]', run);
      var io = null;
      if (env.reduced) {
        cards.forEach(function (c) { c.classList.add('is-in'); });
      } else {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var i = cards.indexOf(en.target);
            en.target.style.transitionDelay = (i * 70) + 'ms';
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          });
        }, { threshold: 0.2 });
        cards.forEach(function (c) { io.observe(c); });
      }

      syncProgress();

      return {
        destroy: function () {
          run.removeEventListener('scroll', syncProgress);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
          root.removeEventListener('keydown', onKey);
          if (io) io.disconnect();
          arts.forEach(function (a) { a.destroy(); });
          kase.destroy();
          root.classList.remove('projects-strip', 'projects-selfscroll', 'is-dragging');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     SECTION 02  -  ANCHOR
     --------------------------------------------------------------------------
     One piece of work carried at full size, and the other five listed beside
     it at full density. A section of ordinary height that consumes no scroll
     and hides nothing behind an interaction.

     WHY A FIXED FEATURE AND NOT A HOVER PREVIEW
     -------------------------------------------
     The obvious version of this is a hover index: point at a row and the big
     panel changes. That is the page-level Index concept, and it is the wrong
     answer for a section, because a reader passing through a page at speed
     never hovers anything. So the feature is fixed, the index is legible on
     its own, and the only motion is the feature plate drawing itself once as
     the section arrives.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'projects-section-anchor',
    num: 2,
    name: 'Anchor',
    kind: 'DOM / one plus five',
    accent: '#5FC27E',
    tagline: 'One piece carried properly, and five named honestly',
    desc: 'The most recent project at full size with its plate drawing itself as the section arrives, and the other ' +
          'five listed beside it as a dense index. Nothing is hidden behind a hover a passing reader will never perform.',
    interaction: 'Read it. The five index rows open their own case, and the plate draws itself once when the section comes into view.',
    hint: 'The plate draws itself once',
    screens: 1,
    pageOf: 'projects-page-index',

    /* Miniature: the feature plate drawing left to right beside the five index
       rules. Around 24 operations per frame. */
    preview: function (ctx, w, h, t, heat) {
      var p = PROJECTS[0];
      var pad = w * 0.07;
      var fw = w * 0.52, fh = h * 0.54, fy = h * 0.18;
      var rev = M.clamp(((t * 0.30 + heat * 0.4) % 1.6) / 1.0, 0, 1);

      ctx.strokeStyle = 'rgba(236,236,239,0.14)';
      ctx.lineWidth = 1;
      ctx.strokeRect(pad + 0.5, fy + 0.5, fw, fh);

      ctx.save();
      ctx.beginPath();
      ctx.rect(pad, fy, fw * rev, fh);
      ctx.clip();
      ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',0.16)';
      ctx.fillRect(pad, fy, fw, fh);
      ctx.strokeStyle = 'rgba(' + p.rgb.join(',') + ',0.7)';
      ctx.beginPath();
      for (var k = 0; k < 4; k++) {
        var ky = fy + fh * (0.24 + k * 0.18);
        ctx.moveTo(pad + fw * 0.08, ky);
        ctx.lineTo(pad + fw * (0.30 + (k % 3) * 0.20), ky);
      }
      ctx.stroke();
      ctx.restore();

      if (rev < 0.999) {
        ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',0.9)';
        ctx.fillRect(pad + fw * rev, fy, 1, fh);
      }

      var ix = pad + fw + w * 0.06;
      for (var r = 0; r < 5; r++) {
        var ry = Math.round(fy + r * (fh / 4.4)) + 0.5;
        ctx.strokeStyle = 'rgba(236,236,239,0.10)';
        ctx.beginPath();
        ctx.moveTo(ix, ry);
        ctx.lineTo(w - pad, ry);
        ctx.stroke();
        ctx.fillStyle = 'rgba(236,236,239,' + (0.20 + heat * 0.2) + ')';
        ctx.fillRect(ix, ry - 8, (w - pad - ix) * (0.30 + (r % 3) * 0.16), 2);
      }
    },

    spec: {
      subtitle: 'One project at full size with its plate drawing itself, and the other five listed at full density.',
      philosophy: [
        'A section of a longer page gets one idea. This one is: here is the piece I would show you first, and here are the other five so you know it was a choice.',
        'A hover index is the wrong pattern for a section. A reader moving through a page at speed hovers nothing, so everything here is legible without any interaction at all.',
        'The one piece of motion is the feature plate drawing itself, once, as the section arrives. It is the plate being made rather than a plate being decorated.',
        'The index rows carry discipline and year, not just names. Five names is a list; five names with what and when is an argument that the work has range.'
      ],
      hierarchy: [
        '1. The feature plate at 16:9, filling the left column.',
        '2. The feature name, clamp(2rem, 4vw, 3.25rem).',
        '3. The feature outcome sentence, 1rem on --ink at 66ch.',
        '4. The five index rows, name at 1.125rem on --ink-2, meta mono at 0.625rem on --ink-4.',
        '5. Problem line, stack chips and the figure caption.'
      ],
      structure: [
        'section, ordinary height, block padding clamp(4rem, 12vh, 8rem). No sticky, no pin, no rail.',
        'header: heading and lede across the full width.',
        'div.grid: two columns at 1.35fr and 1fr with a 1px rule between them, collapsing to one column below 900px.',
        'article.feature: plate, figure caption, meta line, name, problem, outcome, stack chips, case button.',
        'aside.index: an h3 and five rows. Each row is a button containing number, name, discipline and year on a single ruled line.',
        'The See more control sits at the foot of the index column, directly after the five rows, because that is where the reader runs out of section.'
      ],
      interaction: [
        'The plate reveal is the only thing that happens on its own, and it happens exactly once: an IntersectionObserver at 35% visibility starts a damped reveal value and the observer disconnects.',
        'Reveal: value damped toward 1 at lambda 2.2, which crosses 95% in about 1.35 seconds. The canvas is clipped to reveal * width and a 1px line of the project hue is drawn at the clip edge, so it reads as a plotter drawing rather than as a fade.',
        'The frame loop is subscribed only while the section is in view and the reveal is incomplete, or while the feature plate is one of the three that animate. It unsubscribes on both counts.',
        'Index rows are buttons. Click or Enter opens that project\'s case sheet, focus returns to the row on close.',
        'There is no hover preview, no carousel and no auto-advance. The section is finished the moment it has been read.'
      ],
      choreography: [
        { n: 'Plate draw', d: 'reveal damped toward 1 with lambda 2.2 using a frame-rate independent damp, not a fixed per-frame lerp. The clip edge carries a 1px rule at the project hue and 90% alpha, which disappears when reveal passes 0.999.' },
        { n: 'Text entry', d: 'Meta, name, problem, outcome and chips: opacity 0 to 1 with translate3d(0,16px,0) to 0 over 620ms cubic-bezier(0.23, 1, 0.32, 1), delays 0, 80, 160, 240 and 320ms, triggered by the same observer as the plate.' },
        { n: 'Index rows', d: 'Same entrance, 620ms on the same curve, staggered 70ms, starting 260ms after the feature so the eye lands on the plate first.' },
        { n: 'Row hover', d: 'The name goes from --ink-2 to --ink and a 1px rule under the row scales on X from 0 to 1 with transform-origin left, both over 180ms cubic-bezier(0.23, 1, 0.32, 1). Nothing moves.' },
        { n: 'Row press', d: 'translateY(1px) for 120ms on :active. Press feedback belongs under 160ms.' }
      ],
      scroll: [
        'This section consumes no vertical scroll and pins nothing. It is one screen of content and the page passes it normally.',
        'Everything scroll-related is IntersectionObserver. No scroll listener anywhere.',
        'Build the See more route as well: /work rendering the full-page Index counterpart, where all six get the treatment the feature gets here. A section that hands off to nothing is a dead end.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine).',
        'Index rows: name to --ink, a 1px accent rule scales in under the row.',
        'The feature plate does not respond to hover at all. It is a figure, not a control, and the case button beneath it is the control.',
        'The case button uses the shared button treatment with the project hue as its fill.'
      ],
      click: [
        'Feature case button: opens the feature case sheet.',
        'Index row: opens that project\'s case sheet.',
        'See more: opens the page-level Index, where the fixed feature becomes the thing that changes as you move down the list.',
        'Nothing else is clickable; the plate and the caption are figures.'
      ],
      responsive: {
        desktop: 'Two columns at 1.35fr and 1fr with a 1px rule between, plate at 16:9, name up to 3.25rem.',
        tablet: 'Same two columns at 1.2fr and 1fr, name capped at 2.5rem, index rows drop the discipline and keep the year.',
        mobile: 'A different composition, not a smaller one. One column: plate, feature text, then the five rows as a full-width ruled list with the name and year on one line and the discipline beneath it. The plate goes to 3:2 so it keeps its weight on a narrow screen, and the reveal still runs because it is the only motion and it costs one canvas.'
      },
      a11y: [
        'The feature is an article with a heading; the index is an aside with its own heading, so both are reachable by heading navigation.',
        'The canvas is aria-hidden and mirrored by a visually hidden list of all six projects.',
        'Index rows are buttons with the full name, discipline, year and outcome as their accessible name.',
        'There is nothing that requires hover, pointer precision or dragging anywhere in this section.',
        'The case sheet returns focus to the control that opened it.',
        'prefers-reduced-motion: the plate is drawn complete on the first frame, all text entrances become instant, and the frame loop is never subscribed at all.'
      ],
      perf: [
        'One canvas for the whole section, painted per frame only while the reveal is running or the feature plate animates, and never while the section is off screen.',
        'The five index rows are static markup with CSS transitions; there is nothing to animate on them per frame.',
        'content-visibility: auto on the section so it costs nothing to lay out while it is far below the fold.',
        'Entry is one IntersectionObserver that disconnects after it fires once.',
        'Backing store capped at devicePixelRatio 2, and 1.75 below 768px.'
      ],
      packages: pkgs(),
      architecture: [
        { f: 'components/sections/WorkAnchor.tsx', r: 'Server Component. Renders the feature and the five rows as static markup; the whole section is readable before any JavaScript runs.' },
        { f: 'components/sections/PlateReveal.tsx', r: '"use client". The one canvas, its observer and the damped reveal value. An isolated leaf.' },
        PLATE_NOTE,
        { f: 'app/work/page.tsx', r: 'REQUIRED. The See more destination, rendering the full-page Index counterpart.' },
        { f: 'content/projects.ts', r: 'The typed project array. The feature is projects[0]; ordering is authored, not computed.' }
      ],
      state: [
        'React state: whether the case sheet is open and for which project. Nothing else.',
        'Refs, never state: the reveal value and the observer. The reveal changes sixty times a second for a second and a half.',
        'The feature is chosen by array order in content, not by a date comparison at render time, so the author decides what leads.',
        'Nothing about this section is persisted or reflected in the URL except an open case.'
      ],
      typography: [
        'Feature name: Space Grotesk 500 at clamp(2rem, 4vw, 3.25rem), tracking -0.042em.',
        'Feature outcome: 1rem at 1.6 over 66ch. Problem line 0.9375rem on --ink-2.',
        'Index row name: 1.125rem weight 500. Meta and figure caption: JetBrains Mono 500, tabular figures, so the five years form a column.',
        'The section heading is a sentence, not a label, and there is no kicker above it.'
      ],
      color: [
        'Ground --void, continuous with the sections above and below.',
        'The feature carries its own project hue on the plate, the reveal edge, the case button and the problem rule.',
        'Index rows are neutral until hovered, when they take the concept hue for their underline. Five hues in a five row list would read as a legend for something.',
        '--c-accent for the section chrome is the concept hue and is used by the See more control.'
      ],
      spacing: [
        'Section block padding clamp(4rem, 12vh, 8rem); column gap clamp(2rem, 5vw, 4.5rem) with a 1px rule in the gap.',
        'Feature: 1rem plate to caption, 2rem caption to meta, 0.75rem meta to name, 1.5rem name to problem, 0.75rem problem to outcome, 1.75rem to chips, 1.5rem to the button.',
        'Index rows on a 1.125rem vertical padding with a 1px rule between, and 2rem from the last row to See more.'
      ],
      relationships: [
        'Size encodes priority: one project is large because it was chosen, and five are small because they were not.',
        'The reveal edge encodes progress of the drawing and nothing else; it vanishes when the drawing is done.',
        'Row order encodes chronology, newest first.',
        'The 1px rule between the columns encodes that these are two different kinds of thing, not a two column layout of one thing.'
      ],
      acceptance: [
        'Everything in the section is readable without hovering, tapping or dragging anything.',
        'The plate draws once and never again, even after scrolling past and back.',
        'The frame loop is not subscribed while the section is off screen.',
        'Tab reaches the case button, all five index rows and See more, in that order.',
        'With reduced motion on, the plate is complete on the first frame and nothing animates.',
        'At 375px the plate keeps its weight and the five rows are still full density, with discipline and year both present.'
      ]
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var isSection = ctx.mode === 'section';
      var feature = PROJECTS[0];
      var rest = PROJECTS.slice(1);

      root.classList.add('projects-anchor');
      if (!isSection) scrollerFor(root, ctx);

      /* ------------------------------------------------------------ DOM */
      var sec = SE.el('section', 'projects-anchor__sec');
      sec.style.setProperty('--c-accent', '#5FC27E');
      root.appendChild(sec);

      var head = SE.el('header', 'projects-anchor__head');
      head.innerHTML =
        '<h2 class="projects-anchor__title">The one I would show you first</h2>' +
        '<p class="projects-anchor__lede">A release platform for forty services, and five other projects that ' +
        'were not chosen to lead. Everything here reads without being touched.</p>';
      sec.appendChild(head);

      var grid = SE.el('div', 'projects-anchor__grid');
      sec.appendChild(grid);

      var feat = SE.el('article', 'projects-anchor__feature');
      feat.style.setProperty('--c-accent', feature.accent);
      feat.innerHTML =
        '<figure class="projects-anchor__figure">' +
          '<div class="projects-anchor__plate"></div>' +
          '<figcaption class="t-num">Fig. ' + feature.num + '   ' + feature.figure + '</figcaption>' +
        '</figure>' +
        /* One accent rule after the index number, then plain spacing. Three
           rules in a row would read as three dashes. */
        '<p class="projects-anchor__meta t-num">' + feature.num + '<i></i>' +
          '<span>' + feature.discipline + '</span><span>' + feature.role + '</span>' +
          '<span>' + feature.year + '</span></p>' +
        '<h3 class="projects-anchor__name">' + feature.name + '</h3>' +
        '<p class="projects-anchor__problem">' + feature.problem + '</p>' +
        '<p class="projects-anchor__outcome">' + feature.outcome + '</p>' +
        '<div class="projects-anchor__tech">' + techMarkup(feature) + '</div>' +
        '<div class="projects-anchor__actions"><button class="btn" type="button" data-open>Read the case</button></div>';
      grid.appendChild(feat);

      var idx = SE.el('aside', 'projects-anchor__index');
      idx.innerHTML =
        '<h3 class="projects-anchor__idxtitle">The other five</h3>' +
        '<ul class="projects-anchor__rows">' +
          rest.map(function (p) {
            return '<li><button type="button" data-row="' + p.index + '" ' +
                   'aria-label="' + p.name + ', ' + p.discipline + ', ' + p.year + '. ' + p.outcome + '">' +
                     '<i class="t-num">' + p.num + '</i>' +
                     '<b>' + p.name + '</b>' +
                     '<em class="t-num">' + p.discipline + '</em>' +
                     '<span class="t-num">' + p.year + '</span>' +
                     '<s></s>' +
                   '</button></li>';
          }).join('') +
        '</ul>';
      grid.appendChild(idx);

      if (isSection) {
        var more = seeMoreNow('See all six', ctx.onSeeMore);
        more.classList.add('projects-anchor__more');
        idx.appendChild(more);
      }

      sec.appendChild(SE.srList('Anchor: one featured project and five more', srItems(), function (item) {
        kase.show(item.p, null);
      }));

      var kase = makeCase(root);

      /* ---------------------------------------------------------- state */
      var art = mountArt(SE.$('.projects-anchor__plate', feat), feature, {
        zoom: 460,
        reveal: env.reduced ? 1 : 0
      });
      var reveal = env.reduced ? 1 : 0;
      var ticking = false;
      var visible = false;
      var started = env.reduced;

      function tick(dt, t) {
        if (!started) return;
        if (reveal < 0.999) {
          /* Frame-rate independent, so the plate draws at the same speed on a
             60Hz laptop and a 120Hz phone. */
          reveal = M.damp(reveal, 1, 2.2, dt);
          if (reveal > 0.999) reveal = 1;
          art.setReveal(reveal);
        }
        art.paint(t);
        syncTicker();
      }

      function syncTicker() {
        var want = visible && !env.reduced && (reveal < 0.999 || isAnimated(feature));
        if (want && !ticking) { SE.ticker.add(tick); ticking = true; }
        else if (!want && ticking) { SE.ticker.remove(tick); ticking = false; }
      }

      var view = inView(sec, function (on) {
        visible = on;
        syncTicker();
      }, '10% 0px 10% 0px');

      /* One observer, one entrance, then it disconnects. A section that
         replays its entrance every time it is scrolled past is a section
         nobody can re-read. */
      var enterIO = null;
      if (env.reduced) {
        sec.classList.add('is-in');
      } else {
        enterIO = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) return;
          sec.classList.add('is-in');
          started = true;
          syncTicker();
          enterIO.disconnect();
          enterIO = null;
        }, { threshold: 0.35 });
        enterIO.observe(sec);
      }

      /* ----------------------------------------------------- interaction */
      sec.addEventListener('click', function (e) {
        var row = e.target.closest('[data-row]');
        if (row) { kase.show(PROJECTS[parseInt(row.getAttribute('data-row'), 10)], row); return; }
        var open = e.target.closest('[data-open]');
        if (open) kase.show(feature, open);
      });

      return {
        destroy: function () {
          if (ticking) SE.ticker.remove(tick);
          if (enterIO) enterIO.disconnect();
          view.destroy();
          art.destroy();
          kase.destroy();
          root.classList.remove('projects-anchor', 'projects-selfscroll');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     SECTION 03  -  SEQUENCE
     --------------------------------------------------------------------------
     Three projects advanced by scroll and then handed back. A film strip moving
     through a gate: the reader's scroll is the transport, each frame holds
     while it is being read, and the strip runs out on purpose after three.

     WHY IT HOLDS INSTEAD OF PANNING
     -------------------------------
     A linear map from scroll to position means the frame is only readable at
     one exact scroll offset, which is why most scrubbed sequences feel like
     they are being dragged past the reader. The map here is a plateau curve:
     62% of each segment holds the frame perfectly still and the remaining 30%
     moves to the next one. Same continuous scrub, but the reading moments are
     where the reader actually stops.

     WHY THREE AND NOT SIX
     ---------------------
     A section is a paragraph, not a chapter. Three frames is roughly three
     screens of scroll, which is already generous for a section, and running
     out is the honest way to hand off to the full view.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'projects-section-sequence',
    num: 3,
    name: 'Sequence',
    kind: 'Canvas / scrubbed strip',
    accent: '#D06F8C',
    tagline: 'Three frames, each holding while it is read',
    desc: 'Scroll moves a strip of three plates through a fixed gate, holding each one still while it is being read ' +
          'and running out after the third. The scroll is never taken away and never given back late.',
    interaction: 'Scroll. The strip advances, each frame holds while you read it, and the section releases you after the third.',
    hint: 'Scroll advances the strip',
    screens: 3.4,
    pageOf: 'projects-page-reel',

    /* Miniature: the strip stepping through the gate with the hold plateaus
       visible in the tick column. Around 30 operations per frame. */
    preview: function (ctx, w, h, t, heat) {
      var cyc = ((t * 0.20 + heat * 0.30) % 1);
      var seg = cyc * 3;
      var i = Math.min(2, Math.floor(seg));
      var f = seg - i;
      var k = M.clamp((f - 0.62) / 0.30, 0, 1);
      var fp = i + k * k * (3 - 2 * k);

      var gx = w * 0.30, gw = w * 0.52;
      var gy = h * 0.14, gh = h * 0.60;

      ctx.save();
      ctx.beginPath();
      ctx.rect(gx, gy, gw, gh);
      ctx.clip();
      for (var n = 0; n < 3; n++) {
        var p = PROJECTS[n];
        var y = gy + (n - fp) * gh;
        if (y > gy + gh || y + gh < gy) continue;
        ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',0.18)';
        ctx.fillRect(gx, y, gw, gh - 2);
        ctx.strokeStyle = 'rgba(' + p.rgb.join(',') + ',0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var b = 0; b < 3; b++) {
          var by = y + gh * (0.28 + b * 0.20);
          ctx.moveTo(gx + gw * 0.10, by);
          ctx.lineTo(gx + gw * (0.32 + b * 0.16), by);
        }
        ctx.stroke();
      }
      ctx.restore();

      ctx.strokeStyle = 'rgba(236,236,239,0.16)';
      ctx.lineWidth = 1;
      ctx.strokeRect(gx + 0.5, gy + 0.5, gw, gh);

      /* the tick column: three marks, the current one filled by hold amount */
      for (var m = 0; m < 3; m++) {
        var my = gy + m * (gh / 2.6);
        var on = m === Math.round(fp);
        ctx.fillStyle = on ? '#D06F8C' : 'rgba(236,236,239,0.16)';
        ctx.fillRect(w * 0.10, my, on ? w * 0.13 : w * 0.06, 2);
      }
      ctx.fillStyle = 'rgba(236,236,239,0.28)';
      ctx.fillRect(w * 0.10, h * 0.84, w * 0.34, 2);
    },

    spec: {
      subtitle: 'A strip of three plates moving through a fixed gate, holding each frame while it is read.',
      philosophy: [
        'Scroll-linked motion is only worth having if the reading moments line up with where the reader stops. A linear map gives one readable offset per frame; a plateau map gives a third of a screen of it.',
        'The section borrows scroll and gives it back. Three frames is roughly three screens, which is a paragraph of a page rather than a chapter, and running out after three is the honest hand-off.',
        'The strip is one continuous object rather than three panels being swapped, so the reader can feel that there is a physical thing being transported past them.',
        'Nothing is hidden. Each frame carries the name, the problem and the outcome at full size while it holds.'
      ],
      hierarchy: [
        '1. The gate: the plate for the frame currently held, filling a 58% column at 4:3.',
        '2. The name of the held frame, clamp(2rem, 4.4vw, 3.5rem).',
        '3. Its outcome sentence, 1rem on --ink at 60ch.',
        '4. The problem line and the frame counter.',
        '5. The three hold marks in the left column.'
      ],
      structure: [
        'SE.scrollRail equivalent: an over-tall rail of 3.4 viewport heights containing a position: sticky viewport of exactly one screen. Sticky, not ScrollTrigger pin, because a pin-spacer inside a nested scroll container is fragile and sticky needs no layout surgery.',
        'div.gate: overflow hidden, holding one strip of three plate frames stacked vertically at 100% height each.',
        'div.text: three absolutely stacked text blocks, crossfaded by their distance from the current frame position.',
        'nav.marks: three hold marks in the left column, each a real button that scrolls the rail to that frame.',
        'The See more control appears at the foot once progress passes 0.82.'
      ],
      interaction: [
        'Scroll is scrubbed through ScrollTrigger when it is present and through a passive listener on the scroller when it is not, so a failed CDN degrades the smoothing rather than the feature.',
        'Plateau map: with segment = progress * 3, frame index i = floor(segment) and f = segment - i, the strip position is i + smoothstep(clamp((f - 0.62) / 0.30, 0, 1)). Each frame therefore holds perfectly still for 62% of its segment, which is about two thirds of a screen of scrolling.',
        'The scrubbed value is damped toward the raw progress at lambda 9, so the strip has a little mass and does not stutter with the scrollbar.',
        'Text opacity for block i is clamp(1 - |framePos - i| * 1.6, 0, 1), so the outgoing block is gone before the incoming one is legible and the two never overlap as mush.',
        'Hold marks are buttons: clicking one scrolls the rail to the exact offset where that frame is fully held. That is the required non-scroll alternative.',
        'The section never traps the reader: scrolling past the end of the rail leaves normally, and there is no snapping anywhere.'
      ],
      choreography: [
        { n: 'Strip transport', d: 'transform: translate3d(0, -framePos * 100%, 0) on one element containing all three frames. One transform per frame, no layout, no per-frame class changes.' },
        { n: 'Hold curve', d: 'k = clamp((f - 0.62) / 0.30, 0, 1) then smoothstep k*k*(3-2k). The 62% is the reading plateau and the 30% is the transport; the remaining 8% is slack at the end of the segment so a fast scroll never lands mid-transition.' },
        { n: 'Damping', d: 'framePos is damped toward its target at lambda 9 with a frame-rate independent damp. Not a fixed per-frame lerp: on a 120Hz display that would run at double speed.' },
        { n: 'Text crossfade', d: 'opacity per block from the distance to framePos, plus translate3d(0, (i - framePos) * 24px, 0) so the text drifts with the strip at a tenth of its rate. Transform and opacity only.' },
        { n: 'Hold mark', d: 'The active mark scales on X from 1 to 2.6 with transform-origin left over 300ms cubic-bezier(0.23, 1, 0.32, 1), driven by which frame is nearest rather than per frame.' },
        { n: 'Hand-off', d: 'The See more control goes from opacity 0 and translate3d(0,10px,0) to 0 over 420ms cubic-bezier(0.23, 1, 0.32, 1) once progress passes 0.82, and stays.' }
      ],
      scroll: [
        'The section consumes exactly 2.4 extra viewport heights of scroll and returns the reader to normal flow after the third frame.',
        'Sticky viewport, never a pin. In a nested scroll container a pin-spacer rewrites layout and fights whatever owns the scroll.',
        'Under reduced motion the scrub is set to true rather than 0.6 so there is no smoothing lag, and the strip snaps to the exact frame position.',
        'Build the See more route as well: /work rendering the full-page Reel counterpart, where all six get a frame instead of three.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine).',
        'Hold marks: colour from --ink-4 to --ink-2 over 140ms.',
        'The gate does not respond to hover. It is a figure being transported, not a control.',
        'The case button under the text takes the held project\'s hue.'
      ],
      click: [
        'A hold mark scrolls the rail to that frame\'s hold offset with behavior smooth, or auto under reduced motion.',
        'The case button opens the held project\'s case sheet.',
        'See more opens the page-level Reel counterpart, where the same idea runs to all six.'
      ],
      responsive: {
        desktop: 'Marks column, then text at 38%, then the gate at 58% and 4:3. Rail of 3.4 viewport heights.',
        tablet: 'Text at 42% and the gate at 54%, rail reduced to 3.2 viewport heights because a shorter viewport makes each screen of scroll cost less.',
        mobile: 'A different composition, not a smaller one. The gate becomes a 30dvh band across the top of the sticky viewport and the text sits under it, so the plate and the prose never compete for a 375px width. The rail drops to 3 viewport heights, the marks column becomes a single frame counter, and the plate renders at devicePixelRatio capped to 1.75.'
      },
      a11y: [
        'The three hold marks are real buttons and are the non-scroll route to every frame, which matters for anyone using a keyboard, a switch or a screen reader.',
        'All three text blocks are in the DOM at all times; only their opacity changes, so a screen reader reads the whole sequence as three articles regardless of scroll position.',
        'The canvas is aria-hidden and mirrored by a visually hidden list of all six projects.',
        'A polite live region announces the held frame when it changes, throttled to the settled frame rather than fired per frame.',
        'Nothing is trapped: the section never prevents default on a scroll event and never snaps.',
        'prefers-reduced-motion: the damping is removed so the strip tracks scroll exactly, the text crossfade becomes a hard switch at the segment boundary, the drift is removed, and the See more control is visible from the start rather than appearing at 0.82.'
      ],
      perf: [
        'Three plate canvases, and only the one inside the gate paints. The other two hold their last frame.',
        'The frame loop is subscribed only while the rail is intersecting the viewport, through an IntersectionObserver with a 15% margin.',
        'Per frame: one transform on the strip, three opacity writes and three transform writes on the text blocks. No layout property is touched.',
        'The ScrollTrigger, if present, is created once and killed on unmount; the fallback listener is passive and attached to the scroller, never to the window.',
        'Backing store capped at devicePixelRatio 2, and 1.75 below 768px.'
      ],
      packages: pkgs([
        { p: 'gsap ScrollTrigger (installed)', w: 'Only for the scrub value. Guard it: without ScrollTrigger the section falls back to a passive scroll listener on the container and loses the smoothing, not the feature.' }
      ]),
      architecture: [
        { f: 'components/sections/WorkSequence.tsx', r: '"use client". Owns the rail, the scrub subscription and the plateau map. The three text blocks are children and are server-rendered.' },
        { f: 'components/sections/SequenceFrame.tsx', r: 'One frame: plate plus its text block. Presentational.' },
        { f: 'components/sections/usePlateau.ts', r: 'The plateau map and the damping, on their own and testable: progress in, frame position out.' },
        PLATE_NOTE,
        { f: 'app/work/page.tsx', r: 'REQUIRED. The See more destination, rendering the full-page Reel counterpart.' },
        { f: 'content/projects.ts', r: 'The typed project array. The sequence takes the first three by authored order.' }
      ],
      state: [
        'React state: the settled frame index, for the live region and the marks. It changes three times per pass.',
        'Refs, never state: the raw scrub progress, the damped frame position, and the ScrollTrigger instance. All three change at frame rate.',
        'The strip transform is written imperatively to a ref. Driving it through state would re-render three frames sixty times a second.',
        'Nothing is persisted. Scroll position is the browser\'s state and belongs to it.'
      ],
      typography: [
        'Frame name: Space Grotesk 500 at clamp(2rem, 4.4vw, 3.5rem), tracking -0.042em.',
        'Outcome: 1rem at 1.6 over 60ch. Problem line 0.9375rem on --ink-2.',
        'Frame counter and hold marks: JetBrains Mono 500 with tabular figures.',
        'The section heading is a sentence and there is no kicker above it.'
      ],
      color: [
        'Ground --void, continuous with the sections above and below.',
        '--c-accent follows the held project, so the hold mark, the problem rule and the case button all agree with the plate in the gate.',
        'The gate has a 1px --line border and no fill of its own; the plate is the only thing inside it.',
        'The two frames outside the gate are clipped, not dimmed, so nothing is drawn that the reader cannot see.'
      ],
      spacing: [
        'Sticky viewport is exactly one screen with the page gutter inline and clamp(1.5rem, 4vh, 3rem) block.',
        'Marks column 6rem, text column 38%, gate 58%, gaps clamp(1.5rem, 4vw, 3.5rem).',
        'Text block: 0.75rem meta to name, 1.5rem name to problem, 0.75rem problem to outcome, 1.75rem to the case button.'
      ],
      relationships: [
        'Vertical strip position encodes scroll progress, and it is the only thing scroll drives.',
        'The plateau in the curve encodes reading time: where the curve is flat, the reader is meant to be reading.',
        'Text opacity encodes which frame is held, redundantly with the strip position, because the two have to agree or the section reads as broken.',
        'The hold mark width encodes which of the three is current, and the counter says how many are left.'
      ],
      acceptance: [
        'Each frame is perfectly still for about two thirds of a screen of scrolling.',
        'Scrolling quickly through the section never leaves the reader looking at two half-faded text blocks.',
        'The three hold marks reach every frame with no scrolling at all.',
        'Scrolling past the end leaves the section normally, with no snap and no delay.',
        'With ScrollTrigger blocked, the section still advances correctly with the fallback listener.',
        'With reduced motion on, the strip tracks scroll exactly, nothing drifts, and See more is visible from the start.',
        'At 375px the plate is a band above the text, not a background behind it.'
      ]
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var trio = PROJECTS.slice(0, 3);
      root.classList.add('projects-seq');

      var scroller = scrollerFor(root, ctx);
      var railApi = SE.scrollRail(scroller, 3.4);
      root.appendChild(railApi.rail);

      /* ------------------------------------------------------------ DOM */
      var view = SE.el('div', 'projects-seq__view');
      railApi.sticky.appendChild(view);

      var marks = SE.el('nav', 'projects-seq__marks');
      marks.setAttribute('aria-label', 'Frames');
      marks.innerHTML =
        trio.map(function (p, i) {
          return '<button type="button" data-mark="' + i + '" aria-current="' + (i === 0) + '" ' +
                 'aria-label="Frame ' + (i + 1) + ', ' + p.name + '"><i></i><b class="t-num">' + p.num + '</b></button>';
        }).join('') +
        '<span class="projects-seq__count t-num">03 / ' + TOTAL + '</span>';
      view.appendChild(marks);

      var textCol = SE.el('div', 'projects-seq__text');
      trio.forEach(function (p, i) {
        var b = SE.el('article', 'projects-seq__block');
        b.style.setProperty('--c-accent', p.accent);
        b.setAttribute('data-block', String(i));
        b.innerHTML =
          '<p class="projects-seq__meta t-num">' + p.num + '<i></i><span>' + p.discipline + '</span>' +
            '<span>' + p.year + '</span></p>' +
          '<h3 class="projects-seq__name">' + p.name + '</h3>' +
          '<p class="projects-seq__problem">' + p.problem + '</p>' +
          '<p class="projects-seq__outcome">' + p.outcome + '</p>' +
          '<div class="projects-seq__actions"><button class="btn" type="button" data-case="' + p.index + '">Read the case</button></div>';
        textCol.appendChild(b);
      });
      view.appendChild(textCol);

      var gate = SE.el('div', 'projects-seq__gate');
      var strip = SE.el('div', 'projects-seq__strip');
      var arts = trio.map(function (p) {
        var fr = SE.el('div', 'projects-seq__frame');
        strip.appendChild(fr);
        return mountArt(fr, p, { zoom: 460 });
      });
      gate.appendChild(strip);
      view.appendChild(gate);

      var foot = SE.el('div', 'projects-seq__foot');
      view.appendChild(foot);

      var more = null;
      if (ctx.mode === 'section') {
        more = SE.seeMore('See all six', ctx.onSeeMore);
        more.classList.add('projects-seq__more');
        foot.appendChild(more);
        if (env.reduced) more.classList.add('is-on');
      }

      var live = SE.el('p', 'sr-only');
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      view.appendChild(live);

      view.appendChild(SE.srList('Sequence: three of six projects', srItems(), function (item) {
        if (item.p.index < 3) goFrame(item.p.index);
      }));

      var kase = makeCase(root);

      /* ---------------------------------------------------------- state */
      var progress = 0;
      var framePos = 0;
      var held = -1;
      var blocks = SE.$$('[data-block]', textCol);
      var markBtns = SE.$$('[data-mark]', marks);
      var ticking = false;
      var visible = false;

      /* The plateau map. 62% of each segment is a flat hold, 30% transports to
         the next frame, and the last 8% is slack so a fast scroll never comes
         to rest inside a transition. */
      function plateau(p) {
        var seg = M.clamp(p, 0, 1) * 3;
        var i = Math.min(2, Math.floor(seg));
        var f = seg - i;
        var k = M.clamp((f - 0.62) / 0.30, 0, 1);
        return i + k * k * (3 - 2 * k);
      }

      /* The scroll offset at which frame i is exactly held, used by the marks
         so the keyboard route lands where the reading plateau is. */
      function holdOffset(i) {
        return (i + 0.30) / 3;
      }

      /* offsetTop is measured against the nearest positioned ancestor, which
         inside the shell's page frame is a wrapper partway down the document,
         not the scroller. Measuring both rectangles is the only way to get the
         rail's real position in the scroll container. */
      function railTop() {
        var rr = railApi.rail.getBoundingClientRect();
        var sr = scroller.getBoundingClientRect();
        return scroller.scrollTop + (rr.top - sr.top);
      }

      function goFrame(i) {
        var span = railApi.rail.offsetHeight - scroller.clientHeight;
        scroller.scrollTo({
          top: railTop() + holdOffset(i) * span,
          behavior: env.reduced ? 'auto' : 'smooth'
        });
      }

      marks.addEventListener('click', function (e) {
        var b = e.target.closest('[data-mark]');
        if (b) goFrame(parseInt(b.getAttribute('data-mark'), 10));
      });

      view.addEventListener('click', function (e) {
        var b = e.target.closest('[data-case]');
        if (b) kase.show(PROJECTS[parseInt(b.getAttribute('data-case'), 10)], b);
      });

      function setHeld(i) {
        if (i === held) return;
        held = i;
        var p = trio[i];
        root.style.setProperty('--c-accent', p.accent);
        markBtns.forEach(function (b, k) { b.setAttribute('aria-current', String(k === i)); });
        live.textContent = 'Frame ' + (i + 1) + ' of 3. ' + p.name + ', ' + p.discipline + ', ' + p.year + '. ' + p.outcome;
      }

      /* ------------------------------------------------------------ tick */
      function tick(dt, t) {
        var target = plateau(progress);
        framePos = env.reduced ? target : M.damp(framePos, target, 9, dt);

        strip.style.transform = 'translate3d(0,' + (-framePos * 100).toFixed(3) + '%,0)';

        for (var i = 0; i < blocks.length; i++) {
          var d = Math.abs(framePos - i);
          var op = M.clamp(1 - d * 1.6, 0, 1);
          blocks[i].style.opacity = op.toFixed(3);
          blocks[i].style.transform = env.reduced
            ? 'none'
            : 'translate3d(0,' + ((i - framePos) * 24).toFixed(1) + 'px,0)';
          blocks[i].style.pointerEvents = op > 0.6 ? 'auto' : 'none';
          blocks[i].setAttribute('aria-hidden', String(op <= 0.6));
        }

        setHeld(M.clamp(Math.round(framePos), 0, 2));
        arts[M.clamp(Math.round(framePos), 0, 2)].paint(t);
        if (more) more.classList.toggle('is-on', env.reduced || progress > 0.82);
      }

      function syncTicker() {
        if (visible && !ticking) { SE.ticker.add(tick); ticking = true; }
        else if (!visible && ticking) { SE.ticker.remove(tick); ticking = false; }
      }

      var scrubber = SE.scrub(scroller, railApi.rail, function (p) { progress = p; });
      var vis = inView(railApi.rail, function (on) { visible = on; syncTicker(); }, '15% 0px 15% 0px');

      /* one composed frame before the first scroll, so the section is never
         blank while it waits to be scrolled into */
      tick(1 / 60, 0);

      return {
        destroy: function () {
          if (ticking) SE.ticker.remove(tick);
          scrubber.kill();
          vis.destroy();
          railApi.destroy();
          arts.forEach(function (a) { a.destroy(); });
          kase.destroy();
          root.classList.remove('projects-seq', 'projects-selfscroll');
          root.removeAttribute('style');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     SECTION 04  -  ROSTER
     --------------------------------------------------------------------------
     A list that says nothing until it is touched, and then says everything.

     THE MECHANISM
     -------------
     One canvas, not six. It is a band the height of a single row, parked
     behind the list, and it slides to whichever row is active and fades in.
     The plate is therefore a crop out of the project's own drawing, running
     under its own name. Six canvases would be six times the memory to show one
     thing at a time.

     WHY THE ROW HEIGHT IS FIXED
     ---------------------------
     The outcome sentence is present in every row from the first paint, at
     opacity 0. Revealing it changes no layout, so hovering down the list never
     makes the rows below jump, which is the failure mode of every list that
     tries to expand on hover.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'projects-section-roster',
    num: 4,
    name: 'Roster',
    kind: 'DOM + canvas / quiet list',
    accent: '#8FA05A',
    tagline: 'Silent until you touch it, then complete',
    desc: 'Six rows of nothing but names and years, until a row is touched and its plate runs underneath it with the ' +
          'outcome beside it. One canvas serves all six, and no row ever changes height.',
    interaction: 'Move down the list, or Tab through it. The touched row lights, its plate washes in behind it, and its outcome appears.',
    hint: 'Touch a row &middot; Nothing moves',
    screens: 1,
    pageOf: 'projects-page-dossier',

    /* Miniature: six quiet rules with one lit band travelling down them.
       Around 22 operations per frame. */
    preview: function (ctx, w, h, t, heat) {
      var n = 6;
      var padX = w * 0.10;
      var top = h * 0.14, rowH = (h - top * 2) / n;
      var cyc = (t * 0.45 + heat * 0.8) % n;
      var i = Math.floor(cyc);
      var p = PROJECTS[i];

      /* the wash band under the active row */
      ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',0.22)';
      ctx.fillRect(padX, top + i * rowH, w - padX * 2, rowH - 2);
      ctx.strokeStyle = 'rgba(' + p.rgb.join(',') + ',0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var s = 0; s < 3; s++) {
        var sy = top + i * rowH + rowH * (0.28 + s * 0.22);
        ctx.moveTo(padX + w * 0.04, sy);
        ctx.lineTo(padX + w * (0.16 + s * 0.14), sy);
      }
      ctx.stroke();

      for (var r = 0; r < n; r++) {
        var y = Math.round(top + r * rowH) + 0.5;
        ctx.strokeStyle = 'rgba(236,236,239,0.10)';
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(w - padX, y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(236,236,239,' + (r === i ? 0.92 : 0.22) + ')';
        ctx.fillRect(padX, y + rowH * 0.40, (w - padX * 2) * (0.24 + (r % 3) * 0.12), r === i ? 3 : 2);
      }
    },

    spec: {
      subtitle: 'Six quiet rows, and one shared plate band that slides to whichever row is touched.',
      philosophy: [
        'A section that is loud before it is wanted is a section a reader scrolls past. This one is a list of names until it is touched, and then it is complete.',
        'Quiet is not the same as empty. Every row carries its number, its name, its discipline and its year from the first paint; only the picture and the outcome wait.',
        'One canvas for six rows. The plate is a band cropped out of the project\'s own drawing, running under its own name, which is a more interesting figure than a thumbnail of it.',
        'Nothing moves. The row height is fixed and the outcome is present at opacity 0, so moving down the list never pushes the rows below it around.'
      ],
      hierarchy: [
        '1. The six names, clamp(1.5rem, 3vw, 2.5rem), at --ink-3 until touched and --ink when touched.',
        '2. The plate band behind the touched row, at 22% opacity under a scrim.',
        '3. The outcome sentence for the touched row, 0.9375rem on --ink-2.',
        '4. Discipline and year, mono 0.625rem on --ink-4.'
      ],
      structure: [
        'section, ordinary height, block padding clamp(4rem, 12vh, 8rem). No sticky, no pin, no rail.',
        'div.list: position relative, six rows of a fixed 7.5rem height with a 1px rule between.',
        'div.wash: one absolutely positioned canvas host the height of a single row, translated to the active row and faded in. It sits at z-index 0, under the row text.',
        'div.scrim: a single gradient over the wash so text contrast never depends on which plate is behind it.',
        'button.row x6: a two row grid. Top line is number, name, discipline and year; bottom line is the outcome sentence, present always, clamped to two lines and revealed by opacity.',
        'The See more control sits under the list.'
      ],
      interaction: [
        'Pointer: entering a row makes it active. Leaving the list clears the active row and the wash fades out, because the quiet state is the point of this concept and it has to be reachable again.',
        'Keyboard: focusing a row makes it active. Focus and hover produce identical state, and Tab through the list is a complete experience of it.',
        'ArrowDown and ArrowUp move between rows and take focus with them; Home and End jump to the ends.',
        'Enter, Space or a click calls the page-level hand-off for that project, because a quiet list has nowhere else to put a detail view.',
        'Hover intent: 50ms of dwell before the active row changes, so a diagonal sweep across the list does not fire six wash moves.',
        'The wash never follows the cursor. It moves to a row, not to a pointer.'
      ],
      choreography: [
        { n: 'Wash move', d: 'transform: translate3d(0, activeRow * 100%, 0) over 420ms cubic-bezier(0.23, 1, 0.32, 1). One transform on one element, and the element is exactly one row tall so the percentage is the row index.' },
        { n: 'Wash fade', d: 'opacity 0 to 1 over 260ms cubic-bezier(0.23, 1, 0.32, 1) on the way in, and 200ms on the way out, which is about 75% of the entrance.' },
        { n: 'Row text', d: 'Name colour --ink-3 to --ink and the outcome opacity 0 to 1, both over 180ms cubic-bezier(0.23, 1, 0.32, 1). Under 300ms because a reader may cross four rows in a second.' },
        { n: 'Rule', d: 'The rule under the active row goes from --line to the project hue over 180ms. Colour only, no thickness change, so nothing reflows.' },
        { n: 'Idle', d: 'There is none. Nothing on this section animates unless it is being touched, which is the whole idea.' }
      ],
      scroll: [
        'This section consumes no vertical scroll and pins nothing.',
        'The plate for the active row repaints only while an animated painter is active; the frame loop is unsubscribed the moment the list goes quiet again.',
        'Everything scroll-related is IntersectionObserver. No scroll listener anywhere.',
        'Build the See more route as well: /work rendering the full-page Dossier counterpart, where the detail the list holds back is the entire page.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine). Below that the active row is set by focus only, and the mobile composition does not depend on it at all.',
        'The row hit area is the full width of the list and the full 7.5rem of its height.',
        'The cursor takes a label with the project name.',
        'Nothing lifts, nothing scales, nothing blurs. The only change is that the row becomes legible and its plate arrives.'
      ],
      click: [
        'A row calls the page-level Dossier counterpart, opened on that project.',
        'The See more control opens the same route with nothing selected.',
        'There is nothing else clickable in the section.'
      ],
      responsive: {
        desktop: 'Six rows at 7.5rem with the wash band behind, names up to 2.5rem, discipline and year in a right-aligned mono column.',
        tablet: 'Same, names capped at 2rem and the discipline column dropped, keeping the year.',
        mobile: 'A different composition, not a smaller one. There is no hover on a phone, so nothing is held back: the wash canvas moves out of the list and becomes a single 16:9 figure above it showing the first project, and every row shows its outcome permanently at 0.875rem. The rows grow to fit their text rather than staying at a fixed height, because there is no longer a reveal that could push them around.'
      },
      a11y: [
        'Rows are buttons with the project name, discipline, year and outcome in their accessible name, so the whole content of the section is available without any pointer.',
        'Focus and hover set identical state. The keyboard path is the pointer path.',
        'The canvas is aria-hidden and mirrored by a visually hidden list of all six projects.',
        'Contrast: the wash sits under a scrim and the names are --ink over it, measured against the darkest 20% of the scrim rather than the average.',
        'No information is available only on hover: everything the reveal shows is in the accessible name of the row from the first paint.',
        'prefers-reduced-motion: the wash still moves to the active row, because that is position rather than decoration, but it arrives instantly instead of travelling; it fades over 150ms, the outcome switches without a transition, and nothing else moves.'
      ],
      perf: [
        'One canvas for six rows. Six thumbnails would be six times the backing store to show one thing at a time.',
        'The frame loop is subscribed only while an animated painter is the active one, and is released the moment the list goes quiet.',
        'The wash move is one transform on one element; the row text is one colour and one opacity per row.',
        'content-visibility: auto on the section.',
        'Backing store capped at devicePixelRatio 2, and 1.75 below 768px.'
      ],
      packages: pkgs(),
      architecture: [
        { f: 'components/sections/WorkRoster.tsx', r: 'Server Component. Renders the six rows in full, including every outcome sentence, so the section is complete before any JavaScript runs.' },
        { f: 'components/sections/RosterWash.tsx', r: '"use client". The one canvas, its position and its opacity. Takes the active index as a prop and owns nothing else.' },
        PLATE_NOTE,
        { f: 'app/work/page.tsx', r: 'REQUIRED. The See more destination, rendering the full-page Dossier counterpart.' },
        { f: 'content/projects.ts', r: 'The typed project array.' }
      ],
      state: [
        'React state: the active row index, or null for the quiet state. One value.',
        'Refs, never state: the hover intent timer and the canvas context.',
        'The quiet state is a real state, not the absence of one. Null is meaningful here and the component renders it deliberately.',
        'Nothing is persisted; the list is quiet again on every visit.'
      ],
      typography: [
        'Row name: Space Grotesk 500 at clamp(1.5rem, 3vw, 2.5rem), tracking -0.03em.',
        'Outcome: Space Grotesk 400 at 0.9375rem over 64ch.',
        'Number, discipline and year: JetBrains Mono 500 with tabular figures, so the six years form a column.',
        'The heading is a sentence and there is no kicker above it.'
      ],
      color: [
        'Ground --void. The list is --ink-3 and --ink-4 at rest, which is deliberately close to the ground: a quiet list should look quiet.',
        'The active row takes the project hue on its rule and its number; the name goes to --ink.',
        'The wash is the project plate at 22% under a scrim of the ground colour, never a black overlay.',
        '--c-accent for the section chrome is the concept hue and is used by the See more control.'
      ],
      spacing: [
        'Rows at a fixed 7.5rem with 1.25rem of internal top padding, so the name sits high in the row and the outcome sits under it without either being centred.',
        'Section block padding clamp(4rem, 12vh, 8rem), inline the page gutter.',
        'The See more control sits 2.5rem under the last rule.'
      ],
      relationships: [
        'Vertical position of the wash encodes which row is active, and it is the only thing that moves.',
        'Text colour encodes active or not, in one step.',
        'The outcome opacity encodes the same thing again, redundantly, because the reader needs to be certain which row they are on.',
        'Plate hue encodes which project.'
      ],
      acceptance: [
        'With no pointer and no focus anywhere, the section is six names, six disciplines and six years, and nothing else.',
        'Touching a row never moves any other row.',
        'Sweeping the cursor down the list fires at most two wash moves, not six.',
        'Tab through the list produces exactly the same visual states as hovering it.',
        'Leaving the list returns it to the quiet state.',
        'With reduced motion on, the wash appears without travelling and nothing else animates.',
        'At 375px there is no hidden state at all: every outcome is visible and the plate is a figure above the list.'
      ]
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var isSection = ctx.mode === 'section';
      root.classList.add('projects-roster');
      if (!isSection) scrollerFor(root, ctx);

      /* ------------------------------------------------------------ DOM */
      var sec = SE.el('section', 'projects-roster__sec');
      sec.style.setProperty('--c-accent', '#8FA05A');
      root.appendChild(sec);

      var head = SE.el('header', 'projects-roster__head');
      head.innerHTML =
        '<h2 class="projects-roster__title">Six names, and nothing else until you ask</h2>' +
        '<p class="projects-roster__lede">Touch any row and its plate runs underneath it. Everything the reveal ' +
        'shows is already in the row for a screen reader, so nothing here is hidden from anybody.</p>';
      sec.appendChild(head);

      var list = SE.el('div', 'projects-roster__list');
      var wash = SE.el('div', 'projects-roster__wash');
      wash.setAttribute('aria-hidden', 'true');
      list.appendChild(wash);
      var scrim = SE.el('div', 'projects-roster__scrim');
      scrim.setAttribute('aria-hidden', 'true');
      list.appendChild(scrim);

      var rows = SE.el('div', 'projects-roster__rows');
      rows.innerHTML = PROJECTS.map(function (p) {
        return '<button type="button" class="projects-roster__row" data-row="' + p.index + '" ' +
                 'style="--c-accent:' + p.accent + '" ' +
                 'aria-label="' + p.name + ', ' + p.discipline + ', ' + p.year + '. ' + p.outcome + '">' +
                 '<span class="projects-roster__top">' +
                   '<i class="t-num">' + p.num + '</i>' +
                   '<b>' + p.name + '</b>' +
                   '<em class="t-num">' + p.discipline + '</em>' +
                   '<span class="t-num">' + p.year + '</span>' +
                 '</span>' +
                 '<span class="projects-roster__out" aria-hidden="true">' + p.outcome + '</span>' +
               '</button>';
      }).join('');
      list.appendChild(rows);
      sec.appendChild(list);

      var foot = SE.el('div', 'projects-roster__foot');
      sec.appendChild(foot);
      if (isSection) {
        var more = seeMoreNow('Read the full records', ctx.onSeeMore);
        more.classList.add('projects-roster__more');
        foot.appendChild(more);
      }

      sec.appendChild(SE.srList('Roster: six projects', srItems(), function (item) {
        setActive(item.p.index);
      }));

      /* ---------------------------------------------------------- state */
      var art = mountArt(wash, PROJECTS[0], { zoom: 300 });
      var rowEls = SE.$$('[data-row]', rows);
      var active = -1;
      var hoverTimer = 0;
      var ticking = false;
      var narrowNow = false;

      var narrow = watchNarrow(function (isNarrow) {
        narrowNow = isNarrow;
        root.classList.toggle('is-narrow', isNarrow);
        if (isNarrow) {
          /* No hover on a phone, so the wash stops being a reveal and becomes
             a figure: parked above the list, always on, showing the first
             project. Nothing is held back. */
          art.setProject(PROJECTS[0]);
          wash.style.transform = '';
          setActive(-1);
        }
        art.paint();
        syncTicker();
      });

      function setActive(i) {
        if (i === active) return;
        active = i;
        rowEls.forEach(function (b, k) { b.classList.toggle('is-on', k === i); });
        list.classList.toggle('is-on', i >= 0);
        if (i >= 0) {
          art.setProject(PROJECTS[i]);
          if (!narrowNow) wash.style.transform = 'translate3d(0,' + (i * 100) + '%,0)';
        }
        syncTicker();
      }

      /* ------------------------------------------------------------ tick */
      function tick(dt, t) { art.paint(t); }
      function syncTicker() {
        var p = narrowNow ? PROJECTS[0] : PROJECTS[active];
        var want = (narrowNow || active >= 0) && isAnimated(p);
        if (want && !ticking) { SE.ticker.add(tick); ticking = true; }
        else if (!want && ticking) { SE.ticker.remove(tick); ticking = false; }
      }

      /* ----------------------------------------------------- interaction */
      /* 50ms of dwell. Without it a diagonal sweep fires six wash moves and
         the band strobes down the list. */
      function intend(i) {
        window.clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(function () { setActive(i); }, 50);
      }

      if (env.fine) {
        rows.addEventListener('pointerover', function (e) {
          if (narrowNow) return;
          var b = e.target.closest('[data-row]');
          if (b) {
            intend(parseInt(b.getAttribute('data-row'), 10));
            SE.cursor && SE.cursor.on(true);
            SE.cursor && SE.cursor.label(PROJECTS[parseInt(b.getAttribute('data-row'), 10)].name);
          }
        });
        list.addEventListener('pointerleave', function () {
          if (narrowNow) return;
          window.clearTimeout(hoverTimer);
          setActive(-1);
          SE.cursor && SE.cursor.on(false);
          SE.cursor && SE.cursor.label('');
        });
      }

      rows.addEventListener('focusin', function (e) {
        if (narrowNow) return;
        var b = e.target.closest('[data-row]');
        if (b) {
          window.clearTimeout(hoverTimer);
          setActive(parseInt(b.getAttribute('data-row'), 10));
        }
      });
      rows.addEventListener('focusout', function (e) {
        if (narrowNow) return;
        if (!rows.contains(e.relatedTarget)) setActive(-1);
      });

      rows.addEventListener('click', function (e) {
        var b = e.target.closest('[data-row]');
        if (!b) return;
        if (isSection) ctx.onSeeMore();
      });

      function onKey(e) {
        if (!rows.contains(document.activeElement)) return;
        var next = null;
        if (e.key === 'ArrowDown') next = active + 1;
        else if (e.key === 'ArrowUp') next = active - 1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = PROJECTS.length - 1;
        if (next == null) return;
        e.preventDefault();
        next = M.clamp(next, 0, PROJECTS.length - 1);
        rowEls[next].focus({ preventScroll: true });
      }
      root.addEventListener('keydown', onKey);

      /* ---------------------------------------------------------- entry */
      var enterIO = null;
      if (env.reduced) {
        sec.classList.add('is-in');
      } else {
        enterIO = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) return;
          sec.classList.add('is-in');
          enterIO.disconnect();
          enterIO = null;
        }, { threshold: 0.2 });
        enterIO.observe(sec);
      }

      return {
        destroy: function () {
          if (ticking) SE.ticker.remove(tick);
          window.clearTimeout(hoverTimer);
          if (enterIO) enterIO.disconnect();
          root.removeEventListener('keydown', onKey);
          narrow.destroy();
          art.destroy();
          SE.cursor && SE.cursor.on(false);
          SE.cursor && SE.cursor.label('');
          root.classList.remove('projects-roster', 'projects-selfscroll', 'is-narrow');
          root.innerHTML = '';
        }
      };
    }
  });

  /* ==========================================================================
     SECTION 05  -  RELAY
     --------------------------------------------------------------------------
     A stack of plates that hands itself over. The top plate holds for 3.6
     seconds, then lifts and goes to the back, and the next one is already
     where it needs to be.

     THE RULE THAT MAKES AUTO-ADVANCE ACCEPTABLE
     -------------------------------------------
     Moving content the reader did not ask for has to be stoppable, and the
     control has to be obvious rather than clever. So: an explicit pause
     control that is always visible, an automatic pause on hover and on focus
     anywhere in the section, and no auto-advance at all under reduced motion
     or while the section is off screen. WCAG 2.2 asks for the first two; the
     other two are what stops the section being rude.

     WHY THE HOLD IS A BAR AND NOT A DOT
     -----------------------------------
     A row of dots tells the reader how many there are. A draining bar tells
     them how long they have, which is the thing that actually reduces the
     anxiety of watching something advance without you.
     ======================================================================== */
  SE.register({
    area: AREA,
    variant: 'section',
    id: 'projects-section-relay',
    num: 5,
    name: 'Relay',
    kind: 'CSS 3D / timed stack',
    accent: '#4E9DE0',
    tagline: 'Each piece holds, then hands over',
    desc: 'A physical stack of six plates where the top one holds for a measured beat and then goes to the back. ' +
          'It pauses on hover, on focus, off screen, and whenever the reader says so.',
    interaction: 'Watch it, or take it: the two step controls and the arrow keys move the stack, and the pause control stops it.',
    hint: 'Holds, then hands over &middot; Pause any time',
    screens: 1,
    pageOf: 'projects-page-drift',

    /* Miniature: three stacked plates with the top one lifting away and the
       hold bar draining. Around 28 operations per frame. */
    preview: function (ctx, w, h, t, heat) {
      var n = PROJECTS.length;
      var period = 2.6 - heat * 1.0;
      var phase = (t % period) / period;
      var i = Math.floor(t / period) % n;
      var lift = M.clamp((phase - 0.74) / 0.26, 0, 1);
      var cw = w * 0.52, ch = h * 0.50;
      var cx = w * 0.5, cy = h * 0.44;

      for (var k = 2; k >= 0; k--) {
        var p = PROJECTS[(i + k) % n];
        var off = k * (h * 0.055);
        var sc = 1 - k * 0.07;
        var x = cx - (cw * sc) / 2;
        var y = cy - (ch * sc) / 2 + off - (k === 0 ? lift * h * 0.30 : 0);
        ctx.globalAlpha = k === 0 ? 1 - lift * 0.9 : 1;
        ctx.fillStyle = 'rgba(11,11,15,0.96)';
        ctx.fillRect(x, y, cw * sc, ch * sc);
        ctx.fillStyle = 'rgba(' + p.rgb.join(',') + ',0.16)';
        ctx.fillRect(x, y, cw * sc, ch * sc);
        ctx.strokeStyle = 'rgba(' + p.rgb.join(',') + ',' + (k === 0 ? 0.75 : 0.28) + ')';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cw * sc, ch * sc);
        ctx.globalAlpha = 1;
      }

      var bx = w * 0.24, bw = w * 0.52, by = h * 0.86;
      ctx.fillStyle = 'rgba(236,236,239,0.12)';
      ctx.fillRect(bx, by, bw, 2);
      ctx.fillStyle = '#4E9DE0';
      ctx.fillRect(bx, by, bw * (1 - phase), 2);
    },

    spec: {
      subtitle: 'A stack of six plates where the top one holds for a beat and then goes to the back.',
      philosophy: [
        'A stack is the honest shape for a body of work: there is a top one, there are others under it, and you can feel how many.',
        'Auto-advance is only acceptable when it is genuinely stoppable. Pause is a visible control, not a hover trick, and the stack also stops on hover, on focus and off screen without being asked.',
        'The hold bar drains rather than filling. A reader watching something advance without them wants to know how long they have, not how far it has come.',
        'Handing over is a physical move: the top plate lifts, turns slightly and drops to the back of the stack. Nothing crossfades, because a stack that crossfades is a slideshow pretending to be a stack.'
      ],
      hierarchy: [
        '1. The top plate, 34rem wide at 4:3, square on with a contact shadow.',
        '2. The name and outcome beside it, clamp(2rem, 4vw, 3.25rem) and 1rem.',
        '3. The four plates behind it, offset 34px down, 60px back and 3% smaller per step, which nets out to about 18px of visible peek each.',
        '4. The hold bar and the pause control.'
      ],
      structure: [
        'section, ordinary height, block padding clamp(4rem, 12vh, 8rem). No sticky, no pin, no rail.',
        'div.grid: text left at 1fr, stack right at 34rem, collapsing to one column below 900px.',
        'div.stack with perspective 1200px, holding six plate elements whose transforms are written from one integer position.',
        'div.bar: a 1px rule with a draining fill, transform scaleX only.',
        'div.controls: previous, pause and next. Three real buttons, always visible, never revealed on hover.',
        'The See more control sits under the text column.'
      ],
      interaction: [
        'Hold: 3.6 seconds per plate. Long enough to read a name and an outcome sentence and short enough that six plates take under 22 seconds.',
        'Hand-over: 620ms. The top plate goes to translate3d(0,-42%,0) rotateX(16deg) scale(0.94) with opacity 0, then reappears at the back of the stack. The plates behind step forward at the same time.',
        'Pause: an explicit toggle with aria-pressed, always visible. Pausing stops the timer where it is; resuming continues from there rather than restarting the beat.',
        'Automatic pause on pointerenter anywhere in the section, on focusin anywhere in the section, and whenever the section is not intersecting the viewport. All three resume when the condition clears, except an explicit pause, which only the reader can undo.',
        'Step controls and ArrowLeft and ArrowRight advance or reverse by one and reset the hold. Stepping does not cancel an explicit pause.',
        'Clicking the top plate opens its case sheet. There is a 6px movement threshold, so a swipe on a touch screen steps rather than opening.',
        'Under prefers-reduced-motion nothing advances by itself at all: the stack is a static composition and the two step controls are the only way through it.'
      ],
      choreography: [
        { n: 'Hand-over', d: 'Outgoing plate: translate3d(0,-42%,0) rotateX(16deg) scale(0.94) with opacity 1 to 0 over 620ms cubic-bezier(0.23, 1, 0.32, 1). It then jumps to the back of the stack with no transition while it is invisible, which is why the stack never runs out.' },
        { n: 'Stack step', d: 'Each remaining plate goes from depth d to d - 1 over 620ms on the same curve: translate3d(0, d * 34px, -d * 60px) scale(1 - d * 0.03) and opacity clamp(1 - d * 0.22, 0, 1). Perspective is 1200px and transform-origin is the centre, so the three shrink terms net out to roughly 18px of visible peek per plate.' },
        { n: 'Hold bar', d: 'transform: scaleX(1 - elapsed / 3600ms) with transform-origin left, written per frame with no transition, because it is a clock and any smoothing would make it lie.' },
        { n: 'Text swap', d: 'Name and outcome: opacity 0 to 1 with translate3d(0,14px,0) to 0 over 420ms cubic-bezier(0.23, 1, 0.32, 1), delayed 120ms so the plate is already moving. A transition, not keyframes, so a reader stepping quickly retargets instead of restarting.' },
        { n: 'Pause', d: 'The pause control swaps its glyph and its aria-pressed value with a 140ms colour transition. The bar simply stops; it does not fade, because a stopped clock should look stopped.' }
      ],
      scroll: [
        'This section consumes no vertical scroll and pins nothing.',
        'An IntersectionObserver at 25% visibility both starts the relay and stops it. A carousel that runs while nobody is looking is a carousel that burns battery for nobody.',
        'No scroll listener anywhere.',
        'Build the See more route as well: /work rendering the full-page Drift counterpart, where the stack becomes a plane the reader controls entirely.'
      ],
      hover: [
        'Gated behind @media (hover: hover) and (pointer: fine) for the visual states; the automatic pause on pointerenter is not gated, because a coarse pointer entering the section is also a reader who wants it to stop.',
        'Hovering anywhere in the section pauses the relay and the bar stops where it is.',
        'The top plate takes a cursor label reading Open case.',
        'The step and pause controls take the standard icon button hover.'
      ],
      click: [
        'Top plate: opens its case sheet.',
        'Previous and next: step the stack and reset the hold.',
        'Pause: toggles the explicit pause. It is the only pause the reader has to undo themselves.',
        'See more: opens the page-level Drift counterpart.'
      ],
      responsive: {
        desktop: 'Text left at 1fr, stack right at 34rem and 4:3, perspective 1200px, controls under the text.',
        tablet: 'Stack at 28rem, perspective 1000px, the depth offset reduced to 26px per step so the stack stays inside its column.',
        mobile: 'A different composition, not a smaller one. The stack moves above the text and spans the full width at 3:2, the depth offset drops to 22px, and the controls become a full-width row of three 48px buttons under the outcome. A horizontal swipe on the stack steps it, with the same 9px touch threshold, so the phone gesture and the desktop buttons do the same thing.'
      },
      a11y: [
        'The pause control is a real toggle button with aria-pressed and a text label, visible at all times. This is the WCAG 2.2 requirement for moving content and it is not satisfied by a hover-revealed control.',
        'The relay stops on focusin anywhere in the section, so a keyboard reader is never racing the timer.',
        'A polite live region announces each hand-over with the project name, discipline and year.',
        'The stack is aria-hidden and mirrored by a visually hidden list of all six projects; focusing an entry brings that plate to the top and pauses.',
        'Arrow keys and the two step controls are the complete non-timer route through all six.',
        'prefers-reduced-motion: no auto-advance at all, no hand-over animation, and the hold bar is hidden because there is no longer a clock to show.'
      ],
      perf: [
        'Six plate canvases, painted once at mount. Only the top one repaints per frame, and only when its painter uses time.',
        'The frame loop runs only while the relay is unpaused and the section is on screen; every pause condition unsubscribes it.',
        'Per frame: one transform per plate and one scaleX on the bar. No layout property is touched.',
        'will-change: transform on the six plates, removed when the section leaves the viewport.',
        'Backing store capped at devicePixelRatio 2, and 1.75 below 768px.'
      ],
      packages: pkgs([
        { p: 'No carousel library', w: 'The whole model is one integer, one elapsed time and six transforms. Every carousel library would also bring its own idea of pause semantics, which is the part this concept is being careful about.' }
      ]),
      architecture: [
        { f: 'components/sections/WorkRelay.tsx', r: '"use client". Owns the position, the elapsed time and every pause condition. All six plates and their text are rendered from the project array.' },
        { f: 'components/sections/useRelayClock.ts', r: 'The timer on its own: elapsed, paused-by-user, paused-by-hover, paused-by-focus, paused-by-visibility. Four independent reasons, one derived running flag.' },
        PLATE_NOTE,
        { f: 'app/work/page.tsx', r: 'REQUIRED. The See more destination, rendering the full-page Drift counterpart.' },
        { f: 'content/projects.ts', r: 'The typed project array.' }
      ],
      state: [
        'React state: the top index, and the four independent pause reasons. Keeping them separate matters: resuming from hover must not undo an explicit pause.',
        'Refs, never state: elapsed time and the last frame timestamp. Both change sixty times a second.',
        'The running flag is derived from the four reasons, never stored, so there is exactly one place that can be wrong.',
        'Nothing is persisted. The relay starts at the top of the stack every visit.'
      ],
      typography: [
        'Name: Space Grotesk 500 at clamp(2rem, 4vw, 3.25rem), tracking -0.042em.',
        'Outcome: 1rem at 1.6 over 56ch.',
        'Counter, discipline and year: JetBrains Mono 500 with tabular figures, so the counter does not jitter as it counts.',
        'The heading is a sentence and there is no kicker above it.'
      ],
      color: [
        'Ground --void, continuous with the neighbouring sections.',
        '--c-accent follows the top plate, so the hold bar, the problem rule and the case button agree with what is on top.',
        'Plates behind the top one recede by opacity, never by a black overlay, so a plate three back is still its own hue.',
        'The contact shadow under the top plate is tinted with the project hue rather than pure black.'
      ],
      spacing: [
        'Stack column 34rem, plates at 4:3, 34px of depth offset per step and 60px of Z.',
        'Text column: 0.75rem meta to name, 1.5rem name to problem, 0.75rem problem to outcome, 2rem to the controls.',
        'The hold bar sits 1.5rem under the controls and spans the text column.'
      ],
      relationships: [
        'Depth in the stack encodes how far away a project is from being read next.',
        'The bar encodes remaining hold time, and it is the only thing on the page that encodes time.',
        'Plate hue encodes which project.',
        'The pause state encodes whether the reader has taken control, and it is deliberately sticky.'
      ],
      acceptance: [
        'The pause control is visible without hovering anything, and pressing it stops the relay for good until pressed again.',
        'Hovering the section pauses it; leaving resumes it, unless the reader paused it explicitly.',
        'Scrolling the section off screen stops the frame loop entirely.',
        'The two step controls and the arrow keys reach all six plates with the timer paused.',
        'The stack never runs out: the sixth plate hands over to the first.',
        'With reduced motion on, nothing advances by itself, the hold bar is gone, and the stack is a static composition.',
        'At 375px the stack is above the text and a horizontal swipe steps it.'
      ]
    },

    mount: function (root, ctx) {
      var env = SE.env;
      var isSection = ctx.mode === 'section';
      var HOLD = 3.6;                       /* seconds per plate */
      root.classList.add('projects-relay');
      if (!isSection) scrollerFor(root, ctx);

      /* ------------------------------------------------------------ DOM */
      var sec = SE.el('section', 'projects-relay__sec');
      root.appendChild(sec);

      var head = SE.el('header', 'projects-relay__head');
      head.innerHTML =
        '<h2 class="projects-relay__title">Six plates, one at a time, on a measured beat</h2>' +
        '<p class="projects-relay__lede">The top one holds while you read it and then goes to the back. It stops ' +
        'the moment you touch the section, and there is a pause control that never hides.</p>';
      sec.appendChild(head);

      var grid = SE.el('div', 'projects-relay__grid');
      sec.appendChild(grid);

      var text = SE.el('div', 'projects-relay__text');
      text.innerHTML =
        '<p class="projects-relay__meta t-num"><span data-num></span><i></i><span data-disc></span><span data-year></span></p>' +
        '<h3 class="projects-relay__name" data-name></h3>' +
        '<p class="projects-relay__problem" data-problem></p>' +
        '<p class="projects-relay__outcome" data-outcome></p>' +
        '<div class="projects-relay__controls">' +
          '<button class="iconbtn" type="button" data-step="-1" aria-label="Previous project">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
          '<button class="btn projects-relay__pause" type="button" data-pause aria-pressed="false">' +
            '<span data-pausetext>Pause</span>' +
          '</button>' +
          '<button class="iconbtn" type="button" data-step="1" aria-label="Next project">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
          '<span class="projects-relay__count t-num"><b data-cur>01</b> / ' + TOTAL + '</span>' +
        '</div>' +
        '<div class="projects-relay__bar"><i></i></div>';
      grid.appendChild(text);

      var stack = SE.el('div', 'projects-relay__stack');
      stack.setAttribute('aria-hidden', 'true');
      var plates = PROJECTS.map(function (p) {
        var el = SE.el('div', 'projects-relay__plate');
        el.style.setProperty('--c-accent', p.accent);
        stack.appendChild(el);
        return { el: el, art: mountArt(el, p, { zoom: 440 }), p: p };
      });
      grid.appendChild(stack);

      var foot = SE.el('div', 'projects-relay__foot');
      text.appendChild(foot);
      if (isSection) {
        var more = seeMoreNow('Take the whole plane', ctx.onSeeMore);
        more.classList.add('projects-relay__more');
        foot.appendChild(more);
      }

      var live = SE.el('p', 'sr-only');
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      sec.appendChild(live);

      sec.appendChild(SE.srList('Relay: six projects on a timed stack', srItems(), function (item) {
        pausedByFocus = true;
        goTo(item.p.index, item.p.index > top ? 1 : -1);
      }));

      var kase = makeCase(root);

      /* ---------------------------------------------------------- state */
      /* Four independent reasons to be stopped, and one derived running flag.
         Separate reasons matter: leaving the section with the pointer must not
         undo a pause the reader asked for. */
      var top = 0;
      var elapsed = 0;
      var pausedByUser = env.reduced;
      var pausedByHover = false;
      var pausedByFocus = false;
      var onScreen = false;
      var ticking = false;

      var out = {
        num: SE.$('[data-num]', text), disc: SE.$('[data-disc]', text), year: SE.$('[data-year]', text),
        name: SE.$('[data-name]', text), problem: SE.$('[data-problem]', text),
        outcome: SE.$('[data-outcome]', text), cur: SE.$('[data-cur]', text)
      };
      var bar = SE.$('.projects-relay__bar i', text);
      var pauseBtn = SE.$('[data-pause]', text);
      var pauseText = SE.$('[data-pausetext]', text);

      function running() {
        return onScreen && !pausedByUser && !pausedByHover && !pausedByFocus && !env.reduced;
      }

      /* `snap` writes the transform with the transition suppressed for exactly
         one frame. It is what stops a plate that has just wrapped from the
         front of the stack to the back from animating backwards through every
         plate in between. */
      function place(pl, d, snap) {
        if (snap) pl.el.classList.add('is-snap');
        pl.el.classList.toggle('is-top', d === 0);
        pl.el.style.visibility = d < 5 ? '' : 'hidden';
        /* 34px down and 60px back per step, with only 3% of scale on top.
           The three shrink terms (translate, perspective and scale) have to
           net out to a visible peek, or the stack reads as one plate. */
        pl.el.style.transform =
          'translate3d(0,' + (d * 34) + 'px,' + (-d * 60) + 'px) scale(' + (1 - d * 0.03).toFixed(3) + ')';
        pl.el.style.opacity = M.clamp(1 - d * 0.22, 0, 1).toFixed(3);
        pl.el.style.zIndex = String(100 - d);
        if (snap) { void pl.el.offsetWidth; pl.el.classList.remove('is-snap'); }
      }

      function layout(snapIdx) {
        var n = plates.length;
        for (var i = 0; i < n; i++) {
          /* a plate mid-handover owns its own transform until it lands */
          if (plates[i].leaving) continue;
          place(plates[i], (i - top + n) % n, snapIdx === i);
        }
      }

      function paintText() {
        var p = PROJECTS[top];
        out.num.textContent = p.num;
        out.disc.textContent = p.discipline;
        out.year.textContent = String(p.year);
        out.name.textContent = p.name;
        out.problem.textContent = p.problem;
        out.outcome.textContent = p.outcome;
        out.cur.textContent = p.num;
        sec.style.setProperty('--c-accent', p.accent);
        live.textContent = p.name + ', ' + p.discipline + ', ' + p.year + '. ' + p.outcome;
        if (!env.reduced) {
          text.classList.remove('is-in');
          void text.offsetWidth;
        }
        text.classList.add('is-in');
      }

      function handOver(pl) {
        /* The outgoing plate lifts, turns and fades. Written inline, because
           an inline transform is what `place` uses and the two must not fight
           over which one wins. */
        pl.leaving = true;
        pl.el.style.transform = 'translate3d(0,-42%,0) rotateX(16deg) scale(0.94)';
        pl.el.style.opacity = '0';
        window.clearTimeout(pl.timer);
        pl.timer = window.setTimeout(function () {
          pl.leaving = false;
          var n = plates.length;
          place(pl, (plates.indexOf(pl) - top + n) % n, true);
        }, 620);
      }

      function goTo(i, dir) {
        var prev = top;
        var n = plates.length;
        top = ((i % n) + n) % n;
        elapsed = 0;
        if (!env.reduced && prev !== top) {
          if (dir === 1) {
            handOver(plates[prev]);
            layout();
          } else {
            /* stepping back: the arriving plate was at the very back, so it
               is snapped to the front rather than flown through the stack */
            layout(top);
          }
        } else {
          layout();
        }
        paintText();
        syncTicker();
      }
      function step(d) { goTo(top + d, d > 0 ? 1 : -1); }

      /* ------------------------------------------------------------ tick */
      function tick(dt, t) {
        if (running()) {
          elapsed += dt;
          if (elapsed >= HOLD) { step(1); }
        }
        bar.style.transform = 'scaleX(' + M.clamp(1 - elapsed / HOLD, 0, 1).toFixed(4) + ')';
        if (plates[top]) plates[top].art.paint(t);
      }

      function syncTicker() {
        /* Keep painting while an animated plate is on top even when the clock
           is paused, but stop entirely when the section is off screen. */
        var want = onScreen && !env.reduced && (running() || isAnimated(PROJECTS[top]));
        if (want && !ticking) { SE.ticker.add(tick); ticking = true; }
        else if (!want && ticking) { SE.ticker.remove(tick); ticking = false; }
        sec.classList.toggle('is-paused', !running());
      }

      /* --------------------------------------------------------- controls */
      function setUserPause(v) {
        pausedByUser = v;
        pauseBtn.setAttribute('aria-pressed', String(v));
        pauseText.textContent = v ? 'Resume' : 'Pause';
        syncTicker();
      }

      text.addEventListener('click', function (e) {
        var s = e.target.closest('[data-step]');
        if (s) { step(parseInt(s.getAttribute('data-step'), 10)); return; }
        if (e.target.closest('[data-pause]')) setUserPause(!pausedByUser);
      });

      /* Not gated behind a hover media query: a coarse pointer arriving in the
         section is also a reader who wants it to stop. */
      sec.addEventListener('pointerenter', function () { pausedByHover = true; syncTicker(); });
      sec.addEventListener('pointerleave', function () { pausedByHover = false; syncTicker(); });
      sec.addEventListener('focusin', function () { pausedByFocus = true; syncTicker(); });
      sec.addEventListener('focusout', function (e) {
        if (!sec.contains(e.relatedTarget)) { pausedByFocus = false; syncTicker(); }
      });

      /* --------------------------------------------------------- gestures */
      var dragging = false, moved = false, startX = 0;
      function onDown(e) {
        dragging = true; moved = false;
        startX = e.clientX;
      }
      function onMove(e) {
        if (!dragging) return;
        if (!moved && Math.abs(e.clientX - startX) > slop()) moved = true;
      }
      function onUp(e) {
        if (!dragging) return;
        dragging = false;
        if (moved) { step(e.clientX < startX ? 1 : -1); return; }
        kase.show(PROJECTS[top], null);
      }
      function onCancel() { dragging = false; }
      stack.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);

      if (env.fine) {
        stack.addEventListener('pointerenter', function () {
          SE.cursor && SE.cursor.on(true);
          SE.cursor && SE.cursor.label('Open case');
        });
        stack.addEventListener('pointerleave', function () {
          SE.cursor && SE.cursor.on(false);
          SE.cursor && SE.cursor.label('');
        });
      }

      function onKey(e) {
        if (kase.isOpen()) return;
        if (!sec.contains(document.activeElement)) return;
        if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
      }
      root.addEventListener('keydown', onKey);

      /* ------------------------------------------------------- visibility */
      var view = inView(sec, function (on) {
        onScreen = on;
        sec.classList.toggle('is-live', on);
        syncTicker();
      }, '0px 0px -20% 0px');

      /* ---------------------------------------------------------- entry */
      var enterIO = null;
      if (env.reduced) {
        sec.classList.add('is-in');
      } else {
        enterIO = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) return;
          sec.classList.add('is-in');
          enterIO.disconnect();
          enterIO = null;
        }, { threshold: 0.25 });
        enterIO.observe(sec);
      }

      /* ------------------------------------------------------------ boot */
      if (env.reduced) {
        pauseText.textContent = 'Resume';
        pauseBtn.setAttribute('aria-pressed', 'true');
        plates.forEach(function (pl) { pl.art.paint(3.2); });
      }
      layout();
      paintText();
      bar.style.transform = 'scaleX(1)';

      return {
        destroy: function () {
          if (ticking) SE.ticker.remove(tick);
          if (enterIO) enterIO.disconnect();
          view.destroy();
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onCancel);
          root.removeEventListener('keydown', onKey);
          plates.forEach(function (pl) { window.clearTimeout(pl.timer); pl.art.destroy(); });
          kase.destroy();
          SE.cursor && SE.cursor.on(false);
          SE.cursor && SE.cursor.label('');
          root.classList.remove('projects-relay', 'projects-selfscroll');
          root.innerHTML = '';
        }
      };
    }
  });

})(window.SE = window.SE || {});

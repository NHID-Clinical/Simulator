/* =====================================================================
   NHID TERMINAL · Clinical Trust Evaluation Console — presentation layer

   Two jobs, both presentational:

   1. Retarget the Tailwind Play CDN palette so the thousands of utility
      classes already in the markup resolve to the terminal palette. This
      is why the redesign needs almost no HTML edits — `text-cyan-300`
      still means "accent text", it just resolves to phosphor now.
      Must run synchronously, immediately after the Tailwind CDN script.

   2. Inject the shared console header (policy version, evaluation mode,
      session ID, operator, timestamp) so every simulator page opens with
      the same instrument identification block.

   No scoring, navigation, storage schema, or module logic is touched.
   Session ID lives in sessionStorage under its own key; the operator
   field only *reads* the existing `nhidRole` value.
   ===================================================================== */
(function () {
  'use strict';

  /* -----------------------------------------------------------------
     1. PALETTE REMAP
     cyan   → phosphor green (system accent, links, primary action)
     emerald→ phosphor green (verified / pass)
     amber  → warning phosphor
     slate  → console surfaces
     white  → warm off-white (never pure white)
  ----------------------------------------------------------------- */
  var PHOSPHOR = {
    50: '#EAFEF2', 100: '#C9FBDF', 200: '#8DF7BE', 300: '#56F09A', 400: '#4CE291',
    500: '#38C87A', 600: '#1F4634', 700: '#183828', 800: '#122B1F', 900: '#0E2018', 950: '#0A1710'
  };

  if (typeof window.tailwind !== 'undefined') {
    window.tailwind.config = {
      theme: {
        extend: {
          colors: {
            white: '#E8E0D0',
            cyan: PHOSPHOR,
            emerald: PHOSPHOR,
            teal: PHOSPHOR,
            green: PHOSPHOR,
            amber: {
              50: '#FFF6E5', 100: '#FFE9C2', 200: '#FFD68A', 300: '#FFC24D', 400: '#FFC24D',
              500: '#FFB000', 600: '#D18F00', 700: '#9C6B00', 800: '#6B4A00', 900: '#3D2A00', 950: '#241900'
            },
            red: {
              50: '#FDEEEE', 100: '#F9D5D5', 200: '#F5B4B4', 300: '#F06A6A', 400: '#E05252',
              500: '#CC3B3B', 600: '#A62F2F', 700: '#7C2424', 800: '#511818', 900: '#2E0F0F', 950: '#1A0909'
            },
            sky: {
              50: '#EFF8FF', 100: '#D6EDFF', 200: '#A8D9FF', 300: '#72C6FF', 400: '#5AB4F5',
              500: '#3F9BDD', 600: '#2A78AF', 700: '#1E5880', 800: '#153D59', 900: '#0F2A3D', 950: '#0A1B27'
            },
            slate: {
              50: '#F2F4F5', 100: '#DCE1E5', 200: '#C2C9CF', 300: '#A7B1BA', 400: '#8A949D',
              500: '#6B7681', 600: '#4C5762', 700: '#34414D', 800: '#17232F', 900: '#111923', 950: '#0B1117'
            }
          }
        }
      }
    };
  }

  /* -----------------------------------------------------------------
     2. CONSOLE HEADER
  ----------------------------------------------------------------- */
  var MODES = {
    'index.html': 'OVERVIEW',
    'zero-latency-module0.html': 'OBSERVATION',
    'zero-latency-module1-v2.html': 'LIVE EVALUATION',
    'zero-latency-module2.html': 'CREDENTIAL AUDIT',
    'zero-latency-module3.html': 'FORENSIC REVIEW',
    'zero-latency-module4.html': 'DEPLOYMENT CONTROL',
    'zero-latency-dashboard.html': 'OPERATIONS',
    'simulator-record.html': 'RECORD',
    'nhid-knowledge-base.html': 'REFERENCE'
  };

  var OPERATORS = {
    payer: 'PAYER OPS',
    provider: 'PROVIDER ORG',
    vendor: 'VOICE VENDOR',
    security: 'SECURITY / GRC'
  };

  var SESSION_KEY = 'nhidTerminalSession';

  function pageFile() {
    return location.pathname.split('/').pop() || 'index.html';
  }

  /* A per-tab evaluation session ID. sessionStorage keeps it out of the
     progress/game state that the modules own. */
  function sessionId() {
    var id;
    try { id = sessionStorage.getItem(SESSION_KEY); } catch (e) { id = null; }
    if (!id) {
      var hex = '';
      for (var i = 0; i < 6; i++) hex += '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
      id = 'CTE-' + hex;
      try { sessionStorage.setItem(SESSION_KEY, id); } catch (e) { /* private mode */ }
    }
    return id;
  }

  function operatorLabel() {
    var role = null;
    try { role = localStorage.getItem('nhidRole'); } catch (e) { role = null; }
    return (role && OPERATORS[role]) || 'UNASSIGNED';
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function stamp() {
    var d = new Date();
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) +
      ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z';
  }

  function field(label, value, attr) {
    return '<div><dt>' + label + '</dt><dd' + (attr ? ' ' + attr : '') + '>' + value + '</dd></div>';
  }

  function buildHeader() {
    var main = document.querySelector('main');
    if (!main || document.querySelector('.tm-console')) return;

    var wrap = document.createElement('div');
    wrap.className = 'tm-console';
    wrap.innerHTML =
      '<div class="tm-console__bar">' +
        '<div class="tm-console__id">' +
          '<span class="tm-console__mark">NHID Terminal</span>' +
          '<span class="tm-console__sub">Clinical Trust Evaluation Console</span>' +
        '</div>' +
        '<div class="tm-console__state">' +
          '<span class="hg-dot live" data-tone="green" aria-hidden="true"></span>' +
          '<span>System nominal</span>' +
        '</div>' +
      '</div>' +
      '<dl class="tm-console__meta">' +
        field('Policy', 'NHID-CLINICAL v1.3 / AUTH v2') +
        field('Mode', MODES[pageFile()] || 'CONSOLE', 'data-tm-mode') +
        field('Session', sessionId()) +
        field('Operator', operatorLabel(), 'data-tm-operator') +
        field('Timestamp', stamp(), 'data-tm-clock') +
      '</dl>';

    main.insertBefore(wrap, main.firstChild);

    var clock = wrap.querySelector('[data-tm-clock]');
    setInterval(function () { clock.textContent = stamp(); }, 1000);

    /* The role picker on the landing page writes `nhidRole`; mirror it into
       the operator field so the header stays truthful without the picker
       needing to know the header exists. */
    var operatorCell = wrap.querySelector('[data-tm-operator]');
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-role]') : null;
      if (btn) setTimeout(function () { operatorCell.textContent = operatorLabel(); }, 0);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildHeader);
  } else {
    buildHeader();
  }
})();

/* =====================================================================
   Zero Latency · Hyper-Glass interaction layer — v2
   - Injects the fixed ambient layer (blueprint grid + glows).
   - Cursor-tracked specular glare on .hyper-glass (one rAF-throttled
     delegated pointer listener updating --mouse-x/--mouse-y).
   - Injects a shared module-flow stepper on flow pages so the whole
     experience reads as one system.
   - window.HG.runChecks(): staged control-check feedback (Module 4).
   ===================================================================== */
(function () {
  'use strict';

  var FLOW = [
    { file: 'zero-latency-module0.html', label: 'Module 0 · The Problem', id: 'module0' },
    { file: 'zero-latency-module1-v2.html', label: 'Module 1 · First 5 Seconds', id: 'module1' },
    { file: 'zero-latency-module2.html', label: 'Module 2 · Passport', id: 'module2' },
    { file: 'zero-latency-module3.html', label: 'Module 3 · Case Board', id: 'module3' },
    { file: 'zero-latency-module4.html', label: 'Module 4 · Deployment', id: 'module4' },
    { file: 'simulator-record.html', label: 'Record', id: null }
  ];

  function readProgress() {
    try { return JSON.parse(localStorage.getItem('zeroLatencyProgress') || '{}') || {}; }
    catch (e) { return {}; }
  }

  function injectStepper() {
    var file = (location.pathname.split('/').pop() || 'index.html');
    var currentIdx = -1;
    for (var i = 0; i < FLOW.length; i++) if (FLOW[i].file === file) currentIdx = i;
    if (currentIdx === -1) return; // not a flow page

    var progress = readProgress();
    var nav = document.createElement('nav');
    nav.className = 'hg-stepper';
    nav.setAttribute('aria-label', 'Simulator progress');
    FLOW.forEach(function (step, i) {
      if (i > 0) {
        var sep = document.createElement('span');
        sep.className = 'hg-step-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '›';
        nav.appendChild(sep);
      }
      var a = document.createElement('a');
      a.href = step.file;
      var done = step.id && progress[step.id] && progress[step.id].completed;
      a.className = 'hg-step' + (i === currentIdx ? ' current' : '') + (done ? ' done' : '');
      if (i === currentIdx) a.setAttribute('aria-current', 'step');
      a.innerHTML = '<span class="dot" aria-hidden="true"></span>' + step.label;
      nav.appendChild(a);
    });

    var main = document.querySelector('main');
    if (!main) return;
    var firstNav = main.querySelector('nav');
    if (firstNav && firstNav.nextSibling) main.insertBefore(nav, firstNav.nextSibling);
    else main.insertBefore(nav, main.firstChild);
  }

  /* Staged control checks: renders each line with a brief verifying
     state before resolving, then calls done(). Purposeful tension —
     respects prefers-reduced-motion by resolving instantly. */
  function runChecks(container, checks, done) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.innerHTML = '';
    var seq = document.createElement('div');
    seq.className = 'hg-checkseq';
    container.appendChild(seq);
    var i = 0;
    function next() {
      if (i >= checks.length) { if (done) done(); return; }
      var row = document.createElement('div');
      row.className = 'hg-check';
      row.innerHTML = '<span class="spin" aria-hidden="true"></span><span>' + checks[i] + '</span>';
      seq.appendChild(row);
      i += 1;
      if (reduce) { row.classList.add('ok'); next(); return; }
      setTimeout(function () { row.classList.add('ok'); setTimeout(next, 90); }, 260);
    }
    next();
  }

  function init() {
    var body = document.body;
    if (!body) return;
    body.classList.add('hg-body');

    if (!document.querySelector('.hg-ambient')) {
      var ambient = document.createElement('div');
      ambient.className = 'hg-ambient';
      ambient.setAttribute('aria-hidden', 'true');
      body.insertBefore(ambient, body.firstChild);
    }

    injectStepper();

    var ticking = false;
    var last = null;
    function paint() {
      ticking = false;
      if (!last) return;
      var el = last.target.closest ? last.target.closest('.hyper-glass') : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mouse-x', ((last.clientX - r.left) / r.width) * 100 + '%');
      el.style.setProperty('--mouse-y', ((last.clientY - r.top) / r.height) * 100 + '%');
      el.style.setProperty('--glow', '1');
    }
    document.addEventListener('pointermove', function (e) {
      last = e;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var el = e.target.closest ? e.target.closest('.hyper-glass') : null;
      if (el && !el.contains(e.relatedTarget)) el.style.setProperty('--glow', '0');
    }, { passive: true });
  }

  window.HG = { runChecks: runChecks };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* =====================================================================
   Zero Latency · Hyper-Glass interaction layer
   - Injects the fixed ambient-glow element into <body>.
   - Drives cursor-tracked specular glare on every .hyper-glass card via a
     single rAF-throttled, delegated pointer listener (--mouse-x/--mouse-y).
   ===================================================================== */
(function () {
  'use strict';

  function init() {
    var body = document.body;
    if (!body) return;

    // Ensure the navy background theme class is present.
    body.classList.add('hg-body');

    // Inject the ambient glow layer once.
    if (!document.querySelector('.hg-ambient')) {
      var ambient = document.createElement('div');
      ambient.className = 'hg-ambient';
      ambient.setAttribute('aria-hidden', 'true');
      body.insertBefore(ambient, body.firstChild);
    }

    // --- cursor-tracked glare (one delegated listener) ---
    var ticking = false;
    var last = null;

    function paint() {
      ticking = false;
      if (!last) return;
      var el = last.target.closest ? last.target.closest('.hyper-glass') : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      var x = ((last.clientX - r.left) / r.width) * 100;
      var y = ((last.clientY - r.top) / r.height) * 100;
      el.style.setProperty('--mouse-x', x + '%');
      el.style.setProperty('--mouse-y', y + '%');
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

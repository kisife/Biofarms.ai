/* ===================================================================
   biofarms.ai — Case Study interactions (vanilla, no dependencies)
   Scroll-reveal · count-up stats · (mobile nav uses inline onclick)
   =================================================================== */
(function () {
  var d = document, h = d.documentElement;
  h.classList.add('anim');

  function ready(fn){ d.readyState !== 'loading' ? fn() : d.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    /* ---------- Scroll reveal ---------- */
    var sel = '.section-header,.card,.result-card,.eco-item,.challenge-card,.client-banner,' +
              '.stat-item,.stat-card,.method-step,.methodology-step,.method-block,' +
              '.timeline-item,.citation-box,.academic-card,.cite-card,.dataset-tags,' +
              '.reveal,.gsap-reveal';
    [].slice.call(d.querySelectorAll(sel)).forEach(function (el) { el.classList.add('cs-rv'); });

    // stagger items inside grid/list groups
    ['.card-grid', '.stats-grid', '.grid-2', '.grid-3', '.method-steps', '.timeline'].forEach(function (g) {
      d.querySelectorAll(g).forEach(function (group) {
        [].slice.call(group.children).forEach(function (c, i) {
          if (c.classList) c.classList.add('cs-rv');
          c.style.transitionDelay = (i * 0.07) + 's';
        });
      });
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('cs-in'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      d.querySelectorAll('.cs-rv').forEach(function (el) { io.observe(el); });
    } else {
      d.querySelectorAll('.cs-rv').forEach(function (el) { el.classList.add('cs-in'); });
    }

    /* ---------- Count-up stat numbers ---------- */
    function fmt(n, dec) {
      var s = dec ? n.toFixed(dec) : Math.round(n).toString();
      var parts = s.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    function countUp(el) {
      var raw = el.getAttribute('data-target') || el.getAttribute('data-count');
      var target = parseFloat(raw);
      if (isNaN(target)) return;
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var suf = el.getAttribute('data-suffix') || '';
      var pre = el.getAttribute('data-prefix') || '';
      var dur = 1500, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + fmt(target * eased, dec) + suf;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = pre + fmt(target, dec) + suf;
      }
      requestAnimationFrame(step);
    }
    var counters = [].slice.call(d.querySelectorAll('[data-target],[data-count]'));
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(countUp);
    }
  });
})();

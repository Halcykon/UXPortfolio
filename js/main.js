/* Frank Teng — UX Portfolio · interaction layer (vanilla JS, no dependencies)
   Everything here is progressive enhancement: without JS the site is a
   fully readable static page. All motion respects prefers-reduced-motion. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------------------------------------------------------------- nav */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
      }
    });
  }

  /* --------------------------------------- header: transparent → solid */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ------------------------------------------------- reading progress */
  var prog = document.getElementById('read-progress');
  if (prog) {
    var onProg = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    onProg();
    window.addEventListener('scroll', onProg, { passive: true });
    window.addEventListener('resize', onProg, { passive: true });
  }

  /* ------------------------------------------------------- cursor dot */
  if (finePointer && !reduced) {
    var dot = document.createElement('div');
    dot.id = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    var shown = false;
    window.addEventListener('pointermove', function (e) {
      if (!shown) { dot.classList.add('on'); shown = true; }
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      dot.classList.toggle('big', !!e.target.closest('a, button, input[type="range"]'));
    });
  }

  /* -------------------------------------------------- scroll reveals */
  if (!reduced && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      '.dark-section .kick, .dark-section h2, .dark-section .lede,' +
      '.panel, .lab-card,' +
      '.case-section .kicker, .case-section h2, .case-section .prose,' +
      '.case-section .insight, .case-section figure, .case-section .fig-row,' +
      '.case-section .stat-list, .case-section .impact-groups, .case-section .learnings,' +
      '.case-section .ba-slider, .case-section .video-embed, .contact-cine > .wrap > *'
    );
    var i = 0;
    targets.forEach(function (el) {
      el.classList.add('rv');
      // small stagger for grid children rendered adjacently
      if (el.matches('.lab-card')) el.classList.add('d' + (i++ % 3 ? (i % 3) : 1));
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------- count-up */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var render = function (el, v, done) {
      var dec = parseInt(el.dataset.decimals || '0', 10);
      var txt = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
      el.textContent = (el.dataset.prefix || '') + txt + (el.dataset.suffix || '');
      if (done && el.dataset.after) el.textContent += el.dataset.after;
    };
    if (reduced || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { render(el, parseFloat(el.dataset.count), true); });
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          co.unobserve(el);
          var target = parseFloat(el.dataset.count);
          var start = null;
          var step = function (ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / 1300, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            render(el, target * eased, p === 1);
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* --------------------------------------------------- chapter rail */
  var railLinks = Array.prototype.slice.call(document.querySelectorAll('.case-rail a'));
  if (railLinks.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          railLinks.forEach(function (l) {
            l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id);
          });
        }
      });
    }, { rootMargin: '-25% 0px -60% 0px' });
    document.querySelectorAll('.case-section[id]').forEach(function (s) { so.observe(s); });
  }

  /* --------------------------------------------- before/after slider */
  document.querySelectorAll('.ba-slider').forEach(function (ba) {
    var range = ba.querySelector('input[type="range"]');
    if (!range) return;
    var set = function () { ba.style.setProperty('--x', range.value + '%'); };
    range.addEventListener('input', set);
    set();
  });

  /* ------------------------------------------- pull-quote assembly */
  if (!reduced && 'IntersectionObserver' in window) {
    document.querySelectorAll('.pull-quote').forEach(function (pq) {
      var p = pq.querySelector('p');
      if (!p || p.querySelector('*')) {
        // quotes with markup: reveal whole block instead
        pq.classList.add('rv');
        return;
      }
      var words = p.textContent.trim().split(/\s+/);
      p.textContent = '';
      words.forEach(function (w, idx) {
        var s = document.createElement('span');
        s.className = 'w';
        s.style.transitionDelay = Math.min(idx * 34, 1400) + 'ms';
        s.textContent = w;
        p.appendChild(s);
        p.appendChild(document.createTextNode(' '));
      });
      var qo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            pq.classList.add('in');
            qo.unobserve(pq);
          }
        });
      }, { threshold: 0.4 });
      qo.observe(pq);
    });
  }
})();

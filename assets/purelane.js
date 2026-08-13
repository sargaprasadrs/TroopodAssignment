(function () {
  /* Gate reveal hiding on OUR class so content is never invisible if this
     asset fails to load (Dawn's html.js is added unconditionally by Dawn). */
  document.documentElement.classList.add('pl-js');
  if (window.__purelaneLoaded) return;
  window.__purelaneLoaded = true;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveal-on-scroll: unobserve after reveal so theme-editor re-renders never retrigger. */
  function initReveals(scope) {
    var els = scope.querySelectorAll('.pl-rv:not(.pl-in)');
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add('pl-in');
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('pl-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  /* Hero stage: dot switching + autoplay with pause on hover / focus / out-of-view. */
  function initHero(scope) {
    scope.querySelectorAll('[data-hero]').forEach(function (hero) {
      var stage = hero.querySelector('.pl-hstage');
      if (!stage) return;
      var slides = Array.prototype.slice.call(stage.querySelectorAll('.pl-hslide'));
      if (!slides.length) return;
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.pl-hdot'));
      var live = hero.querySelector('.pl-sr-only[aria-live]');
      var interval = parseInt(hero.dataset.interval, 10) || 3800;
      var autoplay = hero.dataset.autoplay === 'true' && !reduced && slides.length > 1;
      var timer = null;
      var index = 0;

      function show(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle('pl-on', idx === index);
          slide.setAttribute('aria-hidden', idx === index ? 'false' : 'true');
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle('pl-on', idx === index);
          if (idx === index) dot.setAttribute('aria-current', 'true');
          else dot.removeAttribute('aria-current');
        });
        if (live) {
          var lbl = slides[index].querySelector('.pl-ptag__lbl');
          var val = slides[index].querySelector('.pl-ptag__val');
          live.textContent = (lbl ? lbl.textContent : '') + (val ? ' — ' + val.textContent : '');
        }
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }
      function start() {
        stop();
        if (!autoplay) return;
        timer = setInterval(function () { show(index + 1); }, interval);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { show(i); start(); });
      });

      if (autoplay) {
        stage.addEventListener('mouseenter', stop);
        stage.addEventListener('mouseleave', start);
        stage.addEventListener('focusin', stop);
        stage.addEventListener('focusout', start);
      }

      if ('IntersectionObserver' in window) {
        var vio = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) start();
              else stop();
            });
          },
          { threshold: 0.2 }
        );
        vio.observe(stage);
      }

      /* Subtle scroll fade + rise (no mousemove parallax - see build notes). */
      if (hero.dataset.scrollFade === 'true' && !reduced) {
        var onScroll = function () {
          var f = Math.min(window.scrollY / 700, 1);
          if (f > 0.02) hero.classList.add('pl-faded');
          else hero.classList.remove('pl-faded');
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      }

      show(0);
      if (autoplay) start();
    });
  }

  /* Combos rail: arrow-key scrolling for keyboard users. */
  function initRails(scope) {
    scope.querySelectorAll('[data-rail]').forEach(function (rail) {
      rail.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var first = rail.querySelector(':scope > *');
          var w = first ? first.getBoundingClientRect().width + 14 : 302;
          rail.scrollBy({ left: e.key === 'ArrowRight' ? w : -w, behavior: reduced ? 'auto' : 'smooth' });
        }
      });
    });
  }

  function init(scope) {
    scope = scope || document;
    initReveals(scope);
    initHero(scope);
    initRails(scope);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }

  /* Survive the theme editor: re-run against newly rendered/re-rendered sections. */
  document.addEventListener('shopify:section:load', function (e) {
    if (e.target && e.target.querySelector) init(e.target);
  });
  document.addEventListener('shopify:section:render', function (e) {
    if (e.target && e.target.querySelector) init(e.target);
  });
})();

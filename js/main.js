/* =========================================================
   LP EBOOK CAROL VENANCIO — comportamento e animações
   ========================================================= */
(function () {
  'use strict';

  // >>> Coloque aqui o link de checkout (Hotmart, Kiwify, Eduzz etc.) <<<
  var CHECKOUT_URL = '#';

  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');

  /* ---------- Checkout ---------- */
  document.querySelectorAll('[data-checkout]').forEach(function (a) {
    a.setAttribute('href', CHECKOUT_URL);
    if (CHECKOUT_URL !== '#') { a.setAttribute('rel', 'noopener'); }
  });

  /* ---------- Escalonamento (stagger) de listas ---------- */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    group.querySelectorAll(':scope > [data-reveal]').forEach(function (el, i) {
      el.style.setProperty('--d', (i * 90) + 'ms');
    });
  });

  /* ---------- Revelar ao rolar ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Barra de progresso, parallax e CTA fixo ---------- */
  var bar = document.querySelector('.progress span');
  var parallax = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var sticky = document.querySelector('[data-sticky]');
  var hero = document.getElementById('topo');
  var offer = document.getElementById('oferta');
  var ticking = false;

  function update() {
    var y = window.scrollY || window.pageYOffset;
    var max = doc.scrollHeight - window.innerHeight;
    if (bar && max > 0) { bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')'; }

    if (!reduce) {
      var vh = window.innerHeight;
      parallax.forEach(function (img) {
        var box = img.parentElement.getBoundingClientRect();
        if (box.bottom < -100 || box.top > vh + 100) { return; }
        var p = (box.top + box.height / 2 - vh / 2) / vh;   // -1 .. 1
        var t = Math.max(-1, Math.min(1, p)) * -22;          // deslocamento em px
        img.style.transform = 'translate3d(0,' + t.toFixed(1) + 'px,0) scale(1.12)';
      });
    }

    if (sticky && hero && offer) {
      var passedHero = hero.getBoundingClientRect().bottom < 0;
      var r = offer.getBoundingClientRect();
      var inOffer = r.top < window.innerHeight * 0.6 && r.bottom > 0;
      var on = passedHero && !inOffer;
      sticky.classList.toggle('is-on', on);
      sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
      sticky.tabIndex = on ? 0 : -1;
    }
    ticking = false;
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---------- Preço: contagem animada ---------- */
  var price = document.querySelector('[data-countup]');
  if (price && !reduce && 'IntersectionObserver' in window) {
    var target = parseFloat(price.getAttribute('data-countup'));
    var fmt = function (v) { return 'R$ ' + v.toFixed(2).replace('.', ','); };
    var pio = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) { return; }
      pio.disconnect();
      var start = null, dur = 1400;
      price.textContent = fmt(0);
      (function step(ts) {
        if (start === null) { start = ts; }
        var k = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - k, 3);
        price.textContent = fmt(target * eased);
        if (k < 1) { window.requestAnimationFrame(step); } else { price.textContent = fmt(target); }
      })(performance.now());
    }, { threshold: 0.6 });
    pio.observe(price);
  }

  /* ---------- FAQ (acordeão acessível) ---------- */
  var accs = document.querySelectorAll('.acc');
  function setOpen(acc, open) {
    acc.classList.toggle('is-open', open);
    acc.querySelector('.acc__btn').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  accs.forEach(function (acc) {
    var btn = acc.querySelector('.acc__btn');
    if (btn.getAttribute('aria-expanded') === 'true') { acc.classList.add('is-open'); }
    btn.addEventListener('click', function () {
      var willOpen = !acc.classList.contains('is-open');
      accs.forEach(function (o) { if (o !== acc) { setOpen(o, false); } });
      setOpen(acc, willOpen);
    });
  });

  /* ---------- Rolagem suave com foco para âncoras ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href');
    if (id.length < 2) { return; }
    a.addEventListener('click', function (ev) {
      var el = document.querySelector(id);
      if (!el) { return; }
      ev.preventDefault();
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });
})();

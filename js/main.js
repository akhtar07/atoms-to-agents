/* Site behaviour. No dependencies. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* mobile nav */
  var toggle = $('.nav-toggle'), links = $('.nav-links');
  if (toggle && links) toggle.addEventListener('click', function () { links.classList.toggle('open'); });

  /* active nav link */
  var here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a').forEach(function (a) {
    var h = a.getAttribute('href');
    if (h === here || (here.indexOf('chapter') === 0 && a.dataset.group === 'thesis')) a.classList.add('active');
  });

  /* back to top */
  var top = $('.totop');
  function onScroll() { if (top) top.classList.toggle('show', window.scrollY > 900); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (top) top.addEventListener('click', function () { scrollTo({ top: 0 }); });

  /* light fade-in */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else revealEls.forEach(function (el) { el.classList.add('in'); });

  /* numbers with data-count are written out as-is */
  $$('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10);
    el.textContent = (el.dataset.prefix || '') +
      end.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || '');
  });

  /* log blocks: <div class="term" data-script> with <script type="text/plain"> lines */
  function render(l) {
    var esc = l.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    if (/^\$ /.test(l)) return '<span class="pr">$</span> <span class="u">' + esc.slice(2) + '</span>';
    if (/^# /.test(l)) return '<span class="dim">' + esc.slice(2) + '</span>';
    if (/^\+ /.test(l)) return '<span class="ok">' + esc.slice(2) + '</span>';
    if (/^! /.test(l)) return '<span class="warn">' + esc.slice(2) + '</span>';
    if (/^x /.test(l)) return '<span class="bad">' + esc.slice(2) + '</span>';
    return esc || '&nbsp;';
  }
  $$('.term[data-script]').forEach(function (t) {
    var src = $('script[type="text/plain"]', t), body = $('.body', t);
    if (!src || !body) return;
    var lines = src.textContent.replace(/^\n+|\s+$/g, '').split('\n');
    body.innerHTML = lines.map(function (l) { return '<div>' + render(l) + '</div>'; }).join('');
  });

  /* tabs: <div class="tabs"><button data-tab="id"> + <div class="tabpanel" id="id"> */
  $$('.tabs').forEach(function (tabs) {
    var btns = $$('button', tabs);
    function select(b) {
      btns.forEach(function (x) {
        var on = x === b; x.setAttribute('aria-selected', on);
        var p = document.getElementById(x.dataset.tab); if (p) p.classList.toggle('on', on);
      });
      var p = document.getElementById(b.dataset.tab);
      if (p) $$('.reveal', p).forEach(function (el) { el.classList.add('in'); });
    }
    btns.forEach(function (b) { b.setAttribute('role', 'tab'); b.addEventListener('click', function () { select(b); }); });
    var first = btns.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0] || btns[0];
    if (first) select(first);
  });

  /* filters (publications / research): <div class="filters" data-target="#id"> */
  $$('.filters').forEach(function (f) {
    var target = $(f.dataset.target); if (!target) return;
    var items = $$('[data-cat]', target), btns = $$('button', f), q = $('input', f), cat = 'all';
    function apply() {
      var s = q ? q.value.trim().toLowerCase() : '';
      items.forEach(function (it) {
        var okc = cat === 'all' || it.dataset.cat.split(' ').indexOf(cat) >= 0;
        var oks = !s || it.textContent.toLowerCase().indexOf(s) >= 0;
        it.classList.toggle('hide', !(okc && oks));
        it.style.display = okc && oks ? '' : 'none';
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); cat = b.dataset.f; apply();
      });
    });
    if (q) q.addEventListener('input', apply);
  });

  /* in-page contents: highlight the current section */
  var toc = $('.toc');
  if (toc && 'IntersectionObserver' in window) {
    var tl = $$('a', toc), map = {};
    tl.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) { tl.forEach(function (a) { a.classList.remove('on'); }); map[e.target.id].classList.add('on'); }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
  }


  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* hero specimen: cycle EBSD states (undeformed, 10 %, fractured) */
  $$('.specimen').forEach(function (sp) {
    var imgs = $$('.plate img', sp), btns = $$('.states button', sp), i = 0, timer = null;
    if (!imgs.length) return;
    function show(k) {
      i = k; imgs.forEach(function (im, j) { im.classList.toggle('on', j === k); });
      btns.forEach(function (b, j) { b.classList.toggle('on', j === k); });
    }
    function auto() { if (!still) timer = setInterval(function () { show((i + 1) % imgs.length); }, 3200); }
    btns.forEach(function (b, j) { b.addEventListener('click', function () { clearInterval(timer); show(j); }); });
    show(0); auto();
  });

  /* scale journey: the step in view picks the figure on the sticky stage */
  $$('.journey').forEach(function (j) {
    var steps = $$('.step', j), frames = $$('.frames > *', j), marks = $$('.scale-bar span', j), bar = $('.scale-bar', j);
    function pick(k) {
      steps.forEach(function (s, n) { s.classList.toggle('on', n === k); });
      frames.forEach(function (f, n) { f.classList.toggle('on', n === k); });
      marks.forEach(function (m, n) { m.classList.toggle('on', n === k); });
      if (bar) { bar.style.setProperty('--p', ((k + 1) / steps.length * 100) + '%'); bar.style.setProperty('--ac', getComputedStyle(steps[k]).getPropertyValue('--ac')); }
      var v = frames[k] && frames[k].tagName === 'VIDEO' ? frames[k] : null;
      frames.forEach(function (f) { if (f.tagName === 'VIDEO' && f !== v) f.pause(); });
      if (v && !still) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    }
    if (!('IntersectionObserver' in window)) { pick(0); return; }
    var jo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) pick(steps.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { jo.observe(s); });
    pick(0);
  });

  /* videos: play only while visible, never with reduced motion */
  if ('IntersectionObserver' in window) {
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && !still) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      });
    }, { threshold: 0.25 });
    $$('video[data-auto]').forEach(function (v) { if (still) v.removeAttribute('autoplay'); vo.observe(v); });
  }

  /* click a figure to enlarge it */
  var lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = '<img alt="">';
  document.body.appendChild(lb);
  lb.addEventListener('click', function () { lb.classList.remove('open'); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });
  $$('figure img, .rfig img').forEach(function (img) {
    img.addEventListener('click', function () { $('img', lb).src = img.src; $('img', lb).alt = img.alt; lb.classList.add('open'); });
  });
})();

/* specimen lab: scroll position picks the strain state, buttons pick the map */
(function () {
  var lab = document.querySelector('.lab'); if (!lab) return;
  var track = lab.querySelector('.lab-track'), maps = lab.querySelector('.lab-maps');
  var imgs = Array.prototype.slice.call(maps.querySelectorAll('img'));
  var rail = Array.prototype.slice.call(lab.querySelectorAll('.lab-rail span'));
  var prog = lab.querySelector('.lab-prog'), dots = Array.prototype.slice.call(lab.querySelectorAll('.lab-chart .dy'));
  var data = JSON.parse(lab.querySelector('.lab-data').textContent);
  var out = {}; Array.prototype.forEach.call(lab.querySelectorAll('[data-k]'), function (el) { out[el.dataset.k] = el; });
  var mode = 'ipf', state = -1;
  function paint() {
    imgs.forEach(function (im) { im.classList.toggle('on', +im.dataset.s === state && im.dataset.m === mode); });
  }
  function set(k) {
    if (k === state) return; state = k; var d = data[k];
    ['t', 'e', 'et', 'ct'].forEach(function (key) {
      var el = out[key]; if (el.innerHTML !== d[key]) { el.innerHTML = d[key]; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
    });
    out.c.innerHTML = d.c;
    rail.forEach(function (r, n) { r.classList.toggle('on', n === k); r.classList.toggle('done', n < k); });
    dots.forEach(function (c) { c.classList.toggle('on', +c.dataset.t === (d.t === '143 K' ? 143 : 298)); });
    paint();
  }
  Array.prototype.forEach.call(lab.querySelectorAll('.lab-modes button'), function (b) {
    b.addEventListener('click', function () {
      mode = b.dataset.m;
      Array.prototype.forEach.call(lab.querySelectorAll('.lab-modes button'), function (x) { x.classList.toggle('on', x === b); });
      Array.prototype.forEach.call(lab.querySelectorAll('.lab-legend > div'), function (x) { x.classList.toggle('on', x.dataset.m === mode); });
      paint();
    });
  });
  rail.forEach(function (r, n) {
    r.style.cursor = 'pointer';
    r.addEventListener('click', function () {
      var top = track.getBoundingClientRect().top + scrollY, span = track.offsetHeight - innerHeight;
      scrollTo({ top: top + span * (n + 0.5) / data.length, behavior: 'smooth' });
    });
  });
  var ticking = false;
  function onScroll() {
    ticking = false;
    var r = track.getBoundingClientRect(), span = track.offsetHeight - innerHeight;
    var p = Math.min(1, Math.max(0, -r.top / span));
    if (prog) prog.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    set(Math.min(data.length - 1, Math.floor(p * data.length)));
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll); onScroll();
})();

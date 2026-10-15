/* From Atoms to Agents — site behaviour. No dependencies. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- mobile nav ---- */
  var toggle = $('.nav-toggle'), links = $('.nav-links');
  if (toggle && links) toggle.addEventListener('click', function () { links.classList.toggle('open'); });

  /* ---- active nav link ---- */
  var here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a').forEach(function (a) {
    var h = a.getAttribute('href');
    if (h === here || (here.indexOf('chapter') === 0 && a.dataset.group === 'thesis')) a.classList.add('active');
  });

  /* ---- nav shadow, progress bar, back-to-top, timeline beam ---- */
  var nav = $('.nav'), bar = $('#progress'), top = $('.totop'), beam = $('.timeline .beam'), tl = $('.timeline');
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 10);
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    if (top) top.classList.toggle('show', y > 900);
    if (beam && tl) {
      var r = tl.getBoundingClientRect(), p = (innerHeight * 0.6 - r.top) / r.height;
      beam.style.height = Math.max(0, Math.min(1, p)) * (r.height - 16) + 'px';
    }
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (top) top.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---- reveal on scroll ---- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else revealEls.forEach(function (el) { el.classList.add('in'); });

  /* ---- animated counters: <span data-count="1600" data-dec="0" data-suffix="+"> ---- */
  function fmt(v, dec) { return Number(v).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  function runCount(el) {
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10),
        pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + fmt(end, dec) + suf; return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = pre + fmt(end * e, dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { co.observe(c); });
  } else counters.forEach(runCount);

  /* ---- cursor spotlight on cards ---- */
  $$('.card, .tl-card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---- rotating word in hero ---- */
  var rot = $('.rotator');
  if (rot && !reduce) {
    var words = rot.dataset.words.split('|'), i = 0;
    setInterval(function () {
      rot.classList.add('out');
      setTimeout(function () { i = (i + 1) % words.length; rot.textContent = words[i]; rot.classList.remove('out'); }, 350);
    }, 2600);
  }

  /* ---- hero scale-stack: cycle highlight ---- */
  var lv = $$('.stack .lvl');
  if (lv.length && !reduce) {
    var li = 0; lv[0].classList.add('on');
    setInterval(function () { lv[li].classList.remove('on'); li = (li + 1) % lv.length; lv[li].classList.add('on'); }, 1800);
  }

  /* ---- tabs: <div class="tabs" data-tabs="grp"><button data-tab="id"> + <div class="tabpanel" id="id"> ---- */
  $$('.tabs').forEach(function (tabs) {
    var btns = $$('button', tabs);
    function select(b) {
      btns.forEach(function (x) {
        var on = x === b; x.setAttribute('aria-selected', on);
        var p = document.getElementById(x.dataset.tab); if (p) p.classList.toggle('on', on);
      });
      var p = document.getElementById(b.dataset.tab);
      if (p) $$('.reveal', p).forEach(function (el) { el.classList.add('in'); });
      if (p) $$('.term[data-script]', p).forEach(typeTerm);
    }
    btns.forEach(function (b) { b.setAttribute('role', 'tab'); b.addEventListener('click', function () { select(b); }); });
    var first = btns.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0] || btns[0];
    if (first) select(first);
  });

  /* ---- typing terminal: <div class="term" data-script> with <script type="text/plain"> lines ---- */
  function typeTerm(t) {
    if (t.dataset.done) return; t.dataset.done = 1;
    var src = $('script[type="text/plain"]', t), body = $('.body', t);
    if (!src || !body) return;
    var lines = src.textContent.replace(/^\n+|\s+$/g, '').split('\n');
    body.innerHTML = '';
    if (reduce) { body.innerHTML = lines.map(render).join('<br>'); return; }
    var n = 0, cur = document.createElement('span'); cur.className = 'cursor';
    function render(l) {
      // "$ cmd" -> prompt; "# x" -> dim; "+ x" -> ok; "! x" -> warn; "x x" -> bad
      var esc = l.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      if (/^\$ /.test(l)) return '<span class="pr">$</span> <span class="u">' + esc.slice(2) + '</span>';
      if (/^# /.test(l)) return '<span class="dim">' + esc.slice(2) + '</span>';
      if (/^\+ /.test(l)) return '<span class="ok">' + esc.slice(2) + '</span>';
      if (/^! /.test(l)) return '<span class="warn">' + esc.slice(2) + '</span>';
      if (/^x /.test(l)) return '<span class="bad">' + esc.slice(2) + '</span>';
      return esc;
    }
    function next() {
      if (n >= lines.length) { body.appendChild(cur); return; }
      var l = lines[n++], line = document.createElement('div');
      body.appendChild(line);
      if (/^\$ /.test(l)) {
        var k = 2, txt = l.slice(2);
        line.innerHTML = '<span class="pr">$</span> <span class="u"></span>';
        var u = $('.u', line); line.appendChild(cur);
        (function typ() {
          if (k - 2 < txt.length) { u.textContent = txt.slice(0, k - 1); k++; setTimeout(typ, 22); }
          else { u.textContent = txt; setTimeout(next, 380); }
        })();
      } else { line.innerHTML = render(l) || '&nbsp;'; setTimeout(next, 160); }
    }
    next();
  }
  var terms = $$('.term[data-script]');
  if ('IntersectionObserver' in window) {
    var to = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && e.target.offsetParent !== null) { typeTerm(e.target); to.unobserve(e.target); } });
    }, { threshold: 0.3 });
    terms.forEach(function (t) { to.observe(t); });
  } else terms.forEach(typeTerm);

  /* ---- filters (publications / research): <div class="filters" data-target="#id"> ---- */
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

  /* ---- in-page TOC scrollspy ---- */
  var toc = $('.toc');
  if (toc && 'IntersectionObserver' in window) {
    var tl2 = $$('a', toc), map = {};
    tl2.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) { tl2.forEach(function (a) { a.classList.remove('on'); }); map[e.target.id].classList.add('on'); }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
  }

  /* ---- figure lightbox ---- */
  var lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = '<img alt="">';
  document.body.appendChild(lb);
  lb.addEventListener('click', function () { lb.classList.remove('open'); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });
  $$('figure img').forEach(function (img) {
    img.addEventListener('click', function () { $('img', lb).src = img.src; $('img', lb).alt = img.alt; lb.classList.add('open'); });
  });

  /* ---- legacy floating atoms (chapter heroes) ---- */
  var atoms = $('.atoms');
  if (atoms && !reduce) {
    for (var a = 0; a < 16; a++) {
      var s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 8) + 's';
      atoms.appendChild(s);
    }
  }

  /* ---- hero canvas: a lattice of atoms that rewires itself into an agent network ---- */
  var cv = $('#hero-canvas');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(2, devicePixelRatio || 1), pts = [], mouse = { x: -1e4, y: -1e4 };
    var COLS = ['45,212,191', '129,140,248', '139,92,246', '56,189,248', '245,165,36'];
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(110, Math.max(40, W * H / 14000)));
      pts = [];
      // hexagonal-ish lattice positions (home) jittered; each atom drifts away and back
      var cols = Math.ceil(Math.sqrt(n * W / H)), rows = Math.ceil(n / cols), dx = W / cols, dy = H / rows;
      for (var r2 = 0; r2 < rows; r2++) for (var c = 0; c < cols; c++) {
        var hx = (c + 0.5 + (r2 % 2 ? 0.25 : -0.25)) * dx, hy = (r2 + 0.5) * dy;
        pts.push({ hx: hx, hy: hy, x: hx, y: hy, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
          r: 1.2 + Math.random() * 1.8, c: COLS[(Math.random() * COLS.length) | 0], ph: Math.random() * 6.28 });
      }
    }
    var t = 0;
    function frame() {
      t += 0.004;
      var lattice = (Math.sin(t) + 1) / 2;  // 1 → ordered crystal, 0 → free agent network
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        p.x += (p.hx + Math.sin(t * 3 + p.ph) * 3 - p.x) * 0.02 * lattice;
        p.y += (p.hy + Math.cos(t * 3 + p.ph) * 3 - p.y) * 0.02 * lattice;
        var mdx = p.x - mouse.x, mdy = p.y - mouse.y, md = mdx * mdx + mdy * mdy;
        if (md < 16000) { var f = (16000 - md) / 16000 * 1.2; p.x += mdx / Math.sqrt(md + 1) * f; p.y += mdy / Math.sqrt(md + 1) * f; }
      }
      var maxd = 130;
      for (i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var a1 = pts[i], b1 = pts[j], ddx = a1.x - b1.x, ddy = a1.y - b1.y, d = ddx * ddx + ddy * ddy;
          if (d < maxd * maxd) {
            var o = (1 - Math.sqrt(d) / maxd) * 0.32;
            ctx.strokeStyle = 'rgba(' + a1.c + ',' + o + ')'; ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < pts.length; i++) {
        var q = pts[i], g = 0.55 + 0.45 * Math.sin(t * 6 + q.ph);
        ctx.fillStyle = 'rgba(' + q.c + ',' + (0.5 + 0.4 * g) + ')';
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (0.8 + 0.4 * g), 0, 6.283); ctx.fill();
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    size(); frame();
    addEventListener('resize', size);
    cv.parentElement.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.parentElement.addEventListener('pointerleave', function () { mouse.x = mouse.y = -1e4; });
  }
})();

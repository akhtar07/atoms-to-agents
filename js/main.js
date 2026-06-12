// From Atoms to Agents — small progressive-enhancement helpers. No dependencies.
(function () {
  // mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
  }

  // reveal-on-scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // reading-progress bar
  var bar = document.getElementById('progress');
  if (bar) {
    window.addEventListener('scroll', function () {
      var h = document.documentElement;
      var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
      bar.style.width = (scrolled * 100) + '%';
    }, { passive: true });
  }

  // scatter floating atoms in any .atoms container
  document.querySelectorAll('.atoms').forEach(function (box) {
    var n = 16;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      var size = 4 + Math.random() * 16;
      s.style.width = s.style.height = size + 'px';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 9) + 's';
      s.style.animationDuration = (7 + Math.random() * 6) + 's';
      s.style.opacity = (0.15 + Math.random() * 0.4).toFixed(2);
      box.appendChild(s);
    }
  });
})();

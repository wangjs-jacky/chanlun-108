(function () {
  'use strict';
  var hero = document.querySelector('.hero');
  var courses = document.querySelector('.wrap');
  if (!hero || !courses) return;
  courses.id = 'courses';
  courses.style.scrollMarginTop = '64px';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var frame = 0;
  function reset() {
    cancelAnimationFrame(frame);
    hero.style.removeProperty('--camera-x');
    hero.style.removeProperty('--camera-y');
  }
  hero.addEventListener('pointermove', function (event) {
    if (reduced.matches || !fine.matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(function () {
      var rect = hero.getBoundingClientRect();
      hero.style.setProperty('--camera-x', ((event.clientX - rect.left) / rect.width - .5) * -18 + 'px');
      hero.style.setProperty('--camera-y', ((event.clientY - rect.top) / rect.height - .5) * -12 + 'px');
    });
  });
  hero.addEventListener('pointerleave', reset);
  reduced.addEventListener('change', reset);
  if (!reduced.matches && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      var order = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--arrival-delay', Math.min(order++, 5) * 55 + 'ms');
        entry.target.classList.add('card-arrive');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    courses.querySelectorAll('.card').forEach(function (card) { observer.observe(card); });
  }
})();

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;

  function formatCount(element, value) {
    const decimals = Number(element.dataset.decimals || 0);
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    }).format(value);
  }

  function finishCount(element) {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;
    element.textContent = formatCount(element, target);
    if (!reducedMotion.matches) element.closest('.metric-value')?.classList.add('is-counted');
  }

  function animateCount(element) {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;

    if (reducedMotion.matches) {
      finishCount(element);
      return;
    }

    const duration = 1200;
    const start = performance.now();
    const decimals = Number(element.dataset.decimals || 0);

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      const rounded = Number(current.toFixed(decimals));
      element.textContent = formatCount(element, rounded);
      if (progress < 1) requestAnimationFrame(update);
      else finishCount(element);
    }

    requestAnimationFrame(update);
  }

  function initializeMetrics() {
    const sections = Array.from(document.querySelectorAll('.metrics-section, .quote-section'))
      .filter(section => section.dataset.metricsReady !== 'true');
    if (!sections.length) return;

    for (const section of sections) {
      section.dataset.metricsReady = 'true';

      if (section.matches('.metrics-section')) {
        section.querySelectorAll('.metric-card').forEach((card, index) => {
          card.style.setProperty('--metric-delay', `${index * 100}ms`);
        });
      }

      if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        section.classList.add('is-visible');
        section.querySelectorAll('[data-count]').forEach(finishCount);
        continue;
      }

      section.classList.add('is-ready');
      if (!observer) {
        observer = new IntersectionObserver((entries, currentObserver) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const visibleSection = entry.target;
            visibleSection.classList.add('is-visible');
            visibleSection.querySelectorAll('[data-count]').forEach(animateCount);
            currentObserver.unobserve(visibleSection);
          }
        }, { threshold: 0.25 });
      }
      observer.observe(section);
    }
  }

  initializeMetrics();
  document.addEventListener('site-page:ready', initializeMetrics);
  document.addEventListener('site-shell:ready', initializeMetrics);
})();

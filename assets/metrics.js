(() => {
  const sections = document.querySelectorAll('.metrics-section');
  const quoteSection = document.querySelector('.quote-section');
  if (!sections.length && !quoteSection) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animatedSections = [...sections, ...(quoteSection ? [quoteSection] : [])];

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
  }

  function animateCount(element) {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;

    if (reducedMotion) {
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

  if (reducedMotion || !('IntersectionObserver' in window)) {
    for (const section of animatedSections) {
      section.classList.add('is-visible');
      section.querySelectorAll('[data-count]').forEach(finishCount);
    }
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const section = entry.target;
      section.classList.add('is-visible');
      section.querySelectorAll('[data-count]').forEach(animateCount);
      currentObserver.unobserve(section);
    }
  }, { threshold: 0.25 });

  for (const section of animatedSections) {
    section.querySelectorAll('.metric-card').forEach((card, index) => {
      card.style.setProperty('--metric-delay', `${index * 100}ms`);
    });
    section.classList.add('is-ready');
    observer.observe(section);
  }
})();

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, currentObserver) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  const heroSelector = [
    '.hero-section',
    '.hero-banner',
    '.hero-breadcrumb',
    '.contact-hero',
    '.blog-hero',
    '.team-hero',
    '.projects-hero'
  ].join(', ');
  const heroItemSelector = [
    '.eyebrow',
    '.contact-eyebrow',
    'h1',
    'p',
    '.hero-action',
    '.btn-custom-primary',
    '.btn-custom-outline',
    '.hero-img-wrapper'
  ].join(', ');

  function prepare(elements, delayForElement) {
    elements.forEach((element, index) => {
      if (element.dataset.motionReady) return;
      element.dataset.motionReady = 'true';
      element.classList.add('motion-reveal');
      element.style.setProperty('--motion-delay', `${delayForElement(element, index)}ms`);
      observer.observe(element);
    });
  }

  function initializeMotion(scope = document) {
    const heroes = scope.querySelectorAll(heroSelector);
    heroes.forEach(hero => {
      const items = Array.from(hero.querySelectorAll(heroItemSelector))
        .filter(item => item.closest(heroSelector) === hero
          && !item.closest('.hero-badge-overlay'));

      prepare(items, (_element, index) => Math.min(index, 4) * 100);

      const heroItems = items.filter(item => !item.dataset.motionShown);
      heroItems.forEach(item => {
        item.dataset.motionShown = 'true';
        item.classList.add('motion-hero-item');
        observer.unobserve(item);
      });
      if (heroItems.length) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          heroItems.forEach(item => item.classList.add('is-visible'));
        }));
      }

      hero.querySelectorAll('.hero-img-wrapper').forEach(wrapper => {
        wrapper.classList.add('motion-image-reveal');
      });
    });

    scope.querySelectorAll('section').forEach(section => {
      if (section.matches(`${heroSelector}, .metrics-section, .quote-section, .marquee-section`)) return;

      const columns = Array.from(section.querySelectorAll('.container > .row > [class*="col-"]'))
        .filter(column => column.closest('section') === section);
      const headings = Array.from(section.querySelectorAll(
        '.section-heading, .container > .text-center, .cta-banner, .cta-quote-banner'
      )).filter(element => element.closest('section') === section);
      const targets = [...new Set([...headings, ...columns])];

      prepare(targets, element => {
        const siblings = Array.from(element.parentElement.children)
          .filter(sibling => targets.includes(sibling));
        return Math.min(Math.max(siblings.indexOf(element), 0), 3) * 80;
      });
    });

    const footer = scope.matches?.('.site-footer') ? scope : scope.querySelector('.site-footer');
    if (footer) {
      const columns = footer.querySelectorAll('.container > .row > [class*="col-"]');
      prepare(columns, (_element, index) => Math.min(index, 3) * 80);
    }
  }

  initializeMotion();
  document.addEventListener('site-shell:ready', () => {
    initializeMotion(document.querySelector('.site-footer') || document);
  });
})();

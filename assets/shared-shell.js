(() => {
  async function loadSharedShell() {
    const currentNav = document.querySelector('.site-navbar');
    const currentFooter = document.querySelector('.site-footer');
    if (!currentNav || !currentFooter) return;

    try {
      const [headerResponse, footerResponse] = await Promise.all([
        fetch('/partials/header.html'),
        fetch('/partials/footer.html')
      ]);
      if (!headerResponse.ok || !footerResponse.ok) {
        throw new Error('Could not load the shared site header and footer.');
      }

      const [headerMarkup, footerMarkup] = await Promise.all([
        headerResponse.text(),
        footerResponse.text()
      ]);
      const headerTemplate = document.createElement('template');
      headerTemplate.innerHTML = headerMarkup.trim();
      const sharedHeader = headerTemplate.content.firstElementChild;
      currentNav.before(sharedHeader);
      document.querySelector('.site-topbar')?.remove();
      currentNav.remove();

      const footerTemplate = document.createElement('template');
      footerTemplate.innerHTML = footerMarkup.trim();
      currentFooter.replaceWith(footerTemplate.content);

      initializeSharedHeader(sharedHeader);
      document.dispatchEvent(new CustomEvent('site-shell:ready'));
    } catch (error) {
      console.error('Failed to load the shared site shell:', error);
      document.dispatchEvent(new CustomEvent('site-shell:error', { detail: error }));
    }
  }

  function initializeSharedHeader(header) {
    const menuToggle = header.querySelector('.shared-menu-toggle');
    const dropdownToggles = header.querySelectorAll('.shared-dropdown-toggle');
    const mobileNavigation = window.matchMedia('(max-width: 1199.98px)');
    const page = decodeURIComponent(window.location.pathname).toLowerCase();
    const activePage = page === '/' || page.endsWith('apexgutters_landing_page.html') ? 'home'
      : page.endsWith('apexgutters_about_us_page.html') ? 'about'
      : page.endsWith('apexgutters_services_page (1).html') ? 'services'
      : page.endsWith('why_choose_us_apexgutters.html') ? 'why'
      : page.endsWith('projects.html') ? 'projects'
      : page.endsWith('team.html') ? 'team'
      : page.endsWith('blog.html') ? 'blog'
      : page.endsWith('contact.html') ? 'contact'
      : '';

    if (activePage === 'home') {
      const testimonialsSection = Array.from(document.querySelectorAll('section')).find(section =>
        Array.from(section.querySelectorAll('h2')).some(heading =>
          heading.textContent.includes('What Homeowners Say About Us')
        )
      );
      if (testimonialsSection) {
        testimonialsSection.id = 'testimonials';
        if (window.location.hash === '#testimonials') testimonialsSection.scrollIntoView();
      }
    }

    for (const link of header.querySelectorAll('[data-page-link]')) {
      if (link.dataset.pageLink === activePage) {
        link.classList.add('is-current');
        link.setAttribute('aria-current', 'page');
        link.closest('.shared-nav-group')
          ?.querySelector('.shared-dropdown-toggle')
          ?.classList.add('is-current');
      }
    }

    for (const toggle of dropdownToggles) {
      toggle.addEventListener('click', () => {
        const group = toggle.closest('.shared-nav-group');
        const shouldOpen = !group.classList.contains('is-open');
        closeDropdowns(group);
        if (shouldOpen) {
          group.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });

      toggle.addEventListener('keydown', event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        const group = toggle.closest('.shared-nav-group');
        closeDropdowns(group);
        group.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        const links = group.querySelectorAll('.shared-dropdown-menu a');
        links[event.key === 'ArrowDown' ? 0 : links.length - 1]?.focus();
      });

      toggle.closest('.shared-nav-group').addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          closeDropdowns();
          toggle.focus();
          return;
        }
        const links = Array.from(toggle.closest('.shared-nav-group').querySelectorAll('.shared-dropdown-menu a'));
        const index = links.indexOf(event.target);
        if (index < 0) return;

        let nextIndex;
        if (event.key === 'ArrowDown') nextIndex = (index + 1) % links.length;
        else if (event.key === 'ArrowUp') nextIndex = (index - 1 + links.length) % links.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = links.length - 1;
        if (nextIndex !== undefined) {
          event.preventDefault();
          links[nextIndex].focus();
        }
      });
    }

    menuToggle?.addEventListener('click', () => {
      const isOpen = header.classList.toggle('is-menu-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      if (!isOpen) closeDropdowns();
    });

    header.addEventListener('keydown', event => {
      if (event.key === 'Escape' && header.classList.contains('is-menu-open')) {
        closeMobileMenu();
        menuToggle.focus();
      }
    });

    header.querySelectorAll('.shared-main-menu > a, .shared-dropdown-menu a').forEach(link => {
      link.addEventListener('click', () => {
        closeDropdowns();
        closeMobileMenu();
      });
    });

    document.addEventListener('pointerdown', event => {
      if (!header.contains(event.target)) {
        closeDropdowns();
        closeMobileMenu();
      }
    });

    mobileNavigation.addEventListener('change', () => {
      closeDropdowns();
      closeMobileMenu();
    });

    function closeDropdowns(exceptGroup) {
      for (const group of header.querySelectorAll('.shared-nav-group.is-open')) {
        if (group === exceptGroup) continue;
        group.classList.remove('is-open');
        group.querySelector('.shared-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      }
    }

    function closeMobileMenu() {
      header.classList.remove('is-menu-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.setAttribute('aria-label', 'Open navigation');
    }
  }

  loadSharedShell();
})();

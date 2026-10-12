import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import parse, { attributesToProps, domToReact } from 'html-react-parser';
import { legacyPaths, pages } from './page-registry.js';

const siteInfo = {
  phone: '(888) 488-7767',
  phoneHref: 'tel:18884887767',
  email: 'info@apexgutters.com'
};
const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function canonicalizeHref(href) {
  if (!href || href.startsWith('#')) return href;
  try {
    const url = new URL(href, `${window.location.origin}/`);
    if (url.origin !== window.location.origin) return href;
    const destination = legacyPaths[decodeURIComponent(url.pathname)];
    return destination ? `${destination}${url.search}${url.hash}` : href;
  } catch {
    return href;
  }
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState('');
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown('');
  }, [location.pathname]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setOpenDropdown('');
      }
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  function dropdown(name, title, entries) {
    const isOpen = openDropdown === name;
    return (
      <div className={`shared-nav-group${isOpen ? ' is-open' : ''}`}>
        <button
          className="shared-top-link shared-dropdown-toggle"
          type="button"
          aria-expanded={isOpen}
          onClick={() => setOpenDropdown(isOpen ? '' : name)}
        >
          {title} <i className="fa-solid fa-chevron-down" aria-hidden="true" />
        </button>
        <div className="shared-dropdown-menu">
          {entries.map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}
        </div>
      </div>
    );
  }

  return (
    <header className={`shared-site-header${menuOpen ? ' is-menu-open' : ''}`}>
      <nav className="navbar site-navbar" aria-label="Main navigation">
        <div className="shared-header-layout">
          <Link className="navbar-brand shared-brand" to="/" aria-label="ApexGutters home">
            <i className="fa-solid fa-house-chimney-crack site-brand-icon" aria-hidden="true" />
            <span className="site-brand-text">Apex<span>Gutters</span></span>
          </Link>
          <button
            className="shared-menu-toggle"
            type="button"
            aria-controls="sharedMainMenu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span /><span />
          </button>
          <div className="shared-main-menu" id="sharedMainMenu" aria-label="Site navigation">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            {dropdown('services', 'Services', [
              ['Gutter Installation', '/services/gutter-installation'],
              ['Gutter Repair', '/services/gutter-repair'],
              ['Gutter Cleaning', '/services/gutter-cleaning'],
              ['Gutter Guards', '/services/gutter-guards'],
              ['Downspouts', '/services/downspouts'],
              ['Commercial Drainage', '/services/commercial-drainage']
            ])}
            {dropdown('projects', 'Projects', [
              ['View Projects', '/projects#portfolio'],
              ['Copper Projects', '/projects?category=copper#portfolio']
            ])}
            <Link to="/team">Team</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact#contact-form">Contact</Link>
            <div className="shared-mobile-actions">
              <a className="shared-mobile-phone" href={siteInfo.phoneHref}>
                <span className="shared-emergency-icon"><i className="fa-solid fa-phone-volume" aria-hidden="true" /></span>
                <span><span className="shared-emergency-caption">CALL NOW</span><strong>{siteInfo.phone}</strong></span>
              </a>
              <Link className="site-quote-button" to="/contact#contact-form">Get Quote</Link>
            </div>
          </div>
          <div className="shared-header-actions">
            <a className="shared-emergency" href={siteInfo.phoneHref}>
              <span className="shared-emergency-icon"><i className="fa-solid fa-phone-volume" aria-hidden="true" /></span>
              <span><span className="shared-emergency-caption">CALL NOW</span><strong>{siteInfo.phone}</strong></span>
            </a>
            <Link className="site-quote-button shared-quote-button" to="/contact#contact-form">Get Quote</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitNewsletter(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || submitting) return;
    const email = new FormData(form).get('email');
    setSubmitting(true);
    setFeedback('');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to subscribe.');
      form.reset();
      setFeedback(result.message);
    } catch (error) {
      setFeedback(error.message || 'Unable to subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4 g-xl-5">
          <div className="col-lg-4 col-md-6">
            <Link className="site-footer-brand" to="/"><i className="fa-solid fa-house-chimney-crack" aria-hidden="true" />Apex<span>Gutters</span></Link>
            <p className="site-footer-copy">Custom seamless gutters, copper downspouts, leaf protection, and rainwater management for homes and businesses.</p>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <h2 className="site-footer-heading">Pages</h2>
            <ul className="site-footer-links">
              <li><Link to="/">Home</Link></li><li><Link to="/about">About</Link></li>
              <li><Link to="/services">Services</Link></li><li><Link to="/why-us">Why Us</Link></li>
              <li><Link to="/projects#portfolio">Projects</Link></li><li><Link to="/team">Team</Link></li>
              <li><Link to="/blog">Blog</Link></li><li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-3 col-lg-3">
            <h2 className="site-footer-heading">Services</h2>
            <ul className="site-footer-links">
              <li><Link to="/services/gutter-installation">Gutter installation</Link></li>
              <li><Link to="/services/gutter-repair">Gutter repair</Link></li>
              <li><Link to="/services/gutter-cleaning">Gutter cleaning</Link></li>
              <li><Link to="/services/gutter-guards">Gutter guards</Link></li>
              <li><Link to="/services/downspouts">Downspouts</Link></li>
              <li><Link to="/services/fascia-soffit">Fascia &amp; soffit</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 shared-footer-newsletter">
            <h2 className="site-footer-heading">Stay in the loop</h2>
            <p className="shared-newsletter-copy">Get seasonal gutter maintenance tips and special offers.</p>
            <form className="shared-newsletter-form" onSubmit={submitNewsletter}>
              <label className="visually-hidden" htmlFor="reactNewsletterEmail">Your email address</label>
              <input id="reactNewsletterEmail" name="email" type="email" placeholder="Your email address" autoComplete="email" required />
              <button type="submit" aria-label="Subscribe to the newsletter" disabled={submitting} aria-busy={submitting}>
                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              </button>
              <p className="form-feedback" role="status" aria-live="polite">{feedback}</p>
            </form>
          </div>
        </div>
        <div className="site-footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <span>&copy; 2026 ApexGutters. All rights reserved.</span><span>Built to protect what matters.</span>
        </div>
      </div>
    </footer>
  );
}

function getDocumentPart(source, selector) {
  const match = source.match(selector);
  return match?.[1] || '';
}

function LegacyPage({ page, onDetail }) {
  const location = useLocation();
  const pathname = decodeURIComponent(location.pathname);
  const [feedback, setFeedback] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);
  const inFlightForms = useRef(new WeakSet());
  const source = page.source;
  const rawBody = getDocumentPart(source, /<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const pageStyles = Array.from(source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi), match => match[1]).join('\n');
  const title = getDocumentPart(source, /<title\b[^>]*>([\s\S]*?)<\/title>/i).replace(/&amp;/g, '&').trim();
  const description = source.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] || '';

  useEffect(() => {
    if (title) document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) metaDescription.content = description;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `${window.location.origin}${location.pathname}`;
    window.scrollTo(0, 0);
    if (location.hash) {
      requestAnimationFrame(() => {
        let target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (!target && pathname === '/team') {
          target = Array.from(document.querySelectorAll('.team-card')).find(card =>
            card.querySelector('h3')?.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
              === decodeURIComponent(location.hash.slice(1))
          );
          if (target) target.id = decodeURIComponent(location.hash.slice(1));
        }
        if (!target) return;
        target.scrollIntoView();
        target.querySelector('.team-bio-button, .project-detail-button')?.click();
      });
    }
  }, [description, location.hash, location.pathname, pathname, title]);

  async function submitPageForm(event) {
    const form = event.target;
    if (!form.matches('form[data-api-form]')) return;
    event.preventDefault();
    if (!form.reportValidity() || inFlightForms.current.has(form)) return;
    inFlightForms.current.add(form);

    const formType = form.dataset.apiForm;
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = formType === 'newsletter'
      ? { email: values.email }
      : {
          type: formType,
          name: values.name,
          email: values.email || '',
          phone: values.phone,
          service: values.service,
          message: values.message || '',
          emailRequired: form.dataset.emailRequired === 'true'
        };
    const button = form.querySelector('[type="submit"]');
    const originalLabel = button?.textContent;
    const feedbackNode = form.querySelector('[data-form-feedback]');
    setSubmittingForm(true);
    setFeedback('');
    if (button) {
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      if (originalLabel) button.textContent = 'Sending…';
    }

    try {
      const endpoint = formType === 'newsletter' ? '/api/newsletter' : '/api/leads';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(Object.values(result.fields || {})[0] || result.error || 'Unable to submit the form.');
      }
      form.reset();
      if (feedbackNode) {
        feedbackNode.textContent = result.message;
        feedbackNode.classList.add('is-success');
        feedbackNode.hidden = false;
      } else {
        setFeedback(result.message);
      }
    } catch (error) {
      const message = error.message || 'Could not reach the server. Please try again.';
      if (feedbackNode) {
        feedbackNode.textContent = message;
        feedbackNode.classList.add('is-error');
        feedbackNode.hidden = false;
      } else {
        setFeedback(message);
      }
    } finally {
      inFlightForms.current.delete(form);
      setSubmittingForm(false);
      if (button) {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        if (originalLabel) button.textContent = originalLabel;
      }
    }
  }

  function filterCards(event) {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    const cardFilter = button.dataset.filter;
    const categoryButtons = button.parentElement?.querySelectorAll('[data-filter]') || [];
    categoryButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    const isBlogFilter = button.classList.contains('cat-btn');
    const selector = isBlogFilter ? '.post-item' : '.project-item';
    const cards = document.querySelectorAll(selector);
    let visibleCount = 0;
    cards.forEach(card => {
      const categories = (card.dataset.category || '').split(/\s+/);
      const visible = cardFilter === 'all' || categories.includes(cardFilter);
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    });
    const result = document.getElementById(isBlogFilter ? 'blogResults' : 'projectResults');
    if (result) result.textContent = `Showing ${visibleCount} ${isBlogFilter ? 'articles' : 'projects'}`;
  }

  function handleDetail(event) {
    const button = event.target.closest('.team-bio-button, .project-detail-button, .project-card-action, .team-bio-link');
    if (!button) return;
  if (button.matches('a')) event.preventDefault();
    const card = button.closest('.team-card, .project-card, article');
    if (!card) return;
    const isBio = button.classList.contains('team-bio-button') || button.classList.contains('team-bio-link');
    onDetail({
      type: isBio ? 'bio' : 'project',
      title: card.querySelector('h3, h4')?.textContent.trim() || '',
      role: card.querySelector('.team-role')?.textContent.trim() || '',
      description: card.querySelector('.team-info p, .project-overlay p, p')?.textContent.trim() || '',
      tag: card.querySelector('.team-tag, .project-overlay .badge')?.textContent.trim() || '',
      image: card.querySelector('img')?.currentSrc || card.querySelector('img')?.src || '',
      imageAlt: card.querySelector('img')?.alt || ''
    });
  }

  const options = {
    replace(domNode) {
      if (!domNode.name) return;
      const classNames = (domNode.attribs?.class || '').split(/\s+/);
      if (['script', 'nav', 'header', 'footer', 'style'].includes(domNode.name)) return <React.Fragment />;
      if (classNames.includes('site-topbar') || classNames.includes('shared-site-header')) return <React.Fragment />;

      if (domNode.name === 'form' && domNode.attribs?.['data-api-form']) {
        return React.createElement('form', {
          ...attributesToProps(domNode.attribs),
          onSubmit: submitPageForm
        }, domToReact(domNode.children || [], options));
      }

      if (classNames.includes('team-info')) {
        const content = domToReact(domNode.children || [], options);
        return React.createElement(domNode.name, attributesToProps(domNode.attribs),
          content,
          React.createElement('button', {
            className: 'team-bio-button',
            type: 'button',
            'aria-label': `View bio: ${domNode.children?.find(child => child.name === 'h3')?.children?.[0]?.data || 'team member'}`
          }, 'View Bio'));
      }

      if (classNames.includes('project-overlay')) {
        return React.createElement(domNode.name, attributesToProps(domNode.attribs),
          domToReact(domNode.children || [], options),
          React.createElement('button', { className: 'project-detail-button', type: 'button' }, 'View Project'));
      }

      const props = attributesToProps(domNode.attribs || {});
      for (const property of Object.keys(props)) {
        if (/^on/i.test(property) || property === 'selected') delete props[property];
      }
      if (domNode.name === 'a' && typeof props.href === 'string') {
        props.href = canonicalizeHref(props.href);
      }
      if (domNode.name === 'img' && domNode.attribs?.onerror) {
        const fallback = domNode.attribs.onerror.match(/this\.src\s*=\s*['"]([^'"]+)['"]/i)?.[1];
        if (fallback) props.onError = event => { event.currentTarget.src = fallback; };
      }
      if (domNode.name === 'textarea') {
        const value = (domNode.children || []).map(child => child.data || '').join('');
        if (value) props.defaultValue = value;
        return React.createElement('textarea', props);
      }
      if (voidElements.has(domNode.name)) return React.createElement(domNode.name, props);
      return React.createElement(domNode.name, props, domToReact(domNode.children || [], options));
    }
  };

  const content = parse(rawBody, options);
  const hasMainLandmark = /<main\b/i.test(rawBody);

  return (
    <div className="react-page" onClickCapture={event => { filterCards(event); handleDetail(event); }}>
      <style>{pageStyles}</style>
      {hasMainLandmark
        ? <div className="legacy-page">{content}</div>
        : <main className="legacy-page">{content}</main>}
      {feedback && <p className="visually-hidden" role="status" aria-live="polite">{feedback}</p>}
      {submittingForm && <span className="visually-hidden" role="status">Sending your request.</span>}
    </div>
  );
}

function RoutedPage({ page, onDetail }) {
  const [source, setSource] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    setSource('');
    setLoadError('');
    page.load().then(html => {
      if (active) setSource(html);
    }).catch(error => {
      console.error(`Failed to load page ${page.path}:`, error);
      if (active) setLoadError('This page could not be loaded. Please refresh and try again.');
    });
    return () => { active = false; };
  }, [page]);

  if (loadError) return <main className="react-not-found"><h1>Unable to load page</h1><p>{loadError}</p></main>;
  if (!source) return <main className="react-not-found" aria-live="polite">Loading…</main>;
  return <LegacyPage page={{ ...page, source }} onDetail={onDetail} />;
}

function DetailDialog({ detail, close }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!detail || !dialogRef.current) return undefined;
    const dialog = dialogRef.current;
    dialog.showModal();
    dialog.querySelector('button')?.focus();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [detail]);

  return (
    <dialog
      className="detail-dialog"
      ref={dialogRef}
      aria-labelledby="detailDialogTitle"
      onClose={close}
      onClick={event => { if (event.target === dialogRef.current) dialogRef.current.close(); }}
    >
      {detail && <>
        <button className="detail-dialog-close" type="button" aria-label="Close details" onClick={() => dialogRef.current?.close()}>&times;</button>
        {detail.image && <img className="detail-dialog-image" src={detail.image} alt={detail.imageAlt} />}
        <div className="detail-dialog-content">
          {detail.tag && <span className="eyebrow">{detail.tag}</span>}
          {detail.role && <p className="text-uppercase fw-bold text-warning mb-1">{detail.role}</p>}
          <h2 id="detailDialogTitle">{detail.title}</h2>
          <p>{detail.description}</p>
          {detail.type === 'bio' && <p className="small">Further biography details have not been supplied.</p>}
        </div>
      </>}
    </dialog>
  );
}

function App() {
  const location = useLocation();
  const [detail, setDetail] = useState(null);
  const pathname = decodeURIComponent(location.pathname);
  const page = pages.find(entry => entry.path === pathname);
  const legacyDestination = legacyPaths[pathname];

  useEffect(() => setDetail(null), [pathname]);

  if (legacyDestination) {
    return <Navigate to={`${legacyDestination}${location.search}${location.hash}`} replace />;
  }

  if (!page) {
    return (
      <>
        <Header />
        <div className="react-not-found"><h1>Page not found</h1><p>We couldn’t find that page.</p><Link className="site-quote-button" to="/">Go Home</Link></div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <RoutedPage key={pathname} page={page} onDetail={setDetail} />
      <Footer />
      <DetailDialog detail={detail} close={() => setDetail(null)} />
    </>
  );
}

export default App;

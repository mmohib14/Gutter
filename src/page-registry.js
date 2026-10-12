import legacyPaths from '../route-aliases.json';

export { legacyPaths };

export const pages = [
  { path: '/', load: () => import('./page-content/home.js').then(module => module.default) },
  { path: '/about', load: () => import('./page-content/about.js').then(module => module.default) },
  { path: '/services', load: () => import('./page-content/services.js').then(module => module.default) },
  { path: '/why-us', load: () => import('./page-content/why-us.js').then(module => module.default) },
  { path: '/projects', load: () => import('./page-content/projects.js').then(module => module.default) },
  { path: '/team', load: () => import('./page-content/team.js').then(module => module.default) },
  { path: '/blog', load: () => import('./page-content/blog.js').then(module => module.default) },
  { path: '/contact', load: () => import('./page-content/contact.js').then(module => module.default) },
  { path: '/services/commercial-drainage', load: () => import('./page-content/service-commercial-drainage.js').then(module => module.default) },
  { path: '/services/downspouts', load: () => import('./page-content/service-downspouts.js').then(module => module.default) },
  { path: '/services/fascia-soffit', load: () => import('./page-content/service-fascia-soffit.js').then(module => module.default) },
  { path: '/services/gutter-cleaning', load: () => import('./page-content/service-gutter-cleaning.js').then(module => module.default) },
  { path: '/services/gutter-installation', load: () => import('./page-content/service-gutter-installation.js').then(module => module.default) },
  { path: '/services/gutter-repair', load: () => import('./page-content/service-gutter-repair.js').then(module => module.default) },
  { path: '/services/gutter-guards', load: () => import('./page-content/service-leaf-guards.js').then(module => module.default) },
  { path: '/blog/gutter-warning-signs', load: () => import('./page-content/blog-7-signs-your-gutters-need-attention.js').then(module => module.default) },
  { path: '/blog/choosing-gutter-system', load: () => import('./page-content/blog-choosing-gutter-system.js').then(module => module.default) },
  { path: '/blog/commercial-drainage-planning', load: () => import('./page-content/blog-commercial-drainage-planning.js').then(module => module.default) },
  { path: '/blog/gutter-guards-guide', load: () => import('./page-content/blog-gutter-guards-guide.js').then(module => module.default) },
  { path: '/blog/seamless-vs-sectional-gutters', load: () => import('./page-content/blog-seamless-vs-sectional-gutters.js').then(module => module.default) },
  { path: '/blog/seasonal-gutter-checklist', load: () => import('./page-content/blog-seasonal-gutter-checklist.js').then(module => module.default) },
  { path: '/blog/when-to-replace-gutters', load: () => import('./page-content/blog-when-to-replace-your-gutters.js').then(module => module.default) }
];

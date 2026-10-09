# ApexGutters Anchor Links Documentation

## Overview
This document details all the anchor links configured across the ApexGutters website for seamless navigation between pages and sections.

## Landing Page (`apexgutters_landing_page.html`)

### Available Anchors:
- `#hero` - Hero section
- `#about` - Company intro section
- `#services` - Services overview
- `#advantages` - Why choose us / advantages
- `#projects` - Featured projects section
- `#team` - Team section
- `#quote` - Quote request form
- `#testimonials` - Client testimonials section
- `#blog` - Blog previews section

### Internal Anchor Links:
- Hero "Explore Services" button → `#services`
- Hero "Get A Free Quote" button → `#quote`
- Testimonials "Testimonials" nav link → `#testimonials`
- Contact "Contact" nav link → `#quote`

---

## Services Page (`apexgutters_services_page (1).html`)

### Available Service Anchors:
Each service card has a hidden anchor for deep linking:

1. `#service-seamless-installation` - Seamless Gutter Installation (Service 1)
2. `#service-repair` - Gutter Repair & Realignment (Service 2)
3. `#service-cleaning` - Gutter Cleaning & Flushing (Service 3)
4. `#service-leaf-guard` - Leaf & Debris Protection Guards (Service 4)
5. `#service-downspout` - Downspout & Drainage Systems (Service 5)
6. `#service-fascia` - Fascia & Soffit Repair (Service 6)

### Additional Anchors:
- `#faqAccordion` - Frequently Asked Questions section
- `#quote-form` - Quote request form (Cost Estimator)

---

## Projects Page (`projects.html`)

### Available Anchors:
- `#portfolio` - Project portfolio section
- Portfolio can be filtered by category:
  - `?category=residential#portfolio` - Residential projects
  - `?category=commercial#portfolio` - Commercial projects
  - `?category=copper#portfolio` - Copper projects
  - `?category=protection#portfolio` - Leaf protection projects

---

## About Us Page (`apexgutters_about_us_page.html`)

### Available Anchors:
- `#about` - Main about section
- `#stats` - Statistics section
- `#team-intro` - Team introduction

---

## Why Choose Us Page (`why_choose_us_apexgutters.html`)

### Available Anchors:
- `#why` - Main why choose us section
- `#benefits` - Benefits list
- `#faq` - FAQ section

---

## Team Page (`team.html`)

### Available Anchors:
- `#team` - Team members section

---

## Blog Page (`blog.html`)

### Available Anchors:
- `#blog` - Blog articles section

---

## Header Navigation Links

### Pages Dropdown
- About Company → `/apexgutters_about_us_page.html`
- Why GutterPro → `/why_choose_us_apexgutters.html`
- Certified Technicians → `/team.html`
- Frequently Asked Questions → `/apexgutters_services_page%20(1).html#faqAccordion`
- Cost Estimator → `/apexgutters_services_page%20(1).html#quote-form`

### Services Dropdown
- Seamless Gutter Installation → `/apexgutters_services_page%20(1).html#service-seamless-installation`
- Downspout Repair & Rerouting → `/apexgutters_services_page%20(1).html#service-repair`
- Gutter Cleaning & Inspection → `/apexgutters_services_page%20(1).html#service-cleaning`
- Full Gutter Replacement → `/apexgutters_services_page%20(1).html#service-seamless-installation`
- Leaf Guard & Mesh Protection → `/apexgutters_services_page%20(1).html#service-leaf-guard`
- French Drain & Runoff Solutions → `/apexgutters_services_page%20(1).html#service-downspout`

### Projects Dropdown
- All Completed Work → `/projects.html#portfolio`
- Seamless Aluminum Work → `/projects.html#portfolio`
- Architectural Copper → `/projects.html?category=copper#portfolio`
- Before & After Studies → `/projects.html#portfolio`

---

## Footer Navigation Links

### Pages Column (In Footer)
- Home → `/apexgutters_landing_page.html#hero`
- About Us → `/apexgutters_about_us_page.html`
- Why Choose Us → `/why_choose_us_apexgutters.html`
- Team Members → `/team.html`
- Work Projects → `/projects.html#portfolio`
- Blog → `/blog.html`

### Services Column (In Footer)
- Seamless Aluminum Gutters → `/apexgutters_services_page%20(1).html#service-seamless-installation`
- Copper Gutter Fabrication → `/apexgutters_services_page%20(1).html#service-repair`
- Leaf Guards & Micro-Mesh → `/apexgutters_services_page%20(1).html#service-leaf-guard`
- Underground Downspout Piping → `/apexgutters_services_page%20(1).html#service-downspout`
- Soffit & Fascia Replacement → `/apexgutters_services_page%20(1).html#service-fascia`

---

## Testing Checklist

### Landing Page Tests
- [ ] Click Testimonials nav link → should scroll to testimonials section
- [ ] Click Contact nav link → should scroll to quote form
- [ ] Click "Explore Services" button → should scroll to services section
- [ ] Click "Get A Free Quote" button → should scroll to quote form

### Footer Links Tests
- [ ] Landing page footer Services links → navigate to Services page with service-specific anchors
- [ ] All pages footer Pages links → navigate to correct pages
- [ ] All pages footer "Home" link → returns to landing page hero section

### Cross-Page Navigation Tests
- [ ] Header Pages dropdown → all links work correctly
- [ ] Header Services dropdown → all links navigate to services page with correct anchors
- [ ] Header Projects dropdown → all links navigate to projects page with optional category filters
- [ ] All internal links use consistent URL structure

---

## Implementation Notes

1. **Anchor IDs**: All anchor IDs are implemented using `<span class="visually-hidden" id="anchor-id"></span>` elements to maintain semantic HTML without affecting layout.

2. **Service Anchors**: Service cards now have invisible anchor points for each service, allowing direct linking to specific services from other pages.

3. **Header Dropdown Integration**: All header dropdown links now point to specific page sections with anchors, improving user experience and navigation depth.

4. **Footer Integration**: Footer service and page links now include proper anchor references, maintaining navigation consistency throughout the site.

5. **Browser Compatibility**: All anchor links use standard HTML anchors and are compatible with all modern browsers.

---

## Future Enhancements

1. Consider adding more granular anchor points to blog articles for direct linking
2. Add section anchors to the About Us and Why Us pages for better navigation depth
3. Consider implementing smooth scroll behavior for anchor navigation
4. Add analytics tracking to anchor link clicks for usage insights

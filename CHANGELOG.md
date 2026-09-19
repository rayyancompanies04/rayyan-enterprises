# Rayyan Enterprises — fixes & upgrades

## Bugs fixed
- Service pages: all footer links were broken (missing ../) — fixed on all 7 pages
- privacy.html: header "Request a Quote" button pointed to ../contact.html — fixed
- terms.html / privacy.html: "Home" was highlighted in the nav — fixed
- Mobile menu was different on every page (Blog missing on some, Terms missing on others, numbering skipped 02) — now identical everywhere, Terms/Privacy shown as small links at the bottom
- Mobile menu left a gap under the header once the page was scrolled — now positions itself under the header
- Logo mark "RE" was being restyled by the ".brand span" rule (tiny grey text) — fixed
- Services list: white hover card was hidden behind the section background — fixed
- 404 page: nav missing FAQ/Blog, different footer, different scrap icon, relative paths broke on nested URLs, misleading "has moved" copy — fixed; now noindex
- Blog: 6 "Read more" links pointed to "#" — replaced with "Article coming soon"
- Hero headline could overflow on very small phones — fixed
- Low-contrast grey text (labels, footer headings) darkened/lightened to pass WCAG AA

## Upgrades
- Contact form: optional form endpoint (data-endpoint) + "Send on WhatsApp instead" button; honeypot spam trap; name/autocomplete attributes; error/success messages
- Accessibility: skip-to-content link, aria-current on active nav, aria-expanded on menus, aria-live form messages, smooth scroll only if motion allowed
- No-JS / old-browser fallback so content is never stuck invisible
- Reveal animation stagger now based on what arrives together, not page position
- SEO: favicon, theme-color, Open Graph tags, LocalBusiness JSON-LD (home), FAQ JSON-LD (faq), sitemap.xml, robots.txt

## You must fill in (placeholders left untouched)
- Real phone/WhatsApp number (currently +91 8692920094; also in JSON-LD and data-wa on the contact form)
- Registered office address (contact.html)
- [your city/region] (faq.html), [your jurisdiction] / [your country/state] (terms.html)
- sitemap.xml / robots.txt assume the domain https://rayyanenterprises.in — change if different
- Blog posts are sample content; 404 assumes the site is at the domain root

# SEO pass (rayyanenterprises.in)
- Unique title + meta description on every page (all within 60 / 160 chars), canonical, hreflang en-IN, robots directives, `lang="en-IN"`
- Open Graph + Twitter large-image cards, with a generated 1200x630 og-image.png
- Full favicon set from the real logo: favicon.ico, favicon.svg (dark-mode aware), 16/32 PNG, apple-touch-icon, 192/512 + maskable icons, site.webmanifest
- JSON-LD graph per page: GeneralContractor + WebSite (home), WebPage subtypes, BreadcrumbList, Service (7 service pages), FAQPage
- sitemap.xml (15 URLs, lastmod) + robots.txt; 404 is noindex and excluded from the sitemap
- .htaccess (HTTPS, www redirect, gzip, caching, security headers) and _headers for Netlify/Cloudflare
- Heading order fixed on service pages (h1 → h2), internal contextual links between related services
- LCP hero preload, preconnect to image host, cache-busting ?v= on CSS/JS
- DEPLOY-AND-SEO-GUIDE.md: placeholders to replace + Search Console / Business Profile steps

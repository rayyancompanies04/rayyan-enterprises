# Deploying rayyanenterprises.in — and finishing the SEO

## 1. Upload
Upload the **contents** of this folder (not the folder itself) to your web root (`public_html` on cPanel).
Make sure the hidden file `.htaccess` uploads too (in cPanel File Manager: Settings → "Show Hidden Files").
`.htaccess` forces HTTPS, redirects www → rayyanenterprises.in, serves 404.html, enables compression/caching and security headers.
Netlify / Cloudflare Pages: `_headers` is included; set HTTPS + the www redirect in the dashboard.
Nginx: add `error_page 404 /404.html;`, a 301 from http/www to https://rayyanenterprises.in, and `gzip on;`.

## 2. Replace before going live (these are still placeholders)
| What | Where |
|---|---|
| Phone `+91 8692920094` / `919999999999` / `+918692920094` | every page (footer, header, buttons), `contact.html` (`data-wa`), `index.html` (structured data). Search & replace across all files. |
| Office address | `contact.html` ("Add your full registered office address here") **and** `index.html`: find `"addressCountry":"IN"` and add `streetAddress`, `addressLocality`, `addressRegion`, `postalCode` next to it. Also add the address to the footer. |
| `[your city/region]` | `faq.html` (service-area answer). Once filled, add that Q&A to the FAQ structured data in `faq.html` (it is left out while it has a placeholder). |
| `[your jurisdiction]`, `[your country/state]` | `terms.html` (have a lawyer review Terms + Privacy) |
| Contact form delivery | `contact.html`: put a Formspree / Web3Forms URL in `<form ... data-endpoint="">`. Without it the form opens the visitor's email app. |
| Photos | Images are hot-linked from Pexels (stock, and slower). Replace with your own project photos, saved as WebP in an `/images/` folder, with descriptive alt text. |

## 3. Within an hour of going live
1. Check in a browser: `http://www.rayyanenterprises.in` → lands on `https://rayyanenterprises.in`; `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, `/og-image.png` all open; a made-up URL shows the 404 page.
2. **Google Search Console** (search.google.com/search-console) → add a *Domain* property (verify with a DNS TXT record at your registrar) → Sitemaps → submit `sitemap.xml` → URL Inspection → "Request indexing" for the home page, /services.html, /contact.html and the 7 service pages.
3. **Bing Webmaster Tools** → import from Search Console (also covers DuckDuckGo/Yahoo).
4. **Google Business Profile** (business.google.com) — for a local contractor this matters more than anything on the website. Use the exact same name, address and phone as the site, pick categories such as "General contractor" / "Demolition contractor" / "Scrap dealer", upload real photos, and ask happy clients for reviews.
5. Test: search.google.com/test/rich-results (structured data), pagespeed.web.dev, and paste a page URL into the LinkedIn Post Inspector / Facebook Sharing Debugger to see the share card.

## 4. Ongoing (what actually moves rankings)
- Same name/address/phone on IndiaMART, Justdial, Sulekha, TradeIndia etc.
- Replace the "Article coming soon" blog cards with real articles; one page per article, then add it to the sitemap.
- Add a short FAQ and 2–3 real project photos to each service page.
- Keep collecting Google reviews.
- Google Analytics is optional; if you add it, mention cookies in the Privacy Policy.

## What "100%" means
Lighthouse's SEO score covers technical basics (title, description, canonical, crawlability, valid robots.txt, alt text, viewport, link text) — this package is built to pass all of them. Search *rankings* are not guaranteed by any package; they depend on content, local reviews, links and time.

// Static site generator for Andrade Custom Trim. Run: node build.mjs  → writes ./dist
import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL, IMG_BASE, FORM_ENDPOINT, BUSINESS as B, MAPS_QUERY, CITIES, IMG, PROJECTS } from "./src/config.mjs";
import { SLUGS, T } from "./src/i18n.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "dist");
const PAGES = ["home", "services", "projects", "about", "contact"];
const YEAR = new Date().getFullYear();
const VER = Date.now().toString(36); // cache-busting for CSS/JS after each build

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const src = (p) => (/^https?:/.test(p) || p.startsWith("/img/") ? p : IMG_BASE + p);
const abs = (p) => (p.startsWith("/img/") ? SITE_URL + p : src(p));
// Clean URLs without trailing slash: /about, /es/servicios. Home pages are / and /es/.
const path = (lang, page) => (lang === "en" ? "/" : "/es/") + (SLUGS[lang][page] || "");
// File behind each URL: /about → about.html, / → index.html, /es/ → es/index.html
const fileFor = (lang, page) => (SLUGS[lang][page] ? path(lang, page) + ".html" : join(path(lang, page), "index.html"));
const img = (p, alt, { w, h, eager = false, cls = "", sizes } = {}) =>
  `<img src="${esc(src(p))}" alt="${esc(alt)}"${w ? ` width="${w}" height="${h}"` : ""}${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${cls ? ` class="${cls}"` : ""}${sizes ? ` sizes="${sizes}"` : ""}>`;
const mapsLink = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
const addressHtml = `${B.street}<br>${B.building}<br>${B.city}, ${B.region} ${B.zip}`;

// ---------- Shared chrome ----------
function head(t, page, lang) {
  const [title, desc] = t.meta[page] || [t.notFound.title + " | " + B.name, t.notFound.lead];
  const url = SITE_URL + path(lang, page);
  const alt = T[t.other];
  const hreflang = page in t.meta
    ? `<link rel="alternate" hreflang="en" href="${SITE_URL + path("en", page)}">
<link rel="alternate" hreflang="es" href="${SITE_URL + path("es", page)}">
<link rel="alternate" hreflang="x-default" href="${SITE_URL + path("en", page)}">`
    : "";
  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${page in t.meta ? `<link rel="canonical" href="${url}">` : '<meta name="robots" content="noindex">'}
${hreflang}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${B.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${abs(IMG.hero.src)}">
<meta property="og:locale" content="${t.locale}">
<meta property="og:locale:alternate" content="${alt.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#282C29">
<link rel="icon" href="${src(IMG.logo)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&display=swap">
<link rel="stylesheet" href="/assets/styles.css?v=${VER}">
${page === "home" ? jsonLd(t) : ""}
</head>
<body>
<a class="skip" href="#main">${t.skip}</a>`;
}

function jsonLd(t) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: B.name,
    alternateName: B.legalName,
    url: SITE_URL + "/",
    logo: abs(IMG.logo),
    image: abs(IMG.hero.src),
    telephone: "+1-469-358-1011",
    email: B.emailShown,
    description: t.meta.home[1],
    address: { "@type": "PostalAddress", streetAddress: `${B.street}, ${B.building}`, addressLocality: B.city, addressRegion: B.region, postalCode: B.zip, addressCountry: "US" },
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: B.hours.opens, closes: B.hours.closes }],
    areaServed: CITIES.map((c) => ({ "@type": "City", name: `${c}, TX` })),
    founder: [{ "@type": "Person", name: "Victor Andrade" }, { "@type": "Person", name: "Michelle Andrade" }],
    sameAs: [B.bbbUrl, ...B.social.map((s) => s.url)]
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function header(t, page, lang) {
  const nav = PAGES.map((p) => `<a href="${path(lang, p)}"${p === page ? ' aria-current="page"' : ""}>${t.nav[p]}</a>`).join("");
  const otherHref = path(t.other, page in t.meta ? page : "home");
  return `<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${path(lang, "home")}" aria-label="${B.name} — ${t.nav.home}">${img(IMG.logo, B.legalName + " logo", { w: 64, h: 64, eager: true })}</a>
    <nav class="nav" id="site-nav" aria-label="Main">${nav}</nav>
    <div class="header-tools">
      <a class="header-phone" href="${B.phoneHref}">${B.phone}</a>
      <a class="lang" href="${otherHref}" hreflang="${t.other}" lang="${t.other}" aria-label="${t.otherName}">${t.otherLabel}</a>
      <a class="btn btn--primary" href="${path(lang, "contact")}">${t.quote}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">${t.menu}</button>
    </div>
  </div>
</header>
<main id="main">`;
}

function footer(t, lang) {
  return `</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="footer-logo" href="${path(lang, "home")}">${img(IMG.logo, B.legalName + " logo", { w: 72, h: 72 })}</a>
        <p>${t.footer.tagline}</p>
        <a href="${B.bbbUrl}" rel="noopener" target="_blank">${img(IMG.bbbSeal, t.trust.bbb, { w: 200, h: 42 })}</a>
      </div>
      <div>
        <h2>${t.footer.explore}</h2>
        <ul>${PAGES.map((p) => `<li><a href="${path(lang, p)}">${t.nav[p]}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h2>${t.footer.contact}</h2>
        <ul>
          <li><a href="${B.phoneHref}">${B.phone}</a></li>
          <li><a href="mailto:${B.emailLink}">${B.emailShown}</a></li>
          ${B.social.map((s) => `<li><a href="${s.url}" rel="noopener" target="_blank">${s.name}</a></li>`).join("")}
        </ul>
      </div>
      <div>
        <h2>${t.footer.visit}</h2>
        <p><a href="${mapsLink}" rel="noopener" target="_blank">${addressHtml}</a></p>
        <p>${t.hoursShort}</p>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${YEAR} ${B.name}. ${t.footer.rights}</span>
      <a href="${path(t.other, "home")}" hreflang="${t.other}" lang="${t.other}">${t.otherName}</a>
    </div>
  </div>
</footer>
<nav class="action-bar" aria-label="${t.quote}">
  <a class="btn btn--gray" href="${B.phoneHref}">${t.call}</a>
  <a class="btn btn--primary" href="${path(lang, "contact")}">${t.quote}</a>
</nav>
<script src="/assets/main.js?v=${VER}" defer></script>
</body>
</html>`;
}

// ---------- Reusable sections ----------
const pageHero = (title, lead, eyebrow = "") => `<section class="page-hero"><div class="wrap">
  ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}<h1>${title}</h1><p>${lead}</p></div></section>`;

function showroomSection(t, lang) {
  const s = t.showroom;
  const media = IMG.showroom
    ? img(IMG.showroom.src, s.title, { w: IMG.showroom.w, h: IMG.showroom.h })
    : `<iframe class="map" title="${esc(s.mapTitle)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${MAPS_QUERY}&output=embed"></iframe>`;
  return `<section class="section"><div class="wrap split">
  <div class="split__img">${media}</div>
  <div>
    <span class="eyebrow">${s.eyebrow}</span>
    <h2>${s.title}</h2>
    <p class="lead">${s.lead}</p>
    <dl class="info-list">
      <div><dt>${s.address}</dt><dd>${addressHtml}</dd></div>
      <div><dt>${s.hours}</dt><dd>${t.hoursShort}</dd></div>
      <div><dt>${s.phone}</dt><dd><a href="${B.phoneHref}">${B.phone}</a></dd></div>
    </dl>
    <div class="actions">
      <a class="btn btn--gray" href="${mapsLink}" rel="noopener" target="_blank">${s.directions}</a>
    </div>
  </div>
</div></section>`;
}

function teamSection(t, lang, { linkAbout = true } = {}) {
  const s = t.team;
  const media = IMG.team
    ? `<div class="team__photo">${img(IMG.team.src, s.alt, { w: IMG.team.w, h: IMG.team.h })}</div>`
    : `<div class="team__mono" aria-hidden="true">V&amp;M</div>`;
  return `<section class="section"><div class="wrap"><div class="team">
  ${media}
  <div>
    <span class="eyebrow">${s.eyebrow}</span>
    <h2>${s.title}</h2>
    <p class="lead" style="max-width:56ch">${s.lead}</p>
    <div class="actions">
      ${linkAbout ? `<a class="btn btn--gray" href="${path(lang, "about")}">${s.about}</a>` : ""}
      <a class="link-arrow" href="${path(lang, "contact")}">${s.tell}</a>
    </div>
  </div>
</div></div></section>`;
}

function trustSection(t) {
  const s = t.trust;
  return `<section class="section section--white"><div class="wrap"><div class="trust">
  <div><h2>${s.title}</h2><p class="muted" style="margin:0">${s.lead}</p></div>
  <div class="trust__badges">
    <a class="btn btn--primary" href="${B.googleReviewsUrl}" rel="noopener" target="_blank">${s.google}</a>
    <a href="${B.bbbUrl}" rel="noopener" target="_blank">${img(IMG.bbbSeal, s.bbb, { w: 200, h: 42 })}</a>
  </div>
</div></div></section>`;
}

function faqSection(t) {
  return `<section class="section"><div class="wrap faq">
  <h2>${t.faq.title}</h2>
  ${t.faq.items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n  ")}
</div></section>`;
}

const ctaBand = (t, lang) => `<section class="section cta-band"><div class="wrap">
  <h2>${t.ctaBand.title}</h2><p>${t.ctaBand.lead}</p>
  <div class="actions"><a class="btn btn--accent" href="${path(lang, "contact")}">${t.quote}</a><a class="link-arrow" href="${B.phoneHref}">${B.phone}</a></div>
</div></section>`;

// ---------- Pages ----------
function home(t, lang) {
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 6);
  return `
<section class="hero">
  <div class="hero__text"><div class="wrap-left">
    <span class="eyebrow">${t.hero.eyebrow}</span>
    <h1>${t.hero.title}</h1>
    <p class="lead">${t.hero.lead}</p>
    <p class="hero__note">${t.hero.note}</p>
    <div class="actions">
      <a class="btn btn--primary" href="${path(lang, "contact")}">${t.quote}</a>
      <a class="link-arrow" href="${path(lang, "projects")}">${t.viewWork}</a>
    </div>
  </div></div>
  <div class="hero__img">${img(IMG.hero.src, t.hero.alt, { w: IMG.hero.w, h: IMG.hero.h, eager: true, sizes: "(max-width: 860px) 100vw, 58vw" })}</div>
</section>
<div class="strip"><div class="wrap"><ul>${t.strip.map((s) => `<li>${s}</li>`).join("")}</ul></div></div>

<section class="section section--white"><div class="wrap">
  <div class="section-head"><h2>${t.made.title}</h2><p>${t.made.sub}</p></div>
  <div class="cards">
    ${t.made.cards.map((c) => `<a class="card" href="${path(lang, "projects")}?cat=${c.cat}">
      <div class="card__img">${img(IMG[c.key].src, c.t, { w: IMG[c.key].w, h: IMG[c.key].h })}</div>
      <h3>${c.t}</h3><p>${c.d}</p><span class="link-arrow link-arrow--accent">${t.explore}</span></a>`).join("\n    ")}
  </div>
  <hr style="border:0;border-top:1px solid var(--line);margin:clamp(48px,7vw,80px) 0 40px">
  <h2>${t.process.title}</h2>
  <div class="steps">${t.process.steps.map(([a, b], i) => `<div class="step"><b><span>0${i + 1}</span>${a}</b><p>${b}</p></div>`).join("")}</div>
</div></section>

<section class="section"><div class="wrap split">
  <div class="split__img split__img--tall">${img(IMG.trim.src, t.trim.alt, { w: IMG.trim.w, h: IMG.trim.h })}</div>
  <div>
    <span class="eyebrow">${t.trim.eyebrow}</span>
    <h2>${t.trim.title}</h2>
    <p class="lead" style="max-width:52ch">${t.trim.lead}</p>
    <div class="groups">${t.trim.groups.map(([a, b]) => `<div><b>${a}</b><p>${b}</p></div>`).join("")}</div>
    <div class="actions">
      <a class="btn btn--primary" href="${path(lang, "contact")}?service=trim">${t.trim.cta}</a>
      <a class="link-arrow" href="${path(lang, "projects")}?cat=trim">${t.trim.view}</a>
    </div>
  </div>
</div></section>

<section class="section section--white"><div class="wrap">
  <div class="section-head"><h2>${t.featured.title}</h2><p>${t.featured.sub}</p></div>
  <div class="gallery">
    ${featured.map((p) => `<a class="card" href="${path(lang, "projects")}?cat=${p.cat}"><div class="card__img">${img(p.src, p[lang])}</div><h3 style="font-size:1.15rem">${p[lang]}</h3></a>`).join("\n    ")}
  </div>
  <div class="actions"><a class="btn btn--ghost" href="${path(lang, "projects")}">${t.featured.all}</a></div>
</div></section>

${showroomSection(t, lang)}
${teamSection(t, lang)}
${trustSection(t)}
${faqSection(t)}
${ctaBand(t, lang)}`;
}

function services(t, lang) {
  const s = t.services;
  return `${pageHero(s.title, s.lead)}
<section class="section--white"><div class="wrap">
  ${s.list.map((x) => {
    const pic = x.img ? IMG[x.img].src : x.src;
    return `<article class="service" id="${x.id}">
    <div class="service__img">${img(pic, x.t)}</div>
    <div>
      <h2>${x.t}</h2><p class="muted">${x.d}</p>
      <ul class="ticks">${x.items.map((i) => `<li>${i}</li>`).join("")}</ul>
      <div class="actions"><a class="btn btn--primary" href="${path(lang, "contact")}?service=${x.id === "finish" ? "trim" : x.id === "cabinets" ? "kitchens" : x.id}">${s.quote}</a></div>
    </div>
  </article>`;
  }).join("\n  ")}
</div></section>
${trustSection(t)}
${ctaBand(t, lang)}`;
}

function projects(t, lang) {
  const s = t.projects;
  const counts = PROJECTS.reduce((m, p) => ((m[p.cat] = (m[p.cat] || 0) + 1), m), {});
  return `${pageHero(s.title, s.lead)}
<section class="section"><div class="wrap">
  <div class="filters" role="group" aria-label="${s.title}">
    <button class="filter" type="button" data-cat="all" aria-pressed="true">${s.all} (${PROJECTS.length})</button>
    ${Object.entries(s.cats).map(([k, v]) => `<button class="filter" type="button" data-cat="${k}" aria-pressed="false">${v} (${counts[k] || 0})</button>`).join("\n    ")}
  </div>
  <div class="gallery">
    ${PROJECTS.map((p) => `<figure class="tile" data-cat="${p.cat}">
      <button type="button" data-full="${esc(src(p.src))}" data-alt="${esc(p[lang])}" aria-label="${esc(s.open + ": " + p[lang])}"><div class="card__img">${img(p.src, p[lang])}</div></button>
      <figcaption><small>${s.cats[p.cat]}</small>${p[lang]}</figcaption>
    </figure>`).join("\n    ")}
  </div>
</div></section>
<dialog class="lightbox" id="lightbox" aria-label="${s.title}">
  <button class="lightbox__close" type="button" aria-label="${t.close}">×</button>
  <img alt=""><p></p>
</dialog>
${ctaBand(t, lang)}`;
}

function about(t, lang) {
  const s = t.about;
  return `${pageHero(s.title, s.lead)}
${teamSection(t, lang, { linkAbout: false })}
<section class="section section--white"><div class="wrap split split--reverse">
  <div class="prose">
    <h2 style="margin-top:0">${s.storyT}</h2><p>${s.story}</p>
    <h2>${s.missionT}</h2><p>${s.mission}</p>
  </div>
  <div class="split__img">${img(IMG.closets.src, t.made.cards[1].t, { w: IMG.closets.w, h: IMG.closets.h })}</div>
</div></section>
<section class="section"><div class="wrap">
  <h2>${s.valuesT}</h2>
  <div class="values" style="margin-top:32px">${s.values.map(([a, b]) => `<div><b>${a}</b><p>${b}</p></div>`).join("")}</div>
</div></section>
${showroomSection(t, lang)}
${ctaBand(t, lang)}`;
}

function contact(t, lang) {
  const c = t.contact, f = c.form;
  const field = (id, label, input, full = false, req = true) =>
    `<div class="field${full ? " field--full" : ""}"><label for="${id}">${label}${req ? ` <span aria-hidden="true">*</span><span class="skip">(${f.required})</span>` : ""}</label>${input}<span class="error" id="${id}-error" aria-live="polite"></span></div>`;
  return `<section class="section"><div class="wrap contact-grid">
  <div>
    <h1 style="font-size:clamp(2.2rem,4.4vw,3.2rem)">${c.title}</h1>
    <p class="lead">${c.lead}</p>
    <dl class="info-list" style="margin-top:36px">
      <div><dt>${c.callT}</dt><dd><a class="contact-big" href="${B.phoneHref}">${B.phone}</a></dd></div>
      <div><dt>${c.visitT}</dt><dd>${addressHtml}</dd></div>
      <div><dt>${t.showroom.hours}</dt><dd>${t.hoursShort}</dd></div>
      <div><dt>${c.emailT}</dt><dd><a href="mailto:${B.emailLink}">${B.emailShown}</a></dd></div>
    </dl>
    <div class="actions"><a class="link-arrow link-arrow--accent" href="${mapsLink}" rel="noopener" target="_blank">${c.directions}</a></div>
  </div>
  <form class="form" id="quote-form" method="post" action="${FORM_ENDPOINT || "mailto:" + B.emailLink}" enctype="multipart/form-data" novalidate
        data-endpoint="${FORM_ENDPOINT}" data-mailto="${B.emailLink}" data-msgs="${esc(JSON.stringify(f.msgs))}">
    ${field("fullname", f.name, `<input id="fullname" name="fullname" autocomplete="name" required aria-describedby="fullname-error">`)}
    ${field("email", f.email, `<input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-error">`)}
    ${field("phone", f.phone, `<input id="phone" name="phone" type="tel" autocomplete="tel" aria-describedby="phone-error">`, false, false)}
    ${field("city", f.city, `<input id="city" name="city" autocomplete="address-level2" required aria-describedby="city-error">`)}
    ${field("service", f.type, `<select id="service" name="service" required aria-describedby="service-error"><option value="">${f.typePh}</option>${f.types.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select>`, true)}
    ${field("message", f.msg, `<textarea id="message" name="message" placeholder="${f.msgPh}" required aria-describedby="message-error"></textarea>`, true)}
    ${FORM_ENDPOINT ? field("photos", f.photos, `<input id="photos" name="photos" type="file" accept="image/*" multiple aria-describedby="photos-error photos-hint"><small class="muted" id="photos-hint">${f.photosHint}</small>`, true, false) : ""}
    <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">
    <div class="form__foot"><button class="btn btn--primary" type="submit">${f.send}</button><small>${f.privacy}</small></div>
    <div class="form-status" role="status" aria-live="polite"></div>
  </form>
</div></section>
${showroomSection(t, lang)}
<section class="section section--white"><div class="wrap">
  <h2>${c.areasT}</h2>
  <ul class="cities" style="margin-top:24px">${CITIES.map((x) => `<li>${x}, TX</li>`).join("")}</ul>
</div></section>
${faqSection(t)}`;
}

function notFound(t, lang) {
  return `${pageHero(t.notFound.title, t.notFound.lead, "404")}
<section class="section"><div class="wrap"><a class="btn btn--primary" href="${path(lang, "home")}">${t.notFound.home}</a></div></section>`;
}

// ---------- Write ----------
const RENDER = { home, services, projects, about, contact };
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });

const write = (rel, html) => {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

for (const lang of ["en", "es"]) {
  const t = T[lang];
  for (const page of PAGES) {
    write(fileFor(lang, page), head(t, page, lang) + header(t, page, lang) + RENDER[page](t, lang) + footer(t, lang));
  }
}
write("404.html", head(T.en, "404", "en") + header(T.en, "404", "en") + notFound(T.en, "en") + footer(T.en, "en"));

cpSync(join(ROOT, "src", "assets"), join(OUT, "assets"), { recursive: true });
if (existsSync(join(ROOT, "src", "img"))) cpSync(join(ROOT, "src", "img"), join(OUT, "img"), { recursive: true });

const today = new Date().toISOString().slice(0, 10);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${["en", "es"].flatMap((lang) => PAGES.map((p) => `  <url><loc>${SITE_URL + path(lang, p)}</loc><lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL + path("en", p)}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE_URL + path("es", p)}"/>
  </url>`)).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// Apache / LiteSpeed (Hostinger) settings: HTTPS, canonical host, 404 page, caching, compression.
const host = new URL(SITE_URL).host;
write(".htaccess", `Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^ https://${host}%{REQUEST_URI} [L,R=301]
  # www → ${host}
  RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
  RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]
  # Old URLs from the previous site
  RewriteRule ^home/?$ / [L,R=301]
  # /about.html → /about  and  /es/index.html → /es/
  RewriteCond %{THE_REQUEST} \\s/+(.*/)?index\\.html[\\s?] [NC]
  RewriteRule ^ /%1 [L,R=301]
  RewriteCond %{THE_REQUEST} \\s/+([^?\\s]+)\\.html[\\s?] [NC]
  RewriteRule ^ /%1 [L,R=301]
  # /about/ → /about  (trailing slash only for real folders like /es/)
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.+)/$ /$1 [L,R=301]
  # Serve /about from about.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{DOCUMENT_ROOT}/$1.html -f
  RewriteRule ^(.+)$ /$1.html [L]
</IfModule>

<IfModule mod_mime.c>
  AddType image/webp .webp
  AddType image/avif .avif
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/xml text/plain image/svg+xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 hour"
  ExpiresByType text/html "access plus 0 seconds"
  # CSS/JS links carry ?v=<build> so they can be cached for a year
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/jpeg "access plus 30 days"
</IfModule>
`);

console.log("Built", PAGES.length * 2 + 1, "pages → dist/");

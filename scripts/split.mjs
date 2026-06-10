// One-shot migration: split the legacy single-file index.html (hash-routed SPA)
// into an Astro multi-page site. Reads index.html, writes src/.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// ---------------------------------------------------------------------------
// Page metadata: URL + hand-written SEO meta for core pages.
// Blog posts get title/description auto-extracted from their hero copy.
// ---------------------------------------------------------------------------
const PAGES = {
  'page-home': {
    url: '/',
    title: 'AymanCare — Primary & Urgent Care in Dallas–Fort Worth',
    desc: 'Need a doctor in Dallas–Fort Worth? AymanCare delivers same-day primary care, urgent care & pediatrics at 4 neighborhood clinics. Walk-ins always welcome.',
  },
  'page-services': {
    url: '/services/',
    title: 'Medical Services — Primary, Urgent & Pediatric Care | AymanCare',
    desc: 'Primary care, walk-in urgent care, pediatrics, allergy treatment, weight loss programs, flu care and COVID-19 testing at four Dallas–Fort Worth clinics.',
    crumb: 'Services',
  },
  'page-about': {
    url: '/about/',
    title: 'About AymanCare — Dr. Ajaz Khan & Our Team',
    desc: 'Meet Dr. Ajaz Khan, MD and the AymanCare team. Compassionate primary and urgent care serving Dallas, North Richland Hills, Mesquite and Valley Ranch since 2013.',
    crumb: 'About',
  },
  'page-locations': {
    url: '/locations/',
    title: 'Our Locations — 4 Clinics Across Dallas–Fort Worth | AymanCare',
    desc: 'Find your nearest AymanCare clinic: Dallas (N Buckner Blvd), North Richland Hills, Mesquite and Valley Ranch in Irving. Walk-ins welcome at every location.',
    crumb: 'Locations',
  },
  'page-contact': {
    url: '/contact/',
    title: 'Contact AymanCare — Phone Numbers, Addresses & Hours',
    desc: 'Call or visit any of our four Dallas–Fort Worth clinics. Phone numbers, addresses and opening hours for AymanCare Dallas, NRH, Mesquite and Valley Ranch.',
    crumb: 'Contact',
  },
  'page-location-dallas': {
    url: '/locations/dallas/',
    title: 'Urgent Care & Primary Care in Dallas, TX — N Buckner Blvd | AymanCare',
    desc: 'Walk-in urgent care and primary care on N Buckner Blvd in East Dallas. Serving White Rock, Lakewood and Casa Linda. Call (214) 328-7400 — walk-ins welcome.',
    crumb: 'Dallas', parent: 'page-locations', clinic: 'dallas',
  },
  'page-location-nrh': {
    url: '/locations/north-richland-hills/',
    title: 'Urgent Care & Primary Care in North Richland Hills, TX | AymanCare',
    desc: 'Walk-in urgent care and primary care at 8208 Bedford Euless Rd, North Richland Hills. Serving Hurst, Euless and Bedford. Call (817) 581-5959.',
    crumb: 'North Richland Hills', parent: 'page-locations', clinic: 'nrh',
  },
  'page-location-mesquite': {
    url: '/locations/mesquite/',
    title: 'Urgent Care & Primary Care in Mesquite, TX — I-30 E | AymanCare',
    desc: 'Walk-in urgent care and primary care at 3400 I-30 E in Mesquite. Serving Sunnyvale, Balch Springs and East Dallas County. Call (972) 288-9747.',
    crumb: 'Mesquite', parent: 'page-locations', clinic: 'mesquite',
  },
  'page-location-valley': {
    url: '/locations/valley-ranch/',
    title: 'Urgent Care & Primary Care in Valley Ranch, Irving TX | AymanCare',
    desc: 'Walk-in urgent care and primary care at 10009 N MacArthur Blvd in Valley Ranch, Irving. Serving Las Colinas and Coppell. Call (469) 913-7043.',
    crumb: 'Valley Ranch', parent: 'page-locations', clinic: 'valley-ranch',
  },
  'page-primary-care': {
    url: '/services/primary-care/',
    title: 'Primary Care Doctor in Dallas–Fort Worth | AymanCare',
    desc: 'Annual physicals, preventive screenings and chronic care management from a primary care team at four DFW locations. Medicare and Tricare accepted.',
    crumb: 'Primary Care', parent: 'page-services',
  },
  'page-walk-in': {
    url: '/services/walk-in-urgent-care/',
    title: 'Walk-In Urgent Care in Dallas–Fort Worth — No Appointment Needed | AymanCare',
    desc: 'Same-day walk-in urgent care for illness and minor injuries at four Dallas-area clinics. No appointment needed — just show up during business hours.',
    crumb: 'Walk-In Urgent Care', parent: 'page-services',
  },
  'page-pediatric-care': {
    url: '/services/pediatric-care/',
    title: 'Pediatric Care in Dallas–Fort Worth — Kids & Teens | AymanCare',
    desc: 'Well-child checkups, school physicals, sick visits and vaccinations for children of all ages at four Dallas–Fort Worth clinics.',
    crumb: 'Pediatric Care', parent: 'page-services',
  },
  'page-flu': {
    url: '/services/flu-treatment/',
    title: 'Flu Symptoms & Treatment in Dallas–Fort Worth | AymanCare',
    desc: 'Fever, cough, body aches? Get same-day flu testing and treatment at AymanCare. Four DFW clinics, walk-ins welcome.',
    crumb: 'Flu Symptoms', parent: 'page-services',
  },
  'page-allergy': {
    url: '/services/allergy-treatment/',
    title: 'Allergy Testing & Treatment in Dallas–Fort Worth | AymanCare',
    desc: 'Dallas is one of the toughest allergy regions in the country. Get allergy evaluation and treatment plans at four AymanCare clinics across DFW.',
    crumb: 'Allergy Treatment', parent: 'page-services',
  },
  'page-weight-loss': {
    url: '/services/weight-loss/',
    title: 'Medical Weight Loss Program in Dallas–Fort Worth | AymanCare',
    desc: 'Physician-supervised weight loss with real medical support — not fad diets. Personalized plans at four Dallas–Fort Worth clinics.',
    crumb: 'Weight Loss', parent: 'page-services',
  },
  'page-covid': {
    url: '/services/covid-19-testing/',
    title: 'COVID-19 Testing in Dallas–Fort Worth — Walk In Today | AymanCare',
    desc: 'Same-day COVID-19 testing at four Dallas–Fort Worth locations. Walk in or book online — results explained by a provider.',
    crumb: 'COVID-19 Testing', parent: 'page-services',
  },
  'page-blog': {
    url: '/blog/',
    title: 'Health Blog — Tips From Your Dallas–Fort Worth Doctors | AymanCare',
    desc: 'Practical health advice from the AymanCare team: seasonal illness, pediatrics, allergies, insurance tips and more for DFW families.',
    crumb: 'Blog',
  },
  'page-book-online': {
    url: '/book-online/',
    title: 'Book an Appointment Online | AymanCare Dallas–Fort Worth',
    desc: 'Request an appointment at any AymanCare clinic — Dallas, North Richland Hills, Mesquite or Valley Ranch. Confirmed within one business hour.',
    crumb: 'Book Online',
  },
  'page-insurance': {
    url: '/insurance/',
    title: 'Insurance & Billing — Plans We Accept | AymanCare',
    desc: 'AymanCare accepts most major insurance including Medicare, Medicaid, Tricare, Aetna, BCBS, Cigna and UnitedHealthcare. HSA/FSA welcome.',
    crumb: 'Insurance', faq: true,
  },
  'page-thank-you': {
    url: '/thank-you/',
    title: 'Request Received | AymanCare',
    desc: 'Thank you — your appointment request has been received. A team member will confirm within one business hour.',
    noindex: true,
  },
  'page-privacy': {
    url: '/privacy/',
    title: 'Notice of Privacy Practices | AymanCare',
    desc: 'How AymanCare uses and protects your medical information, and your rights under HIPAA.',
    crumb: 'Privacy',
  },
  // Blog articles — title/desc auto-extracted from page hero
  'page-heart-month':            { url: '/blog/heart-health-month/', blog: true },
  'page-why-primary-care':       { url: '/blog/why-primary-care/', blog: true },
  'page-annual-physical':        { url: '/blog/annual-physical/', blog: true },
  'page-cold-flu-covid':         { url: '/blog/cold-flu-or-covid/', blog: true },
  'page-dallas-allergy':         { url: '/blog/dallas-allergy-guide/', blog: true },
  'page-when-to-bring-child-in': { url: '/blog/when-to-bring-child-in/', blog: true },
  'page-sustainable-weight-loss':{ url: '/blog/sustainable-weight-loss/', blog: true },
  'page-insurance-benefits':     { url: '/blog/insurance-benefits/', blog: true },
  'page-er-vs-urgent-care':      { url: '/blog/er-vs-urgent-care/', blog: true },
  'page-five-habits':            { url: '/blog/five-healthy-habits/', blog: true },
  'page-four-clinics':           { url: '/blog/four-clinics-one-team/', blog: true },
};

// ---------------------------------------------------------------------------
// Extract document chunks
// ---------------------------------------------------------------------------
let css = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>'));
let navHTML = src.slice(src.indexOf('<body>') + 6, src.indexOf('<main>'));
const mainHTML = src.slice(src.indexOf('<main>') + 6, src.indexOf('</main>'));
let footerHTML = src.slice(src.indexOf('<footer>'), src.indexOf('</footer>') + 9);

function extractPages(html) {
  const out = {};
  const re = /<div class="demo-page" id="(page-[a-z-]+)"[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    let depth = 1;
    const tagRe = /<div\b|<\/div>/g;
    tagRe.lastIndex = m.index + m[0].length;
    let t;
    while ((t = tagRe.exec(html))) {
      depth += t[0] === '</div>' ? -1 : 1;
      if (depth === 0) {
        out[m[1]] = html.slice(m.index + m[0].length, t.index);
        break;
      }
    }
  }
  return out;
}
const pages = extractPages(mainHTML);

const missing = Object.keys(PAGES).filter((id) => !(id in pages));
const unmapped = Object.keys(pages).filter((id) => !(id in PAGES));
if (missing.length || unmapped.length) {
  throw new Error(`page mismatch — missing: ${missing} unmapped: ${unmapped}`);
}

// ---------------------------------------------------------------------------
// Shared transforms
// ---------------------------------------------------------------------------
function rewrite(html) {
  return html
    .replace(/href="#(page-[a-z-]+)"/g, (m, id) => (PAGES[id] ? `href="${PAGES[id].url}"` : m))
    .replace(/src="images\//g, 'src="/images/')
    .replace(/src="team-photo-v2\.png"/g, 'src="/images/team-photo-v2.png"')
    .replace(/Ayman Care /g, 'AymanCare ')
    .replace(/<svg (?![^>]*aria-)/g, '<svg aria-hidden="true" ');
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractTitle(content) {
  const m = content.match(/<h[12] class="page-title[^>]*>([\s\S]*?)<\/h[12]>/);
  return m ? stripTags(m[1]).replace(/\s*\.$/, '') : null;
}
function extractSubtitle(content) {
  const m = content.match(/<p class="page-subtitle[^>]*>([\s\S]*?)<\/p>/);
  if (!m) return null;
  let s = stripTags(m[1]);
  if (s.length > 158) s = s.slice(0, 155).replace(/\s+\S*$/, '') + '…';
  return s;
}

// ---------------------------------------------------------------------------
// CSS: strip hash-routing rules, fix contrast, add a11y styles
// ---------------------------------------------------------------------------
css = css.replace(/\/\* Demo page switcher \*\/[\s\S]*?\.demo-page\.active[^}]*}\n/, '');
css = css.replaceAll('rgba(255,255,255,0.5)', 'rgba(255,255,255,0.75)');
css = css.replaceAll('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.82)');
css += `

/* ---- Accessibility additions (multi-page migration) ---- */
.skip-link {
  position: absolute;
  top: -48px;
  left: 12px;
  z-index: 2000;
  background: var(--blue-deep);
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  transition: top 0.15s;
}
.skip-link:focus { top: 12px; }
a:focus-visible, button:focus-visible {
  outline: 3px solid var(--blue);
  outline-offset: 2px;
  border-radius: 4px;
}
.form-fields input:focus-visible, .form-fields select:focus-visible, .form-fields textarea:focus-visible {
  box-shadow: 0 0 0 3px var(--blue-line);
}
`;
fs.mkdirSync(path.join(ROOT, 'src/styles'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/styles/global.css'), css);

// ---------------------------------------------------------------------------
// Per-page content transforms
// ---------------------------------------------------------------------------
for (const [id, meta] of Object.entries(PAGES)) {
  let content = pages[id];

  // Promote the page hero title to h1 (home already has its own h1)
  if (id !== 'page-home') {
    content = content.replace(
      /<h2 class="page-title([\s\S]*?)<\/h2>/,
      (m, rest) => `<h1 class="page-title${rest}</h1>`
    );
  }

  if (meta.blog) {
    meta.title = `${extractTitle(content) ?? id} | AymanCare Blog`;
    meta.desc = extractSubtitle(content) ?? PAGES['page-blog'].desc;
    meta.crumb = extractTitle(content);
    meta.parent = 'page-blog';
  }

  // Booking form: associate labels with inputs, send users to /thank-you/
  if (id === 'page-book-online') {
    const fields = {
      'First name': 'first-name', 'Last name': 'last-name', Email: 'email',
      Phone: 'phone', 'Preferred location': 'location', 'Reason for visit': 'reason',
      'Additional notes (optional)': 'notes',
    };
    for (const [label, name] of Object.entries(fields)) {
      content = content
        .replace(`<label>${label}</label>`, `<label for="f-${name}">${label}</label>`)
        .replace(`name="${name}"`, `name="${name}" id="f-${name}"`);
    }
    content = content.replace(
      'method="POST" enctype="multipart/form-data"',
      'method="POST" action="/thank-you/" enctype="multipart/form-data"'
    );
  }

  pages[id] = rewrite(content);
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------
const SITE = 'https://aymancare.com';
const CLINICS = {
  dallas: {
    name: 'AymanCare — Dallas', url: `${SITE}/locations/dallas/`, tel: '+12143287400',
    street: 'N Buckner Blvd', city: 'Dallas', zip: '75218', closes: '16:00',
    geo: { latitude: 32.8296, longitude: -96.6891 },
    sameAs: 'https://share.google/r68RxahU9wK78SchP',
  },
  nrh: {
    name: 'AymanCare — North Richland Hills', url: `${SITE}/locations/north-richland-hills/`, tel: '+18175815959',
    street: '8208 Bedford Euless Rd', city: 'North Richland Hills', zip: '76180', closes: '17:00',
    sameAs: 'https://share.google/WqfsdISLFMnBLnNVY',
  },
  mesquite: {
    name: 'AymanCare — Mesquite', url: `${SITE}/locations/mesquite/`, tel: '+19722889747',
    street: '3400 I-30 E', city: 'Mesquite', zip: '75150', closes: '17:00',
    sameAs: 'https://share.google/xzjU1sVIsuyLOqynI',
  },
  'valley-ranch': {
    name: 'AymanCare — Valley Ranch', url: `${SITE}/locations/valley-ranch/`, tel: '+14699137043',
    street: '10009 N MacArthur Blvd', city: 'Irving', zip: '75063', closes: '16:00',
    sameAs: 'https://share.google/O7Pri9B62mYRXkt9E',
  },
};

function clinicSchema(key) {
  const c = CLINICS[key];
  return {
    '@type': 'MedicalClinic',
    '@id': `${c.url}#clinic`,
    name: c.name,
    parentOrganization: { '@id': `${SITE}/#organization` },
    url: c.url,
    telephone: c.tel,
    image: `${SITE}/images/clinic-exterior.jpeg`,
    address: {
      '@type': 'PostalAddress', streetAddress: c.street, addressLocality: c.city,
      addressRegion: 'TX', postalCode: c.zip, addressCountry: 'US',
    },
    ...(c.geo ? { geo: { '@type': 'GeoCoordinates', ...c.geo } } : {}),
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00', closes: c.closes,
    }],
    medicalSpecialty: ['PrimaryCare', 'Pediatric'],
    sameAs: [c.sameAs],
  };
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Do I need a referral to visit AymanCare?', acceptedAnswer: { '@type': 'Answer', text: 'Most insurance plans do not require a referral for primary care or urgent care visits. If your plan is an HMO that requires referrals for specialist visits, we can help coordinate that during your appointment.' } },
    { '@type': 'Question', name: "What if my insurance isn't listed?", acceptedAnswer: { '@type': 'Answer', text: "We work with many plans beyond those listed above. Call your nearest clinic and we'll check your specific plan. We're continually adding new insurance partnerships." } },
    { '@type': 'Question', name: 'Can I use my HSA or FSA at AymanCare?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. We accept Health Savings Account (HSA) and Flexible Spending Account (FSA) cards for copays, deductibles, and self-pay visits.' } },
    { '@type': 'Question', name: 'Do you offer payment plans?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. If you have a balance after insurance processing, we can arrange a payment plan that works for your budget. Just speak with our front desk team.' } },
  ],
};

function breadcrumbSchema(id) {
  const meta = PAGES[id];
  if (!meta.crumb || meta.url === '/') return null;
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` }];
  if (meta.parent && PAGES[meta.parent]) {
    const p = PAGES[meta.parent];
    items.push({ '@type': 'ListItem', position: 2, name: p.crumb, item: `${SITE}${p.url}` });
  }
  items.push({ '@type': 'ListItem', position: items.length + 1, name: meta.crumb, item: `${SITE}${meta.url}` });
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

function headExtras(id) {
  const meta = PAGES[id];
  const schemas = [];
  if (id === 'page-home') {
    for (const key of Object.keys(CLINICS)) {
      schemas.push({ '@context': 'https://schema.org', ...clinicSchema(key) });
    }
  }
  if (meta.clinic) schemas.push({ '@context': 'https://schema.org', ...clinicSchema(meta.clinic) });
  if (meta.faq) schemas.push(FAQ_SCHEMA);
  const bc = breadcrumbSchema(id);
  if (bc) schemas.push(bc);
  return schemas
    .map((s) => `  <script type="application/ld+json" is:inline set:html={${JSON.stringify(JSON.stringify(s))}} />`)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalOrganization',
      '@id': `${SITE}/#organization`,
      name: 'AymanCare',
      alternateName: 'AymanCare Medical Clinic',
      url: `${SITE}/`,
      logo: `${SITE}/images/logo.png`,
      image: `${SITE}/images/hero-doctor.jpg`,
      description: 'AymanCare provides compassionate primary and urgent care for the Dallas–Fort Worth community across four locations since 2013.',
      telephone: '+12143287400',
      medicalSpecialty: ['PrimaryCare', 'Pediatric'],
      sameAs: Object.values(CLINICS).map((c) => c.sameAs),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name: 'AymanCare',
      description: 'Primary care, urgent care, and pediatrics across four Dallas-area clinics.',
      publisher: { '@id': `${SITE}/#organization` },
    },
  ],
};

const hashRedirectMap = Object.fromEntries(Object.entries(PAGES).map(([id, m]) => [id, m.url]));

const SITE_JS = `
(function(){
  // Reveal fade-in elements as they enter the viewport
  var els = document.querySelectorAll('.fade-in');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el){ io.observe(el); });
  }

  // ---- Mobile menu ----
  var hamburger = document.querySelector('.nav-hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  var overlay = document.getElementById('mobile-overlay');

  function openMobileMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      if (mobileMenu.classList.contains('open')) closeMobileMenu();
      else openMobileMenu();
    });
    overlay.addEventListener('click', closeMobileMenu);
    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }
})();

// ---- Booking widget: remember selections, hand off to the book-online form ----
(function(){
  var serviceGrid   = document.getElementById('booking-service-grid');
  var locationGrid  = document.getElementById('booking-location-grid');
  var timeGrid      = document.getElementById('booking-time-grid');
  var sumService    = document.getElementById('sum-service');
  var sumLocation   = document.getElementById('sum-location');
  var sumTime       = document.getElementById('sum-time');
  var confirmBtn    = document.getElementById('confirm-booking-btn');

  var selected = { service: 'Primary care', location: 'Dallas', time: '2:15 PM' };
  var serviceMap = {
    'Primary care':     'Primary care — annual physical',
    'Walk-in urgent':   'Walk-in / urgent',
    'Pediatric visit':  'Pediatric visit',
    'Something else':   ''
  };

  function wireGrid(grid, onSelect) {
    if (!grid) return;
    grid.querySelectorAll('.opt').forEach(function(opt) {
      opt.addEventListener('click', function() {
        grid.querySelectorAll('.opt').forEach(function(o){ o.classList.remove('selected'); });
        opt.classList.add('selected');
        var val = opt.querySelector('h4').textContent.trim();
        if (onSelect) onSelect(val);
      });
    });
  }
  wireGrid(serviceGrid, function(val) {
    selected.service = val;
    if (sumService) sumService.innerHTML = '<em>' + val + '</em>';
  });
  wireGrid(locationGrid, function(val) {
    selected.location = val;
    if (sumLocation) sumLocation.textContent = val;
  });
  if (timeGrid) {
    timeGrid.querySelectorAll('.time').forEach(function(t) {
      t.addEventListener('click', function() {
        timeGrid.querySelectorAll('.time').forEach(function(x){ x.classList.remove('selected'); });
        t.classList.add('selected');
        selected.time = t.textContent.trim();
        if (sumTime) sumTime.textContent = selected.time;
      });
    });
  }
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
      try { sessionStorage.setItem('ac-booking', JSON.stringify({ service: serviceMap[selected.service] || '', location: selected.location })); } catch (e) {}
      window.location.href = '/book-online/';
    });
  }

  // On the book-online page: pre-fill from a widget hand-off
  var boForm = document.forms['book-online'];
  if (boForm) {
    try {
      var stored = sessionStorage.getItem('ac-booking');
      if (stored) {
        sessionStorage.removeItem('ac-booking');
        var pick = JSON.parse(stored);
        var locSel = boForm.querySelector('select[name="location"]');
        var reasonSel = boForm.querySelector('select[name="reason"]');
        if (locSel && pick.location) {
          for (var i = 0; i < locSel.options.length; i++) {
            if (locSel.options[i].value === pick.location) { locSel.selectedIndex = i; break; }
          }
        }
        if (reasonSel && pick.service) {
          for (var j = 0; j < reasonSel.options.length; j++) {
            if (reasonSel.options[j].text === pick.service) { reasonSel.selectedIndex = j; break; }
          }
        }
      }
    } catch (e) {}
  }
})();

// ---- File upload drag-and-drop ----
(function(){
  var drop = document.getElementById('upload-drop');
  var input = document.getElementById('upload-input');
  var fileList = document.getElementById('upload-file-list');
  var dropInner = document.getElementById('upload-drop-inner');
  if (!drop || !input) return;

  var selectedFiles = [];

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function renderFiles() {
    fileList.innerHTML = '';
    if (selectedFiles.length === 0) {
      dropInner.style.display = 'flex';
      return;
    }
    dropInner.style.display = 'none';
    selectedFiles.forEach(function(f, i) {
      var item = document.createElement('div');
      item.className = 'upload-file-item';
      item.innerHTML =
        '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
        '<span>' + f.name + '</span>' +
        '<span class="upload-file-size">' + formatSize(f.size) + '</span>' +
        '<button type="button" class="upload-file-remove" data-idx="' + i + '" aria-label="Remove file">' +
          '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>';
      fileList.appendChild(item);
    });
    fileList.querySelectorAll('.upload-file-remove').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-idx'));
        selectedFiles.splice(idx, 1);
        syncInput();
        renderFiles();
      });
    });
  }

  function syncInput() {
    var dt = new DataTransfer();
    selectedFiles.forEach(function(f) { dt.items.add(f); });
    input.files = dt.files;
  }

  function addFiles(files) {
    Array.from(files).forEach(function(f) {
      if (f.size <= 10 * 1024 * 1024) selectedFiles.push(f);
    });
    syncInput();
    renderFiles();
  }

  input.addEventListener('change', function() { addFiles(input.files); });
  drop.addEventListener('dragover', function(e) {
    e.preventDefault();
    drop.classList.add('drag-over');
  });
  drop.addEventListener('dragleave', function() { drop.classList.remove('drag-over'); });
  drop.addEventListener('drop', function(e) {
    e.preventDefault();
    drop.classList.remove('drag-over');
    addFiles(e.dataTransfer.files);
  });
  drop.addEventListener('click', function(e) {
    if (e.target.closest('.upload-file-remove')) return;
    input.click();
  });
  drop.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });
})();
`;

const layout = `---
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  noindex?: boolean;
}
const { title, description, noindex = false } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL('/images/hero-doctor.jpg', Astro.site);
const orgSchema = ${JSON.stringify(JSON.stringify(ORG_SCHEMA))};
---
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content={description}>
{noindex ? <meta name="robots" content="noindex" /> : <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}
<link rel="canonical" href={canonical}>

<meta property="og:type" content="website">
<meta property="og:site_name" content="AymanCare">
<meta property="og:title" content={title}>
<meta property="og:description" content={description}>
<meta property="og:url" content={canonical}>
<meta property="og:image" content={ogImage}>
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content={title}>
<meta name="twitter:description" content={description}>
<meta name="twitter:image" content={ogImage}>

<meta name="theme-color" content="#3888c8">
<link rel="icon" type="image/png" href="/images/logo.png">
<link rel="apple-touch-icon" href="/images/logo.png">
<link rel="sitemap" href="/sitemap-index.xml">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

<script type="application/ld+json" is:inline set:html={orgSchema} />
<script is:inline>
// Redirect legacy hash-routed URLs (aymancare.com/#page-x) to their new pages
(function(){
  var map = ${JSON.stringify(hashRedirectMap)};
  var h = location.hash.replace('#', '');
  if (map[h] && map[h] !== location.pathname) location.replace(map[h]);
})();
</script>
<slot name="head" />
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${rewrite(navHTML).trim()}

<main id="main">
<slot />
</main>

${rewrite(footerHTML).trim()}

<script is:inline>
${SITE_JS.trim()}
</script>
</body>
</html>
`;

fs.mkdirSync(path.join(ROOT, 'src/layouts'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/layouts/Base.astro'), layout);

// ---------------------------------------------------------------------------
// Page files
// ---------------------------------------------------------------------------
function pageFilePath(url) {
  if (url === '/') return 'src/pages/index.astro';
  const parts = url.replace(/^\/|\/$/g, '').split('/');
  // Section landing pages (/services/, /blog/ …) become index.astro in their dir
  const isLanding = Object.values(PAGES).some(
    (m) => m.url !== url && m.url.startsWith(url) && url.split('/').length < m.url.split('/').length
  );
  if (isLanding || parts.length === 1) {
    return `src/pages/${parts.join('/')}/index.astro`;
  }
  return `src/pages/${parts.slice(0, -1).join('/')}/${parts.at(-1)}.astro`;
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

for (const [id, meta] of Object.entries(PAGES)) {
  const file = pageFilePath(meta.url);
  const depth = file.split('/').length - 2; // segments below src/pages
  const layoutImport = '../'.repeat(depth) + 'layouts/Base.astro';
  const extras = headExtras(id);
  const astro = `---
import Base from '${layoutImport}';
---
<Base
  title="${escapeAttr(meta.title)}"
  description="${escapeAttr(meta.desc)}"${meta.noindex ? '\n  noindex={true}' : ''}
>
${extras ? `  <Fragment slot="head">\n${extras}\n  </Fragment>\n` : ''}${pages[id].trim()}
</Base>
`;
  const full = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, astro);
  console.log(`${file}  ←  ${id}`);
}

console.log('\nDone: ' + Object.keys(PAGES).length + ' pages written.');

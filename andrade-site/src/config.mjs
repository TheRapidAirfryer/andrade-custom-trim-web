// Business data and site settings. Edit here; every page is regenerated from this file.

export const SITE_URL = "https://andradecustomtrim.com";

// Photos under /img/ live in src/img/ (taken from the client proposal PDF). Any other path still
// loads from the current live site; copy those files into src/img/ before the old site is replaced.
export const IMG_BASE = "https://andradecustomtrim.com";

// Form service (Formspree, Web3Forms, Basin…). Leave empty to fall back to the visitor's email app.
export const FORM_ENDPOINT = "";

export const BUSINESS = {
  name: "Andrade Custom Trim",
  legalName: "Andrade Trim & Cabinet",
  owners: "Victor & Michelle Andrade",
  phone: "(469) 358-1011",
  phoneHref: "tel:+14693581011",
  emailShown: "info@andradecustomtrim.com",
  emailLink: "andrade.customtrim@gmail.com", // proposal: keep the intentional mailto destination
  street: "1329 County Road 278",
  building: "Building 475A",
  city: "Melissa",
  region: "TX",
  zip: "75454",
  hours: { days: ["Mo", "Tu", "We", "Th", "Fr"], opens: "08:00", closes: "17:00" },
  bbbUrl: "https://www.bbb.org/us/tx/allen/profile/finish-carpentry/andrade-custom-trim-0875-91345914/#sealclick",
  googleReviewsUrl: "https://www.google.com/maps/search/?api=1&query=Andrade+Custom+Trim+Melissa+TX",
  social: [] // e.g. { name: "Instagram", url: "https://instagram.com/..." }
};

export const MAPS_QUERY = encodeURIComponent(`${BUSINESS.street} ${BUSINESS.building} ${BUSINESS.city} ${BUSINESS.region} ${BUSINESS.zip}`);

export const CITIES = [
  "Melissa", "Dallas", "Fort Worth", "Allen", "Plano", "Frisco", "McKinney", "Prosper", "Southlake",
  "Carrollton", "Richardson", "Coppell", "Flower Mound", "Highland Park", "University Park",
  "Lewisville", "Grapevine", "Rockwall", "Garland"
];

// Photos from the client proposal (src/img/). Set team or showroom to null to fall back to monogram / map.
export const IMG = {
  logo: "/img/logo.webp",
  hero: { src: "/img/kitchen-island-hero.webp", w: 1536, h: 1024 },
  kitchen: { src: "/img/kitchen-island-front.webp", w: 1536, h: 1024 },
  closets: { src: "/img/walk-in-closet.webp", w: 1349, h: 1011 },
  vanity: { src: "/img/bathroom-vanities.webp", w: 1535, h: 1024 },
  trim: { src: "/img/vaulted-bedroom-beams.webp", w: 1024, h: 1536 },
  paneling: { src: "/img/wall-paneling-office.webp", w: 1086, h: 1448 },
  beams: { src: "/img/vaulted-living-room-beams.webp", w: 1448, h: 1086 },
  shelves: { src: "/img/floating-wood-shelves.webp", w: 1066, h: 1600 },
  pantry: { src: "/img/custom-pantry.webp", w: 1536, h: 1024 },
  bbbSeal: "https://seal-dallas.bbb.org/seals/blue-seal-200-42-bbb-91345914.png",
  team: { src: "/img/victor-michelle-andrade.webp", w: 900, h: 1600 },
  showroom: { src: "/img/showroom-melissa.webp", w: 1086, h: 1448 }
};

// Portfolio. Proposal photos first; the rest come from the current site (only ones confirmed to load).
// Several proposal photos show the same space from different angles — they are captioned as views, not separate projects.
// cat: closets | cabinets | trim | ceilings. featured: shown in "Recent work" on the home page.
export const PROJECTS = [
  { cat: "cabinets", src: "/img/kitchen-island-hero.webp", en: "Oak kitchen with island", es: "Cocina de roble con isla", featured: true },
  { cat: "cabinets", src: "/img/kitchen-island-front.webp", en: "Oak kitchen with island — front view", es: "Cocina de roble con isla — vista frontal" },
  { cat: "cabinets", src: "/img/bathroom-vanities.webp", en: "His & hers bathroom vanities", es: "Muebles de baño dobles", featured: true },
  { cat: "cabinets", src: "/img/vanity-detail.webp", en: "Bathroom vanity detail", es: "Detalle de mueble de baño" },
  { cat: "closets", src: "/img/walk-in-closet.webp", en: "Walk-in closet system", es: "Clóset vestidor", featured: true },
  { cat: "closets", src: "/img/custom-pantry.webp", en: "Pantry with open shelving", es: "Despensa con repisas abiertas" },
  { cat: "ceilings", src: "/img/vaulted-living-room-beams.webp", en: "Vaulted living room beams", es: "Vigas en sala con techo abovedado", featured: true },
  { cat: "ceilings", src: "/img/vaulted-bedroom-beams.webp", en: "Vaulted bedroom beams", es: "Vigas en recámara con techo abovedado" },
  { cat: "trim", src: "/img/wall-paneling-office.webp", en: "Decorative wall paneling", es: "Revestimiento decorativo de pared", featured: true },
  { cat: "trim", src: "/img/arched-wood-door-casing.webp", en: "Arched wood door & casings", es: "Puerta de madera en arco y molduras" },
  { cat: "trim", src: "/img/baseboard-corner-detail.webp", en: "Baseboard corner detail", es: "Detalle de zócalo en esquina" },
  { cat: "trim", src: "/img/floating-wood-shelves.webp", en: "Floating wood shelves", es: "Repisas flotantes de madera", featured: true },
  { cat: "trim", src: "/img/fireplace-mantel-surround.webp", en: "Fireplace mantel & surround", es: "Marco de chimenea" },
  { cat: "closets", src: "/projects/luxury-walk-in-closet-island-white-oak-built-ins.jpg", en: "White oak closet island & built-ins", es: "Isla y muebles integrados de roble blanco" },
  { cat: "closets", src: "/projects/luxury-walk-in-closet-island-with-integrated-lighting.jpeg", en: "Closet island with integrated lighting", es: "Isla de clóset con iluminación integrada" },
  { cat: "closets", src: "/projects/hidden-bookshelf-door-secret-room-custom-white-closet.jpg", en: "Hidden bookshelf door & walk-in closet", es: "Puerta librero oculta y clóset vestidor" },
  { cat: "closets", src: "/projects/custom-walk-in-closet-white-drawers-gold-knobs.jpg", en: "White walk-in with brass hardware", es: "Vestidor blanco con herrajes de latón" },
  { cat: "closets", src: "/projects/luxury-custom-closet-vanity-with-lighted-mirror-and-built-in-storage.jpeg", en: "Makeup vanity & storage system", es: "Tocador con espejo iluminado y almacenamiento" },
  { cat: "closets", src: "/projects/custom-taupe-closet-drawers-with-polished-gold-hardware.jpeg", en: "Taupe closet with soft-close drawers", es: "Clóset color topo con cajones de cierre suave" },
  { cat: "cabinets", src: "/projects/img27.webp", en: "Modern kitchen cabinetry & island", es: "Cocina moderna con isla" },
  { cat: "cabinets", src: "/projects/custom-mudroom-lockers-built-in-bench-gray-cabinetry.jpg", en: "Mudroom lockers with built-in bench", es: "Lockers de entrada con banca integrada" },
  { cat: "cabinets", src: "/projects/luxury-laundry-room-stacked-washer-dryer-marble-tile.jpg", en: "Laundry room cabinetry", es: "Gabinetes de lavandería" },
  { cat: "trim", src: "/projects/dark-green-accent-wall-picture-frame-molding-office.jpeg", en: "Deep green picture-frame molding", es: "Molduras tipo marco en verde profundo" },
  { cat: "trim", src: "/projects/light-blue-board-and-batten-wainscoting-bedroom.jpeg", en: "Board & batten bedroom accent", es: "Revestimiento board & batten en recámara" },
  { cat: "ceilings", src: "/projects/open-concept-living-room-white-coffered-ceiling-beams.jpeg", en: "Coffered ceiling beams", es: "Techo artesonado con vigas" }
];

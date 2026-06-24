// Noisecatcher — worldwide advocacy & reporting resources
// Organized by world region. Searchable by keyword + filterable by region.

export type AdvocacyRegion =
  | "international"
  | "europe"
  | "north-america"
  | "latin-america"
  | "asia-pacific"
  | "middle-east"
  | "africa";

export type LinkType = "gov" | "ngo" | "legal" | "scientific" | "map";

export interface AdvocacyLink {
  label: string;
  href: string;
  type?: LinkType;
}

export interface AdvocacyEntry {
  country: string;      // "🇫🇷 France" — displayed name
  slug: string;         // for search / key
  region: AdvocacyRegion;
  links: AdvocacyLink[];
  note?: string;        // contextual note, e.g. "Report to local prefecture"
}

export const REGION_LABELS: Record<AdvocacyRegion, string> = {
  international:   "International",
  europe:          "Europe",
  "north-america": "North America",
  "latin-america": "Latin America",
  "asia-pacific":  "Asia-Pacific",
  "middle-east":   "Middle East",
  africa:          "Africa",
};

export const ADVOCACY_DATA: AdvocacyEntry[] = [
  // ── International ───────────────────────────────────────────────────
  {
    country: "🌍 International",
    slug: "international",
    region: "international",
    links: [
      { label: "WHO — Environmental Noise Guidelines (2018)", href: "https://www.who.int/publications/i/item/9789289053563", type: "scientific" },
      { label: "UNEP — Noise pollution overview", href: "https://www.unep.org/explore-topics/oceans-seas/what-we-do/protecting-ocean/noise-pollution", type: "scientific" },
      { label: "EEA — Environmental Noise in Europe", href: "https://www.eea.europa.eu/themes/human/noise", type: "map" },
      { label: "ISO 1996 — Acoustics: Description & measurement of noise", href: "https://www.iso.org/standard/59765.html", type: "scientific" },
      { label: "Right to Quiet Society (international)", href: "https://www.quiet.org", type: "ngo" },
      { label: "Quiet Communities (advocacy network)", href: "https://www.quietcommunities.org", type: "ngo" },
      { label: "Community Noise Lab — holistic community noise & health research platform", href: "https://communitynoiselab.org", type: "scientific" },
      { label: "Forensic Architecture — acoustic investigation & human rights (Goldsmiths, London)", href: "https://forensic-architecture.org", type: "ngo" },
      { label: "Syntone — revue de l'écoute critique et de la création sonore (France)", href: "https://syntone.fr", type: "scientific" },
      { label: "Monoskop — open bibliography: noise theory, sound art, acoustic politics", href: "https://monoskop.org/Noise", type: "scientific" },
    ],
  },
  // ── Europe ──────────────────────────────────────────────────────────
  {
    country: "🇪🇺 European Union",
    slug: "eu",
    region: "europe",
    links: [
      { label: "EU Environmental Noise Directive 2002/49/EC", href: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02002L0049-20210928", type: "legal" },
      { label: "EEA Noise Viewer — interactive map", href: "https://www.eea.europa.eu/data-and-maps/explore-interactive-maps/eea-noise-viewer", type: "map" },
      { label: "EU Quiet Areas — protected soundscapes", href: "https://noise.eionet.europa.eu/quietareas/", type: "map" },
    ],
  },
  {
    country: "🇫🇷 France",
    slug: "france",
    region: "europe",
    links: [
      { label: "Signal Conso — signaler un bruit", href: "https://signal.conso.gouv.fr", type: "gov" },
      { label: "ACNUSA — Autorité de contrôle des nuisances aéroportuaires", href: "https://www.acnusa.fr", type: "gov" },
      { label: "Bruitparif — observatoire bruit Île-de-France", href: "https://www.bruitparif.fr", type: "map" },
      { label: "Service-public.fr — bruit de voisinage", href: "https://www.service-public.fr/particuliers/vosdroits/F612", type: "legal" },
      { label: "Votre mairie — nuisances chantiers", href: "https://www.service-public.fr/particuliers/vosdroits/F612", type: "gov" },
    ],
    note: "Pour le bruit de voisinage, contacter la mairie ou un médiateur avant toute procédure judiciaire.",
  },
  {
    country: "🇩🇪 Germany",
    slug: "germany",
    region: "europe",
    links: [
      { label: "Umweltbundesamt — Lärm (Noise)", href: "https://www.umweltbundesamt.de/themen/laerm", type: "gov" },
      { label: "Lärmkarte — federal noise maps", href: "https://www.umweltbundesamt.de/laermkarten", type: "map" },
      { label: "DEGA — Deutsche Gesellschaft für Akustik", href: "https://www.dega-akustik.de", type: "scientific" },
      { label: "Städtischer Lärmbeschwerden — via local Ordnungsamt", href: "https://www.bmwsb.bund.de", type: "gov" },
    ],
    note: "File complaints with your local Ordnungsamt (public order office) or Umweltamt.",
  },
  {
    country: "🇬🇧 United Kingdom",
    slug: "uk",
    region: "europe",
    links: [
      { label: "GOV.UK — complain about noise", href: "https://www.gov.uk/complain-about-noise", type: "gov" },
      { label: "Civil Aviation Authority — aircraft noise", href: "https://www.caa.co.uk/consumers/environment/aircraft-noise/", type: "gov" },
      { label: "Noise Abatement Society", href: "https://www.noiseabatementsociety.com", type: "ngo" },
      { label: "Environmental Protection Act 1990 — statutory nuisance", href: "https://www.legislation.gov.uk/ukpga/1990/43/part/III", type: "legal" },
      { label: "CIEH — Noise guidance for practitioners", href: "https://www.cieh.org", type: "scientific" },
    ],
  },
  {
    country: "🇳🇱 Netherlands",
    slug: "netherlands",
    region: "europe",
    links: [
      { label: "RIVM — Geluid en gezondheid", href: "https://www.rivm.nl/geluid", type: "scientific" },
      { label: "Geluidloket — national noise desk", href: "https://www.geluidloket.nl", type: "gov" },
      { label: "Wet geluidhinder — noise nuisance law", href: "https://wetten.overheid.nl/BWBR0003227", type: "legal" },
    ],
  },
  {
    country: "🇧🇪 Belgium",
    slug: "belgium",
    region: "europe",
    links: [
      { label: "OVAM — omgevingslawaai (Flanders)", href: "https://omgeving.vlaanderen.be/geluid", type: "gov" },
      { label: "Bruxelles Environnement — nuisances sonores", href: "https://environnement.brussels/thematiques/bruit", type: "gov" },
      { label: "SPW — bruit en Wallonie", href: "https://www.wallonie.be/fr/actualites/le-bruit-dans-lenvironnement", type: "gov" },
    ],
  },
  {
    country: "🇨🇭 Switzerland",
    slug: "switzerland",
    region: "europe",
    links: [
      { label: "BAFU/OFEV — Lärm / Bruit", href: "https://www.bafu.admin.ch/bafu/fr/home/themes/bruit.html", type: "gov" },
      { label: "SonBase — noise map Switzerland", href: "https://www.sonbase.ch", type: "map" },
      { label: "Ordonnance sur la protection contre le bruit (OPB)", href: "https://www.admin.ch/opc/fr/classified-compilation/19860206/index.html", type: "legal" },
    ],
  },
  {
    country: "🇪🇸 Spain",
    slug: "spain",
    region: "europe",
    links: [
      { label: "Ministerio de Medio Ambiente — ruido", href: "https://www.miteco.gob.es/es/calidad-y-evaluacion-ambiental/temas/atmosfera-y-calidad-del-aire/ruido/", type: "gov" },
      { label: "Ley del Ruido (Ley 37/2003)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2003-19189", type: "legal" },
      { label: "AENA — ruido aeroportuario", href: "https://www.aena.es/es/medioambiente/ruido.html", type: "gov" },
    ],
  },
  {
    country: "🇮🇹 Italy",
    slug: "italy",
    region: "europe",
    links: [
      { label: "ISPRA — acustica ambientale", href: "https://www.isprambiente.gov.it/it/temi/acustica-ambientale", type: "scientific" },
      { label: "SNPA — Sistema nazionale protezione ambiente", href: "https://www.snpambiente.it", type: "gov" },
      { label: "Legge quadro sull'inquinamento acustico (L.447/1995)", href: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1995-10-26;447", type: "legal" },
    ],
  },
  {
    country: "🇸🇪 Sweden",
    slug: "sweden",
    region: "europe",
    links: [
      { label: "Naturvårdsverket — buller", href: "https://www.naturvardsverket.se/amnesomraden/buller/", type: "gov" },
      { label: "Boverket — buller i samhällsplaneringen", href: "https://www.boverket.se/sv/PBL-kunskapsbanken/planering/detaljplan/planbestammelser/buller/", type: "legal" },
    ],
  },
  {
    country: "🇳🇴 Norway",
    slug: "norway",
    region: "europe",
    links: [
      { label: "Miljødirektoratet — støy", href: "https://www.miljodirektoratet.no/ansvarsomrader/stoy/", type: "gov" },
      { label: "Kartverket — støysonekart", href: "https://www.kartverket.no", type: "map" },
    ],
  },
  {
    country: "🇩🇰 Denmark",
    slug: "denmark",
    region: "europe",
    links: [
      { label: "Miljøstyrelsen — støj", href: "https://www.mst.dk/erhverv/stoej/", type: "gov" },
      { label: "Støjkortlægning — Danish noise maps", href: "https://www.mst.dk/natur-vand/stoej/stoejkortlaegning/", type: "map" },
    ],
  },
  {
    country: "🇫🇮 Finland",
    slug: "finland",
    region: "europe",
    links: [
      { label: "SYKE — meluselvitykset (noise mapping)", href: "https://www.syke.fi/fi-FI/Tutkimus__kehittaminen/Meluselvitykset", type: "map" },
      { label: "Ympäristöministeriö — melu", href: "https://ympäristö.fi/melu", type: "gov" },
    ],
  },
  {
    country: "🇮🇪 Ireland",
    slug: "ireland",
    region: "europe",
    links: [
      { label: "EPA Ireland — noise", href: "https://www.epa.ie/our-services/monitoring--assessment/noise/", type: "gov" },
      { label: "Dublin City Council — noise complaints", href: "https://www.dublincity.ie/residential/environment/noise-complaints", type: "gov" },
    ],
  },
  {
    country: "🇦🇹 Austria",
    slug: "austria",
    region: "europe",
    links: [
      { label: "Umweltbundesamt Austria — Lärm", href: "https://www.umweltbundesamt.at/umweltthemen/laerm", type: "gov" },
      { label: "Lärmkarten Austria — noise maps", href: "https://www.umweltbundesamt.at/laermkarten", type: "map" },
    ],
  },
  {
    country: "🇵🇱 Poland",
    slug: "poland",
    region: "europe",
    links: [
      { label: "GIOŚ — hałas w środowisku", href: "https://www.gios.gov.pl/pl/stan-srodowiska/monitoring-halasu", type: "gov" },
      { label: "Mapa akustyczna — noise maps", href: "https://www.gios.gov.pl/pl/stan-srodowiska/monitoring-halasu/mapy-akustyczne", type: "map" },
    ],
  },
  // ── North America ────────────────────────────────────────────────────
  {
    country: "🇺🇸 United States",
    slug: "usa",
    region: "north-america",
    links: [
      { label: "EPA — noise pollution regulation", href: "https://www.epa.gov/clean-air-act-overview/noise-pollution-regulation", type: "gov" },
      { label: "FAA — aviation noise complaints", href: "https://www.faa.gov/aircraft/tech_ops/noise", type: "gov" },
      { label: "FTA — transit noise guidelines", href: "https://www.transit.dot.gov/regulations-and-guidance/environmental-programs/noise", type: "gov" },
      { label: "FHWA — highway noise policy", href: "https://www.fhwa.dot.gov/environment/noise/", type: "legal" },
      { label: "Noise Free America", href: "https://www.noisefree.org", type: "ngo" },
      { label: "Noise Pollution Clearinghouse", href: "https://www.nonoise.org", type: "ngo" },
      { label: "NYC DEP Noise App — report & track city noise complaints (New York)", href: "https://www.nyc.gov/site/dep/news/25-030/dep-launches-new-innovative-mobile-app-better-understand-city-s-noise", type: "gov" },
    ],
    note: "Noise ordinances are primarily local (city/county). Contact your city council for neighbourhood complaints.",
  },
  {
    country: "🇨🇦 Canada",
    slug: "canada",
    region: "north-america",
    links: [
      { label: "Environment and Climate Change Canada — noise", href: "https://www.canada.ca/en/environment-climate-change/services/environmental-indicators/noise.html", type: "gov" },
      { label: "NAV Canada — aircraft noise", href: "https://www.navcanada.ca", type: "gov" },
      { label: "Ontario MOE — noise guidelines", href: "https://www.ontario.ca/document/environmental-noise-guideline-stationary-and-transportation-sources", type: "legal" },
    ],
    note: "Environmental protection is shared between federal and provincial governments.",
  },
  {
    country: "🇲🇽 Mexico",
    slug: "mexico",
    region: "north-america",
    links: [
      { label: "SEMARNAT — contaminación acústica", href: "https://www.gob.mx/semarnat", type: "gov" },
      { label: "NOM-081-SEMARNAT — límites de ruido", href: "https://www.dof.gob.mx/nota_detalle.php?codigo=5467548&fecha=02/07/2016", type: "legal" },
    ],
  },
  // ── Latin America ───────────────────────────────────────────────────
  {
    country: "🇧🇷 Brazil",
    slug: "brazil",
    region: "latin-america",
    links: [
      { label: "IBAMA — poluição sonora", href: "https://www.ibama.gov.br", type: "gov" },
      { label: "CONAMA Resolução 001/90 — ruído", href: "https://www.mma.gov.br/port/conama/res/res90/res0190.html", type: "legal" },
      { label: "ABNT NBR 10151 — medição de ruído", href: "https://www.abnt.org.br", type: "scientific" },
      { label: "Cardoso, L. — Sound-Politics in São Paulo (OUP, 2019) — landmark study of noise governance & social inequality in Brazilian cities", href: "https://global.oup.com/academic/product/sound-politics-in-so-paulo-9780190660093", type: "scientific" },
    ],
  },
  {
    country: "🇦🇷 Argentina",
    slug: "argentina",
    region: "latin-america",
    links: [
      { label: "SAyDS — ruido ambiental", href: "https://www.argentina.gob.ar/ambiente/sustentabilidad/ruido", type: "gov" },
    ],
  },
  {
    country: "🇨🇴 Colombia",
    slug: "colombia",
    region: "latin-america",
    links: [
      { label: "MADS — resolución 0627 de 2006 (norma nacional de ruido)", href: "https://www.minambiente.gov.co", type: "legal" },
      { label: "IDEAM — calidad del aire y ruido", href: "https://www.ideam.gov.co", type: "gov" },
    ],
  },
  {
    country: "🇨🇱 Chile",
    slug: "chile",
    region: "latin-america",
    links: [
      { label: "MMA — ruido ambiental", href: "https://www.mma.gob.cl/calidad-del-aire/", type: "gov" },
      { label: "DS 38/2011 — norma de emisión de ruidos", href: "https://www.bcn.cl/leychile", type: "legal" },
    ],
  },
  // ── Asia-Pacific ────────────────────────────────────────────────────
  {
    country: "🇨🇳 China",
    slug: "china",
    region: "asia-pacific",
    links: [
      { label: "生态环境部 — 噪声污染 (MEE noise pollution)", href: "https://www.mee.gov.cn", type: "gov" },
      { label: "全国噪声污染防治行动计划 (National Noise Action Plan)", href: "https://www.mee.gov.cn/ywgz/dqhj/szhjzl/", type: "legal" },
      { label: "12369 — 环保举报热线 (Environmental complaint hotline)", href: "https://www.mee.gov.cn/hdjl/bf/", type: "gov" },
      { label: "中国环境噪声污染防治报告", href: "https://www.mee.gov.cn/hjzl/shhjzk/", type: "scientific" },
    ],
    note: "拨打12369热线举报噪音污染。各地环保局负责地方噪声执法。",
  },
  {
    country: "🇯🇵 Japan",
    slug: "japan",
    region: "asia-pacific",
    links: [
      { label: "環境省 — 騒音・振動 (Ministry of Environment — Noise)", href: "https://www.env.go.jp/air/noise/", type: "gov" },
      { label: "騒音規制法 — Noise Control Law", href: "https://elaws.e-gov.go.jp/document?lawid=343AC0000000098", type: "legal" },
      { label: "国土交通省 — 航空機騒音 (MLIT — Aircraft noise)", href: "https://www.mlit.go.jp/koku/koku_fr9_000001.html", type: "gov" },
      { label: "公害等調整委員会 — Pollution Dispute Coordination Commission", href: "https://www.soumu.go.jp/kouchoi/index.html", type: "legal" },
    ],
    note: "騒音の苦情は市区町村の環境課へ。航空機騒音は国土交通省へ。",
  },
  {
    country: "🇰🇷 South Korea",
    slug: "south-korea",
    region: "asia-pacific",
    links: [
      { label: "환경부 — 소음·진동 (Ministry of Environment)", href: "https://www.me.go.kr/home/web/policy_data/read.do?menuId=10262&seq=7673", type: "gov" },
      { label: "국가소음정보시스템 — National Noise Information", href: "https://www.noiseinfo.or.kr", type: "map" },
      { label: "소음·진동관리법 — Noise and Vibration Control Act", href: "https://www.law.go.kr", type: "legal" },
    ],
  },
  {
    country: "🇮🇳 India",
    slug: "india",
    region: "asia-pacific",
    links: [
      { label: "CPCB — Noise Pollution (Regulation & Control) Rules 2000", href: "https://cpcb.nic.in/noise-polution.php", type: "legal" },
      { label: "Ministry of Environment — noise standards", href: "https://moef.gov.in", type: "gov" },
      { label: "PCB Complaint portal — state pollution control boards", href: "https://cpcb.nic.in/grievance.php", type: "gov" },
    ],
    note: "Complaints filed with State Pollution Control Boards. Dial 1800-11-4000 for environmental helpline.",
  },
  {
    country: "🇦🇺 Australia",
    slug: "australia",
    region: "asia-pacific",
    links: [
      { label: "EPA Victoria — noise complaints", href: "https://www.epa.vic.gov.au/for-community/noise", type: "gov" },
      { label: "EPA NSW — noise", href: "https://www.epa.nsw.gov.au/your-environment/noise", type: "gov" },
      { label: "ARPANSA — aviation noise", href: "https://www.arpansa.gov.au", type: "gov" },
      { label: "ANEF — Aircraft Noise Exposure Forecast", href: "https://www.infrastructure.gov.au/infrastructure-transport-vehicles/aviation/airports/aviation-noise", type: "map" },
    ],
    note: "Environmental protection is a state responsibility — contact your state EPA.",
  },
  {
    country: "🇳🇿 New Zealand",
    slug: "new-zealand",
    region: "asia-pacific",
    links: [
      { label: "Ministry for the Environment — noise", href: "https://environment.govt.nz/facts-and-science/noise/", type: "gov" },
      { label: "NZS 6801/6802 — Acoustics measurement standards", href: "https://www.standards.govt.nz", type: "scientific" },
    ],
  },
  {
    country: "🇸🇬 Singapore",
    slug: "singapore",
    region: "asia-pacific",
    links: [
      { label: "NEA — noise regulations", href: "https://www.nea.gov.sg/our-services/pollution-control/noise-pollution", type: "gov" },
      { label: "Environmental Protection and Management Act", href: "https://sso.agc.gov.sg/Act/EPMA1999", type: "legal" },
    ],
  },
  {
    country: "🇭🇰 Hong Kong",
    slug: "hong-kong",
    region: "asia-pacific",
    links: [
      { label: "EPD — Noise Control Ordinance", href: "https://www.epd.gov.hk/epd/english/environmentinhk/noise/noise_maincontent.html", type: "legal" },
      { label: "Noise complaint — 2838 3111", href: "https://www.epd.gov.hk", type: "gov" },
    ],
  },
  // ── Middle East ──────────────────────────────────────────────────────
  {
    country: "🇦🇪 UAE",
    slug: "uae",
    region: "middle-east",
    links: [
      { label: "Ministry of Climate Change & Environment", href: "https://www.moccae.gov.ae", type: "gov" },
      { label: "Dubai Municipality — noise complaints", href: "https://www.dm.gov.ae/business/environmental-health/noise-pollution/", type: "gov" },
      { label: "Abu Dhabi EAD — environmental noise", href: "https://www.ead.gov.ae/en/our-work/environment/air-quality-noise", type: "gov" },
    ],
    note: "شكاوى الضوضاء: اتصل ببلدية دبي على 800900 أو هيئة البيئة والمياه.",
  },
  {
    country: "🇸🇦 Saudi Arabia",
    slug: "saudi-arabia",
    region: "middle-east",
    links: [
      { label: "وزارة البيئة والمياه — التلوث الضوضائي (Ministry of Environment)", href: "https://www.mewa.gov.sa", type: "gov" },
      { label: "الهيئة العامة للطيران المدني — ضوضاء الطيران (GACA — aviation noise)", href: "https://gaca.gov.sa", type: "gov" },
    ],
  },
  {
    country: "🇯🇴 Jordan",
    slug: "jordan",
    region: "middle-east",
    links: [
      { label: "وزارة البيئة — تلوث ضوضائي", href: "https://www.moenv.gov.jo", type: "gov" },
    ],
  },
  {
    country: "🇲🇦 Morocco",
    slug: "morocco",
    region: "middle-east",
    links: [
      { label: "Ministère de la Transition Écologique — bruit", href: "https://www.environnement.gov.ma", type: "gov" },
    ],
  },
  // ── Africa ───────────────────────────────────────────────────────────
  {
    country: "🇿🇦 South Africa",
    slug: "south-africa",
    region: "africa",
    links: [
      { label: "DFFE — Environmental noise", href: "https://www.dffe.gov.za/Branches/chemical_waste_management/pollution_and_wastemanagement/noise_management", type: "gov" },
      { label: "SANS 10103 — Measurement and rating of noise", href: "https://www.sabs.co.za", type: "scientific" },
      { label: "National Noise Reduction Regulations (NEMA)", href: "https://www.gov.za/documents/national-environmental-management-act-regulations", type: "legal" },
    ],
  },
  {
    country: "🇰🇪 Kenya",
    slug: "kenya",
    region: "africa",
    links: [
      { label: "NEMA — Noise and Excessive Vibration Pollution Control Regs (2009)", href: "https://www.nema.go.ke", type: "legal" },
      { label: "NEMA Noise complaint form", href: "https://www.nema.go.ke/index.php/complaints", type: "gov" },
    ],
  },
  {
    country: "🇳🇬 Nigeria",
    slug: "nigeria",
    region: "africa",
    links: [
      { label: "NESREA — National Environmental (Noise Standards) Regulations", href: "https://nesrea.gov.ng", type: "legal" },
      { label: "NESREA complaint hotline — 0800CALLNESREA", href: "https://nesrea.gov.ng/contact/", type: "gov" },
    ],
  },
  {
    country: "🇬🇭 Ghana",
    slug: "ghana",
    region: "africa",
    links: [
      { label: "EPA Ghana — noise pollution", href: "https://www.epa.gov.gh", type: "gov" },
    ],
  },
  {
    country: "🌍 WHO Africa Region",
    slug: "who-africa",
    region: "africa",
    links: [
      { label: "WHO AFRO — environmental health", href: "https://www.afro.who.int/health-topics/environmental-health", type: "scientific" },
    ],
  },
];

// ── Search & filter ──────────────────────────────────────────────────────────

export function searchAdvocacy(
  query: string,
  region: AdvocacyRegion | "all"
): AdvocacyEntry[] {
  const q = query.toLowerCase().trim();
  return ADVOCACY_DATA.filter((entry) => {
    const regionMatch = region === "all" || entry.region === region;
    if (!regionMatch) return false;
    if (!q) return true;
    const haystack = [
      entry.country,
      entry.slug,
      entry.note ?? "",
      ...entry.links.map((l) => l.label + " " + l.href),
    ]
      .join(" ")
      .toLowerCase();
    return q.split(/\s+/).every((word) => haystack.includes(word));
  });
}

export const ALL_REGIONS: (AdvocacyRegion | "all")[] = [
  "all",
  "international",
  "europe",
  "north-america",
  "latin-america",
  "asia-pacific",
  "middle-east",
  "africa",
];

export const REGION_EMOJIS: Record<AdvocacyRegion | "all", string> = {
  all:             "🌐",
  international:   "🌍",
  europe:          "🇪🇺",
  "north-america": "🌎",
  "latin-america": "🌎",
  "asia-pacific":  "🌏",
  "middle-east":   "🕌",
  africa:          "🌍",
};

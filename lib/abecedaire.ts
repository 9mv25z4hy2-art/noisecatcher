export interface AbecedaireEntry {
  id: string;
  term: string;
  phonetic?: string;
  category: "acoustic" | "health" | "social" | "legal" | "environmental";
  definition: string;
  context: string;
  relatedDbThreshold?: number;
  sources: string[];
  relatedTerms?: string[];
}

export const ABECEDAIRE: AbecedaireEntry[] = [
  {
    id: "acoustic-trauma",
    term: "Acoustic Trauma",
    category: "health",
    definition:
      "Sudden or permanent damage to the auditory system caused by exposure to extremely loud sounds, typically above 130 dB(A). Can result in immediate and irreversible hearing loss.",
    context:
      "Acoustic trauma is distinct from noise-induced hearing loss, which develops gradually. It can result from a single event — an explosion, a gunshot, or proximity to industrial machinery. Unlike gradual hearing loss, it is rarely compensated in legal or occupational health frameworks.",
    relatedDbThreshold: 85,
    sources: ["WHO Environmental Noise Guidelines for the European Region (2018)", "NIOSH Criteria for a Recommended Standard (1998)"],
    relatedTerms: ["Noise-Induced Hearing Loss", "Tinnitus", "Sound Pressure Level"],
  },
  {
    id: "ambient-noise",
    term: "Ambient Noise",
    category: "acoustic",
    definition:
      "The background noise present in a given environment, composed of all sources combined — traffic, wind, human activity, mechanical systems. It forms the acoustic baseline of a place.",
    context:
      "Ambient noise is the acoustic texture of a space. It is rarely neutral: its composition reflects urban planning decisions, zoning policies, and social hierarchies. Quiet neighborhoods are often a marker of privilege. Documenting ambient noise is a form of spatial autobiography.",
    sources: ["ISO 1996-1:2016 — Acoustics: Description, measurement and assessment of environmental noise"],
    relatedTerms: ["Background Noise", "Soundscape", "Equivalent Continuous Sound Level"],
  },
  {
    id: "cardiovascular-noise",
    term: "Cardiovascular Noise Effects",
    category: "health",
    definition:
      "The documented physiological pathways by which chronic noise exposure contributes to hypertension, coronary artery disease, stroke, and other vascular conditions.",
    context:
      "Noise is not merely annoying — it is metabolic. The auditory system triggers cortisol and adrenaline release even during sleep. Over years, this chronic stress response generates reactive oxygen species via NADPH oxidase, causes endothelial dysfunction, hardens arteries, elevates blood pressure, and increases heart attack risk. Meta-analyses find a 5–14% increase in hypertension risk per 10 dB increase in night noise — the WHO 2018 systematic review of 26 cross-sectional studies found a relative risk of 1.05 (5%) per 10 dB for road traffic noise; individual studies near European airports report up to 14%. The EEA (2025) estimates 73,000 premature deaths per year in Europe attributable to transport noise, alongside 48,000–50,000 new cases of ischaemic heart disease and 22,000 new cases of type 2 diabetes annually.",
    relatedDbThreshold: 55,
    sources: [
      "Münzel et al., 'Environmental Noise and the Cardiovascular System' (2018), JACC 71(6):688–697",
      "Münzel/Daiber group, 'Vascular effects of environmental noise' (2017), European Heart Journal — molecular mechanism (NOX2/ROS pathway)",
      "WHO Environmental Noise Guidelines for the European Region (2018) — systematic review PMC5858448",
      "EEA, 'Environmental Noise in Europe 2025' — 73,000 premature deaths, 22,000 T2D cases/year",
      "Danish nationwide cohort study on noise and type 2 diabetes (EHP, 2021) — PMC8638828",
    ],
    relatedTerms: ["Night Noise", "Cortisol Response", "Equivalent Continuous Sound Level"],
  },
  {
    id: "cognitive-development",
    term: "Cognitive Development and Noise",
    category: "health",
    definition:
      "The documented impairment to children's reading, memory, attention, and language acquisition caused by chronic exposure to environmental noise above 55 dB(A).",
    context:
      "Schools near airports, highways, and rail corridors consistently show lower test scores not because of the students, but because of the infrastructure. The RANCH study (2005) found a dose-response relationship between aircraft noise and reading comprehension in children across multiple European countries. Noise is an invisible educational inequality.",
    relatedDbThreshold: 55,
    sources: [
      "Stansfeld et al., 'Aircraft and road traffic noise and children's cognition and health' (2005), The Lancet",
      "Clark et al., 'Transportation noise exposure, noise annoyance and mental health' (2020)",
    ],
    relatedTerms: ["Night Noise", "Environmental Justice", "Noise Annoyance"],
  },
  {
    id: "dba-weighting",
    term: "dB(A) — A-Weighting",
    phonetic: "decibel-A",
    category: "acoustic",
    definition:
      "A frequency-weighted measurement of sound pressure level that approximates the human ear's sensitivity across frequencies. The standard unit for environmental and occupational noise measurement.",
    context:
      "Human hearing is not a flat instrument. We are more sensitive to mid-range frequencies (speech, machinery) and less sensitive to very low or very high frequencies. A-weighting adjusts the raw sound measurement to reflect this. When you see a noise limit written as 65 dB(A), the A means it has been weighted for human perception. Noisecatcher measures in dB(A).",
    sources: ["IEC 61672-1:2013 — Electroacoustics: Sound level meters"],
    relatedTerms: ["Sound Pressure Level", "Equivalent Continuous Sound Level", "Frequency"],
  },
  {
    id: "environmental-justice",
    term: "Environmental Justice and Noise",
    category: "social",
    definition:
      "The principle that environmental burdens — including noise pollution — are inequitably distributed along lines of race, class, and geography, and that affected communities have the right to remedy.",
    context:
      "Highways are built through poor neighborhoods. Airports expand over low-income suburbs. Industrial facilities cluster in communities with less political power to resist. The result: chronic noise exposure is not random. It follows the fault lines of structural inequality. Mapping noise is therefore also mapping power.",
    sources: [
      "Morello-Frosch et al., 'The Climate Gap' (2009)",
      "Casey et al., 'Race- and poverty-based disparities in noise pollution exposure in the United States' (2017), Environmental Health Perspectives",
    ],
    relatedTerms: ["Noise Annoyance", "Soundscape", "Acoustic Ecology"],
  },
  {
    id: "equivalent-continuous-sound-level",
    term: "Equivalent Continuous Sound Level (Leq)",
    phonetic: "L-eq",
    category: "acoustic",
    definition:
      "The constant noise level that, over a given measurement period, contains the same total acoustic energy as the fluctuating noise measured. The standard metric for assessing average noise exposure.",
    context:
      "Leq is the metric regulators use to set noise limits and the metric epidemiologists use to study health effects. It captures the energy average rather than the peak. A brief very loud event can dramatically raise the Leq of an otherwise quiet hour. It is both a scientific tool and a political instrument — how you calculate Leq determines whether a neighborhood is classified as 'within limits' or not.",
    sources: ["ISO 1996-1:2016", "EU Environmental Noise Directive 2002/49/EC"],
    relatedTerms: ["dB(A)", "Sound Pressure Level", "Night Noise"],
  },
  {
    id: "night-noise",
    term: "Night Noise",
    category: "health",
    definition:
      "Environmental noise occurring during nighttime hours (typically 23:00–07:00) that disrupts sleep and causes physiological stress responses even without waking the individual.",
    context:
      "The sleeping body is not protected from sound. Below conscious awareness, noise activates the autonomic nervous system — raising heart rate, releasing cortisol, fragmenting sleep architecture. The WHO recommends night noise levels below 40 dB(A) Lnight outside windows. Most urban environments exceed this. The health cost is distributed invisibly, accumulated nightly, and rarely attributed to its cause.",
    relatedDbThreshold: 40,
    sources: [
      "WHO, 'Night Noise Guidelines for Europe' (2009)",
      "Basner et al., 'Auditory and non-auditory effects of noise on health' (2014), The Lancet",
    ],
    relatedTerms: ["Cardiovascular Noise Effects", "Equivalent Continuous Sound Level", "Noise Annoyance"],
  },
  {
    id: "noise-annoyance",
    term: "Noise Annoyance",
    category: "health",
    definition:
      "A defined psychoacoustic and public health category describing the subjective distress — irritability, helplessness, anger — caused by unwanted sound. Recognized by the WHO as a health outcome in its own right.",
    context:
      "Annoyance is not trivial. It is the body registering that its environment is hostile and uncontrollable. Chronic annoyance is associated with anxiety, depression, and diminished quality of life. Regulators frequently dismiss noise complaints as 'mere annoyance' — but annoyance at sustained levels is a measurable clinical burden. The dismissal is itself a political act.",
    relatedDbThreshold: 55,
    sources: [
      "Miedema & Oudshoorn, 'Annoyance from transportation noise' (2001), Environmental Health Perspectives",
      "WHO Environmental Noise Guidelines for the European Region (2018)",
    ],
    relatedTerms: ["Night Noise", "Cognitive Development and Noise", "Soundscape"],
  },
  {
    id: "noise-induced-hearing-loss",
    term: "Noise-Induced Hearing Loss (NIHL)",
    category: "health",
    definition:
      "Permanent, irreversible sensorineural hearing loss caused by cumulative exposure to high levels of noise. The most common occupational disease worldwide.",
    context:
      "NIHL is permanent. There is no repair. Once the hair cells in the cochlea are destroyed by noise, they do not regenerate. An estimated 1.1 billion young people are at risk globally due to recreational noise exposure alone. Yet it develops silently — there is no pain — and is rarely diagnosed until significant loss has already occurred. It disproportionately affects industrial workers, musicians, and people in noisy urban environments.",
    relatedDbThreshold: 85,
    sources: [
      "NIOSH, 'Occupational Noise Exposure' (1998)",
      "WHO, 'Deafness and Hearing Loss' (2021)",
      "Śliwińska-Kowalska & Davis, 'Noise-induced hearing loss' (2012), Noise & Health",
    ],
    relatedTerms: ["Acoustic Trauma", "Tinnitus", "dB(A)"],
  },
  {
    id: "noise-pollution",
    term: "Noise Pollution",
    category: "environmental",
    definition:
      "Unwanted or harmful sound in the environment caused by human activity — transportation, industry, construction, and urban density — that disrupts ecosystems, health, and quality of life.",
    context:
      "The word 'pollution' is deliberate and contested. It frames noise as an environmental contamination, not merely a nuisance — placing it in the same legal and political register as air and water pollution. In many jurisdictions, this framing is still resisted. Noisecatcher's name carries a political position: noise can be caught, measured, and held accountable.",
    sources: [
      "EU Environmental Noise Directive 2002/49/EC",
      "EEA, 'Noise in Europe' (2014)",
    ],
    relatedTerms: ["Environmental Justice and Noise", "Soundscape", "Ambient Noise"],
  },
  {
    id: "soundscape",
    term: "Soundscape",
    category: "acoustic",
    definition:
      "The acoustic environment as perceived and experienced by a person or community in context — encompassing not just measurable sound levels but meaning, memory, identity, and wellbeing.",
    context:
      "The term was developed by Canadian composer R. Murray Schafer in the 1970s. It resists purely technical definitions of noise: it insists that sound is experienced, not just measured. A soundscape can be oppressive or nourishing, intimate or alienating. Preserving valued soundscapes — birdsong in a park, the quiet of a library, the acoustic memory of a neighborhood — is increasingly recognized as a public health and cultural heritage goal.",
    sources: [
      "Schafer, R.M., 'The Tuning of the World' (1977)",
      "ISO 12913-1:2014 — Acoustics: Soundscape",
    ],
    relatedTerms: ["Acoustic Ecology", "Ambient Noise", "Noise Pollution"],
  },
  {
    id: "tinnitus",
    term: "Tinnitus",
    phonetic: "TIN-i-tus",
    category: "health",
    definition:
      "The perception of sound — ringing, buzzing, hissing, roaring — in the absence of an external acoustic stimulus. A common consequence of noise-induced cochlear damage.",
    context:
      "Tinnitus affects approximately 15% of the global population. For many, it is constant. There is no cure. It is associated with anxiety, depression, insomnia, and cognitive impairment. Its causes are often invisible — years of occupational noise, urban exposure, recreational listening — and its onset is typically too late to reverse. It is the permanent record that noise leaves inside the body.",
    relatedDbThreshold: 85,
    sources: [
      "Baguley et al., 'Tinnitus' (2013), The Lancet",
      "WHO, 'Addressing the rising prevalence of hearing loss' (2018)",
    ],
    relatedTerms: ["Noise-Induced Hearing Loss", "Acoustic Trauma", "Night Noise"],
  },
  {
    id: "who-noise-guidelines",
    term: "WHO Environmental Noise Guidelines",
    category: "legal",
    definition:
      "The World Health Organization's evidence-based recommendations for maximum environmental noise levels, designed to protect human health across transport, industrial, and leisure noise sources.",
    context:
      "Published in 2018 for the European Region, these guidelines recommend: road traffic noise below 53 dB(A) Lden; aircraft noise below 45 dB(A) Lden; railway noise below 54 dB(A) Lden; wind turbine noise below 45 dB(A) Lden. Most European cities exceed several of these thresholds routinely. The guidelines have no binding legal force — they are recommendations. Turning them into law is a political struggle.",
    sources: ["WHO, 'Environmental Noise Guidelines for the European Region' (2018)"],
    relatedTerms: ["Equivalent Continuous Sound Level", "Night Noise", "Environmental Justice and Noise"],
  },

  // ── New entries ──────────────────────────────────────────────────────────

  {
    id: "sound-pressure-level",
    term: "Sound Pressure Level (SPL)",
    phonetic: "SPL",
    category: "acoustic",
    definition:
      "A logarithmic measure of the effective pressure of a sound relative to a reference value (20 μPa, the threshold of human hearing). Expressed in decibels (dB). The foundational quantity from which all noise metrics are derived.",
    context:
      "SPL is what a sound level meter physically measures. Everything else — dB(A), Leq, Lden — is derived from it through weighting, averaging, or time integration. A doubling of acoustic energy adds approximately 3 dB to the SPL; a tenfold increase adds 10 dB. This logarithmic scale means that a reading of 80 dB carries not twice but one hundred times the acoustic energy of a 60 dB reading. The mathematics of SPL are therefore inherently political: small numerical differences mask enormous differences in energy and harm.",
    sources: [
      "ISO 1996-1:2016 — Acoustics: Description, measurement and assessment of environmental noise",
      "IEC 61672-1:2013 — Electroacoustics: Sound level meters",
    ],
    relatedTerms: ["dB(A) — A-Weighting", "Equivalent Continuous Sound Level", "Impulse Noise"],
  },

  {
    id: "lden",
    term: "Lden / Lnight",
    phonetic: "L-den, L-night",
    category: "acoustic",
    definition:
      "Day-Evening-Night Level (Lden) is the primary noise indicator used in EU environmental noise regulation. It averages sound exposure across 24 hours, applying a 5 dB penalty to evening hours (19:00–23:00) and a 10 dB penalty to night hours (23:00–07:00) to account for increased sensitivity during those periods. Lnight covers only the night period.",
    context:
      "The penalties built into Lden are not arbitrary — they reflect documented evidence that noise is more harmful when it disrupts sleep and that people have higher annoyance thresholds during the day. A source that produces the same SPL around the clock will have a higher Lden than its daytime average because of these penalties. This metric is what governments must use under the EU Environmental Noise Directive. When authorities declare a neighborhood 'within limits,' they mean its Lden is below a regulatory threshold — which may still exceed WHO health-based guidelines.",
    relatedDbThreshold: 53,
    sources: [
      "EU Environmental Noise Directive 2002/49/EC, Annex I",
      "WHO, 'Environmental Noise Guidelines for the European Region' (2018)",
    ],
    relatedTerms: ["Equivalent Continuous Sound Level", "Night Noise", "Environmental Noise Directive"],
  },

  {
    id: "environmental-noise-directive",
    term: "Environmental Noise Directive (END)",
    category: "legal",
    definition:
      "EU Directive 2002/49/EC relating to the assessment and management of environmental noise. Requires member states to produce strategic noise maps for major roads, railways, airports, and agglomerations, and to develop noise action plans based on those maps.",
    context:
      "The END is the primary legal framework for environmental noise in Europe, but it is widely criticised for having no binding limit values. Member states must map noise and plan actions, but are not required to achieve any specific reduction. The Directive uses Lden and Lnight as its indicators. Strategic noise maps produced under the END reveal that hundreds of millions of Europeans are regularly exposed to noise levels that exceed WHO health guidelines — yet the political machinery for remediation moves slowly, if at all. The END was not substantially revised for nearly two decades after its adoption.",
    sources: [
      "European Parliament and Council, Directive 2002/49/EC (END), 25 June 2002",
      "EEA, 'Environmental Noise in Europe' (2020)",
    ],
    relatedTerms: ["Strategic Noise Maps", "Lden / Lnight", "Quiet Areas", "WHO Environmental Noise Guidelines"],
  },

  {
    id: "strategic-noise-maps",
    term: "Strategic Noise Maps",
    category: "legal",
    definition:
      "Large-scale noise exposure maps required under the EU Environmental Noise Directive for major transport infrastructure and urban agglomerations. They show the distribution of population exposed to different noise levels and form the basis for noise action plans.",
    context:
      "Strategic noise maps are both a scientific instrument and a political document. They make visible — for the first time in many places — who is exposed to what levels of noise and where. They have revealed systematic correlations between noise exposure and socioeconomic deprivation. They have also been criticised for using outdated models, failing to capture low-frequency noise, and relying on road traffic counts that underestimate actual exposure. A map that shows compliance can still contain a population suffering significant health harm. Reading a strategic noise map requires understanding its assumptions as much as its data.",
    sources: [
      "EU Environmental Noise Directive 2002/49/EC, Articles 7–8",
      "EEA, 'Noise in Europe 2014' report",
    ],
    relatedTerms: ["Environmental Noise Directive", "Lden / Lnight", "Environmental Justice and Noise"],
  },

  {
    id: "low-frequency-noise",
    term: "Low-Frequency Noise (LFN)",
    phonetic: "LFN",
    category: "acoustic",
    definition:
      "Sound energy concentrated in the frequency range below approximately 200 Hz. Includes infrasound (below 20 Hz, inaudible to most humans). Sources include industrial machinery, wind turbines, HVAC systems, road traffic, and aircraft. Propagates farther and penetrates building structures more readily than higher-frequency noise.",
    context:
      "LFN is one of the least regulated and least understood categories of environmental noise. It is poorly captured by A-weighting (which attenuates low frequencies), meaning standard dB(A) measurements may drastically underestimate LFN exposure. Symptoms of chronic LFN exposure include sleep disturbance, headaches, cognitive impairment, and a phenomenon sometimes described as 'the Hum' — a persistent low-frequency drone reported by residents near industrial sites or wind farms. The WHO has identified LFN as a priority research area. Regulatory frameworks for LFN remain fragmented and contested across jurisdictions.",
    relatedDbThreshold: 40,
    sources: [
      "Leventhall, G., 'Low Frequency Noise and Annoyance' (2004), Noise & Health",
      "WHO, 'Environmental Noise Guidelines for the European Region' (2018), Chapter on wind turbines",
      "Berglund et al., 'Guidelines for Community Noise' (1999), WHO",
    ],
    relatedTerms: ["Sound Pressure Level", "dB(A) — A-Weighting", "Noise Annoyance"],
  },

  {
    id: "impulse-noise",
    term: "Impulse Noise",
    category: "acoustic",
    definition:
      "Short-duration, high-amplitude sounds characterised by a rapid rise time — typically less than 200 milliseconds. Examples include gunshots, explosions, pile driving, and industrial impacts. Regulated separately from continuous noise because of their distinct damage mechanism.",
    context:
      "The danger of impulse noise lies in its speed. The ear's acoustic reflex — a protective muscle contraction — requires approximately 25–150 milliseconds to activate, often too slow to protect against a gunshot or explosion. Standard Leq metrics underrepresent impulse noise because brief peaks are averaged across longer measurement periods. Dedicated metrics such as Lpeak (the maximum instantaneous sound pressure) and LAImax are used in occupational and firearms noise regulation. Communities near military training grounds, quarries, or construction sites frequently experience impulse noise without recourse, because the events fall outside standard noise monitoring windows.",
    sources: [
      "NIOSH, 'Criteria for a Recommended Standard: Occupational Noise Exposure' (1998)",
      "NATO, 'ACOM(2003)005 Guideline for Estimation of Noise-Induced Hearing Loss' (2003)",
    ],
    relatedTerms: ["Sound Pressure Level", "Acoustic Trauma", "Noise-Induced Hearing Loss"],
  },

  {
    id: "masking",
    term: "Masking",
    category: "acoustic",
    definition:
      "The phenomenon by which the audibility of one sound is reduced or eliminated by the presence of another, louder sound. Environmental noise masking degrades speech intelligibility, music perception, warning signal detection, and communication in everyday life.",
    context:
      "Masking is noise's quietest form of harm. A conversation drowned out by traffic, a child unable to hear a teacher over ventilation noise, an elderly person missing a doorbell — masking accumulates as social and cognitive damage without ever registering as a 'noise complaint.' In ecological contexts, masking threatens animal communication: whales whose songs are drowned out by shipping noise, birds that shift vocal frequency upward in urban soundscapes. The degradation of communication — human and nonhuman — is one of the least quantified costs of the noise environment.",
    sources: [
      "Moore, B.C.J., 'An Introduction to the Psychology of Hearing' (6th ed., 2012), Brill",
      "Shannon, G. et al., 'A synthesis of two decades of research documenting the effects of noise on wildlife' (2016), Biological Reviews",
    ],
    relatedTerms: ["Soundscape", "Acoustic Ecology", "Noise-Induced Hearing Loss"],
  },

  {
    id: "acoustic-ecology",
    term: "Acoustic Ecology",
    category: "social",
    definition:
      "The study of the relationship between living organisms — including humans — and their sonic environment. Founded by Canadian composer R. Murray Schafer and the World Soundscape Project in the 1970s. Concerned with the cultural, ecological, and perceptual dimensions of sound and listening.",
    context:
      "Acoustic ecology insists that the sonic environment is not background — it is constitutive of place, identity, and health. Schafer introduced the concepts of 'keynote sounds' (the underlying sonic texture of an environment), 'soundmarks' (sonically significant features of a place), and 'soundscape design' (the intentional shaping of acoustic environments). His concept of 'lo-fi soundscape' — an environment where individual sounds are obscured by a general noise blanket — anticipated decades of public health research. The World Soundscape Project produced foundational recordings and analyses of sonic environments in Canada and Europe. Acoustic ecology has since influenced urban planning, architecture, heritage conservation, and environmental law.",
    sources: [
      "Schafer, R.M., 'The Tuning of the World' (1977), Knopf",
      "Truax, B., 'Acoustic Communication' (2nd ed., 2001), Ablex",
      "Wrightson, K., 'An Introduction to Acoustic Ecology' (2000), Soundscape: The Journal of Acoustic Ecology",
    ],
    relatedTerms: ["Soundscape", "Ambient Noise", "Noise Pollution"],
  },

  {
    id: "hyperacusis",
    term: "Hyperacusis",
    category: "health",
    definition:
      "A chronic condition characterised by an abnormally reduced tolerance to ordinary environmental sounds that others find acceptable. Affects approximately 9% of adults, often co-occurring with tinnitus and following noise-induced cochlear damage.",
    context:
      "Hyperacusis is noise harm turned inward: the body that has been damaged by excessive sound becomes, in turn, hypersensitive to sound at any level. Ordinary environments — supermarkets, offices, traffic — become physically painful or overwhelming. Social withdrawal and anxiety are common consequences. The condition is poorly understood neurologically: the audiological pathways are unclear and effective treatments remain limited. Hyperacusis challenges the notion that 'safe' noise levels are absolute — for those with the condition, thresholds that regulatory frameworks consider acceptable can cause genuine suffering.",
    relatedDbThreshold: 70,
    sources: [
      "Baguley, D. and McFerran, D., 'Hyperacusis and Disorders of Loudness Perception' (2011), Plural Publishing",
      "Jüris, L. et al., 'Hyperacusis — prevalence and characteristics' (2014), Hearing Research",
    ],
    relatedTerms: ["Tinnitus", "Noise-Induced Hearing Loss", "Noise Sensitivity"],
  },

  {
    id: "noise-sensitivity",
    term: "Noise Sensitivity",
    category: "health",
    definition:
      "An individual trait reflecting the degree to which a person is affected by environmental noise independent of actual exposure levels. A high noise-sensitive individual will experience greater annoyance, sleep disruption, and health effects at the same objective dB level as a less sensitive person.",
    context:
      "Noise sensitivity is not merely subjective weakness — it is a measurable psychological construct that predicts health outcomes independently of measured noise levels. It is higher in people with anxiety disorders, certain neurological conditions, and following noise-induced cochlear damage. Standard noise regulation sets limits based on population averages, systematically failing those with elevated sensitivity. This is a form of structural ableism embedded in acoustic regulation: the metric is calibrated to the median body, not the most vulnerable one.",
    sources: [
      "Stansfeld, S., 'Noise, noise sensitivity and psychiatric disorder' (1992), Psychological Medicine",
      "Ellermeier, W. et al., 'Psychoacoustic correlates of individual noise sensitivity' (2001), Journal of the Acoustical Society of America",
    ],
    relatedTerms: ["Noise Annoyance", "Hyperacusis", "Night Noise"],
  },

  {
    id: "quiet-areas",
    term: "Quiet Areas",
    category: "environmental",
    definition:
      "Areas designated under the EU Environmental Noise Directive (Article 8) as zones to be protected from increases in noise. May include urban parks, rural landscapes, or residential zones of particular acoustic value.",
    context:
      "The concept of quiet areas introduces a right not just to be protected from noise, but to access silence as a public good. It acknowledges that quiet is scarce, unequally distributed, and worth defending legally. In practice, designation of quiet areas has been inconsistent across member states, with few enforceable protections. Urban quiet areas are under constant pressure from development, transport infrastructure, and event noise. The political contest over quiet areas mirrors the contest over green space: quietness, like clean air and natural environments, tends to be commodified, privatised, and distributed away from those who most need it.",
    sources: [
      "EU Environmental Noise Directive 2002/49/EC, Article 3(l) and Article 8",
      "Murphy, E. and King, E.A., 'Strategic Environmental Noise Mapping: Methodological Issues Concerning the Implementation of the EU Environmental Noise Directive' (2010), Environment International",
    ],
    relatedTerms: ["Environmental Noise Directive", "Soundscape", "Environmental Justice and Noise"],
  },

  {
    id: "attali-noise",
    term: "Noise as Political Economy (Attali)",
    category: "social",
    definition:
      "Jacques Attali's theoretical framework, developed in 'Bruits' (1977), arguing that noise — and its organisation into music — is a mirror of political power. In his reading, the control of sound is the control of society: noise is what threatens order; music is noise that has been disciplined and commodified.",
    context:
      "Attali's work is not primarily about environmental noise, but it provides the sharpest theoretical vocabulary for understanding noise as a political category. His central claim: 'All music, any organization of sounds is then a tool for the creation or consolidation of a community, a totality.' The noise that escapes this organisation — industrial, environmental, urban — is simultaneously a threat to political order and evidence of social rupture. To map noise, as Noisecatcher does, is to make audible a set of power relations: who generates noise, who absorbs it, and whose discomfort is made legally invisible. Attali's framework connects acoustic ecology to political economy in ways that standard noise regulation cannot acknowledge.",
    sources: [
      "Attali, J., 'Noise: The Political Economy of Music' (1985, orig. 'Bruits' 1977), University of Minnesota Press",
    ],
    relatedTerms: ["Environmental Justice and Noise", "Soundscape", "Noise Pollution"],
  },

  {
    id: "acoustic-commons",
    term: "Acoustic Commons",
    category: "social",
    definition:
      "The shared sonic environment understood as a common resource — like clean air or public space — to which communities have collective rights and responsibilities. Noise pollution is, in this framing, a form of enclosure: the appropriation of shared acoustic space by private interests.",
    context:
      "The concept of acoustic commons draws on commons theory (Hardin, Ostrom) and applies it to sound. When a factory, highway, or airport appropriates the surrounding soundscape, it is enclosing an acoustic commons — imposing its noise on a community that has not consented and bears the health costs without compensation. This framing has legal implications: it provides a conceptual basis for noise nuisance claims, rights-of-quiet lawsuits, and community opposition to infrastructure. Several legal scholars have argued for a right to acoustic quiet analogous to the right to clean air. The acoustic commons is also increasingly considered in indigenous rights contexts, where soundscape integrity is part of cultural heritage.",
    sources: [
      "Hildebrand, J.G., 'Noise Pollution: An Introduction to the Problem and an Outline for Future Legal Research' (1970), Columbia Law Review",
      "Bijsterveld, K., 'Mechanical Sound: Technology, Culture, and Public Problems of Noise in the Twentieth Century' (2008), MIT Press",
    ],
    relatedTerms: ["Environmental Justice and Noise", "Noise Pollution", "Quiet Areas"],
  },

  {
    id: "type-1-type-2-meter",
    term: "Class 1 / Class 2 Sound Level Meter",
    category: "legal",
    definition:
      "Classification of sound level meters by precision grade under the current IEC 61672-1:2013 standard. Class 1 (precision grade) has a tolerance of ±1.1 dB at 1 kHz; Class 2 (general purpose) has a tolerance of ±1.4 dB at 1 kHz. Tolerances widen significantly at frequency extremes. Legal and regulatory noise measurements typically require Class 1 instruments. Note: the older ANSI terminology used 'Type 1 / Type 2' — IEC 61672 replaced this with 'Class 1 / Class 2.'",
    context:
      "The Class 1 / Class 2 distinction is where scientific credibility and legal admissibility are determined. A smartphone measurement — even a well-calibrated one — is not a certified instrument. This matters in court, in planning appeals, and in noise nuisance enforcement. Certified instruments must be regularly calibrated against acoustic references and operated by trained technicians. The cost of Class 1 equipment (typically €1,000–5,000) and the expertise required place formal acoustic evidence out of reach for most individuals and community groups. Noisecatcher's data can support a case, establish a pattern, and justify a request for official measurement — but the certified measurement itself requires institutional resources that are inequitably distributed. Smartphone accuracy under controlled conditions with calibration: flagship iOS devices with selected apps can achieve ±2–3 dB(A) at mid-frequencies (Kardous & Shaw, JASA 2014/2016); uncalibrated devices are typically ±5–10 dB. Zero Android apps met the ±2 dB criterion in the 2014 study, though newer flagship devices have improved.",
    sources: [
      "IEC 61672-1:2013 — Electroacoustics: Sound level meters — Part 1: Specifications",
      "ISO 1996-2:2017 — Determination of sound pressure levels",
      "Kardous & Shaw, 'Evaluation of smartphone sound measurement applications' (JASA, 2014) — 192 apps tested; only 4 iOS apps within ±2 dB",
      "Kardous & Shaw, 'Evaluation of smartphone sound measurement applications: follow-up study' (JASA, 2016) — external microphones substantially improve accuracy",
      "Murphy & King, 'Smartphone-based noise measurement' (Applied Acoustics, 2016) — 1,472 tests on 100 phones",
    ],
    relatedTerms: ["Sound Pressure Level", "dB(A) — A-Weighting", "WHO Environmental Noise Guidelines"],
  },

  {
    id: "dose-response",
    term: "Dose–Response Relationship",
    category: "health",
    definition:
      "The quantified relationship between the level and duration of noise exposure (the dose) and the probability of a health outcome (the response), such as annoyance, sleep disturbance, cardiovascular disease, or hearing loss.",
    context:
      "Dose–response curves are the epidemiological infrastructure of noise policy. Miedema and Oudshoorn (2001) produced the curves used in the WHO 2018 guidelines, derived from pooled European transportation noise studies. They allow calculation of the percentage of a population 'highly annoyed' (%HA) at any given Lden value. These curves are both powerful and contested: they are derived from specific populations at specific times, they do not adequately represent children, the elderly, or people with noise sensitivity, and they do not capture cumulative exposure from multiple simultaneous sources. The dose–response model implicitly accepts that some proportion of a population will be harmed — it calculates the tolerable rate of harm, not its elimination.",
    sources: [
      "Miedema, H.M.E. and Oudshoorn, C.G.M., 'Annoyance from transportation noise: relationships with exposure metrics DNL and DENL and their confidence intervals' (2001), Environmental Health Perspectives",
      "WHO, 'Environmental Noise Guidelines for the European Region' (2018), Annexes",
    ],
    relatedTerms: ["Noise Annoyance", "Equivalent Continuous Sound Level", "Cardiovascular Noise Effects"],
  },

  {
    id: "conflict-zone-acoustics",
    term: "Conflict Zone Acoustics",
    category: "social",
    definition:
      "The study and documentation of sound in armed conflict environments — including explosions, gunfire, artillery, air raids, drone noise, and acoustic weapons — and the distinct health consequences for civilian populations living in or near conflict zones.",
    context:
      "Conflict generates some of the most extreme acoustic events a human body can experience. A single artillery explosion can exceed 180 dB(A) at close range — well above the threshold for immediate, irreversible cochlear destruction. But the harm is not only auditory. Chronic exposure to combat noise produces PTSD, hypervigilance, severe sleep disruption, and cardiovascular damage. Children who grow up near active conflict zones show patterns of noise-induced cognitive impairment indistinguishable from those documented near airports and highways — compounded by trauma. Acoustic weapons such as the LRAD (Long Range Acoustic Device) have been deployed against civilian protesters and populations as instruments of crowd control and psychological pressure: sustained exposure at >100 dB can cause permanent hearing damage, nausea, and disorientation. Noisecatcher includes a conflict zone category precisely because noise in these environments is not a side effect — it is a mechanism of harm, a form of collective punishment, and, when systematically deployed, a potential violation of international humanitarian law. Documenting it is an act of witness. Users recording in conflict zones should be aware that precise GPS data carries personal safety risks; the app displays a safety warning accordingly.",
    sources: [
      "Dougherty, A.L. et al., 'Blast-related ear injury in current U.S. military operations' (2013), Journal of the American Academy of Audiology",
      "WHO, 'Preventing noise-induced hearing loss' (WHO Fact Sheet, 2015)",
      "Amnesty International, 'LRAD use against civilians in protest situations' (various reports)",
      "ICRC, 'Health care in danger: A sixteen-country study' (2011) — documents acoustic trauma in conflict medical settings",
      "UN Committee on the Rights of the Child, 'Impact of armed conflict on children' (various sessions)",
    ],
    relatedTerms: ["Acoustic Trauma", "Impulse Noise", "Noise-Induced Hearing Loss", "Participatory Noise Sensing"],
  },

  {
    id: "gentrification-acoustic",
    term: "Gentrification & Acoustic Displacement",
    category: "social",
    definition:
      "The process by which rising property values, urban renewal, and the arrival of higher-income residents leads to selective enforcement of noise ordinances and zoning regulations that silence or displace the cultural expressions, businesses, and communities of existing, often lower-income, residents.",
    context:
      "Noise ordinances are not neutral. Their enforcement is shaped by who complains, who is listened to, and whose sounds are coded as nuisance versus culture. In cities undergoing gentrification — from East London to East Harlem, from Brixton to Belleville — the pattern repeats: new residents complain about existing music venues, street activity, religious celebrations, market noise, and children playing. Enforcement follows. Venues close. Communities disperse. The sonic texture of a neighborhood — its rhythm, language, music, worship — is erased in parallel with its people. This process has been documented in Black neighborhoods in Chicago and New York (where jazz and R&B venues faced noise ordinances that did not apply equivalently to classical music venues), in Latin neighborhoods in Los Angeles and London, and in immigrant communities across Europe. Researchers term this 'acoustic gentrification': the quieting of a neighborhood as a precondition for its commodification. Silence, in this context, is not a neutral absence — it is the sound of displacement. Noisecatcher's map can make this process visible: patterns of noise enforcement, the disappearance of acoustic landmarks, the homogenization of urban soundscapes toward a sanitized, market-ready quiet.",
    sources: [
      "Atkinson, R., 'Ecology of Sound: The Sonic Order of Urban Space' (2007), Urban Studies",
      "Habermas, J., 'The Structural Transformation of the Public Sphere' (1989) — theoretical basis for acoustic public space",
      "Hae, L., 'The Gentrification of Nightlife and the Right to the City' (2012), Routledge — documents closure of music venues via noise ordinance enforcement",
      "Fikentscher, K., 'Underground and Aesthetic: The Politics of Black Music in the Diaspora' — on racialized application of noise law",
      "Bianchini, F., 'Night Cultures, Night Economies' (1995), Planning Practice & Research",
      "Lefebvre, H., 'The Right to the City' (1968) — foundational framework for urban cultural space",
    ],
    relatedTerms: ["Environmental Justice and Noise", "Acoustic Commons", "Soundscape", "Noise Pollution"],
  },

  {
    id: "participatory-noise-sensing",
    term: "Participatory Noise Sensing",
    category: "social",
    definition:
      "Community-based approaches to environmental noise measurement in which residents — rather than regulators — collect, share, and interpret acoustic data using smartphones or low-cost sensors. Part of the broader citizen science and environmental justice movements.",
    context:
      "The NoiseTube project (Vrije Universiteit Brussel, 2008–2012) was a pioneering effort in participatory noise sensing, using GPS-tagged smartphone measurements to produce community noise maps. The field has since grown substantially, with projects like Noise Planet (IFSTTAR, France), the OpenSense initiative, and various urban sensing experiments. Participatory sensing democratises acoustic data collection but introduces challenges: measurement inconsistency across devices, calibration gaps, spatial and temporal sampling bias, and the risk that data collected by communities is appropriated by institutions without benefit to those communities. Noisecatcher is part of this tradition — committed to the proposition that the people who live with noise should also have the tools to measure and contest it.",
    sources: [
      "Maisonneuve, N. et al., 'NoiseTube: Measuring and mapping noise pollution with mobile phones' (2009), IFIP Advances in Information and Communication Technology",
      "Picaut, J. et al., 'An open-science crowdsourcing approach for producing community noise maps' (2019), Noise Mapping",
    ],
    relatedTerms: ["Environmental Justice and Noise", "Soundscape", "Noise Pollution"],
  },
  {
    id: "infrasound",
    term: "Infrasound",
    phonetic: "IN-fruh-sound",
    category: "acoustic",
    definition:
      "Sound at frequencies below 20 Hz — beneath the threshold of normal human hearing. Although inaudible to most people, infrasound is physically felt and can cause physiological effects including disorientation, nausea, anxiety, and what researchers call 'presence phenomena' at sufficient intensity.",
    context:
      "Infrasound is distinct from Low-Frequency Noise (LFN): LFN is audible, typically 20–200 Hz; infrasound is sub-audible. Major anthropogenic sources include wind turbines (blade-passing frequency, typically 0.5–2 Hz), large industrial fans and compressors, mining blasts, heavy rail, and certain military systems. Natural sources include earthquakes, volcanoes, ocean surf, and severe weather. Because infrasound penetrates walls and travels vast distances with little attenuation, it is extremely difficult to block or control. The measurement and health assessment of infrasound exposure remains contested terrain in acoustics, with industrial interests frequently disputing community reports of symptoms near wind energy installations. ISO 7196 provides measurement guidance, and the WHO's 1999 community noise guidelines note that health data on infrasound are 'sparse but suggestive.'",
    sources: [
      "Leventhall, H.G., 'A Review of Published Research on Low Frequency Noise and its Effects' (2003), UK DEFRA",
      "Salt, A.N. & Kaltenbach, J.A., 'Infrasound from Wind Turbines Could Affect Humans' (2011), Bulletin of Science, Technology & Society",
      "ISO 7196:1995 — Acoustics: Frequency-weighting characteristic for infrasound measurements (G-weighting)",
    ],
    relatedTerms: ["Low-Frequency Noise (LFN)", "Sound Pressure Level", "Noise Sensitivity"],
  },
  {
    id: "underwater-noise",
    term: "Underwater Noise Pollution",
    category: "environmental",
    definition:
      "Anthropogenic sound introduced into marine environments — oceans, rivers, and lakes — that disrupts or harms aquatic ecosystems. Major sources include commercial shipping, military sonar, seismic airgun surveys, offshore construction, and motorized recreational watercraft.",
    context:
      "The ocean is not silent. Before industrialization, marine acoustic environments were shaped by wind, waves, rainfall, earthquake, and the biological sounds of fish, whales, and crustaceans. Since 1950, low-frequency ambient noise in the world's oceans has increased by approximately 3 dB per decade — a doubling of acoustic power roughly every ten years. Commercial shipping is the dominant source: a single container ship can produce noise exceeding 190 dB re 1 μPa at 1 m. For cetaceans — whales, dolphins, porpoises — that navigate, hunt, and communicate through sound, this constitutes an existential threat. Orca populations show reduced vocalization ranges; humpback whales have altered migration routes; beaked whales have stranded en masse following naval sonar exercises. Regulation is minimal and largely voluntary. The International Maritime Organization adopted guidelines on underwater noise in 2014, but compliance monitoring is absent. The acoustic devastation of marine environments is one of the least-reported dimensions of the contemporary ecological crisis.",
    relatedDbThreshold: 85,
    sources: [
      "Hildebrand, J.A., 'Anthropogenic and natural sources of ambient noise in the ocean' (2009), Marine Ecology Progress Series",
      "NRC (National Research Council), 'Ocean Noise and Marine Mammals' (2003), National Academies Press",
      "International Maritime Organization, 'Guidelines for the Reduction of Underwater Noise from Commercial Shipping' (2014), MEPC.1/Circ.833",
    ],
    relatedTerms: ["Acoustic Ecology", "Environmental Justice and Noise", "Noise Pollution"],
  },
  {
    id: "sonic-boom",
    term: "Sonic Boom",
    category: "acoustic",
    definition:
      "The explosive acoustic shock wave produced when an object — typically a military aircraft or spacecraft re-entry vehicle — exceeds the speed of sound. The characteristic double-boom (N-wave) can reach 65–200+ Pa overpressure (130–140+ dB SPL) at ground level, sufficient to shatter windows and cause structural damage.",
    context:
      "Sonic booms are not instantaneous events: they produce a continuous 'boom carpet' along the entire supersonic flight path, meaning a single overflight can expose hundreds of kilometres of inhabited territory to the event simultaneously. Military exercises, NASA test flights, and — increasingly — commercial supersonic aviation programmes (notably Boom Supersonic and Aerion) are the primary sources. Commercial supersonic flight was banned over the continental United States in 1973 precisely because of sonic boom impacts; the FAA is now revisiting this ban. Civilian complaints about boom events are systematically undercounted because they are diffuse (no single operator is nearby), brief, and hard to attribute. Boom-induced building damage claims against military authorities are notoriously difficult to pursue legally. Noisecatcher's 'aircraft' category is relevant for documenting boom events with timestamp and location data.",
    sources: [
      "Plotkin, K.J., 'State of the art of sonic boom modelling' (2002), Journal of the Acoustical Society of America",
      "FAA, 'Supersonic Flight — Sonic Boom' (14 CFR Part 91.817)",
      "Boom Supersonic, 'Community and Environmental Impact' disclosures",
    ],
    relatedTerms: ["Impulse Noise", "Acoustic Trauma", "Sound Pressure Level"],
  },
  {
    id: "occupational-noise",
    term: "Occupational Noise",
    category: "health",
    definition:
      "Sound exposure encountered in workplace settings that, over time, causes permanent hearing damage, tinnitus, and associated psychological effects. The leading cause of preventable hearing loss worldwide. NIOSH recommends an exposure limit of 85 dB(A) as an 8-hour time-weighted average; OSHA's permissible limit is 90 dB(A).",
    context:
      "Occupational noise-induced hearing loss (ONIHL) affects an estimated 22 million US workers annually and is responsible for $242 million in workers' compensation payments per year. The most exposed sectors are mining, quarrying, construction, agriculture, manufacturing, and entertainment (including music). The 3 dB exchange rate (used by NIOSH) means that for every 3 dB increase in exposure level, permissible duration is halved; OSHA still uses the less protective 5 dB exchange rate — a regulatory gap that industry has resisted closing for decades. Occupational noise exposure is a class issue: workers in high-noise industries are disproportionately low-income, immigrant, and Black and Latino. Access to hearing protection is often inadequate, and enforcement of hearing conservation programmes is inconsistent. ONIHL is categorically underreported in official statistics because symptoms emerge gradually over years and often go unclaimed.",
    relatedDbThreshold: 85,
    sources: [
      "NIOSH, 'Criteria for a Recommended Standard: Occupational Noise Exposure' (1998), Publication No. 98-126",
      "OSHA, '29 CFR 1910.95 — Occupational Noise Exposure' (US federal standard)",
      "Basner, M. et al., 'Auditory and non-auditory effects of noise on health' (2014), The Lancet",
    ],
    relatedTerms: ["Noise-Induced Hearing Loss", "Tinnitus", "Dose–Response Relationship"],
  },
  {
    id: "continuous-noise",
    term: "Continuous Noise",
    category: "acoustic",
    definition:
      "Noise that remains at a relatively stable level over time, without significant fluctuations or interruptions. Highway traffic, industrial machinery, HVAC systems, and data centres are archetypal continuous noise sources. Contrasted with intermittent noise (irregular events) and impulse noise (brief high-energy spikes).",
    context:
      "The classification of noise by its temporal behaviour is foundational to both measurement and regulatory practice. Continuous noise is assessed primarily through the Equivalent Continuous Sound Level (Leq), which averages energy over a measurement period. It is generally considered easier to habituate to than intermittent noise — although habituation in the physiological sense (reduced cortisol response) does not reliably occur; people report 'getting used to' highway noise while their blood pressure and sleep quality continue to be affected. The distinction matters for environmental assessment: a planning authority may deem a new road acceptable at 60 dB(A) Leq while ignoring the far more disturbing 75 dB(A) maximum levels of passing trucks. Continuous noise masks communication, degrades concentration, and — in residential settings — constitutes a form of slow violence against working-class neighbourhoods that cannot afford to relocate.",
    sources: [
      "ISO 1996-1:2016 — Acoustics: Description, measurement and assessment of environmental noise",
      "Berglund, B. et al., 'Community Noise' (1999), WHO",
    ],
    relatedTerms: ["Equivalent Continuous Sound Level", "Impulse Noise", "Ambient Noise"],
  },
  {
    id: "acoustic-racism",
    term: "Acoustic Racism / Sonic Justice",
    category: "social",
    definition:
      "The racialised and class-based inequities embedded in how noise is produced, tolerated, regulated, and weaponised. Acoustic racism names the ways that noise pollution is disproportionately imposed on Black, Indigenous, and low-income communities; that the sounds of racialised communities are policed and criminalized; and that the legal and planning systems that govern noise systematically protect white and wealthy spaces.",
    context:
      "Acoustic racism operates on multiple levels simultaneously. First, the geography of industrial noise: highways, airports, railways, and factories are sited disproportionately near communities of colour — a documented pattern in the United States, the United Kingdom, France, and across the Global South. Second, the policing of sound: anti-noise ordinances targeting music, language, and gathering that are selectively enforced against Black and immigrant communities. Third, the silence of gentrification: as discussed in the Gentrification & Acoustic Displacement entry, the arrival of white residents in historically Black or Latino neighbourhoods reliably triggers noise complaints against the pre-existing cultural practices of those communities — jazz in New Orleans, cumbia in East Los Angeles, bachata in Washington Heights, rai in Belleville. Fourth, the sonic weaponisation of the state: from LRAD deployment against Black Lives Matter protestors to the use of sound cannons at Standing Rock, acoustic weapons are tools of racialised state violence. The concept of 'sonic justice' — advanced by scholars including Nina Sun Eidsheim, Julian Henriques, and Josh Kun — proposes the inverse: acoustic environments shaped by equity, the right to sonorous presence, and freedom from imposed noise.",
    sources: [
      "Eidsheim, N.S., 'The Race of Sound: Listening, Timbre, and Vocality in African American Music' (2019), Duke University Press",
      "Henriques, J., 'Sonic Bodies: Reggae Sound Systems, Performance Techniques, and Ways of Knowing' (2011), Continuum",
      "Hae, L., 'The Gentrification of Nightlife and the Right to the City' (2012), Routledge",
      "Checker, M., 'Polluted Promises: Environmental Racism and the Search for Justice in a Southern Town' (2005)",
    ],
    relatedTerms: ["Environmental Justice and Noise", "Gentrification & Acoustic Displacement", "Acoustic Commons", "Noise Pollution"],
  },
  {
    id: "sonic-warfare",
    term: "Sonic Warfare",
    category: "social",
    definition:
      "The deliberate weaponisation of sound — by states, militaries, and security forces — to control, disorient, disperse, injure, or psychologically degrade human subjects. Coined theoretically by producer and scholar Steve Goodman (kode9), sonic warfare encompasses acoustic crowd-control weapons, military torture by music, infrasonic harassment, and the broader mobilisation of vibration as a medium of power.",
    context:
      "Steve Goodman's foundational text 'Sonic Warfare: Sound, Affect, and the Ecology of Fear' (MIT Press, 2010) traces how military and corporate interests have colonised the frequency spectrum — from ultrasonic dog deterrents and infrasonic stress induction to the LRAD (Long Range Acoustic Device) and the weaponised use of popular music in CIA detention sites. Juliette Volcler's 'Extremely Loud' (2013) documents the deployment of acoustic weapons in specific theatres: the LRAD against Iraqi and Afghan civilians, sound cannons at Standing Rock 2016, sonic torture at Guantánamo. Acoustic weapons have been documented at: Ferguson, Missouri (2014); Hong Kong (2019–2020); Portland, Oregon (2020); Paris during Gilets Jaunes (2018–2019); Kashmir; Gaza; Myanmar (2021). Forensic Architecture has investigated acoustic weapon deployments using spatial audio analysis. The UN Special Rapporteur on the Rights to Freedom of Peaceful Assembly has called for international standards on their use in civilian contexts. Noisecatcher is designed to function as civilian documentation infrastructure in these contexts: time-stamped, GPS-tagged measurements that constitute civic evidence of acoustic violence. If you are near a deployment: distance yourself first. Record second.",
    sources: [
      "Goodman, S., 'Sonic Warfare: Sound, Affect, and the Ecology of Fear' (2010), MIT Press",
      "Volcler, J., 'Extremely Loud: Sound as a Weapon' (2013), The New Press",
      "Cusick, S., 'Music as Torture / Music as Weapon' (2006), Transcultural Music Review",
      "Amnesty International, 'Crowd Control: A Deadly Business' (2015), ACT 30/001/2015",
      "UN Special Rapporteur on Peaceful Assembly, reports on acoustic crowd control (2020–2023)",
      "Forensic Architecture, 'The Use of Force in Protests' investigations",
    ],
    relatedTerms: ["Acoustic Weapons (LRAD)", "Conflict Zone Acoustics", "Infrasound", "Acoustic Trauma", "Acoustic Racism / Sonic Justice"],
  },
  {
    id: "lrad-acoustic-weapon",
    term: "LRAD — Long Range Acoustic Device",
    phonetic: "L-RAD",
    category: "legal",
    definition:
      "A directed-energy acoustic weapon manufactured by Genasys Inc. (formerly LRAD Corporation), capable of projecting sustained, high-intensity sound in a narrow beam over distances up to 3 km. Used by military forces, law enforcement, and maritime security for crowd dispersal, communication, and targeted harassment. Maximum specification: 162 dB SPL at source (LRAD 2000X); causes permanent hearing damage, tinnitus, vestibular disorders, and psychological trauma.",
    context:
      "The LRAD was originally developed as a hailing device for US Navy vessels following the 2000 USS Cole bombing. Its use has since expanded dramatically: deployed by US law enforcement at the G20 Pittsburgh (2009), Ferguson (2014), Standing Rock (2016), and throughout the 2020 Black Lives Matter protests. Documented internationally by Israeli forces in the West Bank, by Myanmar military against protesters (2021), by French police during Gilets Jaunes, and by Hong Kong riot police (2019). At 'communication' settings (around 120 dB at 1m), it causes immediate pain and disorientation — 120 dB marks the lower boundary of the pain zone, with individual thresholds ranging 120–140 dB. At maximum 'deterrent' settings (162 dB, per manufacturer specification for the LRAD 2000X), even brief unprotected exposure causes immediate permanent hearing damage. LRAD deployments have been examined under international humanitarian law proportionality and indiscriminate-effects provisions; Amnesty International and Human Rights Watch have documented serious injuries from LRAD use at protests. No binding IHL ruling or treaty provision categorically classifies LRADs as lethal weapons, but their use has been challenged under domestic constitutional law: Rauen v. City of Pittsburgh (2010) established that LRAD use could constitute Fourth Amendment violations; Ngo v. City of Los Angeles (2021) resulted in a settlement. The device identifies its operator on any pin map by the acoustic signature: steady-state directional tone typically between 2,100 and 3,100 Hz.",
    relatedDbThreshold: 120,
    sources: [
      "Genasys Inc., LRAD product specifications and operational manual",
      "Amnesty International, 'Crowd Control: A Deadly Business' (2015), ACT 30/001/2015",
      "ACLU, 'The Politics of Dissent: Policing Protest in America' (2020)",
      "Rauen v. City of Pittsburgh, USDC W.D. Pa. (2010)",
      "Volcler, J., 'Extremely Loud: Sound as a Weapon' (2013), The New Press, Chapter 3",
      "UN Committee Against Torture, observations on acoustic weapons in civilian contexts",
    ],
    relatedTerms: ["Sonic Warfare", "Conflict Zone Acoustics", "Acoustic Trauma", "Impulse Noise"],
  },
  {
    id: "police-brutality-noise",
    term: "Police Brutality & Acoustic Violence",
    category: "social",
    definition:
      "The use of sound-producing weapons, devices, and tactics by law enforcement as tools of crowd control, punishment, and intimidation — including LRADs, flash-bang grenades, rubber bullet launchers, low-flying helicopters, and high-intensity sirens. Acoustic violence by police causes permanent hearing loss, vestibular damage, PTSD, and panic injuries in bystanders, journalists, and protesters who are not its intended targets.",
    context:
      "Police acoustic violence is a structural feature of protest suppression, not an aberration. Flash-bang grenades (stun grenades) emit impulse noise of 170–180 dB at 1 m — well above the threshold for immediate permanent hearing damage (around 140 dB). LRAD sound cannons deployed at protests generate sustained directional tones at 120–162 dB; even a short exposure causes tinnitus and disorientation. Low-altitude police helicopter operations over protest sites sustain 85–95 dB at ground level for hours, causing documented psychological and physiological stress. Rubber bullets and 40mm launcher rounds generate 130–140 dB impulse noise close to users. \n\nDocumented deployments include: Ferguson, Missouri (2014) — LRAD against Black Lives Matter protesters; Pittsburgh G20 (2009) — first documented US domestic LRAD use; Standing Rock, North Dakota (2016) — LRAD and water cannon against Indigenous water protectors in winter conditions; Portland, Oregon (2020–2021) — sustained LRAD and munitions use over 100+ nights; Paris, France (2018–2019) — flash-ball launchers and grenades against Gilets Jaunes, resulting in 24 eye losses and 5 hands blown off; Colombo, Sri Lanka (2022); Santiago, Chile (2019); Dhaka, Bangladesh (2024). \n\nIn France, the LBD 40 (Lanceur de Balles de Défense) and the GM2L grenade have been documented by Désarmons-les and the Observatoire des pratiques policières as causing life-altering injuries at protests. Human Rights Watch, Amnesty International, and the UN Committee Against Torture have all called for prohibition or strict regulation. \n\nNoisecatcher's 'Police brutality' category is designed to give protesters, journalists, and bystanders the tools to document acoustic events in real time: GPS coordinates, decibel levels, and timestamps that constitute admissible evidence in legal proceedings and accountability investigations. If you are near police acoustic weapons: protect your hearing first — distance yourself and use ear protection. Record second.",
    relatedDbThreshold: 120,
    sources: [
      "Amnesty International, 'Crowd Control: A Deadly Business' (2015), ACT 30/001/2015",
      "Human Rights Watch, 'Kettling Protesters in the Bronx' (2021) — documentation of acoustic and physical crowd control",
      "ACLU, 'The Politics of Dissent: Policing Protest in America' (2020)",
      "Désarmons-les / Observatoire des pratiques policières (France) — LBD 40 and grenade injury database",
      "Forensic Architecture, 'The Use of Force in Protests' investigations",
      "UN Special Rapporteur on the Rights to Freedom of Peaceful Assembly, A/HRC/44/24 (2020)",
      "Volcler, J., 'Extremely Loud: Sound as a Weapon' (2013), The New Press",
      "Delmas, C., 'A Duty to Resist: When Disobedience Should Be Uncivil' (2018), Oxford UP — legal and political frameworks for protest rights",
    ],
    relatedTerms: ["LRAD — Long Range Acoustic Device", "Sonic Warfare", "Acoustic Trauma", "Impulse Noise", "Acoustic Racism / Sonic Justice", "Conflict Zone Acoustics"],
  },

  // ── Phase 2 & 3 additions ─────────────────────────────────────────────────

  // ── Round 2 research additions ───────────────────────────────────────────

  // ── Forensic Architecture methods ────────────────────────────────────────

  {
    id: "ear-witnessing",
    term: "Ear Witnessing",
    category: "social",
    definition:
      "The use of acoustic memory — the recollection of sounds, echoes, durations, and rhythms — as forensic evidence in the absence of visual documentation or physical access to a site. Developed by Forensic Architecture in their investigation of Saydnaya Military Prison, Syria.",
    context:
      "In 2016–2017, Forensic Architecture worked with Lawrence Abu Hamdan and Amnesty International to investigate Saydnaya Military Prison, Syria, where an estimated 13,000+ people were executed. Former detainees had been blindfolded or kept in total darkness. Unable to see the space, they had mapped it through sound: the height of ceilings measured by echo, the number of cells inferred from door rhythms, the proximity of guards gauged by footstep timing. Architects and acoustic engineers translated this testimony into a 3D model, then used impulse response simulation to validate whether the acoustic properties of the reconstructed space matched the survivors' sonic memories. The title 'The Missing 19dB' refers to the 19 dB drop in whisper volume documented across successive generations of prisoners — each cohort whispered 19 dB lower than their predecessors, driven by escalating terror and the absolute prohibition on sound. This 19 dB was acoustically reconstructed from survivor testimony, not measured in the field. It is one of the most powerful examples of earwitness methodology ever produced: a number derived entirely from the disciplined memory of people under extreme duress, used to document state crime. For Noisecatcher, ear witnessing names a practice already embedded in the app's description fields and temporal pin status: when direct measurement is impossible — when you hear something but cannot stop and record — the disciplined documentation of what you heard, when, and where is still forensic evidence.",
    sources: [
      "Forensic Architecture, 'Saydnaya: Inside a Syrian Torture Prison' (2016) — forensic-architecture.org/investigation/saydnaya",
      "Weizman, E., Forensic Architecture: Violence at the Threshold of Detectability (Zone Books, 2017)",
      "Lawrence Abu Hamdan — 'Aural Contract: Forensic Listening and the Reorganization of the Speaking Subject' (Cesura // Acceso, 2014)",
    ],
    relatedTerms: ["Acoustic Commons", "Police Brutality & Acoustic Violence", "Sonic Warfare", "Conflict Zone Acoustics", "Political Violence & Acoustic Intimidation"],
  },

  {
    id: "acoustic-triangulation",
    term: "Acoustic Triangulation / Time Difference of Arrival (TDOA)",
    category: "acoustic",
    definition:
      "A technique for locating the origin of a sound by comparing the time at which the same acoustic event is recorded at multiple distinct points. Because sound travels at ~343 m/s, a difference of even a few milliseconds between two recordings indicates the recording point closer to the source heard the sound first.",
    context:
      "TDOA is the acoustic equivalent of GPS trilateration. In forensic investigation, Forensic Architecture has applied it to recordings of gunshots, explosions, and weapons fire across multiple citizen-captured video sources to establish the origin location of shots in conflict zones. The technique requires: (1) at least three recording points with known GPS coordinates; (2) precise audio synchronisation across the recordings — typically done via cross-correlation of the waveform; (3) a solver that finds the origin point minimising residual timing errors given the speed of sound. Implementations range from academic software (GCC-PHAT, SRP-PHAT) to open tools like gunshot localiser systems deployed in cities. For Noisecatcher, TDOA is a concrete future capability: when multiple users record the same noise event in the same area, their GPS-tagged, timestamped recordings could be cross-correlated to triangulate the source — transforming a map of measurements into a map of origins. This is especially relevant for construction noise (locating specific machines inside a site), flight path noise (confirming which runway a low-altitude departure originated from), or the documentation of crowd-control weapons at protests.",
    sources: [
      "Knapp, C. & Carter, G., 'The Generalized Correlation Method for Estimation of Time Delay' (IEEE Trans. Acoustics, Speech, Signal Processing 24:4, 1976)",
      "Forensic Architecture — multi-source audio synchronisation methodology (Douma chemical attack investigation, 2018; Nuba Mountains ceasefire violations, 2016)",
      "Cobos, M. et al., 'A Survey of Sound Source Localization in Wireless Acoustic Sensor Networks' (Wireless Comm. & Mob. Comp., 2017)",
    ],
    relatedTerms: ["Spectrogram", "Machine Listening / Sound Classification", "Conflict Zone Acoustics", "Federated / Crowdsourced Noise Sensing", "Ear Witnessing"],
  },

  {
    id: "counter-forensics",
    term: "Counter-Forensics",
    category: "social",
    definition:
      "The practice of redirecting the epistemic and legal power of forensic methods — traditionally reserved for state institutions — toward the investigation and documentation of state violence, corporate harm, and institutional accountability failures.",
    context:
      "The concept was developed by Eyal Weizman and Forensic Architecture as a response to the observation that forensics, as a discipline, has historically worked in the service of the state: police forensics identifies criminals; military forensics justifies strikes; industrial forensics defends corporations. Counter-forensics inverts this relation — using the same tools (spectral analysis, 3D reconstruction, acoustic modelling, chemical analysis, satellite imaging) to investigate the investigators, to document what the state denies, and to make visible what institutional power works to suppress. Weizman describes the methodology as 'speaking truth to power in the language of power.' The legal forum — the court, the tribunal, the international body — is understood not merely as a venue for adjudication but as a space where counter-forensic evidence can compel attention, generate public record, and shift evidentiary burden. For Noisecatcher, the counter-forensic framework names the political stakes of acoustic monitoring: measuring, pinning, and exporting noise is not a neutral technical act — it is a challenge to the institutional authority to define what constitutes a nuisance, what exceeds acceptable levels, and whose testimony counts as evidence.",
    sources: [
      "Weizman, E., Forensic Architecture: Violence at the Threshold of Detectability (Zone Books, 2017)",
      "Weizman, E., 'Introduction: Forensis' in Forensis: The Architecture of Public Truth (Sternberg Press, 2014)",
      "Forensic Architecture — forensic-architecture.org",
    ],
    relatedTerms: ["Participatory Noise Sensing", "Environmental Justice and Noise", "Acoustic Commons", "Police Brutality & Acoustic Violence", "Ear Witnessing"],
  },

  {
    id: "multi-source-audio-sync",
    term: "Multi-Source Audio Synchronisation",
    category: "acoustic",
    definition:
      "The process of aligning multiple independent recordings of the same acoustic event — taken from different positions, devices, and times — into a unified temporal reference, enabling cross-comparison, triangulation, and contradiction-detection.",
    context:
      "In crowd and protest contexts, a single noise event (a stun grenade, an LRAD burst, a vehicle ramming) may be captured by dozens of smartphones, CCTV systems, and live streams simultaneously, each with different clocks, bitrates, and spatial positions. Forensic Architecture has developed workflows for synchronising these heterogeneous sources through waveform cross-correlation — matching the distinctive peaks of impulsive sounds (gunshots, explosions, door slams) across recordings to establish a common timeline with millisecond precision. The technique exposes discrepancies in official timelines, reveals the sequence of events that justificatory narratives obscure, and makes audible what was spatially invisible. Standard tools in the pipeline include ffmpeg (audio extraction and format normalisation), librosa (Python audio alignment), and custom cross-correlation scripts. The same technique applied to Noisecatcher data would allow multiple users documenting the same construction site or protest event to merge their recordings into a single annotated evidence package — with each contributor's GPS position, timestamp, and measurement contributing to a more complete spatial picture than any single phone could provide.",
    sources: [
      "Forensic Architecture — Douma chemical attack investigation (2018), Nuba Mountains (2016), Killing in Umm al-Hiran (2017)",
      "Forensic Architecture, mtriage: open-source media analysis framework — github.com/forensic-architecture/mtriage",
      "ffmpeg documentation — ffmpeg.org",
    ],
    relatedTerms: ["Acoustic Triangulation / Time Difference of Arrival (TDOA)", "Spectrogram", "Federated / Crowdsourced Noise Sensing", "Ear Witnessing"],
  },

  {
    id: "ecoacoustics",
    term: "Ecoacoustics",
    phonetic: "/ˌiːkəʊəˈkuːstɪks/",
    category: "environmental",
    definition:
      "The scientific discipline studying the role of sound in ecosystems — how organisms communicate through sound, how human-generated noise disrupts these communications, and how acoustic indices can measure ecosystem health without direct observation of individual species.",
    context:
      "Soundscaper Bernie Krause proposed a tripartite model of the soundscape: geophony (non-biological sounds — wind, rain, rivers), biophony (all biological sounds — birdsong, insect choruses, frog calls), and anthrophony (all human-produced sound — traffic, aircraft, machinery). This model is both a scientific framework and a political argument: anthrophony increasingly silences biophony, and acoustic silence is a symptom of ecological collapse. Acoustic indices derived from recordings — the Acoustic Complexity Index (ACI), Acoustic Diversity Index (ADI), Bioacoustic Index (BI), and Normalized Difference Soundscape Index (NDSI) — allow researchers to estimate biodiversity without identifying individual species. Tools like OpenSoundscape (MIT, Carnegie Mellon), BirdNET (Cornell Lab / TU Chemnitz), and the Rainforest Connection's Guardian sensors demonstrate that passive acoustic monitoring — leaving a recorder in a forest — is becoming a primary conservation tool. For Noisecatcher users: recording in parks, forests, wetlands, or coastal areas captures not just human noise but the acoustic ecology of those spaces. Readings with low anthrophony and high biophony represent acoustic refuges — the 'quiet areas' the EU Environmental Noise Directive requires cities to protect.",
    sources: [
      "Krause, B., The Great Animal Orchestra (Little, Brown, 2012)",
      "Sueur, J. & Farina, A., 'Ecoacoustics: the Ecological Investigation and Interpretation of Environmental Sound' (Biosemiotics 8, 2015)",
      "OpenSoundscape — opensoundscape.org (MIT, Carnegie Mellon Kitzes Lab)",
      "Pijanowski, B. et al., 'Soundscape Ecology: the Science of Sound in the Landscape' (BioScience 61, 2011)",
    ],
    relatedTerms: ["Soundscape", "Quiet Areas", "Acoustic Ecology", "Ambient Noise", "Machine Listening / Sound Classification"],
  },

  {
    id: "open-hardware-sensing",
    term: "Open Acoustic Sensing Hardware",
    category: "social",
    definition:
      "Low-cost, open-source hardware devices designed for continuous, unattended acoustic monitoring — filling the gap between smartphone measurements (mobile, opportunistic) and professional monitoring stations (expensive, sparse, institutionally controlled).",
    context:
      "AudioMoth (Open Acoustic Devices, University of Southampton, MIT licence) is the most widely deployed open acoustic sensor: a credit-card-sized device built around an ARM processor and a MEMS microphone, powered by AA batteries, capable of scheduling recordings at specific times and sampling rates, and costing under £50. It has been deployed to detect illegal logging by chainsaw sound, monitor bat populations by ultrasonic call, track whale song, and document noise pollution in remote areas. A Raspberry Pi with a USB microphone and a Noisecatcher-style analysis pipeline can serve as a fixed environmental monitor at construction sites, roadway boundaries, or protest locations — documenting patterns around the clock without a human present. These open hardware approaches democratize the kind of monitoring that has historically cost tens of thousands of euros per station. The combination of community sensing software (Noisecatcher, NoiseCapture) and open hardware (AudioMoth, Raspberry Pi) represents a genuinely new infrastructure for acoustic justice: communities documenting their own conditions without institutional permission.",
    sources: [
      "Hill, A. et al., 'AudioMoth: Evaluation of a smart open acoustic device for monitoring biodiversity and the environment' (Methods in Ecology and Evolution 9, 2018)",
      "Open Acoustic Devices — openacousticdevices.info",
      "Raspberry Pi Foundation — raspberrypi.com",
      "Aide, T. et al., 'Real-time bioacoustics monitoring and automated species identification' (PeerJ, 2013)",
    ],
    relatedTerms: ["Participatory Noise Sensing", "Federated / Crowdsourced Noise Sensing", "Ecoacoustics", "Type 1 / Type 2 Sound Level Meter"],
  },

  {
    id: "training-data-bias",
    term: "Training Data & Algorithmic Bias in Sound Classification",
    category: "social",
    definition:
      "The systematic distortion in machine learning audio classifiers that results from training data drawn disproportionately from specific geographies, recording conditions, and cultural contexts — causing models to perform unevenly across the full range of human acoustic environments.",
    context:
      "AudioSet — the 2M-clip, 521-class dataset underpinning YAMNet and most modern audio classifiers — was assembled by Googlers from YouTube videos. YouTube's user base is skewed toward wealthy, urban, English-speaking environments. The acoustic signatures of construction in Lagos, motorcycle taxis in Hanoi, or market vendors in Dakar are underrepresented or absent. UrbanSound8K (8,732 clips, 10 classes — New York City bias) and ESC-50 (2,000 clips, 50 classes — European bias) share similar limitations. In practice, this means: YAMNet accurately identifies a New York siren but may misclassify the distinctive siren tone used in France or the horn patterns common in South Asian traffic. The Rainforest Connection's Arbimon platform documents how models trained on North American birdsong require retraining for tropical biodiversity. The DCASE challenge has introduced 'domain generalization' tracks precisely to address geographic mismatch. For Noisecatcher users: treat AI classification results as a starting hypothesis, not a verdict — and weight your own knowledge of local acoustic culture above the model's output. Future work should include collecting and labelling training data from the Global South as a civic priority.",
    sources: [
      "Gemmeke, J. et al., 'AudioSet: An ontology and human-labeled dataset for audio events' (ICASSP, 2017)",
      "Salamon, J. et al., 'A Dataset and Taxonomy for Urban Sound Research' (ACM Multimedia, 2014) — UrbanSound8K",
      "Piczak, K., 'ESC: Dataset for Environmental Sound Classification' (ACM Multimedia, 2015)",
      "DCASE Domain Generalization track — dcase.community/challenge2022",
    ],
    relatedTerms: ["Machine Listening / Sound Classification", "Environmental Justice and Noise", "Acoustic Racism / Sonic Justice", "Participatory Noise Sensing"],
  },

  {
    id: "spectrogram",
    term: "Spectrogram",
    phonetic: "/ˈspɛktrəɡræm/",
    category: "acoustic",
    definition:
      "A two-dimensional visual representation of how the frequency content of a sound changes over time. The horizontal axis is time, the vertical axis is frequency, and colour or brightness encodes amplitude at each time-frequency cell.",
    context:
      "Spectrograms are the primary analysis tool of acoustic ecology, bioacoustics, speech science, and forensic audio. Where a waveform shows amplitude, a spectrogram shows what is in the sound — engine harmonics, bird calls, speech formants, structural resonances. In Noisecatcher, a real-time waterfall spectrogram runs during measurement sessions, and an offline spectrogram is computed from imported audio files using a radix-2 FFT with Hann windowing. Reading a spectrogram trains the ear: the horizontal smear of a jackhammer, the vertical stripes of impulse noise, the slowly evolving cloud of distant traffic are each recognisable patterns.",
    sources: [
      "Oppenheim & Schafer, Discrete-Time Signal Processing (Prentice Hall, 1989)",
      "Quatieri, Discrete-Time Speech Signal Processing (Prentice Hall, 2002)",
    ],
    relatedTerms: ["Equivalent Continuous Sound Level (Leq)", "Masking", "Ambient Noise", "Low-Frequency Noise (LFN)"],
  },

  {
    id: "psychoacoustic-loudness",
    term: "Loudness (Perceptual / Sone)",
    phonetic: "/ˈlaʊdnəs/",
    category: "acoustic",
    definition:
      "The subjective magnitude of sound as perceived by the human auditory system, measured in sones. One sone is defined as the loudness of a 1 kHz tone at 40 dB SPL. Doubling the sone value corresponds to a perceived doubling of loudness, which requires approximately 10 dB more acoustic power.",
    context:
      "Physical decibels and perceptual loudness are not the same. Two sounds at the same dB(A) can sound very different in loudness depending on their spectral content and temporal envelope. The ISO 532 standard (Zwicker, 1961) and its refinements provide a computational model of auditory loudness that accounts for the ear's frequency-dependent sensitivity, masking between critical bands, and temporal integration. In Noisecatcher, loudness is estimated from the live dB(A) reading using a Zwicker approximation and displayed in sones alongside sharpness, roughness, and psychoacoustic annoyance. It gives a more human-centred view of sound than the raw decibel number alone.",
    relatedDbThreshold: 40,
    sources: [
      "Zwicker, E. & Fastl, H., Psychoacoustics: Facts and Models (Springer, 1990/2007)",
      "ISO 532-1:2017 — Method for calculating loudness level (Zwicker method)",
    ],
    relatedTerms: ["Psychoacoustic Annoyance", "Sharpness", "Roughness", "dB(A) — A-Weighting", "Noise Annoyance"],
  },

  {
    id: "sharpness",
    term: "Sharpness",
    phonetic: "/ˈʃɑːpnəs/",
    category: "acoustic",
    definition:
      "A psychoacoustic metric that quantifies the perceived 'brightness' or 'cutting' quality of a sound, measured in acum. A pure tone at 1 kHz at 60 dB has a sharpness of 1 acum by definition. Higher frequency content produces greater sharpness.",
    context:
      "Sharpness (German: Schärfe) was formalised by Aures (1985) as part of a suite of psychoacoustic descriptors complementing loudness. It captures the experience of harsh, bright, or piercing sounds — angle grinders, leaf blowers, the screech of metal on metal — that are annoying beyond what their dB level suggests. The Aures model weights each Bark band's contribution to overall sharpness by a frequency-dependent gain that peaks around 3.5 kHz, where the human ear is most sensitive. In Noisecatcher, sharpness is computed from the live frequency spectrum using the Bark scale frequency mapping and displayed alongside the other Zwicker metrics.",
    sources: [
      "Aures, W., 'Berechnungsverfahren für den sensorischen Wohlklang beliebiger Schallsignale' (Acustica 59, 1985)",
      "Zwicker, E. & Fastl, H., Psychoacoustics: Facts and Models (Springer, 2007)",
    ],
    relatedTerms: ["Psychoacoustic Annoyance", "Loudness (Perceptual / Sone)", "Roughness", "Noise Annoyance"],
  },

  {
    id: "roughness",
    term: "Roughness",
    phonetic: "/ˈrʌfnəs/",
    category: "acoustic",
    definition:
      "A psychoacoustic metric quantifying the perceived 'roughness' or 'harshness' of a sound caused by amplitude modulation in the 15–300 Hz range, measured in asper. Maximum roughness occurs at modulation rates of around 70 Hz.",
    context:
      "Roughness is the perception of rapid amplitude fluctuations that the auditory system cannot resolve into separate events. A pure 1 kHz tone modulated at 70 Hz at a modulation depth of 100% produces 1 asper. The feeling of roughness is distinct from pitch — a motorbike's irregular firing pattern or a chainsaw's harmonics feel rough because they repeatedly stimulate and relax the cochlear nerve. The Zwicker model computes roughness from the specific loudness patterns within critical bands. In Noisecatcher, roughness is estimated via an autocorrelation of the 70 Hz region in the time-domain signal. Roughness, combined with loudness and sharpness, feeds into the Psychoacoustic Annoyance (PA) model.",
    sources: [
      "Zwicker, E. & Fastl, H., Psychoacoustics: Facts and Models (Springer, 2007)",
      "Daniel, P. & Weber, R., 'Psychoacoustical Roughness: Implementation of an Optimized Model' (Acustica 83, 1997)",
    ],
    relatedTerms: ["Psychoacoustic Annoyance", "Loudness (Perceptual / Sone)", "Sharpness", "Noise Annoyance"],
  },

  {
    id: "psychoacoustic-annoyance",
    term: "Psychoacoustic Annoyance (PA)",
    category: "acoustic",
    definition:
      "A composite perceptual metric that combines loudness, sharpness, and roughness into a single index reflecting how unpleasant a sound is, beyond what its SPL alone would predict. Developed by Zwicker and Fastl, and standardised in the field of sound quality engineering.",
    context:
      "PA is the operative concept in sound quality design: why does one dishwasher feel quieter than another at the same dB? Why does a wind turbine at 45 dB feel more tolerable than a neighbour's bass at the same level? The Zwicker-Fastl formula is PA = N₅ × (1 + √(w_S² + w_R²)), where N₅ is the 95th percentile loudness in sones, w_S is the sharpness-based weighting, and w_R is the roughness-based weighting. In Noisecatcher, PA is computed in real time during measurement sessions and from imported audio files, giving a perceptual assessment that complements the dB(A) number. A sound with a PA of 3.0 is perceptually about twice as annoying as one with PA 1.5, even if both read the same on a conventional meter.",
    sources: [
      "Zwicker, E. & Fastl, H., Psychoacoustics: Facts and Models (Springer, 1990/2007)",
      "ISO/TS 15666:2021 — Assessment of noise annoyance by means of social and socio-acoustic surveys",
      "MoSQITo — open-source Python psychoacoustic metrics library (Eomys, LGPL-3.0, 2022)",
    ],
    relatedTerms: ["Loudness (Perceptual / Sone)", "Sharpness", "Roughness", "Noise Annoyance", "dB(A) — A-Weighting"],
  },

  {
    id: "machine-listening",
    term: "Machine Listening / Sound Classification",
    category: "acoustic",
    definition:
      "The application of machine learning to the automatic identification of sound events, acoustic scenes, and audio content. Models are trained on large labelled datasets (such as Google's AudioSet with 521 classes) and can label a sound clip with its source category — sirens, construction, birdsong, crowd noise — in real time.",
    context:
      "Machine listening is transforming acoustic monitoring: where a human ear requires presence, an ML model can process thousands of hours of archived audio. YAMNet (Yet Another Mobile Network), built on MobileNet and trained on AudioSet, is one of the most widely deployed models for audio tagging — it accepts 0.96 s mono clips at 16 kHz and outputs probability scores for 521 sound classes. In Noisecatcher, YAMNet is available as an optional classifier on imported audio files, loaded lazily via TensorFlow.js to avoid affecting measurement performance. The DCASE (Detection and Classification of Acoustic Scenes and Events) challenge has driven rapid progress in the field since 2013. The intersection with acoustic justice is emerging: if a model is trained predominantly on data from wealthy, urban, anglophone environments, its classifications will be skewed — an instance of algorithmic bias in environmental sensing.",
    sources: [
      "Gemmeke, J. et al., 'AudioSet: An ontology and human-labeled dataset for audio events' (ICASSP, 2017)",
      "Howard, A. et al., 'MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications' (2017)",
      "DCASE Community — dcase.community (ongoing challenge, 2013–present)",
      "Hershey, S. et al., 'CNN Architectures for Large-Scale Audio Classification' (ICASSP, 2017)",
    ],
    relatedTerms: ["Spectrogram", "Soundscape", "Participatory Noise Sensing", "Ambient Noise"],
  },

  {
    id: "federated-noise-sensing",
    term: "Federated / Crowdsourced Noise Sensing",
    category: "social",
    definition:
      "The practice of aggregating noise measurements from thousands of independently operated devices into a shared, open dataset that no single institution could produce alone. Community-contributed data compensates for the spatial and temporal sparsity of official monitoring networks.",
    context:
      "Official noise monitoring stations number in the hundreds across entire countries — a coverage rate that leaves most urban and rural environments unmeasured. Projects like NoiseCapture (Université Gustave Eiffel, GPL-3.0) and Sensor.Community demonstrate the democratic alternative: smartphones, cheap sound level meters, and Raspberry Pis contributing data points to an open API and map. Noise-Planet aggregates NoiseCapture measurements into a global OGC WFS/WMS service, freely accessible and queryable by bounding box. In Noisecatcher, users can overlay this community data on the map and export their local pins in NoiseCapture-compatible GeoJSON format, enabling bilateral participation: receive community data, contribute to the commons. The epistemological shift matters: community sensing makes visible the acoustic environments that official monitoring ignores, which are typically the same environments that bear the greatest noise burden.",
    sources: [
      "Bocher, E. et al., 'NoiseCapture: A Participatory Noise Monitoring Application' (ISPRS, 2017)",
      "Sensor.Community — sensor.community (formerly luftdaten.info)",
      "Noise-Planet — data.noise-planet.org (OGC WFS + WMS, open access)",
      "European Environment Agency, 'Noise in Europe 2014' — EEA Report No 10/2014",
    ],
    relatedTerms: ["Participatory Noise Sensing", "Strategic Noise Maps", "Environmental Justice and Noise", "Quiet Areas"],
  },

  {
    id: "political-violence-acoustics",
    term: "Political Violence & Acoustic Intimidation",
    category: "social",
    definition:
      "The deliberate use of amplified sound, chanting, music, or crowd acoustics as a tool of intimidation, territorial claim, or psychological pressure by organised political actors, extremist movements, or paramilitaries.",
    context:
      "Sound has long been weaponised by political movements seeking to dominate public space: amplified marches, loudspeaker convoys, timed acoustic intrusions into minority neighbourhoods, and propaganda broadcasts at protest sites. The acoustic character of political violence is distinct from industrial noise in its intentionality — it is addressed to a target community, designed to be heard, and chosen for its psychological effects. Researchers in sound studies and political science document how sound functions as a tool of what has been called 'acoustic occupation': the assertion of presence and dominance through sustained, unavoidable noise. Noisecatcher includes a dedicated 'Political violence' category with subcategories for extremist rallies, amplified propaganda, threatening assemblies, targeted attacks, and vandalism, reflecting the reality that sound is an instrument of fascist and authoritarian movements. Measurements in this category carry the same legal weight as any other civic documentation: timestamped, geolocated, and exportable as evidence.",
    sources: [
      "Goodman, S., Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
      "Volcler, J., Extremely Loud: Sound as a Weapon (The New Press, 2013)",
      "Schafer, R.M., The Soundscape: Our Sonic Environment and the Tuning of the World (Destiny Books, 1977)",
    ],
    relatedTerms: ["Sonic Warfare", "Police Brutality & Acoustic Violence", "Acoustic Commons", "Conflict Zone Acoustics", "LRAD — Long Range Acoustic Device"],
  },

  // ── Research-grounded additions (2026) ────────────────────────────────────

  {
    id: "acoustic-territoriality",
    term: "Acoustic Territoriality",
    category: "social",
    definition:
      "The process by which urban and social spaces are marked, claimed, and contested through sound. Noise is not merely a byproduct of urban life but an active territorial force — asserting presence, enforcing borders, and shaping who belongs where.",
    context:
      "Jacob Kreutzfeldt developed this concept drawing on Deleuze and Guattari's notion of territorialization and Jean-François Augoyard's account of the 'dynamic and metabolic urban sound space.' Urban noise governance is always caught between two competing visions: the environmentalist discourse that frames noise as pollution to be eliminated, and the 'lively city' discourse that celebrates sonic activity as a marker of vitality. Both are territorial claims — expressions of competing interests in how urban space is to be experienced and by whom. A neighborhood's soundmarks — alarm clocks, delivery trucks, call to prayer, amplified music, street vendors — constitute an acoustic texture that is also a social map: who is here, who belongs, who is tolerated. Acoustic territoriality connects directly to gentrification: when a neighborhood's sonic character changes — through venue closures, selective enforcement of ordinances, demographic shift — territory has been redrawn acoustically. For Noisecatcher users, documenting the soundmarks of a place over time is an act of territorial testimony.",
    sources: [
      "Kreutzfeldt, J., 'Acoustic Territoriality and the Politics of Urban Noise' (PhD dissertation, University of Copenhagen, 2009)",
      "Kreutzfeldt, J., 'Acoustic Territoriality: City planning and the politics of urban sound' in Carlyle, A. (ed.), Autumn Leaves (Double Entendre, 2007)",
      "Augoyard, J.-F. & Torgue, H., Sonic Experience: A Guide to Everyday Sounds (McGill-Queen's UP, 2005)",
      "Deleuze, G. & Guattari, F., A Thousand Plateaus (University of Minnesota Press, 1987)",
    ],
    relatedTerms: ["Distribution of the Heard", "Soundscape", "Gentrification & Acoustic Displacement", "Acoustic Commons", "Environmental Justice and Noise"],
  },

  {
    id: "distribution-of-the-heard",
    term: "Distribution of the Heard",
    category: "social",
    definition:
      "The political arrangement that determines whose sounds are heard, recognized, amplified, or suppressed in a given social and urban order. By analogy with Jacques Rancière's 'distribution of the sensible,' it names the prior sonic partition that determines who counts as a subject and whose expression is heard as legitimate speech rather than mere noise.",
    context:
      "Rancière's 'partage du sensible' describes the underlying arrangement that defines what is visible, sayable, and thinkable in a society — and who has standing to be seen and heard at all. Kreutzfeldt applies this to the acoustic domain: noise ordinances, zoning law, architectural design, and media representation all participate in determining whose sounds are heard as music, speech, culture, and whose are heard as nuisance, threat, or nothing at all. The boom from a Black neighborhood, a call to prayer from a mosque, a protest chant, a street vendor's cry — these are sounds that press constantly against the established distribution of the heard. They are simultaneously subjected to legal suppression, ordinance enforcement, and complaint mechanisms that the same authorities do not apply to the sonic productions they privilege: highway traffic, construction, stadium noise, commercial advertising. Making a noise map is a political act: it makes the distribution visible — where complaints are filed, against whom, and what sounds go systematically unrecorded.",
    sources: [
      "Kreutzfeldt, J., 'Acoustic Territoriality and the Politics of Urban Noise' (University of Copenhagen, 2009)",
      "Rancière, J., The Politics of Aesthetics: The Distribution of the Sensible (Continuum, 2004)",
      "Rancière, J., Disagreement: Politics and Philosophy (University of Minnesota Press, 1999)",
    ],
    relatedTerms: ["Acoustic Territoriality", "Acoustic Racism / Sonic Justice", "Noise as Political Economy (Attali)", "Environmental Justice and Noise", "Gentrification & Acoustic Displacement"],
  },

  {
    id: "forensic-listening",
    term: "Forensic Listening",
    category: "social",
    definition:
      "The practice of acoustic investigation that uses sonic evidence — spectrograms, frequency analysis, earwitness testimony, sound trajectory reconstruction — to establish facts about violence and state crime in legal and human rights contexts. Developed primarily by artist and 'private ear' Lawrence Abu Hamdan.",
    context:
      "Forensic listening inverts the conventional direction of forensics: rather than state science identifying and prosecuting subjects, it is used by communities, artists, and human rights organizations to investigate what the state denies. Lawrence Abu Hamdan's practice demonstrates the method. In 'Rubber Coated Steel' (2016), he used spectrograms to establish that Israeli soldiers had fired live rounds — not rubber bullets — at two Palestinian teenagers in the occupied West Bank. His acoustic evidence became the basis for CNN's investigation and forced an Israeli retraction. In 'Saydnaya: The Missing 19dB' (2017), with Amnesty International and Forensic Architecture, earwitness testimony from survivors of Syria's Saydnaya Prison was translated into acoustic evidence of mass atrocities in a facility where no photographs existed. In 'Aural Contract' (2014), he examined how states use forensic voice analysis to test asylum seekers' claimed nationalities — turning the ear of the law back on itself. Forensic listening is not only a legal technique; it is a practice of acoustic solidarity, recovering sounds that power works to silence. The 'Earwitness Inventory' (2018) — a library of 95 objects derived from legal cases where sonic memory is contested — makes this practice visible and tangible. Noisecatcher's GPS-tagged, timestamped recordings are a distributed form of forensic listening.",
    sources: [
      "Abu Hamdan, L., 'Aural Contract: Forensic Listening and the Reorganization of the Speaking Subject' (Cesura//Acceso, 2014)",
      "Abu Hamdan, L., Rubber Coated Steel (video installation, 2016)",
      "Abu Hamdan, L., Saydnaya: The Missing 19dB (with Forensic Architecture and Amnesty International, 2017)",
      "Abu Hamdan, L., Earwitness Inventory (installation, Chisenhale Gallery, 2018)",
      "Weizman, E., Forensic Architecture: Violence at the Threshold of Detectability (Zone Books, 2017)",
    ],
    relatedTerms: ["Ear Witnessing", "Counter-Forensics", "Spectrogram", "Acoustic Triangulation / Time Difference of Arrival (TDOA)", "Police Brutality & Acoustic Violence"],
  },

  {
    id: "listening-ethics",
    term: "Listening Ethics / Sonic Sensibility",
    category: "social",
    definition:
      "The philosophical proposition that how we listen — with what attention, from what position, toward whom — is an ethical and political practice. Developed by Salomé Voegelin as a philosophy of sound that refuses to separate sonic experience from political responsibility.",
    context:
      "Salomé Voegelin's work — above all 'Listening to Noise and Silence' (Continuum, 2010) and 'The Political Possibility of Sound' (Bloomsbury, 2018) — argues that sound art and acoustic practice constitute ethical encounters with the world. Against the hegemony of vision, which tends toward mastery and objectification, listening is constitutively relational, contingent, and vulnerable. Voegelin proposes 'sonic sensibility' as an engaged mode of being: 'Its aim is not to know definitively, but to engage through doubt in a temporary and sensorial knowing.' The political stakes are explicit: 'The ephemeral mobility and generative nature of sound can open the narrow confines of politics to different political possibilities. The politics of listening blurs single visions into multiple motions whose definition needs to be drawn and negotiated as the particularity of the heard, again and again.' Listening is never neutral — it involves choosing what to attend to, whose sounds to recognize, what to do with what you hear. For Noisecatcher, this means acoustic documentation is not merely data collection. It is an act of listening toward another's situation — a form of civic attention that carries ethical weight. This is the difference between noise monitoring and noise witnessing.",
    sources: [
      "Voegelin, S., Listening to Noise and Silence: Towards a Philosophy of Sound Art (Continuum, 2010)",
      "Voegelin, S., The Political Possibility of Sound: Fragments of Listening (Bloomsbury, 2018)",
      "Voegelin, S., Sonic Possible Worlds: Hearing the Continuum of Sound (Bloomsbury, 2014/2021)",
    ],
    relatedTerms: ["Acoustic Ecology", "Soundscape", "Counter-Forensics", "Ear Witnessing", "Participatory Noise Sensing"],
  },

  {
    id: "right-to-silence",
    term: "Right to Silence (Acoustic)",
    category: "legal",
    definition:
      "The proposition — distinct from the legal right against self-incrimination — that individuals and communities have a fundamental right to experience acoustic quiet, and that this right entails positive obligations on governments to protect sonic environments from commercial, industrial, and institutional noise.",
    context:
      "Stuart Sim's 'Manifesto for Silence: Confronting the Politics and Culture of Noise' (Edinburgh University Press, 2007) provides the most developed argument: 'noise versus silence is one of the main cultural conflicts of our time.' Sim argues that silence is not a personal preference but a precondition for thought, creativity, and political resistance — and that its systematic erosion by commercial, industrial, and media noise constitutes an assault on cognitive and political autonomy. The Mosquito anti-loitering device, Muzak, branded municipal soundscaping, and advertising audio bleed are all instances of what Sim calls the deliberate occupation of acoustic commons by commercial and governmental interests. The acoustic right to silence differs from existing noise law, which creates obligations not to exceed decibel thresholds but does not create a positive right to quiet. Supporting legal frameworks exist: ECHR Article 8 (right to private and family life), which the European Court of Human Rights applied to noise in Hatton v. UK (2003); Quiet Areas designation under the EU END; and indigenous cultural heritage protections for ceremonial soundscapes. Juliette Volcler's concept of 'acoustic respite as a democratic right' — from 'L'orchestration du quotidien' (La Découverte, 2022) — advances the same claim in democratic rather than individual-rights terms: silence should be a public good distributed equitably, not a commodity available only to those who can afford it.",
    sources: [
      "Sim, S., Manifesto for Silence: Confronting the Politics and Culture of Noise (Edinburgh University Press, 2007)",
      "Volcler, J., L'orchestration du quotidien : design sonore et écoute au 21e siècle (La Découverte, 2022)",
      "European Court of Human Rights, Hatton and Others v. United Kingdom [GC], Application No. 36022/97 (2003)",
      "Hildebrand, J.G., 'Noise Pollution: An Introduction to the Problem and an Outline for Future Legal Research' (1970), Columbia Law Review",
    ],
    relatedTerms: ["Acoustic Commons", "Quiet Areas", "Environmental Noise Directive (END)", "Noise Pollution", "Environmental Justice and Noise"],
  },

  {
    id: "sound-politics",
    term: "Sound-Politics",
    category: "social",
    definition:
      "The governing strategies, institutional practices, and community mobilizations through which sound is classified, regulated, and contested in urban and political life. The term, developed by Leonardo Cardoso through ethnographic study of São Paulo, insists that acoustic regulation is always a form of social administration — never neutral.",
    context:
      "Leonardo Cardoso's 'Sound-Politics in São Paulo' (Oxford University Press, 2019) is the most rigorous account of how noise governance operates in the Global South. São Paulo's noise ordinance development between 1990 and 2010 — in post-dictatorship Brazil, during rapid urbanization and extreme social inequality — reveals how the same legislative instrument simultaneously serves public health, protects commercial interests, responds to religious lobbying (evangelical churches generating massive amplified noise), polices working-class cultural practices, and articulates contested claims to public space. Cardoso's analytical model — sonic complexes, axes of debate, governmental dilemmas, solutions — provides tools for understanding noise politics anywhere. The São Paulo case also demonstrates a recurring Global South dynamic: cities that lack the infrastructure to enforce noise regulations equitably become sites where noise law is applied selectively along class, racial, and religious lines, reinforcing rather than challenging existing inequalities. For Noisecatcher, sound-politics names the unavoidable political dimension of all noise documentation: who records, what they record, and what institutional use the data is put to are all decisions that carry social consequences.",
    sources: [
      "Cardoso, L., Sound-Politics in São Paulo (Oxford University Press, 2019)",
      "Bijsterveld, K., Mechanical Sound: Technology, Culture, and Public Problems of Noise in the Twentieth Century (MIT Press, 2008)",
    ],
    relatedTerms: ["Environmental Justice and Noise", "Acoustic Ideology", "Acoustic Territoriality", "Gentrification & Acoustic Displacement", "Participatory Noise Sensing"],
  },

  {
    id: "acoustic-ideology",
    term: "Acoustic Ideology",
    category: "social",
    definition:
      "The political values, assumptions, and interests embedded in how sounds are classified as noise or music, nuisance or culture, pollution or heritage — and how these classifications are institutionalized in noise maps, ordinances, zoning, and enforcement practice.",
    context:
      "The (City)–Noise research project (Madrid/Donostia, 2009) found that municipal noise governance systematically treats as 'refuse' any sound that interferes with the city's productive economy — while tolerating the commercial noise of bars, nightclubs, and construction that serves economic interests. The term acoustic ideology names this naturalization: contingent political choices about which sounds are acceptable appear as neutral technical standards. A 60 dB(A) highway is an acceptable urban background. A 90 dB(A) nightclub is entertainment. A call to prayer from a mosque is a nuisance. Church bells are heritage. These are ideological positions encoded in decibels. Noise maps and planning documents enforce acoustic ideology in technical language — making political decisions appear as objective measurements. Juliette Volcler's three-book analysis of sound as weapon, sound as behavioral control, and sound as commercial colonization traces acoustic ideology across three domains: military/policing, workplace/consumption, and everyday urban experience. Reading a noise map against its assumptions — asking who commissioned it, what it excludes, whose complaints it responds to — is a form of ideological critique. Noisecatcher's independent community data is, in this sense, a counter-ideological practice: it measures what official instruments do not, records what official complaint systems ignore, and makes visible a sonic distribution that the dominant order prefers to keep naturalized.",
    sources: [
      "(City)–Noise Project, 'A Project about Noise, Urbanism and Politics' (academia.edu/13444720)",
      "Volcler, J., Le son comme arme (La Découverte, 2011) / Extremely Loud: Sound as a Weapon (The New Press, 2013)",
      "Volcler, J., Contrôle: comment s'inventa l'art de la manipulation sonore (La Découverte, 2017)",
      "Attali, J., Noise: The Political Economy of Music (University of Minnesota Press, 1985 [1977])",
      "Bijsterveld, K., Mechanical Sound (MIT Press, 2008)",
    ],
    relatedTerms: ["Noise as Political Economy (Attali)", "Distribution of the Heard", "Strategic Noise Maps", "Acoustic Racism / Sonic Justice", "Sound-Politics"],
  },

  {
    id: "hostile-acoustic-architecture",
    term: "Hostile Acoustic Architecture / Sonic Fences",
    category: "social",
    definition:
      "The deliberate deployment of sound in public and semi-public spaces to deter, exclude, or expel specific populations — typically homeless people, youth, migrants, or the poor — without resorting to visible physical barriers or explicit discriminatory policy.",
    context:
      "Juliette Volcler identified and named this practice in a landmark article for Le Monde diplomatique (August 2013) and developed it in her lecture 'Sonic fences in public spaces' (2019). The paradigm case is the SNCF (French national rail) decision to broadcast classical music in train stations and bus shelters — not as cultural programming but explicitly as a deterrent against youth gatherings and rough sleepers, under the logic that classical music is uncomfortable for those populations. The Mosquito device, manufactured by Compound Security Systems (UK), produces a 17.4 kHz tone audible only to people under approximately 25 years old — deployed at shop entrances, transit facilities, and public squares as an age-selective acoustic fence. Hostile acoustic architecture is invisible, legally ambiguous (no ordinance, no sign, no confrontation), and systematically underreported precisely because it produces no visible event. It is a form of what Volcler calls 'son behaviorisme' — sound behaviorism — applied not to modifying mood but to eliminating unwanted bodies from shared space. For Noisecatcher users: commercial and institutional spaces that feel acoustically hostile — overly bright, with aggressive music or subliminal tones — may be deploying this strategy. Recording and mapping these environments is a form of acoustic civic documentation.",
    relatedDbThreshold: 70,
    sources: [
      "Volcler, J., 'Le marketing sonore envahit les villes', Le Monde diplomatique (August 2013)",
      "Volcler, J., 'Sonic fences in public spaces' (symposium lecture, 2019) — youtube.com/watch?v=mo6UHkJxxj8",
      "Volcler, J., L'orchestration du quotidien : design sonore et écoute au 21e siècle (La Découverte, 2022)",
      "Compound Security Systems, 'The Mosquito' — technical specifications and deployment case studies",
    ],
    relatedTerms: ["Acoustic Ideology", "Environmental Justice and Noise", "Acoustic Commons", "Gentrification & Acoustic Displacement", "Sound-Politics"],
  },

  {
    id: "sound-behaviorism",
    term: "Sound Behaviorism",
    category: "social",
    definition:
      "The paradigm, rooted in 1930s applied psychoacoustics and behaviorist psychology, that specific sounds can reliably produce specific behaviors in predictable ways — a logic that connects Muzak piped into factories, commercial ambient music in retail environments, and acoustic weapons used in crowd control and interrogation.",
    context:
      "Juliette Volcler reconstructs the intellectual genealogy of sound behaviorism in 'Contrôle: comment s'inventa l'art de la manipulation sonore' (La Découverte, 2017), centering on Harold Burris-Meyer — an engineer, theater man, and behavioral scientist who worked simultaneously on theatrical acoustics (designing immersive sound environments for Broadway), industrial Muzak (patenting systems to pipe calming music into factory floors to increase worker productivity), and WWII psychological warfare (developing sonic lures to disorient enemy troops). These three projects — apparently disparate — share a common logic: if you control what people hear, you control what they do. Volcler argues this logic is not historically distant. It is operative today in the science of 'sonic branding' (every corporation has a sound trademark), in municipal 'acoustic urbanism' (cities designing soundscapes to encourage specific behaviors), in the acoustic management of protest crowds, and in the sonic dimension of enhanced interrogation. Her concept of 'son behaviorisme' names this convergence. It provides the theoretical bridge between the apparently benign (a supermarket's background music increases impulse purchases by 17%) and the apparently extreme (music played at 85 dB in a stress position for 72 hours at Guantánamo). Both are applications of the same paradigm. For Noisecatcher, sound behaviorism names a political dimension of every sonic environment: the question is always who designed this acoustic experience, for whose benefit, and at whose expense.",
    sources: [
      "Volcler, J., Contrôle: comment s'inventa l'art de la manipulation sonore (La Découverte / Philharmonie de Paris, 2017)",
      "Volcler, J. & Stoichita, V.A., 'Armes sonores et musiques d'ambiance: tuer, punir, manipuler et discipliner les foules par les sons' (Terrain, n°68, 2017)",
      "Volcler, J., 'Le comportementalisme sonore, une magie bien arrangeante' (Filigrane, n°23, 2018)",
      "Volcler, J., Le son comme arme (La Découverte, 2011) / Extremely Loud: Sound as a Weapon (The New Press, 2013)",
    ],
    relatedTerms: ["Hostile Acoustic Architecture / Sonic Fences", "Sonic Warfare", "Acoustic Ideology", "Masking", "LRAD — Long Range Acoustic Device"],
  },
  {
    id: "acoustic-colonialism",
    term: "Acoustic Colonialism",
    definition: "The imposition of a dominant group's soundscape onto colonised or occupied spaces, displacing indigenous sonic cultures, languages, and rituals. Includes the use of loudspeaker announcements, military noise, demolition, and construction to assert territorial control and erase local acoustic identity.",
    category: "social",
    context: "Occupying forces routinely deploy sound as an instrument of power: call-to-prayer interference, checkpoint amplified orders, settlement construction noise, and curfew loudspeakers all function to mark dominance and produce fear.",
    sources: [
      "Goodman, S., Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
      "Weizman, E., Hollow Land: Israel's Architecture of Occupation (Verso, 2007)",
    ],
    relatedTerms: ["Sonic Warfare", "Occupation Soundscape", "Sound Behaviorism", "LRAD — Long Range Acoustic Device"],
  },
  {
    id: "occupation-soundscape",
    term: "Occupation Soundscape",
    definition: "The totality of sounds produced by a military or colonial occupation in a given territory: surveillance drones, armoured vehicles, checkpoint intercoms, demolition machinery, and settler construction. The occupation soundscape functions as continuous acoustic evidence of control and can constitute a form of psychological violence.",
    category: "social",
    context: "Residents under occupation live in a persistent acoustic environment defined by the occupier's machinery and announcements — a daily auditory reminder of dispossession that is rarely documented or legally recognised.",
    sources: [
      "Weizman, E., Hollow Land: Israel's Architecture of Occupation (Verso, 2007)",
      "Goodman, S., Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
    ],
    relatedTerms: ["Acoustic Colonialism", "Sonic Warfare", "Soundscape", "Acoustic Ecology"],
  },
  {
    id: "gendered-acoustic-violence",
    term: "Gendered Acoustic Violence",
    definition: "Forms of noise-based harassment, intimidation, or silencing disproportionately targeting women and gender-nonconforming people: catcalling, amplified threats in public spaces, street audio surveillance, and the use of noise to restrict freedom of movement. Includes institutional sonic environments designed around male-default norms that render women's voices and needs invisible.",
    category: "social",
    context: "Street harassment relies heavily on voice projection and sonic dominance to enforce spatial control. Women who protest or speak publicly face disproportionate audiological intimidation including sound cannon use at demonstrations.",
    sources: [
      "Ahmed, S., Living a Feminist Life (Duke University Press, 2017)",
      "Kearney, M.C. (ed.), The Gender and Media Reader (Routledge, 2012)",
    ],
    relatedTerms: ["Harassment", "Sonic Warfare", "Acoustic Colonialism", "Right to the City"],
  },
  {
    id: "sonic-testimony",
    term: "Sonic Testimony",
    definition: "Audio recordings, noise measurements, and acoustic analyses used as evidence in legal, journalistic, or historical documentation of violence, oppression, or environmental harm. Sonic testimony can substantiate claims of sonic warfare, workplace noise violations, police brutality, and environmental racism when traditional visual or textual evidence is absent.",
    category: "legal",
    context: "Courts in several jurisdictions have accepted dB(A) measurements and spectrographic analysis as evidence. Noisecatcher pins with georeferenced Leq readings constitute a form of civic sonic testimony.",
    sources: [
      "Volcler, J., Le son comme arme (La Découverte, 2011)",
      "Bijsterveld, K., Mechanical Sound: Technology, Culture, and Public Problems of Noise (MIT Press, 2008)",
    ],
    relatedTerms: ["Acoustic Colonialism", "Gendered Acoustic Violence", "LRAD — Long Range Acoustic Device", "Equivalent Continuous Sound Level (Leq)"],
  },
  {
    id: "sonic-injustice",
    term: "Sonic Injustice",
    category: "social",
    definition: "The condition of unjust inequality in both noise exposure and access to high-quality, beneficial sound environments. Defined in a 2023 systematic review as a dual burden: marginalized communities face disproportionately high exposure to harmful noise and disproportionately low access to restorative soundscapes — quiet parks, green spaces, acoustically sheltered public areas.",
    context: "Sonic injustice is distinct from acoustic racism in that it is an epidemiologically grounded concept, defined through measured or modeled data, and captures both the positive and negative dimensions of acoustic inequality. The negative dimension — excess noise burden — is now well-documented: national and city-level studies in Europe and the United States show that transport noise exposure tracks socioeconomic deprivation and racial/ethnic marginalization. The positive dimension — access to restorative sound — is empirically underexplored; most research has focused on excess exposure, not on who gets to access quiet. This asymmetry matters: it suggests that standard noise maps, which only show where noise is too loud, miss half the injustice. Noisecatcher's civic acoustic mapping contributes to both dimensions: documenting high-exposure sites in underserved communities, and — by enabling the mapping of quiet refuges — beginning to chart where restorative soundscapes exist and for whom. The key intervention point identified in the literature is civic engagement: the act of recording, mapping, and contesting noise is itself an environmental justice practice.",
    sources: [
      "Münzel, T. et al., 'Environmental Noise and the Cardiovascular System' (JACC, 2021)",
      "Casey, J.A. et al., 'Race/Ethnicity, Socioeconomic Status, Residential Segregation, and Spatial Variation in Noise Exposure in the Contiguous United States' (Environmental Health Perspectives, 2017)",
      "Gieysztor, E. et al., 'Sonic Injustice: A Systematic Review' (2023 — definition of unjust inequalities in noise exposure and access to beneficial soundscapes)",
    ],
    relatedTerms: ["Environmental Justice and Noise", "Acoustic Racism / Sonic Justice", "Acoustic Commons", "Quiet Areas", "Acoustic Counter-Mapping"],
  },
  {
    id: "cacerolazo",
    term: "Cacerolazo — Collective Noise as Resistance",
    category: "social",
    definition: "A form of popular protest in which participants bang pots, pans, and other domestic objects to create a collective, decentralized noise that reclaims public space, disrupts institutional sound authority, and asserts popular presence. The cacerolazo is a sonic weapon of the household, turning the most mundane objects of domestic life into instruments of political rupture.",
    context: "The cacerolazo emerged in Chile as a response to economic policies under Salvador Allende in 1971, before becoming a defining feature of opposition to the Pinochet dictatorship. It reappeared in Argentina during the 2001–2002 economic collapse, in Venezuela against Maduro, in Colombia's 2019–2021 protests, and again in Chile during the 2019 estallido social. In each instance, its political logic is the same: the synchronized bang is decentralized (no leader is necessary, no permit required), it is temporally coordinated by rhythm rather than organization, and it generates a sound that cannot be ignored or easily attributed and therefore suppressed. As a noise politics, the cacerolazo is antithetical to the 'distribution of the heard': it forces the state and its media to register the sound of those who are not usually heard. Sound studies scholars read it alongside other collective noise practices — the vuvuzela in South Africa, the Tibetan cymbals used in Buddhist protest, the collective chant — as instances of what Goodman calls 'sonic activism': using sound's immersive, vibrational properties to occupy space that visual protest cannot reach. Noisecatcher cannot record the cacerolazo adequately — it overloads any smartphone mic — but it can document the ambient sound environment before, during, and after: the relative quiet that precedes, the peak levels during, and the silence that follows as evidence of collective acoustic event.",
    sources: [
      "Goodman, S., Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
      "LaBelle, B., Sonic Agency: Sound and Emergent Forms of Resistance (Goldsmiths Press, 2018)",
      "Attali, J., Noise: The Political Economy of Music (University of Minnesota Press, 1985)",
    ],
    relatedTerms: ["Sonic Warfare", "Distribution of the Heard", "Noise as Political Economy (Attali)", "Sonic Activism", "Acoustic Racism / Sonic Justice"],
  },
  {
    id: "aural-counterpublics",
    term: "Aural Counterpublics",
    category: "social",
    definition: "Acoustic spaces — physical, mediated, or networked — in which marginalized communities produce, circulate, and contest sound outside the dominant public sphere. Derived from Nancy Fraser's critique of Habermas and Michael Warner's theory of publics, the concept names the sonic dimension of counter-public formation: the freedom to make noise on your own terms.",
    context: "Nancy Fraser's 1990 critique of Habermas's public sphere identified the systematic exclusion of subordinate groups from the bourgeois public, and named the 'subaltern counterpublics' they formed as alternative spaces of deliberation. Warner extended this into media and textual circulation. Applied to sound, the aural counterpublic is the Black church, the Jamaican sound system, the pirate radio station, the protest chant, the noise music show in an abandoned factory, the field recording circulated on low-bandwidth community networks — all sites where communities produce a sonic presence on their own terms, outside the regime of the dominant soundscape. The concept has direct implications for noise documentation: the smartphone microphone, in this framing, is not only a measurement device but a tool for producing an alternative acoustic record — one that registers what official media do not. Radio With Palestine (RWP) demonstrates this explicitly: a distributed real-time audio archive that streams from solidarity protests and resistance contexts worldwide, in partnership with community radio stations across Palestine (including Radio Al Hara, Bethlehem), New York, Berlin, Amsterdam, Paris, Chile, and Greece. It produces what it calls 'flat listening' — an omnidirectional, unedited document of the full acoustic context of a political situation, distributed across a network that no single authority can suppress. Noisecatcher's community map is a distributed aural counterpublic: a collectively produced acoustic record that cannot be edited, suppressed, or reframed by any single authority.",
    sources: [
      "Fraser, N., 'Rethinking the Public Sphere: A Contribution to the Critique of Actually Existing Democracy' (Social Text, 1990)",
      "Warner, M., Publics and Counterpublics (Zone Books, 2002)",
      "Columbia University Libraries / Openwork, 'Being Heard' (2024)",
      "LaBelle, B., Sonic Agency: Sound and Emergent Forms of Resistance (Goldsmiths Press, 2018)",
    ],
    relatedTerms: ["Distribution of the Heard", "Sonic Activism", "Acoustic Commons", "Acoustic Racism / Sonic Justice", "Participatory Noise Sensing"],
  },
  {
    id: "acoustic-counter-mapping",
    term: "Acoustic Counter-Mapping",
    category: "social",
    definition: "The practice of producing crowdsourced, community-generated noise maps that contest, supplement, or expose the limitations of state-issued or model-based official maps. Where official strategic noise maps use computational modeling from traffic counts and infrastructure data, acoustic counter-maps use direct measurement by residents — capturing what models systematically miss, including local sources, temporal variation, and the lived acoustic reality of underserved areas.",
    context: "Strategic noise maps, mandated by the EU Environmental Noise Directive and similar frameworks, are primarily computed from infrastructure data rather than measured in the field. This creates several gaps: they model major sources (roads, rail, airports, industry) but miss secondary sources (construction, HVAC, nightlife); they produce annual averages that conceal peak exposures; and they tend to be more accurate in areas where monitoring infrastructure already exists — which skews toward wealthier, more politically connected communities. Acoustic counter-mapping uses citizen sensing to fill these gaps. Projects like NoiseTube (Brussels), Ear-Phone (London), and NoiseCapture (France) demonstrated that calibrated smartphone measurements can approach traditional monitoring accuracy at a fraction of the cost. Research across Europe, China, and South Korea has shown that crowdsourced networks can generate city-scale maps that reveal noise burdens not visible in official datasets — particularly in low-income or peripheral neighborhoods where no fixed monitoring stations exist. The counter-map is also a political document: it names the sources official maps omit, records the temporal patterns that averages erase, and creates an evidence base for community advocacy. Noisecatcher is designed as counter-mapping infrastructure: GPS-tagged, timestamped, source-classified measurements that can be aggregated across users and exported in formats compatible with environmental monitoring standards.",
    sources: [
      "Kanjo, E., 'NoiseSPY: A Real-Time Mobile Phone Platform for Urban Noise Monitoring and Mapping' (Mobile Networks and Applications, 2010)",
      "Rana, R. et al., 'Ear-Phone: An End-to-End Participatory Urban Noise Mapping System' (IPSN, 2010)",
      "Maisonneuve, N. et al., 'NoiseTube: Measuring and Mapping Noise Pollution with Mobile Phones' (IFIP, 2009)",
      "Casey et al., 'Race/Ethnicity, Socioeconomic Status, Residential Segregation, and Spatial Variation in Noise Exposure' (Environmental Health Perspectives, 2017)",
    ],
    relatedTerms: ["Participatory Noise Sensing", "Strategic Noise Maps", "Environmental Justice and Noise", "Sonic Injustice", "Federated Noise Sensing"],
  },
  {
    id: "sonic-activism",
    term: "Sonic Activism",
    category: "social",
    definition: "The deliberate use of sound recording, field recording, acoustic mapping, and sonic practice as tools of political organizing, evidence-gathering, and community power. Sonic activism distinguishes itself from sound art (which centers aesthetic experience) and from technical noise monitoring (which centers data accuracy) by centering the political goal: building community capacity to contest acoustic injustice.",
    context: "The literature review is clear on a critical limitation: recording alone is not a justice practice. The justice claim is strongest when recording is tied to three things: community control of the data, public interpretation of what the data means, and coordinated action that uses the data to change policy or redistribute power. Without these three elements, a noise map is just another dataset — potentially absorbed by the same planning systems that produced the injustice. Sonic activism names the practice that connects measurement to power. Its methods include: participatory soundscape evaluation, in which community members collectively interpret and score acoustic environments rather than delegating interpretation to technical experts; graphic scoring and emotional body mapping, in which non-technical participants express the felt impact of noise environments in ways that quantitative dB readings cannot capture; live archiving, in which audio is recorded and immediately shared to create a real-time civic record (as in Radio With Palestine); and distributed acoustic forensics, in which multiple recorders document the same event from different positions, creating a multi-perspective archive that is harder to suppress or contest. Noisecatcher is designed to support all of these: community pins are a form of participatory evaluation, voice notes and descriptions allow non-technical testimony alongside the measurement, and the map is a shared public archive. The act of pinning is a political act.",
    sources: [
      "LaBelle, B., Sonic Agency: Sound and Emergent Forms of Resistance (Goldsmiths Press, 2018)",
      "Voegelin, S., The Political Possibility of Sound: Fragments of Listening (Bloomsbury, 2018)",
      "Goodman, S., Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
      "Columbia University Libraries / Openwork, 'Being Heard' (2024)",
      "Diva-Portal, 'War's Whisper: Soundscapes of War, Silence, Chaos, and Displacement' (2025)",
    ],
    relatedTerms: ["Aural Counterpublics", "Acoustic Counter-Mapping", "Sonic Testimony", "Participatory Noise Sensing", "Distribution of the Heard", "Sonic Injustice"],
  },
  {
    id: "mosquito-device",
    term: "Mosquito Device — High-Frequency Youth Dispersal",
    category: "legal",
    definition: "A commercially manufactured electronic device that emits a continuous tone at approximately 17.4 kHz, a frequency range audible to children and young adults (roughly under 25 years) but inaudible to most adults over 30. Deployed in public spaces — shopfronts, transport hubs, parks, car parks — to make loitering physically uncomfortable for young people without triggering legal frameworks designed for targeted discrimination or assault. The Council of Europe Parliamentary Assembly (2010, Doc. 12378) called for a ban, finding the device breaches ECHR Article 8 (right to private life) and Article 14 (non-discrimination by age).",
    context: "Developed by Compound Security Systems in the United Kingdom (2005), the Mosquito rapidly spread across Europe, the United States, and Australia. It is sold explicitly as a youth-dispersal tool: the marketing materials describe it as a way to 'move on teenagers.' The device operates entirely outside noise ordinance frameworks because it is inaudible to most adult enforcement officers and officials. It is also invisible to most noise monitoring tools that do not capture frequencies above 16 kHz. The device is legal in the UK and most of the EU; the European Parliament passed a non-binding resolution against it in 2010 (P7_TA(2010)0170), but member states have not generally prohibited it. The Council of Europe's Commissioner for Human Rights and multiple children's rights organisations have condemned it as a discriminatory use of sound to restrict the right to public space on the basis of age. In France, a 2013 campaign by Stop-Sifflet documented dozens of deployments in Parisian suburbs, concentrated in lower-income areas. The device exemplifies what Steve Goodman calls the 'ecology of fear': it does not physically harm — at the intensities typically used — but it makes space inhabitable only for those the operator chooses. Noisecatcher cannot detect the Mosquito with a standard smartphone microphone: consumer-grade MEMS microphones roll off sharply above 14–16 kHz. Detection requires a purpose-built bat detector or a studio condenser microphone. However, Noisecatcher can document the social geography of Mosquito deployment: a pin in the 'Harassment' category, with subcategory 'Intimidation / threatening behaviour' and a description noting the device's audible hiss and the affected age group, creates a civic record that can feed into advocacy campaigns and local authority complaints.",
    sources: [
      "Compound Security Systems, Mosquito product documentation (2005–present)",
      "European Parliament Resolution P7_TA(2010)0170 on use of Mosquito devices",
      "Council of Europe — Commissioner for Human Rights, Opinion on the Mosquito (2010)",
      "Goodman, S., Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
      "Stop-Sifflet campaign (France) — documentation of Mosquito deployment in Paris suburbs (2013)",
    ],
    relatedTerms: ["LRAD — Long Range Acoustic Device", "Sonic Warfare", "Distribution of the Heard", "Hostile Architecture", "Acoustic Racism / Sonic Justice"],
  },
  {
    id: "noise-productive-force",
    term: "Noise as Productive Force — Beyond Unwanted Sound",
    category: "acoustic",
    definition: "A theoretical reframing, developed most systematically by Marie Thompson (2017), that refuses to define noise as the negative of signal. Instead of treating noise as something to be eliminated or reduced, this framework examines it as a productive, transformative force that breaks down binary structures — signal/noise, music/silence, speech/chaos — and acts directly on the nervous system, bypassing the intellectual filters that mediated language requires.",
    context: "The dominant Western engineering and regulatory tradition defines noise relationally and negatively: it is unwanted sound, the degradation of a signal, the residue after speech or music is subtracted. This definition is politically convenient — it allows the powerful to name what is noise (protest, urban poverty, non-Western music) and what is legitimate signal (traffic infrastructure, corporate amplified speech, military communication). Thompson's intervention, building on the noise-music tradition from Luigi Russolo to Masami Akita (Merzbow), is to treat noise not as the absence of something but as a presence in its own right: a vibrational force with its own affect, politics, and social work. Noise, on this account, is not a failure of communication but an alternative communicative architecture — one that refuses the enforced clarity of civilized speech and acts on bodies rather than minds. This framing is politically important for Noisecatcher because it explains why the act of producing noise — the cacerolazo, the protest chant, the Japanoise show — is not simply disorder but a specific communicative choice. It also explains why the distribution of the right to make noise is a political question: who is allowed to disrupt the acoustic order, and who is pathologized as 'noisy'? The Japanese Noise movement (Japanoise — Merzbow, Masonna, Incapacitants) is the most developed artistic tradition working in this vein, pushing analog and digital technology past its functional limits to generate dense, non-hierarchical walls of sound that reject both Western musical conventions and post-war Japanese consumerism. Arseny Avraamov's Symphony of Factory Sirens (Baku, 1922) is an earlier precedent: a mass sonic event in which the entire acoustic infrastructure of an industrial city — factory whistles, cannon fire, ship horns, fog horns, airplane engines — was organized into a collective composition directed at a listening public rather than a concert audience.",
    sources: [
      "Thompson, M., Beyond Unwanted Sound: Noise, Affect and Aesthetic Relations (Bloomsbury, 2017)",
      "Goodman, S., Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
      "Attali, J., Noise: The Political Economy of Music (University of Minnesota Press, 1985)",
      "Russolo, L., The Art of Noises (1913/1916) — Futurist manifesto on noise as music",
    ],
    relatedTerms: ["Noise as Political Economy (Attali)", "Distribution of the Heard", "Cacerolazo — Collective Noise as Resistance", "Sonic Warfare", "Sonic Activism"],
  },
  {
    id: "transient-acoustic-echolocation",
    term: "Transient-Excited Acoustic Echolocation Mapping (SVIR Adaptation)",
    category: "acoustic",
    definition: "An experimental methodology that adapts the Spatial Volumetric Impulse Response (SVIR) technique — developed in architectural acoustics and acoustic ecology — to a single smartphone, using controlled transient sounds (mechanical claps, spring-loaded clickers) to map the acoustic geometry of a physical space through its reflections, without specialist hardware.",
    context: "Traditional impulse response capture requires a dodecahedral omnidirectional loudspeaker, a multi-capsule ambisonic microphone array, and swept-sine signal generation software. The smartphone adaptation, developed from principles used in research labs including the York Postgraduate Acoustic Laboratory and applied ecoacoustics projects (Fragments of Extinction), uses the smartphone's dual-microphone architecture instead. Most modern smartphones carry two or more microphones — a primary mic at the bottom edge and a secondary noise-canceling mic near the top camera. Because the physical separation between them is fixed and measurable (~12–18 cm depending on device), the phone can function as a micro-linear array, capturing the Time Difference of Arrival (TDOA) between a direct sound and its reflections. The procedure: the recordist emits a controlled transient — a clap, a wooden clapper, or a spring-loaded training clicker — at a known distance (1 metre) from the phone, then analyzes the returning reflections using cross-correlation. The time delay Δt between the direct sound and each echo allows the distance d of the reflecting surface to be calculated as d = (c × Δt) / 2, where c ≈ 343 m/s. Rotating through 6 positions at 60° intervals and stitching the impulse responses creates a panoramic acoustic profile of the space. The acoustic significance for sonic justice is substantial: this technique can document architectural acoustic violence — spaces deliberately designed to suppress human speech frequencies (via sound-scattering panels, absorptive surfaces at speech-band frequencies), or spaces in which high-frequency harassment devices (Mosquito) are embedded in the architecture. It can also create a permanent acoustic fingerprint of threatened spaces — indigenous forests, community gathering places, activist encampments — that can be used to recreate and experience the acoustic character of that place in virtual environments after physical destruction. Practically: the technique requires a recording app capable of accessing both microphones independently (Android's AudioRecord with UNPROCESSED source, or iOS CoreAudio with measurement mode), and a signal-processing tool capable of cross-correlation (the Python SciPy `correlate()` function is sufficient; the Phyphox app provides real-time cross-correlation on-device).",
    sources: [
      "Fragments of Extinction — soundscape ecology field methodology documentation",
      "York Postgraduate Acoustic Laboratory — architectural impulse response research",
      "Brambilla, G. & Pedrielli, F., 'Smartphone-based participatory soundscape mapping' (Sustainability, 2020)",
      "SciPy signal processing documentation — scipy.signal.correlate",
    ],
    relatedTerms: ["Distributed Soundscape Transect Recording", "Acoustic Counter-Mapping", "Acoustic Ecology", "Forensic Listening", "Participatory Noise Sensing"],
  },
  {
    id: "distributed-soundscape-transect",
    term: "Distributed Soundscape Transect Recording (DSTR)",
    category: "acoustic",
    definition: "A field methodology in which multiple smartphone recordings are made at spatially distributed points along a route — a transect — and combined to produce a composite acoustic portrait of how sound moves through a landscape, rather than how a single location sounds at one moment. Borrowed from ecological transect methodology and extended into urban and political contexts.",
    context: "Classical Western field recording assumes a listener standing in one location, asking: what does this place sound like? Distributed Soundscape Transect Recording asks a fundamentally different question: how does sound move through this place? It draws on several research streams: soundscape ecology (Krause, Pijanowski), microphone array localization, citizen sensing (NoiseCapture, NoiseTube), acoustic indices (ACI, ADI, NDSI), and participatory mapping. The procedure is simple enough for any community to execute: walk a route of known length (e.g. 1 km); stop at regular intervals (every 20 m = 50 stops); at each stop, record for 30 seconds while logging GPS position, orientation (compass bearing), and environmental notes. The result is not a single recording but a linked corpus of 50 audio files, each anchored to a precise geographic point and direction, producing a spatial portrait of how the acoustic environment changes across the route. A smartphone's combination of microphone, GPS, accelerometer, gyroscope, and magnetometer means every recording is simultaneously an audio file, a location, a direction, and a movement trace. This transforms the recording from a sonic document into a spatial acoustic sensor output. The political application is direct: a transect through an industrial district, a transport corridor, or a gentrifying neighbourhood produces evidence of acoustic inequality that cannot be derived from any single-point measurement. When multiple community members record parallel transects, the result is an acoustic map with spatial resolution that exceeds anything a small number of fixed monitoring stations can produce. Noisecatcher's existing architecture — GPS-tagged, timestamped, orientation-aware pins with voice notes and dB readings — supports DSTR recording without modification. The missing component is a route-level export: a GeoJSON LineString linking sequential pins along a transect. This is a future development direction.",
    sources: [
      "Krause, B., The Great Animal Orchestra: Finding the Origins of Music in the World's Wild Places (Little Brown, 2012)",
      "Pijanowski, B.C. et al., 'Soundscape Ecology: The Science of Sound in the Landscape' (BioScience, 2011)",
      "Rana, R. et al., 'Ear-Phone: An End-to-End Participatory Urban Noise Mapping System' (IPSN, 2010)",
      "Brambilla, G. & Pedrielli, F., 'Smartphone-based participatory soundscape mapping' (Sustainability, 2020)",
    ],
    relatedTerms: ["Acoustic Counter-Mapping", "Participatory Noise Sensing", "Acoustic Ecology", "Transient-Excited Acoustic Echolocation Mapping (SVIR Adaptation)", "Federated Noise Sensing"],
  },
  {
    id: "sonic-flooding",
    term: "Sonic Flooding — Acoustic Violence Through Headphones",
    category: "social",
    definition: "The forcible, unwanted intrusion of sound into a person's phenomenological space through personal audio devices — most commonly headphones — as a form of intimate acoustic violence. Theorized by Jacob Kingsbury Downs (2021), sonic flooding names the weaponization of consumer audio technology to override a person's sensory autonomy from within: the attacker controls the sound environment that the victim experiences as private and interior.",
    context: "Downs's framework extends the analysis of sonic warfare beyond large-scale institutional deployment (LRADs, Mosquito devices, military acoustic weapons) to the scale of interpersonal and domestic violence. Personal audio technology — headphones, earbuds, speakers at close range — creates a paradox: the technology that is marketed as giving users control over their acoustic environment can be turned against them, flooding their interior sensory space with unwanted sound that is physically inescapable without removing the device. Downs documents this as a form of acoustic coercive control in domestic violence contexts, and as an instrument of auditory harassment and torture in institutional settings (detention, interrogation). The theoretical apparatus he draws on — the phenomenology of hearing as fundamentally invasive and bodily rather than distanced and cognitive — explains why sonic flooding is specifically traumatic: unlike visual or tactile intrusion, which can be resisted by closing the eyes or moving away, sound enters the body without permission. The ear cannot close. This insight has direct implications for documentation: the category of acoustic violence is not limited to high-decibel external sources but extends to any situation in which a person's auditory experience is controlled against their will. Noisecatcher's harassment category and the Gendered Acoustic Violence abécédaire entry cover the most common forms; sonic flooding names the intimate, personal-technology dimension of the same continuum.",
    sources: [
      "Downs, J.K., 'Headphones, Auditory Violence and the Sonic Flooding of Corporeal Space' (Body & Society, 2021)",
      "Goodman, S., Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
      "Cusick, S., 'Music as Torture / Music as Weapon' (Transcultural Music Review, 2006)",
    ],
    relatedTerms: ["Sonic Warfare", "Gendered Acoustic Violence", "LRAD — Long Range Acoustic Device", "Mosquito Device — High-Frequency Youth Dispersal", "Acoustic Racism / Sonic Justice"],
  },
  {
    id: "tree-equity-sonic-justice",
    term: "Tree Equity and Sonic Justice",
    category: "environmental",
    definition: "The empirically documented spatial correlation between aviation-related noise exposure, low tree canopy coverage, and demographic marginalization — specifically race and income. Communities that bear the highest aviation noise burdens are the same communities with the least access to tree cover that would partially mitigate that noise, compounding both acoustic and ecological disadvantage along racial and economic lines.",
    context: "A 2023 study by Rodríguez González and Torres Garrido, published in Geoplanning, applied spatial correlation analysis to US urban areas, finding that high aviation noise zones and low tree canopy coverage overlap significantly with non-white, low-income residential areas. This is not incidental: the geographic logic of urban development has concentrated flight paths over communities with less political power to contest airport expansion or routing decisions, while simultaneously under-investing in urban forestry in those communities. Tree canopy has a measurable acoustic effect: a 30 m belt of dense trees can attenuate traffic noise by 6–10 dB(A), and urban trees reduce the reverberation time of outdoor spaces, improving speech intelligibility at conversational distances. The communities that need this mitigation most — those under flight paths and near highways — are the ones least likely to have it. This is a double sonic injustice: excess noise burden compounded by absence of natural acoustic shelter. The finding extends earlier work on noise and demographics (Casey et al., 2017; Münzel et al., 2021) by adding the dimension of mitigating infrastructure access. For Noisecatcher, the implication is that acoustic counter-maps should include not only noise measurement data but also urban greenery data — OpenStreetMap's tree and park layers can be overlaid on noise pins to visualize both the burden and the absence of mitigation in the same map. The Noise-Planet WMS layer already visible in Noisecatcher provides noise contours; the missing layer is tree canopy.",
    sources: [
      "Rodríguez González, M.I. & Torres Garrido, K.G., 'Sonic Justice and Tree Equity: Exploring Spatial Correlations Between Aviation-Related Noise, Demographics, and Tree Canopy' (Geoplanning, 2023)",
      "Casey, J.A. et al., 'Race/Ethnicity, Socioeconomic Status, Residential Segregation, and Spatial Variation in Noise Exposure' (Environmental Health Perspectives, 2017)",
      "Nowak, D.J. et al., 'A double environmental justice: Why trees should be planted in low-income areas' (Cities, 2022)",
    ],
    relatedTerms: ["Sonic Injustice", "Environmental Justice and Noise", "Acoustic Counter-Mapping", "Quiet Areas", "Acoustic Ecology"],
  },
  {
    id: "acoustic-niche-hypothesis",
    term: "Acoustic Niche Hypothesis",
    category: "environmental",
    definition: "Bernie Krause's hypothesis (1993) that in a healthy, undisturbed ecosystem, organisms evolve to occupy distinct acoustic niches — specific frequency bands and time windows — so that their communication signals do not interfere with those of other species. Krause's broader framework divides the soundscape into geophony (non-biological natural sounds: wind, water, thunder), biophony (biological sounds), and anthrophony (human-generated sounds). The niche partitioning component is a hypothesis with supporting evidence in some taxa (insects, some bird communities) but contested in its universal form across all species.",
    context: "Krause developed the hypothesis from decades of field recording in pristine and degraded ecosystems. In a healthy recording, the spectrogram shows a structured 'acoustic orchestra': insects occupy high frequencies, birds claim mid-range, frogs and amphibians use specific temporal windows, marine mammals modulate their calls around geophysical events. The structure is not random — it represents millions of years of co-evolutionary acoustic competition and coordination. Anthropogenic noise — traffic, aviation, industrial machinery — introduces broadband energy that disrupts this structure. Animals respond: urban Great Tits in European cities have been documented shifting their songs to higher frequencies to avoid traffic masking. Urban corvids and parrots alter timing. Species that cannot adapt fall silent, migrate, or suffer reduced reproductive success. Krause's most striking demonstration: he recorded the Lincoln Meadow forest in the Sierra Nevada before and after a selective logging operation that removed only 15% of trees. The post-logging spectrogram showed near-total acoustic collapse despite minimal visual disturbance — the logging trucks and machinery had shattered the acoustic niche structure, and the species did not return. For Noisecatcher: a recording in a park or forest captures not just the human noise burden but the degree of acoustic niche compression. A spectrogram showing traffic noise flooding the mid-frequency bird band documents not only a public health problem but an ecological one. The NDSI score (biophony vs. anthrophony ratio) computed from the FFT data already captured during a session gives a quantitative measure of this compression.",
    sources: [
      "Krause, B., 'The Niche Hypothesis: A virtual symphony of animal sounds, the origins of musical expression and the health of habitats' (The Soundscape Newsletter, 1993)",
      "Krause, B., The Great Animal Orchestra (Little, Brown, 2012)",
      "Halfwerk, W. & Slabbekoorn, H., 'A behavioural mechanism explaining noise-dependent frequency use in urban birdsong' (Animal Behaviour, 2009)",
      "Pijanowski, B. et al., 'Soundscape Ecology: the Science of Sound in the Landscape' (BioScience, 2011)",
    ],
    relatedTerms: ["Ecoacoustics", "Acoustic Ecology", "Masking", "Soundscape", "Passive Acoustic Monitoring", "Infrasound"],
  },
  {
    id: "passive-acoustic-monitoring",
    term: "Passive Acoustic Monitoring (PAM)",
    category: "environmental",
    definition: "The deployment of recording devices — autonomous recording units (ARUs), hydrophones, or smartphones — to continuously capture environmental sound without human presence, enabling long-term, large-scale biodiversity surveillance, noise impact assessment, and ecosystem change detection at costs inaccessible to traditional survey methods.",
    context: "Traditional biological surveys require trained ecologists in the field for hours or days at a time. PAM inverts this: a single AudioMoth (£50) left in a forest for a month produces more recording hours than any team of researchers could manually collect. Machine learning classifiers (BirdNET, RFCx, ARBIMON) then automatically identify species calls, detect chainsaws and gunshots, or measure acoustic indices, transforming raw audio into structured ecological data at scale. The technique has enabled conservation breakthroughs: Rainforest Connection's Guardian sensors have detected illegal logging in real time across millions of hectares in South America, Africa, and Southeast Asia, triggering ranger responses within minutes of a chainsaw starting. The Elephant Listening Project has documented how low-frequency oil exploration and logging truck noise disrupts forest elephant infrasound communication networks across the Congo Basin — establishing acoustic masking as a documented mechanism of population fragmentation. For citizen science, PAM creates a new possibility: community-owned acoustic observatories. A network of smartphones or AudioMoths deployed at fixed points around an industrial facility, a construction site, or a neighborhood affected by highway noise can produce continuous, spatially distributed evidence of acoustic impact — the same data that a professional EIA (Environmental Impact Assessment) would cost tens of thousands of euros to collect. Noisecatcher's architecture — GPS-tagged, timestamped recordings — supports fixed-point PAM sessions when a phone is left recording at a window or mounted outdoors. The voice note and description fields can carry ecological observations alongside the dB reading.",
    sources: [
      "Hill, A. et al., 'AudioMoth: Evaluation of a smart open acoustic device for monitoring biodiversity and the environment' (Methods in Ecology and Evolution, 2018)",
      "Aide, T.M. et al., 'Real-time bioacoustics monitoring and automated species identification' (PeerJ, 2013)",
      "Rainforest Connection — rfcx.org — Guardian acoustic monitoring system",
      "Elephant Listening Project — Cornell Lab of Ornithology, Congo Basin infrasound research",
    ],
    relatedTerms: ["Ecoacoustics", "Acoustic Niche Hypothesis", "Open Acoustic Sensing Hardware", "Federated / Crowdsourced Noise Sensing", "Machine Listening / Sound Classification"],
  },
  {
    id: "community-acoustic-observatory",
    term: "Community-Owned Acoustic Observatory",
    category: "social",
    definition: "A distributed network of citizen-operated recording devices — smartphones, AudioMoths, fixed microphones — deployed and owned by a community rather than an institution, producing continuous acoustic data that simultaneously documents biodiversity, noise pollution, environmental inequality, and social wellbeing. The most ambitious form of acoustic counter-mapping.",
    context: "The concept emerges from the convergence of three research streams: citizen-science acoustic mapping (NoiseTube, NoiseCapture, Ear-Phone), passive acoustic monitoring for conservation (Rainforest Connection, AudioMoth, BirdNET), and participatory soundscape mapping (Brambilla & Pedrielli, 2020). Its key insight is that the same recording, made by the same smartphone at the same moment, can be analyzed for radically different purposes: the decibel level answers the environmental health question; the spectral structure (NDSI: biophony vs. anthrophony ratio) answers the biodiversity question; the GPS coordinates answer the spatial justice question; the timestamp answers the temporal pattern question; and the community annotation — 'this is where I cannot sleep', 'this is where my children cannot hear me' — answers the human testimony question. A community acoustic observatory combines all five layers. No institution currently operates one at scale: professional monitoring networks are too sparse, too expensive, and institutionally controlled; citizen-science platforms collect noise data but not ecological data; conservation monitoring collects ecological data but not justice data. Noisecatcher is designed to support the first three layers (dB, GPS, timestamp) and the fifth (voice notes and description as testimony). The missing layer — ecoacoustic indices computed from the spectral data — is technically feasible: the NDSI formula requires only the FFT output that Noisecatcher's audio engine already produces. An NDSI score alongside the Leq reading would transform every Noisecatcher session in a natural environment into a simultaneous noise-pollution and biodiversity measurement.",
    sources: [
      "Brambilla, G. & Pedrielli, F., 'Smartphone-based participatory soundscape mapping for a more sustainable acoustic environment' (Sustainability, 2020)",
      "Pijanowski, B. et al., 'Soundscape Ecology: the Science of Sound in the Landscape' (BioScience, 2011)",
      "Aide, T.M. et al., 'Species richness drives the use of acoustic space in the tropics' (Remote Sensing, 2017)",
      "Gage, S.H. et al., 'Toward measuring biodiversity from audio recordings: Automated acoustic indices for ecoacoustics' (Ecological Indicators, 2017)",
    ],
    relatedTerms: ["Passive Acoustic Monitoring", "Ecoacoustics", "Acoustic Counter-Mapping", "Participatory Noise Sensing", "Sonic Injustice", "Federated / Crowdsourced Noise Sensing"],
  },
  {
    id: "unweighted-noise-measurement",
    term: "Unweighted Measurement — dBZ and dBC",
    category: "acoustic",
    definition: "Sound level measurement without frequency weighting (dBZ) or with C-weighting (dBC), which captures the full acoustic energy of a signal including low frequencies that A-weighting systematically suppresses. Critical for documenting low-frequency industrial noise from shipping yards, data centers, wind turbines, HVAC systems, and heavy infrastructure that causes documented health harm while remaining invisible to standard dB(A) monitoring.",
    context: "A-weighting (dBA) attenuates frequencies below 200 Hz by up to 40 dB or more, reflecting the reduced sensitivity of the human ear at low frequencies in quiet conditions. This is appropriate for measuring speech intelligibility and general noise annoyance in moderate-level environments, but it creates a systematic measurement gap in low-frequency industrial contexts. Low-frequency noise (LFN: 20–200 Hz) and infrasound (below 20 Hz) from compressors, diesel generators, data center cooling systems, shipping port equipment, and road freight infrastructure are known to cause vibroacoustic disease — a progressive, pathological tissue response to chronic vibration — as well as chronic sleep disruption, cardiovascular effects, and vestibular disturbance, at levels that may appear unremarkable on a dBA meter. C-weighting applies a gentler curve that retains energy down to about 16 Hz, making dBC useful for assessing low-frequency noise in industrial environments (ISO 1996). Unweighted dBZ (flat response from 10 Hz to 20 kHz) captures the full signal with no frequency preference, essential for forensic analysis of blast events, infrasonic weapons, and industrial emissions below the A-weighted noise floor. The political significance: corporate polluters and municipal zoning boards commonly exploit dBA as the sole regulatory metric. A data center generating 55 dBC LFN may read as 45 dBA — within ordinance limits — while generating chronic physiological harm to surrounding residents. Demanding LFN and dBC measurements alongside dBA is a specific counter-mapping strategy for communities adjacent to infrastructure noise sources. Noisecatcher currently measures in dBA only. Extending the FFT analysis to compute dBC and dBZ from the raw spectral data (which the engine already produces) is technically feasible and would make the tool significantly more powerful for low-frequency industrial documentation.",
    sources: [
      "ISO 1996-1:2016 — Acoustics: Description, measurement and assessment of environmental noise",
      "Leventhall, H.G., 'Low Frequency Noise and Annoyance' (Noise & Health, 2004)",
      "Pierson, W.L. et al., 'Vibroacoustic Disease' (Aviation, Space and Environmental Medicine, 2004)",
      "WHO Environmental Noise Guidelines for the European Region (2018) — Chapter on LFN",
    ],
    relatedTerms: ["dB(A) — A-Weighting", "Equivalent Continuous Sound Level (Leq)", "Low-Frequency Noise", "Infrasound", "Acoustic Counter-Mapping", "Vibroacoustic Disease"],
  },
  {
    id: "speech-intelligibility-index",
    term: "Speech Intelligibility Index (SII) — Acoustic Right to Be Heard",
    category: "acoustic",
    definition: "A standardized metric (ANSI S3.5) that quantifies the proportion of speech information that reaches a listener given the background noise level in a specific frequency band. An SII of 1.0 means all speech is intelligible; 0.0 means none. In noise-justice contexts, SII calculation demonstrates mathematically that industrial or traffic noise actively denies communities the right to verbal communication, public assembly, and democratic participation.",
    context: "The Speech Intelligibility Index is defined across 18 frequency bands weighted by their contribution to speech understanding. At SII below 0.75, conversation degrades significantly; below 0.45, communication in a community meeting or outdoor assembly becomes effectively impossible. The political application is direct: when noise from an adjacent highway, factory, or construction site reduces the outdoor SII of a public park, school yard, or community square below the threshold for functional speech, it does not merely cause annoyance — it acoustically dissolves the conditions for democratic assembly and equal participation in civic life. Brandon LaBelle's concept of acoustic justice — that being heard is a political right — acquires a measurable metric through SII. A community that documents SII below 0.5 at its regular outdoor gathering space during operating hours of an adjacent industrial facility has produced quantitative evidence that the facility's acoustic footprint is restricting political rights, not merely causing inconvenience. Related metrics: the Articulation Index (AI, the predecessor to SII), Speech Transmission Index (STI, used for room acoustics and public address systems), and the Useful-to-Harmful Ratio (U50), which measures what fraction of a noisy environment falls within useful vs. harmful SPL ranges. These metrics can be approximated from the FFT data Noisecatcher captures: the speech frequency bands (250 Hz–4 kHz) are present in the spectrogram. A future SII display showing 'speech in this environment is X% intelligible' would directly connect measurement to civic rights.",
    sources: [
      "ANSI S3.5-1997 — Methods for the Calculation of the Speech Intelligibility Index",
      "Rhebergen, K.S. et al., 'The speech intelligibility index as a predictor of speech intelligibility in fluctuating noise' (Journal of the Acoustical Society of America, 2006)",
      "LaBelle, B., Acoustic Justice: Listening, Performativity, and the Work of Reorientation (Bloomsbury, 2021)",
      "Packer, J., 'The conditions of listening: Environment, affect and attention in soundscape ecologies' (Organised Sound, 2016)",
    ],
    relatedTerms: ["Masking", "dB(A) — A-Weighting", "Distribution of the Heard", "Acoustic Justice / Sonic Justice", "Aural Counterpublics", "Psychoacoustic Annoyance"],
  },
  {
    id: "acoustic-evidence-chain-of-custody",
    term: "Acoustic Evidence — Chain of Custody and Legal Admissibility",
    category: "legal",
    definition: "The documented, unbroken record of how an audio recording was captured, stored, and transmitted — establishing that it has not been altered, fabricated, or tampered with. Essential for the use of smartphone recordings as primary evidence in legal proceedings, environmental hearings, and human rights tribunals. Governed by ISO/IEC 27037 (digital evidence handling) and equivalent national forensic standards.",
    context: "Most smartphone recordings fail as legal primary evidence for two related reasons: they lack a trusted timestamp, and they lack a provenance record linking the file to a specific device, location, and capture moment that a forensic examiner could independently verify. A WAV file on a phone can be re-recorded, amplified, trimmed, or substituted; without a cryptographic seal created at the moment of capture, opposing counsel can and routinely does raise these possibilities to have evidence excluded. ISO/IEC 27037 (Guidelines for identification, collection, acquisition and preservation of digital evidence) establishes the minimum requirements for forensic digital evidence: identification of the source device, documentation of the capture process, cryptographic hash of the original file computed at the time of acquisition, and a chain of custody log showing every person who had access to the file. Current consumer audio apps — including Noisecatcher — do not satisfy ISO/IEC 27037. Noisecatcher's GeoJSON export includes a SHA-256 hash of the features array computed at export time (not at capture time), which is better than nothing but does not constitute a forensic chain of custody: an adversary can argue the file was altered before the hash was computed. What forensic-grade evidence requires: a hardware-attested timestamp (using the device's Secure Enclave or equivalent trusted execution environment), a hash of the raw audio stream signed at the moment the MediaRecorder write begins, and a trusted external timestamp from a recognized NTP server or blockchain anchor. Decentralized storage (IPFS, Filecoin) adds an additional layer: once a file is published to IPFS, its content hash is immutable and globally verifiable; any modified version produces a different hash and a different address, making tampering self-documenting. These features are technically feasible but legally complex: their reliability depends on jurisdictions recognising blockchain timestamps and IPFS content addressing as admissible timestamp authorities — which most do not yet do as of 2026. The practical advice for activists: file recordings with a trusted third party (lawyer, journalist, NGO) immediately after capture, document device model and OS version, note weather and position conditions, and preserve the original uncompressed file untouched. These steps satisfy chain-of-custody requirements in most civil environmental proceedings even without cryptographic infrastructure.",
    sources: [
      "ISO/IEC 27037:2012 — Information technology: Security techniques: Guidelines for identification, collection, acquisition and preservation of digital evidence",
      "Casey, E., Digital Evidence and Computer Crime (Academic Press, 2011)",
      "Electronic Frontier Foundation, 'Digital Evidence in Criminal Proceedings' (2022)",
      "Reardon, J. et al., 'On the Feasibility of Internet-Scale Author Identification' — on provenance and content-hash timestamping",
    ],
    relatedTerms: ["Sonic Testimony", "Ear Witnessing", "Forensic Listening", "Counter-Forensics", "Multi-Source Audio Synchronisation"],
  },
  {
    id: "distributed-acoustic-witnessing",
    term: "Distributed Acoustic Witnessing",
    category: "social",
    definition: "A methodology in which multiple independent recording devices — operated by different people, at different positions — simultaneously document the same acoustic event, producing a multi-perspective archive whose spatial and temporal redundancy is harder to suppress, dismiss, or counter than any single recording. The synthesis that transforms noise documentation from personal testimony into collective civic evidence.",
    context: "The conceptual gap between field recording apps and noise-activism tools is not primarily technical — it is architectural. Current apps are designed around one recorder, one user, one archive. Noise injustice is collective: it affects neighbourhoods, communities, ecosystems. Distributed acoustic witnessing addresses this by treating the network of recordings as the unit of evidence, not the individual file. When multiple phones record the same event, three things become possible that a single recording cannot achieve: triangulation (Time Difference of Arrival between recordings from known GPS positions can mathematically locate the acoustic source); convergence (multiple independent files of the same event are dramatically harder to dismiss as fabricated or manipulated than a single file); and completeness (different recording positions capture different aspects — near-field vs. far-field, direct sound vs. reflections, different source directions). Forensic Architecture has demonstrated this at scale: their reconstructions of airstrikes and LRAD deployments use dozens of crowdsourced smartphone videos, cross-correlating the acoustic and optical records to place events in space and time with court-presentable precision. The distributed acoustic witnessing concept extends this beyond Forensic Architecture's retrospective analytical method to a prospective protocol: communities plan for multi-point recording before an event, coordinate timestamps (via GPS clock synchronization), and export to a shared archive immediately after. Noisecatcher's existing architecture supports the individual node: GPS, timestamp, Leq, voice note. The missing piece is synchronization — a shared session mode in which multiple phones record simultaneously with a common reference timestamp, and exports are linked by a shared session ID. This is the single feature that would most fundamentally advance Noisecatcher's utility as an activism tool.",
    sources: [
      "Forensic Architecture — The Use of Force in Protests (multi-source acoustic reconstruction)",
      "Forensic Architecture — Saydnaya: The Missing 19dB (distributed ear-witnessing methodology)",
      "Weizman, E., Forensic Architecture: Violence at the Threshold of Detectability (Zone Books, 2017)",
      "Goodman, S., Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
    ],
    relatedTerms: ["Acoustic Triangulation", "Multi-Source Audio Synchronisation", "Ear Witnessing", "Acoustic Evidence — Chain of Custody", "Sonic Testimony", "Community-Owned Acoustic Observatory"],
  },
  {
    id: "schafer-soundscape",
    term: "R. Murray Schafer — Soundscape and World Soundscape Project",
    category: "acoustic",
    definition:
      "Canadian composer R. Murray Schafer coined the term 'soundscape' and founded the World Soundscape Project (WSP) at Simon Fraser University in 1969 — the foundational institution of acoustic ecology as a field. His 1977 book The Tuning of the World (republished as The Soundscape: Our Sonic Environment and the Tuning of the World) remains the discipline's primary text. Schafer introduced 'keynote sounds' (background acoustic identity of a place), 'soundmarks' (acoustically distinctive local sounds equivalent to landmarks), and the distinction between 'hi-fi' (wide dynamic range, quiet background, individual sounds distinguishable) and 'lo-fi' soundscapes (urban noise compression that masks individual acoustic events).",
    context:
      "Schafer's intervention was fundamentally political: he argued that industrialisation had destroyed the acoustic balance of the natural and human world, and that the dominant soundscape of the 20th century — traffic, machinery, amplified speech — was a form of environmental violence that had been rendered invisible by habituation. The WSP produced the first systematic comparative soundscape documentation methodology, applied across five Canadian cities and later globally. The ISO 12913 series (2014–2022) built a formal international standard on Schafer's framework, defining soundscape as 'the acoustic environment as perceived, experienced, and/or understood by a person or people, in context' — a shift from physical sound levels to human perceptual experience. ISO 12913's 8-attribute circumplex model (eventful, vibrant, pleasant, calm, uneventful, monotonous, annoying, chaotic) is now the framework used by urban planners across Europe. For Noisecatcher: Schafer's framework explains why the app measures more than dB levels — it attempts to document the full acoustic context of a place and the political conditions that produced it.",
    sources: [
      "Schafer, R.M., The Tuning of the World (Knopf, 1977; republished as The Soundscape, Destiny Books, 1994)",
      "World Soundscape Project — Simon Fraser University (1969–present)",
      "ISO 12913-1:2014 / ISO 12913-2:2018 / ISO 12913-3:2019 — Acoustics: Soundscape",
      "Truax, B. (ed.), Handbook for Acoustic Ecology (ARC Publications, 1978/1999)",
    ],
    relatedTerms: ["Acoustic Ecology", "Soundscape", "Acoustic Niche Hypothesis", "ISO 12913", "World Forum for Acoustic Ecology"],
  },

  {
    id: "noise-type2-diabetes",
    term: "Noise and Type 2 Diabetes",
    category: "health",
    definition:
      "Emerging evidence links chronic exposure to traffic noise with increased risk of type 2 diabetes, independently of air pollution and socioeconomic factors. The proposed mechanism follows the cardiovascular pathway: chronic nocturnal noise-triggered cortisol and adrenaline release disrupts glucose metabolism and promotes insulin resistance over time.",
    context:
      "A Danish nationwide cohort study (Environmental Health Perspectives, 2021) found statistically significant associations between long-term road, rail, and aircraft noise exposure and incident type 2 diabetes, after controlling for air pollution and other confounders. The European Environment Agency's Environmental Noise in Europe 2025 report explicitly includes type 2 diabetes in its disease burden calculations for the first time, estimating 22,000 new cases per year in Europe attributable to transport noise. This makes diabetes the newest addition to the recognised health effects of noise — alongside cardiovascular disease, sleep disruption, childhood cognitive impairment, and tinnitus. The evidence base is still developing: it is stronger for road and rail noise than for aircraft noise, and the effect sizes are modest in individual studies. However, given the global scale of type 2 diabetes as a public health crisis, even small attributable fractions translate into large absolute numbers of cases.",
    relatedDbThreshold: 55,
    sources: [
      "Danish nationwide cohort study — noise and type 2 diabetes (Environmental Health Perspectives, 2021) — PMC8638828",
      "EEA, 'Environmental Noise in Europe 2025' — includes T2D in disease burden (22,000 cases/year in Europe)",
      "Münzel et al., 'Environmental Noise and the Cardiovascular System' (JACC, 2018) — metabolic mechanism",
    ],
    relatedTerms: ["Cardiovascular Noise Effects", "Night Noise", "Dose–Response Relationship"],
  },

  {
    id: "echr-hatton-noise-rights",
    term: "ECHR Article 8 — Right to Quiet as a Human Right",
    category: "legal",
    definition:
      "The European Court of Human Rights has established, through a series of cases beginning with Powell and Rayner v. UK (1990) and culminating in Hatton and Others v. United Kingdom (Grand Chamber, 2003), that states have positive obligations under ECHR Article 8 (right to respect for private and family life and the home) to take reasonable measures to protect individuals from severe noise pollution. This makes acoustic protection a justiciable human right in Council of Europe member states.",
    context:
      "Hatton v. UK (2003) concerned Heathrow Airport night flights. The applicants argued that noise from night flights disrupted their sleep and constituted a violation of Article 8. The Grand Chamber held that the UK government had failed to strike a fair balance between the economic interests of the country and the applicants' effective enjoyment of their right to a home and private life — establishing that noise from infrastructure can violate human rights. Earlier, López Ostra v. Spain (1994) established the principle that severe environmental pollution — including noise — can breach Article 8 even without threatening health directly. In India, the Supreme Court went further: Forum for Prevention of Environmental and Sound Pollution v. Union of India (2005) SCC 733 ruled that 'freedom from noise pollution is part of the right to life' under Article 21 of the Indian Constitution — one of the world's most significant constitutional noise rulings, resulting in a ban on firecracker use between 10pm and 6am. These cases establish that noise is not merely an aesthetic inconvenience but a violation of fundamental rights — the legal foundation for using Noisecatcher data in formal complaints and rights-based advocacy.",
    sources: [
      "Hatton and Others v. United Kingdom (Application 36022/97), ECtHR Grand Chamber, 8 July 2003",
      "López Ostra v. Spain (Application 16798/90), ECtHR, 9 December 1994",
      "Forum for Prevention of Environmental and Sound Pollution v. Union of India (2005) 5 SCC 733 — Indian Supreme Court",
      "Council of Europe, Guide on Article 8 of the ECHR (updated 2022) — environmental noise section",
    ],
    relatedTerms: ["Right to Silence (Acoustic)", "Environmental Justice and Noise", "Noise as Political Economy (Attali)", "WHO Environmental Noise Guidelines"],
  },

  {
    id: "us-noise-control-act",
    term: "US Noise Control Act (1972) — and Its Defunding",
    category: "legal",
    definition:
      "The US Noise Control Act of 1972 was the only comprehensive federal noise legislation in US history. It established the EPA Office of Noise Abatement and Control (ONAC), empowered the EPA to set noise emission standards for major sources (transportation, construction, motors), and required noise labelling on products. In 1981, the Reagan administration eliminated all federal funding for ONAC, effectively dismantling the federal noise regulatory framework. The Act remains technically on the books but is entirely unfunded and unenforced.",
    context:
      "The gutting of ONAC in 1981 was not a policy decision based on noise science — it was part of a broader deregulatory agenda. The consequence is that the United States, one of the world's largest producers of transportation infrastructure noise, has operated for 45 years without a functional federal noise regulatory system. Noise regulation in the US is fragmented across thousands of local ordinances of widely varying strength, with enforcement that is weakest in the communities most exposed. The American Public Health Association's 2022 policy brief on noise as a public health hazard explicitly calls for ONAC to be re-established and funded. The contrast with the EU's Environmental Noise Directive (2002/49/EC), which requires strategic noise mapping and action plans in all EU cities above 100,000 population, illustrates the scale of the US regulatory gap. For users of Noisecatcher in the United States: your data is building the evidentiary base that federal re-regulation will eventually require.",
    sources: [
      "Noise Control Act of 1972, Public Law 92-574, 42 U.S.C. §4901–4918",
      "APHA Policy Brief, 'Noise as a Public Health Hazard' (2022)",
      "EPA, 'History of the EPA Noise Program' — archive.epa.gov/noise",
      "Casey et al., 'Race/Ethnicity, SES, Residential Segregation, and Noise Exposure in the Contiguous US' (EHP, 2017)",
    ],
    relatedTerms: ["Environmental Justice and Noise", "Strategic Noise Maps", "Environmental Noise Directive (END)", "WHO Environmental Noise Guidelines"],
  },

  {
    id: "global-noise-burden-gap",
    term: "Global Noise Burden — A Research Gap",
    category: "environmental",
    definition:
      "There is no global burden of disease estimate for environmental (non-occupational) noise equivalent to the WHO/Europe 2011 report. The Global Burden of Disease study does not include environmental transportation noise as a disease risk factor. This is a structural absence: the communities bearing the heaviest noise burdens — in rapidly urbanising cities in South Asia, Southeast Asia, Sub-Saharan Africa, and Latin America — are the least represented in the global epidemiological literature.",
    context:
      "The WHO 2011 Burden of Disease from Environmental Noise report quantified at least 1 million DALYs lost annually from traffic noise in western Europe. The EEA 2025 update extends this to 1.3 million DALYs across Europe, including 73,000 premature deaths and 22,000 new T2D cases. These are Europe-only figures — there is no equivalent estimate for the Global South. For occupational noise-induced hearing loss, a 2025 Nature Scientific Reports study estimated 7.8 million DALYs globally in 2021 — with the highest burdens in East Asia, South Asia, Southeast Asia, and Eastern Sub-Saharan Africa — representing a 104% increase from 1990. Among the noisiest cities with documented research: Cairo averages 85–90 dB street noise and never drops below 70 dB (Egyptian NRC); Ho Chi Minh City has been placed among the world's loudest cities at 103 dB (UN-cited sources); São Paulo schools average 70.3 dB LAeq on weekdays (Nature 2026). Most Sub-Saharan African cities — Lagos, Nairobi, Kinshasa, Dakar, Addis Ababa — have no published peer-reviewed noise monitoring data. This gap is itself a form of acoustic injustice: the absence of data produces the appearance of absence of harm.",
    sources: [
      "WHO/Europe, 'Burden of Disease from Environmental Noise' (2011) — western EU only, 1 million DALYs",
      "EEA, 'Environmental Noise in Europe 2025' — Europe, 1.3 million DALYs, 73,000 premature deaths",
      "Global occupational noise burden, Nature Scientific Reports (2025) — 7.8 million DALYs globally",
      "Egyptian National Research Center noise studies, Cairo (2007) — 85–90 dB average street noise",
      "Accra Pathways Study (PMC7440835) — high-resolution noise measurement, Sub-Saharan Africa",
      "São Paulo school noise study, Nature Scientific Reports (2026) — 70.3 dB LAeq median",
    ],
    relatedTerms: ["Environmental Justice and Noise", "Acoustic Colonialism", "WHO Environmental Noise Guidelines", "Strategic Noise Maps"],
  },

  {
    id: "sonic-apartheid",
    term: "Sonic Apartheid — Noise as Postcolonial Violence",
    category: "social",
    definition:
      "A framework, developed by researcher Alexandra Downing Watkins at the University of Cape Town, that names noise pollution as a direct continuation of racial and colonial geography. In post-apartheid Cape Town, forced eviction and relocation policies displaced communities to peripheral Temporary Relocation Areas — where residents face extreme noise exposure from proximity to industrial infrastructure and transport corridors, with no political recourse. The sonic conditions of these spaces are inseparable from their racial and economic production.",
    context:
      "Blikkiesdorp ('Tin Can Town') was created as a Temporary Relocation Area by the Cape Town municipality to clear poor, predominantly Black and Coloured communities before the 2010 FIFA World Cup. Residents face elevated traffic noise, industrial noise, and the acoustic conditions of poverty — generators, overcrowding, inadequate sound insulation — alongside the absence of the acoustic amenities (green space, quiet residential streets, acoustic barriers) that characterise wealthier Cape Town neighbourhoods. Watkins's research combined community decibel readings and resident diary entries to document this acoustic dimension of post-apartheid spatial injustice. Blikkiesdorp is a case study, not an exception: the same pattern of sonic disadvantage following racial geography is documented in the United States (Casey et al. 2017; Collins et al. 2020), the United Kingdom (Hodgson et al. 2018), and across Latin American cities. The academic field of 'acoustic colonialism' — active in cultural theory and sound studies (Duke University Press, 2021; MAST special issue on Sound, Colonialism, and Power, 2021) — argues that the imposition of dominant acoustic environments on colonised peoples, and the erasure of indigenous soundscapes, is a structural feature of colonial and postcolonial violence that the noise-as-dB paradigm cannot fully capture.",
    sources: [
      "Watkins, A.D., 'Sonic Apartheid: Ecoracism, Apartheid Geographies and Noise Pollution in Cape Town's Blikkiesdorp' (UCT, 2020) — open.uct.ac.za/handle/11427/32488",
      "Casey et al. (2017) — race/ethnicity and noise exposure, continental US (EHP)",
      "Collins et al. (2020) — sonic injustice and transport noise, US national (Journal of Transport Geography)",
      "MAST, 'Sound, Colonialism, and Power' special issue, Vol.2 No.2 (2021)",
      "Duke University Press, 'Acoustic Colonialism: Acts of Mapuche Interference' (2021)",
    ],
    relatedTerms: ["Acoustic Colonialism", "Acoustic Racism / Sonic Justice", "Environmental Justice and Noise", "Gentrification & Acoustic Displacement", "Global Noise Burden — A Research Gap"],
  },

  // ── Book-research additions ──────────────────────────────────────────────────

  {
    id: "ontologie-vibratoire",
    term: "Vibrational Ontology — Politics of Frequency",
    category: "acoustic",
    definition:
      "A philosophical proposition that vibration is ontologically prior: all matter vibrates, and entities encounter one another through vibrational force before conscious perception. 'You need not hear a sound in order to feel it.' The politics of sound is therefore a politics of frequency — who controls which vibrations colonise which bodies and spaces.",
    context:
      "Developed by Steve Goodman in Sonic Warfare (MIT Press, 2010), this ontology dissolves the boundary between heard sound and felt vibration — between music and noise, art and weapon. It explains why infrasound, surveillance drone hum, commercial sonic branding, and acoustic weapons operate through and below the threshold of consciousness: the body registers what the ear cannot identify or name. Goodman names several sub-operations: 'audio virology' (sound spreading infectiously through communities, bypassing rational resistance); 'affective tonality' (the mood or atmosphere produced by sustained frequency regimes — the dread of a low drone, the anxiety of a persistent alarm); and the 'military-entertainment complex' (the structural porosity between military sonic technology and commercial culture — tape decks, loudspeakers, and VHF developed for warfare were repurposed into entertainment, and entertainment technologies feed back into military deployment). For NoiseCatcher: a decibel reading captures only a fraction of what the body absorbs — the sub-sonic spectrum and the full vibrational continuum of the urban environment remain largely unmeasured by smartphones.",
    sources: [
      "Goodman, S., Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
    ],
    relatedTerms: ["Acoustic Weapons / LRAD", "Infrasound", "Pain Threshold", "Ecology of Fear"],
  },

  {
    id: "ecology-of-fear",
    term: "Ecology of Fear — Sound as Territorial Control",
    category: "social",
    definition:
      "An atmospheric condition in which sound is deployed to produce a diffuse affective tonality of dread, dislocation, and permanent surveillance — without direct physical contact. The sonic environment itself becomes an apparatus of territorial control.",
    context:
      "Steve Goodman coined this term in Sonic Warfare (MIT Press, 2010) to describe how states, military forces, and commercial actors manage populations through management of the vibrational atmosphere. Documented instances include: sonic booms over Gaza (Israeli Air Force supersonic overflights at night, producing shockwaves that traumatise civilian populations without striking infrastructure, documented by Human Rights Watch 2005); LRAD systems deployed against protesters at Pittsburgh G20 (2009) and Ferguson (2014); the Mosquito Device (17.4 kHz) as a public-space exclusion device targeting youth; and continuous surveillance drone hum producing chronic anxiety in occupied territories. The distinction between an acoustic weapon and an everyday sonic environment is deliberately blurred — the aim is precisely this ambiguity: a threat that cannot be named, therefore cannot be prosecuted. The ecology of fear operates at the intersection of Goodman's 'vibrational ontology' and Volcler's observation that 'ears don't have lids.'",
    sources: [
      "Goodman, S., Sonic Warfare (MIT Press, 2010)",
      "Volcler, J., Extremely Loud: Sound as a Weapon (The New Press, 2013)",
      "Human Rights Watch, 'Deafening Whispers: Gaza Sonic Booms' (2005)",
    ],
    relatedDbThreshold: 85,
    relatedTerms: ["Acoustic Weapons / LRAD", "Mosquito Device", "Vibrational Ontology", "Psychoacoustic Annoyance"],
  },

  {
    id: "acoustic-colonialism-mapuche",
    term: "Acoustic Colonialism — Mapuche and Indigenous Contexts",
    category: "social",
    definition:
      "A regime of massive, iterative, and invasive linguistic, ambient, social, and technological mechanisms that alter and disrupt the lifeways of an Indigenous territory. Three dimensions: (1) sociolinguistic domination — the marginalisation of Indigenous languages (linguicide); (2) media and technology systems — colonial representation through radio and digital platforms; (3) industrial and infrastructural noise imposed on Indigenous lands.",
    context:
      "Coined by Luis E. Cárcamo-Huechante in Acoustic Colonialism: Acts of Mapuche Interference (Duke UP, 2022), developed through the Mapuche case in Chile. The Chilean settler state exercised sonic domination through: Hispanicisation of toponyms (e.g., 'Tralcao' — the phonetic Spanish rendering of 'Tralkawe', meaning 'place of the thunderstorm' in Mapudungun — an act of acoustic and territorial erasure); marginalisation of Mapudungun in media; and industrial noise from forestry equipment, airports, and state weaponry on Mapuche lands. Against this regime, Mapuche acts of sonic interference — Wixage Anai radio (Santiago, 1993), Mapudungun poetry, Mapuche rap group Wechekeche Ñi Trawün — constitute sonic resurgence: interfering in the colonial frequency rather than simply opposing it. The concept extends beyond the Americas: it names any regime in which dominant sonic practices erase and invisibilise non-dominant acoustic expression. Compare: the 'colonial ear' — the perceptual apparatus trained by two centuries of settler media to mishear or fail to hear Indigenous voices; and 'allkütun' — the Mapuche practice of attentive listening as decolonial counter-practice.",
    sources: [
      "Cárcamo-Huechante, L.E., Acoustic Colonialism: Acts of Mapuche Interference (Duke UP, 2022)",
      "Friel, B., Translations (1980) — comparative case of Irish linguistic-acoustic disinheritance",
      "MAST, 'Sound, Colonialism, and Power' special issue (2021)",
    ],
    relatedTerms: ["Sonic Apartheid", "Environmental Justice and Noise", "Co-Listening", "Allkütun"],
  },

  {
    id: "allkutun-listening",
    term: "Allkütun — Attentive Listening as Decolonial Practice",
    category: "social",
    definition:
      "A Mapuche concept meaning 'to listen attentively' — a form of listening that resists the colonial ear by dwelling on what dominant perceptual practices have been trained to ignore. At once an aesthetic and a political counter-practice.",
    context:
      "Cárcamo-Huechante centres allkütun as a decolonial methodology in Acoustic Colonialism (Duke UP, 2022): listening to what has been systematically rendered inaudible — the Mapuche language, the sounds of Indigenous resistance, the noise of colonial violence on Indigenous lands. Allkütun is distinct from Schaeffer's acousmatic listening or Pauline Oliveros's Deep Listening, though all three share a resistance to the regime of inattention. For NoiseCatcher: allkütun names what the app seeks to produce in its users — a sustained attention to the acoustic environment as a site of power and resistance, a willingness to hear what regulatory ears have been trained to filter out. The Mapuche practice resonates with Budhaditya Chattopadhyay's 'co-listening' (Sound Practices in the Global South, Palgrave, 2022) as a shared framework for decolonial acoustic attention.",
    sources: [
      "Cárcamo-Huechante, L.E., Acoustic Colonialism (Duke UP, 2022)",
      "Oliveros, P., Deep Listening: A Composer's Sound Practice (iUniverse, 2005)",
    ],
    relatedTerms: ["Acoustic Colonialism", "Colonial Ear", "Co-Listening", "Deep Listening"],
  },

  {
    id: "co-listening",
    term: "Co-Listening — Reciprocal, Anti-Extractive Acoustic Research",
    category: "social",
    definition:
      "A research and action practice grounded in reciprocity: listening with communities rather than extracting sonic data from them. Co-listening refuses the expert-listener position that harvests, analyses, and returns knowledge; it demands a mutual conversation in which practitioner knowledge is epistemically equal to academic knowledge.",
    context:
      "Developed by Budhaditya Chattopadhyay in Sound Practices in the Global South (Palgrave, 2022) as a critique of what he calls 'the exoticising listening ear' of canonised sound scholarship — a fundamentally colonial posture that hears non-Western sonic practices as exotic raw material for Western theoretical frameworks, not as sophisticated aesthetic and political systems in their own right. Co-listening involves researcher self-reflexivity, an acknowledgement of one's own implication in systems that silence certain voices, and a commitment to shared control over interpretation. The book documents practitioners from South Asia, Africa, the Middle East, and Latin America expressing 'collective desires to resist colonial models of listening by expressing themselves in terms of their arts and craft.' For NoiseCatcher: co-listening names the ethical positioning the app seeks to instantiate — data stays with communities, analysis is conducted with them, the interpretation is not delegated to a technical class.",
    sources: [
      "Chattopadhyay, B., Sound Practices in the Global South (Palgrave, 2022)",
      "Smith, L.T., Decolonizing Methodologies (Zed Books, 1999)",
    ],
    relatedTerms: ["Colonial Ear", "Allkütun", "Acoustic Colonialism", "Compassionate Listening"],
  },

  {
    id: "sensory-extinction",
    term: "Sensory Extinction — the Silencing of Sonic Diversity",
    category: "environmental",
    definition:
      "The progressive global erasure of sonic diversity — distinct from species extinction, though intimately linked. Sensory extinction designates simultaneously the impoverishment of soundscapes (fewer species, fewer acoustic behaviours, reduced spectral richness) and the correlative diminishment of human capacity for attentive perception of a rich sonic world.",
    context:
      "David George Haskell, in Sounds Wild and Broken (Viking, 2022), situates sensory extinction within a 540-million-year evolutionary history of sonic creativity. The COVID-19 pandemic provided a natural experiment: White-crowned Sparrows in San Francisco altered their songs within weeks of the reduction in human noise — softer songs, lower frequencies — demonstrating real-time acoustic adaptation. The four dimensions of the acoustic crisis: habitat destruction in tropical forests, silencing animal communication; industrial ocean noise (shipping, sonar, drilling) disrupting cetacean communication across ocean basins; urban noise distributed along racial and class lines; and progressive loss of human listening capacity. Haskell documents that US federal highway programmes carried a 90% cost-share specifically for routing highways through low-income and minority neighbourhoods — an institutional mechanism producing sonic inequity as structural racism. The burdens of sensory extinction — impaired learning, cardiovascular disease, increased mortality — are 'unjustly distributed among lower income and minority neighbourhoods.'",
    sources: [
      "Haskell, D.G., Sounds Wild and Broken (Viking, 2022)",
      "Derryberry et al., 'Singing in a silent spring: Birds respond to a temporary human-induced noise reduction during the COVID-19 shutdown' (Science, 2020)",
    ],
    relatedDbThreshold: 60,
    relatedTerms: ["Acoustic Niche Hypothesis", "Ecoacoustic Indices", "Environmental Justice and Noise", "Soundscape"],
  },

  {
    id: "signal-noise-cultural",
    term: "Signal / Noise — a Cultural Operation",
    category: "acoustic",
    definition:
      "The boundary between meaningful signal and unwanted noise is not a natural acoustic fact: it is a cultural operation — a filtering technique that reflects and reproduces power relations. What is classified as 'noise' is the result of a political choice, contestable and historically variable.",
    context:
      "Bernhard Siegert argues in Cultural Techniques (Fordham UP, 2015) that 'media' are not things but operations — chains of practice that produce and maintain the distinctions a culture depends on. The regulatory standard (e.g., the WHO's 53 dB Lden road traffic limit) is a filter: it defines what counts as a nuisance and what does not. Choosing that threshold is a political act. The history of noise standards is the history of who had the power to place the filter. The filter does not merely remove irrelevant content — it constitutes the distinction between relevant and irrelevant in the first place. For NoiseCatcher: the app does not simply apply existing filters — it documents the gap between what official filters let through and what communities actually experience. Regulatory thresholds are one political choice; the app enables communities to make their own threshold visible.",
    sources: [
      "Siegert, B., Cultural Techniques: Grids, Filters, Doors, and Other Articulations of the Real (Fordham UP, 2015)",
    ],
    relatedTerms: ["Frequency Weighting (dB(A)/dB(C)/dB(Z))", "WHO Environmental Noise Guidelines", "Acoustic Colonialism"],
  },

  {
    id: "railway-shock",
    term: "Railway Shock — Historical Precedent for Chronic Vibratory Harm",
    category: "health",
    definition:
      "The pathology caused by cumulative exposure to the continuous vibrations of railway travel, recognised in British medical literature from the mid-19th century as a public health risk. The first documented case of physiological damage caused by continuous, imperceptible vibration — the direct historical precursor of modern chronic acoustic trauma.",
    context:
      "Shelley Trower documents in Senses of Vibration (Continuum, 2012) how The Lancet published a series of articles treating railway vibration as a public health hazard in the 1860s–1880s. The central finding: continuous, unfelt vibration was more dangerous than the jolts of horse-drawn travel precisely because its cumulative effect went unregistered by consciousness — passengers absorbed 'upwards of 20,000 movements per journey' without awareness. This prefigures exactly what contemporary environmental noise research establishes: the cumulative effects of continuous background noise (traffic, industry) on cardiovascular health are more damaging than occasional acoustic peaks, because they do not trigger a conscious adaptive response. Trower also shows that vibration theories underpinned 19th-century understandings of 'nervous illness' — neurasthenia, hysteria, and the 'sensitive body' were understood as pathological over-responsiveness to the vibrations of industrial modernity. The body that suffers from sound is not weak; it is accurately registering its environment. For NoiseCatcher: the historical argument for measuring ambient noise continuously, not just peaks.",
    sources: [
      "Trower, S., Senses of Vibration: A History of the Pleasure and Pain of Sound (Continuum, 2012)",
      "The Lancet, series on railway travel and nervous health (1860s–1880s)",
    ],
    relatedTerms: ["Cardiovascular Noise Effects", "Night Noise", "Dose-Response Relationship", "Vibrational Ontology"],
  },

  {
    id: "ma-interval",
    term: "Ma (間) — the Interval as Inhabited Space",
    category: "acoustic",
    definition:
      "A Japanese concept designating the interval — the pause, the gap between sounds — as a charged, inhabited space, not mere absence. Ma is not silence: it is the qualitative duration between sonic events, the place where acoustic meaning deposits and prepares itself.",
    context:
      "Toru Takemitsu writes in Confronting Silence (Fallen Leaf Press, 1995): 'Sound, in its ultimate expressiveness, being constantly refined, approaches the nothingness of that wind in the bamboo grove.' Takemitsu refuses the Western opposition between silence (absence, death) and sound (presence, life) — in Japanese thought, both coexist in ma. The productive interval is neither empty nor full in the Western sense; it is the relational space that gives the surrounding sounds their meaning. For NoiseCatcher: measurement instruments do not capture ma — the intervals between peaks, the relative silences within a noisy environment, are precisely what noise-exposed communities seek and are denied. Measuring ma — the duration and quality of quiet intervals — is as important as measuring peak levels. ISO 12913 soundscape methodology begins to approach this through its 8-attribute circumplex (calm, pleasant) but ma names a deeper perceptual quality that no metric yet captures.",
    sources: [
      "Takemitsu, T., Confronting Silence: Selected Writings (Fallen Leaf Press, 1995, trans. Kakudo & Glasow)",
      "Pilgrim, R.B., 'Intervals (Ma) in Space and Time: Foundations for a Religio-Aesthetic Paradigm in Japan' (History of Religions, 1986)",
    ],
    relatedTerms: ["Soundscape", "Deep Listening", "ISO 12913 Soundscape Standard", "Psychoacoustic Annoyance"],
  },

  {
    id: "indeterminacy-urban",
    term: "Indeterminacy — the City as Unwritten Score",
    category: "acoustic",
    definition:
      "Borrowing from John Cage, indeterminacy designates the condition of a sonic event whose outcome cannot be fully predicted or controlled by any single author. Applied to the city: the urban soundscape is an indeterminate score — no one composed it, no one controls its outcome.",
    context:
      "John Cage demonstrated indeterminacy through 4'33'' (1952): during four minutes and thirty-three seconds of performative silence, the audience hears the sounds of the environment — coughs, rain, ventilation, traffic — as music. Earlier, in Harvard's anechoic chamber, Cage heard two sounds: a low one (his circulatory system) and a high one (his nervous system) — proof that there is no absolute silence, only sounds not yet listened to. His central proposition: 'I have nothing to say and I am saying it and that is poetry' (Silence, 1961). For NoiseCatcher: every measurement captures a fragment of this indeterminate score; the app is an instrument for reading the unwritten score of the city. The citizen who measures noise is not extracting data from a passive environment — they are, in Cage's sense, attending to the world's continuous performance.",
    sources: [
      "Cage, J., Silence: Lectures and Writings (Wesleyan UP, 1961)",
      "Cage, J., 4'33'' (score, 1952, C.F. Peters)",
    ],
    relatedTerms: ["Ma (間)", "Soundscape", "Deep Listening", "Schafer — Soundscape"],
  },

  {
    id: "citizen-sonic-archive",
    term: "Citizen Sonic Archive — Testimony, Document, and Lived Fiction",
    category: "social",
    definition:
      "A citizen's recording of an acoustic environment is not a neutral document: it is a partial, situated, re-lived archival object that carries the memory, interpretation, and lived experience of its author. The citizen sonic archive is simultaneously evidence and testimony.",
    context:
      "Daniela Cascella proposes in En Abîme: Listening, Reading, Writing (Zero Books, 2012) an archive that is also an 'archival fiction' — not a passive repository but a constellation of fragments that are 'not only reinterpreted but also lived and re-lived.' This tension — between the rigour of the document and the subjectivity of testimony — is precisely what NoiseCatcher navigates. The decibel measurement is the objectivation; the carnet note, the pin description, the voice recording are the lived fiction. Together they constitute the archive. Separately, neither suffices as evidence: a measurement without context is a number; a testimony without measurement is a claim. The legal concept of 'best evidence' is not the most objective but the most complete — the document that combines calibrated data and situated witness. The citizen sonic archive is also implicitly an act of counter-documentation: it records what official archives and strategic noise maps systematically omit.",
    sources: [
      "Cascella, D., En Abîme: Listening, Reading, Writing: An Archival Fiction (Zero Books, 2012)",
      "ISO/IEC 27037:2012 — digital evidence guidelines",
      "LaBelle, B., Sonic Agency (Goldsmiths Press, 2018)",
    ],
    relatedTerms: ["Acoustic Notebooks (Carnets)", "Chain of Custody", "Environmental Justice and Noise", "Co-Listening"],
  },

  {
    id: "urban-acupuncture-acoustic",
    term: "Urban Acupuncture — Data-Driven Targeted Intervention",
    category: "environmental",
    definition:
      "An urban intervention strategy that uses data mapping to identify precisely located pressure points for high-leverage, small-scale actions — too small for megaprojects, but numerous and well-distributed enough to transform a city's resilience cumulatively. Against top-down planning: acupuncture, not surgery.",
    context:
      "Nicholas de Monchaux, in Local Code: 3659 Proposals About Data, Design, and the Nature of Cities (Princeton Architectural Press, 2016), used GIS to identify 3,659 abandoned municipal parcels in San Francisco — sites that had fallen out of the formal land system — and produced 3,659 site-specific intervention proposals: stormwater management, greening, shared spaces. Each was adapted to its specific context; none was identical to another. The method combines open data and local knowledge; the result is a distributed evidence base for granular urban change. Acoustic urban acupuncture would identify noise pressure points at precisely located high-impact sites — identified through citizen noise data — and target specific interventions: acoustic barriers, street trees, reclassification of road surface, rezoning of industrial activity. The legal and social abandonment of noise-affected sites parallels the way these communities are 'abandoned' by regulatory systems that measure major sources but miss local accumulations.",
    sources: [
      "de Monchaux, N., Local Code: 3659 Proposals About Data, Design, and the Nature of Cities (Princeton Architectural Press, 2016)",
      "Lerner, J., Urban Acupuncture (Island Press, 2014)",
    ],
    relatedTerms: ["Strategic Noise Maps", "Environmental Justice and Noise", "Acoustic Counter-Mapping", "Global Noise Burden — A Research Gap"],
  },

  {
    id: "acoustic-bifurcation",
    term: "Bifurcation — the Irreversible Acoustic Threshold",
    category: "health",
    definition:
      "The critical point in a far-from-equilibrium system where a fluctuation — even small — can trigger an irreversible change of state: either toward a new, more resilient order or toward disintegration. In acoustic context: the moment when a community's citizen noise documentation tips into systemic advocacy — or when a body's noise exposure tips past the threshold of irreversible harm.",
    context:
      "Ilya Prigogine and Isabelle Stengers demonstrated in Order Out of Chaos (Bantam, 1984) that complexity and order emerge not from stable equilibrium but far from it, through amplification of fluctuations. A noise-exposed community is a dissipative system far from equilibrium: it maintains its organisation by absorbing disruptive flows, but it can tip. Irreversibility is central — acoustic damage (hearing loss, cardiovascular sequelae, altered animal behaviour) does not reverse. The COVID-19 pandemic showed that when human noise fell, bird songs changed within weeks; they do not automatically revert when noise resumes. The arrow of time in acoustics runs in one direction: prevention is worth immeasurably more than remediation. For the EEA, this argument justifies not the 73,000 premature deaths per year as acceptable externalities but as tipping-point evidence that the system has already bifurcated in the wrong direction.",
    sources: [
      "Prigogine, I. & Stengers, I., Order Out of Chaos: Man's New Dialogue with Nature (Bantam, 1984)",
      "EEA, Environmental Noise in Europe 2025",
    ],
    relatedTerms: ["Cardiovascular Noise Effects", "Acoustic Trauma", "Noise-Induced Hearing Loss (NIHL)", "Sensory Extinction"],
  },

  {
    id: "acoustic-liberty",
    term: "Acoustic Liberty — Negative and Positive",
    category: "legal",
    definition:
      "Noise pollution violates two forms of freedom simultaneously. Negative liberty (freedom from): the noise imposed by infrastructure or an operator constitutes an external interference with your living space. Positive liberty (freedom to): the capacity to realise oneself and participate in collective life — destroyed by chronic sleep deprivation, impaired concentration, and the degradation of spaces for public conversation.",
    context:
      "Isaiah Berlin, 'Two Concepts of Liberty' (1958), distinguished these freedoms to show their conflict is irreducible — both cannot be maximised simultaneously. In acoustic context, this means that sonic use conflicts — industry vs. residents, airport vs. neighbourhood, nightclub vs. neighbours — are genuine value conflicts, not technical problems. Berlin's value pluralism implies there is no algorithm for resolving them — only political decisions. This grounds NoiseCatcher's advocacy framing: the app provides data; the political decision remains human and must be claimed as such. The ECHR Article 8 jurisprudence (Hatton v. UK, Grand Chamber, 2003) operationalises the negative liberty claim at European law: states have positive obligations to protect residents from severe noise as a condition of the right to a home. India's Supreme Court (2005) went further, grounding freedom from noise in the constitutional right to life itself.",
    sources: [
      "Berlin, I., 'Two Concepts of Liberty' (in Four Essays on Liberty, Oxford UP, 1969)",
      "Baum, B. & Nichols, R. (eds.), Isaiah Berlin and the Politics of Freedom (Routledge, 2013)",
      "Hatton and Others v. United Kingdom (ECtHR Grand Chamber, 2003)",
    ],
    relatedTerms: ["Right to Quiet (ECHR Article 8)", "Environmental Justice and Noise", "WHO Environmental Noise Guidelines", "Signal/Noise — a Cultural Operation"],
  },
  {
    id: "decolonial-field-recording",
    term: "Decolonial Field Recording — Global Practice and Non-Western Voices",
    category: "social",
    definition:
      "The critical and creative project of recording sound without reproducing the colonial structures — extraction, authority, exoticisation, classification — that have shaped field recording since the phonograph cylinder. It names both a problem (who has historically recorded whose sounds, for whose audiences, under whose authority) and an expanding set of practices that refuse this inheritance.",
    context:
      "Field recording as a practice was born inside the same institutional structures as colonial ethnomusicology: European and North American researchers arriving in non-Western communities with machines, departing with sounds, and depositing them in archives in Paris, Berlin, and London. The people recorded became sources. The sounds became data. The researcher became an authority on cultures not their own. This inheritance persists in contemporary field recording through: the valorisation of 'pristine' soundscapes (imagined as non-urban, non-Western, pre-industrial); measurement frameworks designed in Europe for European regulatory systems; hardware and software concentrated in North American and European markets; and critical theory produced almost entirely in English-language institutions.\n\nThe counter-tradition is global and long-standing. **Toshiya Tsunoda** (Japan, b. 1964) documents micro-physical vibrations — structural resonances, air pressure variations at small openings, the imperceptible sounds of materials in contact — challenging the picturesqueness of Western soundscape recording with rigorous material attention to environment. His series *Extract from Field Recording Archive* (Winds Measure Recordings, from 1999) is among the most disciplined practices in the field. **Yannick Dauby** (France, based in Taiwan since 2007) has spent decades documenting Taiwanese soundscapes — urban, rural, indigenous, industrial — working alongside Aboriginal Taiwanese communities whose relationships to sonic environment resist Western nature/culture binaries. **Emeka Ogboh** (Nigeria, b. 1977, based between Lagos and Berlin) documents urban Lagos — bus stops, market vendors, street life — in sound installations exhibited at Documenta 14 (2017), the Centre Pompidou, and globally. His argument is simple: the acoustic texture of Lagos is not less complex, not less worthy of careful documentation, than any European city. **Beatriz Ferreyra** (Argentina, 1937–2022) was a pioneer of electroacoustic music and musique concrète who worked at the Groupe de Recherches Musicales (GRM) in Paris from 1963 alongside Pierre Schaeffer, composing with field recordings for six decades — a Latina woman whose contribution to the history of field recording composition has been systematically understated. **Budhaditya Chattopadhyay** (India, based in Netherlands) works on postcolonial listening: his practice and scholarship examine how Western-derived soundscape methodology marginalises non-Western relationships to sonic environment. **Basel Abbas and Ruanne Abou-Rahme** (Palestinian) work with Palestinian sonic archives and the acoustic memory of displacement — what remains audible of a destroyed or inaccessible place — in projects including *And Yet My Mask is Powerful* (2016–). **Tarek Atoui** (Lebanon) builds instruments with and for communities whose relationship to sound falls outside Western musical and documentary categories, including *The Reverse Collection* (2013–), developed with deaf and hearing-impaired participants. **Hassan Hujairi** (Bahrain) documents rapidly transforming Gulf urban soundscapes — cities whose acoustic character has changed entirely within a generation through petrochemical industrialisation and speculative construction. The geographic concentration of boutique field recording hardware in Europe and North America is itself a structural inequity: the communities most exposed to environmental noise and most in need of documentation tools are often least able to access the instruments designed to document it. Noisecatcher's smartphone-first architecture is a direct response to this: a phone is infrastructure that already exists in Lagos, Dhaka, Cairo, São Paulo, and Karachi.",
    sources: [
      "Tsunoda, T., Extract from Field Recording Archive series (Winds Measure Recordings, 1999–)",
      "Ogboh, E., sound installations documented at documenta 14, Athens/Kassel (2017)",
      "Ferreyra, B., electroacoustic works at GRM, Paris (1963–2022)",
      "Abbas, B. and Abou-Rahme, R., And Yet My Mask is Powerful (2016–)",
      "Atoui, T., The Reverse Collection (2013–)",
      "Dauby, Y., Taiwanese soundscape documentation (2007–), released on Kalerne and other labels",
      "Chattopadhyay, B., postcolonial sound practice and scholarship (Netherlands, 2010s–)",
      "Hujairi, H., Gulf urban soundscape practice (Bahrain, 2010s–)",
    ],
    relatedTerms: ["Acoustic Colonialism", "Aural Counterpublics", "Environmental Justice and Noise", "Participatory Noise Sensing", "Acoustic Commons"],
  },
];

export function getEntriesByCategory(category: AbecedaireEntry["category"]) {
  return ABECEDAIRE.filter((e) => e.category === category);
}

export function searchEntries(query: string) {
  const q = query.toLowerCase();
  return ABECEDAIRE.filter(
    (e) =>
      e.term.toLowerCase().includes(q) ||
      e.definition.toLowerCase().includes(q) ||
      e.context.toLowerCase().includes(q)
  );
}

export const CATEGORY_LABELS: Record<AbecedaireEntry["category"], string> = {
  acoustic: "Acoustics",
  health: "Health",
  social: "Society",
  legal: "Law & Policy",
  environmental: "Environment",
};

export const CATEGORY_COLORS: Record<AbecedaireEntry["category"], string> = {
  acoustic: "bg-blue-900 text-blue-300 border-blue-700",
  health: "bg-red-900 text-red-300 border-red-700",
  social: "bg-purple-900 text-purple-300 border-purple-700",
  legal: "bg-amber-900 text-amber-300 border-amber-700",
  environmental: "bg-green-900 text-green-300 border-green-700",
};

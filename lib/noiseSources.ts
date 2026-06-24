// Noisecatcher — noise source taxonomy
// Two-level: top-level category → specific subcategory.
// The top-level IDs map directly to NoiseCategory in lib/pins.ts.

export interface NoiseSub {
  id: string;
  label: string;
  emoji: string;
}

export interface NoiseCategoryDef {
  id: string;
  label: string;
  emoji: string;
  color: string;
  /** If true, show a safety warning when this category is selected. */
  sensitive?: boolean;
  subs: NoiseSub[];
}

export const NOISE_SOURCE_CATEGORIES: NoiseCategoryDef[] = [
  {
    id: "traffic",
    label: "Traffic",
    emoji: "🚗",
    color: "#60a5fa",
    subs: [
      { id: "car",         label: "Car / light vehicle",   emoji: "🚗" },
      { id: "motorcycle",  label: "Motorcycle / scooter",  emoji: "🏍️" },
      { id: "truck",       label: "Heavy truck / lorry",   emoji: "🚛" },
      { id: "bus",         label: "Bus",                   emoji: "🚌" },
      { id: "train",       label: "Train / metro",         emoji: "🚇" },
      { id: "tram",        label: "Tram",                  emoji: "🚊" },
      { id: "aircraft",         label: "Aircraft / airplane",    emoji: "✈️" },
      { id: "helicopter",       label: "Helicopter",             emoji: "🚁" },
      { id: "boat",             label: "Boat / small craft",     emoji: "⛵" },
      { id: "ferry",            label: "Ferry / passenger ship", emoji: "🛳️" },
      { id: "cargo_ship",       label: "Cargo vessel / tanker",  emoji: "🚢" },
      { id: "port_operations",  label: "Port / loading dock",    emoji: "⚓" },
    ],
  },
  {
    id: "emergency",
    label: "Emergency",
    emoji: "🚑",
    color: "#f87171",
    subs: [
      { id: "ambulance",         label: "Ambulance siren",           emoji: "🚑" },
      { id: "firetruck",         label: "Fire truck siren",          emoji: "🚒" },
      { id: "police",            label: "Police siren",              emoji: "🚔" },
      { id: "military_vehicle",  label: "Military / security vehicle", emoji: "🪖" },
    ],
  },
  {
    id: "municipal",
    label: "Municipal",
    emoji: "🗑️",
    color: "#a3e635",
    subs: [
      { id: "garbage_truck",   label: "Garbage / trash truck", emoji: "🗑️" },
      { id: "street_sweeper",  label: "Street sweeper",        emoji: "🧹" },
      { id: "reverse_beeper",  label: "Reverse beeper",        emoji: "🔔" },
    ],
  },
  {
    id: "construction",
    label: "Construction",
    emoji: "🏗️",
    color: "#fb923c",
    subs: [
      { id: "road_repair",            label: "Road repair / asphalt",   emoji: "🛣️" },
      { id: "drilling",               label: "Drilling / jackhammer",   emoji: "⚒️" },
      { id: "building_construction",  label: "Building construction",   emoji: "🏗️" },
      { id: "demolition",             label: "Demolition",              emoji: "💥" },
      { id: "pile_driver",            label: "Pile driver",             emoji: "🔨" },
    ],
  },
  {
    id: "industrial",
    label: "Industrial",
    emoji: "🏭",
    color: "#94a3b8",
    subs: [
      { id: "factory",              label: "Factory / plant",            emoji: "🏭" },
      { id: "generator",            label: "Generator / power plant",    emoji: "⚡" },
      { id: "hvac",                 label: "HVAC / air conditioning",    emoji: "❄️" },
      { id: "mining",               label: "Mining / quarry",            emoji: "⛏️" },
      { id: "data_center",          label: "Data centre / server farm",  emoji: "🖥️" },
      { id: "cooling_tower",        label: "Cooling tower / chiller",    emoji: "🌡️" },
      { id: "ups_hum",              label: "UPS / battery backup hum",   emoji: "🔋" },
      { id: "antenna_array",        label: "Antenna array / cell tower", emoji: "📡" },
      { id: "electrical_infra",     label: "Transformer / power line",   emoji: "🔌" },
    ],
  },
  {
    id: "entertainment",
    label: "Entertainment",
    emoji: "🎵",
    color: "#c084fc",
    subs: [
      { id: "nightclub",  label: "Nightclub / bar",          emoji: "🎶" },
      { id: "concert",    label: "Live music / concert",     emoji: "🎤" },
      { id: "fireworks",  label: "Fireworks",                emoji: "🎆" },
      { id: "stadium",    label: "Sports stadium",           emoji: "🏟️" },
      { id: "festival",   label: "Festival / outdoor event", emoji: "🎡" },
    ],
  },
  {
    id: "neighbourhood",
    label: "Neighbourhood",
    emoji: "🏘️",
    color: "#34d399",
    subs: [
      { id: "dog_barking",       label: "Dog barking",                   emoji: "🐕" },
      { id: "neighbour_music",   label: "Neighbour music / TV",          emoji: "📻" },
      { id: "power_tools",       label: "Power tools / DIY",             emoji: "🔧" },
      { id: "lawnmower",         label: "Lawnmower / leaf blower",       emoji: "🌿" },
      { id: "party",             label: "Party / gathering",             emoji: "🎉" },
      { id: "voices",            label: "Shouting / voices",             emoji: "📣" },
      { id: "religious",         label: "Amplified religious / ceremony", emoji: "🔔" },
      { id: "agricultural",      label: "Agricultural equipment",        emoji: "🚜" },
    ],
  },
  {
    id: "recreational",
    label: "Recreational vehicles",
    emoji: "🏍️",
    color: "#f59e0b",
    subs: [
      { id: "atv",         label: "ATV / quad bike / off-road", emoji: "🏎️" },
      { id: "jet_ski",     label: "Jet ski / personal watercraft", emoji: "🌊" },
      { id: "snowmobile",  label: "Snowmobile / snow vehicle",  emoji: "🏔️" },
      { id: "dirt_bike",   label: "Dirt bike / trail motorcycle", emoji: "🏍️" },
      { id: "motorsport",  label: "Motorsport / racing circuit", emoji: "🏁" },
    ],
  },
  {
    id: "natural",
    label: "Natural event",
    emoji: "🌪️",
    color: "#38bdf8",
    subs: [
      { id: "wind_storm",  label: "Wind / storm",      emoji: "🌬️" },
      { id: "thunder",     label: "Thunder",           emoji: "⛈️" },
      { id: "earthquake",  label: "Earthquake",        emoji: "🌍" },
      { id: "flood",       label: "Flooding / water",  emoji: "🌊" },
      { id: "wildfire",    label: "Wildfire / fire",   emoji: "🔥" },
      { id: "volcano",     label: "Volcanic activity", emoji: "🌋" },
    ],
  },
  {
    id: "conflict",
    label: "Conflict zone",
    emoji: "⚠️",
    color: "#ef4444",
    sensitive: true,
    subs: [
      { id: "gunfire",               label: "Gunfire / shooting",                    emoji: "💢" },
      { id: "explosion",             label: "Explosion / bomb",                      emoji: "💣" },
      { id: "artillery",             label: "Artillery / shelling",                  emoji: "🎯" },
      { id: "air_raid",              label: "Air raid siren",                        emoji: "🔴" },
      { id: "drone_uav",             label: "Drone / UAV",                           emoji: "🛸" },
      { id: "sonic_boom",            label: "Sonic boom",                            emoji: "💥" },
      { id: "riot",                  label: "Civil unrest / riot",                   emoji: "📢" },
      { id: "acoustic_weapon",       label: "Acoustic weapon (LRAD)",                emoji: "📡" },
      { id: "colonial_demolition",   label: "Demolition / forced displacement",      emoji: "🏚️" },
      { id: "colonial_surveillance", label: "Surveillance drone / tower",            emoji: "👁️" },
      { id: "colonial_checkpoint",   label: "Checkpoint / military barrier",         emoji: "🚧" },
      { id: "colonial_incursion",    label: "Military incursion / occupation noise", emoji: "⛺" },
      { id: "colonial_settlement",   label: "Settlement construction / expansion",   emoji: "🏗️" },
      { id: "colonial_curfew",       label: "Curfew announcement / loudspeaker",     emoji: "📣" },
    ],
  },
  {
    id: "police_force",
    label: "Police brutality",
    emoji: "🚨",
    color: "#f97316",
    sensitive: true,
    subs: [
      { id: "lrad_police",         label: "Sound cannon / LRAD",           emoji: "📡" },
      { id: "flash_bang",          label: "Flash-bang / stun grenade",     emoji: "💥" },
      { id: "rubber_bullet",       label: "Rubber bullet / baton round",   emoji: "🔴" },
      { id: "tear_gas",            label: "Tear gas canister",             emoji: "💨" },
      { id: "water_cannon",        label: "Water cannon",                  emoji: "💧" },
      { id: "police_helicopter",   label: "Police / surveillance helicopter", emoji: "🚁" },
      { id: "armored_vehicle",     label: "Armored vehicle / MRAP",        emoji: "🛡️" },
      { id: "crowd_control_siren", label: "Crowd-control PA / siren",      emoji: "🔊" },
    ],
  },
  {
    id: "harassment",
    label: "Harassment & gender-based / LGBTQ+ violence",
    emoji: "🚫",
    color: "#e879f9",
    sensitive: true,
    subs: [
      { id: "street_harassment",        label: "Street harassment / catcalling",          emoji: "🚫" },
      { id: "verbal_assault",           label: "Verbal assault / insults",                emoji: "💬" },
      { id: "intimidation",             label: "Intimidation / threatening behaviour",     emoji: "⚠️" },
      { id: "stalking",                 label: "Stalking / following",                    emoji: "👁️" },
      { id: "group_aggression",         label: "Group aggression / mobbing",              emoji: "📢" },
      { id: "hate_speech",              label: "Hate speech / discriminatory abuse",      emoji: "🔇" },
      { id: "lgbtq_hate_speech",        label: "LGBTQ+ hate speech / homophobic abuse",  emoji: "🏳️‍🌈" },
      { id: "lgbtq_assault",            label: "LGBTQ+ targeted assault / attack",        emoji: "⚡" },
      { id: "lgbtq_intimidation",       label: "LGBTQ+ intimidation / threatening presence", emoji: "⚠️" },
      { id: "domestic_sound",           label: "Domestic violence (audible)",             emoji: "🏠" },
      { id: "sexual_harassment_audio",  label: "Sexual harassment (audio evidence)",      emoji: "🎙️" },
    ],
  },
  {
    id: "phones",
    label: "Phone noise pollution",
    emoji: "📱",
    color: "#22d3ee",
    subs: [
      { id: "ringtone",           label: "Ringtone / call alert",           emoji: "📳" },
      { id: "notification_burst", label: "Notification burst",              emoji: "🔔" },
      { id: "vibration_surface",  label: "Vibration on hard surface",       emoji: "📳" },
      { id: "loudspeaker_call",   label: "Loudspeaker call in public",      emoji: "📢" },
      { id: "media_no_headphone", label: "Media played without headphones", emoji: "🔊" },
      { id: "gaming_audio",       label: "Mobile gaming audio",             emoji: "🎮" },
    ],
  },
  {
    id: "fascism",
    label: "Political violence",
    emoji: "✊",
    color: "#b45309",
    sensitive: true,
    subs: [
      { id: "extremist_rally",      label: "Extremist rally / march",             emoji: "📢" },
      { id: "targeted_attack",      label: "Targeted attack / assault",           emoji: "⚡" },
      { id: "threatening_assembly", label: "Threatening assembly / intimidation", emoji: "⚠️" },
      { id: "vandalism",            label: "Vandalism / property destruction",    emoji: "🔨" },
      { id: "amplified_propaganda", label: "Amplified propaganda / loudspeaker",  emoji: "📣" },
    ],
  },
];

/** Return a display label for a source type and optional subcategory. */
export function getSourceLabel(sourceType?: string, sourceSub?: string): string | null {
  if (!sourceType) return null;
  const cat = NOISE_SOURCE_CATEGORIES.find((c) => c.id === sourceType);
  if (!cat) return null;
  if (sourceSub) {
    const sub = cat.subs.find((s) => s.id === sourceSub);
    return sub ? `${sub.emoji} ${sub.label}` : `${cat.emoji} ${cat.label}`;
  }
  return `${cat.emoji} ${cat.label}`;
}

/** Look up a subcategory definition. */
export function getSubDef(sourceType: string, sourceSub: string): NoiseSub | undefined {
  return NOISE_SOURCE_CATEGORIES
    .find((c) => c.id === sourceType)
    ?.subs.find((s) => s.id === sourceSub);
}

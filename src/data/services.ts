import top500 from "../../top500Subs.json";
import { brandData } from "./brandData";

export type KnownService = {
  name: string;
  category: string;
  defaultPrice?: number;
  color: string;
  icon?: string;
};

// Existing rich data (colors/icons) can be overrides
const RICH_DATA: Record<string, Partial<KnownService>> = {
  "netflix": { color: "#E50914", icon: "Netflix" },
  // ... other overrides
};

// Strict Category List
const ALLOWED_CATEGORIES = [
  "Animaux",
  "Assurance",
  "Cloud",
  "Divertissement",
  "Education",
  "Energie",
  "Finance",
  "Fitness",
  "Logement",
  "Productivité",
  "Santé",
  "Securité",
  "Transport",
  "Téléphonie",
  "Autres"
];

function mapToAllowedCategory(original: string): string {
    const lower = original.toLowerCase().trim();
    
    // Strict match check
    const exact = ALLOWED_CATEGORIES.find(c => c.toLowerCase() === lower);
    if (exact) return exact;

    // Mapping Rules
    if (lower.includes('streaming') || lower.includes('vidéo') || lower.includes('musique') || lower.includes('music') || lower.includes('gaming') || lower.includes('jeu') || lower.includes('rencontre') || lower.includes('social') || lower.includes('tv') || lower.includes('cinéma') || lower.includes('art') || lower.includes('culture') || lower.includes('loisir')) return "Divertissement";
    
    if (lower.includes('cloud') || lower.includes('stockage') || lower.includes('drive') || lower.includes('hébergement')) return "Cloud";
    
    if (lower.includes('productivité') || lower.includes('pro') || lower.includes('business') || lower.includes('bureau') || lower.includes('travail') || lower.includes('ia') || lower.includes('dev') || lower.includes('logiciel') || lower.includes('outil')) return "Productivité";
    
    if (lower.includes('santé') || lower.includes('soin') || lower.includes('méditation') || lower.includes('bien-être')) return "Santé";
  
    if (lower.includes('sport') || lower.includes('fitness') || lower.includes('gym') || lower.includes('yoga') || lower.includes('entrainement')) return "Fitness";
      
    if (lower.includes('assurance') || lower.includes('mutuelle') || lower.includes('protection')) return "Assurance";
    
    if (lower.includes('finance') || lower.includes('banque') || lower.includes('invest')) return "Finance";
    
    if (lower.includes('transport') || lower.includes('vélo') || lower.includes('vtc') || lower.includes('auto') || lower.includes('moto') || lower.includes('parking') || lower.includes('bus') || lower.includes('train')) return "Transport";
    
    if (lower.includes('énergie') || lower.includes('elec') || lower.includes('gaz') || lower.includes('eau') || lower.includes('chauffage')) return "Energie";
    
    if (lower.includes('logement') || lower.includes('loyer') || lower.includes('immo') || lower.includes('maison')) return "Logement";
    
    if (lower.includes('téléphonie') || lower.includes('mobile') || lower.includes('internet') || lower.includes('box') || lower.includes('fibre') || lower.includes('comm')) return "Téléphonie";
    
    if (lower.includes('éducation') || lower.includes('cours') || lower.includes('langue') || lower.includes('formation') || lower.includes('presse') || lower.includes('news') || lower.includes('magazine') || lower.includes('learning') || lower.includes('école')) return "Education";
    
    if (lower.includes('sécurité') || lower.includes('security') || lower.includes('vpn') || lower.includes('antivirus') || lower.includes('alarme') || lower.includes('password')) return "Securité";
    
    if (lower.includes('animal') || lower.includes('animaux') || lower.includes('chien') || lower.includes('chat') || lower.includes('veterinaire')) return "Animaux";

    return "Autres";
}

// Generate DB from top500
export const SERVICES_DB: Record<string, KnownService> = {};

top500.forEach((item) => {
  const normalizedKey = item.name.toLowerCase();
  const mappedCategory = mapToAllowedCategory(item.category);
  
  // 1. Try Manual Rich Data
  const rich = RICH_DATA[normalizedKey] || {};
  
  // 2. Try Automated Brand Data
  // matches by original name usually (case sensitive in brandData keys)
  const brand = brandData[item.name] || {}; 
  
  SERVICES_DB[normalizedKey] = {
    name: item.name,
    category: mappedCategory,
    color: rich.color || brand.color || "#333333", 
    icon: rich.icon || brand.iconName 
  };
});


// Add manual entries that might not be in top500 (like French Telcos if missing)
const MANUAL_ADDS: Record<string, KnownService> = {
    "orange": { name: "Orange", category: "Téléphonie", color: "#F16E00", icon: "Orange" },
    "sfr": { name: "SFR", category: "Téléphonie", color: "#E2001A", icon: "SFR" },
    "free": { name: "Free", category: "Téléphonie", color: "#CC0000", icon: "Free" },
};

Object.entries(MANUAL_ADDS).forEach(([key, val]) => {
    if (!SERVICES_DB[key]) {
        SERVICES_DB[key] = val;
    }
});

export const CATEGORIES = ALLOWED_CATEGORIES;


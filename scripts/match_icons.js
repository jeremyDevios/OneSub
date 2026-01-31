const fs = require('fs');
const https = require('https');
const path = require('path');
const { URL } = require('url');

const SUBS_PATH = path.join(__dirname, '../top500Subs.json');
const OUT_PATH = path.join(__dirname, '../src/data/brandData.ts');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const get = (currentUrl) => {
            https.get(currentUrl, (res) => {
                // Handle redirects
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    let nextUrl = res.headers.location;
                    if (!nextUrl.startsWith('http')) {
                        const parsed = new URL(currentUrl);
                        nextUrl = `${parsed.protocol}//${parsed.host}${nextUrl}`;
                    }
                    get(nextUrl);
                    return;
                }

                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch(e) {
                        console.error("Parse error, data:", data.substring(0, 100));
                        reject(e);
                    }
                });
                res.on('error', reject);
            });
        };
        get(url);
    });
}

function normalize(str) {
    if (typeof str !== 'string') str = String(str);
    return str.toLowerCase()
        .replace(/\+/g, 'plus')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]/g, '')
        .replace('premium', '')
        .replace('gold', '')
        .replace('pro', '')
        .replace('plus', '') // remove plus again if we want to be identical to stripped
        .replace('ultra', '')
        .replace('max', '')
        .replace('membership', '')
        .replace('subscription', '')
        .replace('infinite', '')
        .replace('unlimited', '')
        .replace('pass', '')
        .replace('connect', '');
}

const manualOverrides = {
    "Amazon Prime Video": "amazon",
    "YouTube Premium": "youtube",
    "Google One": "google",
    "Apple Music": "apple",
    "iCloud+": "apple",
    "Microsoft 365": "microsoft",
    "Xbox Game Pass": "xbox",
    "PlayStation Plus": "playstation",
    "Nintendo Switch Online": "nintendo",
    "Adobe Creative Cloud": "adobe",
    "Canva Pro": "canva",
    "Tinder Gold": "tinder",
    "LinkedIn Premium": "linkedin",
    "Apple TV+": "apple",
    "Audible": "audible",
    "Kindle Unlimited": "amazon",
    "Uber One": "uber",
    "Deliveroo Plus": "deliveroo",
    "SNCF Connect Max": "sncf",
    "Orange Fibre": "orange",
    "Freebox Ultra": "free",
    "SFR Box": "sfr",
    "Bouygues Bbox": "bouygues",
    "EDF Tempo": "edf",
    "TotalEnergies": "totalenergies",
    "UGC Illimité": "ugc",
    "Basic-Fit": "basicfit",
    "Fitness Park": "fitnesspark",
    "Github Copilot": "github",
    "Pass Ciné Pathé Gaumont": "pathe",
    "Twitch Sub": "twitch",
    "Discord Nitro": "discord",
    "Snapchat+": "snapchat",
    "X Premium": "x",
    "Bumble Premium": "bumble",
    "Hinge+": "hinge",
    "Spotify Family": "spotify",
    "SoundCloud Go+": "soundcloud",
    "Todoist Pro": "todoist",
    "Duolingo Plus": "duolingo",
    "ChatGPT Plus": "openai",
    "Claude Pro": "anthropic",
};

function toPascalCase(str) {
    return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

async function main() {
    console.log("Reading top500...");
    const subsRaw = fs.readFileSync(SUBS_PATH, 'utf8');
    const subs = JSON.parse(subsRaw);

    console.log("Fetching Simple Icons...");
    const icons = await fetchJson('https://unpkg.com/simple-icons/icons.json');

    // Check if icons is an array or object
    const iconsList = Array.isArray(icons) ? icons : (icons.icons || Object.values(icons));
    console.log(`Found ${iconsList.length} icons. Matching...`);

    const iconMap = {};
    iconsList.forEach(icon => {
        if (!icon.title) return;
        // Map "Netflix" -> Icon Data
        iconMap[normalize(icon.title)] = icon;
        // Also map slug just in case
        iconMap[normalize(icon.slug)] = icon;
    });

    const matches = {};
    let matchCount = 0;

    subs.forEach((sub) => {
        const subName = sub.name; 
        if (!subName) return;

        let icon = null;

        // 1. Try manual override
        if (manualOverrides[subName]) {
             const overrideKey = normalize(manualOverrides[subName]);
             if (iconMap[overrideKey]) {
                 icon = iconMap[overrideKey];
             }
        }

        // 2. Try direct normalization
        if (!icon) {
            const key = normalize(subName);
            if (iconMap[key]) {
                icon = iconMap[key];
            }
        }

        if (icon) {
            matches[subName] = {
                color: `#${icon.hex}`,
                slug: icon.slug,
                iconName: `Si${toPascalCase(icon.slug)}`
            };
            matchCount++;
        }
    });

    console.log(`Matched ${matchCount} / ${subs.length} brands.`);

    const fileContent = `// Auto-generated by scripts/match_icons.js
export interface BrandInfo {
  color: string;
  slug: string;
  iconName: string;
}

export const brandData: Record<string, BrandInfo> = ${JSON.stringify(matches, null, 2)};
`;

    fs.writeFileSync(OUT_PATH, fileContent);
    console.log(`Wrote to ${OUT_PATH}`);
}

main().catch(console.error);
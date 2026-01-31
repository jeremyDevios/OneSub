import React from "react";
import * as Si from "react-icons/si";
import { FaDeezer } from "react-icons/fa";
import { TbBrandDisney } from "react-icons/tb";

// For missing ones or specific custom ones like Canal/Free
const CustomCanalPlus = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 24" fill="currentColor" {...props}>
          <text x="5" y="18" fontSize="18" fontWeight="900" fontFamily="Arial, sans-serif">CANAL+</text>
    </svg>
);

const CustomFree = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
           <path d="M6.3 7.82V4.94h3.62v2.88H7.76v2h2.06v2.66H7.76v4.66H6.3zm5.02 0V9.8h-1.2v2.66h1.2v-1.6h.28l1.08 1.6h1.66l-1.38-1.92c.62-.22.96-.72.96-1.38 0-1.04-.6-1.34-1.56-1.34h-1.04zm4.24 0V9.8h-1.2v2.66h1.2v-1.6h.28l1.08 1.6h1.66l-1.38-1.92c.62-.22.96-.72.96-1.38 0-1.04-.6-1.34-1.56-1.34h-1.04z" transform="scale(1.2) translate(0, 2)" />
      </svg>
);

const CustomSFR = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
         <rect x="2" y="2" width="20" height="20" rx="2" />
         <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="black" fontSize="10" fontWeight="bold">SFR</text>
    </svg>
);

// Manual overrides or specific mappings that don't match simple naming
export const BrandIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Netflix: Si.SiNetflix,
  Spotify: Si.SiSpotify,
  "Disney+": TbBrandDisney,
  "Amazon Prime": Si.SiAmazon,
  "Prime Video": Si.SiPrimevideo,
  "Apple Music": Si.SiApple, 
  Apple: Si.SiApple,
  iCloud: Si.SiIcloud,
  Deezer: FaDeezer,
  "YouTube Premium": Si.SiYoutube,
  LinkedIn: Si.SiLinkedin,
  ChatGPT: Si.SiOpenai,
  "Adobe Creative Cloud": Si.SiAdobe,
  
  // Custom French / Specifics
  "Canal+": CustomCanalPlus,
  Orange: Si.SiOrange,
  Free: CustomFree,
  SFR: CustomSFR,
  
  // Fallbacks
  "MAIF": (props) => <span {...props as any} style={{fontWeight:'bold'}}>MAIF</span>, 
  "AXA": (props) => <span {...props as any} style={{fontWeight:'bold'}}>AXA</span>,
  "Allianz": (props) => <span {...props as any} style={{fontWeight:'bold'}}>Allianz</span>,
};

export const getBrandIcon = (name: string): React.ComponentType<any> | undefined => {
    // 1. Check manual overrides
    if (BrandIcons[name]) return BrandIcons[name];
    
    // 2. Check direct Simple Icons match
    if ((Si as any)[name]) return (Si as any)[name];

    return undefined;
}

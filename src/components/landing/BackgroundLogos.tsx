import React from 'react';
import { 
  SiNetflix, 
  SiSpotify, 
  SiAmazon, 
  SiApple,
  SiIcloud, 
  SiOrange
} from "react-icons/si";
import { FaDeezer } from "react-icons/fa";
import { TbBrandDisney } from "react-icons/tb";

// Simple Icons paths & custom paths for French brands
const Icons: Record<string, React.ElementType> = {
  Netflix: SiNetflix,
  Spotify: SiSpotify,
  DisneyPlus: TbBrandDisney,
  Amazon: SiAmazon,
  Apple: SiApple,
  iCloud: SiIcloud,
  Deezer: FaDeezer,
  Orange: SiOrange,
  
  CanalPlus: (props: any) => (
      <svg viewBox="0 0 100 24" fill="currentColor" {...props}>
          <text x="5" y="18" fontSize="18" fontWeight="900" fontFamily="Arial, sans-serif">CANAL+</text>
      </svg>
  ),
  Free: (props: any) => (
      <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
           <path d="M6.3 7.82V4.94h3.62v2.88H7.76v2h2.06v2.66H7.76v4.66H6.3zm5.02 0V9.8h-1.2v2.66h1.2v-1.6h.28l1.08 1.6h1.66l-1.38-1.92c.62-.22.96-.72.96-1.38 0-1.04-.6-1.34-1.56-1.34h-1.04zm4.24 0V9.8h-1.2v2.66h1.2v-1.6h.28l1.08 1.6h1.66l-1.38-1.92c.62-.22.96-.72.96-1.38 0-1.04-.6-1.34-1.56-1.34h-1.04z" transform="scale(1.2) translate(0, 2)" />
      </svg>
  ),
  SFR: (props: any) => (
      <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
         <path d="M0 0h24v24H0V0z"/>
         <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="black" fontSize="10" fontWeight="bold">SFR</text>
      </svg>
  ),
};

const logos = [
  { name: 'Netflix', color: '#E50914', txtColor: 'white', icon: Icons.Netflix, top: '15%', left: '10%', delay: '0s' },
  { name: 'Spotify', color: '#1DB954', txtColor: 'black', icon: Icons.Spotify, top: '25%', right: '15%', delay: '1s' },
  { name: 'Disney+', color: '#113CCF', txtColor: 'white', icon: Icons.DisneyPlus, bottom: '20%', left: '20%', delay: '2s' },
  { name: 'Amazon Prime', color: '#00A8E1', txtColor: 'white', icon: Icons.Amazon, top: '20%', right: '35%', delay: '0.5s' },
  { name: 'Canal+', color: 'black', txtColor: 'white', icon: Icons.CanalPlus, border: true, bottom: '30%', right: '10%', delay: '1.5s' },
  { name: 'Apple Music', color: '#FA243C', txtColor: 'white', icon: Icons.Apple, top: '60%', left: '5%', delay: '2.5s' },
  { name: 'Orange', color: '#F16E00', txtColor: 'black', icon: Icons.Orange, bottom: '15%', right: '40%', delay: '1s' },
  { name: 'Free', color: '#CC0000', txtColor: 'white', icon: Icons.Free, top: '40%', left: '15%', delay: '0.8s' },
  { name: 'iCloud', color: '#007AFF', txtColor: 'white', icon: Icons.iCloud, top: '10%', right: '20%', delay: '1.2s' },
  { name: 'Deezer', color: 'black', txtColor: 'white', icon: Icons.Deezer, border: true,  bottom: '40%', left: '30%', delay: '1.8s' },
  { name: 'SFR', color: '#E2001A', txtColor: 'white', icon: Icons.SFR, top: '65%', right: '25%', delay: '2.2s' },
];


export function BackgroundLogos() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
            {logos.map((logo, index) => {
                const Icon = logo.icon;
                return (
                <div 
                    key={index}
                    className="absolute rounded-full shadow-2xl flex items-center justify-center px-5 py-2.5 font-black tracking-tighter transform animate-float opacity-40 hover:opacity-100 transition-opacity duration-700 blur-[0.5px] cursor-default gap-2"
                    style={{
                        backgroundColor: logo.color,
                        color: logo.txtColor,
                        top: logo.top,
                        left: logo.left,
                        right: logo.right,
                        bottom: logo.bottom,
                        border: logo.border ? '1px solid #333' : 'none',
                        animationDelay: logo.delay,
                        zIndex: 0,
                        fontSize: '1.1rem'
                    }}
                >
                    <Icon className="w-5 h-5" />
                    <span>{logo.name}</span>
                </div>
            )})}
            {/* Overlay gradient to fade them out near center/text */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />
        </div>
    )
}


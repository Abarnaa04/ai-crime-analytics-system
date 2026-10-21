import React from 'react';
import { AvatarConfig } from '../types';

export const DEFAULT_AVATAR: AvatarConfig = {
  skinTone: '#ffd1b3',
  hairStyle: 'short',
  hairColor: '#2b1d0c',
  outfit: 'tactical',
  outfitColor: '#1e3a8a',
  accessory: 'badge',
  expression: 'friendly',
};

export const AVATAR_OPTIONS = {
  skinTones: [
    { label: 'Light', value: '#ffe0bd' },
    { label: 'Fair', value: '#ffd1b3' },
    { label: 'Warm Tan', value: '#d19c72' },
    { label: 'Caramel', value: '#a56844' },
    { label: 'Deep', value: '#5c3826' },
  ],
  hairStyles: [
    { label: 'Short Crop', value: 'short' },
    { label: 'Crew Cut', value: 'crew' },
    { label: 'Wavy Style', value: 'wavy' },
    { label: 'Ponytail', value: 'ponytail' },
    { label: 'Curly', value: 'curly' },
    { label: 'Buzz Cut', value: 'buzz' },
  ] as const,
  hairColors: [
    { label: 'Midnight Black', value: '#1a1a1a' },
    { label: 'Deep Brown', value: '#4a2c11' },
    { label: 'Golden Blonde', value: '#e6be8a' },
    { label: 'Auburn Red', value: '#8b3114' },
    { label: 'Silver Gray', value: '#94a3b8' },
  ],
  outfits: [
    { label: 'Tactical Jacket', value: 'tactical' },
    { label: 'Street Hoodie', value: 'hoodie' },
    { label: 'Leather Jacket', value: 'leather' },
    { label: 'Safety Vest', value: 'vest' },
    { label: 'Analyst Blazer', value: 'blazer' },
    { label: 'Casual Polo', value: 'casual' },
  ] as const,
  outfitColors: [
    { label: 'Navy Blue', value: '#1e3a8a' },
    { label: 'Tactical Slate', value: '#334155' },
    { label: 'Deep Emerald', value: '#0f766e' },
    { label: 'Crimson Red', value: '#991b1b' },
    { label: 'Royal Violet', value: '#6b21a8' },
    { label: 'High-Vis Amber', value: '#d97706' },
  ],
  accessories: [
    { label: 'Gold Badge', value: 'badge' },
    { label: 'Aviators', value: 'sunglasses' },
    { label: 'Glasses', value: 'glasses' },
    { label: 'Officer Cap', value: 'cap' },
    { label: 'Radio Headset', value: 'headset' },
    { label: 'None', value: 'none' },
  ] as const,
};

// Generates an SVG string representation of the cartoon avatar for Leaflet divIcon
export function getAvatarSvgString(config: AvatarConfig = DEFAULT_AVATAR, size = 64): string {
  const { skinTone, hairStyle, hairColor, outfit, outfitColor, accessory } = config;

  // Hair paths
  let hairSvg = '';
  if (hairStyle === 'short') {
    hairSvg = `<path d="M 28 32 C 26 16, 42 12, 50 12 C 60 12, 74 16, 72 32 C 66 22, 56 22, 50 22 C 44 22, 34 22, 28 32 Z" fill="${hairColor}" />`;
  } else if (hairStyle === 'crew') {
    hairSvg = `<path d="M 30 30 C 30 16, 42 15, 50 15 C 58 15, 70 16, 70 30 C 64 25, 56 25, 50 25 C 44 25, 36 25, 30 30 Z" fill="${hairColor}" />`;
  } else if (hairStyle === 'wavy') {
    hairSvg = `
      <path d="M 26 36 C 24 16, 42 10, 50 10 C 60 10, 76 16, 74 36 C 76 46, 72 54, 70 60 C 67 48, 70 30, 68 25 C 60 22, 50 22, 40 25 C 34 30, 33 48, 30 60 C 28 54, 24 46, 26 36 Z" fill="${hairColor}" />
    `;
  } else if (hairStyle === 'ponytail') {
    hairSvg = `
      <path d="M 28 32 C 26 16, 42 12, 50 12 C 60 12, 74 16, 72 32 C 66 24, 56 24, 50 24 C 44 24, 34 24, 28 32 Z" fill="${hairColor}" />
      <path d="M 68 28 C 76 25, 84 32, 82 46 C 80 54, 74 58, 72 52 C 70 42, 74 34, 68 28 Z" fill="${hairColor}" />
      <circle cx="69" cy="30" r="3" fill="#ef4444" />
    `;
  } else if (hairStyle === 'curly') {
    hairSvg = `
      <circle cx="34" cy="24" r="8" fill="${hairColor}" />
      <circle cx="44" cy="18" r="8" fill="${hairColor}" />
      <circle cx="56" cy="18" r="8" fill="${hairColor}" />
      <circle cx="66" cy="24" r="8" fill="${hairColor}" />
      <circle cx="28" cy="32" r="7" fill="${hairColor}" />
      <circle cx="72" cy="32" r="7" fill="${hairColor}" />
    `;
  } else if (hairStyle === 'buzz') {
    hairSvg = `<path d="M 32 30 C 32 19, 42 18, 50 18 C 58 18, 68 19, 68 30 Z" fill="${hairColor}" opacity="0.6" />`;
  }

  // Accessories
  let accSvg = '';
  if (accessory === 'sunglasses') {
    accSvg = `
      <rect x="33" y="38" width="14" height="9" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2" />
      <rect x="53" y="38" width="14" height="9" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2" />
      <line x1="47" y1="42" x2="53" y2="42" stroke="#38bdf8" stroke-width="1.5" />
    `;
  } else if (accessory === 'glasses') {
    accSvg = `
      <rect x="33" y="38" width="13" height="9" rx="2" fill="none" stroke="#e2e8f0" stroke-width="1.5" />
      <rect x="54" y="38" width="13" height="9" rx="2" fill="none" stroke="#e2e8f0" stroke-width="1.5" />
      <line x1="46" y1="42" x2="54" y2="42" stroke="#e2e8f0" stroke-width="1.5" />
    `;
  } else if (accessory === 'cap') {
    accSvg = `
      <path d="M 26 26 C 26 14, 42 12, 50 12 C 58 12, 74 14, 74 26 Z" fill="#0f172a" />
      <path d="M 22 26 Q 50 20 78 26 L 82 29 Q 50 24 18 29 Z" fill="#1e293b" stroke="#eab308" stroke-width="1" />
      <circle cx="50" cy="20" r="3" fill="#eab308" />
    `;
  } else if (accessory === 'headset') {
    accSvg = `
      <path d="M 25 42 A 25 25 0 0 1 75 42" fill="none" stroke="#334155" stroke-width="3" />
      <rect x="22" y="38" width="6" height="10" rx="3" fill="#0f172a" />
      <rect x="72" y="38" width="6" height="10" rx="3" fill="#0f172a" />
      <path d="M 74 46 Q 66 56 56 54" fill="none" stroke="#0f172a" stroke-width="1.8" />
      <circle cx="55" cy="54" r="2.5" fill="#38bdf8" />
    `;
  } else if (accessory === 'badge') {
    accSvg = `
      <polygon points="50,68 53,74 47,74" fill="#eab308" stroke="#ca8a04" stroke-width="0.8" />
      <circle cx="50" cy="71" r="1.5" fill="#fef08a" />
    `;
  }

  // Outfit body
  let outfitSvg = '';
  if (outfit === 'tactical' || outfit === 'vest') {
    outfitSvg = `
      <path d="M 30 68 C 30 62, 40 58, 50 58 C 60 58, 70 62, 70 68 L 78 94 L 22 94 Z" fill="${outfitColor}" />
      <rect x="48" y="58" width="4" height="36" fill="#0f172a" opacity="0.4" />
      ${outfit === 'vest' ? '<rect x="26" y="74" width="48" height="6" fill="#facc15" opacity="0.9" />' : ''}
    `;
  } else if (outfit === 'hoodie') {
    outfitSvg = `
      <path d="M 28 66 C 28 60, 40 56, 50 56 C 60 56, 72 60, 72 66 L 80 94 L 20 94 Z" fill="${outfitColor}" />
      <path d="M 46 66 L 46 76 M 54 66 L 54 76" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
    `;
  } else {
    outfitSvg = `
      <path d="M 30 68 C 30 62, 40 58, 50 58 C 60 58, 70 62, 70 68 L 78 94 L 22 94 Z" fill="${outfitColor}" />
      <polygon points="45,58 55,58 50,66" fill="#ffffff" />
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
      <!-- Body & Neck -->
      ${outfitSvg}
      <rect x="44" y="52" width="12" height="10" rx="2" fill="${skinTone}" />
      
      <!-- Head Base -->
      <circle cx="50" cy="42" r="18" fill="${skinTone}" />
      
      <!-- Hair back/front -->
      ${hairSvg}
      
      <!-- Eyes & Cheeks -->
      <circle cx="43" cy="42" r="2.4" fill="#0f172a" />
      <circle cx="44" cy="41" r="0.8" fill="#ffffff" />
      <circle cx="57" cy="42" r="2.4" fill="#0f172a" />
      <circle cx="58" cy="41" r="0.8" fill="#ffffff" />
      <circle cx="38" cy="46" r="2" fill="#f43f5e" opacity="0.4" />
      <circle cx="62" cy="46" r="2" fill="#f43f5e" opacity="0.4" />
      
      <!-- Eyebrows -->
      <path d="M 40 37 Q 43 35 46 37" fill="none" stroke="${hairColor}" stroke-width="1.2" stroke-linecap="round" />
      <path d="M 54 37 Q 57 35 60 37" fill="none" stroke="${hairColor}" stroke-width="1.2" stroke-linecap="round" />
      
      <!-- Smile -->
      <path d="M 46 48 Q 50 52 54 48" fill="none" stroke="#881337" stroke-width="1.5" stroke-linecap="round" />
      
      <!-- Accessory -->
      ${accSvg}
    </svg>
  `;
}

interface BitmojiAvatarProps {
  config?: AvatarConfig;
  size?: number;
  className?: string;
  showStand?: boolean;
}

export const BitmojiAvatar: React.FC<BitmojiAvatarProps> = ({
  config = DEFAULT_AVATAR,
  size = 64,
  className = '',
  showStand = false,
}) => {
  const svgHtml = getAvatarSvgString(config, size);

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      <div 
        dangerouslySetInnerHTML={{ __html: svgHtml }}
        className="transition-transform duration-200 hover:scale-105"
      />
      {showStand && (
        <div className="w-8 h-2 bg-slate-900/80 border border-blue-500/50 rounded-full blur-[1px] -mt-1 shadow-md shadow-blue-500/20" />
      )}
    </div>
  );
};

/**
 * Icônes SVG pour l'éditeur Wiki
 * Style catholique médiéval inspiré des enluminures
 */

export const Icons = {
  H1: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect x="10" y="15" width="80" height="70" rx="3" fill="#f4e4c1" stroke="#8b6f47" strokeWidth="2"/>
      <path d="M15 20 L85 20 M15 80 L85 80" stroke="#c9a961" strokeWidth="1.5"/>
      <path d="M25 35 L25 65 M25 50 L40 50 M40 35 L40 65" stroke="#8b6f47" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="65" cy="42" r="12" fill="#c9a961" fillOpacity="0.3"/>
      <path d="M60 40 L65 35 L65 60" stroke="#8b6f47" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M58 60 L72 60" stroke="#8b6f47" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="65" cy="42" r="16" stroke="#c9a961" strokeWidth="1" fill="none" fillOpacity="0.5"/>
      <path d="M65 26 L67 30 M65 26 L63 30" stroke="#c9a961" strokeWidth="1.5"/>
    </svg>
  ),

  H2: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect x="10" y="15" width="80" height="70" rx="3" fill="#f4e4c1" stroke="#8b6f47" strokeWidth="2"/>
      <path d="M15 20 L85 20 M15 80 L85 80" stroke="#c9a961" strokeWidth="1.5"/>
      <path d="M23 35 L23 65 M23 50 L38 50 M38 35 L38 65" stroke="#8b6f47" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="66" cy="45" r="13" fill="#c9a961" fillOpacity="0.2"/>
      <path d="M58 40 Q68 35 68 42 Q68 48 58 53 L73 53" stroke="#8b6f47" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <circle cx="52" cy="38" r="2" fill="#c9a961"/>
      <circle cx="75" cy="40" r="1.5" fill="#c9a961"/>
      <path d="M52 38 Q55 35 58 40" stroke="#c9a961" strokeWidth="1" fill="none"/>
    </svg>
  ),

  H3: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect x="10" y="15" width="80" height="70" rx="3" fill="#f4e4c1" stroke="#8b6f47" strokeWidth="2"/>
      <path d="M15 20 L85 20 M15 80 L85 80" stroke="#c9a961" strokeWidth="1.5"/>
      <path d="M23 35 L23 65 M23 50 L38 50 M38 35 L38 65" stroke="#8b6f47" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="65" cy="45" r="14" fill="#c9a961" fillOpacity="0.15"/>
      <path d="M58 38 Q68 38 68 44 Q68 47 63 47 M63 47 Q72 47 72 54 Q72 58 60 58" stroke="#8b6f47" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M75 38 L78 38 M75 58 L78 58" stroke="#c9a961" strokeWidth="1.5"/>
      <circle cx="80" cy="48" r="1.5" fill="#c9a961"/>
    </svg>
  ),

  Bold: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect x="15" y="20" width="70" height="60" rx="4" fill="#f4e4c1" stroke="#8b6f47" strokeWidth="2"/>
      <rect x="18" y="23" width="64" height="54" rx="2" fill="none" stroke="#c9a961" strokeWidth="1"/>
      <path d="M35 35 L35 65 M35 35 L48 35 Q55 35 55 42 Q55 47 48 50 L35 50 M35 50 L50 50 Q58 50 58 57 Q58 65 50 65 L35 65" fill="#8b6f47"/>
      <circle cx="25" cy="28" r="2" fill="#c9a961"/>
      <circle cx="75" cy="28" r="2" fill="#c9a961"/>
      <circle cx="25" cy="72" r="2" fill="#c9a961"/>
      <circle cx="75" cy="72" r="2" fill="#c9a961"/>
    </svg>
  ),

  Italic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect x="15" y="20" width="70" height="60" rx="4" fill="#f4e4c1" stroke="#8b6f47" strokeWidth="2"/>
      <path d="M20 25 L80 25 M20 75 L80 75" stroke="#c9a961" strokeWidth="1"/>
      <path d="M45 35 L60 35" stroke="#8b6f47" strokeWidth="3" strokeLinecap="round"/>
      <path d="M55 35 L45 65" stroke="#8b6f47" strokeWidth="4" strokeLinecap="round"/>
      <path d="M40 65 L55 65" stroke="#8b6f47" strokeWidth="3" strokeLinecap="round"/>
      <path d="M62 32 Q68 28 70 35 L68 40" stroke="#c9a961" strokeWidth="1.5" fill="none"/>
      <path d="M68 32 L70 35 L67 36" fill="#c9a961"/>
    </svg>
  ),

  BulletList: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect x="12" y="18" width="76" height="64" rx="3" fill="#f4e4c1" stroke="#8b6f47" strokeWidth="2"/>
      <g transform="translate(22, 32)">
        <path d="M0 -3 L0 3 M-3 0 L3 0" stroke="#c9a961" strokeWidth="2"/>
      </g>
      <g transform="translate(22, 50)">
        <path d="M0 -3 L0 3 M-3 0 L3 0" stroke="#c9a961" strokeWidth="2"/>
      </g>
      <g transform="translate(22, 68)">
        <path d="M0 -3 L0 3 M-3 0 L3 0" stroke="#c9a961" strokeWidth="2"/>
      </g>
      <path d="M32 32 L75 32 M32 50 L75 50 M32 68 L75 68" stroke="#8b6f47" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="78" cy="32" r="1.5" fill="#c9a961"/>
      <circle cx="78" cy="50" r="1.5" fill="#c9a961"/>
      <circle cx="78" cy="68" r="1.5" fill="#c9a961"/>
    </svg>
  ),

  OrderedList: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect x="12" y="18" width="76" height="64" rx="3" fill="#f4e4c1" stroke="#8b6f47" strokeWidth="2"/>
      <text x="22" y="35" fontFamily="serif" fontSize="12" fill="#8b6f47" fontWeight="bold">I</text>
      <text x="20" y="53" fontFamily="serif" fontSize="12" fill="#8b6f47" fontWeight="bold">II</text>
      <text x="18" y="71" fontFamily="serif" fontSize="12" fill="#8b6f47" fontWeight="bold">III</text>
      <path d="M32 32 L75 32 M32 50 L75 50 M32 68 L75 68" stroke="#8b6f47" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="30" cy="32" r="1.5" fill="#c9a961"/>
      <circle cx="30" cy="50" r="1.5" fill="#c9a961"/>
      <circle cx="30" cy="68" r="1.5" fill="#c9a961"/>
    </svg>
  ),

  Verse: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="75" rx="38" ry="8" fill="#8b6f47" fillOpacity="0.2"/>
      <path d="M20 25 Q18 25 18 27 L18 73 Q18 75 20 75 L48 75 L48 25 Z" fill="#8b6f47"/>
      <rect x="20" y="28" width="26" height="44" fill="#c9a961" fillOpacity="0.3"/>
      <path d="M80 25 Q82 25 82 27 L82 73 Q82 75 80 75 L52 75 L52 25 Z" fill="#8b6f47"/>
      <rect x="54" y="28" width="26" height="44" fill="#c9a961" fillOpacity="0.3"/>
      <path d="M33 42 L33 58 M26 50 L40 50" stroke="#f4e4c1" strokeWidth="2.5"/>
      <path d="M49 26 L49 74 M50 26 L50 74 M51 26 L51 74" stroke="#f4e4c1" strokeWidth="0.5"/>
      <path d="M58 35 L72 35 M58 40 L72 40 M58 45 L68 45" stroke="#8b6f47" strokeWidth="1"/>
      <circle cx="68" cy="55" r="8" fill="#c9a961" fillOpacity="0.3"/>
      <path d="M68 50 L68 60 M63 55 L73 55" stroke="#c9a961" strokeWidth="1.5"/>
    </svg>
  ),

  // Lien Wiki - Croix stylisée avec lien
  WikiLink: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect x="10" y="15" width="80" height="70" rx="3" fill="#f4e4c1" stroke="#8b6f47" strokeWidth="2"/>
      <path d="M15 20 L85 20 M15 80 L85 80" stroke="#c9a961" strokeWidth="1.5"/>
      {/* Croix stylisée */}
      <path d="M35 40 L35 60 M28 50 L42 50" stroke="#c9a961" strokeWidth="3" strokeLinecap="round"/>
      {/* Lien chaînet */}
      <ellipse cx="65" cy="45" rx="12" ry="8" fill="none" stroke="#8b6f47" strokeWidth="2.5"/>
      <ellipse cx="75" cy="55" rx="12" ry="8" fill="none" stroke="#8b6f47" strokeWidth="2.5"/>
      <circle cx="70" cy="50" r="2" fill="#c9a961"/>
    </svg>
  ),
};

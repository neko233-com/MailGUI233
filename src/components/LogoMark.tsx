export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 64 64" role="img" aria-label="MailGUI233 logo">
      <defs>
        <linearGradient id="logo-shell" x1="10" x2="54" y1="7" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.56" stopColor="#eaf6fb" />
          <stop offset="1" stopColor="#8ecde1" />
        </linearGradient>
        <linearGradient id="logo-envelope" x1="15" x2="49" y1="18" y2="47" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f8fcff" />
          <stop offset="1" stopColor="#d7edf5" />
        </linearGradient>
        <filter id="logo-soft-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4b7482" floodOpacity="0.18" />
        </filter>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#logo-shell)" />
      <rect x="3.5" y="3.5" width="57" height="57" rx="12" fill="none" stroke="#ffffff" strokeOpacity="0.66" />
      <path
        d="M14 23.2c0-3 2.4-5.2 5.4-5.2h25.2c3 0 5.4 2.3 5.4 5.2v18.6c0 2.9-2.4 5.2-5.4 5.2H19.4c-3 0-5.4-2.3-5.4-5.2V23.2Z"
        fill="url(#logo-envelope)"
        filter="url(#logo-soft-shadow)"
      />
      <path d="m17 22 15 13.1L47 22" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.2" />
      <path d="m17 22 15 13.1L47 22" fill="none" stroke="#4dabca" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.72" strokeWidth="2" />
      <path d="m17.5 43.4 12-11.2M46.5 43.4 34.5 32.2" fill="none" stroke="#5f9fb4" strokeOpacity="0.42" strokeWidth="2.5" />
      <rect x="22.5" y="38.6" width="19" height="10.5" rx="5.25" fill="#ffffff" fillOpacity="0.92" />
      <rect x="22.5" y="38.6" width="19" height="10.5" rx="5.25" fill="none" stroke="#8ccfe3" strokeOpacity="0.44" />
      <text x="32" y="46.55" fill="#0f83ad" fontFamily="Inter, system-ui, sans-serif" fontSize="8.1" fontWeight="880" textAnchor="middle">
        233
      </text>
      <path d="M16 18.5h32" stroke="#ffffff" strokeLinecap="round" strokeOpacity="0.68" />
    </svg>
  );
}

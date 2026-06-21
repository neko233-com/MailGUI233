export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 64 64" role="img" aria-label="MailGUI233 logo">
      <defs>
        <linearGradient id="logo-shell" x1="12" x2="54" y1="8" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.48" stopColor="#dce8ee" />
          <stop offset="1" stopColor="#101820" />
        </linearGradient>
        <linearGradient id="logo-flap" x1="11" x2="53" y1="17" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f8fcff" />
          <stop offset="1" stopColor="#8fd7de" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#logo-shell)" />
      <path
        d="M13 22.5C13 19.5 15.5 17 18.6 17h26.8c3.1 0 5.6 2.5 5.6 5.5v19c0 3-2.5 5.5-5.6 5.5H18.6A5.55 5.55 0 0 1 13 41.5v-19Z"
        fill="#f8fbfc"
        opacity="0.94"
      />
      <path d="m16 21 15.9 14.2L48 21" fill="none" stroke="url(#logo-flap)" strokeLinecap="round" strokeWidth="4" />
      <path d="m16 44 13.3-13M48 44 34.6 31" fill="none" stroke="#1f3a40" strokeOpacity="0.18" strokeWidth="3" />
      <text x="32" y="43" fill="#0f181d" fontFamily="Inter, system-ui, sans-serif" fontSize="12" fontWeight="900" textAnchor="middle">
        233
      </text>
      <path d="M18 18.5h28" stroke="#ffffff" strokeLinecap="round" strokeOpacity="0.72" />
    </svg>
  );
}

export function SmartDealerLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="10" fill="url(#logoGrad)" />
      {/* Speedometer arc — background */}
      <path
        d="M10 30 A14 14 0 0 1 34 30"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Speedometer arc — active portion */}
      <path
        d="M10 30 A14 14 0 0 1 29.9 20.0"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Needle */}
      <line x1="22" y1="30" x2="27.5" y2="18.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Needle pivot */}
      <circle cx="22" cy="30" r="2.5" fill="white" />
      {/* Tick marks */}
      <line x1="10" y1="30" x2="12.2" y2="30" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.5" y1="23.5" x2="13.4" y2="24.6" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="16" x2="22" y2="18.2" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32.5" y1="23.5" x2="30.6" y2="24.6" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="30" x2="31.8" y2="30" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bottom bar accent */}
      <rect x="17" y="33" width="10" height="2.5" rx="1.25" fill="rgba(255,255,255,0.12)" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0044c8" />
          <stop offset="100%" stopColor="#001a52" />
        </linearGradient>
      </defs>
    </svg>
  )
}

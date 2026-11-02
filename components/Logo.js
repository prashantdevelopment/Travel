// Road badge mark: a taxi roof sign on a badge, with the road climbing into the hills.
export function LogoMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" aria-hidden="true" focusable="false">
      <path fill="var(--accent)" d="M98 52 L106 22 Q107 16 113 16 H143 Q149 16 150 22 L158 52 Z" />
      <rect x="32" y="52" width="192" height="188" rx="44" fill="#0F2A44" />
      <path
        fill="#fff"
        d="M84 240 L118 140 Q124 120 146 112 L196 96 L200 108 L156 124 Q142 130 140 144 L172 240 Z"
      />
      <path fill="none" stroke="var(--accent)" strokeWidth="5" strokeDasharray="14 12" d="M128 236 L130 150" />
    </svg>
  );
}

export default function Logo() {
  return (
    <a href="/" className="logo" aria-label="Dhruv Fine Trip, home">
      <LogoMark />
      <span className="logo-text">
        <span className="logo-name">Dhruv Fine Trip</span>
        <span className="logo-tag">Taxi &amp; Tours</span>
      </span>
    </a>
  );
}

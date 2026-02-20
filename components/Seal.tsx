export function Seal() {
  return (
    <svg
      className="seal"
      viewBox="0 0 240 240"
      role="img"
      aria-label="Seal of The Country Factbook Reference Edition 2026"
    >
      <circle cx="120" cy="120" r="114" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="120" cy="120" r="102" fill="none" stroke="currentColor" strokeWidth="1.5" />

      <circle cx="120" cy="120" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="120" cy="120" rx="20" ry="48" fill="none" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="120" cy="120" rx="36" ry="48" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="72" y1="120" x2="168" y2="120" stroke="currentColor" strokeWidth="1" />
      <path d="M76 102c14 6 74 6 88 0" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M76 138c14-6 74-6 88 0" fill="none" stroke="currentColor" strokeWidth="1" />

      <defs>
        <path id="topTextPath" d="M 30 120 A 90 90 0 0 1 210 120" />
        <path id="bottomTextPath" d="M 210 120 A 90 90 0 0 1 30 120" />
      </defs>
      <text fontSize="11" letterSpacing="2" textAnchor="middle">
        <textPath href="#topTextPath" startOffset="50%">THE COUNTRY FACTBOOK</textPath>
      </text>
      <text fontSize="9" letterSpacing="1.6" textAnchor="middle">
        <textPath href="#bottomTextPath" startOffset="50%">REFERENCE EDITION 2026</textPath>
      </text>
    </svg>
  );
}

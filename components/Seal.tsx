export function Seal() {
  return (
    <svg
      className="seal"
      viewBox="0 0 240 240"
      role="img"
      aria-label="Seal of The World Factbook Reference Edition 2026"
    >
      {/* Outer rings */}
      <circle cx="120" cy="120" r="116" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="120" cy="120" r="108" fill="none" stroke="currentColor" strokeWidth="0.75" />

      {/* Laurel wreath — left branch */}
      <g opacity="0.9">
        <ellipse cx="72" cy="155" rx="6" ry="14" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-20, 72, 155)" />
        <ellipse cx="62" cy="142" rx="5.5" ry="13" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-35, 62, 142)" />
        <ellipse cx="55" cy="126" rx="5" ry="12" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-50, 55, 126)" />
        <ellipse cx="53" cy="108" rx="5" ry="11" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-65, 53, 108)" />
        <ellipse cx="56" cy="90" rx="5" ry="11" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-80, 56, 90)" />
        <ellipse cx="63" cy="76" rx="5" ry="10" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-95, 63, 76)" />
        {/* Stem */}
        <path d="M80 168 Q55 130 70 65" fill="none" stroke="currentColor" strokeWidth="1" />
      </g>

      {/* Laurel wreath — right branch (mirrored) */}
      <g opacity="0.9">
        <ellipse cx="168" cy="155" rx="6" ry="14" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(20, 168, 155)" />
        <ellipse cx="178" cy="142" rx="5.5" ry="13" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(35, 178, 142)" />
        <ellipse cx="185" cy="126" rx="5" ry="12" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(50, 185, 126)" />
        <ellipse cx="187" cy="108" rx="5" ry="11" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(65, 187, 108)" />
        <ellipse cx="184" cy="90" rx="5" ry="11" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(80, 184, 90)" />
        <ellipse cx="177" cy="76" rx="5" ry="10" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(95, 177, 76)" />
        {/* Stem */}
        <path d="M160 168 Q185 130 170 65" fill="none" stroke="currentColor" strokeWidth="1" />
      </g>

      {/* Center globe */}
      <circle cx="120" cy="115" r="32" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="120" cy="115" rx="14" ry="32" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <ellipse cx="120" cy="115" rx="25" ry="32" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <line x1="88" y1="115" x2="152" y2="115" stroke="currentColor" strokeWidth="0.8" />
      <path d="M91 102c10 4 48 4 58 0" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M91 128c10-4 48-4 58 0" fill="none" stroke="currentColor" strokeWidth="0.8" />

      {/* Text on circular paths */}
      <defs>
        <path id="topArc" d="M 34 120 A 86 86 0 0 1 206 120" />
        <path id="bottomArc" d="M 206 125 A 86 86 0 0 1 34 125" />
      </defs>
      <text fontSize="10" fontWeight="600" letterSpacing="3.5" textAnchor="middle" fontFamily="Inter, Helvetica, sans-serif">
        <textPath href="#topArc" startOffset="50%">THE WORLD FACTBOOK</textPath>
      </text>
      <text fontSize="8" fontWeight="500" letterSpacing="2.5" textAnchor="middle" fontFamily="Inter, Helvetica, sans-serif">
        <textPath href="#bottomArc" startOffset="50%">REFERENCE EDITION 2026</textPath>
      </text>
    </svg>
  );
}

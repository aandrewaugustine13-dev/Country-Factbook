/**
 * Stylized UN-emblem–inspired globe.
 * Graphic / logo-like treatment: azimuthal grid, abstract landmasses, olive wreath.
 * Not a photorealistic globe — mid-century institutional mark updated for 2026.
 */
export function InstitutionalGlobe({
  className = '',
  variant = 'hero',
}: {
  className?: string;
  /** hero = light strokes on dark; mark = dark strokes on light */
  variant?: 'hero' | 'mark';
}) {
  const stroke = variant === 'hero' ? 'currentColor' : 'currentColor';
  const land = variant === 'hero' ? 'currentColor' : 'currentColor';

  return (
    <svg
      className={`institutional-globe institutional-globe--${variant} ${className}`}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <title>World emblem</title>

      {/* Outer institutional rings */}
      <circle cx="120" cy="112" r="78" stroke={stroke} strokeWidth="1.25" opacity="0.35" />
      <circle cx="120" cy="112" r="72" stroke={stroke} strokeWidth="2.25" />

      {/* Azimuthal latitude rings */}
      <circle cx="120" cy="112" r="54" stroke={stroke} strokeWidth="1" opacity="0.55" />
      <circle cx="120" cy="112" r="36" stroke={stroke} strokeWidth="1" opacity="0.55" />
      <circle cx="120" cy="112" r="18" stroke={stroke} strokeWidth="1" opacity="0.45" />

      {/* Longitude arcs (simplified globe net) */}
      <ellipse cx="120" cy="112" rx="24" ry="72" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <ellipse cx="120" cy="112" rx="48" ry="72" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line
        x1="120"
        y1="40"
        x2="120"
        y2="184"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.55"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="112"
        x2="192"
        y2="112"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.55"
        strokeLinecap="round"
      />
      {/* Tilted meridians for depth */}
      <path
        d="M72 52 C92 78, 92 146, 72 172"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M168 52 C148 78, 148 146, 168 172"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Abstract landmasses — simplified continents, emblem style */}
      <g fill={land} opacity={variant === 'hero' ? 0.88 : 0.9}>
        {/* Americas (left) */}
        <path d="M78 78 C84 70, 94 68, 100 74 C104 80, 102 90, 98 98 C94 108, 90 118, 88 128 C86 136, 82 140, 78 136 C74 130, 76 118, 78 108 C80 96, 74 86, 78 78 Z" />
        {/* South America */}
        <path d="M92 130 C98 128, 104 134, 106 144 C108 154, 104 164, 98 168 C92 170, 88 164, 88 154 C88 144, 88 134, 92 130 Z" />
        {/* Europe / Africa */}
        <path d="M118 70 C128 66, 138 72, 140 82 C142 90, 136 96, 130 98 C134 108, 136 122, 132 134 C128 146, 122 152, 116 148 C112 140, 114 128, 116 116 C118 104, 114 90, 116 80 C116 76, 116 72, 118 70 Z" />
        {/* Asia */}
        <path d="M142 76 C156 70, 170 76, 174 90 C178 102, 172 112, 164 116 C158 120, 154 128, 150 134 C146 128, 148 118, 150 110 C146 104, 140 96, 138 88 C136 80, 138 78, 142 76 Z" />
        {/* Australia */}
        <path d="M158 142 C168 140, 176 146, 176 154 C176 160, 168 164, 160 162 C154 160, 152 152, 154 146 C154 144, 156 142, 158 142 Z" />
      </g>

      {/* Olive wreath — left */}
      <g
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      >
        <path d="M56 150 C42 128, 40 98, 52 72 C58 60, 68 50, 80 44" />
        <path d="M58 142 C50 136, 48 126, 52 118" />
        <path d="M52 120 C44 114, 42 104, 46 96" />
        <path d="M48 98 C40 92, 40 82, 46 74" />
        <path d="M50 76 C44 70, 46 60, 54 56" />
        <path d="M58 58 C54 52, 56 44, 64 42" />
        {/* Leaf fills */}
        <path
          d="M56 138 C48 132, 48 124, 54 120 C60 126, 60 134, 56 138 Z"
          fill={land}
          stroke="none"
          opacity="0.75"
        />
        <path
          d="M50 116 C42 110, 42 102, 48 98 C54 104, 54 112, 50 116 Z"
          fill={land}
          stroke="none"
          opacity="0.75"
        />
        <path
          d="M48 94 C40 88, 40 80, 46 76 C52 82, 52 90, 48 94 Z"
          fill={land}
          stroke="none"
          opacity="0.75"
        />
        <path
          d="M52 72 C46 66, 48 58, 54 56 C58 62, 56 70, 52 72 Z"
          fill={land}
          stroke="none"
          opacity="0.75"
        />
      </g>

      {/* Olive wreath — right */}
      <g
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      >
        <path d="M184 150 C198 128, 200 98, 188 72 C182 60, 172 50, 160 44" />
        <path d="M182 142 C190 136, 192 126, 188 118" />
        <path d="M188 120 C196 114, 198 104, 194 96" />
        <path d="M192 98 C200 92, 200 82, 194 74" />
        <path d="M190 76 C196 70, 194 60, 186 56" />
        <path d="M182 58 C186 52, 184 44, 176 42" />
        <path
          d="M184 138 C192 132, 192 124, 186 120 C180 126, 180 134, 184 138 Z"
          fill={land}
          stroke="none"
          opacity="0.75"
        />
        <path
          d="M190 116 C198 110, 198 102, 192 98 C186 104, 186 112, 190 116 Z"
          fill={land}
          stroke="none"
          opacity="0.75"
        />
        <path
          d="M192 94 C200 88, 200 80, 194 76 C188 82, 188 90, 192 94 Z"
          fill={land}
          stroke="none"
          opacity="0.75"
        />
        <path
          d="M188 72 C194 66, 192 58, 186 56 C182 62, 184 70, 188 72 Z"
          fill={land}
          stroke="none"
          opacity="0.75"
        />
      </g>

      {/* Base ribbon / institutional bar */}
      <path
        d="M78 196 H162"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M88 202 H152"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

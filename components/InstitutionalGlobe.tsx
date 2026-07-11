/**
 * Stylized UN-emblem globe — iconic, graphic, mid-century institutional.
 * Hero variant uses gold land on cream strokes for stronger presence.
 */
export function InstitutionalGlobe({
  className = '',
  variant = 'hero',
}: {
  className?: string;
  variant?: 'hero' | 'mark';
}) {
  const isHero = variant === 'hero';

  // Hero: cream grid + gold continents (classic UN palette vibe)
  // Mark: navy monochrome for header
  const stroke = isHero ? '#F0E6C8' : 'currentColor';
  const land = isHero ? '#E8C96A' : 'currentColor';
  const wreath = isHero ? '#C9A84C' : 'currentColor';

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

      {/* Soft disc behind globe */}
      {isHero && (
        <circle cx="120" cy="108" r="82" fill="rgba(10, 34, 56, 0.35)" />
      )}

      {/* Outer rings — double seal */}
      <circle cx="120" cy="108" r="80" stroke={stroke} strokeWidth="1" opacity="0.25" />
      <circle cx="120" cy="108" r="74" stroke={stroke} strokeWidth="2.5" opacity="0.9" />
      <circle cx="120" cy="108" r="70" stroke={stroke} strokeWidth="1" opacity="0.35" />

      {/* Latitude rings */}
      <circle cx="120" cy="108" r="52" stroke={stroke} strokeWidth="1.1" opacity="0.5" />
      <circle cx="120" cy="108" r="34" stroke={stroke} strokeWidth="1.1" opacity="0.5" />
      <circle cx="120" cy="108" r="16" stroke={stroke} strokeWidth="1" opacity="0.4" />

      {/* Meridians */}
      <ellipse cx="120" cy="108" rx="22" ry="70" stroke={stroke} strokeWidth="1.1" opacity="0.45" />
      <ellipse cx="120" cy="108" rx="46" ry="70" stroke={stroke} strokeWidth="1.1" opacity="0.45" />
      <line
        x1="120"
        y1="38"
        x2="120"
        y2="178"
        stroke={stroke}
        strokeWidth="1.15"
        opacity="0.55"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="108"
        x2="190"
        y2="108"
        stroke={stroke}
        strokeWidth="1.15"
        opacity="0.55"
        strokeLinecap="round"
      />
      <path
        d="M74 50 C94 76, 94 140, 74 166"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M166 50 C146 76, 146 140, 166 166"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />

      {/* Continents — bold emblem shapes */}
      <g fill={land} opacity={isHero ? 0.95 : 0.9}>
        <path d="M76 74 C84 66, 96 64, 102 72 C106 80, 104 90, 100 100 C96 112, 90 122, 88 132 C86 140, 82 144, 78 140 C74 132, 76 118, 78 108 C80 96, 72 84, 76 74 Z" />
        <path d="M90 128 C98 126, 106 134, 108 146 C110 158, 104 168, 98 170 C90 172, 86 164, 86 152 C86 140, 86 132, 90 128 Z" />
        <path d="M116 66 C128 62, 140 68, 142 80 C144 90, 136 98, 130 100 C134 112, 136 128, 132 140 C128 152, 120 156, 116 150 C112 140, 114 126, 116 114 C118 100, 112 86, 114 76 C114 70, 114 68, 116 66 Z" />
        <path d="M140 72 C156 66, 172 72, 176 88 C180 102, 172 114, 164 118 C158 122, 154 132, 150 138 C146 130, 148 118, 150 110 C146 102, 138 94, 136 86 C134 78, 136 74, 140 72 Z" />
        <path d="M156 140 C168 138, 176 144, 176 152 C176 160, 168 164, 158 162 C152 160, 150 152, 152 146 C152 142, 154 140, 156 140 Z" />
      </g>

      {/* Olive wreath — left */}
      <g stroke={wreath} strokeWidth="1.75" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M52 148 C38 124, 36 92, 50 66 C56 54, 68 44, 82 38" />
        <path
          d="M54 136 C46 130, 46 122, 52 118 C58 124, 58 132, 54 136 Z"
          fill={wreath}
          stroke="none"
          opacity="0.85"
        />
        <path
          d="M48 112 C40 106, 40 98, 46 94 C52 100, 52 108, 48 112 Z"
          fill={wreath}
          stroke="none"
          opacity="0.85"
        />
        <path
          d="M46 90 C38 84, 38 76, 44 72 C50 78, 50 86, 46 90 Z"
          fill={wreath}
          stroke="none"
          opacity="0.85"
        />
        <path
          d="M50 68 C44 62, 46 54, 52 52 C56 58, 54 66, 50 68 Z"
          fill={wreath}
          stroke="none"
          opacity="0.85"
        />
      </g>

      {/* Olive wreath — right */}
      <g stroke={wreath} strokeWidth="1.75" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M188 148 C202 124, 204 92, 190 66 C184 54, 172 44, 158 38" />
        <path
          d="M186 136 C194 130, 194 122, 188 118 C182 124, 182 132, 186 136 Z"
          fill={wreath}
          stroke="none"
          opacity="0.85"
        />
        <path
          d="M192 112 C200 106, 200 98, 194 94 C188 100, 188 108, 192 112 Z"
          fill={wreath}
          stroke="none"
          opacity="0.85"
        />
        <path
          d="M194 90 C202 84, 202 76, 196 72 C190 78, 190 86, 194 90 Z"
          fill={wreath}
          stroke="none"
          opacity="0.85"
        />
        <path
          d="M190 68 C196 62, 194 54, 188 52 C184 58, 186 66, 190 68 Z"
          fill={wreath}
          stroke="none"
          opacity="0.85"
        />
      </g>

      {/* Base bars — institutional seal footing */}
      <path
        d="M76 192 H164"
        stroke={stroke}
        strokeWidth="2.25"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M88 198 H152"
        stroke={wreath}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

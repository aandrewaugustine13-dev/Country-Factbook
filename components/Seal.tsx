import React from 'react';

const Seal = () => {
  return (
    <svg 
      width="205" 
      height="205" 
      viewBox="0 0 205 205" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="seal mx-auto block"
    >
      {/* Outer authoritative ring - heavy */}
      <circle cx="102.5" cy="102.5" r="98" stroke="#009EDB" strokeWidth="13" />
      <circle cx="102.5" cy="102.5" r="87" stroke="#0A1428" strokeWidth="7" />

      {/* Inner globe base */}
      <circle cx="102.5" cy="102.5" r="54" fill="#132337" stroke="#009EDB" strokeWidth="9" />

      {/* Globe details - clean stylized meridians + latitudes */}
      <path d="M102.5 48.5 Q68 73 68 102.5 Q68 132 102.5 156.5" fill="none" stroke="#60D0F5" strokeWidth="4" strokeLinecap="round" />
      <path d="M102.5 48.5 Q137 73 137 102.5 Q137 132 102.5 156.5" fill="none" stroke="#60D0F5" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="102.5" cy="102.5" rx="54" ry="23" fill="none" stroke="#60D0F5" strokeWidth="3.5" />
      <ellipse cx="102.5" cy="102.5" rx="54" ry="37" fill="none" stroke="#60D0F5" strokeWidth="3" />

      {/* REAL LAUREL WREATHS — left side (detailed leaves + thicker branches) */}
      <g>
        <path d="M45 82 Q22 52 38 38 Q65 55 72 79" fill="none" stroke="#E2B04A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M47 123 Q24 145 39 165 Q68 145 75 120" fill="none" stroke="#E2B04A" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        {/* leaves */}
        <path d="M35 55 Q28 48 22 55" fill="none" stroke="#E2B04A" strokeWidth="7" />
        <path d="M48 65 Q41 57 36 66" fill="none" stroke="#E2B04A" strokeWidth="7" />
        <path d="M38 145 Q30 152 25 144" fill="none" stroke="#E2B04A" strokeWidth="7" />
        <path d="M52 135 Q45 142 40 131" fill="none" stroke="#E2B04A" strokeWidth="7" />
      </g>

      {/* REAL LAUREL WREATHS — right side (symmetric) */}
      <g>
        <path d="M160 82 Q183 52 167 38 Q140 55 133 79" fill="none" stroke="#E2B04A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M158 123 Q181 145 166 165 Q137 145 130 120" fill="none" stroke="#E2B04A" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        {/* leaves */}
        <path d="M170 55 Q177 48 183 55" fill="none" stroke="#E2B04A" strokeWidth="7" />
        <path d="M157 65 Q164 57 169 66" fill="none" stroke="#E2B04A" strokeWidth="7" />
        <path d="M167 145 Q175 152 180 144" fill="none" stroke="#E2B04A" strokeWidth="7" />
        <path d="M153 135 Q160 142 165 131" fill="none" stroke="#E2B04A" strokeWidth="7" />
      </g>
    </svg>
  );
};

export default Seal;

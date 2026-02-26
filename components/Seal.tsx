import React from 'react';

export const Seal = () => {
  return (
    <svg 
      width="205" 
      height="205" 
      viewBox="0 0 205 205" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="seal mx-auto block drop-shadow-2xl"
    >
      {/* Heavy outer ring */}
      <circle cx="102.5" cy="102.5" r="99" stroke="#009EDB" strokeWidth="14" />
      <circle cx="102.5" cy="102.5" r="86" stroke="#0A1428" strokeWidth="8" />

      {/* Globe */}
      <circle cx="102.5" cy="102.5" r="54" fill="#132337" stroke="#009EDB" strokeWidth="9" />
      
      {/* Globe lines */}
      <path d="M102.5 48 Q70 70 70 102.5 Q70 135 102.5 157" fill="none" stroke="#60D0F5" strokeWidth="4" strokeLinecap="round" />
      <path d="M102.5 48 Q135 70 135 102.5 Q135 135 102.5 157" fill="none" stroke="#60D0F5" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="102.5" cy="102.5" rx="54" ry="24" fill="none" stroke="#60D0F5" strokeWidth="3.5" />
      <ellipse cx="102.5" cy="102.5" rx="54" ry="38" fill="none" stroke="#60D0F5" strokeWidth="3" />

      {/* Heavy Gold Laurel Wreaths - Left */}
      <g>
        <path d="M48 78 Q25 48 39 35 Q68 52 73 78" fill="none" stroke="#E2B04A" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M47 126 Q24 152 40 168 Q70 147 75 122" fill="none" stroke="#E2B04A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        {/* leaves */}
        <path d="M35 52 Q27 44 23 54 Q30 58 38 52" fill="none" stroke="#E2B04A" strokeWidth="8" />
        <path d="M48 65 Q39 55 35 68" fill="none" stroke="#E2B04A" strokeWidth="8" />
        <path d="M37 142 Q29 150 24 140" fill="none" stroke="#E2B04A" strokeWidth="8" />
        <path d="M51 133 Q43 142 39 130" fill="none" stroke="#E2B04A" strokeWidth="8" />
      </g>

      {/* Heavy Gold Laurel Wreaths - Right */}
      <g>
        <path d="M157 78 Q180 48 166 35 Q137 52 132 78" fill="none" stroke="#E2B04A" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M158 126 Q181 152 165 168 Q135 147 130 122" fill="none" stroke="#E2B04A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        {/* leaves */}
        <path d="M170 52 Q178 44 182 54 Q175 58 167 52" fill="none" stroke="#E2B04A" strokeWidth="8" />
        <path d="M157 65 Q166 55 170 68" fill="none" stroke="#E2B04A" strokeWidth="8" />
        <path d="M168 142 Q176 150 181 140" fill="none" stroke="#E2B04A" strokeWidth="8" />
        <path d="M154 133 Q162 142 166 130" fill="none" stroke="#E2B04A" strokeWidth="8" />
      </g>
    </svg>
  );
};

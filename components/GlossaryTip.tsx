'use client';

import { useState, useRef, useEffect } from 'react';

export function GlossaryTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const tipRef = useRef<HTMLSpanElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!show) return;
    function handleClick(e: MouseEvent) {
      if (tipRef.current && !tipRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [show]);

  return (
    <span
      ref={tipRef}
      className="glossary-tip-wrap"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => { e.stopPropagation(); setShow(!show); }}
    >
      <span className="glossary-tip-icon">?</span>
      {show && (
        <span className="glossary-tip-popup">{text}</span>
      )}
    </span>
  );
}

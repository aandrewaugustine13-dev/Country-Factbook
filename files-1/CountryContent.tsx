'use client';

import { useState } from 'react';

interface FactbookEntry {
  label: string;
  value: string;
}

interface Props {
  sections: Record<string, FactbookEntry[]>;
  sectionOrder: string[];
}

function SectionBlock({
  title,
  entries,
  defaultOpen,
}: {
  title: string;
  entries: FactbookEntry[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="fb-section" id={id}>
      <button
        className="section-header section-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{title.toUpperCase()}</span>
        <span className="toggle-icon">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <dl className="fb-entries">
          {entries.map((entry, i) => (
            <div key={i} className="fb-entry">
              <dt>{entry.label}</dt>
              <dd>
                {entry.value.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < entry.value.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export function CountryContent({ sections, sectionOrder }: Props) {
  const [allOpen, setAllOpen] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  function toggleAll() {
    setAllOpen(!allOpen);
    setResetKey((k) => k + 1);
  }

  return (
    <div className="fb-content">
      <div className="fb-controls">
        <button className="fb-toggle-all" onClick={toggleAll}>
          {allOpen ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      {sectionOrder.map((name) => (
        <SectionBlock
          key={`${name}-${resetKey}`}
          title={name}
          entries={sections[name]}
          defaultOpen={allOpen}
        />
      ))}
    </div>
  );
}

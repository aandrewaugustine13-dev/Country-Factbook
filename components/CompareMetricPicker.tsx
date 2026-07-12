'use client';

import { METRICS } from '@/src/glossary';
import { NUMERIC_METRICS } from '@/src/compare-filters';

const SECTIONS = [...new Set(NUMERIC_METRICS.map((m) => m.section))];

export function CompareMetricPicker({
  selectedKeys,
  onChange,
}: {
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
}) {
  function toggle(key: string) {
    if (selectedKeys.includes(key)) {
      if (selectedKeys.length <= 1) return;
      onChange(selectedKeys.filter((k) => k !== key));
    } else {
      onChange([...selectedKeys, key]);
    }
  }

  function selectSection(section: string) {
    const keys = NUMERIC_METRICS.filter((m) => m.section === section).map((m) => m.key);
    const merged = Array.from(new Set([...selectedKeys, ...keys]));
    onChange(merged);
  }

  return (
    <div className="compare-metric-picker">
      <div className="compare-research-head">
        <h2 className="compare-research-title">Metrics</h2>
        <span className="compare-research-meta">{selectedKeys.length} shown</span>
      </div>
      <p className="compare-metric-picker-lead">Choose columns for the data grid and filtered table.</p>

      <div className="compare-metric-section-actions">
        {SECTIONS.map((s) => (
          <button key={s} type="button" className="preset-btn" onClick={() => selectSection(s)}>
            + {s}
          </button>
        ))}
      </div>

      <div className="compare-metric-list">
        {SECTIONS.map((section) => (
          <div key={section} className="compare-metric-group">
            <span className="preset-label">{section}</span>
            <div className="compare-metric-checks">
              {NUMERIC_METRICS.filter((m) => m.section === section).map((m) => (
                <label key={m.key} className="compare-metric-check">
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(m.key)}
                    onChange={() => toggle(m.key)}
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function metricLabel(key: string): string {
  return METRICS.find((m) => m.key === key)?.label || key;
}

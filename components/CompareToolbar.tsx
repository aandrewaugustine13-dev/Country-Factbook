'use client';

export function CompareToolbar({ selected, onRemove, onMove, onClear }: { selected: Array<{ code: string; name: string; flag_url: string }>; onRemove: (code: string) => void; onMove: (from: number, to: number) => void; onClear: () => void; }) {
  return (
    <div className="compare-chips compare-chips-wrap">
      {selected.map((c, i) => (
        <span key={c.code} className="compare-chip">
          <img src={c.flag_url} alt="" width={18} height={12} />
          {c.name}
          <button onClick={() => onMove(i, i - 1)} disabled={i === 0} aria-label={`Move ${c.name} left`} className="chip-remove">←</button>
          <button onClick={() => onMove(i, i + 1)} disabled={i === selected.length - 1} aria-label={`Move ${c.name} right`} className="chip-remove">→</button>
          <button onClick={() => onRemove(c.code)} aria-label={`Remove ${c.name}`} className="chip-remove">×</button>
        </span>
      ))}
      {selected.length > 0 && <button className="compare-clear" onClick={onClear}>Clear All</button>}
    </div>
  );
}

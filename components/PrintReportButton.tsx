'use client';

export function PrintReportButton() {
  return (
    <button onClick={() => window.print()} className="fb-toggle-all" aria-label="Print this country report">
      Print this report
    </button>
  );
}

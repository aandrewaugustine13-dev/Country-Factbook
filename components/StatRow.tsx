export function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

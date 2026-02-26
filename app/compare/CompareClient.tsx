"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Country = {
  code: string;
  name: string;
  population?: number;
  area?: number;
  gdp_per_capita?: number;
  life_expectancy?: number;
  median_age?: number;
  internet_users_percent?: number;
  urbanization_percent?: number;
};

const METRICS: Array<{ label: string; key: keyof Country }> = [
  { label: "Population", key: "population" },
  { label: "Area (km²)", key: "area" },
  { label: "GDP per Capita", key: "gdp_per_capita" },
  { label: "Life Expectancy", key: "life_expectancy" },
  { label: "Median Age", key: "median_age" },
  { label: "Internet %", key: "internet_users_percent" },
  { label: "Urbanization %", key: "urbanization_percent" },
];

export default function CompareClient({ countries }: { countries: Country[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCodes = searchParams.getAll("c");

  const selected = useMemo(
    () => countries.filter((c) => selectedCodes.includes(c.code)),
    [countries, selectedCodes]
  );

  function toggle(code: string) {
    const next = new Set(selectedCodes);
    if (next.has(code)) next.delete(code);
    else {
      if (next.size >= 10) return; // hard cap like your UI copy
      next.add(code);
    }

    const qs = Array.from(next).map((c) => `c=${encodeURIComponent(c)}`).join("&");
    router.replace(qs ? `/compare?${qs}` : `/compare`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {countries
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c) => (
            <label key={c.code} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCodes.includes(c.code)}
                onChange={() => toggle(c.code)}
              />
              <span>
                {c.name} <span className="opacity-60">({c.code})</span>
              </span>
            </label>
          ))}
      </div>

      {selected.length === 0 ? (
        <div className="text-sm opacity-70">
          No countries selected. Choose some above or use <code>?c=USA&amp;c=CAN</code>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300 border-collapse">
            <thead>
              <tr>
                <th className="p-2 border text-left">Metric</th>
                {selected.map((c) => (
                  <th key={c.code} className="p-2 border text-left">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.label}>
                  <td className="p-2 border font-medium">{m.label}</td>
                  {selected.map((c) => (
                    <td key={c.code} className="p-2 border text-right">
                      {formatValue(c[m.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatValue(v: unknown) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") return Number.isFinite(v) ? v.toLocaleString() : "—";
  return String(v);
}

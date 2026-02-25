'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

type Country = Record<string, any>;

function formatBig(n: number | null | undefined) {
  if (n == null) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

export function DailyClient({ countries }: { countries: Country[] }) {
  const [country, setCountry] = useState<Country | null>(null);
  const [revealed, setRevealed] = useState(false);

  const pick = useCallback(() => {
    const c = countries[Math.floor(Math.random() * countries.length)];
    setCountry(c);
    setRevealed(false);
  }, [countries]);

  useEffect(() => {
    pick();
  }, [pick]);

  if (!country) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading…</p>;

  return (
    <div className="daily-container">
      <h1 className="daily-title">Country of the Day</h1>
      <p className="daily-subtitle">
        Great for bellringers — project this and have students guess before you hit reveal!
      </p>

      <div className="daily-card">
        <div className="daily-flag">{revealed ? country.flag_emoji : '🌍'}</div>

        {!revealed ? (
          <>
            <div className="daily-hints">
              <div className="daily-hint">
                <span className="hint-label">Region</span>
                <span className="hint-value">{country.region}</span>
              </div>
              <div className="daily-hint">
                <span className="hint-label">Capital</span>
                <span className="hint-value">{country.capital || '—'}</span>
              </div>
              <div className="daily-hint">
                <span className="hint-label">Population</span>
                <span className="hint-value">{formatBig(country.population)}</span>
              </div>
              {country.gdp_per_capita && (
                <div className="daily-hint">
                  <span className="hint-label">GDP per Capita</span>
                  <span className="hint-value">${country.gdp_per_capita.toLocaleString()}</span>
                </div>
              )}
              {country.government_type && (
                <div className="daily-hint">
                  <span className="hint-label">Government</span>
                  <span className="hint-value">{country.government_type}</span>
                </div>
              )}
            </div>
            <button className="daily-reveal-btn" onClick={() => setRevealed(true)}>
              Reveal Country
            </button>
          </>
        ) : (
          <>
            <h2 className="daily-country-name">{country.name}</h2>
            <p className="daily-country-meta">
              {country.capital} · {country.region}
            </p>
            {country.government_type && (
              <p className="daily-country-govt">{country.government_type}</p>
            )}

            <div className="daily-stats">
              {[
                { l: 'Population', v: formatBig(country.population) },
                { l: 'GDP/capita', v: country.gdp_per_capita ? `$${country.gdp_per_capita.toLocaleString()}` : '—' },
                { l: 'Life Expectancy', v: country.life_expectancy ? `${country.life_expectancy} yrs` : '—' },
                { l: 'Median Age', v: country.median_age ? `${country.median_age} yrs` : '—' },
                { l: 'Urbanization', v: country.urbanization_pct ? `${country.urbanization_pct}%` : '—' },
                { l: 'Internet', v: country.internet_pct ? `${country.internet_pct}%` : '—' },
                { l: 'Area', v: country.area_km2 ? `${formatBig(country.area_km2)} km²` : '—' },
              ].map(({ l, v }) => (
                <div key={l} className="daily-stat">
                  <span className="daily-stat-label">{l}</span>
                  <span className="daily-stat-value">{v}</span>
                </div>
              ))}
            </div>

            <div className="daily-actions">
              <Link href={`/countries/${country.code}`} className="daily-action-btn daily-action-primary">
                View Full Profile
              </Link>
              <button onClick={pick} className="daily-action-btn daily-action-secondary">
                New Country
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

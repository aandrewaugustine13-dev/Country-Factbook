'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { MapCountrySummary } from '@/src/map-countries';
import { formatPopulation } from '@/src/map-countries';

interface Props {
  country: MapCountrySummary | null;
  geoName?: string | null;
  onClose: () => void;
}

export function CountryInfoModal({ country, geoName, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!country && !geoName) return;

    closeBtnRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [country, geoName, onClose]);

  if (!country && !geoName) return null;

  return (
    <div
      className="map-modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="map-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-modal-title"
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="map-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {country ? (
          <>
            <div className="map-modal-header">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={country.flag_url}
                alt=""
                width={56}
                height={40}
                className="map-modal-flag"
              />
              <div>
                <h2 id="map-modal-title" className="map-modal-title">
                  {country.name_common}
                </h2>
                <p className="map-modal-official">{country.name_official}</p>
              </div>
            </div>

            <dl className="map-modal-facts">
              <div>
                <dt>Capital</dt>
                <dd>{country.capital && country.capital !== 'N/A' ? country.capital : '—'}</dd>
              </div>
              <div>
                <dt>Region</dt>
                <dd>
                  {country.region}
                  {country.subregion && country.subregion !== 'Unknown'
                    ? ` · ${country.subregion}`
                    : ''}
                </dd>
              </div>
              <div>
                <dt>Population</dt>
                <dd>{formatPopulation(country.population)}</dd>
              </div>
              <div>
                <dt>Area</dt>
                <dd>
                  {country.area_km2
                    ? `${country.area_km2.toLocaleString('en-US')} km²`
                    : '—'}
                </dd>
              </div>
            </dl>

            {country.blurb && <p className="map-modal-blurb">{country.blurb}</p>}

            <div className="map-modal-actions">
              <Link href={`/countries/${country.code}`} className="btn btn-sky map-modal-cta">
                View full profile →
              </Link>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Keep exploring
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="map-modal-title" className="map-modal-title">
              {geoName || 'Unknown area'}
            </h2>
            <p className="map-modal-blurb">
              We don&apos;t have a Factbook profile for this place yet. Try a neighboring country, or
              browse the dashboard for a full list.
            </p>
            <div className="map-modal-actions">
              <Link href="/" className="btn btn-outline">
                Browse countries
              </Link>
              <button type="button" className="btn btn-sky" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

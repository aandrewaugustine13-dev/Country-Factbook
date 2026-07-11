'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap, GeoJSON as LeafletGeoJSON, Layer, PathOptions } from 'leaflet';
import type { MapCountrySummary } from '@/src/map-countries';
import { resolveAppCode, APP_TO_GEO_CODE } from '@/src/map-countries';
import { CountryInfoModal } from './CountryInfoModal';

const GEO_URL = '/geo/countries.geojson';

const STYLE_DEFAULT: PathOptions = {
  fillColor: '#1B6CA8',
  fillOpacity: 0.18,
  color: '#0D2B45',
  weight: 0.8,
  opacity: 0.55,
};

const STYLE_HOVER: PathOptions = {
  fillColor: '#1B6CA8',
  fillOpacity: 0.42,
  color: '#0D2B45',
  weight: 1.5,
  opacity: 0.85,
};

const STYLE_SELECTED: PathOptions = {
  fillColor: '#B8860B',
  fillOpacity: 0.45,
  color: '#0D2B45',
  weight: 2,
  opacity: 0.95,
};

const STYLE_NO_DATA: PathOptions = {
  fillColor: '#8A96A3',
  fillOpacity: 0.12,
  color: '#8A96A3',
  weight: 0.6,
  opacity: 0.4,
};

interface GeoFeatureProps {
  name?: string;
  iso_a3?: string | null;
  iso_a2?: string | null;
}

export function WorldMap({ countries }: { countries: MapCountrySummary[] }) {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const geoLayerRef = useRef<LeafletGeoJSON | null>(null);
  const layerByCodeRef = useRef<Map<string, Layer>>(new Map());
  const selectedLayerRef = useRef<Layer | null>(null);

  const byCode = useMemo(() => {
    const m = new Map<string, MapCountrySummary>();
    for (const c of countries) m.set(c.code, c);
    return m;
  }, [countries]);

  const [selected, setSelected] = useState<MapCountrySummary | null>(null);
  const [unknownName, setUnknownName] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const clearSelectionStyle = useCallback(() => {
    const prev = selectedLayerRef.current as (Layer & { setStyle?: (s: PathOptions) => void; feature?: { properties?: GeoFeatureProps } }) | null;
    if (prev?.setStyle) {
      const props = prev.feature?.properties;
      const code = resolveAppCode(props?.iso_a3 ?? null);
      const hasData = code ? byCode.has(code) : false;
      prev.setStyle(hasData ? STYLE_DEFAULT : STYLE_NO_DATA);
    }
    selectedLayerRef.current = null;
  }, [byCode]);

  const openCountry = useCallback(
    (country: MapCountrySummary | null, geoName?: string | null, layer?: Layer | null) => {
      clearSelectionStyle();
      const path = layer as (Layer & { setStyle?: (s: PathOptions) => void }) | null | undefined;
      if (path?.setStyle) {
        path.setStyle(STYLE_SELECTED);
        selectedLayerRef.current = layer || null;
      }
      setSelected(country);
      setUnknownName(country ? null : geoName || 'Unknown area');
    },
    [clearSelectionStyle]
  );

  const closeModal = useCallback(() => {
    clearSelectionStyle();
    setSelected(null);
    setUnknownName(null);
  }, [clearSelectionStyle]);

  // Init map + GeoJSON
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!mapElRef.current || mapRef.current) return;

      const L = await import('leaflet');
      // CSS via link tag in render (same pattern as CountryMap)

      if (cancelled || !mapElRef.current) return;

      const map = L.map(mapElRef.current, {
        center: [20, 10],
        zoom: 2,
        minZoom: 1,
        maxZoom: 8,
        worldCopyJump: true,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a> · Boundaries: Natural Earth',
        subdomains: 'abcd',
        maxZoom: 10,
      }).addTo(map);

      // Optional label layer for readability without cluttering boundaries
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 10,
        pane: 'shadowPane',
      }).addTo(map);

      mapRef.current = map;

      try {
        const res = await fetch(GEO_URL);
        if (!res.ok) throw new Error(`Failed to load boundaries (${res.status})`);
        const geojson = await res.json();
        if (cancelled) return;

        const layerByCode = new Map<string, Layer>();

        const geoLayer = L.geoJSON(geojson, {
          style: (feature) => {
            const iso = feature?.properties?.iso_a3 as string | undefined;
            const code = resolveAppCode(iso);
            return code && byCode.has(code) ? STYLE_DEFAULT : STYLE_NO_DATA;
          },
          onEachFeature: (feature, layer) => {
            const props = (feature.properties || {}) as GeoFeatureProps;
            const appCode = resolveAppCode(props.iso_a3);
            if (appCode) layerByCode.set(appCode, layer);

            const path = layer as Layer & {
              setStyle: (s: PathOptions) => void;
              on: (events: Record<string, (e: { target: Layer }) => void>) => void;
            };

            path.on({
              mouseover: (e) => {
                const t = e.target as Layer & { setStyle: (s: PathOptions) => void; bringToFront?: () => void };
                if (selectedLayerRef.current === t) return;
                t.setStyle(STYLE_HOVER);
                t.bringToFront?.();
              },
              mouseout: (e) => {
                const t = e.target as Layer & { setStyle: (s: PathOptions) => void; feature?: { properties?: GeoFeatureProps } };
                if (selectedLayerRef.current === t) {
                  t.setStyle(STYLE_SELECTED);
                  return;
                }
                const c = resolveAppCode(t.feature?.properties?.iso_a3);
                t.setStyle(c && byCode.has(c) ? STYLE_DEFAULT : STYLE_NO_DATA);
              },
              click: (e) => {
                const t = e.target as Layer & { feature?: { properties?: GeoFeatureProps } };
                const c = resolveAppCode(t.feature?.properties?.iso_a3);
                const match = c ? byCode.get(c) || null : null;
                openCountry(match, t.feature?.properties?.name || null, t);
              },
            });

            // Accessible name for screen readers when using keyboard focus isn't available on SVG paths
            if (props.name) {
              (layer as { bindTooltip?: (s: string, o?: object) => void }).bindTooltip?.(props.name, {
                sticky: true,
                direction: 'top',
                opacity: 0.92,
                className: 'map-country-tooltip',
              });
            }
          },
        }).addTo(map);

        geoLayerRef.current = geoLayer;
        layerByCodeRef.current = layerByCode;
        setReady(true);
      } catch (err) {
        console.error(err);
        setLoadError(err instanceof Error ? err.message : 'Could not load map boundaries');
      }
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      geoLayerRef.current = null;
      layerByCodeRef.current = new Map();
    };
    // byCode is stable for the page load; openCountry closes over latest byCode via clearSelectionStyle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep style helper in sync if countries prop changes (unlikely after mount)
  useEffect(() => {
    // no-op placeholder for future choropleth layers
  }, [byCode]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return countries
      .filter((c) =>
        `${c.name_common} ${c.code} ${c.capital} ${c.region}`.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [countries, query]);

  function flyToCountry(country: MapCountrySummary) {
    setQuery('');
    const map = mapRef.current;
    const layer = layerByCodeRef.current.get(country.code);
    // Also try geo alias
    const geoCode = APP_TO_GEO_CODE[country.code];
    const layerAlt = geoCode
      ? [...layerByCodeRef.current.entries()].find(([code]) => code === country.code)?.[1]
      : null;
    const target = layer || layerAlt || null;

    if (target && map) {
      const bounds = (target as { getBounds?: () => { isValid: () => boolean } }).getBounds?.();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds as Parameters<LeafletMap['fitBounds']>[0], {
          padding: [40, 40],
          maxZoom: 6,
        });
      }
      openCountry(country, null, target);
      return;
    }

    // Fallback: center on latlng if no polygon (small islands missing from 110m)
    if (map && country.latlng?.length === 2) {
      map.setView([country.latlng[0], country.latlng[1]], 5);
    }
    openCountry(country, null, null);
  }

  const withBoundary = useMemo(() => {
    // Approximate: countries that will light up (known geo codes)
    return countries.length;
  }, [countries]);

  return (
    <div className="world-map-root">
      <div className="world-map-toolbar">
        <div className="world-map-search-wrap">
          <label htmlFor="map-search" className="sr-only">
            Find a country on the map
          </label>
          <input
            id="map-search"
            className="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a country…"
            autoComplete="off"
            disabled={!ready && !loadError}
          />
          {query.trim() && searchResults.length > 0 && (
            <div className="compare-dropdown world-map-dropdown">
              {searchResults.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  className="compare-dropdown-item"
                  onClick={() => flyToCountry(c)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.flag_url} alt="" width={22} height={14} />
                  <span>{c.name_common}</span>
                  <span className="dropdown-region">{c.region}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="world-map-hint">
          Click a country to learn more · {withBoundary} profiles available
          {!ready && !loadError ? ' · Loading map…' : ''}
        </p>
      </div>

      {loadError && (
        <div className="compare-empty">
          <p>Could not load country boundaries.</p>
          <p className="pyramid-empty-hint">{loadError}</p>
          <p className="pyramid-empty-hint">
            Expected file: <code>public/geo/countries.geojson</code>
          </p>
        </div>
      )}

      <div className="world-map-frame">
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
        <div ref={mapElRef} className="world-map-canvas" aria-label="Interactive world map" />
        <div className="world-map-legend" aria-hidden>
          <span>
            <i className="world-map-swatch has-data" /> In Factbook
          </span>
          <span>
            <i className="world-map-swatch no-data" /> Limited data
          </span>
          <span>
            <i className="world-map-swatch selected" /> Selected
          </span>
        </div>
      </div>

      <CountryInfoModal
        country={selected}
        geoName={unknownName}
        onClose={closeModal}
      />
    </div>
  );
}

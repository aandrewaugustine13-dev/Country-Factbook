'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap, GeoJSON as LeafletGeoJSON, Layer, PathOptions } from 'leaflet';
import type { MapCountrySummary } from '@/src/map-countries';
import { resolveAppCode } from '@/src/map-countries';
import {
  MAP_LAYERS,
  type LayerId,
  getLayerDef,
  colorForLayerValue,
  legendItems,
} from '@/src/map-layers';
import { CountryInfoModal } from './CountryInfoModal';

const GEO_URL = '/geo/countries.geojson';

const STYLE_BASE: PathOptions = {
  color: '#0D2B45',
  weight: 0.75,
  opacity: 0.55,
  fillOpacity: 0.82,
};

const STYLE_HOVER_EXTRA: PathOptions = {
  weight: 1.6,
  opacity: 0.9,
  fillOpacity: 0.92,
};

const STYLE_SELECTED_EXTRA: PathOptions = {
  color: '#0D2B45',
  weight: 2.2,
  opacity: 1,
  fillOpacity: 0.95,
};

const NO_DATA_FILL = '#c5cdd6';
const DEFAULT_FILL = '#8eb6d4';

interface GeoFeatureProps {
  name?: string;
  iso_a3?: string | null;
  iso_a2?: string | null;
}

type PathLayer = Layer & {
  setStyle: (s: PathOptions) => void;
  bringToFront?: () => void;
  feature?: { properties?: GeoFeatureProps };
  getBounds?: () => { isValid: () => boolean };
  on: (events: Record<string, (e: { target: PathLayer }) => void>) => void;
  bindTooltip?: (s: string, o?: object) => void;
};

export function WorldMap({ countries }: { countries: MapCountrySummary[] }) {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const geoLayerRef = useRef<LeafletGeoJSON | null>(null);
  const layerByCodeRef = useRef<Map<string, PathLayer>>(new Map());
  const selectedLayerRef = useRef<PathLayer | null>(null);
  const activeLayerRef = useRef<LayerId | null>(null);
  const byCodeRef = useRef<Map<string, MapCountrySummary>>(new Map());

  const byCode = useMemo(() => {
    const m = new Map<string, MapCountrySummary>();
    for (const c of countries) m.set(c.code, c);
    return m;
  }, [countries]);

  useEffect(() => {
    byCodeRef.current = byCode;
  }, [byCode]);

  const [selected, setSelected] = useState<MapCountrySummary | null>(null);
  const [unknownName, setUnknownName] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<LayerId | null>('development');

  activeLayerRef.current = activeLayerId;

  const styleForCode = useCallback((code: string | null): PathOptions => {
    if (!code) {
      return { ...STYLE_BASE, fillColor: NO_DATA_FILL, fillOpacity: 0.35 };
    }
    const country = byCodeRef.current.get(code);
    if (!country) {
      return { ...STYLE_BASE, fillColor: NO_DATA_FILL, fillOpacity: 0.35 };
    }
    const layerId = activeLayerRef.current;
    if (!layerId) {
      return { ...STYLE_BASE, fillColor: DEFAULT_FILL, fillOpacity: 0.35 };
    }
    const def = getLayerDef(layerId);
    const lv = country.layers?.[layerId];
    const fill = colorForLayerValue(def, lv);
    return {
      ...STYLE_BASE,
      fillColor: fill,
      fillOpacity: lv ? 0.82 : 0.28,
    };
  }, []);

  const restyleAll = useCallback(() => {
    layerByCodeRef.current.forEach((layer, code) => {
      if (selectedLayerRef.current === layer) {
        layer.setStyle({
          ...styleForCode(code),
          ...STYLE_SELECTED_EXTRA,
        });
      } else {
        layer.setStyle(styleForCode(code));
      }
    });
    // Also restyle features without app match that aren't in layerByCode
    geoLayerRef.current?.eachLayer((layer) => {
      const path = layer as PathLayer;
      const code = resolveAppCode(path.feature?.properties?.iso_a3 ?? null);
      if (code && layerByCodeRef.current.has(code)) return;
      if (selectedLayerRef.current === path) return;
      path.setStyle?.(styleForCode(null));
    });
  }, [styleForCode]);

  useEffect(() => {
    if (ready) restyleAll();
  }, [activeLayerId, ready, restyleAll]);

  const clearSelectionStyle = useCallback(() => {
    const prev = selectedLayerRef.current;
    if (prev?.setStyle) {
      const code = resolveAppCode(prev.feature?.properties?.iso_a3 ?? null);
      prev.setStyle(styleForCode(code));
    }
    selectedLayerRef.current = null;
  }, [styleForCode]);

  const openCountry = useCallback(
    (country: MapCountrySummary | null, geoName?: string | null, layer?: PathLayer | null) => {
      clearSelectionStyle();
      if (layer?.setStyle) {
        const code = country?.code || resolveAppCode(layer.feature?.properties?.iso_a3 ?? null);
        layer.setStyle({
          ...styleForCode(code),
          ...STYLE_SELECTED_EXTRA,
        });
        selectedLayerRef.current = layer;
      }
      setSelected(country);
      setUnknownName(country ? null : geoName || 'Unknown area');
    },
    [clearSelectionStyle, styleForCode]
  );

  const closeModal = useCallback(() => {
    clearSelectionStyle();
    setSelected(null);
    setUnknownName(null);
  }, [clearSelectionStyle]);

  // Init map once
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!mapElRef.current || mapRef.current) return;

      const L = await import('leaflet');
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

        const layerByCode = new Map<string, PathLayer>();

        const geoLayer = L.geoJSON(geojson, {
          style: (feature) => {
            const code = resolveAppCode(feature?.properties?.iso_a3);
            return styleForCode(code);
          },
          onEachFeature: (feature, layer) => {
            const path = layer as PathLayer;
            const props = (feature.properties || {}) as GeoFeatureProps;
            const appCode = resolveAppCode(props.iso_a3);
            if (appCode) layerByCode.set(appCode, path);

            path.on({
              mouseover: (e) => {
                const t = e.target as PathLayer;
                if (selectedLayerRef.current === t) return;
                const code = resolveAppCode(t.feature?.properties?.iso_a3 ?? null);
                t.setStyle({
                  ...styleForCode(code),
                  ...STYLE_HOVER_EXTRA,
                });
                t.bringToFront?.();
              },
              mouseout: (e) => {
                const t = e.target as PathLayer;
                if (selectedLayerRef.current === t) {
                  const code = resolveAppCode(t.feature?.properties?.iso_a3 ?? null);
                  t.setStyle({
                    ...styleForCode(code),
                    ...STYLE_SELECTED_EXTRA,
                  });
                  return;
                }
                const code = resolveAppCode(t.feature?.properties?.iso_a3 ?? null);
                t.setStyle(styleForCode(code));
              },
              click: (e) => {
                const t = e.target as PathLayer;
                const c = resolveAppCode(t.feature?.properties?.iso_a3);
                const match = c ? byCodeRef.current.get(c) || null : null;
                openCountry(match, t.feature?.properties?.name || null, t);
              },
            });

            if (props.name) {
              path.bindTooltip?.(props.name, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const layer = layerByCodeRef.current.get(country.code) || null;

    if (layer && map) {
      const bounds = layer.getBounds?.();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds as Parameters<LeafletMap['fitBounds']>[0], {
          padding: [40, 40],
          maxZoom: 6,
        });
      }
      openCountry(country, null, layer);
      return;
    }

    if (map && country.latlng?.length === 2) {
      map.setView([country.latlng[0], country.latlng[1]], 5);
    }
    openCountry(country, null, null);
  }

  const activeDef = getLayerDef(activeLayerId);
  const legend = activeDef ? legendItems(activeDef) : [];

  return (
    <div className="world-map-root thematic-map-root">
      <div className="thematic-layout">
        {/* Layer panel */}
        <aside className="map-layer-panel" aria-label="Map data layers">
          <div className="map-layer-panel-head">
            <h2 className="map-layer-panel-title">Map layers</h2>
            <p className="map-layer-panel-lead">
              Choose one theme. Colors show patterns — click a country for details.
            </p>
          </div>

          <div className="map-layer-list" role="radiogroup" aria-label="Thematic layer">
            <label className={`map-layer-option ${activeLayerId === null ? 'active' : ''}`}>
              <input
                type="radio"
                name="map-layer"
                checked={activeLayerId === null}
                onChange={() => setActiveLayerId(null)}
              />
              <span className="map-layer-option-body">
                <span className="map-layer-option-name">None (outline only)</span>
                <span className="map-layer-option-desc">Simple political map</span>
              </span>
            </label>

            {MAP_LAYERS.map((layer) => (
              <label
                key={layer.id}
                className={`map-layer-option ${activeLayerId === layer.id ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="map-layer"
                  checked={activeLayerId === layer.id}
                  onChange={() => setActiveLayerId(layer.id)}
                />
                <span className="map-layer-option-body">
                  <span className="map-layer-option-name">{layer.name}</span>
                  <span className="map-layer-option-desc">{layer.description}</span>
                </span>
              </label>
            ))}
          </div>

          {activeDef && (
            <div className="map-layer-source">
              <strong>About this layer</strong>
              <p>{activeDef.sourceNote}</p>
            </div>
          )}
        </aside>

        {/* Map column */}
        <div className="thematic-map-col">
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
                      <span className="dropdown-region">
                        {activeLayerId && c.layers?.[activeLayerId]
                          ? c.layers[activeLayerId]!.display
                          : c.region}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="world-map-hint">
              {activeDef
                ? `Showing: ${activeDef.shortName} · click a country for values`
                : 'Outline map · choose a layer to color the world'}
              {!ready && !loadError ? ' · Loading…' : ''}
            </p>
          </div>

          {loadError && (
            <div className="compare-empty">
              <p>Could not load country boundaries.</p>
              <p className="pyramid-empty-hint">{loadError}</p>
            </div>
          )}

          <div className="world-map-frame">
            <link
              rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
            />
            <div ref={mapElRef} className="world-map-canvas" aria-label="Interactive thematic map" />

            {activeDef && legend.length > 0 && (
              <div className="map-choropleth-legend" aria-label={`${activeDef.name} legend`}>
                <p className="map-choropleth-legend-title">{activeDef.legendTitle}</p>
                <ul>
                  {legend.map((item) => (
                    <li key={item.label}>
                      <i style={{ background: item.color }} />
                      <span>{item.label}</span>
                    </li>
                  ))}
                  <li>
                    <i style={{ background: NO_DATA_FILL }} />
                    <span>No data</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <p className="map-student-tip">
            <strong>Try this:</strong> Switch layers and look for patterns — coasts vs interiors,
            wealth vs density — then click a country to dig in.
          </p>
        </div>
      </div>

      <CountryInfoModal
        country={selected}
        geoName={unknownName}
        activeLayerId={activeLayerId}
        onClose={closeModal}
      />
    </div>
  );
}

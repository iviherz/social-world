'use client';
import {countryName} from '@/lib/i18n';


import { useLocale } from '@/components/LocaleProvider';
import { useEffect, useMemo, useState } from 'react';
import { geoEqualEarth, geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import countries from '@/lib/data/countries.json';
import type { State } from '@/lib/types';
const names = new Map(countries.map(c => [c.numeric, c]));
export function WorldMap({
  states,
  color = '#61122B',
  onSelect,
  globe = false,
  others = [],
  filter = 'visited',
  comparison = false
}: {
  states: State[];
  color?: string;
  onSelect?: (code: string) => void;
  globe?: boolean;
  others?: {
    states: State[];
    color: string;
    name: string;
  }[];
  filter?: 'visited' | 'wishlist';
  comparison?: boolean;
}) {
  const {
    locale,
    tr
  } = useLocale();
  const [atlas, setAtlas] = useState<FeatureCollection<Geometry> | null>(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    fetch('/data/world.json', {
      signal: c.signal
    }).then(r => {
      if (!r.ok) throw Error();
      return r.json();
    }).then(a => setAtlas(feature(a as Topology, a.objects.countries as GeometryCollection) as FeatureCollection<Geometry>)).catch(e => {
      if (e.name !== 'AbortError') setError(true);
    });
    return () => c.abort();
  }, []);
  const projection = useMemo(() => globe ? geoOrthographic().scale(210).translate([440, 230]).rotate([rotation, -15]) : geoEqualEarth().fitExtent([[15, 20], [865, 425]], {
    type: 'Sphere'
  }), [globe, rotation]);
  const path = geoPath(projection);
  const own = new Map(states.map(s => [s.country_code, s]));
  if (error) return <p role="alert">{tr("No pudimos cargar el mapa. Podés usar la lista de países.")}</p>;
  return <div className={'map-frame ' + (globe ? 'globe' : '')}>
 {!atlas ? <p className="map-loading">{tr("Cargando el mundo…")}</p> : <svg viewBox="0 0 880 460" className="world-map" aria-label={globe ? tr("Globo de tu mundo") : tr("Mapa Equal Earth de tu mundo")}>
 <defs>{others.map((o, i) => <pattern key={i} id={'peer-' + i} width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill={o.color} /><path d="M0 4H8" stroke="#FAF6EB" strokeWidth="2" /></pattern>)}<pattern id="common" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#FFD983" /><path d="M0 7L7 0" stroke="#61122B" strokeWidth="1" /></pattern><pattern id="wish" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#F0D7D0" /><circle cx="3" cy="3" r="1" fill="#61122B" /></pattern></defs>
 <path d={path({
        type: 'Sphere'
      }) || ''} fill="#F4EDDF" stroke="#C9C1AA" /><path d={path(geoGraticule10()) || ''} fill="none" stroke="#DCD4C2" strokeWidth="0.5" />
 {atlas.features.map(f => {
        const c = names.get(String(f.id));
        if (!c || c.code === 'ATA') return null;
        const s = own.get(c.code);
        const matches = others.filter(o => o.states.some(x => x.country_code === c.code && x[filter]));
        const mine = comparison ? s?.[filter] : s?.visited;
        const shared = Boolean(mine && matches.length) || matches.length > 1;
        const fill = shared ? 'url(#common)' : mine ? color : matches.length ? matches[0].color === color ? 'url(#peer-' + others.indexOf(matches[0]) + ')' : matches[0].color : !comparison && s?.wishlist ? 'url(#wish)' : '#E4DDCA';
        const description = `${countryName(c,locale)}${s?.visited ? ', '+tr('Visitado') : ''}${s?.wishlist ? ', '+tr('Quiero ir') : ''}${matches.length ? ', ' + matches.map(m => m.name).join(', ') : ''}`;
        return <path key={c.code} d={path(f) || ''} fill={fill} stroke={fill === '#E4DDCA' ? '#74745B' : '#FAF6EB'} strokeWidth="0.8" role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={description} onClick={() => onSelect?.(c.code)} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(c.code);
          }
        }}><title>{description}</title></path>;
      })}
 </svg>}
 {globe && <label className="rotation">{tr("Girar el globo ")}<input type="range" min="-180" max="180" value={rotation} onChange={e => setRotation(Number(e.target.value))} /></label>}
 <p className="map-source">{tr("Natural Earth · Equal Earth")}{globe ? ' / Orthographic' : ''}{tr(" · Los territorios pequeños también están en la lista.")}</p>
 </div>;
}

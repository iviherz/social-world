'use client';
import {countryName} from '@/lib/i18n';


import { useLocale } from '@/components/LocaleProvider';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Brand } from './Brand';
import { WorldMap } from './WorldMap';
import countries from '@/lib/data/countries.json';
import { categories, tags, durationTotals } from '@/lib/schema';
import { emptyWorld, type WorldData, type Profile, type State } from '@/lib/types';
const views = [['world', 'Mi mundo'], ['discover', 'Descubrir'], ['collections', 'Colecciones'], ['people', 'Co-Travelers'], ['compare', 'Mapamundi'], ['inbox', 'Mensajes'], ['hours', 'Horas privadas'], ['settings', 'Mi perfil']] as const;
type View = typeof views[number][0];
function text(form: FormData, key: string) {
  return String(form.get(key) || '');
}
function time(minutes: number, locale: string, tr:(s:string)=>string) {
  return `${new Intl.NumberFormat(locale).format(Math.floor(minutes / 60))} ${tr("h")} ${new Intl.NumberFormat(locale).format(minutes % 60)} ${tr("min")}`;
}
export function Dashboard({
  preview = false,
  brand = 'Tu mundo'
}: {
  preview?: boolean;
  brand?: string;
}) {
  const {
    locale,
    tr
  } = useLocale();
  const [data, setData] = useState<WorldData>(emptyWorld);
  const [view, setView] = useState<View>('world');
  const [loading, setLoading] = useState(!preview);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [globe, setGlobe] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [person, setPerson] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [filter, setFilter] = useState<'visited' | 'wishlist'>('visited');
  const [collection, setCollection] = useState('');
  const [period, setPeriod] = useState('month');
  const [hours, setHours] = useState<{
    preferences: {
      hours_enabled: boolean;
    };
    durations: {
      id: string;
      minutes: number;
      mode: string;
    }[];
  }>({
    preferences: {
      hours_enabled: false
    },
    durations: []
  });
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const load = useCallback(async () => {
    if (preview) return;
    setLoading(true);
    try {
      const r = await fetch('/api/world?period=' + period, {
        cache: 'no-store'
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No pudimos cargar tu mundo."));
    } finally {
      setLoading(false);
    }
  }, [preview, period]);
  const loadHours = useCallback(async () => {
    if (preview) return;
    try {
      const r = await fetch('/api/world?scope=private', {
        cache: 'no-store'
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      setHours(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No pudimos cargar tus horas."));
    }
  }, [preview]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (view === 'hours' || view === 'settings') void loadHours();
  }, [view, loadHours]);
  const me = data.profiles.find(p => p.id === data.userId) || emptyWorld.profiles[0];
  const mine = data.follows.filter(f => f.follower_id === data.userId).map(f => f.following_id);
  const cotravelers = data.profiles.filter(p => mine.includes(p.id) && data.follows.some(f => f.follower_id === p.id && f.following_id === data.userId));
  const state = data.states.find(s => s.country_code === selected);
  const country = countries.find(c => c.code === selected);
  const totals = durationTotals(hours.durations);
  async function act(payload: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    setError('');
    setNotice('');
    if (preview) {
      if (payload.action === 'country') {
        setData(d => ({
          ...d,
          states: [...d.states.filter(s => s.country_code !== payload.country_code), {
            country_code: String(payload.country_code),
            visited: Boolean(payload.visited),
            wishlist: Boolean(payload.wishlist)
          }]
        }));
        setNotice(tr("Cambio de prueba. No se guardó en una cuenta."));
        setBusy(false);
        return true;
      }
      setError(tr("Esta es una vista de prueba. Iniciá sesión en la app configurada para guardar."));
      setBusy(false);
      return false;
    }
    try {
      const r = await fetch('/api/world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      if (payload.action === 'delete_account') {
        location.href = '/';
        return true;
      }
      setNotice('Guardado.');
      await load();
      if (['duration', 'delete_duration', 'profile'].includes(String(payload.action))) await loadHours();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo guardar."));
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>, fn: (form: FormData) => Record<string, unknown>) {
    e.preventDefault();
    const el = e.currentTarget;
    if (await act(fn(new FormData(el)))) el.reset();
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const f = new FormData();
      f.set('file', file);
      const r = await fetch('/api/media', {
        method: 'POST',
        body: f
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      setImagePath(j.path);
      setNotice(tr("Foto procesada. Publicá la recomendación para asociarla."));
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo cargar la foto."));
    } finally {
      setBusy(false);
    }
  }
  function save(type: string, id: string) {
    if (!collection) {
      setError(tr("Elegí una colección primero. Podés crearla en Colecciones."));
      return;
    }
    void act({
      action: 'save',
      collection_id: collection,
      target_type: type,
      target_id: id
    });
  }
  function Saver() {
    return <label className="compact">{tr("Guardar en ")}<select value={collection} onChange={e => setCollection(e.target.value)}><option value="">{tr("Elegí una colección")}</option>{data.collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>;
  }
  function Report({
    type,
    id
  }: {
    type: string;
    id: string;
  }) {
    return <details className="report"><summary>{tr("Reportar")}</summary><form onSubmit={e => submit(e, f => ({
        action: 'report',
        target_type: type,
        target_id: id,
        reason: text(f, 'reason')
      }))}><label>{tr("Motivo")}<textarea name="reason" required maxLength={500} /></label><button disabled={busy}>{tr("Enviar reporte")}</button></form></details>;
  }
  const profiles = new Map(data.profiles.map(p => [p.id, p]));
  const places = new Map(data.places.map(p => [p.id, p]));
  function Recommendation({
    id
  }: {
    id: string;
  }) {
    const r = data.recommendations.find(r => r.id === id);
    if (!r) return <p>{tr("Contenido no disponible.")}</p>;
    const p = places.get(r.place_id);
    const a = profiles.get(r.author_id);
    const rep = data.reputation.find(v => v.recommendation_id === r.id);
    const helpful = data.votes.some(v => v.recommendation_id === r.id);
    return <article className="recommendation">
 <div className="recommendation-top"><span className="eyebrow">{tr(r.category)} · {r.verdict === 'recommend' ? tr("Recommend") : tr("Skip")}</span><span>{p?.city || countryName(countries.find(c => c.code === p?.country_code),locale)}</span></div>
 <h3>{p?.name || tr("Lugar no disponible")}</h3><p className="byline">{tr("Por ")}{a?.name || tr("Perfil no disponible")}</p><p className="tip" dir="auto">{r.tip}</p>{r.image_path && <img className="recommendation-photo" src={'/api/media?path=' + encodeURIComponent(r.image_path)} alt={tr('Foto de ') + (p?.name || tr('un lugar'))} />}<div className="actions"><button disabled={busy} onClick={() => save('recommendation', r.id)}>{tr("Guardar")}</button><button disabled={busy} onClick={() => p && act({
          action: 'place_state',
          place_id: p.id,
          visited: data.placeStates.find(s => s.place_id === p.id)?.visited || false,
          wishlist: true
        })}>{tr("Quiero ir")}</button>{r.author_id !== data.userId && <button disabled={busy} aria-pressed={helpful} onClick={() => act({
          action: 'helpful',
          recommendation_id: r.id,
          enabled: !helpful
        })}>{helpful ? tr("Marcado como útil") : tr("Me sirvió")}{Number(rep?.helpful) > 0 ? ' · ' + rep?.helpful : ''}</button>}{r.image_path && <button onClick={() => save('media', r.id)}>{tr("Guardar foto")}</button>}{r.author_id === data.userId && <button disabled={busy} onClick={() => act({
          action: 'delete_recommendation',
          id: r.id
        })}>{tr("Eliminar consejo")}</button>}</div>
 <details className="comments"><summary>{tr("Comentarios (")}{data.comments.filter(c => c.recommendation_id === r.id).length})</summary>{data.comments.filter(c => c.recommendation_id === r.id).map(c => <div key={c.id} className="comment"><strong>{profiles.get(c.author_id)?.name}</strong><p dir="auto">{c.body}</p><button onClick={() => save('comment', c.id)}>{tr("Guardar comentario")}</button>{c.author_id === data.userId ? <button disabled={busy} onClick={() => act({
            action: 'delete_comment',
            id: c.id
          })}>{tr("Eliminar")}</button> : <Report type="comment" id={c.id} />}</div>)}<form onSubmit={e => submit(e, f => ({
          action: 'comment',
          recommendation_id: r.id,
          body: text(f, 'body')
        }))}><label>{tr("Sumá algo útil")}<textarea name="body" maxLength={700} required /></label><button disabled={busy}>{tr("Comentar")}</button></form></details>{r.author_id !== data.userId && <Report type="recommendation" id={r.id} />}</article>;
  }
  const comparison = participants.map(id => profiles.get(id)).filter((p): p is Profile => Boolean(p)).map(p => ({
    states: data.shared[p.id] || [],
    color: p.color,
    name: p.name
  }));
  const both = data.states.filter(s => s[filter] && comparison.length && comparison.every(p => p.states.some(x => x.country_code === s.country_code && x[filter])));
  return <div className="app-shell">
 <aside className={'sidebar ' + (menu ? 'open' : '')}><Link href="/" aria-label={tr("Inicio")}><Brand name={brand} /></Link><button className="mobile-toggle" onClick={() => setMenu(!menu)} aria-expanded={menu}>{tr("Menú")}</button><nav aria-label={tr("Principal")}>{views.map(([id, label]) => <button key={id} aria-current={view === id ? 'page' : undefined} onClick={() => {
          setView(id);
          setSearch('');
          setMenu(false);
          setError('');
          setNotice('');
        }}>{tr(label)}</button>)}</nav><div className="sidebar-bottom"><p>{tr("Un mundo propio.")}<br />{tr("Muchas formas de verlo.")}</p>{preview ? <Link href="/">{tr("Volver al inicio")}</Link> : <form action="/auth/logout" method="post"><button>{tr("Salir de mi cuenta")}</button></form>}<Link href="/privacy">{tr("Privacidad")}</Link></div></aside>
 <main className="workspace" id="main"><header className="workspace-top"><span>{preview ? tr("Vista de prueba · sin cuenta ni persistencia") : tr('El mundo de ') + me.name}</span><span className="private-note">{tr("Sin fechas. Sin ubicación en vivo.")}</span></header>
 {preview && <p className="preview-banner">{tr("Explorá el mapa. Los cambios de esta vista se pierden al recargar.")}</p>}
 <div className="feedback" aria-live="polite">{notice && <p className="success">{tr(notice)}</p>}{error && <p role="alert" className="error">{tr(error)}</p>}</div>
 {loading && <p role="status">{tr("Cargando tu mundo…")}</p>}
 {view === 'world' && <>
 <div className="section-heading"><div><p className="eyebrow">{tr("Tu atlas personal")}</p><h1>{tr("El mundo,")}<br />{tr("a tu manera.")}</h1></div><div className="world-stats"><strong>{data.states.filter(s => s.visited).length}</strong><span>{tr("países y territorios")}<br />{tr("marcados como visitados")}</span><strong>{data.states.filter(s => s.wishlist).length}</strong><span>{tr("en tu wishlist")}</span></div></div>
 <div className="map-toolbar"><div className="segmented"><button aria-pressed={!globe} onClick={() => setGlobe(false)}>{tr("Mapa")}</button><button aria-pressed={globe} onClick={() => setGlobe(true)}>{tr("Globo")}</button></div><span className="legend"><i style={{
              background: me.color
            }} />{tr("Visitados ")}<i className="wish-swatch" />{tr("Quiero ir")}</span></div>
 <WorldMap states={data.states} color={me.color} globe={globe} onSelect={setSelected} />
 <div className="world-bottom"><section className="country-list"><h2>{tr("Un lugar para empezar")}</h2><label>{tr("Buscar país o territorio")}<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={tr("Nombre del país")} /></label><div className="country-buttons">{countries.filter(c => countryName(c,locale).toLocaleLowerCase(locale).includes(search.toLocaleLowerCase(locale))).map(c => <button key={c.code} aria-pressed={selected === c.code} onClick={() => setSelected(c.code)}>{countryName(c,locale)}<span>{data.states.find(s => s.country_code === c.code)?.visited ? tr("Visitado") : data.states.find(s => s.country_code === c.code)?.wishlist ? tr("Quiero ir") : '+'}</span></button>)}</div></section>
 <section className="country-detail">{country ? <><p className="eyebrow">{tr("En tu mundo")}</p><h2>{countryName(country,locale)}</h2><p>{tr("Marcá lo que conocés y lo que te gustaría conocer. No hace falta una fecha.")}</p><label className="check"><input type="checkbox" disabled={busy} checked={state?.visited || false} onChange={e => act({
                  action: 'country',
                  country_code: selected,
                  visited: e.target.checked,
                  wishlist: state?.wishlist || false
                })} />{tr("Lo visité")}</label><label className="check"><input type="checkbox" disabled={busy} checked={state?.wishlist || false} onChange={e => act({
                  action: 'country',
                  country_code: selected,
                  visited: state?.visited || false,
                  wishlist: e.target.checked
                })} />{tr("Quiero ir o volver")}</label><button onClick={() => {
                setView('discover');
                setSearch(countryName(country,locale));
              }}>{tr("Explorar recomendaciones")}</button><p className="small">{tr("Los lugares se marcan por separado. Agregar un lugar no declara una visita a todo el país.")}</p></> : <><p className="eyebrow">{tr("Sin apuro")}</p><h2>{tr("Elegí un país.")}</h2><p>{tr("En el mapa o en la lista. Tu wishlist puede convivir con los lugares que ya conocés.")}</p><svg width="120" height="60" viewBox="0 0 120 60" aria-hidden="true"><path d="M110 10Q55 0 20 45m0 0 2-20m-2 20 23-3" stroke="#61122B" fill="none" strokeWidth="2" /></svg></>}</section></div>
 {data.placeStates.length > 0 && <section><h2>{tr("Tus lugares")}</h2>{data.placeStates.map(s => <div className="list-row" key={s.place_id}><span>{places.get(s.place_id)?.name || tr("Lugar no disponible")}</span><label className="check"><input type="checkbox" checked={s.visited} onChange={e => act({
                action: 'place_state',
                place_id: s.place_id,
                visited: e.target.checked,
                wishlist: s.wishlist
              })} />{tr("Visitado")}</label><label className="check"><input type="checkbox" checked={s.wishlist} onChange={e => act({
                action: 'place_state',
                place_id: s.place_id,
                visited: s.visited,
                wishlist: e.target.checked
              })} />{tr("Quiero ir")}</label></div>)}</section>}
 </>}
 {view === 'discover' && <><p className="eyebrow">{tr("Consejos con nombre y lugar")}</p><h1>{tr("Vale la pena")}<br />{tr("compartirlo.")}</h1><div className="filter-row"><label>{tr("Buscar lugar, país o consejo")}<input type="search" value={search} onChange={e => setSearch(e.target.value)} /></label><Saver /><label>{tr("Utilidad")}<select value={period} onChange={e => setPeriod(e.target.value)}><option value="week">{tr("Esta semana")}</option><option value="month">{tr("Este mes")}</option></select></label></div>
 <div className="discovery-layout"><section><h2>{tr("De la comunidad")}</h2>{data.recommendations.length === 0 ? <p className="empty">{tr("Todavía no hay consejos disponibles. El primero puede ser tuyo.")}</p> : data.recommendations.filter(r => {
              const p = places.get(r.place_id);
              const hay = [p?.name, p?.city, countryName(countries.find(c => c.code === p?.country_code),locale), r.tip, tr(r.category)].join(' ').toLowerCase();
              return hay.includes(search.toLowerCase());
            }).sort((a, b) => Number(data.reputation.find(x => x.recommendation_id === b.id)?.helpful || 0) - Number(data.reputation.find(x => x.recommendation_id === a.id)?.helpful || 0)).map(r => <Recommendation key={r.id} id={r.id} />)}
 {data.reputation.some(r => Number(r.helpful) > 0 || Number(r.saves) > 0) && <section className="community-utility"><h2>{tr("Aportes que ayudan")}</h2><p className="small">{tr("Personas distintas, sin votos ni guardados propios. Ventana de ")}{period === 'week' ? '7' : '30'}{tr(" días.")}</p>{data.recommendations.filter(r => {
                const n = data.reputation.find(x => x.recommendation_id === r.id);
                return Number(n?.helpful) > 0 || Number(n?.saves) > 0;
              }).sort((a, b) => {
                const x = data.reputation.find(n => n.recommendation_id === a.id);
                const y = data.reputation.find(n => n.recommendation_id === b.id);
                return Number(y?.helpful || 0) + Number(y?.saves || 0) - Number(x?.helpful || 0) - Number(x?.saves || 0);
              }).slice(0, 5).map(r => {
                const n = data.reputation.find(x => x.recommendation_id === r.id);
                return <div className="list-row" key={r.id}><span>{places.get(r.place_id)?.name} · {profiles.get(r.author_id)?.name}</span><span>{n?.helpful || 0}{tr(" útiles · ")}{n?.saves || 0}{tr(" guardados")}</span></div>;
              })}</section>}{data.recommendations.some(r => mine.includes(r.author_id)) && <section><h2>{tr("De personas que seguís")}</h2>{data.recommendations.filter(r => mine.includes(r.author_id)).map(r => <Recommendation key={r.id} id={r.id} />)}</section>}</section>
 <section className="contribution"><h2>{tr("Dejá un consejo")}</h2><p>{tr("Un lugar concreto, un detalle útil. Evitá compartir tu ubicación actual.")}</p><details><summary>{tr("Agregar un lugar al catálogo")}</summary><form onSubmit={e => submit(e, f => ({
                action: 'place',
                name: text(f, 'name'),
                city: text(f, 'city'),
                country_code: text(f, 'country')
              }))}><label>{tr("Nombre del lugar")}<input name="name" required maxLength={100} /></label><label>{tr("Ciudad")}<input name="city" maxLength={80} /></label><label>{tr("País")}<select name="country" required>{countries.map(c => <option key={c.code} value={c.code}>{countryName(c,locale)}</option>)}</select></label><button disabled={busy}>{tr("Agregar lugar")}</button></form></details>
 <form onSubmit={async e => {
              const ok = await (async () => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                return act({
                  action: 'recommendation',
                  place_id: text(f, 'place'),
                  category: text(f, 'category'),
                  verdict: text(f, 'verdict'),
                  tip: text(f, 'tip'),
                  image_path: imagePath
                });
              })();
              if (ok) setImagePath(null);
            }}><label>{tr("Lugar")}<select name="place" required defaultValue=""><option value="" disabled>{tr("Elegí un lugar")}</option>{data.places.map(p => <option key={p.id} value={p.id}>{p.name} · {p.city}</option>)}</select></label><label>{tr("Categoría")}<select name="category">{categories.map(c => <option key={c} value={c}>{tr(c)}</option>)}</select></label><label>{tr("Tu experiencia")}<select name="verdict"><option value="recommend">{tr("Recommend")}</option><option value="skip">{tr("Skip")}</option></select></label><label>{tr("El consejo")}<textarea name="tip" required maxLength={1500} /></label><label>{tr("Foto opcional · JPG, PNG o WebP, hasta 3 MB")}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || preview} onChange={e => upload(e.target.files?.[0])} /></label>{imagePath && <p>{tr("Foto lista para publicar.")}</p>}<button className="primary" disabled={busy || !data.places.length}>{tr("Publicar consejo")}</button></form>
 <h3>{tr("Lugares del catálogo")}</h3>{data.places.map(p => <div className="catalog-place" key={p.id}><strong>{p.name}</strong><span>{p.city}</span><div className="actions"><button onClick={() => save('place', p.id)}>{tr("Guardar lugar")}</button><button onClick={() => act({
                  action: 'place_state',
                  place_id: p.id,
                  visited: true,
                  wishlist: data.placeStates.find(s => s.place_id === p.id)?.wishlist || false
                })}>{tr("Lo visité")}</button></div></div>)}</section></div></>}
 {view === 'collections' && <><p className="eyebrow">{tr("Guardados privados")}</p><h1>{tr("Para volver")}<br />{tr("a encontrarlo.")}</h1><form className="inline-form" onSubmit={e => submit(e, f => ({
          action: 'collection',
          name: text(f, 'name')
        }))}><label>{tr("Nueva colección")}<input name="name" required maxLength={60} /></label><button disabled={busy}>{tr("Crear colección")}</button></form>{!data.collections.length && <p className="empty">{tr("Guardá lugares, consejos, perfiles, comentarios y fotos juntos. Guardar un perfil no significa seguirlo.")}</p>}{data.collections.map(c => <section className="collection-section" key={c.id}><h2>{c.name}</h2><details><summary>{tr("Editar colección")}</summary><form className="inline-form" onSubmit={e => submit(e, f => ({
              action: 'rename_collection',
              id: c.id,
              name: text(f, 'name')
            }))}><label>{tr("Nombre")}<input name="name" defaultValue={c.name} required maxLength={60} /></label><button disabled={busy}>{tr("Renombrar")}</button><button type="button" disabled={busy} onClick={() => act({
                action: 'delete_collection',
                id: c.id
              })}>{tr("Eliminar colección")}</button></form></details>{data.items.filter(i => i.collection_id === c.id).map(i => <div className="saved-item" key={i.id}>{i.target_type === 'recommendation' ? <Recommendation id={i.target_id} /> : i.target_type === 'profile' ? <p>{tr("Perfil · ")}{profiles.get(i.target_id)?.name || tr("Contenido no disponible")}</p> : i.target_type === 'place' ? <p>{tr("Lugar · ")}{places.get(i.target_id)?.name || tr("Contenido no disponible")}</p> : i.target_type === 'comment' ? <p>{tr("Comentario · ")}{data.comments.find(c => c.id === i.target_id)?.body || tr("Contenido no disponible")}</p> : <>{data.recommendations.find(r => r.id === i.target_id)?.image_path ? <img className="recommendation-photo" src={'/api/media?path=' + encodeURIComponent(data.recommendations.find(r => r.id === i.target_id)!.image_path!)} alt={tr("Foto guardada de una recomendación")} /> : <p>{tr("Contenido no disponible.")}</p>}</>}<button disabled={busy} onClick={() => act({
              action: 'unsave',
              id: i.id
            })}>{tr("Quitar de la colección")}</button></div>)}</section>)}</>}
 {view === 'people' && <><p className="eyebrow">{tr("Las personas detrás del mapa")}</p><h1>{tr("Otros mundos.")}<br />{tr("Puntos en común.")}</h1><p>{tr("Co-Travelers son las personas con quienes se siguen mutuamente.")}</p><div className="filter-row"><label>{tr("Buscar por nombre o usuario")}<input value={search} onChange={e => setSearch(e.target.value)} type="search" /></label><Saver /></div>{data.profiles.filter(p => p.id !== data.userId && (p.name + ' ' + p.username).toLowerCase().includes(search.toLowerCase())).map(p => <article className="person" key={p.id}>{p.avatar_path ? <img src={'/api/media?path=' + encodeURIComponent(p.avatar_path)} alt={tr('Avatar de ') + p.name} /> : <span className="avatar" style={{
            background: p.color,
            color: p.color === '#B46A6A' ? '#333700' : '#FAF6EB'
          }}>{p.name.slice(0, 1)}</span>}<div><h2><Link href={'/u/' + p.username}>{p.name}</Link></h2><p>@{p.username}</p><p>{p.bio}</p><p>{p.tags.map(tr).join(' · ')}</p>{cotravelers.some(c => c.id === p.id) && <><strong>{tr("Co-Traveler")}</strong>{p.ask_about.length > 0 && <p>{tr("Ask me about · ")}{p.ask_about.join(', ')}</p>}</>}<div className="actions"><button disabled={busy} onClick={() => act({
                action: 'follow',
                target: p.id,
                enabled: !mine.includes(p.id)
              })}>{mine.includes(p.id) ? tr("Dejar de seguir") : tr("Seguir")}</button><button onClick={() => save('profile', p.id)}>{tr("Guardar perfil")}</button>{cotravelers.some(c => c.id === p.id) && <><button onClick={() => {
                  setPerson(p.id);
                  setView('inbox');
                }}>{tr("Escribir")}</button><button onClick={() => {
                  setParticipants([p.id]);
                  setView('compare');
                }}>{tr("Ver Overlap")}</button></>}<button disabled={busy} onClick={() => act({
                action: 'block',
                target: p.id,
                enabled: true
              })}>{tr("Bloquear")}</button></div><Report type="profile" id={p.id} /></div></article>)}{data.profiles.length <= 1 && <p className="empty">{tr("Todavía no hay perfiles visibles. Los perfiles privados aparecen cuando existe un vínculo autorizado.")}</p>}{data.blocks.length > 0 && <section><h2>{tr("Perfiles bloqueados")}</h2>{data.blocks.map(b => <div key={b.blocked_id} className="list-row"><span>{tr("Perfil bloqueado")}</span><button onClick={() => act({
              action: 'block',
              target: b.blocked_id,
              enabled: false
            })}>{tr("Desbloquear")}</button></div>)}</section>}</>}
 {view === 'compare' && <><p className="eyebrow">{participants.length === 1 ? 'Overlap' : 'Mapamundi'}</p><h1>{tr("Donde nuestros")}<br />{tr("mundos se cruzan.")}</h1><p>{tr("Solo aparecen los estados que cada persona eligió compartir.")}</p><fieldset className="participants"><legend>{tr("Elegí tus Co-Travelers · hasta 30")}</legend>{cotravelers.map(p => <label className="check" key={p.id}><input type="checkbox" checked={participants.includes(p.id)} onChange={e => setParticipants(ids => e.target.checked ? [...ids, p.id].slice(0, 30) : ids.filter(id => id !== p.id))} />{p.name}</label>)}{!cotravelers.length && <p>{tr("El mapa colectivo estará disponible cuando tengas Co-Travelers.")}</p>}</fieldset><div className="segmented"><button aria-pressed={filter === 'visited'} onClick={() => setFilter('visited')}>{tr("Visitados")}</button><button aria-pressed={filter === 'wishlist'} onClick={() => setFilter('wishlist')}>{tr("Quiero ir")}</button></div><WorldMap states={data.states} color={me.color} others={comparison} comparison filter={filter} onSelect={setSelected} /><div className="legend"><span><i style={{
              background: me.color
            }} />{me.name}</span>{comparison.map(p => <span key={p.name}><i style={{
              background: p.color
            }} />{p.name}</span>)}<span><i className="shared-swatch" />{tr("Coincidencias · rayado")}</span></div><p>{both.length}{tr(" países o territorios ")}{filter === 'visited' ? tr('visitados') : tr('deseados')}{tr(" en común con todos los participantes seleccionados.")}</p>{country && <section><h2>{countryName(country,locale)}</h2><ul>{[{
              name: me.name,
              states: data.states
            }, ...comparison].filter(p => p.states.some(s => s.country_code === selected && s[filter])).map(p => <li key={p.name}>{p.name} · {filter === 'visited' ? tr("Visitado") : tr("Quiero ir")}</li>)}</ul></section>}{comparison.length === 1 && <div className="comparison-lists"><section><h2>{tr("En común")}</h2><p>{both.map(s => countryName(countries.find(c => c.code === s.country_code),locale)).join(', ') || tr("Sin coincidencias compartidas.")}</p></section><section><h2>{tr("Solo en tu mundo")}</h2><p>{data.states.filter(s => s[filter] && !comparison[0].states.some(x => x.country_code === s.country_code && x[filter])).map(s => countryName(countries.find(c => c.code === s.country_code),locale)).join(', ') || tr("Sin países.")}</p></section><section><h2>{tr("Solo en el otro mundo")}</h2><p>{comparison[0].states.filter(s => s[filter] && !data.states.some(x => x.country_code === s.country_code && x[filter])).map(s => countryName(countries.find(c => c.code === s.country_code),locale)).join(', ') || tr("Sin países.")}</p></section></div>}</>}
 {view === 'inbox' && <><p className="eyebrow">{tr("Entre Co-Travelers")}</p><h1>{tr("Una pregunta")}<br />{tr("puede abrir un mundo.")}</h1><label>{tr("Conversación")}<select value={person} onChange={e => setPerson(e.target.value)}><option value="">{tr("Elegí una persona")}</option>{cotravelers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{person && cotravelers.some(p => p.id === person) && <><div className="thread">{data.messages.filter(m => m.sender_id === person && m.recipient_id === data.userId || m.sender_id === data.userId && m.recipient_id === person).sort((a, b) => a.sequence - b.sequence).map(m => <div className={'message ' + (m.sender_id === data.userId ? 'mine' : '')} key={m.id}><strong>{profiles.get(m.sender_id)?.name}</strong><p dir="auto">{m.body}</p></div>)}</div><form onSubmit={e => submit(e, f => ({
            action: 'message',
            recipient_id: person,
            body: text(f, 'body')
          }))}><label>{tr("Tu mensaje")}<textarea name="body" required maxLength={2000} /></label><button disabled={busy} className="primary">{tr("Enviar")}</button><button type="button" onClick={() => load()}>{tr("Actualizar conversación")}</button></form></>}{!cotravelers.length && <p className="empty">{tr("La mensajería se habilita cuando el seguimiento es mutuo.")}</p>}<p className="small">{tr("Sin estado online, última conexión ni confirmaciones de lectura. El historial deja de estar disponible si se rompe el vínculo o existe un bloqueo.")}</p></>}
 {view === 'hours' && <><p className="eyebrow">{tr("Solo para vos")}</p><h1>{tr("El tiempo")}<br />{tr("en movimiento.")}</h1><p>{tr("Estas horas nunca aparecen en perfiles, comparaciones o rankings.")}</p>{hours.preferences.hours_enabled ? <><div className="hours-totals"><div><strong>{time(totals.trip,locale,tr)}</strong><span>{tr("Trip hours · traslados")}</span></div><div><strong>{time(totals.flight,locale,tr)}</strong><span>{tr("Flight hours · incluidas en Trip hours")}</span></div></div><p>{tr("Sumamos tiempo de traslado. Las esperas quedan fuera. No guardamos origen, destino ni fechas.")}</p><form className="duration-form" onSubmit={e => submit(e, f => ({
            action: 'duration',
            id: crypto.randomUUID(),
            minutes: Number(text(f, 'hours')) * 60 + Number(text(f, 'minutes')),
            mode: text(f, 'mode')
          }))}><label>{tr("Horas")}<input name="hours" type="number" min="0" max="999" defaultValue="0" required /></label><label>{tr("Minutos")}<input name="minutes" type="number" min="0" max="59" defaultValue="0" required /></label><label>{tr("Transporte")}<select name="mode"><option value="flight">{tr("Vuelo")}</option><option value="train">{tr("Tren")}</option><option value="road">{tr("Ruta")}</option><option value="boat">{tr("Barco")}</option><option value="other">{tr("Otro")}</option></select></label><button disabled={busy}>{tr("Agregar duración")}</button></form>{hours.durations.map(d => <div className="duration-entry" key={d.id}><span>{tr(d.mode)} · {time(d.minutes,locale,tr)}</span><details><summary>{tr("Editar")}</summary><form className="inline-form" onSubmit={e => submit(e, f => ({
                action: 'duration',
                id: d.id,
                minutes: Number(text(f, 'minutes')),
                mode: d.mode
              }))}><label>{tr("Minutos totales")}<input type="number" name="minutes" min="1" max="60000" defaultValue={d.minutes} required /></label><button disabled={busy}>{tr("Guardar")}</button></form></details><button disabled={busy} onClick={() => act({
              action: 'delete_duration',
              id: d.id
            })}>{tr("Eliminar")}</button></div>)}</> : <div className="empty"><h2>{tr("Vos elegís activarlo.")}</h2><p>{tr("Habilitá las horas privadas desde Mi perfil. No es necesario para usar el mapa.")}</p><button onClick={() => setView('settings')}>{tr("Ir a Mi perfil")}</button></div>}<p className="small">{tr("Carga manual disponible. La estimación externa sigue pendiente de elegir un proveedor y revisar qué datos recibe.")}</p></>}
 {view === 'settings' && <><p className="eyebrow">{tr("Tu identidad, tus decisiones")}</p><h1>{tr("Elegí qué")}<br />{tr("compartir.")}</h1><form key={me.id + me.username + String(hours.preferences.hours_enabled)} className="profile-form" onSubmit={e => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void act({
            action: 'profile',
            name: text(f, 'name'),
            username: text(f, 'username'),
            bio: text(f, 'bio'),
            color: text(f, 'color'),
            visibility: text(f, 'visibility'),
            share_visited: f.has('share_visited'),
            share_wishlist: f.has('share_wishlist'),
            tags: f.getAll('tags'),
            ask_about: text(f, 'ask').split(',').map(s => s.trim()).filter(Boolean),
            hours_enabled: f.has('hours_enabled'),
            avatar_path: imagePath || me.avatar_path
          });
        }}><div className="form-grid"><label>{tr("Nombre")}<input name="name" defaultValue={me.name} required maxLength={60} /></label><label>{tr("Usuario")}<input name="username" defaultValue={me.username} pattern="[a-z0-9_]{3,24}" minLength={3} maxLength={24} required /></label></div><label>{tr("Bio")}<textarea name="bio" defaultValue={me.bio} maxLength={300} /></label><div className="form-grid"><label>{tr("Tu color")}<select name="color" defaultValue={me.color}><option value="#61122B">{tr("Ciruela")}</option><option value="#333700">{tr("Oliva")}</option><option value="#B46A6A">{tr("Rosa antiguo")}</option><option value="#537A65">{tr("Bosque")}</option><option value="#355C7D">{tr("Azul tinta")}</option></select></label><label>{tr("Visibilidad del perfil")}<select name="visibility" defaultValue={me.visibility}><option value="private">{tr("Solo vos y tus Co-Travelers")}</option><option value="public">{tr("Personas registradas")}</option></select></label></div><label>{tr("Avatar opcional")}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => upload(e.target.files?.[0])} disabled={preview || busy} /></label><fieldset><legend>{tr("Tags personales · hasta 6")}</legend><div className="tags">{tags.map(t => <label className="check" key={t}><input type="checkbox" name="tags" value={t} defaultChecked={me.tags.includes(t)} />{tr(t)}</label>)}</div></fieldset><label>{tr("Ask me about · hasta 5 lugares, separados por coma")}<input name="ask" defaultValue={me.ask_about.join(', ')} maxLength={400} /></label><fieldset><legend>{tr("Compartir estados con quienes pueden ver tu perfil")}</legend><label className="check"><input type="checkbox" name="share_visited" defaultChecked={me.share_visited} />{tr("Compartir países y lugares visitados")}</label><label className="check"><input type="checkbox" name="share_wishlist" defaultChecked={me.share_wishlist} />{tr("Compartir wishlist")}</label></fieldset><label className="check"><input type="checkbox" name="hours_enabled" defaultChecked={hours.preferences.hours_enabled} />{tr("Habilitar horas privadas, solo para mí")}</label><button className="primary" disabled={busy}>{tr("Guardar perfil y preferencias")}</button></form><section className="account-tools"><h2>{tr("Tus datos")}</h2><a href="/api/export">{tr("Descargar mis datos")}</a><details><summary>{tr("Eliminar mi cuenta")}</summary><p>{tr("Se eliminarán tus datos y archivos. Esta acción no se puede deshacer.")}</p><form onSubmit={e => submit(e, f => ({
              action: 'delete_account',
              confirmation: text(f, 'confirmation')
            }))}><label>{tr("Escribí BORRAR MI CUENTA")}<input name="confirmation" required pattern="BORRAR MI CUENTA" /></label><button disabled={busy}>{tr("Eliminar definitivamente")}</button></form></details></section></>}
 <footer className="workspace-footer"><span>{brand==='Tu mundo'?tr(brand):brand} · {new Date().getFullYear()}</span><Link href="/terms">{tr("Términos")}</Link><Link href="/privacy">{tr("Privacidad")}</Link></footer>
 </main></div>;
}

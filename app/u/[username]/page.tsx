import {countryName} from '@/lib/i18n';
import {getLocale} from '@/lib/i18n/server';
import { getTranslator } from '@/lib/i18n/server';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { configured } from '@/lib/env';
import { WorldMap } from '@/components/WorldMap';
import type { State } from '@/lib/types';
export const dynamic = 'force-dynamic';
export async function generateMetadata(){const tr=await getTranslator();return {
  title: tr('Un mundo compartido'),
  robots: {
    index: false,
    follow: false
  }
};}
export default async function ProfilePage({
  params
}: {
  params: Promise<{
    username: string;
  }>;
}) {
  const tr = await getTranslator();const locale=await getLocale();
  if (!configured()) redirect('/');
  const client = await db();
  const {
    data: {
      user
    }
  } = await client.auth.getUser();
  if (!user) redirect('/');
  const {
    username
  } = await params;
  if (!/^[a-z0-9_]{3,24}$/.test(username)) notFound();
  const {
    data: p
  } = await client.from('profiles').select('id,username,name,bio,color,tags,ask_about,avatar_path').eq('username', username).maybeSingle();
  if (!p) notFound();
  const [states, co, recs, placeStates] = await Promise.all([client.rpc('shared_states', {
    target: p.id
  }), client.rpc('my_cotraveler', {
    target: p.id
  }), client.from('recommendations').select('id,tip,category,verdict,place_id,image_path,places(name,city)').eq('author_id', p.id).limit(100), client.rpc('shared_place_states', {
    target: p.id
  })]);
  const visiblePlaces = placeStates.data?.length ? await client.from('places').select('id,name,city').in('id', placeStates.data.map((s: {
    place_id: string;
  }) => s.place_id)) : {
    data: []
  };
  return <main id="main" className="profile-page"><Link href="/world">{tr("Volver a mi mundo")}</Link><p className="eyebrow">{tr("Un mundo compartido")}</p><header className="public-profile-heading">{p.avatar_path && <img src={'/api/media?path=' + encodeURIComponent(p.avatar_path)} alt={tr('Avatar de ') + p.name} />}<div><h1>{p.name}</h1><p>@{p.username}</p><p>{p.bio}</p><p>{p.tags.map((tag:string)=>tr(tag)).join(' · ')}</p>{co.data && p.ask_about.length > 0 && <p>{tr("Ask me about · ")}{p.ask_about.join(', ')}</p>}</div></header><p className="small">{tr("Este mapa solo muestra los estados que esta persona eligió compartir.")}</p><WorldMap states={(states.data || []) as State[]} color={p.color} />{placeStates.data?.length > 0 && <section><h2>{tr("Lugares compartidos")}</h2>{placeStates.data.map((s: {
        place_id: string;
        visited: boolean;
        wishlist: boolean;
      }) => <div className="list-row" key={s.place_id}><span>{visiblePlaces.data?.find(v => v.id === s.place_id)?.name || tr("Lugar no disponible")}</span><span>{s.visited ? tr("Visitado") : ''}{s.visited && s.wishlist ? ' · ' : ''}{s.wishlist ? tr("Quiero ir") : ''}</span></div>)}</section>}<h2>{tr("Consejos compartidos")}</h2>{!recs.data?.length && <p>{tr("No hay consejos disponibles.")}</p>}{recs.data?.map(r => <article key={r.id} className="recommendation"><p className="eyebrow">{tr(r.category)} · {r.verdict === 'recommend' ? tr("Recommend") : tr("Skip")}</p><h3>{(r.places as unknown as {
          name: string;
        } | null)?.name || tr("Lugar")}</h3><p className="tip" dir="auto">{r.tip}</p>{r.image_path && <img className="recommendation-photo" src={'/api/media?path=' + encodeURIComponent(r.image_path)} alt={tr("Foto del lugar recomendado")} />}</article>)}</main>;
}

import { getTranslator } from '@/lib/i18n/server';
import Link from 'next/link';
import { Brand } from '@/components/Brand';
import { WorldMap } from '@/components/WorldMap';
import { configured, registrationOpen } from '@/lib/env';
export default async function Home({
  searchParams
}: {
  searchParams: Promise<{
    notice?: string;
  }>;
}) {
  const tr = await getTranslator();
  const {
    notice
  } = await searchParams;
  const name = process.env.APP_NAME || 'Tu mundo';
  const open = configured() && registrationOpen();
  return <><header className="site-header"><Link href="/"><Brand name={name} /></Link><Link href="/preview">{tr("Explorar el mapa")}</Link></header><main id="main" className="landing"><p className="eyebrow">{tr("Un atlas propio, un mundo compartido")}</p><h1>{tr("Los lugares pasan.")}<br />{tr("Lo que te dejan,")}<br /><span>{tr("se queda.")}</span></h1><div className="landing-intro"><p>{tr("Armá tu mundo con lo que conocés y lo que todavía te gustaría conocer. Encontrá consejos de personas que conocés, guardalos y descubrí dónde se cruzan sus mapas.")}</p><div>{open ? <form action="/auth/login" method="post"><button className="primary">{tr("Entrar con Google")}</button><p className="small">{tr("Al entrar aceptás los ")}<Link href="/terms">{tr("términos")}</Link>{tr(" y la ")}<Link href="/privacy">{tr("política de privacidad")}</Link>.</p></form> : <><p>{tr("El registro todavía está cerrado.")}</p><Link className="button primary" href="/preview">{tr("Explorar una vista de prueba")}</Link></>}{notice && <p role="alert">{notice === 'rate' ? tr("Demasiados intentos. Volvé a probar en unos minutos.") : notice === 'closed' ? tr("El registro todavía no está abierto.") : tr("No pudimos iniciar sesión. Intentá nuevamente.")}</p>}</div></div><div className="landing-map"><WorldMap states={[]} /></div><section className="landing-note"><h2>{tr("Tu mapa cuenta")}<br />{tr("lo que vos elegís.")}</h2><p>{tr("Sin fechas de viaje, ubicación en vivo ni última conexión. Tus horas de traslado son privadas. Compartir un mundo no requiere compartir cada detalle.")}</p></section></main><footer className="site-footer"><span>{name==='Tu mundo'?tr(name):name} · {new Date().getFullYear()}</span><Link href="/privacy">{tr("Privacidad")}</Link><Link href="/terms">{tr("Términos")}</Link><Link href="/about">{tr("Sobre este proyecto")}</Link></footer></>;
}

import { getTranslator } from '@/lib/i18n/server';
import Link from 'next/link';
export default async function Missing() {
  const tr = await getTranslator();
  return <main id="main" className="legal"><p className="eyebrow">404</p><h1>{tr("Este lugar")}<br />{tr("no está en el mapa.")}</h1><p>{tr("Puede que el enlace haya cambiado o que la página ya no exista.")}</p><Link className="button primary" href="/">{tr("Volver al inicio")}</Link></main>;
}

import { getTranslator } from '@/lib/i18n/server';
import Link from 'next/link';
export async function generateMetadata(){const tr=await getTranslator();return {
  title: tr('Sobre el proyecto')
};}
export default async function About() {
  const tr = await getTranslator();
  return <main id="main" className="legal"><Link href="/">{tr("Volver al inicio")}</Link><h1>{tr("Un atlas")}<br />{tr("en construcción.")}</h1><p>{tr("Un proyecto para conservar lugares y descubrir consejos de personas conocidas, con controles de privacidad desde el comienzo.")}</p><h2>{tr("Cartografía")}</h2><p>{tr("Geometrías de Natural Earth, dominio público, distribuidas por world-atlas. La lista incluye países y territorios del catálogo world-countries. Algunas áreas pequeñas no aparecen en la resolución del mapa y siguen disponibles en la lista.")}</p><p>{tr("Las fronteras representan el dataset cartográfico, no una posición política. No mostramos porcentaje mundial hasta cerrar la definición de países y territorios.")}</p><Link href="/preview">{tr("Explorar el mapa")}</Link></main>;
}

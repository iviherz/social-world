import { getTranslator } from '@/lib/i18n/server';
import Link from 'next/link';
export async function generateMetadata(){const tr=await getTranslator();return {
  title: tr('Términos')
};}
export default async function Terms() {
  const tr = await getTranslator();
  return <main id="main" className="legal"><Link href="/">{tr("Volver al inicio")}</Link><p className="eyebrow">{tr("Términos · etapa de preparación")}</p><h1>{tr("Un mundo")}<br />{tr("que cuidamos juntos.")}</h1><p>{tr("El servicio aún no está abierto al público. Antes del lanzamiento se completarán los términos con el responsable, contacto, mercados y edades admitidas.")}</p><h2>{tr("Contenido")}</h2><p>{tr("Los lugares visitados y consejos son declaraciones de las personas, no viajes verificados ni recomendaciones profesionales. No publiques información privada de terceros, contenido ilegal o material sobre el que no tengas derechos.")}</p><h2>{tr("Seguridad y convivencia")}</h2><p>{tr("Está prohibido acosar, suplantar identidades, enviar spam o intentar acceder a cuentas y datos ajenos. Las superficies sociales permiten bloquear y reportar. La operación de moderación debe configurarse antes de abrir el registro.")}</p><h2>{tr("Disponibilidad")}</h2><p>{tr("No hay pagos o suscripciones en esta versión. La estimación automática de horas no está disponible. La vista de prueba no guarda datos en una cuenta.")}</p></main>;
}

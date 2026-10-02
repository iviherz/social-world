import { getTranslator } from '@/lib/i18n/server';
import { Dashboard } from '@/components/Dashboard';
export async function generateMetadata(){const tr=await getTranslator();return {
  title: tr('Vista de prueba'),
  robots: {
    index: false,
    follow: false
  }
};}
export default function Preview() {
  return <Dashboard preview brand={process.env.APP_NAME || 'Tu mundo'} />;
}

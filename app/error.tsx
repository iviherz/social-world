'use client';

import { useLocale } from '@/components/LocaleProvider';
export default function ErrorPage({
  reset
}: {
  reset: () => void;
}) {
  const {
    locale,
    tr
  } = useLocale();
  return <main id="main" className="legal"><h1>{tr("No pudimos abrir esta página.")}</h1><p>{tr("Intentá nuevamente. Tus datos no se muestran en este mensaje.")}</p><button onClick={reset}>{tr("Volver a intentar")}</button></main>;
}

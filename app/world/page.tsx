import { getTranslator } from '@/lib/i18n/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { configured } from '@/lib/env';
import { Dashboard } from '@/components/Dashboard';
export async function generateMetadata(){const tr=await getTranslator();return {
  title: tr('Mi mundo'),
  robots: {
    index: false,
    follow: false
  }
};}
export default async function World() {
  if (!configured()) redirect('/?notice=closed');
  const {
    data: {
      user
    }
  } = await (await db()).auth.getUser();
  if (!user) redirect('/');
  return <Dashboard brand={process.env.APP_NAME || 'Tu mundo'} />;
}

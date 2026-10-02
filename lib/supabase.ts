import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export async function db() {
 const jar = await cookies();
 if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) throw new Error('SETUP_REQUIRED');
 return createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
  cookieOptions: {httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', path:'/'},
  cookies: {getAll:()=>jar.getAll(), setAll(items) {for (const {name,value,options} of items) {
   try {jar.set(name,value,{...options,httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production'});} catch { /* Read-only server component; proxy refreshes. */ }
  }}},
 });
}

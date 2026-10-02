import {NextRequest, NextResponse} from 'next/server';
import {createServerClient} from '@supabase/ssr';
export async function proxy(request:NextRequest) {
 const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
 const dev = process.env.NODE_ENV !== 'production';
 const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'${dev ? ' ws: http://localhost:*' : ''}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' https://accounts.google.com https://*.supabase.co;${dev ? '' : ' upgrade-insecure-requests;'}`;
 const headers = new Headers(request.headers);
 headers.set('x-nonce',nonce); headers.set('Content-Security-Policy',csp);
 let response = NextResponse.next({request:{headers}});
 if (process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY && ((request.nextUrl.pathname.startsWith('/world') || request.nextUrl.pathname.startsWith('/u/')) || request.nextUrl.pathname.startsWith('/api'))) {
  const client = createServerClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,{
   cookieOptions:{httpOnly:true,secure:!dev,sameSite:'lax',path:'/'},
   cookies:{getAll:()=>request.cookies.getAll(),setAll(items){
    for (const {name,value} of items) request.cookies.set(name,value);
    response=NextResponse.next({request:{headers}});
    for (const {name,value,options} of items) response.cookies.set(name,value,{...options,httpOnly:true,secure:!dev,sameSite:'lax'});
   }}
  });
  await client.auth.getUser();
 }
 response.headers.set('Content-Security-Policy',csp);
 if ((request.nextUrl.pathname.startsWith('/world') || request.nextUrl.pathname.startsWith('/u/')) || request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname.startsWith('/preview')) {
  response.headers.set('Cache-Control','private, no-store, max-age=0');
  response.headers.set('X-Robots-Tag','noindex, nofollow');
 }
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|json)$).*)']};

import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/supabase';
import {appUrl,configured,registrationOpen} from '@/lib/env';
import {allowLogin} from '@/lib/rate-limit';
export async function POST(req:NextRequest) {
 if (req.headers.get('origin') !== appUrl()) return new NextResponse('Solicitud no válida',{status:403});
 if (!configured() || !registrationOpen()) return NextResponse.redirect(new URL('/?notice=closed',appUrl()),303);
 // Vercel supplies this header. Deploy behind Vercel, not an untrusted forwarding proxy.
 const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
 if (!await allowLogin(ip)) return NextResponse.redirect(new URL('/?notice=rate',appUrl()),303);
 const client=await db();
 const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:appUrl()+'/auth/callback',skipBrowserRedirect:true}});
 if (error || !data.url) return NextResponse.redirect(new URL('/?notice=auth',appUrl()),303);
 return NextResponse.redirect(data.url,303);
}

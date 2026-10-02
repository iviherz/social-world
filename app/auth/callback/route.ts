import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/supabase';
import {appUrl} from '@/lib/env';
export async function GET(req:NextRequest) {
 const code=req.nextUrl.searchParams.get('code');
 if(code && !(await (await db()).auth.exchangeCodeForSession(code)).error) return NextResponse.redirect(new URL('/world',appUrl()));
 return NextResponse.redirect(new URL('/?notice=auth',appUrl()));
}

import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/supabase';import {appUrl} from '@/lib/env';
export async function POST(req:NextRequest) {
 if(req.headers.get('origin')!==appUrl()) return new NextResponse('Solicitud no válida',{status:403});
 await (await db()).auth.signOut();return NextResponse.redirect(new URL('/',appUrl()),303);
}

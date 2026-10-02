import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {cleanPhoto} from '@/lib/images';import {db} from '@/lib/supabase';import {appUrl} from '@/lib/env';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 if(req.headers.get('origin')!==appUrl())return NextResponse.json({error:'Solicitud no válida.'},{status:403});
 if(Number(req.headers.get('content-length')||0)>4*1024*1024)return NextResponse.json({error:'Máximo 3 MB.'},{status:413});
 const client=await db();const {data:{user}}=await client.auth.getUser();if(!user)return NextResponse.json({error:'Iniciá sesión.'},{status:401});
 if(!process.env.SUPABASE_SECRET_KEY)return NextResponse.json({error:'La carga de fotos todavía no está habilitada.'},{status:503});
 // Rate-limit via a protected, no-op preference update; shared DB trigger covers direct API writes.
 const throttle=await client.from('preferences').update({user_id:user.id}).eq('user_id',user.id);if(throttle.error)return NextResponse.json({error:'Esperá un minuto antes de subir otra foto.'},{status:429});
 try{
 const existing=await client.storage.from('media').list(user.id,{limit:201});if(existing.error||existing.data.length>=200)return NextResponse.json({error:'Alcanzaste el límite de 200 fotos de esta versión.'},{status:429});
 const form=await req.formData();const file=form.get('file');if(!(file instanceof File)||file.size>3*1024*1024||!file.size)return NextResponse.json({error:'Elegí una foto de hasta 3 MB.'},{status:400});
 const cleaned=await cleanPhoto(Buffer.from(await file.arrayBuffer()));
 const path=user.id+'/'+crypto.randomUUID()+'.webp';
 const storage=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}}).storage;
 const uploaded=await storage.from('media').upload(path,cleaned,{contentType:'image/webp',upsert:false});
 if(uploaded.error)throw new Error('UPLOAD');return NextResponse.json({path},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'No pudimos procesar la imagen.'},{status:400});}
}
export async function GET(req:NextRequest){
 const path=req.nextUrl.searchParams.get('path');if(!path||!/^[-a-f0-9]{36}\/[-a-f0-9]{36}\.webp$/.test(path))return new NextResponse(null,{status:404});
 const client=await db();const {data:{user}}=await client.auth.getUser();if(!user)return new NextResponse(null,{status:401});
 const {data,error}=await client.storage.from('media').download(path);if(error||!data)return new NextResponse(null,{status:404});
 return new NextResponse(data,{headers:{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}

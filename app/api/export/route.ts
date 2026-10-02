import {NextResponse} from 'next/server';import {db} from '@/lib/supabase';
export const dynamic='force-dynamic';
export async function GET(){
 const client=await db();const {data:{user}}=await client.auth.getUser();if(!user)return new NextResponse(null,{status:401});
 const tables=['profiles','preferences','country_states','place_states','private_durations','collections','recommendations','comments','messages','follows','blocks','reports'];
 const result:Record<string,unknown>={};
 for(const table of tables){let query=client.from(table).select('*');
 if(table==='profiles')query=query.eq('id',user.id);
 else if(table==='collections')query=query.eq('owner_id',user.id);
 else if(['recommendations','comments'].includes(table))query=query.eq('author_id',user.id);
 else if(table==='messages')query=query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
 else if(table==='follows')query=query.eq('follower_id',user.id);
 else if(table==='blocks')query=query.eq('blocker_id',user.id);
 else if(table==='reports')query=query.eq('reporter_id',user.id);
 else query=query.eq('user_id',user.id);
 const {data,error}=await query.limit(1000);if(error)return NextResponse.json({error:'No pudimos exportar tus datos.'},{status:500});result[table]=data;
 }
 const items=await client.from('collection_items').select('*').limit(1000);result.collection_items=items.data;
 return NextResponse.json({data:result,limit_per_table:1000,note:'Si superás este límite, solicitá una exportación completa al responsable.'},{headers:{'Content-Disposition':'attachment; filename="mi-mundo.json"','Cache-Control':'private, no-store'}});
}

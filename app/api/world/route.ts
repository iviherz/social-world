import {getTranslator} from '@/lib/i18n/server';
import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/supabase';import {appUrl} from '@/lib/env';import {mutation} from '@/lib/schema';import {boundedText} from '@/lib/request';
export const dynamic='force-dynamic';
const response=async(data:unknown,status=200)=>{if(data&&typeof data==='object'&&'error' in data&&typeof data.error==='string'){const tr=await getTranslator();data={...data,error:tr(data.error)};}return NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});};
export async function GET(req:NextRequest) {
 try {
 const client=await db();const {data:{user}}=await client.auth.getUser();if(!user)return response({error:'Iniciá sesión para continuar.'},401);
 // All returned objects are filtered by RLS. Private modules are selected only for current user.
 const own=req.nextUrl.searchParams.get('scope')==='private';
 if(own) {
 const [preferences,durations]=await Promise.all([client.from('preferences').select('hours_enabled').eq('user_id',user.id).single(),client.from('private_durations').select('id,minutes,mode,method').eq('user_id',user.id).limit(1000)]);
 if(preferences.error||durations.error)return response({error:'No pudimos cargar tus horas.'},500);
 return response({preferences:preferences.data,durations:durations.data});
 }
 const results=await Promise.all([
 client.from('profiles').select('id,username,name,bio,color,visibility,share_visited,share_wishlist,tags,ask_about,avatar_path').order('name').limit(250),
 client.from('country_states').select('country_code,visited,wishlist').eq('user_id',user.id).limit(300),
 client.from('places').select('id,name,city,country_code,creator_id').order('name').limit(500),
 client.from('place_states').select('place_id,visited,wishlist').eq('user_id',user.id).limit(500),
 client.from('recommendations').select('id,author_id,place_id,category,verdict,tip,image_path').limit(250),
 client.from('collections').select('id,name').eq('owner_id',user.id).order('name').limit(100),
 client.from('collection_items').select('id,collection_id,target_type,target_id').limit(1000),
 client.from('follows').select('follower_id,following_id').limit(1000),
 client.from('messages').select('id,sender_id,recipient_id,body,sequence').order('sequence',{ascending:false}).limit(100),
 client.from('helpful_votes').select('recommendation_id').eq('user_id',user.id).limit(1000),
 client.from('comments').select('id,author_id,recommendation_id,body').limit(500),
 client.from('blocks').select('blocked_id').eq('blocker_id',user.id).limit(250),
 client.rpc('reputation',{days:req.nextUrl.searchParams.get('period')==='week'?7:30}),
 ]);
 if(results.some(r=>r.error)) return response({error:'No pudimos cargar tu mundo. Intentá de nuevo.'},500);
 const [profiles,states,places,placeStates,recommendations,collections,items,follows,messages,votes,comments,blocks,reputation]=results.map(r=>r.data||[]);
 const ownProfile=await client.from('profiles').select('id,username,name,bio,color,visibility,share_visited,share_wishlist,tags,ask_about,avatar_path').eq('id',user.id).single();
 if(ownProfile.error)return response({error:'No pudimos cargar tu perfil.'},500);
 if(!(profiles as {id:string}[]).some(p=>p.id===user.id))(profiles as unknown[]).push(ownProfile.data);
 // Resolve references against currently visible objects, never copy private originals.
 const shared:Record<string,unknown>={};
 const mine=(follows as {follower_id:string;following_id:string}[]).filter(f=>f.follower_id===user.id).map(f=>f.following_id);
 const cotravelers=mine.filter(id=>(follows as {follower_id:string;following_id:string}[]).some(f=>f.follower_id===id && f.following_id===user.id));
 for(const id of cotravelers.slice(0,30)){const r=await client.rpc('shared_states',{target:id});if(!r.error)shared[id]=r.data;}
 return response({userId:user.id,profiles,states,places,placeStates,recommendations,collections,items,follows,messages,votes,comments,blocks,reputation,shared,limits:{profiles:250,places:500,recommendations:250,messages:100,comparison:30}});
 }catch{return response({error:'El servicio no está disponible.'},503);}
}
export async function POST(req:NextRequest) {
 if(req.headers.get('origin')!==appUrl())return response({error:'Solicitud no válida.'},403);
 if(!req.headers.get('content-type')?.includes('application/json'))return response({error:'Formato no válido.'},415);
 let raw:string;try{raw=await boundedText(req,12000);}catch{return response({error:'Solicitud demasiado grande.'},413);}
 let parsed;try{parsed=mutation.safeParse(JSON.parse(raw));}catch{return response({error:'Formato no válido.'},400);}
 if(!parsed.success)return response({error:'Revisá los campos y sus límites.'},400);
 try {
 const client=await db();const {data:{user}}=await client.auth.getUser();if(!user)return response({error:'Iniciá sesión para continuar.'},401);
 const x=parsed.data;let result;
 switch(x.action){
 case 'profile': {const {action,hours_enabled,...fields}=x;void action;
 result=await client.rpc('save_my_profile',{p:fields,enabled:hours_enabled});break;}
 case 'country': result=await client.from('country_states').upsert({user_id:user.id,country_code:x.country_code,visited:x.visited,wishlist:x.wishlist});break;
 case 'place': result=await client.from('places').insert({creator_id:user.id,name:x.name,city:x.city,country_code:x.country_code}).select('id').single();break;
 case 'place_state': result=await client.from('place_states').upsert({user_id:user.id,place_id:x.place_id,visited:x.visited,wishlist:x.wishlist});break;
 case 'recommendation':result=await client.from('recommendations').insert({author_id:user.id,place_id:x.place_id,category:x.category,verdict:x.verdict,tip:x.tip,image_path:x.image_path});break;
 case 'delete_recommendation':result=await client.from('recommendations').delete().eq('id',x.id).eq('author_id',user.id);break;
 case 'comment':result=await client.from('comments').insert({author_id:user.id,recommendation_id:x.recommendation_id,body:x.body});break;
 case 'delete_comment':result=await client.from('comments').delete().eq('id',x.id).eq('author_id',user.id);break;
 case 'collection':result=await client.from('collections').insert({owner_id:user.id,name:x.name});break;
 case 'rename_collection':result=await client.from('collections').update({name:x.name}).eq('id',x.id).eq('owner_id',user.id);break;
 case 'delete_collection':result=await client.from('collections').delete().eq('id',x.id).eq('owner_id',user.id);break;
 case 'save':result=await client.from('collection_items').upsert({collection_id:x.collection_id,target_type:x.target_type,target_id:x.target_id},{onConflict:'collection_id,target_type,target_id',ignoreDuplicates:true});break;
 case 'unsave':result=await client.from('collection_items').delete().eq('id',x.id);break;
 case 'follow':result=x.enabled?await client.from('follows').upsert({follower_id:user.id,following_id:x.target},{ignoreDuplicates:true}):await client.from('follows').delete().eq('follower_id',user.id).eq('following_id',x.target);break;
 case 'helpful':result=x.enabled?await client.from('helpful_votes').upsert({user_id:user.id,recommendation_id:x.recommendation_id},{ignoreDuplicates:true}):await client.from('helpful_votes').delete().eq('user_id',user.id).eq('recommendation_id',x.recommendation_id);break;
 case 'message':result=await client.from('messages').insert({sender_id:user.id,recipient_id:x.recipient_id,body:x.body});break;
 case 'block':result=x.enabled?await client.from('blocks').upsert({blocker_id:user.id,blocked_id:x.target},{ignoreDuplicates:true}):await client.from('blocks').delete().eq('blocker_id',user.id).eq('blocked_id',x.target);break;
 case 'report':result=await client.from('reports').insert({reporter_id:user.id,target_type:x.target_type,target_id:x.target_id,reason:x.reason});break;
 case 'duration':result=await client.from('private_durations').upsert({id:x.id,user_id:user.id,minutes:x.minutes,mode:x.mode,method:'manual'});break;
 case 'delete_duration':result=await client.from('private_durations').delete().eq('id',x.id).eq('user_id',user.id);break;
 case 'delete_account': {
 for(let page=0;page<20;page++){const files=await client.storage.from('media').list(user.id,{limit:500});if(files.error)return response({error:'No pudimos limpiar tus archivos.'},500);if(!files.data?.length)break;const removed=await client.storage.from('media').remove(files.data.map(f=>user.id+'/'+f.name));if(removed.error)return response({error:'No pudimos limpiar tus archivos.'},500);}
 result=await client.rpc('delete_my_account');if(!result.error)await client.auth.signOut();break;}
 }
 if(result?.error){const rate=result.error.message?.includes('RATE_LIMIT');return response({error:rate?'Demasiadas acciones. Esperá un minuto.':'No se pudo guardar. Revisá permisos, datos o un nombre de usuario ya utilizado.'},rate?429:400);}
 return response({ok:true,data:result?.data});
 }catch{return response({error:'No pudimos completar la acción.'},503);}
}

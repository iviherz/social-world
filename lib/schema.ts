import {z} from 'zod';
export const categories=['Food','Stay','Culture','Nature','Nightlife','History','Hidden gem','Experience','Other'] as const;
export const tags=['Food lover','Nature','Architecture','Museums','Slow travel','History','Hiking','Music','Books','Photography'] as const;
const uuid=z.string().uuid();
const text=(max:number)=>z.string().trim().min(1).max(max);
export const mutation=z.discriminatedUnion('action',[
 z.object({action:z.literal('profile'),name:text(60),username:z.string().regex(/^[a-z0-9_]{3,24}$/),bio:z.string().trim().max(300),color:z.enum(['#333700','#B46A6A','#61122B','#537A65','#355C7D']),visibility:z.enum(['private','public']),share_visited:z.boolean(),share_wishlist:z.boolean(),tags:z.array(z.enum(tags)).max(6),ask_about:z.array(z.string().trim().min(1).max(80)).max(5),hours_enabled:z.boolean(),avatar_path:z.string().max(200).nullable().optional()}),
 z.object({action:z.literal('country'),country_code:z.string().regex(/^[A-Z]{3}$/),visited:z.boolean(),wishlist:z.boolean()}),
 z.object({action:z.literal('place'),name:text(100),country_code:z.string().regex(/^[A-Z]{3}$/),city:z.string().trim().max(80)}),
 z.object({action:z.literal('place_state'),place_id:uuid,visited:z.boolean(),wishlist:z.boolean()}),
 z.object({action:z.literal('recommendation'),place_id:uuid,category:z.enum(categories),verdict:z.enum(['recommend','skip']),tip:text(1500),image_path:z.string().max(200).nullable()}),
 z.object({action:z.literal('delete_recommendation'),id:uuid}),
 z.object({action:z.literal('comment'),recommendation_id:uuid,body:text(700)}),
 z.object({action:z.literal('delete_comment'),id:uuid}),
 z.object({action:z.literal('collection'),name:text(60)}),
 z.object({action:z.literal('rename_collection'),id:uuid,name:text(60)}),
 z.object({action:z.literal('delete_collection'),id:uuid}),
 z.object({action:z.literal('save'),collection_id:uuid,target_type:z.enum(['place','recommendation','profile','comment','media']),target_id:uuid}),
 z.object({action:z.literal('unsave'),id:uuid}),
 z.object({action:z.literal('follow'),target:uuid,enabled:z.boolean()}),
 z.object({action:z.literal('helpful'),recommendation_id:uuid,enabled:z.boolean()}),
 z.object({action:z.literal('message'),recipient_id:uuid,body:text(2000)}),
 z.object({action:z.literal('block'),target:uuid,enabled:z.boolean()}),
 z.object({action:z.literal('report'),target_type:z.enum(['profile','recommendation','comment']),target_id:uuid,reason:text(500)}),
 z.object({action:z.literal('duration'),id:uuid,minutes:z.number().int().min(1).max(60000),mode:z.enum(['flight','train','road','boat','other'])}),
 z.object({action:z.literal('delete_duration'),id:uuid}),
 z.object({action:z.literal('delete_account'),confirmation:z.literal('BORRAR MI CUENTA')})
]);
export function durationTotals(entries:{minutes:number;mode:string}[]) {return {trip:entries.reduce((n,e)=>n+e.minutes,0),flight:entries.filter(e=>e.mode==='flight').reduce((n,e)=>n+e.minutes,0)};}

import 'server-only';import {cookies,headers} from 'next/headers';import {resolveLocale,translate} from './index';
export async function getLocale(){return resolveLocale((await cookies()).get('locale')?.value,(await headers()).get('accept-language')||'');}
export async function getTranslator(){const locale=await getLocale();return (message:string)=>translate(locale,message);}

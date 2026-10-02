import es from './es.json';import en from './en.json';import fr from './fr.json';import ru from './ru.json';import zh from './zh.json';import ar from './ar.json';
export const locales=['es','en','fr','ru','zh','ar'] as const;
export type Locale=typeof locales[number];
export const languageNames:Record<Locale,string>={es:'Español',en:'English',fr:'Français',ru:'Русский',zh:'中文',ar:'العربية'};
const dictionaries:Record<Locale,Record<string,string>>={es,en,fr,ru,zh,ar};
export function isLocale(value:unknown):value is Locale{return typeof value==='string'&&locales.includes(value as Locale);}
export function resolveLocale(cookie?:string,accept=''):Locale{if(isLocale(cookie))return cookie;for(const item of accept.slice(0,1024).split(',').map((v,i)=>{const [tag,...params]=v.trim().split(';');const q=params.find(p=>p.trim().startsWith('q='));return {tag:tag.toLowerCase().split('-')[0],q:q?Number(q.trim().slice(2)):1,i};}).filter(x=>Number.isFinite(x.q)&&x.q>0&&x.q<=1).sort((a,b)=>b.q-a.q||a.i-b.i)){if(isLocale(item.tag))return item.tag;}return 'es';}
export function translate(locale:Locale,message:string):string{const key=message.replace(/\s+/g,' ').trim();const translated=dictionaries[locale][key];if(!translated)return message;return (message.startsWith(' ')?' ':'')+translated+(message.endsWith(' ')?' ':'');}
export function countryName(country:{name:string;iso2?:string}|undefined,locale:Locale):string{if(!country)return '';try{return country.iso2?new Intl.DisplayNames([locale],{type:'region'}).of(country.iso2)||country.name:country.name;}catch{return country.name;}}

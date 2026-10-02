 'use client';
import {createContext,useContext} from 'react';import {translate,type Locale} from '@/lib/i18n';
const Context=createContext<Locale>('es');
export function LocaleProvider({locale,children}:{locale:Locale;children:React.ReactNode}){return <Context.Provider value={locale}>{children}</Context.Provider>;}
export function useLocale(){const locale=useContext(Context);return {locale,tr:(message:string)=>translate(locale,message)};}

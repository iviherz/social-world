import 'server-only';
export const configured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
export function appUrl() {
 const raw = process.env.APP_URL || 'http://localhost:3000';
 const url = new URL(raw);
 if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('APP_URL must use HTTPS');
 return url.origin;
}
export function registrationOpen() { return process.env.APP_REGISTRATION_OPEN === 'true'; }

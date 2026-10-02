import 'server-only';
import {Redis} from '@upstash/redis';
import {Ratelimit} from '@upstash/ratelimit';
let limiter: Ratelimit | undefined;
export async function allowLogin(ip: string) {
 if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  return process.env.NODE_ENV !== 'production';
 }
 limiter ||= new Ratelimit({redis:Redis.fromEnv(), limiter:Ratelimit.slidingWindow(8,'10 m'), prefix:'social:login', analytics:false});
 try {return (await limiter.limit(ip)).success;} catch {return false;}
}

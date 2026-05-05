import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let sliding: Ratelimit | null = null;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function getAssessRatelimit(): Ratelimit | null {
  if (sliding) return sliding;
  const redis = getRedis();
  if (!redis) return null;
  sliding = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "sathi:assess",
  });
  return sliding;
}

export async function limitAssessByIp(ipHash: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const rl = getAssessRatelimit();
  if (!rl) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[ratelimit] Upstash Redis not configured — assessment rate limiting is disabled",
      );
    }
    return { success: true, remaining: 999, reset: Date.now() + 3600_000 };
  }
  const { success, remaining, reset } = await rl.limit(ipHash);
  return { success, remaining, reset: reset };
}

import type { Application } from 'express';
import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
   message: '已经达到API请求速率限制，请15分钟后再试',
   standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
   legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
   ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
});

//04.rate-limit.server.ts  middleware
export const setupRateLimitMiddleware = (app: Application) => {
   app.use(limiter);
};

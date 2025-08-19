import {
   validateJwtAccessToken,
   validateJwtRefreshToken,
   generateJwtAccessToken,
} from './jwtUtil';
import type { JwtPayload } from '../types/jwtTypes';
import type { Response } from 'express';

/**
 * AccessToken 缓存
 * TTL 机制：每个缓存项有过期时间
 * LRU 淘汰：当缓存达到最大容量时，自动淘汰最久未使用的项
 * 命中统计：记录缓存命中率等指标
 * 定期清理：可以手动或定期清理过期项，默认6h主动清理一次
 * @method get(key)：获取缓存值，同时更新其使用时间
 * @method set(key,value)：设置缓存值
 * @method cleanup()：清理所有过期项
 * @method stats()获取缓存统计信息
 */
class AccessTokenCache<T> {
   private cache = new Map<string, { value: T; expiresAt: number }>();
   private hits = 0; // 新增命中计数器
   private misses = 0; // 新增未命中计数器
   private cleanups = 0; // 新增清理计数器

   constructor(
      private ttlMs: number = 3000,
      private maxEntries: number = 10000
   ) {}

   private now() {
      return Date.now();
   }

   get(key: string): T | null {
      const entry = this.cache.get(key);
      if (entry && entry.expiresAt > this.now()) {
         this.hits++; // 增加命中计数
         // 触发 LRU: 先删除再插入，保证 Map 的顺序
         this.cache.delete(key);
         this.cache.set(key, entry);
         return entry.value;
      }
      this.misses++; // 增加未命中计数
      this.cache.delete(key);
      return null;
   }

   set(key: string, value: T) {
      if (this.cache.size >= this.maxEntries) {
         // 淘汰最旧的 (Map 迭代器的第一个就是最旧的)
         const oldestKey = this.cache.keys().next().value;
         if (oldestKey !== undefined) {
            this.cache.delete(oldestKey);
         }
      }
      this.cache.set(key, { value, expiresAt: this.now() + this.ttlMs });
   }

   stats() {
      const total = this.hits + this.misses;
      const hitRate = total > 0 ? this.hits / total : 0;

      return {
         size: this.cache.size, //缓存的实际使用情况
         hits: this.hits, //缓存命中次数
         misses: this.misses, //缓存未命中次数
         cleanups: this.cleanups, //主动清理过期缓存的次数（即 cleanup() 方法被调用的次数）
         maxEntries: this.maxEntries, //缓存的最大容量限制
         ttlMs: this.ttlMs, //缓存条目的生存时间（Time-To-Live），单位毫秒
         hitRate: hitRate, //缓存命中率（hits / (hits + misses)
         hitRatePercent: (hitRate * 100).toFixed(2) + '%', // 友好展示
      };
   }

   cleanup() {
      this.cleanups++; // 增加清理计数
      const now = this.now();
      for (const [key, entry] of this.cache.entries()) {
         if (entry.expiresAt <= now) {
            this.cache.delete(key);
         }
      }
   }

   clear() {
      this.cache.clear();
   }
}

/**
 * 并发刷新锁 (针对 refreshToken)
 * Promise 复用：同一 refresh token 的并发请求会共享同一个 Promise
 * @method withLock(key,value)：对指定 key 加锁，执行 task 函数，返回其 Promise
 */
class RefreshLock {
   private lockMap = new Map<string, Promise<any>>();

   async withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
      if (this.lockMap.has(key)) {
         return this.lockMap.get(key)! as Promise<T>;
      }
      const promise = task().finally(() => this.lockMap.delete(key));
      this.lockMap.set(key, promise);
      return promise;
   }
}

/**
 * TokenManager (封装缓存 + RefreshLock并发锁)，整合了缓存和锁机制。
 * - 缓存验证结果：减少重复的 JWT 验证开销
 * - 自动刷新 token：当 access token 过期但 refresh token 有效时自动刷新
 * - 定时清理：定期清理过期缓存项
 * @method getAccessPayload(accessToken)：验证并获取accessToken的payload
 * @method refreshAccessToken(refreshToken,res)：使用refreshToken刷新accessToken
 * @method stopCleanup()：停止定时清理任务（用于应用关闭时）
 */
export class TokenManager {
   private cache: AccessTokenCache<{ payload: JwtPayload }>;
   private lock = new RefreshLock();
   private cleanupIntervalId: NodeJS.Timeout | null = null;

   constructor(
      cacheTtlMs: number = 3000, // AccessToken 缓存时间
      cleanupIntervalMs: number = 6 * 60 * 60 * 1000, // 定时清理 (6 小时)
      maxEntries: number = 10000 // LRU 最大容量
   ) {
      this.cache = new AccessTokenCache<{ payload: JwtPayload }>(
         cacheTtlMs,
         maxEntries
      );

      // 定时清理任务
      this.cleanupIntervalId = setInterval(() => {
         this.cache.cleanup();
      }, cleanupIntervalMs);
   }

   /**
    * 从缓存 / 验证中获取 accessToken 的 payload
    */
   async getAccessPayload(accessToken: string): Promise<JwtPayload | null> {
      const cached = this.cache.get(accessToken);
      if (cached) return cached.payload;

      try {
         const payload = await validateJwtAccessToken(accessToken);
         this.cache.set(accessToken, { payload });
         return payload;
      } catch {
         return null;
      }
   }

   /**
    * 用 refreshToken 刷新 accessToken
    * 自动加锁，避免并发刷新
    */
   async refreshAccessToken(
      refreshToken: string,
      res: Response
   ): Promise<JwtPayload> {
      return this.lock.withLock(refreshToken, async () => {
         const refreshPayload = await validateJwtRefreshToken(refreshToken);
         const newAccessToken = await generateJwtAccessToken({
            id: refreshPayload.id,
         });

         res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000,
         });

         const payload: JwtPayload = { id: refreshPayload.id };
         this.cache.set(newAccessToken, { payload });

         return payload;
      });
   }

   /**
    * 打印缓存统计信息
    */
   logStats() {
      const stats = this.cache.stats();

      console.log(`
╔═══════════════════════════════════════════════════╗
║              🚀 TokenManager 缓存统计             ║
╠══════════════════════════╦════════════════════════╣
║ 📊 当前缓存大小           ║ ${stats.size.toString().padEnd(8)} / ${stats.maxEntries} 条目 ║
║ 🎯 命中率                ║ ${stats.hitRatePercent.padStart(8)}           ║
╠══════════════════════════╬════════════════════════╣
║ ✅ 命中次数               ║ ${stats.hits.toString().padEnd(8)}           ║
║ ❌ 未命中次数             ║ ${stats.misses.toString().padEnd(8)}           ║
║ 🧹 清理次数               ║ ${stats.cleanups.toString().padEnd(8)}           ║
╠══════════════════════════╬════════════════════════╣
║ ⏱️ 缓存有效期             ║ ${(stats.ttlMs / 1000).toString().padEnd(8)} 秒          ║
╚══════════════════════════╩════════════════════════╝
    `);
   }

   /**
    * 停止清理任务（应用关闭时用）
    */
   stopCleanup() {
      if (this.cleanupIntervalId) {
         clearInterval(this.cleanupIntervalId);
         this.cleanupIntervalId = null;
      }
   }
}

// env.d.ts
import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      /**cors跨源允许地址 */
      NODE_CORS_ORIGIN: string;

      //====================JWT settings====================
      /**JWT算法 */
      NODE_JWT_ALGORITHM: string;
      /**JWT 发行者  */
      NODE_JWT_ISSUER: string;
      /**JWT 观众 */
      NODE_JWT_AUDIENCE: string;
      /**JWT ACCESS 访问令牌密钥 */
      NODE_JWT_ACCESS_SECRET: string;
      /**JWT ACCESS EXPIRES IN 访问令牌过期时间 */
      NODE_JWT_ACCESS_EXPIRES_IN: string;
      /**JWT REFRESH  刷新令牌密钥 */
      NODE_JWT_REFRESH_SECRET: string;
      /**JWT REFRESH EXPIRES IN  刷新令牌过期时间 */
      NODE_JWT_REFRESH_EXPIRES_IN: string;
    
    
    
    }
  }
}

export {};


//export {} 让文件被视为模块而不是全局脚本，避免了全局污染和潜在的命名冲突。
// 即使文件是模块，declare global 仍然能使你定义的类型扩展全局生效。
// 如果你有多个这样的声明文件，添加 export {} 是一种良好的实践，它确保了项目的模块化和清晰的作用域管理。
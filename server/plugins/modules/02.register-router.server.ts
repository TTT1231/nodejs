import path from 'path';
import type { Router } from 'express';
import {
   registerRoutes,
   scanApiDirectory,
   setGlobalRouter,
} from '../../utils/routeScanner';

/**
 * 设置所有路由，约定大于配置自动导入设置
 * 异步导入所有路由文件并注册
 */
async function setupRoutes(router: Router) {
   // 设置全局 router，这样路由会在导入时立即注册
   setGlobalRouter(router);

   // 扫描并注册 API 路由（包括根路由）
   let apiDir: string;

   if (__dirname.includes('dist')) {
      // 生产环境：在 dist 目录中，api 目录就在同级
      apiDir = path.join(__dirname, 'api');
   } else {
      // 开发环境：在 server 目录中
      apiDir = path.join(__dirname, '../../api');
   }

   await scanApiDirectory(apiDir);

   // 作为备用，仍然调用传统的注册方法（如果有剩余的路由）
   registerRoutes(router);
}

// 02.register-router.server.ts plugin
/**
 * @description register router once
 */
const defineRouterPlugin = async (router: Router) => {
   await setupRoutes(router);
};

export default defineRouterPlugin;

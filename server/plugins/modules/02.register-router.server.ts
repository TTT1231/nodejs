import path from "path";
import type { Router } from "express";
import { registerRoutes, scanApiDirectory } from "../../utils/routeScanner";



/**
 * 设置所有路由，约定大于配置自动导入设置
 * 异步导入所有路由文件并注册
 */
async function setupRoutes(router: Router) {
  // 扫描并注册 API 路由（包括根路由）
  const apiDir = path.join(__dirname, "../../api");
  await scanApiDirectory(apiDir);
  registerRoutes(router);
}

// 02.register-router.server.ts plugin
/**
 * @description register router once
 */
const defineRouterPlugin =async (router:Router) => {
    await setupRoutes(router);
};

export default defineRouterPlugin;

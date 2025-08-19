import type { Application } from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs';

/**
 * 01.static.server.ts
 * 设置静态文件中间件（约定大于配置）
 * 只有当 server/public/static 目录存在时才启用静态文件服务
 * @param app Express应用实例
 */
export function setupStaticMiddleware(app: Application) {
   // 检测当前是否在 dist 目录中运行
   const isProduction = process.cwd().endsWith('dist');

   // 设置静态文件路径
   let publicBasePath: string;
   let staticPath: string;

   if (isProduction) {
      // 生产环境：静态文件在 dist/public
      publicBasePath = path.join(__dirname, 'public');
      staticPath = path.join(__dirname, 'public', 'static');
   } else {
      // 开发环境：静态文件在 server/public
      publicBasePath = path.join(__dirname, '../../public');
      staticPath = path.join(__dirname, '../../public', 'static');
   }

   // 特殊处理 favicon.ico - 需要在所有中间件之前处理
   const faviconPath = path.join(publicBasePath, 'favicon.ico');
   if (fs.existsSync(faviconPath)) {
      app.get('/favicon.ico', (req, res) => {
         res.sendFile(faviconPath);
      });
      console.log(`🔖 Favicon served from: ${faviconPath}`);
   } else {
      // 如果没有 favicon.ico，返回 204 避免 404 错误
      app.get('/favicon.ico', (req, res) => {
         res.status(204).end();
      });
      console.log(
         `🔖 No favicon.ico found, returning 204 for /favicon.ico requests`
      );
   }

   // 约定大于配置：只有当 public/static 目录存在时才启用静态文件服务
   if (fs.existsSync(staticPath)) {
      // 配置静态文件中间件，将 /static 路径映射到 public/static 目录
      app.use('/static', express.static(staticPath));
      console.log(`📁 Static files served from: ${staticPath} -> /static/*`);
   } else {
      console.log(
         `ℹ️  No public/static directory found, static file serving disabled`
      );
   }
}

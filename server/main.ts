import express, { Router } from 'express';
import http from 'http';
import { initPlugins } from './plugins/index';
import { initMiddlewares } from './middlewares/index';

async function startServer() {
   const app = express();
   const port = 7001;
   const router = Router();

   // 初始化插件（里面route异步导入）
   await initPlugins(app, router);

   // 初始化所有中间件
   initMiddlewares(app, router);

   //创建http服务器
   const server = http.createServer(app);

   server.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
   });
}

// 启动服务器
startServer().catch(console.error);

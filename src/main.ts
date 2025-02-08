import express from 'express';


import http from 'http'
import { setupCorsStrategy } from './logic/cors';
import router from './router';
import { setupRouterGuard } from './router/guard';
import { setupErrorHandler } from './logic/error-handler';


const app = express();
const port = 7001;

//设置CORS策略
setupCorsStrategy(app);

//创建http服务器
const server = http.createServer(app);


// 静态资源代理
app.use(express.static('public'));

//路由中间件
app.use(router);

//路由守卫
setupRouterGuard(app);

//全局错误处理
setupErrorHandler(app);



server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
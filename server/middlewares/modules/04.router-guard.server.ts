import type { Application } from "express";

// 处理未找到的路由
const handleNotFoundRoute=(app:Application)=>{
    app.use((req, res) => {
        res.status(404).send('路由未找到');
    });
}

//02.router-guard.server.ts  middleware
export const setupRouterGuardMiddleware=(app:Application)=>{
    handleNotFoundRoute(app);
}
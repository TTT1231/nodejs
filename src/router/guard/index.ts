import type { Express } from "express";

// 处理未找到的路由
const handleNotFoundRoute=(app:Express)=>{
    app.use((req, res) => {
        res.status(404).send('路由未找到');
    });
}

//统一导出
export const setupRouterGuard=(app:Express)=>{
    handleNotFoundRoute(app);
}
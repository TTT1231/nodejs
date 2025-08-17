import type { Application } from "express";
import express from "express";
import { setupStaticMiddleware } from "./modules/00.static-resources.server";
import { setupJsonParseMiddleware } from "./modules/01.res-json.server";
import { setupCorsStrategyMiddleware } from "./modules/02.cors.server";
import {setupRouterMiddleware} from "./modules/05.router.server"
import { setupRouterGuardMiddleware } from "./modules/04.router-guard.server";  
import { setupErrorHandlerMiddleware } from "./modules/99.error-handler.server";
import { setupJwtValidMiddleware } from "./modules/03.jwt-valid.server";



export async function initMiddlewares(app: Application,router: express.Router) {

    // 00. 静态文件中间件（需要在 JWT 中间件之前）
    setupStaticMiddleware(app);

    // 01. 基础解析中间件（Cookie、JSON、URL编码）
    setupJsonParseMiddleware(app);

    // 02. CORS配置中间件
    setupCorsStrategyMiddleware(app);
    
    // 03. JWT中间件
    setupJwtValidMiddleware(app);

    // 04. 路由中间件
    setupRouterMiddleware(app,router);
    
    // 05. 路由守卫中间件
    setupRouterGuardMiddleware(app);
    
    // 99. 错误处理中间件，最后一个进行判断
    setupErrorHandlerMiddleware(app);
}
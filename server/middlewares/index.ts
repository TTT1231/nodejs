import type { Application } from "express";
import express from "express";
import { setupJsonParseMiddleware } from "./modules/00.res-json.server";
import { setupCorsStrategyMiddleware } from "./modules/01.cors.server";
import {setupRouterMiddleware} from "./modules/03.router.server"
import { setupRouterGuardMiddleware } from "./modules/04.router-guard.server";  
import { setupErrorHandlerMiddleware } from "./modules/99.error-handler.server";
import { setupJwtValidMiddleware } from "./modules/02.jwt-valid.server";



export async function initMiddlewares(app: Application,router: express.Router) {

    // 00. 基础解析中间件（Cookie、JSON、URL编码）
    setupJsonParseMiddleware(app);

    // 01. CORS配置中间件
    setupCorsStrategyMiddleware(app);
    
    // 02. JWT中间件
    setupJwtValidMiddleware(app);

    // 03. 路由中间件
    setupRouterMiddleware(app,router);
    
    // 04. 路由守卫中间件
    setupRouterGuardMiddleware(app);
    
    // 99. 错误处理中间件，最后一个进行判断
    setupErrorHandlerMiddleware(app);
}
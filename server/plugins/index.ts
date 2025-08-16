import type { Application, Router } from "express";
import defineInsertEnvPlugin from "./modules/01.insert-env.server"
import defineRouterPlugin from "./modules/02.register-router.server";

export async function initPlugins(app: Application,router: Router) {
    //顶层插入，第一个执行，否则顶层读取环境变量还没加载
    //01.insert-env.server.ts
    defineInsertEnvPlugin();

    // 02.register-router.server.ts
    await defineRouterPlugin(router);



}
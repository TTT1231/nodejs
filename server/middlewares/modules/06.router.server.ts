import type { Application,Router } from "express";

//06.router.ts  middleware
export function setupRouterMiddleware(app:Application,router: Router) {
    app.use(router);
}
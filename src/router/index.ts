import { Router } from "express";
import { setupDefaultRoute } from "./routes/default";

const router = Router();

//设置默认路由路由
setupDefaultRoute(router);


export default router;
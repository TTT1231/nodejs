import type { Application } from "express";
import cors from 'cors'

//02.cors.server.ts  middleware
export function setupCorsStrategyMiddleware(app:Application){

    //x-requested-with 标识请求XMLHttpRequest或fetch区别游览发起请求和表单提交或者之间访问url
    const requiredHeaders=["x-requested-with",'Content-Type', 'Authorization']


    const corsOptions = {
        origin: process.env.CORS_ORIGIN,
        optionsSuccessStatus: 200,
        credentials: true,
        method:['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [...requiredHeaders],
    }

    app.use(cors(corsOptions));
}
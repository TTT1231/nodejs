import type { Express } from "express";
import { AllowOriginEnum } from "../../enums/allowOrigin"
import cors from 'cors'
export function setupCorsStrategy(app:Express){

    const customHeaders=["my-socketio-header"]

    //x-requested-with 标识请求XMLHttpRequest或fetch区别游览发起请求和表单提交或者之间访问url
    const requiredHeaders=["x-requested-with",'Content-Type', 'Authorization']


    const corsOptions = {
        origin: `${AllowOriginEnum.FRONTSERVER}`,
        optionsSuccessStatus: 200,
        credentials: true,
        method:['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [...customHeaders,...requiredHeaders],
    }

    app.use(cors(corsOptions));
}
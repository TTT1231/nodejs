import type { Application,NextFunction } from "express";

//语法错误处理
const handleSyntaxError=(app:Application)=>{
    app.use((err: any, req: any, res: any, next: NextFunction) => {
        if(err instanceof SyntaxError){
            res.status(400).send('存在语法错误');
        }else{
            next();
        }
    })
}

//类型错误处理
const handleTypeError=(app:Application)=>{
    app.use((err: any, req: any, res: any, next: NextFunction) => {
        if(err instanceof TypeError){
            res.status(400).send('存在类型错误');
        }else{
            next();
        }
    })
}

//引用错误处理
const handleReferenceError=(app:Application)=>{
    app.use((err: any, req: any, res: any, next: NextFunction) => {
        if(err instanceof ReferenceError){
            res.status(400).send('存在引用错误');
        }else{
            next();
        }
    })
}

//网络错误处理
const handleNetworkError=(app:Application)=>{
    app.use((err: any, req: any, res: any, next: NextFunction) => {
        if(err instanceof URIError){
            res.status(400).send('存在网络错误');
        }else{
            next();
        }
    })
}

//数据库错误处理
const handleDatabaseError=(app:Application)=>{
    app.use((err: any, req: any, res: any, next: NextFunction) => {
        if(err instanceof EvalError){
            res.status(400).send('存在数据库错误');
        }else{
            next();
        }
    })
}

//未知错误处理
const handleUnknownError=(app:Application)=>{
    app.use((err: any, req: any, res: any, next: NextFunction) => {
        res.status(500).send('未知错误');
    })
}


// 99.error-handler.server.ts middleware
export const setupErrorHandlerMiddleware=(app:Application)=>{
    handleSyntaxError(app);
    handleTypeError(app);
    handleReferenceError(app);
    handleNetworkError(app);
    handleDatabaseError(app);
    handleUnknownError(app);
}
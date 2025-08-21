import type { Express, NextFunction } from 'express';

//语法错误处理
const handleSyntaxError = (app: Express) => {
   app.use((err: any, req: any, res: any, next: NextFunction) => {
      if (err instanceof SyntaxError) {
         res.status(400).send('存在语法错误');
      } else {
         next();
      }
   });
};

//类型错误处理
const handleTypeError = (app: Express) => {
   app.use((err: any, req: any, res: any, next: NextFunction) => {
      if (err instanceof TypeError) {
         res.status(400).send('存在类型错误');
      } else {
         next();
      }
   });
};

//引用错误处理
const handleReferenceError = (app: Express) => {
   app.use((err: any, req: any, res: any, next: NextFunction) => {
      if (err instanceof ReferenceError) {
         res.status(400).send('存在引用错误');
      } else {
         next();
      }
   });
};

//网络错误处理
const handleNetworkError = (app: Express) => {
   app.use((err: any, req: any, res: any, next: NextFunction) => {
      if (err instanceof URIError) {
         res.status(400).send('存在网络错误');
      } else {
         next();
      }
   });
};

//数据库错误处理
const handleDatabaseError = (app: Express) => {
   app.use((err: any, req: any, res: any, next: NextFunction) => {
      if (err instanceof EvalError) {
         res.status(400).send('存在数据库错误');
      } else {
         next();
      }
   });
};

//未知错误处理
const handleUnknownError = (app: Express) => {
   app.use((err: any, req: any, res: any, next: NextFunction) => {
      res.status(500).send('未知错误');
   });
};

//统一导出--全局错误处理
export const setupErrorHandler = (app: Express) => {
   handleSyntaxError(app);
   handleTypeError(app);
   handleReferenceError(app);
   handleNetworkError(app);
   handleDatabaseError(app);
   handleUnknownError(app);
};

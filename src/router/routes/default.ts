import type { Router } from 'express';

//默认路由
export const setupDefaultRoute = (router: Router) => {
   //根路由
   router.get('/', (req, res) => {
      res.send('根路由测试');
   });
};

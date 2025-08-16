import { defineNodeRoute } from '../utils/routeScanner';

export default defineNodeRoute((req, res, next) => {
    res.send("根路由测试 - 通过约定式路由");
});

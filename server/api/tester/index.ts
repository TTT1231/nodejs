import { defineNodeRoute } from '../../utils/routeScanner';

export default defineNodeRoute((req, res, next) => {
    res.send("测试者路由 - 通过约定式路由");
});

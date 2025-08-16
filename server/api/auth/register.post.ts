import { defineNodeRoute } from '../../utils/routeScanner';

export default defineNodeRoute((req, res, next) => {
    res.send("注册路由");
});

import { defineNodeRoute } from '../../../utils/routeScanner';

export default defineNodeRoute((req, res, next) => {
    // 获取查询参数
    const { nihao } = req.query;
    
    res.json({
        message: `处理查询参数: nihao=${nihao}`,
        queryParams: req.query,
        route: '/tester/son/index',
        note: '这个路由处理查询参数，如: /tester/son?nihao=value'
    });
});

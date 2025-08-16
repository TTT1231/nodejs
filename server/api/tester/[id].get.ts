import { defineNodeRoute } from './../../utils/routeScanner';

export default defineNodeRoute((req, res, next) => {
    const { id } = req.params;
    res.send("tester son dynamic route"+id);
});

import { generateJwtAccessToken, generateJwtRefreshToken } from '../../utils/jwtUtil';
import { defineNodeRoute } from '../../utils/routeScanner';

export default defineNodeRoute(async (req, res, next) => {
    try {

        const accessToken = await generateJwtAccessToken({ id: 1 });
        const refreshToken = await generateJwtRefreshToken({ id: 1 });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 15 * 60 * 1000 // 15分钟
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
        });

        return res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.log(err)
        return res.status(401).send("set token fail");
    }
    // 移除这行：res.send("登录测试路由");
});
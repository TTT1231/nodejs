import type { Application } from "express";
import {
    generateJwtAccessToken,
    validateJwtAccessToken,
    validateJwtRefreshToken
} from "../../utils/jwtUtil";
import { whiteListRoutes } from "../../utils/routeWhitelistUtil";

//02.jwt-valid.server.ts  middleware
export function setupJwtValidMiddleware(app: Application) {
    app.use(async (req, res, next) => {
        // 白名单检查
        if (whiteListRoutes.includes(req.path)) {
            return next();
        }

        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;
        

        // 无任何token的情况
        if (!accessToken && !refreshToken) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                message: 'No token provided',
                path: req.path
            });
        }

        // 验证Access Token
        if (accessToken) {
            try {
                await validateJwtAccessToken(accessToken);
                return next();
            } catch {

            }
        }

        // 验证Refresh Token
        if (refreshToken) {
            try {
                await validateJwtRefreshToken(refreshToken);
                // 生成新的Access Token
                const newAccessToken = await generateJwtAccessToken({ id: 1 });
                console.log('[JWT Middleware] 生成新Access Token');
                
                // 设置新Cookie
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 15 * 60 * 1000 // 15分钟
                });
                
                return next();
            } catch {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Both tokens expired',
                    details: 'Refresh Token expired'
                });
            }
        }

        // 其他无效情况
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token combination'
        });
    });
}

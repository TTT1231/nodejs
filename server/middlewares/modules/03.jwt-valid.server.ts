// 03.jwt-valid.server.ts
import type { Application } from "express";
import { TokenManager } from "../../utils/tokenManagerUtils";
import { whiteListRoutes } from "../../utils/routeWhitelistUtil";

const tokenManager = new TokenManager(
    3000,                   // AccessToken 缓存 3 秒
    6 * 60 * 60 * 1000,     // 每 6 小时清理一次
    10000                   // 最多缓存 10000 个 AccessToken
);

export function setupJwtValidMiddleware(app: Application) {
    app.use(async (req, res, next) => {
        if (whiteListRoutes.includes(req.path)) {
            return next();
        }

        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        if (accessToken) {
            const payload = await tokenManager.getAccessPayload(accessToken);
            if (payload) {
                req.user = payload;
                return next();
            }
        }

        if (refreshToken) {
            try {
                const payload = await tokenManager.refreshAccessToken(refreshToken, res);
                req.user = payload;
                return next();
            } catch {
                return res.status(401).json({
                    error: "Unauthorized",
                    message: "Invalid refresh token",
                });
            }
        }

        return res.status(401).json({
            error: "Unauthorized",
            message: "No valid token",
        });
    });
}

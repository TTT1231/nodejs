import type { Application } from "express";
import {
    generateJwtAccessToken,
    validateJwtAccessToken,
    validateJwtRefreshToken
} from "../../utils/jwtUtil";
import { whiteListRoutes } from "../../utils/routeWhitelistUtil";
import type { JwtPayload } from "../../types/jwtTypes";

//解决单位时间内，请求过多
let accessTokenCache: {
    jwtAccessToken: string;
    payload: any; // 解码后的用户信息 
    expiresAt: number;
} | null = null;

// ====== 当前 refresh 流程单例，避免并发重复刷新 ======
let currentAccessTokenUpdatePromise: Promise<string> | null = null;
const now = () => Date.now();
const CACHE_TTL = 3 * 1000; // 3秒缓存


//03.jwt-valid.server.ts  middleware
export function setupJwtValidMiddleware(app: Application) {
    app.use(async (req, res, next) => {
        // 白名单检查
        if (whiteListRoutes.includes(req.path)) {
            return next();
        }

        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        //优先使用缓存，这里是服务端，不用做验证token，且不会被篡改
        if ((accessTokenCache !== null) && accessTokenCache.expiresAt > now()) {
            return next();
        }

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
                const payload: JwtPayload = await validateJwtAccessToken(accessToken);
                accessTokenCache = {
                    jwtAccessToken: accessToken,
                    payload: payload,
                    expiresAt: now() + CACHE_TTL
                }
                return next();
            } catch {

            }
        }

        // 验证Refresh Token
        if (refreshToken) {
            if (currentAccessTokenUpdatePromise) {
                try {
                    await currentAccessTokenUpdatePromise;
                    return next();
                } catch {
                    return res.status(401).json({
                        error: "Unauthorized",
                        message: "Refresh failed",
                        details: '刷新失败',
                    });
                }
            }

            currentAccessTokenUpdatePromise = new Promise(async (resolve, reject) => {
                try {
                    const refreshPayload = await validateJwtRefreshToken(refreshToken);

                    const newAccessToken = await generateJwtAccessToken({
                        id: refreshPayload.id, // userId
                    });

                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: 60 * 60 * 1000,
                    });

                    // 更新缓存
                    accessTokenCache = {
                        jwtAccessToken: newAccessToken,
                        payload: { id: refreshPayload.id },
                        expiresAt: now() + CACHE_TTL,
                    };

                    console.log("[JWT Middleware] Access Token 刷新成功");

                    resolve(newAccessToken);
                    next();
                } catch (error) {
                    reject('refresh token validate fail');
                } finally {
                    currentAccessTokenUpdatePromise = null;
                }
            });

            // 等待 refresh token 验证完成
            try {
                await currentAccessTokenUpdatePromise;
                return; // next() 已经在 Promise 内部调用了
            } catch (error) {
                // refresh token 验证失败，返回 401 而不是让程序崩溃
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid refresh token'
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

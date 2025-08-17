import type { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            };
            cookies: {
                accessToken?: string;
                refreshToken?: string;
                [key: string]: any;
            };
        }
    }
}

export {};
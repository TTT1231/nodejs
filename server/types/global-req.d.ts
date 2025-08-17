import type { Request } from 'express';
import type { RouteDefinition } from '../utils/routeScanner';

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
    
    var routeDefinitions: Map<string, RouteDefinition>;
}

export {};
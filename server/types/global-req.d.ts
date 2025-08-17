import type { Request } from 'express';
import type { RouteDefinition } from '../utils/routeScanner';
import type { IUser } from './user';

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
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
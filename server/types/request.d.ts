import { Request as ExpressRequest } from 'express';


export interface ExtendedRequest extends ExpressRequest {
  cookies: {
    accessToken?: string;
    refreshToken?: string;
    [key: string]: any;
  };
  userId?:number
}

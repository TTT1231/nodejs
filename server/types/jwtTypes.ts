import type { JWTPayload } from 'jose';

export interface JwtPayload extends JWTPayload {
   //some payload
   //forexample id
   id: number;
}

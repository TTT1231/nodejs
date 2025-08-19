import { SignJWT, jwtVerify } from 'jose';
import type { JwtPayload } from 'server/types/jwtTypes';

const textEncoder = new TextEncoder();
let accessSecretBase64: Uint8Array | undefined = undefined;
let refreshSecretBase64: Uint8Array | undefined = undefined;

// 验证环境变量是否存在
function getRequiredEnv(key: string): string {
   const value = process.env[key];
   if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
   }
   return value;
}

function getAccessSecretBase64() {
   if (accessSecretBase64 === undefined) {
      accessSecretBase64 = textEncoder.encode(
         getRequiredEnv('NODE_JWT_ACCESS_SECRET')
      );
   }
   return accessSecretBase64;
}
function getRefreshSecretBase64() {
   if (refreshSecretBase64 === undefined) {
      refreshSecretBase64 = textEncoder.encode(
         getRequiredEnv('NODE_JWT_REFRESH_SECRET')
      );
   }
   return refreshSecretBase64;
}

//==============================generate JWT token ==============================
//generate jwt access token
export async function generateJwtAccessToken(payload: JwtPayload) {
   return await new SignJWT(payload)
      .setProtectedHeader({ alg: getRequiredEnv('NODE_JWT_ALGORITHM') })
      .setIssuedAt()
      .setIssuer(getRequiredEnv('NODE_JWT_ISSUER'))
      .setAudience(getRequiredEnv('NODE_JWT_AUDIENCE'))
      .setExpirationTime(getRequiredEnv('NODE_JWT_ACCESS_EXPIRES_IN'))
      .sign(getAccessSecretBase64());
}
//generate jwt refresh token
export async function generateJwtRefreshToken(payload: JwtPayload) {
   return await new SignJWT(payload)
      .setProtectedHeader({ alg: getRequiredEnv('NODE_JWT_ALGORITHM') })
      .setIssuedAt()
      .setIssuer(getRequiredEnv('NODE_JWT_ISSUER'))
      .setAudience(getRequiredEnv('NODE_JWT_AUDIENCE'))
      .setExpirationTime(getRequiredEnv('NODE_JWT_REFRESH_EXPIRES_IN'))
      .sign(getRefreshSecretBase64());
}

//==============================validate JWT token ===============================
//validate jwt access token
export async function validateJwtAccessToken(jwtToken: string) {
   try {
      const { payload } = await jwtVerify(jwtToken, getAccessSecretBase64());
      return payload as JwtPayload;
   } catch {
      throw new Error('invalid access token');
   }
}

//validate jwt refresh token
export async function validateJwtRefreshToken(jwtToken: string) {
   try {
      const { payload } = await jwtVerify(jwtToken, getRefreshSecretBase64());
      return payload as JwtPayload;
   } catch {
      throw new Error('invalid refresh token');
   }
}

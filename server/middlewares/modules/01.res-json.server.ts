import type { Application } from "express";
import express from "express";
import cookieParser from "cookie-parser";

//00.res-json  middleware
/**
 * @description 基础解析中间件：JSON、URL编码、Cookie 解析
 */
export function setupJsonParseMiddleware(app: Application) {
  // Cookie 解析中间件
  app.use(cookieParser());
  
  // JSON 解析中间件
  app.use(express.json()); //Content-Type: application/json,post body
  app.use(express.urlencoded({ extended: true })); //application/x-www-form-urlencoded form表单提交

  //other middleware can be added here if needed
}

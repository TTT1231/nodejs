import fs from 'fs';
import path from 'path';
import { Router, Response, NextFunction } from 'express';
import { ExtendedRequest } from '../types/request';

// 路由处理器类型 - 使用扩展的Request类型
export type RouteHandler = (req: ExtendedRequest, res: Response, next: NextFunction) => void | Promise<void | any>;

// 路由定义类型
export interface RouteDefinition {
  handler: RouteHandler;
  method: string;
  path: string;
  filePath: string;
}

// 存储所有路由定义
const routeDefinitions: Map<string, RouteDefinition> = new Map();

/**
 * 全局 defineNodeRoute 函数
 * @param handler 路由处理函数
 * @returns 路由处理函数
 */
export function defineNodeRoute(handler: RouteHandler): RouteHandler {
  // 获取调用栈信息来确定文件路径
  const stack = new Error().stack;
  if (stack) {
    const stackLines = stack.split('\n');
    // 找到调用 defineNodeRoute 的文件
    for (let i = 1; i < stackLines.length; i++) {
      const line = stackLines[i];
      if (line.includes('.ts') && !line.includes('routeScanner.ts')) {
        // 改进正则表达式以更好地匹配Windows路径，并去除行号信息
        const match = line.match(/\(([A-Za-z]:[^:)]+\.ts)/);
        if (match) {
          const filePath = match[1];
          
          try {
            const { method, path: routePath } = parseRouteFromFilePath(filePath);
            
            routeDefinitions.set(filePath, {
              handler,
              method,
              path: routePath,
              filePath
            });
            break;
          } catch (error) {
            console.error(`❌ Error parsing route from ${filePath}:`, error instanceof Error ? error.message : error);
          }
        }
      }
    }
  }
  
  return handler;
}

/**
 * 从文件路径解析路由信息
 * @param filePath 文件路径
 * @returns 解析后的方法和路径
 */
function parseRouteFromFilePath(filePath: string): { method: string; path: string } {
  // 输入验证
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid file path provided');
  }

  // 验证文件是否为 TypeScript 文件
  if (!filePath.endsWith('.ts')) {
    throw new Error(`File must be a TypeScript file: ${filePath}`);
  }

  // 标准化路径分隔符
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // 找到 api 目录的位置
  const apiIndex = normalizedPath.indexOf('/api/');
  if (apiIndex === -1) {
    throw new Error(`File is not in the api directory: ${filePath}`);
  }
  
  // 获取 api 目录后的相对路径
  const relativePath = normalizedPath.substring(apiIndex + 5); // 5 = '/api/'.length
  
  // 验证相对路径不为空
  if (!relativePath) {
    throw new Error(`Invalid api file path: ${filePath}`);
  }
  
  // 解析文件名
  const fileName = path.basename(relativePath, '.ts');
  const directory = path.dirname(relativePath);
  
  // 验证文件名不为空
  if (!fileName) {
    throw new Error(`Invalid file name: ${filePath}`);
  }
  
  // 解析 HTTP 方法（从文件名中提取，如 hello.get.ts -> get）
  const fileParts = fileName.split('.');
  let method = 'get'; // 默认方法
  let routeName = fileName;
  
  if (fileParts.length >= 2) {
    const possibleMethod = fileParts[fileParts.length - 1].toLowerCase();
    const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
    
    if (validMethods.includes(possibleMethod)) {
      method = possibleMethod;
      routeName = fileParts.slice(0, -1).join('.');
    }
  }
  
  // 验证路由名称
  if (!routeName && routeName !== 'index') {
    throw new Error(`Invalid route name derived from file: ${filePath}`);
  }
  
  // 构建路由路径
  let routePath = '';
  
  // 处理目录路径（不处理动态参数，只处理静态路径）
  if (directory && directory !== '.') {
    // 验证目录路径格式
    const directorySegments = directory.split('/');
    for (const segment of directorySegments) {
      if (!segment || segment.includes('..') || segment.includes('<') || segment.includes('>')) {
        throw new Error(`Invalid directory segment in path: ${directory}`);
      }
    }
    routePath = '/' + directory;
  }
  
  // 添加文件名作为路径（除非是 index）
  if (routeName && routeName !== 'index') {
    // 处理动态路由参数（只在文件名级别）
    if (routeName.startsWith('[') && routeName.endsWith(']')) {
      const paramName = routeName.slice(1, -1);
      // 验证参数名格式
      if (!paramName || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(paramName)) {
        throw new Error(`Invalid dynamic parameter name: ${paramName} in file ${filePath}`);
      }
      routePath += '/:' + paramName;
    } else {
      // 验证静态路由名称格式
      if (!/^[a-zA-Z0-9_-]+$/.test(routeName)) {
        throw new Error(`Invalid route name format: ${routeName} in file ${filePath}`);
      }
      routePath += '/' + routeName;
    }
  }
  
  // 确保路径以 / 开头
  if (!routePath) {
    routePath = '/';
  } else if (!routePath.startsWith('/')) {
    routePath = '/' + routePath;
  }
  
  // 验证最终路径格式
  if (!/^\/[a-zA-Z0-9\/_:-]*$/.test(routePath)) {
    throw new Error(`Generated route path contains invalid characters: ${routePath} from file ${filePath}`);
  }
  
  return { method, path: routePath };
}

/**
 * 扫描 api 目录并加载所有路由文件
 * @param apiDir api 目录路径
 */
export async function scanApiDirectory(apiDir: string): Promise<void> {
  if (!fs.existsSync(apiDir)) {
    console.warn(`⚠️ API directory ${apiDir} does not exist`);
    return;
  }
  
  try {
    const files = await getAllTsFiles(apiDir);
    console.log(`📂 Found ${files.length} TypeScript files in API directory`);
    
    // 动态导入所有路由文件
    for (const file of files) {
      try {
        await import(file);
      } catch (error) {
        console.error(`❌ Error importing route file ${path.basename(file)}:`, 
                     error instanceof Error ? error.message : error);
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning API directory ${apiDir}:`, 
                 error instanceof Error ? error.message : error);
  }
}

/**
 * 递归获取目录下的所有 .ts 文件
 * @param dir 目录路径
 * @returns ts 文件路径数组
 */
async function getAllTsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          const subFiles = await getAllTsFiles(fullPath);
          files.push(...subFiles);
        } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      } catch (error) {
        console.error(`❌ Error accessing file ${fullPath}:`, 
                     error instanceof Error ? error.message : error);
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dir}:`, 
                 error instanceof Error ? error.message : error);
  }
  
  return files;
}

/**
 * 将所有扫描到的路由注册到 Express Router
 * @param router Express Router 实例
 */
export function registerRoutes(router: Router): void {
  for (const [, routeDefinition] of routeDefinitions) {
    const { method, path: routePath, handler } = routeDefinition;
    
    try {      
      // 注册路由到 router
      switch (method.toLowerCase()) {
        case 'get':
          router.get(routePath, handler);
          break;
        case 'post':
          router.post(routePath, handler);
          break;
        case 'put':
          router.put(routePath, handler);
          break;
        case 'delete':
          router.delete(routePath, handler);
          break;
        case 'patch':
          router.patch(routePath, handler);
          break;
        case 'head':
          router.head(routePath, handler);
          break;
        case 'options':
          router.options(routePath, handler);
          break;
        default:
          console.warn(`⚠️ Unsupported HTTP method: ${method} for route ${routePath}`);
      }
    } catch (error) {
      console.error(`❌ Failed to register route ${method.toUpperCase()} ${routePath}:`, 
                   error instanceof Error ? error.message : error);
    }
  }
  
  console.log(`✅ Total routes registered: ${routeDefinitions.size}`);
}

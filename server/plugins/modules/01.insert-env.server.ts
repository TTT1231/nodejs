import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 01.insert-env.server.ts plugin
/**
 * @description plugin insert env
 *  if not have .env file or other then no load env file
 */
const defineInsertEnvPlugin = () => {
   //target env
   const envFileName =
      process.env.NODE_ENV === 'production'
         ? '.env.production'
         : process.env.NODE_ENV === 'development'
           ? '.env.development'
           : '.env';

   // 修复工作目录问题：如果在 dist 目录中，向上查找 .env 文件
   let envPath: string;
   if (process.cwd().endsWith('dist')) {
      // 在 dist 目录中，查找父目录的 .env 文件
      envPath = path.resolve(process.cwd(), '..', envFileName);
   } else {
      // 在正常目录中
      envPath = path.resolve(process.cwd(), envFileName);
   }

   // load env file
   if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
   } else {
      // 尝试查找默认的 .env 文件
      const defaultEnvPath = process.cwd().endsWith('dist')
         ? path.resolve(process.cwd(), '..', '.env')
         : path.resolve(process.cwd(), '.env');

      if (fs.existsSync(defaultEnvPath)) {
         dotenv.config({ path: defaultEnvPath });
      } else {
         dotenv.config();
      }
   }
};

export default defineInsertEnvPlugin;

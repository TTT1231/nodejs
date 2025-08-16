import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// 01.insert-env.server.ts plugin
/**
 * @description plugin insert env
 *  if not have .env file or other then no load env file
 */
const defineInsertEnvPlugin = () => {
  //target env
  const envFileName =
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : process.env.NODE_ENV === "development"
      ? ".env.development"
      : ".env";

  const envPath = path.resolve(process.cwd(), envFileName);

  // load env file
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    dotenv.config(); 
  }
};

export default defineInsertEnvPlugin;

// esbuild.config.mjs
import { build } from "esbuild";
import { rmSync, existsSync, cpSync } from "fs";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const outdir = "dist";

// 先清空 dist 目录
if (existsSync(outdir)) rmSync(outdir, { recursive: true });

// 获取所有 TypeScript 文件
function getAllTsFiles(dir, basePath = dir) {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllTsFiles(fullPath, basePath));
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 打包核心入口
await build({
  entryPoints: ["server/main.ts"],
  outdir,
  bundle: true,
  platform: "node",
  target: "node18",
  format: "cjs", // 改为 CommonJS 格式
  sourcemap: true,
  external: ["fs", "path", "url"], // Node 内置模块不打包
});

// 单独编译所有其他 TypeScript 文件（包括 API 文件）
const allFiles = getAllTsFiles("server");
const otherFiles = allFiles.filter(file => !file.endsWith('main.ts'));

if (otherFiles.length > 0) {
  await build({
    entryPoints: otherFiles,
    outdir,
    bundle: false,
    platform: "node",
    target: "node18",
    format: "cjs",
    sourcemap: true,
    outbase: "server",
  });
}

// 复制静态文件目录（约定大于配置：只有当 server/public/static 存在时才复制整个 public 目录）
if (existsSync("server/public/static")) {
  cpSync("server/public", `${outdir}/public`, { recursive: true });
  console.log('📁 Static files copied to dist/public (triggered by server/public/static)');
} else {
  console.log('ℹ️  No server/public/static directory found, skipping static files copy');
}

console.log('✅ Build completed successfully!');

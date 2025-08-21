// esbuild.config.js
import { build } from "esbuild";

await build({
  entryPoints: ["src/main.ts"],
  outdir: "dist",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  external: ["fs", "path", "url"], //内置模块不打包
  sourcemap: true,
}).catch(() => process.exit(1));

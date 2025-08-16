# Node.js RESTful API 脚手架（约定式路由 + 插件/中间件 + JWT）

一个轻量、可维护的 RESTful API 脚手架。通过“约定大于配置”的路由扫描器自动注册 API，结合插件（plugins）与中间件（middlewares）分层配置，开发体验简单明了，易于扩展与维护。

## 特性

- 约定式路由：按文件/目录命名自动生成 HTTP 方法与路径，无需手动注册
- 插件/中间件分层：插件负责环境与路由注册，中间件负责解析、CORS、鉴权、路由、守卫、错误处理
- JWT 基于 Cookie 的鉴权与“路由白名单”（未登录可访问的路由）
- TypeScript + ts-node 开发体验，nodemon 热更新
- 零侵入、易读的项目结构，可渐进式扩展

## 目录结构（精简）

```
server/
	main.ts                         # 入口，初始化插件与中间件并启动服务
	api/                            # 约定式路由目录（自动扫描并注册）
		index.get.ts                  # GET /
		auth/
			login.get.ts               # GET /auth/login（发放 Cookie：accessToken、refreshToken）
			register.post.ts           # POST /auth/register（示例）
		tester/
			index.ts                    # GET /tester
			[id].get.ts                 # GET /tester/:id
			son/
				index.get.ts              # GET /tester/son?nihao=xxx
				[nihao].get.ts            # GET /tester/son/:nihao（示例）
	plugins/                        # 插件：环境变量加载、路由注册
		modules/
			01.insert-env.server.ts         # 按 NODE_ENV 加载 .env 文件
			02.register-router.server.ts     # 扫描并注册路由
	middlewares/                    # 中间件：解析、CORS、JWT、路由、守卫、错误处理
		modules/
			00.res-json.server.ts           # cookieParser、express.json、urlencoded
			01.cors.server.ts               # CORS 策略（基于 CORS_ORIGIN，credentials=true）
			02.jwt-valid.server.ts          # JWT 鉴权（基于 Cookie），支持白名单与自动续签
			03.router.server.ts             # 挂载 Router
			04.router-guard.server.ts       # 404 未找到
			99.error-handler.server.ts      # 统一错误处理
	utils/
		jwtUtil.ts                     # 生成/校验 Access/Refresh Token
		routeScanner.ts               # 路由扫描与注册核心（defineNodeRoute）
		routeWhitelistUtil.ts         # 路由白名单（无需登录）

package.json                      # scripts：dev（nodemon）、start（ts-node）
```

## 快速开始

前置要求：Node.js 18+；推荐使用 pnpm。

```powershell
# 安装依赖（推荐）
pnpm install

# 开发模式（热更新）
pnpm dev

# 生产/普通启动
pnpm start
```

默认运行在 http://localhost:7001/

> 如需修改端口，目前在 `server/main.ts` 中硬编码为 7001，可自行改为读取 `process.env.PORT`。

## 路由约定

- 目录即路径、文件即末段：`server/api/**` 下的 .ts 文件会被自动扫描
- HTTP 方法取自文件名后缀：`*.get.ts|post.ts|put.ts|delete.ts|patch.ts|head.ts|options.ts`
- `index.*.ts` 映射到所在目录根路径
- 动态参数采用中括号：`[id].get.ts` -> `/:id`

示例映射：

- `server/api/index.get.ts` -> GET `/`
- `server/api/tester/index.ts` -> GET `/tester`
- `server/api/tester/[id].get.ts` -> GET `/tester/:id`
- `server/api/tester/son/index.get.ts` -> GET `/tester/son?nihao=xxx`
- `server/api/tester/son/[nihao].get.ts` -> GET `/tester/son/:nihao`

定义路由（示例）：

```ts
// server/api/ping.get.ts -> GET /ping
import { defineNodeRoute } from "../utils/routeScanner";

export default defineNodeRoute((req, res) => {
	res.json({ ok: true, t: Date.now() });
});
```

注意：只有导出 `export default defineNodeRoute(handler)` 的文件才会注册为路由；空文件或未使用该方法的文件不会生效。

## 认证与访问控制（JWT + Cookie）

- 鉴权介质：服务端通过 `Set-Cookie` 写入 `accessToken` 与 `refreshToken`（均为 httpOnly Cookie）。
- 中间件：`02.jwt-valid.server.ts` 会拦截除白名单外的所有请求，验证 Access Token；过期时若 Refresh Token 仍有效，将自动续发新的 Access Token（同样以 Cookie 写回）。
- 白名单：`utils/routeWhitelistUtil.ts`，默认允许：`/auth/login`、`/auth/register`。
- 登录流程：先请求 `GET /auth/login` 获取 Cookie，再访问受保护的业务接口。

示例（使用 curl 保存并携带 Cookie）：

```powershell
# 1) 登录，保存 Cookie
curl -c cookies.txt http://localhost:7001/auth/login

# 2) 携带 Cookie 访问受保护资源
curl -b cookies.txt http://localhost:7001/tester
curl -b cookies.txt http://localhost:7001/tester/123
```

说明：生产环境建议将 Cookie 的 `secure` 设为 true（当前示例代码在 development 下为 false）。

## 运行示例（请求）

```powershell
curl -b cookies.txt http://localhost:7001/
# 若已登录（或将 -b cookies.txt 换为你已保存的 Cookie 路径）
curl -b cookies.txt http://localhost:7001/tester
curl -b cookies.txt http://localhost:7001/tester/123
curl -b cookies.txt "http://localhost:7001/tester/son?nihao=abc"
curl -b cookies.txt http://localhost:7001/tester/son/xyz
```

## 插件（plugins）

- 01.insert-env.server.ts：根据 `NODE_ENV` 自动加载 `.env` / `.env.development` / `.env.production`
- 02.register-router.server.ts：扫描 `server/api` 下的 .ts 文件并注册到 Express Router

## 中间件（middlewares）

按顺序初始化：

1) `00.res-json.server.ts`：`cookie-parser`、`express.json()`、`express.urlencoded()`
2) `01.cors.server.ts`：基于 `CORS_ORIGIN` 的跨域策略，`credentials=true`
3) `02.jwt-valid.server.ts`：JWT 鉴权（Cookie 中取 `accessToken`/`refreshToken`），支持白名单与自动续签
4) `03.router.server.ts`：挂载由插件注册好的 Router
5) `04.router-guard.server.ts`：兜底 404（路由未找到）
6) `99.error-handler.server.ts`：语法/类型/引用/网络/数据库/未知错误处理

## 环境变量

通过 dotenv 加载：

- `NODE_ENV`：development / production（决定加载哪个 .env 文件）
- `CORS_ORIGIN`：允许的跨域来源，例：`http://localhost:5173`
  
JWT 相关（必须配置，否则鉴权与登录将失败）：

```
# JWT 算法与基本信息
NODE_JWT_ALGORITHM=HS256
NODE_JWT_ISSUER=demo-issuer
NODE_JWT_AUDIENCE=demo-audience

# 有效期（示例：15分钟、7天）
NODE_JWT_ACCESS_EXPIRES_IN=15m
NODE_JWT_REFRESH_EXPIRES_IN=7d

# 对称密钥（示例值请替换为安全的随机密钥）
NODE_JWT_ACCESS_SECRET=your-256-bit-secret-1
NODE_JWT_REFRESH_SECRET=your-256-bit-secret-2
```

示例 `.env.development`：

```
CORS_ORIGIN=http://localhost:5173
# PORT=7001  # 如你修改 main.ts 使其读取环境变量
# JWT 示例（请按照上方键名补充完整）
NODE_JWT_ALGORITHM=HS256
NODE_JWT_ISSUER=demo-issuer
NODE_JWT_AUDIENCE=demo-audience
NODE_JWT_ACCESS_EXPIRES_IN=15m
NODE_JWT_REFRESH_EXPIRES_IN=7d
NODE_JWT_ACCESS_SECRET=dev-secret-1
NODE_JWT_REFRESH_SECRET=dev-secret-2
```

## 新增一个 API 的最小步骤

1) 在 `server/api` 下创建对应目录与文件，命名决定路径与方法
2) 在文件中 `export default defineNodeRoute((req, res) => { ... })`

例如新增一个创建用户的 POST 接口：

```
server/api/users/create.post.ts  ->  POST /users/create
```

```ts
import { defineNodeRoute } from "../../utils/routeScanner";

export default defineNodeRoute((req, res) => {
	const { name } = req.body;
	res.status(201).json({ id: 1, name });
});
```

保存后（开发模式下）会被自动扫描与注册。

## 已知事项与建议

- 路由注册依赖 `defineNodeRoute` 通过调用堆栈解析文件路径，请确保在路由文件顶层直接导出且不要包裹额外层级
- 当前端口写死为 7001，可改造成 `process.env.PORT ?? 7001`
- 仅扫描 `.ts` 文件，`.d.ts` 会被忽略
- 启用 JWT 中间件后，除白名单外的接口均需携带有效 Cookie；请先访问 `/auth/login` 获取 Cookie 或为测试临时将路由加入白名单
- 生产环境请将 Cookie `secure` 设为 true，并妥善保管 JWT 密钥

## 许可证

ISC

—— 作者：TTT1231


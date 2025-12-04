# 快速启动指南

## 第一步：安装依赖

```bash
npm install
```

## 第二步：启动项目

### 方式一：同时启动（推荐）

```bash
npm run dev
```

这将同时启动：
- Express 后端服务（端口 3001）
- Nuxt3 前端服务（端口 3000）

### 方式二：分别启动

**终端 1 - 启动后端：**
```bash
npm run server
```

**终端 2 - 启动前端：**
```bash
npm run dev:nuxt
```

## 第三步：访问应用

- 前端地址：http://localhost:3000
- 后端 API：http://localhost:3001

## 测试流程

1. **访问首页**：http://localhost:3000
2. **注册账号**：点击"注册"，填写用户名、邮箱和密码（至少6位）
3. **登录**：使用注册的邮箱和密码登录
4. **浏览商品**：登录后自动跳转到商品列表页
5. **查看商品详情**：点击任意商品卡片查看详情

## 常见问题

### 端口被占用

如果 3000 或 3001 端口被占用，可以：

1. 修改 Express 端口：在 `.env` 文件中设置 `PORT=其他端口`
2. 修改 Nuxt 端口：在 `nuxt.config.js` 中配置 `devServer.port`

### 依赖安装失败

确保 Node.js 版本 >= 18，然后：

```bash
rm -rf node_modules package-lock.json
npm install
```

### Cookie 相关问题

确保：
1. 前端和后端在同一域名下（开发环境使用 localhost）
2. 检查浏览器是否允许 Cookie
3. 生产环境需要配置 HTTPS 和正确的域名

## 下一步

- 查看 `README.md` 了解完整功能
- 查看代码注释了解实现细节
- 根据需求扩展功能（购物车、订单等）


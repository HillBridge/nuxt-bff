# API 访问指南

## 重要说明

本项目有两个 API 访问方式：

### 1. 直接访问 Express 后端（端口 3001）

**适用场景**：测试、调试、直接调用后端接口

**访问地址**：
- ✅ **推荐使用**：`http://127.0.0.1:3001/api/auth/me`
- ⚠️ 也可以使用：`http://localhost:3001/api/auth/me`（可能有 DNS 解析延迟）

**特点**：
- 直接访问 Express 后端，不经过 Nuxt 代理
- 响应更快
- 适合 API 测试工具（如 Postman、curl）

**示例**：
```bash
# 测试健康检查
curl http://127.0.0.1:3001/api/health

# 测试认证接口（需要有效的 token）
curl http://127.0.0.1:3001/api/auth/me \
  -H "Cookie: token=your-token-here"
```

### 2. 通过 Nuxt Server API 代理（端口 3000）

**适用场景**：前端应用调用、需要 Cookie 自动传递

**访问地址**：
- `http://localhost:3000/api/auth/me`

**特点**：
- 经过 Nuxt Server API 代理层
- 自动处理 Cookie 传递
- 统一的错误处理
- 适合前端应用使用

**示例**：
```bash
# 通过 Nuxt 代理访问
curl http://localhost:3000/api/auth/me \
  -H "Cookie: token=your-token-here"
```

## 常见问题

### Q: 为什么访问 `localhost:3001` 很慢？

**A**: 可能的原因：
1. DNS 解析延迟：`localhost` 需要 DNS 解析，而 `127.0.0.1` 是直接 IP 地址
2. 请求被 Nuxt Server API 拦截：如果 Nuxt 也在处理这个路径，可能会有延迟

**解决方案**：
- ✅ 使用 `127.0.0.1:3001` 而不是 `localhost:3001`
- ✅ 或者通过 Nuxt 代理访问：`http://localhost:3000/api/auth/me`

### Q: 为什么返回 404？

**A**: 可能的原因：
1. 路由路径错误：确保路径是 `/api/auth/me` 而不是 `/auth/me`
2. 请求被 Nuxt 处理：如果访问 `localhost:3001` 但请求被 Nuxt 拦截，可能返回 404
3. 后端服务未启动：确保 Express 后端正在运行

**解决方案**：
1. 检查后端服务是否运行：
   ```bash
   ps aux | grep "node backend"
   ```

2. 测试健康检查接口：
   ```bash
   curl http://127.0.0.1:3001/api/health
   ```

3. 查看后端日志，确认请求是否到达后端

### Q: 如何确认请求到达了正确的服务器？

**A**: 检查响应头：
- Express 后端：响应头包含 `X-Powered-By: Express`
- Nuxt Server API：响应头不包含 `X-Powered-By: Express`，错误格式不同

**示例**：
```bash
# Express 后端响应
curl -I http://127.0.0.1:3001/api/health
# 应该看到: X-Powered-By: Express

# Nuxt Server API 响应
curl -I http://localhost:3000/api/auth/me
# 不会看到 X-Powered-By: Express
```

## 最佳实践

1. **开发环境测试**：
   - 使用 `127.0.0.1:3001` 直接访问 Express 后端
   - 使用 `localhost:3000` 访问 Nuxt 前端和代理 API

2. **前端应用调用**：
   - 始终使用相对路径：`/api/auth/me`
   - Nuxt 会自动通过 Server API 代理到后端

3. **API 测试工具**：
   - 使用 `http://127.0.0.1:3001/api/...` 直接测试后端
   - 确保设置正确的 Cookie 头

## 端口说明

- **3000**: Nuxt 前端服务器（包含 Server API 代理）
- **3001**: Express 后端服务器

## 调试技巧

1. **查看后端日志**：
   - Express 后端会在控制台输出请求日志（开发环境）
   - 查看 `[时间] METHOD /path` 格式的日志

2. **查看 Nuxt 日志**：
   - Nuxt 开发服务器会显示所有请求
   - 查看是否有错误信息

3. **使用浏览器开发者工具**：
   - Network 标签查看请求详情
   - 检查请求 URL、状态码、响应头


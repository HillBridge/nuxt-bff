# 浏览器访问 localhost:3001 返回 404 的解决方案

## 问题原因

**核心问题**：Nuxt 开发服务器也在监听 3001 端口，导致浏览器访问 `localhost:3001` 时请求被 Nuxt 拦截，而不是 Express 后端。

从进程检查可以看到：
- **PID 65069**: Nuxt 开发服务器（也在监听 3001）
- **PID 65079**: Express 后端服务器（监听 3001）

当浏览器访问 `localhost:3001` 时：
- 系统可能优先连接到 Nuxt 服务器
- Nuxt 的 Server API 路由会处理 `/api/auth/me` 请求
- 如果 Nuxt Server API 找不到对应路由或处理失败，可能返回 404

## 解决方案

### ✅ 方案 1：使用 127.0.0.1（最简单，推荐）

在浏览器中直接使用 IPv4 地址访问：

```
http://127.0.0.1:3001/api/auth/me
```

**优点**：
- 不需要修改任何代码
- 立即生效
- 直接访问 Express 后端，响应更快

### ✅ 方案 2：通过 Nuxt 代理访问（推荐用于前端应用）

在浏览器中访问 Nuxt 代理的 API：

```
http://localhost:3000/api/auth/me
```

**优点**：
- 这是正确的访问方式（前端应该通过 Nuxt 代理）
- 自动处理 Cookie
- 统一的错误处理

### ✅ 方案 3：清除浏览器缓存

如果浏览器缓存了之前的 404 响应：

1. **Chrome/Edge**：
   - 按 `F12` 打开开发者工具
   - 右键点击刷新按钮
   - 选择"清空缓存并硬性重新加载"

2. **Firefox**：
   - 按 `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)

3. **Safari**：
   - 按 `Cmd+Option+E` 清空缓存
   - 然后按 `Cmd+R` 刷新

### ✅ 方案 4：使用无痕模式测试

打开浏览器的无痕/隐私模式，访问：

```
http://127.0.0.1:3001/api/auth/me
```

这样可以排除缓存和扩展的影响。

## 验证方法

### 1. 检查响应来源

在浏览器开发者工具的 Network 标签中，查看响应头：

**Express 后端响应**（正确）：
```
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
```

**Nuxt Server API 响应**（被拦截）：
```
HTTP/1.1 401
content-type: application/json
x-content-type-options: nosniff
x-frame-options: DENY
```

### 2. 查看后端日志

如果请求到达 Express 后端，应该在后端控制台看到：

```
[2025-12-04T09:48:26.000Z] GET /api/auth/me
```

如果没有看到这个日志，说明请求没有到达 Express 后端。

## 为什么会出现这个问题？

1. **端口冲突**：Nuxt 开发服务器可能因为某种原因也在监听 3001
2. **IPv6 优先**：浏览器访问 `localhost` 时可能优先使用 IPv6 (`::1`)，而 Nuxt 可能只监听 IPv6
3. **路由匹配**：Nuxt 的 Server API 路由 `/api/auth/me` 会匹配这个请求

## 最佳实践

### 对于 API 测试工具（Postman、curl）

```bash
# ✅ 使用 127.0.0.1
curl http://127.0.0.1:3001/api/auth/me
```

### 对于前端应用

```javascript
// ✅ 使用相对路径，Nuxt 会自动代理
const response = await $fetch('/api/auth/me')

// ✅ 或者明确使用 Nuxt 的地址
const response = await $fetch('http://localhost:3000/api/auth/me')
```

### 对于浏览器直接访问

```
# ✅ 直接访问 Express 后端
http://127.0.0.1:3001/api/auth/me

# ✅ 或通过 Nuxt 代理
http://localhost:3000/api/auth/me
```

## 快速测试

在浏览器中依次测试：

1. **测试 Express 后端**（应该返回 401，不是 404）：
   ```
   http://127.0.0.1:3001/api/auth/me
   ```

2. **测试 Nuxt 代理**（应该返回 401，不是 404）：
   ```
   http://localhost:3000/api/auth/me
   ```

3. **测试健康检查**（应该返回 200）：
   ```
   http://127.0.0.1:3001/api/health
   ```

如果以上测试都正常，说明问题已解决。

## 如果问题仍然存在

1. **检查后端服务是否运行**：
   ```bash
   ps aux | grep "node backend"
   ```

2. **查看后端日志**：
   检查 Express 后端控制台是否有请求日志

3. **检查端口占用**：
   ```bash
   lsof -i :3001
   ```

4. **重启所有服务**：
   ```bash
   # 停止所有服务（Ctrl+C）
   npm run dev
   ```


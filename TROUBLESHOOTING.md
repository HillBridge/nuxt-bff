# 故障排查指南

## ERROR unreachable 错误

### 错误含义
"ERROR unreachable" 表示 Nuxt Server API 无法连接到 Express 后端服务。

### 常见原因

1. **Express 后端服务未启动**
   - 后端服务需要在端口 3001 上运行
   - 检查后端服务是否正在运行

2. **端口冲突**
   - 端口 3001 可能被其他程序占用
   - 检查端口占用情况

3. **配置错误**
   - `apiBase` 配置可能不正确
   - 检查 `nuxt.config.js` 中的配置

4. **网络连接问题**
   - 防火墙可能阻止了连接
   - 本地网络配置问题

### 解决方案

#### 1. 检查后端服务是否运行

```bash
# 检查进程
ps aux | grep "node backend"

# 检查端口
lsof -i :3001
# 或
netstat -an | grep 3001
```

#### 2. 启动后端服务

如果后端服务未运行，启动它：

```bash
# 方式一：单独启动后端
npm run server

# 方式二：同时启动前后端
npm run dev
```

#### 3. 测试后端连接

```bash
# 测试健康检查接口
curl http://127.0.0.1:3001/api/health

# 应该返回：
# {"status":"ok","message":"Server is running"}
```

#### 4. 检查配置

确保 `nuxt.config.js` 中的配置正确：

```javascript
runtimeConfig: {
  apiBase: process.env.API_BASE || "http://localhost:3001",
}
```

#### 5. 检查环境变量

如果使用环境变量，确保 `.env` 文件存在且配置正确：

```env
API_BASE=http://localhost:3001
PORT=3001
```

#### 6. 重启服务

如果问题仍然存在，尝试重启所有服务：

```bash
# 停止所有服务（Ctrl+C）
# 然后重新启动
npm run dev
```

### 验证修复

修复后，应该能够：

1. 访问后端健康检查接口：
   ```bash
   curl http://127.0.0.1:3001/api/health
   ```

2. 通过 Nuxt Server API 访问：
   ```bash
   curl http://localhost:3000/api/auth/me
   ```

3. 在浏览器中访问前端页面，不再出现 "unreachable" 错误

### 其他常见问题

#### 端口被占用

如果端口 3001 被占用：

1. 查找占用端口的进程：
   ```bash
   lsof -ti:3001
   ```

2. 终止进程（替换 PID）：
   ```bash
   kill -9 <PID>
   ```

3. 或者修改后端端口（在 `.env` 文件中）：
   ```env
   PORT=3002
   ```
   然后更新 `nuxt.config.js` 中的 `apiBase` 配置

#### 防火墙问题

如果怀疑是防火墙问题：

1. 检查防火墙设置
2. 确保本地回环地址（127.0.0.1）未被阻止
3. 尝试使用 `127.0.0.1` 而不是 `localhost`

### 获取帮助

如果问题仍然存在：

1. 检查 Nuxt 开发服务器的控制台输出
2. 检查 Express 后端的控制台输出
3. 查看浏览器控制台的错误信息
4. 检查网络请求（使用浏览器开发者工具）


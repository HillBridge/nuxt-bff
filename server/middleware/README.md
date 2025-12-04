# Server API 中间件文档

本目录包含用于增强 Nuxt Server API 安全性、性能和可维护性的中间件。

## 中间件列表

### 1. 请求日志中间件 (`logger.js`)
- **功能**: 记录所有 API 请求的详细信息
- **特性**:
  - 自动生成请求ID
  - 记录请求方法、URL、IP、User-Agent
  - 记录响应状态码和响应时间
  - 生产环境仅记录错误和警告

### 2. 速率限制中间件 (`rateLimiter.js`)
- **功能**: 防止暴力破解和 DDoS 攻击
- **特性**:
  - 基于 IP 地址的速率限制
  - 不同接口可配置不同的限制规则
  - 登录接口：每分钟最多 5 次
  - 注册接口：每小时最多 3 次
  - 其他接口：每分钟最多 60 次
  - 自动清理过期记录

### 3. 请求验证中间件 (`validator.js`)
- **功能**: 验证请求的有效性
- **特性**:
  - 验证请求方法
  - 验证内容类型
  - 验证请求体大小（最大 10MB）
  - 防止恶意请求

### 4. 安全头中间件 (`security.js`)
- **功能**: 设置安全相关的 HTTP 响应头
- **特性**:
  - X-Content-Type-Options: 防止 MIME 类型嗅探
  - X-Frame-Options: 防止点击劫持
  - X-XSS-Protection: 防止 XSS 攻击
  - Content-Security-Policy: 内容安全策略
  - Strict-Transport-Security: 强制 HTTPS（生产环境）
  - Referrer-Policy: 控制 referrer 信息
  - 来源验证（防止 CSRF）

### 5. 性能监控中间件 (`performance.js`)
- **功能**: 监控 API 性能
- **特性**:
  - 记录响应时间
  - 监控内存使用情况
  - 慢请求警告（超过 1 秒）
  - 设置性能响应头

### 6. 中间件组合器 (`index.js`)
- **功能**: 统一管理和组合所有中间件
- **特性**:
  - 一键应用所有中间件
  - 可配置启用/禁用特定中间件
  - 统一的错误处理和日志记录

## 使用方法

### 基础用法

```javascript
import { applyMiddlewares, completeMiddlewares } from '../middleware/index.js';

export default defineEventHandler(async (event) => {
  // 应用中间件
  const middlewareContext = applyMiddlewares(event, {
    enableRateLimit: true,
    validation: {
      allowedMethods: ['POST'],
      allowedContentTypes: ['application/json']
    }
  });

  let statusCode = 200;
  let error = null;

  try {
    // 你的业务逻辑
    const result = await someOperation();
    return result;
  } catch (err) {
    error = err;
    statusCode = err.statusCode || 500;
    throw err;
  } finally {
    // 完成中间件处理
    completeMiddlewares(event, middlewareContext, statusCode, error);
  }
});
```

### 配置选项

```javascript
applyMiddlewares(event, {
  // 启用/禁用中间件
  enableLogging: true,
  enableRateLimit: true,
  enableValidation: true,
  enableSecurityHeaders: true,
  enablePerformanceMonitor: true,
  enableOriginValidation: false, // 生产环境建议启用
  
  // 验证选项
  validation: {
    allowedMethods: ['GET', 'POST'],
    allowedContentTypes: ['application/json'],
    checkBodySize: true
  }
});
```

## 环境变量配置

在 `.env` 文件中可以配置：

```env
# 启用 API 日志（生产环境）
ENABLE_API_LOGGING=false

# 启用性能监控（生产环境）
ENABLE_PERFORMANCE_MONITOR=false

# 允许的请求来源（CSRF 防护）
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 速率限制配置

可以在 `rateLimiter.js` 中自定义速率限制规则：

```javascript
const rateLimitConfig = {
  '/api/auth/login': { max: 5, window: 60000 },      // 每分钟 5 次
  '/api/auth/register': { max: 3, window: 3600000 }, // 每小时 3 次
  default: { max: 60, window: 60000 }                 // 默认：每分钟 60 次
};
```

## 生产环境建议

1. **使用 Redis 存储速率限制数据**（当前使用内存存储）
2. **启用所有安全中间件**
3. **配置正确的 ALLOWED_ORIGINS**
4. **监控慢请求和错误日志**
5. **定期审查速率限制规则**

## 注意事项

- 速率限制使用内存存储，重启后数据会丢失
- 生产环境建议使用 Redis 等持久化存储
- 安全头配置可能需要根据实际需求调整
- 性能监控在生产环境可能影响性能，建议选择性启用


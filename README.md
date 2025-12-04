# Nuxt3 电商项目

一个基于 Nuxt3 的企业级电商项目基础架构，包含完整的认证系统、商品管理和错误处理机制。

## 项目结构

```
nuxt-project/
├── backend/                # Express 后端服务（独立目录，避免被 Nuxt3 扫描）
│   ├── index.js          # Express 服务器入口
│   ├── routes/           # 路由定义
│   │   ├── auth.js       # 认证路由（登录、注册）
│   │   └── products.js   # 商品路由
│   └── middleware/       # Express 中间件
│       ├── auth.js       # JWT 认证中间件
│       └── errorHandler.js # 错误处理中间件
├── server/api/           # Nuxt3 Server API 代理层
│   ├── auth/            # 认证 API 代理
│   └── products/        # 商品 API 代理
├── stores/              # Pinia 状态管理
│   ├── auth.js          # 认证状态管理
│   └── products.js      # 商品状态管理
├── pages/               # 页面路由
│   ├── index.vue        # 首页
│   ├── login.vue        # 登录页
│   ├── register.vue     # 注册页
│   └── products/        # 商品相关页面
├── middleware/          # 路由守卫中间件
│   ├── auth.js          # 认证守卫
│   └── guest.js         # 访客守卫
├── composables/         # 组合式函数
│   └── useErrorHandler.js # 错误处理
├── utils/               # 工具函数
│   └── constants.js     # 常量定义
├── plugins/             # Nuxt 插件
│   ├── error-handler.client.js # 客户端错误处理
│   └── api-error-handler.client.js # API 错误处理
├── layouts/             # 布局组件
│   └── default.vue      # 默认布局
├── error.vue           # 错误页面
└── app.vue             # 应用根组件
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（可选）

创建 `.env` 文件（参考 `.env.example`）：

```env
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
API_BASE=http://localhost:3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 3. 启动开发环境

同时启动 Express 后端（端口 3001）和 Nuxt 前端（端口 3000）：

```bash
npm run dev
```

或者分别启动：

```bash
# 终端 1: 启动 Express 后端
npm run server

# 终端 2: 启动 Nuxt 前端
npm run dev:nuxt
```

### 4. 访问应用

- 前端: http://localhost:3000
- 后端 API: http://localhost:3001

## 功能特性

### ✅ 认证系统
- 用户注册（用户名、邮箱、密码）
- 用户登录（邮箱、密码）
- JWT Token 认证（通过 HTTP-only Cookie）
- 自动 Token 刷新和验证
- 用户登出

### ✅ 路由守卫
- 认证守卫：保护需要登录的页面（如商品页）
- 访客守卫：已登录用户访问登录/注册页时重定向

### ✅ 商品管理
- 商品列表（分页、分类筛选）
- 商品详情
- 商品搜索（可扩展）

### ✅ 状态管理（Pinia）
- 认证状态管理（用户信息、登录状态）
- 商品状态管理（商品列表、当前商品）
- 统一的加载状态管理

### ✅ 错误处理
- 统一错误处理机制
- 友好的错误页面
- API 错误自动处理
- 客户端错误捕获

### ✅ 后端服务（Express）
- RESTful API 设计
- JWT 认证中间件
- 密码加密（bcrypt）
- 统一错误响应格式
- CORS 配置

### ✅ Nuxt3 Server API 代理
- 服务端 API 代理层
- Cookie 自动传递
- 统一的错误处理

## 技术栈

- **前端框架**: Nuxt3 (Vue 3)
- **状态管理**: Pinia
- **后端框架**: Express.js
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **HTTP 客户端**: $fetch (Nuxt3 内置)

## API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 商品接口

- `GET /api/products` - 获取商品列表（支持分页和分类筛选）
- `GET /api/products/:id` - 获取商品详情

## 开发说明

### 路由守卫使用

```javascript
// 需要登录的页面
definePageMeta({
  middleware: 'auth'
});

// 仅访客可访问的页面
definePageMeta({
  middleware: 'guest'
});
```

### 状态管理使用

```javascript
// 在组件中使用
const authStore = useAuthStore();
const productStore = useProductStore();

// 登录
await authStore.login(email, password);

// 获取商品列表
await productStore.fetchProducts();
```

### 错误处理

项目已配置统一的错误处理，包括：
- 全局错误页面 (`error.vue`)
- 客户端错误捕获插件
- API 错误自动处理
- 错误处理组合式函数 (`useErrorHandler`)

## 生产环境部署

1. 构建项目：
```bash
npm run build
```

2. 启动生产服务：
```bash
npm start
```

3. 确保设置正确的环境变量：
- `NODE_ENV=production`
- `JWT_SECRET` 使用强密钥
- `API_BASE` 设置为生产环境 API 地址

## 注意事项

1. **安全性**: 生产环境请务必修改 `JWT_SECRET` 为强密钥
2. **数据库**: 当前使用内存存储，生产环境需要替换为真实数据库
3. **HTTPS**: 生产环境建议使用 HTTPS，并设置 `secure: true` 的 Cookie
4. **CORS**: 根据实际部署情况调整 CORS 配置

## 许可证

MIT


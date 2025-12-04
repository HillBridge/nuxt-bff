import { getClientIP } from "../utils/clientIP.js";

/**
 * 速率限制中间件
 * 防止暴力破解和 DDoS 攻击
 */

// 内存存储（生产环境建议使用 Redis）
const requestStore = new Map();

// 清理过期记录的定时器
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestStore.entries()) {
    if (now > data.expiresAt) {
      requestStore.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

/**
 * 速率限制配置
 */
const rateLimitConfig = {
  // 登录接口：每分钟最多 5 次
  "/api/auth/login": { max: 5, window: 60000 },
  // 注册接口：每小时最多 3 次
  "/api/auth/register": { max: 3, window: 3600000 },
  // 其他接口：每分钟最多 60 次
  default: { max: 60, window: 60000 },
};

/**
 * 获取速率限制配置
 */
function getRateLimitConfig(path) {
  // 检查精确匹配
  if (rateLimitConfig[path]) {
    return rateLimitConfig[path];
  }

  // 检查路径前缀匹配
  for (const [key, config] of Object.entries(rateLimitConfig)) {
    if (key !== "default" && path.startsWith(key)) {
      return config;
    }
  }

  return rateLimitConfig.default;
}

/**
 * 速率限制中间件
 */
export function rateLimiter(event) {
  const ip = getClientIP(event) || "unknown";
  const path = event.node.req.url?.split("?")[0] || "/";
  const config = getRateLimitConfig(path);

  const key = `${ip}:${path}`;
  const now = Date.now();

  // 获取或创建请求记录
  let record = requestStore.get(key);

  if (!record || now > record.expiresAt) {
    // 创建新记录
    record = {
      count: 1,
      expiresAt: now + config.window,
      resetAt: now + config.window,
    };
    requestStore.set(key, record);
    return { allowed: true };
  }

  // 增加计数
  record.count++;

  if (record.count > config.max) {
    // 超过限制
    const retryAfter = Math.ceil((record.expiresAt - now) / 1000);

    setHeader(event, "X-RateLimit-Limit", config.max);
    setHeader(event, "X-RateLimit-Remaining", 0);
    setHeader(
      event,
      "X-RateLimit-Reset",
      new Date(record.expiresAt).toISOString()
    );
    setHeader(event, "Retry-After", retryAfter);

    throw createError({
      statusCode: 429,
      statusMessage: `请求过于频繁，请在 ${retryAfter} 秒后重试`,
    });
  }

  // 设置速率限制响应头
  setHeader(event, "X-RateLimit-Limit", config.max);
  setHeader(
    event,
    "X-RateLimit-Remaining",
    Math.max(0, config.max - record.count)
  );
  setHeader(
    event,
    "X-RateLimit-Reset",
    new Date(record.expiresAt).toISOString()
  );

  return { allowed: true };
}

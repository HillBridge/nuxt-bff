import { getClientIP } from "../utils/clientIP.js";

/**
 * 请求日志中间件
 * 记录所有 API 请求的详细信息，便于调试和监控
 */
export function requestLogger(event) {
  const startTime = Date.now();
  const method = event.node.req.method;
  const url = event.node.req.url;
  const userAgent = getHeader(event, "user-agent") || "Unknown";
  const ip = getClientIP(event) || "Unknown";

  // 生成请求ID（如果不存在）
  const requestId =
    getHeader(event, "x-request-id") ||
    `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  // 设置请求ID到响应头
  setHeader(event, "x-request-id", requestId);

  // 记录请求开始
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[${new Date().toISOString()}] [${requestId}] ${method} ${url} - IP: ${ip}`
    );
  }

  // 返回一个函数，用于记录响应
  return {
    logResponse: (statusCode, error = null) => {
      const duration = Date.now() - startTime;
      const logLevel =
        statusCode >= 500 ? "ERROR" : statusCode >= 400 ? "WARN" : "INFO";

      const logMessage = {
        requestId,
        method,
        url,
        statusCode,
        duration: `${duration}ms`,
        ip,
        userAgent: userAgent.substring(0, 100), // 限制长度
        timestamp: new Date().toISOString(),
      };

      if (error) {
        logMessage.error = error.message;
      }

      // 生产环境只记录错误和警告
      if (process.env.NODE_ENV === "production") {
        if (logLevel !== "INFO") {
          const logMethod =
            logLevel.toLowerCase() === "error" ? "error" : "warn";
          console[logMethod](JSON.stringify(logMessage));
        }
      } else {
        console.log(`[${logLevel}]`, logMessage);
      }
    },
  };
}

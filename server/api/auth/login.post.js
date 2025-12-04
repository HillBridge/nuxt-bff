import {
  applyMiddlewares,
  completeMiddlewares,
} from "../../middleware/index.js";

export default defineEventHandler(async (event) => {
  // 应用中间件
  const middlewareContext = applyMiddlewares(event, {
    enableRateLimit: true, // 登录接口需要速率限制
    validation: {
      allowedMethods: ["POST"],
      allowedContentTypes: ["application/json"],
    },
  });

  let statusCode = 200;
  let error = null;

  try {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    // 获取现有 cookie（如果有）
    const existingCookies = getHeader(event, "cookie") || "";

    // 使用 config.apiBase（服务端配置）或回退到默认值
    const apiBase = config.apiBase || "http://localhost:3001";

    // 直接调用 Express API 以获取 Set-Cookie 头
    const expressResponse = await fetch(`${apiBase}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: existingCookies,
      },
      body: JSON.stringify(body),
    });

    const response = await expressResponse.json();

    // 如果登录成功，从响应头中获取 cookie 并设置
    if (response.success) {
      const setCookieHeader = expressResponse.headers.get("set-cookie");
      if (setCookieHeader) {
        // 解析 Set-Cookie 头
        const cookies = setCookieHeader.split(",").map((c) => c.trim());
        for (const cookie of cookies) {
          if (cookie.startsWith("token=")) {
            const tokenMatch = cookie.match(/token=([^;]+)/);
            if (tokenMatch) {
              setCookie(event, "token", tokenMatch[1], {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60,
              });
              break;
            }
          }
        }
      }
    }

    statusCode = 200;
    return response;
  } catch (err) {
    error = err;
    statusCode = err.statusCode || err.status || 500;

    // 处理连接错误
    if (
      err.code === "ECONNREFUSED" ||
      err.message?.includes("unreachable") ||
      err.message?.includes("fetch failed")
    ) {
      console.error("无法连接到后端服务:", apiBase);
      statusCode = 503;
      error = createError({
        statusCode: 503,
        statusMessage:
          "后端服务不可用，请确保 Express 后端服务已启动（端口 3001）",
      });
    } else if (err.statusCode) {
      error = err;
      statusCode = err.statusCode;
    } else {
      error = createError({
        statusCode: statusCode,
        statusMessage: err.message || "登录失败",
      });
    }

    throw error;
  } finally {
    // 完成中间件处理（记录日志和性能指标）
    completeMiddlewares(event, middlewareContext, statusCode, error);
  }
});

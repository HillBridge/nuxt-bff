export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    // 使用 config.apiBase（服务端配置）或回退到默认值
    const apiBase = config.apiBase || "http://localhost:3001";

    // 直接调用 Express API 以获取 Set-Cookie 头
    const expressResponse = await fetch(`${apiBase}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const response = await expressResponse.json();

    // 如果注册成功，从响应头中获取 cookie 并设置
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

    return response;
  } catch (error) {
    // 处理连接错误
    if (
      error.code === "ECONNREFUSED" ||
      error.message?.includes("unreachable") ||
      error.message?.includes("fetch failed")
    ) {
      console.error("无法连接到后端服务:", apiBase);
      throw createError({
        statusCode: 503,
        statusMessage:
          "后端服务不可用，请确保 Express 后端服务已启动（端口 3001）",
      });
    }

    // 处理其他错误
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: error.statusCode || error.status || 500,
      statusMessage: error.message || "注册失败",
    });
  }
});

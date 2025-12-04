export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const query = getQuery(event);
    const token = getCookie(event, "token");

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "未授权，请先登录",
      });
    }

    // 使用 config.apiBase（服务端配置）或回退到默认值
    const apiBase = config.apiBase || "http://localhost:3001";

    // 构建查询字符串
    const queryString = new URLSearchParams(query).toString();
    const url = `${apiBase}/api/v1/products${
      queryString ? `?${queryString}` : ""
    }`;

    // 直接调用 Express API
    const expressResponse = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (!expressResponse.ok) {
      const errorData = await expressResponse.json().catch(() => ({}));
      throw createError({
        statusCode: expressResponse.status,
        statusMessage: errorData.message || "获取商品列表失败",
      });
    }

    const response = await expressResponse.json();
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
      statusMessage: error.message || "获取商品列表失败",
    });
  }
});

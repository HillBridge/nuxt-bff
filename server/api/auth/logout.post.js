export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();

    // 使用 config.apiBase（服务端配置）或回退到默认值
    const apiBase = config.apiBase || "http://localhost:3001";

    // 调用 Express 后端登出接口
    await $fetch(`${apiBase}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    // 删除 cookie
    deleteCookie(event, "token");

    return {
      success: true,
      message: "登出成功",
    };
  } catch (error) {
    // 处理连接错误
    if (
      error.code === "ECONNREFUSED" ||
      error.message?.includes("unreachable") ||
      error.message?.includes("fetch failed")
    ) {
      console.error("无法连接到后端服务:", apiBase);
      // 即使后端不可用，也清除本地 cookie
      deleteCookie(event, "token");
      throw createError({
        statusCode: 503,
        statusMessage: "后端服务不可用，但已清除本地登录状态",
      });
    }

    // 处理其他错误
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: error.statusCode || error.status || 500,
      statusMessage: error.message || "登出失败",
    });
  }
});

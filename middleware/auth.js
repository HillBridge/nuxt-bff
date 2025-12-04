export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // 如果已经认证，直接通过
  if (authStore.isAuthenticated) {
    return;
  }

  // 尝试从服务器获取用户信息
  try {
    const isAuthenticated = await authStore.fetchUser();
    if (!isAuthenticated) {
      // 在服务端，如果无法验证，允许通过让客户端处理
      // 在客户端，如果未认证，重定向到登录页
      if (import.meta.client) {
        return navigateTo({
          path: "/login",
          query: { redirect: to.fullPath },
        });
      }
      // 服务端允许通过，让客户端再次验证
      return;
    }
  } catch (error) {
    // 检查是否是认证错误（401 未授权）
    const isAuthError =
      error.statusCode === 401 ||
      error.status === 401 ||
      error.data?.statusCode === 401;

    // 在服务端，如果获取用户信息失败，允许通过让客户端处理
    // 在客户端，只有认证错误才重定向，其他错误允许通过（让页面显示错误）
    if (import.meta.client && isAuthError) {
      return navigateTo({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    }
    // 服务端或非认证错误，允许通过
    return;
  }
});

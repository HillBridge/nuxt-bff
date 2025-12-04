export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  
  // 如果已经认证，重定向到首页
  if (authStore.isAuthenticated) {
    return navigateTo('/');
  }

  // 尝试从服务器获取用户信息
  try {
    const isAuthenticated = await authStore.fetchUser();
    if (isAuthenticated) {
      // 已认证，重定向到首页
      return navigateTo('/');
    }
  } catch (error) {
    // 获取用户信息失败，允许访问（未认证用户）
    return;
  }
});


export default defineNuxtPlugin((nuxtApp) => {
  // 拦截 $fetch 错误
  const originalFetch = globalThis.$fetch || $fetch;

  if (originalFetch) {
    // 包装 $fetch 以统一处理错误
    nuxtApp.provide('safeFetch', async (url, options = {}) => {
      try {
        return await originalFetch(url, options);
      } catch (error) {
        // 统一错误处理
        const errorMessage = error.data?.message || error.message || '请求失败';
        const statusCode = error.statusCode || error.status || 500;

        // 根据状态码处理不同错误
        if (statusCode === 401) {
          // 未授权，清除认证状态并跳转到登录页
          const authStore = useAuthStore();
          authStore.logout();
          await navigateTo('/login');
        }

        // 抛出统一格式的错误
        throw createError({
          statusCode,
          statusMessage: errorMessage,
          data: error.data
        });
      }
    });
  }
});


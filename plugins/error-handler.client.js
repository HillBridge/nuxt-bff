export default defineNuxtPlugin((nuxtApp) => {
  // 全局错误处理
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Vue 错误:', {
      error,
      info,
      component: instance?.$options?.name || 'Unknown'
    });

    // 可以在这里添加错误上报逻辑
    // 例如：发送到错误监控服务
  };

  // 处理未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的 Promise 错误:', event.reason);
    // 阻止默认的错误处理
    event.preventDefault();
  });
});


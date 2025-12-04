/**
 * 性能监控中间件
 * 监控 API 响应时间和资源使用情况
 */

/**
 * 性能监控中间件
 */
export function performanceMonitor(event) {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  return {
    recordMetrics: (statusCode) => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // 转换为毫秒
      const endMemory = process.memoryUsage();

      const metrics = {
        duration: `${duration.toFixed(2)}ms`,
        memory: {
          heapUsed: `${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(endMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          rss: `${(endMemory.rss / 1024 / 1024).toFixed(2)}MB`,
        },
        statusCode,
      };

      // 慢请求警告（超过 1 秒）
      if (duration > 1000) {
        console.warn(`[性能警告] 慢请求检测:`, {
          url: event.node.req.url,
          duration: metrics.duration,
          memory: metrics.memory,
        });
      }

      // 设置性能响应头
      setHeader(event, "X-Response-Time", `${duration.toFixed(2)}ms`);

      return metrics;
    },
  };
}

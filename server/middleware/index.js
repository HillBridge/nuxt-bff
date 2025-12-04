/**
 * 中间件组合器
 * 统一管理和组合所有中间件
 */

import { requestLogger } from './logger.js';
import { rateLimiter } from './rateLimiter.js';
import { requestValidator } from './validator.js';
import { setSecurityHeaders, validateOrigin } from './security.js';
import { performanceMonitor } from './performance.js';

/**
 * 中间件配置选项
 */
export const middlewareConfig = {
  // 是否启用日志
  enableLogging: process.env.NODE_ENV !== 'production' || process.env.ENABLE_API_LOGGING === 'true',
  
  // 是否启用速率限制
  enableRateLimit: true,
  
  // 是否启用请求验证
  enableValidation: true,
  
  // 是否启用安全头
  enableSecurityHeaders: true,
  
  // 是否启用性能监控
  enablePerformanceMonitor: process.env.NODE_ENV !== 'production' || process.env.ENABLE_PERFORMANCE_MONITOR === 'true',
  
  // 是否启用来源验证
  enableOriginValidation: process.env.NODE_ENV === 'production'
};

/**
 * 应用所有中间件
 * @param {Object} event - Nuxt 事件对象
 * @param {Object} options - 中间件选项
 * @returns {Object} 中间件上下文对象
 */
export function applyMiddlewares(event, options = {}) {
  const config = { ...middlewareConfig, ...options };
  const context = {};
  
  // 1. 设置安全头（最先执行）
  if (config.enableSecurityHeaders) {
    setSecurityHeaders(event);
  }
  
  // 2. 验证请求来源
  if (config.enableOriginValidation) {
    validateOrigin(event);
  }
  
  // 3. 请求验证
  if (config.enableValidation) {
    requestValidator(event, options.validation || {});
  }
  
  // 4. 速率限制
  if (config.enableRateLimit) {
    rateLimiter(event);
  }
  
  // 5. 请求日志
  if (config.enableLogging) {
    context.logger = requestLogger(event);
  }
  
  // 6. 性能监控
  if (config.enablePerformanceMonitor) {
    context.performance = performanceMonitor(event);
  }
  
  return context;
}

/**
 * 完成中间件处理（记录日志和性能指标）
 */
export function completeMiddlewares(event, context, statusCode, error = null) {
  // 记录响应日志
  if (context.logger) {
    context.logger.logResponse(statusCode, error);
  }
  
  // 记录性能指标
  if (context.performance) {
    context.performance.recordMetrics(statusCode);
  }
}


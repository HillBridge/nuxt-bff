/**
 * 安全头中间件
 * 设置安全相关的 HTTP 响应头
 */

/**
 * 设置安全响应头
 */
export function setSecurityHeaders(event) {
  const headers = {
    // 防止 XSS 攻击
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    
    // 内容安全策略（可根据需要调整）
    'Content-Security-Policy': "default-src 'self'",
    
    // 防止 MIME 类型嗅探
    'X-Download-Options': 'noopen',
    
    // 推荐使用 HTTPS
    'Strict-Transport-Security': process.env.NODE_ENV === 'production' 
      ? 'max-age=31536000; includeSubDomains' 
      : '',
    
    // 防止点击劫持
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // 权限策略
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
  
  // 设置响应头
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      setHeader(event, key, value);
    }
  });
  
  return { secured: true };
}

/**
 * 验证请求来源（防止 CSRF）
 * 注意：对于 API 请求，通常使用 token 验证，这里提供基础检查
 */
export function validateOrigin(event) {
  const origin = getHeader(event, 'origin');
  const referer = getHeader(event, 'referer');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  // 对于同源请求，跳过检查
  if (!origin && !referer) {
    return { valid: true };
  }
  
  // 检查 origin 或 referer
  const requestOrigin = origin || (referer ? new URL(referer).origin : null);
  
  if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
    // 在生产环境严格检查，开发环境可以宽松
    if (process.env.NODE_ENV === 'production') {
      throw createError({
        statusCode: 403,
        statusMessage: '不允许的请求来源'
      });
    }
  }
  
  return { valid: true };
}


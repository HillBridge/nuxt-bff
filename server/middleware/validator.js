/**
 * 请求验证中间件
 * 验证请求体大小、内容类型等
 */

// 最大请求体大小（10MB）
const MAX_BODY_SIZE = 10 * 1024 * 1024;

/**
 * 验证内容类型
 */
function validateContentType(event, allowedTypes = ['application/json']) {
  const contentType = getHeader(event, 'content-type') || '';
  const isAllowed = allowedTypes.some(type => contentType.includes(type));
  
  if (!isAllowed && event.node.req.method !== 'GET' && event.node.req.method !== 'HEAD') {
    throw createError({
      statusCode: 415,
      statusMessage: `不支持的内容类型。仅支持: ${allowedTypes.join(', ')}`
    });
  }
}

/**
 * 验证请求体大小
 */
function validateBodySize(event) {
  const contentLength = getHeader(event, 'content-length');
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > MAX_BODY_SIZE) {
      throw createError({
        statusCode: 413,
        statusMessage: `请求体过大，最大允许 ${MAX_BODY_SIZE / 1024 / 1024}MB`
      });
    }
  }
}

/**
 * 验证请求方法
 */
function validateMethod(event, allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) {
  const method = event.node.req.method;
  
  if (!allowedMethods.includes(method)) {
    throw createError({
      statusCode: 405,
      statusMessage: `不允许的请求方法: ${method}`
    });
  }
}

/**
 * 请求验证中间件
 */
export function requestValidator(event, options = {}) {
  const {
    allowedMethods,
    allowedContentTypes = ['application/json'],
    checkBodySize = true
  } = options;
  
  // 验证请求方法
  if (allowedMethods) {
    validateMethod(event, allowedMethods);
  }
  
  // 验证内容类型（仅对非 GET/HEAD 请求）
  if (event.node.req.method !== 'GET' && event.node.req.method !== 'HEAD') {
    validateContentType(event, allowedContentTypes);
    
    // 验证请求体大小
    if (checkBodySize) {
      validateBodySize(event);
    }
  }
  
  return { validated: true };
}


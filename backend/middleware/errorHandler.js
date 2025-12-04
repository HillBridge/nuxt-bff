/**
 * 统一错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // 默认错误响应
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || '服务器内部错误';

  // 生产环境不暴露详细错误信息
  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器错误，请稍后重试' 
      : message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      details: err.details 
    })
  };

  res.status(statusCode).json(errorResponse);
};


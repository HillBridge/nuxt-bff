import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * JWT 认证中间件
 */
export const authenticateToken = (req, res, next) => {
  try {
    // 从 cookie 中获取 token
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权，请先登录'
      });
    }

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token 已过期，请重新登录'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的 Token'
      });
    }
    return res.status(500).json({
      success: false,
      message: '认证失败',
      error: error.message
    });
  }
};


import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 模拟商品数据（实际项目中应使用真实数据库）
const products = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: '最新款 iPhone，配备 A17 Pro 芯片',
    price: 7999,
    image: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
    stock: 50,
    category: '手机'
  },
  {
    id: '2',
    name: 'MacBook Pro 14"',
    description: 'M3 芯片，14 英寸 Liquid Retina XDR 显示屏',
    price: 14999,
    image: 'https://via.placeholder.com/300x300?text=MacBook+Pro',
    stock: 30,
    category: '电脑'
  },
  {
    id: '3',
    name: 'AirPods Pro',
    description: '主动降噪，空间音频',
    price: 1899,
    image: 'https://via.placeholder.com/300x300?text=AirPods+Pro',
    stock: 100,
    category: '耳机'
  },
  {
    id: '4',
    name: 'iPad Air',
    description: 'M2 芯片，10.9 英寸 Liquid Retina 显示屏',
    price: 4399,
    image: 'https://via.placeholder.com/300x300?text=iPad+Air',
    stock: 40,
    category: '平板'
  },
  {
    id: '5',
    name: 'Apple Watch Series 9',
    description: '45mm，GPS + 蜂窝网络',
    price: 3199,
    image: 'https://via.placeholder.com/300x300?text=Apple+Watch',
    stock: 60,
    category: '手表'
  }
];

/**
 * 获取商品列表（需要认证）
 */
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    
    let filteredProducts = products;
    
    // 按分类筛选
    if (category) {
      filteredProducts = products.filter(p => p.category === category);
    }
    
    // 分页
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 获取商品详情（需要认证）
 */
router.get('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

export default router;


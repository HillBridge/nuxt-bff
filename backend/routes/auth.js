import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// 模拟数据库（实际项目中应使用真实数据库）
const users = [];

/**
 * 用户注册
 */
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "用户名、邮箱和密码都是必填项",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "密码长度至少为 6 位",
      });
    }

    // 检查用户是否已存在
    const existingUser = users.find(
      (u) => u.email === email || u.username === username
    );
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "用户已存在",
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // 生成 JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 设置 cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    });

    res.status(201).json({
      success: true,
      message: "注册成功",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    // console.log("error", error);
    next(error);
  }
});

/**
 * 用户登录
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "邮箱和密码都是必填项",
      });
    }

    // 查找用户
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "邮箱或密码错误",
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "邮箱或密码错误",
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 设置 cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    });

    res.json({
      success: true,
      message: "登录成功",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 获取当前用户信息
 */
router.get("/me", authenticateToken, (req, res, next) => {
  try {
    const user = users.find((u) => u.id === req.user.userId);
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "用户不存在",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/auth/me] 错误:", error);
    next(error);
  }
});

/**
 * 用户登出
 */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "登出成功",
  });
});

export default router;

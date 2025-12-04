import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 请求日志中间件（开发环境）
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// 路由
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);

// 健康检查
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// 错误处理中间件（必须在所有路由之后）
app.use(errorHandler);

// 404 处理
app.use((req, res) => {
  console.warn(`[404] 接口不存在: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: "接口不存在",
    path: req.path,
    method: req.method,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Express 服务器运行在 http://localhost:${PORT}`);
});

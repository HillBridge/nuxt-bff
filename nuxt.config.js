export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    // 私有配置（仅在服务端可用）
    jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    apiBase: process.env.API_BASE || "http://localhost:3001",
    // 公共配置（客户端和服务端都可用）
    public: {
      apiBase: process.env.API_BASE || "http://localhost:3001",
    },
  },
  app: {
    head: {
      title: "电商平台",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
  ssr: true,
});

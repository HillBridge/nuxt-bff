<template>
  <div class="layout">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <NuxtLink to="/" class="logo">电商平台</NuxtLink>
          <nav class="nav">
            <NuxtLink to="/products" class="nav-link">商品</NuxtLink>
            <!-- 认证状态检查中，显示加载状态 -->
            <template v-if="authInitializing">
              <div class="nav-loading">
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
              </div>
            </template>
            <!-- 已认证，显示用户信息和操作 -->
            <template v-else-if="authStore.isAuthenticated">
              <!-- 通过pinia直接获取http获取到的响应式数据 -->
              <!-- 避免通过setup中获取pinia数据, 然后还需要computed计算属性再来获取数据 -->
              <NuxtLink to="/profile" class="nav-link">个人信息</NuxtLink>
              <span class="user-info">欢迎, {{ authStore.user?.username }}</span>
              <button @click="handleLogout" class="btn-logout" :disabled="isLoggingOut">
                {{ isLoggingOut ? '登出中...' : '登出' }}
              </button>
            </template>
            <!-- 未认证，显示登录注册 -->
            <template v-else>
              <NuxtLink to="/login" class="nav-link">登录</NuxtLink>
              <NuxtLink to="/register" class="nav-link">注册</NuxtLink>
            </template>
          </nav>
        </div>
      </div>
    </header>
    <main class="main" :class="{ 'is-loading': isPageLoading }">
      <!-- 页面加载遮罩层 -->
      <Transition name="loading-fade">
        <div v-if="isPageLoading" class="page-loading-overlay">
          <div class="page-loading-content">
            <div class="page-loading-spinner">
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
            </div>
            <p class="loading-text">加载中...</p>
          </div>
        </div>
      </Transition>
      <div class="container" :class="{ 'content-blur': isPageLoading }">
        <slot />
      </div>
    </main>
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 电商平台. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// 认证状态初始化标志
const authInitializing = ref(true);
// 登出中标志
const isLoggingOut = ref(false);
// 页面加载状态
const isPageLoading = ref(false);

// 初始化认证状态检查
const initAuth = async () => {
  // 如果已经认证，不需要再次检查
  if (authStore.isAuthenticated) {
    authInitializing.value = false;
    return;
  }

  // 在客户端检查认证状态
  if (import.meta.client) {
    try {
      // 静默检查，不显示错误
      await authStore.fetchUser();
    } catch (error) {
      // 静默失败，保持未认证状态
      console.debug('认证检查失败:', error);
    } finally {
      // 无论成功失败，都标记为已完成初始化
      authInitializing.value = false;
    }
  } else {
    // 服务端直接标记为已完成
    authInitializing.value = false;
  }
};

// 处理登出
const handleLogout = async () => {
  if (isLoggingOut.value) return;

  isLoggingOut.value = true;
  try {
    await authStore.logout();
    // 检查当前路由是否需要认证
    const routeMeta = route.meta;
    const requiresAuth = routeMeta.middleware === 'auth' ||
      (Array.isArray(routeMeta.middleware) && routeMeta.middleware.includes('auth'));

    if (requiresAuth) {
      // 如果在需要认证的页面，重定向到登录页
      await router.push('/login');
    } else {
      // 否则保持在当前页面，导航栏会自动更新
      // 使用 nextTick 确保状态更新后再刷新
      await nextTick();
      await router.replace(route.fullPath);
    }
  } catch (error) {
    console.error('登出错误:', error);
  } finally {
    isLoggingOut.value = false;
  }
};

// 页面挂载时初始化
onMounted(() => {
  initAuth();
});

// 监听路由变化，确保认证状态是最新的
watch(() => route.path, () => {
  // 如果认证状态丢失，重新检查
  if (import.meta.client && !authStore.isAuthenticated && !authInitializing.value) {
    initAuth();
  }
}, { immediate: false });

// 路由加载定时器
let loadingTimer = null;
let hideTimer = null;

// 监听路由加载状态
watch(() => router.pending, (pending) => {
  if (import.meta.client) {
    // 清除之前的定时器
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      loadingTimer = null;
    }
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    if (pending) {
      // 延迟显示加载，避免快速切换时的闪烁
      loadingTimer = setTimeout(() => {
        if (router.pending) {
          isPageLoading.value = true;
        }
      }, 150);
    } else {
      // 延迟隐藏，确保过渡效果
      hideTimer = setTimeout(() => {
        isPageLoading.value = false;
      }, 100);
    }
  }
}, { immediate: true });

// 监听路由变化
watch(() => route.fullPath, () => {
  if (import.meta.client) {
    // 路由变化时，如果还在加载，显示加载状态
    if (router.pending) {
      // 清除延迟定时器，立即显示
      if (loadingTimer) {
        clearTimeout(loadingTimer);
        loadingTimer = null;
      }
      isPageLoading.value = true;
    }
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (loadingTimer) {
    clearTimeout(loadingTimer);
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
  }
});
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
}

.header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: box-shadow 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

.logo:hover {
  color: #007bff;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: 2.5rem;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

.nav-link:hover {
  color: #007bff;
}

.nav-link.router-link-active {
  color: #007bff;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: #007bff;
  border-radius: 1px;
}

/* 加载状态样式 */
.nav-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #007bff;
  animation: loading-bounce 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0;
}

@keyframes loading-bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.user-info {
  color: #666;
  font-size: 0.9rem;
  transition: color 0.3s;
  white-space: nowrap;
}

.btn-logout {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  white-space: nowrap;
  min-width: 60px;
}

.btn-logout:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.btn-logout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 平滑过渡效果 */
.nav>* {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main {
  flex: 1;
  padding: 2rem 0;
  animation: fadeIn 0.4s ease-in;
  position: relative;
  min-height: 400px;
}

.main.is-loading {
  overflow: hidden;
}

/* 页面加载遮罩层 */
.page-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* 加载动画 - 三个旋转的圆环 */
.page-loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spinner-rotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: #0056b3;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  border-top-color: #004085;
}

@keyframes spinner-rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  animation: loading-pulse 1.5s ease-in-out infinite;
}

@keyframes loading-pulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

/* 内容模糊效果 */
.content-blur {
  filter: blur(2px);
  transition: filter 0.3s ease;
}

/* 加载遮罩层过渡动画 */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
}

.footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 2rem 0;
  margin-top: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .nav {
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
    justify-content: flex-end;
  }

  .user-info {
    font-size: 0.85rem;
  }

  .btn-logout {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }

  /* 移动端加载遮罩层优化 */
  .page-loading-overlay {
    backdrop-filter: blur(2px);
  }

  .page-loading-spinner {
    width: 50px;
    height: 50px;
  }

  .loading-text {
    font-size: 0.9rem;
  }
}
</style>

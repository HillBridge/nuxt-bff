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
    <main class="main">
      <div class="container">
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
}
</style>

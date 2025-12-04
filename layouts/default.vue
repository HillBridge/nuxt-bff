<template>
  <div class="layout">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <NuxtLink to="/" class="logo">电商平台</NuxtLink>
          <nav class="nav">
            <NuxtLink to="/products" class="nav-link">商品</NuxtLink>
            <template v-if="authStore.isAuthenticated">
              <!-- 通过pinia直接获取http获取到的响应式数据 -->
              <!-- 避免通过setup中获取pinia数据, 然后还需要computed计算属性再来获取数据 -->
              <NuxtLink to="/profile" class="nav-link">个人信息</NuxtLink>
              <span class="user-info">欢迎, {{ authStore.user?.username }}</span>
              <button @click="handleLogout" class="btn-logout">登出</button>
            </template>
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

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
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
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #007bff;
}

.nav-link.router-link-active {
  color: #007bff;
}

.user-info {
  color: #666;
  font-size: 0.9rem;
}

.btn-logout {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: #c82333;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 2rem 0;
  margin-top: auto;
}
</style>

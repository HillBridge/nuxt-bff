<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">{{ error.statusCode || 500 }}</h1>
      <h2 class="error-title">{{ errorTitle }}</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="handleError" class="btn-retry">重试</button>
        <NuxtLink to="/" class="btn-home">返回首页</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
});

const errorTitle = computed(() => {
  const statusCode = props.error.statusCode || 500;
  const titles = {
    404: '页面未找到',
    401: '未授权访问',
    403: '禁止访问',
    500: '服务器错误',
    503: '服务不可用'
  };
  return titles[statusCode] || '发生错误';
});

const errorMessage = computed(() => {
  return props.error.statusMessage || props.error.message || '抱歉，发生了意外错误';
});

const handleError = () => {
  clearError({ redirect: '/' });
};
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.error-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.error-code {
  font-size: 6rem;
  font-weight: bold;
  color: #dc3545;
  margin-bottom: 1rem;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.error-message {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-retry,
.btn-home {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.btn-retry {
  background: #007bff;
  color: white;
}

.btn-retry:hover {
  background: #0056b3;
}

.btn-home {
  background: white;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-home:hover {
  background: #007bff;
  color: white;
}
</style>


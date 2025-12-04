<template>
  <div class="error-page">
    <div class="error-content">
      <!-- 错误图标动画 -->
      <div class="error-icon-wrapper">
        <div class="error-icon" :class="iconClass"></div>
      </div>

      <!-- 错误代码 -->
      <h1 class="error-code">{{ error.statusCode || 500 }}</h1>

      <!-- 错误标题 -->
      <h2 class="error-title">{{ errorTitle }}</h2>

      <!-- 错误消息 -->
      <p class="error-message">{{ errorMessage }}</p>

      <!-- 错误详情（开发环境） -->
      <div v-if="showDetails" class="error-details">
        <button @click="toggleDetails" class="btn-details">
          {{ detailsExpanded ? '隐藏' : '显示' }}错误详情
        </button>
        <Transition name="details-fade">
          <div v-if="detailsExpanded" class="details-content">
            <pre>{{ errorDetails }}</pre>
          </div>
        </Transition>
      </div>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <button v-if="canRetry" @click="handleRetry" class="btn-retry" :disabled="isRetrying">
          {{ isRetrying ? '重试中...' : '重试' }}
        </button>
        <button v-if="canGoBack" @click="handleGoBack" class="btn-back">
          返回上一页
        </button>
        <NuxtLink v-if="shouldShowLogin" to="/login" class="btn-login">
          前往登录
        </NuxtLink>
        <NuxtLink v-if="shouldShowHome" to="/" class="btn-home">
          返回首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ERROR_MESSAGES, ROUTES } from '~/utils/constants';

const props = defineProps({
  error: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const isRetrying = ref(false);
const detailsExpanded = ref(false);

// 是否显示详情（开发环境）
const showDetails = computed(() => {
  return import.meta.dev && props.error.stack;
});

// 错误详情
const errorDetails = computed(() => {
  return JSON.stringify({
    statusCode: props.error.statusCode,
    statusMessage: props.error.statusMessage,
    message: props.error.message,
    stack: props.error.stack,
    data: props.error.data
  }, null, 2);
});

// 错误标题
const errorTitle = computed(() => {
  const statusCode = props.error.statusCode || 500;
  const titles = {
    400: '请求错误',
    401: '未授权访问',
    403: '禁止访问',
    404: '页面未找到',
    408: '请求超时',
    500: '服务器错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  };
  return titles[statusCode] || '发生错误';
});

// 错误消息
const errorMessage = computed(() => {
  const statusCode = props.error.statusCode || 500;

  // 优先使用错误对象中的消息
  if (props.error.statusMessage) {
    return props.error.statusMessage;
  }

  if (props.error.message) {
    return props.error.message;
  }

  // 使用常量中的消息
  const messages = {
    401: ERROR_MESSAGES.UNAUTHORIZED,
    403: ERROR_MESSAGES.FORBIDDEN,
    404: ERROR_MESSAGES.NOT_FOUND,
    500: ERROR_MESSAGES.SERVER_ERROR,
    503: ERROR_MESSAGES.SERVER_ERROR
  };

  return messages[statusCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
});

// 错误图标类
const iconClass = computed(() => {
  const statusCode = props.error.statusCode || 500;
  // 根据错误类型返回不同的类名
  if (statusCode === 404) {
    return 'error-404';
  } else if (statusCode === 401 || statusCode === 403) {
    return `error-${statusCode}`;
  } else if (statusCode >= 500) {
    return 'error-500';
  } else {
    return 'error-default';
  }
});

// 是否显示重试按钮
const canRetry = computed(() => {
  const statusCode = props.error.statusCode || 500;
  // 对于客户端错误（4xx），通常不需要重试
  // 对于服务器错误（5xx）或网络错误，可以重试
  return statusCode >= 500 || statusCode === 408 || statusCode === 504;
});

// 是否显示返回上一页按钮
const canGoBack = computed(() => {
  // 如果浏览器历史记录中有上一页，显示返回按钮
  return typeof window !== 'undefined' && window.history.length > 1;
});

// 是否显示登录按钮
const shouldShowLogin = computed(() => {
  return props.error.statusCode === 401;
});

// 是否显示首页按钮
const shouldShowHome = computed(() => {
  // 如果不是 401 错误，显示首页按钮
  return props.error.statusCode !== 401;
});

// 切换详情显示
const toggleDetails = () => {
  detailsExpanded.value = !detailsExpanded.value;
};

// 处理重试
const handleRetry = async () => {
  isRetrying.value = true;
  try {
    // 清除错误并刷新当前页面
    clearError({ redirect: router.currentRoute.value.fullPath });
  } catch (error) {
    console.error('重试失败:', error);
    // 如果清除失败，尝试刷新页面
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } finally {
    isRetrying.value = false;
  }
};

// 返回上一页
const handleGoBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back();
  } else {
    router.push(ROUTES.HOME);
  }
};
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 错误图标容器 */
.error-icon-wrapper {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.error-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  position: relative;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

/* 使用 CSS 创建简单的错误图标 */
.error-icon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.error-404 .error-icon::before {
  border-color: #ff6b6b;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%);
}

.error-401 .error-icon::before,
.error-403 .error-icon::before {
  border-color: #ffa726;
  background: radial-gradient(circle, rgba(255, 167, 38, 0.1) 0%, transparent 70%);
}

.error-500 .error-icon::before,
.error-502 .error-icon::before,
.error-503 .error-icon::before,
.error-504 .error-icon::before {
  border-color: #ef5350;
  background: radial-gradient(circle, rgba(239, 83, 80, 0.1) 0%, transparent 70%);
}

.error-default .error-icon::before {
  border-color: #dc3545;
  background: radial-gradient(circle, rgba(220, 53, 69, 0.1) 0%, transparent 70%);
}

.error-default .error-icon::after {
  color: #dc3545;
}

.error-icon::after {
  content: '!';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  color: #dc3545;
}

.error-404 .error-icon::after {
  content: '?';
  color: #ff6b6b;
}

.error-code {
  font-size: 5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  line-height: 1;
  animation: scaleIn 0.5s ease-out 0.2s both;
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.error-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
}

.error-message {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* 错误详情 */
.error-details {
  margin-bottom: 2rem;
  text-align: left;
}

.btn-details {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-details:hover {
  background: #f5f5f5;
  border-color: #999;
}

.details-content {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  max-height: 300px;
  overflow-y: auto;
}

.details-content pre {
  margin: 0;
  font-size: 0.85rem;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
}

.details-fade-enter-active,
.details-fade-leave-active {
  transition: opacity 0.3s ease, max-height 0.3s ease;
}

.details-fade-enter-from,
.details-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

/* 操作按钮 */
.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.btn-retry,
.btn-back,
.btn-login,
.btn-home {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-retry {
  background: #007bff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.btn-retry:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

.btn-retry:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-back {
  background: #6c757d;
  color: white;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.btn-back:hover {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

.btn-login {
  background: #28a745;
  color: white;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.btn-login:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

.btn-home {
  background: white;
  color: #007bff;
  border: 2px solid #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.btn-home:hover {
  background: #007bff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-page {
    padding: 1rem;
  }

  .error-content {
    padding: 2rem 1.5rem;
  }

  .error-icon {
    width: 100px;
    height: 100px;
  }

  .error-icon::before {
    width: 60px;
    height: 60px;
  }

  .error-icon::after {
    font-size: 2.5rem;
  }

  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-retry,
  .btn-back,
  .btn-login,
  .btn-home {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 3rem;
  }

  .error-title {
    font-size: 1.25rem;
  }
}
</style>

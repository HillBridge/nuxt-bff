<template>
    <div class="profile-page">
        <h1>个人信息</h1>

        <div v-if="loading" class="loading">
            加载中...
        </div>

        <div v-else-if="error" class="error">
            <p>{{ error }}</p>
            <button @click="fetchUserInfo" class="btn-retry">重试</button>
        </div>

        <div v-else-if="user" class="profile-card">
            <div class="profile-header">
                <div class="avatar">
                    <span>{{ userInitial }}</span>
                </div>
                <h2>{{ user.username }}</h2>
            </div>

            <div class="profile-content">
                <div class="info-section">
                    <h3>基本信息</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>用户 ID</label>
                            <div class="info-value">{{ user.id }}</div>
                        </div>
                        <div class="info-item">
                            <label>用户名</label>
                            <div class="info-value">{{ user.username }}</div>
                        </div>
                        <div class="info-item">
                            <label>邮箱</label>
                            <div class="info-value">{{ user.email }}</div>
                        </div>
                        <div class="info-item" v-if="user.createdAt">
                            <label>注册时间</label>
                            <div class="info-value">{{ formattedDate }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="profile-actions">
                <NuxtLink to="/products" class="btn-secondary">返回商品列表</NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'default',
    middleware: 'auth'
});

const authStore = useAuthStore();
const loading = ref(false);
const error = ref(null);
const user = ref(null);

// 计算用户首字母（用于头像显示）
const userInitial = computed(() => {
    if (!user.value?.username) return '?';
    return user.value.username.charAt(0).toUpperCase();
});

// 格式化日期
const formattedDate = computed(() => {
    if (!user.value?.createdAt) return '未知';
    try {
        const date = new Date(user.value.createdAt);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return user.value.createdAt;
    }
});

// 获取用户信息
const fetchUserInfo = async () => {
    loading.value = true;
    error.value = null;

    try {
        // 如果 store 中已有用户信息，先使用它
        if (authStore.user) {
            user.value = authStore.user;
        }

        // 从服务器获取最新用户信息
        const response = await $fetch('/api/auth/me');

        if (response.success && response.user) {
            user.value = response.user;
            // 更新 store 中的用户信息
            authStore.user = response.user;
            authStore.isAuthenticated = true;
        } else {
            error.value = '获取用户信息失败';
        }
    } catch (err) {
        console.error('获取用户信息错误:', err);
        error.value = err.data?.message || err.message || '获取用户信息失败，请稍后重试';
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await fetchUserInfo();
});
</script>

<style scoped>
.profile-page {
    padding: 2rem 0;
    max-width: 800px;
    margin: 0 auto;
}

.profile-page h1 {
    margin-bottom: 2rem;
    color: #333;
    font-size: 2rem;
}

.loading,
.error {
    text-align: center;
    padding: 3rem;
    color: #666;
    font-size: 1.1rem;
}

.error {
    color: #dc3545;
}

.error p {
    margin-bottom: 1rem;
}

.btn-retry {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s;
}

.btn-retry:hover {
    background: #0056b3;
}

.profile-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.profile-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 3rem 2rem;
    text-align: center;
    color: white;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-size: 2.5rem;
    font-weight: bold;
    border: 3px solid rgba(255, 255, 255, 0.3);
}

.profile-header h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
}

.profile-content {
    padding: 2rem;
}

.info-section {
    margin-bottom: 2rem;
}

.info-section h3 {
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.3rem;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 0.5rem;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-item label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 6px;
    word-break: break-all;
}

.profile-actions {
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.btn-secondary {
    background: white;
    color: #007bff;
    border: 2px solid #007bff;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;
    display: inline-block;
}

.btn-secondary:hover {
    background: #007bff;
    color: white;
}

@media (max-width: 768px) {
    .profile-page {
        padding: 1rem;
    }

    .profile-header {
        padding: 2rem 1.5rem;
    }

    .avatar {
        width: 80px;
        height: 80px;
        font-size: 2rem;
    }

    .profile-content {
        padding: 1.5rem;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }
}
</style>

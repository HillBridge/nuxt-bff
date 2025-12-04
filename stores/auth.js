import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && state.user !== null
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        });

        if (response.success) {
          this.user = response.user;
          this.isAuthenticated = true;
          return { success: true, message: response.message };
        }
        return { success: false, message: response.message };
      } catch (error) {
        return {
          success: false,
          message: error.data?.message || error.message || '登录失败，请稍后重试'
        };
      } finally {
        this.loading = false;
      }
    },

    async register(username, email, password) {
      this.loading = true;
      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: { username, email, password }
        });

        if (response.success) {
          this.user = response.user;
          this.isAuthenticated = true;
          return { success: true, message: response.message };
        }
        return { success: false, message: response.message };
      } catch (error) {
        return {
          success: false,
          message: error.data?.message || error.message || '注册失败，请稍后重试'
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      try {
        const response = await $fetch('/api/auth/me');
        if (response.success) {
          this.user = response.user;
          this.isAuthenticated = true;
          return true;
        }
        return false;
      } catch (error) {
        this.user = null;
        this.isAuthenticated = false;
        return false;
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST'
        });
      } catch (error) {
        console.error('登出错误:', error);
      } finally {
        this.user = null;
        this.isAuthenticated = false;
      }
    }
  }
});


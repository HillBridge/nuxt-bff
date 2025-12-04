import { defineStore } from 'pinia';

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    currentProduct: null,
    loading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  }),

  getters: {
    hasProducts: (state) => state.products.length > 0,
    productById: (state) => (id) => state.products.find(p => p.id === id)
  },

  actions: {
    async fetchProducts(params = {}) {
      this.loading = true;
      try {
        const response = await $fetch('/api/products', {
          method: 'GET',
          params
        });

        if (response.success) {
          this.products = response.data;
          this.pagination = response.pagination;
          return { success: true, data: response.data };
        }
        return { success: false, message: response.message };
      } catch (error) {
        return {
          success: false,
          message: error.data?.message || error.message || '获取商品列表失败'
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchProductById(id) {
      this.loading = true;
      try {
        const response = await $fetch(`/api/products/${id}`, {
          method: 'GET'
        });

        if (response.success) {
          this.currentProduct = response.data;
          return { success: true, data: response.data };
        }
        return { success: false, message: response.message };
      } catch (error) {
        return {
          success: false,
          message: error.data?.message || error.message || '获取商品详情失败'
        };
      } finally {
        this.loading = false;
      }
    },

    clearCurrentProduct() {
      this.currentProduct = null;
    }
  }
});


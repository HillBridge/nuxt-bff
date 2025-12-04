<template>
  <div class="products-page">
    <h1>商品列表</h1>
    
    <div v-if="productStore.loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="productStore.products.length === 0" class="empty">
      暂无商品
    </div>
    
    <div v-else class="products-grid">
      <div
        v-for="product in productStore.products"
        :key="product.id"
        class="product-card"
        @click="goToProduct(product.id)"
      >
        <img :src="product.image" :alt="product.name" class="product-image" />
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-footer">
            <span class="product-price">¥{{ product.price.toLocaleString() }}</span>
            <span class="product-stock">库存: {{ product.stock }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="productStore.pagination.totalPages > 1" class="pagination">
      <button
        @click="changePage(productStore.pagination.page - 1)"
        :disabled="productStore.pagination.page === 1"
        class="page-btn"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ productStore.pagination.page }} / {{ productStore.pagination.totalPages }} 页
      </span>
      <button
        @click="changePage(productStore.pagination.page + 1)"
        :disabled="productStore.pagination.page === productStore.pagination.totalPages"
        class="page-btn"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
});

const productStore = useProductStore();
const router = useRouter();

onMounted(async () => {
  await productStore.fetchProducts();
});

const goToProduct = (id) => {
  router.push(`/products/${id}`);
};

const changePage = async (page) => {
  await productStore.fetchProducts({ page });
};
</script>

<style scoped>
.products-page {
  padding: 2rem 0;
}

.products-page h1 {
  margin-bottom: 2rem;
  color: #333;
}

.loading,
.empty {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: #f0f0f0;
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.3rem;
  font-weight: bold;
  color: #007bff;
}

.product-stock {
  color: #666;
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}
</style>


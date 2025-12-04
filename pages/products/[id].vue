<template>
  <div class="product-detail-page">
    <div v-if="productStore.loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="!productStore.currentProduct" class="error">
      商品不存在
    </div>
    
    <div v-else class="product-detail">
      <div class="product-image-section">
        <img
          :src="productStore.currentProduct.image"
          :alt="productStore.currentProduct.name"
          class="detail-image"
        />
      </div>
      <div class="product-info-section">
        <h1 class="product-title">{{ productStore.currentProduct.name }}</h1>
        <p class="product-category">分类: {{ productStore.currentProduct.category }}</p>
        <p class="product-description">{{ productStore.currentProduct.description }}</p>
        <div class="product-price-section">
          <span class="price">¥{{ productStore.currentProduct.price.toLocaleString() }}</span>
          <span class="stock">库存: {{ productStore.currentProduct.stock }}</span>
        </div>
        <button class="btn-add-cart">加入购物车</button>
        <NuxtLink to="/products" class="btn-back">返回商品列表</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
});

const productStore = useProductStore();
const route = useRoute();

onMounted(async () => {
  const productId = route.params.id;
  await productStore.fetchProductById(productId);
});

onUnmounted(() => {
  productStore.clearCurrentProduct();
});
</script>

<style scoped>
.product-detail-page {
  padding: 2rem 0;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-image-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-image {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 8px;
  background: #f0f0f0;
}

.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.product-category {
  color: #666;
  font-size: 0.9rem;
}

.product-description {
  color: #666;
  line-height: 1.8;
  font-size: 1rem;
}

.product-price-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.price {
  font-size: 2.5rem;
  font-weight: bold;
  color: #007bff;
}

.stock {
  color: #666;
  font-size: 1rem;
}

.btn-add-cart {
  background: #007bff;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-add-cart:hover {
  background: #0056b3;
}

.btn-back {
  text-align: center;
  color: #007bff;
  text-decoration: none;
  padding: 0.75rem;
  border: 1px solid #007bff;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #007bff;
  color: white;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
}
</style>


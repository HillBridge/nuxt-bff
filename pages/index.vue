<template>
  <div class="home">
    <div class="hero">
      <h1>欢迎来到电商平台</h1>
      <p>发现优质商品，享受购物乐趣</p>
      <NuxtLink to="/products" class="btn-primary">浏览商品</NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
});
</script>

<style scoped>
.home {
  text-align: center;
  padding: 4rem 0;
}

.hero {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #333;
}

.hero p {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
}

.btn-primary {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 1.1rem;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #0056b3;
}
</style>


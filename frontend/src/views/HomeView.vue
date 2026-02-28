<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">技术博客</h1>
      <p class="hero-sub">分享 Java · Spring · Vue 技术文章</p>
    </div>

    <div class="category-bar">
      <div class="category-scroll">
        <button :class="['cat-btn', categoryId === null ? 'active' : '']" @click="selectCat(null)">全部</button>
        <button v-for="c in categories" :key="c.id"
          :class="['cat-btn', categoryId === c.id ? 'active' : '']"
          @click="selectCat(c.id)">{{ c.name }}</button>
      </div>
    </div>

    <div v-loading="loading" class="article-grid">
      <div v-for="article in articles" :key="article.id" class="article-card" @click="goDetail(article.id)">
        <div class="card-top">
          <el-tag size="small">{{ article.categoryName }}</el-tag>
        </div>
        <h3 class="card-title">{{ article.title }}</h3>
        <p class="card-summary">{{ article.summary }}</p>
        <div class="card-meta">
          <span><el-icon><User /></el-icon> {{ article.authorName }}</span>
          <span><el-icon><Clock /></el-icon> {{ article.createdAt?.substring(0,10) }}</span>
          <span><el-icon><View /></el-icon> {{ article.viewCount }}</span>
        </div>
      </div>
      <el-empty v-if="!loading && articles.length === 0" description="暂无文章" style="grid-column:1/-1" />
    </div>

    <el-pagination v-if="total > 0" layout="prev, pager, next" :total="total"
      :page-size="pageSize" v-model:current-page="page" @current-change="fetchArticles"
      class="pagination" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArticles, getCategories } from '@/api/article'
import { User, Clock, View } from '@element-plus/icons-vue'

const router = useRouter()
const articles = ref([])
const categories = ref([])
const loading = ref(false)
const categoryId = ref(null)
const page = ref(1)
const pageSize = 10
const total = ref(0)

async function fetchArticles() {
  loading.value = true
  try {
    const params = { page: page.value, size: pageSize }
    if (categoryId.value != null) params.categoryId = categoryId.value
    const res = await getArticles(params)
    articles.value = res.data.content || res.data.records || res.data || []
    total.value = res.data.totalElements || res.data.total || 0
  } catch (e) { /* handled */ }
  finally { loading.value = false }
}

async function fetchCategories() {
  try {
    const res = await getCategories()
    categories.value = res.data || []
  } catch (e) { /* handled */ }
}

function selectCat(id) { categoryId.value = id; page.value = 1; fetchArticles() }
function goDetail(id) { router.push(`/article/${id}`) }
onMounted(() => { fetchCategories(); fetchArticles() })
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 40px 20px 32px;
  background: linear-gradient(135deg, #409eff 0%, #6ec6ff 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  color: #fff;
}
.hero-title { margin: 0 0 8px; font-size: 28px; font-weight: 700; }
.hero-sub { margin: 0; font-size: 15px; opacity: .9; }

.category-bar { margin-bottom: 20px; }
.category-scroll {
  display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
}
.category-scroll::-webkit-scrollbar { display: none; }
.cat-btn {
  flex-shrink: 0; padding: 6px 16px; border-radius: 20px;
  border: 1px solid #dcdfe6; background: #fff; color: #606266;
  font-size: 13px; cursor: pointer; transition: all .2s; white-space: nowrap;
}
.cat-btn:hover { border-color: #409eff; color: #409eff; }
.cat-btn.active { background: #409eff; border-color: #409eff; color: #fff; }

.article-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; min-height: 200px;
}
.article-card {
  background: #fff; border-radius: 10px; padding: 20px; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,.06); transition: transform .2s, box-shadow .2s;
  border: 1px solid #f0f0f0;
}
.article-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,.1); }
.card-top { margin-bottom: 10px; }
.card-title { margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #303133; line-height: 1.5; }
.card-summary {
  color: #606266; font-size: 13px; line-height: 1.6; margin: 0 0 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.card-meta { display: flex; gap: 12px; color: #909399; font-size: 12px; flex-wrap: wrap; }
.card-meta span { display: flex; align-items: center; gap: 3px; }
.pagination { margin-top: 24px; display: flex; justify-content: center; }

@media (max-width: 640px) {
  .hero { padding: 28px 16px 24px; border-radius: 8px; }
  .hero-title { font-size: 22px; }
  .article-grid { grid-template-columns: 1fr; }
  .article-card { padding: 16px; }
}
</style>

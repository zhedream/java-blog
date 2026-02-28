<template>
  <div v-loading="loading" class="article-detail">
    <el-button @click="$router.back()" :icon="ArrowLeft" text>返回</el-button>
    <template v-if="article">
      <h1>{{ article.title }}</h1>
      <div class="meta">
        <el-tag>{{ article.categoryName }}</el-tag>
        <span><el-icon><User /></el-icon> {{ article.authorName }}</span>
        <span><el-icon><Clock /></el-icon> {{ article.createdAt?.substring(0,10) }}</span>
        <span><el-icon><View /></el-icon> {{ article.viewCount }}</span>
      </div>
      <el-divider />
      <div class="content markdown-body" v-html="renderedContent"></div>

      <el-divider />
      <h3>评论 ({{ comments.length }})</h3>
      <div v-if="auth.isLoggedIn" style="margin-bottom:20px">
        <el-input v-model="commentText" type="textarea" :rows="3" placeholder="写下你的评论..." />
        <el-button type="primary" @click="submitComment" :loading="submitting"
          style="margin-top:8px">发表评论</el-button>
      </div>
      <el-alert v-else title="请先登录后再评论" type="info" :closable="false"
        style="margin-bottom:16px" />

      <div v-for="c in comments" :key="c.id" class="comment-item">
        <div class="comment-header">
          <strong>{{ c.authorName }}</strong>
          <span class="comment-time">{{ c.createdAt?.substring(0,10) }}</span>
        </div>
        <p>{{ c.content }}</p>
      </div>
      <el-empty v-if="comments.length === 0" description="暂无评论" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getArticle } from '@/api/article'
import { getComments, createComment } from '@/api/comment'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Clock, View } from '@element-plus/icons-vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const renderer = new marked.Renderer()
renderer.code = ({ text, lang }) => {
  const language = hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(text, { language }).value
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}
marked.use({ renderer, breaks: true })

const route = useRoute()
const auth = useAuthStore()
const article = ref(null)
const comments = ref([])
const loading = ref(false)
const commentText = ref('')
const submitting = ref(false)

const renderedContent = computed(() =>
  article.value ? marked(article.value.content) : ''
)

async function fetchData() {
  loading.value = true
  try {
    const [artRes, cmtRes] = await Promise.all([
      getArticle(route.params.id),
      getComments(route.params.id)
    ])
    article.value = artRes.data
    comments.value = cmtRes.data || []
  } catch (e) { /* handled */ }
  finally { loading.value = false }
}

async function submitComment() {
  if (!commentText.value.trim()) return ElMessage.warning('请输入评论内容')
  submitting.value = true
  try {
    await createComment({ articleId: route.params.id, content: commentText.value })
    commentText.value = ''
    ElMessage.success('评论成功')
    const res = await getComments(route.params.id)
    comments.value = res.data || []
  } catch (e) { /* handled */ }
  finally { submitting.value = false }
}

onMounted(fetchData)
</script>

<style scoped>
.article-detail {
  max-width: 800px; margin: 0 auto;
  background: #fff; border-radius: 12px; padding: 28px 32px;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
}
.article-detail h1 { margin: 16px 0 14px; font-size: 24px; line-height: 1.4; }
.meta {
  display: flex; gap: 14px; color: #909399; font-size: 14px;
  align-items: center; flex-wrap: wrap;
}
.meta span { display: flex; align-items: center; gap: 4px; }
.content.markdown-body {
  line-height: 1.8; font-size: 15px;
  padding: 20px; border-radius: 8px;
  background: #f8f9fb; border-left: 3px solid #409eff;
}
.content.markdown-body :deep(h1),
.content.markdown-body :deep(h2),
.content.markdown-body :deep(h3),
.content.markdown-body :deep(h4),
.content.markdown-body :deep(h5),
.content.markdown-body :deep(h6) {
  margin: 1em 0 .5em; font-weight: 600; line-height: 1.4;
}
.content.markdown-body :deep(h1) { font-size: 1.6em; }
.content.markdown-body :deep(h2) { font-size: 1.35em; }
.content.markdown-body :deep(h3) { font-size: 1.15em; }
.content.markdown-body :deep(p) { margin: .6em 0; }
.content.markdown-body :deep(ul),
.content.markdown-body :deep(ol) { padding-left: 1.6em; margin: .6em 0; }
.content.markdown-body :deep(li) { margin: .25em 0; }
.content.markdown-body :deep(blockquote) {
  margin: .8em 0; padding: .4em 1em;
  border-left: 4px solid #dfe2e5; color: #6a737d; background: #f6f8fa;
}
.content.markdown-body :deep(code) {
  background: #eef0f3; padding: 2px 5px; border-radius: 4px;
  font-family: 'Fira Code', Consolas, monospace; font-size: .9em;
}
.content.markdown-body :deep(pre) {
  margin: .8em 0; border-radius: 6px; overflow-x: auto;
}
.content.markdown-body :deep(pre code) {
  background: none; padding: 0; font-size: .88em;
}
.content.markdown-body :deep(a) { color: #409eff; text-decoration: none; }
.content.markdown-body :deep(a:hover) { text-decoration: underline; }
.content.markdown-body :deep(img) { max-width: 100%; border-radius: 4px; }
.content.markdown-body :deep(table) { border-collapse: collapse; width: 100%; margin: .8em 0; }
.content.markdown-body :deep(th),
.content.markdown-body :deep(td) {
  border: 1px solid #dfe2e5; padding: 6px 12px; text-align: left;
}
.content.markdown-body :deep(th) { background: #f6f8fa; font-weight: 600; }
.content.markdown-body :deep(hr) { border: none; border-top: 1px solid #ebeef5; margin: 1.2em 0; }
.comment-item { padding: 14px 0; border-bottom: 1px solid #ebeef5; }
.comment-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.comment-time { color: #909399; font-size: 13px; }

@media (max-width: 640px) {
  .article-detail { padding: 16px; border-radius: 8px; }
  .article-detail h1 { font-size: 20px; }
  .meta { gap: 10px; font-size: 13px; }
  .content.markdown-body { padding: 14px; font-size: 14px; }
}
</style>

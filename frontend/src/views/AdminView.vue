<template>
  <div class="admin">
    <el-tabs model-value="articles">
      <el-tab-pane label="文章管理" name="articles">
        <el-button type="primary" @click="openDialog()" style="margin-bottom:16px">
          <el-icon><Plus /></el-icon> 新建文章
        </el-button>
        <el-table :data="articles" v-loading="loading" stripe>
          <el-table-column prop="title" label="标题" min-width="200" />
          <el-table-column prop="categoryName" label="分类" width="120" />
          <el-table-column label="时间" width="120">
            <template #default="{ row }">{{ row.createdAt?.substring(0,10) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button size="small" @click="openDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination v-if="total > 0" layout="prev, pager, next" :total="total"
          :page-size="pageSize" v-model:current-page="page" @current-change="fetchArticles"
          style="margin-top:16px" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑文章' : '新建文章'"
      :width="isMobile ? '95%' : '640px'">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="文章标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="选择分类">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="文章摘要" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="10" placeholder="文章内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getArticles, createArticle, updateArticle, deleteArticle, getCategories } from '@/api/article'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const isMobile = ref(window.innerWidth < 640)

const articles = ref([])
const categories = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = 10
const total = ref(0)
const dialogVisible = ref(false)
const editingId = ref(null)
const saving = ref(false)
const emptyForm = { title: '', content: '', summary: '', categoryId: null }
const form = ref({ ...emptyForm })

async function fetchArticles() {
  loading.value = true
  try {
    const res = await getArticles({ page: page.value, size: pageSize })
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

function openDialog(row) {
  if (row) {
    editingId.value = row.id
    form.value = { title: row.title, content: row.content, summary: row.summary, categoryId: row.categoryId }
  } else {
    editingId.value = null
    form.value = { ...emptyForm }
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.title || !form.value.content) return ElMessage.warning('标题和内容不能为空')
  saving.value = true
  try {
    if (editingId.value) {
      await updateArticle(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createArticle(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchArticles()
  } catch (e) { /* handled */ }
  finally { saving.value = false }
}

async function handleDelete(id) {
  await ElMessageBox.confirm('确定删除该文章？', '提示', { type: 'warning' })
  try {
    await deleteArticle(id)
    ElMessage.success('删除成功')
    fetchArticles()
  } catch (e) { /* handled */ }
}

onMounted(() => { fetchCategories(); fetchArticles() })
</script>

<style scoped>
.admin { max-width: 1000px; margin: 0 auto; }

@media (max-width: 640px) {
  :deep(.el-table) { font-size: 13px; }
}
</style>

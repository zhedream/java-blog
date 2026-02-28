<template>
  <div id="layout">
    <header class="navbar">
      <div class="navbar-inner">
        <router-link to="/" class="logo">☕ Java Blog</router-link>
        <nav class="nav-links" :class="{ open: menuOpen }">
          <template v-if="auth.isLoggedIn">
            <router-link v-if="auth.isAdmin" to="/admin" class="nav-item" @click="menuOpen=false">管理</router-link>
            <span class="username nav-item">{{ auth.user?.username }}</span>
            <button class="nav-btn danger" @click="handleLogout">退出</button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-item" @click="menuOpen=false">登录</router-link>
            <router-link to="/register" class="nav-item" @click="menuOpen=false">注册</router-link>
          </template>
        </nav>
        <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ active: menuOpen }">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
    <main class="page-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

function handleLogout() {
  auth.logout()
  menuOpen.value = false
  router.push('/')
}
</script>

<style scoped>
.navbar {
  position: sticky; top: 0; z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 8px rgba(0,0,0,.06);
}
.navbar-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 20px;
  height: 60px; display: flex; align-items: center; justify-content: space-between;
}
.logo { font-size: 20px; font-weight: 700; color: #409eff; letter-spacing: .5px; }
.nav-links { display: flex; align-items: center; gap: 4px; }
.nav-item {
  padding: 6px 12px; border-radius: 6px; color: #606266;
  font-size: 14px; transition: background .2s, color .2s;
}
.nav-item:hover { background: #f0f2f5; color: #409eff; }
.nav-btn {
  padding: 6px 12px; border-radius: 6px; border: none; background: none;
  color: #606266; font-size: 14px; cursor: pointer; transition: background .2s, color .2s;
}
.nav-btn.danger:hover { background: #fff0f0; color: #f56c6c; }
.username { color: #303133; font-weight: 500; }
.hamburger {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px;
}
.hamburger span {
  display: block; width: 22px; height: 2px;
  background: #606266; border-radius: 2px; transition: .25s;
}
.hamburger.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.active span:nth-child(2) { opacity: 0; }
.hamburger.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.page-main { max-width: 1200px; margin: 0 auto; padding: 24px 20px; }

@media (max-width: 640px) {
  .hamburger { display: flex; }
  .nav-links {
    display: none; position: absolute; top: 60px; left: 0; right: 0;
    background: #fff; border-bottom: 1px solid #e4e7ed;
    padding: 12px 20px; flex-direction: column; align-items: flex-start; gap: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,.08);
  }
  .nav-links.open { display: flex; }
  .page-main { padding: 16px 12px; }
}
</style>

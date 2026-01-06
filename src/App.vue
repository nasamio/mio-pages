<script setup>
import { ref, onMounted, computed } from 'vue'

// --- 状态管理 ---
const view = ref('home') // 当前视图: home, article, admin
const user = ref(null)   // 当前登录用户
const posts = ref([])    // 文章列表
const currentPost = ref(null) // 当前查看的文章

// --- 表单数据 ---
const loginForm = ref({ username: '', password: '' })
const postForm = ref({ title: '', content: '' })
const msg = ref('')

// --- API 方法 ---
// 1. 获取文章列表
const fetchPosts = async () => {
  const res = await fetch('/api/posts')
  posts.value = await res.json()
}

// 2. 登录
const handleLogin = async () => {
  msg.value = '魔法咏唱中...'
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginForm.value)
  })
  const data = await res.json()
  if (data.success) {
    user.value = { ...data.user, password: loginForm.value.password } // 暂存密码用于发布鉴权
    msg.value = `欢迎回来，Master ${user.value.username}!`
    view.value = 'home'
  } else {
    msg.value = '❌ 认证失败: ' + data.error
  }
}

// 3. 发布文章
const handlePublish = async () => {
  if (!postForm.value.title || !postForm.value.content) return
  
  const res = await fetch('/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: user.value.username,
      password: user.value.password, // 发送给后端再次验证
      title: postForm.value.title,
      content: postForm.value.content
    })
  })
  
  if (res.ok) {
    alert('发布成功！(o゜▽゜)o☆')
    postForm.value = { title: '', content: '' }
    view.value = 'home'
    fetchPosts()
  } else {
    alert('发布失败，魔力不足...')
  }
}

// 4. 查看详情
const goDetail = (post) => {
  currentPost.value = post
  view.value = 'article'
}

// --- 初始化 ---
onMounted(() => {
  fetchPosts()
})

// --- 简单的格式化时间 ---
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div class="app-container">
    <div class="bg-layer"></div>

    <nav class="navbar glass">
      <div class="logo" @click="view = 'home'">Mio's World 🌸</div>
      <div class="actions">
        <button v-if="!user" @click="view = 'login'" class="btn-text">登录</button>
        <div v-else class="user-info">
          <span>{{ user.username }}</span>
          <button @click="view = 'admin'" class="btn-primary">写博客</button>
          <button @click="user = null; view='home'" class="btn-text">退出</button>
        </div>
      </div>
    </nav>

    <main class="main-content">
      
      <div v-if="view === 'home'" class="post-list fade-in">
        <div class="hero-section">
          <h1>Welcome to My Space</h1>
          <p>记录代码与二次元的日常</p>
        </div>
        
        <div v-for="post in posts" :key="post.id" class="post-card glass" @click="goDetail(post)">
          <div class="post-meta">{{ formatDate(post.created_at) }}</div>
          <h2>{{ post.title }}</h2>
          <p class="post-preview">{{ post.content.substring(0, 50) }}...</p>
        </div>
      </div>

      <div v-if="view === 'article'" class="article-detail glass fade-in">
        <button @click="view = 'home'" class="back-btn">← 返回</button>
        <h1 class="article-title">{{ currentPost.title }}</h1>
        <div class="article-meta">{{ formatDate(currentPost.created_at) }}</div>
        <div class="article-body">
          {{ currentPost.content }}
        </div>
      </div>

      <div v-if="view === 'login'" class="login-box glass fade-in">
        <h2>Gate Access</h2>
        <input v-model="loginForm.username" placeholder="Username" />
        <input v-model="loginForm.password" type="password" placeholder="Password" />
        <button @click="handleLogin" class="btn-primary full-width">Connect</button>
        <p class="msg">{{ msg }}</p>
      </div>

      <div v-if="view === 'admin'" class="admin-box glass fade-in">
        <h2>New Post ✒️</h2>
        <input v-model="postForm.title" placeholder="输入标题..." class="input-title" />
        <textarea v-model="postForm.content" placeholder="写点什么..." class="input-content"></textarea>
        <div class="btn-group">
          <button @click="view = 'home'" class="btn-text">取消</button>
          <button @click="handlePublish" class="btn-primary">发布</button>
        </div>
      </div>

    </main>
  </div>
</template>

<style>
/* --- 全局重置与变量 --- */
:root {
  --primary: #ff7eb3;
  --primary-hover: #ff5f9e;
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.5);
  --text-main: #2c3e50;
  --text-light: #666;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-main);
  overflow-x: hidden;
}

/* --- 背景动画 --- */
.bg-layer {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: -1;
  /* 这里换成你喜欢的二次元壁纸 URL */
  background: url('https://w.wallhaven.cc/full/wq/wallhaven-wqve6r.jpg') no-repeat center center fixed;
  background-size: cover;
}
.bg-layer::after {
  content: '';
  position: absolute;
  top:0; left:0; width:100%; height:100%;
  background: rgba(255, 255, 255, 0.3); /* 遮罩层，让字更清晰 */
  backdrop-filter: blur(3px);
}

/* --- 布局与通用 --- */
.app-container { min-height: 100vh; }

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.fade-in { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* --- 导航栏 --- */
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 30px;
  margin: 20px;
}
.logo { font-size: 1.5rem; font-weight: bold; color: var(--primary); cursor: pointer; }
.actions { display: flex; gap: 10px; align-items: center; }

/* --- 首页列表 --- */
.main-content { max-width: 800px; margin: 0 auto; padding: 20px; }
.hero-section { text-align: center; margin-bottom: 40px; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }

.post-card {
  padding: 25px; margin-bottom: 20px; cursor: pointer;
  transition: transform 0.3s, background 0.3s;
}
.post-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.85); }
.post-meta { font-size: 0.85rem; color: var(--text-light); margin-bottom: 5px; }
.post-card h2 { margin: 5px 0 10px 0; color: var(--primary); }

/* --- 详情页 --- */
.article-detail { padding: 40px; min-height: 500px; }
.article-title { color: var(--primary); margin-bottom: 10px; }
.article-body { line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap; }
.back-btn { margin-bottom: 20px; border:none; background:none; color: var(--text-light); cursor: pointer; }

/* --- 登录与 Admin --- */
.login-box, .admin-box {
  max-width: 400px; margin: 50px auto; padding: 40px; text-align: center;
}
.admin-box { max-width: 700px; text-align: left; }

input, textarea {
  width: 100%; padding: 12px; margin: 10px 0;
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 8px; background: rgba(255,255,255,0.5);
  outline: none; transition: 0.3s;
}
input:focus, textarea:focus { border-color: var(--primary); background: #fff; }

.input-title { font-size: 1.2rem; font-weight: bold; }
.input-content { min-height: 300px; font-family: inherit; }

/* --- 按钮 --- */
.btn-primary {
  background: var(--primary); color: white; border: none;
  padding: 10px 20px; border-radius: 20px; cursor: pointer;
  transition: 0.3s;
}
.btn-primary:hover { background: var(--primary-hover); transform: scale(1.05); }
.btn-text { background: none; border: none; cursor: pointer; color: var(--text-main); }
.full-width { width: 100%; margin-top: 10px; }
.btn-group { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }

</style>
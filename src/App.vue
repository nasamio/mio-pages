<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { marked } from 'marked' // 引入 markdown 解析器

// --- 状态管理 ---
const view = ref('home') 
const user = ref(null)
const posts = ref([])
const currentPost = ref(null)

// --- 配置管理 ---
// 默认背景：一张科技感的图
const defaultBg = 'https://w.wallhaven.cc/full/zy/wallhaven-zyxvqy.jpg'
const bgUrl = ref(localStorage.getItem('mio_bg_url') || defaultBg)
const showConfig = ref(false) // 是否显示配置面板

// --- 表单数据 ---
const loginForm = ref({ username: '', password: '' })
const postForm = ref({ title: '', content: '' })
const msg = ref('')

// --- Markdown 渲染计算属性 ---
const renderedContent = computed(() => {
  if (!currentPost.value) return ''
  return marked.parse(currentPost.value.content)
})

const previewContent = computed(() => {
  return marked.parse(postForm.value.content || '')
})

// --- 方法 ---
const saveConfig = () => {
  localStorage.setItem('mio_bg_url', bgUrl.value)
  showConfig.value = false
  alert('背景设置已保存 / Config Saved')
}

const fetchPosts = async () => {
  try {
    const res = await fetch('/api/posts')
    posts.value = await res.json()
  } catch (e) {
    console.error("加载失败", e)
  }
}

const handleLogin = async () => {
  msg.value = 'ACCESSING MAINFRAME...'
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm.value)
    })
    const data = await res.json()
    if (data.success) {
      user.value = { ...data.user, password: loginForm.value.password }
      msg.value = `ACCESS GRANTED. WELCOME COMMANDER ${user.value.username}`
      setTimeout(() => { view.value = 'home'; msg.value = '' }, 1000)
    } else {
      msg.value = 'ACCESS DENIED: ' + data.error
    }
  } catch (e) {
    msg.value = 'CONNECTION ERROR'
  }
}

const handlePublish = async () => {
  if (!postForm.value.title || !postForm.value.content) return
  
  const res = await fetch('/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: user.value.username,
      password: user.value.password,
      title: postForm.value.title,
      content: postForm.value.content
    })
  })
  
  if (res.ok) {
    alert('UPLOAD COMPLETE')
    postForm.value = { title: '', content: '' }
    view.value = 'home'
    fetchPosts()
  } else {
    alert('UPLOAD FAILED')
  }
}

const goDetail = (post) => {
  currentPost.value = post
  view.value = 'article'
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString()
}

// --- 初始化 ---
onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="app-container">
    <div class="bg-layer" :style="{ backgroundImage: `url(${bgUrl})` }"></div>
    <div class="grid-overlay"></div> <nav class="navbar glass">
      <div class="logo" @click="view = 'home'">
        <span class="bracket">[</span> MIO_SPACE <span class="bracket">]</span>
      </div>
      
      <div class="actions">
        <button @click="showConfig = !showConfig" class="btn-icon" title="Settings">⚙️</button>
        <template v-if="!user">
          <button @click="view = 'login'" class="btn-tech">LOGIN</button>
        </template>
        <template v-else>
          <span class="user-tag">:: {{ user.username }} ::</span>
          <button @click="view = 'admin'" class="btn-tech">NEW POST</button>
          <button @click="user = null; view='home'" class="btn-tech-outline">LOGOUT</button>
        </template>
      </div>
    </nav>

    <div v-if="showConfig" class="config-panel glass fade-in">
      <h3>SYSTEM CONFIG</h3>
      <div class="form-group">
        <label>Background URL:</label>
        <input v-model="bgUrl" placeholder="Enter image URL..." />
      </div>
      <button @click="saveConfig" class="btn-tech full-width">SAVE CONFIG</button>
    </div>

    <main class="main-content">
      
      <div v-if="view === 'home'" class="post-list fade-in">
        <div class="hero-section">
          <h1 class="glitch" data-text="SYSTEM ONLINE">SYSTEM ONLINE</h1>
          <p class="subtitle">Log: {{ new Date().toLocaleDateString() }} // Ready to code.</p>
        </div>
        
        <div v-for="post in posts" :key="post.id" class="post-card glass" @click="goDetail(post)">
          <div class="card-header">
            <span class="post-id">#{{ post.id }}</span>
            <span class="post-date">{{ formatDate(post.created_at) }}</span>
          </div>
          <h2>{{ post.title }}</h2>
          <p class="post-preview">{{ post.content.substring(0, 100) }}...</p> 
          <div class="card-footer">
             <span class="read-more">READ_DATA >></span>
          </div>
        </div>
      </div>

      <div v-if="view === 'article'" class="article-detail glass fade-in">
        <div class="detail-header">
          <button @click="view = 'home'" class="btn-back">&lt; RETURN</button>
          <span class="detail-date">{{ formatDate(currentPost.created_at) }}</span>
        </div>
        <h1 class="article-title">{{ currentPost.title }}</h1>
        <hr class="tech-divider"/>
        <div class="markdown-body" v-html="renderedContent"></div>
      </div>

      <div v-if="view === 'login'" class="login-box glass fade-in">
        <div class="scan-line"></div>
        <h2>USER AUTHENTICATION</h2>
        <input v-model="loginForm.username" placeholder="IDENTITY (Username)" />
        <input v-model="loginForm.password" type="password" placeholder="PASSPHRASE" />
        <button @click="handleLogin" class="btn-tech full-width">INITIATE LINK</button>
        <p class="msg blink">{{ msg }}</p>
      </div>

      <div v-if="view === 'admin'" class="admin-box glass fade-in">
        <h2>CREATE NEW ENTRY</h2>
        <input v-model="postForm.title" placeholder="TITLE_INPUT..." class="input-title" />
        
        <div class="editor-container">
          <div class="editor-pane">
            <label>SOURCE CODE (Markdown)</label>
            <textarea v-model="postForm.content" placeholder="Write markdown here..." class="input-content"></textarea>
          </div>
          <div class="preview-pane">
            <label>VISUAL RENDER</label>
            <div class="markdown-preview markdown-body" v-html="previewContent"></div>
          </div>
        </div>

        <div class="btn-group">
          <button @click="view = 'home'" class="btn-tech-outline">ABORT</button>
          <button @click="handlePublish" class="btn-tech">UPLOAD DATA</button>
        </div>
      </div>

    </main>
  </div>
</template>

<style>
/* --- 赛博科技风全局变量 --- */
:root {
  --primary: #00f3ff;       /* 霓虹蓝 */
  --primary-dim: rgba(0, 243, 255, 0.2);
  --secondary: #bd00ff;     /* 霓虹紫 */
  --bg-dark: #050510;       /* 深黑背景 */
  --text-main: #e0e0e0;
  --text-dim: #8892b0;
  --glass-bg: rgba(10, 15, 30, 0.75);
  --glass-border: 1px solid rgba(0, 243, 255, 0.3);
  --font-tech: 'Courier New', Courier, monospace; /* 等宽字体增强科技感 */
}

/* --- 基础设置 --- */
body {
  margin: 0;
  font-family: var(--font-tech);
  color: var(--text-main);
  background-color: var(--bg-dark);
  overflow-x: hidden;
}

/* --- Markdown 样式 (简易版) --- */
.markdown-body { line-height: 1.6; font-family: sans-serif; }
.markdown-body h1, .markdown-body h2 { border-bottom: 1px solid var(--text-dim); padding-bottom: 5px; color: var(--primary); }
.markdown-body code { background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px; color: var(--secondary); font-family: var(--font-tech); }
.markdown-body pre { background: #111; padding: 10px; border-radius: 5px; overflow-x: auto; border: 1px solid #333; }
.markdown-body blockquote { border-left: 3px solid var(--primary); margin-left: 0; padding-left: 10px; color: var(--text-dim); }
.markdown-body img { max-width: 100%; border-radius: 5px; border: 1px solid var(--primary-dim); }

/* --- 背景与网格 --- */
.bg-layer {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2;
  background-size: cover; background-position: center; filter: brightness(0.6) contrast(1.2);
}
.grid-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
  background-image: 
    linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
}

/* --- 玻璃卡片 --- */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: var(--glass-border);
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.1);
}

/* --- 导航栏 --- */
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 30px; margin-bottom: 20px;
  border-bottom: 2px solid var(--primary);
  border-radius: 0 0 20px 20px;
}
.logo { font-size: 1.5rem; font-weight: bold; color: var(--primary); text-shadow: 0 0 10px var(--primary); cursor: pointer; letter-spacing: 2px; }
.bracket { color: var(--text-dim); }
.actions { display: flex; gap: 15px; align-items: center; }
.user-tag { color: var(--secondary); font-size: 0.9rem; }

/* --- 按钮 --- */
.btn-tech, .btn-tech-outline, .btn-icon {
  font-family: var(--font-tech); font-weight: bold; cursor: pointer; padding: 8px 20px; transition: 0.3s;
  text-transform: uppercase; letter-spacing: 1px;
}
.btn-tech {
  background: var(--primary-dim); color: var(--primary); border: 1px solid var(--primary);
  box-shadow: 0 0 5px var(--primary);
}
.btn-tech:hover { background: var(--primary); color: #000; box-shadow: 0 0 20px var(--primary); }
.btn-tech-outline { background: transparent; color: var(--text-dim); border: 1px solid var(--text-dim); }
.btn-tech-outline:hover { border-color: var(--text-main); color: var(--text-main); }
.btn-icon { background: none; border: none; font-size: 1.2rem; padding: 5px; }
.btn-back { background: none; border: none; color: var(--primary); cursor: pointer; font-family: var(--font-tech); margin-bottom: 10px;}

/* --- 配置面板 --- */
.config-panel {
  position: absolute; top: 70px; right: 30px; width: 300px; padding: 20px; z-index: 100;
}
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; color: var(--primary); font-size: 0.8rem; }

/* --- 首页 --- */
.main-content { max-width: 900px; margin: 0 auto; padding: 20px; }
.hero-section { text-align: center; margin-bottom: 50px; }
.glitch { font-size: 3rem; color: var(--text-main); text-shadow: 2px 2px var(--secondary); margin: 0; }
.subtitle { color: var(--text-dim); letter-spacing: 3px; border-top: 1px solid var(--text-dim); display: inline-block; padding-top: 5px;}

.post-card {
  padding: 20px; margin-bottom: 20px; transition: 0.3s; position: relative; overflow: hidden;
}
.post-card::before {
  content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: var(--primary);
  opacity: 0.5; transition: 0.3s;
}
.post-card:hover { transform: translateX(10px); box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); }
.post-card:hover::before { opacity: 1; box-shadow: 0 0 10px var(--primary); }

.card-header { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 5px; }
.card-footer { text-align: right; margin-top: 15px; font-size: 0.8rem; color: var(--primary); }
.read-more { border-bottom: 1px dashed var(--primary); }

/* --- 详情页 --- */
.article-detail { padding: 40px; min-height: 600px; }
.detail-header { display: flex; justify-content: space-between; align-items: center; }
.tech-divider { border: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--primary), transparent); margin: 20px 0; }

/* --- 登录框 --- */
.login-box { max-width: 400px; margin: 100px auto; padding: 40px; text-align: center; position: relative; }
.scan-line {
  position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--primary);
  opacity: 0.5; animation: scan 3s infinite linear;
}
@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
.msg { margin-top: 20px; color: var(--secondary); font-size: 0.9rem; }
.blink { animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0; } }

/* --- 编辑器 (Admin) --- */
.admin-box { max-width: 1000px; padding: 30px; }
.input-title { font-size: 1.5rem; background: rgba(0,0,0,0.3); color: var(--primary); border: 1px solid var(--text-dim); }
.editor-container { display: flex; gap: 20px; height: 500px; margin-top: 20px; }
.editor-pane, .preview-pane { flex: 1; display: flex; flex-direction: column; }
.editor-pane label, .preview-pane label { color: var(--primary); margin-bottom: 5px; font-size: 0.8rem; }
.input-content {
  flex: 1; background: rgba(0,0,0,0.5); color: #fff; border: 1px solid var(--text-dim);
  padding: 15px; font-family: monospace; resize: none; font-size: 0.9rem;
}
.markdown-preview {
  flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--text-dim);
  padding: 15px; overflow-y: auto;
}

/* --- 输入框通用 --- */
input {
  width: 100%; padding: 12px; margin: 10px 0;
  background: rgba(0, 0, 0, 0.5); border: 1px solid var(--text-dim); color: var(--primary);
  outline: none; transition: 0.3s; font-family: var(--font-tech);
}
input:focus { border-color: var(--primary); box-shadow: 0 0 10px var(--primary-dim); }

</style>
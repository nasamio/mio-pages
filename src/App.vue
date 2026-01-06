<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const message = ref('')

const handleLogin = async () => {
  try {
    // 请求后端接口 (我们稍后在 functions 目录创建这个接口)
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username.value, 
        password: password.value 
      })
    })

    const data = await res.json()

    if (res.ok) {
      message.value = '🎉 登录成功! 欢迎 ' + data.user.username
    } else {
      message.value = '❌ ' + data.error
    }
  } catch (e) {
    message.value = '请求出错'
  }
}
</script>

<template>
  <div style="padding: 50px; text-align: center;">
    <h1>Serverless 登录测试</h1>
    <div style="margin: 20px 0;">
      <input v-model="username" placeholder="用户名 (admin)" style="padding: 8px; margin-right: 10px;">
      <input v-model="password" type="password" placeholder="密码 (123456)" style="padding: 8px;">
      <button @click="handleLogin" style="padding: 8px 20px; cursor: pointer;">登录</button>
    </div>
    <h3>{{ message }}</h3>
  </div>
</template>
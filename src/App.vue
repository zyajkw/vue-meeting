<script setup>
import { nextTick, ref } from 'vue'
import { ask } from './api.js'

const apiKey = ref('')
const connected = ref(false)
const question = ref('')
const messages = ref([])
const error = ref('')
const loading = ref(false)
const conversation = ref(null)

function enter() {
  if (apiKey.value.trim()) connected.value = true
}

function reset() {
  apiKey.value = ''
  messages.value = []
  question.value = ''
  error.value = ''
  connected.value = false
}

async function scrollToEnd() {
  await nextTick()
  conversation.value?.scrollTo({ top: conversation.value.scrollHeight, behavior: 'smooth' })
}

async function submit() {
  if (loading.value || !question.value.trim()) return
  const text = question.value.trim()
  messages.value.push({ role: 'user', content: text })
  question.value = ''
  loading.value = true
  error.value = ''
  scrollToEnd()
  try {
    const answer = await ask(messages.value, apiKey.value)
    messages.value.push({ role: 'assistant', content: answer })
  } catch (failure) {
    messages.value.pop()
    question.value = text
    error.value = failure.message
  } finally {
    loading.value = false
    scrollToEnd()
  }
}
</script>

<template>
  <main>
    <header><a class="brand" href="#">DeepSeek <span>对话练习</span></a><span class="lesson">VUE 实践 / 04</span></header>
    <section class="intro">
      <p class="eyebrow">从终端到浏览器</p>
      <h1>输入密钥，<br />开始对话。</h1>
      <p class="description">用自己的 DeepSeek API Key，在浏览器中完成第一次 AI 对话。</p>
    </section>
    <section v-if="!connected" class="workspace">
      <form @submit.prevent="enter">
        <label for="key">DeepSeek API Key</label>
        <input id="key" v-model="apiKey" type="password" autocomplete="off" spellcheck="false" placeholder="输入你自己的 API Key" required />
        <p class="muted">密钥仅用于浏览器直接请求 DeepSeek，刷新页面即清空。进入聊天后，首次发送消息会验证密钥。</p>
        <button class="send" type="submit" :disabled="!apiKey.trim()">开始对话 ↗</button>
      </form>
    </section>
    <section v-else class="workspace" aria-label="对话区">
      <div class="chat-toolbar"><span>DeepSeek · 当前对话</span><div><button type="button" :disabled="loading || !messages.length" @click="messages = []; error = ''">清空对话</button><button type="button" :disabled="loading" @click="reset">更换密钥</button></div></div>
      <div ref="conversation" class="conversation" aria-live="polite" :aria-busy="loading" role="log" aria-label="聊天记录">
        <p v-if="!messages.length" class="muted">你好，想聊些什么？试着问我“什么是 Vue 的响应式”。</p>
        <article v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
          <h2>{{ message.role === 'user' ? '你' : 'DeepSeek' }}</h2>
          <div class="answer">{{ message.content }}</div>
        </article>
        <p v-if="loading" class="muted">正在等待 DeepSeek 回复…</p>
      </div>
      <form class="composer" @submit.prevent="submit">
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <label for="question">你的消息</label>
        <textarea id="question" v-model="question" maxlength="4000" rows="3" placeholder="输入消息，点击发送…" :disabled="loading" required></textarea>
        <div class="form-footer"><span>本次对话保留上下文，刷新后清空</span><button class="send" type="submit" :disabled="loading || !question.trim()">{{ loading ? '回复中…' : '发送消息 ↗' }}</button></div>
      </form>
    </section>
    <footer><span>Vue 3 + DeepSeek · 纯前端</span><span>API Key 与对话记录仅保存在当前页面内存中</span></footer>
  </main>
</template>

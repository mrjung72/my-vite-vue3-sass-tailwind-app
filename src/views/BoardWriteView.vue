<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">게시글 작성</h2>
    <form @submit.prevent="addPost" class="mb-8 bg-base-200 p-4 rounded-xl shadow" enctype="multipart/form-data">
      <div class="mb-2">
        <input v-model="newPost.title" class="input input-bordered w-full" placeholder="제목" required />
      </div>
      <div class="mb-2">
        <textarea v-model="newPost.content" class="textarea textarea-bordered w-full" placeholder="내용" required></textarea>
      </div>
      <div class="mb-2">
        <input type="file" @change="handleFileUpload" class="file-input file-input-bordered w-full" />
      </div>
      <button class="btn btn-primary w-full" type="submit" :disabled="loading">{{ loading ? '등록 중...' : '글 등록' }}</button>
      <div v-if="message" class="alert alert-success mt-2">{{ message }}</div>
      <div v-if="error" class="alert alert-error mt-2">{{ error }}</div>
    </form>
    <div class="text-right">
      <router-link to="/board" class="btn btn-outline">목록으로</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const token = localStorage.getItem('token')

const newPost = ref({ title: '', content: '' })
const file = ref(null)
const loading = ref(false)
const message = ref('')
const error = ref('')

function handleFileUpload(e) {
  file.value = e.target.files[0] || null
}

async function addPost() {
  if (!newPost.value.title || !newPost.value.content) return
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('title', newPost.value.title)
    formData.append('content', newPost.value.content)
    if (file.value) {
      formData.append('file', file.value)
    }
    const res = await axios.post('/api/board', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })
    message.value = res.data.message || '글이 등록되었습니다.'
    setTimeout(() => router.push('/board'), 1000)
  } catch (err) {
    if (err.response?.status === 443) {
      auth.logout()
      router.push({ name: 'login' })
      return
    }
    error.value = err.response?.data?.message || '글 등록에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
</style> 
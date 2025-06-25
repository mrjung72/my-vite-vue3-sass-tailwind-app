<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">게시판</h2>

    <!-- 글쓰기 폼 -->
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

    <!-- 게시글 목록 -->
    <div v-if="isLoading" class="text-center text-gray-400">불러오는 중...</div>
    <div v-else-if="posts.length === 0" class="text-center text-gray-400">게시글이 없습니다.</div>
    <div v-else class="space-y-4">
      <div v-for="(post, idx) in posts" :key="post.id || idx" class="bg-base-100 p-4 rounded shadow">
        <div class="font-bold text-lg mb-1">{{ post.title }}</div>
        <div class="text-sm text-gray-500 mb-2">작성자: {{ post.userid }} | {{ post.date }}</div>
        <div class="text-base mb-2">{{ post.content }}</div>
        <div v-if="post.filepath">
          <a :href="post.filepath" target="_blank" class="link text-blue-600">첨부파일 다운로드</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const posts = ref([])
const isLoading = ref(false)
const loading = ref(false)
const message = ref('')
const error = ref('')
const file = ref(null)
const token = localStorage.getItem('token')
const auth = useAuthStore()

const newPost = ref({ title: '', content: '' })

const fetchPosts = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await axios.get('/api/board', {
      headers: { Authorization: `Bearer ${token}` },
    })
    posts.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || '게시글을 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPosts)

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
    formData.append('userid', auth.user?.name || auth.user?.userid || '익명')
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
    newPost.value.title = ''
    newPost.value.content = ''
    file.value = null
    await fetchPosts()
  } catch (err) {
    error.value = err.response?.data?.message || '글 등록에 실패했습니다.'

    if(err.response.status === 443) {

      error.value += ' 로그인 화면으로 이동합니다.' 
      auth.logout()
      setTimeout(() => {
        router.push({ name: 'login' })
      }, 2000)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
</style> 
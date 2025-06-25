<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">게시글 수정</h2>
    <form @submit.prevent="editPost" class="mb-8 bg-base-200 p-4 rounded-xl shadow" enctype="multipart/form-data">
      <div class="mb-2">
        <input v-model="form.title" class="input input-bordered w-full" placeholder="제목" required />
      </div>
      <div class="mb-2">
        <textarea v-model="form.content" class="textarea textarea-bordered w-full" placeholder="내용" required></textarea>
      </div>
      <div class="mb-2">
        <input type="file" @change="handleFileUpload" class="file-input file-input-bordered w-full" />
        <div v-if="form.filepath" class="mt-2">
          <a :href="`/api/board/download/${form.board_id}`" target="_blank" class="link text-blue-600">
            {{ form.originalname || '첨부파일 다운로드' }}
          </a>
        </div>
      </div>
      <button class="btn btn-primary w-full" type="submit" :disabled="loading">{{ loading ? '수정 중...' : '수정 저장' }}</button>
      <div v-if="message" class="alert alert-success mt-2">{{ message }}</div>
      <div v-if="error" class="alert alert-error mt-2">{{ error }}</div>
    </form>
    <div class="text-right">
      <router-link :to="`/board/${form.board_id}`" class="btn btn-outline">취소</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const token = localStorage.getItem('token')

const form = ref({ title: '', content: '', board_id: '', filepath: '', originalname: '' })
const file = ref(null)
const loading = ref(false)
const message = ref('')
const error = ref('')

const fetchPost = async () => {
  try {
    const res = await axios.get(`/api/board/${route.params.id}`)
    form.value = { ...res.data }
  } catch (err) {
    error.value = err.response?.data?.message || '게시글을 불러오는 데 실패했습니다.'
  }
}

onMounted(fetchPost)

function handleFileUpload(e) {
  file.value = e.target.files[0] || null
}

async function editPost() {
  if (!form.value.title || !form.value.content) return
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('content', form.value.content)
    if (file.value) {
      formData.append('file', file.value)
    }
    const res = await axios.put(`/api/board/${form.value.board_id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })
    message.value = res.data.message || '수정되었습니다.'
    setTimeout(() => router.push(`/board/${form.value.board_id}`), 1000)
  } catch (err) {
    error.value = err.response?.data?.message || '수정에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
</style> 
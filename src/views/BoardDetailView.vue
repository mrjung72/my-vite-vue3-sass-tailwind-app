<template>
  <div class="max-w-2xl mx-auto p-6">
    <div v-if="isLoading" class="text-center text-gray-400">불러오는 중...</div>
    <div v-else-if="!post" class="text-center text-gray-400">게시글이 없습니다.</div>
    <div v-else>
      <h2 class="text-2xl font-bold mb-2">{{ post.title }}</h2>
      <div class="text-sm text-gray-500 mb-4">작성자: {{ post.userid }} | {{ post.createdAt || post.date }}</div>
      <div class="text-base mb-4 whitespace-pre-line">{{ post.content }}</div>
      <div v-if="post.filepath" class="mb-4">
        <a :href="`/api/board/download/${post.board_id}`" target="_blank" class="link text-blue-600">
          {{ post.originalname || '첨부파일 다운로드' }}
        </a>
      </div>
      <div class="flex gap-2 justify-end">
        <router-link to="/board" class="btn btn-outline">목록</router-link>
        <button v-if="isMine" class="btn btn-primary" @click="goEdit">수정</button>
        <button v-if="isMine" class="btn btn-error" @click="deletePost">삭제</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const token = localStorage.getItem('token')

const post = ref(null)
const isLoading = ref(false)
const error = ref('')

const fetchPost = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await axios.get(`/api/board/${route.params.id}`)
    post.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || '게시글을 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPost)

const isMine = computed(() => auth.user && post.value && auth.user.userid === post.value.userid)

function goEdit() {
  router.push(`/board/edit/${post.value.board_id}`)
}

async function deletePost() {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    await axios.delete(`/api/board/${post.value.board_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    alert('삭제되었습니다.')
    router.push('/board')
  } catch (err) {
    alert(err.response?.data?.message || '삭제에 실패했습니다.')
  }
}
</script>

<style scoped lang="scss">
</style> 
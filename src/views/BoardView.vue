<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">게시판</h2>

    <!-- 글쓰기 버튼 -->
    <div class="mb-6 text-right">
      <router-link to="/board/write" class="btn btn-primary">글쓰기</router-link>
    </div>

    <!-- 게시글 목록 -->
    <div v-if="isLoading" class="text-center text-gray-400">불러오는 중...</div>
    <div v-else-if="posts.length === 0" class="text-center text-gray-400">게시글이 없습니다.</div>
    <div v-else class="space-y-4">
      <div v-for="(post, idx) in posts" :key="post.board_id || idx" class="bg-base-100 p-4 rounded shadow">
        <div class="font-bold text-lg mb-1">{{ post.title }}</div>
        <div class="text-sm text-gray-500 mb-2">작성자: {{ post.userid }} | {{ post.created_at || post.date }}</div>
        <div class="text-base mb-2">{{ post.content }}</div>
        <div v-if="post.filepath">
          <a :href="`/api/board/download/${post.board_id}`" target="_blank" class="link text-blue-600">
            {{ post.originalname || '첨부파일 다운로드' }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const posts = ref([])
const isLoading = ref(false)
const error = ref('')

const fetchPosts = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await axios.get('/api/board')
    posts.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || '게시글을 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPosts)
</script>

<style scoped lang="scss">
</style> 
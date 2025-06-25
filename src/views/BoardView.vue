<template>
  <div class="max-w-2xl mx-auto p-6">

    <!-- 글쓰기 버튼 -->
    <div class="mb-6 text-right">
      <router-link to="/board/write" class="btn btn-primary">글쓰기</router-link>
    </div>

    <!-- 게시글 목록 -->
    <div v-if="isLoading" class="text-center text-gray-400">불러오는 중...</div>
    <div v-else-if="paginatedPosts.length === 0" class="text-center text-gray-400">게시글이 없습니다.</div>
    <div v-else class="space-y-4">
      <div v-for="(post, idx) in paginatedPosts" :key="post.board_id || idx" class="bg-base-100 p-4 rounded shadow">
        <div class="font-bold text-lg mb-1">{{ post.board_id }}. {{ post.title }}</div>
        <div class="text-sm text-gray-500 mb-2">by {{ post.userid }} | {{ post.createdAt || post.date }}</div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
      <button class="btn btn-xs" :disabled="currentPage === 1" @click="goToPage(1)">처음</button>
      <button class="btn btn-xs" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">이전</button>
      <span v-for="page in limitedPages" :key="page">
        <button class="btn btn-xs" :class="{ 'btn-primary': page === currentPage }" @click="goToPage(page)">{{ page }}</button>
      </span>
      <button class="btn btn-xs" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">다음</button>
      <button class="btn btn-xs" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">끝</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const posts = ref([])
const isLoading = ref(false)
const error = ref('')
const currentPage = ref(1)
const pageSize = 10

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

const totalPages = computed(() => Math.ceil(posts.value.length / pageSize))
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return posts.value.slice(start, start + pageSize)
})

const limitedPages = computed(() => {
  const pages = []
  const maxVisible = 7
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = start + maxVisible - 1
  if (end > totalPages.value) {
    end = totalPages.value
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
</script>

<style scoped lang="scss">
</style> 
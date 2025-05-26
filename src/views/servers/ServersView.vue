<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const servers = ref([])
const isLoading = ref(false)
const error = ref(null)

const currentPage = ref(1)
const pageSize = 10

// 서버 호출
const fetchServers = async () => {
  isLoading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/servers')
    servers.value = res.data
  } catch (err) {
    error.value = '서버 목록을 불러오는 중 오류가 발생했습니다.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchServers)

// 페이지 계산
const totalPages = computed(() => Math.ceil(servers.value.length / pageSize))

const paginatedServers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return servers.value.slice(start, start + pageSize)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
</script>

<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">서버 목록</h2>

    <div v-if="isLoading" class="text-gray-500 mb-2">로딩 중...</div>
    <div v-if="error" class="text-red-500 mb-2">{{ error }}</div>

    <!-- 반응형 테이블: 가로 스크롤 허용 -->
    <div class="overflow-x-auto rounded-xl border border-base-200">
      <table class="table table-compact w-full text-sm">
        <thead class="bg-base-200 text-base-content">
          <tr>
            <th class="px-3 py-1 whitespace-nowrap">IP</th>
            <th class="px-3 py-1 whitespace-nowrap">이름</th>
            <th class="px-3 py-1 whitespace-nowrap">용도</th>
            <th class="px-3 py-1 whitespace-nowrap">환경</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedServers.length === 0 && !isLoading">
            <td colspan="4" class="text-center text-gray-400 py-4">데이터가 없습니다</td>
          </tr>
          <tr
            v-for="s in paginatedServers"
            :key="s.server_ip"
            class="hover:bg-base-100 border-t"
          >
            <td class="px-3 py-1 whitespace-nowrap">{{ s.server_ip }}</td>
            <td class="px-3 py-1">{{ s.title }}</td>
            <td class="px-3 py-1">{{ s.usage_type }}</td>
            <td class="px-3 py-1">{{ s.env_type }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="flex justify-center mt-4 flex-wrap gap-2">
      <button class="btn btn-sm" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">이전</button>
      <button
        v-for="page in totalPages"
        :key="page"
        class="btn btn-sm"
        :class="{ 'btn-primary': page === currentPage, 'btn-outline': page !== currentPage }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button class="btn btn-sm" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">다음</button>
    </div>
  </div>
</template>

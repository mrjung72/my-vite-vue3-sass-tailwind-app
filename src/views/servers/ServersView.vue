<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const servers = ref([])
const isLoading = ref(false)
const error = ref(null)

const filter = ref({
  search: '',
  usage_type: '',
  env_type: '',
  corp_id: '',
  proc_type: '',
  server_type: '',
  role_type: '',
  status_cd: '',
})

const fetchServers = async () => {
  isLoading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/servers')
    servers.value = res.data
  } catch (err) {
    error.value = '서버 목록을 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}
onMounted(fetchServers)

const filteredServers = computed(() => {
  return servers.value.filter(s => {
    return (
      (!filter.value.search ||
        s.server_ip?.includes(filter.value.search) ||
        s.title?.includes(filter.value.search)) &&
      (!filter.value.usage_type || s.usage_type === filter.value.usage_type) &&
      (!filter.value.env_type || s.env_type === filter.value.env_type) &&
      (!filter.value.corp_id || s.corp_id === filter.value.corp_id) &&
      (!filter.value.proc_type || s.proc_type === filter.value.proc_type) &&
      (!filter.value.server_type || s.server_type === filter.value.server_type) &&
      (!filter.value.role_type || s.role_type === filter.value.role_type) &&
      (!filter.value.status_cd || s.status_cd === filter.value.status_cd)
    )
  })
})

const currentPage = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.ceil(filteredServers.value.length / pageSize))
const paginatedServers = computed(() =>
  filteredServers.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)
const goToPage = page => (currentPage.value = page)
</script>

<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">서버 목록</h2>

    <!-- 🔍 검색 필터 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
    <!-- IP/이름 통합 검색 -->
      <input
        v-model="filter.search"
        type="text"
        placeholder="IP 또는 이름"
        class="input input-sm input-bordered w-full md:w-60"
      />

      <select v-model="filter.usage_type" class="select select-sm select-bordered w-full">
        <option value="">용도 선택</option>
        <option value="DEV">DEV</option>
        <option value="QA">QA</option>
        <option value="PROD">PROD</option>
      </select>

      <select v-model="filter.env_type" class="select select-sm select-bordered w-full">
        <option value="">환경 선택</option>
        <option value="INT">INT</option>
        <option value="STG">STG</option>
        <option value="REAL">REAL</option>
      </select>

      <select v-model="filter.corp_id" class="select select-sm select-bordered w-full">
        <option value="">법인 선택</option>
        <option value="corp1">corp1</option>
        <option value="corp2">corp2</option>
      </select>

      <select v-model="filter.proc_type" class="select select-sm select-bordered w-full">
        <option value="">공정 선택</option>
        <option value="MOLD">MOLD</option>
        <option value="CNC">CNC</option>
      </select>

      <select v-model="filter.server_type" class="select select-sm select-bordered w-full">
        <option value="">서버타입 선택</option>
        <option value="WINDOW">WINDOW</option>
        <option value="LINUX">LINUX</option>
        <option value="UNIX">UNIX</option>
      </select>

      <select v-model="filter.role_type" class="select select-sm select-bordered w-full">
        <option value="">역할 선택</option>
        <option value="vip">VIP</option>
        <option value="active">Active</option>
        <option value="standby">Standby</option>
        <option value="async">Async</option>
      </select>

      <select v-model="filter.status_cd" class="select select-sm select-bordered w-full">
        <option value="">상태 선택</option>
        <option value="Y">사용</option>
        <option value="N">미사용</option>
      </select>
    </div>

    <!-- ✅ 테이블 -->
    <div class="overflow-x-auto border rounded-xl">
      <table class="table table-compact w-full text-sm">
        <thead class="bg-base-200 text-base-content">
          <tr>
            <th>IP</th><th>이름</th><th>용도</th><th>환경</th><th>법인</th>
            <th>공정</th><th>서버타입</th><th>OS버전</th><th>역할</th><th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedServers.length === 0 && !isLoading">
            <td colspan="10" class="text-center text-gray-400 py-4">검색 결과가 없습니다</td>
          </tr>
          <tr v-for="s in paginatedServers" :key="s.server_ip">
            <td>{{ s.server_ip }}</td>
            <td>{{ s.title }}</td>
            <td>{{ s.usage_type }}</td>
            <td>{{ s.env_type }}</td>
            <td>{{ s.corp_id }}</td>
            <td>{{ s.proc_type }}</td>
            <td>{{ s.server_type }}</td>
            <td>{{ s.os_version }}</td>
            <td>{{ s.role_type }}</td>
            <td>
              <span :class="s.status_cd === 'Y' ? 'text-green-600' : 'text-red-500'">
                {{ s.status_cd === 'Y' ? '사용' : '미사용' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="flex justify-center mt-4 gap-2 flex-wrap">
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

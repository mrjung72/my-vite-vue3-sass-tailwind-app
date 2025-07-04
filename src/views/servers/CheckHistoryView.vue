<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">서버 접속 상태체크 이력</h1>
      <p class="text-gray-600">현재 PC에서 수행한 서버 접속 상태체크 이력을 조회합니다.</p>
    </div>

    <!-- 필터 및 검색 영역 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">서버 IP</label>
          <input 
            v-model="filters.serverIp" 
            type="text" 
            placeholder="서버 IP 검색"
            class="input input-bordered w-full"
            @input="filterData"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">포트</label>
          <input 
            v-model="filters.port" 
            type="text" 
            placeholder="포트 검색"
            class="input input-bordered w-full"
            @input="filterData"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">결과</label>
          <select 
            v-model="filters.result" 
            class="select select-bordered w-full"
            @change="filterData"
          >
            <option value="">전체</option>
            <option value="success">성공</option>
            <option value="error">실패</option>
            <option value="timeout">타임아웃</option>
          </select>
        </div>
        <div class="flex items-end">
          <button 
            @click="clearFilters" 
            class="btn btn-outline w-full"
          >
            필터 초기화
          </button>
        </div>
      </div>
    </div>

    <!-- 데이터 로딩 상태 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-3 text-gray-600">데이터를 불러오는 중...</span>
    </div>

    <!-- 에러 메시지 -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- 데이터 테이블 -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>번호</th>
              <th>서버 IP</th>
              <th>포트</th>
              <th>결과</th>
              <th>메시지</th>
              <th>소요시간</th>
              <th>체크일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedData" :key="item.id">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>
                <span class="font-mono text-sm">{{ item.server_ip }}</span>
              </td>
              <td>
                <span class="badge badge-outline">{{ item.port }}</span>
              </td>
              <td>
                <span 
                  :class="getStatusBadgeClass(item.check_result)"
                  class="badge"
                >
                  {{ getStatusText(item.check_result) }}
                </span>
              </td>
              <td>
                <span class="text-sm text-gray-600 max-w-xs truncate block" :title="item.check_message">
                  {{ item.check_message || '-' }}
                </span>
              </td>
              <td>
                <span class="text-sm font-mono">
                  {{ item.elapsed_time ? `${item.elapsed_time}ms` : '-' }}
                </span>
              </td>
              <td>
                <span class="text-sm text-gray-500">
                  {{ formatDateTime(item.created_at) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 빈 데이터 메시지 -->
      <div v-if="filteredData.length === 0 && !loading" class="text-center py-12">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-medium">데이터가 없습니다</p>
          <p class="text-sm">서버 접속 상태체크 이력이 없거나 필터 조건에 맞는 데이터가 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="filteredData.length > 0" class="flex justify-between items-center mt-6">
      <div class="text-sm text-gray-600">
        총 {{ filteredData.length }}건 중 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredData.length) }}건 표시
      </div>
      <div class="join">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="join-item btn btn-sm"
        >
          «
        </button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="join-item btn btn-sm"
        >
          ‹
        </button>
        <button 
          v-for="page in visiblePages" 
          :key="page"
          @click="currentPage = page"
          :class="['join-item btn btn-sm', currentPage === page ? 'btn-active' : '']"
        >
          {{ page }}
        </button>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="join-item btn btn-sm"
        >
          ›
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="join-item btn btn-sm"
        >
          »
        </button>
      </div>
    </div>

    <!-- 새로고침 버튼 -->
    <div class="mt-6 text-center">
      <button 
        @click="fetchData" 
        :disabled="loading"
        class="btn btn-primary"
      >
        <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span v-if="loading" class="loading loading-spinner loading-sm mr-2"></span>
        데이터 새로고침
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 상태 관리
const loading = ref(false)
const error = ref(null)
const data = ref([])
const currentPage = ref(1)
const pageSize = ref(20)

// 필터
const filters = ref({
  serverIp: '',
  port: '',
  result: ''
})

// 데이터 가져오기
const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/api/check-server-log/history')
    
    if (response.data.success) {
      data.value = response.data.data
    } else {
      error.value = response.data.error || '데이터를 불러오는데 실패했습니다.'
    }
  } catch (err) {
    console.error('서버 접속 이력 조회 오류:', err)
    error.value = '서버 접속 이력을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// 필터링된 데이터
const filteredData = computed(() => {
  let filtered = [...data.value]
  
  if (filters.value.serverIp) {
    filtered = filtered.filter(item => 
      item.server_ip.toLowerCase().includes(filters.value.serverIp.toLowerCase())
    )
  }
  
  if (filters.value.port) {
    filtered = filtered.filter(item => 
      item.port.toString().includes(filters.value.port)
    )
  }
  
  if (filters.value.result) {
    filtered = filtered.filter(item => 
      item.check_result === filters.value.result
    )
  }
  
  return filtered
})

// 페이지네이션
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 필터 적용
const filterData = () => {
  currentPage.value = 1
}

// 필터 초기화
const clearFilters = () => {
  filters.value = {
    serverIp: '',
    port: '',
    result: ''
  }
  currentPage.value = 1
}

// 상태 배지 클래스
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'success':
      return 'badge-success'
    case 'error':
      return 'badge-error'
    case 'timeout':
      return 'badge-warning'
    default:
      return 'badge-neutral'
  }
}

// 상태 텍스트
const getStatusText = (status) => {
  switch (status) {
    case 'success':
      return '성공'
    case 'error':
      return '실패'
    case 'timeout':
      return '타임아웃'
    default:
      return status || '알 수 없음'
  }
}

// 날짜 포맷팅
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  fetchData()
})
</script> 
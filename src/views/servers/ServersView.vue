<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const isExporting = ref(false)
const token = localStorage.getItem('token') 

const exportToExcel = async () => {

  isExporting.value = true

  try {

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('서버목록')

    worksheet.columns = [
      { header: 'IP', key: 'server_ip', width: 15 },
      { header: '포트', key: 'port', width: 8 },
      { header: '호스트명', key: 'hostname', width: 20 },
      { header: '용도', key: 'usage_type', width: 10 },
      { header: '환경', key: 'env_type', width: 10 },
      { header: '법인', key: 'corp_id', width: 10 },
      { header: '공정', key: 'proc_id', width: 12 },
      { header: '역할', key: 'role_type', width: 12 },
      { header: '상태', key: 'status', width: 10 },
    ]

    // 헤더 행 글꼴 스타일
    worksheet.getRow(1).font = {
      name: '맑은 고딕',
      size: 12,
      bold: true,
    }

    filteredServers.value.forEach(s => {
      const row = worksheet.addRow({
        server_ip: s.server_ip,
        port: s.port,
        hostname: s.hostname,
        usage_type: s.usage_type,
        env_type: s.env_type,
        corp_id: s.corp_id,
        proc_id: s.proc_id,
        role_type: s.role_type,
        status: s.status_cd === 'Y' ? '사용' : '미사용',
      })
      // 각 데이터 행 글꼴 스타일 적용 (선택사항)
      row.font = {
        name: '맑은 고딕',
        size: 11,
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `서버목록_${new Date().toISOString().slice(0, 10)}.xlsx`)
    isExporting.value = false   

  } catch (error) {
    isExporting.value = false
  }
}

const codeGroups = {
  cd_corp_ids: 'CORP_IDS',
  cd_proc_ids: 'PROC_IDS',
  cd_usage_type: 'SERVER_USAGE_TYPE',
  cd_env_type: 'SERVER_ENV_TYPE',
  cd_role_type: 'SERVER_ROLE_TYPE',
}

const codeOptions = ref({
  cd_corp_ids: [{code:'KR',label:'한국'}, {code:'US',label:'미국'}, {code:'UK',label:'영국'}],
  cd_proc_ids: [{code:'BOXING', label:'포장'}, {code:'DESIGN', label:'설계'}, {code:'PRODUCTION', label:'생산'}, {code:'MOLDING', label:'금형'}, {code:'PAINTING', label:'도색'}],
  cd_usage_type: [{code:'DB',label:'DB'}, {code:'APP',label:'APP'}],
  cd_env_type: [{code:'PROD',label:'운영'}, {code:'QAS',label:'실전'}, {code:'DEV',label:'개발'}],
  cd_role_type: [{code:'VIP', label:'VIP'},{code:'Active', label:'Active'},{code:'Standby', label:'Standby'},{code:'async', label:'Async'}],
  cd_stat_yn: [{code:'Y',label:'사용'}, {code:'N',label:'미사용'}]
})

const fetchCodeOptions = async () => {
  try {
    for (const key in codeGroups) {
      const groupCode = codeGroups[key]
      const res = await axios.get(`/api/common-codes/${groupCode}`)
      codeOptions.value[key] = res.data
    }
  } catch (err) {
    console.error('공통코드 로딩 오류', err)
  }
}


const servers = ref([])
const isLoading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.ceil(filteredServers.value.length / pageSize))
const paginatedServers = computed(() =>
  filteredServers.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)
const goToPage = page => (currentPage.value = page)

const filter = ref({
  search: '',
  usage_type: '',
  env_type: '',
  corp_id: '',
  proc_id: '',
  role_type: '',
  status_cd: 'Y',
})

const fetchServers = async () => {
  isLoading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/servers', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    servers.value = res.data
  } catch (err) {
    error.value = '서버 목록을 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // fetchCodeOptions()
  fetchServers()
})


watch(
  filter,
  () => {
    if (currentPage.value !== null) {
      currentPage.value = 1
    }
  },
  { deep: true }
)

const filteredServers = computed(() => {
  return servers.value.filter(s => {
    return (
      (!filter.value.search ||
        s.server_ip?.includes(filter.value.search) ||
        s.hostname?.toLowerCase().includes(filter.value.search.toLowerCase())) &&
      (!filter.value.usage_type || s.usage_type === filter.value.usage_type) &&
      (!filter.value.env_type || s.env_type === filter.value.env_type) &&
      (!filter.value.corp_id || s.corp_id === filter.value.corp_id) &&
      (!filter.value.proc_id || s.proc_id === filter.value.proc_id) &&
      (!filter.value.role_type || s.role_type === filter.value.role_type) &&
      (!filter.value.status_cd || s.status_cd === filter.value.status_cd)
    )
  })
})

</script>

<template>
  <div class="p-4">

    <!-- 🔍 검색 필터 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">

      <select v-model="filter.corp_id" class="select select-sm select-bordered w-full">
        <option value="">법인 선택</option>
        <option v-for="item in codeOptions.cd_corp_ids" :key="item.code" :value="item.code">
          {{ item.label }}
        </option>
      </select>

      <select v-model="filter.proc_id" class="select select-sm select-bordered w-full">
        <option value="">공정 선택</option>
        <option v-for="item in codeOptions.cd_proc_ids" :key="item.code" :value="item.code">
          {{ item.label }}
        </option>
      </select>

      <select v-model="filter.usage_type" class="select select-sm select-bordered w-full">
        <option value="">용도 선택</option>
        <option v-for="item in codeOptions.cd_usage_type" :key="item.code" :value="item.code">
          {{ item.label }}
        </option>
      </select>

      <select v-model="filter.env_type" class="select select-sm select-bordered w-full">
        <option value="">환경 선택</option>
        <option v-for="item in codeOptions.cd_env_type" :key="item.code" :value="item.code">
          {{ item.label }}
        </option>
      </select>

      <select v-model="filter.role_type" class="select select-sm select-bordered w-full">
        <option value="">역할 선택</option>
        <option v-for="item in codeOptions.cd_role_type" :key="item.code" :value="item.code">
          {{ item.label }}
        </option>
      </select>

      <select v-model="filter.status_cd" class="select select-sm select-bordered w-full">
        <option v-for="item in codeOptions.cd_stat_yn" :key="item.code" :value="item.code">
          {{ item.label }}
        </option>
      </select>

    <!-- IP/이름 통합 검색 -->
      <input
        v-model="filter.search"
        type="text"
        placeholder="IP 또는 호스트명 검색"
        class="input input-sm input-bordered w-full md:w-60"
      />
    </div>

    <div class="flex justify-end mb-2">
      <button class="btn btn-sm btn-outline btn-success" @click="exportToExcel" :disabled="isExporting">
        {{ isExporting ? '다운로드 중...' : '📥 엑셀 다운로드' }}
      </button>      
    </div>

    <!-- ✅ 테이블 -->
    <div class="overflow-x-auto border rounded-xl">
      <table class="table table-compact w-full text-sm">
        <thead class="bg-base-200 text-base-content">
          <tr>
            <th>IP</th><th>포트</th><th>호스트명</th><th>용도</th><th>환경</th><th>법인</th>
            <th>공정</th><th>역할</th><th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedServers.length === 0 && !isLoading">
            <td colspan="10" class="text-center text-gray-400 py-4">검색 결과가 없습니다</td>
          </tr>
          <tr v-for="s in paginatedServers" :key="s.server_port_id">
            <td>{{ s.server_ip }}</td>
            <td>{{ s.port }}</td>
            <td>{{ s.hostname }}</td>
            <td>{{ s.usage_type }}</td>
            <td>{{ s.env_type }}</td>
            <td>{{ s.corp_id }}</td>
            <td>{{ s.proc_id }}</td>
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
    <!-- ✅ 건수 표시 추가 -->
    <div class="mb-2 text-base font-medium text-gray-600">
      총 {{ filteredServers.length.toLocaleString() }}건이 검색 되었습니다.
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

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

// 선택된 서버 리스트
const selectedServers = ref([])


const codeGroups = {
  cd_corp_ids: 'CORP_IDS',
  cd_proc_ids: 'PROC_IDS',
  cd_usage_type: 'SERVER_USAGE_TYPE',
  cd_env_type: 'SERVER_ENV_TYPE',
  cd_role_type: 'SERVER_ROLE_TYPE',
  cd_stat_yn: 'USE_YN'
}

const codeOptions = ref({
  cd_corp_ids: [],
  cd_proc_ids: [],
  cd_usage_type: [],
  cd_env_type: [],
  cd_role_type: [],
  cd_stat_yn: []
})

const codeNames = ref({
  cd_corp_ids: [],
  cd_proc_ids: [],
  cd_usage_type: [],
  cd_env_type: [],
  cd_role_type: [],
  cd_stat_yn: []
})

const fetchCodeOptions = async () => {
  try {
    for (const key in codeGroups) {
      const groupCode = codeGroups[key]
      const res = await axios.get(`/api/code/${groupCode}`)

      if (Array.isArray(res.data)) {
        codeOptions.value[key] = res.data
        codeNames.value[key] = res.data.reduce((acc, { code, label }) => {
          acc[code] = label
          return acc
        }, {})
      } else {
        console.warn(`공통코드 그룹 ${groupCode} 응답 형식이 잘못되었습니다.`, res.data)
        codeOptions.value[key] = []
        codeNames.value[key] = {}
      }
      
    }
  } catch (err) {
    console.error('공통코드 로딩 오류', err)
  }
}


// 전체 선택 여부 계산
const allSelected = computed(() =>
  paginatedServers.value.length > 0 &&
  paginatedServers.value.every(s => selectedServers.value.includes(s))
)

// 전체 선택/해제
const toggleAll = () => {
  if (allSelected.value) {
    selectedServers.value = []
  } else {
    selectedServers.value = [...paginatedServers.value]
  }
}


const checkedResults = ref({}) // key: server_ip

async function checkSelectedServerStatus() {

  const checks = selectedServers.value.map(async (server) => {

    try {

      const key = `${server.server_ip}:${server.port}`
      checkedResults.value[key] = {data:{status:'checking'}}

      const { data } = await axios.post(`/api/server-check/telnet-single`, {
        ip: server.server_ip,
        port: server.port,
      })
      checkedResults.value[key] = {data}

    } catch (error) {
      checkedResults.value[key] = {
        error: error.message,
      }
    }
  })
  await Promise.all(checks)
}


const telnetStatuses = ref({})

const checkTelnet = async (ip, port) => {
  telnetStatuses.value[`${ip}:${port}`] = 'checking'
  try {
    const res = await axios.post('/api/server-check/telnet-single', { ip, port })
    telnetStatuses.value[`${ip}:${port}`] = res.data.status
  } catch (err) {
    telnetStatuses.value[`${ip}:${port}`] = 'error'
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

    error.value = `서버 목록을 불러오는 중 오류가 발생했습니다. ${err.message}`
    console.error(err)
    if (err.status && err.status === 443) {
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)      
      return
    }
    
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchCodeOptions()
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
  if (!Array.isArray(servers.value)) return []
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

const limitedPages = computed(() => {
  const pages = []
  const maxVisible = 10
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


    <div class="mb-2 flex items-center justify-between">
      <!-- 왼쪽: 검색 결과 -->
      <div class="text-base text-gray-600 font-bold">
        [총 {{ filteredServers.length.toLocaleString() }}건]
      </div>

      <!-- 오른쪽: 버튼 그룹 -->
      <div class="flex gap-2">
        <button
          class="btn btn-sm btn-outline btn-primary"
          @click="checkSelectedServerStatus"
          :disabled="selectedServers && selectedServers.length === 0"
        >
          선택한 서버 Telnet 확인
        </button>
        <button
          class="btn btn-sm btn-outline btn-success"
          @click="exportToExcel"
          :disabled="isExporting"
        >
          {{ isExporting ? '다운로드 중...' : '📥 엑셀 다운로드' }}
        </button>
      </div>
    </div>

    <!-- ✅ 테이블 -->
    <div class="overflow-x-auto border rounded-xl">
      <table class="table table-compact w-full text-sm">
        <thead class="bg-base-200 text-base-content">
          <tr>
            <th><input type="checkbox" @change="toggleAll" :checked="allSelected" /></th>
            <th>IP</th><th>포트</th><th>호스트명</th><th>용도</th><th>환경</th><th>법인</th>
            <th>공정</th><th>역할</th><th>상태</th><th>Telnet 요청결과</th><th>Multi Telnet 요청결과</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedServers.length === 0 && !isLoading">
            <td colspan="10" class="text-center text-gray-400 py-4">검색 결과가 없습니다</td>
          </tr>
          <tr v-for="s in paginatedServers" :key="s.server_port_id">
            <td>
              <input type="checkbox" v-model="selectedServers" :value="s" />
            </td>            
            <td>{{ s.server_ip }}</td>
            <td>{{ s.port }}</td>
            <td>{{ s.hostname }}</td>
            <td>{{ codeNames.cd_usage_type[s.usage_type] }}</td>
            <td>{{ codeNames.cd_env_type[s.env_type] }}</td>
            <td>{{ codeNames.cd_corp_ids[s.corp_id] }}</td>
            <td>{{ codeNames.cd_proc_ids[s.proc_id] }}</td>
            <td>{{ codeNames.cd_role_type[s.role_type] }}</td>
            <td>{{ codeNames.cd_stat_yn[s.status_cd] }}</td>
            <td>
              <button
                class="btn btn-xs btn-outline"
                @click="checkTelnet(s.server_ip, s.port)"
              >
                Telnet
              </button>
              <span class="ml-2 text-sm">
                <template v-if="telnetStatuses[`${s.server_ip}:${s.port}`] === 'success'">✅ OK</template>
                <template v-else-if="telnetStatuses[`${s.server_ip}:${s.port}`] === 'timeout'">⏳ 타임아웃</template>
                <template v-else-if="telnetStatuses[`${s.server_ip}:${s.port}`] === 'error'">❌ FAIL</template>
                <template v-else-if="telnetStatuses[`${s.server_ip}:${s.port}`] === 'checking'">⌛ Checking...</template>
              </span>
            </td>
            <td>
              <span v-if="checkedResults[`${s.server_ip}:${s.port}`] && checkedResults[`${s.server_ip}:${s.port}`].data.status === 'success'">✅ OK</span>
              <span v-else-if="checkedResults[`${s.server_ip}:${s.port}`] && checkedResults[`${s.server_ip}:${s.port}`].data.status === 'timeout'">⏳ 타임아웃</span>
              <span v-else-if="checkedResults[`${s.server_ip}:${s.port}`] && checkedResults[`${s.server_ip}:${s.port}`].data.status === 'error'">❌ FAIL</span>
              <span v-else-if="checkedResults[`${s.server_ip}:${s.port}`]">⌛ Checking...</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

<!-- 페이지네이션 -->
<div class="flex justify-center mt-4 gap-2 flex-wrap">
  <!-- 첫 페이지로 이동 -->
  <button class="btn btn-sm" :disabled="currentPage === 1" @click="goToPage(1)">
    맨 앞
  </button>

  <!-- 이전 페이지 -->
  <button class="btn btn-sm" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
    이전
  </button>

  <!-- 페이지 번호들 -->
  <button
    v-for="page in limitedPages"
    :key="page"
    class="btn btn-sm"
    :class="{ 'btn-primary': page === currentPage, 'btn-outline': page !== currentPage }"
    @click="goToPage(page)"
  >
    {{ page }}
  </button>

  <!-- 다음 페이지 -->
  <button class="btn btn-sm" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
    다음
  </button>

  <!-- 마지막 페이지로 이동 -->
  <button class="btn btn-sm" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">
    마지막
  </button>
</div>
  </div>
</template>

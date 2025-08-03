<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { useAuthStore } from "@/stores/auth";
import { getCommonCode } from '@/utils/axiosInterceptors'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()  
const isExporting = ref(false)
const token = localStorage.getItem('token') 

// 현재 사용자 IP 가져오기
const currentUserIP = ref('')

// 체크일자/시분초 필터
const dateFilter = ref({
  checkDate: '',
  checkTime: ''
})

// 체크일자/시분초 옵션 (API에서 동적 로딩)
const checkDateOptions = ref([])
const checkTimeOptions = ref([])

// 체크일자 목록 불러오기
const fetchCheckDates = async () => {
  try {
    const res = await axios.get('/api/check-server-log/dates', {
      headers: { Authorization: `Bearer ${token}` },
      params: { check_method: 'TELNET' }
    })
    
    console.log('체크일자 API 응답:', res.data)
    
    if (Array.isArray(res.data)) {
      checkDateOptions.value = res.data.map(date => ({ value: date, label: date }))
    } else if (res.data && Array.isArray(res.data.dates)) {
      checkDateOptions.value = res.data.dates.map(date => ({ value: date, label: date }))
    } else {
      console.warn('체크일자 응답 구조가 예상과 다름:', res.data)
      checkDateOptions.value = []
    }
  } catch (err) {
    console.error('체크일자 로딩 에러:', err)
    checkDateOptions.value = []
  }
}

// 체크시분초 목록 불러오기 (특정 일자)
const fetchCheckTimes = async (yyyymmdd) => {
  if (!yyyymmdd) {
    checkTimeOptions.value = []
    return
  }
  try {
    const res = await axios.get('/api/check-server-log/times', {
      headers: { Authorization: `Bearer ${token}` },
      params: { yyyymmdd, check_method: 'TELNET' }
    })
    
    console.log('체크시간 API 응답:', res.data)
    
    if (Array.isArray(res.data)) {
      checkTimeOptions.value = res.data.map(time => ({ value: time, label: time }))
    } else if (res.data && Array.isArray(res.data.times)) {
      checkTimeOptions.value = res.data.times.map(time => ({ value: time, label: time }))
    } else {
      console.warn('체크시간 응답 구조가 예상과 다름:', res.data)
      checkTimeOptions.value = []
    }
  } catch (err) {
    console.error('체크시간 로딩 에러:', err)
    checkTimeOptions.value = []
  }
}

// 체크일자 변경 시 체크시분초 목록 갱신 및 서버 데이터 재조회
watch(() => dateFilter.value.checkDate, async (newDate, oldDate) => {
  console.log('체크일자 변경됨:', { old: oldDate, new: newDate })
  
  // 체크시간 초기화 (watch 함수 트리거 방지를 위해 임시로 watch 비활성화)
  const oldCheckTime = dateFilter.value.checkTime
  dateFilter.value.checkTime = ''
  
  // 체크시간 목록 갱신
  await fetchCheckTimes(newDate)
  
  // 날짜 변경 시 서버 데이터 재조회
  await fetchServers()
}, { flush: 'post' })

// 체크시간 변경 시 클라이언트 필터링만 수행 (서버 조회 안함)
watch(() => dateFilter.value.checkTime, (newTime, oldTime) => {
  console.log('체크시간 변경됨 (클라이언트 필터링):', { old: oldTime, new: newTime })
  // 시간 변경 시에는 서버 조회 없이 클라이언트에서만 필터링
  // filteredServers computed가 자동으로 재계산됨
})

function getFilterLabelString() {
  const f = filter.value;
  const parts = [];
  if (f.corp_id) parts.push(f.corp_id);
  if (f.proc_id) parts.push(f.proc_id);
  if (f.usage_type) parts.push(f.usage_type);
  if (f.env_type) parts.push(f.env_type);
  return parts.length ? '_' + parts.join('_') : '';
}

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
      })
      // 각 데이터 행 글꼴 스타일 적용 (선택사항)
      row.font = {
        name: '맑은 고딕',
        size: 11,
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const filterStr = getFilterLabelString();
    saveAs(blob, `Telnet체크결과${filterStr}_${new Date().toISOString().slice(0, 10)}.xlsx`)
    isExporting.value = false   

  } catch (error) {
    isExporting.value = false
  }
}

// 선택된 서버 리스트
const selectedServers = ref([])


const codeGroups = {
  cd_corp_ids: 'CORP_IDS',
  cd_proc_ids: 'PROC_GR',
  cd_usage_type: 'SERVER_USAGE_TYPE',
  cd_env_type: 'SERVER_ENV_TYPE',
  cd_role_type: 'SERVER_ROLE_TYPE'
}

const codeOptions = ref({
  cd_corp_ids: [],
  cd_proc_ids: [],
  cd_usage_type: [],
  cd_env_type: [],
  cd_role_type: [],
})

const codeNames = ref({
  cd_corp_ids: [],
  cd_proc_ids: [],
  cd_usage_type: [],
  cd_env_type: [],
  cd_role_type: [],
})

const fetchCodeOptions = async () => {
  try {
    for (const key in codeGroups) {
      const groupCode = codeGroups[key]
      const resData = await getCommonCode(groupCode)
      if (Array.isArray(resData)) {
        codeOptions.value[key] = resData
        codeNames.value[key] = resData.reduce((acc, { code, label }) => {
          acc[code] = label
          return acc
        }, {})
      } else {
        console.warn(`공통코드 그룹 ${groupCode} 응답 형식이 잘못되었습니다.`, resData)
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
})

const fetchServers = async () => {
  isLoading.value = true
  error.value = null
  try {
    // API 호출 파라미터 구성 (날짜만 서버에서 필터링)
    const params = {}
    if (dateFilter.value.checkDate) {
      params.yyyymmdd = dateFilter.value.checkDate
    }
    // 시분초는 클라이언트에서 필터링하므로 서버에 전달하지 않음
    
    console.log('서버 데이터 조회 중...', params)
    
    const res = await axios.get('/api/check-server-log/telnet', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: params
    })
    
    // 응답 데이터 구조 디버깅
    console.log('API 응답 전체:', res.data)
    console.log('응답 데이터 타입:', typeof res.data)
    console.log('응답이 배열인가?', Array.isArray(res.data))

    console.log('res.data.rows:', res.data.rows)
    // servers.value = res.data.rows


    // API 응답 구조에 따른 데이터 처리
    if (Array.isArray(res.data)) {
      servers.value = res.data
    } else if (res.data && Array.isArray(res.data.rows)) {
      servers.value = res.data.rows
      currentUserIP.value = res.data.pc_ip || res.data.userIP || ''
    } else if (res.data && Array.isArray(res.data.servers)) {
      servers.value = res.data.servers
      currentUserIP.value = res.data.pc_ip || res.data.userIP || ''
    } else {
      console.warn('예상하지 못한 API 응답 구조:', res.data)
      servers.value = []
      currentUserIP.value = res.data?.pc_ip || ''
    }
    
    console.log('처리된 서버 데이터 (첫 3개):', servers.value.slice(0, 3))
    console.log('서버 데이터 총 개수:', servers.value.length)
    console.log('현재 사용자 IP:', currentUserIP.value)
    
    // 시간 데이터 형식 확인
    if (servers.value.length > 0) {
      const sample = servers.value[0]
      console.log('서버 데이터 시간 형식 샘플:', {
        yyyymmdd: sample.yyyymmdd,
        hhmmss: sample.hhmmss,
        yyyymmdd_type: typeof sample.yyyymmdd,
        hhmmss_type: typeof sample.hhmmss
      })
    }

  } catch (err) {
    error.value = `서버 목록을 불러오는 중 오류가 발생했습니다. ${err.message}`
    console.error('API 호출 에러:', err)
    console.error('에러 상세:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchCodeOptions()
  fetchServers()
  fetchCheckDates()
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

watch(
  dateFilter,
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
    // 기본 필터 조건들
    const basicFilter = (
      (!filter.value.search ||
        s.server_ip?.includes(filter.value.search) ||
        s.proc_detail?.includes(filter.value.search) ||
        s.hostname?.toLowerCase().includes(filter.value.search.toLowerCase())) &&
      (!filter.value.usage_type || s.usage_type === filter.value.usage_type) &&
      (!filter.value.env_type || s.env_type === filter.value.env_type) &&
      (!filter.value.corp_id || s.corp_id === filter.value.corp_id) &&
      (!filter.value.proc_id || s.proc_id === filter.value.proc_id) &&
      (!filter.value.role_type || s.role_type === filter.value.role_type)
    )

    // 시분초 필터링 (클라이언트에서 처리)
    // 날짜는 서버에서 이미 필터링됨
    const timeFilter = !dateFilter.value.checkTime || s.hhmmss === dateFilter.value.checkTime

    return basicFilter && timeFilter
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
    <!-- 상단 바: 사용자 IP, 체크일자, 체크타임, 안내 -->
    <div class="bg-base-200 p-3 rounded-lg mb-4">
      <div class="flex flex-wrap items-center gap-3 text-sm">
        <span class="font-semibold">PC IP:</span>
        <span class="text-primary font-mono">{{ currentUserIP }}</span>
        <span class="text-gray-500">|</span>
        <!-- 체크일자 선택 -->
        <select 
          v-model="dateFilter.checkDate" 
          class="select select-sm select-bordered"
          :disabled="isLoading"
        >
          <option value="">{{ isLoading ? '로딩 중...' : '체크일자 선택' }}</option>
          <option v-for="date in checkDateOptions" :key="date.value" :value="date.value">
            {{ date.label }}
          </option>
        </select>
        <!-- 체크시분초 선택 -->
        <select 
          v-model="dateFilter.checkTime" 
          class="select select-sm select-bordered"
          :disabled="!dateFilter.checkDate || checkTimeOptions.length === 0"
        >
          <option value="">
            {{ !dateFilter.checkDate ? '먼저 날짜를 선택하세요' : 
               checkTimeOptions.length === 0 ? '시간 목록 없음' : 
               '체크시간 선택 (클라이언트 필터링)' }}
          </option>
          <option v-for="time in checkTimeOptions" :key="time.value" :value="time.value">
            {{ time.label }}
          </option>
        </select>
        <!-- 로딩 상태 표시 -->
        <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
      </div>
    </div>

    <!-- 에러 메시지 표시 -->
    <div v-if="error" class="alert alert-error mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
      <button class="btn btn-sm btn-outline" @click="error = null">닫기</button>
    </div>

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
      <!-- IP/이름 통합 검색 -->
      <input
        v-model="filter.search"
        type="text"
        placeholder="IP 또는 호스트명 또는 세부공정 검색"
        class="input input-sm input-bordered w-full md:w-60"
      />
    </div>


    <div class="mb-2 flex items-center justify-between">
      <!-- 왼쪽: 검색 결과 -->
      <div class="text-base text-gray-600 font-bold">
        <span v-if="isLoading">🔍 검색 중...</span>
        <span v-else>
          [총 {{ filteredServers.length.toLocaleString() }}건]
          <span v-if="dateFilter.checkDate || dateFilter.checkTime" class="text-sm text-blue-600 ml-2">
            (필터: 
            <span v-if="dateFilter.checkDate">📅{{ dateFilter.checkDate }} (DB조회)</span>
            <span v-if="dateFilter.checkTime" class="ml-1">🕐{{ dateFilter.checkTime }} (클라이언트)</span>
            )
          </span>
          <span v-if="servers.length !== filteredServers.length" class="text-sm text-gray-500 ml-2">
            / 해당 날짜 {{ servers.length }}건
          </span>
        </span>
      </div>

      <!-- 오른쪽: 버튼 그룹 -->
      <div class="flex gap-2">
        <button class="btn btn-sm btn-outline" @click="async () => {
          filter.usage_type = ''
          filter.env_type = ''
          filter.corp_id = ''
          filter.proc_id = ''
          filter.role_type = ''
          filter.search = ''
          dateFilter.checkDate = ''
          dateFilter.checkTime = ''
          // 필터 초기화 후 전체 데이터 다시 조회
          await fetchServers()
        }">
          필터 초기화
        </button>
        <button 
          class="btn btn-sm btn-outline btn-info" 
          @click="fetchServers"
          :disabled="isLoading"
        >
          {{ isLoading ? '새로고침 중...' : '🔄 새로고침' }}
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
            <th><input type="checkbox" @change="toggleAll" :checked="allSelected" :disabled="!auth.user?.isAdmin" /></th>
            <th>Telnet Check ID</th>
            <th>법인</th>
            <th>공정</th>
            <th>세부공정</th>
            <th>IP</th>
            <th>포트</th>
            <!-- <th>호스트명</th>  -->
            <th>용도</th>
            <th>환경</th>
            <th>역할</th>
            <th>Check 결과</th>
            <th>에러메세지</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="13" class="text-center text-gray-400 py-4">
              <div class="flex items-center justify-center gap-2">
                <span class="loading loading-spinner loading-sm"></span>
                검색 중...
              </div>
            </td>
          </tr>
          <tr v-else-if="error">
            <td colspan="13" class="text-center text-red-500 py-4">
              <div class="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {{ error }}
                <button class="btn btn-xs btn-outline ml-2" @click="fetchServers()">다시 시도</button>
              </div>
            </td>
          </tr>
          <tr v-else-if="paginatedServers.length === 0">
            <td colspan="13" class="text-center text-gray-400 py-4">
              검색 결과가 없습니다
              <div class="text-xs text-gray-500 mt-1">
                (전체 데이터: {{ servers.length }}건)
              </div>
            </td>
          </tr>
          <tr v-for="s in paginatedServers" :key="s.server_port_id">
            <td>
              <input type="checkbox" v-model="selectedServers" :value="s" :disabled="!auth.user?.isAdmin" />
            </td>            
            <td>{{ s.yyyymmdd }}-{{ s.hhmmss }}</td>
            <td>[{{ s.corp_id }}] {{ codeNames.cd_corp_ids[s.corp_id] }}</td>
            <td>[{{ s.proc_id }}] {{ codeNames.cd_proc_ids[s.proc_id] }}</td>
            <td>{{ s.proc_detail }}</td>
            <td>{{ s.server_ip }}</td>
            <td>{{ s.port }}</td>
            <!-- <td>{{ s.hostname }}</td> -->
            <td>{{ codeNames.cd_usage_type[s.usage_type] }}</td>
            <td>{{ codeNames.cd_env_type[s.env_type] }}</td>
            <td>{{ codeNames.cd_role_type[s.role_type] }}</td>
            <td>{{ s.result_code }}</td>
            <td>[{{ s.error_code }}] {{ s.error_msg }}</td>
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
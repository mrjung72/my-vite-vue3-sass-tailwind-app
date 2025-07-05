<template>
  <div class="p-1 max-w-4xl mx-auto grid gap-1 md:grid-cols-2">
    <div>

      <dialog class="modal" :open="showRegisterModal">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">회원 등록</h3>
          <input v-model="newMember.userid" class="input input-sm input-bordered w-full mb-2" placeholder="사용자 ID" />
          <input v-model="newMember.email" class="input input-sm input-bordered w-full mb-2" placeholder="이메일" />
          <input v-model="newMember.name" class="input input-sm input-bordered w-full mb-2" placeholder="이름" />
          <label class="label cursor-pointer" v-if="auth.isLoggedIn && auth.user.isAdmin">
            <span class="label-text">관리자 여부</span>
            <input type="checkbox" class="toggle" v-model="newMember.isAdmin" />
          </label>
          <div v-else class="text-sm text-neutral-500 mb-2">
            회원 등록 시 관리자 권한은 부여할 수 없습니다.
          </div>
          <div class="modal-action">
            <button class="btn btn-sm btn-secondary" @click="registerMember">등록</button>
            <button class="btn btn-sm" @click="showRegisterModal = false">닫기</button>
          </div>
        </div>
      </dialog>


      <input
        v-model="searchQuery"
        type="text"
        placeholder="아이디 / 이름 또는 이메일로 검색"
        class="input input-sm input-bordered w-full mb-2"
      />

      <label class="label cursor-pointer mb-2">
        <input type="checkbox" v-model="showPendingOnly" class="checkbox checkbox-sm mr-2" />
        <span class="label-text">미승인 회원</span>
      </label>

      <div class="text-sm text-gray-600 mb-2">
        <span v-if="isLoading">🔍 검색 중...</span>
        <span v-else>총 {{ filteredMembers.length }}명</span>
      </div>

      <div class="grid gap-1 mb-2">
        <div v-if="isLoading" class="p-4 text-center text-gray-400">
          <div class="flex items-center justify-center gap-2">
            <span class="loading loading-spinner loading-sm"></span>
            검색 중...
          </div>
        </div>
        <div
          v-else
          v-for="member in paginatedMembers"
          :key="member.userid"
          class="p-1 bg-base-100 shadow-sm rounded text-sm cursor-pointer hover:bg-base-200"
          :class="{ 'bg-primary text-primary-content': selected && selected.userid === member.userid }"
          @click="selectMember(member)"
        >
          {{ member.name }} <span class="text-neutral-500">({{ member.email }})</span>
          {{ member.isAdmin ? '(관리자)' : '' }}
        </div>
      </div>

      <div class="flex justify-center items-center gap-2 mt-2 text-sm">
        <button class="btn btn-xs" :disabled="currentPage === 1" @click="currentPage--">이전</button>
        <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-xs" :disabled="currentPage === totalPages" @click="currentPage++">다음</button>
      </div>

      <div v-if="auth.isLoggedIn && auth.user.isAdmin && auth.user.userid=='admin'" class="flex gap-2 mt-4">
        <button class="btn btn-sm btn-primary" @click="showRegisterModal = true">회원 등록</button>
      </div>
    </div>


    <div v-if="selected" class="bg-base-100 p-4 rounded shadow text-sm">
      <h3 class="text-lg font-bold mb-2">회원 {{ isEditing ? '수정' : '상세 정보' }}</h3>

      <div v-if="isEditing" class="space-y-2">
        <label class="block">
          사용자ID:
          <input v-model="editForm.userid" class="input input-sm input-bordered w-full mb-2" :readonly="true" />
        </label>
        <label class="block">
          이메일:
          <input v-model="editForm.email" class="input input-sm input-bordered w-full mt-1" :readonly="true" />
        </label>
        <label class="block">
          이름:
          <input v-model="editForm.name" class="input input-sm input-bordered w-full mt-1" />
        </label>
          <label class="block">
          <input type="checkbox" v-model="editForm.isAdmin"
                 class="checkbox checkbox-sm mr-2"
                 :disabled="!(auth.isLoggedIn && auth.user.isAdmin)" /> 관리자 여부
        </label>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-sm btn-primary" @click="saveEdit">저장</button>
          <button class="btn btn-sm btn-outline" @click="cancelEdit">취소</button>
        </div>
      </div>

      <div v-else>
        <p><strong>사용자ID:</strong> {{ selected.userid }}</p>
        <p><strong>이메일:</strong> {{ selected.email }}</p>
        <p><strong>이름:</strong> {{ selected.name }}</p>
        <p><strong>상태:</strong> {{ statusCode[selected.status_cd] }}</p>
        <p><strong>가입일:</strong> {{ selected.createdAt }}</p>
        <p><strong>관리자:</strong> {{ selected.isAdmin ? '예' : '아니오' }}</p>

        <div v-if="selected && !selected.isAdmin && auth.isLoggedIn && (auth.user.userid === selected.userid || auth.user.isAdmin)" class="flex gap-2 mt-4">
          <button class="btn btn-sm btn-outline" @click="startEdit">수정</button>
          <button class="btn btn-sm btn-outline" @click="initPassword">비밀번호 초기화</button>
          <button v-if="selected.status_cd === 'A'" class="btn btn-sm btn-success" @click="aproveMember">승인 처리</button>
          <button class="btn btn-sm btn-error" @click="deleteMember">삭제</button>
          <button class="btn btn-sm btn-outline" @click="selected = null">닫기</button>
        </div>
        <div v-else class="flex gap-2 mt-4">
          <button class="btn btn-sm btn-outline" @click="selected = null">닫기</button>
        </div>
      </div>
    </div>
    </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from "@/stores/auth";
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore() // Pinia 스토어에서 인증 상태 가져오기
const router = useRouter()  
const route = useRoute()

const members = ref([])
const currentPage = ref(1)
const pageSize = 10
const selected = ref(null)
const isEditing = ref(false)
const editForm = ref({ name: '', email: '', isAdmin: false, userid: '' })
const searchQuery = ref('')
const isLoading = ref(false)
const token = localStorage.getItem('token') 
const showPendingOnly = ref(false)

const statusCode = {Y:'정상회원', A:'승인대기', N:'탈퇴회원'}

// ✅ 서버에서 회원 목록 가져오기
const fetchMembers = async () => {

  try {
    const res = await axios.get('/api/members', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (res.status !== 200) {
      throw new Error('회원 목록 로딩 실패')
    }
    members.value = res.data
  } catch (err) {
    console.error('회원 목록 로딩 실패:', err)  
    if (err.status && err.status === 443) {
      auth.logout()
      router.push({ name: 'login' })
      return
    }
  }
}

// ✅ 컴포넌트가 마운트되면 회원 목록 요청
onMounted(() => {
  fetchMembers()
  if (route.query.pending === '1' || route.query.pending === 1) {
    showPendingOnly.value = true
  }
})

// ✅ 검색 후 페이지 1로
watch(searchQuery, () => {
  currentPage.value = 1
  isLoading.value = true
  // 검색 처리를 위한 짧은 지연
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

// ✅ 검색 + 페이지네이션
const filteredMembers = computed(() => {
  let arr = members.value
  if (showPendingOnly.value) arr = arr.filter(m => m.status_cd === 'A')
  if (!searchQuery.value) return arr
  return arr.filter(m =>
    m.userid?.includes(searchQuery.value) || m.name?.includes(searchQuery.value) || m.email?.includes(searchQuery.value)
  )
})

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / pageSize))

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMembers.value.slice(start, start + pageSize)
})

function selectMember(member) {
  selected.value = { ...member }
  isEditing.value = false
}

function startEdit() {
  isEditing.value = true
  editForm.value = {
    name: selected.value.name,
    email: selected.value.email,
    isAdmin: selected.value.isAdmin,
    userid: selected.value.userid || (selected.value.email ? selected.value.email.split('@')[0] : '')
  }
}


function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  if (!editForm.value.name || !editForm.value.email) {
    alert('이름과 이메일을 모두 입력해주세요.')
    return
  }

  try {
    const memberToUpdate = {
      name: editForm.value.name,
      email: editForm.value.email,
      isAdmin: (auth.isLoggedIn && auth.user.isAdmin) ? editForm.value.isAdmin : selected.value.isAdmin,
      userid: editForm.value.userid
    };

    await axios.put(`/api/members/${selected.value.userid}`, memberToUpdate, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    await fetchMembers()
    selected.value = { ...selected.value, ...memberToUpdate }
    isEditing.value = false
    alert('회원 정보가 수정되었습니다.')
  } catch (err) {
    const errorMessage = err.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
    alert(`수정 실패: ${errorMessage}`);
    console.error(err);
  }
}

async function aproveMember() {
  if (!confirm('승인 처리하시겠습니까?\n승인 완료 시 해당 회원에게 이메일 알림이 전송됩니다.')) return

  try {
    const res = await axios.get('/api/members/approval', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { userid: selected.value.userid },
    })
    
    await fetchMembers()
    selected.value.status_cd = 'Y'
    
    // 승인 결과 메시지 표시
    if (res.data.emailSent) {
      alert(`회원 승인이 완료되었습니다.\n\n승인된 회원: ${res.data.member.name} (${res.data.member.email})\n이메일 알림이 전송되었습니다.`)
    } else {
      alert(`회원 승인이 완료되었습니다.\n\n승인된 회원: ${res.data.member.name} (${res.data.member.email})`)
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || '승인 처리 중 오류가 발생했습니다.'
    alert(`승인 실패: ${errorMessage}`)
    console.error(err)
  }
}


async function initPassword() {
  if (!confirm('패스워드 초기화 하시겠습니까?')) return

  try {
    const res = await axios.get('/api/members/init-password', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { userid: selected.value.userid },
    })
    console.log(res.data)
    alert(`패스워드를 초기화(${res.data?.message}) 하였습니다.`)
  } catch (err) {
    alert('작업 실패')
    console.error(err)
  }
}


async function deleteMember() {
  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await axios.delete(`/api/members/${selected.value.userid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    selected.value = null
    await fetchMembers()

    // 페이지 비었을 때 이동
    if ((currentPage.value - 1) * pageSize >= filteredMembers.value.length) {
      currentPage.value = Math.max(1, currentPage.value - 1)
    }
  } catch (err) {
    alert('삭제 실패')
    console.error(err)
  }
}


const showRegisterModal = ref(false)
const newMember = ref({
  name: '',
  email: '',
  isAdmin: false,
  // 🌟 userId 필드 추가 🌟
  userid: ''
})


const registerMember = async () => {
  if (!newMember.value.name || !newMember.value.email || !newMember.value.userid) {
    alert('이름, 이메일, 비밀번호, 사용자 ID를 모두 입력해주세요.') // userid 유효성 검사 추가
    return
  }

  try {
    const memberToRegister = {
      userid: newMember.value.userid,
      name: newMember.value.name,
      email: newMember.value.email,
      isAdmin: (auth.isLoggedIn && auth.user.isAdmin) ? newMember.value.isAdmin : false
    };

    await axios.post('/api/members', memberToRegister, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    await fetchMembers()
    showRegisterModal.value = false
    newMember.value = { name: '', email: '', isAdmin: false, userid: '' } 
    alert('회원이 등록되었습니다.')
  } catch (err) {
    const errorMessage = err.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
    alert(`회원 등록 실패: ${errorMessage}`);
    console.error(err);
  }
}

</script>
<template>
  <div class="p-1 max-w-4xl mx-auto grid gap-1 md:grid-cols-2">
    <div>
      <h2 class="text-xl font-semibold mb-1">회원 목록</h2>

      <dialog class="modal" :open="showRegisterModal">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">회원 등록</h3>
          <input v-model="newMember.name" class="input input-sm input-bordered w-full mb-2" placeholder="이름" />
          <input v-model="newMember.email" class="input input-sm input-bordered w-full mb-2" placeholder="이메일" />
          <input v-model="newMember.password" type="password" class="input input-sm input-bordered w-full mb-2" placeholder="비밀번호" />

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
        placeholder="이름 또는 이메일로 검색"
        class="input input-sm input-bordered w-full mb-2"
      />

      <div class="grid gap-1 mb-2">
        <div
          v-for="member in paginatedMembers"
          :key="member.id"
          class="p-1 bg-base-100 shadow-sm rounded text-sm cursor-pointer hover:bg-base-200"
          :class="{ 'bg-primary text-primary-content': selected && selected.id === member.id }"
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

      <div v-if="auth.isLoggedIn && auth.user.isAdmin" class="flex gap-2 mt-4">
        <button class="btn btn-sm btn-primary" @click="showRegisterModal = true">회원 등록</button>
      </div>
    </div>


    <div v-if="selected" class="bg-base-100 p-4 rounded shadow text-sm">
      <h3 class="text-lg font-bold mb-2">회원 {{ isEditing ? '수정' : '상세 정보' }}</h3>

      <div v-if="isEditing" class="space-y-2">
        <label class="block">
          이름:
          <input v-model="editForm.name" class="input input-sm input-bordered w-full mt-1" />
        </label>
        <label class="block">
          이메일:
          <input v-model="editForm.email" class="input input-sm input-bordered w-full mt-1" />
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
        <p><strong>이름:</strong> {{ selected.name }}</p>
        <p><strong>이메일:</strong> {{ selected.email }}</p>
        <p><strong>가입일:</strong> {{ selected.createdAt }}</p>
        <p><strong>관리자:</strong> {{ selected.isAdmin ? '예' : '아니오' }}</p>

        <div v-if="auth.isLoggedIn && auth.user.isAdmin" class="flex gap-2 mt-4">
          <button class="btn btn-sm btn-outline" @click="startEdit">수정</button>
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
const auth = useAuthStore()

const members = ref([])
const currentPage = ref(1)
const pageSize = 10
const selected = ref(null)
const isEditing = ref(false)
const editForm = ref({ name: '', email: '', isAdmin: false })
const searchQuery = ref('')

// ✅ 서버에서 회원 목록 가져오기
const fetchMembers = async () => {
  try {
    const res = await axios.get('/api/members')
    if (res.status !== 200) {
      throw new Error('회원 목록 로딩 실패')
    }
    console.log('회원 목록 로딩 성공:', res.data)
    members.value = res.data
  } catch (err) {
    console.error('회원 목록 로딩 실패:', err)
  }
}

// ✅ 컴포넌트가 마운트되면 회원 목록 요청
onMounted(fetchMembers)

// ✅ 검색 후 페이지 1로
watch(searchQuery, () => {
  currentPage.value = 1
})

// ✅ 검색 + 페이지네이션
const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  return members.value.filter(m =>
    m.name?.includes(searchQuery.value) || m.email?.includes(searchQuery.value)
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
    isAdmin: selected.value.isAdmin
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
    await axios.put(`/api/members/${selected.value.id}`, editForm.value)
    await fetchMembers()
    selected.value = { ...selected.value, ...editForm.value }
    isEditing.value = false
  } catch (err) {
    const errorMessage = err.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
    alert(`수정 실패: ${errorMessage}`);
    console.error(err);  }
  }

async function deleteMember() {
  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await axios.delete(`/api/members/${selected.value.id}`)
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
  password: '',
  isAdmin: false,
})

const registerMember = async () => {
  if (!newMember.value.name || !newMember.value.email || !newMember.value.password) {
    alert('모든 정보를 입력해주세요.')
    return
  }

  try {
    await axios.post('/api/members', newMember.value)
    await fetchMembers()
    showRegisterModal.value = false
    newMember.value = { name: '', email: '', password: '', isAdmin: false }
    alert('회원이 등록되었습니다.')
  } catch (err) {
    alert('회원 등록 실패')
    console.error(err)
  }
}

</script>

<!-- src/views/MyInfo.vue -->
<template>
  <div class="p-6 max-w-xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">내 정보</h2>

    <div v-if="isLoading">불러오는 중...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <div class="bg-base-200 p-3 rounded-lg mb-4">
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold">현재 PC IP:</span>
          <span class="text-primary font-mono">{{ user.current_pc_ip || '정보 없음' }}</span>
        </div>
      </div>
      
      <div class="space-y-3">
        <div class="flex">
          <span class="font-semibold w-24">이름:</span>
          <span>{{ user.name }}</span>
        </div>
        <div class="flex">
          <span class="font-semibold w-24">아이디:</span>
          <span>{{ user.userid }}</span>
        </div>
        <div class="flex">
          <span class="font-semibold w-24">이메일:</span>
          <span>{{ user.email }}</span>
        </div>
        <div class="flex">
          <span class="font-semibold w-24">관리자:</span>
          <span>{{ user.isAdmin ? '✔️ 예' : '❌ 아니오' }}</span>
        </div>
        <div v-if="user.user_pc_ip" class="flex">
          <span class="font-semibold w-24">등록 IP:</span>
          <span class="font-mono text-sm">{{ user.user_pc_ip }}</span>
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button class="btn btn-primary" @click="goToEdit">수정하기</button>
        <button class="btn btn-outline" @click="showPwModal = true">비밀번호 변경</button>
      </div>
    </div>

    <!-- 비밀번호 변경 모달 -->
    <dialog class="modal" :open="showPwModal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">비밀번호 변경</h3>
        <form @submit.prevent="changePassword">
          <input v-model="pwForm.currentPassword" type="password" class="input input-bordered w-full mb-2" placeholder="현재 비밀번호" required />
          <input v-model="pwForm.newPassword" type="password" class="input input-bordered w-full mb-2" placeholder="새 비밀번호" required />
          <input v-model="pwForm.newPassword2" type="password" class="input input-bordered w-full mb-2" placeholder="새 비밀번호 확인" required />
          <div class="modal-action">
            <button class="btn btn-primary" type="submit">변경</button>
            <button class="btn" type="button" @click="closePwModal">닫기</button>
          </div>
        </form>
        <div v-if="pwError" class="text-red-500 mt-2">{{ pwError }}</div>
        <div v-if="pwSuccess" class="text-green-600 mt-2">{{ pwSuccess }}</div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from "@/stores/auth";
const auth = useAuthStore() // Pinia 스토어에서 인증 상태 가져오기

const router = useRouter()
const user = ref({})
const isLoading = ref(false)
const error = ref(null)

const fetchMyInfo = async () => {
  isLoading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('/api/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    user.value = res.data
  } catch (err) {
    console.error(err)
    error.value = '내 정보를 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchMyInfo)

const goToEdit = () => {
  router.push('/myinfoedit')
}

// 비밀번호 변경 관련
const showPwModal = ref(false)
const pwForm = ref({ currentPassword: '', newPassword: '', newPassword2: '' })
const pwError = ref('')
const pwSuccess = ref('')

const closePwModal = () => {
  showPwModal.value = false
  pwForm.value = { currentPassword: '', newPassword: '', newPassword2: '' }
  pwError.value = ''
  pwSuccess.value = ''
}

const changePassword = async () => {
  pwError.value = ''
  pwSuccess.value = ''
  if (!pwForm.value.currentPassword || !pwForm.value.newPassword || !pwForm.value.newPassword2) {
    pwError.value = '모든 항목을 입력하세요.'
    return
  }
  if (pwForm.value.newPassword !== pwForm.value.newPassword2) {
    pwError.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }
  try {
    const token = localStorage.getItem('token')
    const res = await axios.put('/api/me/change-password', {
      currentPassword: pwForm.value.currentPassword,
      newPassword: pwForm.value.newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    pwSuccess.value = '비밀번호가 성공적으로 변경되었습니다.'
    setTimeout(() => {
      closePwModal()
    }, 1200)
  } catch (err) {
    pwError.value = err.response?.data?.message || '비밀번호 변경 실패'
  }
}
</script>

<!-- src/views/MyInfo.vue -->
<template>
  <div class="p-6 max-w-xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">내 정보</h2>

    <div v-if="isLoading">불러오는 중...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <div class="mb-2"><strong>이름:</strong> {{ user.name }}</div>
      <div class="mb-2"><strong>아이디:</strong> {{ user.userid }}</div>
      <div class="mb-2"><strong>이메일:</strong> {{ user.email }}</div>
      <div class="mb-2"><strong>관리자 여부:</strong> {{ user.isAdmin ? '✔️' : '❌' }}</div>

      <button class="btn btn-primary mt-4" @click="goToEdit">수정하기</button>
      <button class="btn btn-outline ml-2 mt-4" @click="showPwModal = true">비밀번호 변경</button>
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

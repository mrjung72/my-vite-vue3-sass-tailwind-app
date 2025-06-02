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
    </div>
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
</script>

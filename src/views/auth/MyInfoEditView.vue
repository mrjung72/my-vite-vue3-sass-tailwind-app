<!-- src/views/EditMyInfo.vue -->
<template>
  <div class="p-6 max-w-xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">내 정보 수정</h2>

    <div v-if="isLoading">불러오는 중...</div>
    <div v-else>
      <!-- PC IP 정보 표시 (읽기 전용) -->
      <div class="bg-base-200 p-3 rounded-lg mb-4">
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold">현재 PC IP:</span>
          <span class="text-primary font-mono">{{ currentPcIp || '정보 없음' }}</span>
        </div>
        <div v-if="registeredPcIp" class="flex items-center gap-2 text-sm mt-1">
          <span class="font-semibold">등록 시 IP:</span>
          <span class="font-mono text-sm">{{ registeredPcIp }}</span>
        </div>
      </div>

      <!-- 수정 가능한 필드들 -->
      <div class="space-y-3">
        <div>
          <label class="label">
            <span class="label-text font-semibold">이름</span>
          </label>
          <input v-model="name" class="input input-bordered w-full" placeholder="이름을 입력하세요" />
        </div>
        
        <div>
          <label class="label">
            <span class="label-text font-semibold">이메일</span>
          </label>
          <input v-model="email" class="input input-bordered w-full" placeholder="이메일을 입력하세요" />
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button class="btn btn-primary" @click="save">저장</button>
        <button class="btn btn-outline" @click="cancel">취소</button>
      </div>

      <div v-if="message" class="text-green-600 mt-3">{{ message }}</div>
      <div v-if="error" class="text-red-600 mt-3">{{ error }}</div>
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
const name = ref('')
const email = ref('')
const currentPcIp = ref('')
const registeredPcIp = ref('')
const isLoading = ref(false)
const message = ref('')
const error = ref('')
const token = localStorage.getItem('token')

const fetchMyInfo = async () => {
  isLoading.value = true
  try {
    const res = await axios.get('/api/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    name.value = res.data.name
    email.value = res.data.email
    currentPcIp.value = res.data.current_pc_ip || ''
    registeredPcIp.value = res.data.user_pc_ip || ''
  } catch (err) {
    error.value = '정보를 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchMyInfo)

const save = async () => {
  error.value = ''
  try {

    await axios.put('/api/me', { 
      name: name.value, 
      email: email.value 
    }, {  
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    message.value = '정보가 수정되었습니다.'
    setTimeout(() => {
      router.push('/myinfoview')
    }, 300)
  } catch (err) {
    error.value = err.response?.data?.message || '수정에 실패했습니다.'
  }
}

const cancel = () => {
  router.push('/myinfoview')
}
</script>

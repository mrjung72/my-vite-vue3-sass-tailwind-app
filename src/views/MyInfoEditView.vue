<!-- src/views/EditMyInfo.vue -->
<template>
  <div class="p-6 max-w-xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">내 정보 수정</h2>

    <div v-if="isLoading">불러오는 중...</div>
    <div v-else>
      <input v-model="name" class="input input-bordered w-full mb-2" placeholder="이름" />
      <input v-model="email" class="input input-bordered w-full mb-2" placeholder="이메일" />

      <div class="flex gap-2 mt-4">
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
  router.push('/my-info')
}
</script>

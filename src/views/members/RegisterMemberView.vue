<template>
  <div class="flex flex-col items-center mt-10">
    <h2 class="text-2xl font-bold mb-4">회원가입</h2>

    <input v-model="userid" class="input input-bordered mb-2 w-80" placeholder="UserId" />
    <input v-model="email" class="input input-bordered mb-2 w-80" placeholder="Email" />
    <input v-model="name" class="input input-bordered mb-2 w-80" placeholder="Name" />
    <input v-model="password" class="input input-bordered mb-4 w-80" type="password" placeholder="Password" />

    <button class="btn btn-secondary w-80" @click="register" :disabled="loading">
      {{ loading ? '가입 중...' : '가입하기' }}
    </button>

    <div v-if="message" class="text-green-600 mt-4">{{ message }}</div>
    <div v-if="message2" class="text-green-600 mt-4">{{ message2 }}</div>
    <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const userid = ref('')
const email = ref('')
const password = ref('')

const message = ref('')
const message2 = ref('')
const error = ref('')
const loading = ref(false)

const register = async () => {
  message.value = ''
  error.value = ''
  loading.value = true
  try {
    const res = await axios.post('/api/me', {
      name: name.value,
      userid: userid.value,
      email: email.value,
      password: password.value,
    })
    message.value = `회원가입 성공! (사용자 ID: ${res.data.userid})`
    message2.value = `잠시 후 로그인 페이지로 이동합니다.`
    
    setTimeout(() => {
      router.push({ name: 'login' }) // 로그인 후 홈으로 이동
    }, 1000)


  } catch (err) {
    error.value = err.response?.data
  } finally {
    loading.value = false
  }
}
</script>

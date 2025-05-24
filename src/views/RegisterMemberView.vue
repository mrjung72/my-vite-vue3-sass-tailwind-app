<template>
  <div class="flex flex-col items-center mt-10">
    <h2 class="text-2xl font-bold mb-4">회원등록</h2>

    <input v-model="name" class="input input-bordered mb-2 w-80" placeholder="Name" />
    <input v-model="email" class="input input-bordered mb-2 w-80" placeholder="Email" />
    <input v-model="password" class="input input-bordered mb-4 w-80" type="password" placeholder="Password" />

    <label class="flex items-center mb-4">
      <input type="checkbox" v-model="isAdmin" class="checkbox mr-2" />
      <span>관리자 권한</span>
    </label>

    <button class="btn btn-secondary w-80" @click="register" :disabled="loading">
      {{ loading ? '가입 중...' : '가입하기' }}
    </button>

    <div v-if="message" class="text-green-600 mt-4">{{ message }}</div>
    <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const name = ref('')
const email = ref('')
const password = ref('')
const isAdmin = ref(false)

const message = ref('')
const error = ref('')
const loading = ref(false)

const register = async () => {
  message.value = ''
  error.value = ''
  loading.value = true
  try {
    const res = await axios.post('/api/members', {
      name: name.value,
      email: email.value,
      password: password.value,
      isAdmin: isAdmin.value,
    })

    message.value = `회원등록 성공! 사용자 ID: ${res.data.id}`
    name.value = ''
    email.value = ''
    password.value = ''
    isAdmin.value = false
  } catch (err) {
    error.value = err.response?.data?.message || '회원등록 실패'
  } finally {
    loading.value = false
  }
}
</script>

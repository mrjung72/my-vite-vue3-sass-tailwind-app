<template>
  <div class="flex flex-col items-center mt-10">
    <h2 class="text-2xl font-bold mb-4">로그인</h2>
    <input v-model="email" class="input input-bordered mb-2" placeholder="Email" />
    <input v-model="password" class="input input-bordered mb-4" type="password" placeholder="Password" />
    <button class="btn btn-secondary w-80" @click="handleLogin" :disabled="auth.loading">
      {{ auth.loading ? '로그인 중...' : '로그인' }}
    </button>

    <div v-if="auth.message" class="text-green-600 mt-4">{{ auth.message }}</div>
    <div v-if="auth.error" class="text-red-600 mt-4">{{ auth.error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const router = useRouter()
const auth = useAuthStore()

const handleLogin = async () => {
  const success = await auth.login(email.value, password.value)

  console.log('로그인 성공 여부:', success)
  if (success) {

    // 로그인 성공 시, 쿼리 파라미터로 redirect가 있을 경우 해당 경로로 이동
    //next({ name: 'login', query: { redirect: to.fullPath } })
    router.push({ name: 'home' }) // 로그인 후 홈으로 이동
  }
}
</script>

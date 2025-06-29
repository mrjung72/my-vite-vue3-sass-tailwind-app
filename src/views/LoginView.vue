<template>
  <div class="flex flex-col items-center mt-10">
    <h2 class="text-2xl font-bold mb-4">로그인</h2>

    <div class="flex flex-col w-80 items-start mb-2">
      <label class="mb-1">아이디</label>
      <input
        v-model="userid"
        class="input input-bordered w-full"
        placeholder="UserId"
        @keyup.enter="handleLogin"
      />
    </div>

    <div class="flex flex-col w-80 items-start mb-4">
      <label class="mb-1">비밀번호</label>
      <input
        v-model="password"
        class="input input-bordered w-full"
        type="password"
        placeholder="Password"
        @keyup.enter="handleLogin"
      />
    </div>

    <button class="btn btn-secondary w-80" @click="handleLogin" :disabled="auth.loading">
      {{ auth.loading ? '로그인 중...' : '로그인' }}
    </button>

    <div v-if="message" class="text-green-600 mt-4">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const userid = ref('')
const password = ref('')
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const message = ref('')

const handleLogin = async () => {
  const result = await auth.login(userid.value, password.value)
  message.value = result.message

  if (result.isSuccess) {
    // ⬇️ redirect가 있는 경우 해당 주소로, 없으면 홈으로
    const redirectTo = route.query.redirect || '/'
    window.location.href = redirectTo
  }
}
</script>

<template>
  <div class="flex flex-col items-center mt-10">
    <h2 class="text-2xl font-bold mb-4">로그인</h2>
    <input v-model="email" class="input input-bordered mb-2" placeholder="Email" />
    <input v-model="password" class="input input-bordered mb-4" type="password" placeholder="Password" />
    <button class="btn btn-primary" @click="login">로그인</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()

function login() {
  authStore.login(email.value, password.value)
  router.push('/members')
}
</script>

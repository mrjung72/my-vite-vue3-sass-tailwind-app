<template>
  <div class="flex flex-col items-center mt-10">
    <h2 class="text-2xl font-bold mb-4">회원가입</h2>
    <input v-model="name" class="input input-bordered mb-2" placeholder="Name" />
    <input v-model="email" class="input input-bordered mb-2" placeholder="Email" />
    <input v-model="password" class="input input-bordered mb-4" type="password" placeholder="Password" />
    <button class="btn btn-secondary" @click="register">가입하기</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const name = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()

function register() {
  authStore.register({ name: name.value, email: email.value, password: password.value })
  router.push('/login')
}
</script>

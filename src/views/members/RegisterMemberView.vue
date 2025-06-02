<template>
  <div class="flex flex-col items-center mt-10">
    <h2 class="text-2xl font-bold mb-4">회원가입</h2>

    회원ID :
    <input v-model="userid" class="input input-bordered w-80" placeholder="UserId" />
    <div class="text-red-600 text-sm mb-2" v-if="useridError">{{ useridError }}</div>

    이메일 :
    <input v-model="email" class="input input-bordered w-80" placeholder="Email" />
    <div class="text-red-600 text-sm mb-2" v-if="emailError">{{ emailError }}</div>

    이름 :
    <input v-model="name" class="input input-bordered w-80" placeholder="Name" />
    <div class="text-red-600 text-sm mb-2" v-if="nameError">{{ nameError }}</div>

    비밀번호 :
    <input v-model="password" type="password" class="input input-bordered w-80" placeholder="Password" />
    <div class="text-red-600 text-sm mb-4" v-if="passwordError">{{ passwordError }}</div>

    <button class="btn btn-secondary w-80" @click="register" :disabled="loading || !isFormValid">
      {{ loading ? '가입 중...' : '가입하기' }}
    </button>

    <div v-if="message" class="text-green-600 mt-4">{{ message }}</div>
    <div v-if="message2" class="text-green-600 mt-4">{{ message2 }}</div>
    <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const userid = ref('')
const email = ref('')
const password = ref('')

const loading = ref(false)
const message = ref('')
const message2 = ref('')
const error = ref('')

// 실시간 오류 메시지
const useridError = ref('')
const emailError = ref('')
const nameError = ref('')
const passwordError = ref('')

// 유효성 체크 함수
const validateUserId = () => {
  if (!userid.value) {
    useridError.value = 'ID를 입력하세요.'
  } else if (userid.value.includes(' ')) {
    userid.value = userid.value.trim() // 공백 제거
  } else if (!/^[a-zA-Z0-9]+$/.test(userid.value)) {
    useridError.value = '영문자와 숫자만 사용하세요.'
  } else if (userid.value.length < 2 || userid.value.length > 20) {
    useridError.value = '2자 이상 20자 이하로 입력하세요.'
  } else {
    useridError.value = ''
  }
}

const validateEmail = () => {
  if (!email.value) {
    emailError.value = '이메일을 입력하세요.'
  } else if (email.value.includes(' ')) {
    email.value = email.value.trim() // 공백 제거
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
    emailError.value = '유효한 이메일 형식이 아닙니다.'
  } else {
    emailError.value = ''
  }
}

const validateName = () => {
  if (!name.value) {
    nameError.value = '이름을 입력하세요.'
  } else if (name.value.includes(' ')) {
    name.value = name.value.trim() // 공백 제거
  } else if (name.value.length < 2 || name.value.length > 20) {
    nameError.value = '2자 이상 20자 이하로 입력하세요.'
  } else {
    nameError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '비밀번호를 입력하세요.'
  } else if (password.value.includes(' ')) {
    password.value = password.value.trim() // 공백 제거
  } else if (password.value.length < 4 || password.value.length > 8) {
    passwordError.value = '4자 이상 8자 이하로 입력하세요.'
  } else {
    passwordError.value = ''
  }
}

// 실시간 감시
watch(userid, validateUserId)
watch(email, validateEmail)
watch(name, validateName)
watch(password, validatePassword)

// 전체 폼 유효성
const isFormValid = computed(() =>
  !useridError.value &&
  !emailError.value &&
  !nameError.value &&
  !passwordError.value &&
  userid.value &&
  email.value &&
  name.value &&
  password.value
)

const register = async () => {
  loading.value = true
  message.value = ''
  error.value = ''
  message2.value = ''

  try {
    const res = await axios.post('/api/me', {
      userid: userid.value.trim(),
      email: email.value.trim(),
      name: name.value.trim(),
      password: password.value,
    })

    message.value = `회원가입 성공! (ID: ${res.data.userid})`
    message2.value = '잠시 후 로그인 페이지로 이동합니다.'

    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)

  } catch (err) {
    error.value = err.response?.data?.message || '회원가입 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

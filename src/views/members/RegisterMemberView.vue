<template>
  <div class="flex flex-col items-center mt-10">
    <h2 class="text-2xl font-bold mb-4">회원가입</h2>

    <div>회원ID</div>
    <input v-model="userid" class="input input-bordered w-80" placeholder="UserId" />
    <div v-if="userid && useridAvailable" class="text-green-600 text-sm mb-2">사용 가능한 아이디입니다.</div>
    <div v-else-if="!useridAvailable" class="text-red-600 text-sm mb-2" >{{ useridError }}</div>

    <div>이메일</div>
    <input v-model="email" class="input input-bordered w-80" placeholder="Email" />
    <div v-if="email && emailAvailable" class="text-green-600 text-sm mb-2">사용 가능한 이메일입니다.</div>
    <div v-else-if="!emailAvailable" class="text-red-600 text-sm mb-2">{{ emailError }}</div>

    <div>이름</div>
    <input v-model="name" class="input input-bordered w-80" placeholder="Name" />
    <div class="text-red-600 text-sm mb-2" v-if="nameError">{{ nameError }}</div>

    <div>&nbsp;</div>
    <div>비밀번호</div>
    <input v-model="password" class="input input-bordered mb-2 w-80" type="password" placeholder="Password" />
    <div v-if="passwordError" class="text-red-600 text-sm mb-2">{{ passwordError }}</div>
    
    <div>비밀번호 확인</div>
    <input v-model="passwordConfirm" class="input input-bordered w-80" type="password" placeholder="Confirm Password" />
    <div v-if="passwordConfirmError" class="text-red-600 text-sm mb-2">{{ passwordConfirmError }}</div>

    <div>&nbsp;</div>
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
import debounce from 'lodash/debounce'

const router = useRouter()
const name = ref('')
const userid = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

const loading = ref(false)
const message = ref('')
const message2 = ref('')
const error = ref('')

// 실시간 오류 메시지
const useridError = ref('')
const emailError = ref('')
const nameError = ref('')
const passwordError = ref('')
const passwordConfirmError = ref('')
const useridAvailable = ref(false)
const emailAvailable = ref(false) 
const passwordAvailable =  ref(false)

// 유효성 체크 함수
const validateUserId = () => {

  if (!userid.value) {
    useridError.value = 'ID를 입력하세요.'
  } else if (userid.value.toLowerCase().startsWith('adminDDD')) {
    useridError.value = 'admin 으로 시작하는 ID는 사용할 수 없습니다.'
  } else if (userid.value.includes(' ')) {
    userid.value = userid.value.trim() // 공백 제거
  } else if (!/^[a-zA-Z0-9]+$/.test(userid.value)) {
    useridError.value = '영문자와 숫자만 사용하세요.'
  } else if (userid.value.length < 5 || userid.value.length > 20) {
    useridError.value = '5자 이상 20자 이하로 입력하세요.'
  } else {
    useridError.value = ''
    userid.value = userid.value.toLowerCase() // 소문자 적용
    return true
  }

  return false
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
    email.value = email.value.toLowerCase() // 소문자 적용
    return true
  }

  return false
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

const validatePasswords = () => {
  if (!password.value || password.value.length < 4 || password.value.length > 8) {
    passwordError.value = '비밀번호는 4~8자 사이로 입력하세요.'
    passwordAvailable.value = false
    return
  } else {
    passwordError.value = ''
  }

  if (!passwordConfirm.value || passwordConfirm.value !== password.value) {
    passwordConfirmError.value = '비밀번호가 일치하지 않습니다.'
    passwordAvailable.value = false
  } else {
    passwordConfirmError.value = ''
    passwordAvailable.value = true
  }
}

watch([password, passwordConfirm], validatePasswords)


// 중복 검사 (디바운스 처리: 500ms 후 실행)
const checkUserIdDuplicate = debounce(async () => {
  if (!validateUserId()) return


  useridError.value = '중복 체크 중 ....'
  try {
    const res = await axios.get('/api/members/check-id', {
      params: { userid: userid.value },
    })
    useridError.value = ''
    useridAvailable.value = true
  } catch (err) {
    useridError.value = '이미 사용 중인 아이디입니다.'
    useridAvailable.value = false
  }
}, 500)


const checkEmailDuplicate = debounce(async () => {
  if (!validateEmail()) return

  emailError.value = '중복 체크 중 ....'
  try {
    await axios.get('/api/members/check-email', {
      params: { email: email.value },
    })
    emailAvailable.value = true
  } catch (err) {
    emailError.value = '이미 등록된 이메일입니다.'
    emailAvailable.value = false
  }
}, 500)

const validEmail = computed(() =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)
)


watch(userid, () => {
  useridAvailable.value = false
  checkUserIdDuplicate()
})

watch(email, () => {
  emailAvailable.value = false
  checkEmailDuplicate()
})

// 실시간 감시
watch(name, validateName)


const isFormValid = computed(() =>
  userid.value &&
  useridAvailable.value &&
  email.value &&
  emailAvailable.value &&
  name.value &&
  !nameError.value &&
  password.value &&
  passwordConfirm.value &&
  passwordAvailable.value 
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
    }, 3000)

  } catch (err) {
    error.value = err.response?.data || err 
  } finally {
    loading.value = false
  }
}
</script>

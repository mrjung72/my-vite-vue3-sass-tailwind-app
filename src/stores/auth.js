// ✅ Pinia store (src/stores/auth.js)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { computed } from 'vue'


export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const isLoggedIn = computed(() => !!token.value)

  // 초기화 시 localStorage에서 user 정보 복원
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      console.error('user JSON 파싱 실패:', e)
    }
  }

  const login = async (userid, password) => {

    try {
      
      const res = await axios.post('/api/login', { userid, password })

      user.value = res.data.user
      token.value = res.data.token
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  
      return {isSuccess: true, message: res.data.message}

    } catch (error) {
      const errMsg = error.response ? `[${error.response.status}] ${error.response.data.message}` : error.message
      console.error('로그인 실패:', errMsg)
      return {isSuccess: false, message: errMsg}
    }
  }

  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']

  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
  }
})

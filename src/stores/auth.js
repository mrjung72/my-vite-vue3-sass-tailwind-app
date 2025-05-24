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

  const login = async (email, password) => {

    try {
      
      const res = await axios.post('/api/login', { email, password })
  
      user.value = res.data.user
      token.value = res.data.token
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  
      return true

    } catch (error) {
      
      if (error.response) {
        // 서버에서 반환한 에러 메시지
        alert(error.response.data.message)
      } else {
        // 네트워크 에러 등
        alert('로그인 중 오류가 발생했습니다.')
      }
      return false
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

// ✅ Pinia store (src/stores/auth.js)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { computed } from 'vue'
import { useRouter } from 'vue-router'


export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const isLoggedIn = computed(() => !!token.value)
  const router = useRouter()

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

  const logout = (router) => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    if (router) router.push('/')
  }

  // 서버 재시작으로 인한 토큰 초기화 (라우터 이동 없이)
  const clearTokensOnServerRestart = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('lastServerStartTime')
    delete axios.defaults.headers.common['Authorization']
    
    // 캐시된 공통코드도 함께 초기화
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('commonCode_')) {
        localStorage.removeItem(key)
      }
    })
  }

  // 토큰 갱신 시 사용자 정보 업데이트
  const updateToken = (newToken, newUser) => {
    token.value = newToken
    if (newUser) {
      user.value = newUser
      localStorage.setItem('user', JSON.stringify(newUser))
    }
    localStorage.setItem('token', newToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    clearTokensOnServerRestart,
    updateToken,
  }
})

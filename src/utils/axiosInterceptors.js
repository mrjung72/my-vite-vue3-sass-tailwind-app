// src/utils/axiosInterceptors.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router' // router/index.js에서 export default로 router 인스턴스 내보내야 함

export function setupAxiosInterceptors() {
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 443) {
        const auth = useAuthStore()
        auth.logout()
        router.push({ name: 'login' })
        return Promise.reject(error)
      }
      return Promise.reject(error)
    }
  )
}
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

export async function getCommonCode(groupCode) {
  const key = `commonCode_${groupCode}`
  const cache = localStorage.getItem(key)
  const expireKey = `${key}_expire`
  const expire = localStorage.getItem(expireKey)
  const now = Date.now()
  // 1시간(3600000ms) 캐시
  if (cache && expire && now < Number(expire)) {
    return JSON.parse(cache)
  }
  // 서버에서 받아오기
  const res = await axios.get(`/api/code/${groupCode}`)
  localStorage.setItem(key, JSON.stringify(res.data))
  localStorage.setItem(expireKey, now + 3600000)
  return res.data
}
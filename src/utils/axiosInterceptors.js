// src/utils/axiosInterceptors.js
import axios from 'axios'
import router from '@/router' // router/index.js에서 export default로 router 인스턴스 내보내야 함
import { useAuthStore } from '@/stores/auth'

let isRefreshingToken = false
let refreshSubscribers = []

// 토큰 갱신 대기열에 요청 추가
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

// 토큰 갱신 완료 후 대기 중인 요청들 처리
function onRefreshed(token) {
  refreshSubscribers.map(cb => cb(token))
  refreshSubscribers = []
}

export function setupAxiosInterceptors() {
  // 요청 인터셉터 - 모든 요청에 토큰 추가
  axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => Promise.reject(error)
  )

  // 응답 인터셉터 - 토큰 만료 시 자동 갱신 시도
  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config

      if (error.response?.status === 443 && !originalRequest._retry) {
        if (isRefreshingToken) {
          // 이미 토큰 갱신 중이면 대기열에 추가
          return new Promise(resolve => {
            subscribeTokenRefresh(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(axios(originalRequest))
            })
          })
        }

        originalRequest._retry = true
        isRefreshingToken = true

        try {
          // 토큰 갱신 시도
          const refreshResponse = await axios.post('/api/login/refresh-token', {}, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })

          const newToken = refreshResponse.data.token
          const newUser = refreshResponse.data.user
          
          // Auth store 업데이트
          const authStore = useAuthStore()
          authStore.updateToken(newToken, newUser)
          
          // 대기 중인 요청들에 새 토큰 전달
          onRefreshed(newToken)
          
          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axios(originalRequest)

        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃
          console.error('토큰 갱신 실패:', refreshError)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push({ name: 'login' })
          return Promise.reject(refreshError)
        } finally {
          isRefreshingToken = false
        }
      }

      // 다른 에러는 그대로 전달
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
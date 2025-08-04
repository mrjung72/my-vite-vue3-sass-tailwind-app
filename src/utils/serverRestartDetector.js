// src/utils/serverRestartDetector.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

class ServerRestartDetector {
  constructor() {
    this.lastServerStartTime = localStorage.getItem('lastServerStartTime')
    this.checkInterval = 60000 // 1분마다 체크
    this.isChecking = false
    this.isEnabled = import.meta.env.PROD || import.meta.env.VITE_ENABLE_SERVER_RESTART_DETECTION === 'true'
    this.consecutiveFailures = 0
    this.maxConsecutiveFailures = 3
  }

  async checkServerRestart() {
    // 비활성화된 경우 체크하지 않음
    if (!this.isEnabled || this.isChecking) return
    
    this.isChecking = true

    try {
      // 서버 시작 시간을 가져오는 API 호출
      const response = await axios.get('/api/system/server-info', {
        timeout: 5000 // 5초 타임아웃
      })
      
      const currentServerStartTime = response.data.startTime
      
      // API 호출 성공 시 연속 실패 카운트 리셋
      this.consecutiveFailures = 0
      
      // 서버 시작 시간이 변경되었다면 재시작된 것
      if (this.lastServerStartTime && this.lastServerStartTime !== currentServerStartTime) {
        console.log('서버 재시작이 감지되었습니다. 로그인 토큰을 초기화합니다.')
        this.clearAllTokens()
        
        // 사용자에게 알림 (선택적)
        setTimeout(() => {
          const authStore = useAuthStore()
          if (authStore.isLoggedIn && window.confirm('서버가 재시작되어 로그인이 만료되었습니다. 다시 로그인하시겠습니까?')) {
            window.location.href = '/login'
          }
        }, 500)
      }
      
      // 새로운 서버 시작 시간 저장
      this.lastServerStartTime = currentServerStartTime
      localStorage.setItem('lastServerStartTime', currentServerStartTime)
      
    } catch (error) {
      this.consecutiveFailures++
      
      if (this.consecutiveFailures <= this.maxConsecutiveFailures) {
        console.warn(`서버 재시작 체크 실패 (${this.consecutiveFailures}/${this.maxConsecutiveFailures}):`, error.message)
      } else {
        console.warn('서버 재시작 체크가 연속으로 실패하여 모니터링을 일시 중단합니다.')
      }
      
      // 네트워크 에러나 서버 다운 상황에서 토큰을 삭제하지 않음
      // 대신 연속 실패가 많을 경우에만 경고 로그 출력
    } finally {
      this.isChecking = false
    }
  }

  clearAllTokens() {
    const authStore = useAuthStore()
    
    // Auth store의 서버 재시작용 토큰 초기화 메서드 사용
    authStore.clearTokensOnServerRestart()
    
    console.log('모든 로그인 토큰과 사용자 데이터가 초기화되었습니다.')
  }

  startMonitoring() {
    if (!this.isEnabled) {
      console.log('서버 재시작 모니터링이 비활성화되어 있습니다. (개발 환경)')
      return
    }
    
    // 앱 시작 시 즉시 한 번 체크
    this.checkServerRestart()
    
    // 정기적으로 체크
    this.intervalId = setInterval(() => {
      this.checkServerRestart()
    }, this.checkInterval)
    
    console.log(`서버 재시작 모니터링을 시작했습니다. (${this.checkInterval / 1000}초 간격)`)
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('서버 재시작 모니터링을 중지했습니다.')
    }
  }

  // 수동으로 서버 재시작 체크
  async manualCheck() {
    await this.checkServerRestart()
  }
}

export default new ServerRestartDetector()
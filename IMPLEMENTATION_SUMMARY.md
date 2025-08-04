# 웹서버 재기동 시 토큰 초기화 기능 구현 완료

## 🎯 구현 개요
웹서버가 재기동될 때 모든 클라이언트의 로그인 토큰을 자동으로 초기화하는 기능을 구현했습니다.

## ✅ 구현된 기능

### 1. 프론트엔드 (Vue 3 + Pinia)

#### 🔧 서버 재시작 감지기 (`src/utils/serverRestartDetector.js`)
- 1분 간격으로 서버 시작 시간을 체크
- 서버 재시작 감지 시 자동으로 모든 토큰 및 사용자 데이터 초기화
- 프로덕션 환경에서만 기본 활성화 (개발 환경에서는 선택적)
- 연속 실패 시 graceful handling

#### 🗂️ 인증 스토어 개선 (`src/stores/auth.js`)
- `clearTokensOnServerRestart()` 메서드 추가
- 서버 재시작 전용 토큰 초기화 로직
- 캐시된 공통코드 데이터도 함께 정리

#### 🚀 앱 초기화 (`src/main.js`)
- 앱 시작 시 서버 재시작 모니터링 자동 시작
- 1초 지연 후 모니터링 시작으로 안정성 확보

### 2. 백엔드 구현 가이드

#### 📋 제공된 문서
- `BACKEND_SERVER_RECOMMENDATIONS.md`: 상세한 구현 가이드
- 서버 시작 시간 API 예제 코드
- 3가지 토큰 무효화 방법 제시
- 테스트 방법 및 주의사항

#### 🛠️ 필요한 백엔드 API
```
GET /api/system/server-info
응답: { startTime: "2024-01-01T00:00:00.000Z", uptime: 3600, ... }
```

### 3. 개발/테스트 도구

#### 🧪 Mock API (`public/mock-api.js`)
- 백엔드 API 구현 전까지 사용할 수 있는 테스트용 API
- `window.simulateServerRestart()` 함수로 서버 재시작 시뮬레이션

## 🔧 설정 방법

### 개발 환경에서 테스트하기
`.env.development` 파일에 다음 설정 추가:
```env
# 서버 재시작 감지 기능 활성화
VITE_ENABLE_SERVER_RESTART_DETECTION=true
```

### 백엔드 서버 설정
`vite.config.js`에서 프록시 설정 확인:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:4000' // 백엔드 서버 주소
  }
}
```

## 🎮 사용 방법

### 1. 자동 모니터링 (기본)
- 앱 시작 시 자동으로 모니터링 시작
- 프로덕션 환경에서 기본 활성화
- 백그라운드에서 1분마다 체크

### 2. 수동 테스트 (개발 환경)
```javascript
// 브라우저 콘솔에서
window.simulateServerRestart() // 서버 재시작 시뮬레이션
serverRestartDetector.manualCheck() // 수동 체크
```

### 3. 모니터링 제어
```javascript
import serverRestartDetector from '@/utils/serverRestartDetector'

// 모니터링 시작/중지
serverRestartDetector.startMonitoring()
serverRestartDetector.stopMonitoring()
```

## 🔍 동작 과정

1. **서버 시작 시간 체크**: 1분마다 `/api/system/server-info` API 호출
2. **재시작 감지**: 이전 시작 시간과 다를 경우 재시작으로 판단
3. **토큰 초기화**: 
   - localStorage에서 token, user 데이터 삭제
   - Pinia store 초기화
   - axios 기본 헤더에서 Authorization 제거
   - 캐시된 공통코드 데이터 정리
4. **사용자 알림**: 재로그인 안내 팝업 표시
5. **로그인 페이지 이동**: 사용자 동의 시 자동 이동

## ⚠️ 주의사항

### 개발 환경
- Hot reload로 인한 false positive 가능성
- 기본적으로 비활성화됨 (수동 활성화 필요)

### 프로덕션 환경
- 기본적으로 활성화됨
- 네트워크 오류 시 토큰을 삭제하지 않음
- 연속 실패 시에만 경고 로그 출력

### 성능 고려사항
- 1분 간격 체크로 서버 부하 최소화
- 5초 타임아웃으로 응답성 확보
- 연속 실패 제한으로 무한 재시도 방지

## 🚀 다음 단계

1. **백엔드 API 구현**: `BACKEND_SERVER_RECOMMENDATIONS.md` 참고
2. **실제 서버 연동 테스트**: 개발 서버에서 재시작 테스트
3. **프로덕션 배포**: 환경 변수 설정 확인
4. **모니터링 설정**: 로그 수집 및 알림 시스템 연동

## 📞 지원

문제 발생 시:
1. 브라우저 콘솔에서 에러 로그 확인
2. 네트워크 탭에서 API 호출 상태 확인
3. localStorage에서 `lastServerStartTime` 값 확인
4. 백엔드 서버 `/api/system/server-info` 엔드포인트 동작 확인
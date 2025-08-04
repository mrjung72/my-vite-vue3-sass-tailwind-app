// Mock API for testing server restart detection
// 실제 백엔드 API가 구현되기 전까지 테스트용으로 사용

// 서버 시작 시간 시뮬레이션 (페이지 로드 시마다 새로운 시작 시간)
let mockServerStartTime = new Date().toISOString();

// 서버 재시작 시뮬레이션을 위한 함수
window.simulateServerRestart = () => {
  mockServerStartTime = new Date().toISOString();
  console.log('서버 재시작 시뮬레이션:', mockServerStartTime);
  return mockServerStartTime;
};

// Mock API 응답 생성
window.mockServerInfo = () => {
  return {
    startTime: mockServerStartTime,
    uptime: Math.floor(Math.random() * 3600), // 임의의 uptime
    version: '1.0.0',
    environment: 'development'
  };
};

console.log('Mock API가 로드되었습니다. window.simulateServerRestart()로 서버 재시작을 시뮬레이션할 수 있습니다.');
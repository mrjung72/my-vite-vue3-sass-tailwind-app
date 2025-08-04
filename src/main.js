import { createApp } from 'vue';
import router from "@/router/index.js";
import App from './App.vue';
import './assets/styles/main.scss';
import pinia from './stores/pinia'
import { setupAxiosInterceptors } from '@/utils/axiosInterceptors'
import serverRestartDetector from '@/utils/serverRestartDetector'

// Axios 인터셉터 설정
setupAxiosInterceptors()

// 앱 생성 및 마운트
const app = createApp(App)
	.use(router)
	.use(pinia)
	.mount('#app')

// 서버 재시작 모니터링 시작 (앱이 완전히 로드된 후)
setTimeout(() => {
	serverRestartDetector.startMonitoring()
}, 1000)

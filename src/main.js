import { createApp } from 'vue';
import router from "@/router/index.js";
import App from './App.vue';
import './assets/styles/main.scss';
import pinia from './stores/pinia'
import { setupAxiosInterceptors } from '@/utils/axiosInterceptors'
setupAxiosInterceptors()
createApp(App)
	.use(router)
	.use(pinia)
	.mount('#app');

import { createApp } from 'vue';
import router from "@/router/index.js";
import App from './App.vue';
import './assets/styles/main.scss';
import { createPinia } from 'pinia'

createApp(App)
	.use(router)
	.use(createPinia())
	.mount('#app');

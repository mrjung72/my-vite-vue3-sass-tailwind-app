import HomeView from '@/views/HomeView.vue';
import MembersView from '@/views/MembersView.vue';

export default [
	{
		path: '/',
		name: 'home',
		component: HomeView,
		meta: { title: '홈' },
	},
	{
		path: '/preview',
		name: 'componentsPreview',
		// Lazy-loaded route
		component: () => import('@/views/PreviewView.vue'),
		meta: { title: 'Components Preview' },
	},
	{
		// 404 fallback
		path: '/:pathMatch(.*)*',
		name: 'notFound',
		component: () => import('@/views/NotFoundView.vue'),
		meta: { title: '404 Not Found' },
	},
	{ 
		path: '/login', 
		name: 'login',
		component: () => import('@/views/LoginView.vue'),
		meta: { title: '로그인' },
	},
	{ 
		path: '/register', 
		name: 'register',
		component: () => import('@/views/RegisterView.vue'),
		meta: { title: '회원가입' },
	},
	{ 
		path: '/members', 
		name: 'members',
  		component: MembersView,
		meta: { title: '회원목록', requiresAuth: true },
	}
];

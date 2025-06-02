import HomeView from '@/views/HomeView.vue';
import MembersView from '@/views/members/MembersView.vue';
import MyInfoView from '@/views/MyInfoView.vue';
import MyInfoEditView from '@/views/MyInfoEditView.vue';
import { useAuthStore } from '../stores/auth'
import pinia from '../stores/pinia'

const auth = useAuthStore(pinia)

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
		path: '/members/register', 
		name: 'members-register',
		component: () => import('@/views/members/RegisterMemberView.vue'),
		meta: { title: '회원가입' },
	},
	{ 
		path: '/members/csv-register', 
		name: 'members-csv-register',
		component: () => import('@/views/members/MembersCsvUploadView.vue'),
		meta: { title: '회원정보CVS파일 업로드', requiresAuth: true  },
	},
	{ 
		path: '/members/list', 
		name: 'members-list',
  		component: MembersView,
		meta: { title: '회원목록', requiresLogin: true  },
	},
	{ 
		path: '/myinfoview', 
		name: 'my-info-view',
  		component: MyInfoView,
		meta: { title: '내정보조회', requiresLogin: true  },
	},
	{ 
		path: '/myinfoedit',
		name: 'my-info-edit', 
  		component: MyInfoEditView,
		meta: { title: '내정보수정', requiresLogin: true  },
	},
	{ 
		path: '/servers/list', 
		name: 'servers-list',
		component: () => import('@/views/servers/ServersView.vue'),
		meta: { title: '서버목록', requiresLogin: true  },
	},
	{ 
		path: '/servers/csv-register', 
		name: 'servers-csv-register',
		component: () => import('@/views/servers/ServersCsvUploadView.vue'),
		meta: { title: '서버정보CVS파일 업로드', requiresAuth: true  },
	},
];

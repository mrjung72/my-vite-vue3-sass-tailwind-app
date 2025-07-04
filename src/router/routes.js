import HomeView from '@/views/system/HomeView.vue';
import MembersView from '@/views/members/MembersView.vue';
import MyInfoView from '@/views/auth/MyInfoView.vue';
import MyInfoEditView from '@/views/auth/MyInfoEditView.vue';
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
		component: () => import('@/views/system/PreviewView.vue'),
		meta: { title: 'Components Preview' },
	},
	{
		// 404 fallback
		path: '/:pathMatch(.*)*',
		name: 'notFound',
		component: () => import('@/views/system/NotFoundView.vue'),
		meta: { title: '404 Not Found' },
	},
	{ 
		path: '/login', 
		name: 'login',
		component: () => import('@/views/auth/LoginView.vue'),
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
		path: '/servers/dblist', 
		name: 'servers-dblist',
		component: () => import('@/views/servers/DatabasesView.vue'),
		meta: { title: 'DB목록', requiresLogin: true  },
	},
	{ 
		path: '/servers/csv-register', 
		name: 'servers-csv-register',
		component: () => import('@/views/servers/ServersCsvUploadView.vue'),
		meta: { title: '서버정보CVS파일 업로드', requiresAuth: true  },
	},
	{
		path: '/servers/telnet-check-history', 
		name: 'telnet-check-history',
		component: () => import('@/views/servers/TelnetCheckHistoryView.vue'),
		meta: { title: 'Telnet 체크 결과', requiresLogin: true  },
	},
	{
		path: '/servers/db-check-history', 
		name: 'db-check-history',
		component: () => import('@/views/servers/DatabaseCheckHistoryView.vue'),
		meta: { title: 'DB접속 체크 결과', requiresLogin: true  },
	},
	{ 
		path: '/board',
		name: 'board',
		component: () => import('@/views/board/BoardView.vue'),
		meta: { title: '게시판', requiresLogin: true   },
	},
	{
		path: '/board/write',
		name: 'board-write',
		component: () => import('@/views/board/BoardWriteView.vue'),
		meta: { title: '게시글 작성', requiresLogin: true },
	},
	{
		path: '/board/:id',
		name: 'board-detail',
		component: () => import('@/views/board/BoardDetailView.vue'),
		meta: { title: '게시글 상세', requiresLogin: true },
	},
	{
		path: '/board/edit/:id',
		name: 'board-edit',
		component: () => import('@/views/board/BoardEditView.vue'),
		meta: { title: '게시글 수정', requiresLogin: true },
	},
	{
		path: '/extract-tables',
		name: 'extract-tables',
		component: () => import('@/views/extract/ExtractTableNamesView.vue'),
		meta: { title: '테이블명 추출기' },
	},
	{
		path: '/extract-atwords',
		name: 'extract-atwords',
		component: () => import('@/views/extract/ExtractAtWordsView.vue'),
		meta: { title: '@단어 추출기' },
	},
	{
		path: '/extract-regex',
		name: 'extract-regex',
		component: () => import('@/views/extract/ExtractRegexView.vue'),
		meta: { title: '정규식 추출기' },
	},
	{
		path: '/extract-separator',
		name: 'extract-separator',
		component: () => import('@/views/extract/SeparatorView.vue'),
		meta: { title: '구분자 추출기' },
	},
	{
		path: '/release-history',
		name: 'release-history',
		component: () => import('@/views/system/ReleaseHistoryView.vue'),
		meta: { title: '릴리즈 갱신이력' },
	},
	{
		path: '/tech-stack-detail',
		name: 'tech-stack-detail',
		component: () => import('@/views/system/TechStackDetailView.vue'),
		meta: { title: '기술스택 상세 안내' },
	},
];

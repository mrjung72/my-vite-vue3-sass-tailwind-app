import { createWebHistory, createRouter } from 'vue-router';
import routes from './routes';
import { useAuthStore } from '../stores/auth'  // ok


const url = new URL(import.meta.env.BASE_URL, window.location.origin);
const router = createRouter({
        history: createWebHistory(url.pathname),
	routes: routes,
});


router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'login' })
  }
  else if (to.meta.requiresAuth && auth.user.isAdmin < 1) {
    alert('관리자만 접근할 수 있습니다.')    
    next({ name: 'home' })
  } else {
    next()
  }
})


export default router;

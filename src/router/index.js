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
  } else {
    next()
  }
})


export default router;

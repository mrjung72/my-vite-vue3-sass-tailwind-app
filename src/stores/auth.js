import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    users: [] // 가입한 사용자 목록 저장용
  }),
  actions: {
    login(email, password) {
      const found = this.users.find(u => u.email === email && u.password === password)
      if (found) this.user = found
      else alert('사용자를 찾을 수 없습니다.')
    },
    register(user) {
      this.users.push({ ...user, id: Date.now() })
    }
  }
})

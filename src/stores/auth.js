import { defineStore } from 'pinia'

// src/stores/auth.js
export const useAuthStore = defineStore('auth', {
  state: () => ({
    member: JSON.parse(localStorage.getItem('member')) || null,
    members: []
  }),
  actions: {
    login(email, password) {
      const found = this.members.find(u => u.email === email && u.password === password)
      if (found) {
        this.member = found
        localStorage.setItem('member', JSON.stringify(found))
      } else {
        alert('사용자를 찾을 수 없습니다.')
      }
    },
    logout() {
      this.member = null
      localStorage.removeItem('member')
    },
    register(member) {
      this.members.push({ ...member, id: Date.now() })
    }
  }
})

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore()

const router = useRouter()

const menu = ref([
  {
    label: '사용자 메뉴',
    children: [
      { label: '서버 목록', route: '/servers/list' },
      { label: 'DB 목록', route: '/servers/dblist' },
      { label: '게시판', route: '/board' },
    ],
  },
])

const admin_menu = ref([
  {
    label: '관리자 메뉴',
    children: [
      { label: '회원 목록', route: '/members/list' },
      { label: '회원정보 업로드', route: '/members/csv-register' },
      { label: '서버정보 업로드', route: '/servers/csv-register' },
    ],
  },
])

const expanded = ref({})
const toggleExpand = (label) => {
  expanded.value[label] = !expanded.value[label]
}
const goTo = (route) => {
  router.push(route)
}
</script>

<template>
  <div class="w-64 bg-base-200 h-full p-4 shadow-md">
    <ul class="menu">
      <li v-for="group in menu" :key="group.label">
        <div @click="toggleExpand(group.label)" class="cursor-pointer font-bold">
          {{ group.label }}
          <span class="float-right">{{ expanded[group.label] ? '▾' : '▸' }}</span>
        </div>
        <ul v-show="expanded[group.label]" class="pl-4">
          <li v-for="item in group.children" :key="item.label">
            <a @click="goTo(item.route)">{{ item.label }}</a>
          </li>
        </ul>
      </li>
    </ul>
    <ul v-if="auth.user && auth.user.isAdmin == 1" class="menu">
      <li v-for="group in admin_menu" :key="group.label">
        <div @click="toggleExpand(group.label)" class="cursor-pointer font-bold">
          {{ group.label }}
          <span class="float-right">{{ expanded[group.label] ? '▾' : '▸' }}</span>
        </div>
        <ul v-show="expanded[group.label]" class="pl-4">
          <li v-for="item in group.children" :key="item.label">
            <a @click="goTo(item.route)">{{ item.label }}</a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore()

const router = useRouter()
const route = useRoute()

const user_menu = ref([
  {
    label: '서버관련',
    children: [
      { label: '서버 목록', route: '/servers/list', requiresLogin: true },
      { label: 'DB 목록', route: '/servers/dblist', requiresLogin: true },
      { label: 'Telnet 체크 결과', route: '/servers/telnet-check-history', requiresLogin: true },
      { label: 'DB접속 체크 결과', route: '/servers/db-check-history', requiresLogin: true },
      { label: '게시판', route: '/board', requiresLogin: true },
    ],
  },
])

const util_menu = ref([
  {
    label: '유틸리티',
    children: [
      { label: '테이블명 추출기', route: '/extract-tables' },
      { label: '정규식 추출기', route: '/extract-regex' },
      { label: '구분자 추출기', route: '/extract-separator' },
    ],
  },
])

const admin_menu = ref([
  {
    label: '관리자 메뉴',
    children: [
      { label: '회원 목록', route: '/members/list' },
    ],
  },
])

const special_menu = ref([
  {
    label: '특별 메뉴',
    children: [
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

// 메뉴 그룹이 현재 경로에 포함된 메뉴를 가지고 있으면 자동으로 펼침
watchEffect(() => {
  [user_menu, util_menu, admin_menu, special_menu].forEach(menuGroup => {
    menuGroup.value.forEach(group => {
      if (group.children.some(item => route.path.startsWith(item.route))) {
        expanded.value[group.label] = true
      }
    })
  })
})
</script>

<template>
  <div class="w-64 bg-base-200 h-full p-4 shadow-md">
    <ul v-if="auth.isLoggedIn" class="menu">
      <li v-for="group in user_menu" :key="group.label">
        <div @click="toggleExpand(group.label)" class="cursor-pointer font-bold">
          {{ group.label }}
          <span class="float-right">{{ expanded[group.label] ? '▾' : '▸' }}</span>
        </div>
        <ul v-show="expanded[group.label]" class="pl-4">
          <li v-for="item in group.children" :key="item.label">
            <a
              @click="goTo(item.route)"
              :class="[route.path.startsWith(item.route) ? 'font-bold text-primary bg-base-300' : '']"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
    <ul class="menu">
      <li v-for="group in util_menu" :key="group.label">
        <div @click="toggleExpand(group.label)" class="cursor-pointer font-bold">
          {{ group.label }}
          <span class="float-right">{{ expanded[group.label] ? '▾' : '▸' }}</span>
        </div>
        <ul v-show="expanded[group.label]" class="pl-4">
          <li v-for="item in group.children" :key="item.label">
            <a
              @click="goTo(item.route)"
              :class="[route.path.startsWith(item.route) ? 'font-bold text-primary bg-base-300' : '']"
            >
              {{ item.label }}
            </a>
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
            <a
              @click="goTo(item.route)"
              :class="[route.path.startsWith(item.route) ? 'font-bold text-primary bg-base-300' : '']"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
    <ul v-if="auth.user && auth.user.isAdmin == 1 && auth.user.userid=='admin'" class="menu">
      <li v-for="group in special_menu" :key="group.label">
        <div @click="toggleExpand(group.label)" class="cursor-pointer font-bold">
          {{ group.label }}
          <span class="float-right">{{ expanded[group.label] ? '▾' : '▸' }}</span>
        </div>
        <ul v-show="expanded[group.label]" class="pl-4">
          <li v-for="item in group.children" :key="item.label">
            <a
              @click="goTo(item.route)"
              :class="[route.path.startsWith(item.route) ? 'font-bold text-primary bg-base-300' : '']"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

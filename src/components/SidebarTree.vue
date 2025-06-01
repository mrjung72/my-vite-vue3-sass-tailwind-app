<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const menu = ref([
  {
    label: '회원 관리',
    children: [
      { label: '회원 목록', route: '/members/list' },
      { label: '회원정보 업로드', route: '/members/csv-register' },
    ],
  },
  {
    label: '서버 관리',
    children: [
      { label: '서버 목록', route: '/servers/list' },
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
  </div>
</template>

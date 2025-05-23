<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-4">회원 목록</h2>
    <div class="grid gap-2">
      <div
        v-for="user in users"
        :key="user.id"
        class="p-4 bg-base-100 shadow rounded"
      >
        {{ user.name }} ({{ user.email }})
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 샘플 사용자 목록
const users = ref([])

onMounted(() => {
  users.value = [
    { id: 1, name: '홍길동', email: 'hong@example.com' },
    { id: 2, name: '김철수', email: 'kim@example.com' },
  ]
})
</script>

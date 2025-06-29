<script setup>
import { RouterView } from 'vue-router'
import TheFooter from '@/components/TheFooter.vue'
import TheHeader from '@/components/TheHeader.vue'
import SidebarTree from '@/components/SidebarTree.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <TheHeader />

    <div class="flex flex-1">
      <!-- 좌측 사이드바 -->
      <SidebarTree v-if="$route.path !== '/' && $route.path !== '/login'" />

      <!-- 본문 영역 -->
      <main class="flex-1 py-4 px-4 overflow-auto">
        <RouterView />
      </main>
    </div>

    <TheFooter />
  </div>
</template>

<style scoped lang="scss">
/* 필요 시 추가 커스터마이징 */
</style>

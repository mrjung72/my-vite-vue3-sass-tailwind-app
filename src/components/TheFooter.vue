<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToReleaseHistory = () => {
  router.push('/release-history')
}
</script>

<template>
  <footer class="bg-neutral text-neutral-content px-6 py-2 w-full fixed bottom-0 left-0 flex justify-center">
    <div class="max-w-md w-full text-center text-sm">
      <p class="opacity-70">
        © 2025 사하라. All rights reserved. | 
        <a @click="goToReleaseHistory" class="link link-hover opacity-70 cursor-pointer">Release History</a>
      </p>
    </div>
  </footer>
</template>

<style scoped lang="scss">

</style>
<template>
  <div class="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-6 gap-8">
    <div class="md:col-span-4">
      <label class="block font-bold mb-2">소스 입력</label>
      <textarea v-model="input" class="textarea textarea-bordered w-full h-120" placeholder="@로 시작하는 단어가 포함된 소스를 입력하세요"></textarea>
    </div>
    <div class="md:col-span-2">
      <label class="block font-bold mb-2">추출된 @단어</label>
      <div v-if="isProcessing" class="textarea textarea-bordered w-full h-120 bg-base-200 flex items-center justify-center">
        <div class="flex items-center gap-2 text-gray-400">
          <span class="loading loading-spinner loading-sm"></span>
          처리 중...
        </div>
      </div>
      <textarea v-else class="textarea textarea-bordered w-full h-120 bg-base-200" readonly :value="atWords.join('\n')"></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const input = ref('')
const isProcessing = ref(false)

const atWords = computed(() => {
  if (!input.value) return []
  // @로 시작하는 단어 추출 (예: @user, @param)
  const regex = /@[\w]+/g
  const found = new Set()
  let match
  while ((match = regex.exec(input.value)) !== null) {
    found.add(match[0])
  }
  return Array.from(found)
})

// 입력 시 처리 상태 관리
watch(input, () => {
  isProcessing.value = true
  // 처리 시뮬레이션을 위한 짧은 지연
  setTimeout(() => {
    isProcessing.value = false
  }, 200)
})
</script>

<style scoped>
.textarea {
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  font-size: 1rem;
}
</style> 
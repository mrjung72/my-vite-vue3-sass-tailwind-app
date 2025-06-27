<template>
  <div class="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-6 gap-8">
    <div class="md:col-span-4">
      <label class="block font-bold mb-2">소스 입력</label>
      <textarea v-model="input" class="textarea textarea-bordered w-full h-120" placeholder="@로 시작하는 단어가 포함된 소스를 입력하세요"></textarea>
    </div>
    <div class="md:col-span-2">
      <label class="block font-bold mb-2">추출된 @단어</label>
      <textarea class="textarea textarea-bordered w-full h-120 bg-base-200" readonly :value="atWords.join('\n')"></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const input = ref('')

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
</script>

<style scoped>
.textarea {
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  font-size: 1rem;
}
</style> 
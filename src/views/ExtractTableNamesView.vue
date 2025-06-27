<template>
  <div class="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-6 gap-8">
    <div class="md:col-span-4">
      <label class="block font-bold mb-2">SQL/DDL 소스 입력</label>
      <textarea v-model="input" class="textarea textarea-bordered w-full h-120" placeholder="여기에 SQL 또는 DDL 소스를 입력하세요"></textarea>
    </div>
    <div class="md:col-span-2">
      <label class="block font-bold mb-2">추출된 테이블명</label>
      <textarea class="textarea textarea-bordered w-full h-120 bg-base-200" readonly :value="tableNames.join('\n')"></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const input = ref('')

const tableNames = computed(() => {
  if (!input.value) return []
  // FROM, JOIN, UPDATE, INTO 등 뒤에 나오는 테이블명과 alias 추출
  // 예: FROM users u, JOIN orders o
  const regex = /\b(?:FROM|JOIN|UPDATE|INTO|TABLE)\s+([`"\[]?[\w.]+[`"\]]?)(?:\s+(?:AS\s+)?([\w]+))?/gi
  const found = []
  let match
  while ((match = regex.exec(input.value)) !== null) {
    // 괄호/따옴표 제거
    let name = match[1].replace(/^[`"\[]|[`"\]]$/g, '')
    let alias = match[2] || ''
    let label = name
    if (alias) label += ` ${alias}`
    if (name && !found.includes(label)) found.push(label)
  }
  return found
})
</script>

<style scoped>
.textarea {
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  font-size: 1rem;
}
</style> 
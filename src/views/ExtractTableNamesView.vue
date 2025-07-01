<template>
  <div class="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-6 gap-8">
    <div class="md:col-span-4">
      <label class="block font-bold mb-2">SQL/DDL 소스 입력</label>
      <textarea v-model="input" class="textarea textarea-bordered w-full h-120" placeholder="여기에 SQL 또는 DDL 소스를 입력하세요"></textarea>
    </div>
    <div class="md:col-span-2">
      <label class="block font-bold mb-2">추출된 테이블명</label>
      <div class="flex items-center mb-2">
        <input type="checkbox" id="dedup" v-model="dedupOnlyName" class="checkbox checkbox-sm mr-2" />
        <label for="dedup" class="text-sm">테이블명만 중복제거</label>
      </div>
      <div v-if="isProcessing" class="textarea textarea-bordered w-full h-120 bg-base-200 flex items-center justify-center">
        <div class="flex items-center gap-2 text-gray-400">
          <span class="loading loading-spinner loading-sm"></span>
          처리 중...
        </div>
      </div>
      <textarea v-else class="textarea textarea-bordered w-full h-120 bg-base-200" readonly :value="displayTableNames.join('\n')"></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const input = ref('')
const isProcessing = ref(false)
const dedupOnlyName = ref(false)

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

const displayTableNames = computed(() => {
  if (!dedupOnlyName.value) return tableNames.value
  // 테이블명만 기준으로 중복제거
  const seen = new Set()
  const result = []
  for (const label of tableNames.value) {
    const name = label.split(' ')[0] // alias 분리
    if (!seen.has(name)) {
      seen.add(name)
      result.push(label)
    }
  }
  return result
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
<template>
  <div class="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-6 gap-8">
    <div class="md:col-span-4">
      <div class="mb-4">
        <label class="block font-bold mb-2">정규식 패턴</label>
        <input 
          v-model="regexPattern" 
          class="input input-bordered w-full" 
          placeholder="정규식 패턴을 입력하세요 (예: \b\w+@\w+\.\w+\b)"
        />
        <div class="text-sm text-gray-500 mt-1">
          플래그: 
          <label class="inline-flex items-center mr-3">
            <input type="checkbox" v-model="flags.global" class="checkbox checkbox-xs mr-1" />
            g (전역)
          </label>
          <label class="inline-flex items-center mr-3">
            <input type="checkbox" v-model="flags.ignoreCase" class="checkbox checkbox-xs mr-1" />
            i (대소문자 무시)
          </label>
          <label class="inline-flex items-center mr-3">
            <input type="checkbox" v-model="flags.multiline" class="checkbox checkbox-xs mr-1" />
            m (멀티라인)
          </label>
        </div>
      </div>
      
      <label class="block font-bold mb-2">소스 입력</label>
      <textarea 
        v-model="input" 
        class="textarea textarea-bordered w-full h-96" 
        placeholder="정규식을 적용할 텍스트를 입력하세요"
      ></textarea>
    </div>
    
    <div class="md:col-span-2">
      <label class="block font-bold mb-2">추출된 결과</label>
      <div v-if="isProcessing" class="textarea textarea-bordered w-full h-96 bg-base-200 flex items-center justify-center">
        <div class="flex items-center gap-2 text-gray-400">
          <span class="loading loading-spinner loading-sm"></span>
          처리 중...
        </div>
      </div>
      <textarea 
        v-else 
        class="textarea textarea-bordered w-full h-124 bg-base-200" 
        readonly 
        :value="extractedResults.join('\n')"
      ></textarea>
      
      <div class="mt-2 text-sm text-gray-600">
        총 {{ extractedResults.length }}개 매치
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const input = ref('')
const regexPattern = ref('')
const isProcessing = ref(false)
const flags = ref({
  global: true,
  ignoreCase: false,
  multiline: false
})

const extractedResults = computed(() => {
  if (!input.value || !regexPattern.value) return []
  
  try {
    // 플래그 문자열 생성
    let flagString = ''
    if (flags.value.global) flagString += 'g'
    if (flags.value.ignoreCase) flagString += 'i'
    if (flags.value.multiline) flagString += 'm'
    
    const regex = new RegExp(regexPattern.value, flagString)
    const matches = []
    
    if (flags.value.global) {
      // 전역 매치
      let match
      while ((match = regex.exec(input.value)) !== null) {
        if (match.length === 1) {
          matches.push(match[0])
        } else {
          // 그룹이 있는 경우 전체 매치와 그룹들을 모두 표시
          const matchInfo = {
            full: match[0],
            groups: match.slice(1).map((group, index) => `그룹${index + 1}: ${group}`).join(', ')
          }
          matches.push(`${matchInfo.full} (${matchInfo.groups})`)
        }
      }
    } else {
      // 단일 매치
      const match = input.value.match(regex)
      if (match) {
        if (match.length === 1) {
          matches.push(match[0])
        } else {
          const matchInfo = {
            full: match[0],
            groups: match.slice(1).map((group, index) => `그룹${index + 1}: ${group}`).join(', ')
          }
          matches.push(`${matchInfo.full} (${matchInfo.groups})`)
        }
      }
    }
    
    return matches
  } catch (error) {
    return [`정규식 오류: ${error.message}`]
  }
})

// 입력이나 정규식 패턴 변경 시 처리 상태 관리
watch([input, regexPattern, flags], () => {
  isProcessing.value = true
  // 처리 시뮬레이션을 위한 짧은 지연
  setTimeout(() => {
    isProcessing.value = false
  }, 200)
}, { deep: true })
</script>

<style scoped>
.textarea {
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  font-size: 0.9rem;
}
</style> 
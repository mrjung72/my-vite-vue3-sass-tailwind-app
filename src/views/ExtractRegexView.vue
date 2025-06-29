<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-4">
      <label class="block font-bold mb-2">정규식 패턴으로 데이터 추출하기 </label>
      <div class="flex gap-2 mb-2">
        <select 
          v-model="selectedPreset" 
          class="select select-bordered select-sm flex-1"
          @change="applyPreset"
        >
          <option value="">직접 입력</option>
          <option value="at-words">@단어 추출</option>
          <option value="url">URL</option>
          <option value="domain">도메인</option>
          <option value="ip">IP 주소</option>
          <option value="email">이메일 주소</option>
          <option value="phone">전화번호</option>
          <option value="line-start">줄 시작 단어</option>
          <option value="line-end">줄 끝 단어</option>
        </select>
        <button 
          v-if="selectedPreset" 
          @click="clearPreset" 
          class="btn btn-sm btn-outline"
        >
          초기화
        </button>
      </div>
      <input 
        v-model="regexPattern" 
        class="input input-bordered w-full" 
        placeholder="정규식 패턴을 입력하세요 (예: \b\w+@\w+\.\w+\b)"
      />
      <div v-if="selectedPreset && presetPatterns[selectedPreset]" class="text-sm text-blue-600 mt-1">
        💡 {{ presetPatterns[selectedPreset].description }}
      </div>
      <div class="text-sm text-gray-500 mt-1">
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="flags.global" class="checkbox checkbox-xs mr-1" />
          전체 적용
        </label>
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="flags.ignoreCase" class="checkbox checkbox-xs mr-1" />
          대소문자 무시
        </label>
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="flags.removeDuplicates" class="checkbox checkbox-xs mr-1" />
          중복 제거
        </label>
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="flags.wholeWord" class="checkbox checkbox-xs mr-1" />
          온전한 단어(공백 기준)
        </label>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-6 gap-8">
      <div class="md:col-span-4">
        <div class="flex items-center justify-between mb-2">
          <label class="block font-bold">소스 입력</label>
          <button @click="clearInput" class="btn btn-sm btn-outline">초기화</button>
        </div>
        <textarea 
          v-model="input" 
          class="textarea textarea-bordered w-full h-96" 
          placeholder="정규식을 적용할 텍스트를 입력하세요"
        ></textarea>
      </div>
      
      <div class="md:col-span-2">
        <div class="flex items-center justify-between mb-2">
          <label class="block font-bold">추출된 결과</label>
          <button @click="copyResults" class="btn btn-sm btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            복사
          </button>
        </div>
        <div v-if="isProcessing" class="textarea textarea-bordered w-full h-96 bg-base-200 flex items-center justify-center">
          <div class="flex items-center gap-2 text-gray-400">
            <span class="loading loading-spinner loading-sm"></span>
            처리 중...
          </div>
        </div>
        <textarea 
          v-else 
          class="textarea textarea-bordered w-full h-96 bg-base-200 font-mono text-sm" 
          readonly 
          :value="finalResults.join('\n')"
        ></textarea>
        
        <div class="mt-2 text-sm text-gray-600">
          총 {{ finalResults.length }}개 매치
        </div>
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
  ignoreCase: true,
  multiline: true,
  wholeWord: false,
  removeDuplicates: false
})
const selectedPreset = ref('')

const pattern_domain = '([\\w-]+\\.){1,3}(com|org|net|edu|gov|mil|int|io|ai|app|dev|test|local|kr|us|jp|cn|uk|de|in|au|ca|fr)'


// 프리셋 패턴 정의
const presetPatterns = {
  'at-words': {
    pattern: '@[\\w]+',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '@로 시작하는 단어 추출'
  },
  'email': {
    pattern: '[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '이메일 주소 추출'
  },
  'phone': {
    pattern: '(?:\\+?[0-9]{1,3}[-\\s]?)?[0-9]{2,4}[-\\s]?[0-9]{3,4}[-\\s]?[0-9]{3,4}',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '전화번호 추출'
  },
  'url': {
    pattern: 'https?://'+pattern_domain,
    flags: { global: true, ignoreCase: true, multiline: true },
    description: 'URL 추출'
  },
  'ip': {
    pattern: '(?:\\d{1,3}\\.){3}\\d{1,3}',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: 'IP 주소 추출'
  },
  'domain': {
    pattern: pattern_domain,
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '도메인 추출'
  },
  'line-start': {
    pattern: '^[a-zA-Z]+',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '각 줄의 시작 단어 추출 (m 플래그 필요)'
  },
  'line-end': {
    pattern: '[a-zA-Z]+$',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '각 줄의 끝 단어 추출 (m 플래그 필요)'
  }
}

// 추출 패턴일 때 기존 결과
const extractResults = computed(() => {
  if (selectedPreset.value === '') return []
  
  if (!input.value || !regexPattern.value) return []
  
  try {
    // 플래그 문자열 생성
    let flagString = ''
    if (flags.value.global) flagString += 'g'
    if (flags.value.ignoreCase) flagString += 'i'
    if (flags.value.multiline) flagString += 'm'
    
    // 온전한 단어 옵션 적용
    let finalPattern = regexPattern.value
    if (flags.value.wholeWord && selectedPreset.value) {
      const preset = presetPatterns[selectedPreset.value]
      // 이미 단어 경계가 있는 패턴만 제외 (email, phone, ip 등)
      if (preset && !preset.pattern.includes('\\b')) {
        finalPattern = '\\s+' + preset.pattern 
      }
    }
    
    const regex = new RegExp(finalPattern, flagString)
    const matches = []
    
    if (flags.value.global) {
      // 전역 매치
      let match
      while ((match = regex.exec(input.value)) !== null) {
        const matchedText = match[0]
        // 온전한 단어 옵션이 체크된 경우, 실제로 공백으로 구분된 단어인지 확인
        if (flags.value.wholeWord && selectedPreset.value) {
          const preset = presetPatterns[selectedPreset.value]
          if (preset && !preset.pattern.includes('\\b')) {
            // 매치된 텍스트가 실제로 공백으로 구분된 완전한 단어인지 확인
            const words = input.value.split(/\s+/)
            if (words.includes(matchedText.trim())) {
              matches.push(matchedText.trim())
            }
          } else {
            matches.push(matchedText.trim())
          }
        } else {
          matches.push(matchedText.trim())
        }
      }
    } else {
      // 단일 매치
      const match = input.value.match(regex)
      if (match) {
        const matchedText = match[0]
        // 온전한 단어 옵션이 체크된 경우, 실제로 공백으로 구분된 단어인지 확인
        if (flags.value.wholeWord && selectedPreset.value) {
          const preset = presetPatterns[selectedPreset.value]
          if (preset && !preset.pattern.includes('\\b')) {
            // 매치된 텍스트가 실제로 공백으로 구분된 완전한 단어인지 확인
            const words = input.value.split(/\s+/)
            if (words.includes(matchedText.trim())) {
              matches.push(matchedText.trim())
            }
          } else {
            matches.push(matchedText.trim())
          }
        } else {
          matches.push(matchedText.trim())
        }
      }
    }
    
    return matches
  } catch (error) {
    return [`정규식 오류: ${error.message}`]
  }
})

// 최종 결과 (카테고리에 따라 다르게)
const finalResults = computed(() => {
  const results = extractResults.value
  if (flags.value.removeDuplicates) {
    return [...new Set(results)]
  }
  return results
})

// 입력이나 정규식 패턴 변경 시 처리 상태 관리
watch([input, regexPattern, flags], () => {
  isProcessing.value = true
  // 처리 시뮬레이션을 위한 짧은 지연
  setTimeout(() => {
    isProcessing.value = false
  }, 200)
}, { deep: true })

const applyPreset = () => {
  if (selectedPreset.value && presetPatterns[selectedPreset.value]) {
    const preset = presetPatterns[selectedPreset.value]
    regexPattern.value = preset.pattern
    flags.value = { ...preset.flags }
  }
}

const clearPreset = () => {
  selectedPreset.value = ''
  regexPattern.value = ''
  flags.value = { global: true, ignoreCase: true, multiline: true, wholeWord: false, removeDuplicates: false }
}

const clearInput = () => {
  input.value = ''
}

const copyResults = () => {
  const textToCopy = finalResults.value.join('\n')
  
  // 클립보드에 복사
  navigator.clipboard.writeText(textToCopy).then(() => {
    // 복사 성공 알림 (선택사항)
    console.log('결과가 클립보드에 복사되었습니다.')
  }).catch(err => {
    console.error('복사 실패:', err)
  })
}
</script>

<style scoped>
.textarea {
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  font-size: 0.9rem;
}
</style> 
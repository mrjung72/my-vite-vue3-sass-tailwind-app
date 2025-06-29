<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-4">
      <label class="block font-bold mb-2">정규식 패턴</label>
      <div class="flex gap-2 mb-2">
        <select 
          v-model="selectedCategory" 
          class="select select-bordered select-sm flex-1"
          @change="onCategoryChange"
        >
          <option value="">직접 입력</option>
          <option value="extract">추출 패턴</option>
          <option value="separator">구분자 패턴</option>
        </select>
        <select 
          v-if="selectedCategory === 'extract'"
          v-model="selectedPreset" 
          class="select select-bordered select-sm flex-1"
          @change="applyPreset"
        >
          <option value="">패턴 선택</option>
          <option value="at-words">@단어 추출</option>
          <option value="url">URL</option>
          <option value="domain">도메인</option>
          <option value="ip">IP 주소</option>
          <option value="email">이메일 주소</option>
          <option value="phone">전화번호</option>
          <option value="line-start">줄 시작 단어</option>
          <option value="line-end">줄 끝 단어</option>
        </select>
        <select 
          v-if="selectedCategory === 'separator'"
          v-model="selectedPreset" 
          class="select select-bordered select-sm flex-1"
          @change="applyPreset"
        >
          <option value="">구분자 선택</option>
          <option value="comma-separated">쉼표(,)</option>
          <option value="semicolon-separated">세미콜론(;)</option>
          <option value="pipe-separated">파이프(|)</option>
          <option value="tab-separated">탭</option>
          <option value="space-separated">공백</option>
          <option value="newline-separated">줄바꿈</option>
          <option value="underscore-separated">언더바(_)</option>
          <option value="dot-separated">마침표(.)</option>
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
        v-if="selectedCategory !== 'separator'"
        v-model="regexPattern" 
        class="input input-bordered w-full" 
        placeholder="정규식 패턴을 입력하세요 (예: \b\w+@\w+\.\w+\b)"
      />
      <div v-if="selectedPreset && presetPatterns[selectedPreset]" class="text-sm text-blue-600 mt-1">
        💡 {{ presetPatterns[selectedPreset].description }}
      </div>
      <div v-if="selectedCategory === 'extract'" class="text-sm text-gray-500 mt-1">
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="flags.global" class="checkbox checkbox-xs mr-1" />
          g (전체 적용)
        </label>
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="removeDuplicates" class="checkbox checkbox-xs mr-1" />
          중복 제거
        </label>
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="flags.ignoreCase" class="checkbox checkbox-xs mr-1" />
          i (대소문자 무시)
        </label>
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="wholeWord" class="checkbox checkbox-xs mr-1" />
          온전한 단어(공백 기준)
        </label>
      </div>
      <div v-if="selectedCategory === 'separator'" class="text-sm text-gray-500 mt-1">
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="showLineNumbers" class="checkbox checkbox-xs mr-1" />
          라인번호 표시
        </label>
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="removeDuplicates" class="checkbox checkbox-xs mr-1" />
          중복 제거
        </label>
      </div>
    </div>
    
    <div v-if="selectedCategory === 'separator'" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <label class="block font-bold mb-2">소스 입력</label>
        <div class="border border-base-300 rounded-lg bg-base-100 h-96 overflow-auto">
          <div class="p-4 font-mono text-sm">
            <div v-for="(line, index) in inputLines" :key="index" class="flex items-center mb-1">
              <span class="w-8 text-center text-gray-500 border-r border-gray-300 pr-2 mr-2">
                {{ index + 1 }}
              </span>
              <span class="flex-1 whitespace-nowrap">{{ line }}</span>
            </div>
            <div class="flex items-center">
              <span class="w-8 text-center text-gray-500 border-r border-gray-300 pr-2 mr-2">
                {{ inputLines.length + 1 }}
              </span>
              <input 
                v-model="newLine" 
                @keydown.enter="addLine"
                class="flex-1 bg-transparent border-none outline-none font-mono text-sm"
                placeholder="텍스트를 입력하세요 (Enter로 새 줄 추가)"
              />
            </div>
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-600">
          총 {{ inputLines.length }}개 라인
        </div>
      </div>
      
      <div>
        <label class="block font-bold mb-2">추출된 결과</label>
        <div v-if="isProcessing" class="textarea textarea-bordered w-full h-96 bg-base-200 flex items-center justify-center">
          <div class="flex items-center gap-2 text-gray-400">
            <span class="loading loading-spinner loading-sm"></span>
            처리 중...
          </div>
        </div>
        <div v-else class="relative">
          <div class="border border-base-300 rounded-lg bg-base-200 h-96 overflow-auto">
            <div class="p-4 font-mono text-sm whitespace-nowrap">
              <div v-if="showLineNumbers" class="flex items-center mb-2 text-gray-500">
                <span class="w-8 text-center">#</span>
                <span>결과</span>
              </div>
              <div v-for="(result, index) in finalResults" :key="index" class="flex items-center">
                <span v-if="showLineNumbers" class="w-8 text-center text-gray-500 border-r border-gray-300 pr-2 mr-2">
                  {{ index + 1 }}
                </span>
                <span class="flex-1">{{ result }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-2 text-sm text-gray-600">
          총 {{ selectedCategory === 'separator' ? finalResults.length : finalResults.length }}개 {{ selectedCategory === 'separator' ? '행' : '매치' }}
        </div>
      </div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-6 gap-8">
      <div class="md:col-span-4">
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
          class="textarea textarea-bordered w-full h-96 bg-base-200 font-mono text-sm" 
          readonly 
          :value="finalResults.join('\n')"
        ></textarea>
        
        <div class="mt-2 text-sm text-gray-600">
          총 {{ selectedCategory === 'separator' ? finalResults.length : finalResults.length }}개 {{ selectedCategory === 'separator' ? '행' : '매치' }}
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
  multiline: true
})
const selectedPreset = ref('')
const selectedCategory = ref('')
const wholeWord = ref(false)
const removeDuplicates = ref(false)
const showLineNumbers = ref(false)
const newLine = ref('')

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
    pattern: '(?:\\+?[0-9]{1,3}[-.\\s]?)?[0-9]{2,4}[-.\\s]?[0-9]{3,4}[-.\\s]?[0-9]{3,4}',
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
  'comma-separated': {
    pattern: '[^,\\s]+',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '쉼표로 구분된 값들 추출'
  },
  'semicolon-separated': {
    pattern: '[^;\\s]+',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '세미콜론으로 구분된 값들 추출'
  },
  'pipe-separated': {
    pattern: '[^|\\s]+',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '파이프(|)로 구분된 값들 추출'
  },
  'tab-separated': {
    pattern: '[^\\t\\s]+',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '탭으로 구분된 값들 추출'
  },
  'space-separated': {
    pattern: '\\S+',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '공백으로 구분된 값들 추출'
  },
  'newline-separated': {
    pattern: '[^\\n\\r]+',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '줄바꿈으로 구분된 값들 추출'
  },
  'underscore-separated': {
    pattern: '[^_\\s]+',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '언더바(_)로 구분된 값들 추출'
  },
  'dot-separated': {
    pattern: '[^.\\s]+',
    flags: { global: true, ignoreCase: true, multiline: true },
    description: '마침표(.)로 구분된 값들 추출'
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

// 구분자 패턴일 때 각 행별 결과
const separatorResults = computed(() => {
  if (selectedCategory.value !== 'separator') return []
  
  // 줄바꿈 문자를 정규화 (Windows의 \r\n도 처리)
  const normalizedInput = input.value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalizedInput.split('\n').filter(line => line.trim() !== '')
  const separator = getSeparator()
  
  return lines.map((line, index) => {
    return line.split(separator).map(cell => cell.trim()).filter(cell => cell !== '')
  })
})

// 추출 패턴일 때 기존 결과
const extractResults = computed(() => {
  if (selectedCategory.value !== 'extract') return []
  
  if (!input.value || !regexPattern.value) return []
  
  try {
    // 플래그 문자열 생성
    let flagString = ''
    if (flags.value.global) flagString += 'g'
    if (flags.value.ignoreCase) flagString += 'i'
    if (flags.value.multiline) flagString += 'm'
    
    // 온전한 단어 옵션 적용
    let finalPattern = regexPattern.value
    if (wholeWord.value && selectedCategory.value === 'extract' && selectedPreset.value) {
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
        if (wholeWord.value && selectedCategory.value === 'extract' && selectedPreset.value) {
          const preset = presetPatterns[selectedPreset.value]
          if (preset && !preset.pattern.includes('\\b')) {
            // 매치된 텍스트가 실제로 공백으로 구분된 완전한 단어인지 확인
            const words = input.value.split(/\s+/)
            if (words.includes(matchedText.trim())) {
              matches.push(matchedText)
            }
          } else {
            matches.push(matchedText)
          }
        } else {
          matches.push(matchedText)
        }
      }
    } else {
      // 단일 매치
      const match = input.value.match(regex)
      if (match) {
        const matchedText = match[0]
        // 온전한 단어 옵션이 체크된 경우, 실제로 공백으로 구분된 단어인지 확인
        if (wholeWord.value && selectedCategory.value === 'extract' && selectedPreset.value) {
          const preset = presetPatterns[selectedPreset.value]
          if (preset && !preset.pattern.includes('\\b')) {
            // 매치된 텍스트가 실제로 공백으로 구분된 완전한 단어인지 확인
            const words = input.value.split(/\s+/)
            if (words.includes(matchedText.trim())) {
              matches.push(matchedText)
            }
          } else {
            matches.push(matchedText)
          }
        } else {
          matches.push(matchedText)
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
  if (selectedCategory.value === 'separator') {
    return separatorResults.value
  } else {
    const results = extractResults.value
    if (removeDuplicates.value) {
      return [...new Set(results)]
    }
    return results
  }
})

// 입력 텍스트를 줄 단위로 분리
const inputLines = computed(() => {
  return input.value.split('\n').filter(line => line.trim() !== '')
})

// 입력이나 정규식 패턴 변경 시 처리 상태 관리
watch([input, regexPattern, flags, wholeWord, removeDuplicates, showLineNumbers], () => {
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
  flags.value = { global: true, ignoreCase: true, multiline: true }
}

const onCategoryChange = () => {
  // 카테고리 변경 시 선택 항목 초기화
  selectedPreset.value = ''
}

const addLine = () => {
  if (newLine.value.trim()) {
    input.value += (input.value ? '\n' : '') + newLine.value.trim()
    newLine.value = ''
  }
}

const getAppliedFlags = () => {
  let flagString = ''
  if (flags.value.global) flagString += 'g'
  if (flags.value.ignoreCase) flagString += 'i'
  if (flags.value.multiline) flagString += 'm'
  return flagString
}

// 구분자 패턴에 따른 실제 구분자 반환
const getSeparator = () => {
  if (!selectedPreset.value) return ','
  
  const separatorMap = {
    'comma-separated': ',',
    'semicolon-separated': ';',
    'pipe-separated': '|',
    'tab-separated': '\t',
    'space-separated': ' ',
    'newline-separated': '\n',
    'underscore-separated': '_',
    'dot-separated': '.'
  }
  
  return separatorMap[selectedPreset.value] || ','
}
</script>

<style scoped>
.textarea {
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  font-size: 0.9rem;
}
</style> 
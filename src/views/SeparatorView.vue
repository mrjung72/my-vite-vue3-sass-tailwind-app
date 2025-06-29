<template>
  <div class="max-w-6xl mx-auto px-4 pt-4 pb-2">
    <div class="mb-2">
      <label class="block font-bold mb-1">지정 구분자(문자 또는 단어)로 데이터 추출하기</label>
      <div class="flex gap-2 mb-1">
        <select 
          v-model="selectedPreset" 
          class="select select-bordered select-sm flex-1"
          @change="applyPreset"
        >
          <option value="">구분자 선택</option>
          <option value="custom">직접 입력</option>
          <option value="comma-separated">쉼표(,)</option>
          <option value="semicolon-separated">세미콜론(;)</option>
          <option value="pipe-separated">파이프(|)</option>
          <option value="tab-separated">탭</option>
          <option value="space-separated">공백</option>
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
        v-if="selectedPreset === 'custom'"
        v-model="customSeparator" 
        class="input input-bordered w-full" 
        placeholder="구분자를 직접 입력하세요 (예: |, ;, \t 등)"
      />
      <div v-if="selectedPreset && presetPatterns[selectedPreset]" class="text-sm text-blue-600 mt-1">
        💡 {{ presetPatterns[selectedPreset].description }}
      </div>
      <div class="text-sm text-gray-500 mt-1">
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="showLineNumbers" class="checkbox checkbox-xs mr-1" />
          라인번호 표시
        </label>
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="removeDuplicates" class="checkbox checkbox-xs mr-1" />
          중복 제거
        </label>
      </div>
      <div class="text-sm text-gray-500 mt-2">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold mr-1">결과 포맷</span>
            <label class="inline-flex items-center">
              <input type="radio" v-model="resultFormat" value="json" class="radio radio-xs mr-1" />
              JSON
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="resultFormat" value="text" class="radio radio-xs mr-1" />
              텍스트
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="resultFormat" value="excel" class="radio radio-xs mr-1" />
              엑셀
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="resultFormat" value="csv" class="radio radio-xs mr-1" />
              CSV
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="resultFormat" value="html" class="radio radio-xs mr-1" />
              HTML
            </label>
          </div>
          <div class="border-l border-base-300 pl-4 ml-2 flex flex-wrap items-center gap-2 min-w-[220px]">
            <span class="font-bold mr-1">열 선택</span>
            <input 
              v-model="selectedColumns" 
              class="input input-bordered input-sm w-32" 
              placeholder="예: 1,3,5"
            />
            <button @click="clearColumnSelection" class="btn btn-xs btn-outline">초기화</button>
            <span class="text-xs text-gray-400">쉼표로 구분 (비워두면 모든 열)</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block font-bold">소스 입력</label>
          <button @click="clearInput" class="btn btn-sm btn-outline">초기화</button>
        </div>
        <textarea 
          v-model="input" 
          class="textarea textarea-bordered w-full h-96" 
          placeholder="구분자로 분리할 텍스트를 입력하세요 (여러 행 입력 가능)"
        ></textarea>
        <div class="mt-2 text-sm text-gray-600">
          총 {{ inputLines.length }}개 라인
        </div>
      </div>
      
      <div>
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
        <div v-else class="relative">
          <!-- JSON 포맷 -->
          <textarea v-if="resultFormat === 'json'" readonly class="textarea textarea-bordered w-full h-96" :value="jsonResult"></textarea>
          
          <!-- 텍스트 포맷 -->
          <textarea v-else-if="resultFormat === 'text'" readonly class="textarea textarea-bordered w-full h-96" :value="textResult"></textarea>
          
          <!-- 엑셀 포맷 -->
          <textarea v-else-if="resultFormat === 'excel'" readonly class="textarea textarea-bordered w-full h-96" :value="excelResult"></textarea>
          
          <!-- CSV 포맷 -->
          <textarea v-else-if="resultFormat === 'csv'" readonly class="textarea textarea-bordered w-full h-96" :value="csvResult"></textarea>
          
          <!-- HTML 포맷 -->
          <div v-else-if="resultFormat === 'html'" class="textarea textarea-bordered w-full h-96 overflow-auto">
            <div class="p-4 font-mono text-sm">
              <div v-for="(row, rowIndex) in finalResults" :key="rowIndex" class="mb-2">
                <div v-if="showLineNumbers" class="text-xs text-gray-500 mb-1">라인 {{ rowIndex + 1 }}:</div>
                <div class="bg-white p-2 rounded border">
                  <table class="w-full border-collapse">
                    <tr>
                      <td v-for="(cell, colIndex) in row" :key="colIndex" class="border border-gray-300 px-2 py-1 text-xs">
                        {{ cell }}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-2 text-sm text-gray-600">
          총 {{ finalResults.length }}개 행
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const input = ref('')
const isProcessing = ref(false)
const selectedPreset = ref('')
const showLineNumbers = ref(true)
const removeDuplicates = ref(false)
const customSeparator = ref('')
const resultFormat = ref('json')
const selectedColumns = ref('')

// 프리셋 패턴 정의
const presetPatterns = {
  'comma-separated': {
    description: '쉼표로 구분된 값들 추출'
  },
  'semicolon-separated': {
    description: '세미콜론으로 구분된 값들 추출'
  },
  'pipe-separated': {
    description: '파이프(|)로 구분된 값들 추출'
  },
  'tab-separated': {
    description: '탭으로 구분된 값들 추출'
  },
  'space-separated': {
    description: '공백으로 구분된 값들 추출'
  },
  'underscore-separated': {
    description: '언더바(_)로 구분된 값들 추출'
  },
  'dot-separated': {
    description: '마침표(.)로 구분된 값들 추출'
  }
}

// 구분자 패턴일 때 각 행별 결과
const separatorResults = computed(() => {
  // 줄바꿈 문자를 정규화 (Windows의 \r\n도 처리)
  const normalizedInput = input.value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalizedInput.split('\n').filter(line => line.trim() !== '')
  const separator = getSeparator()
  
  return lines.map((line, index) => {
    return line.split(separator).map(cell => cell.trim()).filter(cell => cell !== '')
  })
})

// 최종 결과
const finalResults = computed(() => {
  const results = separatorResults.value
  
  // 선택된 열만 필터링
  let filteredResults = results
  if (selectedColumns.value.trim()) {
    const columnIndices = selectedColumns.value.split(',').map(s => parseInt(s.trim()) - 1).filter(i => !isNaN(i) && i >= 0)
    if (columnIndices.length > 0) {
      filteredResults = results.map(row => {
        return columnIndices.map(index => row[index] || '').filter(cell => cell !== '')
      })
    }
  }
  
  if (removeDuplicates.value) {
    // 각 행의 내용을 문자열로 변환하여 중복 제거
    const uniqueRows = []
    const seen = new Set()
    
    filteredResults.forEach(row => {
      const rowString = row.join('|')
      if (!seen.has(rowString)) {
        seen.add(rowString)
        uniqueRows.push(row)
      }
    })
    
    return uniqueRows
  }
  return filteredResults
})

// 입력 텍스트를 줄 단위로 분리
const inputLines = computed(() => {
  return input.value.split('\n').filter(line => line.trim() !== '')
})

// 구분자 패턴에 따른 실제 구분자 반환
const getSeparator = () => {
  if (selectedPreset.value === 'custom') {
    return customSeparator.value || ','
  }
  
  if (!selectedPreset.value) return ','
  
  const separatorMap = {
    'comma-separated': ',',
    'semicolon-separated': ';',
    'pipe-separated': '|',
    'tab-separated': '\t',
    'space-separated': ' ',
    'underscore-separated': '_',
    'dot-separated': '.'
  }
  
  return separatorMap[selectedPreset.value] || ','
}

// 입력이나 정규식 패턴 변경 시 처리 상태 관리
watch([input, selectedPreset, customSeparator, removeDuplicates, showLineNumbers, resultFormat, selectedColumns], () => {
  isProcessing.value = true
  // 처리 시뮬레이션을 위한 짧은 지연
  setTimeout(() => {
    isProcessing.value = false
  }, 200)
}, { deep: true })

const applyPreset = () => {
  // 구분자 패턴은 별도 처리가 필요 없음
}

const clearPreset = () => {
  selectedPreset.value = ''
  customSeparator.value = ''
}

const clearInput = () => {
  input.value = ''
}

const copyResults = () => {
  let textToCopy = ''
  
  switch (resultFormat.value) {
    case 'json':
      textToCopy = finalResults.value.map(row => JSON.stringify(row)).join('\n')
      break
    case 'text':
      textToCopy = finalResults.value.map(row => row.join(' | ')).join('\n')
      break
    case 'excel':
      textToCopy = finalResults.value.map(row => row.join('\t')).join('\n')
      break
    case 'csv':
      textToCopy = finalResults.value.map(row => row.map(cell => `\"${cell}\"`).join(',')).join('\n')
      break
    case 'html':
      textToCopy = `<table>\n${finalResults.value.map(row => 
        `  <tr>\n${row.map(cell => `    <td>${cell}</td>`).join('\n')}\n  </tr>`
      ).join('\n')}\n</table>`
      break
    default:
      textToCopy = finalResults.value.map(row => JSON.stringify(row)).join('\n')
  }
  
  // 클립보드에 복사
  navigator.clipboard.writeText(textToCopy).then(() => {
    // 복사 성공 알림 (선택사항)
    console.log('결과가 클립보드에 복사되었습니다.')
  }).catch(err => {
    console.error('복사 실패:', err)
  })
}

const clearColumnSelection = () => {
  selectedColumns.value = ''
}

const jsonResult = computed(() => {
  if (showLineNumbers.value) {
    return finalResults.value.map((row, idx) => `${idx + 1}. ${JSON.stringify(row)}`).join('\n')
  } else {
    return finalResults.value.map(row => JSON.stringify(row)).join('\n')
  }
})
const textResult = computed(() => {
  if (showLineNumbers.value) {
    return finalResults.value.map((row, idx) => `${idx + 1}. ${row.join(' | ')}`).join('\n')
  } else {
    return finalResults.value.map(row => row.join(' | ')).join('\n')
  }
})
const excelResult = computed(() => {
  if (showLineNumbers.value) {
    return finalResults.value.map((row, idx) => `${idx + 1}. ${row.join('\t')}`).join('\n')
  } else {
    return finalResults.value.map(row => row.join('\t')).join('\n')
  }
})
const csvResult = computed(() => {
  if (showLineNumbers.value) {
    return finalResults.value.map((row, idx) => `${idx + 1}. ${row.map(cell => `"${cell}"`).join(',')}`).join('\n')
  } else {
    return finalResults.value.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }
})
</script>

<style scoped>
.textarea {
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  font-size: 0.9rem;
}
</style> 
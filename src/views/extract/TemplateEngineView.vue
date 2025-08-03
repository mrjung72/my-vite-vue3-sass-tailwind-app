<template>
  <div class="max-w-6xl mx-auto px-4 pt-4 pb-2">
    <div class="mb-2">
      <label class="block font-bold mb-1">템플릿 엔진 - CSV 데이터를 템플릿 형식으로 변환</label>
      <div class="text-sm text-gray-500 mt-1">
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="showLineNumbers" class="checkbox checkbox-xs mr-1" />
          라인번호 표시
        </label>
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="headerRow" class="checkbox checkbox-xs mr-1" />
          첫 번째 행을 헤더로 사용
        </label>
        <label class="inline-flex items-center mr-3">
          <input type="checkbox" v-model="skipEmptyRows" class="checkbox checkbox-xs mr-1" />
          빈 행 건너뛰기
        </label>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 왼쪽: 템플릿과 CSV 입력 -->
      <div class="space-y-4">
        <!-- 템플릿 입력 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block font-bold">템플릿</label>
            <div class="flex gap-2">
              <select 
                v-model="selectedTemplate" 
                class="select select-bordered select-sm"
                @change="applyTemplate"
              >
                <option value="">템플릿 선택</option>
                <option value="custom">직접 입력</option>
                <option value="greeting">인사말</option>
                <option value="email">이메일</option>
                <option value="sql-insert">SQL INSERT</option>
                <option value="json">JSON</option>
                <option value="html-table">HTML 테이블 행</option>
              </select>
              <button @click="clearTemplate" class="btn btn-sm btn-outline">초기화</button>
            </div>
          </div>
          <textarea 
            v-model="template" 
            class="textarea textarea-bordered w-full h-32" 
            placeholder="템플릿을 입력하세요. 변수는 ${변수명} 형태로 사용 (예: 안녕하세요 ${name}님, 당신의 나이는 ${age}세입니다.)"
          ></textarea>
          <div v-if="selectedTemplate && templatePresets[selectedTemplate]" class="text-sm text-blue-600 mt-1">
            💡 {{ templatePresets[selectedTemplate].description }}
          </div>
        </div>

        <!-- CSV 데이터 입력 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block font-bold">CSV 데이터</label>
            <div class="flex gap-2">
              <select 
                v-model="csvSeparator" 
                class="select select-bordered select-sm"
              >
                <option value=",">쉼표(,)</option>
                <option value=";">세미콜론(;)</option>
                <option value="\t">탭</option>
                <option value="|">파이프(|)</option>
              </select>
              <button @click="clearCsvData" class="btn btn-sm btn-outline">초기화</button>
            </div>
          </div>
          <textarea 
            v-model="csvData" 
            class="textarea textarea-bordered w-full h-48" 
            placeholder="CSV 데이터를 입력하세요&#10;예:&#10;name,age&#10;홍길동,30&#10;김철수,25&#10;이영희,28"
          ></textarea>
          <div class="mt-2 text-sm text-gray-600">
            총 {{ csvRows.length }}개 행 ({{ headerRow ? '헤더 포함' : '헤더 제외' }})
            <span v-if="headerRow && csvHeaders.length > 0" class="ml-2">
              • 변수: {{ csvHeaders.join(', ') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 결과 출력 -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block font-bold">생성된 결과</label>
          <div class="flex gap-2">
            <select 
              v-model="outputFormat" 
              class="select select-bordered select-sm"
            >
              <option value="text">텍스트</option>
              <option value="html">HTML</option>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            <button @click="copyResults" class="btn btn-sm btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              복사
            </button>
          </div>
        </div>
        
        <div v-if="isProcessing" class="textarea textarea-bordered w-full h-96 bg-base-200 flex items-center justify-center">
          <div class="flex items-center gap-2 text-gray-400">
            <span class="loading loading-spinner loading-sm"></span>
            처리 중...
          </div>
        </div>
        <div v-else class="relative">
          <!-- 텍스트 출력 -->
          <textarea 
            v-if="outputFormat === 'text'" 
            readonly 
            class="textarea textarea-bordered w-full h-96" 
            :value="textOutput"
          ></textarea>
          
          <!-- HTML 출력 -->
          <div v-else-if="outputFormat === 'html'" class="textarea textarea-bordered w-full h-96 overflow-auto">
            <div class="p-4" v-html="htmlOutput"></div>
          </div>
          
          <!-- JSON 출력 -->
          <textarea 
            v-else-if="outputFormat === 'json'" 
            readonly 
            class="textarea textarea-bordered w-full h-96" 
            :value="jsonOutput"
          ></textarea>
          
          <!-- CSV 출력 -->
          <textarea 
            v-else-if="outputFormat === 'csv'" 
            readonly 
            class="textarea textarea-bordered w-full h-96" 
            :value="csvOutput"
          ></textarea>
        </div>
        
        <div class="mt-2 text-sm text-gray-600">
          총 {{ processedResults.length }}개 결과 생성됨
        </div>
      </div>
    </div>

    <!-- 사용법 안내 -->
    <div class="mt-6 p-4 bg-base-200 rounded-lg">
      <h3 class="font-bold mb-2">💡 사용법</h3>
      <div class="text-sm space-y-1">
        <p><strong>1. 템플릿 작성:</strong> ${변수명} 형태로 변수를 사용하세요. (예: 안녕하세요 ${name}님!)</p>
        <p><strong>2. CSV 데이터:</strong> 첫 번째 행에 변수명(헤더)을 입력하고, 그 아래에 데이터를 입력하세요.</p>
        <p><strong>3. 결과 확인:</strong> 각 데이터 행이 템플릿에 적용되어 반복 생성됩니다.</p>
        <p><strong>예시:</strong> 템플릿 "Hello ${name}, you are ${age} years old." + CSV "name,age\nJohn,25\nJane,30"</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const template = ref('')
const csvData = ref('')
const isProcessing = ref(false)
const showLineNumbers = ref(false)
const headerRow = ref(true)
const skipEmptyRows = ref(true)
const csvSeparator = ref(',')
const selectedTemplate = ref('')
const outputFormat = ref('text')

// 템플릿 프리셋
const templatePresets = {
  'greeting': {
    template: '안녕하세요 ${name}님, 당신의 나이는 ${age}세입니다.',
    description: '기본 인사말 템플릿'
  },
  'email': {
    template: 'To: ${email}\nSubject: ${subject}\n\n안녕하세요 ${name}님,\n\n${message}\n\n감사합니다.',
    description: '이메일 형식 템플릿'
  },
  'sql-insert': {
    template: "INSERT INTO users (name, age, email) VALUES ('${name}', ${age}, '${email}');",
    description: 'SQL INSERT 구문 템플릿'
  },
  'json': {
    template: '{\n  "name": "${name}",\n  "age": ${age},\n  "email": "${email}"\n}',
    description: 'JSON 객체 템플릿'
  },
  'html-table': {
    template: '<tr><td>${name}</td><td>${age}</td><td>${email}</td></tr>',
    description: 'HTML 테이블 행 템플릿'
  }
}

// CSV 데이터를 행으로 분리
const csvRows = computed(() => {
  if (!csvData.value.trim()) return []
  
  const lines = csvData.value.trim().split('\n')
  return lines
    .filter(line => !skipEmptyRows.value || line.trim() !== '')
    .map(line => {
      // CSV 파싱 (간단한 버전)
      const separator = csvSeparator.value === '\t' ? '\t' : csvSeparator.value
      return line.split(separator).map(cell => cell.trim().replace(/^["']|["']$/g, ''))
    })
})

// CSV 헤더
const csvHeaders = computed(() => {
  if (!headerRow.value || csvRows.value.length === 0) return []
  return csvRows.value[0]
})

// CSV 데이터 (헤더 제외)
const csvDataRows = computed(() => {
  if (!headerRow.value) return csvRows.value
  return csvRows.value.slice(1)
})

// 템플릿 처리 결과
const processedResults = computed(() => {
  if (!template.value.trim() || csvDataRows.value.length === 0) return []
  
  return csvDataRows.value.map((row, index) => {
    let result = template.value
    
    // 변수 치환
    if (headerRow.value && csvHeaders.value.length > 0) {
      // 헤더가 있는 경우 변수명 사용
      csvHeaders.value.forEach((header, colIndex) => {
        const value = row[colIndex] || ''
        const pattern = new RegExp(`\\$\\{${header}\\}`, 'g')
        result = result.replace(pattern, value)
      })
    } else {
      // 헤더가 없는 경우 인덱스 사용 (col0, col1, col2...)
      row.forEach((value, colIndex) => {
        const pattern = new RegExp(`\\$\\{col${colIndex}\\}`, 'g')
        result = result.replace(pattern, value)
      })
    }
    
    return {
      index: index + 1,
      result: result,
      originalRow: row
    }
  })
})

// 텍스트 출력
const textOutput = computed(() => {
  if (processedResults.value.length === 0) return ''
  
  return processedResults.value.map((item, index) => {
    if (showLineNumbers.value) {
      return `${index + 1}. ${item.result}`
    }
    return item.result
  }).join('\n')
})

// HTML 출력
const htmlOutput = computed(() => {
  if (processedResults.value.length === 0) return ''
  
  return processedResults.value.map((item, index) => {
    const lineNumber = showLineNumbers.value ? `<span class="text-gray-500 text-xs">${index + 1}. </span>` : ''
    return `<div class="mb-2 p-2 bg-white rounded border">${lineNumber}${item.result}</div>`
  }).join('')
})

// JSON 출력
const jsonOutput = computed(() => {
  if (processedResults.value.length === 0) return ''
  
  const jsonData = processedResults.value.map((item, index) => ({
    line: showLineNumbers.value ? index + 1 : undefined,
    result: item.result,
    originalData: headerRow.value && csvHeaders.value.length > 0 
      ? Object.fromEntries(csvHeaders.value.map((header, i) => [header, item.originalRow[i] || '']))
      : item.originalRow
  }))
  
  return JSON.stringify(jsonData, null, 2)
})

// CSV 출력
const csvOutput = computed(() => {
  if (processedResults.value.length === 0) return ''
  
  const separator = csvSeparator.value === '\t' ? '\t' : csvSeparator.value
  let output = ''
  
  // 헤더
  if (showLineNumbers.value) {
    output += `"Line"${separator}"Result"${separator}"Original Data"\n`
  } else {
    output += `"Result"${separator}"Original Data"\n`
  }
  
  // 데이터
  processedResults.value.forEach((item, index) => {
    const lineNum = showLineNumbers.value ? `"${index + 1}"${separator}` : ''
    const result = `"${item.result.replace(/"/g, '""')}"`
    const original = `"${item.originalRow.join('; ').replace(/"/g, '""')}"`
    output += `${lineNum}${result}${separator}${original}\n`
  })
  
  return output
})

// 입력 변경 시 처리 상태 관리
watch([template, csvData, headerRow, skipEmptyRows, csvSeparator, showLineNumbers, outputFormat], () => {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
  }, 200)
}, { deep: true })

const applyTemplate = () => {
  if (selectedTemplate.value && templatePresets[selectedTemplate.value]) {
    template.value = templatePresets[selectedTemplate.value].template
  }
}

const clearTemplate = () => {
  template.value = ''
  selectedTemplate.value = ''
}

const clearCsvData = () => {
  csvData.value = ''
}

const copyResults = () => {
  let textToCopy = ''
  
  switch (outputFormat.value) {
    case 'text':
      textToCopy = textOutput.value
      break
    case 'html':
      textToCopy = htmlOutput.value
      break
    case 'json':
      textToCopy = jsonOutput.value
      break
    case 'csv':
      textToCopy = csvOutput.value
      break
    default:
      textToCopy = textOutput.value
  }
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    console.log('결과가 클립보드에 복사되었습니다.')
  }).catch(err => {
    console.error('복사 실패:', err)
  })
}

// 초기 샘플 데이터
template.value = '안녕하세요 ${name}님, 당신의 나이는 ${age}세입니다.'
csvData.value = `name,age
홍길동,30
김철수,25
이영희,28`
</script>

<style scoped>
.textarea {
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  font-size: 0.9rem;
}
</style>
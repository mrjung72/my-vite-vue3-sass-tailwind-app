<template>
  <div class="p-4">
    <input type="file" @change="handleFileUpload" accept=".csv" />
    <button class="btn btn-primary mt-2" @click="submitFile" :disabled="!file">업로드</button>
    <div v-if="message" class="mt-2 text-green-500">{{ message }}</div>
    <div v-if="error" class="mt-2 text-red-500">{{ error }}</div>
		<div class="text-base-content/70 mb-10"></div>
		<div class="text-base-content/100 mb-1">
      <p><a href="/샘플파일/사용자정보_샘플.csv" download="사용자정보_샘플.csv" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">사용자 매뉴얼 다운로드</a>을 다운로드 후 작성해 주세요</p>
			<p>파일타입은 euc-kr로 맞춰주세요!</p>
			<p>1번째 줄에는 타이틀을 영문으로 정의해 주세요!</p>
		</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'


const file = ref(null)
const message = ref('')
const error = ref('')

const handleFileUpload = (e) => {
  file.value = e.target.files[0]
}

const submitFile = async () => {
  if (!file.value) return

  const formData = new FormData()
  formData.append('file', file.value)

  try {
    const res = await axios.post('/api/upload/members', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    message.value = res.data.message
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || '업로드 실패'
    message.value = ''    
  }
}
</script>

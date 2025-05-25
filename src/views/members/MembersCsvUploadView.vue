<template>
  <div class="max-w-xl mx-auto mt-12 p-6 rounded-2xl shadow-xl bg-white dark:bg-base-200 transition">
    <h2 class="text-2xl font-bold text-center mb-6 text-primary">📄 회원정보 CSV 업로드</h2>

    <label class="form-control w-full mb-5">
      <div class="label">
        <span class="label-text font-medium">CSV 파일 선택</span>
      </div>
      <input
        type="file"
        class="file-input file-input-bordered w-full"
        accept=".csv"
        @change="handleFileUpload"
      />
    </label>

    <button
      class="btn btn-primary w-full"
      :disabled="!file"
      @click="submitFile"
    >
      📤 업로드
    </button>

    <div v-if="message" class="alert alert-success mt-4">
      ✅ {{ message }}
    </div>

    <div v-if="error" class="alert alert-error mt-4">
      ❌ {{ error }}
    </div>

    <div class="divider my-6"></div>

    <div class="text-sm opacity-80 space-y-2">
      <p>
        📎
        <a
          href="/샘플파일/사용자정보_샘플.csv"
          download="사용자정보_샘플.csv"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 hover:underline"
        >
          사용자 매뉴얼 다운로드
        </a>
        후 작성해주세요.
      </p>
      <ul class="list-disc pl-5 text-sm space-y-1">
        <li>파일 인코딩은 현재 <strong>euc-kr</strong>로 설정 되어 있습니다. 바꾸지 마세요!</li>
        <li>첫 줄에 영문 컬럼명은 수정하지 마세요 (변경시 업로드시 오류 발생할 수 있음.)</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const file = ref(null)
const message = ref('')
const error = ref('')

const handleFileUpload = (e) => {
  const uploaded = e.target.files[0]
  if (uploaded && uploaded.name.endsWith('.csv')) {
    file.value = uploaded
    error.value = ''
  } else {
    file.value = null
    error.value = 'CSV 형식의 파일만 업로드 가능합니다.'
  }
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
    message.value = res.data.message || '업로드 성공'
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || '업로드 중 오류 발생'
    message.value = ''
  }
}
</script>

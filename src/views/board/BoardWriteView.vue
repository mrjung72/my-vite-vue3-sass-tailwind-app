<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">게시글 작성</h2>
    <form @submit.prevent="addPost" class="mb-8 bg-base-200 p-4 rounded-xl shadow" enctype="multipart/form-data">
      <div class="mb-2">
        <input v-model="newPost.title" class="input input-bordered w-full" placeholder="제목" required />
      </div>
      <div class="mb-2">
        <textarea v-model="newPost.content" class="textarea textarea-bordered w-full" placeholder="내용" required></textarea>
      </div>
      <div class="mb-2">
        <label class="label">
          <span class="label-text">첨부파일 (최대 5개, 각 10MB 이하)</span>
        </label>
        <input 
          type="file" 
          @change="handleFileUpload" 
          multiple
          accept="*/*"
          class="file-input file-input-bordered w-full" 
        />
        <div v-if="selectedFiles.length > 0" class="mt-2">
          <div class="text-sm font-medium mb-1">선택된 파일:</div>
          <div class="space-y-1">
            <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between p-2 bg-base-100 rounded">
              <span class="text-sm truncate">{{ file.name }}</span>
              <span class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</span>
              <button type="button" @click="removeFile(index)" class="btn btn-xs btn-error">삭제</button>
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary w-full" type="submit" :disabled="loading">{{ loading ? '등록 중...' : '글 등록' }}</button>
      <div v-if="message" class="alert alert-success mt-2">{{ message }}</div>
      <div v-if="error" class="alert alert-error mt-2">{{ error }}</div>
    </form>
    <div class="text-right">
      <router-link to="/board" class="btn btn-outline">목록으로</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const token = localStorage.getItem('token')

const newPost = ref({ title: '', content: '' })
const selectedFiles = ref([])
const loading = ref(false)
const message = ref('')
const error = ref('')

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function handleFileUpload(e) {
  const files = Array.from(e.target.files);
  
  // 파일 개수 제한 (5개)
  if (selectedFiles.value.length + files.length > 5) {
    alert('최대 5개까지만 첨부할 수 있습니다.');
    return;
  }
  
  // 파일 크기 제한 (각 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  const oversizedFiles = files.filter(file => file.size > maxSize);
  if (oversizedFiles.length > 0) {
    alert('10MB 이하의 파일만 첨부할 수 있습니다.');
    return;
  }
  
  selectedFiles.value.push(...files);
}

function removeFile(index) {
  selectedFiles.value.splice(index, 1);
}

async function addPost() {
  if (!newPost.value.title || !newPost.value.content) return
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('title', newPost.value.title)
    formData.append('content', newPost.value.content)
    
    // 다중 파일 추가
    selectedFiles.value.forEach(file => {
      formData.append('files', file)
    })
    
    const res = await axios.post('/api/board', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })
    message.value = res.data.message || '글이 등록되었습니다.'
    setTimeout(() => router.push('/board'), 1000)
  } catch (err) {
    error.value = err.response?.data?.message || '글 등록에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
</style> 
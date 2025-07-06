<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">게시글 수정</h2>
    <form @submit.prevent="editPost" class="mb-8 bg-base-200 p-4 rounded-xl shadow" enctype="multipart/form-data">
      <div class="mb-2">
        <input v-model="form.title" class="input input-bordered w-full" placeholder="제목" required />
      </div>
      <div class="mb-2">
        <textarea v-model="form.content" class="textarea textarea-bordered w-full" placeholder="내용" required></textarea>
      </div>
      <div class="mb-2">
        <label class="label">
          <span class="label-text">기존 첨부파일</span>
        </label>
        <div v-if="form.files && form.files.length > 0" class="space-y-2 mb-4">
          <div v-for="file in form.files" :key="file.file_id" class="flex items-center justify-between p-3 bg-base-100 rounded">
            <div class="flex items-center gap-2">
              <span class="text-sm">{{ file.origin_filename }}</span>
              <span class="text-xs text-gray-500">({{ formatFileSize(file.file_size) }})</span>
            </div>
            <div class="flex gap-2">
              <a :href="`/api/board/download/${file.file_id}`" target="_blank" class="btn btn-xs btn-outline">
                다운로드
              </a>
              <button type="button" @click="removeExistingFile(file.file_id)" class="btn btn-xs btn-error">
                삭제
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 mb-4">첨부된 파일이 없습니다.</div>
        
        <label class="label">
          <span class="label-text">새 파일 추가 (최대 5개, 각 10MB 이하)</span>
        </label>
        <input 
          type="file" 
          @change="handleFileUpload" 
          multiple
          accept="*/*"
          class="file-input file-input-bordered w-full" 
        />
        <div v-if="selectedFiles.length > 0" class="mt-2">
          <div class="text-sm font-medium mb-1">추가할 파일:</div>
          <div class="space-y-1">
            <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between p-2 bg-base-100 rounded">
              <span class="text-sm truncate">{{ file.name }}</span>
              <span class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</span>
              <button type="button" @click="removeFile(index)" class="btn btn-xs btn-error">삭제</button>
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary w-full" type="submit" :disabled="loading">{{ loading ? '수정 중...' : '수정 저장' }}</button>
      <div v-if="message" class="alert alert-success mt-2">{{ message }}</div>
      <div v-if="error" class="alert alert-error mt-2">{{ error }}</div>
    </form>
    <div class="text-right">
      <router-link :to="`/board/${form.board_id}`" class="btn btn-outline">취소</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const token = localStorage.getItem('token')

const form = ref({ title: '', content: '', board_id: '', files: [] })
const selectedFiles = ref([])
const filesToDelete = ref([])
const loading = ref(false)
const message = ref('')
const error = ref('')

const fetchPost = async () => {
  try {
    const res = await axios.get(`/api/board/${route.params.id}`)
    form.value = { ...res.data }
  } catch (err) {
    error.value = err.response?.data?.message || '게시글을 불러오는 데 실패했습니다.'
  }
}

onMounted(fetchPost)

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
  const currentFileCount = (form.value.files?.length || 0) - filesToDelete.value.length;
  if (currentFileCount + selectedFiles.value.length + files.length > 5) {
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

function removeExistingFile(fileId) {
  if (confirm('이 파일을 삭제하시겠습니까?')) {
    filesToDelete.value.push(fileId);
  }
}

async function editPost() {
  if (!form.value.title || !form.value.content) return
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('content', form.value.content)
    
    // 삭제할 파일 ID들 추가
    if (filesToDelete.value.length > 0) {
      formData.append('deleteFiles', JSON.stringify(filesToDelete.value))
    }
    
    // 새 파일들 추가 - 한글 파일명 지원
    selectedFiles.value.forEach(file => {
      // 파일명을 UTF-8로 인코딩하여 추가
      const blob = new Blob([file], { type: file.type });
      formData.append('files', blob, file.name);
    })
    
    const res = await axios.put(`/api/board/${form.value.board_id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })
    message.value = res.data.message || '수정되었습니다.'
    setTimeout(() => router.push(`/board/${form.value.board_id}`), 1000)
  } catch (err) {
    error.value = err.response?.data?.message || '수정에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
</style> 
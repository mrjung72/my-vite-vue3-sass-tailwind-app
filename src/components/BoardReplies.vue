<template>
    <div class="mt-8">
      <h3 class="font-bold mb-2">댓글</h3>
      <div v-if="replies.length === 0" class="text-gray-400 mb-2">아직 댓글이 없습니다.</div>
      <div v-for="reply in replies" :key="reply.reply_id" class="border-b py-2">
        <div class="text-sm text-gray-600">{{ reply.userid }} | {{ reply.createdAt }}</div>
        <div class="mb-1">{{ reply.content }}</div>
        <button v-if="auth.user && (auth.user.userid === reply.userid || auth.user.isAdmin)" class="btn btn-xs btn-error" @click="deleteReply(reply.reply_id)">삭제</button>
      </div>
      <form v-if="auth.user" @submit.prevent="addReply" class="mt-4 flex gap-2">
        <input v-model="newReply" class="input input-sm input-bordered flex-1" placeholder="댓글을 입력하세요" required />
        <button class="btn btn-sm btn-primary" type="submit">등록</button>
      </form>
      <div v-else class="text-gray-400 mt-2">로그인 후 댓글 작성 가능</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import { useAuthStore } from '@/stores/auth'
  
  const props = defineProps({ boardId: Number })
  const auth = useAuthStore()
  const replies = ref([])
  const newReply = ref('')
  
  const fetchReplies = async () => {
    const res = await axios.get(`/api/board-replies/${props.boardId}`)
    replies.value = res.data
  }
  
  const addReply = async () => {
    if (!newReply.value) return
    await axios.post('/api/board-replies', {
      board_id: props.boardId,
      userid: auth.user.userid,
      content: newReply.value
    })
    newReply.value = ''
    await fetchReplies()
  }
  
  const deleteReply = async (reply_id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await axios.delete(`/api/board-replies/${reply_id}`)
    await fetchReplies()
  }
  
  onMounted(fetchReplies)
  </script>
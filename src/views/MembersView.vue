<template>
  <div class="p-6 max-w-4xl mx-auto grid gap-4 md:grid-cols-2">
    <!-- 회원 목록 -->
    <div>
      <h2 class="text-xl font-semibold mb-4">회원 목록</h2>
      <div class="grid gap-1">
        <div
          v-for="member in members"
          :key="member.id"
          class="p-2 bg-base-100 shadow-sm rounded text-sm cursor-pointer hover:bg-base-200"
          @click="selectMember(member)"
        >
          {{ member.name }} <span class="text-neutral-500">({{ member.email }})</span>
        </div>
      </div>
    </div>

    <!-- 회원 상세 정보 / 수정 -->
    <div v-if="selected" class="bg-base-100 p-4 rounded shadow text-sm">
      <h3 class="text-lg font-bold mb-2">회원 {{ isEditing ? '수정' : '상세 정보' }}</h3>

      <div v-if="isEditing" class="space-y-2">
        <label class="block">
          이름:
          <input v-model="editForm.name" class="input input-sm input-bordered w-full mt-1" />
        </label>
        <label class="block">
          이메일:
          <input v-model="editForm.email" class="input input-sm input-bordered w-full mt-1" />
        </label>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-sm btn-primary" @click="saveEdit">저장</button>
          <button class="btn btn-sm btn-outline" @click="cancelEdit">취소</button>
        </div>
      </div>

      <div v-else>
        <p><strong>이름:</strong> {{ selected.name }}</p>
        <p><strong>이메일:</strong> {{ selected.email }}</p>
        <p><strong>가입일:</strong> {{ selected.joined || '2024-01-01' }}</p>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-sm btn-outline" @click="startEdit">수정</button>
          <button class="btn btn-sm btn-error" @click="deleteMember">삭제</button>
          <button class="btn btn-sm btn-ghost" @click="selected = null">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const members = ref([
  { id: 1, name: '홍길동', email: 'hong@example.com', joined: '2024-01-01' },
  { id: 2, name: '김철수', email: 'kim@example.com', joined: '2024-03-15' }
])

const selected = ref(null)
const isEditing = ref(false)
const editForm = ref({ name: '', email: '' })

function selectMember(member) {
  selected.value = member
  isEditing.value = false
}

function startEdit() {
  isEditing.value = true
  editForm.value = { name: selected.value.name, email: selected.value.email }
}

function cancelEdit() {
  isEditing.value = false
}

function saveEdit() {
  selected.value.name = editForm.value.name
  selected.value.email = editForm.value.email
  isEditing.value = false
}

function deleteMember() {
  if (confirm('정말 삭제하시겠습니까?')) {
    members.value = members.value.filter(m => m.id !== selected.value.id)
    selected.value = null
  }
}
</script>

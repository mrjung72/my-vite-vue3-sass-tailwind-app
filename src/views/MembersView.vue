<template>
  <div class="p-6 max-w-4xl mx-auto grid gap-4 md:grid-cols-2">
    <!-- 회원 목록 -->
    <div>
      <h2 class="text-xl font-semibold mb-4">회원 목록</h2>
      <div class="grid gap-1 mb-2">
        <div
          v-for="member in paginatedMembers"
          :key="member.id"
          class="p-2 bg-base-100 shadow-sm rounded text-sm cursor-pointer hover:bg-base-200"
          :class="{ 'bg-primary text-primary-content': selected?.id === member.id }"
          @click="selectMember(member)"
        >
          {{ member.name }} <span class="text-neutral-500">({{ member.email }})</span>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div class="flex justify-center items-center gap-2 mt-2 text-sm">
        <button class="btn btn-xs" :disabled="currentPage === 1" @click="currentPage--">이전</button>
        <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-xs" :disabled="currentPage === totalPages" @click="currentPage++">다음</button>
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
import { ref, computed } from 'vue'

const members = ref([
  { id: 1, name: '홍길동', email: 'hong@example.com', joined: '2024-01-01' },
  { id: 2, name: '김철수', email: 'kim12@example.com', joined: '2021-03-15' },
  { id: 3, name: '김영희', email: 'kim78@example.com', joined: '2022-03-15' },
  { id: 4, name: '이순신', email: 'lee45@example.com', joined: '2023-03-15' },
  { id: 5, name: '강감찬', email: 'kang89@example.com', joined: '2014-03-15' },
  { id: 6, name: '신사임당', email: 'shin66@example.com', joined: '2004-03-15' },
  { id: 7, name: '세종대왕', email: 'sejong31@example.com', joined: '2012-01-15' },
  { id: 8, name: '이성계', email: 'lee77@example.com', joined: '2011-03-15' },
  { id: 9, name: '왕건', email: 'king56@example.com', joined: '2016-03-15' },
  { id: 10, name: '김구', email: 'kim91@example.com', joined: '2017-03-15' },
  { id: 11, name: '단군', email: 'dan04@example.com', joined: '2018-03-15' },
  { id: 12, name: '유관순', email: 'ryu82@example.com', joined: '2019-03-15' },
  { id: 13, name: '구운몽', email: 'goo99@example.com', joined: '2009-03-15' },
  { id: 14, name: '안중근', email: 'ahn39@example.com', joined: '2004-03-15' },
  { id: 15, name: '윤봉길', email: 'yun54@example.com', joined: '2002-03-15' },
  { id: 16, name: '서재필', email: 'seo64@example.com', joined: '2005-03-15' },
  { id: 17, name: '양만춘', email: 'yang22@example.com', joined: '2006-03-15' }
])

// 페이지네이션 관련
const currentPage = ref(1)
const pageSize = 10

const totalPages = computed(() => Math.ceil(members.value.length / pageSize))

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return members.value.slice(start, start + pageSize)
})

// 선택 및 편집 관련
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
  if (!editForm.value.name || !editForm.value.email) {
    alert('이름과 이메일을 모두 입력해주세요.')
    return
  }

  selected.value.name = editForm.value.name
  selected.value.email = editForm.value.email
  isEditing.value = false
}

function deleteMember() {
  if (confirm('정말 삭제하시겠습니까?')) {
    members.value = members.value.filter(m => m.id !== selected.value.id)
    selected.value = null

    // 삭제 후 현재 페이지가 비었으면 이전 페이지로 이동
    if ((currentPage.value - 1) * pageSize >= members.value.length) {
      currentPage.value = Math.max(1, currentPage.value - 1)
    }
  }
}
</script>

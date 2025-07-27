<script setup>
import { useRouter, useRoute } from "vue-router";
import ThemeControllerMini from "@/components/ThemeControllerMini.vue";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import { useAuthStore } from "@/stores/auth";
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { site } from "@/data/siteConfig.js";

const auth = useAuthStore()
const router = useRouter();
const route = useRoute()
const pendingCount = ref(0)
const badgePos = ref({ x: 0, y: 0 })
const dragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const mouseStart = ref({ x: 0, y: 0 })

const handleLogout = () => {
  auth.logout(router)
}

function goToPendingMembers() {
  if (auth.isLoggedIn && auth.user && auth.user.isAdmin == 1 && pendingCount.value > 0) {
    router.push({ path: '/members/list', query: { pending: 1 } })
  }
}

async function fetchPendingCount() {
  if (auth.isLoggedIn && auth.user && auth.user.isAdmin == 1) {
    try {
      const res = await axios.get('/api/members/pending-count', {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      pendingCount.value = res.data.count
    } catch (e) {
      pendingCount.value = 0
    }
  } else {
    pendingCount.value = 0
  }
}

function onBadgeMouseDown(e) {
  dragging.value = true
  dragStart.value = { ...badgePos.value }
  mouseStart.value = { x: e.clientX, y: e.clientY }
  document.addEventListener('mousemove', onBadgeMouseMove)
  document.addEventListener('mouseup', onBadgeMouseUp)
}
function onBadgeMouseMove(e) {
  if (!dragging.value) return
  badgePos.value.x = dragStart.value.x + (e.clientX - mouseStart.value.x)
  badgePos.value.y = dragStart.value.y + (e.clientY - mouseStart.value.y)
}
function onBadgeMouseUp() {
  dragging.value = false
  document.removeEventListener('mousemove', onBadgeMouseMove)
  document.removeEventListener('mouseup', onBadgeMouseUp)
}

onMounted(fetchPendingCount)
watch(() => route.fullPath, fetchPendingCount)
</script>

<template>
	<div class="navbar bg-base-100 shadow-sm py-1 min-h-[48px]">
		<div class="inline-flex gap-x-2">
			<div class="dropdown">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
					</svg>
				</div>
				<ul
					tabindex="0"
					class="menu menu-lg dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
					<li v-if="auth.isLoggedIn && auth.user"><a href="/servers/list">서버목록</a></li>
					<li v-if="auth.isLoggedIn && auth.user"><a href="/servers/dblist">DB목록</a></li>
					<li v-if="auth.isLoggedIn && auth.user"><a href="/board">게시판</a></li>
				</ul>
			</div>
		</div>
		<div class="flex-1 w-auto">
			<router-link :to="{ name: 'home' }" class="text-xl">{{ site.name }}</router-link>
		</div>


		<div class="inline-flex flex-none gap-x-2">

			<p v-if="auth.isLoggedIn && auth.user">
				<a href="/myinfoview">👤 {{ auth.user?.name }} ({{ auth.user?.userid }})</a>
			</p>
			<button
				v-if="auth.isLoggedIn"
				class="btn btn-sm btn-outline"
				@click="handleLogout"
			>
				로그아웃
			</button>
			<router-link
				v-if="!auth.isLoggedIn"
				:to="{ name: 'login' }"
				class="btn btn-ghost"
				:class="{ 'btn-active': router.currentRoute.value.name === 'login' }"
			>로그인</router-link>
			<router-link
				v-if="!auth.isLoggedIn"
				:to="{ name: 'members-register' }"
				class="btn btn-ghost"
				:class="{ 'btn-active': router.currentRoute.value.name === 'members-register' }"
			>회원가입</router-link>

			<ThemeControllerMini class="mx-2"/>

			<button class="btn btn-ghost btn-circle">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</button>
			<div v-if="auth.isLoggedIn && auth.user && auth.user.isAdmin == 1 && pendingCount > 0" class="tooltip" data-tip="미승인 회원 대기중">
				<button class="btn btn-ghost btn-circle" @click="goToPendingMembers" :title="'미승인 회원 보기'">
					<span class="indicator">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
						<span
							class="badge badge-error indicator-item text-xs px-2 py-0.5 shadow cursor-move"
							:style="`position: absolute; right: 1px; top: 1px; transform: translate(${badgePos.x}px, ${badgePos.y}px); z-index: 50; user-select: none;`"
							@mousedown="onBadgeMouseDown"
						>
							미승인 회원 {{ pendingCount }}명
						</span>
					</span>
				</button>
			</div>
			<div v-else class="tooltip" data-tip="알림 없음.">
				<button class="btn btn-ghost btn-circle" @click="goToPendingMembers" :title="'알림이 없습니다.'">
					<span class="indicator">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
					</span>
				</button>
			</div>
		</div>
	</div>

	<Breadcrumbs/>
</template>

<style scoped lang="scss">

</style>
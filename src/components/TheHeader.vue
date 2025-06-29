<script setup>
import { useRouter } from "vue-router";
import ThemeControllerMini from "@/components/ThemeControllerMini.vue";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore()
const router = useRouter();
const title = '사하라 홈';

const handleLogout = () => {
  auth.logout(router)
}
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
					<li v-if="auth.isLoggedIn && auth.user"><a href="/members/list">회원목록</a></li>
					<li v-if="auth.isLoggedIn && auth.user"><a href="/servers/list">서버목록</a></li>
					<li v-if="auth.isLoggedIn && auth.user && auth.user.isAdmin == 1"><a href="/members/csv-register">회원정보파일 업로드</a></li>
					<li v-if="auth.isLoggedIn && auth.user && auth.user.isAdmin == 1"><a href="/servers/csv-register">서버정보파일 업로드</a></li>
				</ul>
			</div>
		</div>
		<div class="flex-1 w-auto">
			<router-link :to="{ name: 'home' }" class="text-xl">{{ title }}</router-link>
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
			<button class="btn btn-ghost btn-circle">
				<span class="indicator">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
					<span class="badge badge-xs badge-primary indicator-item"></span>
				</span>
			</button>
		</div>
	</div>

	<Breadcrumbs/>
</template>

<style scoped lang="scss">

</style>
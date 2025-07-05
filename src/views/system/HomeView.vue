<script setup>
import TemplatePackages from "@/components/Home/TemplatePackages.vue";
import ThemeController from "@/components/Home/ThemeController.vue";
import ComponentsPreview from "@/components/Home/ComponentsPreview.vue";
import Guide from "@/components/Home/Guide.vue";

const title = "사하라 홈";
const currentHostname = window.location.hostname;
const demoHostname = "tpl-vue3-tailwind4-daisyui5.brown.sk";
const githubRepo = "https://github.com/martinille/starter-template-vite-vue3-sass-tailwind4-daisyui5";
</script>

<template>
	<!-- Title -->
	<div class="container-center text-center">
		<h1 class="mb-8">🚀 {{ title }}</h1>
		<div class="text-base-content/70 mb-10">
			<p class="text-lg mb-4">
				<b>본 사이트는 개발자의 업무 효율 향상을 위한 플랫폼입니다. (시험 운영 중 ...)</b>
			</p>
			<p class="mb-4">
				<b>서버/DB 정보 조회, 텍스트 추출 도구 등의 기능을 제공하며, 향후 더 많은 기능이 추가될 예정 입니다.</b>
			</p>
		</div>
	</div>

	<!-- 주요 기능 소개 -->
	<div class="container-center mb-12">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- 서버 관리 -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body text-center">
					<div class="text-4xl mb-4">🖥️</div>
					<h3 class="card-title justify-center">서버 관리</h3>
					<p class="text-sm text-gray-600">
						서버 및 데이터베이트 정보 조회 및 엑셀/CSV 파일 다운로드 기능을 제공합니다.
					</p>
					<div class="card-actions justify-center mt-4">
						<router-link to="/servers/list" class="btn btn-sm">서버 목록</router-link>
						<router-link to="/servers/dblist" class="btn btn-sm">DB 목록</router-link>
						<router-link to="/servers/telnet-check-history" class="btn btn-sm">Telnet Check</router-link>
						<router-link to="/servers/db-check-history" class="btn btn-sm">DB접속 Check</router-link>
					</div>
				</div>
			</div>

			<!-- 텍스트 추출 도구 -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body text-center">
					<div class="text-4xl mb-4">🔍</div>
					<h3 class="card-title justify-center">텍스트 추출 도구</h3>
					<p class="text-sm text-gray-600">
						정규식 기반 추출기와 구분자 기반 추출기를 통해 다양한 형태의 데이터 추출 기능을 제공합니다.
					</p>
					<div class="card-actions justify-center mt-4">
						<router-link to="/extract-tables" class="btn btn-sm">테이블명 추출기</router-link>
						<router-link to="/extract-regex" class="btn btn-sm">정규식 추출기</router-link>
						<router-link to="/extract-separator" class="btn btn-sm">구분자 적용기</router-link>
					</div>
				</div>
			</div>

			<!-- 게시판 -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body text-center">
					<div class="text-4xl mb-4">💬</div>
					<h3 class="card-title justify-center">게시판</h3>
					<p class="text-sm text-gray-600">
						정보 교환을 위한 게시판을 기능을 제공합니다. <br>현재 시험운영중인 관계로 등록한 게시글은 삭제 될 수 있습니다.
					</p>
					<div class="card-actions justify-center mt-4">
						<router-link to="/board" class="btn btn-sm">게시판</router-link>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 기술 스택 -->
	<div class="container-center mb-12">
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body text-center">
				<div class="text-4xl mb-4">🛠️</div>
				<h3 class="card-title justify-center">기술 스택</h3>
				<p class="text-sm text-gray-600 mb-2">
					Vite, Vue 3, Tailwind CSS, DaisyUI 등 최신 프론트엔드 기술을 사용합니다.
				</p>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
					<div class="p-4">
						<div class="text-2xl mb-2">⚡</div>
						<div class="font-semibold">Vue 3 + Vite</div>
						<div class="text-xs text-gray-500">프론트엔드</div>
					</div>
					<div class="p-4">
						<div class="text-2xl mb-2">🎨</div>
						<div class="font-semibold">Tailwind CSS</div>
						<div class="text-xs text-gray-500">스타일링</div>
					</div>
					<div class="p-4">
						<div class="text-2xl mb-2">🚀</div>
						<div class="font-semibold">Node.js</div>
						<div class="text-xs text-gray-500">백엔드</div>
					</div>
					<div class="p-4">
						<div class="text-2xl mb-2">🗄️</div>
						<div class="font-semibold">MariaDB</div>
						<div class="text-xs text-gray-500">데이터베이스</div>
					</div>
				</div>
				<div class="card-actions justify-center mt-4">
					<router-link to="/tech-stack-detail" class="btn btn-outline btn-info btn-sm">상세 보기</router-link>
				</div>
			</div>
		</div>
	</div>

</template>

<style scoped lang="scss">

</style>
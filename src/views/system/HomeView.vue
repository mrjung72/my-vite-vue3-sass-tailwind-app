<script setup>
import TemplatePackages from "@/components/Home/TemplatePackages.vue";
import ThemeController from "@/components/Home/ThemeController.vue";
import ComponentsPreview from "@/components/Home/ComponentsPreview.vue";
import Guide from "@/components/Home/Guide.vue";
import { site, home } from "@/data/siteConfig.js";

const currentHostname = window.location.hostname;
const demoHostname = "tpl-vue3-tailwind4-daisyui5.brown.sk";
const githubRepo = "https://github.com/martinille/starter-template-vite-vue3-sass-tailwind4-daisyui5";
</script>

<template>
	<!-- Title -->
	<div class="container-center text-center">
		<h1 class="mb-8">{{ home.title }}</h1>
		<div class="text-base-content/70 mb-10">
			<p class="text-lg mb-4">
				<b>{{ home.subtitle }}</b>
			</p>
			<p class="mb-4">
				<b>{{ home.description }}</b>
			</p>
		</div>
	</div>

	<!-- 주요 기능 소개 -->
	<div class="container-center mb-12">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- 서버 관리 -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body text-center">
					<div class="text-4xl mb-4">{{ home.features.serverManagement.icon }}</div>
					<h3 class="card-title justify-center">{{ home.features.serverManagement.title }}</h3>
					<p class="text-sm text-gray-600">
						{{ home.features.serverManagement.description }}
					</p>
					<div class="card-actions justify-center mt-4">
						<router-link 
							v-for="link in home.features.serverManagement.links" 
							:key="link.route"
							:to="link.route" 
							class="btn btn-sm"
						>
							{{ link.text }}
						</router-link>
					</div>
				</div>
			</div>

			<!-- 텍스트 추출 도구 -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body text-center">
					<div class="text-4xl mb-4">{{ home.features.textExtraction.icon }}</div>
					<h3 class="card-title justify-center">{{ home.features.textExtraction.title }}</h3>
					<p class="text-sm text-gray-600">
						{{ home.features.textExtraction.description }}
					</p>
					<div class="card-actions justify-center mt-4">
						<router-link 
							v-for="link in home.features.textExtraction.links" 
							:key="link.route"
							:to="link.route" 
							class="btn btn-sm"
						>
							{{ link.text }}
						</router-link>
					</div>
				</div>
			</div>

			<!-- 게시판 -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body text-center">
					<div class="text-4xl mb-4">{{ home.features.board.icon }}</div>
					<h3 class="card-title justify-center">{{ home.features.board.title }}</h3>
					<p class="text-sm text-gray-600">
						{{ home.features.board.description }}
					</p>
					<div class="card-actions justify-center mt-4">
						<router-link 
							v-for="link in home.features.board.links" 
							:key="link.route"
							:to="link.route" 
							class="btn btn-sm"
						>
							{{ link.text }}
						</router-link>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 기술 스택 -->
	<div class="container-center mb-12">
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body text-center">
				<div class="text-4xl mb-4">{{ home.techStack.icon }}</div>
				<h3 class="card-title justify-center">{{ home.techStack.title }}</h3>
				<p class="text-sm text-gray-600 mb-2">
					{{ home.techStack.description }}
				</p>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
					<div v-for="tech in home.techStack.technologies" :key="tech.name" class="p-4">
						<div class="text-2xl mb-2">{{ tech.icon }}</div>
						<div class="font-semibold">{{ tech.name }}</div>
						<div class="text-xs text-gray-500">{{ tech.category }}</div>
					</div>
				</div>
				<div class="card-actions justify-center mt-4">
					<router-link 
						:to="home.techStack.detailLink.route" 
						class="btn btn-outline btn-info btn-sm"
					>
						{{ home.techStack.detailLink.text }}
					</router-link>
				</div>
			</div>
		</div>
	</div>

</template>

<style scoped lang="scss">

</style>
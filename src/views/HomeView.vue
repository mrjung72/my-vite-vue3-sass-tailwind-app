<script setup>
import TemplatePackages from "@/components/Home/TemplatePackages.vue";
import ThemeController from "@/components/Home/ThemeController.vue";
import ComponentsPreview from "@/components/Home/ComponentsPreview.vue";
import Guide from "@/components/Home/Guide.vue";

const title = document.title;
const currentHostname = window.location.hostname;
const demoHostname = "tpl-vue3-tailwind4-daisyui5.brown.sk";
const githubRepo = "https://github.com/martinille/starter-template-vite-vue3-sass-tailwind4-daisyui5";
</script>

<template>
	<!-- Title -->
	<div class="container-center text-center">
		<h1 class="mb-8">🚀 {{ title }}</h1>
		<div class="text-base-content/70 mb-10">
			<p>Welcome! This starter template is designed to provide a pre-configured setup. It allows you to start by editing Vue components using Tailwind CSS and DaisyUI for styling.</p>
			<p>Vite, Vue 3, Sass, Tailwind CSS 4, and DaisyUI 5 included. <b>Vue Router is also included and configured</b>, you could try navigating to another page or to <router-link :to="{ path: '/non-existing/route' }" class="link">a page that does not exist</router-link>.</p>
		</div>
	</div>

</template>

<style scoped lang="scss">

</style>
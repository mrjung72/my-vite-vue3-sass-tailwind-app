<script setup>
import { useRoute } from 'vue-router';
import { computed } from "vue";

const route = useRoute();

const breadcrumbs = computed(() => {
	return route.matched.filter(record => record.name.toLowerCase() !== 'home') // Filter out the home route
});

const isHomeActive = computed(() => {
	return route.name && route.name.toLowerCase() === 'home';
});
</script>

<template>
	<div class="border-b border-b-base-200/50 py-1">
		<div class="w-full text-left px-4">
			<div class="breadcrumbs inline-flex gap-1 text-xl leading-tight">
				<ul>
					<li>
						<router-link
							:to="{ name: 'home' }"
							:class="{ 'font-bold': isHomeActive }"
						>홈</router-link>
					</li>
					<li v-for="(breadcrumb, index) in breadcrumbs" :key="index">
						<router-link
							:to="breadcrumb.path"
							class="font-bold"
						>{{ breadcrumb.meta.title }}</router-link>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">

</style>
<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
<BlogWidget
	card
	dim
	title="个人主页"
	:bg-img="appConfig.author.avatar"
	bg-aside
>
	<div class="title text-creative">
		{{ appConfig.author.name }}
	</div>

	<UtilLink to="https://github.com/codepzj">
		<Icon name="tabler:brand-github" />
		<span>codepzj</span>
	</UtilLink>
</BlogWidget>
</template>

<style lang="scss" scoped>
.title {
	background-clip: text;
	background-image: linear-gradient(60deg, var(--c-accent) -30%, var(--c-primary), var(--c-text-1));
	background-position: 100% 0;
	background-size: 200%;
	font-size: 1.8em;
	color: transparent;
	transition: background-position 0.2s;

	.blog-widget:hover & {
		background-position: 0 0;
	}
}

.tip {
	font-size: 0.9em;
	line-height: 2;
}

:deep(.bg-img).bg-img.bg-img {
	opacity: 0.5;
}
</style>

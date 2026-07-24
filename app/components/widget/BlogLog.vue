<script setup lang="ts">
const { timeEstablished } = useAppConfig()

const blogLog = [
	{ label: '2026-07-24', value: '使用 Nuxt 4 + Nuxt Content v3 搭建博客，部署至 GitHub Pages' },
	{ label: timeEstablished, value: '博客上线，开始记录 Golang 学习与开发实践' },
].sort((a, b) => b.label.localeCompare(a.label))
</script>

<template>
<BlogWidget card title="更新日志">
	<ZDlGroup size="large" :items="blogLog" />
</BlogWidget>
</template>

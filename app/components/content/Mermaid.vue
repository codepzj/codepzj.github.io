<script setup lang="ts">
const props = defineProps<{
	code: string
	filename?: string
}>()

const colorMode = useColorMode()
const diagram = useTemplateRef('diagram')
const svg = shallowRef('')
const error = ref('')
const loading = ref(true)
const showSource = ref(false)
const bindFunctions = shallowRef<((element: Element) => void) | undefined>()
const { copy, copied } = useCopy(props.code)

const theme = computed(() => colorMode.value === 'dark' ? 'dark' : 'default')
let renderRequest = 0

async function render() {
	const request = ++renderRequest
	loading.value = true
	error.value = ''

	try {
		const result = await renderMermaid(props.code, theme.value)
		if (request !== renderRequest)
			return

		svg.value = result.svg
		bindFunctions.value = result.bindFunctions
		await nextTick()
		if (diagram.value && bindFunctions.value)
			bindFunctions.value(diagram.value)
	}
	catch (cause) {
		if (request !== renderRequest)
			return

		svg.value = ''
		error.value = cause instanceof Error ? cause.message : String(cause)
	}
	finally {
		if (request === renderRequest)
			loading.value = false
	}
}

onMounted(render)
watch([() => props.code, theme], render)
</script>

<template>
<figure class="z-mermaid">
	<figcaption>
		<span class="title">
			<Icon name="tabler:chart-dots-3" />
			{{ filename || 'Mermaid' }}
		</span>
		<div class="operations">
			<button type="button" @click="showSource = !showSource">
				{{ showSource ? '查看图表' : '查看源码' }}
			</button>
			<button type="button" @click="copy()">
				{{ copied ? '已复制' : '复制' }}
			</button>
		</div>
	</figcaption>

	<div v-if="error" class="error" role="alert">
		<strong>Mermaid 图表渲染失败</strong>
		<span>{{ error }}</span>
	</div>

	<div
		v-show="!showSource && !error"
		ref="diagram"
		class="diagram scrollcheck-x"
		:class="{ loading }"
		role="img"
		aria-label="Mermaid 图表"
		aria-live="polite"
		v-html="svg"
	/>

	<pre v-show="showSource || error || !svg" class="source scrollcheck-x"><code>{{ code }}</code></pre>
</figure>
</template>

<style lang="scss" scoped>
.z-mermaid {
	contain: paint;
	margin: 0.5em 0;
	border-radius: 0.5em;
	background-color: var(--c-bg-2);
	font-size: 0.85em;
}

figcaption {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1em;
	min-height: 2em;
	padding-inline-start: 1em;
	color: var(--c-text-2);

	> .title {
		display: flex;
		align-items: center;
		gap: 0.4em;
	}

	> .operations {
		display: flex;

		> button {
			opacity: 0.5;
			padding: 0.3em 0.6em;
			transition: opacity 0.2s, color 0.2s;

			&:hover,
			&:focus-visible {
				opacity: 1;
				color: var(--c-primary);
			}
		}
	}
}

.diagram {
	overflow: auto;
	min-height: 8rem;
	padding: 1rem;
	background-color: var(--ld-bg-card);
	transition: opacity 0.2s;

	&.loading {
		opacity: 0.4;
	}

	:deep(svg) {
		display: block;
		height: auto;
		max-width: 100%;
		margin: auto;
	}
}

.source {
	margin: 0;
	padding: 1rem;
	background-color: var(--ld-bg-card);
	line-height: 1.5;
	white-space: pre;
}

.error {
	display: grid;
	gap: 0.3em;
	padding: 1rem;
	background-color: var(--c-error-soft);
	color: var(--c-error);

	> span {
		overflow-wrap: anywhere;
		font-family: var(--font-monospace);
	}
}
</style>

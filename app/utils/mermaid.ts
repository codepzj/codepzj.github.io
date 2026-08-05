type MermaidTheme = 'default' | 'dark'

let mermaidModule: Promise<typeof import('mermaid')> | undefined
let renderQueue: Promise<void> = Promise.resolve()
let renderCount = 0

function loadMermaid() {
	mermaidModule ||= import('mermaid')
	return mermaidModule
}

/** Mermaid 使用全局配置，串行渲染可避免多个图表切换主题时互相覆盖。 */
export function renderMermaid(code: string, theme: MermaidTheme) {
	const task = renderQueue
		.catch(() => {})
		.then(async () => {
			const { default: mermaid } = await loadMermaid()
			mermaid.initialize({
				startOnLoad: false,
				securityLevel: 'strict',
				theme,
			})

			renderCount += 1
			return mermaid.render(`mermaid-${renderCount}`, code)
		})

	renderQueue = task.then(() => {}, () => {})
	return task
}

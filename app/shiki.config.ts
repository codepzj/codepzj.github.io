import { defineConfig } from '#shiki/config'

export default defineConfig({
	themes: {
		light: () => import('shiki/themes/github-light.mjs'),
		dark: () => import('shiki/themes/github-dark.mjs'),
	},
})

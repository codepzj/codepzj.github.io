import { defineConfig } from '@nuxtjs/mdc/config'
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets'
import { transformerNotationWordHighlight, transformerRenderIndentGuides } from '@shikijs/transformers'

const twoSpaceIndentLanguages = new Set(['json', 'jsonc', 'md', 'mdc', 'yaml', 'yml'])

export default defineConfig({
	shiki: {
		transformers: (_code, language, _theme, options) => {
			const metaIndent = options.meta?.match(/(?:^|\s)indent=(\d+)(?:\s|$)/)?.[1]
			const indent = metaIndent ? Number(metaIndent) : twoSpaceIndentLanguages.has(language) ? 2 : 4

			return [
				transformerNotationWordHighlight(),
				transformerRenderIndentGuides({ indent }),
				transformerColorizedBrackets(),
				{
					name: 'code-line-number',
					line(node, line) {
						node.properties['data-line'] = line
					},
				},
			]
		},
	},
})

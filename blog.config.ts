import type { FeedEntry } from './app/types/feed'

const basicConfig = {
	title: '浩瀚星河',
	subtitle: '记录 Golang 学习与开发实践',
	// 长 description 利好于 SEO
	description: '浩瀚星河的个人技术博客，记录 Golang 学习与开发实践。',
	author: {
		name: '浩瀚星河',
		avatar: '/avatar.jpg',
		email: '',
		homepage: 'https://codepzj.github.io/',
	},
	copyright: {
		abbr: 'CC BY-NC-SA 4.0',
		name: '署名-非商业性使用-相同方式共享 4.0 国际',
		url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans',
	},
	favicon: '/favicon.png',
	language: 'zh-CN',
	timeEstablished: '2025-07-26',
	timeZone: 'Asia/Shanghai',
	url: 'https://codepzj.github.io/',
	defaultCategory: '未分类',
}

// 存储 nuxt.config 和 app.config 共用的配置
// 此处为启动时需要的配置，启动后可变配置位于 app/app.config.ts
// @keep-sorted
const blogConfig = {
	...basicConfig,

	article: {
		categories: {
			[basicConfig.defaultCategory]: { icon: 'tabler:circle-dashed' },
			Go语言: { icon: 'simple-icons:go', color: '#00add8' },
			数据库: { icon: 'tabler:database', color: '#f29111' },
			微服务: { icon: 'tabler:topology-star-3', color: '#7c6cff' },
			工程实践: { icon: 'tabler:tools', color: '#3b82f6' },
			博客建设: { icon: 'tabler:article', color: '#ec4899' },
			云原生: { icon: 'simple-icons:kubernetes', color: '#326ce5' },
			成长随笔: { icon: 'tabler:seedling', color: '#22c55e' },
			后端开发: { icon: 'tabler:server-2', color: '#14b8a6' },
			技术观察: { icon: 'tabler:bulb', color: '#f59e0b' },
		},
		/** 文章版式，首个为默认版式 */
		types: {
			tech: {},
			story: {},
		},
		/** 分类排序方式，键为排序字段，值为显示名称 */
		order: {
			date: '创建日期',
			updated: '更新日期',
			// title: '标题',
		},
		/** 使用 pnpm new 新建文章时自动生成自定义链接（permalink/abbrlink） */
		useRandomPremalink: false,
		/** 隐藏基于文件路由（不是自定义链接）的 URL /post 路径前缀 */
		hidePostPrefix: true,
		/** 禁止搜索引擎收录的路径 */
		robotsNotIndex: ['/preview', '/previews/*'],
	},

	/** 博客 Atom 订阅源 */
	feed: {
		/** 订阅源最大文章数量 */
		limit: 50,
		/** 订阅源是否启用XSLT样式 */
		enableStyle: true,
	},

	/** 向 <head> 中添加脚本 */
	scripts: [],

	/** 自己部署的 Twikoo 服务 */
	twikoo: {
		envId: '',
		preload: '',
	},
}

/** 用于生成 OPML 和友链页面配置 */
export const myFeed: FeedEntry = {
	author: blogConfig.author.name,
	sitenick: '浩瀚星河',
	title: blogConfig.title,
	desc: blogConfig.subtitle || blogConfig.description,
	link: blogConfig.url,
	feed: new URL('/atom.xml', blogConfig.url).toString(),
	icon: blogConfig.favicon,
	avatar: blogConfig.author.avatar,
	archs: ['Nuxt', 'Vercel'],
	date: blogConfig.timeEstablished,
	comment: '这是我自己',
}

export default blogConfig

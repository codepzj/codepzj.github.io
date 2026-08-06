# 组件样式示例

> 

## 在 Markdown 中使用组件

Nuxt Content 使用 Markdown 语法和约定来提供丰富的文本编辑体验。它使用自定的 MDC 语法，可以让你在 Markdown 中使用 Vue 组件，并支持多种 remark 扩展。

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<link-card icon="https://content.nuxt.com/favicon.ico" link="https://content.nuxt.com/docs/files/markdown#mdc-syntax" title="MDC 基本语法（必读）" className="gradient-card,active">



</link-card>

可以切换到“语法”标签查看每个组件的 MDC 源码，并结合当前渲染效果快速理解组件的使用方式。

</template>

<template v-slot:tab2="">

```mdcwrap
::link-card
---
title: MDC 基本语法（必读）
icon: https://v2.content.nuxt.com/favicon.ico
link: https://content.nuxt.com/docs/files/markdown#mdc-syntax
class: gradient-card active
---
::

可以切换到“语法”标签查看每个组件的 MDC 源码，并结合当前渲染效果快速理解组件的使用方式。
```

</template>
</tab>

我编写了一些可以在 Markdown 文件中调用的组件，以下是一些示例。

## 通过 CSS 类名控制样式

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">

- 各级标题

  - 在 Front matter 中设置 `type: story` 可以换用不同样式。
  - 跟随 URL Hash（网址锚点）的高亮。
- > 引用。
- 无序和有序列表。
- **粗体**、~~删除线~~。
- 分割线。

---

- 带有 `icon` 类名的图片，如 ![星空图标](https://picsum.photos/seed/codepzj-icon/100/100)。
- <span className="title-like">

只在 `type: story` 时🀄

</span>
- <span className="text-story">

故事感。

</span>
- <span className="text-repeat">

阴 影 回 声

</span>
- 滚动，然后悄悄<span className="text-zoom">

变大变高

</span>

，惊艳所有人。

</template>

<template v-slot:tab2="">

```mdc
- 各级标题
  - 在 Front matter 中设置 `type: story`{lang="yaml"} 可以换用不同样式。
  - 跟随 URL Hash（网址锚点）的高亮。
- > 引用。
- 无序和有序列表。
- **粗体**、~~删除线~~。
- 分割线。
---
- 带有 `icon` 类名的图片，如 ![星空图标](https://picsum.photos/seed/codepzj-icon/100/100){.icon}。
- [只在 `type: story`{lang="yaml"} 时🀄]{.title-like}
- [故事感。]{.text-story}
- [阴 影 回 声]{.text-repeat}
- 滚动，然后悄悄[变大变高]{.text-zoom}，惊艳所有人。
```

</template>
</tab>

## Markdown 语法组件

可以通过 Markdown 原生语法、HTML 语法和 MDC 语法使用的组件。

### 链接 `ProseA`

[这是内部链接](#%E9%93%BE%E6%8E%A5-prosea)。[博客首页](https://codepzj.github.io/) 会在新标签页打开，并在鼠标悬浮时展示域名。

还会根据域名展示图标，例如 [微软文档](https://learn.microsoft.com/zh-cn/)、[GitHub](https://github.com/)、[Bilibili](https://www.bilibili.com/)、[QQ 官网](https://im.qq.com/)、[微信公众号](https://mp.weixin.qq.com/) 等。

<alert title="自定义图标">
<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">

你可以将 `icon` 属性指定 Iconify 图标名，例如 [a](#%E9%93%BE%E6%8E%A5-prosea)。图标可在 [Iconify](https://icon-sets.iconify.design/) 或 [Yesicon](https://yesicon.app/) 搜索。

</template>

<template v-slot:tab2="">

```mdcwrap
你可以将 `icon` 属性指定 Iconify 图标名，例如 [a](#链接-prosea){icon="tabler:color-swatch"}。图标可在 [Iconify](https://icon-sets.iconify.design/) 或 [Yesicon](https://yesicon.app/) 搜索。
```

</template>
</tab>
</alert>

#### 为更多站点匹配图标

你可以在 `app/utils/icon.ts` 分别为主域名或专门域名（优先级高）添加匹配规则来为更多站点匹配图标。

### 代码 `ProseCode`

`行内代码` 和 [在超链接中的 `行内代码`](#%E4%BB%A3%E7%A0%81-prosecode)。

还可以通过在反引号后加 `{lang="js"}` 等语言实现高亮，例如 `const a = 1` 。

也可以加上 `copy` 展示复制按钮，例如 `pnpm dev` 。

### 代码块 `ProsePre`

```text
纯文本代码块
```

```text [文件名]
带文件夹名、未指定语言的代码块
```

```yaml
语言: yaml # 指定语言但无文件名
```

```yaml [特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别长的文件名]
羽化边缘: 如果一行特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别长，溢出滚动时有羽化边缘。
```

```md [CHANGELOG.md]
# 更新日志
- 特殊文件名自动匹配图标
- 若行数超出
  `appConfig.component.codeblock.triggerRows`
  （默认32）
  - 则自动折叠到
  `appConfig.component.codeblock.collapsedRows`
  （默认16）
- 如果设置了 expand，则不会自动折叠
- 如果设置了 wrap，则会自动换行
- 如果设置了文件名，则会在代码块标题前展示图标
  - 图标只在有文件名时展示
  - 默认图标是语言图标
  - 特殊文件名也会自动识别出图标
  - 文件名可以是任意字符串，例如 `CHANGELOG.md`、`README.md` 等
  - 文件名也可以是路径，例如 `src/components/ProsePre.vue` 等
  - 还可以通过 `icon=图标` 自定义图标

\
\
\
\
\
\
\
\
\
\
\
\
\
\
\
```

```md [更多功能]icon=tabler:files wrap expand
- 在 Markdown 文件中，可以通过代码块语法的 meta 标记
  - `wrap` 直接启用自动换行功能，以展示特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别特别长的文本而不换行
  - `icon=tabler:files` 自定义代码块图标
  - `expand` 禁用自动折叠功能

# 代码块语法

```语言简写 [文件名] icon=图标 wrap expand
- 上面这几项都是可选的。
- 如果有语言简写，必须位于反引号后的第一项，且需要是小写字母。
  - https://shiki.style/languages
- 方括号包裹的是文件名。
- icon=图标、wrap、expand 都是 meta 标记。
- 如果要在代码块中嵌套代码块语法，外层可以用四个反引号包裹。
```
```

#### 高亮和转换

代码块通过 Shiki 进行高亮，可在 `blog.config.ts` 中配置语言（Markdown 中出现的所有语言）和代码高亮主题。

转换器（如 diff）可通过 [https://shiki.style/packages/transformers#transformers](https://shiki.style/packages/transformers#transformers) 配置，启用的转换器可在 `app/stores/shiki.ts` 查看。

#### 为更多语言匹配图标

你可以根据 `app/utils/icon.ts` 语言图标匹配流程为文件后缀、语言简写或别名添加匹配规则来为更多语言匹配图标：

1. 查找 `file2icon` 映射表，将文件名后缀替换为图标名。
2. 若无匹配，查找 `ext2lang` 映射表，将语言简写或别名转换为 Catppuccin 图标库中的语言名。
3. 将 Catppuccin 图标库中的语言名转换为 Iconify 图标名。

### 表格 `ProseTable`

> 支持表格横向滚动或自动换行的切换。

<table>
<thead>
  <tr>
    <th>
      表头滚动吸附
    </th>
    
    <th align="right">
      滚动时边缘羽化
    </th>
    
    <th align="left">
      如果标题或内容很 loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog
    </th>
    
    <th align="left">
      这里还有一列，但是是空内容
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      已实现
    </td>
    
    <td align="right">
      已实现
    </td>
    
    <td align="left">
      可以切换滚动方式
    </td>
    
    <td align="left">
      
    </td>
  </tr>
</tbody>
</table>

### 脚注

由remark-gfm的micromark-extension-gfm-footnote驱动的脚注<sup>

[1](#user-content-fn-micromark-extension-gfm-footnote)

</sup>

。

### 数学公式

> 由 remark-<span className="katex">
> <span className="katex-mathml">
> <math xmlns="http://www.w3.org/1998/Math/MathML">
> <semantics>
> <mrow>
> <mtext>
> 
> KaTeX
> 
> </mtext>
> </mrow>
> 
> <annotation encoding="application/x-tex">
> 
> \KaTeX
> 
> </annotation>
> </semantics>
> </math>
> </span>
> 
> <span className="katex-html" ariaHidden="true">
> <span className="base">
> <span className="strut" style="height:0.8988em;vertical-align:-0.2155em;">
> 
> 
> 
> </span>
> 
> <span className="mord,text">
> <span className="mord,textrm">
> 
> K
> 
> </span>
> 
> <span className="mspace" style="margin-right:-0.17em;">
> 
> 
> 
> </span>
> 
> <span className="vlist-t">
> <span className="vlist-r">
> <span className="vlist" style="height:0.6833em;">
> <span style="top:-2.905em;">
> <span className="pstrut" style="height:2.7em;">
> 
> 
> 
> </span>
> 
> <span className="mord">
> <span className="mord,textrm,mtight,sizing,reset-size6,size3">
> 
> A
> 
> </span>
> </span>
> </span>
> </span>
> </span>
> </span>
> 
> <span className="mspace" style="margin-right:-0.15em;">
> 
> 
> 
> </span>
> 
> <span className="mord,text">
> <span className="mord,textrm">
> 
> T
> 
> </span>
> 
> <span className="mspace" style="margin-right:-0.1667em;">
> 
> 
> 
> </span>
> 
> <span className="vlist-t,vlist-t2">
> <span className="vlist-r">
> <span className="vlist" style="height:0.4678em;">
> <span style="top:-2.7845em;">
> <span className="pstrut" style="height:3em;">
> 
> 
> 
> </span>
> 
> <span className="mord">
> <span className="mord,textrm">
> 
> E
> 
> </span>
> </span>
> </span>
> </span>
> 
> <span className="vlist-s">
> 
> ​
> 
> </span>
> </span>
> 
> <span className="vlist-r">
> <span className="vlist" style="height:0.2155em;">
> <span>
> 
> 
> 
> </span>
> </span>
> </span>
> </span>
> 
> <span className="mspace" style="margin-right:-0.125em;">
> 
> 
> 
> </span>
> 
> <span className="mord,textrm">
> 
> X
> 
> </span>
> </span>
> </span>
> </span>
> </span>
> </span>
> 
>  驱动，支持 <span className="katex">
> <span className="katex-mathml">
> <math xmlns="http://www.w3.org/1998/Math/MathML">
> <semantics>
> <mrow>
> <mtext>
> 
> TeX
> 
> </mtext>
> </mrow>
> 
> <annotation encoding="application/x-tex">
> 
> \TeX
> 
> </annotation>
> </semantics>
> </math>
> </span>
> 
> <span className="katex-html" ariaHidden="true">
> <span className="base">
> <span className="strut" style="height:0.8988em;vertical-align:-0.2155em;">
> 
> 
> 
> </span>
> 
> <span className="mord,text">
> <span className="mord,textrm">
> 
> T
> 
> </span>
> 
> <span className="mspace" style="margin-right:-0.1667em;">
> 
> 
> 
> </span>
> 
> <span className="vlist-t,vlist-t2">
> <span className="vlist-r">
> <span className="vlist" style="height:0.4678em;">
> <span style="top:-2.7845em;">
> <span className="pstrut" style="height:3em;">
> 
> 
> 
> </span>
> 
> <span className="mord">
> <span className="mord,textrm">
> 
> E
> 
> </span>
> </span>
> </span>
> </span>
> 
> <span className="vlist-s">
> 
> ​
> 
> </span>
> </span>
> 
> <span className="vlist-r">
> <span className="vlist" style="height:0.2155em;">
> <span>
> 
> 
> 
> </span>
> </span>
> </span>
> </span>
> 
> <span className="mspace" style="margin-right:-0.125em;">
> 
> 
> 
> </span>
> 
> <span className="mord,textrm">
> 
> X
> 
> </span>
> </span>
> </span>
> </span>
> </span>
> 
>  和部分 <span className="katex">
> <span className="katex-mathml">
> <math xmlns="http://www.w3.org/1998/Math/MathML">
> <semantics>
> <mrow>
> <mtext>
> 
> LaTeX
> 
> </mtext>
> </mrow>
> 
> <annotation encoding="application/x-tex">
> 
> \LaTeX
> 
> </annotation>
> </semantics>
> </math>
> </span>
> 
> <span className="katex-html" ariaHidden="true">
> <span className="base">
> <span className="strut" style="height:0.8988em;vertical-align:-0.2155em;">
> 
> 
> 
> </span>
> 
> <span className="mord,text">
> <span className="mord,textrm">
> 
> L
> 
> </span>
> 
> <span className="mspace" style="margin-right:-0.36em;">
> 
> 
> 
> </span>
> 
> <span className="vlist-t">
> <span className="vlist-r">
> <span className="vlist" style="height:0.6833em;">
> <span style="top:-2.905em;">
> <span className="pstrut" style="height:2.7em;">
> 
> 
> 
> </span>
> 
> <span className="mord">
> <span className="mord,textrm,mtight,sizing,reset-size6,size3">
> 
> A
> 
> </span>
> </span>
> </span>
> </span>
> </span>
> </span>
> 
> <span className="mspace" style="margin-right:-0.15em;">
> 
> 
> 
> </span>
> 
> <span className="mord,text">
> <span className="mord,textrm">
> 
> T
> 
> </span>
> 
> <span className="mspace" style="margin-right:-0.1667em;">
> 
> 
> 
> </span>
> 
> <span className="vlist-t,vlist-t2">
> <span className="vlist-r">
> <span className="vlist" style="height:0.4678em;">
> <span style="top:-2.7845em;">
> <span className="pstrut" style="height:3em;">
> 
> 
> 
> </span>
> 
> <span className="mord">
> <span className="mord,textrm">
> 
> E
> 
> </span>
> </span>
> </span>
> </span>
> 
> <span className="vlist-s">
> 
> ​
> 
> </span>
> </span>
> 
> <span className="vlist-r">
> <span className="vlist" style="height:0.2155em;">
> <span>
> 
> 
> 
> </span>
> </span>
> </span>
> </span>
> 
> <span className="mspace" style="margin-right:-0.125em;">
> 
> 
> 
> </span>
> 
> <span className="mord,textrm">
> 
> X
> 
> </span>
> </span>
> </span>
> </span>
> </span>
> </span>
> 
>  语法。如果 Markdown 正文需要直接使用 $ 符号，需要使用 `\$` 转义。
> 
> [支持语法列表](https://katex.org/docs/supported)（[中文版](https://www.luogu.com.cn/paste/hs3jg81l)）

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">

行内公式 <span className="katex">
<span className="katex-mathml">
<math xmlns="http://www.w3.org/1998/Math/MathML">
<semantics>
<mrow>
<mtext>

课程绩点

</mtext>

<mo>

=

</mo>

<mfrac>
<mtext>

课程分数(成绩)

</mtext>

<mn>

10

</mn>
</mfrac>

<mo>

−

</mo>

<mn>

5

</mn>
</mrow>

<annotation encoding="application/x-tex">

\text{课程绩点} = \frac{\text{课程分数(成绩)}}{10} - 5

</annotation>
</semantics>
</math>
</span>

<span className="katex-html" ariaHidden="true">
<span className="base">
<span className="strut" style="height:0.6833em;">



</span>

<span className="mord,text">
<span className="mord,cjk_fallback">

课程绩点

</span>
</span>

<span className="mspace" style="margin-right:0.2778em;">



</span>

<span className="mrel">

=

</span>

<span className="mspace" style="margin-right:0.2778em;">



</span>
</span>

<span className="base">
<span className="strut" style="height:1.355em;vertical-align:-0.345em;">



</span>

<span className="mord">
<span className="mopen,nulldelimiter">



</span>

<span className="mfrac">
<span className="vlist-t,vlist-t2">
<span className="vlist-r">
<span className="vlist" style="height:1.01em;">
<span style="top:-2.655em;">
<span className="pstrut" style="height:3em;">



</span>

<span className="sizing,reset-size6,size3,mtight">
<span className="mord,mtight">
<span className="mord,mtight">

10

</span>
</span>
</span>
</span>

<span style="top:-3.23em;">
<span className="pstrut" style="height:3em;">



</span>

<span className="frac-line" style="border-bottom-width:0.04em;">



</span>
</span>

<span style="top:-3.485em;">
<span className="pstrut" style="height:3em;">



</span>

<span className="sizing,reset-size6,size3,mtight">
<span className="mord,mtight">
<span className="mord,text,mtight">
<span className="mord,cjk_fallback,mtight">

课程分数

</span>

<span className="mord,mtight">

(

</span>

<span className="mord,cjk_fallback,mtight">

成绩

</span>

<span className="mord,mtight">

)

</span>
</span>
</span>
</span>
</span>
</span>

<span className="vlist-s">

​

</span>
</span>

<span className="vlist-r">
<span className="vlist" style="height:0.345em;">
<span>



</span>
</span>
</span>
</span>
</span>

<span className="mclose,nulldelimiter">



</span>
</span>

<span className="mspace" style="margin-right:0.2222em;">



</span>

<span className="mbin">

−

</span>

<span className="mspace" style="margin-right:0.2222em;">



</span>
</span>

<span className="base">
<span className="strut" style="height:0.6444em;">



</span>

<span className="mord">

5

</span>
</span>
</span>
</span>



<span className="katex-display">
<span className="katex">
<span className="katex-mathml">
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
<semantics>
<mrow>
<mtext>

学分绩点

</mtext>

<mo>

=

</mo>

<mtext>

课程学分

</mtext>

<mo>

×

</mo>

<mtext>

课程绩点

</mtext>
</mrow>

<annotation encoding="application/x-tex">

\text{学分绩点} = \text{课程学分} \times \text{课程绩点}

</annotation>
</semantics>
</math>
</span>

<span className="katex-html" ariaHidden="true">
<span className="base">
<span className="strut" style="height:0.6833em;">



</span>

<span className="mord,text">
<span className="mord,cjk_fallback">

学分绩点

</span>
</span>

<span className="mspace" style="margin-right:0.2778em;">



</span>

<span className="mrel">

=

</span>

<span className="mspace" style="margin-right:0.2778em;">



</span>
</span>

<span className="base">
<span className="strut" style="height:0.7667em;vertical-align:-0.0833em;">



</span>

<span className="mord,text">
<span className="mord,cjk_fallback">

课程学分

</span>
</span>

<span className="mspace" style="margin-right:0.2222em;">



</span>

<span className="mbin">

×

</span>

<span className="mspace" style="margin-right:0.2222em;">



</span>
</span>

<span className="base">
<span className="strut" style="height:0.6833em;">



</span>

<span className="mord,text">
<span className="mord,cjk_fallback">

课程绩点

</span>
</span>
</span>
</span>
</span>
</span>

<span className="katex">
<span className="katex-mathml">
<math xmlns="http://www.w3.org/1998/Math/MathML">
<semantics>
<mrow>
<mtext>

平均绩点(GPA)

</mtext>

<mo>

=

</mo>

<mfrac>
<mtext>

学分绩点之和

</mtext>

<mtext>

课程学分之和

</mtext>
</mfrac>

<mo>

=

</mo>

<mfrac>
<mrow>
<mo>

∑

</mo>

<mo stretchy="false">

(

</mo>

<mtext>

课程学分

</mtext>

<mo>

×

</mo>

<mtext>

课程绩点

</mtext>

<mo stretchy="false">

)

</mo>
</mrow>

<mrow>
<mo>

∑

</mo>

<mtext>

课程学分

</mtext>
</mrow>
</mfrac>
</mrow>

<annotation encoding="application/x-tex">

\text{平均绩点(GPA)} =\frac {\text{学分绩点之和}}{\text{课程学分之和}} = \frac{\sum (\text{课程学分} \times \text{课程绩点})}{\sum \text{课程学分}}

</annotation>
</semantics>
</math>
</span>

<span className="katex-html" ariaHidden="true">
<span className="base">
<span className="strut" style="height:1em;vertical-align:-0.25em;">



</span>

<span className="mord,text">
<span className="mord,cjk_fallback">

平均绩点

</span>

<span className="mord">

(GPA)

</span>
</span>

<span className="mspace" style="margin-right:0.2778em;">



</span>

<span className="mrel">

=

</span>

<span className="mspace" style="margin-right:0.2778em;">



</span>
</span>

<span className="base">
<span className="strut" style="height:1.2173em;vertical-align:-0.345em;">



</span>

<span className="mord">
<span className="mopen,nulldelimiter">



</span>

<span className="mfrac">
<span className="vlist-t,vlist-t2">
<span className="vlist-r">
<span className="vlist" style="height:0.8723em;">
<span style="top:-2.655em;">
<span className="pstrut" style="height:3em;">



</span>

<span className="sizing,reset-size6,size3,mtight">
<span className="mord,mtight">
<span className="mord,text,mtight">
<span className="mord,cjk_fallback,mtight">

课程学分之和

</span>
</span>
</span>
</span>
</span>

<span style="top:-3.23em;">
<span className="pstrut" style="height:3em;">



</span>

<span className="frac-line" style="border-bottom-width:0.04em;">



</span>
</span>

<span style="top:-3.394em;">
<span className="pstrut" style="height:3em;">



</span>

<span className="sizing,reset-size6,size3,mtight">
<span className="mord,mtight">
<span className="mord,text,mtight">
<span className="mord,cjk_fallback,mtight">

学分绩点之和

</span>
</span>
</span>
</span>
</span>
</span>

<span className="vlist-s">

​

</span>
</span>

<span className="vlist-r">
<span className="vlist" style="height:0.345em;">
<span>



</span>
</span>
</span>
</span>
</span>

<span className="mclose,nulldelimiter">



</span>
</span>

<span className="mspace" style="margin-right:0.2778em;">



</span>

<span className="mrel">

=

</span>

<span className="mspace" style="margin-right:0.2778em;">



</span>
</span>

<span className="base">
<span className="strut" style="height:1.53em;vertical-align:-0.52em;">



</span>

<span className="mord">
<span className="mopen,nulldelimiter">



</span>

<span className="mfrac">
<span className="vlist-t,vlist-t2">
<span className="vlist-r">
<span className="vlist" style="height:1.01em;">
<span style="top:-2.655em;">
<span className="pstrut" style="height:3em;">



</span>

<span className="sizing,reset-size6,size3,mtight">
<span className="mord,mtight">
<span className="mop,op-symbol,small-op,mtight" style="position:relative;top:0em;">

∑

</span>

<span className="mspace,mtight" style="margin-right:0.1952em;">



</span>

<span className="mord,text,mtight">
<span className="mord,cjk_fallback,mtight">

课程学分

</span>
</span>
</span>
</span>
</span>

<span style="top:-3.23em;">
<span className="pstrut" style="height:3em;">



</span>

<span className="frac-line" style="border-bottom-width:0.04em;">



</span>
</span>

<span style="top:-3.485em;">
<span className="pstrut" style="height:3em;">



</span>

<span className="sizing,reset-size6,size3,mtight">
<span className="mord,mtight">
<span className="mop,op-symbol,small-op,mtight" style="position:relative;top:0em;">

∑

</span>

<span className="mopen,mtight">

(

</span>

<span className="mord,text,mtight">
<span className="mord,cjk_fallback,mtight">

课程学分

</span>
</span>

<span className="mbin,mtight">

×

</span>

<span className="mord,text,mtight">
<span className="mord,cjk_fallback,mtight">

课程绩点

</span>
</span>

<span className="mclose,mtight">

)

</span>
</span>
</span>
</span>
</span>

<span className="vlist-s">

​

</span>
</span>

<span className="vlist-r">
<span className="vlist" style="height:0.52em;">
<span>



</span>
</span>
</span>
</span>
</span>

<span className="mclose,nulldelimiter">



</span>
</span>
</span>
</span>
</span>

<span className="katex-display">
<span className="katex">
<span className="katex-mathml">
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
<semantics>
<mrow>
<menclose notation="box">
<mstyle scriptlevel="0" displaystyle="false">
<mstyle scriptlevel="0" displaystyle="false">
<mstyle scriptlevel="0" displaystyle="true">
<mtext>

浩瀚星河 ⋅ 代码为舟

</mtext>
</mstyle>
</mstyle>
</mstyle>
</menclose>
</mrow>

<annotation encoding="application/x-tex">

\boxed{\text{浩瀚星河 · 代码为舟}}

</annotation>
</semantics>
</math>
</span>

<span className="katex-html" ariaHidden="true">
<span className="base">
<span className="strut" style="height:1.3633em;vertical-align:-0.34em;">



</span>

<span className="mord">
<span className="vlist-t,vlist-t2">
<span className="vlist-r">
<span className="vlist" style="height:1.0233em;">
<span style="top:-3.3633em;">
<span className="pstrut" style="height:3.3633em;">



</span>

<span className="boxpad">
<span className="mord">
<span className="mord">
<span className="mord,text">
<span className="mord,cjk_fallback">

浩瀚星河

</span>

<span className="mord">

⋅

</span>

<span className="mord,cjk_fallback">

代码为舟

</span>
</span>
</span>
</span>
</span>
</span>

<span style="top:-3.0233em;">
<span className="pstrut" style="height:3.3633em;">



</span>

<span className="stretchy,fbox" style="height:1.3633em;border-style:solid;border-width:0.04em;">



</span>
</span>
</span>

<span className="vlist-s">

​

</span>
</span>

<span className="vlist-r">
<span className="vlist" style="height:0.34em;">
<span>



</span>
</span>
</span>
</span>
</span>
</span>
</span>
</span>
</span>
</template>

<template v-slot:tab2="">

```mdcwrap
行内公式 $\text{课程绩点} = \frac{\text{课程分数(成绩)}}{10} - 5$

$$
\text{学分绩点} = \text{课程学分} \times \text{课程绩点}
$$

```math
\text{平均绩点(GPA)} =\frac {\text{学分绩点之和}}{\text{课程学分之和}} = \frac{\sum (\text{课程学分} \times \text{课程绩点})}{\sum \text{课程学分}}
```

$$
\boxed{\text{浩瀚星河 · 代码为舟}}
$$
```

</template>
</tab>

### 许可协议和侧栏插槽

> 由自编写的rehype-meta-slots插件实现，插槽必须是文章的直接子元素，内容已插入到文章末尾 <sup>
> 
> [2](#user-content-fn-copyright)
> 
> </sup>
> 
>  和目录侧栏。

```mdc
---
aside: [toc, meta-aside-foo, meta-aside-bar]
---

::meta-aside-foo{title="从文章插入的组件" card}
展示remark插件能力，为用户自己编写插件提供实现思路。

虽然一般情况下， :blur[文章侧栏不需要组件]
::

:::meta-aside-bar
::link-card
---
title: MDC 基本语法（必读）
icon: https://v2.content.nuxt.com/favicon.ico
link: https://content.nuxt.com/docs/files/markdown#mdc-syntax
---
::
:::

::meta-copyright{title="本文章不保留版权"}
通过 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.zh-hans){icon="ri:creative-commons-zero-line"} 贡献至公共领域。
::
```

### 乐谱渲染播放

> 由自编写的remark-music插件实现，必要时可用豆包等 AI 将乐谱识别为 ABC 记法。只在网络状态良好时加载播放能力。
> 
> 编辑器、Cheat Sheet 和语法检查：[https://editor.drawthedots.com/](https://editor.drawthedots.com/)

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<music-score abc="L:1/8
Q:1/4=100 "andante moderato"
M:2/4
K:D
"D" FA A>B | AF DD/E/ |1 "G" FF ED | "A" E2 z2 :|2 "G" FF "A" EE | "D" D2 z2 ||">



</music-score>

<music-score abc="L:1/8
Q:1/4=100
M:2/4
K:D
V:1 clef=treble
V:2 clef=bass
%%MIDI program 32
[V:1] z2 z f/g/ | aa a>b | af dd/e/ | ff ee | d2 z2 || FA A>B | AF DD/E/ |
w: | | | | | 你 爱 我 | 我 爱 你 蜜 雪
[V:2] z4 | D,[F,A,] .A,[F,A,] | .D,[F,A,] .A,[E,A,] | .G,,[G,D,] .A,,[E,A,] | .D,[F,A,] [D,,D,]2 || .D,,[D,F,] .A,,[D,F,] | .D,,[D,F,] .A,,[D,F,] |
[V:1] FF ED | E2 z2 | FA A>B | AF DD/E/ | FF EE | D2 z2 | G2 G2 |
w: 冰 城 甜 蜜 | 蜜 | 你 爱 我 | 我 爱 你 蜜 雪 冰 城 甜 蜜 | 蜜 | 你 爱
[V:2] .G,,[B,G,] .D,[B,G,] | .A,,[A,C] .E,[A,C] | .D,,[D,F,] .A,,[D,F,] | .D,,[D,F,] .A,,[D,F,] | .G,,[G,D,] .A,,[E,A,] | .D,,[A,,D,] .[A,,D,]2 | .G,,[B,G,] .D,[B,G,] |
[V:1] GB z2 | A2 AF | E2 z2 | FA A>B | AF DD/E/ | FF EE | D2 z2 |]
w: 我 呀 | 我 爱 | 你 | 你 爱 我 | 我 爱 你 蜜 雪 冰 城 甜 蜜 | 蜜
[V:2] .G,,[B,G,] .D,[B,G,] | .D,,[F,D,] .A,,[F,D,] | .A,,[A,C] .E,[A,C] | .D,,[F,D,] .A,,[F,D,] | .D,,[F,D,] .A,,[F,D,] | .G,,[G,D,] .A,,[E,A,] | .D,.A,, [D,,D,]2 |]">



</music-score>
</template>

<template v-slot:tab2="">

```mdcwrap expand
```music-abc
L:1/8
Q:1/4=100 "andante moderato"
M:2/4
K:D
"D" FA A>B | AF DD/E/ |1 "G" FF ED | "A" E2 z2 :|2 "G" FF "A" EE | "D" D2 z2 ||
```

```music-abc
L:1/8
Q:1/4=100
M:2/4
K:D
V:1 clef=treble
V:2 clef=bass
%%MIDI program 32
[V:1] z2 z f/g/ | aa a>b | af dd/e/ | ff ee | d2 z2 || FA A>B | AF DD/E/ |
w: | | | | | 你 爱 我 | 我 爱 你 蜜 雪
[V:2] z4 | D,[F,A,] .A,[F,A,] | .D,[F,A,] .A,[E,A,] | .G,,[G,D,] .A,,[E,A,] | .D,[F,A,] [D,,D,]2 || .D,,[D,F,] .A,,[D,F,] | .D,,[D,F,] .A,,[D,F,] |
[V:1] FF ED | E2 z2 | FA A>B | AF DD/E/ | FF EE | D2 z2 | G2 G2 |
w: 冰 城 甜 蜜 | 蜜 | 你 爱 我 | 我 爱 你 蜜 雪 冰 城 甜 蜜 | 蜜 | 你 爱
[V:2] .G,,[B,G,] .D,[B,G,] | .A,,[A,C] .E,[A,C] | .D,,[D,F,] .A,,[D,F,] | .D,,[D,F,] .A,,[D,F,] | .G,,[G,D,] .A,,[E,A,] | .D,,[A,,D,] .[A,,D,]2 | .G,,[B,G,] .D,[B,G,] |
[V:1] GB z2 | A2 AF | E2 z2 | FA A>B | AF DD/E/ | FF EE | D2 z2 |]
w: 我 呀 | 我 爱 | 你 | 你 爱 我 | 我 爱 你 蜜 雪 冰 城 甜 蜜 | 蜜
[V:2] .G,,[B,G,] .D,[B,G,] | .D,,[F,D,] .A,,[F,D,] | .A,,[A,C] .E,[A,C] | .D,,[F,D,] .A,,[F,D,] | .D,,[F,D,] .A,,[F,D,] | .G,,[G,D,] .A,,[E,A,] | .D,.A,, [D,,D,]2 |]
```
```

</template>
</tab>

## 自定义组件

可以通过 Vue 模板语法、MDC 语法使用的组件。

### Alert

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<alert>

你好

</alert>

<alert type="question">

默认插槽的 [超链接](#alert) **粗体** `Inline code`

</alert>

<alert type="info" title="自定义标题">

默认插槽的 [超链接](#alert) **粗体** `Inline code`

</alert>

<alert type="warning" :card="true">
<template v-slot:title="">

卡片风格 标题插槽的 [超链接](#alert) **粗体** `Inline code`

</template>

默认插槽的 [超链接](#alert) **粗体** `Inline code`

</alert>

<alert type="error" :flat="true">
<template v-slot:title="">

扁平风格 标题插槽的 [超链接](#alert) **粗体** `Inline code`

</template>

默认插槽的 [超链接](#alert) **粗体** `Inline code`

</alert>

<alert title="仅标题，并且自定义图标和颜色" color="var(--c-accent)" icon="tabler:files">



</alert>
</template>

<template v-slot:tab2="">

```mdcwrap expand
::alert
你好
::

::alert{type="question"}
默认插槽的 [超链接](#alert) **粗体** `Inline code`
::

::alert{type="info" title="自定义标题"}
默认插槽的 [超链接](#alert) **粗体** `Inline code`
::

::alert{type="warning" card}
#title
卡片风格 标题插槽的 [超链接](#alert) **粗体** `Inline code`
#default
默认插槽的 [超链接](#alert) **粗体** `Inline code`
::

::alert{type="error" flat}
#title
扁平风格 标题插槽的 [超链接](#alert) **粗体** `Inline code`
#default
默认插槽的 [超链接](#alert) **粗体** `Inline code`
::

:alert{icon="tabler:files" color="var(--c-accent)" title="仅标题，并且自定义图标和颜色"}
```

</template>
</tab>

### Badge

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<badge link="#badge">

普通带链接

</badge>

 <badge :round="true">

纯文本指定圆形

</badge>

 <badge :square="true">

纯文本指定方形

</badge>

 <badge img="https://picsum.photos/seed/codepzj-badge/100/100">

带个图

</badge>



外部域名可以自动获取站点图标 <badge link="https://nuxt.com/">

Nuxt

</badge>

，
<badge link="https://developer.mozilla.org/" :square="true">

MDN Web Docs

</badge>

，
GitHub 链接能自动识别头像 <badge link="https://github.com/codepzj">

codepzj

</badge>

，
也可以通过 `square` 属性显示为方形。

<alert>
<template v-slot:title="">

在其他组件中使用 <badge link="#badge" img="https://picsum.photos/seed/codepzj-link/100/100" text="带链接">



</badge>
</template>

<badge img="https://picsum.photos/seed/codepzj-round/100/100" text="指定圆形" :round="true">



</badge>

 背景色 [可以 <badge img="https://picsum.photos/seed/codepzj-square/100/100" :square="true" text="动态变化">



</badge>

 使用](#badge)

</alert>
</template>

<template v-slot:tab2="">

```mdcwrap expand
:badge[普通带链接]{link="#badge"} :badge[纯文本指定圆形]{round} :badge[纯文本指定方形]{square} :badge[带个图]{img="https://picsum.photos/seed/codepzj-badge/100/100"}

外部域名可以自动获取站点图标 :badge[Nuxt]{link="https://nuxt.com/"}，
:badge[MDN Web Docs]{link="https://developer.mozilla.org/" square}，
GitHub 链接能自动识别头像 :badge[codepzj]{link="https://github.com/codepzj"}，
也可以通过 `square` 属性显示为方形。

::alert
#title
在其他组件中使用 :badge{img="https://picsum.photos/seed/codepzj-link/100/100" text="带链接" link="#badge"}
#default
:badge{img="https://picsum.photos/seed/codepzj-round/100/100" text="指定圆形" round} 背景色 [可以 :badge{img="https://picsum.photos/seed/codepzj-square/100/100" text="动态变化" square} 使用](#badge)
::
```

</template>
</tab>

### BlogHeader

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<blog-header>



</blog-header>
</template>

<template v-slot:tab2="">

```mdc
:blog-header
```

</template>
</tab>

博客标题组件会读取站点配置并展示头像、名称和副标题；标题末尾的动画 Emoji 可在 `app.config.ts` 中配置。

```shwrap
# iconfont 网页版生成的字体子集在 Chrome 124 的版本无法解析，需要借助 fonttools 工具手动生成子集
pip install fonttools brotli
pyftsubset ./AlimamaFangYuanTi.ttf --text=Header文本 --flavor=woff2
```

### <blur>Blur</blur>

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<blur>

你知道得太多了。

</blur>

<blur>
<quote>

也未必。

</quote>
</blur>
</template>

<template v-slot:tab2="">

```mdc
:blur[你知道得太多了。]

::blur
:::quote
也未必。
:::
::
```

</template>
</tab>

### CardList

> 给列表刷上了自定义样式，待完善。

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<card-list>

- 无序列表项1
- 无序列表项2

  - 无序列表项2-1
  
    - 无序列表项2-1-1
  - 无序列表项2-2

</card-list>
</template>

<template v-slot:tab2="">

```mdc
::card-list
- 无序列表项1
- 无序列表项2
  - 无序列表项2-1
    - 无序列表项2-1-1
  - 无序列表项2-2
::
```

</template>
</tab>

### Chat

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<chat>

{:2024-11-09 23:39:30}

{.}

也许

{.}

我们可以聊聊天

{.浩瀚星河}

我还可以有名字

{:浩瀚星河撤回了一条消息}

{用户1}

有趣<br />


我学到了。

</chat>
</template>

<template v-slot:tab2="">

```mdcexpand
::chat
{:2024-11-09 23:39:30}

{.}

也许

{.}

我们可以聊聊天

{.浩瀚星河}

我还可以有名字

{:浩瀚星河撤回了一条消息}

{用户1}

有趣\
我学到了。
::
```

</template>
</tab>

### Copy

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<copy code="rm -rf # 修改命令后再复制，也可撤销修改">



</copy>

<copy code="不带提示符的命令，可以是 URL、单行代码" :prompt="true">



</copy>

<copy code="const customLang = 'js' // 滚动条、边缘羽化会出现，假如它特别特别特别特别特别特别特别特别长" lang="js" prompt="自定义命令提示符、高亮语言">



</copy>
</template>

<template v-slot:tab2="">

```mdcwrap
:copy{code="rm -rf # 修改命令后再复制，也可撤销修改"}

:copy{prompt code="不带提示符的命令，可以是 URL、单行代码"}

:copy{prompt="自定义命令提示符、高亮语言" lang="js" code="const customLang = 'js' // 滚动条、边缘羽化会出现，假如它特别特别特别特别特别特别特别特别长"}
```

</template>
</tab>

#### 自动推断语言

语言会根据命令提示符前缀自动推断，并使用与 Markdown 代码块相同的语言配置和高亮主题。

### EmojiClock

> 现在几点了？

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<emoji-clock>



</emoji-clock>

 (半小时) <emoji-clock :rotate="true">



</emoji-clock>

 (5分钟) <emoji-clock dateTime="2024-11-09 23:39:30">



</emoji-clock>

 (指定时间)

</template>

<template v-slot:tab2="">

```mdc
:emoji-clock (半小时) :emoji-clock{rotate} (5分钟) :emoji-clock{datetime="2024-11-09 23:39:30"} (指定时间)
```

</template>
</tab>

### FeedCard 和 FeedGroup

> 用于在友链页面展示链接，由于友链页面的 Markdown 部分要可能会显示这个组件，就放在这个目录下大家都能调用了。去友链页面看看吧。

### Folding

> 折叠组件，支持折叠和展开，可以嵌套使用。

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<folding>
<template v-slot:title="">

可以通过标题插槽传值 [超链接](#folding) **粗体** `Inline code`

</template>

默认插槽的 [超链接](#folding) **粗体** `Inline code`

<folding :open="true" title="折叠还可以嵌套">

默认展开的折叠。

<alert type="error">
<template v-slot:title="">

在嵌套使用的组件内部使用 MDC 的 `#slotname` 插槽语法

</template>

必须缩进，否则会报错。

</alert>
</folding>
</folding>

<folding :open="true">

```md
- 默认展开的折叠。
```

</folding>
</template>

<template v-slot:tab2="">

```mdcexpand
::folding
  #title
  可以通过标题插槽传值 [超链接](#folding) **粗体** `Inline code`
  #default
  默认插槽的 [超链接](#folding) **粗体** `Inline code`

    ::folding{open title="折叠还可以嵌套"}
    默认展开的折叠。

      ::alert{type="error"}
      #title
      在嵌套使用的组件内部使用 MDC 的 `#slotname` 插槽语法
      #default
      必须缩进，否则会报错。
      ::
    ::
  ::

::folding{open}
```md
- 默认展开的折叠。
```
::
```

</template>
</tab>

### Key

> 按下键时会亮，可以通过 `@press` 配置触发事件，鼠标点击也会触发事件，博客全站搜索框的按键提示使用了这个组件。

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">

- 纯 Code

<key code="Escape">



</key>

 <key code="F2">



</key>

 <key code="Control">



</key>

 <key code="A">



</key>

 <key code=" ">



</key>

 <key code="Tab">



</key>

 <key code="Enter">



</key>



- 指定修饰符、图标、文本（macOS 自动使用图标）

<key code="Control" :icon="true">



</key>

 <key :icon="true" :alt="true">



</key>

 <key :icon="true" :shift="true">



</key>

 <key code=" " text="空格">



</key>

 <key code="Tab" :icon="true">



</key>

 <key code="Enter" :icon="true">



</key>



- 组合键

<key code="A" :shift="true" :ctrl="true">



</key>

 <key :alt="true" :shift="true">



</key>

 <key code="Escape" :icon="true" :alt="true" :ctrl="true">



</key>



~~热血组合技          ~~

</template>

<template v-slot:tab2="">

```mdcwrap
- 纯 Code

  :key{code="Escape"} :key{code="F2"} :key{code="Control"} :key{code="A"} :key{code=" "} :key{code="Tab"} :key{code="Enter"}

- 指定修饰符、图标、文本（macOS 自动使用图标）

  :key{code="Control" icon} :key{alt icon} :key{shift icon} :key{code=" " text="空格"} :key{code="Tab" icon} :key{code="Enter" icon}

- 组合键

  :key{code="A" ctrl shift} :key{alt shift} :key{code="Escape" ctrl alt icon}

~~热血组合技 :key{code="ArrowUp"} :key{code="ArrowUp"} :key{code="ArrowDown"} :key{code="ArrowDown"} :key{code="ArrowLeft"} :key{code="ArrowRight"} :key{code="ArrowLeft"} :key{code="ArrowRight"} :key{code="B"} :key{code="A"}~~
```

</template>
</tab>

### LinkBanner

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<link-banner banner="https://picsum.photos/seed/codepzj-banner/960/480" description="用于演示带背景图片、标题与描述的横幅链接" link="#link-banner" title="探索浩瀚星河">



</link-banner>
</template>

<template v-slot:tab2="">

```mdc
::link-banner
---
banner: https://picsum.photos/seed/codepzj-banner/960/480
title: 探索浩瀚星河
description: 用于演示带背景图片、标题与描述的横幅链接
link: "#link-banner"
# mirror: # 是否借助第三方图片加载服务，见源代码
---
::
```

</template>
</tab>

### LinkCard

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<link-card icon="https://picsum.photos/seed/codepzj-card/100/100" link="#link-card" title="示例链接卡片" description="用于演示图标、标题和描述的组合效果">



</link-card>
</template>

<template v-slot:tab2="">

```mdc
::link-card
---
icon: https://picsum.photos/seed/codepzj-card/100/100
title: 示例链接卡片
description: 用于演示图标、标题和描述的组合效果
link: "#link-card"
# mirror: # 是否借助第三方图片加载服务，见源代码
---
::
```

</template>
</tab>

### Pic

> 用于展示图片，支持说明文字、点击后打开灯箱缩放。

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<pic caption="星空主题示例图片，还支持通过 width 或 height 属性指定尺寸" src="https://picsum.photos/seed/codepzj-picture/960/480">



</pic>
</template>

<template v-slot:tab2="">

```mdc
::pic
---
src: https://picsum.photos/seed/codepzj-picture/960/480
# mirror: # 是否借助第三方图片加载服务，见源代码
caption: 星空主题示例图片，还支持通过 width 或 height 属性指定尺寸
# zoom: false # 是否开启灯箱缩放，默认开启
---
::
```

</template>
</tab>

### Poetry

> 在文章的 type 为 `tech` 或 `story` 时，它有不同的样式。

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<poetry author="一名作者" footer="可选的落款" title="诗有诗的标题">

如你所见，
我,
是一首——
*诗*。

</poetry>
</template>

<template v-slot:tab2="">

```mdc
::poetry
---
title: 诗有诗的标题
author: 一名作者
footer: 可选的落款
---
如你所见，
我,
是一首——
*诗*。
::
```

</template>
</tab>

### Quote

> 在文章的 type 为 `tech` 或 `story` 时，它有不同的样式。

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<quote>

有时候，有些话，有点意思。

</quote>

<quote icon="tabler:files">

令图标有所指，引用亦有中心。

</quote>

<quote>
<template v-slot:icon="">

ヾ(•ω•`)o

</template>

图标插槽也可以是 Emoji 或颜文字，或者英文装饰。

</quote>
</template>

<template v-slot:tab2="">

```mdc
:quote[有时候，有些话，有点意思。]

::quote{icon="tabler:files"}
令图标有所指，引用亦有中心。
::

::quote
#icon
ヾ(•ω•`)o
#default
图标插槽也可以是 Emoji 或颜文字，或者英文装饰。
::
```

</template>
</tab>

### Tab

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<tab :tabs="["一个简单的", "Tab"]">
<template v-slot:tab1="">

```md
# 一个简单的 Tab
```

</template>

<template v-slot:tab2="">

```md
# Tab
```

</template>
</tab>

<tab :tabs="["当当当","高级交互！","就是藏得有点深"]" :active="2" :center="true">
<template v-slot:tab1="">

这个组件设置了居中（自动调整而不是占满宽度）和默认显示第二个选项卡。

</template>

<template v-slot:tab2="">

```md
是这样。
```

</template>

<template v-slot:tab3="">

你找到我了吗？

</template>
</tab>
</template>

<template v-slot:tab2="">

```mdcwrap expand
::tab{:tabs='["一个简单的", "Tab"]'}
#tab1
```md
# 一个简单的 Tab
```
#tab2
```md
# Tab
```
::

::tab
---
tabs: ["当当当", "高级交互！", "就是藏得有点深"]
center: true
active: 2 # 默认显示第二个选项卡，可选
---
#tab1
这个组件设置了居中（自动调整而不是占满宽度）和默认显示第二个选项卡。
#tab2
```md
是这样。
```
#tab3
你找到我了吗？
::
```

</template>
</tab>

### Timeline

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<timeline>

{前天}

看到了小兔

{昨天}

看见了星河

{今天}

是你。

</timeline>

<timeline>

{今日无事}

{今日依旧无事}

{然后——}

一件事<br />


两件事。

*再添一笔*。

</timeline>
</template>

<template v-slot:tab2="">

```mdcexpand
::timeline
{前天}

看到了小兔

{昨天}

看见了星河

{今天}

是你。
::

::timeline
{今日无事}

{今日依旧无事}

{然后——}

一件事\
两件事。

*再添一笔*。
::
```

</template>
</tab>

### Tip

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<tip tip="提示的内容是提示">

我是一条小提示

</tip>

， <tip tip="或许也可以没有内容" :icon="true">

我没有图标

</tip>
</template>

<template v-slot:tab2="">

```mdcwrap
:tip[我是一条小提示]{tip="提示的内容是提示"}， :tip[我没有图标]{icon tip="或许也可以没有内容"}
```

</template>
</tab>

### VideoEmbed

> 放点视频给你看。

<tab :tabs="["组件","语法"]">
<template v-slot:tab1="">
<video-embed id="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" poster="https://picsum.photos/seed/codepzj-video/960/540" type="raw">



</video-embed>
</template>

<template v-slot:tab2="">

```mdc
::video-embed
---
type: raw
id: https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4
poster: https://picsum.photos/seed/codepzj-video/960/540
---
::
```

</template>
</tab>

## 组件使用方法

建议先阅读开头的 MDC 文档，再对照各组件“语法”标签中的源码进行尝试。复杂组件可以从示例参数开始，逐步调整为自己的内容。

### 组件的不完美性

部分组件仍在持续完善，实际使用时请根据页面效果和设备尺寸进行调整。

<section className="footnotes" dataFootnotes="">

## Footnotes

1. [README of micromark-extension-gfm-footnote](https://github.com/micromark/micromark-extension-gfm-footnote#use) [↩](#user-content-fnref-micromark-extension-gfm-footnote)
2. 文章末尾有特殊许可协议，还可从此处返回正文对插槽的讲解。 [↩](#user-content-fnref-copyright)

</section>

const e=`---
title: 个人站无障碍与减弱动效偏好
excerpt: 装饰动效尊重系统减弱动效设置，图标按钮补 aria-label，长文导航用语义标签与 listbox。
category: 前端开发
categoryId: frontend
date: 2025-06-22
author: 徐宁
series: vue-notes
---

个人站首页粒子、打字机、鼠标光晕和滚动入场叠在一起，对习惯静态界面的读者并不友好。2025 年 6 月整理夜间模式时，一并把无障碍和 prefers-reduced-motion 收成可维护清单。站点地图见 [个人站框架篇](/blog/personal-site-framework-overview)；主题变量见 [夜间模式篇](/blog/site-dark-mode-theme-tokens)。

## 两类工作不要混为一谈

| 类型 | 例子 | 做法 |
|------|------|------|
| 装饰性动效 | 背景光晕、粒子、打字机、scroll reveal | 可减弱或关闭，加 aria-hidden |
| 功能性交互 | 主题切换、移动端菜单、目录 FAB | 必须有可读名称与键盘可达 |

装饰层关掉不应影响导航和阅读；功能层即使动效关闭也要能操作。

## 全局减弱动效

src/style.css 在 @media (prefers-reduced-motion: reduce) 里统一压短动画与过渡，并把 .reveal 直接显示：

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .reveal {
    opacity: 1;
    transform: none;
  }
}
\`\`\`

这是兜底。仍建议在注册监听器之前用 JS 判断，避免粒子或鼠标跟随白白占 CPU。

## 按组件关闭动效

首页几个模块在 onMounted 里先读媒体查询：

\`\`\`javascript
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
\`\`\`

| 组件 | 行为 |
|------|------|
| MouseGlow.vue | 不绑 mousemove，且要求 hover 与 pointer fine |
| ParticleCanvas.vue | 不启动动画循环 |
| TypingRoles.vue | 静态展示第一句，去掉打字删除循环 |
| CountUp.vue | 直接显示终值 |
| useParallax.js | 不更新视差位移 |

Home.vue 另有一段 scoped 规则，单独关掉 hero 光束、扫描线、头像环等 CSS animation，避免全局规则漏网。

## aria 与语义标签

纯装饰节点统一 aria-hidden="true"，包括背景网格、hero 装饰层、App.vue 的 bg-layer。

需要操作的控件补可读名称：

- ThemeToggle 的 aria-label 随浅色与夜间切换文案，Navbar 汉堡按钮的 aria-expanded 与切换菜单文案，ContentOutline 移动端 FAB 的 aria-expanded，sheet 用 role="dialog"，BlogSeriesNav 系列切换的 aria-haspopup 与 listbox

架构示意图用 role="img" 加 aria-label 描述层次，不依赖颜色传达结构。

## 对比度与主题

夜间模式里 --ink-muted、标签底、表格表头要单独验对比度，见 [夜间模式篇](/blog/site-dark-mode-theme-tokens)。无障碍不仅是动效，色弱与低视力同样依赖语义色变量，而不是固定浅灰字。

## 滚动入场 composable

useScrollReveal 用 IntersectionObserver 给 .reveal 加 revealed。在减弱动效模式下 CSS 已让元素可见，observer 仍可运行，只是过渡几乎为零。若以后要省 observer，可在 composable 开头读 prefers-reduced-motion 并直接 classList.add revealed。

## 验收清单

1. 系统设置里打开减弱动态效果，刷新首页，应无粒子、无鼠标光晕、打字机静止
2. Tab 键走导航栏，主题按钮、菜单、链接顺序合理
3. 手机打开博客长文，目录 FAB 可展开，关闭后 body 滚动恢复
4. 系列文章底部切换器，键盘可聚焦，展开列表可选篇目

## 小结

个人站无障碍不必一次做到 WCAG 审计级，但装饰动效要可关、控件要有名字、颜色走语义变量三条应写进组件规范。新增动效前先问系统减弱动效时是否仍可用，纯装饰是否标了 aria-hidden。

标签：Vue.js, CSS, 个人网站
`;export{e as default};

const e=`---
title: "Web 相机"
description: "课程小项目，Vue 3 移动 Web 相机，getUserMedia 取景、MediaPipe 人脸 AR、模板滤镜与 IndexedDB 相册。"
date: "2025-11-01"
gradient: "linear-gradient(135deg, rgba(100, 116, 139, 0.18) 0%, rgba(71, 85, 105, 0.34) 100%)"
status: "已完成"
category: "app"
tier: "other"
demoUrl: null
codeUrl: null
featured: false
cover: "/images/projects/camera-app/cover.png"
technologies:
  - Vue 3
  - TypeScript
  - Vant
  - Vite
  - MediaPipe Face Mesh
  - getUserMedia
  - IndexedDB
  - Capacitor
---

## 项目概述

Web 相机是 2025 年 11 月至 2026 年 1 月期间的课程小项目，在浏览器里做一套接近原生相机 App 的 Web 界面，包含取景预览、前后摄切换、网格线、CSS 滤镜、贴纸模板、相册与人脸 AR 特效。核心链路是摄像头传感器数据经 Web API 进入页面，再在 Canvas 上叠 AR 与模板后导出 JPEG。

真机演示多在 Android 手机 Chrome 中打开；项目预留 Capacitor 与 HBuilder plus 类型声明，用于探索原生相机与传感器能力，主路径仍是 Web 标准 API。

相关笔记见 [Vue.js 手记](/blog/series/vue-notes) 中标记 camera-app 的篇目。

## 界面与功能

![Web 相机主界面取景与 AR 特效菜单](/images/projects/camera-app/cover.png)

| 模块 | 说明 |
|------|------|
| 取景预览 | video 元素与 getUserMedia，facingMode 切换前后摄 |
| AR 特效 | MediaPipe Face Mesh 追踪关键点，Canvas 绘制猫耳狗耳墨镜 |
| 模板 | 拍立得边框、动态 DOM 模板与静态 PNG 叠在预览上 |
| 滤镜 | CSS filter 作用于视频与导出画布 |
| 拍照合成 | canvas 依次叠视频、模板、AR 层后 toDataURL |
| 相册 | IndexedDB CameraPhotoDB 本地存 Base64 照片 |
| 素材库 | AR 页上传自定义贴纸，回传相机页应用 |

顶部特效与模板切换、设置里的网格线与曝光项，对应课程对传感器参数与取景辅助的实验需求。

## 传感器与设备能力

本项目传感器主要指摄像头成像链路与基于画面的视觉追踪。

| 能力 | 实现 | 用途 |
|------|------|------|
| 摄像头视频流 | getUserMedia 与 MediaStream | 实时预览与 AR 输入 |
| 镜头朝向 | facingMode user 与 environment | 前后摄翻转 |
| 分辨率意向 | width height ideal | 尽量铺满竖屏 |
| 人脸关键点 | MediaPipe face_mesh | AR 贴纸锚点 |
| 闪光灯 UI | flashEnabled 与白屏动画 | 视觉闪光，非硬件 torch |
| 曝光设置 | ImageCapture 类型已声明 | 设置项预留，真机 Web 路径未打通 |

曾尝试通过 HBuilder plus.camera、ImageCapture.applyConstraints 与 Capacitor 壳接入 Android 原生传感器与相机 HAL，遇到权限、双管线冲突与 WebView 能力裁剪等问题，详见手记 [原生 Android 传感器 Web 相机里的未竟之路](/blog/camera-app-android-native-barriers)。

\`\`\`typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: facing.value,
    width: { ideal: 1080 },
    height: { ideal: 1920 }
  },
  audio: false
})
videoRef.value.srcObject = stream
\`\`\`

## 技术实现

Vue 3 与 TypeScript Composition API 组织页面状态；Vant 4 负责导航栏、弹窗与 Tab；Vite 7 构建；Vue Router 开发用 History、生产用 Hash；MediaPipe 从 CDN 动态加载；IndexedDB 存照片与模板；Capacitor 与 plus 类型为原生打包预留。

\`\`\`typescript
async function capturePhoto() {
  const ctx = canvasRef.value.getContext('2d')
  ctx.drawImage(videoRef.value, 0, 0, width, height)
  if (activeTemplate.value) drawTemplateLayer(ctx)
  if (arEnabled.value) drawArOverlay(ctx, landmarks.value)
  return canvasRef.value.toDataURL('image/jpeg', 0.92)
}
\`\`\`

\`\`\`typescript
const db = await openDB('CameraPhotoDB', 1, {
  upgrade(db) { db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true }) }
})
await db.add('photos', { dataUrl, createdAt: Date.now() })
\`\`\`

## 开发周期与取舍

2025 年 11 月完成取景、拍照合成、相册与基础 UI。12 月接入 Face Mesh AR 与滤镜页，调试手机浏览器权限与 Canvas 尺寸同步。2026 年 1 月完善模板与素材库、Hash 路由打包，并梳理原生传感器路线与 Web 之间的障碍。

课程时间有限，优先保证浏览器内可演示的完整闭环；硬件闪光灯、曝光补偿与陀螺仪驱动 AR 稳定等留在类型声明与手记里作为延伸思考。

## 本地运行

\`\`\`bash
npm install
npm run dev
\`\`\`

手机与电脑同一局域网时，用 HTTPS 或 Chrome 远程调试访问 dev 地址，getUserMedia 在非 localhost 下要求安全上下文。生产构建用 npm run build 与 npm run preview。Capacitor 已配置应用 ID 与 webDir，若要打 APK 需再接入原生插件与权限清单，本项目以 Web 演示为主。
`;export{e as default};

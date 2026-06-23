const e=`---
title: "Web 相机从 getUserMedia 到 Face Mesh"
excerpt: "课程 Web 相机里摄像头数据怎么进页面、AR 贴纸每帧怎么追踪、拍照时四层 Canvas 怎么对齐，附真机上踩过的权限和分辨率坑。"
category: "前端开发"
categoryId: "frontend"
date: "2025-11-18"
author: "徐宁"
project: camera-app
series: vue-notes
---

2025 年 11 月做课程 Web 相机时，老师强调的传感器在 Web 侧首先落地为摄像头：不是去读 Java 里的 SensorManager，而是搞清楚浏览器如何把镜头数据交给 JavaScript，以及在此基础上做 AR 贴纸。这篇只写已经跑通的主路径；原生 Android 传感器与硬件控制在另篇手记里单独记。

## 传感器在本项目里的含义

在原生 Android 开发里，传感器常指加速度计、陀螺仪、光线等。Web 相机项目里，我实际依赖的是：

| 数据源 | 接口 | 角色 |
|--------|------|------|
| 摄像头成像 | navigator.mediaDevices.getUserMedia | 连续视频帧，光传感器与 ISP 之后的软件流 |
| 人脸几何 | MediaPipe Face Mesh | 从视频帧估计 468 个三维关键点，充当视觉传感器 |
| 设备朝向镜头 | facingMode 约束 | 切换前/后摄，不是陀螺仪 |

陀螺仪、磁力计在本项目未接入业务逻辑。曾设想用姿态稳定 AR 贴纸，但 Web 权限与壳层问题放在原生篇讨论。

## 摄像头初始化：getUserMedia 约束

Home.vue 里 initCamera 是整条链路的入口：

\`\`\`javascript
const constraints: MediaStreamConstraints = {
  video: {
    facingMode: currentFacingMode.value,  // 'environment' | 'user'
    width: { ideal: window.innerWidth },
    height: { ideal: window.innerHeight }
  },
  audio: false
}
mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints)
videoRef.value.srcObject = mediaStream.value
\`\`\`

设计取舍：

- 用 ideal 而不是固定像素，让浏览器在性能与清晰度之间自选；真机上 videoWidth/videoHeight 常与 CSS 显示尺寸不一致，拍照合成时要再算裁剪见下文
- 翻转镜头只改 facingMode 并先 stop 旧轨道再重新 getUserMedia，避免双路占用摄像头导致黑屏
- audio false 减少权限弹窗干扰；课程项目不需要录像

### 真机障碍 1：安全上下文

手机浏览器访问 dev 服务器时，非 HTTPS 且非 localhost 时 getUserMedia 直接不可用。我的做法：局域网用 vite --host 加证书，或 Chrome 远程调试；纯 HTTP 局域网地址会失败并弹出请授予摄像头权限，其实是 API 未授权，不是用户没点允许。

### 真机障碍 2：onloadedmetadata 与 AR 重启

视频元数据就绪后才同步 AR Canvas 尺寸并 startAR。若元数据未触发就发 FaceMesh，会出现贴纸漂移或画布全透明。切换镜头后加了 setTimeout 300ms 再启 AR，减少竞态。

## Face Mesh：把视频帧当传感器输入

AR 特效猫脸、狗脸、墨镜不走原生人脸 SDK，而是：

1. CDN 动态加载 @mediapipe/face_mesh
2. faceMesh.send image videoRef.value 每帧提交当前视频元素
3. onResults 里用 landmark 索引画 Canvas 如眉毛 70/300、鼻尖 1、眼角 33/263

\`\`\`javascript
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
})
\`\`\`

requestAnimationFrame 循环调用 send，形成软实时追踪回路：摄像头到视频帧，再到 WASM 推理、landmarks 与 2D 绘制。

### 障碍：性能与发热

中端 Android 上连续 FaceMesh 与全屏预览，几分钟即可明显发热、帧率下降。缓解手段：

- maxNumFaces 1 限制单人场景
- 关闭 AR 时 stopAR：faceMesh.close、清空 Canvas、isARActive = false
- 未使用 @mediapipe/camera_utils 的 Camera 类依赖已安装但未引用，手写 rAF 更直观，但少了官方对帧率的上限控制

### 障碍：CDN 与首次加载

模型与 wasm 从 cdn.jsdelivr.net 拉取，校园网或弱网下首次开特效会卡几秒。失败时 FaceMesh 加载失败控制台报错，UI 仍显示菜单但无贴纸，需要 loading 态课程版未做完整。

## 拍照合成：四层传感器输出对齐

takePhoto 不是 ImageCapture.takePhoto()，而是把当前预览态 rasterize 到 Canvas：

| 顺序 | 图层 | 来源 |
|------|------|------|
| 1 | 视频帧 | drawImage video，带 CSS 滤镜 |
| 2 | 静态模板 PNG | templateRef |
| 3 | 动态模板 DOM | html2canvas 降级或空画布 |
| 4 | AR Canvas | canvasRef Face Mesh 当前帧 |

关键修复：拍照前强制 reflow 并 requestAnimationFrame 再读 clientWidth/clientHeight，否则模板与 AR 层尺寸与视频不一致，导出图会裁切错位。

视频显示比例 ≠ 采集比例时，按 videoRatio 与 previewRatio 计算 offsetX/offsetY，模拟取景框内所见即所得。

## 其它 Web 侧类传感器能力

| 功能 | 实现 | 状态 |
|------|------|------|
| 网格线 | CSS 渐变背景 camera-grid | 已完成 |
| 拍照闪光 | .capture-flash 白屏动画 | 视觉反馈，非硬件闪光 |
| 滤镜 | ctx.filter 或视频 CSS filter | 已完成 |
| 曝光调节 | 设置项与 handleExposureSetting | 仅占位 console.log |
| 闪光灯开关 | flashEnabled ref | 未接 torch 约束 |

global.d.ts 里扩展了 ImageCapture、PhotoSettings.fillLightMode、exposureCompensation 等，是为下一层硬件控制准备的类型，主流程尚未调用。

## 数据持久化：IndexedDB

照片以 Base64 JPEG 存入 CameraPhotoDB，不经过文件系统 API。优点是纯 Web 可跑；缺点是大图占内存，相册多了以后 getAll 会慢，课程规模可接受。

## 小结

Web 相机的传感器故事，本质是 MediaStream 连续帧与可选 Face Mesh 几何估计。镜头翻转靠 facingMode；AR 靠每帧推理；成片靠 Canvas 多图层对齐。这条链路在 Android Chrome 里可完整演示，也是课程验收的主线。硬件闪光灯、曝光补偿、陀螺仪稳像会撞上 Web API 与 WebView 的边界，那是原生篇的主题。

标签：Vue.js, 移动开发
`;export{e as default};

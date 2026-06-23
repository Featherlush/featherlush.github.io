const e=`---
title: "Web 相机接原生传感器为何走不通"
excerpt: "ImageCapture、HBuilder plus.camera、Capacitor 与 DeviceOrientation，Web 相机接原生传感器时遇到的权限、双管线与能力缺失。"
category: "前端开发"
categoryId: "frontend"
date: "2025-12-28"
author: "徐宁"
project: camera-app
series: vue-notes
---

Web 相机主链路用 getUserMedia 与 MediaPipe 已经能交作业。12 月我又想多做几步：真闪光灯、曝光补偿、原生分辨率拍照，甚至陀螺仪让 AR 贴纸更稳。这些在 Android 原生里都有成熟 API，但在纯 Web 与手机浏览器环境下，每一步都卡在不同层上。这篇记录试过但没并入主线的路线与障碍。

## 目标能力 vs 原生 API 对照

| 期望能力 | Android 原生常见路径 | 我在 Web 项目里的尝试 |
|----------|----------------------|------------------------|
| 硬件闪光灯或手电筒 | CameraManager torch、拍照 flash 模式 | MediaTrackConstraints.torch、ImageCapture.fillLightMode |
| 曝光补偿 | CaptureRequest.CONTROL_AE_EXPOSURE_COMPENSATION | ImageCapture.applyConstraints exposureCompensation |
| 高分辨率静态拍照 | ImageReader 或 takePicture | ImageCapture.takePhoto |
| 前摄或后摄 | CameraCharacteristics.LENS_FACING | facingMode 已成功 |
| 陀螺仪或姿态 | SensorManager TYPE_GYROSCOPE | DeviceOrientation 或 DeviceMotion 事件 |
| 原生相机预览 | CameraX 或 plus.camera | HBuilder 5+ plus.camera.getCamera |

主路径只稳定实现了镜头朝向；其余停留在类型声明、设置项 UI 或壳层配置。

## ImageCapture API：类型有了，真机常常没有

我在 src/types/global.d.ts 里补全了 ImageCapture 与 PhotoSettings fillLightMode、exposureMode、pointsOfInterest 等，设想流程是：

\`\`\`javascript
const track = mediaStream.getVideoTracks()[0]
const capture = new ImageCapture(track)
const caps = await capture.getCapabilities()
await capture.applyConstraints({ advanced: [{ exposureCompensation: 1 }] })
const blob = await capture.takePhoto({ fillLightMode: 'flash' })
\`\`\`

### 障碍 1：ImageCapture 构造函数不存在

多数 Android Chrome 版本未实现 ImageCapture 接口或仅在部分机型开启。typeof ImageCapture === 'undefined' 时，只能继续用 Canvas 截帧，画质与快门速度都不如原生 takePicture。

### 障碍 2：getCapabilities 返回空对象

即使 getUserMedia 成功，MediaTrackCapabilities 里经常没有 torch、exposureCompensation、width 范围。设置页里的曝光度自动因此只能 console.log 调整曝光度，没有可绑定的约束字段。

### 障碍 3：torch 与拍照闪光不是一回事

部分机型支持 applyConstraints advanced torch true 当手电筒，但：

- 与拍照瞬间闪光的控制路径不同
- 和 Canvas 预览同时占用同一条 MediaStreamTrack 时，个别 ROM 会重启相机流，AR 链路中断

项目里 flashEnabled 与顶部闪光灯区域最终用白屏动画代替硬件闪光，避免黑屏重启。

## HBuilder plus.camera：第二套相机管线

global.d.ts 里为 DCloud 5+ Runtime 写了 plus.camera.getCamera、captureImage、startCapture 等签名，对应把 Web 打包成 APK 后调用原生相机视图。

### 障碍 1：与 video 双开冲突

当前页面已经用 getUserMedia 占用了摄像头。再调 plus.camera.startCapture 往往会 Camera 占用冲突，除非先释放 Web 流，预览会黑掉，MediaPipe 也无法取帧。

### 障碍 2：预览坐标系与 Web 层不对齐

plus.camera 预览是原生 Rect 贴在 WebView 上，AR Canvas 画在 Web 层。两者分辨率、镜像、延迟不一致时，猫耳贴纸与脸错位，调参成本远高于 FaceMesh 单管线。

### 障碍 3：纯浏览器无法验证

plus 仅在 HBuilder 打包的 WebView 存在，日常 \`npm run dev\` 完全测不到。需要维护双构建产物，纯 Web 演示与 5+ 壳，课程周期内没有并入 CI。

### 障碍 4：plus.android 反射调 SensorManager 的路径

理论上可用 plus.android.importClass android.hardware.SensorManager 注册 SensorEventListener 读陀螺仪，但这要求：

- 自定义 5+ 扩展或 unsafe 反射，无 TypeScript 保障
- 与 JS 主线程回调、Web AR 的 rAF 同步自己处理
- 应用商店与隐私合规要单独说明传感器数据用途

我停留在查阅文档与类型占位，没有写进 Home.vue 生产逻辑。

## Capacitor：装了 CLI，没装传感器插件

package.json 含 @capacitor/core、@capacitor/cli，capacitor.config.ts 只有：

\`\`\`typescript
appId: 'com.kuaishanAR.cameraapp',
webDir: 'dist'
\`\`\`

没有 @capacitor/camera、@capacitor/motion 等插件，也没有 android/ 原生工程提交。也就是说 Capacitor 只是打包占位，并未形成 cap add android 加 motion 插件的完整链路。若走 Capacitor Motion 读陀螺仪，仍需用户授权、处理 WebView 与原生插件桥接，和 MediaPipe 帧循环的融合一样是工程题；时间不够，未实施。

## DeviceOrientation 与 DeviceMotion：AR 稳像落空

用陀螺仪补偿贴纸抖动，浏览器标准是：

\`\`\`javascript
window.addEventListener('deviceorientation', handler)
window.addEventListener('devicemotion', handler)
\`\`\`

### 障碍 1：iOS 需用户手势授权，Android Chrome 亦逐步收紧

很多环境下默认不派发或需 HTTPS 与权限弹窗，与打开页面即开相机的体验冲突。

### 障碍 2：坐标系与屏幕旋转

alpha/beta/gamma 与摄像头预览的镜像、竖屏固定 UI 组合后，补偿公式机型差异大。FaceMesh 已提供人脸相对位置，陀螺仪增量容易过补偿，贴纸反而抖。

### 障碍 3：与 FaceMesh 重复

人脸贴纸锚在 landmarks 上，头部转动主要由脸带动；陀螺仪更适合世界坐标 AR 贴地板、贴墙，不是猫耳特效的首选传感器。

## WebView 与系统浏览器的权限差异

同一套代码在电脑 Chrome 与手机 Chrome 表现不一致：

| 现象 | 原因 |
|------|------|
| 预览清晰但导出模糊 | 截帧分辨率 ≠ 显示分辨率 |
| 切换镜头后 AR 偏移 | Canvas 尺寸未与 onloadedmetadata 同步 |
| 设置项无法调曝光 | getCapabilities 无曝光字段 |
| 浏览器地址栏旁有摄像头使用中 | 正常；系统级指示，Web 无法关闭 |

在微信内置浏览器、部分国产 ROM 内置浏览器中，getUserMedia 行为更不可预测，课程演示统一用 Chrome 直接打开。

## 若重来一次，我会怎么选

| 需求 | 更现实的方案 |
|------|----------------|
| 课程 Web 演示 | 维持 getUserMedia、Canvas 与 FaceMesh |
| 硬件闪光或曝光 | 原生壳与 ImageCapture 特性检测，降级到 UI 闪光 |
| 原生画质拍照 | 单独原生拍照模式，与 AR 预览互斥，不要双开 |
| 陀螺仪稳像 | 优先调 FaceMesh minTrackingConfidence；真需 IMU 用 Capacitor Motion 与原生插件 |
| 长期维护 | Capacitor Camera 插件一条线，弃用 plus 双栈 |

## 小结

Web 相机的传感器困境不是某一行代码写错，而是能力模型分层：浏览器给你的是 MediaStream 抽象，不是 Camera2 全功能句柄；原生给你的是 HAL 级控制，但与 Web 预览难共存；IMU 在 Web 里权限与坐标系都不友好。项目把能稳定演示的留在 getUserMedia 主链路；原生与硬件控制留在类型声明与这篇未竟之路里，对读代码的人，这比假装 Web 已完全等价原生相机更有参考价值。

标签：移动开发, 传感器
`;export{e as default};

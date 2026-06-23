const e=`---
title: "ShapeWeave"
description: "课程设计大作业，传统吉祥纹样器形自适应生成，Vue 3 与 FastAPI，本地 Stable Diffusion ControlNet 与智谱 CogView 混合引擎。"
date: "2026-06-01"
gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(79, 70, 229, 0.36) 100%)"
status: "已完成"
category: "ai"
tier: "other"
demoUrl: null
codeUrl: null
featured: false
cover: "/images/projects/shape-weave/cover.png"
technologies:
  - Vue 3
  - Element Plus
  - FastAPI
  - Stable Diffusion 1.5
  - ControlNet
  - LoRA
  - IP-Adapter
  - 智谱 CogView
  - PyTorch
  - Diffusers
---

## 项目概述

ShapeWeave 器形织纹是 2026 年 6 月课程设计大作业，面向传统吉祥纹样与器物器形的 Web 生成系统。用户选择团扇、玉佩、折扇、书签、瓦当、瓷瓶、花瓶、笔筒等载体，用文字描述、参考纹样或器物模板驱动 AI，在轮廓约束内生成或适配纹样，并支持纹样与实物模板合成渲染。

前端是参数面板与预览区的产品式界面；后端是可切换的双引擎，本地 ControlNet Inpaint 与 LoRA 以及 IP-Adapter 管线，与智谱云端文生图图生图互补。开发过程中最大的体会不是调一个 API，而是生成式 AI 与几何约束、文化语义之间的缝隙，手记里写了混合引擎取舍与课设阶段的感触。

相关笔记见 [AI 手记](/blog/series/ai-notes) 中标记 shape-weave 的篇目。

## 界面与功能

![ShapeWeave 主界面器形选择与生成参数](/images/projects/shape-weave/cover.png)

| 模块 | 说明 |
|------|------|
| 器形选择 | 八种内置载体，平面与立体两类 |
| 生成模式 | generate 全新纹样、fit 已有纹样适配、render 纹样与器物模板渲染 |
| 引擎切换 | 智谱云端默认演示，本地 SD 需 GPU 与模型目录 |
| 轮廓控制 | 软边缘像素、ControlNet 权重、扩散步数 |
| 参考上传 | 参考纹样与器物模板，分别走 IP-Adapter 与 mask warp |
| 结果 | Base64 预览与一键下载 PNG |

顶部引擎分段器读 /api/status，按环境变量与本地模型是否就绪自动禁用不可用项。

## 三种生成模式

| 模式 | 输入 | 本地 SD 思路 | 智谱路径 |
|------|------|--------------|----------|
| generate | 描述词与可选参考图 | ControlNet Inpaint 在 mask 内生成 | CogView 文生图图生图与本地 mask 裁切 |
| fit | 必传纹样图 | warp 贴合与 Inpaint 重绘边缘 | 本地 warp 后送智谱图生图增强 |
| render | 纹样与器物模板 | 几何 warp 与模板混合 | 本地合成后云端细化 |

器形自适应的核心在 mask 与几何，build_shape_mask、深度图、warp_pattern_to_shape 等工具把扩散模型的自由生成压进器物轮廓，这是课设里与传统文生图玩具最大的不同。

\`\`\`python
def build_shape_mask(shape_id: str, size: int) -> np.ndarray:
    template = SHAPE_TEMPLATES[shape_id]
    mask = cv2.imread(template["mask_path"], cv2.IMREAD_GRAYSCALE)
    return cv2.resize(mask, (size, size), interpolation=cv2.INTER_AREA)
\`\`\`

## 技术实现

前端 shape-weave 目录用 Vue 3、Vite、Element Plus 与 Axios FormData。混合 API 在 main_hybrid.py，FastAPI 支持 engine 切换 local 或 zhipu。本地生成走 pipeline/generator.py，国风 SD1.5、ControlNet、瓷绘 LoRA 与 IP-Adapter；云端走 pipeline/zhipu_generator.py；config.py 维护器形模板表与模型路径。

\`\`\`python
@app.post("/api/generate")
async def generate(
    engine: str = Form("zhipu"),
    mode: str = Form("generate"),
    prompt: str = Form(""),
    shape: str = Form("fan")
):
    if engine == "local":
        return await run_local_pipeline(mode, prompt, shape, files)
    return await run_zhipu_pipeline(mode, prompt, shape, files)
\`\`\`

\`\`\`javascript
const form = new FormData()
form.append('engine', engine.value)
form.append('mode', mode.value)
form.append('prompt', prompt.value)
form.append('shape', selectedShape.value)
const { data } = await axios.post('/api/generate', form)
previewUrl.value = \`data:image/png;base64,\${data.image}\`
\`\`\`

本地模型默认使用国风 SD1.5 与 softedge ControlNet 等；无 GPU 时 ControlNet profile 自动降为 lite。纹样 LoRA 优先 motif_lora，瓷绘触发词 porcelain motif。

## 本地运行

后端在 shape-weave-backend 目录，pip 安装依赖，配置环境变量中的智谱 API Key，运行 main_hybrid.py 默认端口 8005。前端 npm install 后 npm run dev，/api 代理到后端。纯本地 SD 可用 main.py；仅智谱可用 main_zhipu.py。完整 ControlNet 管线需下载底模、ControlNet 与 IP-Adapter，课设演示以智谱与本地几何后处理为主路径。

## 课设阶段的 AI 感触摘要

约束比创意难，纹样要满幅对称可平铺，扩散模型却爱画人脸留白与写实光影，negative prompt 与 mask 是日常功课。云端与本地不是二选一，智谱出图快语义跟手，ControlNet 轮廓准可复现，混合架构让答辩现场不绑单卡 GPU。文化资产是数据问题，国风底模与瓷绘 LoRA 比裸 SD1.5 更接近吉祥纹样，器形边界仍要靠传统 CV 的 mask 与 warp。产品界面用固定参数与下载闭环，让用户感知工具而非抽卡。

展开见手记 [混合引擎与轮廓约束](/blog/shape-weave-hybrid-engine-mask) 与 [课设里的生成式 AI 感触](/blog/shape-weave-ai-reflections)。
`;export{e as default};

const n=`---
title: "ShapeWeave 混合引擎与 mask 管线"
excerpt: "本地 SD Inpaint 与智谱 CogView 共用一套器形 mask。generate、fit、render 三种模式在代码里怎样分叉，同名滑块在不同引擎下语义为何不同。"
category: "后端开发"
categoryId: "backend"
date: "2026-06-08"
author: "徐宁"
project: shape-weave
series: ai-notes
---

ShapeWeave 后端不是单一 requests.post 智谱，而是同一套器形上下文喂给两条生成链路。这篇补技术骨架，方便对照仓库里的 shape-weave-backend；AI 课设阶段的整体感触在同系列另一篇手记里。

## 服务入口：为什么用 main_hybrid.py

课设演示默认启动：

\`\`\`bash
cd shape-weave-backend
python main_hybrid.py   # 端口 8005
\`\`\`

main_hybrid.py 在一个 FastAPI 应用里注册：

| 路由 | 作用 |
|------|------|
| GET /api/status | 返回 local 或 zhipu 是否可用及默认引擎 |
| POST /api/generate | engine 表单字段选择生成器 |
| POST /api/preview | 返回 mask 或深度等预览 bundle，调试用 |

_resolve_engine 逻辑：

- 请求未带 engine 时读 SHAPEWEAVE_DEFAULT_ENGINE 或有 Key 用智谱
- 智谱未配置 ZHIPU_API_KEY 时，只能 local
- models/ 底模目录不存在时，只能 zhipu

前端 App.vue 挂载时 fetchEngineStatus()，用 el-segmented 禁用不可用项，并把选择写入 localStorage。

## 器形上下文：plane 与 stereo

config.py 的 SHAPE_TEMPLATES 为 8 种器形标记 type 为 plane 或 stereo，并映射内置 PNG 模板路径：

\`\`\`python
"round": {"name": "圆形团扇", "type": "plane", "template": "round_fan.png"},
"bottle": {"name": "青瓷瓶", "type": "stereo", "template": "porcelain_bottle.png"},
\`\`\`

_resolve_shape_context 本地 generator 会：

1. build_shape_mask — 几何或从模板图提取硬 mask，外扩 soft_px 得软边缘
2. 立体器形额外 extract_depth 供 depth ControlNet
3. build_control_stack — softedge、canny 或 depth 条件图叠成 ControlNet 输入

器形自适应在代码里首先是 mask 张量，其次才是 prompt。

## 本地管线：ControlNet Inpaint 全家桶

AIPatternGenerator 单例加载：

| 组件 | 路径或说明 |
|------|-------------|
| 底模 | models/base/guofeng_sd15 diffusers 格式 |
| ControlNet | controlnet_softedge 默认；有 GPU 可 auto 启用 canny 与 depth |
| LoRA | motif_lora PEFT 或 auspicious_pattern.safetensors |
| IP-Adapter | 参考纹样图风格引导 |
| Scheduler | DPM++ 2M Karras |

generate_pattern 大致步骤：

1. 解析 prompt：LoRA 触发词、用户描述与 GUOFENG_STYLE_PROMPT
2. 在 mask 内 Inpaint，control_weight 调节 ControlNet 强度
3. apply_hard_mask 去掉器形外泄漏像素
4. 可选 ref_image 走 IP-Adapter 占位灰图避免 PEFT 报 added_cond_kwargs=None

无 CUDA 时 CONTROLNET_KEYS 降为仅 softedge，否则三联 ControlNet 显存爆炸，这是环境感知配置，不是偷懒。

## 智谱管线：云端出图与本地裁切

ZhipuPatternGenerator 不加载 torch。核心模式：

| 模式 | 智谱侧 | 本地侧 |
|------|--------|--------|
| generate | 文生图或参考图与描述图生图 | 生成后 resize 与 apply_hard_mask |
| fit | 图生图增强 | 先 warp_pattern_to_shape 再上传合成图 |
| render | 图生图细化 | warp 与模板混合后再送云端 |

control_weight、steps 在智谱路径里常被 del 掉，云端 API 参数集与本地 diffusers 不一致，同名滑块对不同引擎语义不同，这是混合 UI 要注意的诚实设计或后续按引擎隐藏无效项。

## 三种 mode 的前端契约

ParamPanel.vue 与后端 mode 字段对齐：

| mode | 必填 | 滑块 |
|------|------|------|
| generate | prompt | controlWeight、softEdge、steps |
| fit | patternFile | softEdge、steps |
| render | patternFile 与模板 | softEdge、steps |

generate.js 用 FormData 上传，timeout 180000，本地 50 步与三联 ControlNet 在笔记本上可能接近上限。

## 模型与数据工程课设隐性工作量

仓库 models/ 体积远大于前端；scripts/ 含：

- generate_templates.py / sync_shapes_to_templates.py — 器形图与 mask 对齐
- generate_pattern_examples.py — 示例 input/output 说明 conditioning 质量

examples/README.md 明确 output 部分为流程示意，非固定 seed 的 AI 成片，避免把示例图当成模型精度证明。

HF_ENDPOINT 默认 hf-mirror，缓解国内下载底模问题。

## 与纯 AI 方案对比

| 方案 | 优点 | ShapeWeave 未采用的原因 |
|------|------|---------------------------|
| 仅智谱文生图 | 极简 | 轮廓泄漏，难做 fit/render |
| 仅 ComfyUI 工作流 | 节点灵活 | 课设要可交付的 Web 与 API |
| SDXL 与更大模型 | 画质 | 显存与推理时间，SD1.5 与 LoRA 够用 |
| 端到端 3D 纹理 | 真立体 | 超出课程周期 |

## 小结

ShapeWeave 的技术核心是共享 mask 几何、分叉生成后端：本地用 ControlNet Inpaint 把扩散关在器形里；智谱用云端语义补质量，用 OpenCV 补边界。理解这条链，再读同系列关于随机性、文化语义与产品诚实的讨论，会更有落脚点。

标签：生成式 AI
`;export{n as default};

const n=`---
title: 裁剪、扫描线与 Phong 光栅化的缺口
excerpt: 标准视景体裁剪、多边形填充、Z-buffer 和 Phong 在课设代码里怎么接，depth 为什么没生效一并说明。
category: 计算机图形学
categoryId: graphics
date: 2024-12-15
author: 徐宁
project: scene-roaming
series: cg-notes
---

场景漫游画面不理想，一大半出在 **光栅化与着色** 这一截。裁剪后的多边形要变成像素，像素要有正确深度和颜色。课设里 **裁剪和扫描线填充按讲义写通了**，但 **深度缓冲没有真正参与写像素**，Phong 也有方向向量笔误。这篇记实现细节；框架总览见 [hducg 与 SDL](/blog/cg-hducg-sdl-framework)。

## 一、两级裁剪

### 1. 相机系近远平面

\`Camera::clipLineNearFar\` 与 \`clipTriangleNearFar\` 在 **eye space** 用 \`z = -n\` 和 \`z = -f\` 裁剪。

三角形路径先对 \`-n\` 平面做 Sutherland-Hodgman，\`sign=1\`，再对 \`-f\`，\`sign=-1\`，可能把三角形裁成 **多边形**，最多 5 顶点。

### 2. NDC 标准视景体

\`clipPolygon\` 对 x、y 四个边界依次裁剪，顺序为 \`x=-1\`、\`x=1\`、\`y=-1\`、\`y=1\`，仍是 SH 算法。

线段用 \`clipLine\`，对端点编 **Outcode**，快速拒绝或接受，再求交。课程经典内容，代码和讲义一致。

裁剪在 3D 里很抽象，写完后用 **只留一个三角形顶点在屏外** 测一次，比看公式直观得多。

## 二、视口变换

把 NDC \`[-1,1]\` 映射到像素矩形，参数为左上角 x、y 与宽高 w、h，并保留 z 供深度插值。课设里 z 存在顶点 \`Vector\` 的第三分量。

四视口作业在代码里预留了多块区域坐标；漫游版只完整使用了 **两个** 透视视口，其余正交对比 **未接上**。

## 三、背面剔除

\`drawTriangles\` 里对每个三角形算法向与视线点积，背向则跳过。

另有一处独立的 \`cullBackfaces\`，符号逻辑与内联版本 **相反**，属于重复实现。实际运行的是 \`drawTriangles\` 里的分支。

## 四、fillPolygon 扫描线填充

流程分三步。

1. 遍历多边形边，收集边界像素  
2. 按 y 求每条扫描线的 \`[xmin, xmax]\`  
3. 对区间内 \`setPixel\`  

**仅支持凸多边形**，注释里写明了。近裁剪后多边形可能变凹，极端情况会填错。

### 深度缓冲写了但没用在像素上

\`drawTriangles\` 传入 \`depthBuffer\`，却在每个三角形内 **又分配了一份局部缓冲**。\`fillPolygon\` 签名接收深度相关参数，但函数体里 **只有 \`setPixel\`，没有 depth test**。

\`calculateDepthAtPixel\` 用重心坐标插值深度： **定义了却未被填色循环调用**。

结果是 **远近三角形谁后画谁盖住**，与深度无关，出现 Z-fighting、模型透、漫游时闪烁。这是 **效果不理想的首要技术原因**。

正确做法应是维护 **全局 depthBuffer**，初始化为无穷大；每个片元若 \`z < depth[y][x]\` 再写 color 和 depth，且深度应在 **同一视口** 内共享，不能每个三角形重置。

\`\`\`cpp
if (z < depthBuffer[y][x]) {
    depthBuffer[y][x] = z;
    setPixel(x, y, color);
}
\`\`\`

## 五、Phong 光照

三项组成如下。

| 项 | 实现 |
|----|------|
| Ambient | \`objectColor × materialKa × lightColor\` |
| Diffuse | \`Kd × max n·L × lightColor × objectColor\` |
| Specular | \`Ks × pow max(V·R, Ns) × lightColor\` |

### 明显问题

1. **光源方向**，实现里用 \`lightPosition：viewDirection\` 当 \`L\`。\`viewDirection\` 应是 **从片元指向相机** 的向量，不是相机位置；应为 **片元到光源** 的方向。  

2. **镜面项**，\`V·R\` 同样未基于片元位置计算。  

3. **objectColor** 在绘制里硬编码灰色，**MTL 的 Kd、贴图解析了但未参与着色**。  

4. **法向** 用三角形整体叉积，**未做顶点法向插值**，大模型上光照很硬。  

5. **绘制循环里打印调试信息**，每三角形刷屏，拖慢且难调试。

## 六、材质与纹理，半成品

\`LoadMaterials\` 解析 \`Ka/Kd/Ks/Ns/map_Kd\` 等。\`Texture\` 能读贴图，但 \`fillPolygon\` **没有 UV 插值**，画面本质是 **单色 Phong 与错误的 L**。

## 七、OBJ 加载

加载器读网格后，\`drawScene\` 把索引展开成 **每三角形连续三顶点**，只有位置，无法线或 UV 进着色器。

模型应在 **初始化时加载一次**；放在每帧 \`drawScene\` 开头是多余开销。模型与材质路径若 **写死在本地固定路径**，换机器必挂：应改为相对路径或配置项。

## 八、周练与课设整合

| 周次主题 | 漫游版 |
|----------|--------|
| 画线 | 线框与作业遗留 |
| 裁剪 | ✅ 已接入 |
| 填充 | ✅ 但无有效 depth |
| Z-buffer 实验 | ❌ 未合并进大作业填色 |
| 四视口 | ⚠️ 只画了两块 |
| 光线追踪 | 独立作业，未嵌入本管线 |

周练里 Z-buffer 能跑通，整合进大作业时时间不够就没接好。答辩若问深度，如实说 **片元测试未写完** 比硬辩更好。

## 小结

裁剪与扫描线是课设里 **最贴近讲义、完成度最高** 的部分；**深度与光照** 是画面质量崩盘处。弄懂 \`fillPolygon\` 为何忽略深度缓冲，就弄懂了为什么漫游能跑但不好看。整体反思见 [课设复盘](/blog/cg-scene-roaming-lessons)。

标签：工程化
`;export{n as default};

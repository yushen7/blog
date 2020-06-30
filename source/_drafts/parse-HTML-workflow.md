---
title: 渲染进程解析HTML的过程
tags:
categories:
---

本文是阅读[Inside look at modern web browser(part 3)](https://developers.google.com/web/updates/2018/09/inside-browser-part3)的笔记，该文章是简述浏览器系列的第三部分，。

- 1. Renderer Process`的组成部分，包括了`Main thread`、`Worker threads`、`Raster threads`、`Compositor thread`。
- 2. 解析HTML
- 2.1 转换HTML为DOM，遇到残缺的标签，不会抛出错误，处理错误的相关文章：[An introduction to error handling and strange cases in the parser](https://html.spec.whatwg.org/multipage/parsing.html#an-introduction-to-error-handling-and-strange-cases-in-the-parser)
- 2.2 加载次级资源（CSS，Javascript，图片），这里会有一个`prelaod scanner`进行预加载，JS代码会阻塞DOM的构建，相关文章[overview of the parsing model](https://html.spec.whatwg.org/multipage/parsing.html#overview-of-the-parsing-model) ，[the V8 team has talks and blog posts on this](https://mathiasbynens.be/notes/shapes-ics)；开发者可以告诉浏览器延迟加载JS或者提前加载CSS，[Resource Prioritization – Getting the Browser to Help You](https://developers.google.com/web/fundamentals/performance/resource-prioritization)。
- 2.3 计算每个节点的样式(`computed style`)，获取每个节点的样式信息。
- 2.4 布局（Layout），利用`DOM tree`和`computed style`生成`Layout tree`，相关文章 [few talks from BlinkOn Conference](https://www.youtube.com/watch?v=Y5Xa4H2wtVA)。
- 2.5 绘制（Paint），利用`layout tree`生成`paint recordss`，`paint records`相当于记录元素的绘制顺序，也就是层级。
- 2.6 合成（Compositing），对每个已经栅格化的图层进行合成。这里有两个概念图层（layer）和栅格化（raster）：1. `layer`有`layer tree`，哪个元素属于哪个图层，由`layer tree`说明。关于图层的文章[Stick to Compositor-Only Properties and Manage Layer Count](https://developers.google.com/web/fundamentals/performance/rendering/stick-to-compositor-only-properties-and-manage-layer-count)，而图层分成一个个的瓦片（tile）；2.`raster threads`对`tile`进行栅格化，栅格化完成后，会生成`draw quads`用于描述tile的信息，这些`draw quads`会用于创建一个合成帧（compositor frame）。
- 2.7通过IPC， 合成帧被提交给浏览器进程，这时，其他线程：`UI thread`、其他`renderer thread`也会提交帧，这些帧汇总起来，发送给GPU，最终在屏幕上显示。
- 2.8 



# 参考文章

1. [Inside look at modern web browser(part 3)](https://developers.google.com/web/updates/2018/09/inside-browser-part3)
---
title: 事件循环（event loop）
tags: Javascript
categories: Javascript

---





首先看一下whatwg对于事件（event loop）循环的定义：

> To coordinate events, user interaction, scripts, rendering, networking, and so forth, user agents must use event loops as described in this section. Each [agent](https://tc39.es/ecma262/#sec-agents) has an associated event loop, which is unique to that agent.
>
> The [event loop](https://html.spec.whatwg.org/multipage/webappapis.html#concept-agent-event-loop) of a [similar-origin window agent](https://html.spec.whatwg.org/multipage/webappapis.html#similar-origin-window-agent) is known as a window event loop. The [event loop](https://html.spec.whatwg.org/multipage/webappapis.html#concept-agent-event-loop) of a [dedicated worker agent](https://html.spec.whatwg.org/multipage/webappapis.html#dedicated-worker-agent), [shared worker agent](https://html.spec.whatwg.org/multipage/webappapis.html#shared-worker-agent), or [service worker agent](https://html.spec.whatwg.org/multipage/webappapis.html#service-worker-agent) is known as a worker event loop. And the [event loop](https://html.spec.whatwg.org/multipage/webappapis.html#concept-agent-event-loop) of a [worklet agent](https://html.spec.whatwg.org/multipage/webappapis.html#worklet-agent) is known as a worklet event loop.



两个重要的概念：

* **任务队列**（task queues）

任务队列不是队列（queues），而是**任务**的集合（sets）。事件循环有多个任务队列。

任务队列通常包括：事件（Events）、HTML的解析（Parsing）、回调函数（Callbacks）、资源加载（Using a resources）、DOM操作的响应（Reacting to DOM manipulation）

**任务**通常由以下几部分组成：

1. 步骤（Steps）：任务需要执行的几个步骤。
2. 



* **为任务队列**（microtask queues）：


# 执行模型（Processing model）

事件循环的执行过程可以分为以下几步：


---
title: aboutES-spec
tags: 
  - Javascript
  - 规范
categories: 笔记
---
这篇笔记是关于初步理解ESMA-262规范的（可能也是最后一篇），受[v8团队的这篇理解ES规范系列的博客启发](https://v8.dev/blog/understanding-ecmascript-part-1)，记录一下对于ECMA-262的小部分理解，**参考将会占很大一部分比重**。

# ECMA-262

## Completion records

Completion record是一个`record`是，它由三部分组成，如下表所示：

> | Name         | Description                                                  |
> | ------------ | ------------------------------------------------------------ |
> | `[[Type]]`   | One of: `normal`, `break`, `continue`, `return`, or `throw`. All other types except `normal` are **abrupt completions**. |
> | `[[Value]]`  | The value that was produced when the completion occurred, for example, the return value of a function or the exception (if one is thrown). /                        spec:any ECMAScript language value or empty |
> | `[[Target]]` | Used for directed control transfers (not relevant for this blog post). |
>
> 引用自 https://v8.dev/blog/understanding-ecmascript-part-1

每个抽象操作（abstract operation）都会返回一个Completion record，除了`normal`类型，其他类型的Completion都是`abrupt completions`。即便抽象操作看起来返回了一个基本值如数值、字符串类型的，也会被隐式（implicitly）包装成一个Completion record，并将其`[[type]]`字段设置为`normal`，简称：`NormalCompletion`。

> 5.2.3.1 Implicit Completion Values
>
> The algorithms of this specification often implicitly return Completion Records whose [[Type]] is normal. Unless it is
> otherwise obvious from the context, an algorithm statement that returns a value that is not a Completion Record,

`ReturnIfAbrupt(argument) `经历以下步骤：

> 5.2.3.3 ReturnIfAbrupt
>
> 1. If argument is an abrupt completion, return argument.
> 2. Else if argument is a Completion Record, set argument to argument.[[Value]].

如果`argument`不是`NormalCompletion`，那么就返回`argument`，否则将`argument`赋值为`argument.[[value]]`。


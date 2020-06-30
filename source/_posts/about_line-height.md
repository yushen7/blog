---
title: CSS中的line-height
tags:
  - FE 
  - CSS
categories: 笔记
date: 2020-05-11 01:38:34
---


补一补CSS基础，从line-height开始。

# line-height到底指什么

line-height可以粗略认为是：

1. 由行内级元素组成内容的块状元素的最小的高度。
2. 行内元素（non-replaced inline elements）中用来计算line-box的高度的值。

line-box根据定义是：

> The rectangular area that contains the boxes that form a line is called a line box.

包含着组成一行的框（boxes）的矩形区域。

而这些框（boxes）则是行内级（inline-level elements）元素产生的，所以可以看成这个line-box里包含了许多的行内级元素，行内级元素即display属性为：

1. inline
2. inline-block
3. inline-table

的元素。

需要详细说明，挖个坑。



# line-height的值
<!-- more -->
5个值：normal | [number](https://www.w3.org/TR/CSS2/syndata.html#value-def-number) | [length](https://www.w3.org/TR/CSS2/syndata.html#value-def-length) | [percentage](https://www.w3.org/TR/CSS2/syndata.html#value-def-percentage) | [inherit](https://www.w3.org/TR/CSS2/cascade.html#value-def-inherit)

默认为：normal

和元素本身的`font-size`有关。（不一定）

normal：是个相对合适的值，由浏览器决定，通常为1.0 ~ 1.2

number：为缩放因子，是一个相对值，根据元素自身的`font-size`计算出值。

length：指定长度用来计算`line box`的高，如果指定的单位是`em`或`rem`，则有类似于相对值的效果。

percentage：为一个比例，用于与`font-size`计算得出`line-height`的值，是一个相对值。

## 例子

当`line-height`使用相对值的时候，有以下情况：

```html
<style>
    .box {
      vertical-align: text-top;
      display: inline-block;
      font-size: 16px; /*父类font-size*/
      width: 200px;
    }
    .number {
      border: 1px solid green;
      line-height: 1.1;
    }
    .length {
      border: 1px solid blue;
      line-height: 1.1em;
    }
    .percentage {
      border: 1px solid red;
      line-height: 110%;
    }
    .text {
      font-size: 30px; /* 文本段落自身的font-size*/
      margin: 0;
    }
</style>
<div>
    <!-- number -->
  <div class="box number">
    <p class="text number-text">long long text long long text long long text </p>
  </div>
	<!-- length:em -->
  <div class="box length">
    <p class="text length-text">long long text long long text long long text </p>
  </div>
	<!-- percentage -->
  <div class="box percentage">
    <p class="text percentage-text">long long text long long text long  </p>
  </div>
</div>
```

{% asset_img 1.png 继承line-height %}

图中可以看到`line-height`使用数字值的div，行间隔看起来是正常美观的，而其他两者的text则挤在了一起。

通过实验发现，p元素从父类（即`.box`）继承而来的`line-height`使用数字值会使用p元素自身的`font-size:30px;`得到`30px * 1.1=33px`。

而百分比和em则不会，p继承而来的`line-height`，使用了父类的`font-size`进行计算，得到`16px * 1.1 =17.6px `。

如果，该`line-height`不在父类上设置，直接在含有文本的元素上即p上设置，即：

``` html
<style>
    /*...other styles*/
    
    .number-text {
      line-height: 1.1;
    }
    .length-text {
      line-height: 1.1em;
    }
    .percentage-text {
      line-height: 110%;
    } 
</style>
```

{% asset_img non-inherit.png 不继承line-height %}

那么，结果便正常了，在p元素上*直接*设置的line-height，不继承，则`line-height`的计算会直接使用其自身的`font-size`进行计算。

`em`值的计算会根据父类`font-size`作为基准值进行，但在`line-height`的计算中不起作用（除了继承而来的），也许是一个特例。

百分比也是根据自身的`font-size`进行计算，而与父类毫无关系。



看了这么多，要明白**分清楚一个属性值的计算与哪些因素有关才是最重要的**，在`line-height`中就表现为：`line-height`的计算与`font-size`有决定性的关联。

# line-height与height的关系

1. 对一个不设置高度的空div设置line-height，这个空div的高度依然为0
2. 对一个不设置高度的有文本内容的div设置line-height，该div的高度随着line-height的变化而变化
3. 对于一个设置高度的div，不论是否有文本内容，其高度都不随着line-height的值变化而变化

综上，line-height属性与inline box同时存在，且block元素的height属性未设置时，line-height决定了block元素的高度；设置了line-height而inline box不存在或block元素的height已设置，block元素的高度不随着line-height变化而变化。



看起来有点绕，实际上却是符合line-height的定义的。





# 参考

1. [CSS规范](https://www.w3.org/TR/CSS2/visudet.html#propdef-line-height)


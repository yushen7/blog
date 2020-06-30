---
title: browser-cache
tags: Page Perfomance
---
# 浏览器缓存



在浏览器发起网络请求前，会先检查缓存的情况，命中缓存优先级如下：

1. Memory Cache
2. Disk Cache
3. Service Worker
4. Push Cache



# Memory Cache

Memory Cache会将一些JS、CSS、图片等资源存储在内存中，所以速度较快、容量较小，一个页面对应相应的Memory Cache，若页面关闭，则相应的Memory Cache也清除，具有一定的时效性。

Disk Cache，谷歌等浏览器也会将JS、CSS、图片等资源存到硬盘中，当页面关闭时，下次再打开对应页面，即可从Disk Cache中命中缓存资源，存储时间、场景相对于Memory Cache较长久。

但这两种Cache都会受到HTTP请求头对应**强缓存**功能字段的限制，如：设置`Cache-Control:max-age=0`，则会进行协商缓存，虽然本地有缓存，但也不再命中本地缓存。

# Service Worker Cache

@towrite

# Push Cache



# 强缓存

优先级：强缓存 > 协商缓存

浏览器通过`Expires和Cache-Control`字段，判断缓存是否过期、失效，若缓存有效，则不会向服务器发起网络请求，直接使用本地缓存（包括Memory Cache、Disk Cache等）。在chrome的Network中可以看到返回状态码200（from memory cache）。

优先级：`Cache-Control`>`Expires`

## Expires（HTTP1.0）

`expires`是一个绝对时间的时间戳，而是否命中，取决于本地时间是否超出expires规定的时间。

`expires=Tue, 20 Apr 2021 10:32:43 GMT`

浏览器会比较本地时间和`expires`规定的时间。

但由于本地时间容易被篡改、目标服务器与本机时间差距过大，则在HTTP1.1中规定了`cache-control`字段。

## Cache-Control（HTTP1.1）

优先级高于`expires`（在支持HTTP1.1协议的情况下，否则会被忽略）。

`Cache-Control`字面意思是：对于缓存的控制。其中有若干个指令。

`Cache-Control: private, max-age=0, no-cache`

在请求报文的`Header字段`中，有以下指令：

> | 指令                | 参数  |  说明                   |
> | ------------------- | -------------------------------- | -------------------------------- |
> | no-cache            | 无        |强制向源服务器再次验证|
> | no-store            | 无    |不缓存请求或响应的任何内容|
> | max-age = [ 秒]     | 必需            |响应的最大Age值（单位：秒）|
> | max-stale( = [ 秒]) | 可省略        |接收已过期的响应|
> | min-fresh = [ 秒]   | 必需 |期望在指定时间内的响应仍有效|
> | no-transform        | 无          |代理不可更改媒体类型|
> | only-if-cached      | 无                |从缓存获取资源|
> | cache-extension | - |新指令标记（token）|
>

`max-age`：规定了缓存有效的最长时间。若设置为0，相当于不取缓存。

在响应报文的`Header字段`中，有以下指令：

> | 指令             | 参数   | 说明                                           |
> | ---------------- | ------ | ---------------------------------------------- |
> | public           | 无     | 可向任意方提供响应的缓存                       |
> | private          | 可省略 | 仅向特定用户返回响应                           |
> | no-cache         | 可省略 | 缓存前必须先确认其有效性                       |
> | no-store         | 无     | 不缓存请求或响应的任何内容                     |
> | no-transform     | 无     | 代理不可更改媒体类型                           |
> | must-revalidate  | 无     | 可缓存但必须再向源服务器进行确认               |
> | proxy-revalidate | 无     | 要求中间缓存服务器对缓存的响应有效性再进行确认 |
> | max-age = [ 秒]  | 必需   | 响应的最大Age值                                |
> | s-maxage = [ 秒] | 必需   | 公共缓存服务器响应的最大Age值                  |
> | cache-extension  | -      | 新指令标记（token）                            |

在服务器和客户端之间一般有代理服务器进行请求转发，比如CDN充当了缓存服务器的作用。

`s-maxage=[秒]`：除了功能和`max-age`相同，区别在于只适用于缓存服务器向多位用户提供响应的情况且`s-maxage`的优先级高于`max-age`。

`public/private`：指可向任一方提供响应缓存，与`private`正好相反。

`no-cache`：字面意思是不缓存，实际上是不使用本地缓存，必须向目标服务器确定缓存资源的有效性，仍旧会使用有效的缓存，而缓存服务器不会缓存对应资源（进行协商缓存）。

`no-store`：表示请求和响应不使用任何形式的缓存。（@toupdate 待求证）

> `no-store`表示暗示请求（和对应的响应）或响应中包含机密信息。

# 协商缓存

无法从本地读取缓存后，将进行协商缓存。

协商缓存表示与服务器协商该缓存资源是否可用，即确定缓存有效性。

通过`Last-Modified`和`ETag`字段实现。

优先级：`ETag` > `Last-Modified`

## Last-Modified

`Last-Modified`表示最近一次修改的时间戳，形式如：

`Last-Modified: Fri, 27 Oct 2017 06:35:57 GMT`

它是一个时间戳，如果启用了协商缓存，将会附加在响应头部上。

此后客户端的每次请求都会带上`If-Modified-Since`，形如：

`If-Modified-Since: Fri, 27 Oct 2017 06:35:57 GMT`

该值与响应的`Last-Modified`值相同。

服务端收到请求后，比对`If-Modified-Since`和对应资源的最后修改时间。若使用缓存，则返回缓存，响应头不再带上`Last-Modified`；否则执行一次完整响应，带上新的`Last-Modified`。

### 缺点

1. 因为最小单位是秒，所以无法感知毫秒级的资源变动，当资源在毫秒级别进行了变动，`Last-Modified`仍未变动，错误返回了缓存。

2. 修改了资源的某些属性（对文件进行编辑），但内容未改变，服务器会将最后一次修改（编辑）的时间作为和`If-Modified-Since`比较的依据，这时候该返回缓存时，却引发了一次完整的响应。

`ETag`可解决`Last-Modified`的问题。

## ETag

服务器使用`ETag`将资源以唯一标识的形式表示，为每个资源都分配一个`ETag`。

所以，即便资源的URI没有改变，资源更新时，`ETag`也会更新。

**`ETag`的优先级高于`Last-Modified`。**

服务器在第一次响应可以添加`ETag`字段：

`ETag: W/"2a3b-1602480f459"`

下一次请求发出，则会添加上用于跟`ETag`比较的字段`If-Match/If-None-Match`：

`If-Match: W/"2a3b-1602480f459"`或

`If-None-Match: W/"2a3b-1602480f459"`

值是相同的。

### 缺点

`ETag`的开销较大。

# HTTP缓存决策指南

谷歌官方给出的缓存策略：

![img](F:\workspace\blog\source\_drafts\HTTPCacheStrategy.jpg)

对`cache-control`字段进行配置：

1. 首先判断响应是否可复用，若否，则转向2；否则转向3。
2. 设置为`no-store`。不需要再执行缓存策略。
3. 考虑是否需要每次都向服务器确认缓存有效性，若否，则转向5；否则转向4。
4. 设置为`no-cache`，继续第五步。
5. 考虑是否可以被代理服务器缓存，若否，则转向6；否则，转向7。
6. 设置为`private`。继续8.
7. 设置为`public`。继续8.
8. 考虑资源过期时间，缓存超时的临界值`max-age/s-maxage`。
9. 考虑进行协商缓存，添加`Last-Modified/ETag`字段。

## 测试



# 




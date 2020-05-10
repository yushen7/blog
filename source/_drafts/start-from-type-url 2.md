---
title: 在地址栏键入URL后发生了什么
tags:
---

# 在地址栏键入URL后发生了什么

URL的组成：protocol :// hostname[:port] / path / [;parameters][?query]#fragment

假设protocol为HTTP。

在地址栏键入URL回车后，会简单地经历以下几步：

1. 首先通过DNS解析请求URL为IP地址
2. 网络层TCP/IP协议将请求报文发送至目标服务器（通过一定的路由规则进行转发报文）
3. 目标服务器解析报文头部信息，返回响应
4. 客户端获取响应，布局、渲染页面

# DNS解析

进行DNS解析会先查找本地缓存解析记录，包括：浏览器DNS缓存、客户端DNS缓存。

如果没有，客户端一般设置有一个静态或自动获取的DNS服务器IP地址，将根据设置的IP地址，发送DNS解析报文到本地DNS服务器，进行递归或迭代查询。

# 建立TCP连接

应用层使用HTTP的协议建立在TCP/IP协议之上，所以浏览器在发送数据之前，需要与目标服务器建立TCP连接，即：进行三次握手。

![three-way_handshake](F:\workspace\blog\source\_drafts\tcp_shakehands.PNG)



第一次：客户端发送一个不包含HTTP数据的报文段，该报文段的标志位`SYN`被置位1，再将一个随机的`client_isn`序号放置于起始的`seq`字段中，这个报文段称为`SYN`报文段。（`SYN`标志为1说明要开始建立连接，`seq`相当于一个建立连接的凭据）

第二次：服务器接收到包含`SYN`报文段的IP数据报后，返回一个`SYNACK`报文段，包含`client_isn + 1`的`ack`，`SYN`标志位被置1，`server_isn`的`seq`等信息（`seq=server_isn`是服务器的凭据，`ack=client_isn+1`表明收到客户端的`SYN`报文段）。

第三次：客户端确认服务器的允许连接，并返回一个报文，将`SYN`标志位置0，`seq`设置为`client + 1`，`ack`设置为`server_isn + 1`。这次握手可以在报文负载中携带应用层数据，即HTTP请求。

在第三次握手之后，此后客户端与服务器的每次报文传输的`SYN`位被置0，可以携带数据。

为什么要三次握手？

# HTTP请求
请求报文由请求行（request line）、请求头（header）、请求体三个部分组成


# HTTP响应
目标服务器收到对应的请求报文，并且根据报文中的端口转发给相应端口的处理器（HTTP Server）。
HTTP Server收到该请求，根据请求头进行相应逻辑处理（Controller），或返回静态资源，或返回增删改查的结果（数据）等等，总之是返回响应数据。

在HTTP Server处理的过程中，可能会遇到错误故障，会返回5xx状态码，或请求的资源未找到，返回404状态码。

状态码含义包括：
1xx：指示信息--表示请求已接收，继续处理。
2xx：成功--表示请求已被成功接收、理解、接受。
3xx：重定向--要完成请求必须进行更进一步的操作。
4xx：客户端错误--请求有语法错误或请求无法实现。
5xx：服务器端错误--服务器未能实现合法的请求。


# 渲染页面
![webkit_parse](F:\workspace\blog\source\_drafts\webkitflow.PNG "webkit内核的浏览器解析过程")


浏览器接收到响应数据（HTML）后：

1. 解析HTML生成DOM Tree

2. 解析CSS生成CSSOM Tree（包括CSS style和外部CSS）
3. 两者合成生成Render Tree
4. 根据渲染树进行Layout（计算每个节点的大小、位置等信息）
5. 根据信息进行Painting
6. 呈现页面

// @todo parser

 

在解析HTML的过程中，有两个引擎在起作用：渲染引擎和JS引擎，若其中有CSS（`link`标签、`style`标签）、`scrip`标签，会阻塞解析，它们是同步执行的。但是图片的请求是异步的。

script可以设置为`defer`延迟请求，或设置为`async`异步，不阻塞渲染进程。

# 断开TCP连接











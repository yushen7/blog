---
title: promise
date: 2020-04-18 17:21:20
updated: 2020-05-14 16:00:31
tags: Javascript
categories: 笔记
---

> 这里是一个笨蛋学习实现Promise的记录。





# 为什么使用Promise？

换句话说，promise的好处：

1. 缓解回调地狱的问题，使得代码易于维护，提升开发效率，降低维护难度。

此处应有对比的例子：

```typescript
/* 如果使用回调，会像这样子，嵌套一层又一层的异步
 * 如果处理错误，可能要写if...else...
 */
asyncCall('hello', (err, data) => {
    if(err) {
        //do something here
    }
  asyncCall2('hello', (err, data) => {
    if(err) {
        //do something here
    }
    asyncCall3('hello', (err, data) => {
         if(err) {
            //do something here
        }
      asyncCall4('hello', cb)
    })
  })
})
```



# Promise如何使用？







# Promise的实现过程

## 第一步，捋清思路



## 第二步，实现它！



## 第三步，测试它！







# 参考

1. [5 Reasons Why You Should Be Using Promises](https://runnable.com/blog/5-reasons-why-you-should-be-using-promises) 
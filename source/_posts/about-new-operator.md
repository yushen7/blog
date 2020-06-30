---
title: 认识new操作符
tags:
  - Javascript
date: 2020-05-15 17:33:11
updated:
categories: 笔记
---



看了[冴羽的Javscript博客](https://github.com/mqyqingfeng/Blog)，同样模拟一下`new`的功能实现

# 对于new操作符的认识

首先，是使用`new`的两种方式：

```js
function Person(name) {this.name = name};
const person1 = new Person // person1.name === undefined 
const person2 = new Person('Siro'); // person2.name === 'Siro'
```

其次，简单看一下`new`的大致流程：
<!-- more -->
执行`Construct(constructor, argList)`，这里如果**没问题**的话，最终会执行`constructor.[Construct]（argumentsList,newTarget）`，所以直接看最终的抽象操作：

1. `argumentsList`为参数列表（类数组），`newTarget`最开始没有指定的话就是`constructor`。
2. 赋`callerContext`为`running execution context`（当前运行的执行上下文）。
3. 赋`kind`为`F.[[ConstructorKind]]`。`F`为`constructor`；`F.[[ConstructorKind]]`的可能取值为：`base`或`derived`。一般定义函数的时候，这个`ConstructorKind`都为`base`。
4. 如果`kind`为`base`，则
   1. 赋`thisArgument`为一个`[[Prototype]]`指向`Constructor.prototype`的**新对象**。
5. 赋`calleeContext` 为当前执行上下文栈的顶部执行上下文。这一步相当于创建了执行上下文环境等预置工作。
6. 把`thisArgument`绑定到当前的上下文环境中。
7. ...词法环境、函数作用域的构建...
8. 执行函数`constructor`，结束后，从执行上下文栈中移除`calleeContext`。判断`constructor`返回值是否为对象，如果返回值是对象，则利用这个对象作为返回值，否则使用`thisArgument`作为返回值。

简单说就是：

1. 函数调用 + `this`的生成。
2. 相比于函数调用，在函数返回值的时候也做了`this`的相应处理。
3. `this`是一个`[[Prototype]]`指向`Constructor.prorotype`的**新对象**。

# 模拟new的实现

```js
function myNew(fn, ...arguments) {
    if(typeof fn !== 'function') {
        throw Error('fn is not a function and can\'t not be a constructor.');
	}
    
    let thisArgument = Object.create(fn.prototype); 
    const result = fn.call(thisArgument, ...arguments);
    
    if(result && (typeof result === 'object' || typeof result === 'function')) {
       return result;
    }else {
       return thisArgument;
	}
}
```

在创建`thisArgument`创建对象的时候，有一个巨大的坑，如果用：

```js
let thisArgument = Object.create(null);  //空对象
thisArgument.__proto__ = fn.prototype;
```

这样做是无法关联`thisArgument`和`fn.prototype`的，由于空对象不具有原型，也不具有`constructor`，所以设置`__proto__`相当于单纯的设置属性，而不是在设置它的原型！

空对象只要用来存储数据就行了！


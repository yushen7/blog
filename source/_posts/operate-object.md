---
title: JS中的对象
tags:
  - Javascript
categories:
  - 笔记
date: 2020-05-15 13:27:17
updated:
---



此文为关于JS中对象的笔记。

ECMA-26对于对象的定义：

> In ECMAScript, the state and methods are carried by objects, while
> structure, behaviour, and state are all inherited.

高程（中文版）：“无序属性的集合，其属性可以包含基本值、对象或者函数。"

简而言之，在Ecmascript中：**对象是键值对（key-value）的集合**。

# 对象属性的特性(attribute)

对象的属性有两种：

1. 数据属性。
2. 访问器属性。通过getter和setter取值和赋值。

<!-- more -->

## 数据属性

特性：

1. [[Configurable]]：表示是否可用delete 删除属性，是否可以修改属性特性，或者改变属性的类型（修改为访问器属性）
2. [[Writable]]：表示能否修改属性的[[value]]。
3. [[Enumerable]]：表示是否能过通过for-in遍历属性。
4. [[Value]]：读写属性的位置。

1.2.3. 三个特性使用**常规方式**新建对象的属性时，默认为true。

```javascript
let testp = {
    t: 'p'
};
// or
let testp = new Object();
testp.t = 'p';


let descripter = Object.getOwnPropertyDescriptor(testp,'t');
console.log(descripter.writable); // true
console.log(descripter.configurable); // true
console.log(descripter.enumarable); // true
```

## 访问器属性

特性：

1. [[Configurable]]：表示是否可用delete 删除属性，是否可以修改属性特性，或者改变属性的类型（修改为访问器属性）。
2. [[Enumarable]]：表示能否通过for-in枚举。
3. [[Get]]：读取属性时调用的函数Hook。默认undefined
4. [[Set]]：写入属性时调用的函数Hook。默认undefined

1.2. 二个特性使用**常规方式**新建对象的属性时，默认为true。

```javascript
let o = {
   	get prop(){
    	return 'x';
	},
    set prop(val){
        this.prop = val;
    }
};
// or
let o = {
    prop: 'x'
}
Object.defineProperty(o, 'prop', {
    get(){
        return 'x';
    },
    set(val){
        this.prop = val;
    }
});

let descripter = Object.getOwnPropertyDescriptor(o,'prop');
console.log(descripter.configurable); // true
console.log(descripter.enumarable); // true
```



**Object.defineProperty(object, propertyKey, attribute)**可以定义访问器属性和数据属性的特性，使用defineProperty进行对属性的特性定义时，[[Configurable]]、[[Writable]]、[[Enumarable]]默认为false。

**Object.defineProperties(object, properties)**可同时定义多个属性的特性。







# 对象防篡改

## Object.preventExtensions(object) 阻止扩展

使用之后，无法在object上添加新属性。

如：

```javascript
let person = { name: 'jack' };
Object.preventExtensions(person);
person.nickname = 'jaja';
console.log(person.nickname); // undefined
console.log(person.nickname); // throws error in strict mode
Object.isExtensible(person); // false
```

## Object.seal(object) 密封

1. object已有属性的[[configurable]]特性被设置为false，所以已有属性无法被删除。

2. 无法在object上添加新属性。

```javascript
let person = { name: 'jack' };
Object.seal(person);
person.nickname = 'jaja';

console.log(person.nickname); // undefined

delete person.name
console.log(person.name); // jack

person.name = undefined;
console.log(person.name); // undefined 此时name属性存在，但value是undefined
person.hasOwnProperty('name'); // true

Object.isSealed(person); // true
Object.isExtensible(person); // false
```

## Object.freeze(object) 冻结

1. [[Writable]]被设置为false。无法删除、修改已有属性。如果定义 Set) 函数，访问器属性仍然是可写的。
2. 无法添加新属性。

```javascript
let person = { name: 'jack' };
Object.freeze(person);
person.nickname = 'jaja';

console.log(person.nickname); // undefined

delete person.name
console.log(person.name); // jack

person.name = undefined;
console.log('jack'); // jack


Object.isSealed(person); // true
Object.isExtensible(person); // false
Object.isFrozen(person); // true
```

# 创建对象

高程中对于对象的创建归纳了以下几种方式：

1. 工厂模式。
2. 构造函数模式。
3. 原型模式。
4. 构造函数模式结合原型模式。
5. 动态原型模式。
6. 寄生构造原型模式。
7. 稳妥构造原型模式。

以下根据高程中的描述，分别阐述这几种模式的优缺点以及区别，如无特别说明，例子都源于高程。

## 工厂模式

```js
function createPerson(name){
    var o = new Object();
    o.name = name;
    o.sayName = function() (
		alert(this.name);
    }
	return o;
       
}

var person1 = createPerson("Nicholas") ;
var person2 = createPerson("Greg") ;
```

**特点**：可以无限次调用`createPerson`这个函数，每次调用都会产生一个新对象`o`，该对象含有指定的属性和方法（由参数传入指定）。

**缺点**：无法知悉对象类型（自定义的一种类型，比如这里应该是`Person`之类的类型）。

简单来说，我们想要一个具有特定属性、方法的对象，就可以通过调用函数（该函数内部通过`new Object()`的方式显示创建一个对象）获得函数返回值，取得这个我们想要的对象；但是无法知悉该对象的类型。

## 构造函数模式

```js
function Person(name, age, job){
    this.name = name;
    this.age = age;
    this.job = job;
    this.sayName = function() {
        alert(this.name);
    }
}
var person1 = new Person("Nicholas") ;
var person2 = new Person("Greg") ;

//检测类型
alert(person1 instanceof Person); // true
alert(person2 instanceof Person); // true
alert(person1 instanceof Object); // true
alert(person2 instanceof Object); // true
//注意：instanceof 操作符仅仅适用于检测后者的prototype是否在前者的'原型链'上。


```

与工厂模式的区别：用于创建对象的函数内部没有1.显式声明对象；2.返回值。

**优点：**相比于工程模式能够检测类型，即用`instanceof`检测，或者说检测对象的原型链是否存在该函数。

**缺点：**和**工厂模式**有一样的缺点，每当创建对象时，会重复创建一个函数（方法）。但工厂模式无法解决该问题，而构造函数模式因为使用了`this`，实际上可以复用该方法。

复用：

```js
//定义一个共享的函数（可能是全局的）
function sayName(){ alert(this.name); }
function Person(name, age, job){
	///...other codes
    this.sayName = sayName
    }
}

```

但是又会引来其他问题：1. 函数暴露在全局 2. 如果有多个方法，那么需要在定义多个共享函数。所以实际上没有解决问题

## 原型模式

```js
function Person(){}
Person.prototype = {
    consturctor: Person,
    name: "Nicholas",
    age: 29, 
    job: "Software Engineer",
}
var person1 = new Person();
var person2 = new Person();

person1.name === person2.name // true 
person1.job === person2.name // true
```

**优点：**共享、复用了属性和方法。

**缺点：**无法创建多个不同属性、方法的对象实例，因为他们引用的结果都是`Person.prototype`（其实正常情况下也没有人会这样创建对象）。

## 构造函数模式结合原型模式

正确做法应该是：独立的属性使用构造函数模式；共享的属性使用原型模式

```js
function Person(name){
    this.name = name;

}
Person.prototype = {
    constructor: Person,
    sayName: function() {
        alert(this.name)
    }
}

var person1 = new Person("Nicholas") ;
var person2 = new Person("Greg") ;
person1.name === person2.name // false
person1.sayName === person2.sayName // true
```

**优点：**使实例之间需要独立的属性可以互不干扰；需要共享的属性（方法）可以通过原型链查找得到，使用同一份副本，节省内存空间。

**缺点：**方法写在构造函数外。

## 动态原型模式

```js
function Person(name){
    //属性
    this.name = name;
    //方法
    if(typeof this.sayName !== 'function') {
        //这里不能用对象字面量直接对prototype赋值，否则person1.sayName将为undefined
        Person.prototype.sayName = function() {
            alert(this.name)
        }   
        //Person.prototype = {
        //      constructor: Person,
        //      sayName: function() {
        //     		alert(this.name)
        //    }
        //}
    }
    
}
var person1 = new Person("Nicholas") ;
var person2 = new Person("Greg") ;
```

动态原型模式只是在构造函数模式和原型模式的基础上添加了一个条件判断，先判断方法是否为一个函数，如果是一个函数，则不进行初始化。

**优点：**方法和属性的复制都在构造函数里进行，具有更好的封装性。

## 寄生构造函数模式

```js
function Person(name) {
    var o = new Object();
    o.sayName = function() {
        alert(this.name);
    }
    return o;
}
var friend = new Person('Nicholas');
friend.sayName(); // Nicholas
```

和工厂模式一样。区别在于用了`new`操作符创建对象。

（和工厂模式一样那还有啥用）

但是肯定有其适用场景：

>假设我们想创建一个具有额外方法的特殊数组。由于不能直接修改Array 构造函数，因此可以使用这个模式。

```js
function SpecialArray() {
	var array = new Array();
	values.push.apply(values, arguments);
	values.toPipeString = function() {
		return this.join('|');
	};
    return values;
}
var colors = new SpecialArray("red", "blue", "green");
alert(colors.toPipedString()); // "red|blue|green"
```

当然了，这肯定是一个特殊场景下的产物，所以一般情况下不会使用。

而且把`new`去掉也能用，可能有人只是喜欢`new`调用，当做一个特殊数组来用。

**特点：**和工厂模式一样的特点，只是把`new Object`特化成一种特定的子类型，如：`new Array`，从而能使用这种子类型的方法和属性。

个人理解这种模式只是为了可读性。

## 稳妥构造函数模式

```js
function Person(name) {
    var o = new Object();
    
    o.sayName = function() {
        alert(name);
    }
    return o;
}
var person1 = Person();
```

**特点：**不能直接访问对象的属性，需要通过原始的方法访问（利用了闭包的特性）；没有公共属性；和构造函数之间没关系了。

由这种函数创造的对象成为稳妥对象（durable object）。

简单来讲，就是创建了一个只具有私有属性，只能通过特定方法访问该属性的对象。

**适用场景：**

>稳妥构造函数模式提供的这种安全性， 使得它非常适合在某些安全执行环境一一例如， ADsafe ( www.adsafe.org )和Caja ( http://code.google.com/p/google-caja/)提供的环境一一
>下使用。

# 写在最后

本文都是一些非常基础的知识，仅仅是对学了这么久的JS的Object类型总结而已，是一篇迟到的笔记。

# 参考

1. Javascript高级程序设计（第三版）中文
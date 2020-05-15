---
title: prototype
date: 2020-04-18 17:21:20
tags: Javascript
updated: 2020-05-14 16:00:31
---
本文是阅读你不知道的JS（上）-原型部分所做的笔记。

# 原型与原型链

ECMA-262对于原型的定义（prototype）：

> object that provides shared properties for other objects

1. 函数都有一个`prototype`属性。
2. 对象**一般**都有一个`[[prototype]]`属性，可以通过`[[prototype]]`访问另一个对象，从而把对象和对象串联起来。
3. 可通过new调用一个函数，使返回对象的`[[prototype]] `和此函数的`prototype`建立关联。
4. 访问一个对象的属性/方法时，若未在此对象上找到对应的属性/方法，将会沿着原型链一直往上查找，即通过`[[prototype]]`查找，直到查找到对应的属性/方法；反之最后会查找到`null`，返回`undefined`。

<!-- more -->

原型链之间的继承和传统面向类的继承不通，传统的类继承会进行复制，而原型链仅仅是**关联**，就像一个对象的行为委托在另一个对象上（圆形脸查找）。

# 创建对象关联

通过new关键字去调用一个函数fn，若无return语句或者return值不是一个对象或者函数，构造fn会返回一个新的对象，新对象的`[[prototype]]`将会指向`fn.prototype`；反之则正常`return`。：

```javascript
// 1. 无return语句或者return值非对象
let fn = funciton(){
    this.name = 'oo';
    return 1
};

let o1 = new fn();
o1.name === 'oo' // true
//大部分浏览器可通过__proto__访问到[[prototype]]
o1.__proto__ === fn.prototype // true

// 2. 有return语句，且return值为对象，将使用return的值返回
let fn = funciton(){
    this.name = 'oo';
    // return {} or funciont(){} or array or other's object child type
    return {}
};
let o1 = new fn();

o1.name // undefined
o1.__proto__ === Object.prototype // true
```

此外：

```js
let fn = function(){};
fn.prototype.constructor === fn.prototype; // true
```

函数原型的constructor默认指向函数本身，注意：这个`constructor`属性可随意改写。



一个由如下方法创建的对象，其`[[prototype]]`将会指向`Object.prototype`：

```javascript
let o1 = {};

o1.__proto__ === Object.prototype // true 

// or
let o1 = new Object();
o1.__proto__ === Object.prototype // true 

//or 
let o1 = Object();
o1.__proto__ === Object.prototype // true 
```

如果想创建一个无属性、方法的空对象，可以用：

```js
let o = Object.creat(null);
o.hasOwnProperty === undefined // true
```

这种空对象不受原型链干扰，适合存储数据。

# 属性屏蔽

当去读一个属性时，会先查找对象本身是否有这个属性，若无，则会通过`[[prototype]]`逐级向上依次查找，即原型链查找；反之，则取这个对象本身的属性。

看以下代码：

```js
let fn = function(){
    
};
fn.prototype.name = 'oo';


let o1 = new fn();
o1.__proto__ === fn.prototype; // true
o1.__proto__.__proto__ === Object.prototype // true

console.log(o1.name); // oo
o1.name = 'my oo';
console.log(o1.name);  // my oo
```

这种现象称为属性屏蔽。

## 属性赋值

为对象赋值其本身不具有而原型链上存在的属性，有三种情况。

1. 该属性可写，则会为对象创建一个新属性。
2. 该属性的[[Writable]]为false，赋值无效，不会为此对象创建一个新的属性。严格模式下还会报错。
3. 该属性是一个访问器属性中的[[setter]]，该[[setter]]一定会被调用，不会为此对象创建一个新的属性，也不会对该[[setter]]进行赋值。

如下：

```js
let fn = function(){
    
};
fn.prototype.name1 = 'o';
let o1 = new fn();

// 1. 第一种情况
o1.name1 = 'my o';
console.log(o1.name1); // o1.name1为屏蔽属性
o1.hasOwnProperty('name1') // true

// 2. 第二种情况
Object.defineProperty(fn.prototype, 'name2', {
    value: 'oo'
});
o1.name2 = 'my oo';
console.log(o1.name2); // oo

// 3. 第三种情况


```

# 应用原型链

原型链的思想看起来与类类似，通常使用`new`的形式代表实例化一个类：

```js
function Person(name){
    this.name = name;
}
function Student(){
    Person.call(this, name);
}
Student.prototype = Object.create(Person.prototype); // 将Person函数的prototype关联Student.prototype
//or

Object.setPrototypeOf(Student.prototype, Person.prototype ); //修改Student.prototype

Student.prototype instanceof Person // 可以检查obj的原型链是否存在fn.prototype

Person.prototype.isPrototypeOf(Student.prototype) // 可检查一个对象是否在另一个对象的原型链上
Object.getPrototypeOf(Student); // 获取一个对象的[[prototype]]


let student = new Student('jack');
```

类的继承实际上是**复制**，子类复制了父类的成员和方法。多态也不表示子类和父类有关系，然而JavaScript 并不会（像类那样）自动创建对象的副本。

然而，在你不知道的js上卷中，说了这种形式的危害（难以阅读和理解、难以维护），包括下列几种方式：

## 1.显式混入

### 1.1显式复制

```js
// 非常简单的mixin(..) 例子:
function mixin( sourceObj, targetObj ) {
    for (var key in sourceObj) {
    // 只会在不存在的情况下复制
    	if (!(key in targetObj)) {
    		targetObj[key] = sourceObj[key];
    	}
	}
	return targetObj;
}
var Vehicle = {
	engines: 1,
	ignition: function() {
		console.log( "Turning on my engine." );
	},
	drive: function() {
		this.ignition();
		console.log( "Steering and moving forward!" );
	}
};
var Car = mixin( Vehicle, {
	wheels: 4,
	drive: function() {
		Vehicle.drive.call( this ); //显式多态
		console.log(
		"Rolling on all " + this.wheels + " wheels!"
		);
	}
} );
```

在`mixin`函数中仅仅简单实现了属性的`复制`，如果属性是基本类型值，那么是真正的复制，如果是引用类型值，那么`复制`仅仅是改变了该属性的指向。

### 1.2寄生继承

```js
// “传统的JavaScript 类”Vehicle
function Vehicle() {
    this.engines = 1;
}
Vehicle.prototype.ignition = function() {
    console.log( "Turning on my engine." );
};
Vehicle.prototype.drive = function() {
    this.ignition();
    console.log( "Steering and moving forward!" );
};
// “寄生类” Car
function Car() {
    // 首先，car 是一个Vehicle
    var car = new Vehicle();
    // 接着我们对car 进行定制
    car.wheels = 4;
    // 保存到Vehicle::drive() 的特殊引用
    var vehDrive = car.drive;
    // 重写Vehicle::drive()
    car.drive = function() {
    	vehDrive.call( this ); //显式多态
    	console.log(
    		"Rolling on all " + this.wheels + " wheels!"
    	);
    return car;
}
var myCar = new Car();
myCar.drive();
```

在`Car`函数内部使用`new`关键字创建了一个新的对象指向`Vehicle.prototype`，之后返回了这个对象。

于是可以不用`new`调用`Car`。

## 2.隐式混入

```js
var Something = {
    cool: function() {
        this.greeting = "Hello World";
        this.count = this.count ? this.count + 1 : 1;
    }
};
Something.cool();
Something.greeting; // "Hello World"
Something.count; // 1

var Another = {
    cool: function() {
    // 隐式把Something 混入Another
    	Something.cool.call( this );
	}
};
Another.cool();
Another.greeting; // "Hello World"
Another.count; // 1 （count 不是共享状态）
```

对象和对象之间仅仅存在部分联系，在`Another`的`cool`方法中，调用了另一个对象的方法，可以看成是显式复制中的局部复制。

## 行为委托设计模式



**@towrite**





# 实现`__proto__`



# 参考

1. 你不知道的JavaScript（上）
2. 
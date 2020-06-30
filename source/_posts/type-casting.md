---
title: JS中的类型转换
tags: Javascript
date: 2020-04-30 16:27:17
updated: 2020-06-30 16:27:17
categories: 笔记
---



简单总结一下JS中的部分显/隐式强制类型转换。

# 1、类型

JS中6种基本类型：

> Undefined, Null, Boolean, Number, Symbol, or String

以及对象：

> member of the type Object

## Boolean的真假值
<!-- more -->
其他类型转换为`Boolean`类型时，一般遵从下面的表值映射：

> Undefined Return false.
> Null Return false.
> Boolean Return argument.
> Number If argument is +0, -0, or NaN, return false; otherwise return true.
> String If argument is the empty String (its length is zero), return false; otherwise return true.
> Symbol Return true.
> Object Return true

通过`!`操作符转换为`Boolean`类型。

`&&`、`||`操作符在表达式中会把值强制转换为`Boolean`类型。

但是`&&`、`||`操作符返回的不是布尔值。

# 2、转换为数字、字符串

## 0.Null/Boolean/Undefined/Symbol => 字符串/数字

以下列举了几种`Null/Boolean/Undefined/Symbol`类型转换为数字类型的情况：

- Null值：=>字符串`'null'`，=>数字`0`
- Boolean值：`true`和`false`，转换为字符串分别是：`'true'`，`'false'`；转换为数字分别是`1`，`0`
- undefined值：=>字符串`'undefined'`，=>数字`NaN`
- Symbol值无法被转换为字符串/数字

## 1.字符串=>数字

以下列举了几种字符串类型转换为数字类型的情况：

- `+`、`-`操作符 + 字符串，发生强制类型转换 
- 字符串 + 操作符 + 数字，发生强制类型转换
- 调用`Number`
- 调用`parseInt`
- 使用`==`操作符时

具体的转换情境如下：

```js
let num;
// 1. 使用'-'，'+'
num = -'str' // NaN
num = -'1234' //1234
num = '1234' - 1; // 1233
num = 'asd1234' - 1; // NaN
num = '1e10' // 10000000000
num = '1234.5' // 1234.5
num = '' // 0
// 2. 调用Number

num = new Number('1234').valueOf(); // 1234
num = new Number('1e10').valueOf(); // 10000000000
num = new Number('s1234').valueOf(); //NaN

// 3. 调用parseInt parseInt(s, ?radix)，radix为进制

num = parseInt('s1234'); // NaN
num = parseInt('1234.3s'); // 1234
num = parseInt(1 / 0, 19); // 18 1 / 0 === Infinity => ToString => 'Infinity' => 进制为19，0~i，i恰好为最后一位，所以结果为18
```

总的来说：

- `-`操作符和调用`Number`的方式差不多，字符串中出现0~9以外的值，例如字母等，不论位置，都会返回NaN的结果。
- `parseInt`第一个参数是字符串，如果不是，会先转换为字符串再进行求值。与1和2的方式不同，`parseInt`会解析字符串中非数字在数字后面的字符串，如'1234.3ssss'，返回1234。
  值得注意的是，空字符串会转换为数字0。

## 2.Object=>数字/字符串

`Object`转换为数字/字符串会进行`ToPrimitive`抽象操作，而且顺序一般是`valueOf`、`toString`，如果`valueOf`方法返回基本类型值，就使用该返回值，否则就调用`toString`：

```js
// 1.valueOf返回非基本类型值，toString返回1,
let o = {

}
+o // NaN
o + '' // [object Object]

o = {
	toString: function toString(){
		return 1
	}
}
+o // 1
o + '' // '1'

// 2.valueOf返回2
o = {
	valueOf: function valueOf(){
		return 2
	}
}
+o // 2
o + '' // '2' valueOf返回数字2，数字2再转换为字符串'2'

// 3.valueOf和toString
o = {
	valueOf: function valueOf(){
		return 2
	},
	toString: function toString(){
		return 1
	}
}
+o // 2
o + '' // '2'
```

## 3.ToPrimitive抽象操作

**占坑**







# 3、使用==时发生的类型转换

执行`x == y`：

1. `x` 与 `y`类型相同，则返回 `x===y`的结果。
2. 如果`x`与`y`任意一方为`undefined`，另一方为`null`则返回`true`。
3. 如果`x`与`y`有一方为字符串/布尔值，则为字符串/布尔值的一方执行ToNumber的抽象操作，转换为数字。
4. 如果`x`与`y`有一方为对象（包括数组、包装对象等子对象），则为对象一方执行ToPrimitive抽象操作。

以上参考自如下的ES10标准：

> The comparison x == y, where x and y are values, produces true or false. Such a comparison is performed as follows:
>
> 1. If Type(x) is the same as Type(y), then
>    a. Return the result of performing Strict Equality Comparison x === y.
> 2. If x is null and y is undefined, return true.
> 3. If x is undefined and y is null, return true.
> 4. If Type(x) is Number and Type(y) is String, return the result of the comparison x == ! ToNumber(y).
> 5. If Type(x) is String and Type(y) is Number, return the result of the comparison ! ToNumber(x) == y.
> 6. If Type(x) is Boolean, return the result of the comparison ! ToNumber(x) == y.
> 7. If Type(y) is Boolean, return the result of the comparison x == ! ToNumber(y).
> 8. If Type(x) is either String, Number, or Symbol and Type(y) is Object, return the result of the comparison x ==
>    ToPrimitive(y).
> 9. If Type(x) is Object and Type(y) is either String, Number, or Symbol, return the result of the comparison
>    ToPrimitive(x) == y.
> 10. Return false.
>     The comparison x === y, where x and y are values, produces true or false. Such a comparison is performed as follows:
> 11. If Type(x) is different from Type(y), return false.
> 12. If Type(x) is Number, then
>     a. If x is NaN, return false.
>     b. If y is NaN, return false.
>     c. If x is the same Number value as y, return true.
>     d. If x is +0 and y is -0, return true.
>     e. If x is -0 and y is +0, return true.
>     f. Return false.
> 13. Return SameValueNonNumber(x, y).
>     NOTE
>     This algorithm differs from the SameValue Algorithm in its treatment of signed zeroes and NaNs.

从规范中可以看出，如果检测到双方类型相等，则会进行全等比较；否则，在进行相等比较的过程中，会进行`abstract operation`，即：`ToNumber`和`ToPrimitive`转换类型进行比较，最终比较的是两边的数字。

`ToNumber`即转换为数字类型，上文说明了转换的情景。

对象进行`ToPrimitive`操作，一般会调用`valueOf`和`toString`方法。故可以通过改写`valueOf`和`toString`方法使`ToPrimitive`返回特定值。



# 参考

1. 你不知道的JS（中）
2. [ECMA-262](https://tc39.es/ecma262/ "ECMA-262 standard") 
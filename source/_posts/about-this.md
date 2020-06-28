---
title: about-this
tags:
  - Javascript
  - function
  - this
categories: Javascript
date: 2020-06-29 00:53:25
updated:
---


看了冴羽的文章[“JavaScript深入之从ECMAScript规范解读this”](https://github.com/mqyqingfeng/Blog/issues/7)，决定读一读`this`的规范定义，梳理一下this。

# this存在的场景

`this`存在的场景肯定是**函数执行**的时候，那么有以下几种调用函数的方式：

1. 直接调用：`foo()`，`foo`中`this`的值将会是`window`或`undeifined`，取决于是否是严格模式。
2. 作为对象的方法调用：`obj.foo()`，`this`的值将是`obj`。
3. 作为`new`操作符的一部分调用：`new foo()`。
4. 通过`apply`、`call`、`bind`调用：`this`的值将被绑定为指定值。

然而，有特殊情况的存在：

> ```js
> var value = 1;
> 
> var foo = {
>       value: 2,
>       bar: function () {
>         return this.value;
>       }
> }
> //示例1
> console.log(foo.bar()); // 2
> //示例2
> console.log((foo.bar)()); // 2
> //示例3
> console.log((foo.bar = foo.bar)()); // 1
> //示例4
> console.log((false || foo.bar)()); // 1
> //示例5
> console.log((foo.bar, foo.bar)()); // 1
> ```
>
> 例子来自 https://github.com/mqyqingfeng/Blog/issues/7

所以，有必要从规范解析`this`到底是如何被指定的。

# 函数被调用时的this

直接看规范12.3.4 Function Calls 的过程：

> 12.3.4.1 Runtime Semantics: Evaluation
>
> CallExpression : CallExpression Arguments
>
> ...
>
> 1. Let ref be the result of evaluating CallExpression.
>
> 2. Let func be ? GetValue(ref).
>
>    ...
>
> 5. Return ? EvaluateCall(func, ref, Arguments, tailCall).
>
> 12.3.4.2.EvaluateCall ( func, ref, arguments, tailPosition )
>
> 1. If Type(ref) is Reference, then
>    a. If IsPropertyReference(ref) is true, then
>    i. Let thisValue be GetThisValue(ref).
>    b. Else the base of ref is an Environment Record,
>    i. Let refEnv be GetBase(ref).
>    ii. Let thisValue be refEnv.WithBaseObject().
>
> 2. Else Type(ref) is not Reference,
>    a. Let thisValue be undefined.
>
>    ......

可以看到`EvaluateCall `根据`ref`确定了`this`的值。

总结一下：

1. 计算`CallExpression`的结果赋给`ref`
2. 若`Type(ref)`为`reference`则：
   1. 若`IsPropertyReference(ref)`为`true`，则：
      1. 令`this`为`GetThisValue(ref)`的值
   2. 否则令`ref`的`base`为`EnvironmentRecord`
      1. 令`this`为`GetBase(ref).WithBaseObject()`
3. 否则令`this`为`undefined`

所以，关键在于：

1. 如何根据`CallExpression`计算`ref`，`ref`的类型很重要，如果`ref`的类型不是`reference`，那么`this`直接为`undefined`。

 	2. 如果`ref`的类型是`reference`，那么需要知道`IsPropertyReference(ref)`、`GetThisValue(ref)`、`GetBase(ref)`分别干了什么才能确定`this`。

## CallExpression

第一步计算`CallExpression`赋给`ref`

> Let ref be the result of evaluating CallExpression.

在12.3 Left-Hand-Side Expressions中，MemberExpression包含了以下几种类型：

> * PrimaryExpression：原始表达式，如：1.1、undefined、变量foo
> * MemberExpression[ Expression]：属性访问表达式
> * MemberExpression . IdentifierName：属性访问表达式
> * MemberExpression TemplateLitera
> * SuperProperty：super属性表达式
> * MetaProperty
> * new MemberExpression Arguments：new表达式

比如foo.bar就是一个MemberExpression。

函数调用涉及到了CallExpression：

> * CoverCallExpressionAndAsyncArrowHead
> * SuperCall
> * CallExpression Arguments：函数调用表达式
> * CallExpression [ Expression ]：函数
> * CallExpression . IdentifierName：函数表达式的属性访问
>   CallExpression TemplateLiteral：略

比如`foo.bar()`中的`foo.bar`是CallExpression。[astexplorer](https://astexplorer.net/#/gist/8b16411cac74187db797974c633bc22f/dae9120a20ec57681cfd9d17dd4bae1a900361a5)将`foo`描述为标识符（identifier）。

为什么foo.bar是MemberExpression，又是CallExpression呢？

答案是：看整体`foo.bar()`，由两部分组成：CallExpression和Arguments，左边的foo.bar是CallExpression，右边的`()`是Arguments；而foo.bar这个CallExpression可以细分成MemberExpression . IdentifierName，foo是MemberExpression，bar是IdentifierName，中间`.`是属性访问符。

所以，当我们调用`foo.bar`，计算`CallExpression`赋给`ref`时，`ref`便为foo.bar这个`CallExpression`的计算结果。

## Type

第二步判断`ref`是否为`reference`。

`Type(ref)`用于获取`ref`的类型。

规范将ECMAScript的类型分为了：语言类型（language types）和规范类型（specification types）。

* 语言类型就是描述变量、供开发者直接操作、开发JS的，包括：`Undefined, Null, Boolean, String, Symbol, Number,
  `和` Object`。
* 规范类型用于在算法层面描述JS语言的结构以及语言类型的，开发者无法接触，包括：`Reference, List, Completion,
  Property Descriptor, Lexical Environment, Environment Record, `和`Data Block.`。这个`Reference`便和`this`有极大关联。

那么`Reference`类型是：

> A Reference is a resolved name or property binding.
>
> The Reference type is used to explain the behaviour of such operators as delete, typeof, the assignment operators,
> the super keyword and other language features. 
>
> For example, the left-hand operand of an assignment is expected to
> produce a reference.

翻译：**`Reference`是一个可解析的名称，如foo；或是属性绑定，这里的属性便是对象的属性，如foo.bar，`Reference`提供了描述这个名称或属性的信息。**`Reference`类型是用来解释`delete`、`typeof`、`assignment operators`、关键字`super`以及其他语言的行为的，举个栗子：赋值符号的左操作数便被视为产生了一个`Reference`。

`Reference`由三部分组成：`base value`、`referenced name`、`strict reference`。

其中这三部分的取值：

* `base value`可以是语言类型（`String`、`Object`等等）或`Environment Record`。
* `referenced name`可以是`String`或`Symbol`值。
* `strict reference`可以是`true`或`false`。

而`GetBase( V )`、`GetReferencedName ( V )`、`IsStrictReference( V )`便用来分别获取`reference`的`base value`、`referenced name`和`strict reference`。

举个`reference`的栗子：

```javascript
// 简单来讲，这个赋值操作会经历这个过程：...获得lref: GetReferencedName(foo) 获得rval:GetValue(1) => 对lref进行赋值PutValue(lref,rval)...
let foo = 1; 
//这时候有一个foo的reference，大概是以下的结构
fooReference(lref): {
    baseValue: EnvironmentRecord,			
    referencedname: 'foo',
    strictReference: false
}
GetBase(foo) // EnviromentRecord

GetReferencedName(foo) // 'foo'

IsStrictReference(foo) // false

IsPropertyReference(foo) // EnvironmentRecord => false
```

`IsPropertyReference( V )`用于根据`GetBase( V )`是否为对象或基本类型的对象（`Boolean, String, Symbol, or Number`简单来说就是对象）返回`true`或`false`，简述为如果base value是对象，则true，或者说如果这个reference是属性绑定如foo.bar，则是true。

`EnviromentRecord`可以粗略地理解为本地作用域的记录，记录了标识符的映射（@待勘误）：

> An Environment Record records the identifier bindings that are created within the scope of its associated Lexical
> Environment.

所以，`reference`除了用于描述那些可解析的名称，如变量、函数等等之外，还可能用于描述属性。如果是属性，那么`GetBase(ref)`有可能是一个对象，否则是EnviromentRecord。

## GetValue

**`GetValue( V )`用于根据`GetBase( V )`的值获取`V`的真正的值（V是一个reference）**，**它返回的始终是一个语言类型的值，而不是规范类型的值**，如：

```js
let foo = 1;
GetValue(foo) // GetBase(foo) => base = EnviromentRecord => base.GetBindingValue('foo', false) => 1
foo = {
    bar: function iamfunc(){}
}
GetValue(foo.bar) // GetBase(foo.bar) => base = foo => foo.[Get]('foo', foo) => function iamfunc(){}

```

计算过程如下：

> 1. ReturnIfAbrupt(V).
> 2. If Type(V) is not Reference, return V.
> 3. Let base be GetBase(V).
> 4. If IsUnresolvableReference(V) is true, throw a ReferenceError exception.
> 5. If IsPropertyReference(V) is true, then
>   a. If HasPrimitiveBase(V) is true, then
>   i. Assert: In this case, base will never be undefined or null.
>   ii. Set base to ! ToObject(base).
>   b. Return ? base.[[Get]]（GetReferencedName(V), GetThisValue(V)）.
> 6. Else base must be an Environment Record,
>   a. Return ? base.GetBindingValue(GetReferencedName(V), IsStrictReference(V)) (see 8.1.1).

## 确定this

回到代码中：

```js
var value = 1;

var foo = {
   value: 2,
   bar: function iamfunc() {
     return this.value;
   }
}
```

确定this的过程：

1. 计算`CallExpression`赋给`ref`
2. 若`Type(ref)`为`reference`则：

   - 2.1 若`IsPropertyReference(ref)`为`true`，则：

   - 2.2令`this`为`GetThisValue(ref)`的值

   - 2.3否则令`ref`的`base`为`EnvironmentRecord`

   - 2.4令`this`为`GetBase(ref).WithBaseObject()`
3. 否则令`this`为`undefined`

第二步`Type(ref)`则能判定为`reference`了，且`IsPropertyReference(ref)`为true，所以计算`GetThisValue(ref)`赋值给`this`。

GetThisValue的过程：

> 6.2.4.10 GetThisValue ( V )
>
> 1. Assert: IsPropertyReference(V) is true.
> 2. If IsSuperReference(V) is true, then
>     a. Return the value of the thisValue component of the reference V.
> 3. Return GetBase(V).

简单理解为如果不是Super调用，则返回`GetBase(ref)`。

### 示例1：foo.bar

```javascript
//示例1
console.log(foo.bar()); // 2
```

前面说到：foo.bar()的形式中，**`ref`是foo.bar这个CallExpression的计算结果**。

这里根据`.`属性访问符计算结果，所以查看property accessorsd的计算过程，直接看最后一步：

> MemberExpression : MemberExpression . IdentifierName  // foo.bar foo:MemberExpression bar:IdentifierName  
>
> Return a value of type Reference whose base value component is bv, whose referenced name component is
> propertyNameString, and whose strict reference flag is strict.

`.`运算符返回了一个reference，这个reference形如：

```javascript
foo.barReference: {
    baseValue: foo,
    referencedName: 'bar',
    strict: false
}
```

所以`Type(ref)`为true，继续执行下一步判断：

> 2.1 若`IsPropertyReference(ref)`为`true`

ref的baseValue为foo，是对象，所以这一步为true，继续下一步：

> 2.2 令`this`为`GetThisValue(ref)`的值

上面说了，`GetThisValue(ref)`在这里相当于`GetBase(ref)`，而ref的baseValue为foo，所以this为foo。

### 示例2：(foo.bar)

(foo.bar)是CallExpression，**`ref`是(foo.bar)这个CallExpression的计算结果**。

这里根据`()`和`.`运算符计算CallExpression，看12.2.10 The Grouping Operator的计算过程：

> ParenthesizedExpression : ( Expression ) 
>
> // (foo.bar) foo.bar: Expression: MemberExpression . IdentifierName
>
> 1. Return the result of evaluating Expression. This may be of type Reference.

也就是返回了foo.bar的计算结果，那么结果和示例1一样，this为foo。

### 示例3：(foo.bar = foo.bar)

 ```js
//示例3
console.log((foo.bar = foo.bar)()); // 1
 ```

(foo.bar = foo.bar)是CallExpression，**`ref`是(foo.bar = foo.bar)这个CallExpression的计算结果**。

根据`=`和`()`操作符计算CallExpression，所以这里只看`=`操作符返回的结果：

> 12.15.4 Runtime Semantics: Evaluation	
>
> AssignmentExpression : LeftHandSideExpression = AssignmentExpression
>
>    ....
>
> ​	i. Let rref be the result of evaluating AssignmentExpression.
>
> ​	ii. Let rval be ? GetValue(rref).
>
> e. Perform ? PutValue(lref, rval).
>
> f. Return rval.
>
> ....

最终返回了GetValue(rref)，我们不管它确切返回了什么值（结果应该是function iamfunc），**重点是GetValue(rref)返回了一个语言类型的值**，**不是reference**，那么第二步：

> 2.`Type(ref)`为`reference`，则：

肯定是false的，所以执行下一步：

> 否则令`this`为`undefined`

所以this为undefined（非严格模式下this是window）。

### 示例4：(false || foo.bar)

```js
//示例4
console.log((false || foo.bar)()); // 1
```

(false || foo.bar)是CallExpression，**`ref`是(false || foo.bar)这个CallExpression的计算结果**。

根据`||`和`()`操作符计算CallExpression，所以这里只看`||`操作符返回的结果：

> LogicalORExpression : LogicalORExpression || LogicalANDExpression
>
> 1. Let lref be the result of evaluating LogicalORExpression.
> 2. Let lval be ? GetValue(lref).
> 3. Let lbool be ToBoolean(lval).
> 4. If lbool is true, return lval.
> 5. Let rref be the result of evaluating LogicalANDExpression.
> 6. Return ? GetValue(rref).

最终返回了GetValue(rref)=>function iamfunc，是一个语言类型的值，所以Type(ref)为false，this是undefined。

### 示例5：(foo.bar, foo.bar)

```javascript
//示例5
console.log((foo.bar, foo.bar)()); // 1
```

(foo.bar, foo.bar)是CallExpression，**`ref`是(foo.bar, foo.bar)这个CallExpression的计算结果**。

根据`,`和`()`操作符计算CallExpression，所以这里只看`||`操作符返回的结果：

> Expression : Expression , AssignmentExpression
> 1. Let lref be the result of evaluating Expression.
> 2. Perform ? GetValue(lref).
> 3. Let rref be the result of evaluating AssignmentExpression.
> 4. Return ? GetValue(rref).

最终返回了GetValue(rref)=>function iamfunc，是一个语言类型的值，所以Type(ref)为false，this是undefined。

之前错误地以为(foo.bar, foo.bar)会返回foo.bar，其实不是，返回的是GetValue(rref of foo.bar)=>function iamfunc，只是返回了一个语言类型的值。

# 总结

至此，归纳一下确定this的值的重点。

在函数调用的地方，有CallExpression arguments的形式

首先计算CallExpression的值赋给ref，计算CallExpression就是确定CallExpression的返回值：

1. `.`操作符的返回值是reference
2. `,`、`||`、`=`等操作符会返回GetValue(v)，是语言类型值，非reference

返回值赋值给ref，如果ref非reference，那么this直接为undefined；如果是reference：

1. `IsPropertyReference`判定ref是否是属性绑定，若是，this则为`GetThisValue(ref)`，即`GetBase(ref)`，为ref的baseValue，如bar.foo中，ref的baseValue为foo。
 	2. 若不是属性绑定，ref就是一个可解析名称，那么this肯定就为`with object`和undefined其中一者。

画一张图做总结：

{% asset_img create-this-wrapup-workflow.jpg 确定this的流程图  %}

# 参考

1. [“JavaScript深入之从ECMAScript规范解读this”](https://github.com/mqyqingfeng/Blog/issues/7)
2. ECMA-262 edition 10th 


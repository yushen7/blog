---
title: about-the-Tree
tags: Algorithm
categories:
---

树是一种特殊的图。

# 树的遍历

一颗二叉树可以定义为如下形式：

```typescript
class TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
      this.val = (val===undefined ? 0 : val)
      this.left = (left===undefined ? null : left)
      this.right = (right===undefined ? null : right)
  }
}
```

树的遍历方式：深度优先（前序遍历、中序遍历、后序遍历）、广度优先（层序遍历），莫里斯遍历（线索二叉树）。

## 深度优先搜索（前、中、后序）

* 前序：1. 获得根节点的值 2. 遍历左子树（节点） 3.遍历右子树（节点）

* 中序：1.遍历左子树（节点）2. 获得根节点的值 3.遍历右子树（节点）
* 后序：1.遍历左子树（节点） 2.遍历右子树（节点） 3. 获得根节点的值

```typescript
//递归
let ret: number[] = [];
const preorder = (root: TreeNode | null): number[] => {
    if(!root) {
       return [];
    };
        //1.前序
	console.log(root.val);
    ret.push(root.val);
    preorder(root.left);
    preorder(root.right);
    
    //2.中序
//    preorder(root.left);
//    console.log(root.val);
//    ret.push(root.val);
//    preorder(root.right);
    
    //3.后序
//    preorder(root.left);
//    preorder(root.right);
//    console.log(root.val);
//    ret.push(root.val);
}

let ret: number = [];
//迭代 需要使用栈辅助进行
const preorder = (root: TreeNode | null): number[] => {
    if(!root) {
       return [];
    }
    let stk: TreeNode[] = [root]; // 先把root弄进去，使length > 0，启动循环
    //1.前序遍历
    while(stk.length > 0) {
		const node = stk.pop();
        ret.push(node.val); console.log(node.val);
        node.right && q.push(node.right);
        node.left && q.push(node.left);
    }
    
    //2.中序遍历
    let stk: TreeNode[] = [];
    let node: TreeNode | null = root;
    while(node || stk.length > 0) {
        //1. 先把node.left最左边的节点找到，沿途压栈node.left
         while(node) {
           stk.push(node);
           node = node.left;
        }   
		//2.这里取出来的是最后一个入栈的node.left，回溯栈中的node.left
     	node = stk.pop() as TreeNode;
        ret.push(node.val); console.log(node.val);
        node = node.right;
    }
    
    
    return ret;
    
    //3.后序遍历
}
```

* 递归

时间复杂度：O(n) 访问每个节点一次，n为节点个数

空间复杂度：O(h) 递归栈的深度为O(h)，h为树的高度

* 迭代

时间复杂度：O(n) 每个节点出入栈一次

空间复杂度： O(n) 辅助栈空间最坏情况下为O(n)



如果把遍历结果放在`ret`数组里，这三种方式的结果分别会像这样：

1. 前序：`[root, [left sub tree], [right sub tree]]`
2. 中序：`[[left sub tree], root, [right sub tree]]`
3. 后序：`[[left sub tree], [right sub tree]], root`

根据三种遍历的性质，可以由`前序/后序 + 中序` 遍历构造出原本的树。



对于N叉树而言，递归的方式的代码是类似的，只不过没有了左右之分。摘自[维基百科-树的遍历](https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search_of_binary_tree)：

> Go down one level to the recursive argument N. If N exists (is non-empty) execute the following three operations in a certain order:
> (L)                                                          | Recursively traverse N's left subtree.  
> (R)                                                          | Recursively traverse N's right subtree. 
> (N)                                                          | Process the current node N itself.      
> Return by going up one level and arriving at the parent node of N.                                       
> 
>In the examples (L) is mostly performed before (R). But (R) before (L) is also possible, see (RNL).



## 广度优先搜索（层序遍历）

* 层序：从上至下，从左往右逐个访问节点

```typescript
//迭代
const levelorder = (root: TreeNode | null): void => {
    if(!root) return;
    let q: TreeNode = [root];
	let ret: number = [];
    while(q.length > 0) {
    	const node = q.shift();
        
        ret.push(node.val); console.log(node.val);
        node.left && q.push(node.left);
        node.right && q.push(node.right);
    }
    return ret;
}
```

时间复杂度：O(n) 每个节点出入队一次

空间复杂度：O(n) 

广度优先使用队列和深度优先使用的栈还是稍微不一样的，队列先进先出，就像一层一层的扫描一样。



对于N叉树而言，迭代的方式的代码是类似的，只不过将左右子树换成了数组。



# 线索二叉树

# 二叉搜索树

定义：

* 左子树上所有节点的值小于根节点
* 右子树上所有节点的值大于根节点
* 没有重复值（其实可以有）

```typescript
//从一张无序表中创建
const createBST = (nums: number[]): TreeNode | null => {
	if(nums.length < 1) {
       return null;
    }
    const root = TreeNode(nums[0]);
    for(let i = 1; i < nums.length; i++) {
        let node = root;
        const newNode = TreeNode(nums[i]);
       	while(true){
       		if(nums[i] > node.val) {
               if(!node.right) {
                  node.right = newNode;
                  break;
               }else {
                  node = node.right;
               }
               
            }else if(nums[i] < node.val){
                if(!node.left) {
                   node.left = newNode;
                   break;
                }else {
                    node = node.left;
                }
            }else {
                console.log("duplicate value:" + nums[i]);
            }
        }
    }
}
```

查找、删除、增加、修改操作：

* 时间复杂度：O(logn)
* 空间复杂度：O(n)



# 红黑树

# 优先队列


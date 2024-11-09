---
title: 《Go语言精进之路》阅读笔记
description: 记录《Go语言精进之路》一些有意思的知识点
---

# 《Go语言精进之路》阅读笔记

## 第10条：使用iota实现枚举常量

- Go的**const**语法提供了“隐式重复前一个非空表达式”的机制

  - ```go
    const (
    	Apple, Banana = 11, 22
    	Strawberry, Grape
    	Pear, Watermelon
    )
    
    // 等价于
    
    const (
    	Apple, Banana = 11, 22
    	Strawberry, Grape = 11, 22
    	Pear, Watermelon = 11, 22
    )
    ```

- iota表示const声明块中每个常量所处位置在块中的偏移量

  - 配合**隐式重复非空表达式**机制，可以实现一些很神奇的效果

  - ```go
    const (
    	a = 1 << iota	// 1
    	b				// 2
    	c				// 4
    	d = iota		// 3
    	e = 1 << iota	// 16
    )
    
    // 可以效仿标准库中的代码，略过一些iota值
    // $GOROOT/src/syscall/net_js.go go 1.12.7
    const (
        _ = iota
        IPV6_V6ONLY
        SOMAXCONN
        SO_ERROR
    )
    ```

Go引入iota有以下好处：

1. iota使得维护枚举常量列表更容易
2. 更为灵活的形式为枚举常量赋初值


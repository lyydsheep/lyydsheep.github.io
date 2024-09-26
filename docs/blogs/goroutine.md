---
title: goroutine
publish: true
description: 记录一些有关goroutine的知识点
date: 2024-09-27
tag: Golang
sticky: 2
---

# goroutine

goroutine是Go语言中的轻量级线程的实现，由**Go运行时管理**，是Go程序中最小的并发执行单位。并且传统意义上的协程是不支持并发的，而**goroutine支持并发**，同时goroutine可以运行在一个或多个线程上

## 简述

### goroutine的运行机制

在Go程序中，`main`函数是程序的入口，当程序开始执行`main`函数时，就会创建一个**主goroutine**，这个主goroutine是**全局唯一的**并且代表着整个Go程序的生命周期

在代码中，可以使用`go`关键字轻松创建出一个goroutine

🌰：

```go
func sum(a, b int) {
    println(a+b)
}

func main() {
    go sum(1, 2)
}
```

在上述代码中，**`go`关键字+函数调用**表示创建一个goroutine并在这个goroutine中运行`sum`函数。但上述代码的运行结果并不会符合我们的预期，这是因为**goroutine的运行机制是：在主Goroutine结束之后，其他所有的goroutine都会直接退出**，上述代码中的主goroutine结束的比子goroutine更快，所以控制台会没有任何输出😂

### goroutine的特点

- 是一种轻量级“线程”，类似于协程
- **非抢占式（即不会被中断）多任务处理，有协程主动交出运行权力**
- 编译器/解释器/虚拟机层面的多任务（不懂🙃）
- 多个协程可以在一个或多个线程上运行

由于goroutine是非抢占式的，一个goroutine可能会在一下时机主动交出运行权力

- I/O，select
- channel
- 等待锁
- 函数调用
- runtime.Gosched()

### WaitGroup：多个goroutine并发执行

前文阐述了当主goroutine结束之后，其他的goroutine都会被强制结束。但是很多情况下，主goroutine需要在其他goroutine结束之后再结束，一种很简单的方法就是让主goroutine睡几秒

```go
time.Sleep(time.Second)
```

另一种更优雅的方法就是使用`sync.WaitGroup`结构体，实现多个goroutine的同步

`sync.WaitGroup`结构体有三个方法

- `Add(delta)`：向内部计数器中添加增量`delta`，其中`delta`可正可负
  - 一般在启动goroutine之前调用
- `Done()`：使内部计数器`-1`，相当于`Add(-1)`
  - 一般在goroutine即将结束时执行，可配合`defer`关键字共同使用
- `Wait()`：阻塞当前goroutine直至内部计数器减少至0

⚠️：调用`Wait()` 函数可能导致死锁，造成程序崩溃

## Go并发的实现原理

> DO NOT COMMUNICATE BY SHARING MEMORY; INSTEAD, SHARE MEMORY BY COMMUNICATING. 

在Go中有两种并发形式：传统共享内存的方式和CSP（`communicating sequential processes`）并发模型

### 共享内存


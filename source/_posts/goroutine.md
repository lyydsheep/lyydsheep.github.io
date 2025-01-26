---
title: goroutine、channel
publish: true
description: 记录一些有关goroutine的知识点
date: 2024-09-27
tags:
  - Golang
---

# goroutine

goroutine是Go语言中的轻量级线程的实现，由**Go运行时管理**，是Go程序中最小的并发执行单位。并且传统意义上的协程是不支持并发的，而**goroutine支持并发**，同时goroutine可以运行在一个或多个线程上

**goroutine大小为2kb，可以动态增大**

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

在多个线程共享内存以共享数据的模式下，通过**加锁**实现并发安全

在Go中有两种锁：**互斥锁（Mutex）**、**读写锁（RWMutex）**

两种锁的使用方式如下：

```go
// Mutex
	var mux sync.Mutex
	mux.Lock()
	// do something
	mux.Unlock()

// RWMutx
	var mux sync.RWMutex
	mux.RLock()
	// 允许多个读者
	mux.RUnlock()
	mux.Lock()
	// 只有一个写者
	mux.Unlock()
```

区别：只有一个goroutine能拿到**互斥锁**，其他goroutine则会被阻塞；允许有多个goroutine拿到**读锁**，而只有一个goroutine能拿到**写锁**

⚠️：如果将带有锁结构的变量赋值给其他变量，**锁的状态会被复制**

```go
func main() {
	var mux sync.Mutex
	var wg sync.WaitGroup
	defer mux.Unlock()
	mux.Lock()
	wg.Add(1)
	go func(mux sync.Mutex) {
		defer func() {
			mux.Unlock()
			wg.Done()
		}()
		mux.Lock() // deadlock
	}(mux)
	wg.Wait()
}
```



### channel

简单地说，channel就是**收发数据的通道**

声明一个channel要使用`make`函数进行**初始化**，否则声明出来的channel为`nil`

```go
var ch chan int
var ch [size]chan int

ch = make(chan int, size)
```

#### 常见的使用方法

🕐：

```go
ch <- 1 // 写入一个数据
v := <-ch // 读取一个数据
```

⚠️：如果channel没有缓冲区，那么写数据和读数据必定是成对出现的

```go
close(ch) // 关闭通道
```

当关闭通道之后，**不能再向通道中写数据，但是能从通道中读数据，如果通道中还有值则读出对应的值，否则读出零值**

这就导致一个问题：当我读出零值时，无法判断出这是因为**通道关闭还是写入的值确确实实就是零值**

🕑：故需要使用通道的**判定读法**：

```go
val, ok := <-ch
if ok {
    fmt.Printf("get val %d\n", val)
} else {
    fmt.Println("closed")
}
```

当管道关闭且读取完毕后，ok为`false`

🕒：有的时候某一个goroutine需要一直监听着管道中的数据，只要管道中有数据就立马读取出来，直至管道关闭

在Go中可以使用`fro range`做到持续监听管道中的数据

```go
func main() {
	ch := make(chan int)
	go func() {
		for v := range ch {
			fmt.Println(v)
		}
	}()
	time.Sleep(time.Second)
	ch <- 1
	time.Sleep(time.Second)
	ch <- 2
	close(ch)
	time.Sleep(time.Second)
}
```

### 双向channel和单向channel

channel可以根据其功能划分为**双向channel和单向channel**，其中双向channel既可以读又可以写，而单向channel要么只读，要么只写

可以通过**类型别名**的方式定义单向channel

🌰：

```go
type RChannel = <-chan int
type WChannel = chan<- int

func main() {
	ch := make(chan int)
	go func() {
		var w WChannel
		w = ch
		w <- 1
	}()
	go func() {
		var r RChannel
		r = ch
		fmt.Println(<-r)
	}()
	time.Sleep(time.Second)
}
```

### 有缓冲channel和无缓冲channel

无缓冲channel可以理解为是**同步模式**，即一个写，另一个立马读，如果没有读者，写者也会被阻塞

有缓冲channel则可以作为**异步模式**，在缓冲区未满的情况下，即使没有读者，写者也能向通道中写入数据

但当缓冲区满了后，写者想要继续写入数据则会被阻塞，退化成**同步模式**

### 总结

- 关闭一个未初始化的channel会产生panic
- channel只能关闭一次，对同一channel多次关闭会发生panic
- 向一个已经关闭的channel写入数据，会发生panic
- 从一个已经关闭的channel读取数据，会读出缓冲区中的值，当缓冲区没有数据（或没有缓冲区）时，则会读出对应类型的零值
- channel的读端和写端都可以由多个goroutine操作，当写端被一个goroutine关闭时，读端的多个goroutine都会收到管道关闭的消息
- channel是并发安全的

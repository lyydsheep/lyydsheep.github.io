---
publish: false
---



# sync、context

## Sync

### sync.WaitGroup

在Go语言中可以使用`sync.WaitGroup`实现并发任务的同步以及协程等待

`sync.WaitGroup`是一个结构体，内置了一个计数器，有三个方法

- Add(delta int)，计数器增加`delta`
- Done()，计数器`-1`
- Wait()，**阻塞当前协程的运行，直至计数器为0**

🌰：

```go
var wg sync.WaitGroup

func main() {
	wg.Add(10)
	for range 10 {
		go func() {
			defer wg.Done()
			fmt.Println("hello world")
		}()
	}
	wg.Wait()
	fmt.Println("end!")
}
```

⚠️：`sync.WaitGroup`对象的计数器不能为负数，当调用Done()方法后，必须确保计数器值大于等于零，否则会`panic`

### sync.Once

程序中有一些逻辑只需要执行一次，最典型的就是项目中的配置文件，通常的做法有两种，一是在项目启动时就将代码执行并将结果保存在内存中，二是需要使用时再执行相应的逻辑代码，而`sync.Once`就属于后者

`sync.Once`可以在代码的任意位置初始化和调用，并且线程安全。`sync.Once`最大的用处就是**延迟初始化（调用）并只初始化一次**，避免过早执行代码逻辑导致内存空间的浪费

🌰：

```go
var once sync.Once
var instance *Config
var i = 0

type Config struct{}

func Init() {
	once.Do(func() {
		instance = &Config{}
		fmt.Println(i)
		i++
	})
}

func main() {
	for range 10 {
		Init()
	}
}
```

由例子可知，被`once.Do()`包裹的函数只会执行一次，即使调用多次`Init()`函数

#### 与init()的区别

`init()`方法和`sync.Once`都可以用来进行一些初始化操作，**二者的区别主要在于被调用（初始化）的时机**

`init()`方法是在其所在的package被首次加载时执行的，可以确保在`main`函数之前执行，适用于程序启动时的初始化操作

`sync.Once`可以在代码的任意位置调用，适用于在**并发环境下确保某个逻辑只执行一次**

### sync.Map

Go内置的Map不是并发安全的，在多个goroutine操作情况下，会出现意想不到的结果。想要并发安全地使用Map结构，要么是进行加锁操作，要么就是使用`sync.Map`结构

`sync.Map`有如下常用方法

- `Load()`：写入一个键值对
- `Store()`：读取一个键值对
- `Range()`：遍历map，类似于JS中的`for each`
- `Delete()`：删除操作
- `LoadOrStore()`：读取或存储数据

🌰：

```go
func main() {
	var m sync.Map
	m.Store("name", "zhao")
	m.Store("hello", "world")

	v, ok := m.Load("hello")
	if ok {
		fmt.Println(v)
	}

	m.Range(func(key, value any) bool {
		fmt.Printf("key is %v	val is %v\n", key, value)
		return true
	})

	v, ok = m.LoadOrStore("name", "yun")
	if ok {
		fmt.Printf("name`s new val is %v\n", v)
	}

	m.Delete("name")
	v, ok = m.Load("name")
	if ok {
		fmt.Printf("name`s val is %v\n", v)
	}
}

```

## Context

用于并发控制

上下文的信息传递

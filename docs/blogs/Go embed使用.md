---
description: 记录go:embed的一些使用方法
tag: Go
---



# embed使用

## 背景

对于一个Go项目，我们一般将代码编译成出来的二进制可执行文件，这个文件非常适合复制和部署。但在实际使用中，除了代码，一些**配置文件或者静态文件**也需要一同打包至二进制文件中。

## 嵌入

嵌入的内容时只读的，也就是说，嵌入内容在编译期就定死并且是并发安全的

🌰：当前有一个txt文件，具体内容为`Hello World!`

### 嵌入为字符串

```go
//go:embed hello.txt
var s string

func TestEmbed(t *testing.T) {
	fmt.Println(s)
}
```

### 嵌入为字节切片

```go
//go:embed hello.txt
var s []byte

func TestEmbed(t *testing.T) {
	fmt.Println(s)
}
```

### 嵌入为文件系统

当需要一次性嵌入多个文件时，选择文件系统作为嵌入的类型有助于我们高效管理嵌入的多个文件

```go
//go:embed *.txt
// 匹配多个文件
var fs embed.FS

func TestEmbed(t *testing.T) {
	fb1, _ := fs.ReadFile("hello.txt")
	fb2, _ := fs.ReadFile("hello2.txt")
	fmt.Println(fb1)
	fmt.Println(fb2)
}
```

### 几种go:embed写法

```go
//go:embed hello.txt hello2.txt
var fs embed.FS


//go:embed hello.txt
//go:embed hello2.txt
var fs embed.FS

//go:embed p
var fs embed.FS // p是一个子目录

//go:embed *.txt
var fs embed.FS // 匹配模式
```




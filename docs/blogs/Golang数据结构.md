# Golang数据结构

## string

Go语言中，string可以看作是所有**8bit 字节**的集合，一个字节数组。

- 字符串可以为空串，但不能为nil
- 字符串的字面值是只读的，不可以被修改
  - 字符串是不能被修改的，但是变量可以重新赋值

在源码中也给出了string的结构：其中`str`是**指向字符串首地址的指针**、`len`表示**字符串的长度**

```go
type stringStruct struct {
    str unsafe.Pointer
    len int
}
```

🌰：

<img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410051022321.png" alt="image-20241005102225290" style="zoom:67%;" />

值得注意的是，**len表示字符串长度是以字节数计量的**，而非字符数。

举个🌰：字符串`hello`的字节数和字符数是5，长度也是5；而字符串`hello啊`的字节数是8、字符数是6，而长度同字节数一样是8

所以对包含非单字节编码的字符的字符串进行`len()`操作，可能会得到意想不到的结果

### string和[]byte的互相转换

string和[]byte的转化（一般）会发生一次内存拷贝，并申请一块新的切片内存空间

**[]byte转为string的大致过程：**

- 申请一块新的内存空间，并记录首地址`addr`和字节长度`len`
- 构建string对象，指针地址为`addr`，`len`字段赋值为`len`
- 将源字节切片中的数据拷贝到刚申请的内存空间中

![image-20241005103541446](https://raw.githubusercontent.com/lyydsheep/pic/main/202410051035476.png)

string转为[]byte的大致过程：

- 申请一块新的内存空间

- 将string指针所指向的内存区域拷贝`len`字节到刚申请的空间中

  ![image-20241005103722955](https://raw.githubusercontent.com/lyydsheep/pic/main/202410051037987.png)

⚠️：当**转化为的字符串被用于临时场景时**，string和[]byte之间的转换并**不会发生拷贝**

例如：

- 字符串比较：string(ss) == "hello"
- 字符串拼接："hello" + string(ss) + "world"
- 用于查找：k, v := map[string(ss)]

在上述场景中，[]byte转换的字符串只有临时作用，在后续程序中不会再次使用，所以并不会拷贝到内存，而是直接返回一个string，这个string的指针就指向字节切片的内存地址

## slice

在Go语言中，slice是基于数组封装出来的抽象数据结构。因此在解析slice之前，需要先认识认识golang中的数组。

Go语言中的数组是一种值类型，和C语言中的指针类型不同，所以在Go中对数组进行复制、传参都是进行**值复制**操作，就和`int`、`float64`这些基本数据类型类似

数组类型在golang中由**数组大小和数据类型**共同决定，验证例子如下：

```go
	arr := [3]int{1, 2, 3}
	fmt.Printf("arr`s type is %T", arr)
	//arr`s type is [3]int
```

正因为数组类型在初始时就被确定（大小和数据类型），所以在面对一些动态存储的场景时数组就有点力不从心了。

**slice**就是为了解决数组在长度上不可增长的问题，基于数组实现了**变长数组**的机制

### slice底层结构

slice底层结构如下：

```go
type slice struct {
    // 底层数组指针
    array unsafe.Pointer
    // slice的长度
    len int
    // 容量
    cap int
}
```

slice扩容两步骤：

1. 计算所需容量
   1. 如果**新切片的长度＞旧切片的容量的两倍**，那么新切片的容量等于长度
   2. 否则
      1. 如果**旧切片的容量＜256**，那么新切片的容量就是原容量的两倍
      2. 否则新切片的容量就是**1.25 * 原切片容量+3/4 * 256**
2. 内存对齐，确定最终容量
   1. 按照Go内存管理的级别确对齐内存，最终容量以此为准

### slice问题解密

- slice通过函数传递的是什么？

  - 传递的是底层slice结构体的拷贝

  - ```go
    func PrintSliceStruct(s *[]int) {
    	ss := (*reflect.SliceHeader)(unsafe.Pointer(s))
    	fmt.Printf("slice struct: %+v, slice is %v\n", ss, s)
    }
    
    func test(s []int) {
    	fmt.Printf("slice address in main is %p	", &s)
    	PrintSliceStruct(&s)
    }
    
    func main() {
    	s := make([]int, 5, 10)
    	fmt.Printf("slice address in main is %p	", &s)
    	PrintSliceStruct(&s)
    	test(s)
    	/*
    	slice address in main is 0xc000008048	slice struct: &{Data:824633788048 Len:5 Cap:10}, slice is &[0 0 0 0 0]
    	slice address in main is 0xc000008078	slice struct: &{Data:824633788048 Len:5 Cap:10}, slice is &[0 0 0 0 0]
    	 */
    }
    ```

- 在函数里面改变slice，外层会受到影响吗？

  - 只要修改的底层数组是同一个，那么就会受到影响

  - ```go
    func test1(s []int) {
    	s[0] = 7
    	fmt.Printf("test1 value %v\n", s)
    }
    
    func test2(s []int) {
    	s = append(s, 4)
    	fmt.Printf("test2 value %v\n", s)
    }
    
    func main() {
    	s := []int{1, 2, 3}
    	fmt.Printf("initial value of s: %v\n", s)
    	test1(s) // 底层数组相同，会受到影响
    	fmt.Printf("after test1, value of s: %v\n", s)
    	test2(s) // 底层数组发生变化，不受影响
    	fmt.Printf("after test2, value of s: %v\n", s)
    	/*
    	initial value of s: [1 2 3]
    	test1 value [7 2 3]
    	after test1, value of s: [7 2 3]
    	test2 value [7 2 3 4]
    	after test2, value of s: [7 2 3]
    	 */
    }
    ```

## map


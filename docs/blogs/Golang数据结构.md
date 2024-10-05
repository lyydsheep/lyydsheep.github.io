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
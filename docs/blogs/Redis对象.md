---
title: Redis对象
publish: true
description: 记录Redis对象知识点
tag: Redis
sticky: 2
---

# Redis对象

## String

String就是字符串，是Redis中的一个最基本数据对象，最大存储数据**512MB**

### Set操作

基本语法：**`set key value [expiration EX seconds | PX milliseconds] [NX|XX]`**

Set操作用于在Redis中设置一个K-V对，其中几个扩展参数作用分别如下：

- **EX seconds**：设置K-V对的过期时间为多少秒
- **PX milliseconds**：设置K-V对的过期时间为多少毫秒
- **NX**：只有当Key不存在时，命令才生效，相当于`setnx key value`
- **XX**：只有当Key存在时，命令才生效

⚠️：对一个已经存在Key进行set操作会**将原有值覆盖**，可能会导致**原有值丢失、擦除过期时间、丢失原有值类型**

### 三种编码方式

String对象底层采用三种不同的编码方式以高效应对各种场景

- **INT编码**：用于存储long范围内的**整数**
  - ⚠️：如果是浮点数，则不能使用INT编码。因为INT编码只能用于表示整数
- **EMBSTR编码**：如果字符串的大小小于阈值字节，则采用此方式
- **RAW编码**：如果字符串的大小大于阈值字节，则采用此方式

EMBSTR编码和RAW编码方式在底层实现中都是由redisObject和SDS两个结构组成，区别在于**这两个结构在物理内存上是否连续（为一整体）**

EMBSTR在内存中的表示：

![image-20241003100407308](https://raw.githubusercontent.com/lyydsheep/pic/main/202410031004350.png)

RAW在内存中的表示：

![image-20241003100440097](https://raw.githubusercontent.com/lyydsheep/pic/main/202410031004128.png)

#### 三种编码方式的转换关系

随着对Redis的操作，String对象的编码方式可能有如下变化：

INT --> RAW：当存储的内容不再是整数或大小超过long范围，则需要将INT编码转换为RAW编码

EMBSTR --> RAW：由于EMBSTR编码的String对象是**只读**的，所以对一个EMBSTR进行写操作时，就会将其编码方式改为RAW。这是因为修改数据就要重新分配存储空间，而EMBSTR中redisObject和SDS是连续的，不易分配空间。并且只要进行修改操作那么就能认为这个String是易变的、不稳定的，采用RAW编码方式能够减少频繁对EMBSTR内存分配的性能损耗

### SDS结构

不管是EMBSTR还是RAW，都有一个SDS结构，SDS结构是为了解决C语言中字符串的尴尬处境

- 计算字符串长度需要遍历，时间复杂度$$O(n)$$
- 对字符串追加内容需要扩容操作
- 二进制不安全
  - 二进制安全是指公平对待每一个字符，不特殊处理任何字符
  - C语言中字符串特殊处理`\0`为字符串结尾

SDS结构具体由一下字段组成：

```C
struct __attribute__ ((__packed__)) sdshdr8 {
    uint8_t len;
    uint8_t alloc;
    unsigned char flags;
    char buf[];
}
```

- **len**：表示字符串长度，**可以快速返回字符串长度，并且不需要`\0`作为结尾符号**
- **alloc**：表示分配了多少内存空间，**具有一定的预留空间，无需进行扩容操作**
- **flags**：用于区分具体是什么类型的SDS
  - 在Redis中SDS分为sdshdr8、sdshdr16、sdshdr32、sdshdr64
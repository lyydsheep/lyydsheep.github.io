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

## List

3.2版本之前，List对象有两种编码方式

- ZIPLIST
- LINKLIST

当满足以下条件时，采用ZIPLIST编码方式

- 列表对象中所有存储的字符串对象长度都小于64字节
- 列表对象中存储的对象数量不超过512个（这是LIST的限制，而不是ZIPLIST的限制）

🌰：

![image-20241005112548274](https://raw.githubusercontent.com/lyydsheep/pic/main/202410051125337.png)

ZIPLIST中数据都是紧密排列的，在数据量小的时候可以有效节约内存；而LINKLIST顾名思义，数据是以链表形式串联起来的，在数据量大的时候采用LINKLIST编码可以加快处理性能

🌰：

![image-20241005112658713](https://raw.githubusercontent.com/lyydsheep/pic/main/202410051126746.png)

### QUICKLIST

ZIPLIST在数据较少时节约内存，LINKLIST是为了在数据较多时提高更新效率。但是ZIPLIST在数据稍多时插入数据会导致大量数据复制，占用内存空间；同样地，LINKLIST由于节点数量也异常多，也会占用不少内存

基于上述问题，3.2版本就引入了QUICKLIST。QUICKLIST本质就是**ZIPLIST和LINKLIST的结合体**

QUICKLIST的实现思路是，将原本LINKLIST的**单个节点存储单个数据**的模式，更换成一个**单个节点（ZIPLIST）存储多个数据**的形式

![image-20241005113525108](https://raw.githubusercontent.com/lyydsheep/pic/main/202410051135173.png)

当数据较少时，QUICKLIST节点只有一个，退化成ZIPLIST

当数据较多时，则同时利用了ZIPLIST和LINKLIST的优势

## 压缩列表

压缩列表作为List的底层数据结构，提供了紧凑型的数据存储方式，能节约内存，小数据量的时候遍历访问性能好（连续+局部性优势）

### ZIPLIST整体结构

在Redis代码注释中，有对ZIPLIST清晰地描述：

```c
/* The general layout of the ziplist is as follows:

<zlbytes> <zltail> <zllen> <entry> <entry> <entry> ... <entry> <zlend>
*/
```

🌰：一个具有三个节点的ZIPLIST

![image-20241008161508590](https://raw.githubusercontent.com/lyydsheep/pic/main/202410081615659.png)

**zlbytes**字段表示该ZIPLIST一共占用了多少字节（包含zlbytes字段的大小）

**zltail**字段表示最后一个**数据节点（entry）**距离ZIPLIST首部的偏移字节数，如果ZIPLIST为空（即木有entry），则指示**zlend**字段的偏移量

> 很显然，会有如下等式：
>
> zlbytes = zltial + 最后一个entry大小（可能为零） + zlend大小

**zllen**字段表示ZIPLIST结构中entry的个数，但由于该字段只占用2字节空间，所以最多只能表示65535个。当元素个数过多，只能通过**遍历**的方式获取元素个数

**zlend**字段是一个特殊节点，标识ZIPLIST结构的结束

**entry**字段表示一个数据节点，实际上也是一个结构体类型。该类型由三个字段构成，分别是

```c
<prevlen> <encoding> <entry-data>
```

### entry结构

**`<prevlen>`**字段表示**上一个数据节点（entry）的长度**，如果长度**小于254**，那么**`<prevlen>`**字段占用1字节空间；如果长度**大于等于254**，那么该字段需要用5字节空间表示，并且**第一个字节为11111110**，表示这是一个5字节的<prevlen>信息，剩下的4字节用来表示长度

⚠️：为什么阈值是254而不是255？这是因为255被用来特殊表示**zlend**字段，标识ZIPLIST结构的结束

**`<encoding>`**字段是一个整形数据，其二进制编码由**内容类型**和**内容数据的字节长度**两部分组成

### 连锁更新

当向一个entry前面插入一个长度超过254的节点时，`prevlen`字段可能就会由1字节变成5字节，导致本entry长度增大。如果运气不是很好，将会导致下一个节点中的`prevlen`字段增加，以此类推，造成连锁反应，这就是连锁更新问题。

![image-20241008185552935](https://raw.githubusercontent.com/lyydsheep/pic/main/202410081855045.png)

#### LISTPACK优化

`prevlen`字段正是连锁更新的罪魁祸首，为了解决连锁更新问题，就不能再去记录上一个节点的长度，但又要保证能够实现倒序遍历（找到上一个节点的位置）

Redis使用了一种巧妙的方法：删除`prevlen`字段，**新增`element-tot-len`字段记录整个节点除它（element-tot-len字段）自身之外的长度**

此时节点结构就变成了：

```c
<encoding-type> <element-data> <element-top-len>
```

- encoding-type是编码类型
- element-data是数据内容
- element-top-len所占的每个字节的第一个bit位用于标识是否结束，0则结束，1则继续

🌰：![image-20241008190334625](https://raw.githubusercontent.com/lyydsheep/pic/main/202410081903663.png)

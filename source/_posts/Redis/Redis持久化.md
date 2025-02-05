---
title: Redis持久化
publish: true
description: 记录Redis持久化知识点
date: 2024-06-19
---



# Redis持久化

> 持久化是什么？

Redis中的数据是存储在内存上的，倘若发生系统奔溃或程序重启，Redis中的数据就会丢失。如果业务场景希望即使出现异常情况，Redis中的数据也不会丢失，就需要将Redis中的数据**持久化**保存到存储设备上。

## Redis持久化方式

Redis提供了两种持久化方式：

1. RDB（Redis Database Backup）是一种保存数据快照的持久化策略。当开启RDB策略后，Redis每个一段时间就会将全局数据以**二进制**数据的形式保存在磁盘，后续通过加载RDB文件恢复数据。

   <img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410251409010.png" alt="image-20241025140840529" style="zoom:80%;" />

2. AOF（Append Only File）以记录日志确保数据持久化。当开启AOF策略后，Redis会将每一条**数据更新操作**记录到日志，后续通过重放日志恢复数据

   <img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410251412091.png" alt="image-20241025140840529" style="zoom:80%;" />

从两种策略的定义中很容易能看出来两种方案有一下不同点：

- 体积：在同等数据量的情况下，RDB比AOF体积更小，因为RDB保存的是**二进制紧凑数据**
- 恢复速度：RDB是快照数据，直接加载即可恢复数据，而AOF文件恢复需要重放日志，开销更大
- 数据完整性：RDB是间隔一段时间就记录一次，相比之下，AOF文件记录每一条操作，保存的数据更加完整

### RDB还是AOF？

> 在Redis中，RDB是默认开启的，而AOF是默认关闭的。

使用RDB还是AOF持久化策略需要依据具体场景判断：

如果对数据完整性要求较高，则需要将**RDB、AOF**同时开启。此时，进行数据恢复只会采用AOF文件，因为既然开启了AOF策略那么就说明需要数据完整性更强的AOF文件，而不是可能缺少一些数据的RDB文件

<img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410251432209.png" alt="image-20241025143254030" style="zoom:80%;" />

如果能够忍受几分钟的数据丢失，就可以**只开启RDB策略**。但不建议单独开启AOF策略，具体原因可参考官方的解释：

<img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410251435012.png" alt="image-20241025143518646" style="zoom:80%;" />

## RDB详解

RDB属于数据快照持久化策略，是一种最常见、最稳定的数据持久化方案。那么如何在Redis中开启RDB持久化策略？

由于Redis默认支持RDB持久化，因此我们可以在配置文件中看到如下内容

<img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410251940149.png" alt="image-20241025194036067" style="zoom:80%;" />

其中`save interval changes`就代表着当一定时间间隔进行了多少次数据修改就触发RDB持久化，将数据保存到磁盘上

当然，除了上述被动触发RDB持久化，Redis还提供了两条命令来支持主动持久化功能

- save：Redis主线程将全局数据生成二进制文件。如果内存中的数据量庞大，那么该命令可能会导致主线程阻塞，降低系统的执行效率
- bgsave：Redis主线程fork一个子进程，子进程执行持久化数据的操作生成一个新的rdb文件并将旧的rdb文件替换，避免了主线程阻塞
  - 上述被动触发RDB持久化本质上就是调用了`bgsave`命令

除此之外，Redis在程序关闭时会自动触发`save`命令，阻塞主线程进行数据持久化，以记录更加完全的数据。

### 写时复制

调用`bgsave`命令后，执行RDB持久化过程中，Redis依然可以继续处理其他命令，这都得益于**写时复制**技术

Redis主线程fork子进程时，为了节省内存空间，子进程仅仅复制父进程的页表，两个进程的页表指向同一块物理内存。

<img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410252022075.png" alt="image-20241025202223000" style="zoom:80%;" />

接着，子进程依据物理内存上的数据生成新的rdb文件。因为RDB是快照持久化策略，子进程只会保存调用`bgsave`命令那一刻的数据，所以即使生成rdb文件的过程中主进程发生了写操作，也不能影响子进程的数据。为了满足这一要求，**主进程会复制一份对应的物理内存，然后在上面进行写操作，从而不影响子进程的数据**，这就是写时复制机制。

<img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410252022156.png" alt="image-20241025202241119" style="zoom:80%;" />

## AOF详解

AOF持久化策略在Redis中是默认关闭的，需要手动开启，开启之后，Redis会将每一条更新操作记录在AOF文件。当重启时，Redis就可以通过AOF文件将所有的请求重放，恢复数据，但速度很慢。

### AOF写入流程

AOF文件写入流程大致分为三步：

1. 将数据写入AOF缓存，实质是一个sds数据
2. 将AOF缓存刷入磁盘缓冲区（page cache）中
3. 刷盘

![image-20241028212538059](https://raw.githubusercontent.com/lyydsheep/pic/main/202410282126394.png)

### AOF重写

随着用户的请求逐渐积累，AOF文件会逐渐膨胀，但是AOF文件中有效记录是少量的。这是因为，对一个key修改成千上万次，只有最后一次修改是有效的，需要真正保存在AOF文件中，而之前的修改都是无效的。所以，完全可以将AOF文件中的无效记录删除，避免AOF文件过于庞大。

AOF重写过程可以概括为**一次拷贝，两处缓冲**

- 一次拷贝：重写发生时，主进程会fork出一个子进程，子进程和主进程共享Redis物理内存，让**子进程将这些内存写入重写日志**
- 两处缓冲：在重写过程中，如果有新的写入请求，会由主进程分别写入AOF缓冲和AOF重写缓冲。AOF缓冲用于保证即使此时发生宕机，原来的AOF日志也是完整的，可用于恢复。AOF重写缓冲用于保证新的AOF文件不会丢失最新的写入操作

<img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410282135209.png" alt="image-20241028213530151" style="zoom:80%;" />

### AOF混合持久化

AOF混合持久化是指，在AOF重写阶段，Redis将现阶段的数据状态保存为RDB状态的二进制数据，并写入AOF文件，然后再将AOF重写缓冲区中的日志数据写入到AOF文件，最后把新生成的AOF文件替换掉旧的AOF文件。

此时的AOF文件既包含二进制数据，又包含日志数据，所以叫做混合持久化。

AOF混合持久化通过降低AOF文件的可读性，用二进制数据记录数据状态，减少了AOF文件的体积大小。
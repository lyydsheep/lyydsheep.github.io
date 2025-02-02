---
published: "true"
date: 2025-02-02
title: Go pprof 性能排查调优
---
## pprof 概述
引入 pprof：`import _ net/http/pprof`
执行对应的 `init`函数，注册`handler`到 `http Server`，这样就可以通过接口获取采样报告

保持程序运行，使用浏览器访问`http://localhost:xxxx/debug/pprof`，就能看到如下页面
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250202111858.png)
pprof 会采集程序运行数据，挑几个本次学习会使用的讲讲：
- `allocs`：内存分配信息
- `blocks`：阻塞操作信息
- `goroutine`：当前所有协程的堆栈信息
- `heap`：堆上内存使用情况
- `mutex`：锁竞争信息
- `profile`：CPU 占用信息（点击下载文件）

## 排查
### CPU 占用过高排查
使用 Activity Monitor 或者是 top 命令查看主机上所有程序 CPU 占用情况
```
pgrep -f pprof-demp // 查看程序的 PID
top -pid 2304 //查看CPU 占用情况
```

![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250202113814.png)

pprof-demo 程序CPU 占用相当高，显然是不正常的。回顾 pprof 采集的程序数据，profile 数据恰好是用来反应程序 CPU占用信息的，所以可以先使用`go tool pprof http://localhost:xxxx/debug/pprof/profile`命令进入交互式终端进行排查。

输入`top`命令，即可看到 CPU 占用较高的函数调用情况。发现`Eat()`方法占用了较多的CPU
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250202143500.png)
这里解释一下top 命令下，各个字段的含义：
- `flat`：当前函数占用 CPU 耗时
- `flat%`：当前函数占用 CPU 耗时百分比
- `sum%`：函数占用 CPU 时间累计占比，从小到大累积到 100%
- `cum`：当前函数加上调用当前函数的函数占用 CPU 的总耗时
- `cum%`：当前函数加上调用当前函数的函数占用 CPU 的总耗时占比
接着再交互式终端输入`list Eat`就可以查看问题代码的具体位置：
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250202145243.png)
发现 24 行有一个空循环，占用了较多的 CPU 时间，接着针对问题解决即可。
以上就是通过命令行排查 CPU 占用过高的情况，当然也可以使用`graphviz`图形化的方式进行排查，在此不多赘述。

### 内存占用过多排查
使用`top -pid 4926 -o mem`查看进程内存占用情况：
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250202150937.png)
发现 Go 程序居然占用了近 4G 的内存。相似地，输入`go tool pprof http://localhost:6060/debug/pprof/profile/heap`进入交互式终端，利用`top`和`list`命令定位高内存代码段
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250202152754.png)

### 频繁 GC 排查
通过 Activity Monitor 观测到程序占用内存在短时间内有巨大变化，例如此刻是 6G，过了不久就变成了 4G；或者是通过`GODEBUG=gctrace=1 ./pprof-demo | grep gc`命令输出 GC 日志，发现应用程序频繁的 GC，说明应用程序存在**频繁 GC 的问题**
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250202195149.png)

接下来就使用 pprof 工具排查到底是哪一部分代码不断内存申请。需要注意的是，内存的申请和释放需要一定时间来进行统计，所以需要在程序运行一段时间后再执行命令`go tool pprof http://localhost:xxxx/debug/pprof/allocs`。同样在交互式命令行中使用`top`、`list`或`web`命令来查看具体情况
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250202201111.png)

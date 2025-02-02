---
published: "true"
date: 2025-02-01
tags:
  - 配置
  - Git
title: Make 命令使用
---
[参考](https://www.ruanyifeng.com/blog/2015/02/make.html)
## 概述
make命令依据目录下的 Makefile 文件执行一系列创建文件的规则，减少重复命令的输入，提高复用性。
Makefile 文件一般格式如下：
```
<target>: <prerequisites>
[tab] <command1>; <command2>
```

目标是必须的，前置条件和命令是可选的，但二者必须至少存在一个

## 目标（target）
一个目标就构成一条规则，通常目标是文件名，指定创建某个文件需要执行的具体动作。目标可以是一个文件名，也可以是多个文件名
```
b.txt d.txt:  
    echo "hello world" > b.txt  
    echo "world hello" > d.txt
```

make命令除了创建文件，还可以用来执行一系列命令。下面的 clean 就属于一个“伪目标”，是一个操作的名字。
```
clean:
	rm *.txt
```

但是如果目录下存在名为`clean`的文件，那么make 命令就不会执行对应的操作。解决办法是明确声明`clean`是伪目标
```
.PHONY: clean
clean: 
	rm *.txt
```

如果make 命令没有明确执行目标，默认执行Makefile 文件第一个目标
```
make
```
默认执行 Makefile 文件中的第一个目标
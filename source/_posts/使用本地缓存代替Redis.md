---
title: 记录使用本地缓存代替Redis
description: 记录抽象接口思路
tags:
  - Golang
date: 2024-06-10
---

# 使用本地缓存代替Redis
> 现在因为你不想连Redis，所以你打算提供一个基于本地缓存实现的`cache.CodeCache`

## 大体思路
- 定义一个`CodeCache`接口，能够使得底层在Redis和本地缓存中无缝切换
- 选择一个合适的本地缓存
- 保证单机的并发安全

## 定义接口
### 在哪一级进行抽象？
在已有的实现中，我们在repository中定义了`codeRepository`结构体<br>
``` go
type CodeRepository struct {
	cache cache.CodeRedis
}
```
在repository调用cache的Redis实现，进行存储验证码和校验验证码的操作，有如下的层次关系<br>
![image-20240805184543232](https://raw.githubusercontent.com/lyydsheep/pic/main/202408051846343.png)<br>
使用本地缓存替换Redis，上图中的层次关系不改变，变化的时cache的具体实现，因此memory和Redis属于同一级<br>
我们第一步需要做的就是在Redis-memory这一等级上抽象出一个接口，并将其暴露给repository，向repository屏蔽底层细节。repository只需要通过调用接口方法，就能完成数据存储和数据查找
### 如何思考接口的定义？
我们可以从已有的Redis实现出发，思考接口该如何定义<br>
``` go
func (cc *CodeRedisCache) CheckCode(ctx context.Context, key string, input string) error {
	res, err := cc.client.Eval(ctx, luaCheckCode, []string{key}, input).Int()
	if err != nil {
		return err
	}
	switch res {
	case 0:
		return nil
	case -1:
		return ErrNotMatch
	case -3:
		return ErrExceed
	default:
		return errors.New("系统错误")
	}
}

func (cc *CodeRedisCache) SetCode(ctx context.Context, key string, val string) error {
	//获取返回值
	res, err := cc.client.Eval(ctx, luaSetCode, []string{key}, val).Int()
	if err != nil {
		return err
	}
	switch res {
	case 0:
		return nil
	case -1:
		return ErrTooFrequent
	default:
		return errors.New("系统错误")

	}
}
```
从Redis实现中，可以获取两个信息
- 两个方法`CheckCode`和`SetCode`分别进行查询数据和存储数据的操作<br>
- 调用`lua`脚本保证`check-do something`操作是原子性的

目前在cache层中，要么是对数据查询，要么是对数据存储，并结合第一条信息，很容易就能得出接口的定义
``` go
type CodeCache interface {
	CheckCode(ctx context.Context, key string, input string) error
	SetCode(ctx context.Context, key string, val string) error
}
```
在某些复杂的情况下，我们还需要对接口中方法的参数类型进行调整，一种万金油的方法就是**再定义一个`Data`结构体**，在`Data`结构体中设置不同底层实现所需要的字段<br>
例如：
``` go
type NameData struct {
    Name string
    Data string
}
```

定义好接口后，我们还需要将接口暴露给`repository`，具体实现如下：
``` go
type CodeRepository struct {
	cache cache.CodeCache
}
```

## 选择一个本地缓存
在Golang中有三个本地缓存库比较有名：
![image-20240805190511385](https://raw.githubusercontent.com/lyydsheep/pic/main/202408051905419.png)<br>
具体选择时应考虑一下几点：
- 结合场景
- 如果需要对单个key设置过期时间，选择freecache
- 如果不注重单个key过期时间，更注重性能,选择bigcache

查询官方文档，便能很容易在`CodeMemory`结构体上实现`CodeCache`接口

## 并发问题
很显然，不管是设置验证码还是校验验证码，都是`check-do something`的流程操作，存在明显的并发问题<br>
在Redis实现中，巧妙地使用了`lua`脚本，将操作整合成一个原子操作。但是在memory实现中，我们无法通过类似的方式避免并发问题，因此只能暴力上锁、解锁来保证并发安全
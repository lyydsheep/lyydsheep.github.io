---
title: Redis运行原理
publish: true
description: 记录Redis运行原理知识
tag:
- Redis
---



# Redis运行原理

## Redis在内存中是如何存储的？

简单来说，Redis就是一个运行在内存中的k-v字典。说到k-v字典，很容易联想到Redis底层数据结构**dict(HASHTABLE)**，实际上从C代码中可以看出，Redis数据库就是在**dict**基础上封装了众多功能（~~装饰器模式万岁😆~~）

```c
typedef struct redisDB {
    dict *dict;
    dict *expires;
    dict *blocking_keys;
    dict *ready_keys;
    dict *watched_keys;
    int id;
    long long avg_ttl;
    list *defrag_later;
} redisDb;
```

核心结构**dict**值得重点关心：

```c
typedef struct dict{
    dictType *type; //直线dictType结构，dictType结构中包含自定义的函数，这些函数使得key和value能够存储任何类型的数据
    void *privdata; //私有数据，保存着dictType结构中函数的 参数
    dictht ht[2]; //两张哈希表
    long rehashidx; //rehash的标记，rehashidx=-1表示没有进行rehash，rehash时每迁移一个桶就对rehashidx加一
    int itreators;  //正在迭代的迭代器数量
}
```

当我们使用Redis存储键值对时，dict字段存储这字符串类型的key以及任意类型的value

<img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410171559595.png" alt="image-20241017155911540" style="zoom:50%;" />

除了dict字段，expire字段也很重要。众所周知，Redis在存储k-v时可以为键值对设置过期时间，提高Redis对内存的使用效率。expire字典中就存储着具有过期时间的键值对信息，其中key就是键值对的键，而value就是对应的过期时间。具体如下图所示：

<img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410171608652.png" alt="image-20241017160835599" style="zoom: 67%;" />

可以看到，在dict和expire其实是具有一些相同的key的，Redis为了节省内存开销，实际上并没有存储了两份一模一样的key，而是进行了内存复用操作。什么意思？简单地说，dict字典和expire字典都指向了同一块内存空间的key。🌰：dict中的`animal`执行内存`0xababababa`，expire中的`animal`也指向内存`0xababababa`

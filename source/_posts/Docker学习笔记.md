---
tags:
  - Docker
description: 记录有关Docker的一些知识点
date: 2024-11-11
title: Docker学习笔记
---

# Docker学习笔记

## Docker和传统虚拟机的区别

![image-20241114183050052](https://raw.githubusercontent.com/lyydsheep/pic/main/202411141831820.png)

**物理服务器**

一台看得见摸的着的机器就是物理机器，即云服务厂商所说的**物理服务器、物理机、独立服务器**

**VPS**

一般来说，一台物理服务器性能比普通电脑要好得多，但是这样一台服务器分配给个人使用就会导致性能过剩、资金浪费。**VPS（Virtual Private Server，虚拟专用服务器）**就是指在物理服务器上运行多台虚拟机，这些虚拟机有独立的资源、操作系统和公网IP地址。云服务厂家就能一VPS为最小单位向用户出租服务器

**ECS**

VPS的配置都是事先由厂家确定好的，但是很多情况下用户有自定义服务器配置的需求。**ECS（Elastic Computer Service）**就是加入了自主升降级功能的VPS，用户可以根据需求随时调整CPU、内存、磁盘等配置

**Docker**

ECS归根到底也是一台电脑，那就不可避免会存在**应用在不同操作系统之间兼容性**的问题。~~一个很简单的想法就是将软件连带操作系统一同部署~~Docker容器技术选择将**软件及其所依赖的环境配置**一同打包，挂载在服务器上，再通过**Namespace**让它们看起来是运行在一个独立的操作系统上，以及利用**Cgroup**限制可使用的计算资源

![image-20241114190259158](https://raw.githubusercontent.com/lyydsheep/pic/main/202411141902210.png)

总结一下就是：**物理服务器上跑ecs，ecs跑Docker容器。多个Docker容器共享一个ecs实例操作系统内核**

## 参考

[面试官：Docker和传统虚拟机有什么区别？ (qq.com)](https://mp.weixin.qq.com/s?__biz=MzUxODAzNDg4NQ==&mid=2247534049&idx=2&sn=1ef2674ddb3217bbafcb5cd6946407ac&chksm=f98d014bcefa885d6b68c0405718abf634a33427264a8ae4d04bc478bc03121dbfdceed7012e&token=630123097&lang=zh_CN#rd)